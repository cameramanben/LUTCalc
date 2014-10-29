/* lutgamma.js
* Transfer functions (gamma) object for the LUTCalc Web App.
* 7th October 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTGamma(inputs) {
	this.inputs = inputs;
	this.nul = false;
	this.gammas = [];
	this.curIn = 0;
	this.curOut = 0;
	this.eiMult = 1;
	this.al = 1;
	this.bl = 0;
	this.ad = 1;
	this.bd = 0;
	this.linList = [];
	this.inList = [];
	this.outList = [];
	this.gammaList();
}
LUTGamma.prototype.gammaList = function() {
	this.gammas.push(new LUTGammaLog(
		'S-Log3', [ 0.1677922920,-0.0155818840, 0.2556207230, 4.7368421060,10.0000000000, 0.4105571850, 0.0526315790, 0.1673609920, 0.0125000000 ]));
	this.gammas.push(new LUTGammaLog(
		'S-Log2', [ 0.3300057734,-0.0291175412, 0.3705098702, 0.7222408675,10.0000000000, 0.6130081516, 0.0383430371, 0.0300311298, -0.0161142648 ]));
	this.gammas.push(new LUTGammaLog(
		'S-Log', [ 0.3241960136,-0.0286107171, 0.3705223110, 1,10.0000000000, 0.6162444740, 0.0375840000, 0.0882900450, 0.000000000000001 ]));
	this.gammas.push(new LUTGammaArri(
		'LogC (Sup 3.x & 4.x)',3));
	this.gammas.push(new LUTGammaArri(
		'LogC (Sup 2.x)',2));
	this.gammas.push(new LUTGammaLog(
		'C-Log', [ 0.3734467748,-0.0467265867, 0.45310179472141, 10.1596, 10, 0.1251224801564, 1, 0.00391002619746, -0.0452664 ]));
	this.gammas.push(new LUTGammaLog(
		'Cineon', [ 0.0000000000, 0.0000000000, 0.1260649940,22.2791018600, 2.6907845340, 0.2595160220, 0.2702335160, 0.0000000000, 0 ]));
	this.rec709 = this.gammas.length;
	this.gammas.push(new LUTGammaLin(
		'Rec709', [ 2.22222222, 4.50000000, 0.09900000, 0.01800000, 0.08100000 ]));
	this.gammas.push(new LUTGammaLin(
		'sRGB', [ 2.40000000,12.92000000, 0.05500000, 0.00313080, 0.04015966 ]));
	this.gammas.push(new LUTGammaLin(
		'Linear', [ 1.00000000, 1.00000000, 0.00000000,999.0000000,999.0000000 ]));
/*
	this.gammas.push(new LUTGammaGen(
		'Rec709 (800%)',
		{
			blk: [ 1.655756453, 0.088941781 ],
			bot: [ 3.854131936, 0.088941781 ],
			low: [ 10.81907537, 0.056085667, 0.220563835, 0.485191681, 2.707959604, 1.807046082, 0.012944215 ],
			mid: [ 0.968682118, 0.528373944, 1.14425685, 0.154431494, 0.018062214, 3.408129062, 0.476852363 ],
			high: [ 0.993058666, -1.150063914, 1.224583054, 10.0393264, 4.042674689, 1.368502419, 0.996905904 ],
			top: [ 1.004108327, -1326.098418, 1.320965242, 14389.45697, 100.4246314, 0.019824446, 2.269006452 ]
		}));
*/
	this.gammas.push(new LUTGammaLUT(
		'Rec709 (800%)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: [	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11883999,
					0.12866034, 0.14015402, 0.15348694, 0.16661814, 0.18004893, 0.19509241, 0.21196180, 0.22823182, 0.24534958, 0.26438452,
					0.28434109, 0.30597769, 0.32733539, 0.35083275, 0.37726131, 0.40365049, 0.43183059, 0.46184950, 0.49470951, 0.52865390,
					0.56485880, 0.60500363, 0.64559087, 0.68000971, 0.71766200, 0.75151050, 0.78401661, 0.81486195, 0.84112764, 0.86582068,
					0.88798658, 0.90701682, 0.92138640, 0.93687713, 0.94946030, 0.95992064, 0.96842281, 0.97612828, 0.98187260, 0.98701779,
					0.99013136, 0.99295086, 0.99486435, 0.99732630, 0.99903882, 1.00259821, 1.00607800, 1.00955872, 1.01304026, 1.01652250,
					1.02000536, 1.02348875, 1.02697261, 1.03045687, 1.03394148]
		}));
	this.gammas.push(new LUTGammaLUT(
		'LC709',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: [	0.06814583, 0.07058296, 0.07478742, 0.08119203, 0.09094543, 0.10577778, 0.12661161, 0.15102622, 0.17938471, 0.21218125,
					0.24999849, 0.29326131, 0.34230636, 0.39712178, 0.44860777, 0.49849961, 0.54794424, 0.59705694, 0.64592328, 0.69367508,
					0.73971284, 0.78243927, 0.81756564, 0.84579703, 0.86788199, 0.88463315, 0.89684124, 0.90530839, 0.91082623, 0.91419579,
					0.91619783, 0.91769979, 0.91873335]
		}));
	this.gammas.push(new LUTGammaLUT(
		'LC709A',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: [	0.06907518, 0.07698501, 0.08649788, 0.09697740, 0.10914784, 0.12257823, 0.14034715, 0.16235943, 0.18787845, 0.21802093,
					0.25494274, 0.29874926, 0.34699758, 0.39710087, 0.44727886, 0.49717658, 0.54664799, 0.59550263, 0.64323062, 0.68656480,
					0.72969293, 0.77088703, 0.80592477, 0.83463827, 0.85765973, 0.87554394, 0.88887148, 0.89838561, 0.90479332, 0.90885911,
					0.91131489, 0.91295960, 0.91457395]
		}));
	this.gammas.push(new LUTGammaLUT(
		'Cine+709',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: [	0.09547690, 0.09547690, 0.09547690, 0.09547690, 0.09595623, 0.09861297, 0.10078553, 0.10295884, 0.10504074, 0.10742854,
					0.10996294, 0.11304644, 0.11772884, 0.12403679, 0.13171286, 0.14466645, 0.15939859, 0.17694901, 0.19792855, 0.22257981,
					0.25030519, 0.28018567, 0.31390983, 0.34977213, 0.38776135, 0.42716260, 0.46818127, 0.50880158, 0.54999946, 0.58723907,
					0.62412855, 0.65861958, 0.69112710, 0.72251355, 0.75106336, 0.77924102, 0.80188122, 0.82410616, 0.84442576, 0.86127530,
					0.87567760, 0.88784540, 0.89989060, 0.90830854, 0.91599433, 0.91795243, 0.91844505, 0.91884265, 0.91886608, 0.91886608,
					0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608,
					0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608]
		}));
	this.gammas.push(new LUTGammaLUT(
		'HG8009G40 (HG7)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: [	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11877663,
					0.12870269, 0.14062508, 0.15530285, 0.17128969, 0.18975506, 0.20194191, 0.21350458, 0.22559329, 0.23818850, 0.25204391,
					0.26756238, 0.28482752, 0.30274382, 0.32158673, 0.34408764, 0.36756165, 0.39199445, 0.41935688, 0.44837377, 0.47848551,
					0.51075976, 0.54570010, 0.57983824, 0.61447689, 0.65112936, 0.68499113, 0.71891859, 0.75314337, 0.78354278, 0.81326088,
					0.84125913, 0.86479608, 0.88546580, 0.90573055, 0.92384898, 0.93988492, 0.95264785, 0.96376072, 0.97334372, 0.98062241,
					0.98709762, 0.99131747, 0.99548676, 0.99936430, 1.00048119, 1.00201680, 1.00340872, 1.00480101, 1.00619362, 1.00758652,
					1.00897966, 1.01037302, 1.01176656, 1.01316027, 1.01455411]
		}));
/*
	this.gammas.push(new LUTGammaGen(
		'HG8009G40 (HG7)',
		{
			blk: [ 1.657465538, 0.088961256 ],
			bot: [ 3.851528647, 0.088961256 ],
			low: [ 2.602756934, 0.123004132, 0.596161731, 1.219666397, 3.916153029, 2.070011785, 0.027629714 ],
			mid: [ 1.045289863, 0.159044309, 0.864686124, 1.408429078, 0.094388444, 4.646324474, 0.200252495 ],
			high: [ 1.004184019, 0.125776412, 1.04854443, 2.017853345, 1.804882646, 1.659394503, 1.364057511 ],
			top: [ 1.009613663, -1576.404451, 1.302138745, 12925.0499, 110.9686679, 0.057341867, 2.269006452 ]
		}));

	this.gammas.push(new LUTGammaGen(
		'HG8009G33 (HG8)',
		{
			blk: [ 1.667540141, 0.08907292 ],
			bot: [ 3.828364386, 0.08907292 ],
			low: [ 11.99117731, 0.110735239, 0.456175889, 0.993920925, 11.61545323, 3.171614664, 0.018441223 ],
			mid: [ 1.114027438, 0.161493221, 0.762672852, 1.138621895, 0.056362578, 6.053243012, 0.200252495 ],
			high: [ 1.087363583, 5.592089479, 0.686418804, -10.87307199, 1.797219436, 2.100838913, 1.364057511 ],
			top: [ 1.015259124, -1220.082171, 1.438052193, 10468.77184, 283.4319762, 0.224788251, 2.269006452 ]
		}));
*/
	this.gammas.push(new LUTGammaLUT(
		'HG8009G33 (HG8)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: [	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11883999,
					0.12866695, 0.14029884, 0.15310654, 0.16395771, 0.17159488, 0.17994152, 0.18962627, 0.19913671, 0.20954062, 0.22066463,
					0.23299733, 0.24700070, 0.26155893, 0.27678437, 0.29492812, 0.31421695, 0.33371713, 0.35623191, 0.38106152, 0.40679243,
					0.43514727, 0.46554389, 0.49718732, 0.52924796, 0.56498567, 0.59981238, 0.63527053, 0.67212902, 0.70738288, 0.74196788,
					0.77508835, 0.80634606, 0.83308644, 0.86097158, 0.88602416, 0.90802721, 0.92741313, 0.94399390, 0.95904874, 0.97104303,
					0.98114013, 0.98817840, 0.99432461, 0.99942929, 1.00040913, 1.00201680, 1.00340872, 1.00480101, 1.00619362, 1.00758652,
					1.00897966, 1.01037302, 1.01176656, 1.01316027, 1.01455411]
		}));
	this.gammas.push(new LUTGammaGen(
		'Canon WideDR',
		{
			blk: [ 4.143864904, 0.062733691 ],
			bot: [ 4.143864904, 0.062733691 ],
			low: [ 1.123724397, 0.023399556, 0.725329449, 1.793298155, 1.618753622, 1.512604528, 0.010239171 ],
			mid: [ 1.175009007, -0.889534156, 0.366778059, 1.74451447, 0.920944271, 0.662662566, 0.200816705 ],
			high: [ 1.075984367, 0.080088043, 0.54850957, 1.222465712, 1.162090342, 1.216780039, 1.001012923 ],
			top: [ 1.184590585, 0.32981997, 0.381916345, 1.047595142, 1.356034214, 1.40672617, 3.213458281 ]
		}));
	this.LA = this.gammas.length;
	this.gammas.push(new LUTGammaLA(
		'LA'));
	this.gammas.push(new LUTGammaNull(
		'Null'));
	var max = this.gammas.length;
	var logList = [], linList = [], genList = [];
	for (var i=0; i < max; i++) {
		switch(this.gammas[i].cat) {
			case 0: logList.push({name: this.gammas[i].name, idx: i});
					break;
			case 1: this.linList.push({name: this.gammas[i].name + ' - ' + this.gammas[i].gamma, idx: i});
					break;
			case 2: genList.push({name: this.gammas[i].name, idx: i});
					break;
			default: break;
		}
	}
	this.inList = logList.slice();
	this.inList.push({name: 'Linear / Rec709', idx: 9999});
	this.outList = logList.slice();
	this.outList.push({name: 'Linear / Rec709', idx: 9999});
	this.outList = this.outList.concat(genList);
	this.outList.push({name: this.gammas[max-1].name, idx: (max-1)});
}
LUTGamma.prototype.dataIn = function(input) {
	return this.gammas[this.curIn].linFromData(input);
}
LUTGamma.prototype.legalIn = function(input) {
	return this.gammas[this.curIn].linFromLegal(input);
}
LUTGamma.prototype.dataInRGB = function(rgb) {
	return [this.gammas[this.curIn].linFromData(rgb[0]),
			this.gammas[this.curIn].linFromData(rgb[1]),
			this.gammas[this.curIn].linFromData(rgb[2])];
}
LUTGamma.prototype.legalInRGB = function(rgb) {
	return [this.gammas[this.curIn].linFromLegal(rgb[0]),
			this.gammas[this.curIn].linFromLegal(rgb[1]),
			this.gammas[this.curIn].linFromLegal(rgb[2])];
}
LUTGamma.prototype.dataOut = function(input) {
	if (this.nul) {
		return this.gammas[this.curIn].linToData(input / this.eiMult);
	} else {
		return (this.gammas[this.curOut].linToData(input) * this.ad) + this.bd;
	}
}
LUTGamma.prototype.legalOut = function(input) {
	if (this.nul) {
		return this.gammas[this.curIn].linToLegal(input / this.eiMult);
	} else {
		return (this.gammas[this.curOut].linToLegal(input) * this.al) + this.bl;
	}
}
LUTGamma.prototype.baseIreOut = function(input) {
	return this.gammas[this.curOut].linToLegal(input) * 100;
}
LUTGamma.prototype.ireOut = function(input) {
	return ((this.gammas[this.curOut].linToLegal(input)*this.al)+this.bl) * 100;
}
LUTGamma.prototype.tenBitOut = function(input) {
	return Math.round(((this.gammas[this.curOut].linToData(input)*this.ad)+this.bd) * 1023);
}
LUTGamma.prototype.rec709IreOut = function(input) {
	return this.gammas[this.rec709].linToLegal(input) * 100;
}
LUTGamma.prototype.dataOutRGB = function(rgb) {
	if (this.nul) {
		return [this.gammas[this.curIn].linToData(rgb[0] / this.eiMult),
				this.gammas[this.curIn].linToData(rgb[1] / this.eiMult),
				this.gammas[this.curIn].linToData(rgb[2] / this.eiMult)];
	} else {
		return [(this.gammas[this.curOut].linToData(rgb[0]) * this.ad) + this.bd,
				(this.gammas[this.curOut].linToData(rgb[1]) * this.ad) + this.bd,
				(this.gammas[this.curOut].linToData(rgb[2]) * this.ad) + this.bd];
	}
}
LUTGamma.prototype.legalOutRGB = function(rgb) {
	if (this.nul) {
		return [this.gammas[this.curIn].linToLegal(rgb[0] / this.eiMult),
				this.gammas[this.curIn].linToLegal(rgb[1] / this.eiMult),
				this.gammas[this.curIn].linToLegal(rgb[2] / this.eiMult)];
	} else {
		return [(this.gammas[this.curOut].linToLegal(rgb[0]) * this.al) + this.bl,
				(this.gammas[this.curOut].linToLegal(rgb[1]) * this.al) + this.bl,
				(this.gammas[this.curOut].linToLegal(rgb[2]) * this.al) + this.bl];
	}
}
LUTGamma.prototype.inStopData = function(stop) {
	var input = Math.pow(2,stop) / 5;
	return this.gammas[this.curIn].linToData(input);
}
LUTGamma.prototype.inStopLegal = function(stop) {
	var input = Math.pow(2,stop) / 5;
	return this.gammas[this.curIn].linToLegal(input);
}
LUTGamma.prototype.outStopData = function(stop) {
	var input = Math.pow(2,stop) / 5;
	if (this.nul) {
		return this.gammas[this.curIn].linToData(input);
	} else {
		return (this.gammas[this.curOut].linToData(input * this.eiMult) * this.ad) + this.bd;
	}
}
LUTGamma.prototype.outStopLegal = function(stop) {
	var input = Math.pow(2,stop) / 5;
	if (this.nul) {
		return this.gammas[this.curIn].linToLegal(input);
	} else {
		return (this.gammas[this.curOut].linToLegal(input * this.eiMult) * this.al) + this.bl;
	}
}
LUTGamma.prototype.defaultGamma = function() {
	var max = this.gammas.length;
	var defGam = this.inputs.defGammaIn;
	for (var i = 0; i < max; i++) {
		if (defGam == this.gammas[i].name) {
			this.curIn = i;
			break;
		}
	}
	this.changeShift();
}
LUTGamma.prototype.changeGamma = function() {
	if (this.inputs.inGamma.options[this.inputs.inGamma.options.selectedIndex].value != '9999') {
		this.curIn = parseInt(this.inputs.inGamma.options[this.inputs.inGamma.options.selectedIndex].value);
	} else {
		this.curIn = parseInt(this.inputs.inLinGamma.options[this.inputs.inLinGamma.options.selectedIndex].value);
	}
	if (this.inputs.outGamma.options[this.inputs.outGamma.options.selectedIndex].value != '9999') {
		this.curOut = parseInt(this.inputs.outGamma.options[this.inputs.outGamma.options.selectedIndex].value);
		if (this.gammas[this.curOut].cat === 3) {
			this.nul = true;
		} else {
			this.nul = false;
		}
	} else {
		this.curOut = parseInt(this.inputs.outLinGamma.options[this.inputs.outLinGamma.options.selectedIndex].value);
	}
	this.changeISO();
	this.changeShift();
}
LUTGamma.prototype.changeISO = function() {
	var max = this.gammas.length;
	var newISO = parseFloat(this.inputs.cineEI.value);
	var natISO = parseFloat(this.inputs.nativeISO.innerHTML);
	for (var i = 0; i < max; i++) {
		this.gammas[i].changeISO(newISO);
	}
	if (parseInt(this.inputs.cameraType.value) == 0) {
		this.eiMult = newISO / natISO;
	}
}
LUTGamma.prototype.changeShift = function() {
	this.eiMult = Math.pow(2,parseFloat(this.inputs.stopShift.value));
}
function LUTGammaLog(name,params) {
	this.name = name;
	this.params = params;
	this.iso = 800;
	this.cat = 0;
}
LUTGammaLog.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaLog.prototype.linToData = function(input) {
	if (input >= this.params[8]) {
		return (this.params[2] * Math.log((input * this.params[3]) + this.params[6])/Math.log(this.params[4])) + this.params[5];
	} else if (this.params[0] === 0) {
		return (this.params[2] * Math.log((0.000000000000001 * this.params[3]) + this.params[6])/Math.log(this.params[4])) + this.params[5];
	} else {
		return (input - this.params[1])/this.params[0];
	}
}
LUTGammaLog.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
LUTGammaLog.prototype.linFromData = function(input) {
	if (input >= this.params[7]) {
		return (Math.pow(this.params[4],(input - this.params[5])/this.params[2]) - this.params[6])/this.params[3];		
	} else {
		return (this.params[0]*input) + this.params[1];
	}
}
LUTGammaLog.prototype.linFromLegal = function(input) {
	return this.linFromData((input * 0.85630498533724) + 0.06256109481916);
}
function LUTGammaArri(name,sup) {
	this.name = name;
	this.sup = sup;
	this.iso = 800;
	this.hiCut = false;
	this.cat = 0;
	this.hiMult = 1;
	if (this.sup == 2) {
		this.cut = 0;
		this.a = 5.061087;
		this.b = 0.089004;
		this.c = 0.2471894558;
		this.d = 0.391007;
		this.e = 4.9488401422;
		this.f = 0.1313126129;
	} else {
		this.cut = 0.0105942872;
		this.a = 5.555556;
		this.b = 0.0522539438;
		this.c = 0.2471896946;
		this.d = 0.3855374431;
		this.e = 5.3676547147;
		this.f = 0.0928092678;
	}
}
LUTGammaArri.prototype.changeISO = function(iso) {
	this.iso = iso;
	if (iso > 1507) {
		this.hiCut = true;
	} else {
		this.hiCut = false;
	}
	var shift = Math.log(this.iso/800)/Math.LN2;
	this.hiMult = (65.791419 * shift) - 60.098922;
	if (this.sup == 2) {
		this.cut = 0;
		this.a = 5.061087;
		this.b = 0.089004;
		this.c = ( 0.0000000493*(shift^2)) + (-0.0094084706*shift) + 0.2471894558;
		this.d = 0.391007;
		this.e = (-0.0856489563*(shift^2)) + (-0.7929175529*shift) + 4.9488401422;
		this.f = (-0.0000000793*(shift^2)) + ( 0.0098846077*shift) + 0.1313126129;
	} else {
		this.cut = (0.0000850381*(shift^2)) + (0.0023634140*shift) + 0.0105942872;
		this.a = 5.555556;
		this.b = (-0.0004732561*(shift^2)) + (-0.0131317314*shift) + 0.0522539438;
		this.c = ( 0.0000000472*(shift^2)) + (-0.0094085263*shift) + 0.2471896946;
		this.d = ( 0.0000084236*(shift^2)) + ( 0.0015466913*shift) + 0.3855374431;
		this.e = ( 0.0000001125*(shift^2)) + (-0.2043050951*shift) + 5.3676547147;
		this.f = ( 0.0000003478*(shift^2)) + ( 0.0000143250*shift) + 0.0928092678;
	}
}
LUTGammaArri.prototype.linToData = function(input) {
	var out;
	input = input * 0.9;
	if (input > this.cut) {
		out = ((this.c * Math.log((this.a * input) + this.b)/Math.LN10) + this.d);
	} else {
		out = ((this.e * input) + this.f);
	}
	if (this.hiCut && out > 0.844933) {
		input = input / ((Math.log((out + 8.623709243) * 0.105612045) * this.hiMult / Math.LN10) + 1);
		if (input > this.cut) {
			out = ((this.c * Math.log((this.a * input) + this.b)/Math.LN10) + this.d);
		} else {
			out = ((this.e * input) + this.f);
		}
	}
	return out;
}
LUTGammaArri.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
LUTGammaArri.prototype.linFromData = function(input) {
	var out;
	if (input > ((this.e * this.cut) + this.f)) {
		out = ((Math.pow(10, (input - this.d) / this.c) - this.b)/0.9);
	} else {
		out = ((input - this.f) / (this.e*0.9));
	}
	if (this.hiCut && input > 0.844933) {
		out = out * ((Math.log((input + 8.623709243) * 0.105612045) * this.hiMult / Math.LN10) + 1);
	}
	return out;
}
LUTGammaArri.prototype.linFromLegal = function(input) {
	return this.linFromData((input * 0.85630498533724) + 0.06256109481916);
}
function LUTGammaLin(name,params) {
	this.name = name;
	this.params = params;
	this.gamma = params[0].toFixed(2).toString();
	this.iso = 800;
	this.cat = 1;
}
LUTGammaLin.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaLin.prototype.linToData = function(input) {
	return (this.linToLegal(input) * 0.85630498533724) + 0.06256109481916;
}
LUTGammaLin.prototype.linToLegal = function(input) {
	if (input >= this.params[3]) {
		return ((1 + this.params[2]) * Math.pow(input,1 / this.params[0])) - this.params[2];
	} else {
		return this.params[1] * input;
	}
}
LUTGammaLin.prototype.linFromData = function(input) {
	return this.linFromLegal((input - 0.06256109481916) / 0.85630498533724);
}
LUTGammaLin.prototype.linFromLegal = function(input) {
	if (input >= this.params[4]) {
		return Math.pow((input + this.params[2])/(1 + this.params[2]),this.params[0]);		
	} else {
		return (input / this.params[1]);
	}
}
function LUTGammaGen(name,params) {
	this.name = name;
	this.params = params;
	this.iso = 800;
	this.cat = 2;
}
LUTGammaGen.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaGen.prototype.linToData = function(input) {
	var stop = -300;
	if (input > 0) {
		stop = Math.log(input / 0.2) / Math.LN2;
	}
	if ( input > this.params.top[6] ) {
		return this.params.top[1] + ((this.params.top[0] - this.params.top[1])/Math.pow(1+(this.params.top[4] * Math.exp(-this.params.top[2]*(stop - this.params.top[5]))),1/this.params.top[3]));
	} else if ( input > this.params.high[6] ) {
		return this.params.high[1] + ((this.params.high[0] - this.params.high[1])/Math.pow(1+(this.params.high[4] * Math.exp(-this.params.high[2]*(stop - this.params.high[5]))),1/this.params.high[3]));
	} else if ( input > this.params.mid[6] ) {
		return this.params.mid[1] + ((this.params.mid[0] - this.params.mid[1])/Math.pow(1+(this.params.mid[4] * Math.exp(-this.params.mid[2]*(stop - this.params.mid[5]))),1/this.params.mid[3]));
	} else if ( input > this.params.low[6] ) {
		return this.params.low[1] + ((this.params.low[0] - this.params.low[1])/Math.pow(1+(this.params.low[4] * Math.exp(-this.params.low[2]*(stop - this.params.low[5]))),1/this.params.low[3]));
	} else if ( input <=0 ) {
		return (this.params.blk[0] * input) + this.params.blk[1];
	} else {
		return (this.params.bot[0] * input) + this.params.bot[1];
	}
}
LUTGammaGen.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
function LUTGammaLUT(name,params) {
	this.name = name;
	this.lut = new LUTs();
	this.lut.setInfo(name, params.format, 1, params.size, params.min, params.max);
	this.lut.addLUT(params.lut);
	this.iso = 800;
	this.cat = 2;
}
LUTGammaLUT.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaLUT.prototype.linToData = function(input) {
	if (input >= 0.0125) {
		return this.lut.lumaLCub((0.2556207230 * Math.log((input * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850);
	} else {
		return this.lut.lumaLCub((input + 0.0155818840)/0.1677922920);
	}
}
LUTGammaLUT.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
function LUTGammaLA(name) {
	this.name = name;
	this.iso = 800;
	this.cat = 4;
}
LUTGammaLA.prototype.setLUT = function(lut) {
	this.lut = lut;
}
LUTGammaLA.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaLA.prototype.linToData = function(input) {
	if (input >= 0.0125) {
		return this.lut.lumaLCub((0.2556207230 * Math.log((input * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850);
	} else {
		return this.lut.lumaLCub((input + 0.0155818840)/0.1677922920);
	}
}
LUTGammaLA.prototype.linToLegal = function(input) {
	return (this.linToData(input) - 0.06256109481916) / 0.85630498533724;
}
function LUTGammaNull(name) {
	this.name = name;
	this.iso = 800;
	this.cat = 3;
}
LUTGammaNull.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaNull.prototype.linToData = function(input) {
	return (input * 0.85630498533724) + 0.06256109481916;
}
LUTGammaNull.prototype.linToLegal = function(input) {
	return input;
}
LUTGammaNull.prototype.linFromData = function(input) {
	return (input - 0.06256109481916) / 0.85630498533724;
}
LUTGammaNull.prototype.linFromLegal = function(input) {
	return input;
}
