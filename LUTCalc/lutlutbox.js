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
function LUTLutBox(fieldset, inputs, message) {
	this.box = document.createElement('fieldset');
	this.inputs = inputs;
	this.catList = [];
	this.message = message;
	this.p = 4;
	this.message.addUI(this.p,this);
	this.fieldSet = fieldset;
	this.lutName = document.createElement('input');
	this.inputs.addInput('name',this.lutName);
	this.lutOneD = this.createRadioElement('dims', false);
	this.lutThreeD = this.createRadioElement('dims', true);
	this.inputs.addInput('d',[this.lutOneD,this.lutThreeD]);	
	this.lutOne1024 = this.createRadioElement('dimension', true);
	this.lutOne1024.value = '1024';
	this.lutOne4096 = this.createRadioElement('dimension', false);
	this.lutOne4096.value = '4096';
	this.lutThree17 = this.createRadioElement('dimension', false);
	this.lutThree17.value = '17';
	this.lutThree33 = this.createRadioElement('dimension', false);
	this.lutThree33.value = '33';
	this.lutThree65 = this.createRadioElement('dimension', false);
	this.lutThree65.value = '65';
	this.inputs.addInput('dimension',[this.lutOne1024,this.lutOne4096,this.lutThree17,this.lutThree33,this.lutThree65]);	
	this.lutInLegal = this.createRadioElement('inrange', false);
	this.lutInData = this.createRadioElement('inrange', true);
	this.inputs.addInput('inRange',[this.lutInLegal,this.lutInData]);	
	this.lutOutLegal = this.createRadioElement('outrange', false);
	this.lutOutData = this.createRadioElement('outrange', true);
	this.inputs.addInput('outRange',[this.lutOutLegal,this.lutOutData]);	
	this.lutMLUTCheck = document.createElement('input');
	this.inputs.addInput('mlutCheck',this.lutMLUTCheck);
	this.lutClipCheck = document.createElement('input');
	this.inputs.addInput('clipCheck',this.lutClipCheck);
	this.buildBox();
	fieldset.appendChild(this.box);
}
LUTLutBox.prototype.getFieldSet = function() {
	return this.fieldSet;
}
// Construct the UI Box
LUTLutBox.prototype.buildBox = function() {
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('LUT Title / Filename')));
	this.lutName.setAttribute('type','text');
	this.lutName.setAttribute('class','textinput');
	this.lutName.value = 'Custom LUT';
	this.box.appendChild(this.lutName);
	this.box.appendChild(document.createElement('br'));
	this.dims = document.createElement('span');
	this.dims.setAttribute('class','graybox');
	this.dims.appendChild(this.lutOneD);
	this.dims.appendChild(document.createElement('label').appendChild(document.createTextNode('1D')));
	this.dims.appendChild(this.lutThreeD);
	this.dims.appendChild(document.createElement('label').appendChild(document.createTextNode('3D')));
	this.box.appendChild(this.dims);
	this.oneD = document.createElement('span');
	this.oneD.setAttribute('class','graybox');
	this.oneD.appendChild(this.lutOne1024);
	this.oneD.appendChild(document.createElement('label').appendChild(document.createTextNode('1024')));
	this.oneD.appendChild(this.lutOne4096);
	this.oneD.appendChild(document.createElement('label').appendChild(document.createTextNode('4096')));
	this.box.appendChild(this.oneD);
	this.threeD = document.createElement('span');
	this.threeD.setAttribute('class','graybox');
	this.threeD.appendChild(this.lutThree17);
	this.threeD.appendChild(document.createElement('label').appendChild(document.createTextNode('17x17x17')));
	this.threeD.appendChild(this.lutThree33);
	this.threeD.appendChild(document.createElement('label').appendChild(document.createTextNode('33x33x33')));
	this.threeD.appendChild(this.lutThree65);
	this.threeD.appendChild(document.createElement('label').appendChild(document.createTextNode('65x65x65')));
	this.box.appendChild(this.threeD);
	this.box.appendChild(document.createElement('br'));
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
	this.lutMLUT = document.createElement('div');
	this.lutMLUT.setAttribute('class','graybox');
	this.lutMLUT.appendChild(document.createElement('label').appendChild(document.createTextNode('Camera MLUT (3D, Clip To 0-1.09)')));
	this.lutMLUTCheck.setAttribute('type','checkbox');
	this.lutMLUTCheck.checked = false;
	this.lutMLUT.appendChild(this.lutMLUTCheck);
	this.box.appendChild(this.lutMLUT);
	this.lutClip = document.createElement('div');
	this.lutClip.setAttribute('class','graybox');
	this.lutClip.appendChild(document.createElement('label').appendChild(document.createTextNode('Clip To 0-1.0')));
	this.lutClipCheck.setAttribute('type','checkbox');
	this.lutClipCheck.checked = false;
	this.lutClip.appendChild(this.lutClipCheck);
	this.box.appendChild(this.lutClip);
	this.oneOrThree();
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
LUTLutBox.prototype.oneOrThree = function() {
	if (this.lutOneD.checked)  {
		this.oneD.style.display = 'inline';
		this.threeD.style.display = 'none';
		this.lutOne1024.checked = true;
	} else {
		this.oneD.style.display = 'none';
		this.threeD.style.display = 'inline';
		this.lutThree33.checked = true;
	}
}
LUTLutBox.prototype.toggleMLUT = function() {
	if (this.lutMLUTCheck.checked) {
		this.lutThreeD.checked = true;
		this.lutInData.checked = true;
		this.lutOutLegal.checked = true;
		this.lutThree33.checked = true;
		this.oneOrThree();
		this.lutOneD.disabled = true;
		this.lutThreeD.disabled = true;
		this.lutInLegal.disabled = true;
		this.lutInData.disabled = true;
		this.lutOutLegal.disabled = true;
		this.lutOutData.disabled = true;
	} else {
		this.lutOneD.disabled = false;
		this.lutThreeD.disabled = false;
		this.lutInLegal.disabled = false;
		this.lutInData.disabled = false;
		this.lutOutLegal.disabled = false;
		this.lutOutData.disabled = false;
	}
}
LUTLutBox.prototype.changeGamma = function() {
	if (!this.lutMLUTCheck.checked) {
		var curOut = parseInt(this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].value);
		if (curOut === 9999) {
			curOut = parseInt(this.inputs.outLinGamma.options[this.inputs.outLinGamma.selectedIndex].value);
		}
		switch (this.catList[curOut]) {
			case 0:
			case 3:	this.lutInData.checked = true;
					this.lutOutData.checked = true;
					break;
			case 1:
			case 2:
			case 4:	this.lutInData.checked = true;
					this.lutOutLegal.checked = true;
					break;
		}
	}
}
LUTLutBox.prototype.gotGammaLists = function(catList) {
	this.catList = catList;
}
