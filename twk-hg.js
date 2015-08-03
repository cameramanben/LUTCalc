/* twk-hg.js
* Highlight Gamut object for the LUTCalc Web App.
* 10th April 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKHG(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.p = 9;
	this.messages.addUI(this.p,this);
	this.io();
	this.ui();
	lutcalcReady(this.p);
}
TWKHG.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox';
	this.tweakCheck.checked = false;

// Tweak - Specific Inputs
	// Highlight gamut selector
	this.gamutSelect = document.createElement('select');
	var max = this.inputs.gamutOutList.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = this.inputs.gamutOutList[j].idx;
		option.appendChild(document.createTextNode(this.inputs.gamutOutList[j].name));
		this.gamutSelect.appendChild(option);
	}
	this.inputs.addInput('twkHGSelect',this.gamutSelect);
	// Choice between linear (IRE) or log (stop) transition from base gamut to highlight gamut
	this.linOpt = this.createRadioElement('linLog',true);
	this.linOpt.value = '0';
	this.logOpt = this.createRadioElement('linLog',false);
	this.logOpt.value = '1';
	// Linear (IRE) inputs for the start and end of the transition
	this.linLow = document.createElement('input');
	this.linLow.setAttribute('type','number');
	this.linLow.setAttribute('step','any');
	this.linLow.className = 'ireinput';
	this.linLow.value = '18';
	this.linHigh = document.createElement('input');
	this.linHigh.setAttribute('type','number');
	this.linHigh.setAttribute('step','any');
	this.linHigh.className = 'ireinput';
	this.linHigh.value = '90';
	// Log (stop) inputs for the start and end of the transition
	this.logLow = document.createElement('input');
	this.logLow.setAttribute('type','number');
	this.logLow.setAttribute('step','any');
	this.logLow.className = 'stopinput';
	this.logLow.value = '0';
	this.logHigh = document.createElement('input');
	this.logHigh.setAttribute('type','number');
	this.logHigh.setAttribute('step','any');
	this.logHigh.className = 'stopinput';
	this.logHigh.value = (Math.log(5*parseFloat(this.linHigh.value)/90)/Math.LN2).toFixed(4).toString();
}
TWKHG.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Highlight Gamut')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak-hide';
	// Tweak - Specific UI Elements

	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Gamut')));
	this.box.appendChild(this.gamutSelect);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(this.linOpt);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Linear (% IRE)')));
	this.box.appendChild(this.logOpt);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Log (Stops)')));

	this.linBox = document.createElement('div');
	this.linBox.className = 'twk-tab';
	this.linBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover Low % Reflected')));
	this.linBox.appendChild(document.createElement('br'));
	this.linBox.appendChild(this.linLow);
	this.linBox.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.linBox.appendChild(document.createElement('br'));
	this.linBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover High % Reflected')));
	this.linBox.appendChild(document.createElement('br'));
	this.linBox.appendChild(this.linHigh);
	this.linBox.appendChild(document.createElement('label').appendChild(document.createTextNode('%')));
	this.box.appendChild(this.linBox);

	this.logBox = document.createElement('div');
	this.logBox.className = 'twk-tab-hide';
	this.logBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover Low Stops From 18% Grey')));
	this.logBox.appendChild(document.createElement('br'));
	this.logBox.appendChild(this.logLow);
	this.logBox.appendChild(document.createElement('br'));
	this.logBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Crossover High Stops From 18% Grey')));
	this.logBox.appendChild(document.createElement('br'));
	this.logBox.appendChild(this.logHigh);
	this.box.appendChild(this.logBox);

	// Build Box Hierarchy
	this.holder.appendChild(this.box);
}
TWKHG.prototype.toggleTweaks = function() {
	// If The Overall Checkbox Is Ticked
	if (this.inputs.tweaks.checked && this.inputs.d[1].checked) { // This checks for 'Customisations' to be checked and LUT type set to '3D' (the d[1] item)
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
}
TWKHG.prototype.toggleTweak = function() {
	if (this.tweakCheck.checked) {
		this.box.className = 'tweak';
	} else {
		this.box.className = 'tweak-hide';
	}
}
TWKHG.prototype.getTFParams = function(params) {
	// No Relevant Parameters For This Tweak
}
TWKHG.prototype.getCSParams = function(params) {
	var out = {};
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		out.doHG = true;
		out.lin = this.linOpt.checked;
		out.gamut = parseInt(this.gamutSelect.options[this.gamutSelect.selectedIndex].value);
		out.low = parseFloat(this.logLow.value);
		out.high = parseFloat(this.logHigh.value);
	} else {
		out.doHG = false;
	}
	params.twkHG = out;
}
TWKHG.prototype.setParams = function(params) {
	if (typeof params.twkHG !== 'undefined') {
		var p = params.twkHG;
		this.toggleTweaks();
	}
	// Any changes to UI inputs coming from the gamma and gamut workers should go here
}
TWKHG.prototype.getInfo = function(info) {
	var tweaks = this.inputs.tweaks.checked;
	var tweak = this.tweakCheck.checked;
	if (tweaks && tweak) {
		info.doHG = true;
	} else {
		info.doHG = false;
	}
	info.twkHGGamutName = this.gamutSelect.options[this.gamutSelect.selectedIndex].lastChild.nodeValue;
}
TWKHG.prototype.events = function() {
	this.tweakCheck.onclick = function(here){ return function(){
		here.toggleTweak();
		here.messages.gtSetParams();
	};}(this);
	this.gamutSelect.onchange = function(here){ return function(){
		here.messages.gtSetParams();
	};}(this);
	this.linOpt.onchange = function(here){ return function(){
		here.toggleLinLog();
		here.messages.gtSetParams();
	};}(this);
	this.logOpt.onchange = function(here){ return function(){
		here.toggleLinLog();
		here.messages.gtSetParams();
	};}(this);
	this.linLow.onchange = function(here){ return function(){
		here.testLinLow();
		here.messages.gtSetParams();
	};}(this);
	this.linHigh.onchange = function(here){ return function(){
		here.testLinHigh();
		here.messages.gtSetParams();
	};}(this);
	this.logLow.onchange = function(here){ return function(){
		here.testLogLow();
		here.messages.gtSetParams();
	};}(this);
	this.logHigh.onchange = function(here){ return function(){
		here.testLogHigh();
		here.messages.gtSetParams();
	};}(this);
}
// Tweak-Specific Code
TWKHG.prototype.createRadioElement = function(name, checked) {
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
TWKHG.prototype.gamutList = function(gamuts) {
	max = gamuts.length;
	for (var j=0; j<max; j++) {
		var option = document.createElement('option');
		option.value = gamuts[j].idx;
		option.appendChild(document.createTextNode(gamuts[j].name));
		this.gamutSelect.appendChild(option);
	}
}
TWKHG.prototype.toggleLinLog = function() {
	if (this.linOpt.checked) {
		this.linBox.className = 'twk-tab';
		this.logBox.className = 'twk-tab-hide';
	} else {
		this.linBox.className = 'twk-tab-hide';
		this.logBox.className = 'twk-tab';
	}
}
TWKHG.prototype.testLinLow = function() {
	if (/^([1-9]\d*)$/.test(this.linLow.value)) {
		if (parseInt(this.linLow.value) >= parseInt(this.linHigh.value)) {
			this.linLow.value = (parseInt(this.linHigh.value) - 1).toString();
		}
		this.logLow.value = (Math.log(parseFloat(this.linLow.value)/18)/Math.LN2).toFixed(4).toString();
	} else {
		this.linLow.value = '18';
		this.logLow.value = '0';
		this.testLinLow();
	}
}
TWKHG.prototype.testLinHigh = function() {
	if (/^([1-9]\d*)$/.test(this.linHigh.value)) {
		if (parseInt(this.linHigh.value) <= parseInt(this.linLow.value)) {
			this.linHigh.value = (parseInt(this.linLow.value) + 1).toString();
		} else if (parseInt(this.linHigh.value) < 2){
			this.linHigh.value = '2';
		}
		this.logHigh.value = (Math.log(parseFloat(this.linHigh.value)/18)/Math.LN2).toFixed(4).toString();
	} else {
		this.linHigh.value = '90';
		this.logHigh.value = (Math.log(5)/Math.LN2).toFixed(4).toString();
		this.testLinHigh();
	}
}
TWKHG.prototype.testLogLow = function() {
	if (!isNaN(parseFloat(this.logLow.value)) && isFinite(this.logLow.value)) {
		if (parseFloat(this.logLow.value) >= parseFloat(this.logHigh.value)) {
			this.logLow.value = (parseFloat(this.logHigh.value) - 0.1).toFixed(4).toString();
		}
		this.linLow.value = (Math.round(Math.pow(2,parseFloat(this.logLow.value))*18)).toString();
	} else {
		this.linLow.value = '18';
		this.logLow.value = '0';
		this.testLogLow();
	}
}
TWKHG.prototype.testLogHigh = function() {
	if (!isNaN(parseFloat(this.logHigh.value)) && isFinite(this.logHigh.value)) {
		if (parseFloat(this.logHigh.value) <= parseFloat(this.logLow.value)) {
			this.logHigh.value = (parseFloat(this.logLow.value) + 0.1).toFixed(4).toString();
		}
		this.linHigh.value = (Math.round(Math.pow(2,parseFloat(this.logHigh.value))*18)).toString();
	} else {
		this.linHigh.value = '90';
		this.logHigh.value = (Math.log(5)/Math.LN2).toFixed(4).toString();
		this.testLogHigh();
	}
}
