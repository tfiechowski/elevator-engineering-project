import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)

def get_GPIO_val(val):
#    print 'get_GPIO_val :', val
    if val == "0":
#	print 'LOW'
	return GPIO.LOW
    else:
#	print 'HIGH'
	return GPIO.HIGH

limit = 0
start = 0
direction = 1
speed = 1


pins = { 'start': 16, 'direction': 10, 'speed': 22 }
inputs = {'limit': 19}
initialValues = { 
'direction': get_GPIO_val(direction),
'start': get_GPIO_val(start), 
'speed': get_GPIO_val(speed) }
# speed - high = wolno
# dir - low = gora

GPIO.cleanup()

# Setting every pin to output
for pin in pins:
    GPIO.setup(pins[pin], GPIO.OUT)
    GPIO.output(pins[pin], initialValues[pin])

GPIO.setup(inputs['limit'], GPIO.IN)

def set_GPIO_arr(array):
    pinNames = ['start', 'direction', 'speed']
    print array

    if len(array) >= 1:
	    print 'setting start with value', array[0], ', current val: ',  GPIO.input(pins['start']), ' on pin', pins['start']
	    GPIO.output(pins['start'], get_GPIO_val(array[0]))
    if len(array) >= 2:
        print 'setting direction with value', array[1], ', current val: ',  GPIO.input(pins['direction']), ' on pin', pins['direction']
        GPIO.output(pins['direction'], get_GPIO_val(array[1]))


#    for x in range(0,4):
#	val = GPIO.HIGH
#	if array[x] == 0:
#	    val = GPIO.LOW
#
 #       if len(array) >= x + 1:
  # 	    print 'PinName:', pinNames[x]
   #         print 'array:', array[x]
#	    print 'pin, pinNames[x]:', pins[pinNames[x]]
 #           GPIO.output(pins[pinNames[x]], val)

while True:
    values = raw_input("Type values (S D Sp): ")

    if values == "stop":
	set_GPIO_arr([0])
        break
    else:
	values = values.split(" ")
        set_GPIO_arr(values)

    print 'limit: ', GPIO.input(inputs['limit'])

GPIO.cleanup()    





