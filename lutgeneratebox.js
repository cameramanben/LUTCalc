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
	this.io();
	this.ui();
	lutcalcReady(this.p);
}
LUTGenerateBox.prototype.io = function() {
	this.genButton = document.createElement('input');
	this.genButton.setAttribute('type','button');
	this.genButton.value = 'Generate LUT';
	this.saveButton = document.createElement('input');
	this.saveButton.setAttribute('type','button');
	this.saveButton.value = 'Save Settings';
	this.loadButton = document.createElement('input');
	this.loadButton.setAttribute('type','button');
	this.loadButton.value = 'Load Settings';
	this.fileInput = document.createElement('input');
	this.fileInput.setAttribute('type','file');
	this.inputs.addInput('settingsData',{});
};
LUTGenerateBox.prototype.ui = function() {
	this.box.appendChild(this.genButton);
	this.box.appendChild(this.saveButton);
	this.box.appendChild(this.loadButton);
	this.fileInput.style.display = 'none';
	this.box.appendChild(this.fileInput);
	this.fieldset.id = 'genbutton';
	this.fieldset.appendChild(this.box);
};
LUTGenerateBox.prototype.events = function() {
	this.genButton.onclick = function(here){ return function(){
		here.generate();
	};}(this);
	this.saveButton.onclick = function(here){ return function(){
		here.file.save(here.messages.getSettings(),new Date().toJSON().slice(0,10),'lutcalc');
	};}(this);
	this.loadButton.onclick = function(here){ return function(){
		var e = new MouseEvent('click');
		here.fileInput.dispatchEvent(e);
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
};
LUTGenerateBox.prototype.getBox = function() {
	return { box: this.box, button: this.genButton };
};
LUTGenerateBox.prototype.gotBaseIRE = function(baseIRE) {
	this.baseIRE = baseIRE;
};
LUTGenerateBox.prototype.generate = function() {
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
			this.messages.gaTx(this.p,1,{start: start,vals: (this.dimension-start),dim: this.dimension});
		} else {
			this.messages.gaTx(this.p,1,{start: start,vals: chunk,dim: this.dimension});
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
		this.messages.gaTx(this.p,3,{R:R, G:G, B:B, vals:chunk, dim:this.dimension});
	}
};
LUTGenerateBox.prototype.got1D = function(d) {
	var o = new Float64Array(d.o);
	this.lut.set(o, d.start*3);
	this.lT += d.vals;
	if (this.lT === this.dimension) {
		this.lT = 0;
		this.formats.output(this.lut.buffer);
	}
};
LUTGenerateBox.prototype.got3D = function(d) {
	var o = new Float64Array(d.o);
	this.lut.set(o, d.vals*d.B*3);
	this.lT++;
	if (this.lT === this.dimension) {
		this.lT = 0;
		this.formats.output(this.lut.buffer);
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
