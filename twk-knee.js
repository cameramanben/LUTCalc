/* twk-knee.js
* User definable knee generating object for LUTCalc
* 20th September 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKKnee(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKKnee.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Clip to Legal or Extended
	this.legOpt = this.createRadioElement('legExt',true);
	this.legOpt.value = '0';
	this.extOpt = this.createRadioElement('legExt',false);
	this.extOpt.value = '1';
	// Max Start value
	this.max = 8;
	// Sliders
	this.startS = new lutSlider({
		min: -5,
		max: this.max,
		value: 0.05,
		step: 0.05,
		title: 'Knee Start Level',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		lhs: '18% Gray +',
		rhs: 'Stops',
		reset: true
	});
	this.clipS = new lutSlider({
		min: 0.05,
		max: 8,
		value: 6,
		step: 0.05,
		title: 'Clip Level',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		lhs: '18% Gray +',
		rhs: 'Stops',
		reset: true
	});
	this.slopeS = new lutSlider({
		min: 0,
		max: 2.5,
		value: 0.25,
		step: 0.01,
		title: 'Slope At Clip',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		reset: true
	});
	this.smoothS = new lutSlider({
		min: 0,
		max: 1,
		value: 1,
		step: 0.01,
		title: 'Smoothness',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		reset: true
	});
};
TWKKnee.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Knee')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	// Legal Range / Extended Range
	this.box.appendChild(this.legOpt);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Legal Range')));
	this.box.appendChild(this.extOpt);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Extended Range')));
	// Sliders
	this.box.appendChild(this.startS.element);
	this.box.appendChild(this.clipS.element);
	this.box.appendChild(this.slopeS.element);
	this.box.appendChild(this.smoothS.element);
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKKnee.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked) {
		if (this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue !== 'Null') {
			this.holder.className = 'tweakholder';
		} else {
			this.holder.className = 'tweakholder-hide';
			this.tweakCheck.checked = false;
		}
	} else {
		this.holder.className = 'tweakholder-hide';
		this.tweakCheck.checked = false;
	}
	this.toggleTweak();
};
TWKKnee.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKKnee.prototype.getTFParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doKnee = true;
	} else {
		out.doKnee = false;
	}
	if (this.legOpt.checked) {
		out.legal = true;
	} else {
		out.legal = false;
	}
	out.kneeStart = this.startS.getValue();
	out.kneeClip = this.clipS.getValue();
	out.clipSlope = this.slopeS.getValue();
	out.smoothness = this.smoothS.getValue();
	params.twkKnee = out;
};
TWKKnee.prototype.getCSParams = function(params) {
	// Leave function content blank if not parameters are relevent
};
TWKKnee.prototype.setParams = function(params) {
	if (typeof params.twkKnee !== 'undefined') {
		var p = params.twkKnee;
		if (typeof p.max === 'number') {
			this.startS.setMax(p.max.toFixed(2));
		}
		if (typeof p.kneeStart === 'number') {
			this.startS.setValue(p.kneeStart);
		}
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
};
TWKKnee.prototype.getSettings = function(data) {
	data.knee = {
		doKnee: this.tweakCheck.checked,
		legal: this.legOpt.checked,
		kneeStart: this.startS.getValue(),
		kneeClip: this.clipS.getValue(),
		clipSlope: this.slopeS.getValue(),
		smoothness: this.smoothS.getValue(),
		max: this.max
	};
};
TWKKnee.prototype.setSettings = function(settings) {
	if (typeof settings.knee !== 'undefined') {
		var data = settings.knee;
		if (typeof data.legal === 'boolean') {
			this.legOpt.checked = data.legal;
			this.extOpt.checked = !data.legal;
		}
		if (typeof data.kneeStart === 'number') {
			this.startS.setValue(data.kneeStart);
		}
		if (typeof data.kneeClip === 'number') {
			this.clipS.setValue(data.kneeClip);
		}
		if (typeof data.clipSlope === 'number') {
			this.slopeS.setValue(data.clipSlope);
		}
		if (typeof data.smoothness === 'number') {
			this.smoothS.setValue(data.smoothness);
		}
		if (typeof data.max === 'number') {
			this.startS.setMax(data.max.toFixed(2));
		}
	}
};
TWKKnee.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doKnee = true;
	} else {
		info.doKnee = false;
	}
};
TWKKnee.prototype.isCustomGamma = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKKnee.prototype.isCustomGamut = function() {
	return false;
};
TWKKnee.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
	};}(this);
	this.legOpt.onchange = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.extOpt.onchange = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.startS.action = function(here){ return function(){
		var clip = here.clipS.getValue();
		var start = this.getValue();
		if (start >= clip) {
			here.clipS.setValue(start + 0.05);
		}
		here.messages.gaSetParams();
	};}(this);
	this.clipS.action = function(here){ return function(){
		var clip = this.getValue();
		var start = here.startS.getValue();
		if (start >= clip) {
			here.startS.setValue(start - 0.05);
		}
		here.messages.gaSetParams();
	};}(this);
	this.slopeS.action = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.smoothS.action = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKKnee.prototype.createRadioElement = function(name, checked) {
    var radioInput;
    try {
        var radioHtml = '<input type="radio" name="' + name + '"';
        if ( checked ) {
            radioHtml += ' checked="checked"';
        }
        radioHtml += '/>';
        radioInput = document.createElement(radioHtml);
    } catch( err ) {
        radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', name);
        if ( checked ) {
            radioInput.setAttribute('checked', 'checked');
        }
    }
    return radioInput;
};
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
