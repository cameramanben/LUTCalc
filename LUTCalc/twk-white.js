/* twk-white.js
* White balance 'dropper' object for the LUTCalc Web App.
* 13th August 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKWHITE(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.p = 12;
	this.messages.addUI(this.p,this);
	this.io();
	this.ui();
	this.events();
}
TWKWHITE.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs

	// Base Data
	this.sysCCT = 6504;
	this.sysDuv = 0.00549;
	this.newCCT = this.sysCCT;
	this.newDuv = this.sysDuv;
	this.newDpl = 0;
	// Reference Temperature (Recording)
	this.refInput = document.createElement('input');
	this.refInput.setAttribute('type','number');
	this.refInput.className = 'kelvininput';
	this.refInput.value = '5500';
	// Desired Colour Temperature
	this.ctInput = document.createElement('input');
	this.ctInput.setAttribute('type','number');
	this.ctInput.className = 'kelvininput';
	this.ctInput.value = this.refInput.value;
	// Lamp Colour Temperature Input
	this.lampInput = document.createElement('input');
	this.lampInput.setAttribute('type','number');
	this.lampInput.className = 'kelvininput';
	this.lampInput.value = this.refInput.value;
	this.lampButton = document.createElement('input');
	this.lampButton.setAttribute('type','button');
	this.lampButton.value = 'Unlock Lightsource From New White';
	this.lampFree = false;
	// CTO / CTB Slider
	this.ctSlider = document.createElement('input');
	this.ctSlider.setAttribute('type','range');
	this.ctSlider.setAttribute('min',-1.25);
	this.ctSlider.setAttribute('max',1.25);
	this.ctSlider.setAttribute('step',0.05);
	this.ctSlider.setAttribute('value',0);
	this.ctSlider.className = 'slider';
	this.ctSliderLabel = document.createElement('label');
	this.ctSliderLabel.className = 'slider-data';
	this.ctSliderLabel.innerHTML = 'Clear';
	this.ctReset = document.createElement('input');
	this.ctReset.setAttribute('type','button');
	this.ctReset.className = 'reset';
	this.ctReset.setAttribute('value','Reset');
	// Duv (Green / Magenta) Slider
	this.duvHidden = document.createElement('input');
	this.duvHidden.setAttribute('type','hidden');
	this.duvHidden.setAttribute('value',0);
	this.duvSlider = document.createElement('input');
	this.duvSlider.setAttribute('type','range');
	this.duvSlider.setAttribute('min',-1.5);
	this.duvSlider.setAttribute('max',1.5);
	this.duvSlider.setAttribute('step',0.05);
	this.duvSlider.setAttribute('value',0);
	this.duvSlider.className = 'slider';
	this.duvSliderLabel = document.createElement('label');
	this.duvSliderLabel.innerHTML = 'Clear';
	this.duvSliderLabel.className = 'slider-data';
	this.duvReset = document.createElement('input');
	this.duvReset.setAttribute('type','button');
	this.duvReset.className = 'reset';
	this.duvReset.setAttribute('value','Reset');
	// Dpl (Yellow / Blue) Slider
	this.dplHidden = document.createElement('input');
	this.dplHidden.setAttribute('type','hidden');
	this.dplHidden.setAttribute('value',0);
	this.dplSlider = document.createElement('input');
	this.dplSlider.setAttribute('type','range');
	this.dplSlider.setAttribute('min',-1.5);
	this.dplSlider.setAttribute('max',1.5);
	this.dplSlider.setAttribute('step',0.05);
	this.dplSlider.setAttribute('value',0);
	this.dplSlider.className = 'slider';
	this.dplSliderLabel = document.createElement('label');
	this.dplSliderLabel.innerHTML = 'Clear';
	this.dplSliderLabel.className = 'slider-data';
	this.dplReset = document.createElement('input');
	this.dplReset.setAttribute('type','button');
	this.dplReset.className = 'reset';
	this.dplReset.setAttribute('value','Reset');
	// Preview Window White Sampling Button
	this.sample = false;
	this.sampleButton = document.createElement('input');
	this.sampleButton.setAttribute('type','button');
	this.sampleButton.value = 'Preview Click For White';
	// Advanced Options Checkbox
	this.advancedCheck = document.createElement('input');
	this.advancedCheck.setAttribute('type','checkbox');
	this.advancedCheck.className = 'twk-checkbox';
	this.advancedCheck.checked = false;
	// Lamp Nominal Temperature selected
	this.lampTempSelect = document.createElement('select');
	this.lampTempSelect.className = 'twk-select';
	// Chromatic Adaptation Transform Model Selector
	this.catSelect = document.createElement('select');
	this.catSelect.className = 'twk-select';
};
TWKWHITE.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('White Balance')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak';
	// Tweak - Specific UI Elements

	// Advanced Box - Holds Advanced Or Experimental Inputs
	this.advancedBox = document.createElement('div');
	this.advancedBox.className = 'twk-advanced-hide';
	// Reference White Temperature
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Reference White')));
	this.box.appendChild(this.refInput);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.box.appendChild(document.createElement('br'));
	// New White Temperature
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('New White Balance')));
	this.box.appendChild(this.ctInput);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.box.appendChild(document.createElement('br'));
	// Light Source Temperature
	this.lampBox = document.createElement('div');
	this.lampBox.className = 'tweak-hide';
	this.lampBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Lamp Nominal Temperature')));
	this.lampBox.appendChild(this.lampInput);
	this.lampBox.appendChild(document.createElement('label').appendChild(document.createTextNode('K')));
	this.box.appendChild(this.lampBox);
	this.box.appendChild(this.lampButton);	
	this.box.appendChild(document.createElement('br'));
	// Colour Temperature Correction
	this.ctBox = document.createElement('div');
	this.ctBox.className = 'slider-holder';
	this.ctBox.appendChild(document.createElement('label').appendChild(document.createTextNode('CTO')));
	this.ctBox.appendChild(this.ctSlider);
	this.ctBox.appendChild(document.createElement('label').appendChild(document.createTextNode('CTB')));
	this.ctBox.appendChild(document.createElement('br'));
	this.ctBox.appendChild(this.ctSliderLabel);
	this.box.appendChild(this.ctBox);
	this.box.appendChild(this.ctReset);
	this.box.appendChild(document.createElement('br'));
	// Plus / Minus Green
	this.duvBox = document.createElement('div');
	this.duvBox.className = 'slider-holder';
	this.duvBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Minus Green')));
	this.duvBox.appendChild(this.duvSlider);
	this.duvBox.appendChild(this.duvHidden);
	this.duvBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Plus Green')));
	this.duvBox.appendChild(document.createElement('br'));
	this.duvBox.appendChild(this.duvSliderLabel);
	this.box.appendChild(this.duvBox);
	this.box.appendChild(this.duvReset);
	this.box.appendChild(document.createElement('br'));

/*
	// Warm / Cool
	this.dplBox = document.createElement('div');
	this.dplBox.className = 'slider-holder';
	this.dplBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Yellow')));
	this.dplBox.appendChild(this.dplSlider);
	this.dplBox.appendChild(this.dplHidden);
	this.dplBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Blue')));
	this.dplBox.appendChild(document.createElement('br'));
	this.dplBox.appendChild(this.dplSliderLabel);
	this.box.appendChild(this.dplBox);
	this.box.appendChild(this.dplReset);
	this.box.appendChild(document.createElement('br'));
*/

	// White Sample Button
	this.preBox = document.createElement('div');
	this.preBox.className = 'tweak-hide';
	this.preBox.appendChild(this.sampleButton);
	this.box.appendChild(this.preBox);
	// Advanced settings Checkbox
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Advanced Settings')));
	this.box.appendChild(this.advancedCheck);
	// Lamp Nominal Colour Temperature Selector
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Lamp Nominal Colour')));
	this.lampList();
	this.advancedBox.appendChild(this.lampTempSelect);
	this.advancedBox.appendChild(document.createElement('br'));
	// Chromatic Adaptation Transform Selection
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Chromatic Adaptation Model')));
	this.advancedBox.appendChild(this.catSelect);

	// Build Box Hierarchy
	this.box.appendChild(this.advancedBox);
	this.holder.appendChild(this.box);
};
TWKWHITE.prototype.toggleTweaks = function() {
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
TWKWHITE.prototype.toggleTweak = function() {
	if (this.inputs.showPreview) {
		this.preBox.className = 'tweak';
	} else {
		this.preBox.className = 'tweak-hide';
	}
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKWHITE.prototype.getTFParams = function(params) {
	// No parameters are relevent
};
TWKWHITE.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doWB = true;
		out.ref = parseFloat(this.refInput.value);
		var refMired = 1000000/out.ref;
		out.ctShift = (1000000/parseFloat(this.ctInput.value))-refMired;
		out.lampShift = (1000000/parseFloat(this.lampInput.value))-refMired;
		out.duv = parseFloat(this.duvHidden.value);
		out.dpl = parseFloat(this.dplHidden.value);
		out.CAT = this.catSelect.selectedIndex;
	} else {
		out.doWB = false;
	}
	params.twkWB = out;
};
TWKWHITE.prototype.setParams = function(params) {
	if (typeof params.twkWHITE !== 'undefined') {
		var p = params.twkWHITE;
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
};
TWKWHITE.prototype.getSettings = function(data) {
	data.whiteBalance = {
		doWB: this.tweakCheck.checked,
		ref: parseFloat(this.refInput.value),
		lampFree: this.lampFree,
		newTemp: parseFloat(this.ctInput.value),
		lampTemp: parseFloat(this.lampInput.value),
		Duv: parseFloat(this.duvSlider.value),
		Dpl: parseFloat(this.dplSlider.value),
		advanced: this.advancedCheck.checked,
		CAT: this.catSelect.options[this.catSelect.selectedIndex].lastChild.nodeValue
	};
};
TWKWHITE.prototype.setSettings = function(settings) {
	if (typeof settings.whiteBalance !== 'undefined') {
		var data = settings.whiteBalance;
		if (typeof data.doWB === 'boolean') {
			this.tweakCheck.checked = data.doWB;
			this.toggleTweak();
		}
		if (typeof data.ref === 'number') {
			this.refInput.value = data.ref.toString();
			this.testRefInput();
		}
		if (typeof data.lampFree === 'boolean') {
			this.lampFree = data.lampFree;
		}
		if (typeof data.newTemp === 'number') {
			this.ctInput.value = data.newTemp.toString();
			this.testCTInput();
		}
		if (typeof data.lampTemp === 'number') {
			this.lampInput.value = data.lampTemp.toString();
			this.testLampInput();
		}
		if (typeof data.Duv === 'number') {
			this.duvSlider.value = data.Duv.toString();
			this.testDuvSlider();
		}
		if (typeof data.Dpl === 'number') {
			this.dplSlider.value = data.Dpl.toString();
			this.testDplSlider();
		}
		if (typeof data.advanced === 'boolean') {
			this.advancedCheck.checked = data.advanced;
			this.toggleAdvanced();
		}
		if (typeof data.CAT !== 'undefined') {
			var m = this.catSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.catSelect.options[j].lastChild.nodeValue === data.CAT) {
					this.catSelect.options[j].selected = true;
					break;
				}
			}
		}
	}
};
TWKWHITE.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doWB = true;
	} else {
		info.doWB = false;
	}
};
TWKWHITE.prototype.isCustomGamma = function() {
	return false;
};
TWKWHITE.prototype.isCustomGamut = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKWHITE.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.refInput.onchange = function(here){ return function(){
		here.testRefInput();
		here.messages.gtSetParams();
	};}(this);
	this.ctInput.onchange = function(here){ return function(){
		here.testCTInput();
		here.messages.gtSetParams();
	};}(this);
	this.lampInput.onchange = function(here){ return function(){
		here.testLampInput();
		here.messages.gtSetParams();
	};}(this);
	this.ctSlider.oninput = function(here){ return function(){
		here.testCTSlider();
		here.messages.gtSetParams();
	};}(this);
	this.duvSlider.oninput = function(here){ return function(){
		here.testDuvSlider();
		here.messages.gtSetParams();
	};}(this);
	this.dplSlider.oninput = function(here){ return function(){
		here.testDplSlider();
		here.messages.gtSetParams();
	};}(this);
	this.sampleButton.onclick = function(here){ return function(){
		here.toggleSample();
	};}(this);
	this.ctReset.onclick = function(here){ return function(){
		here.resetCT();
		here.messages.gtSetParams();
	};}(this);
	this.duvReset.onclick = function(here){ return function(){
		here.resetDuv();
		here.messages.gtSetParams();
	};}(this);
	this.dplReset.onclick = function(here){ return function(){
		here.resetDpl();
		here.messages.gtSetParams();
	};}(this);
	this.lampButton.onclick = function(here){ return function(){
		here.toggleLamp();
	};}(this);
//	this.inputs.previewCanvas.onclick = function(here){ return function(e){
//		here.previewSample(e.clientX, e.clientY);
//	};}(this);
	this.advancedCheck.onclick = function(here){ return function(){
		here.toggleAdvanced();
	};}(this);
	this.lampTempSelect.onchange = function(here){ return function(){
		here.testLampTempSelect();
		here.messages.gtSetParams();
	};}(this);
	this.catSelect.onchange = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKWHITE.prototype.testRefInput = function() {
	var refTemp = Math.round(parseFloat(this.refInput.value));
	if (refTemp < 100) {
		refTemp = 100;
	} else if (isNaN(refTemp)) {
		refTemp = 5500;
	}
	this.refInput.value = refTemp.toString();
	var refMired = 1000000 / Math.round(parseFloat(this.refInput.value));
	var temp = Math.round(parseFloat(this.ctInput.value));
	var ctMiredShift = (1000000/temp) - refMired;
	var miredScale = (1000000/3200)-(1000000/5500); // scale mireds so that 3200 -> 5500 shift = 1 on slider
	var sliderVal = (ctMiredShift / miredScale).toFixed(2);
	this.ctSlider.value = sliderVal;
	if (Math.abs(sliderVal) < 0.0001) {
		this.ctSliderLabel.innerHTML = 'Clear';
	} else if (sliderVal<0) {
		this.ctSliderLabel.innerHTML = Math.abs(sliderVal).toString() + ' CTO';
	} else {
		this.ctSliderLabel.innerHTML = sliderVal.toString() + ' CTB';
	}
};
TWKWHITE.prototype.testCTInput = function() {
	var refMired = 1000000 / Math.round(parseFloat(this.refInput.value));
	var temp = Math.round(parseFloat(this.ctInput.value));
	if (temp <= 100) {
		temp = 100;
		this.ctInput.value = temp.toString();
	} else if (isNaN(temp)) {
		this.ctInput.value = this.refInput.value;
		temp = Math.round(parseFloat(this.ctInput.value));
	}
	var ctMiredShift = (1000000/temp) - refMired;
	var miredScale = (1000000/3200)-(1000000/5500); // scale mireds so that 3200 -> 5500 shift = 1 on slider
	var sliderVal = (ctMiredShift / miredScale).toFixed(2);
	this.ctSlider.value = sliderVal;
	if (!this.lampFree) {
		this.lampInput.value = this.ctInput.value;
		var m = this.lampTempL.length;
		for (var j=0; j<m; j++) {
			if (temp >= this.lampTempL[j] && temp <= this.lampTempH[j]) {
				this.lampTempSelect.options[j].selected = true;
				break;
			}
		}
	}
	if (Math.abs(sliderVal) < 0.0001) {
		this.ctSliderLabel.innerHTML = 'Clear';
	} else if (sliderVal<0) {
		this.ctSliderLabel.innerHTML = Math.abs(sliderVal).toString() + ' CTO';
	} else {
		this.ctSliderLabel.innerHTML = sliderVal.toString() + ' CTB';
	}
};
TWKWHITE.prototype.lampList = function() {
	var colours = [	'Warm Comfort Light',
					'Warm White',
					'Tungsten',
					'White',
					'Cool White',
					'Daylight',
					'Cool Daylight'
	];
	var temps = [	2500,
					2800,
					3200,
					3500,
					4300,
					5500,
					6500
	];
	this.lampTempL = [];
	this.lampTempH = [];
	var max = colours.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = temps[j].toString();
		option.appendChild(document.createTextNode(colours[j]));
		if (temps[j] === parseInt(this.lampInput.value)) {
			option.selected = true;
		}
		if (j === 0) {
			this.lampTempL[j] = 0;
			this.lampTempH[j] = (temps[j] + temps[j+1])/2;
		} else if (j === max-1) {
			this.lampTempL[j] = this.lampTempH[j-1]+1;
			this.lampTempH[j] = 99999;
		} else {
			this.lampTempL[j] = this.lampTempH[j-1]+1;
			this.lampTempH[j] = (temps[j] + temps[j+1])/2;
		}
		this.lampTempSelect.appendChild(option);
	}
};
TWKWHITE.prototype.testLampInput = function() {
	var temp = Math.round(parseFloat(this.lampInput.value));
	if (isNaN(temp)) {
		this.lampInput.value = this.ctInput.value;
	} else if (temp < 500) {
		this.lampInput.value = '500';
	} else {
		this.lampInput.value = temp.toString();
	}
	var m = this.lampTempL.length;
	for (var j=0; j<m; j++) {
		if (temp >= this.lampTempL[j] && temp <= this.lampTempH[j]) {
			this.lampTempSelect.options[j].selected = true;
			break;
		}
	}
};
TWKWHITE.prototype.testLampTempSelect = function() {
	this.lampInput.value = this.lampTempSelect.options[this.lampTempSelect.selectedIndex].value;
	if (!this.lampFree) {
		this.ctInput.value = this.lampInput.value;
		this.testCTInput();
	}
};
TWKWHITE.prototype.testCTSlider = function() {
	var val = parseFloat(this.ctSlider.value);
	var miredScale = (1000000/3200)-(1000000/5500); // scale mireds so that 3200 -> 5500 shift = 1 on slider
	var refMired = 1000000 / Math.round(parseFloat(this.refInput.value));
	var ctMiredShift = val * miredScale;
	if (-ctMiredShift > refMired * 0.9) {
		this.refInput.value = Math.round(1000000 / (-ctMiredShift / 0.9)).toString();
		refMired = 1000000 / parseFloat(this.refInput.value);
	}
	var temp = 1000000 / (refMired + ctMiredShift);
	this.ctInput.value = Math.round(temp).toString();
	if (!this.lampFree) {
		this.lampInput.value = this.ctInput.value;
	}
	if (Math.abs(val) < 0.0001) {
		this.ctSliderLabel.innerHTML = 'Clear';
	} else 	if (val<0) {
		this.ctSliderLabel.innerHTML = Math.abs(val).toString() + ' CTO';
	} else {
		this.ctSliderLabel.innerHTML = val.toString() + ' CTB';
	}
};
TWKWHITE.prototype.testDuvSlider = function() {
	var val = parseFloat(this.duvSlider.value);
	this.duvHidden.value = this.duvSlider.value;
	if (Math.abs(val) < 0.0001) {
		this.duvSliderLabel.innerHTML = 'Clear';
	} else if (val<0) {
		this.duvSliderLabel.innerHTML = Math.abs(val).toString() + ' Minus Green';
	} else {
		this.duvSliderLabel.innerHTML = val.toString() + ' Plus Green';
	}
};
TWKWHITE.prototype.testDuvHidden = function() {
	var val = parseFloat(this.duvHidden.value);
	this.duvSlider.value = this.duvHidden.value;
	if (Math.abs(val) < 0.0001) {
		this.duvSliderLabel.innerHTML = 'Clear';
	} else if (val<0) {
		this.duvSliderLabel.innerHTML = Math.abs(val).toString() + ' Minus Green';
	} else {
		this.duvSliderLabel.innerHTML = val.toString() + ' Plus Green';
	}
};
TWKWHITE.prototype.testDplSlider = function() {
	var val = parseFloat(this.dplSlider.value);
	this.dplHidden.value = this.dplSlider.value;
	if (Math.abs(val) < 0.0001) {
		this.dplSliderLabel.innerHTML = 'Clear';
	} else if (val<0) {
		this.dplSliderLabel.innerHTML = Math.abs(val).toString() + ' Yellow';
	} else {
		this.dplSliderLabel.innerHTML = val.toString() + ' Blue';
	}
};
TWKWHITE.prototype.testDplHidden = function() {
	var val = parseFloat(this.dplHidden.value);
	this.dplSlider.value = this.dplHidden.value;
	if (Math.abs(val) < 0.0001) {
		this.dplSliderLabel.innerHTML = 'Clear';
	} else if (val<0) {
		this.dplSliderLabel.innerHTML = Math.abs(val).toString() + ' Yellow';
	} else {
		this.dplSliderLabel.innerHTML = val.toString() + ' Blue';
	}
};
TWKWHITE.prototype.resetCT = function() {
	this.ctSlider.value = 0;
	this.testCTSlider();
};
TWKWHITE.prototype.resetDuv = function() {
	this.duvSlider.value = 0;
	this.testDuvSlider();
};
TWKWHITE.prototype.resetDpl = function() {
	this.dplSlider.value = 0;
	this.testDplSlider();
};
TWKWHITE.prototype.gotCATs = function(CATs) {
	var max = CATs.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j.toString();
		option.appendChild(document.createTextNode(CATs[j]));
		if (j === 0) {
			option.selected = true;
		}
		this.catSelect.appendChild(option);
	}
};
TWKWHITE.prototype.toggleSample = function() {
	if (this.sample) {
		this.sampleButton.value = 'Preview Click For White';
		this.sample = false;
	} else {
		this.sampleButton.value = 'Stop Preview Click For White';
		this.sample = true;
		this.messages.takePreviewClick(0);
	}
};
TWKWHITE.prototype.toggleLamp = function() {
	if (this.lampFree) {
		this.lampButton.value = 'Unlock Lightsource From New White';
		this.lampBox.className = 'tweak-hide';
		this.lampInput.value = this.ctInput.value;
		this.lampFree = false;
	} else {
		this.lampButton.value = 'Lock Lightsource To New White';
		this.lampBox.className = 'tweak';
		this.lampFree = true;
	}
};
TWKWHITE.prototype.previewSample = function(x,y) {
	if (this.tweakCheck.checked) {
		if (this.sample) {
			var rect = this.inputs.previewCanvas.getBoundingClientRect();
			x = (x - rect.left)/rect.width;
			y = (y - rect.top)/rect.height;
			this.messages.getPreCCTDuv(x,y);
		}
	}
};
TWKWHITE.prototype.gotPreCCTDuv = function(p) {
	var refMired = 1000000 / parseFloat(this.refInput.value);
	var sysMired = 1000000 / p.sys;
	var ctMiredRef = (1000000 / p.ct) - sysMired + refMired;
	var lampMiredRef = (1000000 / p.lamp) - sysMired + refMired;
	this.ctInput.value = Math.round(1000000 / ctMiredRef);
	this.testCTInput();
	this.lampInput.value = Math.round(1000000 / lampMiredRef);
	this.duvHidden.value = p.duv;
	this.testDuvHidden();
	this.dplHidden.value = p.dpl;
	this.testDplHidden();
	this.messages.gtSetParams();
};
TWKWHITE.prototype.toggleAdvanced = function() {
	if (this.advancedCheck.checked) {
		this.advancedBox.className = 'twk-advanced';
	} else {
		this.advancedBox.className = 'twk-advanced-hide';
	}
};
