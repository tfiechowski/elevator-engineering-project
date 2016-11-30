import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)

pins = { 'start': 18, 'direction': 22, 'speed': 24 }
initialValues = { 'direction': GPIO.LOW, 'start': GPIO.LOW, 'speed': GPIO.LOW }

# Setting every pin to output
for pin in pins:
    GPIO.setup(pins[pin], GPIO.OUT)
    GPIO.output(pins[pin], initialValues[pin])

def set_GPIO_arr(array):
    pinNames = ['start', 'direction', 'speed']

    for x in range(0,4):
        if len(array) >= x + 1:
            GPIO.output(pins[pinNames[x]], array[x])

for x in range(0,3):
    print x

while True:
    values = raw_input("Type values (D S Sp): ")

    print values.split(" ")

    if values == "stop":
        break
    else:
        set_GPIO_arr(values)

    





