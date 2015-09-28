/* luttweaksbox.js
* Customisation of transfer curves and colour space (gamma and gamut) options UI object for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTTweaksBox(fieldset, inputs, messages, files, formats) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.messages = messages;
	this.p = 3;
	this.messages.addUI(this.p,this);
	this.files = files;
	this.formats = formats;
	this.tweaksList = [];
	this.gaLists = false;
	this.gtLists = false;
	this.built = false;
	fieldset.appendChild(this.box);
}
LUTTweaksBox.prototype.build = function() {
	this.io();
	this.ui();
	this.toggleTweaks();
	this.messages.gaSetParams();
	this.messages.gtSetParams();
	lutcalcReady(this.p);
};
LUTTweaksBox.prototype.io = function() {
	// Tweaks Checkbox
	this.tweaks = document.createElement('input');
	this.tweaks.setAttribute('type','checkbox');
	this.tweaks.checked = true;
	this.inputs.addInput('tweaks',this.tweaks);
};
LUTTweaksBox.prototype.ui = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Customisation')));
	this.box.appendChild(this.tweaks);
	this.holder = document.createElement('div');
	this.holder.id = 'tweaksholder';
	this.box.appendChild(this.holder);
	maxHeights();

	this.wb = this.tweaksList.length;
	this.tweaksList.push(new TWKWHITE(this.holder, this.inputs, this.messages));
	this.messages.gtTx(3,17,{});
	this.PSST = this.tweaksList.length;
	this.tweaksList.push(new TWKPSSTCDL(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKASCCDL(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKHG(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKKnee(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKBlkHi(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKFC(this.holder, this.inputs, this.messages));
	this.LA = this.tweaksList.length;
	this.tweaksList.push(new TWKLA(this.holder, this.inputs, this.messages, this.files, this.formats));

};
LUTTweaksBox.prototype.events = function() {
	var max = this.tweaksList.length;
	for (var j=0; j<max; j++) {
		this.tweaksList[j].events();
	}
	this.tweaks.onclick = function(here){ return function(){
		here.toggleTweaks();
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
};
//	Event Responses
LUTTweaksBox.prototype.toggleTweaks = function() {
	var max = this.tweaksList.length;
	for (var j=0; j<max; j++) {
		this.tweaksList[j].toggleTweaks();
	}
};
LUTTweaksBox.prototype.gotGammaLists = function() {
	this.gaLists = true;
	if (this.gtLists && !this.built) {
		this.build();
		this.built = true;
	}
};
LUTTweaksBox.prototype.gotGamutLists = function() {
	this.gtLists = true;
	if (this.gaLists && !this.built) {
		this.build();
		this.built = true;
	}
};
LUTTweaksBox.prototype.gotCATs = function(CATs) {
	this.tweaksList[this.wb].gotCATs(CATs);
};
LUTTweaksBox.prototype.getTFParams = function(params) {
	if (typeof this.tweaks !== 'undefined' && this.tweaks.checked) {
		params.tweaks = true;
	} else {
		params.tweaks = false;
	}
	var max = this.tweaksList.length;
	for (var j=0; j<max; j++) {
		this.tweaksList[j].getTFParams(params);
	}
};
LUTTweaksBox.prototype.getCSParams = function(params) {
	if (typeof this.tweaks !== 'undefined' && this.tweaks.checked) {
		params.tweaks = true;
	} else {
		params.tweaks = false;
	}
	var max = this.tweaksList.length;
	for (var j=0; j<max; j++) {
		this.tweaksList[j].getCSParams(params);
	}
};
LUTTweaksBox.prototype.setParams = function(params) {
	var max = this.tweaksList.length;
	for (var j=0; j<max; j++) {
		this.tweaksList[j].setParams(params);
	}
};
LUTTweaksBox.prototype.psstColours = function(params) {
	this.tweaksList[this.PSST].psstColours(params);
};
LUTTweaksBox.prototype.getInfo = function(info) {
	if (this.tweaks.checked) {
		info.tweaks = true;
	} else {
		info.tweaks = false;
	}
	var max = this.tweaksList.length;
	for (var j=0; j<max; j++) {
		this.tweaksList[j].getInfo(info);
	}	
};
LUTTweaksBox.prototype.followUp = function(tweak, input) {
	switch (tweak) {
		case 10:	this.tweaksList[this.LA].followUp(input);
				break;
		default:break;
	}
};
LUTTweaksBox.prototype.getSettings = function(data) {
	data.tweaksBox = {
		tweaks: this.tweaks.checked
	};
	var m = this.tweaksList.length;
	for (var j=0; j<m; j++) {
		this.tweaksList[j].getSettings(data.tweaksBox);
	}	
};
LUTTweaksBox.prototype.setSettings = function(settings) {
	if (typeof settings.tweaksBox !== 'undefined') {
		var data = settings.tweaksBox;
		if (typeof data.tweaks === 'boolean') {
			this.tweaks.checked = data.tweaks;
			this.toggleTweaks();
		}
		var m = this.tweaksList.length;
		for (var j=0; j<m; j++) {
			this.tweaksList[j].setSettings(data);
		}	
	}
};
LUTTweaksBox.prototype.getHeight = function() {
	return this.box.clientHeight;
};
LUTTweaksBox.prototype.setMaxHeight = function(height) {
	height -= 96;
	if (height < 150) {
		height = 150;
	}
	this.holder.style.maxHeight = height.toString() + 'px';
};
