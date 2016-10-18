/* lutgeneratebox.js
* 'Generate' button UI object and LUT construction code for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTGenerateBox(fieldset, inputs, messages, file, formats) {
	this.box = document.createElement('fieldset');
	this.fieldset = fieldset;
	this.inputs = inputs;
	this.messages = messages;
	this.p = 5;
	this.messages.addUI(this.p,this);
	this.lT = 0;
	this.dimension = 0;
	this.file = file;
	this.formats = formats;
	this.gamutInName = '';
	this.gamutOutName = '';
	this.gamutHGName = '';
	this.baseIRE = 0;
	this.setMin = -2;
	this.setMax = 2;
	this.setStep = 3;
	this.setPass = 1;
	this.setTotal = ((this.setMax - this.setMin)*this.setStep)+1;
	this.doSet = false;
	this.setVal = 0;
	this.currentName = '';
	this.currentStop = 0;
	this.io();
	this.ui();
	lutcalcReady(this.p);
}
LUTGenerateBox.prototype.io = function() {
	this.genButton = document.createElement('input');
	this.genButton.setAttribute('type','button');
	this.genButton.value = 'Generate LUT';
	this.genSetButton = document.createElement('input');
	this.genSetButton.setAttribute('type','button');
	this.genSetButton.value = 'Generate Set';
	this.goSetButton = document.createElement('input');
	this.goSetButton.setAttribute('type','button');
	this.goSetButton.value = 'Go';
	this.genSetMin = document.createElement('select');
	this.genSetMax = document.createElement('select');
	this.genSetStep = document.createElement('select');
	this.cancelSetButton = document.createElement('input');
	this.cancelSetButton.setAttribute('type','button');
	this.cancelSetButton.value = 'Cancel';
	this.cancelProgButton = document.createElement('input');
	this.cancelProgButton.setAttribute('type','button');
	this.cancelProgButton.value = 'Cancel';
	this.settingsButton = document.createElement('input');
	this.settingsButton.setAttribute('type','button');
	this.settingsButton.value = 'Settings';
	this.saveButton = document.createElement('input');
	this.saveButton.setAttribute('type','button');
	this.saveButton.value = 'Save Settings';
	this.loadButton = document.createElement('input');
	this.loadButton.setAttribute('type','button');
	this.loadButton.value = 'Load Settings';
	this.defButton = document.createElement('input');
	this.defButton.setAttribute('type','button');
	this.defButton.value = 'Set Default Options';
	this.defResetButton = document.createElement('input');
	this.defResetButton.setAttribute('type','button');
	this.defResetButton.value = 'Reset Defaults';
	this.doneButton = document.createElement('input');
	this.doneButton.setAttribute('type','button');
	this.doneButton.value = 'Done';
	this.inputs.addInput('settingsData',{});
	this.fileInput = document.createElement('input');
	this.fileInput.setAttribute('type','file');
};
LUTGenerateBox.prototype.ui = function() {
	this.box.appendChild(this.genButton);
	this.box.appendChild(this.genSetButton);
	this.fileInput.style.display = 'none';
	this.box.appendChild(this.settingsButton);
	this.box.appendChild(this.fileInput);
	this.fieldset.id = 'genbutton';
	this.fieldset.appendChild(this.box);
	this.buildSettingsPopup();
	this.buildGenSetPopup();
	this.buildSetProgressPopup();
};
LUTGenerateBox.prototype.events = function() {
	this.genButton.onclick = function(here){ return function(){
		here.generate();
	};}(this);
	this.genSetButton.onclick = function(here){ return function(){
		modalBox.className = 'modalbox';
		here.genSetHolder.className = 'lutset-popup';
	};}(this);
	this.goSetButton.onclick = function(here){ return function(e){
		here.genSetHolder.className = 'lutset-popup-hide';
		here.setProgHolder.className = 'setprog-popup';
		here.generateSet();
	};}(this);
	this.cancelSetButton.onclick = function(here){ return function(e){
		modalBox.className = 'modalbox-hide';
		here.genSetHolder.className = 'lutset-popup-hide';
		here.setProgHolder.className = 'setprog-popup-hide';
	};}(this);
	this.cancelProgButton.onclick = function(here){ return function(e){
		here.doSet = false;
		here.inputs.name.value = here.currentName;
		here.inputs.stopShift.value = here.currentStop;
		modalBox.className = 'modalbox-hide';
		here.setProgHolder.className = 'setprog-popup-hide';
	};}(this);
	this.settingsButton.onclick = function(here){ return function(){
		modalBox.className = 'modalbox';
		here.settingsHolder.className = 'settings-popup';
	};}(this);
	this.saveButton.onclick = function(here){ return function(){
		here.file.save(here.messages.getSettings(),new Date().toJSON().slice(0,10),'lutcalc',3);
	};}(this);
	this.loadButton.onclick = function(here){ return function(){
		if (here.inputs.isApp) {
			here.loadSettings();
		} else {
			var e = new MouseEvent('click');
			here.fileInput.dispatchEvent(e);
		}
	};}(this);
	if (this.inputs.isApp) {
		this.fileInput.onclick = function(here){ return function(){
			here.loadSettings();
		};}(this);
	} else {
		this.fileInput.onchange = function(here){ return function(){
			here.loadSettings();
		};}(this);
	}
	this.doneButton.onclick = function(here){ return function(e){
		modalBox.className = 'modalbox-hide';
		here.settingsHolder.className = 'settings-popup-hide';
	};}(this);
};
LUTGenerateBox.prototype.getBox = function() {
	return { box: this.box, button: this.genButton };
};
LUTGenerateBox.prototype.gotBaseIRE = function(baseIRE) {
	this.baseIRE = baseIRE;
};
LUTGenerateBox.prototype.generate = function() {
	this.doSet = false;
	this.inputs.doSaveDialog = 1;
	if (this.inputs.d[0].checked) {
		this.oneDLUT();
	} else {
		this.threeDLUT();
	}
};
LUTGenerateBox.prototype.generateSet = function() {
	this.doSet = true;
	this.inputs.doSaveDialog = 2;
	this.currentName = this.inputs.name.value;
	this.currentStop = this.inputs.stopShift.value;
	this.setMin = parseFloat(this.genSetMin.options[this.genSetMin.selectedIndex].value);
	this.setMax = parseFloat(this.genSetMax.options[this.genSetMax.selectedIndex].value);
	this.setStep = parseFloat(this.genSetStep.options[this.genSetStep.selectedIndex].value);
	this.setVal = this.setMin;
	this.setPass = 1;
	this.setTotal = ((this.setMax - this.setMin)*this.setStep)+1;
	this.inputs.stopShift.value = Math.round(this.setVal*100)/100;
	if (this.setVal < -0.000001 || setVal > 0.000001) {
		this.inputs.name.value = this.currentName + '_' + this.setVal.toFixed(2).toString().replace('.','p');
	} else {
		this.inputs.name.value = this.currentName + '_' +'0-Native';
	}
	this.setProgText.innerHTML = 'Generating Set - File ' + this.setPass.toString() + ' Of ' + this.setTotal.toString();
	if (this.inputs.d[0].checked) {
		this.oneDLUT();
	} else {
		this.threeDLUT();
	}
};
LUTGenerateBox.prototype.oneDLUT = function() {
	this.dimension = 1024;
	var max = this.inputs.dimension.length;
	for (var i=0; i<max; i++) {
		if (this.inputs.dimension[i].checked) {
			this.dimension = parseInt(this.inputs.dimension[i].value);
			break;
		}
	}
	this.lut = new Float64Array(((this.dimension)*3));
	var chunks = 2;
	var chunk = parseInt(this.dimension / chunks);
	for (var j=0; j<chunks; j++) {
		var start = chunk*j;
		if ((start + chunk) > this.dimension) {
			if (this.doSet) {
				this.messages.gaTx(this.p,1,{start: start,vals: (this.dimension-start),dim: this.dimension, eiMult: Math.pow(2,this.setVal)});
			} else {
				this.messages.gaTx(this.p,1,{start: start,vals: (this.dimension-start),dim: this.dimension});
			}
		} else {
			if (this.doSet) {
				this.messages.gaTx(this.p,1,{start: start,vals: chunk,dim: this.dimension, eiMult: Math.pow(2,this.setVal)});
			} else {
				this.messages.gaTx(this.p,1,{start: start,vals: chunk,dim: this.dimension});
			}
		}
	}
};
LUTGenerateBox.prototype.threeDLUT = function() {
	this.dimension = 33;
	var max = this.inputs.dimension.length;
	for (var i=0; i<max; i++) {
		if (this.inputs.dimension[i].checked) {
			this.dimension = parseInt(this.inputs.dimension[i].value);
			break;
		}
	}
	var chunks = this.dimension;
	var chunk = this.dimension * this.dimension;
	this.lut = new Float64Array(chunk*chunks*3);
	for (var j=0; j<chunks; j++) {
		var R = 0;
		var G = 0;
		var B = j;
		if (this.doSet) {
			this.messages.gaTx(this.p,3,{R:R, G:G, B:B, vals:chunk, dim:this.dimension, eiMult: Math.pow(2,this.setVal)});
		} else {
			this.messages.gaTx(this.p,3,{R:R, G:G, B:B, vals:chunk, dim:this.dimension});
		}
	}
};
LUTGenerateBox.prototype.got1D = function(d) {
	var o = new Float64Array(d.o);
	this.lut.set(o, d.start*3);
	this.lT += d.vals;
	if (this.lT === this.dimension) {
		this.lT = 0;
		this.formats.output(this.lut.buffer);
		if (!this.inputs.isApp && !this.inputs.isChromeApp) {
			if (this.doSet && this.setPass < this.setTotal) {
				this.setVal += 1/this.setStep;
				this.setPass++;
				this.inputs.stopShift.value = Math.round(this.setVal*100)/100;
				if (this.setVal < -0.000001 || this.setVal > 0.000001) {
					this.inputs.name.value = this.currentName + '_' + this.setVal.toFixed(2).toString().replace('.','p');
				} else {
					this.inputs.name.value = this.currentName + '_' +'0-Native';
				}
				this.setProgText.innerHTML = 'Generating Set - File ' + this.setPass.toString() + ' Of ' + this.setTotal.toString();
				this.oneDLUT();
			} else {
				if (this.doSet) {
					this.inputs.name.value = this.currentName;
					this.inputs.stopShift.value = this.currentStop;
				}
				this.doSet = false;
				this.setVal = this.setMin;
				this.setPass = 1;
				modalBox.className = 'modalbox-hide';
				this.setProgHolder.className = 'setprog-popup-hide';
			}
		}
	}
};
LUTGenerateBox.prototype.got3D = function(d) {
	var o = new Float64Array(d.o);
	this.lut.set(o, d.vals*d.B*3);
	this.lT++;
	if (this.lT === this.dimension) {
		this.lT = 0;
		this.formats.output(this.lut.buffer);
		if (!this.inputs.isApp && !this.inputs.isChromeApp) {
			if (this.doSet && this.setPass < this.setTotal) {
				this.setVal += 1/this.setStep;
				this.setPass++;
				this.inputs.stopShift.value = Math.round(this.setVal*100)/100;
				if (this.setVal < -0.000001 || this.setVal > 0.000001) {
					this.inputs.name.value = this.currentName + '_' + this.setVal.toFixed(2).toString().replace('.','p');
				} else {
					this.inputs.name.value = this.currentName + '_' +'0-Native';
				}
				this.setProgText.innerHTML = 'Generating Set - File ' + this.setPass.toString() + ' Of ' + this.setTotal.toString();
				this.threeDLUT();
			} else {
				if (this.doSet) {
					this.inputs.name.value = this.currentName;
					this.inputs.stopShift.value = this.currentStop;
				}
				this.doSet = false;
				this.setVal = this.setMin;
				this.setPass = 1;
				modalBox.className = 'modalbox-hide';
				this.setProgHolder.className = 'setprog-popup-hide';
			}
		}
	}
};
LUTGenerateBox.prototype.saved = function(success) {
	if (this.inputs.isApp || this.inputs.isChromeApp) {
		if (success && this.doSet && this.setPass < this.setTotal) {
			this.inputs.doSaveDialog = 0;
			this.setVal += 1/this.setStep;
			this.setPass++;
			this.inputs.stopShift.value = Math.round(this.setVal*100)/100;
			if (this.setVal < -0.000001 || this.setVal > 0.000001) {
				this.inputs.name.value = this.currentName + '_' + this.setVal.toFixed(2).toString().replace('.','p');
			} else {
				this.inputs.name.value = this.currentName + '_' +'0-Native';
			}
			this.setProgText.innerHTML = 'Generating Set - File ' + this.setPass.toString() + ' Of ' + this.setTotal.toString();
			if (this.inputs.d[0].checked) {
				this.oneDLUT();
			} else {
				this.threeDLUT();
			}
		} else {
			if (this.doSet) {
				this.inputs.name.value = this.currentName;
				this.inputs.stopShift.value = this.currentStop;
			}
			this.doSet = false;
			this.inputs.doSaveDialog = 1;
			this.setVal = this.setMin;
			this.setPass = 1;
			modalBox.className = 'modalbox-hide';
			this.setProgHolder.className = 'setprog-popup-hide';
		}
	}
};
LUTGenerateBox.prototype.loadSettings = function() {
	if (this.inputs.isApp || this.fileInput.value !== '') {
		this.file.loadLUTFromInput(this.fileInput, ['lutcalc'], [true], 'settingsData', this, 0);
	}
};
LUTGenerateBox.prototype.followUp = function(d) {
	switch (d) {
        case 0: this.messages.setSettings();
			break;
	}
};
LUTGenerateBox.prototype.buildSettingsPopup = function() {
	this.settingsHolder = document.createElement('div');
	this.settingsHolder.className = 'settings-popup-hide';
	this.settingsBox = document.createElement('div');
	this.settingsBox.className = 'popup';
	this.settingsBox.appendChild(this.saveButton);
	this.settingsBox.appendChild(this.loadButton);
	this.settingsBox.appendChild(document.createElement('br'));
	this.settingsBox.appendChild(this.doneButton);
	this.settingsHolder.appendChild(this.settingsBox);
	modalBox.appendChild(this.settingsHolder);
};
LUTGenerateBox.prototype.buildGenSetPopup = function() {
	for (var j=0; j<4; j++) {
		var minOpt = document.createElement('option');
		minOpt.value = j-4;
		minOpt.innerHTML = (j-4).toString();
		if ((j-4) === this.setMin) {
			minOpt.selected = true;
		}
		this.genSetMin.appendChild(minOpt);
		var maxOpt = document.createElement('option');
		maxOpt.value = j+1;
		maxOpt.innerHTML = (j+1).toString();
		if ((j+1) === this.setMax) {
			maxOpt.selected = true;
		}
		this.genSetMax.appendChild(maxOpt);
		var stepOpt = document.createElement('option');
		stepOpt.value = j+1;
		if (j === 0 ) {
			stepOpt.innerHTML = '1';
		} else {
			stepOpt.innerHTML = '1/' + (j+1).toString();
		}
		if ((j+1) === this.setStep) {
			stepOpt.selected = true;
		}
		this.genSetStep.appendChild(stepOpt);
	}
	this.genSetHolder = document.createElement('div');
	this.genSetHolder.className = 'lutset-popup-hide';
	this.genSetBox = document.createElement('div');
	this.genSetBox.className = 'popup';
	this.genSetBox.appendChild(document.createTextNode('Stop Shift Minimum'));
	this.genSetBox.appendChild(this.genSetMin);
	this.genSetBox.appendChild(document.createElement('br'));
	this.genSetBox.appendChild(document.createTextNode('Stop Shift Maximum'));
	this.genSetBox.appendChild(this.genSetMax);
	this.genSetBox.appendChild(document.createElement('br'));
	this.genSetBox.appendChild(document.createTextNode('Step Size'));
	this.genSetBox.appendChild(this.genSetStep);
	this.genSetBox.appendChild(document.createTextNode('Stop'));
	this.genSetBox.appendChild(document.createElement('br'));
	this.genSetBox.appendChild(this.goSetButton);
	this.genSetBox.appendChild(this.cancelSetButton);
	this.genSetHolder.appendChild(this.genSetBox);
	modalBox.appendChild(this.genSetHolder);
};
LUTGenerateBox.prototype.buildSetProgressPopup = function() {
	this.setProgHolder = document.createElement('div');
	this.setProgHolder.className = 'setprog-popup-hide';
	this.setProgBox = document.createElement('div');
	this.setProgBox.className = 'popup';
	this.setProgText = document.createElement('p');
	this.setProgBox.appendChild(this.setProgText);
	this.setProgBox.appendChild(this.cancelProgButton);
	this.setProgHolder.appendChild(this.setProgBox);
	modalBox.appendChild(this.setProgHolder);
};
