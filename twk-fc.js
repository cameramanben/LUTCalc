/* twk-fc.js
* False Colour customisation object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKFC(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
}
TWKFC.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	// Purple - Black Clip
	this.purpleCheck = document.createElement('input');
	this.purpleCheck.setAttribute('type','checkbox');
	this.purpleCheck.className = 'twk-checkbox';
	this.purpleCheck.checked = true;
	// Blue - Just Above Black Clip
	this.blueCheck = document.createElement('input');
	this.blueCheck.setAttribute('type','checkbox');
	this.blueCheck.className = 'twk-checkbox';
	this.blueCheck.checked = true;
	this.blueInput = document.createElement('input');
	this.blueInput.setAttribute('type','number');
	this.blueInput.setAttribute('step','any');
	this.blueInput.className = 'stopinput';
	this.blueInput.value = '6.1';
	// Green - 18% Gray
	this.greenCheck = document.createElement('input');
	this.greenCheck.setAttribute('type','checkbox');
	this.greenCheck.className = 'twk-checkbox';
	this.greenCheck.checked = true;
	// Pink - One Stop Over 18% Gray
	this.pinkCheck = document.createElement('input');
	this.pinkCheck.setAttribute('type','checkbox');
	this.pinkCheck.className = 'twk-checkbox';
	this.pinkCheck.checked = true;
	// Orange - 90% White
	this.orangeCheck = document.createElement('input');
	this.orangeCheck.setAttribute('type','checkbox');
	this.orangeCheck.className = 'twk-checkbox';
	this.orangeCheck.checked = false;
	// Yellow - Just Below White Clip
	this.yellowCheck = document.createElement('input');
	this.yellowCheck.setAttribute('type','checkbox');
	this.yellowCheck.className = 'twk-checkbox';
	this.yellowCheck.checked = true;
	this.yellowInput = document.createElement('input');
	this.yellowInput.setAttribute('type','number');
	this.yellowInput.setAttribute('step','any');
	this.yellowInput.className = 'stopinput';
	this.yellowInput.value = '0.5';
	// Red - White Clip
	this.redCheck = document.createElement('input');
	this.redCheck.setAttribute('type','checkbox');
	this.redCheck.className = 'twk-checkbox';
	this.redCheck.checked = true;
	this.redInput = document.createElement('input');
	this.redInput.setAttribute('type','number');
	this.redInput.setAttribute('step','any');
	this.redInput.className = 'stopinput';
	this.redInput.value = '6';
};
TWKFC.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('False Colour')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	var purpleBox = document.createElement('div');
	purpleBox.className = 'twk-sub-box';
	purpleBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Purple - Black Clip')));
	purpleBox.appendChild(this.purpleCheck);
	this.box.appendChild(purpleBox);
	var blueBox = document.createElement('div');
	blueBox.className = 'twk-sub-box';
	blueBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Blue - Just Above Black Clip')));
	blueBox.appendChild(this.blueCheck);
	blueBox.appendChild(document.createElement('br'));
	blueBox.appendChild(this.blueInput);
	blueBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops Below 18% Gray')));
	this.box.appendChild(blueBox);
	var greenBox = document.createElement('div');
	greenBox.className = 'twk-sub-box';
	greenBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Green - 18% Mid Gray')));
	greenBox.appendChild(this.greenCheck);
	this.box.appendChild(greenBox);
	var pinkBox = document.createElement('div');
	pinkBox.className = 'twk-sub-box';
	pinkBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Pink - One Stop Over 18% Mid Gray')));
	pinkBox.appendChild(this.pinkCheck);
	this.box.appendChild(pinkBox);
	var orangeBox = document.createElement('div');
	orangeBox.className = 'twk-sub-box';
	orangeBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Orange - 90% White')));
	orangeBox.appendChild(this.orangeCheck);
	this.box.appendChild(orangeBox);
	var yellowBox = document.createElement('div');
	yellowBox.className = 'twk-sub-box';
	yellowBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Yellow - Just Below White Clip')));
	yellowBox.appendChild(this.yellowCheck);
	yellowBox.appendChild(document.createElement('br'));
	yellowBox.appendChild(this.yellowInput);
	yellowBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops Below White Clip')));
	this.box.appendChild(yellowBox);
	var redBox = document.createElement('div');
	redBox.className = 'twk-sub-box';
	redBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Red - White Clip')));
	redBox.appendChild(this.redCheck);
	redBox.appendChild(document.createElement('br'));
	redBox.appendChild(this.redInput);
	redBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Stops Above 18% Mid Gray')));
	this.box.appendChild(redBox);
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKFC.prototype.toggleTweaks = function() {
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
TWKFC.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKFC.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKFC.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doFC = true;
		out.fcs = [
			this.purpleCheck.checked,
			this.blueCheck.checked,
			this.greenCheck.checked,
			this.pinkCheck.checked,
			this.orangeCheck.checked,
			this.yellowCheck.checked,
			this.redCheck.checked
		];
	} else {
		out.doFC = false;
	}
	out.blue = parseFloat(this.blueInput.value);
	out.yellow = parseFloat(this.yellowInput.value);
	out.red = parseFloat(this.redInput.value);
	params.twkFC = out;
};
TWKFC.prototype.setParams = function(params) {
	if (typeof params.twkBLANK !== 'undefined') {
		var p = params.twkBLANK;
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
};
TWKFC.prototype.getSettings = function(data) {
	data.falseColour = {
		doFC: this.tweakCheck.checked,
		doPurple: this.purpleCheck.checked,
		doBlue: this.blueCheck.checked,
		doGreen: this.greenCheck.checked,
		doPink: this.pinkCheck.checked,
		doOrange: this.orangeCheck.checked,
		doYellow: this.yellowCheck.checked,
		doRed: this.redCheck.checked,
		blue: parseFloat(this.blueInput.value),
		yellow: parseFloat(this.yellowInput.value),
		red: parseFloat(this.redInput.value)
	};
};
TWKFC.prototype.setSettings = function(settings) {
	if (typeof settings.falseColour !== 'undefined') {
		var data = settings.falseColour;
		if (typeof data.doFC === 'boolean') {
			this.tweakCheck.checked = data.doFC;
			this.toggleTweak();
		}
		if (typeof data.doPurple === 'boolean') {
			this.purpleCheck.checked = data.doPurple;
		}
		if (typeof data.doBlue === 'boolean') {
			this.blueCheck.checked = data.doBlue;
		}
		if (typeof data.doGreen === 'boolean') {
			this.greenCheck.checked = data.doGreen;
		}
		if (typeof data.doPink === 'boolean') {
			this.pinkCheck.checked = data.doPink;
		}
		if (typeof data.doOrange === 'boolean') {
			this.orangeCheck.checked = data.doOrange;
		}
		if (typeof data.doYellow === 'boolean') {
			this.yellowCheck.checked = data.doYellow;
		}
		if (typeof data.doRed === 'boolean') {
			this.redCheck.checked = data.doRed;
		}
		if (typeof data.blue === 'number') {
			this.blueInput.value = data.blue.toString();
		}
		if (typeof data.yellow === 'number') {
			this.yellowInput.value = data.yellow.toString();
		}
		if (typeof data.red === 'number') {
			this.redInput.value = data.red.toString();
		}
	}
};
TWKFC.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doFC = true;
	} else {
		info.doFC = false;
	}
};
TWKFC.prototype.isCustomGamma = function() {
	return false;
};
TWKFC.prototype.isCustomGamut = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKFC.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);

	// Event responses for input changes or click should go here
	this.purpleCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.blueCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.greenCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.pinkCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.orangeCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.yellowCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.redCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.blueInput.onchange = function(here){ return function(){
		here.testBlue();
		here.messages.gtSetParams();
	};}(this);
	this.yellowInput.onchange = function(here){ return function(){
		here.testYellow();
		here.messages.gtSetParams();
	};}(this);
	this.redInput.onchange = function(here){ return function(){
		here.testRed();
		here.messages.gtSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKFC.prototype.testBlue = function() {
	if (!isNaN(parseFloat(this.blueInput.value)) && isFinite(this.blueInput.value)) {
		if (parseFloat(this.blueInput.value)<1) {
			this.blueInput.value = '1';
		}
	} else {
		this.blueInput.value = '6.1';
	}
};
TWKFC.prototype.testYellow = function() {
	if (!isNaN(parseFloat(this.yellowInput.value)) && isFinite(this.yellowInput.value)) {
		 if (parseFloat(this.yellowInput.value)<0.0001) {
			this.yellowInput.value = '0.0001';
		 } else if (parseFloat(this.yellowInput.value)>3) {
			this.yellowInput.value = '3';
		 }
	} else {
		this.yellowInput.value = '0.5';
	}
};
TWKFC.prototype.testRed = function() {
	if (!isNaN(parseFloat(this.redInput.value)) && isFinite(this.redInput.value)) {
		 if (parseFloat(this.redInput.value)<3.5) {
			this.redInput.value = '3.5';
		 }
	} else {
		this.redInput.value = '6';
	}
};
