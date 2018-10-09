var instance_skel = require('../../instance_skel');
var Atem = require('atem-connection').Atem;
var debug;
var log;

var models = {
	1: 'TVS',
	2: 'OneME',
	3: 'TwoME',
	4: 'PS4K',
	5: 'OneMEPS4K',
	6: 'TwoMEPS4K',
	7: 'FourMEBS4K',
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
	7: 4,
	8: 1,
	9: 4
};

var USKs = {
	0: 1,
	1: 1,
	2: 4,
	3: 4,
	4: 1,
	5: 4,
	6: 2,
	7: 4,
	8: 1,
	9: 4
};

function instance(system, id, config) {
	var self = this;

	self.model = 0;
	self.states = {};

	self.inputs = {};

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
				self.states['aux' + state.auxBus] = state.properties.source;

				self.checkFeedbacks('aux_bg');
				break;

			case 'PreviewInputCommand':
				debug('Preview set to ' + state.properties.source + ' on ME ' + state.mixEffect);
				self.states['preview' + state.mixEffect] = state.properties.source;
				if (self.inputs[state.properties.source] !== undefined) {
					self.setVariable('pvw' + (state.mixEffect + 1) + '_input', self.inputs[state.properties.source].shortName);
				}

				self.checkFeedbacks('preview_bg');
				break;

			case 'ProgramInputCommand':
				debug('Program set to ' + state.properties.source + ' on ME ' + state.mixEffect);
				self.states['program' + state.mixEffect] = state.properties.source;
				if (self.inputs[state.properties.source] !== undefined) {
					self.setVariable('pgm' + (state.mixEffect + 1) + '_input', self.inputs[state.properties.source].shortName);
				}

				self.checkFeedbacks('program_bg');
				break;

			case 'InputPropertiesCommand':
				debug('Input properties', state);
				self.inputs[state.inputId] = state.properties;

				// resend everything, since names of routes might have changed
				self.init_variables();
				break;

			case 'InitCompleteCommand':
				debug('Init done');
				self.actions();
				self.init_variables();
				self.init_feedbacks();
				self.init_presets();
				self.log('info', 'Connected to a ' + self.deviceName);
				break;

			case 'DownstreamKeyOnAirCommand':
				debug('DSK on air:', state);
				break;

			case 'MixEffectKeyOnAirCommand':
				debug('USK on air:', state);
				self.states['usk' + state.mixEffect + '-' + state.upstreamKeyerId] = state.properties.onAir;
				self.checkFeedbacks('usk_bg');
				break;

			case 'ProductIdentifierCommand':
				self.model = state.properties.model;
				debug('ATEM Model: ' + self.model);
				self.deviceName = state.properties.deviceName;
				break;
		}
	});
};

instance.prototype.init_feedbacks = function() {
	var self = this;

	// feedbacks
	var feedbacks = {};

	feedbacks['preview_bg'] = {
		label: 'Change colors from preview',
		description: 'If the input specified is in use by preview on the M/E stage specified, change colors of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
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
		label: 'Change colors from program',
		description: 'If the input specified is in use by program on the M/E stage specified, change colors of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
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
		label: 'Change colors from AUX bus',
		description: 'If the input specified is in use by the aux bus specified, change colors of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(0,0,0)
			},
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
	feedbacks['usk_bg'] = {
		label: 'Change background from upstream keyer state',
		description: 'If the specified upstream keyer is active, change color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(255,0,0)
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
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.init_variables = function() {
	var self = this;

	// variable_set
	var variables = [];

	for (var i = 0; i < MEs[self.model]; ++i) {
		variables.push({
			label: 'Label of input active on program bus (M/E ' + (i+1) + ')',
			name: 'pgm' + (i+1) + '_input'
		});
		if (self.inputs[self.states['program' + i]] !== undefined) {
			self.setVariable('pgm' + (i+1) + '_input', self.inputs[self.states['program' + i]].shortName);
		}
		variables.push({
			label: 'Label of input active on preview bus (M/E ' + (i+1) + ')',
			name: 'pvw' + (i+1) + '_input'
		});
		if (self.inputs[self.states['preview' + i]] !== undefined) {
			self.setVariable('pvw' + (i+1) + '_input', self.inputs[self.states['preview' + i]].shortName);
		}
	}

	for (var key in self.inputs) {
		variables.push({
			label: 'Long name of input id ' + key,
			name: 'long_' + key
		});
		variables.push({
			label: 'Short name of input id ' + key,
			name: 'short_' + key
		});

		if (self.inputs[key] !== undefined) {
			self.setVariable('long_' + key, self.inputs[key].longName);
			self.setVariable('short_' + key, self.inputs[key].shortName);
		}
	}
	self.setVariableDefinitions(variables);
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	for (var me = 0; me < MEs[self.model]; ++me) {
		for (var input in self.inputs) {
			presets.push({
				category: 'Preview (M/E ' + (me+1) + ')',
				label: 'Preview button for ' + self.inputs[input].shortName,
				bank: {
					style: 'text',
					text: '$(attem:short_' + input + ')',
					size: '18',
					color: '16777215',
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'preview_bg',
						options: {
							bg: 65280,
							fg: 16777215,
							input: input,
							mixeffect: me
						}
					}
				],
				actions: [
					{
						action: 'preview',
						options: {
							mixeffect: me,
							input: input
						}
					}
				]
			});
			presets.push({
				category: 'Program (M/E ' + (me+1) + ')',
				label: 'Program button for ' + self.inputs[input].shortName,
				bank: {
					style: 'text',
					text: '$(attem:short_' + input + ')',
					size: '18',
					color: '16777215',
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'program_bg',
						options: {
							bg: 16711680,
							fg: 16777215,
							input: input,
							mixeffect: me
						}
					}
				],
				actions: [
					{
						action: 'program',
						options: {
							mixeffect: me,
							input: input
						}
					}
				]
			});
		}
	}

	for (var i = 0; i < auxes[self.model]; ++i) {
		for (var input in self.inputs) {
			presets.push({
				category: 'AUX ' + (i+1),
				label: 'AUX' + (i+1) + ' button for ' + self.inputs[input].shortName,
				bank: {
					style: 'text',
					text: '$(attem:short_' + input + ')',
					size: '18',
					color: '16777215',
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'aux_bg',
						options: {
							bg: 16776960,
							fg: 0,
							input: input,
							aux: i
						}
					}
				],
				actions: [
					{
						action: 'aux',
						options: {
							aux: i,
							input: input
						}
					}
				]
			});
		}
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.feedback = function(feedback, bank) {
	var self = this;

	if (feedback.type == 'preview_bg') {
		if (self.states['preview' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	else if (feedback.type == 'program_bg') {
		if (self.states['program' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	else if (feedback.type == 'aux_bg') {
		if (self.states['aux' + feedback.options.aux] == parseInt(feedback.options.input)) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	else if (feedback.type == 'usk_bg') {
		if (self.states['usk' + feedback.options.mixeffect + '-' + feedback.options.key]) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
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

	if (MEs[self.model] >= 4) {
		self.CHOICES_INPUTS.push({ label: 'Mediaplayer 3', id: 3030 });
		self.CHOICES_INPUTS.push({ label: 'Mediaplayer 3 Key', id: 3031 });
		self.CHOICES_INPUTS.push({ label: 'Mediaplayer 4', id: 3040 });
		self.CHOICES_INPUTS.push({ label: 'Mediaplayer 4 Key', id: 3041 });
	}

	self.CHOICES_INPUTS.push({ label: 'Super Source', id: 6000 });
	self.CHOICES_INPUTS.push({ label: 'Clean Feed 1', id: 7001 });
	self.CHOICES_INPUTS.push({ label: 'Clean Feed 2', id: 7002 });

	self.CHOICES_INPUTS.push({ label: 'ME 1 Program', id: 10010 });
	self.CHOICES_INPUTS.push({ label: 'ME 1 Preview', id: 10011 });

	if (MEs[self.model] >= 2) {
		self.CHOICES_INPUTS.push({ label: 'ME 2 Program', id: 10020 });
		self.CHOICES_INPUTS.push({ label: 'ME 2 Preview', id: 10021 });
	}

	if (MEs[self.model] >= 3) {
		self.CHOICES_INPUTS.push({ label: 'ME 3 Program', id: 10030 });
		self.CHOICES_INPUTS.push({ label: 'ME 3 Preview', id: 10031 });
	}

	if (MEs[self.model] >= 4) {
		self.CHOICES_INPUTS.push({ label: 'ME 4 Program', id: 10040 });
		self.CHOICES_INPUTS.push({ label: 'ME 4 Preview', id: 10041 });
	}

	self.CHOICES_AUXES = [
		{ label: '1', id: 0 },
		{ label: '2', id: 1 },
		{ label: '3', id: 2 },
		{ label: '4', id: 3 },
		{ label: '5', id: 4 },
		{ label: '6', id: 5 },
	];

	self.CHOICES_USKS = [
		{ label: '1', id: 0 },
		{ label: '2', id: 1 },
		{ label: '3', id: 2 },
		{ label: '4', id: 3 },
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
					choices: [ { label: 'On Air', id: 'true' }, { label: 'Off', id: 'false' }, { label: 'Toggle', id: 'toggle' }]
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
					choices: self.CHOICES_USKS.slice(0, USKs[self.model])
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
			if (opt.onair == 'toggle') {
				self.atem.setUpstreamKeyerOnAir(!self.states['usk' + opt.mixeffect + '-' + opt.key], parseInt(opt.mixeffect), parseInt(opt.key));
			} else {
				self.atem.setUpstreamKeyerOnAir(opt.onair == 'true', parseInt(opt.mixeffect), parseInt(opt.key));
			}
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

instance_skel.extendedBy(instance);

exports = module.exports = instance;
