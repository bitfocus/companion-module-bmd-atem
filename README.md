# companion-module-bmd-atem

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn build:watch` the compiler will be run in watch mode to recompile the files on change.

## Changes

### v2.8.1

- fix 1me models having supersource commands

- fix tvs4kpro erroring when generating actions list

### v2.8.0

- Relative fader levels adjustments

- Fader level fades

- Expose missing audio faders (madi & trs)

- fix aux variables not updating

- fix autodetect model being a bit broken

- fix supersource2 not being a valid source

### v2.7.0

- mini-pro streaming and recording

- Classic audio input actions and feedback

- Fairlight audio input actions and feedback

### v2.6.0

- Improved connection library

- Add mini-pro-iso

- Feedback for running transition

- Add action to go to next/previous still in media player

- Add action to do relative changes to supersource boxes

- Fix downstream key input action

### v2.5.1

- Add presets for transition selection component

- Add dsk tie

### v2.5.0

- Send multiview to aux on mini-pro

- Add individual transition selection component control

### v2.4.2

- Add mini-pro

### v2.4.1

- Revert connection library change

### v2.4.0

- More stable connection library
- Variables for media pool
- Variables for media players

### v2.3.0

- Add definitions for Mini
- Add tally feedback

### v2.2.0

- Set fade to black rate
- Execute fade to/from black
- Variables for current aux source
- Add definitions for TVS Pro models

### v2.1.0

- Change transition selection
- Set SuperSource box On Air
- Change SuperSource geometry properties
- Change media player source

### v2.0.0

- Update atem-connection to support v8 firmware.
- Add support for ATEM Constellation.
- Rewrite in Typescript with some linting and formatting rules.
- Fix changing supersource box resetting other properties
- Fix keyer toggles sometimes getting stuck
- Add support for setting transition type and rate

### v1.1.0

- Module in ES6 format (no self and use of =>)
- this.states[] use abstracted to getXX(...) and updateXX(...) calls
- Model parameters moved to 'CONFIG_MODEL' array
