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
	this.satSlider = document.createElement('input');
	this.satSlider.setAttribute('type','range');
	this.satSlider.setAttribute('min',0);
	this.satSlider.setAttribute('max',2);
	this.satSlider.setAttribute('step',0.05);
	this.satSlider.setAttribute('value',1);
	// Saturation Input
	this.satInput = document.createElement('input');
	this.satInput.setAttribute('type','text');
	this.satInput.className = 'smallinput';
	this.satInput.value = '1';
	// Saturation Reset Button
	this.satReset = document.createElement('input');
	this.satReset.setAttribute('type','button');
	this.satReset.className = 'smallbutton';
	this.satReset.setAttribute('value','Reset');
	// Colour Channel Selector
	this.channelSelect = document.createElement('select');
	this.channelSelect.className = 'twk-select';
	this.channelList();
	// SOP Arrays
	this.sSlider = [];
	this.oSlider = [];
	this.pSlider = [];
	this.sInput = [];
	this.oInput = [];
	this.pInput = [];
	this.sReset = [];
	this.oReset = [];
	this.pReset = [];
	this.sAllReset = [];
	this.oAllReset = [];
	this.pAllReset = [];
	for (var j=0; j<4; j++) {
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
	this.satBox = document.createElement('div');
	this.satBox.className = 'twk-tab';
	this.satBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Saturation')));
	this.satBox.appendChild(this.satSlider);
	this.satBox.appendChild(this.satInput);
	this.satBox.appendChild(this.satReset);
	this.box.appendChild(this.satBox);
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
		this.sop[j].appendChild(document.createElement('label').appendChild(document.createTextNode('Slope')));
		this.sop[j].appendChild(this.sSlider[j]);
		this.sop[j].appendChild(this.sInput[j]);
		this.sop[j].appendChild(this.sReset[j]);
		this.sop[j].appendChild(this.sAllReset[j]);
		this.sop[j].appendChild(document.createElement('br'));
		this.sop[j].appendChild(document.createElement('label').appendChild(document.createTextNode('Offset')));
		this.sop[j].appendChild(this.oSlider[j]);
		this.sop[j].appendChild(this.oInput[j]);
		this.sop[j].appendChild(this.oReset[j]);
		this.sop[j].appendChild(this.oAllReset[j]);
		this.sop[j].appendChild(document.createElement('br'));
		this.sop[j].appendChild(document.createElement('label').appendChild(document.createTextNode('Power')));
		this.sop[j].appendChild(this.pSlider[j]);
		this.sop[j].appendChild(this.pInput[j]);
		this.sop[j].appendChild(this.pReset[j]);
		this.sop[j].appendChild(this.pAllReset[j]);
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
			this.satBox.className = 'twk-tab';
		} else {
			this.satBox.className = 'twk-tab-hide';
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
			cdl[ j ] = parseFloat(this.sInput[j+1].value);
			cdl[j+3] = parseFloat(this.oInput[j+1].value);
			cdl[j+6] = parseFloat(this.pInput[j+1].value);
		}
		cdl[9] = parseFloat(this.satInput.value);
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
			cdl[ j ] = parseFloat(this.sInput[j+1].value);
			cdl[j+3] = parseFloat(this.oInput[j+1].value);
			cdl[j+6] = parseFloat(this.pInput[j+1].value);
		}
		cdl[9] = parseFloat(this.satInput.value);
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
		cdl[ j ] = parseFloat(this.sInput[j+1].value);
		cdl[j+3] = parseFloat(this.oInput[j+1].value);
		cdl[j+6] = parseFloat(this.pInput[j+1].value);
	}
	cdl[9] = parseFloat(this.satInput.value);
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
			for (var j=0; j<3; j++) {
				this.sInput[j+1].value = cdl[ j ].toString();
				this.oInput[j+1].value = cdl[j+3].toString();
				this.pInput[j+1].value = cdl[j+6].toString();
			}
			this.satInput.value = cdl[9].toString();
			this.testSat(false);
			for (var j=1; j<4; j++) {
				this.testS(j,false);
				this.testO(j,false);
				this.testP(j,false);
			}
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
	} else {
		info.doASCCDL = false;
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
	this.satSlider.oninput = function(here){ return function(){
		here.testSat(true);
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.satInput.onchange = function(here){ return function(){
		here.testSat(false);
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.satReset.onclick = function(here){ return function(){
		here.resetSat();
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	for (var j=0; j<4; j++) {
		this.sSlider[j].oninput = function(i){ return function(){
			i[0].testS(i[1],true);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.sInput[j].onchange = function(i){ return function(){
			i[0].testS(i[1],false);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.sReset[j].onclick = function(i){ return function(){
			i[0].resetS(i[1]);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.sAllReset[j].onclick = function(here){ return function(){
			here.resetAllS();
			here.messages.gaSetParams();
			here.messages.gtSetParams();
		};}(this);
		this.oSlider[j].oninput = function(i){ return function(){
			i[0].testO(i[1],true);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.oInput[j].onchange = function(i){ return function(){
			i[0].testO(i[1],false);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.oReset[j].onclick = function(i){ return function(){
			i[0].resetO(i[1]);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.oAllReset[j].onclick = function(here){ return function(){
			here.resetAllO();
			here.messages.gaSetParams();
			here.messages.gtSetParams();
		};}(this);
		this.pSlider[j].oninput = function(i){ return function(){
			i[0].testP(i[1],true);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.pInput[j].onchange = function(i){ return function(){
			i[0].testP(i[1],false);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.pReset[j].onclick = function(i){ return function(){
			i[0].resetP(i[1]);
			i[0].messages.gaSetParams();
			i[0].messages.gtSetParams();
		};}([this,j]);
		this.pAllReset[j].onclick = function(here){ return function(){
			here.resetAllP();
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
TWKASCCDL.prototype.testSat = function(slider) {
	var s;
	if (slider) {
		s = this.satSlider.value;
	} else {
		s = this.satInput.value;
		var S = parseFloat(s);
		if (isNaN(S)) {
			s = this.satSlider.value;
		} else if (S < 0) {
			s = '0';
		}
	}
	this.satInput.value = s;
	this.satSlider.value = s;
};
TWKASCCDL.prototype.resetSat = function() {
	this.satSlider.value = '1';
	this.satInput.value = '1';
};
TWKASCCDL.prototype.testS = function(chan,slider) {
	var val = this.sInput[chan];
	var sli = this.sSlider[chan];
	var c1 = 2.197297305;
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	var s,S;
	if (chan === 0){
		if (slider) {
			S = (c3*Math.exp((c1*parseFloat(sli.value))+c2)) + c4;
		} else {
			S = parseFloat(val.value);
		} if (isNaN(S)) {
			S = (c3*Math.exp((c1*parseFloat(sli.value))+c2)) + c4;
		} else if (S < 0) {
			S = 0;
		}
		val.value = S.toString();
		sli.value = ((Math.log((S-c4)/c3)-c2)/c1).toString();
		var a = 0;
		for (var j=1; j<4; j++) {
			a += parseFloat(this.sInput[j].value);
		}
		var offset = S - (a/3);
		var sVal;
		for (var j=1; j<4; j++) {
			sVal = parseFloat(this.sInput[j].value) + offset;
			if (sVal < 0) {
				sVal = 0;
			}
			this.sInput[j].value = sVal.toString();
			this.sSlider[j].value = ((Math.log((sVal-c4)/c3)-c2)/c1).toString();
		}
	} else {
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
	}
	var a = 0;
	for (var j=1; j<4; j++) {
		a += parseFloat(this.sInput[j].value);
	}
	a = a/3;
	this.sInput[0].value = a.toString();
	this.sSlider[0].value = ((Math.log((a-c4)/c3)-c2)/c1).toString();
};
TWKASCCDL.prototype.resetS = function(colour) {
	this.sSlider[colour].value = '1';
	this.sInput[colour].value = '1';
	this.testS(colour,false);
};
TWKASCCDL.prototype.resetAllS = function() {
	for (var j=0; j<4; j++) {
		this.sSlider[j].value = '1';
		this.sInput[j].value = '1';
	}
};
TWKASCCDL.prototype.testO = function(chan,slider) {
	var val = this.oInput[chan];
	var sli = this.oSlider[chan];
	var o,O;
	if (chan === 0){
		if (slider) {
			O = parseFloat(sli.value);
		} else {
			O = parseFloat(val.value);
		}
		if (isNaN(O)) {
			O = parseFloat(sli.value);
		}
		val.value = O.toString();
		sli.value = O.toString();
		var a = 0;
		for (var j=1; j<4; j++) {
			a += parseFloat(this.oInput[j].value);
		}
		var offset = O - (a/3);
		var oVal;
		for (var j=1; j<4; j++) {
			oVal = parseFloat(this.oInput[j].value) + offset;
			this.oInput[j].value = oVal.toString();
			this.oSlider[j].value = oVal.toString();
		}
	} else {
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
	}
	var a = 0;
	for (var j=1; j<4; j++) {
		a += parseFloat(this.oInput[j].value);
	}
	a = a/3;
	this.oInput[0].value = a.toString();
	this.oSlider[0].value = a.toString();
};
TWKASCCDL.prototype.resetO = function(colour) {
	this.oSlider[colour].value = '0';
	this.oInput[colour].value = '0';
	this.testO(colour,false);
};
TWKASCCDL.prototype.resetAllO = function() {
	for (var j=0; j<4; j++) {
		this.oSlider[j].value = '0';
		this.oInput[j].value = '0';
	}
};
TWKASCCDL.prototype.testP = function(chan,slider) {
	var val = this.pInput[chan];
	var sli = this.pSlider[chan];
	var c1 = 2.197297305;
	var c2 = -0.397418168;
	var c3 = 0.185969287;
	var c4 = -0.124947425;
	var p,P;
	if (chan === 0){
		if (slider) {
			P = (c3*Math.exp((c1*parseFloat(sli.value))+c2)) + c4;
		} else {
			P = parseFloat(val.value);
		} if (isNaN(P)) {
			P = (c3*Math.exp((c1*parseFloat(sli.value))+c2)) + c4;
		} else if (P < 0) {
			P = 0;
		}
		val.value = P.toString();
		sli.value = ((Math.log((P-c4)/c3)-c2)/c1).toString();
		var a = 0;
		for (var j=1; j<4; j++) {
			a += parseFloat(this.pInput[j].value);
		}
		var offset = P - (a/3);
		var pVal;
		for (var j=1; j<4; j++) {
			pVal = parseFloat(this.pInput[j].value) + offset;
			if (pVal < 0) {
				pVal = 0;
			}
			this.pInput[j].value = pVal.toString();
			this.pSlider[j].value = ((Math.log((pVal-c4)/c3)-c2)/c1).toString();
		}
	} else {
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
	}
	var a = 0;
	for (var j=1; j<4; j++) {
		a += parseFloat(this.pInput[j].value);
	}
	a = a/3;
	this.pInput[0].value = a.toString();
	this.pSlider[0].value = ((Math.log((a-c4)/c3)-c2)/c1).toString();
};
TWKASCCDL.prototype.resetP = function(colour) {
	this.pSlider[colour].value = '1';
	this.pInput[colour].value = '1';
	this.testP(colour,false);
};
TWKASCCDL.prototype.resetAllP = function() {
	for (var j=0; j<4; j++) {
		this.pSlider[j].value = '1';
		this.pInput[j].value = '1';
	}
};
