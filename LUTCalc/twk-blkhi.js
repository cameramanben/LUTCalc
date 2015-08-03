/* twk-blkhi.js
* Black level and highlight level adjustment object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKBlkHi(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
}
TWKBlkHi.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;

	// Black Level Adjustment Checkbox
	this.blackLevelCheck = document.createElement('input');
	this.blackLevelCheck.setAttribute('type','checkbox');
	this.blackLevelCheck.className = 'twk-checkbox';
	this.blackLevelCheck.checked = false;
	// Black Level In % IRE
	this.blackLevelInput = document.createElement('input');
	this.blackLevelInput.setAttribute('type','number');
	this.blackLevelInput.setAttribute('step','any');
	this.blackLevelInput.className = 'ireinput';

	// Highlight Level Adjustment Checkbox
	this.highLevelCheck = document.createElement('input');
	this.highLevelCheck.setAttribute('type','checkbox');
	this.highLevelCheck.className = 'twk-checkbox';
	this.highLevelCheck.checked = false;
	// Highlight Reflectance Level In % Reflectance
	this.highLevelRef = document.createElement('input');
	this.highLevelRef.setAttribute('type','number');
	this.highLevelRef.setAttribute('step','any');
	this.highLevelRef.className = 'ireinput';
	this.highLevelRef.value='90';
	// Highlight Reflectance Maps To In Rec709 % IRE - Info Only
	this.highLevelRec = document.createElement('span');
	// Highlight Reflectance Maps To In % IRE
	this.highLevelMap = document.createElement('input');
	this.highLevelMap.setAttribute('type','number');
	this.highLevelMap.setAttribute('step','any');
	this.highLevelMap.className = 'ireinput';
}
TWKBlkHi.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Black Level / Highlight Level')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	this.holder.appendChild(this.box);

// Tweak - Specific UI Elements
	// Black Level
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Black Level')));
	this.box.appendChild(this.blackLevelCheck);
	this.blackLevelBox = document.createElement('div');
	this.blackLevelBox.className = 'twk-tab-hide';
	this.blackLevelBox.appendChild(this.blackLevelInput);
	this.blackLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.box.appendChild(this.blackLevelBox);
	this.separator = document.createElement('div');
	this.separator.className = 'twk-tab';
	this.box.appendChild(this.separator);
	// Highlight Level
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Highlight Level')));
	this.box.appendChild(this.highLevelCheck);
	this.highLevelBox = document.createElement('div');
	this.highLevelBox.className = 'twk-tab-hide';
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Reflected')));
	this.highLevelBox.appendChild(this.highLevelRef);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.highLevelBox.appendChild(document.createElement('br'));
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Maps To (')));
	this.highLevelBox.appendChild(this.highLevelRec);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE In Rec709)')));
	this.highLevelBox.appendChild(document.createElement('br'));
	this.highLevelBox.appendChild(this.highLevelMap);
	this.highLevelBox.appendChild(document.createElement('label').appendChild(document.createTextNode('% IRE')));
	this.box.appendChild(this.highLevelBox);
}
TWKBlkHi.prototype.toggleTweaks = function() {
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
}
TWKBlkHi.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
}
TWKBlkHi.prototype.getTFParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doBlkHi = true;
	} else {
		out.doBlkHi = false;
	}
	if (tweaks && tweak && this.blackLevelCheck.checked) {
		out.doBlack = true;
	} else {
		out.doBlack = false;
	}
	if (tweaks && tweak && this.highLevelCheck.checked) {
		out.doHigh = true;
	} else {
		out.doHigh = false;
	}
	var blackLevel = parseFloat(this.blackLevelInput.value);
	if (!isNaN(blackLevel)) {
		out.blackLevel = blackLevel/100;
	}
	var highRef = parseFloat(this.highLevelRef.value);
	if (!isNaN(highRef)) {
		out.highRef = highRef/100;
	}
	var highMap = parseFloat(this.highLevelMap.value);
	if (!isNaN(highMap)) {
		out.highMap = highMap/100;
	}
	params.twkBlkHi = out;
}
TWKBlkHi.prototype.getCSParams = function(params) {
	// No Relevant Parameters For This Tweak
}
TWKBlkHi.prototype.setParams = function(params) {
	if (typeof params.twkBlkHi !== 'undefined') {
		var p = params.twkBlkHi;
		this.blackDefault = (p.blackDef*100).toFixed(2).toString();
		if (typeof params.changedGamma === 'boolean' && params.changedGamma) {
			this.blackLevelInput.value = (p.blackDef*100).toFixed(2).toString();
			this.highLevelRef.value = (p.highRef*100).toFixed(2).toString();
			this.highLevelMap.value = (p.highDef*100).toFixed(2).toString();
			this.highLevelRec.innerHTML = (p.high709*100).toFixed(2).toString();
		} else {
			this.blackLevelInput.value = (p.blackLevel*100).toFixed(2).toString();
			this.highLevelRef.value = (p.highRef*100).toFixed(2).toString();
			this.highLevelMap.value = (p.highMap*100).toFixed(2).toString();
			this.highLevelRec.innerHTML = (p.high709*100).toFixed(2).toString();
		}
		this.toggleTweaks();
	}
}
TWKBlkHi.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak && this.blackLevelCheck.checked) {
		info.doBlk = true;
		info.blackLevel = this.blackLevelInput.value;
	} else {
		info.doBlk = false;
		info.blackLevel = this.blackDefault;
	}
}
TWKBlkHi.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
	};}(this);
	this.blackLevelCheck.onclick = function(here){ return function(){
		here.toggleBlack();
		here.messages.gaSetParams();
	};}(this);
	this.blackLevelInput.onchange = function(here){ return function(){
		here.testBlack();
		here.messages.gaSetParams();
	};}(this);
	this.highLevelCheck.onclick = function(here){ return function(){
		here.toggleHigh();
		here.messages.gaSetParams();
	};}(this);
	this.highLevelRef.onchange = function(here){ return function(){
		here.testHighRef();
		here.messages.gaSetParams();
	};}(this);
	this.highLevelMap.onchange = function(here){ return function(){
		here.testHighMap();
		here.messages.gaSetParams();
	};}(this);
}
// Tweak-Specific Code
TWKBlkHi.prototype.toggleBlack = function() {
	if (this.blackLevelCheck.checked) {
		this.blackLevelBox.className = 'twk-sub-box';
		this.separator.className = 'twk-tab-hide';
	} else {
		this.blackLevelBox.className = 'twk-sub-box-hide';
		this.separator.className = 'twk-tab';
	}
}
TWKBlkHi.prototype.testBlack = function() {
	if (!isNaN(parseFloat(this.blackLevelInput.value)) && isFinite(this.blackLevelInput.value) && (parseFloat(this.blackLevelInput.value)>-7.3)) {
	} else {
			this.blackLevelInput.value = null;
	}
}
TWKBlkHi.prototype.toggleHigh = function() {
	if (this.highLevelCheck.checked) {
		this.highLevelBox.className = 'twk-sub-box';
	} else {
		this.highLevelBox.className = 'twk-sub-box-hide';
	}
}
TWKBlkHi.prototype.testHighRef = function() {
	if (!isNaN(parseFloat(this.highLevelRef.value)) && isFinite(this.highLevelRef.value) && (parseFloat(this.highLevelRef.value)>0)) {
	} else {
		this.highLevelRef.value = '90';
		this.highLevelMap.value = null;
	}
}
TWKBlkHi.prototype.testHighMap = function() {
	if (!isNaN(parseFloat(this.highLevelMap.value)) && isFinite(this.highLevelMap.value) && (parseFloat(this.highLevelMap.value)>-7.3)) {
	} else {
		this.highLevelMap.value = null;
	}
}
