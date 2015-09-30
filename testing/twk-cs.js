/* twk-cs.js
* Custom colour space / gamut object for the LUTCalc Web App.
* 29th September 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function TWKCS(tweaksBox, inputs, messages) {
	this.tweaksBox = tweaksBox;
	this.inputs = inputs;
	this.messages = messages;
	this.io();
	this.ui();
	this.events();
}
TWKCS.prototype.io = function() {
	// Tweak Checkbox
	this.tweakCheck = document.createElement('input');
	this.tweakCheck.setAttribute('type','checkbox');
	this.tweakCheck.className = 'twk-checkbox-hide';
	this.tweakCheck.checked = false;
	// Tweak - Specific Inputs
	// Gamuts
	this.count = 1;
	this.gamuts = [];
	this.gamuts.push({
		std: 'D65',
		wx: 0.31270,wy: 0.32900,
		rx: 0.64,	ry: 0.33,
		gx: 0.30,	gy: 0.60,
		bx: 0.15,	by: 0.06
	});
	// List of custom gamuts
	this.gamList = document.createElement('select');
	var listOption = document.createElement('option');
	listOption.appendChild(document.createTextNode('Rec709'));
	this.gamList.appendChild(listOption);
	// Store / Remove buttons
	this.newButton = document.createElement('input');
	this.newButton.setAttribute('type','button');
	this.newButton.value = 'New';
	this.removeButton = document.createElement('input');
	this.removeButton.setAttribute('type','button');
	this.removeButton.value = 'Remove';
	// Title
	this.title = document.createElement('input');
	this.title.setAttribute('type','text');
	this.title.className = 'textinput';
	this.title.value = 'Rec709';
	// White Point
	this.stdWP = this.createRadioElement('wpOpt', true);
	this.cstWP = this.createRadioElement('wpOpt', false);
	this.stdIll = document.createElement('select');
	this.setIlluminants();
	// Primaries
	this.xWP = document.createElement('input');
	this.xWP.setAttribute('type','text');
	this.xWP.className = 'basicinput';
	this.xWP.value = this.gamuts[0].wx.toString();
	this.xWP.disabled = true;
	this.yWP = document.createElement('input');
	this.yWP.setAttribute('type','text');
	this.yWP.className = 'basicinput';
	this.yWP.value = this.gamuts[0].wy.toString();
	this.yWP.disabled = true;
	this.xR = document.createElement('input');
	this.xR.setAttribute('type','text');
	this.xR.className = 'basicinput';
	this.xR.value = this.gamuts[0].rx.toString();
	this.yR = document.createElement('input');
	this.yR.setAttribute('type','text');
	this.yR.className = 'basicinput';
	this.yR.value = this.gamuts[0].ry.toString();
	this.xG = document.createElement('input');
	this.xG.setAttribute('type','text');
	this.xG.className = 'basicinput';
	this.xG.value = this.gamuts[0].gx.toString();
	this.yG = document.createElement('input');
	this.yG.setAttribute('type','text');
	this.yG.className = 'basicinput';
	this.yG.value = this.gamuts[0].gy.toString();
	this.xB = document.createElement('input');
	this.xB.setAttribute('type','text');
	this.xB.className = 'basicinput';
	this.xB.value = this.gamuts[0].bx.toString();
	this.yB = document.createElement('input');
	this.yB.setAttribute('type','text');
	this.yB.className = 'basicinput';
	this.yB.value = this.gamuts[0].by.toString();
	// Input and output choices
	this.inSelect = document.createElement('select');
	var inOption = document.createElement('option');
	inOption.appendChild(document.createTextNode('Rec709'));
	this.inSelect.appendChild(inOption);
	this.outSelect = document.createElement('select');
	var outOption = document.createElement('option');
	outOption.appendChild(document.createTextNode('Rec709'));
	this.outSelect.appendChild(outOption);
};
TWKCS.prototype.ui = function() {
	// General Tweak Holder (Including Checkbox)
	this.holder = document.createElement('div');
	this.holder.className = 'tweakholder-hide';
	this.tweaksBox.appendChild(this.holder);
	this.holder.appendChild(document.createElement('label').appendChild(document.createTextNode('Custom Colour Space')));
	this.holder.appendChild(this.tweakCheck);
	// Tweak Box - Inputs Which Appear When the Tweak Checkbox Is Ticked
	this.box = document.createElement('div');
	this.box.className = 'tweak';
	// Tweak - Specific UI Elements
	this.box.appendChild(this.gamList);
	this.box.appendChild(this.newButton);
	this.box.appendChild(this.removeButton);
	var editBox = document.createElement('div');
	editBox.className = 'twk-sub-box';
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Title')));
	editBox.appendChild(this.title);
	editBox.appendChild(document.createElement('br'));
	editBox.appendChild(this.stdWP);
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Standard Illuminant')));
	editBox.appendChild(this.stdIll);
	editBox.appendChild(this.cstWP);
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('White Point')));
	editBox.appendChild(document.createElement('br'));
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('x')));
	editBox.appendChild(this.xWP);
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('y')));
	editBox.appendChild(this.yWP);
	editBox.appendChild(document.createElement('br'));
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Red Primary:   x')));
	editBox.appendChild(this.xR);
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('y')));
	editBox.appendChild(this.yR);
	editBox.appendChild(document.createElement('br'));
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Green Primary: x')));
	editBox.appendChild(this.xG);
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('y')));
	editBox.appendChild(this.yG);
	editBox.appendChild(document.createElement('br'));
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Blue Primary:  x')));
	editBox.appendChild(this.xB);
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('y')));
	editBox.appendChild(this.yB);
	this.box.appendChild(editBox);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Input Choice')));
	this.box.appendChild(this.inSelect);
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Output Choice')));
	this.box.appendChild(this.outSelect);
	this.box.appendChild(document.createElement('br'));

	// Build Box Hierarchy
	this.holder.appendChild(this.box);
};
TWKCS.prototype.toggleTweaks = function() {
	// Visibility dictated by 3D LUT and Gamut choice, not checkbox
};
TWKCS.prototype.toggleTweak = function() {
	if ( this.inputs.d[1].checked && (
		this.inputs.inGamut.selectedIndex === this.inputs.custGamInIdx ||
		this.inputs.outGamut.selectedIndex === this.inputs.custGamOutIdx
	)) {
		this.holder.className = 'tweakholder';
	} else {
		this.holder.className = 'tweakholder-hide';
	}
};
TWKCS.prototype.getTFParams = function(params) {
	// No parameters are relevent
};
TWKCS.prototype.getCSParams = function(params) {
	var out = {};
	out.doCS = true;
	var i = this.inSelect.selectedIndex;
	out.input = {
		wx: this.gamuts[i].wx, wy: this.gamuts[i].wy,
		rx: this.gamuts[i].rx, ry: this.gamuts[i].ry,
		gx: this.gamuts[i].gx, gy: this.gamuts[i].gy,
		bx: this.gamuts[i].bx, by: this.gamuts[i].by
	};
	i = this.outSelect.selectedIndex;
	out.output = {
		wx: this.gamuts[i].wx, wy: this.gamuts[i].wy,
		rx: this.gamuts[i].rx, ry: this.gamuts[i].ry,
		gx: this.gamuts[i].gx, gy: this.gamuts[i].gy,
		bx: this.gamuts[i].bx, by: this.gamuts[i].by
	};
	params.twkCS = out;
};
TWKCS.prototype.setParams = function(params) {
	if (typeof params.twkCS !== 'undefined') {
		var p = params.twkCS;
	}
//	this.toggleTweak();
};
TWKCS.prototype.getSettings = function(data) {
	var m = this.gamuts.length;
	var list = [];
	for (var j=0; j<m; j++) {
		list.push({
			title: this.gamList.options[j].lastChild.nodeValue,
			std: this.gamuts[j].std,
			wx: this.gamuts[j].wx, wy: this.gamuts[j].wy,
			rx: this.gamuts[j].rx, ry: this.gamuts[j].ry,
			gx: this.gamuts[j].gx, gy: this.gamuts[j].gy,
			bx: this.gamuts[j].bx, by: this.gamuts[j].by
		});
	}
	data.customCS = {
		edit: this.gamList.options[this.gamList.selectedIndex].lastChild.nodeValue,
		input: this.inSelect.options[this.inSelect.selectedIndex].lastChild.nodeValue,
		output: this.outSelect.options[this.outSelect.selectedIndex].lastChild.nodeValue,
		list: list
	};
};
TWKCS.prototype.setSettings = function(settings) {
	if (typeof settings.customCS !== 'undefined') {
		var data = settings.customCS;
		if (data.list !== 'undefined') {
			this.gamuts.length = 0;
			this.gamList.length = 0;
			this.inSelect.length = 0;
			this.outSelect.length = 0;
			var m = data.list.length;
			for (var j=0; j<m; j++) {
				this.gamuts.push({
					std: data.list[j].std,
					wx: data.list[j].wx, wy: data.list[j].wy,
					rx: data.list[j].rx, ry: data.list[j].ry,
					gx: data.list[j].gx, gy: data.list[j].gy,
					bx: data.list[j].bx, by: data.list[j].by
				});
				this.title.value = data.edit;
				var option1 = document.createElement('option');
				option1.appendChild(document.createTextNode(data.list[j].title));
				if (data.list[j].title === data.edit) {
					this.xWP.value = data.list[j].wx.toString();
					this.yWP.value = data.list[j].wy.toString();
					this.xR.value = data.list[j].rx.toString();
					this.yR.value = data.list[j].ry.toString();
					this.xG.value = data.list[j].gx.toString();
					this.yG.value = data.list[j].gy.toString();
					this.xB.value = data.list[j].bx.toString();
					this.yB.value = data.list[j].by.toString();
					option1.selected = true;
					if (data.list[j].std) {
						this.stdIll.style.display = 'inline';
						this.stdWP.checked = true;
						this.cstWP.checked = false;
						this.xWP.disabled = true;
						this.yWP.disabled = true;
						var m2 = this.stdIll.options.length;
						for (var k=0; k<m2; k++) {
							if (this.stdIll.options[k].lastChild.nodeValue.toUpperCase() === data.list[j].std.toUpperCase()) {
								this.stdIll.options[k].selected = true;
//								break;
							}
						}
					} else {
						this.stdIll.style.display = 'none';
						this.stdWP.checked = false;
						this.cstWP.checked = true;
						this.xWP.disabled = false;
						this.yWP.disabled = false;
					}
				}
				this.gamList.appendChild(option1);
				var option2 = document.createElement('option');
				option2.appendChild(document.createTextNode(data.list[j].title));
				if (data.list[j].title === data.input) {
					option2.selected = true;
				}
				this.inSelect.appendChild(option2);
				var option3 = document.createElement('option');
				option3.appendChild(document.createTextNode(data.list[j].title));
				if (data.list[j].title === data.output) {
					option3.selected = true;
				}
				this.outSelect.appendChild(option3);
			}
		}
		this.changeInput();
		this.changeOutput();
		this.toggleTweak();
	}
};
TWKCS.prototype.getInfo = function(info) {
};
TWKCS.prototype.events = function() {
	this.gamList.onchange = function(here){ return function(){
		here.changeCS();
		here.messages.gtSetParams();
	};}(this);
	this.newButton.onclick = function(here){ return function(){
		here.newCS();
		here.messages.gtSetParams();
	};}(this);
	this.removeButton.onclick = function(here){ return function(){
		here.removeCS();
		here.messages.gtSetParams();
	};}(this);
	this.title.oninput = function(here){ return function(){
		here.changeTitle();
	};}(this);
	this.stdWP.onchange = function(here){ return function(){
		here.illOrWP();
		here.messages.gtSetParams();
	};}(this);
	this.stdIll.onchange = function(here){ return function(){
		here.changeIll();
		here.messages.gtSetParams();
	};}(this);
	this.cstWP.onchange = function(here){ return function(){
		here.illOrWP();
		here.messages.gtSetParams();
	};}(this);
	this.xWP.onchange = function(here){ return function(){
		here.testWx();
	};}(this);
	this.yWP.onchange = function(here){ return function(){
		here.testWy();
	};}(this);
	this.xR.onchange = function(here){ return function(){
		here.testRx();
	};}(this);
	this.yR.onchange = function(here){ return function(){
		here.testRy();
	};}(this);
	this.xG.onchange = function(here){ return function(){
		here.testGx();
	};}(this);
	this.yG.onchange = function(here){ return function(){
		here.testGy();
	};}(this);
	this.xB.onchange = function(here){ return function(){
		here.testBx();
	};}(this);
	this.yB.onchange = function(here){ return function(){
		here.testBy();
	};}(this);
	this.inSelect.onchange = function(here){ return function(){
		here.changeInput();
		here.messages.gtSetParams();
	};}(this);
	this.outSelect.onchange = function(here){ return function(){
		here.changeOutput();
		here.messages.gtSetParams();
	};}(this);
};
// Tweak-Specific Code
TWKCS.prototype.setIlluminants = function() {
	this.illuminants = []
	this.illuminants.push({name:'a',	x:0.44757, y:0.40745});
	this.illuminants.push({name:'b',	x:0.34842, y:0.35161});
	this.illuminants.push({name:'c',	x:0.31006, y:0.31616});
	this.illuminants.push({name:'d40',	x:0.38230, y:0.38380});
	this.illuminants.push({name:'d45',	x:0.36210, y:0.37090});
	this.illuminants.push({name:'d50',	x:0.34567, y:0.35850});
	this.illuminants.push({name:'d55',	x:0.33242, y:0.34743});
	this.illuminants.push({name:'d60',	x:0.32168, y:0.33767});
	this.illuminants.push({name:'d65',	x:0.31270, y:0.32900});
	this.illuminants.push({name:'d70',	x:0.30540, y:0.32160});
	this.illuminants.push({name:'d75',	x:0.29902, y:0.31485});
	this.illuminants.push({name:'e',	x:1/3    , y:1/3	});
	this.illuminants.push({name:'f1',	x:0.31310, y:0.33727});
	this.illuminants.push({name:'f2',	x:0.37208, y:0.37529});
	this.illuminants.push({name:'f3',	x:0.40910, y:0.39430});
	this.illuminants.push({name:'f4',	x:0.44018, y:0.40329});
	this.illuminants.push({name:'f5',	x:0.31379, y:0.34531});
	this.illuminants.push({name:'f6',	x:0.37790, y:0.38835});
	this.illuminants.push({name:'f7',	x:0.31292, y:0.32933});
	this.illuminants.push({name:'f8',	x:0.34588, y:0.35875});
	this.illuminants.push({name:'f9',	x:0.37417, y:0.37281});
	this.illuminants.push({name:'f10',	x:0.34609, y:0.35986});
	this.illuminants.push({name:'f11',	x:0.38052, y:0.37713});
	this.illuminants.push({name:'f12',	x:0.43695, y:0.40441});
	var m = this.illuminants.length;
	for (var j=0; j<m; j++) {
		var option = document.createElement('option');
		option.value = j;
		if (this.illuminants[j].name === 'd65') {
			option.selected = true;
		}
		option.appendChild(document.createTextNode(this.illuminants[j].name.toUpperCase()));
		this.stdIll.appendChild(option);
	}
};
TWKCS.prototype.changeIll = function() {
	var i = this.stdIll.selectedIndex;
	this.xWP.value = this.illuminants[i].x.toString();
	this.yWP.value = this.illuminants[i].y.toString();
	this.gamuts[this.gamList.selectedIndex].std = this.illuminants[i].name.toUpperCase();
	this.gamuts[this.gamList.selectedIndex].wx = this.illuminants[i].x;
	this.gamuts[this.gamList.selectedIndex].wy = this.illuminants[i].y;
};
TWKCS.prototype.illOrWP = function() {
	if (this.stdWP.checked) {
		this.stdIll.style.display = 'inline';
		this.xWP.disabled = true;
		this.yWP.disabled = true;
		this.gamuts[this.gamList.selectedIndex].std = this.stdIll.options[this.stdIll.selectedIndex].lastChild.nodeValue;
		this.changeIll();
	} else {
		this.stdIll.style.display = 'none';
		this.xWP.disabled = false;
		this.yWP.disabled = false;
		this.gamuts[this.gamList.selectedIndex].std = false;
	}
};
TWKCS.prototype.newCS = function() {
	this.title.value = 'Gamut ' + this.count.toString();
	this.count++;
	var i = this.gamuts.length;
	this.gamuts.push({
		std: 'D65',
		wx: 0.31270,wy: 0.32900,
		rx: 0.64,	ry: 0.33,
		gx: 0.30,	gy: 0.60,
		bx: 0.15,	by: 0.06
	});
	var m = this.stdIll.options.length;
	for (var j=0; j<m; j++) {
		if (this.stdIll.options[j].lastChild.nodeValue === 'D65') {
			this.stdIll.options[j].selected = true;
			break;
		}
	}
	this.setXY(i);
	this.stdWP.checked = true;
	this.illOrWP();
	var option1 = document.createElement('option');
	option1.appendChild(document.createTextNode(this.title.value));
	i = this.gamList.options.length;
	this.gamList.appendChild(option1);
	this.gamList.options[i].selected = true;
	var option2 = document.createElement('option');
	option2.appendChild(document.createTextNode(this.title.value));
	i = this.inSelect.options.length;
	this.inSelect.appendChild(option2);
	var option3 = document.createElement('option');
	option3.appendChild(document.createTextNode(this.title.value));
	i = this.outSelect.options.length;
	this.outSelect.appendChild(option3);
	this.outSelect.options[i].selected = true;
	this.changeInput();
	this.changeOutput();
};
TWKCS.prototype.removeCS = function() {
	var i = this.gamList.selectedIndex;
	var m = this.gamList.options.length;
	if (m>1) {
		this.gamList.remove(i);
		this.inSelect.remove(i);
		this.outSelect.remove(i);
	}
	this.changeCS();
};
TWKCS.prototype.changeCS = function() {
	var i = this.gamList.selectedIndex;
	this.outSelect.options[i].selected = true;
	this.setXY(i);
	this.title.value = this.gamList.options[i].lastChild.nodeValue;
	if (this.gamuts[i].std) {
		this.stdWP.checked = true;
		this.cstWP.checked = false;
		var m = this.stdIll.options.length;
		for (var j=0; j<m; j++) {
			if (this.stdIll.options[j].lastChild.nodeValue.toUpperCase() === this.gamuts[i].std) {
				this.stdIll.options[j].selected = true;
				break;
			}
		}
	} else {
		this.stdWP.checked = false;
		this.cstWP.checked = true;
	}
	this.illOrWP();
	this.changeOutput();
};
TWKCS.prototype.setXY = function(i) {
	this.xWP.value = this.gamuts[i].wx.toString();
	this.yWP.value = this.gamuts[i].wy.toString();
	this.xR.value = this.gamuts[i].rx.toString();
	this.yR.value = this.gamuts[i].ry.toString();
	this.xG.value = this.gamuts[i].gx.toString();
	this.yG.value = this.gamuts[i].gy.toString();
	this.xB.value = this.gamuts[i].bx.toString();
	this.yB.value = this.gamuts[i].by.toString();
};
TWKCS.prototype.testWx = function() {
	var i = this.gamList.options.selectedIndex;
	var x = parseFloat(this.xWP.value);
	if (isNaN(x)) {
		this.xWP.value = this.gamuts[i].wx.toString();
	} else {
		this.gamuts[i].wx = x;
	}
};
TWKCS.prototype.testWy = function() {
	var i = this.gamList.options.selectedIndex;
	var y = parseFloat(this.yWP.value);
	if (isNaN(y)) {
		this.yWP.value = this.gamuts[i].wy.toString();
	} else {
		this.gamuts[i].wy = y;
	}
};
TWKCS.prototype.testRx = function() {
	var i = this.gamList.options.selectedIndex;
	var x = parseFloat(this.xR.value);
	if (isNaN(x)) {
		this.xR.value = this.gamuts[i].rx.toString();
	} else {
		this.gamuts[i].rx = x;
	}
};
TWKCS.prototype.testRy = function() {
	var i = this.gamList.options.selectedIndex;
	var y = parseFloat(this.yR.value);
	if (isNaN(y)) {
		this.yR.value = this.gamuts[i].ry.toString();
	} else {
		this.gamuts[i].ry = y;
	}
};
TWKCS.prototype.testGx = function() {
	var i = this.gamList.options.selectedIndex;
	var x = parseFloat(this.xG.value);
	if (isNaN(x)) {
		this.xG.value = this.gamuts[i].gx.toString();
	} else {
		this.gamuts[i].gx = x;
	}
};
TWKCS.prototype.testGy = function() {
	var i = this.gamList.options.selectedIndex;
	var y = parseFloat(this.yG.value);
	if (isNaN(y)) {
		this.yG.value = this.gamuts[i].gy.toString();
	} else {
		this.gamuts[i].gy = y;
	}
};
TWKCS.prototype.testBx = function() {
	var i = this.gamList.options.selectedIndex;
	var x = parseFloat(this.xB.value);
	if (isNaN(x)) {
		this.xB.value = this.gamuts[i].bx.toString();
	} else {
		this.gamuts[i].bx = x;
	}
};
TWKCS.prototype.testBy = function() {
	var i = this.gamList.options.selectedIndex;
	var y = parseFloat(this.yB.value);
	if (isNaN(y)) {
		this.yB.value = this.gamuts[i].by.toString();
	} else {
		this.gamuts[i].by = y;
	}
};
TWKCS.prototype.changeInput = function() {
	var i = this.inSelect.options[this.inSelect.selectedIndex].lastChild.nodeValue;
	this.inputs.inGamut.options[this.inputs.custGamInIdx].removeChild(this.inputs.inGamut.options[this.inputs.custGamInIdx].firstChild);
	this.inputs.inGamut.options[this.inputs.custGamInIdx].appendChild(document.createTextNode('Custom - '+i));
};
TWKCS.prototype.changeOutput = function() {
	var o = this.outSelect.options[this.outSelect.selectedIndex].lastChild.nodeValue;
	this.inputs.outGamut.options[this.inputs.custGamOutIdx].removeChild(this.inputs.outGamut.options[this.inputs.custGamOutIdx].firstChild);
	this.inputs.outGamut.options[this.inputs.custGamOutIdx].appendChild(document.createTextNode('Custom - '+o));
};
TWKCS.prototype.changeTitle = function() {
	this.title.value = this.title.value.replace(/[/"/']/gi, '');
	if (this.title.value.length > 0) {
		var i = this.gamList.selectedIndex;
		this.gamList.options[i].removeChild(this.gamList.options[i].firstChild);
		this.gamList.options[i].appendChild(document.createTextNode(this.title.value));
		this.inSelect.options[i].removeChild(this.inSelect.options[i].firstChild);
		this.inSelect.options[i].appendChild(document.createTextNode(this.title.value));
		this.changeInput();
		this.outSelect.options[i].removeChild(this.outSelect.options[i].firstChild);
		this.outSelect.options[i].appendChild(document.createTextNode(this.title.value));
		this.changeOutput();
	}
};
TWKCS.prototype.createRadioElement = function(name, checked) {
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
