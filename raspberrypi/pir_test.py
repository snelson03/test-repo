import RPi.GPIO as GPIO
import time

# Use BCM GPIO numbering
GPIO.setmode(GPIO.BCM)

# GPIO pin where PIR sensor OUT is connected
PIR_PIN = 23

# Set up GPIO pin as input
GPIO.setup(PIR_PIN, GPIO.IN)

print("PIR Motion Sensor Test (Press CTRL+C to exit)")
print("Waiting for sensor to settle...")

# Give the sensor time to calibrate
time.sleep(5)

print("Ready. Monitoring for motion...")

try:
    while True:
        print(GPIO.input(PIR_PIN))
        time.sleep(1)

except KeyboardInterrupt:
    print("\nExiting program.")

finally:
    GPIO.cleanup()
