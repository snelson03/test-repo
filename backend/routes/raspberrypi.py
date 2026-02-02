from fastapi import APIRouter, HTTPException, Depends, status

router = APIRouter()


@router.get("/connect")
async def connect():
    """connect to rasp pi"""
    print("Connected")
    return {"message": "Connected to Raspberry Pi"}
