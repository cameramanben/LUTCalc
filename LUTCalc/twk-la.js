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
function TWKLA(tweaksBox, inputs, messages, files) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.files = files;
	this.p = 10;
	this.messages.addUI(this.p,this);
	this.io();
	this.ui();
	this.events();
}
TWKLA.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox-hide';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	this.inLUT = new LUTs();
	this.inputs.addInput('laInLUT',this.inLUT);
	this.inputs.addInput('laGammaLUT',{text:[]});
	this.inputs.addInput('laGamutLUT',{text:[]});

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

	this.dlOpt = this.createRadioElement('range',true);
	this.ddOpt = this.createRadioElement('range',false);
	this.llOpt = this.createRadioElement('range',false);
	this.ldOpt = this.createRadioElement('range',false);
	this.inputs.addInput('laRange',[this.dlOpt,this.ddOpt,this.llOpt,this.ldOpt]);

	this.doButton = document.createElement('input');
	this.doButton.setAttribute('type','button');
	this.doButton.setAttribute('class','twk-button-hide');
	this.doButton.value = 'Analyse';

	this.dim33 = this.createRadioElement('lutAnalystDim',false);
	this.dim65 = this.createRadioElement('lutAnalystDim',true);
	this.inputs.addInput('laDim',[this.dim33,this.dim65]);

	this.storeButton = document.createElement('input');
	this.storeButton.setAttribute('type','button');
	this.storeButton.setAttribute('class','twk-button-hide');
	this.storeButton.value = 'Save Cube';

	this.storeBinButton = document.createElement('input');
	this.storeBinButton.setAttribute('type','button');
	this.storeBinButton.setAttribute('class','twk-button-hide');
	this.storeBinButton.value = 'Save Binary';

	this.backButton = document.createElement('input');
	this.backButton.setAttribute('type','button');
	this.backButton.setAttribute('class','twk-button-hide');
	this.backButton.value = 'New LUT';

	// LUTAnalyst Object
	lutInputs.addInput('lutAnalyst',new LUTAnalyst(this.inputs, this.messages));
}
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
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Scaling  ')));
	this.analysisBox.appendChild(this.dlOpt);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('D→L')));
	this.analysisBox.appendChild(this.ddOpt);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('D→D')));
	this.analysisBox.appendChild(this.llOpt);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('L→L')));
	this.analysisBox.appendChild(this.ldOpt);
	this.analysisBox.appendChild(document.createElement('label').appendChild(document.createTextNode('L→D')));
	this.analysisBox.className = 'twk-tab-hide';
	this.box.appendChild(this.analysisBox);
	// Buttons
	this.box.appendChild(this.doButton);
	this.box.appendChild(this.storeButton);
	this.box.appendChild(this.storeBinButton);
	this.box.appendChild(this.backButton);
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
}
TWKLA.prototype.toggleTweaks = function() {
	// LUTAnalyst will always be visible
}
TWKLA.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
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
	} else {
		if (parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value) === this.inputs.gammaLA) {
			this.inputs.outGamma.remove(this.inputs.outGamma.options.length - 1);
			this.inputs.outGamma.options[0].selected = true;
		}
		if (parseInt(this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value) === this.inputs.gamutLA) {
			this.inputs.outGamut.remove(this.inputs.outGamut.options.length - 1);
			this.inputs.outGamut.options[0].selected = true;
		}
		if (parseInt(this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].value) !== this.inputs.gamutLA) {
			this.inputs.twkHGSelect.remove(this.inputs.twkHGSelect.options.length - 1);
			this.inputs.twkHGSelect.options[0].selected = true;
		}
	}
}
TWKLA.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
}
TWKLA.prototype.getCSParams = function(params) {
	// No Relevant Parameters For This Tweak
}
TWKLA.prototype.setParams = function(params) {
	if (typeof params.twkLA !== 'undefined') {
		var p = params.twkLA;
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
}
TWKLA.prototype.getInfo = function(info) {
}
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
	this.doButton.onclick = function(here){ return function(){
		here.doStuff();
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
}
// Tweak-Specific Code
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
}
TWKLA.prototype.getFile = function() {
	var validExts = [];
	if (this.newOpt.checked) {
		validExts = ['cube'];
	} else {
		validExts = ['lacube','labin'];
	}
	if (this.inputs.isApp || this.fileInput.value !== '') {
		this.files.loadLUTFromInput(this.fileInput, validExts, 'laFileData', this, 0);
	}
}
TWKLA.prototype.followUp = function(input) {
	switch (input) {
		case 0:	this.gotFile();
				break;
		default:break;
	}
}
TWKLA.prototype.gotFile = function() {
	this.startBox.className = 'twk-tab-hide';
	this.backButton.className = 'twk-button';

	if (this.newOpt.checked) {
		this.analysisBox.className = 'twk-tab';
		this.inputs.lutAnalyst.reset();
		var parsed = false;
		switch (this.inputs.laFileData.format) {
			case 'cube': parsed = this.files.parseCubeLA('laFileData', 'in');
						break;
		}
		if (parsed) {
			this.title.value = this.inputs.lutAnalyst.getTitle();
			this.doButton.className = 'twk-button';
			if (this.inputs.lutAnalyst.is3D()) {
				this.gamutBox.className = 'twk-tab';
			} else {
				this.gamutBox.className = 'twk-tab-hide';
			}
		} else {
			this.reset();
		}
	} else {
		this.doButton.className = 'twk-button-hide';
		this.inputs.lutAnalyst.reset();
		var parsed = false;
		switch (this.inputs.laFileData.format) {
			case 'lacube': parsed = this.files.parseLACube('laFileData');
						break;
			case 'labin': parsed = this.files.parseLABin('laFileData');
						break;
		}
		if (parsed) {
			this.title.value = this.inputs.lutAnalyst.getTitle();
			this.inputs.lutAnalyst.updateLATF();
			this.inputs.lutAnalyst.updateLACS();
			this.tweakCheck.checked = true;
			this.tweakCheck.className = 'twk-checkbox';
			this.toggleTweak();
		} else {
			this.reset();
		}
	}
}
TWKLA.prototype.testGamma = function() {
	if (this.gammaSelect.options[this.gammaSelect.options.selectedIndex].value == '9999') {
		this.linGammaBox.className = 'twk-tab';
	} else {
		this.linGammaBox.className = 'twk-tab-hide';
	}
}
TWKLA.prototype.doStuff = function() {
	this.cleanTitle();
	this.inputs.lutAnalyst.getTF();
}
TWKLA.prototype.doneStuff = function() {
	this.tweakCheck.checked = true;
	this.tweakCheck.className = 'twk-checkbox';
	this.doButton.value = 'Re-Analyse';
	this.storeButton.className = 'twk-button';
    if (!this.inputs.isApp) {
        this.storeBinButton.className = 'twk-button';
    }
	this.toggleTweak();
}
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
	this.gammaSelect.options[0].selected = true;
	this.linGammaSelect.options[0].selected = true;

	this.doButton.value = 'Analyse';

	this.startBox.className = 'twk-tab';
	this.analysisBox.className = 'twk-tab-hide';
	this.linGammaBox.className = 'twk-tab-hide';

	this.backButton.className = 'twk-button-hide';
	this.storeButton.className = 'twk-button-hide';
	this.storeBinButton.className = 'twk-button-hide';
	this.doButton.className = 'twk-button-hide';
}
TWKLA.prototype.store = function(cube) {
	if (cube) {
		this.files.buildLALut(
			this.title.value,
			this.inputs.lutAnalyst.getL(),
			this.inputs.lutAnalyst.getRGB()
		);
	} else {
		this.files.buildLABinary(
			this.title.value,
			this.inputs.lutAnalyst.getL(),
			this.inputs.lutAnalyst.getRGB()
		);
	}
/*
	this.files.buildLA1DMethod(
		this.title.value,
		this.inputs.lutAnalyst.getL()
	);
*/
}
TWKLA.prototype.cleanTitle = function() {
	this.title.value = this.title.value.replace(/[/"/']/gi, '');
	if (parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].value) === this.inputs.gammaLA) {
		this.inputs.outGamma.options[this.inputs.outGamma.options.length - 1].innerHTML = 'LA - ' + this.title.value;
	}
	if (parseInt(this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].value) === this.inputs.gamutLA) {
		this.inputs.outGamut.options[this.inputs.outGamut.options.length - 1].innerHTML = 'LA - ' + this.title.value;
	}
	if (parseInt(this.inputs.twkHGSelect.options[this.inputs.twkHGSelect.options.length - 1].value) === this.inputs.gamutLA) {
		this.inputs.twkHGSelect.options[this.inputs.twkSelect.options.length - 1].innerHTML = 'LA - ' + this.title.value;
	}
}
