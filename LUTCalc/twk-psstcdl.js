/* twk-psstcdl.js
* Primary / Secondary / Skin Tone CDL object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKPSSTCDL(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
}
TWKPSSTCDL.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;

	// Base Controls / Refinement Radio Boxes
	this.basRef = [];
	this.basRef[0] = this.createRadioElement('basRefOpt',true);
	this.basRef[1] = this.createRadioElement('basRefOpt',false);
	// Colour Channel Selector
	this.channelSelect = document.createElement('select');
	this.channelSelect.className = 'twk-select';
	this.channelList();
	// SOP Arrays
	this.cSlider = [];
	this.satSlider = [];
	this.sSlider = [];
	this.oSlider = [];
	this.pSlider = [];
	this.cInput = [];
	this.satInput = [];
	this.sInput = [];
	this.oInput = [];
	this.pInput = [];
	this.cReset = [];
	this.satReset = [];
	this.sReset = [];
	this.oReset = [];
	this.pReset = [];
	this.cAllReset = [];
	this.satAllReset = [];
	this.sAllReset = [];
	this.oAllReset = [];
	this.pAllReset = [];
	for (var j=0; j<7; j++) {
		// Colour
		this.cSlider[j] = document.createElement('input');
		this.cSlider[j].setAttribute('type','range');
		this.cSlider[j].setAttribute('min',-3.5);
		this.cSlider[j].setAttribute('max',3.5);
		this.cSlider[j].setAttribute('step',0.01);
		this.cSlider[j].setAttribute('value',0);
		this.cInput[j] = document.createElement('input');
		this.cInput[j].setAttribute('type','text');
		this.cInput[j].className = 'smallinput';
		this.cInput[j].value = '0';
		this.cReset[j] = document.createElement('input');
		this.cReset[j].setAttribute('type','button');
		this.cReset[j].className = 'smallbutton';
		this.cReset[j].setAttribute('value','Reset');
		this.cAllReset[j] = document.createElement('input');
		this.cAllReset[j].setAttribute('type','button');
		this.cAllReset[j].className = 'smallbutton';
		this.cAllReset[j].setAttribute('value','All Reset');
		// Saturation
		this.satSlider[j] = document.createElement('input');
		this.satSlider[j].setAttribute('type','range');
		this.satSlider[j].setAttribute('min',0);
		this.satSlider[j].setAttribute('max',2);
		this.satSlider[j].setAttribute('step',0.01);
		this.satSlider[j].setAttribute('value',1);
		this.satInput[j] = document.createElement('input');
		this.satInput[j].setAttribute('type','text');
		this.satInput[j].className = 'smallinput';
		this.satInput[j].value = '1';
		this.satReset[j] = document.createElement('input');
		this.satReset[j].setAttribute('type','button');
		this.satReset[j].className = 'smallbutton';
		this.satReset[j].setAttribute('value','Reset');
		this.satAllReset[j] = document.createElement('input');
		this.satAllReset[j].setAttribute('type','button');
		this.satAllReset[j].className = 'smallbutton';
		this.satAllReset[j].setAttribute('value','All Reset');
		// Slope
		this.sSlider[j] = document.createElement('input');
		this.sSlider[j].setAttribute('type','range');
		this.sSlider[j].setAttribute('min',0);
		this.sSlider[j].setAttribute('max',2);
		this.sSlider[j].setAttribute('step',0.01);
		this.sSlider[j].setAttribute('value',1);
		this.sInput[j] = document.createElement('input');
		this.sInput[j].setAttribute('type','text');
		this.sInput[j].className = 'smallinput';
		this.sInput[j].value = '1';
		this.sReset[j] = document.createElement('input');
		this.sReset[j].setAttribute('type','button');
		this.sReset[j].className = 'smallbutton';
		this.sReset[j].setAttribute('value','Reset');
		this.sAllReset[j] = document.createElement('input');
		this.sAllReset[j].setAttribute('type','button');
		this.sAllReset[j].className = 'smallbutton';
		this.sAllReset[j].setAttribute('value','All Reset');
		// Offset
		this.oSlider[j] = document.createElement('input');
		this.oSlider[j].setAttribute('type','range');
		this.oSlider[j].setAttribute('min',-0.5);
		this.oSlider[j].setAttribute('max',0.5);
		this.oSlider[j].setAttribute('step',0.01);
		this.oSlider[j].setAttribute('value',0);
		this.oInput[j] = document.createElement('input');
		this.oInput[j].setAttribute('type','text');
		this.oInput[j].className = 'smallinput';
		this.oInput[j].value = '0';
		this.oReset[j] = document.createElement('input');
		this.oReset[j].setAttribute('type','button');
		this.oReset[j].className = 'smallbutton';
		this.oReset[j].setAttribute('value','Reset');
		this.oAllReset[j] = document.createElement('input');
		this.oAllReset[j].setAttribute('type','button');
		this.oAllReset[j].className = 'smallbutton';
		this.oAllReset[j].setAttribute('value','All Reset');
		// Power
		this.pSlider[j] = document.createElement('input');
		this.pSlider[j].setAttribute('type','range');
		this.pSlider[j].setAttribute('min',0);
		this.pSlider[j].setAttribute('max',2);
		this.pSlider[j].setAttribute('step',0.01);
		this.pSlider[j].setAttribute('value',1);
		this.pInput[j] = document.createElement('input');
		this.pInput[j].setAttribute('type','text');
		this.pInput[j].className = 'smallinput';
		this.pInput[j].value = '1';
		this.pReset[j] = document.createElement('input');
		this.pReset[j].setAttribute('type','button');
		this.pReset[j].className = 'smallbutton';
		this.pReset[j].setAttribute('value','Reset');
		this.pAllReset[j] = document.createElement('input');
		this.pAllReset[j].setAttribute('type','button');
		this.pAllReset[j].className = 'smallbutton';
		this.pAllReset[j].setAttribute('value','All Reset');
	}
	// Refined Data
	this.initVals();
	// Refining Sliders
	this.rSelect = document.createElement('select');
	this.rSelect.className = 'twk-select';
	this.refineList();
	this.rSlider = [];
	this.rLock = [];
	for (var j=0; j<28; j++) {
		this.rSlider[j] = document.createElement('input');
		this.rSlider[j].setAttribute('type','range');
		this.rSlider[j].setAttribute('min',0);
		this.rSlider[j].setAttribute('max',2);
		this.rSlider[j].setAttribute('step',0.01);
		this.rSlider[j].setAttribute('value',1);
		if (j%4 === 0) {
			this.rSlider[j].className = 'twk-range-array-red';
		} else {
			this.rSlider[j].className = 'twk-range-array';
		}
		this.rLock[j] = document.createElement('input');
		this.rLock[j].setAttribute('type','checkbox');
		this.rLock[j].className = 'twk-tinycheck';
		if (j%4 === 0) {
			this.rLock[j].checked = true;
			this.rLock[j].disabled = true;
		} else {
			this.rLock[j].checked = false;
		}
	}
	this.rReset = document.createElement('input');
	this.rReset.setAttribute('type','button');
	this.rReset.className = 'smallbutton';
	this.rReset.setAttribute('value','Reset');
	// Advanced Options Checkbox
	this.advancedCheck = document.createElement('input');
	this.advancedCheck.setAttribute('type','checkbox');
	this.advancedCheck.className = 'twk-checkbox';
	this.advancedCheck.checked = false;
	// Chroma Scale Checkbox
	this.chromaScaleCheck = document.createElement('input');
	this.chromaScaleCheck.setAttribute('type','checkbox');
	this.chromaScaleCheck.className = 'twk-checkbox';
	this.chromaScaleCheck.checked = true;
	// Luma Scale Checkbox
	this.lumaScaleCheck = document.createElement('input');
	this.lumaScaleCheck.setAttribute('type','checkbox');
	this.lumaScaleCheck.className = 'twk-checkbox';
	this.lumaScaleCheck.checked = false;
}
TWKPSSTCDL.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('PSST-CDL')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Advanced Box - Holds Advanced Or Experimental Inputs
	this.advancedBox = document.createElement('div');
	this.advancedBox.className = 'twk-advanced-hide';

// Tweak - Specific UI Elements
	// Base Controls / Refinement Radio Boxes
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Base Adjustments')));
	this.box.appendChild(this.basRef[0]);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Refinements')));
	this.box.appendChild(this.basRef[1]);
	// Base Controls Box
	this.baseBox = document.createElement('div');
	this.baseBox.className = 'twk-tab';
	// Channel Selector
	this.baseBox.appendChild(this.channelSelect);
	this.baseBox.appendChild(document.createElement('br'));
	// SOP Boxes
	this.cssop = [];
	this.beforeBar1 = [];
	this.afterBar = [];
	this.beforeBar2 = [];
	for (var j=0; j<7; j++) {
		this.cssop[j] = document.createElement('div');
		if (j === this.channelSelect.options.selectedIndex) {
			this.cssop[j].className = 'twk-tab';
		} else {
			this.cssop[j].className = 'twk-tab-hide';
		}
		this.beforeBar1[j] = document.createElement('div');
		this.beforeBar1[j].className = 'twk-psst-colour-bars-s-h';
		this.cssop[j].appendChild(this.beforeBar1[j]);
		this.afterBar[j] = document.createElement('div');
		this.afterBar[j].className = 'twk-psst-colour-bars-l-h';
		this.cssop[j].appendChild(this.afterBar[j]);
		this.beforeBar2[j] = document.createElement('div');
		this.beforeBar2[j].className = 'twk-psst-colour-bars-s-h';
		this.cssop[j].appendChild(this.beforeBar2[j]);
		this.cssop[j].appendChild(document.createElement('br'));
		this.cssop[j].appendChild(document.createElement('label').appendChild(document.createTextNode('Colour')));
		this.cssop[j].appendChild(this.cSlider[j]);
		this.cssop[j].appendChild(this.cInput[j]);
		this.cssop[j].appendChild(this.cReset[j]);
		this.cssop[j].appendChild(this.cAllReset[j]);
		this.cssop[j].appendChild(document.createElement('br'));
		this.cssop[j].appendChild(document.createElement('label').appendChild(document.createTextNode('Saturation')));
		this.cssop[j].appendChild(this.satSlider[j]);
		this.cssop[j].appendChild(this.satInput[j]);
		this.cssop[j].appendChild(this.satReset[j]);
		this.cssop[j].appendChild(this.satAllReset[j]);
		this.cssop[j].appendChild(document.createElement('br'));
		this.cssop[j].appendChild(document.createElement('label').appendChild(document.createTextNode('Slope')));
		this.cssop[j].appendChild(this.sSlider[j]);
		this.cssop[j].appendChild(this.sInput[j]);
		this.cssop[j].appendChild(this.sReset[j]);
		this.cssop[j].appendChild(this.sAllReset[j]);
		this.cssop[j].appendChild(document.createElement('br'));
		this.cssop[j].appendChild(document.createElement('label').appendChild(document.createTextNode('Offset')));
		this.cssop[j].appendChild(this.oSlider[j]);
		this.cssop[j].appendChild(this.oInput[j]);
		this.cssop[j].appendChild(this.oReset[j]);
		this.cssop[j].appendChild(this.oAllReset[j]);
		this.cssop[j].appendChild(document.createElement('br'));
		this.cssop[j].appendChild(document.createElement('label').appendChild(document.createTextNode('Power')));
		this.cssop[j].appendChild(this.pSlider[j]);
		this.cssop[j].appendChild(this.pInput[j]);
		this.cssop[j].appendChild(this.pReset[j]);
		this.cssop[j].appendChild(this.pAllReset[j]);
		this.baseBox.appendChild(this.cssop[j]);
	}
	// Refinement Controls
	this.refineBox = document.createElement('div');
	this.refineBox.className = 'twk-tab-hide';
	this.refineBox.appendChild(this.rSelect);
	this.refineBox.appendChild(document.createElement('br'));
	// Coloured Background
	this.coloursBox = document.createElement('div');
	this.coloursBox.id = 'twk-psst-coloursbox';
	this.beforeBars1 = [];
	this.beforeBars2 = [];
	this.afterBars = [];
	for (var j=0; j<28; j++) {
		this.beforeBars1[j] = document.createElement('div');
		this.beforeBars1[j].className = 'twk-psst-colour-bars-s';
		this.coloursBox.appendChild(this.beforeBars1[j]);
	}
	for (var j=0; j<28; j++) {
		this.afterBars[j] = document.createElement('div');
		this.afterBars[j].className = 'twk-psst-colour-bars-l';
		this.coloursBox.appendChild(this.afterBars[j]);
	}
	for (var j=0; j<28; j++) {
		this.beforeBars2[j] = document.createElement('div');
		this.beforeBars2[j].className = 'twk-psst-colour-bars-s';
		this.coloursBox.appendChild(this.beforeBars2[j]);
	}
	this.refineBox.appendChild(this.coloursBox);
	// Array Of Sliders
	this.rSliderBox = document.createElement('div');
	this.rSliderBox.className = 'psst-rslider';
	for (var j=0; j<28; j++) {
		this.rSliderBox.appendChild(this.rSlider[j]);
	}
	this.refineBox.appendChild(this.rSliderBox);
	this.rLockBox = document.createElement('div');
	this.rLockBox.className = 'twk-tab';
	for (var j=0; j<28; j++) {
		this.rLockBox.appendChild(this.rLock[j]);
	}
	this.refineBox.appendChild(this.rLockBox);
	this.refineBox.appendChild(this.rReset);
	// Scale Chroma / Luma options
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Scale Chroma')));
	this.advancedBox.appendChild(this.chromaScaleCheck);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Scale Luma')));
	this.advancedBox.appendChild(this.lumaScaleCheck);
	// Build Box Hierarchy
	this.box.appendChild(this.baseBox);
	this.box.appendChild(this.refineBox);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Advanced Settings')));
	this.box.appendChild(this.advancedCheck);
	this.box.appendChild(this.advancedBox);
	this.holder.appendChild(this.box);
}
TWKPSSTCDL.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked && this.inputs.d[1].checked) {
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
TWKPSSTCDL.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
}
TWKPSSTCDL.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
}
TWKPSSTCDL.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doPSSTCDL = true;
		var c = new Float64Array(29);
		for (var j=0; j<29; j++) {
			c[j] = this.vals[0][j]%1;
		}
		out.c = c.buffer;
		out.sat = this.vals[1].buffer.slice(0);
		out.s = this.vals[2].buffer.slice(0);
		out.o = this.vals[3].buffer.slice(0);
		out.p = this.vals[4].buffer.slice(0);
		out.chromaScale = this.chromaScaleCheck.checked;
		out.lumaScale = this.lumaScaleCheck.checked;
	} else {
		out.doPSSTCDL = false;
	}
	params.twkPSSTCDL = out;
}
TWKPSSTCDL.prototype.setParams = function(params) {
	if (typeof params.twkPSSTCDL !== 'undefined') {
		this.toggleTweaks();
	}
}
TWKPSSTCDL.prototype.psstColours = function(p) {
	var before = new Uint8Array(p.b);
	var after = new Uint8Array(p.a);
	for (var j=0; j<28; j++) {
		this.beforeBars1[j].style.backgroundColor = 'rgb(' + before[j*3] + ',' + before[(j*3)+1] + ',' + before[(j*3)+2]+')';
		this.afterBars[j].style.backgroundColor = 'rgb(' + after[j*3] + ',' + after[(j*3)+1] + ',' + after[(j*3)+2]+')';
		this.beforeBars2[j].style.backgroundColor = 'rgb(' + before[j*3] + ',' + before[(j*3)+1] + ',' + before[(j*3)+2]+')';
		if (j%4 === 0) {
			var k = parseInt(j/4);
			this.beforeBar1[k].style.backgroundColor = 'rgb(' + before[j*3] + ',' + before[(j*3)+1] + ',' + before[(j*3)+2]+')';
			this.afterBar[k].style.backgroundColor = 'rgb(' + after[j*3] + ',' + after[(j*3)+1] + ',' + after[(j*3)+2]+')';
			this.beforeBar2[k].style.backgroundColor = 'rgb(' + before[j*3] + ',' + before[(j*3)+1] + ',' + before[(j*3)+2]+')';
		}
	}
	this.toggleTweaks();
}
TWKPSSTCDL.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doPSSTCDL = true;
	} else {
		info.doPSSTCDL = false;
	}
}
TWKPSSTCDL.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.channelSelect.onchange = function(here){ return function(){
		here.changeChannel();
	};}(this);
	for (var j=0; j<7; j++) {
		this.cSlider[j].oninput = function(i){ return function(){
			i[0].testC(i[1],true);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.cInput[j].onchange = function(i){ return function(){
			i[0].testC(i[1],false);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.cReset[j].onclick = function(i){ return function(){
			i[0].resetC(i[1]);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.cAllReset[j].onclick = function(i){ return function(){
			i[0].resetAllC();
			i[0].messages.gtSetParams();
		};}([this]);
		this.satSlider[j].oninput = function(i){ return function(){
			i[0].testSat(i[1],true);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.satInput[j].onchange = function(i){ return function(){
			i[0].testSat(i[1],false);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.satReset[j].onclick = function(i){ return function(){
			i[0].resetSat(i[1]);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.satAllReset[j].onclick = function(i){ return function(){
			i[0].resetAllSat();
			i[0].messages.gtSetParams();
		};}([this]);
		this.sSlider[j].oninput = function(i){ return function(){
			i[0].testS(i[1],true);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.sInput[j].onchange = function(i){ return function(){
			i[0].testS(i[1],false);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.sReset[j].onclick = function(i){ return function(){
			i[0].resetS(i[1]);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.sAllReset[j].onclick = function(i){ return function(){
			i[0].resetAllS();
			i[0].messages.gtSetParams();
		};}([this]);
		this.oSlider[j].oninput = function(i){ return function(){
			i[0].testO(i[1],true);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.oInput[j].onchange = function(i){ return function(){
			i[0].testO(i[1],false);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.oReset[j].onclick = function(i){ return function(){
			i[0].resetO(i[1]);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.oAllReset[j].onclick = function(i){ return function(){
			i[0].resetAllO();
			i[0].messages.gtSetParams();
		};}([this]);
		this.pSlider[j].oninput = function(i){ return function(){
			i[0].testP(i[1],true);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.pInput[j].onchange = function(i){ return function(){
			i[0].testP(i[1],false);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.pReset[j].onclick = function(i){ return function(){
			i[0].resetP(i[1]);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.pAllReset[j].onclick = function(i){ return function(){
			i[0].resetAllP();
			i[0].messages.gtSetParams();
		};}([this]);
	}
	this.basRef[0].onchange = function(here){ return function(){
		here.toggleBasRef();
	};}(this);
	this.basRef[1].onchange = function(here){ return function(){
		here.toggleBasRef();
	};}(this);
	this.rSelect.onchange = function(here){ return function(){
		here.updateRef();
	};}(this);
	for (var j=0; j<28; j++) {
		this.rSlider[j].oninput = function(i){ return function(){
			i[0].testR(i[1]);
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.rLock[j].onchange = function(i){ return function(){
			i[0].toggleLock(i[1]);
		};}([this,j]);
	}
	this.rReset.onclick = function(i){ return function(){
		i[0].resetR();
		i[0].messages.gtSetParams();
	};}([this]);
	this.advancedCheck.onclick = function(here){ return function(){
		here.toggleAdvanced();
	};}(this);
	this.chromaScaleCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.lumaScaleCheck.onclick = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
}
// Tweak-Specific Code
TWKPSSTCDL.prototype.createRadioElement = function(name, checked) {
    var radioInput;
    try {
        var radioHtml = '<input type="radio" name="' + name + '"';
        if ( checked ) {
            radioHtml += ' checked="checked"';
        }
        radioHtml += '/>';
        radioInput = document.createElement(radioHtml);
    } catch( err ) {
        radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', name);
        if ( checked ) {
            radioInput.setAttribute('checked', 'checked');
        }
    }
    return radioInput;
}
TWKPSSTCDL.prototype.initVals = function() {
	this.vals = [];
	this.locks = [];
	this.baseRings = [];
	this.baseVals = [];
	for (var j=0; j<5; j++) {
		var valRow = new Float64Array(29);
		var lockRow = [];
		for (var k=0; k<29; k++) {
			if (j === 0 || j === 3) {
				valRow[k] = 0;
			} else {
				valRow[k] = 1;
			}
			if (k%4 === 0) {
				lockRow[k] = true;
			} else {
				lockRow[k] = false;
			}
		}
		var baseRow = new Float64Array(8);
		for (var k=0; k<8; k++) {
			if (j === 0 || j === 3) {
				baseRow[k] = 0;
			} else {
				baseRow[k] = 1;
			}
		}
		this.vals[j] = valRow;
		this.locks[j] = lockRow;
		this.baseVals[j] = baseRow;
		var ring = new Ring();
  		ring.setDetails({
			title: '',
			L: baseRow.buffer,
			p: false
		});
		if (j === 0) {
			ring.mod = 1;
		}
		this.baseRings[j] = ring;
	}
}
TWKPSSTCDL.prototype.channelList = function() {
	var channels = [
		'Blue',
		'Magenta',
		'Red',
		'Skin',
		'Yellow',
		'Green',
		'Cyan'
	];
	var max = channels.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j.toString();
		option.appendChild(document.createTextNode(channels[j]));
		if (channels[j] === 'Skin') {
			option.selected = true;
		}
		this.channelSelect.appendChild(option);
	}
}
TWKPSSTCDL.prototype.changeChannel = function() {
	var chan = this.channelSelect.selectedIndex;
	for (var j=0; j<7; j++) {
		if (j === chan) {
			this.cssop[j].className = 'twk-tab';
		} else {
			this.cssop[j].className = 'twk-tab-hide';
		}
	}
}
TWKPSSTCDL.prototype.refineList = function() {
	var controls = [
		'Colour Shift',
		'Saturation',
		'Slope',
		'Offset',
		'Power'
	];
	var max = controls.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = j.toString();
		option.appendChild(document.createTextNode(controls[j]));
		if (controls[j] === 'Saturation') {
			option.selected = true;
		}
		this.rSelect.appendChild(option);
	}
}
TWKPSSTCDL.prototype.toggleBasRef = function() {
	if (this.basRef[0].checked) {
		this.baseBox.className = 'twk-tab';
		this.refineBox.className = 'twk-tab-hide';
	} else {
		this.baseBox.className = 'twk-tab-hide';
		this.refineBox.className = 'twk-tab';
	}
	this.updateRef();
}
TWKPSSTCDL.prototype.toggleLock = function(colour) {
	var control = this.rSelect.selectedIndex;
	var locks = this.locks[control];
	locks[colour] = this.rLock[colour].checked;
	if (colour === 0) {
		locks[28] = locks[0];
	}
}
TWKPSSTCDL.prototype.testR = function(colour) {
	var control = this.rSelect.selectedIndex;
	var vals = this.vals[control];
	switch(control) {
		case 0:
			vals[colour] = (parseFloat(this.rSlider[colour].value)%7) / 7;
			break;
		case 1:
		case 3:
			vals[colour] = parseFloat(this.rSlider[colour].value);
			break;
		case 2:
		case 4:
			var c1 = 2.197297305
			var c2 = -0.397418168;
			var c3 = 0.185969287;
			var c4 = -0.124947425;
			vals[colour] = (c3*Math.exp((c1*parseFloat(this.rSlider[colour].value))+c2)) + c4;
	}
	if (colour%4 === 0) {
		var baseCol = parseInt(colour/4)
		this.baseVals[control][baseCol] = vals[colour];
		switch (control) {
			case 0: this.updateC(baseCol);
				break;
			case 1: this.updateSat(baseCol);
				break;
			case 2: this.updateS(baseCol);
				break;
			case 3: this.updateO(baseCol);
				break;
			case 4: this.updateP(baseCol);
				break;
		}
	}
	if (colour === 0) {
		vals[28] = vals[0];
		this.baseVals[control][7] = vals[0];
	}
}
TWKPSSTCDL.prototype.updateR = function(control) {
	var vals = this.vals[control];
	var locks = this.locks[control];
	var ring = this.baseRings[control];
	for (var j=0; j<29; j++) {
		if (j%4 === 0 || !locks[j]) {
			vals[j] = ring.lLCub(j/28);
			if ((control === 1 || control === 4) && vals[j] < 0) {
				vals[j] = 0;
			}
		}
	}
}
TWKPSSTCDL.prototype.updateRef = function() {
	var control = this.rSelect.selectedIndex;
	var min,max,step;
	switch (control) {
		case 0: // Colour Shift
			min = -7;
			max = 7;
			break;
		case 1: // Saturation
			min = 0;
			max = 2;
			break;
		case 2: // Slope
			min = 0;
			max = 2;
			break;
		case 3: // Offset
			min = -0.5;
			max = 0.5;
			break;
		case 4:	// Power
			min = 0;
			max = 2;
			break;
	}
	var vals = this.vals[control];
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	for (var j=0; j<28; j++) {
		this.rSlider[j].setAttribute('min',min);
		this.rSlider[j].setAttribute('max',max);
		switch (control) {
			case 0:
				this.rSlider[j].value = (vals[j]*7).toFixed(2).toString();
				break;
			case 1:
			case 3:
				this.rSlider[j].value = vals[j].toFixed(2).toString();
				break;
			case 2:
			case 4:
				this.rSlider[j].value = ((Math.log((vals[j]-c4)/c3)-c2)/c1).toFixed(2).toString();
				break;
		}
		this.rLock[j].checked = this.locks[control][j];
	}
}
TWKPSSTCDL.prototype.resetR = function() {
	var control = this.rSelect.selectedIndex;
	var vals = this.vals[control];
	var locks = this.locks[control];
	for (var j=0; j<29; j++) {
		switch (control) {
			case 0:
			case 3:
				vals[j] = 0;
				break;
			case 1:
			case 2:
			case 4:
				vals[j] = 1;
				break;
		}
		if (j%4 !==0) {
			locks[j] = false;
		}
	}
	for (var j=0; j<8; j++) {
		if (j !== 7) {
			switch (control) {
				case 0:
					this.baseVals[0][j] = 0;
					this.updateC(j);
					break;
				case 1:
					this.baseVals[1][j] = 1;
					this.updateSat(j);
					break;
				case 2:
					this.baseVals[2][j] = 1;
					this.updateS(j);
					break;
				case 3:
					this.baseVals[3][j] = 0;
					this.updateO(j);
					break;
				case 4:
					this.baseVals[4][j] = 1;
					this.updateP(j);
					break;
			}
		} else {
			this.baseVals[control][7] = this.baseVals[control][0];
		}
	}
	this.updateRef();
}
TWKPSSTCDL.prototype.testC = function(chan,slider) {
	var val = this.cInput[chan];
	var sli = this.cSlider[chan];
	var c,C;
	if (slider) {
		C = parseFloat(sli.value);
	} else {
		C = parseFloat(val.value);
		if (isNaN(C)) {
			C = parseFloat(sli.value);
		}
	}
	val.value = C.toString();
	sli.value = C.toString();
	this.baseVals[0][chan] = C/7;
	if (chan === 0) {
		this.baseVals[0][7] = this.baseVals[0][0];
	}
	this.updateR(0);
}
TWKPSSTCDL.prototype.updateC = function(chan) {
	var val = this.cInput[chan];
	var sli = this.cSlider[chan];
	val.value = (this.baseVals[0][chan]*7).toString();
	sli.value = (this.baseVals[0][chan]*7).toString();
}
TWKPSSTCDL.prototype.resetC = function(chan) {
	this.cSlider[chan].value = '0';
	this.cInput[chan].value = '0';
	this.baseVals[0][chan] = 0;
	if (chan === 0) {
		this.baseVals[0][7] = 0;
	}
	this.updateR(0);
}
TWKPSSTCDL.prototype.resetAllC = function() {
	for (j=0; j<7; j++) {
		this.cSlider[j].value = '0';
		this.cInput[j].value = '0';
		this.baseVals[0][j] = 0;
	}
	this.baseVals[0][7] = 0;
	this.updateR(0);
}
TWKPSSTCDL.prototype.testSat = function(chan,slider) {
	var val = this.satInput[chan];
	var sli = this.satSlider[chan];
	var s;
	if (slider) {
		s = sli.value;
	} else {
		s = val.value;
		var S = parseFloat(s);
		if (isNaN(S)) {
			s = sli.value;
		} else if (S < 0) {
			s = '0';
		}
	}
	val.value = s;
	sli.value = s;
	this.baseVals[1][chan] = parseFloat(s);
	if (chan === 0) {
		this.baseVals[1][7] = this.baseVals[1][0];
	}
	this.updateR(1);
}
TWKPSSTCDL.prototype.updateSat = function(chan) {
	var val = this.satInput[chan];
	var sli = this.satSlider[chan];
	val.value = this.baseVals[1][chan].toString();
	sli.value = this.baseVals[1][chan].toString();
}
TWKPSSTCDL.prototype.resetSat = function(chan) {
	this.satSlider[chan].value = '1';
	this.satInput[chan].value = '1';
	this.baseVals[1][chan] = 1;
	if (chan === 0) {
		this.baseVals[1][7] = 1;
	}
	this.updateR(1);
}
TWKPSSTCDL.prototype.resetAllSat = function() {
	for (j=0; j<7; j++) {
		this.satSlider[j].value = '1';
		this.satInput[j].value = '1';
		this.baseVals[1][j] = 1;
	}
	this.baseVals[1][7] = 1;
	this.updateR(1);
}
TWKPSSTCDL.prototype.testS = function(chan,slider) {
	var val = this.sInput[chan];
	var sli = this.sSlider[chan];
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	var s,S;
	if (slider) {
		S = (c3*Math.exp((c1*parseFloat(sli.value))+c2)) + c4;
	} else {
		S = parseFloat(val.value);
		if (isNaN(S)) {
			S = (c3*Math.exp((c1*parseFloat(sli.value))+c2)) + c4;
		} else if (S < 0) {
			S = 0;
		}
	}
	val.value = S.toString();
	sli.value = ((Math.log((S-c4)/c3)-c2)/c1).toString();
	this.baseVals[2][chan] = S;
	if (chan === 0) {
		this.baseVals[2][7] = this.baseVals[2][0];
	}
	this.updateR(2);
}
TWKPSSTCDL.prototype.updateS = function(chan) {
	var val = this.sInput[chan];
	var sli = this.sSlider[chan];
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	val.value = this.baseVals[2][chan].toString();
	sli.value = ((Math.log((this.baseVals[2][chan]-c4)/c3)-c2)/c1).toString();
}
TWKPSSTCDL.prototype.resetS = function(chan) {
	this.sSlider[chan].value = '1';
	this.sInput[chan].value = '1';
	this.baseVals[2][chan] = 1;
	if (chan === 0) {
		this.baseVals[2][7] = 1;
	}
	this.updateR(2);
}
TWKPSSTCDL.prototype.resetAllS = function() {
	for (j=0; j<7; j++) {
		this.sSlider[j].value = '1';
		this.sInput[j].value = '1';
		this.baseVals[2][j] = 1;
	}
	this.baseVals[2][7] = 1;
	this.updateR(2);
}
TWKPSSTCDL.prototype.testO = function(chan,slider) {
	var val = this.oInput[chan];
	var sli = this.oSlider[chan];
	var o,O;
	if (slider) {
		O = parseFloat(sli.value);
	} else {
		O = parseFloat(val.value);
		if (isNaN(O)) {
			O = parseFloat(sli.value);
		}
	}
	val.value = O.toString();
	sli.value = O.toString();
	this.baseVals[3][chan] = O;
	if (chan === 0) {
		this.baseVals[3][7] = this.baseVals[3][0];
	}
	this.updateR(3);
}
TWKPSSTCDL.prototype.updateO = function(chan) {
	var val = this.oInput[chan];
	var sli = this.oSlider[chan];
	val.value = this.baseVals[3][chan].toString();
	sli.value = this.baseVals[3][chan].toString();
}
TWKPSSTCDL.prototype.resetO = function(chan) {
	this.oSlider[chan].value = '0';
	this.oInput[chan].value = '0';
	this.baseVals[3][chan] = 0;
	if (chan === 0) {
		this.baseVals[3][7] = 0;
	}
	this.updateR(3);
}
TWKPSSTCDL.prototype.resetAllO = function() {
	for (j=0; j<7; j++) {
		this.oSlider[j].value = '0';
		this.oInput[j].value = '0';
		this.baseVals[3][j] = 0;
	}
	this.baseVals[3][7] = 0;
	this.updateR(3);
}
TWKPSSTCDL.prototype.testP = function(chan,slider) {
	var val = this.pInput[chan];
	var sli = this.pSlider[chan];
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	var p,P;
	if (slider) {
		P = (c3*Math.exp((c1*parseFloat(sli.value))+c2)) + c4;
	} else {
		P = parseFloat(val.value);
		if (isNaN(P)) {
			P = (c3*Math.exp((c1*parseFloat(sli.value))+c2)) + c4;
		} else if (P < 0) {
			P = 0;
		}
	}
	val.value = P.toString();
	sli.value = ((Math.log((P-c4)/c3)-c2)/c1).toString();
	this.baseVals[4][chan] = P;
	if (chan === 0) {
		this.baseVals[4][7] = this.baseVals[4][0];
	}
	this.updateR(4);
}
TWKPSSTCDL.prototype.updateP = function(chan) {
	var val = this.pInput[chan];
	var sli = this.pSlider[chan];
	var c1 = 2.197297305
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	val.value = this.baseVals[4][chan].toString();
	sli.value = ((Math.log((this.baseVals[4][chan]-c4)/c3)-c2)/c1).toString();
}
TWKPSSTCDL.prototype.resetP = function(chan) {
	this.pSlider[chan].value = '1';
	this.pInput[chan].value = '1';
	this.baseVals[4][chan] = 1;
	if (chan === 0) {
		this.baseVals[4][7] = 1;
	}
	this.updateR(4);
}
TWKPSSTCDL.prototype.resetAllP = function() {
	for (j=0; j<7; j++) {
		this.pSlider[j].value = '1';
		this.pInput[j].value = '1';
		this.baseVals[4][j] = 1;
	}
	this.baseVals[4][7] = 1;
	this.updateR(4);
}
TWKPSSTCDL.prototype.toggleAdvanced = function() {
	if (this.advancedCheck.checked) {
		this.advancedBox.className = 'twk-advanced';
	} else {
		this.advancedBox.className = 'twk-advanced-hide';
	}
}
