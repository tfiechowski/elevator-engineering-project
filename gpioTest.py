import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)

pins = { 'limit': 18, 'start': 16, 'direction': 12, 'speed': 22 }
initialValues = { 'limit': GPIO.LOW, 'direction': GPIO.LOW, 'start': GPIO.LOW, 'speed': GPIO.LOW }

# Setting every pin to output
for pin in pins:
    GPIO.setup(pins[pin], GPIO.OUT, initialValues[pin])

def set_GPIO_arr(array):
    pinNames = ['limit', 'start', 'direction', 'speed']

    for x in range(0,4):
        if len(array) >= x + 1:
            GPIO.output(pins[pinNames[x]], array[x])

for x in range(0,3):
    print x

while True:
    values = raw_input("Type values (L D S Sp): ")

    print values.split(" ")

    if values == "stop":
        break
    else:
        set_GPIO_arr(values)

    





