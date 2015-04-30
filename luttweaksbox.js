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
function LUTTweaksBox(fieldset, inputs, messages, files) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.messages = messages;
	this.p = 3;
	this.messages.addUI(this.p,this);
	this.files = files;
	this.tweaksList = [];
	this.gaLists = false;
	this.gtLists = false;
	fieldset.appendChild(this.box);
}
LUTTweaksBox.prototype.build = function() {
	this.io();
	this.ui();
	this.events();
	this.toggleTweaks();
	this.messages.gaSetParams();
	this.messages.gtSetParams();
	splash.style.display='none';
}
LUTTweaksBox.prototype.io = function() {
	// Tweaks Checkbox
	this.tweaks = document.createElement('input');
	this.tweaks.setAttribute('type','checkbox');
	this.tweaks.checked = true;
	this.inputs.addInput('tweaks',this.tweaks);
}
LUTTweaksBox.prototype.ui = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Customisation')));
	this.box.appendChild(this.tweaks);
	this.holder = document.createElement('div');
	this.holder.id = 'tweaksholder';
	this.box.appendChild(this.holder);

	this.tweaksList.push(new TWKCT(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKFL(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKPSSTCDL(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKASCCDL(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKHG(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKBlkHi(this.holder, this.inputs, this.messages));
	this.tweaksList.push(new TWKFC(this.holder, this.inputs, this.messages));
	this.LA = this.tweaksList.length;
	this.tweaksList.push(new TWKLA(this.holder, this.inputs, this.messages, this.files));

}
LUTTweaksBox.prototype.events = function() {
	this.tweaks.onclick = function(here){ return function(){
		here.toggleTweaks();
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
}
//	Event Responses
LUTTweaksBox.prototype.toggleTweaks = function() {
	var max = this.tweaksList.length;
	for (var j=0; j<max; j++) {
		this.tweaksList[j].toggleTweaks();
	}
}
LUTTweaksBox.prototype.gotGammaLists = function() {
	this.gaLists = true;
	if (this.gtLists) {
		this.build();
	}
}
LUTTweaksBox.prototype.gotGamutLists = function() {
	this.gtLists = true;
	if (this.gaLists) {
		this.build();
	}
}
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
}
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
}
LUTTweaksBox.prototype.setParams = function(params) {
	var max = this.tweaksList.length;
	for (var j=0; j<max; j++) {
		this.tweaksList[j].setParams(params);
	}
}
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
}
LUTTweaksBox.prototype.followUp = function(tweak, input) {
	switch (tweak) {
		case 10:	this.tweaksList[this.LA].followUp(input);
				break;
		default:break;
	}
}
