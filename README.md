# companion-module-bmd-atem

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn build:watch` the compiler will be run in watch mode to recompile the files on change.

## Adding a new model

Each model of ATEM has a definition file in src/models describing the functionality of the device. This allows us to know this information for offline programming. If the module is left on auto-detect, we match the definition to use based on the model the atem reports, and if one is not defined we can build the definition on the fly from the ATEM. This generally gives us good results, but there are a few things we don't know how to detect from the atem.

To add a new model to the list:

- Create a new file in `src/models/` for the new model, based on one of the others (mini.ts is a nice and simple one)
- Run `yarn ts-node dump-model.ts 10.42.6.125` (substitute in the atem ip)
- Copy the contents of state.json to the file you created, replacing the existing spec
- In the new file, replace any magic numbers with their enums (this aids readability, but is not essential)
- Add the new spec to the `ALL_MODELS` array in `src/models/index.ts`
- Recompile the code and test it out!

## Changes

### v2.14.0

- set input names (both text and multiviewer)

### v2.13.0

- duration variables have a ms variant

- save and clear startup state actions

- variables for supersource box inputs

### v2.12.2

- rewrite upgrade scripts to new api

### v2.12.0

- fix supersource art feedbacks

- supersource art action has more flexible placement control

- discover and suggest atems in the instance config panel

### v2.11.0

- reset audio peaks

- atem mini recording filename accepts variables

- supersource art source

### v2.10.0

- feedbacks updated to new format. allows more customisation of style

### v2.9.3

- fix utf8 characters in variables

### v2.9.2

- fix build issues

### v2.9.1

- fix in electron (in new module workflow)

### v2.9.0

- Add mini-extreme and mini-extreme-iso

### v2.8.3

- fix offline programming

### v2.8.2

- fix on windows

### v2.8.1

- fix companion exiting on uncaughtException

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
