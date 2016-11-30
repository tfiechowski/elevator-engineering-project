import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BOARD)

channels = [18,22,24]

GPIO.setup(channels, GPIO.OUT)

val = 0
for x in range(0,10):
    print "Step :", x
    GPIO.output(channels, val)
    time.sleep(1)
    val = (val + 1) % 2







GPIO.cleanup()

