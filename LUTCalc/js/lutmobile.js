/* lutmobile.js
* Menu and control objects for using the LUTCalc Web App on mobiles.
* 9th March 2017
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTMobile(fieldset, inputs, messages, modalBox, objects) {
	this.inputs = inputs;
	this.messages = messages;
	this.modalBox = modalBox;
	this.objects = objects;
	this.box = fieldset;
	this.p = 16;
	this.messages.addUI(this.p,this);
	this.io();
	this.ui();
}
LUTMobile.prototype.io = function() {
	// Main 'Hamburger' menu button
	this.menuButton = document.createElement('div');
	this.menuButton.id = 'mob-menu-button';
	this.menuButton.appendChild(document.createElement('div'));
	this.menuButton.appendChild(document.createElement('div'));
	this.menuButton.appendChild(document.createElement('div'));
	// Status text carrier
	this.statusText = document.createElement('span');
	this.statusText.id = 'mob-status-text';
	this.statusText.innerHTML = 'LUTCalc ' + this.inputs.version;
	// Preview toggle button
	this.preButton = document.createElement('div');
	this.preButton.className = 'mob-preview-icon';
	// Main menu options
	this.genButton = document.createElement('input');
	this.genButton.setAttribute('type','button');
	this.genButton.className = 'mob-button';
	this.genButton.value = 'Generate LUT';
	this.setButton = document.createElement('input');
	this.setButton.setAttribute('type','button');
	this.setButton.className = 'mob-button';
	this.setButton.value = 'Base Settings';
	this.twkButton = document.createElement('input');
	this.twkButton.setAttribute('type','button');
	this.twkButton.className = 'mob-button';
	this.twkButton.value = 'Adjustments';
	this.infButton = document.createElement('input');
	this.infButton.setAttribute('type','button');
	this.infButton.className = 'mob-button';
	this.infButton.value = 'Instructions';
	// Mobile-specific elements for the main DOM
	this.generateButton = document.createElement('input');
	this.generateButton.setAttribute('type','button');
	this.generateButton.className = 'mob-genbutton';
	this.generateButton.value = 'Generate LUT';
	// Get the DOM objects for each of the main options
	this.boxes = {
		cam: document.getElementById('box-cam'),
		gam: document.getElementById('box-gam'),
		twk: document.getElementById('box-twk'),
		lut: document.getElementById('box-lut'),
		pre: document.getElementById('box-pre'),
		inf: document.getElementById('box-inf'),
		rhs: document.getElementById('right')
	};
	// Get the DOM objects for each of the tweak options
	var twkBoxes = document.getElementById('tweaksholder').childNodes;
	var m = twkBoxes.length;
	for (var j=0; j<m; j++) {
		this.boxes['twk-' + j.toString()] = twkBoxes[j];
	}
	// Preview status
	this.show = false;
};
LUTMobile.prototype.ui = function() {
	// Create the status bar
	this.statusBox = document.createElement('div');
	this.statusBox.id = 'mob-status';
	this.statusBox.appendChild(this.menuButton);
	this.statusBox.appendChild(this.preButton);
	this.statusBox.appendChild(this.statusText);
	this.box.appendChild(this.statusBox);
	// Create the main menu
	this.menuBox = document.createElement('div');
	this.menuBox.className = 'mob-main-menu-hide';
	this.menuBox.appendChild(this.genButton);
	this.menuBox.appendChild(this.setButton);
	this.menuBox.appendChild(this.twkButton);
	this.menuBox.appendChild(this.infButton);
	this.modalBox.appendChild(this.menuBox);
	// Add mobile-specific elements to main DOM
	this.boxes.lut.appendChild(this.generateButton);
	// Set the current page
	this.cur = 'set';
	this.showCur();
};
LUTMobile.prototype.events = function() {
	this.menuButton.onclick = function(here){ return function(){
		here.cur = 'main';
		here.modalBox.className = 'modalbox';
		here.showCur();
	};}(this);
	this.preButton.onclick = function(here){ return function(){
		here.modalBox.className = 'modalbox-hide';
		here.togglePreview();
	};}(this);
	this.infButton.onclick = function(here){ return function(){
		here.cur = 'inf';
		here.modalBox.className = 'modalbox-hide';
		here.showCur();
	};}(this);
	this.genButton.onclick = function(here){ return function(){
		here.cur = 'lut';
		here.modalBox.className = 'modalbox-hide';
		here.showCur();
	};}(this);
	this.setButton.onclick = function(here){ return function(){
		here.cur = 'set';
		here.modalBox.className = 'modalbox-hide';
		here.showCur();
	};}(this);
	this.twkButton.onclick = function(here){ return function(){
		here.cur = 'twk';
		here.modalBox.className = 'modalbox-hide';
		here.showCur();
	};}(this);
	this.generateButton.onclick = function(here){ return function(){
		here.objects.generate.generate();
	};}(this);
};
// Mobile-specific
LUTMobile.prototype.togglePreview = function() {
	this.show = !this.show;
	if (this.show) {
		this.preButton.className = 'mob-chart-icon';
	} else {
		this.preButton.className = 'mob-preview-icon';
	}
	this.objects.preview.toggle(this.show);
	this.showCur();
};
LUTMobile.prototype.hideAll = function() {
	this.menuBox.className = 'mob-main-menu-hide';
	this.boxes.inf.className = 'shadowbox-mob-hide';
	this.boxes.lut.className = 'shadowbox-mob-hide';
	this.boxes.cam.className = 'shadowbox-mob-hide';
	this.boxes.gam.className = 'shadowbox-mob-hide';
	this.boxes.pre.className = 'shadowbox-hide';
	this.boxes.twk.className = 'shadowbox-mob-hide';
};
LUTMobile.prototype.desktopCur = function(opt) {
	this.cur = opt;
	switch (this.cur) {
		case 'inf':
			this.hideAll();
			this.objects.info.gammaInfoBut.className = 'base-button-hide-mob';
			this.objects.info.gammaChartBut.className = 'base-button-hide-mob';
			this.boxes.inf.className = 'shadowbox-mob';
			break;
		case 'set':
			this.hideAll();
			this.boxes.cam.className = 'shadowbox-mob';
			this.boxes.gam.className = 'shadowbox-mob';
			this.objects.info.gammaInfoBut.className = 'base-button';
			this.objects.info.gammaChartBut.className = 'base-button';
			if (this.show) {
				this.boxes.pre.className = 'shadowbox-mob';
				this.preButton.className = 'mob-chart-icon';
			} else {
				this.boxes.inf.className = 'shadowbox-mob';
				this.preButton.className = 'mob-preview-icon';
			}
			break;
	}	
};
LUTMobile.prototype.showCur = function() {
	switch (this.cur) {
		case 'main':
			this.menuBox.className = 'mob-main-menu';
			break;
		case 'twk':
			this.hideAll();
			this.boxes.twk.className = 'tweakbox';
			this.objects.info.gammaInfoBut.className = 'base-button';
			this.objects.info.gammaChartBut.className = 'base-button';
			this.objects.info.gammaChartOpt();
			if (this.show) {
				this.boxes.pre.className = 'shadowbox-mob';
				this.preButton.className = 'mob-chart-icon';
			} else {
				this.boxes.inf.className = 'shadowbox-mob';
				this.preButton.className = 'mob-preview-icon';
			}
			break;
		case 'inf':
			this.hideAll();
			this.objects.info.gammaInfoBut.className = 'base-button-hide-mob';
			this.objects.info.gammaChartBut.className = 'base-button-hide-mob';
			this.boxes.inf.className = 'shadowbox-mob';
			this.objects.info.instructionsOpt();
			break;
		case 'lut':
			this.hideAll();
			this.boxes.lut.className = 'shadowbox-mob';
			this.objects.info.gammaInfoBut.className = 'base-button';
			this.objects.info.gammaChartBut.className = 'base-button';
			this.preButton.className = 'mob-no-icon';
			this.objects.info.gammaChartOpt();
			break;
		case 'set':
			this.hideAll();
			this.boxes.cam.className = 'shadowbox-mob';
			this.boxes.gam.className = 'shadowbox-mob';
			this.objects.info.gammaInfoBut.className = 'base-button';
			this.objects.info.gammaChartBut.className = 'base-button';
			this.objects.info.gammaChartOpt();
			if (this.show) {
				this.boxes.pre.className = 'shadowbox-mob';
				this.preButton.className = 'mob-chart-icon';
			} else {
				this.boxes.inf.className = 'shadowbox-mob';
				this.preButton.className = 'mob-preview-icon';
			}
			break;
		default:
			this.hideAll();
			this.boxes[this.cur].className = 'shadowbox-mob';
			this.objects.info.gammaInfoBut.className = 'base-button';
			this.objects.info.gammaChartBut.className = 'base-button';
			this.objects.info.gammaChartOpt();
			if (this.show) {
				this.boxes.pre.className = 'shadowbox-mob';
			} else {
				this.boxes.inf.className = 'shadowbox-mob';
			}
	}
	maxHeights();
};
LUTMobile.prototype.updateUI = function() {
	this.showCur();
};
