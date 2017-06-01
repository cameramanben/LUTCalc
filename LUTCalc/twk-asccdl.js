/* twk-asccdl.js
* ASC-CDL object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKASCCDL(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
}
TWKASCCDL.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;

	// Saturation Slider
	this.satS = new lutSlider({
		min: 0,
		max: 2,
		value: 1,
		step: 0.05,
		title: false,
		lhs: 'Saturation',
		minLabel: false,
		maxLabel: false,
		input: 'number',
		inputLim: false,
		reset: true
	});
	// Colour Channel Selector
	this.channelSelect = document.createElement('select');
	this.channelSelect.className = 'twk-select';
	this.channelList();
	// SOP Arrays
	this.sS = [];
	this.oS = [];
	this.pS = [];
	for (var j=0; j<4; j++) {
		this.sS[j] = new lutSlider({
			min: 0,
			mid: 1,
			max: 10,
			value: 1,
			step: 0.01,
			title: false,
			lhs: 'Slope',
			minLabel: false,
			maxLabel: false,
			input: 'number',
			inputLim: false,
			reset: true,
			resetAll: true
		});
		this.oS[j] = new lutSlider({
			min: -0.5,
			max: 0.5,
			value: 0,
			step: 0.01,
			title: false,
			lhs: 'Offset',
			minLabel: false,
			maxLabel: false,
			input: 'number',
			inputLim: false,
			reset: true,
			resetAll: true
		});
		this.pS[j] = new lutSlider({
			min: 0,
			mid: 1,
			max: 10,
			value: 1,
			step: 0.01,
			title: false,
			lhs: 'Power',
			minLabel: false,
			maxLabel: false,
			input: 'number',
			inputLim: false,
			reset: true,
			resetAll: true
		});
	}
};
TWKASCCDL.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('ASC-CDL')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
// Tweak - Specific UI Elements
	// Saturation
	this.box.appendChild(this.satS.element);
	// Channel Selector
	this.box.appendChild(this.channelSelect);
	this.box.appendChild(document.createElement('br'));
	// SOP Boxes
	this.sop = [];
	for (var j=0; j<4; j++) {
		this.sop[j] = document.createElement('div');
		if (j === 0) {
			this.sop[j].className = 'twk-tab';
		} else {
			this.sop[j].className = 'twk-tab-hide';
		}
		this.sop[j].appendChild(this.sS[j].element);
		this.sop[j].appendChild(this.oS[j].element);
		this.sop[j].appendChild(this.pS[j].element);
		this.box.appendChild(this.sop[j]);
	}
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKASCCDL.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked) {
		if (this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue !== 'Null') {
			this.holder.className = 'tweakholder';
		} else {
			this.holder.className = 'tweakholder-hide';
			this.tweakCheck.checked = false;
		}
		if (this.inputs.d[1].checked) {
			this.satS.show();
		} else {
			this.satS.hide();
		}
	} else {
		this.holder.className = 'tweakholder-hide';
		this.tweakCheck.checked = false;
	}
	this.toggleTweak();
};
TWKASCCDL.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKASCCDL.prototype.getTFParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doASCCDL = true;
		var cdl = new Float64Array(10);
		for (var j=0; j<3; j++) {
			cdl[ j ] = this.sS[j+1].getValue();
			cdl[j+3] = this.oS[j+1].getValue();
			cdl[j+6] = this.pS[j+1].getValue();
		}
		cdl[9] = this.satS.getValue();
		out.cdl = cdl.buffer;
	} else {
		out.doASCCDL = false;
	}
	params.twkASCCDL = out;
};
TWKASCCDL.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doASCCDL = true;
		var cdl = new Float64Array(10);
		for (var j=0; j<3; j++) {
			cdl[ j ] = this.sS[j+1].getValue();
			cdl[j+3] = this.oS[j+1].getValue();
			cdl[j+6] = this.pS[j+1].getValue();
		}
		cdl[9] = this.satS.getValue();
		out.cdl = cdl.buffer;
	} else {
		out.doASCCDL = false;
	}
	params.twkASCCDL = out;
};
TWKASCCDL.prototype.setParams = function(params) {
	if (typeof params.twkASCCDL !== 'undefined') {
		var p = params.twkASCCDL;
		this.toggleTweaks();
	}
};
TWKASCCDL.prototype.getSettings = function(data) {
	var cdl = [];
	for (var j=0; j<3; j++) {
		cdl[ j ] = this.sS[j+1].getValue();
		cdl[j+3] = this.oS[j+1].getValue();
		cdl[j+6] = this.pS[j+1].getValue();
	}
	cdl[9] = this.satS.getValue();
	data.ascCDL = {
		doASCCDL: this.tweakCheck.checked,
		cdl: cdl.toString(),
		channel: this.channelSelect.options[this.channelSelect.selectedIndex].lastChild.nodeValue
	};
};
TWKASCCDL.prototype.setSettings = function(settings) {
	if (typeof settings.ascCDL !== 'undefined') {
		var data = settings.ascCDL;
		if (typeof data.doASCCDL === 'boolean') {
			this.tweakCheck.checked = data.doASCCDL;
			this.toggleTweak();
		}
		if (typeof data.cdl !== 'undefined') {
			var cdl = data.cdl.split(',').map(Number);
			this.sS[0].setValue((parseFloat(cdl[0])+parseFloat(cdl[1])+parseFloat(cdl[2]))/3);
			this.oS[0].setValue((parseFloat(cdl[3])+parseFloat(cdl[4])+parseFloat(cdl[5]))/3);
			this.pS[0].setValue((parseFloat(cdl[6])+parseFloat(cdl[7])+parseFloat(cdl[8]))/3);
			for (var j=0; j<3; j++) {
				this.sS[j+1].setValue(parseFloat(cdl[ j ]));
				this.oS[j+1].setValue(parseFloat(cdl[j+3]));
				this.pS[j+1].setValue(parseFloat(cdl[j+6]));
			}
			this.satS.setValue(parseFloat(cdl[9]));
		}
		if (typeof data.channel !== 'undefined') {
			var m = this.channelSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.channelSelect.options[j].lastChild.nodeValue === data.channel) {
					this.channelSelect.options[j].selected = true;
					break;
				}
			}
			this.changeChannel();
		}
	}
};
TWKASCCDL.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doASCCDL = true;
		info.ASCSat = this.satS.getValue().toString();
	} else {
		info.doASCCDL = false;
	}
};
TWKASCCDL.prototype.isCustomGamma = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKASCCDL.prototype.isCustomGamut = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKASCCDL.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.channelSelect.onchange = function(here){ return function(){
		here.changeChannel();
	};}(this);
	this.satS.action = function(here){ return function(){
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.sS[0].action = function(here){ return function(){
		var off = 0;
		for (var l=1; l<4; l++) {
			off += here.sS[l].getValue();
		}
		off = this.getValue() - (off/3);
		for (var l=1; l<4; l++) {
			here.sS[l].setValue(Math.max(0,here.sS[l].getValue()+off));
		}
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.oS[0].action = function(here){ return function(){
		var off = 0;
		for (var l=1; l<4; l++) {
			off += here.oS[l].getValue();
		}
		off = this.getValue() - (off/3);
		for (var l=1; l<4; l++) {
			here.oS[l].setValue(here.oS[l].getValue()+off);
		}
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.pS[0].action = function(here){ return function(){
		var off = 0;
		for (var l=1; l<4; l++) {
			off += here.pS[l].getValue();
		}
		off = this.getValue() - (off/3);
		for (var l=1; l<4; l++) {
			here.pS[l].setValue(Math.max(0,here.pS[l].getValue()+off));
		}
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.sS[0].resetAll = function(here){ return function(){
		for (var l=0; l<4; l++) {
			here.sS[l].reset();
		}
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.oS[0].resetAll = function(here){ return function(){
		for (var l=0; l<4; l++) {
			here.oS[l].reset();
		}
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.pS[0].resetAll = function(here){ return function(){
		for (var l=0; l<4; l++) {
			here.pS[l].reset();
		}
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	for (var j=1; j<4; j++) {
		this.sS[j].action = function(here){ return function(){
			var o = 0;
			for (var l=1; l<4; l++) {
				o += here.sS[l].getValue();
			}
			here.sS[0].setValue(o/3);
			here.messages.gaSetParams();
			here.messages.gtSetParams();
		};}(this);
		this.sS[j].resetAll = function(here){ return function(){
			for (var l=0; l<4; l++) {
				here.sS[l].reset();
			}
			here.messages.gaSetParams();
			here.messages.gtSetParams();
		};}(this);
		this.oS[j].action = function(here){ return function(){
			var o = 0;
			for (var l=1; l<4; l++) {
				o += here.oS[l].getValue();
			}
			here.oS[0].setValue(o/3);
			here.messages.gaSetParams();
			here.messages.gtSetParams();
		};}(this);
		this.oS[j].resetAll = function(here){ return function(){
			for (var l=0; l<4; l++) {
				here.oS[l].reset();
			}
			here.messages.gaSetParams();
			here.messages.gtSetParams();
		};}(this);
		this.pS[j].action = function(here){ return function(){
			var o = 0;
			for (var l=1; l<4; l++) {
				o += here.pS[l].getValue();
			}
			here.pS[0].setValue(o/3);
			here.messages.gaSetParams();
			here.messages.gtSetParams();
		};}(this);
		this.pS[j].resetAll = function(here){ return function(){
			for (var l=0; l<4; l++) {
				here.pS[l].reset();
			}
			here.messages.gaSetParams();
			here.messages.gtSetParams();
		};}(this);
	}
};
// Tweak-Specific Code
TWKASCCDL.prototype.channelList = function() {
	var channels = [
		'Gray',
		'Red',
		'Green',
		'Blue'
	];
	var max = channels.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j.toString();
		option.appendChild(document.createTextNode(channels[j]));
		if (j === 0) {
			option.selected = true;
		}
		this.channelSelect.appendChild(option);
	}
};
TWKASCCDL.prototype.changeChannel = function() {
	var chan = this.channelSelect.selectedIndex;
	for (var j=0; j<4; j++) {
		if (j === chan) {
			this.sop[j].className = 'twk-tab';
		} else {
			this.sop[j].className = 'twk-tab-hide';
		}
	}
};
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
