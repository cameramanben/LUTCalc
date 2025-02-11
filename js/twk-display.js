/* twk-display.js
* Final conversion from base colourspace to a different colourspace (ie maintaining look).
* 12th May 2017
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKDisplay(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.p = 17;
	this.messages.addUI(this.p,this);
	this.io();
	this.ui();
	this.events();
}
TWKDisplay.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	this.inSpaceSelect = document.createElement('select');
	this.outSpaceSelect = document.createElement('select');
	this.spaceNames = [];
	var list = this.inputs.gammaDisList;
	var m = list.length;
	for (var j=0; j<m; j++) {
		this.spaceNames.push(list[j].name);
		var optIn = document.createElement('option');
		optIn.innerHTML = list[j].name;
		optIn.value = list[j].idx;
		this.inSpaceSelect.appendChild(optIn);
		var optOut = document.createElement('option');
		optOut.innerHTML = list[j].name;
		optOut.value = list[j].idx;
		this.outSpaceSelect.appendChild(optOut);
		if (list[j].name === 'Rec709') {
			optIn.selected = true;
			optOut.selected = true;
		}
	}
	this.inGamutSelect = document.createElement('select');
	this.outGamutSelect = document.createElement('select');
	list = [
		'Rec709',
		'Rec2020',
		'sRGB',
		'DCI-P3',
		'DCI-D60',
		'DCI-D65',
		'ProPhoto RGB'
	];
	m = list.length;
	for (var j=0; j<m; j++) {
		var optIn = document.createElement('option');
		optIn.innerHTML = list[j];
		optIn.value = j;
		this.inGamutSelect.appendChild(optIn);
		var optOut = document.createElement('option');
		optOut.innerHTML = list[j];
		optOut.value = j;
		this.outGamutSelect.appendChild(optOut);
	}
	this.gtIdx = [];
	list = this.inputs.gammaDisBaseGamuts;
	m = list.length;
	for (var j=0; j<m; j++) {
		switch (list[j]) {
			case 'Rec709':
				this.gtIdx.push(0);
				break;
			case 'Rec2020':
				this.gtIdx.push(1);
				break;
			case 'sRGB':
				this.gtIdx.push(2);
				break;
			case 'P3 - DCI':
				this.gtIdx.push(3);
				break;
			case 'P3 - D60':
				this.gtIdx.push(4);
				break;
			case 'P3 - D65':
				this.gtIdx.push(5);
				break;
			case 'ProPhoto RGB':
				this.gtIdx.push(6);
				break;
			default:
				this.gtIdx.push(9999);
		}
	}
	this.csIdx = [];
	list = this.inputs.gammaOutList;
	m = list.length;
	for (var j=0; j<m; j++) {
		if (list[j].name.indexOf('Rec2100') !== -1 || list[j].name.indexOf('PQ') !== -1) {
			this.csIdx.push(this.spaceNames.indexOf(list[j].name));
		} else if (list[j].name === 'Linear / γ') {
			// Ignore
		} else {
			switch(this.inputs.gammaBaseGamuts[list[j].idx]) {
				case 'Rec709':
					this.csIdx.push(0);
					break;
				case 'Rec2020':
					this.csIdx.push(1);
					break;
				case 'sRGB':
					this.csIdx.push(2);
					break;
				default:
					this.csIdx.push(9999);
					break;
			}
		}
	}
	this.csLIdx = [];
	list = this.inputs.gammaLinList;
	m = list.length - 2;
	for (var j=0; j<m; j++) {
		this.csLIdx.push(j);
		if (list[j].name === 'DCI - γ2.60') {
			j += 2;
		}
	}
};
TWKDisplay.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Display Colourspace Converter')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Output Base Colourspace')));
	this.box.appendChild(this.inSpaceSelect);
	this.box.appendChild(document.createElement('br'));
	this.inGamutBox = document.createElement('div');
	this.inGamutBox.className = 'twk-tab-hide';
	this.inGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Using Gamut')));
	this.inGamutBox.appendChild(this.inGamutSelect);
	this.box.appendChild(this.inGamutBox);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Convert To')));
	this.box.appendChild(this.outSpaceSelect);
	this.outGamutBox = document.createElement('div');
	this.outGamutBox.className = 'twk-tab-hide';
	this.outGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Using Gamut')));
	this.outGamutBox.appendChild(this.outGamutSelect);
	this.box.appendChild(this.outGamutBox);
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKDisplay.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked) { // This checks for 'Customisations' to be checked and LUT type set to '3D' (the d[1] item)
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
TWKDisplay.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKDisplay.prototype.getTFParams = function(params) {
	// Parameters to be sent to the 'Gamma' (Transfer Function) web worker go here
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doDisplay = true;
	} else {
		out.doDisplay = false;
	}
	out.inIdx = parseInt(this.inSpaceSelect.options[this.inSpaceSelect.options.selectedIndex].value);
	out.inGt = this.gtIdx[this.inSpaceSelect.options.selectedIndex];
	if (out.inGt === 9999) {
		out.inGt = this.inGamutSelect.selectedIndex;
	}
	out.outIdx = parseInt(this.outSpaceSelect.options[this.outSpaceSelect.options.selectedIndex].value);
	out.outGt = this.gtIdx[this.outSpaceSelect.options.selectedIndex];
	if (out.outGt === 9999) {
		out.outGt = this.outGamutSelect.selectedIndex;
	}
	params.twkDisplay = out;
};
TWKDisplay.prototype.getCSParams = function(params) {
	// Parameters to be sent to the 'Gamut' (Colour Space) web worker go here
};
TWKDisplay.prototype.setParams = function(params) {
	if (typeof params.twkDisplay !== 'undefined') {
		var p = params.twkDisplay;
		this.toggleTweaks();
	}
};
TWKDisplay.prototype.getSettings = function(data) {
	data.display = {
		doDisplay: this.tweakCheck.checked,
		baseCS: this.inSpaceSelect.options[this.inSpaceSelect.selectedIndex].lastChild.nodeValue,
		outputCS: this.outSpaceSelect.options[this.outSpaceSelect.selectedIndex].lastChild.nodeValue,
	};
	if (this.gtIdx[this.inSpaceSelect.options.selectedIndex] === 9999) {
		data.display.baseGamut = this.inGamutSelect.options[this.inGamutSelect.selectedIndex].lastChild.nodeValue;
	} else {
		data.display.baseGamut = data.display.baseCS;
	}
	if (this.gtIdx[this.outSpaceSelect.options.selectedIndex] === 9999) {
		data.display.outputGamut = this.outGamutSelect.options[this.outGamutSelect.selectedIndex].lastChild.nodeValue;
	} else {
		data.display.outputGamut = data.display.outputCS;
	}
};
TWKDisplay.prototype.setSettings = function(settings) {
	if (typeof settings.display !== 'undefined') {
		var data = settings.display;
		if (typeof data.doDisplay === 'boolean') {
			this.tweakCheck.checked = data.doDisplay;
			this.toggleTweak();
		}
		if (typeof data.baseCS !== 'undefined') {
			var m = this.inSpaceSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.inSpaceSelect.options[j].lastChild.nodeValue === data.baseCS) {
					this.inSpaceSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.outputCS !== 'undefined') {
			var m = this.outSpaceSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.outSpaceSelect.options[j].lastChild.nodeValue === data.outputCS) {
					this.outSpaceSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.baseGamut !== 'undefined') {
			var m = this.inGamutSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.inGamutSelect.options[j].lastChild.nodeValue === data.baseGamut) {
					this.inGamutSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.outputGamut !== 'undefined') {
			var m = this.outGamutSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.outGamutSelect.options[j].lastChild.nodeValue === data.outputGamut) {
					this.outGamutSelect.options[j].selected = true;
					break;
				}
			}
		}
	}
};
TWKDisplay.prototype.getInfo = function(info) {
	// Provides metadata to LUT formats
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doDisplay = true;
	} else {
		info.doDisplay = false;
	}
};
TWKDisplay.prototype.isCustomGamma = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKDisplay.prototype.isCustomGamut = function() {
	return false;
};
TWKDisplay.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
	};}(this);
	this.inSpaceSelect.onchange = function(here){ return function(){
		here.testSpace(true);
		here.messages.gaSetParams();
	};}(this);
	this.outSpaceSelect.onchange = function(here){ return function(){
		here.testSpace(false);
		here.messages.gaSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKDisplay.prototype.testSpace = function(isIn) {
	var idx, box;
	if (isIn) {
		idx = this.inSpaceSelect.selectedIndex;
		box = this.inGamutBox;
	} else {
		idx = this.outSpaceSelect.selectedIndex;
		box = this.outGamutBox;
	}
	if (this.gtIdx[idx] === 9999) {
		box.className = 'twk-tab';
	} else {
		box.className = 'twk-tab-hide';
	}	
};
TWKDisplay.prototype.updateGammaOut = function() {
	var m = this.inSpaceSelect.length;
	if (parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.selectedIndex].value) === 9999) {
		var idx = this.csLIdx[parseInt(this.inputs.outLinGamma.selectedIndex)];
		if (idx < m) {
			this.inSpaceSelect.options[idx].selected = true;
		}
	} else {
		var idx = this.csIdx[parseInt(this.inputs.outGamma.selectedIndex)];
		if (idx !== 9999 && idx < m) {
			this.inSpaceSelect.options[idx].selected = true;
		}
	}
};