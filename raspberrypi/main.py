"""
Room Occupancy Sensor System
Monitors motion and ultrasonic sensors to determine room occupancy
and updates the database via API.
"""

import time
import signal
import sys
from datetime import datetime
from gpiozero import MotionSensor, DistanceSensor
import requests

# Configuration - hardcoded values
MOTION_PIN = 4
ULTRASONIC_TRIGGER = 17
ULTRASONIC_ECHO = 18
API_URL = "http://localhost:8000"
SENSOR_ID = "room-101-sensor-1"

# Thresholds
DISTANCE_OCCUPIED_CM = 150
DISTANCE_UNOCCUPIED_CM = 200
MOTION_TIMEOUT = 30  # seconds
DEBOUNCE_TIME = 5  # seconds

# Intervals
READ_INTERVAL = 2.0  # seconds
UPDATE_INTERVAL = 5.0  # seconds

# Global state
motion_sensor = None
ultrasonic_sensor = None
last_motion_time = None
current_state = "unoccupied"  # "occupied" or "unoccupied"
last_state_change = None
last_update_state = None
running = True


def signal_handler(sig, frame):
    """Handle shutdown"""
    global running
    print("\nShutting down...")
    running = False
    if motion_sensor:
        motion_sensor.close()
    if ultrasonic_sensor:
        ultrasonic_sensor.close()
    sys.exit(0)


def get_distance():
    """Read distance from ultrasonic sensor in cm"""
    try:
        return ultrasonic_sensor.distance * 100
    except:
        return None


def check_occupancy():
    """Determine if room is occupied based on sensors"""
    global last_motion_time, current_state, last_state_change

    now = datetime.now()
    motion = motion_sensor.motion_detected
    distance = get_distance()

    # Update motion time if detected
    if motion:
        last_motion_time = now

    # Determine new state
    new_state = current_state

    # Occupied if: motion detected OR motion recently OR distance close
    if motion:
        new_state = "occupied"
    elif last_motion_time and (now - last_motion_time).total_seconds() < MOTION_TIMEOUT:
        new_state = "occupied"
    elif distance and distance < DISTANCE_OCCUPIED_CM:
        new_state = "occupied"
    # Unoccupied if: no motion for timeout AND distance far
    elif (
        last_motion_time
        and (now - last_motion_time).total_seconds() >= MOTION_TIMEOUT
        and distance
        and distance > DISTANCE_UNOCCUPIED_CM
    ):
        new_state = "unoccupied"
    elif not last_motion_time and distance and distance > DISTANCE_UNOCCUPIED_CM:
        new_state = "unoccupied"

    # Debounce state changes
    if new_state != current_state:
        if last_state_change is None:
            current_state = new_state
            last_state_change = now
        elif (now - last_state_change).total_seconds() >= DEBOUNCE_TIME:
            current_state = new_state
            last_state_change = now
    else:
        last_state_change = None

    return current_state


def update_api(is_available):
    """Update room availability in database"""
    global last_update_state

    if last_update_state == is_available:
        return

    try:
        url = f"{API_URL}/api/v1/rooms/sensor/{SENSOR_ID}/availability"
        response = requests.patch(url, json={"is_available": is_available}, timeout=5)
        if response.status_code == 200:
            last_update_state = is_available
            print(f"✓ Updated: {'Available' if is_available else 'Occupied'}")
        else:
            print(f"✗ API error: {response.status_code}")
    except Exception as e:
        print(f"✗ API error: {e}")


def main():
    """Main monitoring loop"""
    global motion_sensor, ultrasonic_sensor

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Initialize sensors
    try:
        motion_sensor = MotionSensor(MOTION_PIN)
        ultrasonic_sensor = DistanceSensor(
            echo=ULTRASONIC_ECHO, trigger=ULTRASONIC_TRIGGER
        )
    except Exception as e:
        print(f"✗ Sensor init failed: {e}")
        sys.exit(1)

    print(f"Monitoring room (Sensor ID: {SENSOR_ID})")
    print("Press Ctrl+C to stop\n")

    last_read = 0
    last_update = 0

    while running:
        now = time.time()

        # Read sensors periodically
        if now - last_read >= READ_INTERVAL:
            get_distance()
            last_read = now

        # Check occupancy and update API
        if now - last_update >= UPDATE_INTERVAL:
            state = check_occupancy()
            is_available = state == "unoccupied"
            update_api(is_available)

            # Print status
            icon = "🟢" if state == "occupied" else "🔴"
            motion = "Yes" if motion_sensor.motion_detected else "No"
            dist = get_distance()
            dist_str = f"{dist:.1f}cm" if dist else "N/A"
            print(
                f"{icon} {state.upper():10} | Motion: {motion:3} | Distance: {dist_str}"
            )

            last_update = now

        time.sleep(0.1)


if __name__ == "__main__":
    main()
