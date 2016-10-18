/* twk-sampler.js
* pixel RGB values sampler tool from the preview window.
* 9th October 2016
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKSampler(tweaksBox, inputs, messages, files) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.files = files;
	this.p = 15;
	this.messages.addUI(this.p,this);
	this.titles = [];
	this.gridsX = [];
	this.gridsY = [];
	this.sampleData = [];
	this.gridX = [];
	this.gridY = [];
	this.sampleSet = 1;
	this.io();
	this.ui();
	this.events();
}
TWKSampler.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	// Set Grid Button
	this.setGrid = false;
	this.setGridButton = document.createElement('input');
	this.setGridButton.setAttribute('type','button');
	this.setGridButton.value = 'Set Sample Grid';
	// Set Sample Button
	this.setSample = false;
	this.setSampleButton = document.createElement('input');
	this.setSampleButton.setAttribute('type','button');
	this.setSampleButton.value = 'Start Click To Add Sample Point';
	// Reset Grid Button
	this.resetGridButton = document.createElement('input');
	this.resetGridButton.setAttribute('type','button');
	this.resetGridButton.value = 'Reset Grid';
	this.resetGridButton.disabled = true;
	// Separator options
	this.compSep = document.createElement('select');
	this.sampSep = document.createElement('select');
	var seps = [ ',',' ',"\t","\n" ];
	var sepNames = [ 'Comma','Space','Tab','New Line' ];
	var m = seps.length;
	for (var j=0; j<m; j++) {
		var opt1 = document.createElement('option');
		opt1.value = seps[j];
		opt1.innerHTML = sepNames[j];
		if (seps[j] === "\t") {
			opt1.selected = true;
		}
		this.compSep.appendChild(opt1);
		var opt2 = document.createElement('option');
		opt2.value = seps[j];
		opt2.innerHTML = sepNames[j];
		if (seps[j] === "\n") {
			opt2.selected = true;
		}
		this.sampSep.appendChild(opt2);
	}
	// Include info
	this.gridInfoCheck = document.createElement('input');
	this.gridInfoCheck.setAttribute('type','checkbox');
	this.gridInfoCheck.className = 'twk-checkbox';
	this.gridInfoCheck.checked = false;
	// Sample Depth
	this.sampDepth = document.createElement('select');
	var depths = [8,10,12,0];
	var depthNames = ['8-bit','10-bit','12-bit','Floating Point'];
	var m = depths.length;
	for (var j=0; j<m; j++) {
		var opt3 = document.createElement('option');
		opt3.value = depths[j];
		opt3.innerHTML = depthNames[j];
		if (depths[j] === 8) {
			opt3.selected = true;
		}
		this.sampDepth.appendChild(opt3);
	}
	// Take Samples Button
	this.sampleButton = document.createElement('input');
	this.sampleButton.setAttribute('type','button');
	this.sampleButton.id = 'twk-sampler-button';
	this.sampleButton.value = 'Take Sample Set';
	this.sampleButton.disabled = true;
	// Samples Filename
	this.fileName = document.createElement('input');
	this.fileName.setAttribute('type','text');
	this.fileName.setAttribute('class','textinput');
	this.fileName.value = 'Samples';
	// Save Samples Button
	this.saveSamplesButton = document.createElement('input');
	this.saveSamplesButton.setAttribute('type','button');
	this.saveSamplesButton.value = 'Save Samples';
	this.saveSamplesButton.disabled = true;
	// Clear Data Button
	this.clearDataButton = document.createElement('input');
	this.clearDataButton.setAttribute('type','button');
	this.clearDataButton.value = 'Clear Sample Data';
	this.clearDataButton.disabled = true;
};
TWKSampler.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('RGB Sampler')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements
	this.box.appendChild(this.setGridButton);
	this.box.appendChild(document.createElement('br'));
	this.gridBox = document.createElement('div');
	this.gridBox.className = 'twk-tab-hide';
	this.gridBox.appendChild(this.setSampleButton);
	this.gridBox.appendChild(this.resetGridButton);
	this.box.appendChild(this.gridBox);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('File Name')));
	this.box.appendChild(this.fileName);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Component Separator')));
	this.box.appendChild(this.compSep);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Sample Separator')));
	this.box.appendChild(this.sampSep);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Sample Precision')));
	this.box.appendChild(this.sampDepth);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Include Grid Coordinates')));
	this.box.appendChild(this.gridInfoCheck);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(this.sampleButton);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(this.saveSamplesButton);
	this.box.appendChild(this.clearDataButton);
	this.box.appendChild(document.createElement('br'));
	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKSampler.prototype.toggleTweaks = function() {
	if (this.inputs.tweaks.checked && this.inputs.showPreview) {
		if (this.inputs.outGamma.options[this.inputs.outGamma.selectedIndex].lastChild.nodeValue !== 'Null') {
			this.holder.className = 'tweakholder';
		} else {
			this.holder.className = 'tweakholder-hide';
			this.tweakCheck.checked = false;
		}
	} else {
		this.holder.className = 'tweakholder-hide';
		this.tweakCheck.checked = false;
	}
	this.toggleTweak();
};
TWKSampler.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
};
TWKSampler.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKSampler.prototype.getCSParams = function(params) {
	// No Relevant Parameters For This Tweak
};
TWKSampler.prototype.setParams = function(params) {
	if (typeof params.twkSampler !== 'undefined') {
		var p = params.twkSampler;
		this.toggleTweaks();
	}
};
TWKSampler.prototype.getSettings = function(data) {
	// Nothing to see for now...
};
TWKSampler.prototype.setSettings = function(settings) {
	// Nothing to see for now...
};
TWKSampler.prototype.getInfo = function(info) {
	// Nothing to see for now...
};
TWKSampler.prototype.isCustomGamma = function() {
	return false;
};
TWKSampler.prototype.isCustomGamut = function() {
	return false;
};
TWKSampler.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.setGridButton.onclick = function(here){ return function(){
		here.toggleGrid();
	};}(this);
	this.resetGridButton.onclick = function(here){ return function(){
		here.resetGrid();
	};}(this);
	this.setSampleButton.onclick = function(here){ return function(){
		here.toggleSample();
	};}(this);
	this.sampleButton.onclick = function(here){ return function(){
		here.getSamples();
	};}(this);
	this.fileName.onchange = function(here){ return function(){
		here.fileName.value = here.files.filename(here.fileName.value);
	};}(this);
	this.saveSamplesButton.onclick = function(here){ return function(){
		here.saveSamples();
	};}(this);
	this.clearDataButton.onclick = function(here){ return function(){
		here.clearData();
	};}(this);
};
// Tweak-Specific Code
TWKSampler.prototype.toggleGrid = function() {
	if (this.setGrid) {
		this.setGridButton.value = 'Set Sample Grid';
		this.gridBox.className = 'twk-tab-hide';
		this.inputs.samplerCanvas.style.display = 'none';
		this.setGrid = false;
	} else {
		this.setGridButton.value = 'Hide Sample Grid';
		this.gridBox.className = 'twk-tab';
		this.inputs.samplerCanvas.style.display = 'block';
		this.setGrid = true;
	}
};
TWKSampler.prototype.toggleSample = function() {
	if (this.setSample) {
		this.setSampleButton.value = 'Start Click To Add Sample Point';
		this.setSample = false;
	} else {
		this.setSampleButton.value = 'Stop Click To Add Sample Point';
		this.setSample = true;
		this.messages.takePreviewClick(1);
	}
};
TWKSampler.prototype.resetGrid = function() {
	this.gridX = [];
	this.gridY = [];
	this.inputs.samplerCtx.clearRect(0, 0, this.inputs.samplerCanvas.width, this.inputs.samplerCanvas.height);
	this.resetGridButton.disabled = true;
	this.sampleButton.disabled = true;
};
TWKSampler.prototype.getSamples = function() {
	var data = this.messages.getSamples(this.gridX,this.gridY);
	this.titles.push(data.title);
	this.gridsX.push(new Float64Array(this.gridX));
	this.gridsY.push(new Float64Array(this.gridY));
	this.sampleData.push(data.samples);
	this.sampleSet++;
	this.sampleButton.value = 'Take Sample Set ' + this.sampleSet.toString();
	if (this.clearDataButton.disabled) {
		this.clearDataButton.disabled = false;
		this.saveSamplesButton.disabled = false;
	}
};
TWKSampler.prototype.clearData = function() {
	this.titles = [];
	this.grids = [];
	this.sampleData = [];
	this.sampleSet = 1;
	this.sampleButton.value = 'Take Sample Set';
	this.saveSamplesButton.disabled = true;
	this.clearDataButton.disabled = true;
};
TWKSampler.prototype.previewSample = function(x,y) {
	if (this.tweakCheck.checked && this.setSample) {
		var rect = this.inputs.previewCanvas.getBoundingClientRect();
		x = (x - rect.left)/rect.width;
		y = (y - rect.top)/rect.height;
		this.gridX.push(x);
		this.gridY.push(y);
		x *= parseInt(this.inputs.samplerCanvas.width);
		y *= parseInt(this.inputs.samplerCanvas.height);
		this.inputs.samplerCtx.beginPath();
		this.inputs.samplerCtx.strokeStyle = '#00ffff';
		this.inputs.samplerCtx.lineWidth = 2;
		this.inputs.samplerCtx.arc(x,y,14,0,2*Math.PI,false);
		this.inputs.samplerCtx.stroke();
		this.inputs.samplerCtx.fillStyle = '#00ffff';
		this.inputs.samplerCtx.font = '20px  "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif';
		this.inputs.samplerCtx.lineWidth = 1;
		this.inputs.samplerCtx.textBaseline = "middle";
		this.inputs.samplerCtx.textAlign = "center";
		this.inputs.samplerCtx.fillText(this.gridX.length,x,y);
		this.inputs.samplerCtx.stroke();		
		if (this.sampleButton.disabled) {
			this.resetGridButton.disabled = false;
			this.sampleButton.disabled = false;
		}
	}
};
TWKSampler.prototype.saveSamples = function() {
	var out = '';
	var d = parseInt(this.sampDepth.options[this.sampDepth.selectedIndex].value);
	if (d !== 0) {
		d = Math.pow(2,d)-1;
	}
	var cs = this.compSep.options[this.compSep.selectedIndex].value;
	var ss = this.sampSep.options[this.sampSep.selectedIndex].value;
	var gridInfo = this.gridInfoCheck.checked;
	var m = this.titles.length;
	var m2,k,data;
	for (var j=0; j<m; j++) {
		out += this.titles[j] + "\n";
		if (gridInfo) {
			out += 'GridX' + cs + 'GridY' + cs;
		}
		out += 'Red' + cs + 'Green' + cs + 'Blue' + ss
		data = this.sampleData[j];
		m2 = data.length/3;
		for (var i=0; i<m2; i++) {
			k = i*3;
			if (gridInfo) {
				out += this.gridsX[j][i].toFixed(4).toString() + cs + this.gridsY[j][i].toFixed(4).toString() + cs;
			}
			if (d === 0) {
				out += data[ k ].toFixed(8).toString() + cs;
				out += data[k+1].toFixed(8).toString() + cs;
				out += data[k+2].toFixed(8).toString() + ss;
			} else {
				out += Math.round(d*((data[ k ]*876)+64)/1023).toString() + cs;
				out += Math.round(d*((data[k+1]*876)+64)/1023).toString() + cs;
				out += Math.round(d*((data[k+2]*876)+64)/1023).toString() + ss;
			}
		}
		out += "\n";
	}
	this.files.save( out, this.fileName.value, 'txt', 2 );
};
