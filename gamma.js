/* gamma.js
* Transfer functions (gamma) web worker object for the LUTCalc Web App.
* 30th December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTGamma() {
	this.nul = false;
	this.gammas = [];
	this.ver = 0;
	this.curIn = 0;
	this.curOut = 0;
	this.eiMult = 1;
	this.stopShift = 0;
	this.al = 1;
	this.bl = 0;
	this.ad = 1;
	this.bd = 0;
	this.highRef = 0.9;
	this.scale = false;
	this.inL = false;
	this.outL = true;
	this.clip = false;
	this.mlut = false;
	this.linList = [];
	this.inList = [];
	this.outList = [];
	this.catList = [];
	this.gammaList();
}
LUTGamma.prototype.gammaList = function() {
	this.gammas.push(new LUTGammaLog(
		'S-Log3', [ 0.1677922920,-0.0155818840, 0.2556207230, 4.7368421060,10.0000000000, 0.4105571850, 0.0526315790, 0.1673609920, 0.0125000000 ]));
	this.gammas.push(new LUTGammaLog(
		'S-Log2', [ 0.330000000129966,-0.0291229262672453,0.3705223107287920,0.7077625570776260,10,0.6162444730868150,0.0375840001141552,0.0879765396,0 ]));
	this.gammas.push(new LUTGammaLog(
		'S-Log', [ 0.3241960136,-0.0286107171, 0.3705223110, 1,10.0000000000, 0.6162444740, 0.0375840000, 0.0882900450, 0.000000000000001 ]));
	this.gammas.push(new LUTGammaArri(
		'LogC (Sup 3.x & 4.x)',3));
	this.gammas.push(new LUTGammaArri(
		'LogC (Sup 2.x)',2));
	this.gammas.push(new LUTGammaLog(
		'C-Log', [ 0.3734467748,-0.0467265867, 0.45310179472141, 10.1596, 10, 0.1251224801564, 1, 0.00391002619746, -0.0452664 ]));
	this.gammas.push(new LUTGammaLog(
		'V-Log', [ 0.198412698,-0.024801587, 0.241514, 0.9, 10, 0.598206, 0.00873, 0.181, 0.009 ]));
	this.gammas.push(new LUTGammaLog(
		'Panalog', [ 0.324196014, -0.022, 0.434198361, 0.956463747, 10, 0.665276427, 0.040913561, 0.088290045, -0.012075981 ]));
	this.gammas.push(new LUTGammaLog(
		'Cineon', [ 0.0000000000, 0.0000000000, 0.1260649940,22.2791018600, 2.6907845340, 0.2595160220, 0.2702335160, 0.0000000000, 0 ]));
	this.rec709 = this.gammas.length;
	this.gammas.push(new LUTGammaLin(
		'Rec709', [ 1/0.45, 4.50000000, 0.09900000, 0.01800000, 0.08100000 ]));
	this.gammas.push(new LUTGammaLin(
		'Rec2020 12-bit', [ 1/0.45, 4.50000000, 0.09930000, 0.01810000, 0.08145000 ]));
	this.gammas.push(new LUTGammaLin(
		'sRGB', [ 2.40000000,12.92000000, 0.05500000, 0.00313080, 0.04015966 ]));
	this.gammas.push(new LUTGammaLin(
		'Linear', [ 1.00000000, 1.00000000, 0.00000000,999.0000000,999.0000000 ]));
	this.gammas.push(new LUTGammaPQ(
		'Dolby PQ (4300%)', {Lmax: 43}));
	this.gammas.push(new LUTGammaITUProp(
		'ITU Proposal (400%)', {m: 0.12314858 }));
	this.gammas.push(new LUTGammaITUProp(
		'ITU Proposal (800%)', {m: 0.083822216783 }));
	this.gammas.push(new LUTGammaBBC283(
		'BBC WHP283 (400%)', {m: 0.139401137752}));
	this.gammas.push(new LUTGammaBBC283(
		'BBC WHP283 (800%)', {m: 0.097401889128}));
	this.gammas.push(new LUTGammaLUT(
		'Rec709 (800%)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float32Array([	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11883999,
					0.12866034, 0.14015402, 0.15348694, 0.16661814, 0.18004893, 0.19509241, 0.21196180, 0.22823182, 0.24534958, 0.26438452,
					0.28434109, 0.30597769, 0.32733539, 0.35083275, 0.37726131, 0.40365049, 0.43183059, 0.46184950, 0.49470951, 0.52865390,
					0.56485880, 0.60500363, 0.64559087, 0.68000971, 0.71766200, 0.75151050, 0.78401661, 0.81486195, 0.84112764, 0.86582068,
					0.88798658, 0.90701682, 0.92138640, 0.93687713, 0.94946030, 0.95992064, 0.96842281, 0.97612828, 0.98187260, 0.98701779,
					0.99013136, 0.99295086, 0.99486435, 0.99732630, 0.99903882, 1.00259821, 1.00607800, 1.00955872, 1.01304026, 1.01652250,
					1.02000536, 1.02348875, 1.02697261, 1.03045687, 1.03394148])
		}));
	this.gammas.push(new LUTGammaLUT(
		'LC709',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float32Array([	0.06814583, 0.07058296, 0.07478742, 0.08119203, 0.09094543, 0.10577778, 0.12661161, 0.15102622, 0.17938471, 0.21218125,
					0.24999849, 0.29326131, 0.34230636, 0.39712178, 0.44860777, 0.49849961, 0.54794424, 0.59705694, 0.64592328, 0.69367508,
					0.73971284, 0.78243927, 0.81756564, 0.84579703, 0.86788199, 0.88463315, 0.89684124, 0.90530839, 0.91082623, 0.91419579,
					0.91619783, 0.91769979, 0.91873335])
		}));
	this.gammas.push(new LUTGammaLUT(
		'LC709A',
		{
			format: 'cube',
			size: 33,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float32Array([	0.06907518, 0.07698501, 0.08649788, 0.09697740, 0.10914784, 0.12257823, 0.14034715, 0.16235943, 0.18787845, 0.21802093,
					0.25494274, 0.29874926, 0.34699758, 0.39710087, 0.44727886, 0.49717658, 0.54664799, 0.59550263, 0.64323062, 0.68656480,
					0.72969293, 0.77088703, 0.80592477, 0.83463827, 0.85765973, 0.87554394, 0.88887148, 0.89838561, 0.90479332, 0.90885911,
					0.91131489, 0.91295960, 0.91457395])
		}));
	this.gammas.push(new LUTGammaLUT(
		'Cine+709',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float32Array([	0.09547690, 0.09547690, 0.09547690, 0.09547690, 0.09595623, 0.09861297, 0.10078553, 0.10295884, 0.10504074, 0.10742854,
					0.10996294, 0.11304644, 0.11772884, 0.12403679, 0.13171286, 0.14466645, 0.15939859, 0.17694901, 0.19792855, 0.22257981,
					0.25030519, 0.28018567, 0.31390983, 0.34977213, 0.38776135, 0.42716260, 0.46818127, 0.50880158, 0.54999946, 0.58723907,
					0.62412855, 0.65861958, 0.69112710, 0.72251355, 0.75106336, 0.77924102, 0.80188122, 0.82410616, 0.84442576, 0.86127530,
					0.87567760, 0.88784540, 0.89989060, 0.90830854, 0.91599433, 0.91795243, 0.91844505, 0.91884265, 0.91886608, 0.91886608,
					0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608,
					0.91886608, 0.91886608, 0.91886608, 0.91886608, 0.91886608])
		}));
	this.gammas.push(new LUTGammaLUT(
		'HG8009G40 (HG7)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float32Array([	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11877663,
					0.12870269, 0.14062508, 0.15530285, 0.17128969, 0.18975506, 0.20194191, 0.21350458, 0.22559329, 0.23818850, 0.25204391,
					0.26756238, 0.28482752, 0.30274382, 0.32158673, 0.34408764, 0.36756165, 0.39199445, 0.41935688, 0.44837377, 0.47848551,
					0.51075976, 0.54570010, 0.57983824, 0.61447689, 0.65112936, 0.68499113, 0.71891859, 0.75314337, 0.78354278, 0.81326088,
					0.84125913, 0.86479608, 0.88546580, 0.90573055, 0.92384898, 0.93988492, 0.95264785, 0.96376072, 0.97334372, 0.98062241,
					0.98709762, 0.99131747, 0.99548676, 0.99936430, 1.00048119, 1.00201680, 1.00340872, 1.00480101, 1.00619362, 1.00758652,
					1.00897966, 1.01037302, 1.01176656, 1.01316027, 1.01455411])
		}));
	this.gammas.push(new LUTGammaLUT(
		'HG8009G33 (HG8)',
		{
			format: 'cube',
			size: 65,
			min: [0,0,0],
			max: [1,1,1],
			lut: new Float32Array([	0.07239609, 0.07447394, 0.07686249, 0.07949977, 0.08219600, 0.08567028, 0.09029758, 0.09875797, 0.10914082, 0.11883999,
					0.12866695, 0.14029884, 0.15310654, 0.16395771, 0.17159488, 0.17994152, 0.18962627, 0.19913671, 0.20954062, 0.22066463,
					0.23299733, 0.24700070, 0.26155893, 0.27678437, 0.29492812, 0.31421695, 0.33371713, 0.35623191, 0.38106152, 0.40679243,
					0.43514727, 0.46554389, 0.49718732, 0.52924796, 0.56498567, 0.59981238, 0.63527053, 0.67212902, 0.70738288, 0.74196788,
					0.77508835, 0.80634606, 0.83308644, 0.86097158, 0.88602416, 0.90802721, 0.92741313, 0.94399390, 0.95904874, 0.97104303,
					0.98114013, 0.98817840, 0.99432461, 0.99942929, 1.00040913, 1.00201680, 1.00340872, 1.00480101, 1.00619362, 1.00758652,
					1.00897966, 1.01037302, 1.01176656, 1.01316027, 1.01455411])
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
	var logList = [], linList = [], genList = [], hdrList = [];
	for (var i=0; i < max; i++) {
		this.catList[i] = this.gammas[i].cat;
		switch(this.gammas[i].cat) {
			case 0: logList.push({name: this.gammas[i].name, idx: i});
					break;
			case 1: this.linList.push({name: this.gammas[i].name + ' - ' + this.gammas[i].gamma, idx: i});
					break;
			case 2: genList.push({name: this.gammas[i].name, idx: i});
					break;
			case 4: hdrList.push({name: this.gammas[i].name, idx: i});
					break;
			default: break;
		}
	}
	this.inList = logList.slice();
	this.inList.push({name: 'Linear / Rec709', idx: 9999});
	this.inList = this.inList.concat(hdrList);
	this.outList = logList.slice();
	this.outList.push({name: 'Linear / Rec709', idx: 9999});
	this.outList = this.outList.concat(hdrList);
	this.outList = this.outList.concat(genList);
	this.outList.push({name: this.gammas[max-1].name, idx: (max-1)});
}
// I/O functions
LUTGamma.prototype.setParams = function(params) {
	var out = {	t: 20, v: this.ver , changedGamma: false};
	if (typeof params.v !== 'number') {
		out.err = true;
		out.details = 'Missing version no.';
		return out;
	}
	if (typeof params.inGamma === 'number') {
		if (params.inGamma !== 9999) {
			if (params.inGamma !== this.curIn) {
				out.changedGamma = true;
			}
			this.curIn = params.inGamma;
			out.inGamma = this.curIn;
		} else {
			if (typeof params.inLinGamma === 'number') {
				if (params.inLinGamma !== this.curIn) {
					out.changedGamma = true;
				}
				this.curIn = params.inLinGamma;
				out.inLinGamma = this.curIn;
			}
		}
	}
	var changedOut = false;
	if (typeof params.outGamma === 'number') {
		if (params.outGamma !== 9999) {
			if (params.outGamma !== this.curOut) {
				out.changedGamma = true;
				changedOut = true;
			}
			this.curOut = params.outGamma;
			out.outGamma = this.curOut;
			if (this.gammas[this.curOut].cat === 3) {
				this.nul = true;
			} else {
				this.nul = false;
			}
		} else {
			if (typeof params.outLinGamma === 'number') {
				if (params.outLinGamma !== this.curOut) {
					out.changedGamma = true;
					changedOut = true;
				}
				this.curOut = params.outLinGamma;
				out.outLinGamma = this.curOut;
				this.nul = false;
			}
		}
	}
	if (this.gammas[this.curOut].cat !== 0 && this.gammas[this.curOut].cat !== 3){
		this.scale = true;
	} else {
		this.scale = false;
	}
	if (typeof params.defGamma === 'number') {
		var max = this.gammas.length;
		for (var j = 0; j < max; j++) {
			if (defGamma == this.gammas[j].name) {
				this.curIn = j;
				break;
			}
		}
		this.eiMult = Math.pow(2,this.stopShift);
	}
	if (typeof params.newISO === 'number') {
		var max = this.gammas.length;
		for (var j = 0; j < max; j++) {
			this.gammas[j].changeISO(params.newISO);
		}
		if (typeof params.natISO === 'number' && typeof params.camType === 'number' && params.camType === 0) {
			this.eiMult = params.newISO / params.natISO;
		}
	}
	if (typeof params.stopShift === 'number') {
		this.eiMult = Math.pow(2,params.stopShift);
	}
	if (typeof params.inL === 'boolean') {
		this.inL = params.inL;
	}
	if (typeof params.outL === 'boolean') {
		this.outL = params.outL;
	}
//	if (typeof params.al === 'number' && typeof params.bl === 'number') {
//		this.al = params.al;
//		this.bl = params.bl;
//	}
//	if (typeof params.ad === 'number' && typeof params.bd === 'number') {
//		this.ad = params.ad;
//		this.bd = params.bd;
//	}
	if (typeof params.clip === 'boolean') {
		this.clip = params.clip;
	}
	if (typeof params.mlut === 'boolean') {
		this.mlut = params.mlut;
	}
	var blackDefault = this.gammas[this.curOut].linToLegal(0);
	var blackMap;
	if (typeof params.blackLevel === 'number') {
		if (Math.abs(blackDefault-params.blackLevel)>0.0001 && !changedOut) {
			blackMap = params.blackLevel;
		} else {
			blackMap = blackDefault;
		}
	} else {
		blackMap = blackDefault;
	}
	var changedRef = false;
	if (typeof params.highRef === 'number') {
		if (this.highRef !== params.highRef) {
			changedRef = true;
		}
		this.highRef = params.highRef;
	} else {
		this.highRef = 0.9;
	}
	var highMap;
	highDefault = this.gammas[this.curOut].linToLegal(this.highRef/0.9);
	if (typeof params.highMap === 'number') {
		if (Math.abs(highDefault-params.highMap)>0.0001 && !changedOut && !changedRef) {
			highMap = params.highMap;
		} else {
			highMap = highDefault;
		}
	} else {
		highMap = highDefault;
	}
	out.blackDef = blackDefault;
	out.blackLevel = blackMap;
	out.highRef = this.highRef;
	out.highDef = highDefault;
	out.high709 = this.gammas[this.rec709].linToLegal(this.highRef/0.9);
	out.highMap = highMap;
	if (typeof params.tweaks !== 'boolean') {
		params.tweaks = false;
	}
	if (typeof params.blackTweak !== 'boolean') {
		params.blackTweak = false;
	}
	if (!params.blackTweak) {
		blackMap = blackDefault;
	}
	if (typeof params.highTweak !== 'boolean') {
		params.highTweak = false;
	}
	if (!params.highTweak) {
		highMap = highDefault;
	}
	if (!this.nul && params.tweaks && (params.blackTweak || params.highTweak)) {
		this.al = (highMap - blackMap)/(highDefault - blackDefault);
		this.bl = blackMap - (blackDefault * this.al);
		this.ad = this.al;
		this.bd = ((876*(blackMap - (this.al*blackDefault))) + (64*(1- this.al)))/1023;
	} else {
		this.al = 1;
		this.bl = 0;
		this.ad = 1;
		this.bd = 0;
	}
	this.ver = params.v;
	out.v = this.ver;
	return out;
}
LUTGamma.prototype.oneDCalc = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, start: i.start, vals: i.vals, dim: i.dim};
	var s = i.start;
	var max = i.vals;
	var o = new Float32Array(max*3);
	var d = i.dim -1;
	var cMin;
	if (this.outL && !this.clip) {
		cMin = -0.06256109481916;
	} else {
		cMin = 0;
	}
	var cMax;
	if (this.clip) {
		cMax = 1;
	} else if (this.mlut) {
		if (this.outL) {
			cMax = 1.09474885844749;
		} else {
			cMax = 1;
		}
	} else {
		cMax = 65535;
	}
	if (this.nul) {
		if (this.inL) {
			if (this.outL) {
				for (var j=0; j<max; j++) {
					o[(j*3)] = Math.min(cMax,Math.max(cMin,(s+j)/d));
					o[(j*3)+1] = o[(j*3)];
					o[(j*3)+2] = o[(j*3)];
				}
			} else {
				for (var j=0; j<max; j++) {
					o[(j*3)] = Math.min(cMax,Math.max(cMin,((876*(s+j)/d)+64)/1023));
					o[(j*3)+1] = o[(j*3)];
					o[(j*3)+2] = o[(j*3)];
				}
			}
		} else {
			if (this.outL) {
				for (var j=0; j<max; j++) {
					o[(j*3)] = Math.min(cMax,Math.max(cMin,((1023*(s+j)/d)-64)/876));
					o[(j*3)+1] = o[(j*3)];
					o[(j*3)+2] = o[(j*3)];
				}
			} else {
				for (var j=0; j<max; j++) {
					o[(j*3)] = Math.min(cMax,Math.max(cMin,(s+j)/d));
					o[(j*3)+1] = o[(j*3)];
					o[(j*3)+2] = o[(j*3)];
				}
			}
		}
	} else {
		if (this.scale) {
			if (this.inL) {
				if (this.outL) {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromLegal((s+j)/d)*this.eiMult) * this.al) + this.bl));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				} else {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToData(this.gammas[this.curIn].linFromLegal((s+j)/d)*this.eiMult) * this.al) + this.bl));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				}
			} else {
				if (this.outL) {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromData((s+j)/d)*this.eiMult) * this.ad) + this.bd));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				} else {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToData(this.gammas[this.curIn].linFromData((s+j)/d)*this.eiMult) * this.ad) + this.bd));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				}
			}
		} else {
			if (this.inL) {
				if (this.outL) {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromLegal((s+j)/d)*this.eiMult)));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				} else {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToData(this.gammas[this.curIn].linFromLegal((s+j)/d)*this.eiMult)));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				}
			} else {
				if (this.outL) {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromData((s+j)/d)*this.eiMult)));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				} else {
					for (var j=0; j<max; j++) {
						o[(j*3)] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToData(this.gammas[this.curIn].linFromData((s+j)/d)*this.eiMult)));
						o[(j*3)+1] = o[(j*3)];
						o[(j*3)+2] = o[(j*3)];
					}
				}
			}
		}
	}
	out.o = o;
	return out;
}
LUTGamma.prototype.inCalc = function(p,t,i) {
	var o = [];
	var max = i.length;
	if (this.inL) {
		for (var j=0; j<max; j++) {
			o[j] = this.gammas[this.curIn].linFromLegal(i[j]);
		}
	} else {
		for (var j=0; j<max; j++) {
			o[j] = this.gammas[this.curIn].linFromData(i[j]);
		}
	}
	return { p: p, t: t+20, v: this.ver, i: i.slice(0), o: o };
}
LUTGamma.prototype.inCalcRGB = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, R:i.R, G:i.G, B:i.B, vals: i.vals, dim: i.dim, eiMult: this.eiMult};
	var B = i.B;
	var max = i.dim;
	var o = new Float32Array(i.vals*3);
	var d = i.dim -1;
	if (this.nul) {
		if (this.inL) {
			if (this.outL) {
				for (var G=0; G<max; G++) {
					for (var R=0; R<max; R++) {
						var j = (R+(G*max))*3;
						o[(j*3)] = R/d;
						o[(j*3)+1] = G/d;
						o[(j*3)+2] = B/d;
					}
				}
			} else {
				for (var G=0; G<max; G++) {
					for (var R=0; R<max; R++) {
						var j = (R+(G*max))*3;
						o[ j ] = ((876*R/d)+64)/1023;
						o[j+1] = ((876*G/d)+64)/1023;
						o[j+2] = ((876*B/d)+64)/1023;
					}
				}
			}
		} else {
			if (this.outL) {
				for (var G=0; G<max; G++) {
					for (var R=0; R<max; R++) {
						var j = (R+(G*max))*3;
						o[ j ] = ((1023*R/d)-64)/876;
						o[j+1] = ((1023*G/d)-64)/876;
						o[j+2] = ((1023*B/d)-64)/876;
					}
				}
			} else {
				for (var G=0; G<max; G++) {
					for (var R=0; R<max; R++) {
						var j = (R+(G*max))*3;
						o[ j ] = R/d;
						o[j+1] = G/d;
						o[j+2] = B/d;
					}
				}
			}
		}
	} else {
		if (this.inL) {
			for (var G=0; G<max; G++) {
				for (var R=0; R<max; R++) {
					var j = (R+(G*max))*3;
					o[ j ] = this.gammas[this.curIn].linFromLegal(R/d);
					o[j+1] = this.gammas[this.curIn].linFromLegal(G/d);
					o[j+2] = this.gammas[this.curIn].linFromLegal(B/d);
				}
			}
		} else {
			for (var G=0; G<max; G++) {
				for (var R=0; R<max; R++) {
					var j = (R+(G*max))*3;
					o[ j ] = this.gammas[this.curIn].linFromData(R/d);
					o[j+1] = this.gammas[this.curIn].linFromData(G/d);
					o[j+2] = this.gammas[this.curIn].linFromData(B/d);
				}
			}
		}
	}
	out.o = o;
	return out;
}
LUTGamma.prototype.outCalcRGB = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, R:i.R, G:i.G, B:i.B, vals: i.vals, dim: i.dim };
	var o = i.o;
	var cMin;
	if (this.outL && !this.clip) {
		cMin = -0.06256109481916;
	} else {
		cMin = 0;
	}
	var cMax;
	if (this.clip) {
		cMax = 1;
	} else if (this.mlut) {
		if (this.outL) {
			cMax = 1.09474885844749;
		} else {
			cMax = 1;
		}
	} else {
		cMax = 65535;
	}
	var max = o.length;
	if (this.nul) {
		for (var j=0; j<max; j++) {
			o[j] = Math.min(cMax,Math.max(cMin,o[j]));
		}
	} else {
		if (this.scale) {
			if (this.outL) {
				for (var j=0; j<max; j++) {
					o[j] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToLegal(o[j])*this.al)+this.bl));
				}
			} else {
				for (var j=0; j<max; j++) {
					o[j] = Math.min(cMax,Math.max(cMin,(this.gammas[this.curOut].linToData(o[j])*this.ad)+this.bd));
				}
			}
		} else {
			if (this.outL) {
				for (var j=0; j<max; j++) {
					o[j] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToLegal(o[j])));
				}
			} else {
				for (var j=0; j<max; j++) {
					o[j] = Math.min(cMax,Math.max(cMin,this.gammas[this.curOut].linToData(o[j])));
				}
			}
		}
	}
	out.o = o;
	return out;
}
LUTGamma.prototype.getLists = function(p,t) {
	return {
		p: p,
		t: t+20,
		v: this.ver,
		inList: this.inList,
		outList: this.outList,
		linList: this.linList,
		catList: this.catList,
		rec709: this.rec709,
		LA: this.LA
	};
}
LUTGamma.prototype.setLA = function(p,t,i) {
	this.gammas[this.LA].setLUT(i);
	return { p: p, t:t+20, v: this.ver, i: i.title };
}
LUTGamma.prototype.setLATitle = function(p,t,i) {
	this.gammas[this.LA].setTitle(i);
	return { p: p, t:t+20, v: this.ver, i: i };
}
LUTGamma.prototype.ioNames = function(p,t) {
	var out = {};
	out.inName = this.gammas[this.curIn].name;
	out.outName = this.gammas[this.curOut].name;
	if (this.gammas[this.curIn].cat === 1) {
		out.inG = this.gammas[this.curIn].gamma;
	}
	if (this.gammas[this.curOut].cat === 1) {
		out.outG = this.gammas[this.curOut].gamma;
	}
	return {p: p, t: t+20, v: this.ver, o: out};
}
LUTGamma.prototype.chartVals = function(p,t,i) {
	var out = {p: p, t: t+20, v: this.ver, refX: i.refX, stopX: i.stopX, lutX: i.lutX, tableX: i.tableX};
	out.chartRefIns = [];
	out.chartRefOuts = [];
	var max = i.refX.length;
	for (var j=0; j<max; j++) {
		out.chartRefIns[j] = this.gammas[this.curIn].linToLegal(i.refX[j] / 0.9);
		if (this.nul) {
			out.chartRefOuts[j] = this.gammas[this.curIn].linToLegal(i.refX[j] / 0.9);
		} else {
			if (this.scale) {
				out.chartRefOuts[j] = (this.gammas[this.curOut].linToLegal(this.eiMult * i.refX[j] / 0.9) * this.al) + this.bl;
			} else {
				out.chartRefOuts[j] = this.gammas[this.curOut].linToLegal(this.eiMult * i.refX[j] / 0.9);
			}
		}
	}
	out.chartStopIns = [];
	out.chartStopOuts = [];
	max = i.stopX.length;
	for (var j=0; j<max; j++) {
		out.chartStopIns[j] = this.gammas[this.curIn].linToLegal(Math.pow(2,i.stopX[j]) / 5);
		if (this.nul) {
			out.chartStopOuts[j] = this.gammas[this.curIn].linToLegal(Math.pow(2,i.stopX[j]) / 5);
		} else {
			if (this.scale) {
				out.chartStopOuts[j] = (this.gammas[this.curOut].linToLegal(this.eiMult * Math.pow(2,i.stopX[j]) / 5) * this.al) + this.bl;
			} else {
				out.chartStopOuts[j] = this.gammas[this.curOut].linToLegal(this.eiMult * Math.pow(2,i.stopX[j]) / 5);
			}
		}
	}
	out.chartLutOuts = [];
	max = i.lutX.length;
	for (var j=0; j<max; j++) {
		if (this.nul) {
			out.chartLutOuts[j] = ((i.lutX[j]*1023) - 64)/876;
		} else {
			if (this.scale) {
				out.chartLutOuts[j] = (this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromData(i.lutX[j])*this.eiMult) * this.al) + this.bl;
			} else {
				out.chartLutOuts[j] = this.gammas[this.curOut].linToLegal(this.gammas[this.curIn].linFromData(i.lutX[j])*this.eiMult);
			}
		}
	}
	out.tableIREVals = [];
	max = i.tableX.length;
	for (var j=0; j<max; j++) {
		if (this.nul) {
			out.tableIREVals[j] = this.gammas[this.curIn].linToLegal(i.tableX[j] / 0.9);
		} else {
			if (this.scale) {
				out.tableIREVals[j] = (this.gammas[this.curOut].linToLegal(this.eiMult * i.tableX[j] / 0.9) * this.al) + this.bl;
			} else {
				out.tableIREVals[j] = this.gammas[this.curOut].linToLegal(this.eiMult * i.tableX[j] / 0.9);
			}
		}
	}	
	return out;
}
// Gamma calculation objects
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
		out = (Math.pow(10, (input - this.d) / this.c) - this.b)/(this.a*0.9);
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
function LUTGammaPQ(name,params) {
	this.name = name;
	this.params = params.nits;
	this.cat = 4;
	this.Lmax = params.Lmax;
	this.n = (2610/4096)*(1/4);
	this.m = (2523/4096)*128;
	this.c1 = (3424/4096);
	this.c2 = (2413/4096)*32;
	this.c3 = (2392/4096)*32;
	this.changeISO(800);
}
LUTGammaPQ.prototype.changeISO = function(iso) {
	this.iso = iso;
	this.L = this.Lmax;
	this.e = this.linToLegal(0);
}
LUTGammaPQ.prototype.linToData = function(input) {
	return (this.linToLegal(input) * 0.85630498533724) + 0.06256109481916;
}
LUTGammaPQ.prototype.linToLegal = function(input) {
	if (input < 0) {
		return this.e;
	} else {
		var r = Math.pow(input/this.L,this.n);
		return Math.pow((this.c1+(this.c2*r))/(1+(this.c3*r)),this.m);
	}
}
LUTGammaPQ.prototype.linFromData = function(input) {
	return this.linFromLegal((input - 0.06256109481916) / 0.85630498533724);
}
LUTGammaPQ.prototype.linFromLegal = function(input) {
	if (input <= this.e) {
		return 0;
	} else {
		var r = Math.pow(input,1/this.m);
		return this.L*Math.pow((r-this.c1)/(this.c2-(this.c3*r)),1/this.n);
	}
}
function LUTGammaITUProp(name,params) {
	this.name = name;
	this.iso = 800;
	this.cat = 4;
	this.setM(params.m);
}
LUTGammaITUProp.prototype.setM = function(m) {
	this.m = m;
	this.n = 0.45*1.09930000*Math.pow(m,0.45);
	this.r = (1.09930000*Math.pow(m,0.45)*(1-(0.45*Math.log(m)))) - 0.09930000;
	this.e = this.linToLegal(m);
}
LUTGammaITUProp.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaITUProp.prototype.linToData = function(input) {
	return (this.linToLegal(input) * 0.85630498533724) + 0.06256109481916;
}
LUTGammaITUProp.prototype.linToLegal = function(input) {
	if (input > this.m) {
		return ((this.n*Math.log(input)) + this.r);
	} else if (input >= 0.01810000) {
		return (1.09930000 * Math.pow(input,0.45)) - 0.09930000;
	} else {
		return 4.5 * input;
	}
}
LUTGammaITUProp.prototype.linFromData = function(input) {
	return this.linFromLegal((input - 0.06256109481916) / 0.85630498533724);
}
LUTGammaITUProp.prototype.linFromLegal = function(input) {
	if (input > this.e) {
		return Math.exp((input-this.r)/this.n);
	} else if (input >= 0.08145000) {
		return Math.pow((input + 0.09930000)/(1.09930000),1/0.45);		
	} else {
		return (input / 4.5);
	}
}
function LUTGammaBBC283(name,params) {
	this.name = name;
	this.iso = 800;
	this.cat = 4;
	this.setM(params.m);
	this.setS(1);
}
LUTGammaBBC283.prototype.setM = function(m) {
	this.m = m;
	this.n = Math.sqrt(m)/2
	this.r = Math.sqrt(m)*(1-Math.log(Math.sqrt(m)));
	this.e = this.linToLegal(m);
}
LUTGammaBBC283.prototype.setS = function(s) { // System Gamma
	this.s = s;
}
LUTGammaBBC283.prototype.changeISO = function(iso) {
	this.iso = iso;
}
LUTGammaBBC283.prototype.linToData = function(input) {
	return (this.linToLegal(input) * 0.85630498533724) + 0.06256109481916;
}
LUTGammaBBC283.prototype.linToLegal = function(input) {
	if (input > this.m) {
		return ((this.n*Math.log(input)) + this.r);
	} else if (input>0) {
		return Math.sqrt(input);
	} else {
		return 0;
	}
}
LUTGammaBBC283.prototype.linFromData = function(input) {
	return this.linFromLegal((input - 0.06256109481916) / 0.85630498533724);
}
LUTGammaBBC283.prototype.linFromLegal = function(input) {
	if (input >this.e) {
		return Math.exp(this.s*(input-this.r)/this.n);
	} else {
		return Math.pow(input,2*this.s);
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
	this.lut.addLUT(params.lut.buffer);
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
LUTGammaLA.prototype.setTitle = function(name) {
	this.name = name;
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
// Web worker code
importScripts('lut.js');
var gammas = new LUTGamma();
addEventListener('message', function(e) {
	var d = e.data;
	if (d.t !== 0 && d.t < 20 && d.v !== gammas.ver) {
		postMessage({p: d.p, t: d.t, v: d.v, resend: true, d: d.d});
	} else {
		switch (d.t) {
			case 0:	postMessage(gammas.setParams(d.d));
					break;
			case 1: postMessage(gammas.oneDCalc(d.p,d.t,d.d)); // Calculate 1D (gamma only) conversion from input to output
					break;
//			case 2: postMessage(gammas.outCalc(d.p,d.t,d.d)); 
//					break;
			case 3: postMessage(gammas.inCalcRGB(d.p,d.t,d.d)); 
					break;
			case 4: postMessage(gammas.outCalcRGB(d.p,d.t,d.d)); 
					break;
			case 5: postMessage(gammas.getLists(d.p,d.t)); 
					break;
			case 6: postMessage(gammas.setLA(d.p,d.t,d.d)); 
					break;
			case 7: postMessage(gammas.setLATitle(d.p,d.t,d.d)); 
					break;
//			case 8: postMessage(gammas.outBlackVal(d.p,d.t)); // Get base (black) IRE value for output
//					break;
//			case 9: postMessage(gammas.outIREVal(d.p,d.t,d.d)); // Get IRE values for output from a list of linear values
//					break;
			case 10:postMessage(gammas.ioNames(d.p,d.t));
					break;
			case 11:postMessage(gammas.chartVals(d.p,d.t,d.d));
					break;
//			case 12:postMessage(gammas.highDefault(d.p,d.t,d.d));
//					break;
		}
	}
}, false);
