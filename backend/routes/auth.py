from datetime import timedelta, datetime
import secrets
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from models.users import UserCreate, UserSignIn, UserResponse, Token
from utils.auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_user_by_email,
    create_password_reset_token,
    verify_password_reset_token,
)
from config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM,
    MAIL_PORT,
    MAIL_SERVER,
    MAIL_FROM_NAME,
    MAIL_STARTTLS,
    MAIL_SSL_TLS,
)
from db import get_db
from models.users import User as UserModel

router = APIRouter()

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_FROM_NAME=MAIL_FROM_NAME,
    MAIL_STARTTLS=MAIL_STARTTLS,
    MAIL_SSL_TLS=MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=None,
)

fm = FastMail(conf)


async def send_verification_email(email: str, token: str):
    """Send email verification email"""
    verification_url = f"http://localhost:8000/api/v1/auth/verify-email?token={token}"
    message = MessageSchema(
        subject="Verify your email address",
        recipients=[email],
        body=f"Please click the following link to verify your email: {verification_url}",
        subtype="html",
    )
    # await fm.send_message(message)

async def send_password_reset_email(email: str, token: str):
    """Send password reset email"""
    reset_url = f"http://localhost:8081/reset-password?token={token}"

    html = f"""
    <h3>Password Reset</h3>

    <p>Click the button below to reset your password:</p>

    <a href="{reset_url}"
    style="
    display:inline-block;
    padding:12px 24px;
    background:#00694E;
    color:white;
    text-decoration:none;
    border-radius:6px;
    font-weight:bold;
    ">
    Reset Password
    </a>

    <p>If the button doesn't work, paste this URL into your browser:</p>

    <p>{reset_url}</p>
    """

    message = MessageSchema(
        subject="Reset your password",
        recipients=[email],
        body=html,
        subtype="html",
    )

    await fm.send_message(message)

@router.post(
    "/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def signup(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Register a new user with email and password"""
    # Validate email domain (must be ohio.edu)
    if not user_data.email.lower().endswith("@ohio.edu"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ohio.edu email addresses are allowed",
        )

    # Check if user already exists
    existing_user = get_user_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Generate verification token
    verification_token = secrets.token_urlsafe(32)

    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    new_user = UserModel(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
        is_admin=False,  # New users are normal users by default
        is_faculty=False,  # New users are not faculty by default
        email_verified=True,  # Temporary until email verification is implemented
        email_verification_token=verification_token,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email in background
    background_tasks.add_task(
        send_verification_email, new_user.email, verification_token
    )

    return new_user


@router.post("/signin", response_model=Token)
async def signin(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Sign in with email and password, returns JWT token"""
    # OAuth2PasswordRequestForm uses 'username' field, but we use email
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not verified. Please check your email for verification link.",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user email with verification token"""
    user = (
        db.query(UserModel).filter(UserModel.email_verification_token == token).first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token"
        )

    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified"
        )

    user.email_verified = True
    user.email_verification_token = None
    db.commit()

    return {"message": "Email verified successfully"}


class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/resend-verification")
async def resend_verification(
    request: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Resend verification email"""
    user = get_user_by_email(db, email=request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified"
        )

    # Generate new verification token
    verification_token = secrets.token_urlsafe(32)
    user.email_verification_token = verification_token
    db.commit()

    # Send verification email in background
    background_tasks.add_task(send_verification_email, user.email, verification_token)

    return {"message": "Verification email sent"}

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Send password reset email if user exists"""
    user = get_user_by_email(db, email=request.email)

    # Always return the same response for security
    if user:
        reset_token = create_password_reset_token(user.email, expires_minutes=30)

        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.utcnow() + timedelta(minutes=30)
        db.commit()

        background_tasks.add_task(send_password_reset_email, user.email, reset_token)

    return {
        "message": "If that email exists, a password reset link has been sent."
    }

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """Reset user password using reset token"""
    email = verify_password_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user = get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset request",
        )

    if (
        not user.password_reset_token
        or user.password_reset_token != request.token
        or not user.password_reset_expires
        or user.password_reset_expires < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user.hashed_password = get_password_hash(request.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None

    db.commit()

    return {"message": "Password has been reset successfully."}
