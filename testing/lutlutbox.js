/* lutlutbox.js
* LUT format and title options UI object for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTLutBox(fieldset, inputs, messages, formats) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.catList = [];
	this.messages = messages;
	this.p = 4;
	this.messages.addUI(this.p,this);
	this.formats = formats;
	this.fieldset = fieldset;
	this.io();
	this.ui();
	fieldset.appendChild(this.box);
	lutcalcReady(this.p);
}
LUTLutBox.prototype.getFieldSet = function() {
	return this.fieldset;
};
LUTLutBox.prototype.io = function() {
	this.lutName = document.createElement('input');
	this.inputs.addInput('name',this.lutName);
	this.lutOneD = this.createRadioElement('dims', false);
	this.lutThreeD = this.createRadioElement('dims', true);
	this.inputs.addInput('d',[this.lutOneD,this.lutThreeD]);
	this.oneD = document.createElement('span');
	this.inputs.addInput('oneDBox',this.oneD);
	this.threeD = document.createElement('span');
	this.inputs.addInput('threeDBox',this.threeD);
	this.lutOne = [];
	this.lutOneLabel = [];
	this.lutOne[0] = this.createRadioElement('dimension', true);
	this.lutOne[0].value = '1024';
	this.lutOneLabel[0] = document.createElement('label');
	this.lutOneLabel[0].appendChild(document.createTextNode('1024'));
	this.lutOne[1] = this.createRadioElement('dimension', false);
	this.lutOne[1].value = '4096';
	this.lutOneLabel[1] = document.createElement('label');
	this.lutOneLabel[1].appendChild(document.createTextNode('4096'));
	this.lutOne[2] = this.createRadioElement('dimension', false);
	this.lutOne[2].value = '16384';
	this.lutOneLabel[2] = document.createElement('label');
	this.lutOneLabel[2].appendChild(document.createTextNode('16384'));
	this.lutThree = [];
	this.lutThreeLabel = [];
	this.lutThree[0] = this.createRadioElement('dimension', false);
	this.lutThree[0].value = '17';
	this.lutThreeLabel[0] = document.createElement('label');
	this.lutThreeLabel[0].appendChild(document.createTextNode('17x17x17'));
	this.lutThree[1] = this.createRadioElement('dimension', false);
	this.lutThree[1].value = '33';
	this.lutThree[1].checked = true;
	this.lutThreeLabel[1] = document.createElement('label');
	this.lutThreeLabel[1].appendChild(document.createTextNode('33x33x33'));
	this.lutThree[2] = this.createRadioElement('dimension', false);
	this.lutThree[2].value = '65';
	this.lutThreeLabel[2] = document.createElement('label');
	this.lutThreeLabel[2].appendChild(document.createTextNode('65x65x65'));
	this.inputs.addInput('dimension',[this.lutOne[0],this.lutOne[1],this.lutOne[2],this.lutThree[0],this.lutThree[1],this.lutThree[2]]);	
	this.inputs.addInput('dimensionLabel',[this.lutOneLabel[0],this.lutOneLabel[1],this.lutOneLabel[2],this.lutThreeLabel[0],this.lutThreeLabel[1],this.lutThreeLabel[2]]);	
	this.lutInLegal = this.createRadioElement('inrange', false);
	this.lutInData = this.createRadioElement('inrange', true);
	this.inputs.addInput('inRange',[this.lutInLegal,this.lutInData]);	
	this.lutOutLegal = this.createRadioElement('outrange', false);
	this.lutOutData = this.createRadioElement('outrange', true);
	this.inputs.addInput('outRange',[this.lutOutLegal,this.lutOutData]);	
	this.gradeOpt = this.createRadioElement('lutusage', true);
	this.mlutOpt = this.createRadioElement('lutusage', false);
	this.inputs.addInput('lutUsage',[this.gradeOpt,this.mlutOpt]);
	this.scaleBox = document.createElement('div');
	this.inputs.addInput('scaleBox',this.scaleBox);
	this.scaleMin = document.createElement('input');
	this.inputs.addInput('scaleMin',this.scaleMin);
	this.scaleMax = document.createElement('input');
	this.inputs.addInput('scaleMax',this.scaleMax);
	this.bitsBox = document.createElement('div');
	this.inputs.addInput('bitsBox',this.bitsBox);
	this.inBitsSelect = document.createElement('select');
	this.inputs.addInput('inBitsSelect',this.inBitsSelect);
	this.outBitsSelect = document.createElement('select');
	this.inputs.addInput('outBitsSelect',this.outBitsSelect);
	this.nikonBox = document.createElement('div');
	this.inputs.addInput('nikonBox',this.nikonBox);
	this.nikonBank = document.createElement('select');
	this.inputs.addInput('nikonBank',this.nikonBank);
	this.nikonShr = document.createElement('input');
	this.nikonShr.setAttribute('type','range');
	this.nikonShr.setAttribute('min',0);
	this.nikonShr.setAttribute('max',9);
	this.nikonShr.setAttribute('step',1);
	this.nikonShr.setAttribute('value',0);
	this.inputs.addInput('nikonShr',this.nikonShr);
	this.nikonShrLabel = document.createElement('label');
	this.nikonSat = document.createElement('input');
	this.nikonSat.setAttribute('type','range');
	this.nikonSat.setAttribute('min',-3);
	this.nikonSat.setAttribute('max',3);
	this.nikonSat.setAttribute('step',1);
	this.nikonSat.setAttribute('value',0);
	this.inputs.addInput('nikonSat',this.nikonSat);
	this.nikonSatLabel = document.createElement('label');
	this.nikonHue = document.createElement('input');
	this.nikonHue.setAttribute('type','range');
	this.nikonHue.setAttribute('min',-3);
	this.nikonHue.setAttribute('max',3);
	this.nikonHue.setAttribute('step',1);
	this.nikonHue.setAttribute('value',0);
	this.inputs.addInput('nikonHue',this.nikonHue);
	this.nikonHueLabel = document.createElement('label');
	this.lutClipCheck = document.createElement('input');
	this.inputs.addInput('clipCheck',this.lutClipCheck);
};
LUTLutBox.prototype.ui = function() {
	// LUT title / filename
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Title / Filename')));
	this.lutName.setAttribute('type','text');
	this.lutName.setAttribute('class','textinput');
	this.lutName.value = 'Custom LUT';
	this.box.appendChild(this.lutName);
	this.box.appendChild(document.createElement('br'));
	// 1D or 3D
	this.dims = document.createElement('span');
	this.dims.setAttribute('class','graybox');
	this.dims.appendChild(this.lutOneD);
	this.dims.appendChild(document.createElement('label').appendChild(document.createTextNode('1D')));
	this.dims.appendChild(this.lutThreeD);
	this.dims.appendChild(document.createElement('label').appendChild(document.createTextNode('3D')));
	this.box.appendChild(this.dims);
	// 1D size options
	this.oneD.setAttribute('class','graybox-hide');
	this.oneD.appendChild(this.lutOne[0]);
	this.oneD.appendChild(this.lutOneLabel[0]);
	this.oneD.appendChild(this.lutOne[1]);
	this.oneD.appendChild(this.lutOneLabel[1]);
	this.oneD.appendChild(this.lutOne[2]);
	this.oneD.appendChild(this.lutOneLabel[2]);
	this.box.appendChild(this.oneD);
	// 3D size options
	this.threeD.setAttribute('class','graybox');
	this.threeD.appendChild(this.lutThree[0]);
	this.threeD.appendChild(this.lutThreeLabel[0]);
	this.threeD.appendChild(this.lutThree[1]);
	this.threeD.appendChild(this.lutThreeLabel[1]);
	this.threeD.appendChild(this.lutThree[2]);
	this.threeD.appendChild(this.lutThreeLabel[2]);
	this.box.appendChild(this.threeD);
	this.box.appendChild(document.createElement('br'));
	// Input / output ranges
	this.lutRange = document.createElement('div');
	this.lutRange.setAttribute('class','graybox');
	this.lutRange.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Range:')));
	this.lutRange.appendChild(this.lutInLegal);
	this.lutRange.appendChild(document.createElement('label').appendChild(document.createTextNode('Legal')));
	this.lutRange.appendChild(this.lutInData);
	this.lutRange.appendChild(document.createElement('label').appendChild(document.createTextNode('Data')));
	this.lutRange.appendChild(document.createElement('br'));
	this.lutRange.appendChild(document.createElement('label').appendChild(document.createTextNode('Output Range:')));
	this.lutRange.appendChild(this.lutOutLegal);
	this.lutRange.appendChild(document.createElement('label').appendChild(document.createTextNode('Legal')));
	this.lutRange.appendChild(this.lutOutData);
	this.lutRange.appendChild(document.createElement('label').appendChild(document.createTextNode('Data')));
	this.box.appendChild(this.lutRange);
	this.box.appendChild(document.createElement('br'));
	// Grading LUT / MLUT radio boxes
	this.lutUsage = document.createElement('div');
	this.lutUsage.setAttribute('class','graybox');
	this.lutUsage.appendChild(this.gradeOpt);
	this.lutUsage.appendChild(document.createElement('label').appendChild(document.createTextNode('Grading LUT')));
	this.lutUsage.appendChild(this.mlutOpt);
	this.lutUsage.appendChild(document.createElement('label').appendChild(document.createTextNode('Camera / Monitor LUT (MLUT)')));
	this.lutUsage.appendChild(document.createElement('br'));
	this.box.appendChild(this.lutUsage);
	// LUT type selections
	this.lutType = document.createElement('div');
	this.lutType.setAttribute('class','emptybox');
	this.lutType.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Type')));
	this.lutType.appendChild(this.inputs.gradeSelect);
	this.lutType.appendChild(this.inputs.mlutSelect);
	this.lutUsage.appendChild(this.lutType);
	// LUT input scaling (useful for narrow range gammas such as Rec709 or linear)
	this.scaleBox.setAttribute('class','emptybox-hide');
	this.scaleBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Scaling:')));
	this.scaleBox.appendChild(document.createElement('label').appendChild(document.createTextNode(' Min')));
	this.scaleMin.setAttribute('type','number');
	this.scaleMin.setAttribute('step','any');
	this.scaleMin.className = 'ireinput';
	this.scaleMin.value = '0';
	this.scaleBox.appendChild(this.scaleMin);
	this.scaleBox.appendChild(document.createElement('label').appendChild(document.createTextNode(' Max')));
	this.scaleMax.setAttribute('type','number');
	this.scaleMax.setAttribute('step','any');
	this.scaleMax.className = 'ireinput';
	this.scaleMax.value = '1';
	this.scaleBox.appendChild(this.scaleMax);
	this.lutUsage.appendChild(this.scaleBox);
	// LUT integer bit depths for files which require it (eg 3dl)
	this.bitsBox.setAttribute('class','emptybox-hide');
	this.bitsBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Bits')));
	for (var j=10; j<18; j += 2) {
		var option1 = document.createElement('option');
		option1.value = j;
		option1.appendChild(document.createTextNode(j.toString() + ' (0-' + (Math.pow(2,j)-1).toString() + ')'));
		if (j === 10) {
			option1.selected = true;
		}
		var option2 = document.createElement('option');
		option2.value = j;
		option2.appendChild(document.createTextNode(j.toString() + ' (0-' + (Math.pow(2,j)-1).toString() + ')'));
		if (j === 12) {
			option2.selected = true;
		}
		this.inBitsSelect.appendChild(option1);
		this.outBitsSelect.appendChild(option2);
	}
	this.inBitsSelect.className = 'lut-opt';
	this.outBitsSelect.className = 'lut-opt';
	this.bitsBox.appendChild(this.inBitsSelect);
	this.bitsBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Output Bits')));
	this.bitsBox.appendChild(this.outBitsSelect);
	this.lutUsage.appendChild(this.bitsBox);
	// Nikon specific settings
	this.nikonBox.className = 'emptybox-hide';
	this.nikonBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Bank Number:')));
	for (var j=1; j<100; j++) {
		var option = document.createElement('option');
		option.value = j;
		option.appendChild(document.createTextNode(j.toString()));
		this.nikonBank.appendChild(option);
	}
	this.nikonBank.className = 'lut-opt';
	this.nikonBox.appendChild(this.nikonBank);
	this.nikonBox.appendChild(document.createElement('br'));
	this.nikonBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Sharpening:')));
	this.nikonBox.appendChild(this.nikonShr);
	this.nikonShrLabel.innerHTML = '0';
	this.nikonBox.appendChild(this.nikonShrLabel);
	this.nikonBox.appendChild(document.createElement('br'));
	this.nikonBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Saturation:')));
	this.nikonBox.appendChild(this.nikonSat);
	this.nikonSatLabel.innerHTML = '0';
	this.nikonBox.appendChild(this.nikonSatLabel);
	this.nikonBox.appendChild(document.createElement('br'));
	this.nikonBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Hue:')));
	this.nikonBox.appendChild(this.nikonHue);
	this.nikonHueLabel.innerHTML = '0';
	this.nikonBox.appendChild(this.nikonHueLabel);
	this.lutUsage.appendChild(this.nikonBox);
	// 0-1.0 hard clip checkbox
	this.lutClip = document.createElement('div');
	this.lutClip.setAttribute('class','emptybox');
	this.lutClip.appendChild(document.createElement('label').appendChild(document.createTextNode('Hard Clip 0-1.0')));
	this.lutClipCheck.setAttribute('type','checkbox');
	this.lutClipCheck.checked = false;
	this.lutClip.appendChild(this.lutClipCheck);
	this.lutUsage.appendChild(document.createElement('br'));
	this.lutUsage.appendChild(this.lutClip);
};
LUTLutBox.prototype.events = function() {
	this.lutName.onchange = function(here){ return function(){
		here.cleanName();
		lutFile.filename();
	};}(this);
	this.lutClipCheck.onchange = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.lutOneD.onchange = function(here){ return function(){
		here.messages.oneOrThree();
	};}(this);
	this.lutThreeD.onchange = function(here){ return function(){
		here.messages.oneOrThree();
	};}(this);
	this.lutInLegal.onchange = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.lutInData.onchange = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.lutOutLegal.onchange = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.lutOutData.onchange = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.scaleMin.oninput = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.scaleMax.oninput = function(here){ return function(){
		here.messages.gaSetParams();
	};}(this);
	this.nikonShr.oninput = function(here){ return function(){
		here.nikonShrLabel.innerHTML = here.nikonShr.value;
	};}(this);
	this.nikonSat.oninput = function(here){ return function(){
		here.nikonSatLabel.innerHTML = here.nikonSat.value;
	};}(this);
	this.nikonHue.oninput = function(here){ return function(){
		here.nikonHueLabel.innerHTML = here.nikonHue.value;
	};}(this);
};
// Set Up Data
LUTLutBox.prototype.cleanName = function() {
	this.lutName.value = this.lutName.value.replace(/[/"/']/gi, '');
};
LUTLutBox.prototype.createRadioElement = function(name, checked) {
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
// Event Responses
LUTLutBox.prototype.changeGamma = function() {
	this.formats.updateOptions();
};
LUTLutBox.prototype.gotGammaLists = function() {
	this.catList = this.inputs.gammaCatList;
};
LUTLutBox.prototype.getSettings = function(data) {
	var m = this.inputs.dimension.length;
	var meshSize;
	for (var j=0; j<m; j++) {
		if (this.inputs.dimension[j].checked) {
			meshSize = parseInt(this.inputs.dimension[j].value);
			break;
		}
	}
	data.lutBox = {
		oneD: this.lutOneD.checked,
		meshSize: meshSize,
		legalIn: this.lutInLegal.checked,
		legalOut: this.lutOutLegal.checked,
		hardClip: this.lutClipCheck.checked,
		grading: this.gradeOpt.checked,
		gradeOption: this.inputs.gradeSelect.options[this.inputs.gradeSelect.selectedIndex].lastChild.nodeValue.replace(/ *\([^)]*\) */g, ""),
		mlutOption: this.inputs.mlutSelect.options[this.inputs.mlutSelect.selectedIndex].lastChild.nodeValue.replace(/ *\([^)]*\) */g, ""),
		scaleMin: parseFloat(this.scaleMin.value),
		scaleMax: parseFloat(this.scaleMax.value),
		inBits: parseFloat(this.inBitsSelect.options[this.inBitsSelect.selectedIndex].value),
		outBits: parseFloat(this.outBitsSelect.options[this.outBitsSelect.selectedIndex].value),
		nikonBank: parseInt(this.nikonBank.options[this.nikonBank.selectedIndex].value),
		nikonSharp: parseInt(this.nikonShr.value),
		nikonSat: parseInt(this.nikonSat.value),
		nikonHue: parseInt(this.nikonHue.value)
	};
};
LUTLutBox.prototype.setSettings = function(settings) {
	if (typeof settings.lutBox !== 'undefined') {
		var data = settings.lutBox;
		if (typeof data.oneD === 'boolean') {
			this.lutOneD.checked = data.oneD;
			this.lutThreeD.checked = !data.oneD;
		}
		if (typeof data.meshSize === 'number') {
			var m = this.inputs.dimension.length;
			for (var j=0; j<m; j++) {
				if (parseInt(this.inputs.dimension[j].value) === data.meshSize) {
					this.inputs.dimension[j].checked = true;
					break;
				}
			}
		}
		if (typeof data.legalIn === 'boolean') {
			this.lutInLegal.checked = data.legalIn;
			this.lutInData.checked = !data.legalIn;
		}
		if (typeof data.legalOut === 'boolean') {
			this.lutOutLegal.checked = data.legalOut;
			this.lutOutData.checked = !data.legalOut;
		}
		if (typeof data.hardClip === 'boolean') {
			this.lutClipCheck.checked = data.hardClip;
		}
		if (typeof data.scaleMin === 'number') {
			this.scaleMin.value = data.scaleMin;
		}
		if (typeof data.scaleMax === 'number') {
			this.scaleMax.value = data.scaleMax;
		}
		if (typeof data.inBits === 'number') {
			var m = this.inBitsSelect.options.length;
			for (var j=0; j<m; j++) {
				if (parseInt(this.inBitsSelect.options[j].value) === data.inBits) {
					this.inBitsSelect.options[j].selected = true;
				}
			}
		}
		if (typeof data.outBits === 'number') {
			var m = this.outBitsSelect.options.length;
			for (var j=0; j<m; j++) {
				if (parseInt(this.outBitsSelect.options[j].value) === data.outBits) {
					this.outBitsSelect.options[j].selected = true;
				}
			}
		}
		if (typeof data.nikonBank === 'number') {
			var m = this.nikonBank.options.length;
			for (var j=0; j<m; j++) {
				if (parseInt(this.nikonBank.options[j].value) === data.nikonBank) {
					this.nikonBank.options[j].selected = true;
				}
			}
		}
		if (typeof data.nikonSharp === 'number') {
			this.nikonShr.value = data.nikonSharp;
		}
		if (typeof data.nikonSat === 'number') {
			this.nikonSat.value = data.nikonSat;
		}
		if (typeof data.nikonSharp === 'number') {
			this.nikonHue.value = data.nikonHue;
		}
	}
};
LUTLutBox.prototype.getInfo = function(info) {
	info.name = this.lutName.value;
	if (this.lutOneD.checked) {
		info.oneD = true;
	} else {
		info.oneD = false;
	}
	var max = this.inputs.dimension.length;
	for (var j =0; j < max; j++) {
		if (this.inputs.dimension[j].checked) {
			info.dimension = parseInt(this.inputs.dimension[j].value);
			break;
		}
	}
	if (this.mlutOpt.checked) {
		info.mlut = true;
	} else {
		info.mlut = false;
	}
	if (this.lutClipCheck.checked) {
		info.hardClip = true;
	} else {
		info.hardClip = false;
	}
	if (this.lutInLegal.checked) {
		info.legalIn = true;
	} else {
		info.legalIn = false;
	}
	if (this.lutOutLegal.checked) {
		info.legalOut = true;
	} else {
		info.legalOut = false;
	}
	info.scaleMin = parseFloat(this.scaleMin.value);
	info.scaleMax = parseFloat(this.scaleMax.value);
	info.inBits = parseInt(this.inBitsSelect.options[this.inBitsSelect.options.selectedIndex].value);
	info.outBits = parseInt(this.outBitsSelect.options[this.outBitsSelect.options.selectedIndex].value);
	info.nikonBank = parseInt(this.nikonBank.options[this.nikonBank.options.selectedIndex].value);
	info.nikonSharp = parseInt(this.nikonShr.value);
	info.nikonSat = parseInt(this.nikonSat.value);
	info.nikonHue = parseInt(this.nikonHue.value);
};
