## Blackmagic Design ATEM

Should work with all models of Blackmagic Design ATEM mixers.

Firmware versions 7.5.2 and later are known to work, other versions may experience problems.  
Firmware versions after 9.0 are not verified to be working at the time of writing, but they likely will work fine.

Devices must be controlled over a network, USB control is NOT supported.

**Available commands for Blackmagic Design ATEM**

- Set input on Program
- Set input on Preview
- Set inputs on Upstream KEY
- Set inputs on Downstream KEY
- Set AUX bus
- Set Upstream KEY OnAir
- Auto DSK Transition
- Tie DSK to transition
- Set Downstream Key On Air
- CUT operation
- AUTO transition operation
- Change transition type
- Change transition selection
- Change transition selection component
- Change transition rate
- Set fade to black rate
- Execute fade to/from black
- Run MACRO
- Continue MACRO
- Stop MACROS
- Change MV window source
- Set SuperSource box On Air
- Change SuperSource box source
- Change SuperSource geometry properties
- Offset SuperSource geometry properties
- Change media player source
- Cycle media player source
- Mini-pro recording control
- Mini-pro streaming control
- Classic audio inputs control
- Fairlight audio inputs control

## Common issues

### Macros not showing as running

Companion is not always able to detect that a macro has been run. This happens when the macro has zero length.
You can resolve this by giving the macro a pause/sleep of 1 frame.

### Diagnosing connection issues

The most common cause of Companion not being able to connect to your ATEM is misconfiguration of the networking. Due to how the discovery protocol works, it will see ATEMs that you may not be able to connect to.    
A good way to rule out Companion as being at fault, is to disconnect the USB to your ATEM, and use the ATEM software. If that is unable to connect then it is most likely a network configuration issue.

To be able to connect to your ATEM, both the ATEM and your Companion machine must be connected to the same network (ideally cabled, but wifi should work). They must also be of the same IP address range. For example, your network could be `192.168.0.x`, where each machine has a different number instead of the `x`. In most cases the subnet mask should be 255.255.255.0, unless your network is setup to use something else.
