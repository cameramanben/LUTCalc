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
	this.p = 14;
	this.messages.addUI(this.p,this);
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
	this.monochrome = document.createElement('input');
	this.monochrome.setAttribute('type','button');
	this.monochrome.className = 'smallbutton';
	this.monochrome.setAttribute('value','Monochrome');
	this.satReset = document.createElement('input');
	this.satReset.setAttribute('type','button');
	this.satReset.className = 'smallbutton';
	this.satReset.setAttribute('value','Reset Saturation');
	// Colour Picker
	this.pRLabel = document.createElement('label');
	this.pRLabel.appendChild(document.createTextNode('128'));
	this.pGLabel = document.createElement('label');
	this.pGLabel.appendChild(document.createTextNode('128'));
	this.pBLabel = document.createElement('label');
	this.pBLabel.appendChild(document.createTextNode('128'));
	this.pCurIdxHS = new Uint8Array([0,127,0]);
	this.pIdx = 0;
	this.pHue = 127;
	this.pSat = 0;
	this.pColBox = document.createElement('div');
	this.pColBox.className = 'picker-colour';
	this.pOKButton = document.createElement('input');
	this.pOKButton.setAttribute('type','button');
	this.pOKButton.value = 'OK';
	this.pCancelButton = document.createElement('input');
	this.pCancelButton.setAttribute('type','button');
	this.pCancelButton.value = 'Cancel';
	this.tones = [];
	this.tIdx = 0;
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
	this.box.appendChild(this.monochrome);
	this.box.appendChild(this.satReset);
	// Build Box Hierarchy
	this.holder.appendChild(this.box);

	this.buildPicker();
	this.addTone(0);
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
		var m = this.tones.length;
		var pStop = new Float64Array(m);
		for (var j=0; j<m; j++) {
			pStop[j] = parseFloat(this.tones[j].stop.value);
		}
		var hs = this.getHueSats();
		out.pHue = hs.hues.buffer;
		out.pSat = hs.sats.buffer;
		out.pStop = pStop.buffer;
	} else {
		out.doMulti = false;
	}
	params.twkMulti = out;
};
TWKMulti.prototype.setParams = function(params) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		this.messages.gtTx(this.p,9,this.getHueSats());
	}
	if (typeof params.twkMulti !== 'undefined') {
		var p = params.twkMulti;
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
};
TWKMulti.prototype.getSettings = function(data) {
	var hs = this.getHueSats();
	var m = this.tones.length;
	var stops = new Float64Array(m);
	for (var j=0; j<m; j++) {
		stops[j] = parseFloat(this.tones[j].stop.value);
	}
	data.multiTone = {
		doMulti: this.tweakCheck.checked,
		minStop: -8,
		maxStop: 8,
		saturation: this.taToString(this.sat),
		monoHue: this.taToString(hs.hues),
		monoSat: this.taToString(hs.sats),
		monoStop: this.taToString(stops)		
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
			this.sat = new Float64Array(data.saturation.split(',').map(Number));
		}
		if (typeof data.monoHue !== 'undefined' && typeof data.monoSat !== 'undefined' && typeof data.monoStop !== 'undefined') {
			var monoHue = new Uint8Array(data.monoHue.split(',').map(Number));
			var monoSat = new Uint8Array(data.monoSat.split(',').map(Number));
			var monoStop = new Float64Array(data.monoHue.split(',').map(Number));
			var m = this.tones.length;
			if (m > 1) {
				for (var j=1; j<m; j++) {
					this.tones[1].box.parentNode.removeChild(this.tones[1].box);
					this.tones.splice(1,1);
				}
			}
			m = monoStop.length;
			for (var j=0; j<m; j++) {
				if (j>0) {
					this.addTone(j);
				} else {
					this.pHue = monoHue[j];
				}
				this.setTone(j,monoHue[j],monoSat[j],monoStop[j]);
			}
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
TWKMulti.prototype.isCustomGamma = function() {
	return false;
};
TWKMulti.prototype.isCustomGamut = function() {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		return true;
	} else {
		return false;
	}
};
TWKMulti.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	for (var j=0; j<17; j++) {
		this.satSliders[j].oninput = function(i){ return function(){
			if (i[0].sat[i[1]] !== parseFloat(i[0].satSliders[i[1]].value)) {
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
	this.monochrome.onclick = function(here){ return function(){
		here.toMono();
		here.messages.gtSetParams();
	};}(this);
	this.satReset.onclick = function(here){ return function(){
		here.resetSat();
		here.messages.gtSetParams();
	};}(this);
	this.pCan.onclick = function(here){ return function(e){
		here.updatePicker(e.clientX, e.clientY);
	};}(this);
	this.pOKButton.onclick = function(here){ return function(e){
		here.updateTone();
		modalBox.className = 'modalbox-hide';
		here.pickerHolder.className = 'colourpicker-hide';
	};}(this);
	this.pCancelButton.onclick = function(here){ return function(e){
		modalBox.className = 'modalbox-hide';
		here.pickerHolder.className = 'colourpicker-hide';
	};}(this);
};
// Tweak-Specific Code
TWKMulti.prototype.addTone = function(idx) {
	var toneBox = document.createElement('div');
	toneBox.className = 'twk-sub-box';
	var pmBox = document.createElement('div');
	pmBox.className = 'twk-multi-pmbox';
	var plus = document.createElement('input');
	plus.setAttribute('type','button');
	plus.className= 'plusminus';
	plus.value = '+';
	pmBox.appendChild(plus);
	var minus = document.createElement('input');
	minus.setAttribute('type','button');
	minus.className= 'plusminus';
	minus.value='-';
	pmBox.appendChild(minus);
	toneBox.appendChild(pmBox);
	var toneColour = document.createElement('div');
	toneColour.className = 'picker-colour-small';
	toneBox.appendChild(toneColour);
	var toneRight = document.createElement('div');
	toneRight.className = 'twk-multi-tab';
	var hueSlider = document.createElement('input');
	hueSlider.setAttribute('type','range');
	hueSlider.setAttribute('min',0);
	hueSlider.setAttribute('max',255);
	hueSlider.setAttribute('step',1);
	hueSlider.setAttribute('value',127);
	toneRight.appendChild(hueSlider);
	var satSlider = document.createElement('input');
	satSlider.setAttribute('type','range');
	satSlider.setAttribute('min',0);
	satSlider.setAttribute('max',1);
	satSlider.setAttribute('step',0.001);
	satSlider.setAttribute('value',0);
	var stopSlider = document.createElement('input');
	stopSlider.setAttribute('type','range');
	stopSlider.setAttribute('min',-8);
	stopSlider.setAttribute('max',8);
	stopSlider.setAttribute('step',0.01);
	if (this.tones.length === 1 || (this.tones.length > 1 && idx >= this.tones.length)) {
		var m1 = parseFloat(this.tones[idx-1].stop.value);
		if (m1 >= 8) {
			if (idx - 1 === 0) {
				this.tones[idx-1].stop.value = 0;
			} else {
				var m2 = parseFloat(this.tones[idx-2].stop.value);
				this.tones[idx-1].stop.value = parseFloat(((m2+8)/2).toFixed(3))
			}
			this.tones[idx-1].stopValue.removeChild(this.tones[idx-1].stopValue.firstChild);
			this.tones[idx-1].stopValue.appendChild(document.createTextNode('0'));
			stopSlider.setAttribute('value',8);
		} else {
			stopSlider.setAttribute('value',parseFloat(((m1+8)/2).toFixed(3)));
		}
	} else if (this.tones.length > 1) {
		var m1 = parseFloat(this.tones[idx-1].stop.value);
		var p1 = parseFloat(this.tones[idx].stop.value);
		stopSlider.setAttribute('value',parseFloat(((m1+p1)/2).toFixed(3)));
	} else {
		stopSlider.setAttribute('value',0);
	}
	var hueLabel = document.createElement('label');
	hueLabel.className = 'fixedlabel';
	hueLabel.appendChild(document.createTextNode('Hue'));
	toneRight.appendChild(hueLabel);
	toneRight.appendChild(hueSlider);
	var hueValue = document.createElement('label');
	hueValue.className = 'fixedlabel-s';
	hueValue.appendChild(document.createTextNode(hueSlider.value));
	toneRight.appendChild(hueValue);
	toneRight.appendChild(document.createElement('br'));
	var satLabel = document.createElement('label');
	satLabel.className = 'fixedlabel';
	satLabel.appendChild(document.createTextNode('Saturation'));
	toneRight.appendChild(satLabel);
	toneRight.appendChild(satSlider);
	var satValue = document.createElement('label');
	satValue.className = 'fixedlabel-s';
	satValue.appendChild(document.createTextNode(satSlider.value));
	toneRight.appendChild(satValue);
	toneRight.appendChild(document.createElement('br'));
	var stopLabel = document.createElement('label');
	stopLabel.className = 'fixedlabel';
	stopLabel.appendChild(document.createTextNode('Stop'));
	toneRight.appendChild(stopLabel);
	toneRight.appendChild(stopSlider);
	var stopValue = document.createElement('label');
	stopValue.className = 'fixedlabel-s';
	stopValue.appendChild(document.createTextNode(stopSlider.value));
	toneRight.appendChild(stopValue);
	toneRight.appendChild(document.createElement('br'));
	toneBox.appendChild(toneRight);
	if (this.tones.length === 0 || idx >= this.tones.length) {
		this.box.appendChild(toneBox);
	} else {
		this.tones[idx].box.parentNode.insertBefore(toneBox,this.tones[idx].box);
	}
	var object = {
		idx: this.tIdx,
		colBox: toneColour,
		hue: hueSlider,
		hueValue: hueValue,
		sat: satSlider,
		satValue: satValue,
		stop: stopSlider,
		stopValue: stopValue,
		box: toneBox
	};
	if (idx === 0) {
		this.tones[0] = object;
	} else if (idx >= this.tones.length) {
		this.tones.push(object);
	} else {
		this.tones.splice(idx,0,object);
	}
	// Events
	plus.onclick = function(i){ return function(){
		var idx = i[0].getIdx(i[1]);
		i[0].addTone(idx+1);
		i[0].messages.gtSetParams();
	};}([this,this.tIdx]);
	minus.onclick = function(i){ return function(){
		if (i[0].tones.length > 1) {
			var idx = i[0].getIdx(i[1]);
			i[0].tones[idx].box.parentNode.removeChild(i[0].tones[idx].box);
			i[0].tones.splice(idx,1);
			i[0].messages.gtSetParams();
		}
	};}([this,this.tIdx]);
	toneColour.onclick = function(i){ return function(){
		i[0].messages.gtTx(i[0].p,8,{tIdx: i[1]});
	};}([this,this.tIdx]);
	hueSlider.oninput = function(i){ return function(){
		var idx = i[0].getIdx(i[1]);
		if (parseInt(i[0].tones[idx].hueValue.lastChild.nodeValue) !== Math.round(i[0].tones[idx].hue.value)) {
			i[0].testToneHue(idx);
			i[0].messages.gtSetParams();
		}
	};}([this,this.tIdx]);
	satSlider.oninput = function(i){ return function(){
		var idx = i[0].getIdx(i[1]);
		if (parseFloat(i[0].tones[idx].satValue.lastChild.nodeValue) !== parseFloat(i[0].tones[idx].sat.value)) {
			i[0].testToneSat(idx);
			i[0].messages.gtSetParams();
		}
	};}([this,this.tIdx]);
	stopSlider.oninput = function(i){ return function(){
		var idx = i[0].getIdx(i[1]);
		if (parseFloat(i[0].tones[idx].stopValue.lastChild.nodeValue) !== parseFloat(i[0].tones[idx].stop.value)) {
			i[0].testToneStop(idx);
			i[0].messages.gtSetParams();
		}
	};}([this,this.tIdx]);
	//
	this.tIdx++;
};
TWKMulti.prototype.setTone = function(idx,hue,sat,stop) {
	var tone = this.tones[idx];
	tone.hue.value = parseInt(hue);
	tone.hueValue.removeChild(tone.hueValue.firstChild);
	tone.hueValue.appendChild(document.createTextNode(parseInt(hue).toString()));
	tone.sat.value = parseFloat((parseFloat(sat)/255).toFixed(3));
	tone.satValue.removeChild(tone.satValue.firstChild);
	tone.satValue.appendChild(document.createTextNode(parseFloat((parseFloat(sat)/255).toFixed(3)).toString()));
	tone.stop.value = parseFloat(stop);
	tone.stopValue.removeChild(tone.stopValue.firstChild);
	tone.stopValue.appendChild(document.createTextNode(parseFloat(stop).toString()));
};
TWKMulti.prototype.testToneHue = function(idx) {
	var tone = this.tones[idx];
	this.pHue = Math.round(tone.hue.value);
	tone.hueValue.removeChild(tone.hueValue.firstChild);
	tone.hueValue.appendChild(document.createTextNode(this.pHue.toString()));
};
TWKMulti.prototype.testToneSat = function(idx) {
	var tone = this.tones[idx];
	this.pSat = parseFloat(tone.sat.value);
	tone.satValue.removeChild(tone.satValue.firstChild);
	tone.satValue.appendChild(document.createTextNode(this.pSat.toString()));
};
TWKMulti.prototype.testToneStop = function(idx) {
	var tone = this.tones[idx];
	this.pStop = parseFloat(tone.stop.value);
	tone.stopValue.removeChild(tone.stopValue.firstChild);
	tone.stopValue.appendChild(document.createTextNode(this.pStop.toString()));
	if (idx > 0) {
		this.shuffleDown(idx-1, this.pStop);
	}
	if (idx < this.tones.length-1) {
		this.shuffleUp(idx+1, this.pStop);
	}
};
TWKMulti.prototype.shuffleDown = function(idx, val) {
	var tone = this.tones[idx];
	var old = parseFloat(tone.stop.value);
	if (old >= val) {
		val = parseFloat((val - 0.001).toFixed(3));
		tone.stop.value = val;
		tone.stopValue.removeChild(tone.stopValue.firstChild);
		tone.stopValue.appendChild(document.createTextNode(val.toString()));
		if (idx > 0) {
			this.shuffleDown(idx-1, val);
		}
	}
};
TWKMulti.prototype.shuffleUp = function(idx, val) {
	var tone = this.tones[idx];
	var old = parseFloat(tone.stop.value);
	if (old <= val) {
		val = parseFloat((val + 0.001).toFixed(3));
		tone.stop.value = val;
		tone.stopValue.removeChild(tone.stopValue.firstChild);
		tone.stopValue.appendChild(document.createTextNode((val).toString()));
		if (idx < this.tones.length-1) {
			this.shuffleUp(idx+1, val);
		}
	}
};
TWKMulti.prototype.updateTone = function() {
	var tone = this.tones[this.pIdx];
	var d = this.pCtx.getImageData(this.pHue,Math.round((1-this.pSat)*255),1,1);
	tone.colBox.style.backgroundColor = 'rgb('+d.data[0]+','+d.data[1]+','+d.data[2]+')';
	tone.hue.value = this.pHue;
	tone.hueValue.removeChild(tone.hueValue.firstChild);
	tone.hueValue.appendChild(document.createTextNode(this.pHue.toString()));
	tone.sat.value = this.pSat;
	tone.satValue.removeChild(tone.satValue.firstChild);
	tone.satValue.appendChild(document.createTextNode(this.pSat.toString()));
	this.messages.gtSetParams();
};
TWKMulti.prototype.getIdx = function(tIdx) {
	var m = this.tones.length;
	for (var j=0; j<m; j++) {
		if (this.tones[j].idx === tIdx) {
			return j;
		}
	}
};
TWKMulti.prototype.gotColSqr = function(colSqr,tIdx) {
	this.pIdx = this.getIdx(tIdx);
	this.pHue = Math.round(parseFloat((this.tones[this.pIdx].hue.value)));
	this.pSat = parseFloat(this.tones[this.pIdx].sat.value);
	var c = new Uint8Array(colSqr);
	this.pData.data.set(c);
	this.pCtx.putImageData(this.pData,0,0);
	modalBox.className = 'modalbox';
	this.pickerHolder.className = 'colourpicker';
	var d = this.pCtx.getImageData(this.pHue,255-Math.round(this.pSat*255),1,1);
	this.pRLabel.removeChild(this.pRLabel.firstChild);
	this.pRLabel.appendChild(document.createTextNode(d.data[0]));
	this.pGLabel.removeChild(this.pGLabel.firstChild);
	this.pGLabel.appendChild(document.createTextNode(d.data[1]));
	this.pBLabel.removeChild(this.pBLabel.firstChild);
	this.pBLabel.appendChild(document.createTextNode(d.data[2]));
	this.pColBox.style.backgroundColor = 'rgb('+d.data[0]+','+d.data[1]+','+d.data[2]+')';
}
TWKMulti.prototype.getHueSats = function() {
	var m = this.tones.length;
	var h = new Uint8Array(m);
	var s = new Uint8Array(m);
	for (var j=0; j<m; j++) {
		h[j] = Math.round(this.tones[j].hue.value);
		s[j] = Math.round(parseFloat(this.tones[j].sat.value) * 255);
	}
	return { hues: h, sats: s };
};
TWKMulti.prototype.updatePicker = function(cx,cy) {
	var rect = this.pCan.getBoundingClientRect();
	var x =Math.round(255*(cx - rect.left)/rect.width);
	var y = Math.round(255*(cy - rect.top)/rect.height);
	this.pHue=x;
	this.pSat=parseFloat((1-((cy - rect.top)/rect.height)).toFixed(3));
	var d = this.pCtx.getImageData(x,y,1,1);
	this.pRLabel.removeChild(this.pRLabel.firstChild);
	this.pRLabel.appendChild(document.createTextNode(d.data[0]));
	this.pGLabel.removeChild(this.pGLabel.firstChild);
	this.pGLabel.appendChild(document.createTextNode(d.data[1]));
	this.pBLabel.removeChild(this.pBLabel.firstChild);
	this.pBLabel.appendChild(document.createTextNode(d.data[2]));
	this.pColBox.style.backgroundColor = 'rgb('+d.data[0]+','+d.data[1]+','+d.data[2]+')';
};
TWKMulti.prototype.buildPicker = function() {
	this.pickerHolder = document.createElement('div');
	this.pickerHolder.className = 'colourpicker-hide';
	this.pickerBox = document.createElement('div');
	this.pickerBox.className = 'popup';
	this.pCan = document.createElement('canvas');
	this.pCan.className = 'picker-can';
	this.pCan.width = '256';
	this.pCan.height = '256';
	this.pCan.style.width = '20em';
	this.pCan.style.height = '20em';
	this.pCtx = this.pCan.getContext('2d');
	this.pData = this.pCtx.createImageData(256,256);
	this.pickerBox.appendChild(this.pCan);
	var infoBox = document.createElement('div');
	infoBox.className = 'picker-info';
	infoBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Red:')));
	infoBox.appendChild(document.createElement('br'));
	infoBox.appendChild(this.pRLabel);
	infoBox.appendChild(document.createElement('br'));
	infoBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Green:')));
	infoBox.appendChild(document.createElement('br'));
	infoBox.appendChild(this.pGLabel);
	infoBox.appendChild(document.createElement('br'));
	infoBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Blue:')));
	infoBox.appendChild(document.createElement('br'));
	infoBox.appendChild(this.pBLabel);
	infoBox.appendChild(document.createElement('br'));
	infoBox.appendChild(this.pColBox);
	this.pickerBox.appendChild(infoBox);
	this.pickerBox.appendChild(document.createElement('br'));
	this.pickerBox.appendChild(this.pOKButton);
	this.pickerBox.appendChild(this.pCancelButton);
	this.pickerHolder.appendChild(this.pickerBox);
//	document.getElementById('body').appendChild(this.pickerHolder);
	modalBox.appendChild(this.pickerHolder);
};
TWKMulti.prototype.testSat = function(i) {
	var vo = this.sat[i];
	var vn = parseFloat(this.satSliders[i].value);
	if (vo !== vn) {
		this.sat[i] = vn;
	}
	this.stopInput.value = (i-8).toString();
	this.satInput.value = this.sat[i].toString();		
};
TWKMulti.prototype.toMono = function() {
	for (var j=0; j<17; j++) {
		this.satSliders[j].value = 0;
		this.sat[j] = 0;
	}
	this.stopInput.value = '0';
	this.satInput.value = '0';
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
	var hs = new Uint8Array(p.hs);
	for (var j=0; j<17; j++) {
		this.redBars[j].style.backgroundColor = 'rgb(' + o[j*3] + ',' + o[(j*3)+1] + ',' + o[(j*3)+2]+')';
		this.greenBars[j].style.backgroundColor = 'rgb(' + o[((j+17)*3)] + ',' + o[((j+17)*3)+1] + ',' + o[((j+17)*3)+2]+')';
		this.blueBars[j].style.backgroundColor = 'rgb(' + o[((j+34)*3)] + ',' + o[((j+34)*3)+1] + ',' + o[((j+34)*3)+2]+')';
	}
	var m = this.tones.length;
	for (var j=0; j<m; j++) {
		this.tones[j].colBox.style.backgroundColor = 'rgb(' + hs[j*3] + ',' + hs[(j*3)+1] + ',' + hs[(j*3)+2]+')';
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
