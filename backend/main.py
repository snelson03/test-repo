from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.users import router as user_router
from routes.auth import router as auth_router
from routes.buildings import router as building_router
from routes.rooms import router as room_router
from routes.room_blocks import router as room_blocks_router
from db import create_tables

app = FastAPI(
    title="Study Room Management API",
    description="API for managing study rooms and reservations",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    create_tables()


# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(user_router, prefix="/api/v1/users", tags=["users"])
app.include_router(building_router, prefix="/api/v1/buildings", tags=["buildings"])
app.include_router(room_router, prefix="/api/v1/rooms", tags=["rooms"])
app.include_router(
    room_blocks_router, prefix="/api/v1/room-blocks", tags=["room-blocks"]
)


@app.get("/")
async def root():
    return {"message": "Study Room Management API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
