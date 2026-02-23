  GNU nano 8.4                                      pi_auto_api_call.py                                               
#!/usr/bin/env python3
import random
import time
import requests
import RPi.GPIO as GPIO

SENSOR_PIN = 17
API_URL = "https://unconsentaneous-unconscientious-sutton.ngrok-free.dev/api/v1/rooms/"
ROOM_ID = "1"

SEND_INTERVAL = 3  # seconds

last_state = None

while True:
    state = random.choice([True, False])

    # Optional: only send if state changed
    if state != last_state:
        try:
            requests.put(
                API_URL + ROOM_ID,
                json={
                    "is_available": state
                },
                timeout=2
            )
            print("Sent:", state)
            last_state = state
        except Exception as e:
            print("API error:", e)

    time.sleep(SEND_INTERVAL)
