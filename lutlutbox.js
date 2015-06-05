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
function LUTLutBox(fieldset, inputs, message, formats) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.catList = [];
	this.message = message;
	this.p = 4;
	this.message.addUI(this.p,this);
	this.formats = formats;
	this.fieldSet = fieldset;
	this.io();
	this.ui();
	fieldset.appendChild(this.box);
}
LUTLutBox.prototype.getFieldSet = function() {
	return this.fieldSet;
}
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
	this.inputs.addInput('dimension',[this.lutOne[0],this.lutOne[1],this.lutThree[0],this.lutThree[1],this.lutThree[2]]);	
	this.inputs.addInput('dimensionLabel',[this.lutOneLabel[0],this.lutOneLabel[1],this.lutThreeLabel[0],this.lutThreeLabel[1],this.lutThreeLabel[2]]);	
	this.lutInLegal = this.createRadioElement('inrange', false);
	this.lutInData = this.createRadioElement('inrange', true);
	this.inputs.addInput('inRange',[this.lutInLegal,this.lutInData]);	
	this.lutOutLegal = this.createRadioElement('outrange', false);
	this.lutOutData = this.createRadioElement('outrange', true);
	this.inputs.addInput('outRange',[this.lutOutLegal,this.lutOutData]);	
	this.gradeOpt = this.createRadioElement('lutusage', true);
	this.mlutOpt = this.createRadioElement('lutusage', false);
	this.inputs.addInput('lutUsage',[this.gradeOpt,this.mlutOpt]);
	this.lutClipCheck = document.createElement('input');
	this.inputs.addInput('clipCheck',this.lutClipCheck);
}
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
	this.lutUsage.appendChild(document.createElement('label').appendChild(document.createTextNode('Camera LUT (MLUT)')));
	this.lutUsage.appendChild(document.createElement('br'));
	this.box.appendChild(this.lutUsage);
	// LUT type selections
	this.lutType = document.createElement('div');
	this.lutType.setAttribute('class','emptybox');
	this.lutType.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Type')));
	this.lutType.appendChild(this.inputs.gradeSelect);
	this.lutType.appendChild(this.inputs.mlutSelect);
	this.lutUsage.appendChild(this.lutType);
	// 0-1.0 hard clip checkbox
	this.lutClip = document.createElement('div');
	this.lutClip.setAttribute('class','emptybox');
	this.lutClip.appendChild(document.createElement('label').appendChild(document.createTextNode('Hard Clip 0-1.0')));
	this.lutClipCheck.setAttribute('type','checkbox');
	this.lutClipCheck.checked = false;
	this.lutClip.appendChild(this.lutClipCheck);
	this.lutUsage.appendChild(document.createElement('br'));
	this.lutUsage.appendChild(this.lutClip);
}
// Set Up Data
LUTLutBox.prototype.cleanName = function() {
	this.lutName.value = this.lutName.value.replace(/[/"/']/gi, '');
}
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
}
// Event Responses
LUTLutBox.prototype.changeGamma = function() {
	this.formats.updateOptions();
}
LUTLutBox.prototype.gotGammaLists = function(catList) {
	this.catList = catList;
}
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
}
