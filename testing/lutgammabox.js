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
	this.inConSelect = document.createElement('select');
	this.inputs.addInput('inConGamma',this.inConSelect);
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
	this.outConSelect = document.createElement('select');
	this.inputs.addInput('outConGamma',this.outConSelect);
	this.buildContrast();
	this.outGamutSubs = document.createElement('select');
	this.inputs.addInput('outGamutSubs',this.outGamutSubs);
	this.outGamutSelect = document.createElement('select');
	this.inputs.addInput('outGamut',this.outGamutSelect);

	this.pqOOTFLwIn = document.createElement('input');
	this.inputs.addInput('inPQLw',this.pqOOTFLwIn);
	this.pqOOTFLwIn.setAttribute('type','number');
	this.pqOOTFLwIn.setAttribute('step',1);
	this.pqOOTFLwIn.className = 'base-input';
	this.pqOOTFLwIn.value = 10000;
	this.pqOOTFLwOut = document.createElement('input');
	this.inputs.addInput('outPQLw',this.pqOOTFLwOut);
	this.pqOOTFLwOut.setAttribute('type','number');
	this.pqOOTFLwOut.setAttribute('step',1);
	this.pqOOTFLwOut.className = 'base-input';
	this.pqOOTFLwOut.value = this.pqOOTFLwIn.value;

	this.pqEOTFLwIn = document.createElement('input');
	this.inputs.addInput('inPQEOTFLw',this.pqEOTFLwIn);
	this.pqEOTFLwIn.setAttribute('type','number');
	this.pqEOTFLwIn.setAttribute('step',1);
	this.pqEOTFLwIn.className = 'base-input';
	this.pqEOTFLwIn.value = 10000;
	this.pqEOTFLwOut = document.createElement('input');
	this.inputs.addInput('outPQEOTFLw',this.pqEOTFLwOut);
	this.pqEOTFLwOut.setAttribute('type','number');
	this.pqEOTFLwOut.setAttribute('step',1);
	this.pqEOTFLwOut.className = 'base-input';
	this.pqEOTFLwOut.value = this.pqEOTFLwIn.value;

	this.hlgOOTFLwIn = document.createElement('input');
	this.inputs.addInput('inHLGLw',this.hlgOOTFLwIn);
	this.hlgOOTFLwIn.setAttribute('type','number');
	this.hlgOOTFLwIn.setAttribute('step',1);
	this.hlgOOTFLwIn.className = 'base-input';
	this.hlgOOTFLwIn.value = 1000;
	this.hlgOOTFLbIn = document.createElement('input');
	this.inputs.addInput('inHLGLb',this.hlgOOTFLbIn);
	this.hlgOOTFLbIn.setAttribute('type','number');
	this.hlgOOTFLbIn.setAttribute('step',1);
	this.hlgOOTFLbIn.className = 'base-input';
	this.hlgOOTFLbIn.value = 0;
	this.hlgOOTFLwOut = document.createElement('input');
	this.inputs.addInput('outHLGLw',this.hlgOOTFLwOut);
	this.hlgOOTFLwOut.setAttribute('type','number');
	this.hlgOOTFLwOut.setAttribute('step','any');
	this.hlgOOTFLwOut.className = 'base-input';
	this.hlgOOTFLwOut.value = this.hlgOOTFLwIn.value;
	this.hlgOOTFLbOut = document.createElement('input');
	this.inputs.addInput('outHLGLb',this.hlgOOTFLbOut);
	this.hlgOOTFLbOut.setAttribute('type','number');
	this.hlgOOTFLbOut.setAttribute('step','any');
	this.hlgOOTFLbOut.className = 'base-input';
	this.hlgOOTFLbOut.value = this.hlgOOTFLbIn.value;

	this.hlgScaleIn = [];
	this.hlgScaleIn[0] = lutRadioElement('hlgScaleIn', true); // NHK / Base Spec (90% maps to 50% IRE)
	this.hlgScaleIn[1] = lutRadioElement('hlgScaleIn', false); // BBC (90% maps to 75% IRE)
	this.inputs.addInput('hlgBBCScaleIn',this.hlgScaleIn);
	this.hlgScaleOut = [];
	this.hlgScaleOut[0] = lutRadioElement('hlgScaleOut', true); // NHK / Base Spec (90% maps to 50% IRE)
	this.hlgScaleOut[1] = lutRadioElement('hlgScaleOut', false); // BBC (90% maps to 75% IRE)
	this.inputs.addInput('hlgBBCScaleOut',this.hlgScaleOut);
};
LUTGammaBox.prototype.ui = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Rec Gamma')));
	var inGaBox = document.createElement('div');
	inGaBox.className = 'gam-selects-box';
	this.box.appendChild(inGaBox);
	inGaBox.appendChild(this.inGammaSubs);
	inGaBox.appendChild(this.inGammaSelect);
	this.box.appendChild(document.createElement('br'));
	this.inLin = document.createElement('div');
	this.inLin.className = 'smallerbox';
	this.inLin.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	this.inLin.appendChild(this.inLinSelect);
	this.box.appendChild(this.inLin);

	this.inCon = document.createElement('div');
	this.inCon.className = 'smallerbox';
	this.inCon.appendChild(document.createElement('label').appendChild(document.createTextNode('Contrast')));
	this.inCon.appendChild(this.inConSelect);
	this.box.appendChild(this.inCon);
	
	this.pqOOTFInBox = document.createElement('div');
	this.pqOOTFInBox.className = 'smallerbox';
	this.pqOOTFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.pqOOTFInBox.appendChild(this.pqOOTFLwIn);
	this.pqOOTFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
	this.box.appendChild(this.pqOOTFInBox);

	this.pqEOTFInBox = document.createElement('div');
	this.pqEOTFInBox.className = 'smallerbox';
	this.pqEOTFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.pqEOTFInBox.appendChild(this.pqEOTFLwIn);
	this.pqEOTFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
	this.box.appendChild(this.pqEOTFInBox);
	
	this.hlgOOTFInBox = document.createElement('div');
	this.hlgOOTFInBox.className = 'smallerbox';
	this.hlgOOTFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.hlgOOTFInBox.appendChild(this.hlgOOTFLwIn);
	this.hlgOOTFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
//	this.hlgOOTFInBox.appendChild(this.hlgOOTFLbIn);
	this.box.appendChild(this.hlgOOTFInBox);

	this.hlgOETFInBox = document.createElement('div');
	this.hlgOETFInBox.className = 'smallerbox';
	this.hlgOETFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Reference White Scaling')));
	this.hlgOETFInBox.appendChild(this.hlgScaleIn[0]);
	this.hlgOETFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('NHK / Spec. Base')));
	this.hlgOETFInBox.appendChild(this.hlgScaleIn[1]);
	this.hlgOETFInBox.appendChild(document.createElement('label').appendChild(document.createTextNode('BBC')));
	this.box.appendChild(this.hlgOETFInBox);
	
	this.inGamutBox = document.createElement('div');
	this.inGamutBox.className = 'base-inputbox';
	this.inGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Rec Gamut')));
	var inGtBox = document.createElement('div');
	inGtBox.className = 'gam-selects-box';
	this.inGamutBox.appendChild(inGtBox);
	inGtBox.appendChild(this.inGamutSubs);
	inGtBox.appendChild(this.inGamutSelect);
	this.box.appendChild(this.inGamutBox);

	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Out Gamma')));
	var outGaBox = document.createElement('div');
	outGaBox.className = 'gam-selects-box';
	this.box.appendChild(outGaBox);
	outGaBox.appendChild(this.outGammaSubs);
	outGaBox.appendChild(this.outGammaSelect);
	this.box.appendChild(document.createElement('br'));
	this.outLin = document.createElement('div');
	this.outLin.className = 'smallerbox';
	this.outLin.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	this.outLin.appendChild(this.outLinSelect);
	this.box.appendChild(this.outLin);

	this.outCon = document.createElement('div');
	this.outCon.className = 'smallerbox';
	this.outCon.appendChild(document.createElement('label').appendChild(document.createTextNode('Contrast')));
	this.outCon.appendChild(this.outConSelect);
	this.box.appendChild(this.outCon);

	this.pqOOTFOutBox = document.createElement('div');
	this.pqOOTFOutBox.className = 'smallerbox';
	this.pqOOTFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.pqOOTFOutBox.appendChild(this.pqOOTFLwOut);
	this.pqOOTFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
	this.box.appendChild(this.pqOOTFOutBox);

	this.pqEOTFOutBox = document.createElement('div');
	this.pqEOTFOutBox.className = 'smallerbox';
	this.pqEOTFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.pqEOTFOutBox.appendChild(this.pqEOTFLwOut);
	this.pqEOTFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
	this.box.appendChild(this.pqEOTFOutBox);
	
	this.hlgOOTFOutBox = document.createElement('div');
	this.hlgOOTFOutBox.className = 'smallerbox';
	this.hlgOOTFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.hlgOOTFOutBox.appendChild(this.hlgOOTFLwOut);
	this.hlgOOTFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
//	this.hlgOOTFInBox.appendChild(this.hlgOOTFLbOut);
	this.box.appendChild(this.hlgOOTFOutBox);

	this.hlgOETFOutBox = document.createElement('div');
	this.hlgOETFOutBox.className = 'smallerbox';
	this.hlgOETFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Reference White Scaling')));
	this.hlgOETFOutBox.appendChild(this.hlgScaleOut[0]);
	this.hlgOETFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('NHK / Spec. Base')));
	this.hlgOETFOutBox.appendChild(this.hlgScaleOut[1]);
	this.hlgOETFOutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('BBC')));
	this.box.appendChild(this.hlgOETFOutBox);

	this.outGamutBox = document.createElement('div');
	this.outGamutBox.className = 'base-inputbox';
	this.outGamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Out Gamut')));
	var outGtBox = document.createElement('div');
	outGtBox.className = 'gam-selects-box';
	this.outGamutBox.appendChild(outGtBox);
	outGtBox.appendChild(this.outGamutSubs);
	outGtBox.appendChild(this.outGamutSelect);
	this.box.appendChild(this.outGamutBox);
	this.inLin.className = 'smallerbox-hide';
	this.inGamutBox.className = 'base-inputbox-hide';
	this.outLin.className = 'smallerbox-hide';
	this.outGamutBox.className = 'base-inputbox-hide';
};
LUTGammaBox.prototype.events = function() {
	this.inGammaSubs.onchange = function(here){ return function(){
		here.updateGammaInList(true);
		maxHeights();
	};}(this);
	this.inGamutSubs.onchange = function(here){ return function(){
		here.updateGamutInList(true);
	};}(this);
	this.inGammaSelect.onchange = function(here){ return function(){
		here.changeGammaIn();
		maxHeights();
		here.messages.gaSetParams();
	};}(this);
	this.inLinSelect.onchange = function(here){ return function(){
		here.changeGammaIn();
		here.messages.gaSetParams();
	};}(this);
	this.inConSelect.onchange = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.outGammaSubs.onchange = function(here){ return function(){
		here.updateGammaOutList(true);
		maxHeights();
	};}(this);
	this.outGamutSubs.onchange = function(here){ return function(){
		here.updateGamutOutList(true);
	};}(this);
	this.outGammaSelect.onchange = function(here){ return function(){
		here.changeGammaOut();
		maxHeights();
		here.messages.gaSetParams();
	};}(this);
	this.outLinSelect.onchange = function(here){ return function(){
		here.changeGammaOut();
		here.messages.gaSetParams();
	};}(this);
	this.outConSelect.onchange = function(here){ return function(){
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

	this.pqOOTFLwIn.onchange = function(here){ return function(){
		here.testPQLw(true);
		here.messages.gaSetParams();
	};}(this);
	this.pqOOTFLwOut.onchange = function(here){ return function(){
		here.testPQLw(false);
		here.messages.gaSetParams();
	};}(this);

	this.hlgOOTFLwIn.onchange = function(here){ return function(){
		here.testHLGLw(true);
		here.messages.gaSetParams();
	};}(this);
	this.hlgOOTFLwOut.onchange = function(here){ return function(){
		here.testHLGLw(false);
		here.messages.gaSetParams();
	};}(this);

	this.pqEOTFLwIn.onchange = function(here){ return function(){
		here.testPQEOTFLw(true);
		here.messages.gaSetParams();
	};}(this);
	this.pqEOTFLwOut.onchange = function(here){ return function(){
		here.testPQEOTFLw(false);
		here.messages.gaSetParams();
	};}(this);
	
	this.hlgScaleIn[0].onchange = function(here){ return function(){
//		here.testNHKBBC(true);
		here.messages.gaSetParams();
	};}(this);
	this.hlgScaleIn[1].onchange = function(here){ return function(){
//		here.testNHKBBC(true);
		here.messages.gaSetParams();
	};}(this);
	this.hlgScaleOut[0].onchange = function(here){ return function(){
//		here.testNHKBBC(false);
		here.messages.gaSetParams();
	};}(this);
	this.hlgScaleOut[1].onchange = function(here){ return function(){
//		here.testNHKBBC(false);
		here.messages.gaSetParams();
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
	this.updateGammaInList(false);
	this.updateGammaOutList(true);
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
	
	this.updateGamutInList(false);
	this.updateGamutOutList(true);
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
	if (defGamut === "Passthrough") {
		max = this.outGamutSelect.options.length;
		for (var i = 0; i < max; i++) {
			if (defGamut === this.outGamutSelect.options[i].lastChild.nodeValue) {
				this.outGamutSelect.options[i].selected = true;
				break;
			}
		}
	}
	this.updateGammaInList(false);
	this.updateGamutInList(false);
};
LUTGammaBox.prototype.buildContrast = function() {
	for (var i = -3; i < 4; i++) {
		var optIn = document.createElement('option');
		var optOut = document.createElement('option');
		optIn.value = i;
		optOut.value = i;
		if (i < 0) {
			optIn.appendChild(document.createTextNode(i));
			optOut.appendChild(document.createTextNode(i));
		} else if (i === 0) {
			optIn.appendChild(document.createTextNode('0'));
			optIn.selected = true;
			optOut.appendChild(document.createTextNode('0'));
			optOut.selected = true;
		} else {
			optIn.appendChild(document.createTextNode('+' + i));
			optOut.appendChild(document.createTextNode('+' + i));
		}
		this.inConSelect.appendChild(optIn);
		this.outConSelect.appendChild(optOut);
	}
};
// Event Responses
LUTGammaBox.prototype.testPQLw = function(isIn) {
	var Lw;
	if (isIn) {
		Lw = parseFloat(this.pqOOTFLwIn.value);
	} else {
		Lw = parseFloat(this.pqOOTFLwOut.value);
	}
	if (isNaN(Lw)) {
		Lw = 10000;
	} else {
		Lw = Math.round(Math.max(100,Math.min(10000,Lw)));
	}
	if (isIn) {
		this.pqOOTFLwIn.value = Lw;
	} else {
		this.pqOOTFLwOut.value = Lw;
	}
};
LUTGammaBox.prototype.testPQEOTFLw = function(isIn) {
	var Lw;
	if (isIn) {
		Lw = parseFloat(this.pqEOTFLwIn.value);
	} else {
		Lw = parseFloat(this.pqEOTFLwOut.value);
	}
	if (isNaN(Lw)) {
		Lw = 10000;
	} else {
		Lw = Math.round(Math.max(100,Math.min(10000,Lw)));
	}
	if (isIn) {
		this.pqEOTFLwIn.value = Lw;
	} else {
		this.pqEOTFLwOut.value = Lw;
	}
};
LUTGammaBox.prototype.testHLGLw = function(isIn) {
	var Lw;
	if (isIn) {
		Lw = parseFloat(this.hlgOOTFLwIn.value);
	} else {
		Lw = parseFloat(this.hlgOOTFLwOut.value);
	}
	if (isNaN(Lw)) {
		Lw = 1000;
	} else {
		Lw = Math.round(Lw);
	}
	if (isIn) {
		this.hlgOOTFLwIn.value = Lw;
	} else {
		this.hlgOOTFLwOut.value = Lw;
	}
};
/*
LUTGammaBox.prototype.testNHKBBC = function(isIn) {
	if (isIn) {
		this.hlgScaleOut[0].checked = this.hlgScaleIn[0].checked
		this.hlgScaleOut[1].checked = this.hlgScaleIn[1].checked
	} else {
		this.hlgScaleIn[0].checked = this.hlgScaleOut[0].checked
		this.hlgScaleIn[1].checked = this.hlgScaleOut[1].checked
	}
};
*/
LUTGammaBox.prototype.changeGammaIn = function() {
	// Hide Everything
	this.inLin.className = 'smallerbox-hide';
	this.inCon.className = 'smallerbox-hide';
	this.pqOOTFInBox.className = 'smallerbox-hide';
	this.pqEOTFInBox.className = 'smallerbox-hide';
	this.hlgOOTFInBox.className = 'smallerbox-hide';
	this.hlgOETFInBox.className = 'smallerbox-hide';
	// Show As Required
	var idx = parseInt(this.inGammaSelect.options[this.inGammaSelect.options.selectedIndex].value);
	if (idx === 9999) {
		this.inLin.className = 'smallerbox';
		idx = parseInt(this.inLinSelect.options[this.inLinSelect.options.selectedIndex].value);
		if (idx === this.inputs.gammaPQOOTF || idx === this.inputs.gammaPQOOTF + 1) {
			this.pqOOTFInBox.className = 'smallerbox';
		} else if (idx === this.inputs.gammaHLGOOTF || idx === this.inputs.gammaHLGOOTF + 1) {
			this.hlgOOTFInBox.className = 'smallerbox';
			this.hlgOETFInBox.className = 'smallerbox';
		}
	} else if (idx === this.inputs.gammaPQ || idx === this.inputs.gammaPQOOTF || idx === this.inputs.gammaPQOOTF + 1) {
		this.pqOOTFInBox.className = 'smallerbox';
	} else if (idx === this.inputs.gammaPQ + 1 || idx === this.inputs.gammaHLGOOTF || idx === this.inputs.gammaHLGOOTF + 1) {
		this.hlgOOTFInBox.className = 'smallerbox';
		this.hlgOETFInBox.className = 'smallerbox';
	} else if (idx === this.inputs.gammaPQEOTF) {
		this.pqEOTFInBox.className = 'smallerbox';
	} else if (idx === this.inputs.gammaHLG) {
		this.hlgOETFInBox.className = 'smallerbox';
	} else if (idx === this.inputs.gammaDLogM) {
		this.inCon.className = 'smallerbox';
	}
	this.messages.updateGammaIn();
};
LUTGammaBox.prototype.changeGammaOut = function() {
	// Hide Everything
	this.outLin.className = 'smallerbox-hide';
	this.outCon.className = 'smallerbox-hide';
	this.pqOOTFOutBox.className = 'smallerbox-hide';
	this.pqEOTFOutBox.className = 'smallerbox-hide';
	this.hlgOOTFOutBox.className = 'smallerbox-hide';
	this.hlgOETFOutBox.className = 'smallerbox-hide';
	// Show As Required
	var idx = parseInt(this.outGammaSelect.options[this.outGammaSelect.options.selectedIndex].value);
	if (idx === 9999) {
		this.outLin.className = 'smallerbox';
		idx = parseInt(this.outLinSelect.options[this.outLinSelect.options.selectedIndex].value);
		if (idx === this.inputs.gammaPQOOTF || idx === this.inputs.gammaPQOOTF + 1) {
			this.pqOOTFOutBox.className = 'smallerbox';
		} else if (idx === this.inputs.gammaHLGOOTF || idx === this.inputs.gammaHLGOOTF + 1) {
			this.hlgOOTFOutBox.className = 'smallerbox';
			this.hlgOETFOutBox.className = 'smallerbox';
		}
	} else if (idx === this.inputs.gammaPQ || idx === this.inputs.gammaPQOOTF || idx === this.inputs.gammaPQOOTF + 1) {
		this.pqOOTFOutBox.className = 'smallerbox';
	} else if (idx === this.inputs.gammaPQ + 1 || idx === this.inputs.gammaHLGOOTF || idx === this.inputs.gammaHLGOOTF + 1) {
		this.hlgOOTFOutBox.className = 'smallerbox';
		this.hlgOETFOutBox.className = 'smallerbox';
	} else if (idx === this.inputs.gammaPQEOTF) {
		this.pqEOTFOutBox.className = 'smallerbox';
	} else if (idx === this.inputs.gammaHLG) {
		this.hlgOETFOutBox.className = 'smallerbox';
	} else if (idx === this.inputs.gammaDLogM) {
		this.outCon.className = 'smallerbox';
	}
	this.messages.updateGammaOut();
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
		if (setParams) {
			this.messages.gaSetParams();
		}
	}
};
LUTGammaBox.prototype.updateGammaOutList = function(setParams) {
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
		if (setParams) {
			this.messages.gaSetParams();
		}
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
				if (this.inGamutOpts[j].lastChild.nodeValue.slice(0,6) === 'Custom') {
					this.inputs.custGamInIdx = this.inGamutSelect.options.length;
				}
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
LUTGammaBox.prototype.updateGamutOutList = function(setParams) {
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
				if (this.outGamutOpts[j].lastChild.nodeValue.slice(0,6) === 'Custom') {
					this.inputs.custGamOutIdx = this.outGamutSelect.options.length;
				}
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
		if (setParams) {
			this.messages.gtSetParams();
		}
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
		this.inGamutBox.className = 'base-inputbox-hide';
		this.outGamutBox.className = 'base-inputbox-hide';
	} else {
		this.inGamutBox.className = 'base-inputbox';
		this.outGamutBox.className = 'base-inputbox';
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
		recGammaSub: this.inGammaSubs.options[this.inGammaSubs.selectedIndex].lastChild.nodeValue,
		recGamma: this.inGammaSelect.options[this.inGammaSelect.options.selectedIndex].lastChild.nodeValue,
		recLinGamma: inLin,
		recContrast: this.inConSelect.options[this.inConSelect.options.selectedIndex].lastChild.nodeValue,
		recGamutSub: this.inGamutSubs.options[this.inGamutSubs.selectedIndex].lastChild.nodeValue,
		recGamut: this.inGamutSelect.options[this.inGamutSelect.options.selectedIndex].lastChild.nodeValue,
		outGammaSub: this.outGammaSubs.options[this.outGammaSubs.selectedIndex].lastChild.nodeValue,
		outGamma: this.outGammaSelect.options[this.outGammaSelect.options.selectedIndex].lastChild.nodeValue,
		outLinGamma: outLin,
		outContrast: this.outConSelect.options[this.outConSelect.options.selectedIndex].lastChild.nodeValue,
		outGamutSub: this.outGamutSubs.options[this.outGamutSubs.selectedIndex].lastChild.nodeValue,
		outGamut: this.outGamutSelect.options[this.outGamutSelect.options.selectedIndex].lastChild.nodeValue,
	};
};
LUTGammaBox.prototype.setSettings = function(settings) {
	if (typeof settings.gammaBox !== 'undefined') {
		var data = settings.gammaBox;
		if (typeof data.recGamma !== 'undefined') {
			this.inGammaSubs.options[this.inGammaSubs.options.length-1].selected = true;
			this.updateGammaInList(false);
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
		if (typeof data.recContrast !== 'undefined') {
			var m = this.inConSelect.options.length;
			var inConLen = data.recContrast.length;
			for (var j=0; j<m; j++) {
				if (this.inConSelect.options[j].lastChild.nodeValue.substring(0, inConLen) === data.recContrast) {
					this.inConSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.recGamut !== 'undefined') {
			this.inGamutSubs.options[this.inGamutSubs.options.length-1].selected = true;
			this.updateGamutInList(false);
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
			this.outGammaSubs.options[this.outGammaSubs.options.length-1].selected = true;
			this.updateGammaOutList(false);
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
		if (typeof data.outContrast !== 'undefined') {
			var m = this.outConSelect.options.length;
			var outConLen = data.outContrast.length;
			for (var j=0; j<m; j++) {
				if (this.outConSelect.options[j].lastChild.nodeValue.substring(0, outConLen) === data.outContrast) {
					this.outConSelect.options[j].selected = true;
					break;
				}
			}
		}
		if (typeof data.outGamut !== 'undefined') {
			this.outGamutSubs.options[this.outGamutSubs.options.length-1].selected = true;
			this.updateGamutOutList(false);
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
		if (typeof data.recGammaSub !== 'undefined') {
			var m = this.inGammaSubs.options.length;
			for (var j=0; j<m; j++) {
				if (this.inGammaSubs.options[j].lastChild.nodeValue === data.recGammaSub) {
					this.inGammaSubs.options[j].selected = true;
					this.updateGammaInList(false);
				}
			}
		}
		if (typeof data.recGamutSub !== 'undefined') {
			var m = this.inGamutSubs.options.length;
			for (var j=0; j<m; j++) {
				if (this.inGamutSubs.options[j].lastChild.nodeValue === data.recGamutSub) {
					this.inGamutSubs.options[j].selected = true;
					this.updateGamutInList(false);
				}
			}
		}
		if (typeof data.outGammaSub !== 'undefined') {
			var m = this.outGammaSubs.options.length;
			for (var j=0; j<m; j++) {
				if (this.outGammaSubs.options[j].lastChild.nodeValue === data.outGammaSub) {
					this.outGammaSubs.options[j].selected = true;
					this.updateGammaOutList(false);
				}
			}
		}
		if (typeof data.outGamutSub !== 'undefined') {
			var m = this.outGamutSubs.options.length;
			for (var j=0; j<m; j++) {
				if (this.outGamutSubs.options[j].lastChild.nodeValue === data.outGamutSub) {
					this.outGamutSubs.options[j].selected = true;
					this.updateGamutOutList(false);
				}
			}
		}
		this.changeGammaIn();
		this.changeGammaOut();
	}
};
LUTGammaBox.prototype.getHeight = function() {
	return this.box.clientHeight;
};
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
