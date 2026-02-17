#!/usr/bin/env python3
import time
import requests
import RPi.GPIO as GPIO

# ===== CONFIG =====
PIR_PIN = 23  # BCM pin number
API_URL = "https://unconsentaneous-unconscientious-sutton.ngrok-free.dev/api/v1/rooms/"
ROOM_ID = "1"
SEND_INTERVAL = 3  # seconds
# ==================

last_state = None

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(PIR_PIN, GPIO.IN)

print("Waiting for PIR sensor to settle...")
time.sleep(5)
print("Ready. Monitoring...")

try:
    while True:
        pir_value = GPIO.input(PIR_PIN)

        # PIR: 1 = motion detected
        # If motion -> room NOT available
        state = False if pir_value == 1 else True

        print("PIR:", pir_value, "Sending:", state)

        # Only send if changed
        if state != last_state:
            try:
                requests.put(
                    API_URL + ROOM_ID,
                    json={"is_available": state},
                    timeout=2
                )
                print("Sent:", state)
                last_state = state
            except Exception as e:
                print("API error:", e)

        time.sleep(SEND_INTERVAL)

except KeyboardInterrupt:
    print("\nExiting.")

finally:
    GPIO.cleanup()
