#!/usr/bin/env python3

import time
import requests
import logging
import random

API_URL = "ngrok-api-url/"
TIMEOUT = 5
ROOM_ID = "1"


def call_api():
    try:
        response = requests.put(
            API_URL + ROOM_ID,
            headers={"Content-Type": "application/json"},
            json={"is_available": random.choice([True, False])},
            timeout=TIMEOUT,
        )
        logging.info(f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        logging.error(f"API call failed: {e}")


def main():
    logging.info("API caller started")
    while True:
        call_api()
        time.sleep(5)


if __name__ == "__main__":
    main()
