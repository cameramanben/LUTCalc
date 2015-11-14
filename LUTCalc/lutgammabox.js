/* lutgammabox.js
* Transfer curve and colour space conversion (Gamma and Gamut) options UI object for the LUTCalc Web App.
* 9th January 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTGammaBox(fieldset,inputs,messages) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.messages = messages;
	this.p = 2;
	this.messages.addUI(this.p,this);
	this.gamutPass = 0;
	this.gamutLA = 0;
	this.build();
	fieldset.appendChild(this.box);
	lutcalcReady(this.p);
}
LUTGammaBox.prototype.build = function() {
	this.io();
	this.ui();
};
LUTGammaBox.prototype.io = function() {
	this.inGammaOpts = [];
	this.inputs.addInput('inGammaOpts',this.inGammaOpts);
	this.inLinGammaOpts = [];
	this.inputs.addInput('inLinGammaOpts',this.inLinGammaOpts);
	this.outGammaOpts = [];
	this.inputs.addInput('outGammaOpts',this.outGammaOpts);
	this.outLinGammaOpts = [];
	this.inputs.addInput('outLinGammaOpts',this.outLinGammaOpts);
	this.inGammaSubOpts = [];
	this.inputs.addInput('inGammaSubOpts',this.inGammaSubOpts);
	this.outGammaSubOpts = [];
	this.inputs.addInput('outGammaSubOpts',this.outGammaSubOpts);
	this.inGamutOpts = [];
	this.inputs.addInput('inGamutOpts',this.inGamutOpts);
	this.outGamutOpts = [];
	this.inputs.addInput('outGamutOpts',this.outGamutOpts);
	this.inGamutSubOpts = [];
	this.inputs.addInput('inGamutSubOpts',this.inGamutSubOpts);
	this.outGamutSubOpts = [];
	this.inputs.addInput('outGamutSubOpts',this.outGamutSubOpts);
	this.inGammaSubs = document.createElement('select');
	this.inputs.addInput('inGammaSubs',this.inGammaSubs);
	this.inGammaSelect = document.createElement('select');
	this.inputs.addInput('inGamma',this.inGammaSelect);
	this.inLinSelect = document.createElement('select');
	this.inputs.addInput('inLinGamma',this.inLinSelect);
	this.inGamutSubs = document.createElement('select');
	this.inputs.addInput('inGamutSubs',this.inGamutSubs);
	this.inGamutSelect = document.createElement('select');
	this.inputs.addInput('inGamut',this.inGamutSelect);
	this.outGammaSubs = document.createElement('select');
	this.inputs.addInput('outGammaSubs',this.outGammaSubs);
	this.outGammaSelect = document.createElement('select');
	this.inputs.addInput('outGamma',this.outGammaSelect);
	this.outLinSelect = document.createElement('select');
	this.inputs.addInput('outLinGamma',this.outLinSelect);
	this.outGamutSubs = document.createElement('select');
	this.inputs.addInput('outGamutSubs',this.outGamutSubs);
	this.outGamutSelect = document.createElement('select');
	this.inputs.addInput('outGamut',this.outGamutSelect);
};
LUTGammaBox.prototype.ui = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Rec Gamma')));
	this.box.appendChild(this.inGammaSubs);
	this.box.appendChild(this.inGammaSelect);
	this.box.appendChild(document.createElement('br'));
	this.inLin = document.createElement('div');
	this.inLin.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	this.inLin.appendChild(this.inLinSelect);
	this.box.appendChild(this.inLin);
	this.inGamutBox = document.createElement('div');
	this.inGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Rec Gamut')));
	this.inGamutBox.appendChild(this.inGamutSubs);
	this.inGamutBox.appendChild(this.inGamutSelect);
	this.box.appendChild(this.inGamutBox);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Out Gamma')));
	this.box.appendChild(this.outGammaSubs);
	this.box.appendChild(this.outGammaSelect);
	this.box.appendChild(document.createElement('br'));
	this.outLin = document.createElement('div');
	this.outLin.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	this.outLin.appendChild(this.outLinSelect);
	this.box.appendChild(this.outLin);
	this.outGamutBox = document.createElement('div');
	this.outGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Out Gamut')));
	this.outGamutBox.appendChild(this.outGamutSubs);
	this.outGamutBox.appendChild(this.outGamutSelect);
	this.box.appendChild(this.outGamutBox);
	this.inLin.style.display = 'none';
	this.inGamutBox.style.display = 'none';
	this.outLin.style.display = 'none';
	this.outGamutBox.style.display = 'none';
};
LUTGammaBox.prototype.events = function() {
	this.inGammaSubs.onchange = function(here){ return function(){
		here.updateGammaInList(true);
	};}(this);
	this.inGamutSubs.onchange = function(here){ return function(){
		here.updateGamutInList(true);
	};}(this);
	this.inGammaSelect.onchange = function(here){ return function(){
		here.changeGammaIn();
		here.messages.gaSetParams();
	};}(this);
	this.inLinSelect.onchange = function(here){ return function(){
		here.changeGammaIn();
		here.messages.gaSetParams();
	};}(this);
	this.outGammaSubs.onchange = function(here){ return function(){
		here.updateGammaOutList();
	};}(this);
	this.outGamutSubs.onchange = function(here){ return function(){
		here.updateGamutOutList();
	};}(this);
	this.outGammaSelect.onchange = function(here){ return function(){
		here.changeGammaOut();
		here.messages.gaSetParams();
	};}(this);
	this.outLinSelect.onchange = function(here){ return function(){
		here.changeGammaOut();
		here.messages.gaSetParams();
	};}(this);
	this.inGamutSelect.onchange = function(here){ return function(){
		here.changeInGamut();
		here.messages.gtSetParams();
	};}(this);
	this.outGamutSelect.onchange = function(here){ return function(){
		here.changeOutGamut();
		here.messages.gtSetParams();
	};}(this);
};
// Set Up Data
LUTGammaBox.prototype.gotGammaLists = function() {
	var inList = this.inputs.gammaInList;
	var outList = this.inputs.gammaOutList;
	var linList = this.inputs.gammaLinList;
	var subNames = this.inputs.gammaSubNames;
	this.inGammaSubs.length = 0;
	this.inGammaSelect.length = 0;
	this.outGammaSubs.length = 0;
	this.outGammaSelect.length = 0;
	this.inLinSelect.length = 0;
	this.outLinSelect.length = 0;
	var max = inList.length;
	for (var i=0; i < max; i++) {
		this.inGammaOpts[i] = document.createElement('option');
		if (inList[i].name === this.inputs.defGammaIn) {
			this.inGammaOpts[i].selected = true;
		}
		this.inGammaOpts[i].value = inList[i].idx;
		this.inGammaOpts[i].appendChild(document.createTextNode(inList[i].name));
		this.inGammaSelect.appendChild(this.inGammaOpts[i]);
	}
	max = outList.length;
	for (var i=0; i < max; i++) {
		this.outGammaOpts[i] = document.createElement('option');
		this.outGammaOpts[i].value = outList[i].idx;
		this.outGammaOpts[i].appendChild(document.createTextNode(outList[i].name));
		this.outGammaSelect.appendChild(this.outGammaOpts[i]);
	}
	max = linList.length;
	for (var i=0; i < max; i++) {
		this.inLinGammaOpts[i] = document.createElement('option');
		this.inLinGammaOpts[i].value = linList[i].idx;
		this.inLinGammaOpts[i].appendChild(document.createTextNode(linList[i].name));
		this.inLinSelect.appendChild(this.inLinGammaOpts[i]);
		this.outLinGammaOpts[i] = document.createElement('option');
		this.outLinGammaOpts[i].value = linList[i].idx;
		this.outLinGammaOpts[i].appendChild(document.createTextNode(linList[i].name));
		this.outLinSelect.appendChild(this.outLinGammaOpts[i]);
	}
	max = subNames.length;
	for (var i=0; i < max; i++) {
		this.inGammaSubOpts[i] = document.createElement('option');
		this.inGammaSubOpts[i].value = i;
		this.inGammaSubOpts[i].appendChild(document.createTextNode(subNames[i]));
		this.inGammaSubs.appendChild(this.inGammaSubOpts[i]);
		this.outGammaSubOpts[i] = document.createElement('option');
		this.outGammaSubOpts[i].value = i;
		this.outGammaSubOpts[i].appendChild(document.createTextNode(subNames[i]));
		if (subNames[i] === 'All') {
			this.outGammaSubOpts[i].selected = true;
		}
		this.outGammaSubs.appendChild(this.outGammaSubOpts[i]);
	}
	this.updateGammaInList();
	this.updateGammaOutList();
};
LUTGammaBox.prototype.gotGamutLists = function(pass,LA) {
	var inList = this.inputs.gamutInList;
	var outList = this.inputs.gamutOutList;
	var subNames = this.inputs.gamutSubNames;
	var inSubs = this.inputs.gamutInSubLists;
	var outSubs = this.inputs.gamutOutSubLists;
	max = inList.length;
	for (var i=0; i < max; i++) {
		this.inGamutOpts[i] = document.createElement('option');
		this.inGamutOpts[i].value = inList[i].idx;
		if (inList[i].name === 'Custom In') {
			this.inputs.addInput('custGamInIdx',i);
			inList[i].name = 'Custom';
		}
		this.inGamutOpts[i].appendChild(document.createTextNode(inList[i].name));
		if (inList[i].name === this.inputs.defGamutIn) {
			this.inGamutOpts[i].selected = true;
		}
		this.inGamutSelect.appendChild(this.inGamutOpts[i]);
	}
	max = outList.length;
	for (var i=0; i < max; i++) {
		this.outGamutOpts[i] = document.createElement('option');
		this.outGamutOpts[i].value = outList[i].idx;
		if (outList[i].name === 'Custom Out') {
			this.inputs.addInput('custGamOutIdx',i);
			outList[i].name = 'Custom';
		}
		this.outGamutOpts[i].appendChild(document.createTextNode(outList[i].name));
		this.outGamutSelect.appendChild(this.outGamutOpts[i]);
	}
	this.gamutPass = pass;
	this.gamutLA = LA;
	max = subNames.length;
	for (var i=0; i < max; i++) {
		this.inGamutSubOpts[i] = document.createElement('option');
		this.inGamutSubOpts[i].value = i;
		this.inGamutSubOpts[i].appendChild(document.createTextNode(subNames[i]));
		this.inGamutSubs.appendChild(this.inGamutSubOpts[i]);
		this.outGamutSubOpts[i] = document.createElement('option');
		this.outGamutSubOpts[i].value = i;
		this.outGamutSubOpts[i].appendChild(document.createTextNode(subNames[i]));
		if (subNames[i] === 'All') {
			this.outGamutSubOpts[i].selected = true;
		}
		this.outGamutSubs.appendChild(this.outGamutSubOpts[i]);
	}
	
	this.updateGamutInList();
	this.updateGamutOutList();
};
LUTGammaBox.prototype.defaultGam = function() {
	var max = this.inGammaSelect.options.length;
	var defGamma = this.inputs.defGammaIn;
	for (var i = 0; i < max; i++) {
		if (defGamma === this.inGammaSelect.options[i].lastChild.nodeValue) {
			this.inGammaSelect.options[i].selected = true;
			break;
		}
	}
	this.changeGammaIn();
	max = this.inGamutSelect.options.length;
	var defGamut = this.inputs.defGamutIn;
	for (var i = 0; i < max; i++) {
		if (defGamut === this.inGamutSelect.options[i].lastChild.nodeValue) {
			this.inGamutSelect.options[i].selected = true;
			break;
		}
	}
	this.updateGammaInList(false);
	this.updateGamutInList(false);
};
// Event Responses
LUTGammaBox.prototype.changeGammaIn = function() {
	if (this.inGammaSelect.options[this.inGammaSelect.options.selectedIndex].value === '9999') {
		this.inLin.style.display = 'block';
	} else {
		this.inLin.style.display = 'none';
	}
};
LUTGammaBox.prototype.changeGammaOut = function() {
	if (this.outGammaSelect.options[this.outGammaSelect.options.selectedIndex].value == '9999') {
		this.outLin.style.display = 'block';
	} else {
		this.outLin.style.display = 'none';
	}
	this.messages.checkFormat();
};
LUTGammaBox.prototype.clearSelect = function(sel) {
	var m = sel.options.length;
	for (var j=0; j<m; j++) {
		sel.remove(0);
	}
};
LUTGammaBox.prototype.updateGammaInList = function(setParams) {
	var sub = parseInt(this.inGammaSubs.options[this.inGammaSubs.selectedIndex].value);
	var showList = this.inputs.gammaSubLists[sub];
	var m = this.inGammaOpts.length;
	var m2 = showList.length;
	var val;
	var cur = parseInt(this.inGammaSelect.options[this.inGammaSelect.selectedIndex].value);
	var curOK = false;
	var linIdx = 0;
	var showLA = false;
	if (this.inGammaSelect.options[this.inGammaSelect.length - 1].lastChild.nodeValue.slice(0,4) === 'LA -') {
		showLA = this.inGammaSelect.options[this.inGammaSelect.length - 1];
	}
	this.clearSelect(this.inGammaSelect);
	for (var j=0; j<m; j++) {
		val = parseInt(this.inGammaOpts[j].value);
		for (var k=0; k<m2; k++) {
			if (val === showList[k] || val === 9999) {
				this.inGammaSelect.appendChild(this.inGammaOpts[j]);
				if (val === cur) {
					curOK = this.inGammaSelect.options.length-1;
				}
				if (val = 9999) {
					linIdx = this.inGammaSelect.length;
				}
				break;
			}
		}
	}
	if (showLA) {
		this.inGammaSelect.appendChild(showLA);
	}
	if (curOK) {
		this.inGammaSelect.options[curOK].selected = true;
	} else {
		this.inGammaSelect.options[0].selected = true;
		this.changeGammaIn();
		this.messages.gaSetParams();
	}
};
LUTGammaBox.prototype.updateGammaOutList = function() {
	var sub = parseInt(this.outGammaSubs.options[this.outGammaSubs.selectedIndex].value);
	var showList = this.inputs.gammaSubLists[sub];
	var m = this.outGammaOpts.length;
	var m2 = showList.length;
	var val;
	var cur = parseInt(this.outGammaSelect.options[this.outGammaSelect.selectedIndex].value);
	var curOK = false;
	var showLA = false;
	if (this.outGammaSelect.options[this.outGammaSelect.length - 1].lastChild.nodeValue.slice(0,4) === 'LA -') {
		showLA = this.outGammaSelect.options[this.outGammaSelect.length - 1];
	}
	this.clearSelect(this.outGammaSelect);
	for (var j=0; j<m; j++) {
		val = parseInt(this.outGammaOpts[j].value);
		for (var k=0; k<m2; k++) {
			if (val === showList[k] || val === 9999) {
				this.outGammaSelect.appendChild(this.outGammaOpts[j]);
				if (val === cur) {
					curOK = this.outGammaSelect.options.length-1;
				}
				break;
			}
		}
	}
	if (showLA) {
		this.outGammaSelect.appendChild(showLA);
	}
	if (curOK) {
		this.outGammaSelect.options[curOK].selected = true;
	} else {
		this.outGammaSelect.options[0].selected = true;
		this.changeGammaOut();
		this.messages.gaSetParams();
	}
};
LUTGammaBox.prototype.updateGamutInList = function(setParams) {
	var sub = parseInt(this.inGamutSubs.options[this.inGamutSubs.selectedIndex].value);
	var showList = this.inputs.gamutInSubLists[sub];
	var m = this.inGamutOpts.length;
	var m2 = showList.length;
	var val;
	var cur = parseInt(this.inGamutSelect.options[this.inGamutSelect.selectedIndex].value);
	var curOK = false;
	this.clearSelect(this.inGamutSelect);
	for (var j=0; j<m; j++) {
		val = parseInt(this.inGamutOpts[j].value);
		for (var k=0; k<m2; k++) {
			if (val === showList[k] || val === 9999) {
				this.inGamutSelect.appendChild(this.inGamutOpts[j]);
				if (val === cur) {
					curOK = this.inGamutSelect.options.length-1;
				}
				break;
			}
		}
	}
	if (curOK) {
		this.inGamutSelect.options[curOK].selected = true;
	} else {
		this.inGamutSelect.options[0].selected = true;
		this.changeInGamut();
		if (setParams) {
			this.messages.gtSetParams();
		}
	}
};
LUTGammaBox.prototype.updateGamutOutList = function() {
	var sub = parseInt(this.outGamutSubs.options[this.outGamutSubs.selectedIndex].value);
	var showList = this.inputs.gamutOutSubLists[sub];
	var m = this.outGamutOpts.length;
	var m2 = showList.length;
	var val;
	var cur = parseInt(this.outGamutSelect.options[this.outGamutSelect.selectedIndex].value);
	var curOK = false;
	var showLA = false;
	if (this.outGamutSelect.options[this.outGamutSelect.length - 1].lastChild.nodeValue.slice(0,4) === 'LA -') {
		showLA = this.outGamutSelect.options[this.outGamutSelect.length - 1];
	}
	this.clearSelect(this.outGamutSelect);
	for (var j=0; j<m; j++) {
		val = parseInt(this.outGamutOpts[j].value);
		for (var k=0; k<m2; k++) {
			if (val === showList[k] || val === 9999) {
				this.outGamutSelect.appendChild(this.outGamutOpts[j]);
				if (val === cur) {
					curOK = this.outGamutSelect.options.length-1;
				}
				break;
			}
		}
	}
	if (showLA) {
		this.outGamutSelect.appendChild(showLA);
	}
	if (curOK) {
		this.outGamutSelect.options[curOK].selected = true;
	} else {
		this.outGamutSelect.options[0].selected = true;
		this.changeOutGamut();
		this.messages.gtSetParams();
	}
};
LUTGammaBox.prototype.changeInGamut = function() {
	if (this.inGamutSelect.options[this.inGamutSelect.options.length - 1].selected) {
		var max = this.outGamutSelect.options.length;
		for (var i=0; i<max; i++) {
			if (parseInt(this.outGamutSelect.options[i].value) === this.gamutPass) {
				this.outGamutSelect.options[i].selected = true;
				break;
			}
		}
	} else if (parseInt(this.outGamutSelect.options[this.outGamutSelect.options.selectedIndex].value) === this.gamutPass) {
		this.outGamutSelect.options[0].selected = true;
	}
	this.messages.changeGamut();
};
LUTGammaBox.prototype.changeOutGamut = function() {
	if (parseInt(this.outGamutSelect.options[this.outGamutSelect.options.selectedIndex].value) === this.gamutPass) {
		this.inGamutSelect.options[this.inGamutSelect.options.length - 1].selected = true;
	} else if (this.inGamutSelect.options[this.inGamutSelect.options.length - 1].selected) {
		var max = this.inGamutSelect.options.length;
		var defGamut = this.inputs.defGamutIn;
		for (var i = 0; i < max; i++) {
			if (defGamut === this.inGamutSelect.options[i].lastChild.nodeValue) {
				this.inGamutSelect.options[i].selected = true;
				break;
			}
		}
	}
	this.messages.changeGamut();
};
LUTGammaBox.prototype.oneOrThree = function() {
	if (this.inputs.d[0].checked) {
		this.inGamutBox.style.display = 'none';
		this.outGamutBox.style.display = 'none';
	} else {
		this.inGamutBox.style.display = 'block';
		this.outGamutBox.style.display = 'block';
	}
	if (typeof this.inGammaSelect.options[this.inGammaSelect.options.selectedIndex] !== 'undefined') {
		this.changeGammaIn();
	}
};
LUTGammaBox.prototype.getInfo = function(info) {
	if (this.inGammaSelect.options[this.inGammaSelect.selectedIndex].value !== '9999') {
		info.inGammaName = this.inGammaSelect.options[this.inGammaSelect.selectedIndex].lastChild.nodeValue;
	} else {
		info.inGammaName = this.inLinSelect.options[this.inLinSelect.selectedIndex].lastChild.nodeValue;
	}
	if (this.outGammaSelect.options[this.outGammaSelect.selectedIndex].value !== '9999') {
		info.outGammaName = this.outGammaSelect.options[this.outGammaSelect.selectedIndex].lastChild.nodeValue;
	} else {
		info.outGammaName = this.outLinSelect.options[this.outLinSelect.selectedIndex].lastChild.nodeValue;
	}
	if (this.outGammaSelect.options[this.outGammaSelect.selectedIndex].lastChild.nodeValue === 'Null') {
		info.nul = true;
	} else {
		info.nul = false;
	}
	info.inGamutName = this.inGamutSelect.options[this.inGamutSelect.selectedIndex].lastChild.nodeValue;
	info.outGamutName = this.outGamutSelect.options[this.outGamutSelect.selectedIndex].lastChild.nodeValue;
};
LUTGammaBox.prototype.getSettings = function(data) {
	var inLin, outLin;
	var inLinHyphen = this.inLinSelect.options[this.inLinSelect.options.selectedIndex].lastChild.nodeValue.indexOf('-');
	if (inLinHyphen > 0) {
		inLin = this.inLinSelect.options[this.inLinSelect.options.selectedIndex].lastChild.nodeValue.substring(0, inLinHyphen - 1);
	} else {
		inLin = this.inLinSelect.options[this.inLinSelect.options.selectedIndex].lastChild.nodeValue;
	}
	var outLinHyphen = this.outLinSelect.options[this.outLinSelect.options.selectedIndex].lastChild.nodeValue.indexOf('-');
	if (outLinHyphen > 0) {
		outLin = this.outLinSelect.options[this.outLinSelect.options.selectedIndex].lastChild.nodeValue.substring(0, outLinHyphen - 1);
	} else {
		outLin = this.outLinSelect.options[this.outLinSelect.options.selectedIndex].lastChild.nodeValue;
	}
	data.gammaBox = {
		recGamma: this.inGammaSelect.options[this.inGammaSelect.options.selectedIndex].lastChild.nodeValue,
		recLinGamma: inLin,
		recGamut: this.inGamutSelect.options[this.inGamutSelect.options.selectedIndex].lastChild.nodeValue,
		outGamma: this.outGammaSelect.options[this.outGammaSelect.options.selectedIndex].lastChild.nodeValue,
		outLinGamma: outLin,
		outGamut: this.outGamutSelect.options[this.outGamutSelect.options.selectedIndex].lastChild.nodeValue
	};
};
LUTGammaBox.prototype.setSettings = function(settings) {
	if (typeof settings.gammaBox !== 'undefined') {
		var data = settings.gammaBox;
		if (typeof data.recGamma !== 'undefined') {
			var m = this.inGammaSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.inGammaSelect.options[j].lastChild.nodeValue === data.recGamma) {
					this.inGammaSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.recLinGamma !== 'undefined') {
			var m = this.inLinSelect.options.length;
			var inLinLen = data.recLinGamma.length;
			for (var j=0; j<m; j++) {
				if (this.inLinSelect.options[j].lastChild.nodeValue.substring(0, inLinLen) === data.recLinGamma) {
					this.inLinSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.recGamut !== 'undefined') {
			var m = this.inGamutSelect.options.length;
			for (var j=0; j<m; j++) {
				if (
					this.inGamutSelect.options[j].lastChild.nodeValue === data.recGamut ||
					(this.inGamutSelect.options[j].lastChild.nodeValue.substring(0,6) === 'Custom' && data.recGamut.substring(0,6) === 'Custom')
				) {
					this.inGamutSelect.options[j].selected = true;
					break;
				}
			}
			this.changeInGamut();
		}
		if (typeof data.outGamma !== 'undefined') {
			var m = this.outGammaSelect.options.length;
			for (var j=0; j<m; j++) {
				if (this.outGammaSelect.options[j].lastChild.nodeValue === data.outGamma) {
					this.outGammaSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.outLinGamma !== 'undefined') {
			var m = this.outLinSelect.options.length;
			var outLinLen = data.outLinGamma.length;
			for (var j=0; j<m; j++) {
				if (this.outLinSelect.options[j].lastChild.nodeValue.substring(0, outLinLen) === data.outLinGamma) {
					this.outLinSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.outGamut !== 'undefined') {
			var m = this.outGamutSelect.options.length;
			for (var j=0; j<m; j++) {
				if (
					this.outGamutSelect.options[j].lastChild.nodeValue === data.outGamut ||
					(this.outGamutSelect.options[j].lastChild.nodeValue.substring(0,6) === 'Custom' && data.outGamut.substring(0,6) === 'Custom')
				) {
					this.outGamutSelect.options[j].selected = true;
					break;
				}
			}
			this.changeOutGamut();
		}
		this.changeGammaIn();
		this.changeGammaOut();
	}
};
LUTGammaBox.prototype.getHeight = function() {
	return this.box.clientHeight;
};
