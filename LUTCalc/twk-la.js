/* twk-la.js
* LUTAnalyst object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKLA(tweaksBox, inputs, messages, files, formats) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.files = files;
	this.formats = formats;
	this.validExts = this.formats.validExts();
	this.isTxt = this.formats.isTxt();
	this.p = 10;
	this.messages.addUI(this.p,this);
	this.io();
	this.ui();
	lutcalcReady(this.p);
}
TWKLA.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox-hide';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	this.analysed = document.createElement('input');
	this.analysed.setAttribute('type','hidden');
	this.analysed.value = '0';

	this.newOpt = this.createRadioElement('newOrLoad',true);
	this.oldOpt = this.createRadioElement('newOrLoad',false);
	this.inputs.addInput('laNewOld',[this.newOpt,this.oldOpt]);

	this.fileInput = document.createElement('input');
	if (this.inputs.isApp) {
		this.fileInput.setAttribute('type','text');
	} else {
		this.fileInput.setAttribute('type','file');
	}
	this.inputs.addInput('laFileData',{});

	this.title = document.createElement('input');
	this.inputs.addInput('laTitle',this.title);

	this.gammaSelect = document.createElement('select');
	var max = this.inputs.gammaInList.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = this.inputs.gammaInList[j].idx;
		option.appendChild(document.createTextNode(this.inputs.gammaInList[j].name));
		this.gammaSelect.appendChild(option);
	}
	this.inputs.addInput('laGammaSelect',this.gammaSelect);
	this.linGammaSelect = document.createElement('select');
	max = this.inputs.gammaLinList.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = this.inputs.gammaLinList[j].idx;
		option.appendChild(document.createTextNode(this.inputs.gammaLinList[j].name));
		this.linGammaSelect.appendChild(option);
	}
	this.inputs.addInput('laLinGammaSelect',this.linGammaSelect);

	this.gamutSelect = document.createElement('select');
	max = this.inputs.gamutLAList.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = this.inputs.gamutLAList[j].idx;
		option.appendChild(document.createTextNode(this.inputs.gamutLAList[j].name));
		this.gamutSelect.appendChild(option);
	}
	this.inputs.addInput('laGamutSelect',this.gamutSelect);

	this.pqOOTFLw = document.createElement('input');
	this.pqOOTFLw.setAttribute('type','number');
	this.pqOOTFLw.setAttribute('step',1);
	this.pqOOTFLw.className = 'base-input';
	this.pqOOTFLw.value = 10000;
	this.pqEOTFLw = document.createElement('input');
	this.pqEOTFLw.setAttribute('type','number');
	this.pqEOTFLw.setAttribute('step',1);
	this.pqEOTFLw.className = 'base-input';
	this.pqEOTFLw.value = 10000;
	this.hlgOOTFLw = document.createElement('input');
	this.hlgOOTFLw.setAttribute('type','number');
	this.hlgOOTFLw.setAttribute('step',1);
	this.hlgOOTFLw.className = 'base-input';
	this.hlgOOTFLw.value = 1000;
	this.hlgOOTFLb = document.createElement('input');
	this.hlgOOTFLb.setAttribute('type','number');
	this.hlgOOTFLb.setAttribute('step',1);
	this.hlgOOTFLb.className = 'base-input';
	this.hlgOOTFLb.value = 0;
	this.hlgScale = [];
	this.hlgScale[0] = lutRadioElement('hlgScale', true); // NHK / Base Spec (90% maps to 50% IRE)
	this.hlgScale[1] = lutRadioElement('hlgScale', false); // BBC (90% maps to 75% IRE)

	this.dim33 = this.createRadioElement('lutAnalystDim',false);
	this.dim65 = this.createRadioElement('lutAnalystDim',true);
	this.inputs.addInput('laDim',[this.dim33,this.dim65]);
	
	this.oldMethod = 1;
	this.intCub = this.createRadioElement('intMethod',false);
	this.intTet = this.createRadioElement('intMethod',false);
	this.intLin = this.createRadioElement('intMethod',false);
	this.inputs.addInput('laIntMethod',[this.intCub,this.intTet,this.intLin]);
	this.inputs.laIntMethod[this.oldMethod].checked = true;

	this.dlOpt = this.createRadioElement('range',true);
	this.ddOpt = this.createRadioElement('range',false);
	this.llOpt = this.createRadioElement('range',false);
	this.ldOpt = this.createRadioElement('range',false);
	this.inputs.addInput('laRange',[this.dlOpt,this.ddOpt,this.llOpt,this.ldOpt]);

	this.advancedCheck = document.createElement('input');
	this.advancedCheck.setAttribute('type','checkbox');
	this.advancedCheck.className = 'twk-checkbox';
	this.advancedCheck.checked = false;

	this.intGenCub = this.createRadioElement('intGenMethod',false);
	this.intGenTet = this.createRadioElement('intGenMethod',false);
	this.intGenLin = this.createRadioElement('intGenMethod',false);
	this.inputs.addInput('laIntGenMethod',[this.intGenCub,this.intGenTet,this.intGenLin]);
	this.inputs.laIntGenMethod[this.oldMethod].checked = true;

	this.oldPreMethod = this.oldMethod;
	this.intPreCub = this.createRadioElement('intPreMethod',false);
	this.intPreTet = this.createRadioElement('intPreMethod',false);
	this.intPreLin = this.createRadioElement('intPreMethod',false);
	this.inputs.addInput('laIntPreMethod',[this.intPreCub,this.intPreTet,this.intPreLin]);
	this.inputs.laIntPreMethod[this.oldMethod].checked = true;

	this.doButton = document.createElement('input');
	this.doButton.setAttribute('type','button');
	this.doButton.className = 'twk-button-hide';
	this.doButton.value = 'Analyse';

	this.declampButton = document.createElement('input');
	this.declampButton.setAttribute('type','button');
	this.declampButton.className = 'twk-button-hide';
	this.declampButton.value = 'Declip';

	this.storeButton = document.createElement('input');
	this.storeButton.setAttribute('type','button');
	this.storeButton.className = 'twk-button-hide';
	this.storeButton.value = 'Save Cube';

	this.storeBinButton = document.createElement('input');
	this.storeBinButton.setAttribute('type','button');
	this.storeBinButton.className = 'twk-button-hide';
	this.storeBinButton.value = 'Save Binary';

	this.backButton = document.createElement('input');
	this.backButton.setAttribute('type','button');
	this.backButton.className = 'twk-button-hide';
	this.backButton.value = 'New LUT';
	
	this.showGt = true;
	// LUTAnalyst Object
	lutInputs.addInput('lutAnalyst',new LUTAnalyst(this.inputs, this.messages));
};
TWKLA.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('LUTAnalyst')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak';
// Tweak - Specific UI Elements
	// Initial box - choose between loading a LUT or previously analysed LUTAnalyst file.
	this.startBox = document.createElement('div');
	this.startBox.appendChild(this.newOpt);
	this.startBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Import New LUT')));
	this.startBox.appendChild(this.oldOpt);
	this.startBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Load Existing Analysed LA LUT')));
	this.startBox.appendChild(document.createElement('br'));
	this.startBox.appendChild(this.fileInput);
	this.startBox.className = 'twk-tab';
	this.box.appendChild(this.startBox);
	// LUT being analysed parameters
	this.analysisBox = document.createElement('div');
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Title')));
	this.analysisBox.appendChild(this.title);
	this.analysisBox.appendChild(document.createElement('br'));
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Gamma')));
	this.analysisBox.appendChild(this.gammaSelect);
	this.analysisBox.appendChild(document.createElement('br'));
	this.linGammaBox = document.createElement('div');
	this.linGammaBox.appendChild(document.createElement('label').appendChild(document.createTextNode('γ Correction')));
	this.linGammaBox.appendChild(this.linGammaSelect);
	this.linGammaBox.className = 'twk-tab-hide';
	this.analysisBox.appendChild(this.linGammaBox);

	this.pqOOTFBox = document.createElement('div');
	this.pqOOTFBox.className = 'twk-tab-hide';
	this.pqOOTFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.pqOOTFBox.appendChild(this.pqOOTFLw);
	this.pqOOTFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
	this.analysisBox.appendChild(this.pqOOTFBox);
	this.pqEOTFBox = document.createElement('div');
	this.pqEOTFBox.className = 'twk-tab-hide';
	this.pqEOTFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.pqEOTFBox.appendChild(this.pqEOTFLw);
	this.pqEOTFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
	this.analysisBox.appendChild(this.pqEOTFBox);
	this.hlgOOTFBox = document.createElement('div');
	this.hlgOOTFBox.className = 'twk-tab-hide';
	this.hlgOOTFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Display: Peak Mastering Level (Lw)')));
	this.hlgOOTFBox.appendChild(this.hlgOOTFLw);
	this.hlgOOTFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('nits')));
//	this.hlgOOTFInBox.appendChild(this.hlgOOTFLbIn);
	this.analysisBox.appendChild(this.hlgOOTFBox);
	this.hlgOETFBox = document.createElement('div');
	this.hlgOETFBox.className = 'twk-tab-hide';
	this.hlgOETFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Reference White Scaling')));
	this.hlgOETFBox.appendChild(this.hlgScale[0]);
	this.hlgOETFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('NHK / Spec. Base')));
	this.hlgOETFBox.appendChild(this.hlgScale[1]);
	this.hlgOETFBox.appendChild(document.createElement('label').appendChild(document.createTextNode('BBC')));
	this.analysisBox.appendChild(this.hlgOETFBox);

	this.gamutBox = document.createElement('div');
	this.gamutBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Gamut')));
	this.gamutBox.appendChild(this.gamutSelect);
	this.gamutBox.appendChild(document.createElement('br'));
	this.gamutBox.className = 'twk-tab-hide';
	this.analysisBox.appendChild(this.gamutBox);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Analysis Dimension:')));
	this.analysisBox.appendChild(this.dim33);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('33x33x33')));
	this.analysisBox.appendChild(this.dim65);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('65x65x65')));
	this.analysisBox.appendChild(document.createElement('br'));
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Analysis Method:')));
	this.analysisBox.appendChild(this.intCub);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Tricubic')));
	this.analysisBox.appendChild(this.intTet);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Tetrahedral')));
	this.analysisBox.appendChild(this.intLin);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Trilinear')));
	this.analysisBox.appendChild(document.createElement('br'));
	var rangeBox = document.createElement('div');
	rangeBox.className = 'twk-narrow-sub-box';
	rangeBox.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Range  ')));
	rangeBox.appendChild(document.createElement('br'));
	rangeBox.appendChild(this.dlOpt);
	rangeBox.appendChild(document.createElement('label').appendChild(document.createTextNode('109%→100%')));
	rangeBox.appendChild(this.ddOpt);
	rangeBox.appendChild(document.createElement('label').appendChild(document.createTextNode('109%→109%')));
	rangeBox.appendChild(document.createElement('br'));
	rangeBox.appendChild(this.llOpt);
	rangeBox.appendChild(document.createElement('label').appendChild(document.createTextNode('100%→100%')));
	rangeBox.appendChild(this.ldOpt);
	rangeBox.appendChild(document.createElement('label').appendChild(document.createTextNode('100%→109%')));
	this.analysisBox.appendChild(rangeBox);
	// Add the analysis box to the main box
	this.analysisBox.className = 'twk-tab-hide';
	this.box.appendChild(this.analysisBox);
	// Advanced settings Checkbox
	this.advancedCheckBox = document.createElement('div');
	this.advancedCheckBox.className = 'twk-tab-hide';
	this.advancedCheckBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Advanced Settings')));
	this.advancedCheckBox.appendChild(this.advancedCheck);
	// Advanced Box - Holds Advanced Or Experimental Inputs
	this.advancedBox = document.createElement('div');
	this.advancedBox.className = 'twk-advanced-hide';
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Generation Method:')));
	this.advancedBox.appendChild(this.intGenCub);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Tricubic')));
	this.advancedBox.appendChild(this.intGenTet);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Tetrahedral')));
	this.advancedBox.appendChild(this.intGenLin);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Trilinear')));
	this.advancedBox.appendChild(document.createElement('br'));
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Preview Method:')));
	this.advancedBox.appendChild(this.intPreCub);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Tricubic')));
	this.advancedBox.appendChild(this.intPreTet);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Tetrahedral')));
	this.advancedBox.appendChild(this.intPreLin);
	this.advancedBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Trilinear')));
	this.advancedBox.appendChild(document.createElement('br'));
	this.advancedBox.appendChild(this.declampButton);
	this.advancedCheckBox.appendChild(this.advancedBox);
	// Buttons
	this.box.appendChild(this.doButton);
	this.box.appendChild(this.storeButton);
	this.box.appendChild(this.storeBinButton);
	this.box.appendChild(this.backButton);
	this.box.appendChild(this.advancedCheckBox);

	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKLA.prototype.toggleTweaks = function() {
	// LUTAnalyst will always be visible
};
TWKLA.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		if (parseInt(this.inputs.inGamma.options[this.inputs.inGamma.options.length - 1].value) !== this.inputs.gammaLA) {
			var laOption = document.createElement('option');
				laOption.value = this.inputs.gammaLA;
				laOption.innerHTML = 'LA - ' + this.title.value;
			this.inputs.inGamma.appendChild(laOption);
		} else {
			this.inputs.inGamma.options[this.inputs.inGamma.options.length - 1].innerHTML = 'LA - ' + this.title.value;
		}
		if (parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value) !== this.inputs.gammaLA) {
			var laOption = document.createElement('option');
				laOption.value = this.inputs.gammaLA;
				laOption.innerHTML = 'LA - ' + this.title.value;
			this.inputs.outGamma.appendChild(laOption);
		} else {
			this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].innerHTML = 'LA - ' + this.title.value;
		}
		if (parseInt(this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value) !== this.inputs.gamutLA) {
			var laOption = document.createElement('option');
				laOption.value = this.inputs.gamutLA;
				laOption.innerHTML = 'LA - ' + this.title.value;
			this.inputs.outGamut.appendChild(laOption);
		} else {
			this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].innerHTML = 'LA - ' + this.title.value;
		}
		if (parseInt(this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].value) !== this.inputs.gamutLA) {
			var laOption = document.createElement('option');
				laOption.value = this.inputs.gamutLA;
				laOption.innerHTML = 'LA - ' + this.title.value;
			this.inputs.twkHGSelect.appendChild(laOption);
		} else {
			this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].innerHTML = 'LA - ' + this.title.value;
		}
		if (this.showGt) {
			this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].className = 'select-item';
			this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].className = 'select-item';
		} else {
			this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].className = 'select-item-hide';
			this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].className = 'select-item-hide';
		}
	} else {
		if (parseInt(this.inputs.inGamma.options[this.inputs.inGamma.options.selectedIndex].value) === this.inputs.gammaLA) {
			this.inputs.inGamma.options[0].selected = true;
		}
		if (parseInt(this.inputs.inGamma.options[this.inputs.inGamma.options.length - 1].value) === this.inputs.gammaLA) {
			this.inputs.inGamma.remove(this.inputs.inGamma.options.length - 1);
		}
		if (parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.selectedIndex].value) === this.inputs.gammaLA) {
			this.inputs.outGamma.options[0].selected = true;
		}
		if (parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value) === this.inputs.gammaLA) {
			this.inputs.outGamma.remove(this.inputs.outGamma.options.length - 1);
		}
		if (parseInt(this.inputs.outGamut.options[this.inputs.outGamut.options.selectedIndex].value) === this.inputs.gamutLA) {
			this.inputs.outGamut.options[0].selected = true;
		}
		if (parseInt(this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value) === this.inputs.gamutLA) {
			this.inputs.outGamut.remove(this.inputs.outGamut.options.length - 1);
		}
		if (parseInt(this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.selectedIndex].value) === this.inputs.gamutLA) {
			this.inputs.twkHGSelect.options[0].selected = true;
		}
		if (parseInt(this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].value) !== this.inputs.gamutLA) {
			this.inputs.twkHGSelect.remove(this.inputs.twkHGSelect.options.length - 1);
		}
	}
};
TWKLA.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKLA.prototype.getCSParams = function(params) {
	var out = {};
	if (this.intGenCub.checked) {
		out.genInt = 0;
	} else if (this.intGenTet.checked) {
		out.genInt = 1;
	} else {
		out.genInt = 2;
	}
	if (this.intPreCub.checked) {
		out.preInt = 0;
	} else if (this.intPreTet.checked) {
		out.preInt = 1;
	} else {
		out.preInt = 2;
	}
	params.twkLA = out;
};
TWKLA.prototype.setParams = function(params) {
	if (typeof params.twkLA !== 'undefined') {
		var p = params.twkLA;
	}
	this.syncHDRVals();
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
};
TWKLA.prototype.getSettings = function(data) {
};
TWKLA.prototype.setSettings = function(settings) {
};
TWKLA.prototype.getInfo = function(info) {
};
TWKLA.prototype.isCustomGamma = function() {
	return false;
};
TWKLA.prototype.isCustomGamut = function() {
	return false;
};
TWKLA.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	// Event responses for input changes or click should go here
	if (this.inputs.isApp) {
		this.fileInput.onclick = function(here){ return function(){
			here.getFile();
		};}(this);
	} else {
		this.fileInput.onchange = function(here){ return function(){
			here.getFile();
		};}(this);
	}
	this.gammaSelect.onchange = function(here){ return function(){
		here.testGamma();
	};}(this);
	this.title.onchange = function(here){ return function(){
		here.cleanTitle();
	};}(this);
	this.advancedCheck.onclick = function(here){ return function(){
		here.toggleAdvanced();
	};}(this);
	this.intCub.onclick = function(here){ return function(){
		here.updateLAMethod(0);
	};}(this);
	this.intTet.onclick = function(here){ return function(){
		here.updateLAMethod(1);
	};}(this);
	this.intLin.onclick = function(here){ return function(){
		here.updateLAMethod(2);
	};}(this);
	this.intPreCub.onclick = function(here){ return function(){
		here.updatePreMethod(0);
	};}(this);
	this.intPreTet.onclick = function(here){ return function(){
		here.updatePreMethod(1);
	};}(this);
	this.intPreLin.onclick = function(here){ return function(){
		here.updatePreMethod(2);
	};}(this);
	this.doButton.onclick = function(here){ return function(){
		here.doStuff();
	};}(this);
	this.declampButton.onclick = function(here){ return function(){
		here.deClamp();
	};}(this);
	this.backButton.onclick = function(here){ return function(){
		here.reset();
		here.messages.gaSetParams();
		here.messages.gtSetParams();
	};}(this);
	this.storeButton.onclick = function(here){ return function(){
		here.store(true);
	};}(this);
	this.storeBinButton.onclick = function(here){ return function(){
		here.store(false);
	};}(this);

	this.pqOOTFLw.onchange = function(here){ return function(){
		here.testPQLw();
		here.messages.gaSetParams();
	};}(this);
	this.hlgOOTFLw.onchange = function(here){ return function(){
		here.testHLGLw();
		here.messages.gaSetParams();
	};}(this);
	this.pqEOTFLw.onchange = function(here){ return function(){
		here.testPQEOTFLw();
		here.messages.gaSetParams();
	};}(this);
	this.hlgScale[0].onchange = function(here){ return function(){
		here.testNHKBBC();
		here.messages.gaSetParams();
	};}(this);
	this.hlgScale[1].onchange = function(here){ return function(){
		here.testNHKBBC();
		here.messages.gaSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKLA.prototype.testPQLw = function() {
	var Lw = parseFloat(this.pqOOTFLw.value);
	if (isNaN(Lw)) {
		Lw = 10000;
	} else {
		Lw = Math.round(Math.max(100,Math.min(10000,Lw)));
	}
	this.pqOOTFLw.value = Lw;
	this.inputs.inPQLw.value = this.pqOOTFLw.value;
//	this.inputs.outPQLw.value = this.pqOOTFLw.value;
};
TWKLA.prototype.testPQEOTFLw = function() {
	var Lw = parseFloat(this.pqEOTFLw.value);
	if (isNaN(Lw)) {
		Lw = 10000;
	} else {
		Lw = Math.round(Math.max(100,Math.min(10000,Lw)));
	}
	this.pqEOTFLw.value = Lw;
	this.inputs.inPQEOTFLw.value = this.pqEOTFLw.value;
//	this.inputs.outPQEOTFLw.value = this.pqEOTFLw.value;
};
TWKLA.prototype.testHLGLw = function() {
	var Lw = parseFloat(this.hlgOOTFLw.value);
	if (isNaN(Lw)) {
		Lw = 1000;
	} else {
		Lw = Math.round(Lw);
	}
	this.hlgOOTFLw.value = Lw;
	this.inputs.inHLGLw.value = this.hlgOOTFLw.value;
//	this.inputs.outHLGLw.value = this.hlgOOTFLw.value;
};
TWKLA.prototype.testNHKBBC = function() {
	this.inputs.hlgBBCScaleIn[0].checked = this.hlgScale[0].checked;
	this.inputs.hlgBBCScaleIn[1].checked = this.hlgScale[1].checked;
//	this.inputs.hlgBBCScaleOut[0].checked = this.hlgScale[0].checked;
//	this.inputs.hlgBBCScaleOut[1].checked = this.hlgScale[1].checked;
};
TWKLA.prototype.createRadioElement = function(name, checked) {
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
};
TWKLA.prototype.getFile = function() {
	var validExts = [];
	var isTxt = [];
	if (this.newOpt.checked) {
		validExts = this.validExts.slice(0);
		isTxt = this.isTxt.slice(0);
	} else {
		validExts = ['lacube','labin'];
		isTxt = [true, false];
	}
	if (this.inputs.isApp || this.fileInput.value !== '') {
		this.files.loadLUTFromInput(this.fileInput, validExts, isTxt, 'laFileData', this, 0);
	}
};
TWKLA.prototype.followUp = function(input) {
	switch (input) {
		case 0:	this.gotFile();
				break;
		default:break;
	}
};
TWKLA.prototype.gotFile = function() {
	this.startBox.className = 'twk-tab-hide';
	this.backButton.className = 'twk-button';
	if (this.newOpt.checked) {
		this.analysisBox.className = 'twk-tab';
		this.testGamma();
		this.inputs.lutAnalyst.reset();
		var parsed = false;
		if (this.inputs.laFileData.isTxt) {
			parsed = this.formats.parse(this.inputs.laFileData.format,this.inputs.laFileData.title, this.inputs.laFileData.text, this.inputs.lutAnalyst, 'inLUT');
		} else {
			parsed = this.formats.parse(this.inputs.laFileData.format,this.inputs.laFileData.title, this.inputs.laFileData.buff, this.inputs.lutAnalyst, 'inLUT');
		}
		if (parsed) {
			this.title.value = this.inputs.lutAnalyst.getTitle('in');
			this.doButton.className = 'twk-button';
			this.advancedCheckBox.className = 'twk-tab';
			if (this.inputs.lutAnalyst.is3D()) {
				this.showGt = true;
				this.gamutBox.className = 'twk-tab';
			} else {
				this.showGt = false;
				this.gamutBox.className = 'twk-tab-hide';
			}
			if (this.inputs.lutAnalyst.inLUT.isClamped()) {
				this.declampButton.value = 'Declip';
				this.declampButton.disabled = false;
			} else {
				this.declampButton.value = 'Unclipped';
				this.declampButton.disabled = true;
			}
			this.declampButton.className = 'twk-button';
			
		} else {
			this.reset();
		}
	} else {
		this.doButton.className = 'twk-button-hide';
		this.declampButton.className = 'twk-button-hide';
		this.inputs.lutAnalyst.reset();
		var parsed = false;
		switch (this.inputs.laFileData.format) {
			case 'lacube': parsed = this.inputs.laCube.parse(this.inputs.laFileData.title, this.inputs.laFileData.text, this.inputs.lutAnalyst, 'tf', 'cs');
						   break;
			case 'labin': parsed = this.inputs.laBin.parse(this.inputs.laFileData.title, this.inputs.laFileData.buff, this.inputs.lutAnalyst, 'tf', 'cs');
						  break;
		}
		if (parsed) {
			if (this.inputs.lutAnalyst.cs) {
				this.showGt = true;
			} else {
				this.showGt = false;
			}
			this.title.value = this.inputs.lutAnalyst.getTitle('tf');
			this.advancedCheckBox.className = 'twk-tab';
			this.inputs.lutAnalyst.updateLATF(true);
			if (this.showGt) {
				this.inputs.lutAnalyst.updateLACS();
			}
			this.tweakCheck.checked = true;
			this.tweakCheck.className = 'twk-checkbox';
			this.toggleTweak();
		} else {
			this.reset();
		}
	}
};
TWKLA.prototype.testGamma = function() {
	// Hide Everything
	this.linGammaBox.className = 'twk-tab-hide';
	this.pqOOTFBox.className = 'twk-tab-hide';
	this.pqEOTFBox.className = 'twk-tab-hide';
	this.hlgOOTFBox.className = 'twk-tab-hide';
	this.hlgOETFBox.className = 'twk-tab-hide';
	// Show As Required
	var idx = parseInt(this.gammaSelect.options[this.gammaSelect.options.selectedIndex].value);
	if (idx === 9999) {
		this.linGammaBox.className = 'twk-tab';
		idx = parseInt(this.linGammaSelect.options[this.linGammaSelect.options.selectedIndex].value);
		if (idx === this.inputs.gammaPQOOTF || idx === this.inputs.gammaPQOOTF + 1) {
			this.pqOOTFBox.className = 'twk-tab';
		} else if (idx === this.inputs.gammaHLGOOTF || idx === this.inputs.gammaHLGOOTF + 1) {
			this.hlgOOTFBox.className = 'twk-tab';
			this.hlgOETFBox.className = 'twk-tab';
		}
	} else if (idx === this.inputs.gammaPQ || idx === this.inputs.gammaPQOOTF || idx === this.inputs.gammaPQOOTF + 1) {
		this.pqOOTFBox.className = 'twk-tab';
	} else if (idx === this.inputs.gammaPQ + 1 || idx === this.inputs.gammaHLGOOTF || idx === this.inputs.gammaHLGOOTF + 1) {
		this.hlgOOTFBox.className = 'twk-tab';
		this.hlgOETFBox.className = 'twk-tab';
	} else if (idx === this.inputs.gammaPQEOTF) {
		this.pqEOTFBox.className = 'twk-tab';
	} else if (idx === this.inputs.gammaHLG) {
		this.hlgOETFBox.className = 'twk-tab';
	}
};
TWKLA.prototype.doStuff = function() {
	this.cleanTitle();
	this.inputs.lutAnalyst.getTF();
};
TWKLA.prototype.doneStuff = function() {
	this.tweakCheck.checked = true;
	this.tweakCheck.className = 'twk-checkbox';
	this.doButton.value = 'Re-Analyse';
	this.storeButton.className = 'twk-button';
	this.storeBinButton.className = 'twk-button';
	this.toggleTweak();
	this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].selected = true;
	if (this.showGt) {
		this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].selected = true;
	}
	this.messages.changeGamma();
	if (this.showGt) {
		this.messages.changeGamut();
	}
	maxHeights();
};
TWKLA.prototype.reset = function() {
	this.tweakCheck.checked = false;
	this.tweakCheck.className = 'twk-checkbox-hide';
	if (this.inputs.outGamma.options.length > 0 && this.inputs.outGamut.options.length > 0 && this.inputs.twkHGSelect.options.length > 0) {
		if (parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value) === this.inputs.gammaLA) {
			this.inputs.outGamma.options[0].selected = true;
		}
		if (parseInt(this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value) === this.inputs.gamutLA) {
			this.inputs.outGamut.options[0].selected = true;
		}
		if (parseInt(this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].value) === this.inputs.gamutLA) {
			this.inputs.twkHGSelect.options[0].selected = true;
		}
		this.toggleTweak();
	}
	this.inputs.lutAnalyst.reset();
	this.inputs.laFileData = {};
	this.fileInput.value = '';
	this.dlOpt.checked = true;

	this.doButton.value = 'Analyse';

	this.startBox.className = 'twk-tab';
	this.analysisBox.className = 'twk-tab-hide';
	this.linGammaBox.className = 'twk-tab-hide';
	this.advancedCheckBox.className = 'twk-tab-hide';

	this.backButton.className = 'twk-button-hide';
	this.storeButton.className = 'twk-button-hide';
	this.storeBinButton.className = 'twk-button-hide';
	this.declampButton.className = 'twk-button-hide';
	this.doButton.className = 'twk-button-hide';
	maxHeights();
};
TWKLA.prototype.store = function(cube) {
	if (this.inputs.lutAnalyst.cs) { // 3D LUT
		var meta = this.inputs.lutAnalyst.cs.getMetadata();
		var params = {
			in1DTF: 'S-Log3',
			in1DEX: true,
			in3DTF: 'S-Log3',
			in3DCS: meta.inputCS,
			sysCS: meta.sysCS,
			in3DEX: meta.inputEX,
			interpolation: meta.interpolation,
			baseISO: meta.baseISO,
			inputMatrix: meta.inputMatrix
		}
		if (meta.nativeTF !== 0) {
			params.in3DTF = meta.inputTF;
		}
		if (cube) {
			this.files.save(
				this.inputs.laCube.build(
					this.title.value,
					this.inputs.lutAnalyst.getL(),
					this.inputs.lutAnalyst.getRGB(),
					params
				),
				this.title.value,
				'lacube',
				0
			);
		} else {
			this.files.saveBinary(
				this.inputs.laBin.build(
					this.title.value,
					this.inputs.lutAnalyst.getL(),
					this.inputs.lutAnalyst.getRGB(),
					params
				),
				this.title.value,
				'labin',
				0
			);
		}
	} else {
		var params = {
			in1DTF: 'S-Log3',
			in1DEX: true,
		}
		if (cube) {
			this.files.save(
				this.inputs.laCube.build(
					this.title.value,
					this.inputs.lutAnalyst.getL(),
					false,
					params
				),
				this.title.value,
				'lacube',
				0
			);
		} else {
			this.files.saveBinary(
				this.inputs.laBin.build(
					this.title.value,
					this.inputs.lutAnalyst.getL(),
					false,
					params
				),
				this.title.value,
				'labin',
				0
			);
		}
	}
/*
	this.files.buildLA1DMethod(
		this.title.value,
		this.inputs.lutAnalyst.getL()
	);
*/
};
TWKLA.prototype.deClamp = function() {
	this.inputs.lutAnalyst.inLUT.deClamp();
	this.declampButton.value = 'Declipped';
	this.declampButton.disabled = true;
	if (this.doButton.value === 'Re-Analyse') {
		this.doStuff();
	}
/*
		this.files.save(
			this.inputs.laCube.build(
				this.title.value,
				new Float64Array(3).buffer,
				this.inputs.lutAnalyst.inLUT.getRGB()
			),
			'test',
			'cube',
			0
		);
*/
};
TWKLA.prototype.toggleAdvanced = function() {
	if (this.advancedCheck.checked) {
		this.advancedBox.className = 'twk-advanced';
	} else {
		this.advancedBox.className = 'twk-advanced-hide';
	}
};
TWKLA.prototype.updatePreMethod = function(newPreMethod) {
	if (newPreMethod !== this.oldPreMethod) {
		this.oldPreMethod = newPreMethod;
		this.messages.gtSetParams();
	}
};
TWKLA.prototype.updateLAMethod = function(newMethod) {
	if (newMethod !== this.oldMethod) {
		switch (newMethod) {
			case 0:  this.intGenCub.checked = true;
					 this.intPreCub.checked = true;
					 break;
			case 1:  this.intGenTet.checked = true;
					 this.intPreTet.checked = true;
					 break;
			case 2:
			default: this.intGenLin.checked = true;
					 this.intPreLin.checked = true;
					 break;
		}
		this.oldMethod = newMethod;
	}
};
TWKLA.prototype.syncHDRVals = function(here) {
	if (here) { // send from here to the gamma box
		this.inputs.inPQLw.value = this.pqOOTFLw.value;
//		this.inputs.outPQLw.value = this.pqOOTFLw.value;
		this.inputs.inPQEOTFLw.value = this.pqEOTFLw.value;
//		this.inputs.outPQEOTFLw.value = this.pqEOTFLw.value;
		this.inputs.inHLGLw.value = this.hlgOOTFLw.value;
//		this.inputs.outHLGLw.value = this.hlgOOTFLw.value;
		this.inputs.inHLGLb.value = this.hlgOOTFLb.value;
//		this.inputs.outHLGLb.value = this.hlgOOTFLb.value;
		this.inputs.hlgBBCScaleIn[0].checked = this.hlgScale[0].checked;
		this.inputs.hlgBBCScaleIn[1].checked = this.hlgScale[1].checked;
//		this.inputs.hlgBBCScaleOut[0].checked = this.hlgScale[0].checked;
//		this.inputs.hlgBBCScaleOut[1].checked = this.hlgScale[1].checked;
	} else { // collect from gamma box
		this.pqOOTFLw.value = this.inputs.inPQLw.value;
		this.pqEOTFLw.value = this.inputs.inPQEOTFLw.value;
		this.hlgOOTFLw.value = this.inputs.inHLGLw.value;
		this.hlgOOTFLb.value = this.inputs.inHLGLb.value;
		this.hlgScale[0].checked = this.inputs.hlgBBCScaleIn[0].checked;
		this.hlgScale[1].checked = this.inputs.hlgBBCScaleIn[1].checked;
	}
};
TWKLA.prototype.cleanTitle = function() {
	this.title.value = this.title.value.replace(/[/"/']/gi, '');
	if (parseInt(this.inputs.inGamma.options[this.inputs.inGamma.options.length - 1].value) === this.inputs.gammaLA) {
		this.inputs.inGamma.options[this.inputs.inGamma.options.length - 1].innerHTML = 'LA - ' + this.title.value;
	}
	if (parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value) === this.inputs.gammaLA) {
		this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].innerHTML = 'LA - ' + this.title.value;
	}
	if (parseInt(this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value) === this.inputs.gamutLA) {
		this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].innerHTML = 'LA - ' + this.title.value;
	}
	if (parseInt(this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].value) === this.inputs.gamutLA) {
		this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].innerHTML = 'LA - ' + this.title.value;
	}
	maxHeights();
};
// Loading progress bar
if (typeof splash !== 'undefined') {
	splashProg();
}
