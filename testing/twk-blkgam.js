/* twk-blkgam.js
* Black gamma adjustment object for the LUTCalc Web App.
* 19th July 2016
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKBlkGam(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
}
TWKBlkGam.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	// Limit Slider
	this.limSlider = document.createElement('input');
	this.limSlider.setAttribute('type','range');
	this.limSlider.setAttribute('min',-9);
	this.limSlider.setAttribute('max',2);
	this.limSlider.setAttribute('step',0.1);
	this.limSlider.setAttribute('value',-1.5);
	// Limit Input
	this.limInput = document.createElement('input');
	this.limInput.setAttribute('type','text');
	this.limInput.className = 'smallinput';
	this.limInput.value = '-1.5';
	// Limit Reset Button
	this.limReset = document.createElement('input');
	this.limReset.setAttribute('type','button');
	this.limReset.className = 'smallbutton';
	this.limReset.setAttribute('value','Reset');
	// Feather Slider
	this.feaSlider = document.createElement('input');
	this.feaSlider.setAttribute('type','range');
	this.feaSlider.setAttribute('min',0);
	this.feaSlider.setAttribute('max',9);
	this.feaSlider.setAttribute('step',0.1);
	this.feaSlider.setAttribute('value',2);
	// Feather Input
	this.feaInput = document.createElement('input');
	this.feaInput.setAttribute('type','text');
	this.feaInput.className = 'smallinput';
	this.feaInput.value = '2';
	// Feather Reset Button
	this.feaReset = document.createElement('input');
	this.feaReset.setAttribute('type','button');
	this.feaReset.className = 'smallbutton';
	this.feaReset.setAttribute('value','Reset');
	// Gamma Slider
	this.gamSlider = document.createElement('input');
	this.gamSlider.setAttribute('type','range');
	this.gamSlider.setAttribute('min',0.01);
	this.gamSlider.setAttribute('max',2);
	this.gamSlider.setAttribute('step',0.01);
	this.gamSlider.setAttribute('value',1);
	// Gamma Input
	this.gamInput = document.createElement('input');
	this.gamInput.setAttribute('type','text');
	this.gamInput.className = 'smallinput';
	this.gamInput.value = '1';
	// Gamma Reset Button
	this.gamReset = document.createElement('input');
	this.gamReset.setAttribute('type','button');
	this.gamReset.className = 'smallbutton';
	this.gamReset.setAttribute('value','Reset');
};
TWKBlkGam.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Black Gamma')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	var limBox = document.createElement('div');
	limBox.className = 'twk-tab';
	limBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stop Limit')));
	limBox.appendChild(this.limSlider);
	limBox.appendChild(this.limInput);
	limBox.appendChild(this.limReset);
	this.box.appendChild(limBox);
	var featherBox = document.createElement('div');
	featherBox.className = 'twk-tab';
	featherBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Feather')));
	featherBox.appendChild(this.feaSlider);
	featherBox.appendChild(this.feaInput);
	featherBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops')));
	featherBox.appendChild(this.feaReset);
	this.box.appendChild(featherBox);
	var gamBox = document.createElement('div');
	gamBox.className = 'twk-tab';
	gamBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Power')));
	gamBox.appendChild(this.gamSlider);
	gamBox.appendChild(this.gamInput);
	gamBox.appendChild(this.gamReset);
	this.box.appendChild(gamBox);

	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKBlkGam.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked && this.inputs.d[1].checked) { // This checks for 'Customisations' to be checked and LUT type set to '3D' (the d[1] item)
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
TWKBlkGam.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKBlkGam.prototype.getTFParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doBlkGam = true;
	} else {
		out.doBlkGam = false;
	}
	out.upperLim = parseFloat(this.limInput.value);
	out.feather = parseFloat(this.feaInput.value);
	out.power = parseFloat(this.gamInput.value);
	params.twkBlkGam = out;
};
TWKBlkGam.prototype.getCSParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKBlkGam.prototype.setParams = function(params) {
	if (typeof params.twkBlkGam !== 'undefined') {
		var p = params.twkBlkGam;
		this.toggleTweaks();
	}
};
TWKBlkGam.prototype.getSettings = function(data) {
	data.blackGamma = {
		doBlkGamma: this.tweakCheck.checked,
		stopLimit: parseFloat(this.limInput.value),
		feather: parseFloat(this.feaInput.value),
		power: parseFloat(this.gamInput.value)
	};
};
TWKBlkGam.prototype.setSettings = function(settings) {
	if (typeof settings.blackGamma !== 'undefined') {
		var data = settings.blackGamma;
		if (typeof data.doBlkGamma === 'boolean') {
			this.tweakCheck.checked = data.doBlkGamma;
			this.toggleTweak();
		}
		if (typeof data.stopLimit === 'number') {
			this.limSlider.value = data.stopLimit.toString();
			this.limInput.value = data.stopLimit.toString();
		}
		if (typeof data.feather === 'number') {
			this.feaSlider.value = data.feather.toString();
			this.feaInput.value = data.feather.toString();
		}
		if (typeof data.power === 'number') {
			this.gamInput.value = data.power.toString();
			this.testGam(false);
		}
	}
};
TWKBlkGam.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doBlkGam = true;
	} else {
		info.doBlkGam = false;
	}
};
TWKBlkGam.prototype.isCustomGamma = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKBlkGam.prototype.isCustomGamut = function() {
	return false;
};
TWKBlkGam.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
	};}(this);
	this.limSlider.oninput = function(here){ return function(){
		here.testLim(true);
		here.messages.gaSetParams();
	};}(this);
	this.limInput.onchange = function(here){ return function(){
		here.testLim(false);
		here.messages.gaSetParams();
	};}(this);
	this.limReset.onclick = function(here){ return function(){
		here.resetLim();
		here.messages.gaSetParams();
	};}(this);
	this.feaSlider.oninput = function(here){ return function(){
		here.testFea(true);
		here.messages.gaSetParams();
	};}(this);
	this.feaInput.onchange = function(here){ return function(){
		here.testFea(false);
		here.messages.gaSetParams();
	};}(this);
	this.feaReset.onclick = function(here){ return function(){
		here.resetFea();
		here.messages.gaSetParams();
	};}(this);
	this.gamSlider.oninput = function(here){ return function(){
		here.testGam(true);
		here.messages.gaSetParams();
	};}(this);
	this.gamInput.onchange = function(here){ return function(){
		here.testGam(false);
		here.messages.gaSetParams();
	};}(this);
	this.gamReset.onclick = function(here){ return function(){
		here.resetGam();
		here.messages.gaSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKBlkGam.prototype.testLim = function(slider) {
	var l,L;
	if (slider) {
		l = this.limSlider.value;
		if (parseFloat(l) < -9) {
			l = -9;
		}
	} else {
		l = this.limInput.value;
		var L = parseFloat(l);
		if (isNaN(L)) {
			l = this.limSlider.value;
		} else if (L < -9) {
			l = '-9';
		}
	}
	this.limInput.value = parseFloat(l).toFixed(1).toString();
	this.limSlider.value = l;
};
TWKBlkGam.prototype.resetLim = function() {
	this.limSlider.value = '-1.5';
	this.limInput.value = '-1.5';
};
TWKBlkGam.prototype.testFea = function(slider) {
	var l,L;
	if (slider) {
		l = this.feaSlider.value;
		if (parseFloat(l) < 0) {
			l = 0;
		}
	} else {
		l = this.feaInput.value;
		var L = parseFloat(l);
		if (isNaN(L)) {
			l = this.feaSlider.value;
		} else if (L < 0) {
			l = '0';
		}
	}
	this.feaInput.value = parseFloat(l).toFixed(1).toString();
	this.feaSlider.value = l;
};
TWKBlkGam.prototype.resetFea = function() {
	this.feaSlider.value = '2';
	this.feaInput.value = '2';
};
TWKBlkGam.prototype.testGam = function(slider) {
	var s;
	var c1 = 2.197297305;
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	if (slider) {
		s = (c3*Math.exp((c1*parseFloat(this.gamSlider.value))+c2)) + c4;
		if (s < 0.01) {
			s = 0.01;
		}
	} else {
		s = this.gamInput.value;
		S = parseFloat(s);
		if (isNaN(S)) {
			s = (c3*Math.exp((c1*parseFloat(this.gamSlider.value))+c2)) + c4;
		} else if (S < 0.01) {
			s = 0.01;
		}
	}
	this.gamInput.value = s.toFixed(2).toString();
	this.gamSlider.value = ((Math.log((s-c4)/c3)-c2)/c1).toString();;
};
TWKBlkGam.prototype.resetGam = function() {
	this.gamSlider.value = '1';
	this.gamInput.value = '1';
};
