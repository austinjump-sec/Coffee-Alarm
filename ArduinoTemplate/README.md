
## motor_actuator.cpp (Motor Actuator)
 This file is meant for use with ESP32 and a servo motor, utilizing the alarm as a trigger for a button-pushing mechanism
## electrical_actuator.cpp (Electrical Actuator)
 This file is meant for DIY electrical work with ESP32 and your target coffee pot, this could be dangerous, do NOT connect main voltage directly to ESP-32. Instructions provided in main application, untested and only for advanced hobbyists
## How to Build a Rig
There are two ways it can be built, absolutely dirt cheap using common household supplies, or project hardware that is readily available at the average Best Buy or Walmart.
### Materials
| Standard, secure, organized method     | Cheap, common supplies, disorganized method   |
| ------------- | ------------- |
| ESP32 |  ESP32 |
| Servo Motor | Servo Motor |
|3M VHB Tape, or double sided gorilla tape|Scratch tape, hot glue, or command strips|
|Quarter-inch foam pads|Quarter-inch foam pads, rubber band, hair tie, or anything that will create a cushion between plastic motor and resistant button|
|Project Enclosure Box|Tupperware bowl with two cut out holes|

### Assembly 
#### ESP32 Flashing
To start, we should connect the ESP32 to our laptop to flash the provided firmware templates using Arduino IDE 2. Simply connect to a PC using USB (if unix, ensure your group can read and write to that usb port), select your ESP32 model and the USB port to use, configure arduino template to use your SSID and wifi password for mDNS discovery and click upload, verify it compiles correctly on your hardware.

#### Connecting ESP32 to Motor Servo 
Search for the GND, VNN, and D26 pins on the ESP32, connect these to the female ports of the servo motor, if your servo motor does not have female  ports you may have to buy (or makeshift) an adapter. 

#### Building enclosure (cheap)
The cheap way to build an enclosure is to find a tuppelware bowl that your equipment can fit in, mark where the wires are with a sharpie and carefully cut out holes to pass wires through, ensuring theres no sharp plastic bits to nick any wires.

#### Building enclosure (standard)
Simply place your hardware within your project enclosure box and pass the wires through the respected holes. 

#### Mounting to Coffee Pot  (cheap)
Use multiple layers of scotch tape adhered tightly to the perimeter of the servo motor, reaching to both sides of the edge of the pots surface, ensuring the servo motors right handle is in clear way of button

#### Mounting (Standard)
Place double sided tape on servo motor and securely place next to coffee pot button, ensuring the servo motors right handle is in clear way of button

#### Button Resistance Measures
As I had run into a bit of an issue with, the plastic of the motor servo is simply too weak and hard for some coffee pot buttons, it may either stay or move back to original position. To compensate for this, we may use about a quarter-inch of a soft, cushion-like material adhered to the servo motors handle to create a sort of bridge between the pressure of the servo motor and the resistance of the button. If this becomes a persistent problem for your specific model, consider tweaking the angle of the servo motor in the Arduino code for your situation.

> [!WARNING]
> Electrical template remains untested, and is only provided for those who are absolutely certain they know what they are doing and feel perfectly safe modifying their own hardware on an electrical level.
