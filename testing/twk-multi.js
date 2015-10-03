/* twk-sat.js
* Variable Saturation (By Luminance) object for the LUTCalc Web App.
* 2nd October 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKMulti(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKMulti.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	// Stop-By-Stop Saturation Sliders
	this.sat = new Float64Array([
		1,1,1,1,1,1,1,1,
		1,
		1,1,1,1,1,1,1,1
	]);
	this.satSliders = [];
	for (var j=0; j<17; j++) {
		var slider = document.createElement('input');
		slider.setAttribute('type','range');
		slider.setAttribute('min',0);
		slider.setAttribute('max',2);
		slider.setAttribute('step',0.01);
		slider.setAttribute('value',1);
		slider.className = 'twk-multi-range-array';
		this.satSliders.push(slider);
	}
	this.satReset = document.createElement('input');
	this.satReset.setAttribute('type','button');
	this.satReset.className = 'smallbutton';
	this.satReset.setAttribute('value','Reset');
};
TWKMulti.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Multitone')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	// Box for stop-by-stop slider background
	this.coloursBox = document.createElement('div');
	this.coloursBox.id = 'twk-multi-coloursbox';
	this.redBars = [];
	this.greenBars = [];
	this.blueBars = [];
	for (var j=0; j<17; j++) {
		this.redBars[j] = document.createElement('div');
		this.redBars[j].className = 'twk-multi-colour-bars-r';
		this.coloursBox.appendChild(this.redBars[j]);
	}
	for (var j=0; j<17; j++) {
		this.greenBars[j] = document.createElement('div');
		this.greenBars[j].className = 'twk-multi-colour-bars-g';
		this.coloursBox.appendChild(this.greenBars[j]);
	}
	for (var j=0; j<17; j++) {
		this.blueBars[j] = document.createElement('div');
		this.blueBars[j].className = 'twk-multi-colour-bars-b';
		this.coloursBox.appendChild(this.blueBars[j]);
	}
	this.box.appendChild(this.coloursBox);
	// Array Of Sliders
	this.sliderBox = document.createElement('div');
	this.sliderBox.className = 'twk-multi-sliders';
	for (var j=0; j<17; j++) {
		this.sliderBox.appendChild(this.satSliders[j]);
	}
	this.box.appendChild(this.sliderBox);
	for (var j=0; j<17; j++) {
		var stopLabel = document.createElement('label');
		stopLabel.appendChild(document.createTextNode(j-8));
		stopLabel.className = 'twk-multi-stop';
		this.box.appendChild(stopLabel);
	}
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Stop:')));
	this.stopInput = document.createElement('input');
	this.stopInput.setAttribute('type','text');
	this.stopInput.className = 'smallinput';
	this.stopInput.value = '0';
	this.box.appendChild(this.stopInput);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Saturation:')));
	this.satInput = document.createElement('input');
	this.satInput.setAttribute('type','text');
	this.satInput.className = 'smallinput';
	this.satInput.value = '1';
	this.box.appendChild(this.satInput);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(this.satReset);

	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKMulti.prototype.toggleTweaks = function() {
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
TWKMulti.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKMulti.prototype.getTFParams = function(params) {
	// No parameters are relevent
};
TWKMulti.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doMulti = true;
		out.sat = this.sat.buffer.slice(0);
	} else {
		out.doMulti = false;
	}
	params.twkMulti = out;
};
TWKMulti.prototype.setParams = function(params) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		this.messages.gtTx(3,9,null);
	}
	if (typeof params.twkMulti !== 'undefined') {
		var p = params.twkMulti;
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
};
TWKMulti.prototype.getSettings = function(data) {
	data.multiTone = {
		doMulti: this.tweakCheck.checked,
		minStop: -8,
		maxStop: 8,
		saturation: this.taToString(this.sat)
	};
};
TWKMulti.prototype.setSettings = function(settings) {
	if (typeof settings.multiTone !== 'undefined') {
		var data = settings.multiTone;
		if (typeof data.doMulti === 'boolean') {
			this.tweakCheck.checked = data.doMulti;
			this.toggleTweak();
		}
		if (typeof data.saturation !== 'undefined') {
			this.sat = new Float64Array(data.saturation.split(',').map(Number))
		}
	}
};
TWKMulti.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doMulti = true;
	} else {
		info.doMulti = false;
	}
};
TWKMulti.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	for (var j=0; j<17; j++) {
		this.satSliders[j].oninput = function(i){ return function(){
			if (i[0].sat[i] !== parseFloat(i[0].satSliders[i[1]].value)) {
				i[0].testSat(i[1]);
				i[0].messages.gtSetParams();
			}
		};}([this,j]);
	}
	this.stopInput.onchange = function(here){ return function(){
		here.testStopInput();
		here.messages.gtSetParams();
	};}(this);
	this.satInput.onchange = function(here){ return function(){
		here.testSatInput();
		here.messages.gtSetParams();
	};}(this);
	this.satReset.onclick = function(here){ return function(){
		here.resetSat();
		here.messages.gtSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKMulti.prototype.testSat = function(i) {
	var vo = this.sat[i];
	var vn = parseFloat(this.satSliders[i].value);
	if (vo !== vn) {
		this.sat[i] = vn;
	}
	this.stopInput.value = (i-8).toString();
	this.satInput.value = this.sat[i].toString();		
};
TWKMulti.prototype.resetSat = function() {
	for (var j=0; j<17; j++) {
		this.satSliders[j].value = 1;
		this.sat[j] = 1;
	}
	this.stopInput.value = '0';
	this.satInput.value = '1';
};
TWKMulti.prototype.multiColours = function(p) {
	var o = new Uint8Array(p.o);
	for (var j=0; j<17; j++) {
		this.redBars[j].style.backgroundColor = 'rgb(' + o[j*3] + ',' + o[(j*3)+1] + ',' + o[(j*3)+2]+')';
		this.greenBars[j].style.backgroundColor = 'rgb(' + o[((j+17)*3)] + ',' + o[((j+17)*3)+1] + ',' + o[((j+17)*3)+2]+')';
		this.blueBars[j].style.backgroundColor = 'rgb(' + o[((j+34)*3)] + ',' + o[((j+34)*3)+1] + ',' + o[((j+34)*3)+2]+')';
	}
	this.toggleTweaks();
};
TWKMulti.prototype.testStopInput = function() {
	var val = parseInt(this.stopInput.value);
	if (isNaN(val)) {
		val = 0;
	} else {
		val = Math.max(-8,Math.min(8,val));
	}
	this.stopInput.value = val.toString();
	this.satInput.value = this.satSliders[val+8].value.toString();
};
TWKMulti.prototype.testSatInput = function() {
	var val = parseFloat(this.satInput.value);
	var i = parseInt(this.stopInput.value)+8;
	if (isNaN(val)) {
		val = parseFloat(this.satSliders[i].value);
	} else {
		val = Math.max(0,Math.min(2,val));
	}
	this.satInput.value = val.toString();
	this.satSliders[i].value = val;
	this.sat[i] = val;
};
TWKMulti.prototype.taToString = function(data) {
	var out = [];
	var m = data.length;
	for (var j=0; j<m; j++) {
		out[j] = data[j];
	}
	return out.toString();
};
