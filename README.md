Elevator Control - Engineering Project - Backend part
============
#### Gdansk University of Technology, Faculty of Electronics, Telecommunications and Informatics (ETI)

#### Overview

This project is part of my engineering project : **"Controlling the movement of the elevator via Internet."**. 
Server works on the RaspberryPi and does control the elevator model from EA541 
(laboratory in the old building of ETI).

#### Configuration

Pin configuration is in the file `config/config.json` - it maps GPIO pins 
for corresponding elevator's state pins.
Besides pin configuration, there are mappings for special values like Up/Down,
Start/Stop and Quick/Slow for output pins.

#### Installation

Only thing you need to do is to call

`npm install`

#### How to use

To run the project, just simply execute the command

`node ./bin/www`

from the project root directory. The backend is now running on port 8081.

#### Code Guidelines

Keep lines no longer than 100 characters.