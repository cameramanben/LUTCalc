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
	this.p = 13;
	this.messages.addUI(this.p,this);
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
		cat: 0,
		matrix: false, lock: false,
		std: 'D65',
		wx: 0.31270,wy: 0.32900,
		rx: 0.64,	ry: 0.33,
		gx: 0.30,	gy: 0.60,
		bx: 0.15,	by: 0.06,
		wcs: 'Rec709',
		inMatrix: new Float64Array([1,0,0, 0,1,0, 0,0,1]),
		outMatrix: new Float64Array([1,0,0, 0,1,0, 0,0,1])
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
	// Matrix / Colour Space
	this.clspOpt = this.createRadioElement('mcOpt', true);
	this.matxOpt = this.createRadioElement('mcOpt', false);	
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
	// Matrix inputs
	this.matIn = [];
	this.matOut = [];
	for (var j=0; j<9; j++) {
		var inInput = document.createElement('input');
		inInput.setAttribute('type','text');
		inInput.className = 'wideinput';
		inInput.disabled = false;
		this.matIn.push(inInput);
		var outInput = document.createElement('input');
		outInput.setAttribute('type','text');
		outInput.className = 'wideinput';
		outInput.disabled = true;
		this.matOut.push(outInput);
		if (j === 0 || j === 4 || j === 8) {
			inInput.value = '1';
			outInput.value = '1';
		} else {
			inInput.value = '0';
			outInput.value = '0';
		}
	}
	this.matInOpt = this.createRadioElement('matInOutOpt', true);
	this.matOutOpt = this.createRadioElement('matInOutOpt', false);	
	this.wrkspcSelect = document.createElement('select');
	var m = this.inputs.gamutMatrixList.length;
	for (var j=0; j<m; j++) {
		var matrixOpt = document.createElement('option');
		matrixOpt.appendChild(document.createTextNode(this.inputs.gamutMatrixList[j].name));
		if (this.inputs.gamutMatrixList[j].name === 'Rec709') {
			matrixOpt.selected = true;
		}
		matrixOpt.value = this.inputs.gamutMatrixList[j].idx;
		this.wrkspcSelect.appendChild(matrixOpt);
	}
	this.matCalcCheck = document.createElement('input');
	this.matCalcCheck.setAttribute('type','checkbox');
	this.matCalcCheck.className = 'twk-checkbox';
	this.matCalcCheck.checked = true;
	// CAT Selection
	this.CATSelect = document.createElement('select');
	m = this.inputs.gamutCATList.length;
	for (var j=0; j<m; j++) {
		var CATOption = document.createElement('option');
		if (j === 0) {
			CATOption.selected = true;
		}
		CATOption.value = j;
		CATOption.appendChild(document.createTextNode(this.inputs.gamutCATList[j]));
		this.CATSelect.appendChild(CATOption);
	}
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
	this.box.appendChild(document.createElement('br'));
	this.box.appendChild(this.clspOpt);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('White Point & Primaries')));
	this.box.appendChild(this.matxOpt);
	this.box.appendChild(document.createElement('label').appendChild(document.createTextNode('Matrix')));
	this.box.appendChild(document.createElement('br'));
	var editBox = document.createElement('div');
	editBox.className = 'twk-sub-box';
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Title')));
	editBox.appendChild(this.title);
	this.wppBox = document.createElement('div');
	this.wppBox.className = 'twk-tab';
	this.wppBox.appendChild(this.stdWP);
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Standard Illuminant')));
	this.wppBox.appendChild(this.stdIll);
	this.wppBox.appendChild(this.cstWP);
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('White Point')));
	this.wppBox.appendChild(document.createElement('br'));
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('x')));
	this.wppBox.appendChild(this.xWP);
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('y')));
	this.wppBox.appendChild(this.yWP);
	this.wppBox.appendChild(document.createElement('br'));
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Red Primary:   x')));
	this.wppBox.appendChild(this.xR);
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('y')));
	this.wppBox.appendChild(this.yR);
	this.wppBox.appendChild(document.createElement('br'));
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Green Primary: x')));
	this.wppBox.appendChild(this.xG);
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('y')));
	this.wppBox.appendChild(this.yG);
	this.wppBox.appendChild(document.createElement('br'));
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Blue Primary:  x')));
	this.wppBox.appendChild(this.xB);
	this.wppBox.appendChild(document.createElement('label').appendChild(document.createTextNode('y')));
	this.wppBox.appendChild(this.yB);
	editBox.appendChild(this.wppBox);
	this.matxBox = document.createElement('div');
	this.matxBox.className = 'twk-tab-hide';
	this.matxBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Working Colourspace')));
	this.matxBox.appendChild(this.wrkspcSelect);
	this.matxBox.appendChild(document.createElement('br'));
	this.matxBox.appendChild(document.createElement('label').appendChild(document.createTextNode('Update With Colourspace')));
	this.matxBox.appendChild(this.matCalcCheck);
	this.matxBox.appendChild(document.createElement('br'));
	this.matxBox.appendChild(this.matInOpt);
	this.matxBox.appendChild(document.createElement('label').appendChild(document.createTextNode('To Working Colourspace')));
	this.matxBox.appendChild(document.createElement('br'));
	for (var j=0; j<9; j++) {
		this.matxBox.appendChild(this.matIn[j]);
		if ((j+1)%3 === 0) {
			this.matxBox.appendChild(document.createElement('br'));
		}
	}
	this.matxBox.appendChild(this.matOutOpt);
	this.matxBox.appendChild(document.createElement('label').appendChild(document.createTextNode('From Working Colourspace')));
	this.matxBox.appendChild(document.createElement('br'));
	for (var j=0; j<9; j++) {
		this.matxBox.appendChild(this.matOut[j]);
		if ((j+1)%3 === 0) {
			this.matxBox.appendChild(document.createElement('br'));
		}
	}
	editBox.appendChild(this.matxBox);
	editBox.appendChild(document.createElement('label').appendChild(document.createTextNode('CAT Model')));
	editBox.appendChild(this.CATSelect);
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
	this.toggleTweak();
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
	var i = this.gamList.selectedIndex;
	out.editIdx = i;
	out.matrix = this.gamuts[i].matrix;
	out.lock = this.gamuts[i].lock;
	out.edit = {
		wx: this.gamuts[i].wx, wy: this.gamuts[i].wy,
		rx: this.gamuts[i].rx, ry: this.gamuts[i].ry,
		gx: this.gamuts[i].gx, gy: this.gamuts[i].gy,
		bx: this.gamuts[i].bx, by: this.gamuts[i].by,
		wcs: this.getWCS(this.gamuts[i].wcs),
		isMatrix: this.gamuts[i].matrix,
		matrix: new Float64Array(this.gamuts[i].inMatrix.buffer.slice(0)),
		cat: this.gamuts[i].cat
	};
	i = this.inSelect.selectedIndex;
	out.input = {
		wx: this.gamuts[i].wx, wy: this.gamuts[i].wy,
		rx: this.gamuts[i].rx, ry: this.gamuts[i].ry,
		gx: this.gamuts[i].gx, gy: this.gamuts[i].gy,
		bx: this.gamuts[i].bx, by: this.gamuts[i].by,
		wcs: this.getWCS(this.gamuts[i].wcs),
		isMatrix: this.gamuts[i].matrix,
		matrix: new Float64Array(this.gamuts[i].inMatrix.buffer.slice(0)),
		cat: this.gamuts[i].cat
	};
	i = this.outSelect.selectedIndex;
	out.output = {
		wx: this.gamuts[i].wx, wy: this.gamuts[i].wy,
		rx: this.gamuts[i].rx, ry: this.gamuts[i].ry,
		gx: this.gamuts[i].gx, gy: this.gamuts[i].gy,
		bx: this.gamuts[i].bx, by: this.gamuts[i].by,
		wcs: this.getWCS(this.gamuts[i].wcs),
		isMatrix: this.gamuts[i].matrix,
		matrix: new Float64Array(this.gamuts[i].outMatrix.buffer.slice(0)),
		cat: this.gamuts[i].cat
	};
	params.twkCS = out;
};
TWKCS.prototype.setParams = function(params) {
	if (typeof params.twkCS !== 'undefined') {
		var p = params.twkCS;
		if (typeof p.editMatrix !== 'undefined') {
			this.gamuts[p.editIdx].inMatrix = new Float64Array(p.editMatrix.buffer.slice(0));
			this.gamuts[p.editIdx].outMatrix = this.mInverse(p.editMatrix);
			this.gamuts[p.editIdx].wcs = this.wrkspcSelect.options[p.wcs].lastChild.nodeValue;
			if (this.gamList.selectedIndex === p.editIdx) {
				this.wrkspcSelect.options[p.wcs].selected = true;
				for (var j=0; j<9; j++) {
					this.matIn[j].value = parseFloat(this.gamuts[p.editIdx].inMatrix[j].toFixed(8)).toString();
					this.matOut[j].value = parseFloat(this.gamuts[p.editIdx].outMatrix[j].toFixed(8)).toString();
				}
			}
		}
	}
//	this.toggleTweak();
};
TWKCS.prototype.getSettings = function(data) {
	var m = this.gamuts.length;
	var list = [];
	for (var j=0; j<m; j++) {
		list.push({
			title: this.gamList.options[j].lastChild.nodeValue,
			matrix: this.gamuts[j].matrix,
			lock: this.gamuts[j].lock,
			std: this.gamuts[j].std,
			wx: this.gamuts[j].wx, wy: this.gamuts[j].wy,
			rx: this.gamuts[j].rx, ry: this.gamuts[j].ry,
			gx: this.gamuts[j].gx, gy: this.gamuts[j].gy,
			bx: this.gamuts[j].bx, by: this.gamuts[j].by,
			wcs: this.gamuts[j].wcs,
			inMatrix: this.taToString(this.gamuts[j].inMatrix),
			outMatrix: this.taToString(this.gamuts[j].outMatrix),
			cat: this.CATSelect.options[this.gamuts[j].cat].lastChild.nodeValue
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
			this.title.value = data.edit;
			for (var j=0; j<m; j++) {
				this.gamuts.push({
					matrix: data.list[j].matrix,
					lock: data.list[j].lock,
					std: data.list[j].std,
					wx: data.list[j].wx, wy: data.list[j].wy,
					rx: data.list[j].rx, ry: data.list[j].ry,
					gx: data.list[j].gx, gy: data.list[j].gy,
					bx: data.list[j].bx, by: data.list[j].by,
					wcs: data.list[j].wcs,
					inMatrix: new Float64Array(data.list[j].inMatrix.split(',').map(Number)),
					outMatrix: new Float64Array(data.list[j].outMatrix.split(',').map(Number)),
					cat: this.getCAT(data.list[j].cat)
				});
				var option1 = document.createElement('option');
				option1.appendChild(document.createTextNode(data.list[j].title));
				this.gamList.appendChild(option1);
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
TWKCS.prototype.isCustomGamma = function() {
	return false;
};
TWKCS.prototype.isCustomGamut = function() {
	return false;
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
	this.clspOpt.onclick = function(here){ return function(){
		here.clspMatx();
		here.messages.gtSetParams();
	};}(this);
	this.matxOpt.onclick = function(here){ return function(){
		here.clspMatx();
		here.messages.gtSetParams();
	};}(this);
	this.wrkspcSelect.onchange = function(here){ return function(){
		here.changeWCS();
		if (!here.matCalcCheck.checked) {
			here.messages.gtSetParams();
		}
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
		here.messages.gtSetParams();
	};}(this);
	this.yWP.onchange = function(here){ return function(){
		here.testWy();
		here.messages.gtSetParams();
	};}(this);
	this.xR.onchange = function(here){ return function(){
		here.testRx();
		here.messages.gtSetParams();
	};}(this);
	this.yR.onchange = function(here){ return function(){
		here.testRy();
		here.messages.gtSetParams();
	};}(this);
	this.xG.onchange = function(here){ return function(){
		here.testGx();
		here.messages.gtSetParams();
	};}(this);
	this.yG.onchange = function(here){ return function(){
		here.testGy();
		here.messages.gtSetParams();
	};}(this);
	this.xB.onchange = function(here){ return function(){
		here.testBx();
		here.messages.gtSetParams();
	};}(this);
	this.yB.onchange = function(here){ return function(){
		here.testBy();
		here.messages.gtSetParams();
	};}(this);
	this.inSelect.onchange = function(here){ return function(){
		here.changeInput();
		here.messages.gtSetParams();
	};}(this);
	this.outSelect.onchange = function(here){ return function(){
		here.changeOutput();
		here.messages.gtSetParams();
	};}(this);
	this.matInOpt.onclick = function(here){ return function(){
		here.toggleMatIO();
		here.messages.gtSetParams();
	};}(this);
	this.matOutOpt.onclick = function(here){ return function(){
		here.toggleMatIO();
		here.messages.gtSetParams();
	};}(this);
	for (var j=0; j<9; j++) {
		this.matIn[j].onchange = function(here){ return function(){
			here.updateInMatrix();
			here.messages.gtSetParams();
		};}(this);
		this.matOut[j].onchange = function(here){ return function(){
			here.updateOutMatrix();
			here.messages.gtSetParams();
		};}(this);
	}
	this.CATSelect.onchange = function(here){ return function(){
		here.changeCAT();
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
	this.gamuts[this.gamList.selectedIndex].lock = true;
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
	this.gamuts[this.gamList.selectedIndex].lock = true;
};
TWKCS.prototype.newCS = function() {
	this.title.value = 'Gamut ' + this.count.toString();
	this.count++;
	var i = this.gamuts.length;
	this.gamuts.push({
		cat: this.CATSelect.selectedIndex,
		matrix: false, lock: false,
		std: 'D65',
		wx: 0.31270,wy: 0.32900,
		rx: 0.64,	ry: 0.33,
		gx: 0.30,	gy: 0.60,
		bx: 0.15,	by: 0.06,
		wcs: 'Rec709',
		inMatrix: new Float64Array([1,0,0, 0,1,0, 0,0,1]),
		outMatrix: new Float64Array([1,0,0, 0,1,0, 0,0,1])
	});
	var m = this.stdIll.options.length;
	for (var j=0; j<m; j++) {
		if (this.stdIll.options[j].lastChild.nodeValue === 'D65') {
			this.stdIll.options[j].selected = true;
			break;
		}
	}
	m = this.wrkspcSelect.options.length;
	for (var j=0; j<m; j++) {
		if (this.wrkspcSelect.options[j].lastChild.nodeValue === 'Rec709') {
			this.wrkspcSelect.options[j].selected = true;
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
TWKCS.prototype.changeCAT = function() {
	this.gamuts[this.gamList.selectedIndex].cat = this.CATSelect.selectedIndex;
};
TWKCS.prototype.getWCS = function(wcs) {
	var m = this.wrkspcSelect.options.length;
	for (var j=0; j<m; j++) {
		if (this.wrkspcSelect.options[j].lastChild.nodeValue === wcs) {
			return j;
		}
	}
};
TWKCS.prototype.changeWCS = function(wcs) {
	var i = this.gamList.selectedIndex;
	if (this.matCalcCheck.checked) {
		this.messages.gtTx(this.p,3,{
			idx: i,
			oldWCS: this.getWCS(this.gamuts[i].wcs),
			newWCS: this.getWCS(this.wrkspcSelect.options[this.wrkspcSelect.selectedIndex].lastChild.nodeValue),
			matrix: this.gamuts[i].inMatrix.buffer.slice(0),
			cat: this.gamuts[i].cat
		});
	}
	this.gamuts[i].wcs = this.wrkspcSelect.options[this.wrkspcSelect.selectedIndex].lastChild.nodeValue;
};
TWKCS.prototype.recalcMatrix = function(idx,wcs,buff) {
	this.wrkspcSelect.selectedIndex = wcs;
	this.gamuts[idx].wcs = this.wrkspcSelect.options[wcs].lastChild.nodeValue;
	var matrix = new Float64Array(buff);
	var inv = this.mInverse(matrix);
	var matStore = this.gamuts[idx].outMatrix;
	if (inv) {
		for (var j=0; j<9; j++) {
			inv[j] = parseFloat(inv[j].toFixed(8));
			matStore[j] = inv[j];
		}
	} else {
		for (var j=0; j<9; j++) {
			if (j === 0 || j === 4 || j === 8) {
				matStore[j] = 1;
			} else {
				matStore[j] = 0;
			}
		}
	}
	for (var j=0; j<9; j++) {
		this.gamuts[idx].inMatrix[j] = parseFloat(matrix[j].toFixed(8));
	}
	if (idx === this.gamList.selectedIndex) {
		for (var j=0; j<9; j++) {
			this.matIn[j].value = this.gamuts[idx].inMatrix[j].toString();
			this.matOut[j].value = this.gamuts[idx].outMatrix[j].toString();
		}
	}
	this.messages.gtSetParams();
};
TWKCS.prototype.getCAT = function(cat) {
	var m = this.CATSelect.options.length;
	for (var j=0; j<m; j++) {
		if (this.CATSelect.options[j].lastChild.nodeValue === cat) {
			return j;
		}
	}
};
TWKCS.prototype.removeCS = function() {
	var i = this.gamList.selectedIndex;
	var m = this.gamList.options.length;
	if (m>1) {
		this.gamList.remove(i);
		this.inSelect.remove(i);
		this.outSelect.remove(i);
		this.gamuts.splice(i,1);
	}
	this.changeCS();
};
TWKCS.prototype.clspMatx = function() {
	if (this.clspOpt.checked) {
		this.wppBox.className = 'twk-tab';
		this.matxBox.className = 'twk-tab-hide';
		this.gamuts[this.gamList.selectedIndex].matrix = false;
	} else {
		this.wppBox.className = 'twk-tab-hide';
		this.matxBox.className = 'twk-tab-box';
		this.gamuts[this.gamList.selectedIndex].matrix = true;
	}
};
TWKCS.prototype.toggleMatIO = function() {
	if (this.matInOpt.checked) {
		for (var j=0; j<9; j++) {
			this.matIn[j].disabled = false;
			this.matOut[j].disabled = true;
		}
	} else {
		for (var j=0; j<9; j++) {
			this.matIn[j].disabled = true;
			this.matOut[j].disabled = false;
		}
	}
};
TWKCS.prototype.updateInMatrix = function() {
	var mat = new Float64Array(9);
	var i;
	for (var j=0; j<9; j++) {
		i = parseFloat(this.matIn[j].value);
		if (isNaN(i)) {
			i = this.gamuts[this.gamList.selectedIndex].inMatrix[j];
			this.matIn[j].value = i.toString();
			mat[j] = i;
		} else {
			this.gamuts[this.gamList.selectedIndex].inMatrix[j] = i;
			mat[j] = i;
		}
	}
	var inv = this.mInverse(mat);
	var matStore = this.gamuts[this.gamList.selectedIndex].outMatrix;
	if (inv) {
		for (var j=0; j<9; j++) {
			inv[j] = parseFloat(inv[j].toFixed(8));
			this.matOut[j].value = inv[j].toString();
			matStore[j] = inv[j];
		}
	} else {
		for (var j=0; j<9; j++) {
			if (j === 0 || j === 4 || j === 8) {
				this.matOut[j].value = '1';
				matStore[j] = 1;
			} else {
				this.matOut[j].value = '0';
				matStore[j] = 0;
			}
		}
	}
};
TWKCS.prototype.updateOutMatrix = function() {
	var mat = new Float64Array(9);
	var i;
	for (var j=0; j<9; j++) {
		i = parseFloat(this.matOut[j].value);
		if (isNaN(i)) {
			i = this.gamuts[this.gamList.selectedIndex].outMatrix[j];
			this.matOut[j].value = i.toString();
			mat[j] = i;
		} else {
			this.gamuts[this.gamList.selectedIndex].outMatrix[j] = i;
			mat[j] = i;
		}
	}
	var inv = this.mInverse(mat);
	var matStore = this.gamuts[this.gamList.selectedIndex].inMatrix;
	if (inv) {
		for (var j=0; j<9; j++) {
			inv[j] = parseFloat(inv[j].toFixed(8));
			this.matIn[j].value = inv[j].toString();
			matStore[j] = inv[j];
		}
	} else {
		for (var j=0; j<9; j++) {
			if (j === 0 || j === 4 || j === 8) {
				this.matIn[j].value = '1';
				matStore[j] = 1;
			} else {
				this.matIn[j].value = '0';
				matStore[j] = 0;
			}
		}
	}
};
TWKCS.prototype.mInverse = function(m) {
	var det =	(m[0]*((m[4]*m[8]) - (m[5]*m[7]))) -
				(m[1]*((m[3]*m[8]) - (m[5]*m[6]))) +
				(m[2]*((m[3]*m[7]) - (m[4]*m[6])));
	if (det === 0) {
		return false;
	}
	var mt = new Float64Array([
		m[0], m[3], m[6],
		m[1], m[4], m[7],
		m[2], m[5], m[8]
	]);
	var mc = new Float64Array([
		 (mt[4]*mt[8])-(mt[5]*mt[7]), -(mt[3]*mt[8])+(mt[5]*mt[6]),  (mt[3]*mt[7])-(mt[4]*mt[6]),
		-(mt[1]*mt[8])+(mt[2]*mt[7]),  (mt[0]*mt[8])-(mt[2]*mt[6]), -(mt[0]*mt[7])+(mt[1]*mt[6]),
		 (mt[1]*mt[5])-(mt[2]*mt[4]), -(mt[0]*mt[5])+(mt[2]*mt[3]),  (mt[0]*mt[4])-(mt[1]*mt[3])
	]);
	return new Float64Array([
		mc[0]/det, mc[1]/det, mc[2]/det,
		mc[3]/det, mc[4]/det, mc[5]/det,
		mc[6]/det, mc[7]/det, mc[8]/det
	]);
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
	for (var j=0; j<9; j++) {
		this.matIn[j].value = this.gamuts[i].inMatrix[j].toString();
		this.matOut[j].value = this.gamuts[i].outMatrix[j].toString();
	}
	if (typeof this.gamuts[i].wcs !== 'undefined') {
		var m = this.wrkspcSelect.options.length;
		for (var j=0; j<m; j++) {
			if (this.wrkspcSelect.options[j].lastChild.nodeValue === this.gamuts[i].wcs) {
				this.wrkspcSelect.options[j].selected = true;
				break;
			}
		}
	}
	if (typeof this.gamuts[i].matrix === 'boolean' && this.gamuts[i].matrix) {
		this.matxOpt.checked = true;
		this.clspOpt.checked = false;
	} else {
		this.matxOpt.checked = false;
		this.clspOpt.checked = true;
	}
	this.CATSelect.options[this.gamuts[i].cat].selected = true;
	this.clspMatx();
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
	this.gamuts[i].lock = true;
};
TWKCS.prototype.testWy = function() {
	var i = this.gamList.options.selectedIndex;
	var y = parseFloat(this.yWP.value);
	if (isNaN(y)) {
		this.yWP.value = this.gamuts[i].wy.toString();
	} else {
		this.gamuts[i].wy = y;
	}
	this.gamuts[i].lock = true;
};
TWKCS.prototype.testRx = function() {
	var i = this.gamList.options.selectedIndex;
	var x = parseFloat(this.xR.value);
	if (isNaN(x)) {
		this.xR.value = this.gamuts[i].rx.toString();
	} else {
		this.gamuts[i].rx = x;
	}
	this.gamuts[i].lock = true;
};
TWKCS.prototype.testRy = function() {
	var i = this.gamList.options.selectedIndex;
	var y = parseFloat(this.yR.value);
	if (isNaN(y)) {
		this.yR.value = this.gamuts[i].ry.toString();
	} else {
		this.gamuts[i].ry = y;
	}
	this.gamuts[i].lock = true;
};
TWKCS.prototype.testGx = function() {
	var i = this.gamList.options.selectedIndex;
	var x = parseFloat(this.xG.value);
	if (isNaN(x)) {
		this.xG.value = this.gamuts[i].gx.toString();
	} else {
		this.gamuts[i].gx = x;
	}
	this.gamuts[i].lock = true;
};
TWKCS.prototype.testGy = function() {
	var i = this.gamList.options.selectedIndex;
	var y = parseFloat(this.yG.value);
	if (isNaN(y)) {
		this.yG.value = this.gamuts[i].gy.toString();
	} else {
		this.gamuts[i].gy = y;
	}
	this.gamuts[i].lock = true;
};
TWKCS.prototype.testBx = function() {
	var i = this.gamList.options.selectedIndex;
	var x = parseFloat(this.xB.value);
	if (isNaN(x)) {
		this.xB.value = this.gamuts[i].bx.toString();
	} else {
		this.gamuts[i].bx = x;
	}
	this.gamuts[i].lock = true;
};
TWKCS.prototype.testBy = function() {
	var i = this.gamList.options.selectedIndex;
	var y = parseFloat(this.yB.value);
	if (isNaN(y)) {
		this.yB.value = this.gamuts[i].by.toString();
	} else {
		this.gamuts[i].by = y;
	}
	this.gamuts[i].lock = true;
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
TWKCS.prototype.taToString = function(data) {
	var out = [];
	var m = data.length;
	for (var j=0; j<m; j++) {
		out[j] = data[j];
	}
	return out.toString();
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
