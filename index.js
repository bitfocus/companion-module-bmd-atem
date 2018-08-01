var instance_skel = require('../../instance_skel');
var Atem = require('atem-connection').Atem;
var debug;
var log;

var models = {
	1: 'TVS',
	2: 'OneME',
	3: 'TwoME',
	4: 'PS4K',
	5: 'OneME4K',
	6: 'TwoME4K',
	7: 'TwoMEBS4K',
	8: 'TVSHD',
	9: '4ME?'
};

var inputs = {
	0: 8,
	1: 8,
	2: 8,
	3: 16,
	4: 8,
	5: 10,
	6: 20,
	7: 20,
	8: 8,
	9: 20
};

var auxes = {
	0: 3,
	1: 1,
	2: 3,
	3: 6,
	4: 1,
	5: 3,
	6: 6,
	7: 6,
	8: 1,
	9: 6
};

var MEs = {
	0: 1,
	1: 1,
	2: 1,
	3: 2,
	4: 1,
	5: 1,
	6: 2,
	7: 2,
	8: 1,
	9: 4
};

function instance(system, id, config) {
	var self = this;

	self.model = 0;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.atem = new Atem({ externalLog: self.debug.bind(self) });
	self.atem.on('connected', function () {
		self.status(self.STATE_OK);
	});
	self.atem.on('disconnected', function () {
		self.status(self.STATE_ERROR, 'Disconnected');
	});

	if (self.config.host !== undefined) {
		self.atem.connect(self.config.host);
	}

	self.atem.on('stateChanged', function(err, state) {

		switch (state.constructor.name) {
			case 'AuxSourceCommand':
				debug("AUX " + state.auxBus + ' set to ' + state.properties.source);
				self['aux' + state.auxBus] = state.properties.source;
				if (typeof self.checkFeedbacks == 'function') {
					self.checkFeedbacks('aux_bg');
				}
				break;

			case 'PreviewInputCommand':
				debug('Preview set to ' + state.properties.source + ' on ME ' + state.mixEffect);
				self['preview' + state.mixEffect] = state.properties.source;
				if (typeof self.checkFeedbacks == 'function') {
					self.checkFeedbacks('preview_bg');
				}
				break;

			case 'ProgramInputCommand':
				debug('Program set to ' + state.properties.source + ' on ME ' + state.mixEffect);
				self['program' + state.mixEffect] = state.properties.source;
				if (typeof self.checkFeedbacks == 'function') {
					self.checkFeedbacks('program_bg');
				}
				break;

			case 'DownstreamKeyOnAirCommand':
				debug('DSK on air:', state);
				break;

			case 'MixEffectKeyOnAirCommand':
				debug('USK on air:', state);
				break;

			case 'ProductIdentifierCommand':
				self.model = state.properties.model;
				self.actions();
				self.log('info', 'Connected to a ' + state.properties.deviceName);
				break;
		}
	});

	// Feedback variable support, temporary if
	// TODO: Remove
	if (typeof self.setVariableDefinitions != 'function') {
		return;
	}

	// feedbacks
	var feedbacks = {};

	feedbacks['preview_bg'] = {
		label: 'Change background from preview',
		description: 'If the input specified is in use by preview on the M/E stage specified, change background color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(0,255,0)
			},
			{
				 type: 'dropdown',
				 label: 'Input',
				 id: 'input',
				 default: 1,
				 choices: self.CHOICES_INPUTS
			},
			{
				type: 'dropdown',
				id: 'mixeffect',
				label: 'M/E',
				default: 0,
				choices: self.CHOICES_ME.slice(0, MEs[self.model])
			}
		]
	};
	feedbacks['program_bg'] = {
		label: 'Change background from program',
		description: 'If the input specified is in use by program on the M/E stage specified, change background color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(255,0,0)
			},
			{
				 type: 'dropdown',
				 label: 'Input',
				 id: 'input',
				 default: 1,
				 choices: self.CHOICES_INPUTS
			},
			{
				type: 'dropdown',
				id: 'mixeffect',
				label: 'M/E',
				default: 0,
				choices: self.CHOICES_ME.slice(0, MEs[self.model])
			}
		]
	};
	feedbacks['aux_bg'] = {
		label: 'Change background from AUX bus',
		description: 'If the input specified is in use by the aux bus specified, change background color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(255,255,0)
			},
			{
				 type: 'dropdown',
				 label: 'Input',
				 id: 'input',
				 default: 1,
				 choices: self.CHOICES_INPUTS
			},
			{
				type: 'dropdown',
				id: 'aux',
				label: 'AUX',
				default: 0,
				choices: self.CHOICES_AUXES.slice(0, auxes[self.model])
			}
		]
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.feedback = function(feedback, bank) {
	var self = this;

	if (feedback.type == 'preview_bg') {
		var bg = feedback.options.bg;
		if (bg === undefined) {
			bg = feedback.default;
		}

		if (self['preview' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
			return {
				bgcolor: bg
			};
		}
	}

	else if (feedback.type == 'program_bg') {
		var bg = feedback.options.bg;
		if (bg === undefined) {
			bg = feedback.default;
		}

		if (self['program' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
			return {
				bgcolor: bg
			};
		}
	}

	else if (feedback.type == 'aux_bg') {
		var bg = feedback.options.bg;
		if (bg === undefined) {
			bg = feedback.default;
		}

		if (self['aux' + feedback.options.aux] == parseInt(feedback.options.input)) {
			return {
				bgcolor: bg
			};
		}
	}

	return {};
};

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.config = config;

	if (self.config.host !== undefined) {
		if (self.atem !== undefined && self.atem.socket !== undefined && self.atem.socket._socket !== undefined) {
			try {
				self.atem.disconnect();
			} catch (e) {}
		}

		self.atem.connect(self.config.host);
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'Should work with all models of Blackmagic Design ATEM mixers'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.atem !== undefined && self.atem.socket !== undefined && self.atem.socket._socket !== undefined) {
		self.atem.disconnect();
		delete self.atem;
	}
	debug("destroy", self.id);
};

instance.prototype.actions = function(system) {
	var self = this;

	self.CHOICES_INPUTS = [
		{ label: 'Black', id: 0 }
	];
	for (var i = 1; i <= inputs[self.model]; ++i) {
		self.CHOICES_INPUTS.push({
			label: 'Input ' + i,
			id: i
		});
	}
	self.CHOICES_INPUTS.push({ label: 'Bars', id: 1000 });
	self.CHOICES_INPUTS.push({ label: 'Color 1', id: 2001 });
	self.CHOICES_INPUTS.push({ label: 'Color 2', id: 2002 });
	self.CHOICES_INPUTS.push({ label: 'Mediaplayer 1', id: 3010 });
	self.CHOICES_INPUTS.push({ label: 'Mediaplayer 1 Key', id: 3011 });
	self.CHOICES_INPUTS.push({ label: 'Mediaplayer 2', id: 3020 });
	self.CHOICES_INPUTS.push({ label: 'Mediaplayer 2 Key', id: 3021 });
	self.CHOICES_INPUTS.push({ label: 'Super Source', id: 6000 });
	self.CHOICES_INPUTS.push({ label: 'Clean Feed 1', id: 7001 });
	self.CHOICES_INPUTS.push({ label: 'Clean Feed 2', id: 7002 });
	self.CHOICES_INPUTS.push({ label: 'Program', id: 10010 });
	self.CHOICES_INPUTS.push({ label: 'Preview', id: 10011 });

	self.CHOICES_AUXES = [
		{ label: '1', id: 0 },
		{ label: '2', id: 1 },
		{ label: '3', id: 2 },
		{ label: '4', id: 3 },
		{ label: '5', id: 4 },
		{ label: '6', id: 5 },
	];

	self.CHOICES_ME = [
		{ label: 'M/E 1', id: 0 },
		{ label: 'M/E 2', id: 1 },
		{ label: 'M/E 3', id: 2 },
		{ label: 'M/E 4', id: 3 }
	];

	self.system.emit('instance_actions', self.id, {
		'program': {
			label: 'Set input on Program',
			options: [
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, MEs[self.model])
				}
			]
		},
		'preview': {
			label: 'Set input on Preview',
			options: [
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, MEs[self.model])
				}
			]
		},
		'aux': {
			label: 'Set AUX bus',
			options: [
				{
					type: 'dropdown',
					id: 'aux',
					label: 'AUX Output',
					default: 0,
					choices: self.CHOICES_AUXES.slice(0, auxes[self.model])
				},
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: self.CHOICES_INPUTS
				}
			]
		},
		'usk': {
			label: 'Set Upstream KEY OnAir',
			options: [
				{
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: self.CHOICES_YESNO_BOOLEAN
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, MEs[self.model])
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: self.CHOICES_AUXES.slice(0, 4)
				}
			]
		},
		'cut': {
			label: 'CUT operation',
			options: [
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, MEs[self.model])
				}
			]
		},
		'auto': {
			label: 'AUTO transition operation',
			options: [
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, MEs[self.model])
				}
			]
		},
		'macrorun': {
			label: 'Run MACRO',
			options: [
				{
					type: 'textinput',
					id: 'macro',
					label: 'Macro number',
					default: 1,
					regex: self.REGEX_NUMBER
				}
			]
		}
	});
};


instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;
	var cmd;
	var opt = action.options;

	// avplayback port 7000
	switch (action.action) {

		case 'program':
			self.atem.changeProgramInput(parseInt(opt.input), parseInt(opt.mixeffect));
			break;

		case 'preview':
			self.atem.changePreviewInput(parseInt(opt.input), parseInt(opt.mixeffect));
			break;

		case 'aux':
			self.atem.setAuxSource(parseInt(opt.input), parseInt(opt.aux));
			break;

		case 'cut':
			self.atem.cut(parseInt(opt.mixeffect));
			break;

		case 'usk':
			self.atem.setUpstreamKeyerOnAir(opt.onair == 'true', parseInt(opt.mixeffect), parseInt(opt.key));
			break;

		case 'auto':
			self.atem.autoTransition(parseInt(opt.mixeffect));
			break;

		case 'macrorun':
			self.atem.macroRun(parseInt(opt.macro) - 1);
			break;

		default:
			debug('Unknown action: ' + action.action);
	}

};

instance.module_info = {
	label: 'BMD Atem',
	id: 'atem',
	version: '0.0.2'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
