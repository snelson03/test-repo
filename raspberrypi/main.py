from gpiozero import MotionSensor

pir = MotionSensor(4)
pir.wait_for_motion()
print("Motion detected!")
pir.wait_for_no_motion()
print("No motion detected.")

# Note: This code is intended to run on a Raspberry Pi with a PIR motion sensor connected to GPIO pin 4.
