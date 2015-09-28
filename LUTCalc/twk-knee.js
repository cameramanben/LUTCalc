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
	// Knee Start Slider
	this.startSlider = document.createElement('input');
	this.startSlider.setAttribute('type','range');
	this.startSlider.className = 'wide-slider';
	this.startSlider.setAttribute('min',-5);
	this.startSlider.setAttribute('max',this.max);
	this.startSlider.setAttribute('step',0.05);
	this.startSlider.setAttribute('value',0.05);
	// Knee Start Input
	this.startInput = document.createElement('input');
	this.startInput.setAttribute('type','number');
	this.startInput.setAttribute('step','any');
	this.startInput.value = 0.05;
	this.startInput.className = 'stopinput';
	// Clip Slider
	this.clipSlider = document.createElement('input');
	this.clipSlider.setAttribute('type','range');
	this.clipSlider.className = 'wide-slider';
	this.clipSlider.setAttribute('min',0.05);
	this.clipSlider.setAttribute('max',8);
	this.clipSlider.setAttribute('step',0.05);
	this.clipSlider.setAttribute('value',6);
	// Clip Input
	this.clipInput = document.createElement('input');
	this.clipInput.setAttribute('type','number');
	this.clipInput.setAttribute('step','any');
	this.clipInput.value = 6;
	this.clipInput.className = 'stopinput';
	// Slope Slider
	this.slopeSlider = document.createElement('input');
	this.slopeSlider.setAttribute('type','range');
	this.slopeSlider.setAttribute('min',0);
	this.slopeSlider.setAttribute('max',2.5);
	this.slopeSlider.setAttribute('step',0.01);
	this.slopeSlider.setAttribute('value',0.25);
	// Slope Input
	this.slopeInput = document.createElement('input');
	this.slopeInput.setAttribute('type','number');
	this.slopeInput.setAttribute('step','any');
	this.slopeInput.value = 0.25;
	this.slopeInput.className = 'basicinput';
	// Smoothness (Cubic / Linear split) Slider
	this.smoothSlider = document.createElement('input');
	this.smoothSlider.setAttribute('type','range');
	this.smoothSlider.setAttribute('min',0);
	this.smoothSlider.setAttribute('max',1);
	this.smoothSlider.setAttribute('step',0.01);
	this.smoothSlider.setAttribute('value',1);
	// Smoothness (Cubic / Linear split) Input
	this.smoothInput = document.createElement('input');
	this.smoothInput.setAttribute('type','number');
	this.smoothInput.setAttribute('step','any');
	this.smoothInput.value = 1;
	this.smoothInput.className = 'basicinput';
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
	// Knee Start Level
	var startBox = document.createElement('div');
	startBox.className = 'twk-sub-box';
	startBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Knee Start Level')));
	startBox.appendChild(document.createElement('br'));
	startBox.appendChild(this.startSlider);
	startBox.appendChild(document.createElement('br'));
	startBox.appendChild(document.createElement('label').appendChild(document.createTextNode('18% Gray +')));
	startBox.appendChild(this.startInput);
	startBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops')));
	this.box.appendChild(startBox);
	// Clip Level
	var clipBox = document.createElement('div');
	clipBox.className = 'twk-sub-box';
	clipBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Clip Level')));
	clipBox.appendChild(document.createElement('br'));
	clipBox.appendChild(this.clipSlider);
	clipBox.appendChild(document.createElement('br'));
	clipBox.appendChild(document.createElement('label').appendChild(document.createTextNode('18% Gray +')));
	clipBox.appendChild(this.clipInput);
	clipBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops')));
	this.box.appendChild(clipBox);
	// Slope
	var otherBox = document.createElement('div');
	otherBox.className = 'twk-sub-box';
	otherBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Slope At Clip')));
	otherBox.appendChild(this.slopeSlider);
	otherBox.appendChild(this.slopeInput);
	otherBox.appendChild(document.createElement('br'));
	otherBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Smoothness')));
	otherBox.appendChild(this.smoothSlider);
	otherBox.appendChild(this.smoothInput);
	this.box.appendChild(otherBox);
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
	var kneeStart = parseFloat(this.startInput.value);
	if (!isNaN(kneeStart)) {
		out.kneeStart = kneeStart;
	}
	var kneeClip = parseFloat(this.clipInput.value);
	if (!isNaN(kneeClip)) {
		out.kneeClip = kneeClip;
	}
	var clipSlope = parseFloat(this.slopeInput.value);
	if (!isNaN(clipSlope)) {
		out.clipSlope = clipSlope;
	}
	var smoothness = parseFloat(this.smoothInput.value);
	if (!isNaN(smoothness)) {
		out.smoothness = smoothness;
	}
	params.twkKnee = out;
};
TWKKnee.prototype.getCSParams = function(params) {
	// Leave function content blank if not parameters are relevent
};
TWKKnee.prototype.setParams = function(params) {
	if (typeof params.twkKnee !== 'undefined') {
		var p = params.twkKnee;
		if (typeof p.max === 'number') {
			this.setMax(p.max);
		}
		if (typeof p.kneeStart === 'number') {
			this.startSlider.value = p.kneeStart;
			this.startInput.value = p.kneeStart;
		}
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
};
TWKKnee.prototype.getSettings = function(data) {
	data.knee = {
		doKnee: this.tweakCheck.checked,
		legal: this.legOpt.checked,
		kneeStart: parseFloat(this.startInput.value),
		kneeClip: parseFloat(this.clipInput.value),
		clipSlope: parseFloat(this.slopeInput.value),
		smoothness: parseFloat(this.smoothInput.value),
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
			this.startSlider.value = data.kneeStart;
			this.startInput.value = data.kneeStart;
		}
		if (typeof data.kneeClip === 'number') {
			this.clipSlider.value = data.kneeClip;
			this.clipInput.value = data.kneeClip;
		}
		if (typeof data.clipSlope === 'number') {
			this.slopeSlider.value = data.clipSlope;
			this.slopeInput.value = data.clipSlope;
		}
		if (typeof data.smoothness === 'number') {
			this.smoothSlider.value = data.smoothness;
			this.smoothInput.value = data.smoothness;
		}
		if (typeof data.max === 'number') {
			this.setMax(data.max);
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
	this.startSlider.oninput = function(here){ return function(){
		here.testStartSlider();
		here.messages.gaSetParams();
	};}(this);
	this.startInput.onchange = function(here){ return function(){
		here.testStartInput();
		here.messages.gaSetParams();
	};}(this);
	this.clipSlider.oninput = function(here){ return function(){
		here.testClipSlider();
		here.messages.gaSetParams();
	};}(this);
	this.clipInput.onchange = function(here){ return function(){
		here.testClipInput();
		here.messages.gaSetParams();
	};}(this);
	this.slopeSlider.oninput = function(here){ return function(){
		here.testSlopeSlider();
		here.messages.gaSetParams();
	};}(this);
	this.slopeInput.onchange = function(here){ return function(){
		here.testSlopeInput();
		here.messages.gaSetParams();
	};}(this);
	this.smoothSlider.oninput = function(here){ return function(){
		here.testSmoothSlider();
		here.messages.gaSetParams();
	};}(this);
	this.smoothInput.onchange = function(here){ return function(){
		here.testSmoothInput();
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
TWKKnee.prototype.setMax = function(max) {
	this.max = max;
	if (parseFloat(this.startInput.value) > this.max || parseFloat(this.startSlider.value) > this.max) {
		this.startInput.value = this.max;
		this.startSlider.value = this.max;
	}
	this.startSlider.setAttribute('max',this.max);
};
TWKKnee.prototype.testStartSlider = function() {
	var val = parseFloat(this.startSlider.value);
	if (val > this.max) {
		val = this.max;
		this.startSlider.value = val;
		this.startSlider.setAttribute('max',this.max);
	}
	this.startInput.value = val;
	if (val >= parseFloat(this.clipInput.value)) {
		this.clipSlider.value = val + 0.05;
		this.clipInput.value = val + 0.05;
	}
};
TWKKnee.prototype.testStartInput = function() {
	var val = parseFloat(this.startInput.value);
	if (isNaN(val)) {
		this.startInput.value = this.startSlider.value;
	} else if (val < -5) {
		this.startInput.value = -5;
		this.startSlider.value = -5;
	} else if (val > this.max) {
		val = this.max;
		this.startSlider.value = val;
		this.startInput.value = val;
		if (val >= parseFloat(this.clipInput.value)) {
			this.clipSlider.value = val + 0.05;
			this.clipInput.value = val + 0.05;
		}
	} else {
		this.startSlider.value = val;
		if (val >= parseFloat(this.clipInput.value)) {
			this.clipSlider.value = val + 0.05;
			this.clipInput.value = val + 0.05;
		}
	}
};
TWKKnee.prototype.testClipInput = function() {
	var val = parseFloat(this.clipInput.value);
	if (isNaN(val)) {
		this.clipInput.value = this.clipSlider.value;
	} else if (val < 0.1) {
		if (val <= parseFloat(this.startInput.value)) {
			this.startInput.value = 0.05;
			this.startSlider.value = 0.05;
		}
		this.clipInput.value = 0.1;
		this.clipSlider.value = 0.1;
	} else if (val <= parseFloat(this.startInput.value)) {
		this.startSlider.value = val - 0.05;
		this.startInput.value = val - 0.05;
		this.clipSlider.value = val;
	} else {
		this.clipSlider.value = val;
	}
};
TWKKnee.prototype.testClipSlider = function() {
	var val = parseFloat(this.clipSlider.value);
	if (val < 0.1) {
		if (val <= parseFloat(this.startInput.value)) {
			this.startSlider.value = 0.05;
			this.startInput.value = 0.05;
		}
		this.clipSlider.value = 0.1;
		this.clipInput.value = 0.1;
	} else if (val <= parseFloat(this.startInput.value)) {
		this.startSlider.value = val - 0.05;
		this.startInput.value = val - 0.05;
		this.clipInput.value = val;
	} else {
		this.clipInput.value = val;
	}
};
TWKKnee.prototype.testSlopeSlider = function() {
	this.slopeInput.value = this.slopeSlider.value;
};
TWKKnee.prototype.testSlopeInput = function() {
	var val = parseFloat(this.slopeSlider.value);
	if (isNaN(val)) {
		this.slopeInput.value = this.slopeSlider.value;
	} else if (val < 0) {
		this.slopeSlider.value = 0;
		this.slopeInput.value = 0;
	} else {
		this.slopeSlider.value = val;
	}
};
TWKKnee.prototype.testSmoothSlider = function() {
	this.smoothInput.value = this.smoothSlider.value;
}
TWKKnee.prototype.testSmoothInput = function() {
	var val = parseFloat(this.smoothInput.value);
	if (isNaN(val)) {
		this.smoothInput.value = this.smoothSlider.value;
	} else {
		if (val < 0) {
			this.smoothSlider.value = 0;
			this.smoothInput.value = 0;
		} else if (val > 1) {
			this.smoothSlider.value = 1;
			this.smoothInput.value = 1;
		} else {
			this.smoothSlider.value = val;
		}
	}
}
