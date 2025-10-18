# companion-module-bmd-atem

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn build:watch` the compiler will be run in watch mode to recompile the files on change.

## Adding a new model

Each model of ATEM has a definition file in src/models describing the functionality of the device. This allows us to know this information for offline programming. If the module is left on auto-detect, we match the definition to use based on the model the atem reports, and if one is not defined we can build the definition on the fly from the ATEM. This generally gives us good results, but there are a few things we don't know how to detect from the atem.

To add a new model to the list:

- Create a new file in `src/models/` for the new model, based on one of the others (mini.ts is a nice and simple one)
- Run `yarn tsx dump-model.ts 10.42.6.125` (substitute in the atem ip)
- Copy the contents of state.json to the file you created, replacing the existing spec
- In the new file, replace any magic numbers with their enums (this aids readability, but is not essential)
- Add the new spec to the `ALL_MODELS` array in `src/models/index.ts`
- Recompile the code and test it out!

## Changes

## v3.19.0

- Update module api
  - This should resolve the module crashing with large configs on lower powered machines
  - It enables the permissions api, which shouldnt break anything (but could)
- Convert isVisible fns to expressions
- Allow S/C prefix in media pool preview feedbacks #381

## v3.18.0

- Tweened transitions for DVE and SuperSource boxes

## v3.17.0

- Media pool previews
- Add display counter variable
- Support media filename in actions
- Actions to offset display clock
- Display clock value variable
- More upstream key control
- Fix audio routing variables updating

## v3.16.1

- Fix -infinite values with classic audio

## v3.16.0

- Add variables for upstream key DVE
- Add action to update upstream key DVE with variables

## v3.15.1

- Fix audio routing for higher channel pairs

## v3.15.0

- Add camera control recording actions

## v3.14.1 & v3.13.1

- Refine audio routing support

## v3.14.0

- Tooling updates

## v3.13.0

- Audio routing support

- Set DVE keyframes

## v3.12.1

- Fix device discovery for recent models/firmwares

## v3.12.0

- Support USB Webcam on Mini/SDI range

- Mediaplayer source from variables

- Easing curves for fades

- Supersource art sources from variables

- Fix missing labels for mini multiview status sources

- Fix fairlight source solo

## v3.11.0

- Add camera continuous zoom action

- Support for Constellation 1ME 4K and 2ME 4K

## v3.10.1

- Improve increment camera iris and exposure

## v3.10.0

- Add PREV TRANS support
- Add fairlight solo support
- Improve fairlight headphone support
- Add incrementing camera control

## v3.9.0

- Add timecode as a variable
- Actions to set the ATEM timecode
- Fix bug in model selection
- Fix ISO record feedback not updating
- Add support for fairlight audio delay (this may not be correctly defined for all models)
- Expose record filename as a variable, and support variables in action
- Add action to delete a still
- Add action to set media player source from a variable
- Support switching upstream keyer type

## v3.8.3

- Build tooling update

## v3.8.2

- Build tooling update

## v3.8.1

- Build tooling update

## v3.8.0

- Enable/disable ISO recording
- Multiviewer layout control
- Basic camera control
- Stream cache variable

## v3.7.1

- Fix auto-detect not reporting state correctly

## v3.7.0

- Add variables for fairlight audio master/monitor

## v3.6.1

- Add definitions for TVS 4K8

## v3.6.0

- Use Companion builtin ATEM discovery
- Track last connected model, to provide a better experience when offline
- New action to arbitrarily alter the presence of every component in the next selection

## v3.5.2

- Attempt to make discovery a bit more reliable

## v3.5.1

- Add definitions for Constellation 4K 4ME

## v3.5.0

- Support variables in 'Stream: Set service' #256
- New tally feedback, to provide tally for ME2 #188
- Fix potential feedback reactivity issue
- Add multiviewer window source variables #245
- Add CUT preset #224
- Adjust master pan in classic audio mixer #180
- Set T-bar position #241

## v3.4.0

- Use builtin invert support for all feedbacks
- Update atem library, to get more responsive multiviewer feedbacks

## v3.3.3

- Fix TVS HD8 ISO being based off wrong model

## v3.3.2

- Fix connection stuck in a crash loop unable to open configuration

## v3.3.1

- Fix SSrcBoxSourceVariables feedback

## v3.3.0

- Add Television Studio HD8 models

## v3.2.2

- Fix build errors

## v3.2.1

- Some feedbacks off by one on me index

## v3.2.0

- Add capture still action

- Add display-clock actions

## v3.1.0

- Add feedbacks which support variables

- Add more actions which support variables

## v3.0.0

- Updates for Companion 3.0

## v2.18.1

- fix audo feedbacks

## v2.18.0

- add macro looping action/feedback

- fix reset peaks actions

- expose device ip as variable

- add variables with input ids

- add invert checkbox to some feedbacks

- add actions to set inputs from variables

### v2.17.3

- fix 'Fairlight Audio: Audio fader gain' feedback missing

### v2.17.2

- fix unable to set multiviewer label to blank

### v2.17.1

- fix performance issues with fairlight input updates

- hide multiview label when name set to nothing

### v2.17.0

- add sdi model range (untested)

- add dsk rate

- add dsk premultiplied key

- add usk mask

- add usk dve properties

### v2.16.0

- more granular supersource actions and feedbacks

- support learning values for actions and feedbacks

### v2.15.1

- fix constellation hd high cpu usage

### v2.15.0

- add constellation hd models (untested)

- correct order of input fields for some actions and feedbacks

- fix macros to use name not description

- flying key control

- atem mini extreme headphone basic controls

- audo mixer master gain control

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
