/* colourspace.js
* Colour Space (gamut) conversion web worker object for the LUTCalc Web App.
* 27th June December 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTColourSpace() {
	this.g = [];
	this.csIn = [];
	this.csOut = [];
	this.csM = [];
	this.CATs = new CSCAT();
	this.sysCAT = 'CIECAT02';
	this.sysCATIdx = this.CATs.modelIdx(this.sysCAT);
	this.cat02 = new Float64Array([
		 0.7328, 0.4296,-0.1624,
		-0.7036, 1.6975, 0.0061,
		 0.0030, 0.0136, 0.9834
	]);
	this.invCat02 = this.mInverse(this.cat02);
	this.matList = [];
	this.xyzMatrices();
	this.system = this.g[this.sysIdx];
	this.system.inv = this.mInverse(this.system.toXYZ);
	this.y = new Float64Array([	0.2126, 0.7152, 0.0722 ]);
	this.systemMatrices();
	this.setSaturated();
	this.setYCoeffs();

	this.nul = false;
	this.isTrans = false;
	this.ver = 0;
	this.curIn = 0;
	this.curOut = 0;
	this.planck = new Planck();
	this.system.CCT = this.planck.getCCT(this.system.white);
	this.system.Dxy = this.planck.getDxy(this.system.white,this.system.CCT);
	this.wb = new CSWB(this.system.white,this.system.toXYZ, this.planck, this.CATs);
	this.curHG = 0;
	this.hgLow = 0;
	this.hgHigh = 0;
	this.hgLin = true;
	this.hgLowStop = 0;
	this.hgHighStop = 0;
	this.LA = 0;
	this.pass = 0;
	this.inList = [];
	this.outList = [];
	this.laList = [];
	this.csInSub = [];
	this.csOutSub = [];
	this.csLASub = [];
	if ((new Int8Array(new Int16Array([1]).buffer)[0]) > 0) {
		this.isLE = true;
	} else {
		this.isLE = false;
	}
	this.asc = new Float64Array([
		1,1,1,	// s - Slope / Gain
		0,0,0,	// o - Offset / Lift
		1,1,1,	// p - Power / Gamma
		1		// sat - Saturation
	]);
	this.initPSSTCDL();
	this.fcVals = new Float64Array([
		0.00078125,// Purple - Black Clip (18%-8 stops)
		0.002915728,// Blue - Just Above Black Clip (18%-6.1 stops)
		0.174110113,// Green - 18%-0.2 Stop
		0.229739671,// Green - 18%+0.2 stop
		0.354307008,// Pink - One Stop Over 18%-0.175 Stop
		0.451585762,// Pink - One Stop Over 18%+0.175 Stop
		0.885767519,// Orange - 90% White-0.175 Stop
		1.128964405,// Orange - 90% White+0.175 Stop
		10.39683067,// Yellow - White Clip (Sony F55,F5,FS7)-0.3 Stop
		12.36398501 // Red - White Clip (Sony F55,F5,FS7) 18%+6 stops
	]);

	this.doHG = false;
	this.doWB = false;
	this.doASCCDL = false;
	this.doPSSTCDL = false;
	this.doFC = false;

	this.loadColourSpaces();
	this.buildColourSquare();
	this.buildMultiColours();
}
// Prepare colour spaces
LUTColourSpace.prototype.subIdx = function(cat) {
	switch (cat) {
		case 'Sony': return 0;
		case 'Arri': return 1;
		case 'Canon': return 2;
		case 'Panasonic': return 3;
		case 'RED': return 4;
		case 'GoPro': return 5;
		case 'Adobe': return 6;
		case 'Rec709': return 7;
		case 'Rec2020': return 8;
		case 'P3': return 9;
		case 'Wide Gamut': return 10;
		case 'ACES': return 11;
		case 'All': return 12;
	}
	return false;
};
LUTColourSpace.prototype.loadColourSpaces = function() {
	this.subNames = [	'Sony',
						'Arri',
						'Canon',
						'Panasonic',
						'RED',
						'GoPro',
						'Adobe',
						'Rec709',
						'Rec2020',
						'P3',
						'Wide Gamut',
						'ACES',
						'All'
	];						
	this.SG3C = this.csIn.length;
	this.csIn.push(this.toSys('Sony S-Gamut3.cine'));
	this.csInSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Sony S-Gamut3'));
	this.csInSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Sony S-Gamut'));
	this.csInSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Alexa Wide Gamut'));
	this.csInSub.push([this.subIdx('Arri'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Canon Cinema Gamut'));
	this.csInSub.push([this.subIdx('Canon'),this.subIdx('Wide Gamut')]);
	this.csIn.push(new CSCanonIDT('Canon CP IDT (Daylight)', true, this.toSys('ACES AP0').m, this.system.white.buffer.slice(0)));
	this.csInSub.push([this.subIdx('Canon'),this.subIdx('Rec709')]);
	this.csIn.push(new CSCanonIDT('Canon CP IDT (Tungsten)', false, this.toSys('ACES AP0').m, this.system.white.buffer.slice(0)));
	this.csInSub.push([this.subIdx('Canon'),this.subIdx('Rec709')]);
	this.csIn.push(this.toSys('Panasonic V-Gamut'));
	this.csInSub.push([this.subIdx('Panasonic'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('DRAGONColor'));
	this.csInSub.push([this.subIdx('RED')]);
	this.csIn.push(this.toSys('DRAGONColor2'));
	this.csInSub.push([this.subIdx('RED')]);
	this.csIn.push(this.toSys('REDColor'));
	this.csInSub.push([this.subIdx('RED')]);
	this.csIn.push(this.toSys('REDColor2'));
	this.csInSub.push([this.subIdx('RED')]);
	this.csIn.push(this.toSys('REDColor3'));
	this.csInSub.push([this.subIdx('RED')]);
	this.csIn.push(this.toSys('REDColor4'));
	this.csInSub.push([this.subIdx('RED')]);
	this.csIn.push(this.toSys('REDWideGamutRGB'));
	this.csInSub.push([this.subIdx('RED')]);
	this.csIn.push(this.toSys('Protune Native'));
	this.csInSub.push([this.subIdx('GoPro'),this.subIdx('Wide Gamut')]);
	this.rec709In = this.csIn.length;
	this.csIn.push(this.toSys('Rec709'));
	this.csInSub.push([this.subIdx('Rec709')]);
	this.csIn.push(this.toSys('Rec2020'));
	this.csInSub.push([this.subIdx('Rec2020'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('sRGB'));
	this.csInSub.push([]);
	this.csIn.push(this.toSys('ACES AP0'));
	this.csInSub.push([this.subIdx('ACES'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('ACEScg AP1'));
	this.csInSub.push([this.subIdx('ACES'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('XYZ'));
	this.csInSub.push([this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('DCI-P3'));
	this.csInSub.push([this.subIdx('P3')]);
	this.csIn.push(this.toSys('DCI-P3D60'));
	this.csInSub.push([this.subIdx('P3')]);
	this.csIn.push(this.toSys('Canon DCI-P3+'));
	this.csInSub.push([this.subIdx('Canon'),this.subIdx('P3')]);
	this.csIn.push(this.toSys('Adobe RGB'));
	this.csInSub.push([this.subIdx('Adobe')]);
	this.csIn.push(this.toSys('Adobe Wide Gamut RGB'));
	this.csInSub.push([this.subIdx('Adobe'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('ProPhoto RGB'));
	this.csInSub.push([this.subIdx('Wide Gamut')]);
	this.custIn = this.csIn.length;
	this.csIn.push(this.toSys('Custom In'));
	this.csInSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12]);
	this.csIn.push(new CSMatrix('Passthrough', new Float64Array([1,0,0, 0,1,0, 0,0,1]), this.system.white.buffer.slice(0)));
	this.csInSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12]);

	this.csOut.push(this.fromSys('Sony S-Gamut3.cine'));
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Sony S-Gamut3'));
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Sony S-Gamut'));
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Alexa Wide Gamut'));
	this.csOutSub.push([this.subIdx('Arri'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Canon Cinema Gamut'));
	this.csOutSub.push([this.subIdx('Canon'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Panasonic V-Gamut'));
	this.csOutSub.push([this.subIdx('Panasonic'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('DRAGONColor'));
	this.csOutSub.push([this.subIdx('RED')]);
	this.csOut.push(this.fromSys('DRAGONColor2'));
	this.csOutSub.push([this.subIdx('RED')]);
	this.csOut.push(this.fromSys('REDColor'));
	this.csOutSub.push([this.subIdx('RED')]);
	this.csOut.push(this.fromSys('REDColor2'));
	this.csOutSub.push([this.subIdx('RED')]);
	this.csOut.push(this.fromSys('REDColor3'));
	this.csOutSub.push([this.subIdx('RED')]);
	this.csOut.push(this.fromSys('REDColor4'));
	this.csOutSub.push([this.subIdx('RED')]);
	this.csOut.push(this.fromSys('REDWideGamutRGB'));
	this.csOutSub.push([this.subIdx('RED')]);
	this.csOut.push(this.fromSys('Protune Native'));
	this.csOutSub.push([this.subIdx('GoPro'),this.subIdx('Wide Gamut')]);
	this.rec709Out = this.csIn.length;
	this.csOut.push(this.fromSys('Rec709'));
	this.csOutSub.push([this.subIdx('Rec709')]);

	this.csOut.push(
		this.fromSysTC('Alexa-X-2',
			{
				isOut: true,
				linMatrix: this.matrixVals('Alexa Wide Gamut',false),
				linY: this.getYCoeffs('Alexa Wide Gamut'),
				logBase: new CSLogC(1600),
				tc: new LUTSpline(new Float64Array([
						-0.000242159,0.000242159,0.002966164,0.007787970,
						 0.018057211,0.042774540,0.095615536,0.180395906,
						 0.299169962,0.452321901,0.633391140,0.788816601,
						 0.892986853,0.951081756,0.975328639,0.985494457,
						 1
/*
						0.000000000,0.000244609,0.002996164,0.007811365,0.018090643,0.042819458,0.095668875,0.180450053,
						0.299217751,0.452358216,0.633413727,0.788828584,0.892992556,0.951084268,0.975329885,0.985495185,
						1.000000000
*/
					]).buffer,1,0),
				tcMatrix: new Float64Array([
						 1.485007,-0.401216,-0.083791,
						-0.033732, 1.282887,-0.249155,
						 0.010776,-0.122018, 1.111242
					]),
				cb: true,
				sb: true,
				wp: this.illuminant('d65')
			},
			new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]),
			this.illuminant('d65')			
		)
	);
	this.csOutSub.push([this.subIdx('Arri'),this.subIdx('Rec709')]);

	this.csOut.push(
		this.fromSysLUT('LC709',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				filename: 'LC709.labin',
				le: this.isLE,
				wp: this.illuminant('d65')
			},
			new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]),
			this.illuminant('d65')
		)
	);
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Rec709')]);
	this.csOut.push(
		this.fromSysLUT('LC709A',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				filename: 'LC709A.labin',
				le: this.isLE,
				wp: this.illuminant('d65')
			},
			new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]),
			this.illuminant('d65')
		)
	);
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Rec709')]);
	this.csOut.push(
		this.fromSysLUT('Canon CP IDT (Daylight)',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				filename: 'cpouttungsten.labin',
				le: this.isLE,
				wp: this.illuminant('d65')
			},
			new Float64Array([0.6509, 0.2827, 0.3177, 0.8953, 0.1289, -0.0468]),
			this.illuminant('d65')
		)
	);
	this.csOutSub.push([this.subIdx('Canon'),this.subIdx('Rec709')]);
	this.csOut.push(
		this.fromSysLUT('Canon CP IDT (Tungsten)',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				filename: 'cpoutdaylight.labin',
				le: this.isLE,
				wp: this.illuminant('d65')
			},
			new Float64Array([0.6577, 0.2653, 0.3417, 1.0909, 0.1475, -0.0018]),
			this.illuminant('d65')	
		)
	);
	this.csOutSub.push([this.subIdx('Canon'),this.subIdx('Rec709')]);
	this.csOut.push(
		this.fromSysLUT('Varicam V709',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				filename: 'V709.labin',
				le: this.isLE,
				wp: this.illuminant('d65')
			},
			new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]),
			this.illuminant('d65')
		)
	);
	this.csOutSub.push([this.subIdx('Panasonic'),this.subIdx('Rec709')]);
	this.csOut.push(this.fromSys('Rec2020'));
	this.csOutSub.push([this.subIdx('Rec2020'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('sRGB'));
	this.csOutSub.push([]);
	this.csOut.push(this.fromSysMatrix('Luma B&W', new Float64Array([ this.y[0],this.y[1],this.y[2], this.y[0],this.y[1],this.y[2], this.y[0],this.y[1],this.y[2] ]), this.system.white.buffer.slice(0)));
	this.csOutSub.push([]);
	this.csOut.push(this.fromSys('ACES AP0'));
	this.csOutSub.push([this.subIdx('ACES'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('ACEScg AP1'));
	this.csOutSub.push([this.subIdx('ACES'),this.subIdx('Wide Gamut')]);
	this.XYZOut = this.csOut.length;
	this.csOut.push(this.fromSys('XYZ'));
	this.csOutSub.push([this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('DCI-P3'));
	this.csOutSub.push([this.subIdx('P3')]);
	this.csOut.push(this.fromSys('DCI-P3D60'));
	this.csOutSub.push([this.subIdx('P3')]);
	this.csOut.push(this.fromSys('Canon DCI-P3+'));
	this.csOutSub.push([this.subIdx('Canon'),this.subIdx('P3')]);
	this.csOut.push(this.fromSys('Adobe RGB'));
	this.csOutSub.push([this.subIdx('Adobe')]);
	this.csOut.push(this.fromSys('Adobe Wide Gamut RGB'));
	this.csOutSub.push([this.subIdx('Adobe'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('ProPhoto RGB'));
	this.csOutSub.push([this.subIdx('Wide Gamut')]);
	this.custOut = this.csOut.length;
	this.csOut.push(this.toSys('Custom Out'));
	this.csOutSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12]);
	this.pass = this.csOut.length;
	this.csOut.push(this.fromSysMatrix('Passthrough', new Float64Array([1,0,0, 0,1,0, 0,0,1]), this.system.white.buffer.slice(0)));
	this.csM.push(this.csOut[this.csOut.length - 1]);
	this.csOutSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12]);
	this.LA = this.csOut.length;
	this.csOut.push(this.fromSysLA('LA', this.illuminant('d65')));
	this.csOutSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12]);

	var max = this.csIn.length;
	for (var j=0; j<max; j++) {
		this.inList.push({name: this.csIn[j].name,idx: j});
	}
	var max2 = this.csOut.length;
	for (var j=0; j<max2; j++) {
		if (j != this.LA) {
			this.outList.push({name: this.csOut[j].name,idx: j});
		}
	}
	max = this.inList.length;
	max2 = this.outList.length;
	for (var i=0; i<max; i++) {
		this.laList.push({name: this.inList[i].name});
		this.csLASub.push(this.csInSub[i].slice(0));
		for (var j=0; j<max2; j++) {
			if (this.laList[i].name === this.outList[j].name) {
				this.laList[i].idx = this.outList[j].idx;
				this.csLASub[i] = this.csOutSub[j].slice(0);
				break;
			}
		}
	}
};
// Colour calculations
LUTColourSpace.prototype.RGBtoXYZ = function(xy, white) {
//	xy = [	xr, yr,
//			xg, yg,
//			xb, yb ]
//	white = [ xw, yw, zw ];
	var XYZ = new Float64Array([
		xy[0]/xy[1],			xy[2]/xy[3],			xy[4]/xy[5],
		1,						1,						1,
		(1-xy[0]-xy[1])/xy[1],	(1-xy[2]-xy[3])/xy[3],	(1-xy[4]-xy[5])/xy[5]
	]);
	var invXYZ = this.mInverse(XYZ);
	if (!invXYZ || !white) {
		return false;
	}
	var S = this.mMult(invXYZ, new Float64Array([white[0]/white[1],1,white[2]/white[1]]));
	return new Float64Array([
		S[0]*XYZ[0], S[1]*XYZ[1], S[2]*XYZ[2],
		S[0]*XYZ[3], S[1]*XYZ[4], S[2]*XYZ[5],
		S[0]*XYZ[6], S[1]*XYZ[7], S[2]*XYZ[8]
	]);
};
LUTColourSpace.prototype.ciecat02 = function(m, ws,wd) {
	var s = this.mMult(this.cat02, new Float64Array([ws[0]/ws[1],1,ws[2]/ws[1]]));
	var d = this.mMult(this.cat02, new Float64Array([wd[0]/wd[1],1,wd[2]/wd[1]]));
	var CAT = new Float64Array([
		d[0]/s[0], 0, 0,
		0, d[1]/s[1], 0,
		0, 0, d[2]/s[2]
	]);
	var cat02 = this.mMult(this.invCat02,this.mMult(CAT,this.cat02));
	return this.mMult(cat02,m);
};
LUTColourSpace.prototype.calcCAT = function(model, m, ws, wd) {
	var cat = this.CATs.getModel(model);
	var inv = this.mInverse(cat);
	var s = this.mMult(cat, new Float64Array([ws[0]/ws[1],1,ws[2]/ws[1]]));
	var d = this.mMult(cat, new Float64Array([wd[0]/wd[1],1,wd[2]/wd[1]]));
	var CAT = new Float64Array([
		d[0]/s[0], 0, 0,
		0, d[1]/s[1], 0,
		0, 0, d[2]/s[2]
	]);
	var n = this.mMult(inv,this.mMult(CAT,cat));
	return this.mMult(n,m);
};
LUTColourSpace.prototype.toSys = function(name) {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
		if (name === this.g[j].name) {
			return new CSMatrix(name, this.g[j].toSys, this.g[j].white.buffer.slice(0));
		}
	}
	return false;
};
LUTColourSpace.prototype.fromSys = function(name) {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
		if (name === this.g[j].name) {
			var out = new CSMatrix(name, this.mInverse(this.g[j].toSys), this.g[j].white.buffer.slice(0));
			this.csM.push(out);
			return out;
		}
	}
	return false;
};
LUTColourSpace.prototype.matrixVals = function(name,to) {
	var m = this.g.length;
	for (var j=0; j<m; j++) {
		if (name === this.g[j].name) {
			if (to) {
				return this.g[j].toSys;
			} else {
				return this.mInverse(this.g[j].toSys);
			}
		}
	}
	return false;
};
LUTColourSpace.prototype.fromSysMatrix = function(name,matrix,white) {
	var out = new CSMatrix(name, matrix, white);
	this.csM.push(out);
	return out;
};
LUTColourSpace.prototype.fromSysLUT = function(name,params,xy,white) {
	var toXYZ = this.RGBtoXYZ(xy,white);
	this.csM.push(new CSMatrix(
		name,
		this.mInverse(this.mMult(this.system.inv, this.ciecat02(toXYZ,white,this.system.white))),
		white
	));
	return new CSLUT(name, params);
};
LUTColourSpace.prototype.fromSysTC = function(name,params,xy,white) {
	var toXYZ = this.RGBtoXYZ(xy,white);
	this.csM.push(new CSMatrix(
		name,
		this.mInverse(this.mMult(this.system.inv, this.ciecat02(toXYZ,white,this.system.white))),
		white
	));
	return new CSToneCurve(name, params);
};
LUTColourSpace.prototype.fromSysLA = function(name,white) {
	var csLA = new CSLA(name, white);
	this.csM.push(csLA);
	return csLA;
//	this.csM.push(this.csOut[this.rec709Out]);
//	return new CSLA(name, white);
};
LUTColourSpace.prototype.fx = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var y = this.y;
	var Y;
// Colour Temperature Shift
	if (this.doWB) {
		this.wb.lc(buff);
	}
// ASC-CDL
	if (this.doASCCDL) {
		for (var j=0; j<m; j += 3) {
			o[ j ] = (o[ j ]*this.asc[0])+this.asc[3];
			o[ j ] = ((o[ j ]<0)?o[ j ]:Math.pow(o[ j ],this.asc[6]));
			o[ j ] = (isNaN(o[ j ])?0:o[ j ]);
			o[j+1] = (o[j+1]*this.asc[1])+this.asc[4];
			o[j+1] = ((o[j+1]<0)?o[j+1]:Math.pow(o[j+1],this.asc[7]));
			o[j+1] = (isNaN(o[j+1])?0:o[j+1]);
			o[j+2] = (o[j+2]*this.asc[2])+this.asc[5];
			o[j+2] = ((o[j+2]<0)?o[j+2]:Math.pow(o[j+2],this.asc[8]));
			o[j+2] = (isNaN(o[j+2])?0:o[j+2]);
			Y = (y[0]*o[j])+(y[1]*o[j+1])+(y[2]*o[j+2]);
			o[ j ] = Y + (this.asc[9]*(o[ j ]-Y));
			o[j+1] = Y + (this.asc[9]*(o[j+1]-Y));
			o[j+2] = Y + (this.asc[9]*(o[j+2]-Y));
		}
	}
	this.csM[this.curOut].lc(buff);
	return o;
};
LUTColourSpace.prototype.firstGuess = function(goal, rgb, d) {
	var d2 = d*2;
	var data = new Float64Array([
		rgb[0]		,rgb[1]		,rgb[2],
		rgb[0] + d	,rgb[1]		,rgb[2],
		rgb[0] - d	,rgb[1]		,rgb[2],
		rgb[0]		,rgb[1] + d	,rgb[2],
		rgb[0]		,rgb[1] - d	,rgb[2],
		rgb[0]		,rgb[1]		,rgb[2] + d,
		rgb[0]		,rgb[1]		,rgb[2] - d
	]);
	var g = this.fx(data.buffer);
//
//if (goal[0] === goal[1] && goal[0] === goal[2]) {
//	self.postMessage({msg:true,details:g});
//}
//
	return {
		x: rgb,
		f: new Float64Array([g[0]-goal[0],g[1]-goal[1],g[2]-goal[2]]),
		J: new Float64Array([
			(g[3]-g[6])/d2, (g[ 9]-g[12])/d2, (g[15]-g[18])/d2,
			(g[4]-g[7])/d2, (g[10]-g[13])/d2, (g[16]-g[19])/d2,
			(g[5]-g[8])/d2, (g[11]-g[14])/d2, (g[17]-g[20])/d2,
		])
	};
};
LUTColourSpace.prototype.roundOff = function(i) {
	return parseFloat(i.toFixed(8));
};
// Matrix operations
LUTColourSpace.prototype.mInverse = function(m) {
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
LUTColourSpace.prototype.mMult = function(m1,m2) {
	if (m1.length !== 9) {
		return false;
	}
	var len = m2.length;
	if (len === 3) {
		var out = new Float64Array(3);
		out[0] = (m1[0]*m2[0]) + (m1[1]*m2[1]) + (m1[2]*m2[2]);
		out[1] = (m1[3]*m2[0]) + (m1[4]*m2[1]) + (m1[5]*m2[2]);
		out[2] = (m1[6]*m2[0]) + (m1[7]*m2[1]) + (m1[8]*m2[2]);
		return out;
	} else if (len === 9) {
		var out = new Float64Array(9);
		out[0] = (m1[0]*m2[0]) + (m1[1]*m2[3]) + (m1[2]*m2[6]);
		out[1] = (m1[0]*m2[1]) + (m1[1]*m2[4]) + (m1[2]*m2[7]);
		out[2] = (m1[0]*m2[2]) + (m1[1]*m2[5]) + (m1[2]*m2[8]);
		out[3] = (m1[3]*m2[0]) + (m1[4]*m2[3]) + (m1[5]*m2[6]);
		out[4] = (m1[3]*m2[1]) + (m1[4]*m2[4]) + (m1[5]*m2[7]);
		out[5] = (m1[3]*m2[2]) + (m1[4]*m2[5]) + (m1[5]*m2[8]);
		out[6] = (m1[6]*m2[0]) + (m1[7]*m2[3]) + (m1[8]*m2[6]);
		out[7] = (m1[6]*m2[1]) + (m1[7]*m2[4]) + (m1[8]*m2[7]);
		out[8] = (m1[6]*m2[2]) + (m1[7]*m2[5]) + (m1[8]*m2[8]);
		return out;
	} else {
		return false;
	}
};
// Base colour data
LUTColourSpace.prototype.illuminant = function(name) {
	switch (name.toLowerCase()) {
		case 'a':	return new Float64Array([ 0.44757, 0.40745, 0.14498 ]);
		case 'b':	return new Float64Array([ 0.34842, 0.35161, 0.29997 ]);
		case 'c':	return new Float64Array([ 0.31006, 0.31616, 0.37378 ]);
		case 'd40':	return new Float64Array([ 0.38230, 0.38380, 0.23390 ]);
		case 'd45':	return new Float64Array([ 0.36210, 0.37090, 0.26700 ]);
		case 'd50':	return new Float64Array([ 0.34567, 0.35850, 0.29583 ]);
		case 'd55':	return new Float64Array([ 0.33242, 0.34743, 0.32015 ]);
		case 'd60':	return new Float64Array([ 0.32168, 0.33767, 0.34065 ]);
		case 'd65':	return new Float64Array([ 0.31270, 0.32900, 0.35830 ]);
		case 'd70':	return new Float64Array([ 0.30540, 0.32160, 0.37300 ]);
		case 'd75':	return new Float64Array([ 0.29902, 0.31485, 0.38613 ]);
		case 'e':	return new Float64Array([ 1/3    , 1/3	  , 1/3 	]);
		case 'p3':	return new Float64Array([ 0.31400, 0.35100, 0.33500 ]);
		case 'f1':	return new Float64Array([ 0.31310, 0.33727, 0.34963 ]);
		case 'f2':	return new Float64Array([ 0.37208, 0.37529, 0.25263 ]);
		case 'f3':	return new Float64Array([ 0.40910, 0.39430, 0.19660 ]);
		case 'f4':	return new Float64Array([ 0.44018, 0.40329, 0.15653 ]);
		case 'f5':	return new Float64Array([ 0.31379, 0.34531, 0.34090 ]);
		case 'f6':	return new Float64Array([ 0.37790, 0.38835, 0.23375 ]);
		case 'f7':	return new Float64Array([ 0.31292, 0.32933, 0.35775 ]);
		case 'f8':	return new Float64Array([ 0.34588, 0.35875, 0.29537 ]);
		case 'f9':	return new Float64Array([ 0.37417, 0.37281, 0.25302 ]);
		case 'f10':	return new Float64Array([ 0.34609, 0.35986, 0.29405 ]);
		case 'f11':	return new Float64Array([ 0.38052, 0.37713, 0.24235 ]);
		case 'f12':	return new Float64Array([ 0.43695, 0.40441, 0.15864 ]);
		case 'iso7589studiotungsten':	return new Float64Array([ 0.43088, 0.40784, 0.16128 ]);
		case 'iso7589photoflood':		return new Float64Array([ 0.41154, 0.39851, 0.18995 ]);
		case 'iso7589daylight':			return new Float64Array([ 0.33357, 0.35368, 0.31275 ]);
	}
};
LUTColourSpace.prototype.xyzMatrices = function() {
// S-Gamut3.cine
	this.sysIdx = this.g.length;
	var sgamut3cine = {};
	sgamut3cine.name = 'Sony S-Gamut3.cine';
	sgamut3cine.cat = this.CATs.modelIdx('CIECAT02');
	sgamut3cine.xy = new Float64Array([0.766,0.275, 0.225,0.800, 0.089,-0.087]);
	sgamut3cine.white = this.illuminant('d65');
	sgamut3cine.toXYZ = this.RGBtoXYZ(sgamut3cine.xy,sgamut3cine.white);
	this.g.push(sgamut3cine);
// S-Gamut3
	var sgamut3 = {};
	sgamut3.name = 'Sony S-Gamut3';
	sgamut3.cat = this.CATs.modelIdx('CIECAT02');
	sgamut3.xy = new Float64Array([0.730,0.280, 0.140,0.855, 0.100,-0.05]);
	sgamut3.white = this.illuminant('d65');
	sgamut3.toXYZ = this.RGBtoXYZ(sgamut3.xy,sgamut3.white);
	this.g.push(sgamut3);
// S-Gamut
	var sgamut = {};
	sgamut.name = 'Sony S-Gamut';
	sgamut.cat = this.CATs.modelIdx('CIECAT02');
	sgamut.xy = new Float64Array([0.730,0.280, 0.140,0.855, 0.100,-0.05]);
	sgamut.white = this.illuminant('d65');
	sgamut.toXYZ = this.RGBtoXYZ(sgamut.xy,sgamut.white);
	this.g.push(sgamut);
// ALEXA Wide Gamut RGB
	var alexawgrgb = {};
	alexawgrgb.name = 'Alexa Wide Gamut';
	alexawgrgb.cat = this.sysCATIdx;
	alexawgrgb.xy = new Float64Array([0.6840,0.3130, 0.2210,0.8480, 0.0861,-0.1020]);
	alexawgrgb.white = this.illuminant('d65');
	alexawgrgb.toXYZ = this.RGBtoXYZ(alexawgrgb.xy,alexawgrgb.white);
	this.g.push(alexawgrgb);
// Canon Cinema Gamut
	var canoncg = {};
	canoncg.name = 'Canon Cinema Gamut';
	canoncg.cat = this.sysCATIdx;
	canoncg.xy = new Float64Array([0.74,0.27, 0.17,1.14, 0.08,-0.10]);
	canoncg.white = this.illuminant('d65');
	canoncg.toXYZ = this.RGBtoXYZ(canoncg.xy,canoncg.white);
	this.g.push(canoncg);
// Panasonic V-Gamut
	var vgamut = {};
	vgamut.name = 'Panasonic V-Gamut';
	vgamut.cat = this.sysCATIdx;
	vgamut.xy = new Float64Array([0.730,0.280, 0.165,0.840, 0.100,-0.030]);
	vgamut.white = this.illuminant('d65');
	vgamut.toXYZ = this.RGBtoXYZ(vgamut.xy,vgamut.white);
	this.g.push(vgamut);
// REDWideGamutRGB
	var redWideGamutRGB = {};
	redWideGamutRGB.name = 'REDWideGamutRGB';
	redWideGamutRGB.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	redWideGamutRGB.xy = new Float64Array([0.780308,0.304253, 0.121595,1.493994, 0.095612,-0.084589]);
	redWideGamutRGB.white = this.illuminant('d65');
	redWideGamutRGB.toXYZ = this.RGBtoXYZ(redWideGamutRGB.xy,redWideGamutRGB.white);
	this.g.push(redWideGamutRGB);
// DRAGONColor
	var redDragonColor = {};
	redDragonColor.name = 'DRAGONColor';
	redDragonColor.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	redDragonColor.xy = new Float64Array([0.75002604,0.32671294, 0.32008411,0.68143644, 0.07431725,-0.05592259]);
	redDragonColor.white = this.illuminant('e');
	redDragonColor.toXYZ = this.RGBtoXYZ(redDragonColor.xy,redDragonColor.white);
	this.g.push(redDragonColor);
// DRAGONColor2
	var redDragonColor2 = {};
	redDragonColor2.name = 'DRAGONColor2';
	redDragonColor2.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	redDragonColor2.xy = new Float64Array([0.7500263,0.32671336, 0.32008437,0.68143652, 0.145629,0.05124619]);
	redDragonColor2.white = this.illuminant('e');
	redDragonColor2.toXYZ = this.RGBtoXYZ(redDragonColor2.xy,redDragonColor2.white);
	this.g.push(redDragonColor2);
// REDColor
	var redColor = {};
	redColor.name = 'REDColor';
	redColor.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	redColor.xy = new Float64Array([0.70017112,0.32750563, 0.32289102,0.6077074, 0.13468038,0.03479195]);
	redColor.white = this.illuminant('e');
	redColor.toXYZ = this.RGBtoXYZ(redColor.xy,redColor.white);
	this.g.push(redColor);
// REDColor2
	var redColor2 = {};
	redColor2.name = 'REDColor2';
	redColor2.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	redColor2.xy = new Float64Array([0.86581522,0.32487259, 0.32087226,0.66073571, 0.09160032,-0.02994923]);
	redColor2.white = this.illuminant('e');
	redColor2.toXYZ = this.RGBtoXYZ(redColor2.xy,redColor2.white);
	this.g.push(redColor2);
// REDColor3
	var redColor3 = {};
	redColor3.name = 'REDColor3';
	redColor3.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	redColor3.xy = new Float64Array([0.70151835,0.32748417, 0.32069982,0.66526394, 0.10554785,-0.00898842]);
	redColor3.white = this.illuminant('e');
	redColor3.toXYZ = this.RGBtoXYZ(redColor3.xy,redColor3.white);
	this.g.push(redColor3);
// REDColor4
	var redColor4 = {};
	redColor4.name = 'REDColor4';
	redColor4.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	redColor4.xy = new Float64Array([0.70151793,0.32748374, 0.32069991,0.66526392, 0.14597596,0.05176764]);
	redColor4.white = this.illuminant('e');
	redColor4.toXYZ = this.RGBtoXYZ(redColor4.xy,redColor4.white);
	this.g.push(redColor4);
// Protune Native
	var protune = {};
	protune.name = 'Protune Native';
	protune.cat = this.sysCATIdx;
	protune.xy = new Float64Array([0.70419975,0.19595152, 0.33147178,0.98320117, 0.1037611,-0.04367584]);
	protune.white = this.illuminant('d60');
	protune.toXYZ = this.RGBtoXYZ(protune.xy,protune.white);
	this.g.push(protune);
// Rec709
	var rec709 = {};
	rec709.name = 'Rec709';
	rec709.cat = this.sysCATIdx;
	rec709.xy = new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]);
	rec709.white = this.illuminant('d65');
	rec709.toXYZ = this.RGBtoXYZ(rec709.xy,rec709.white);
	this.rec709Idx = this.g.length;
	this.g.push(rec709);
// Rec2020
	var rec2020 = {};
	rec2020.name = 'Rec2020';
	rec2020.cat = this.sysCATIdx;
	rec2020.xy = new Float64Array([0.708,0.292, 0.170,0.797, 0.131,0.046]);
	rec2020.white = this.illuminant('d65');
	rec2020.toXYZ = this.RGBtoXYZ(rec2020.xy,rec2020.white);
	this.g.push(rec2020);
// sRGB
	var srgb = {};
	srgb.name = 'sRGB';
	srgb.cat = this.sysCATIdx;
	srgb.xy = new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]);
	srgb.white = this.illuminant('d65');
	srgb.toXYZ = this.RGBtoXYZ(srgb.xy,srgb.white);
	this.g.push(srgb);
// ACES AP0
	var aces = {};
	aces.name = 'ACES AP0';
	aces.cat = this.sysCATIdx;
	aces.xy = new Float64Array([0.73470,0.26530, 0.00000,1.00000, 0.00010,-0.07700]);
	aces.white = this.illuminant('d60');
	aces.toXYZ = this.RGBtoXYZ(aces.xy,aces.white);
	this.g.push(aces);
// ACEScg AP1
	var ap1 = {};
	ap1.name = 'ACEScg AP1';
	ap1.cat = this.sysCATIdx;
	ap1.xy = new Float64Array([0.7130,0.2930, 0.1650,0.8300, 0.1280,0.0440]);
	ap1.white = this.illuminant('d60');
	ap1.toXYZ = this.RGBtoXYZ(ap1.xy,ap1.white);
	this.g.push(ap1);
// XYZ
	var xyz = {};
	xyz.name = 'XYZ';
	xyz.cat = this.sysCATIdx;
	xyz.xy = false;
	xyz.white = this.illuminant('d65');
	xyz.toXYZ = new Float64Array([1,0,0, 0,1,0, 0,0,1]);
	this.g.push(xyz);
// DCI-P3
	var p3 = {};
	p3.name = 'DCI-P3';
	p3.cat = this.sysCATIdx;
	p3.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3.white = this.illuminant('p3');
	p3.toXYZ = this.RGBtoXYZ(p3.xy,p3.white);
	this.g.push(p3);
// DCI-P3D60
	var p3d60 = {};
	p3d60.name = 'DCI-P3D60';
	p3d60.cat = this.sysCATIdx;
	p3d60.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3d60.white = this.illuminant('d60');
	p3d60.toXYZ = this.RGBtoXYZ(p3d60.xy,p3d60.white);
	this.g.push(p3d60);
// Canon DCI-P3+
	var canonp3p = {};
	canonp3p.name = 'Canon DCI-P3+';
	canonp3p.cat = this.sysCATIdx;
	canonp3p.xy = new Float64Array([0.74,0.27, 0.22,0.78, 0.09,-0.09]);
	canonp3p.white = this.illuminant('p3');
	canonp3p.toXYZ = this.RGBtoXYZ(canonp3p.xy,canonp3p.white);
	this.g.push(canonp3p);
// Adobe RGB
	var adobergb = {};
	adobergb.name = 'Adobe RGB';
	adobergb.cat = this.sysCATIdx;
	adobergb.xy = new Float64Array([0.64,0.33, 0.21,0.71, 0.15,0.06]);
	adobergb.white = this.illuminant('d65');
	adobergb.toXYZ = this.RGBtoXYZ(adobergb.xy,adobergb.white);
	this.g.push(adobergb);
// Adobe Wide Gamut RGB
	var adobewg = {};
	adobewg.name = 'Adobe Wide Gamut RGB';
	adobewg.cat = this.sysCATIdx;
	adobewg.xy = new Float64Array([0.7347,0.2653, 0.1152,0.8264, 0.1566,0.0177]);
	adobewg.white = this.illuminant('d50');
	adobewg.toXYZ = this.RGBtoXYZ(adobewg.xy,adobewg.white);
	this.g.push(adobewg);
// ProPhoto rgb
	var prophoto = {};
	prophoto.name = 'ProPhoto RGB';
	prophoto.cat = this.sysCATIdx;
	prophoto.xy = new Float64Array([0.7347,0.2653, 0.1596,0.8404, 0.0366,0.0001]);
	prophoto.white = this.illuminant('d50');
	prophoto.toXYZ = this.RGBtoXYZ(prophoto.xy,prophoto.white);
	this.g.push(prophoto);
// Custom In (initially Rec709)
	var customIn = {};
	customIn.name = 'Custom In';
	customIn.cat = this.sysCATIdx;
	customIn.xy = new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]);
	customIn.white = this.illuminant('d65');
	customIn.toXYZ = this.RGBtoXYZ(customIn.xy,customIn.white);
	this.g.push(customIn);
// Custom Out (initially Rec709)
	var customOut = {};
	customOut.name = 'Custom Out';
	customOut.cat = this.sysCATIdx;
	customOut.xy = new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]);
	customOut.white = this.illuminant('d65');
	customOut.toXYZ = this.RGBtoXYZ(customOut.xy,customOut.white);
	this.g.push(customOut);
};
LUTColourSpace.prototype.systemMatrices = function() {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
		if (this.g[j].name !== 'Custom In' && this.g[j].name !== 'Custom Out' && this.g[j].name !== 'Passthrough') {
			this.matList.push({name: this.g[j].name,idx: j});
		}
		if (j === this.sysIdx) {
			this.g[j].toSys = new Float64Array([1,0,0, 0,1,0, 0,0,1]);
		} else if (this.g[j].name === 'XYZ') {
			this.g[j].toSys = this.system.inv;
		} else if (this.g[j].white[0] !== this.system.white[0] && this.g[j].white[1] !== this.system.white[1] && this.g[j].white[2] !== this.system.white[2]) {
			this.g[j].toSys = this.mMult(this.system.inv, this.ciecat02(this.g[j].toXYZ,this.g[j].white,this.system.white));
		} else {
			this.g[j].toSys = this.mMult(this.system.inv, this.g[j].toXYZ);
		}
	}
};
LUTColourSpace.prototype.initPSSTCDL = function() {
	this.psstMC = true;
	this.psstYC = false;
	this.psstC = new Ring();
  	this.psstC.setDetails({
		title: 'Colour',
		L: new Float64Array([
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0
		]).buffer,
		p: false,
		mod: 1
	});
	this.psstSat = new Ring();
  	this.psstSat.setDetails({
		title: 'Saturation',
		L: new Float64Array([
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1
		]).buffer,
		p: false
	});
	this.psstS = new Ring();
  	this.psstS.setDetails({
		title: 'Slope',
		L: new Float64Array([
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1
		]).buffer,
		p: false
	});
	this.psstO = new Ring();
  	this.psstO.setDetails({
		title: 'Offset',
		L: new Float64Array([
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0
		]).buffer,
		p: false
	});
	this.psstP = new Ring();
  	this.psstP.setDetails({
		title: 'Power',
		L: new Float64Array([
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,
			1,1,1,1,1
		]).buffer,
		p: false
	});
	this.psstF = new Ring();
  	this.psstF.setDetails({
		title: 'Forward',
		L: new Float64Array([
		   -0.0038695657404562, 0.0065858762356100, 0.0201406099404900, 0.0352828041364269, 0.0520594851346660, 0.0701816671759477, 0.0888871169278112, 0.1071434832095446, 0.1241300598546256,
			0.1394968704492374, 0.1532401783604684, 0.1657675172633559, 0.1775709068913177, 0.1889505001250262, 0.2001195960344167, 0.2112553615444404, 0.2225296284119030, 0.2341370761420996,
			0.2463352166687472, 0.2595247516121330, 0.2744679542490435, 0.2933226298747170, 0.3287624039244701, 0.4006899403301722, 0.4276051836096898, 0.4447257669774564, 0.4589794729871186,
			0.4717842618396581, 0.4837468755866364, 0.4952093965712169, 0.5064034638133755, 0.5175127750345129, 0.5287073445057027, 0.5401709526670702, 0.5521354485080856, 0.5649433872473982,
			0.5790664946157549, 0.5943630562521310, 0.6106992294013223, 0.6278535155401859, 0.6454346342920819, 0.6629428672584311, 0.6798980496803277, 0.6959546592769115, 0.7109387359446133,
			0.7250595197384678, 0.7388861383721239, 0.7524290718192624, 0.7656794919842305, 0.7786321731846290, 0.7912850081995813, 0.8036385234867822, 0.8156954169692322, 0.8274601335361318,
			0.8389384865889260, 0.8501373280139014, 0.8610751527873562, 0.8718717120052339, 0.8825403689956453, 0.8930611389578428, 0.9034170399839038, 0.9135941187798583, 0.9235814085450882,
			0.9333707275123123, 0.9429564536395982, 0.9523352418731073, 0.9615057270095099, 0.9704682268100525, 0.9792244585320422, 0.9877772736056640, 0.9961304342481022
		]).buffer,
		p: true
	});
	this.psstB = new Ring();
  	this.psstB.setDetails({
		title: 'Back',
		L: new Float64Array([
			0.042311434,
			0.828850698,
			1.852489293,
			2.158688535,
			3.183904084,
			3.970443351,
			4.994081951,
			6.325496742
		]).buffer,
		p: true
	});
	this.psstY = new Ring();
  	this.psstY.setDetails({
		title: 'Luma',
		L: new Float64Array([
			0.0722,
			0.2848,
			0.2126,
			0.6,
//			0.3082,
			0.9278,
			0.7152,
			0.7874,
			0.0722
		]).buffer,
		p: false
	});
	this.psstM = new Ring();
  	this.psstM.setDetails({
		title: 'CbCr Magnitude',
		L: new Float64Array([
			0.346430745,0.342962699,0.33969838,0.337347957,0.336560982,0.337917133,0.341937773,0.349106433,0.359887984,
			0.374737194,0.394086142,0.361208741,0.334229968,0.31322564,0.297800651,0.287381612,0.281345482,0.279049081,
			0.279803042,0.282820273,0.287167419,0.2780547,0.272555398,0.269216643,0.267119872,0.265609644,0.264162578,
			0.262344581,0.259835788,0.256508476,0.252538822,0.248681245,0.245993008,0.245298419,0.247291756,0.252580435,
			0.261730792,0.275291255,0.293766309,0.317502734,0.346430744,0.340484523,0.337392505,0.336559654,0.337660332,
			0.340582153,0.345407661,0.352427205,0.362187055,0.375589699,0.394086141,0.362588341,0.337932638,0.318643857,
			0.303748703,0.292615326,0.284863469,0.280318319,0.278996163,0.281119417,0.287167418,0.269072329,0.25607167,
			0.248148933,0.24525667,0.247440263,0.254900418,0.268012927,0.287301219,0.313327834,0.346430745
		]).buffer,
		p: false
	});
};
LUTColourSpace.prototype.setYCoeffs = function() {
	this.y = this.getYCoeffs(this.system.name);
//	console.log(this.y);
};
LUTColourSpace.prototype.getYCoeffs = function(cs) {
	var m = this.g.length;
	var xy,w;
	for (var j=0; j<m; j++) {
		if (this.g[j].name === cs) {
			xy = this.g[j].xy;
			w = this.g[j].white;
		}
	}
	var C = new Float64Array([
		xy[0],xy[2],xy[4],
		xy[1],xy[3],xy[5],
		1-xy[0]-xy[1],1-xy[2]-xy[3],1-xy[4]-xy[5]
	]);
	var invC = this.mInverse(C);
	var W = new Float64Array([w[0]/w[1],1,(1-w[0]-w[1])/w[1]]);
	var J = this.mMult(invC,W);
	return new Float64Array([J[0]*C[3],J[1]*C[4],J[2]*C[5]]);
};
LUTColourSpace.prototype.setSaturated = function() {
	var max = this.g.length;
	var idx = this.rec709Idx;
	var y = this.mMult(this.g[idx].toSys, new Float64Array([ 1,1,0 ]));
	var c = this.mMult(this.g[idx].toSys, new Float64Array([ 0,1,1 ]));
	var g = this.mMult(this.g[idx].toSys, new Float64Array([ 0,1,0 ]));
	var m = this.mMult(this.g[idx].toSys, new Float64Array([ 1,0,1 ]));
	var r = this.mMult(this.g[idx].toSys, new Float64Array([ 1,0,0 ]));
	var b = this.mMult(this.g[idx].toSys, new Float64Array([ 0,0,1 ]));
	this.clrs = new Float64Array([
		y[0],y[1],y[2],
		c[0],c[1],c[2],
		g[0],g[1],g[2],
		m[0],m[1],m[2],
		r[0],r[1],r[2],
		b[0],b[1],b[2]
	]).buffer;
};
LUTColourSpace.prototype.buildColourSquare = function() {
	var d = 256;
	var colSqr = new Float64Array(d*d*3);
	this.colSqr = colSqr.buffer;
	var j=0;
	var r,g,b;
	var Hd,S,L,C,X,m;
	for (var y=0; y<d; y++) {
		for (var x=0; x<d; x++) {
			Hd = 6*x/(d-1);
			S = 1-(y/(d-1));
			L = 0.5;
			C = (1-Math.abs((2*L)-1))*S;
			X = C*(1 - Math.abs((Hd%2) - 1));
			if (Hd < 1) {
				r = C;
				g = X;
				b = 0;
			} else if (Hd < 2) {
				r = X;
				g = C;
				b = 0;
			} else if (Hd < 3) {
				r = 0;
				g = C;
				b = X;
			} else if (Hd < 4) {
				r = 0;
				g = X;
				b = C;
			} else if (Hd < 5) {
				r = X;
				g = 0;
				b = C;
			} else {
				r = C;
				g = 0;
				b = X;
			}
			m = L - (0.5*C);
			colSqr[ j ] = r + m;
			colSqr[j+1] = g + m;
			colSqr[j+2] = b + m;
			j += 3;
		}
	}
	this.csIn[this.rec709In].lc(this.colSqr);
};
LUTColourSpace.prototype.buildMultiColours = function() {
	var mclrs = new Float64Array(17*3*3);
	this.mclrs = mclrs.buffer;
	var l;
	for (var j=0; j<17; j++) {
		l = Math.pow(2,j-8)*0.2;
		mclrs[ j*3 ] = l/0.2126;
		mclrs[((j+17)*3)+1] = l/0.7152;
		mclrs[((j+34)*3)+2] = l/0.0722;
	}
	this.csIn[this.rec709In].lc(this.mclrs);
	this.multiSat = new Float64Array([
		1,1,1,1,1,1,1,1,
		1,
		1,1,1,1,1,1,1,1
	]);
};
// Parameter setting functions
LUTColourSpace.prototype.setCS = function(params) {
	var out = {};
	if (typeof params.twkCS !== 'undefined') {
		var p = params.twkCS;
		out.editIdx = p.editIdx;
		var modelEdit = 0;
		if (typeof p.edit.cat === 'number') {
			modelEdit = p.edit.cat;
		}
		var modelIn = 0;
		if (typeof p.input.cat === 'number') {
			modelIn = p.input.cat;
		}
		var modelOut = 0;
		if (typeof p.output.cat === 'number') {
			modelOut = p.output.cat;
		}
		if (!p.edit.isMatrix && p.lock) {
			var edit = {};
			edit.xy = new Float64Array([
				p.edit.rx, p.edit.ry,
				p.edit.gx, p.edit.gy,
				p.edit.bx, p.edit.by
			]);
			edit.white = new Float64Array([
				p.edit.wx, p.edit.wy, 1 - p.edit.wx - p.edit.wy
			]);
			edit.toXYZ = this.RGBtoXYZ(edit.xy,edit.white);
			out.editMatrix = this.mMult(this.mInverse(this.g[p.edit.wcs].toXYZ), this.calcCAT(modelEdit,edit.toXYZ,edit.white,this.g[p.edit.wcs].white));
			out.wcs = p.edit.wcs;
		} else if (p.edit.isMatrix) {
			var ill = ['a','b','c','d40','d45','d50','d55','d60','d65','d70','d75','e', 'p3'];
			var edMax = ill.length;
			var edW;
			var edXYZ = this.mMult(this.g[p.edit.wcs].toXYZ,p.edit.matrix);
			edW = new Float64Array([ p.edit.wx, p.edit.wy, 1 - p.edit.wx - p.edit.wy ]);
			edXYZ = this.calcCAT(modelEdit,edXYZ,this.g[p.edit.wcs].white,edW);
			var edDr = edXYZ[0] + edXYZ[3] + edXYZ[6];
			var edDg = edXYZ[1] + edXYZ[4] + edXYZ[7];
			var edDb = edXYZ[2] + edXYZ[5] + edXYZ[8];
			var edP = new Float64Array([
				this.roundOff(edXYZ[0]/edDr), this.roundOff(edXYZ[3]/edDr),
				this.roundOff(edXYZ[1]/edDg), this.roundOff(edXYZ[4]/edDg),
				this.roundOff(edXYZ[2]/edDb), this.roundOff(edXYZ[5]/edDb),
			]);
			console.log(edW[0] + ', ' + edP[0] + ',' + edP[1] + ', ' + edP[2] + ',' + edP[3] + ', ' + edP[4] + ',' + edP[5]);
		}
		if (p.input.isMatrix) {
			var inWCSToSys = this.mMult(this.system.inv, this.calcCAT(modelIn,this.g[p.input.wcs].toXYZ,this.g[p.input.wcs].white,this.system.white));
			this.csIn[this.custIn] = new CSMatrix('Custom', this.mMult(inWCSToSys,p.input.matrix), this.g[p.input.wcs].white.buffer.slice(0));
		} else {
			var customIn = {};
			customIn.xy = new Float64Array([
				p.input.rx, p.input.ry,
				p.input.gx, p.input.gy,
				p.input.bx, p.input.by
			]);
			customIn.white = new Float64Array([
				p.input.wx, p.input.wy, 1 - p.input.wx - p.input.wy
			]);
			customIn.toXYZ = this.RGBtoXYZ(customIn.xy,customIn.white);
			customIn.toSys = this.mMult(this.system.inv, this.calcCAT(modelIn,customIn.toXYZ,customIn.white,this.system.white));
			this.csIn[this.custIn] = new CSMatrix('Custom', customIn.toSys, customIn.white.buffer.slice(0));
		}
		if (p.output.isMatrix) {
			var outWCSToSys = this.mMult(this.system.inv, this.calcCAT(modelOut,this.g[p.output.wcs].toXYZ,this.g[p.output.wcs].white,this.system.white));
			var outWCSFromSys = this.mInverse(outWCSToSys);
			this.csOut[this.custOut] = new CSMatrix('Custom', this.mMult(p.output.matrix,outWCSFromSys), this.g[p.output.wcs].white.buffer.slice(0));
			this.csM[this.custOut] = this.csOut[this.custOut];
		} else {
			var customOut = {};
			customOut.xy = new Float64Array([
				p.output.rx, p.output.ry,
				p.output.gx, p.output.gy,
				p.output.bx, p.output.by
			]);
			customOut.white = new Float64Array([
				p.output.wx, p.output.wy, 1 - p.output.wx - p.output.wy
			]);
			customOut.toXYZ = this.RGBtoXYZ(customOut.xy,customOut.white);
			customOut.toSys = this.mMult(this.system.inv, this.calcCAT(modelOut,customOut.toXYZ,customOut.white,this.system.white));
			this.csOut[this.custOut] = new CSMatrix('Custom', this.mInverse(customOut.toSys), customOut.white.buffer.slice(0));
			this.csM[this.custOut] = this.csOut[this.custOut];
		}
		out.doCS = true;
	} else {
		out.doCS = false;
	}
	return out;
};
LUTColourSpace.prototype.setWB = function(params) {
	var out = {};
	this.doWB = false;
	if (this.tweaks && typeof params.twkWB !== 'undefined') {
		var p = params.twkWB;
		if (typeof p.doWB === 'boolean' && p.doWB) {
			this.doWB = true;
			if (typeof p.CAT === 'number') {
				this.wb.setModel(p.CAT);
				out.CAT = params.CAT;
			}
			out.ref = p.ref;
			out.ctShift = p.ctShift;
			out.lampShift = p.lampShift;
			out.duv = p.duv;
			out.dpl = p.dpl;
			this.wb.setVals(p.ref, p.ctShift, p.lampShift, p.duv, p.dpl);
		}
	}
	out.doWB = this.doWB;
	return out;
};
LUTColourSpace.prototype.setASCCDL = function(params) {
	var out = {};
	this.doASCCDL = false;
	this.changedASCCDL = false;
	if (this.tweaks && typeof params.twkASCCDL !== 'undefined') {
		var p = params.twkASCCDL;
		if (typeof p.doASCCDL === 'boolean') {
			var didASCCDL = this.doASCCDL;
			this.doASCCDL = p.doASCCDL;		
			if (didASCCDL && !this.doASCCDL) {
				this.changedASCCDL = true;
			}
		}
		if (typeof p.cdl !== 'undefined') {
			var newCDL = new Float64Array(p.cdl);
			for (var j=0; j<10; j++) {
				if (newCDL[j] !== this.asc[j]) {
					this.asc = newCDL;
					if (j < 9) {
						this.changedASCCDL = true;
					}
					break;
				}
			}
		}
	}
	out.doASCCDL = this.doASCCDL;
	return out;
};
LUTColourSpace.prototype.setPSSTCDL = function(params) {
	var out = {};
	this.doPSSTCDL = false;
	if (this.tweaks && typeof params.twkPSSTCDL !== 'undefined') {
		var p = params.twkPSSTCDL;
		if (typeof p.doPSSTCDL === 'boolean' && p.doPSSTCDL) {
			this.doPSSTCDL = true;		
			if (typeof p.c !== 'undefined') {
				this.psstC.setL(p.c);
			}
			if (typeof p.sat !== 'undefined') {
				this.psstSat.setL(p.sat);
			}
			if (typeof p.s !== 'undefined') {
				this.psstS.setL(p.s);
			}
			if (typeof p.o !== 'undefined') {
				this.psstO.setL(p.o);
			}
			if (typeof p.p !== 'undefined') {
				this.psstP.setL(p.p);
			}
			if (typeof p.chromaScale === 'boolean') {
				this.psstMC = p.chromaScale;
			}
			if (typeof p.lumaScale === 'boolean') {
				this.psstYC = p.lumaScale;
			}
		}
	}
	out.doPSSTCDL = this.doPSSTCDL;
	return out;
};
LUTColourSpace.prototype.setHG = function(params) {
	var out = {};
	this.doHG = false;
	this.curHG = this.curOut;
	if (this.tweaks && typeof params.twkHG !== 'undefined') {
		var p = params.twkHG;
		if (typeof p.doHG === 'boolean' && p.doHG) {
			this.doHG = true;
		}
		if (typeof p.gamut === 'number') {
			this.curHG = p.gamut;
		}

		if (typeof p.lin === 'boolean') {
			this.hgLin = p.lin;
			out.lin = this.hgLin;
		} else {
			this.doHG = false;
		}
		if (typeof p.low === 'number') {
			this.hgLowStop = p.low;
			this.hgLow = Math.pow(2,this.hgLowStop)/5;
			out.low = this.hgLowStop;
		} else {
			this.doHG = false;
		}
		if (typeof p.high === 'number') {
			this.hgHighStop = p.high;
			this.hgHigh = Math.pow(2,this.hgHighStop)/5;
			out.high = this.hgHighStop;
		} else {
			this.doHG = false;
		}
	}
	out.gamut = this.curHG;
	out.doHG = this.doHG;
	return out;
};
LUTColourSpace.prototype.setMulti = function(params) {
	var out = {};
	this.doMulti = false;
	if (this.tweaks && typeof params.twkMulti !== 'undefined') {
		var p = params.twkMulti;
		if (typeof p.doMulti === 'boolean' && p.doMulti) {
			this.doMulti = true;
		}
		if (typeof p.sat !== 'undefined') {
			this.multiSat = new Float64Array(p.sat);
		}
		if (typeof p.sat !== 'undefined') {
			this.multiSat = new Float64Array(p.sat);
		}
		if (typeof p.pHue !== 'undefined' && typeof p.pSat !== 'undefined' && typeof p.pStop !== 'undefined') {
			this.multiStop = new Float64Array(p.pStop);
			var h = new Uint8Array(p.pHue);
			var s = new Uint8Array(p.pSat);
			var m = this.multiStop.length;
			this.multiRGB = new Float64Array(m*3);
			var f = new Float64Array(this.colSqr);
			var k;
			for (var j=0; j<m; j++) {
				k = (h[j]+(256*(255-s[j])))*3;
				this.multiRGB[ (j*3) ] = f[ k ];
				this.multiRGB[(j*3)+1] = f[k+1];
				this.multiRGB[(j*3)+2] = f[k+2];
			}
			this.csOut[this.curOut].lc(this.multiRGB.buffer);
		} else {
			this.multiStop = new Float64Array([0]);
			this.multiRGB = new Float64Array([1,1,1]);
		}
	}
	out.doMulti = this.doMulti;
	return out;
};
LUTColourSpace.prototype.setFC = function(params) {
	var out = {};
	this.doFC = false;
	this.fcVals[0] = -10;	// Purple - Black Clip
	this.fcVals[1] = -10;	// Blue - Just Above Black Clip (18%-6.1 stops)
	this.fcVals[2] = -10;	// Green - 18%-0.2 Stop
	this.fcVals[3] = -10;	// Green - 18%+0.2 stop
	this.fcVals[4] = -10;	// Pink - One Stop Over 18%-0.175 Stop
	this.fcVals[5] = -10;	// Pink - One Stop Over 18%+0.175 Stop
	this.fcVals[6] = -10;	// Orange - 90% White-0.175 Stop
	this.fcVals[7] = -10;	// Orange - 90% White+0.175 Stop
	this.fcVals[8] = -10;	// Yellow - White Clip (Sony F55,F5,FS7)-0.25 Stop
	this.fcVals[9] = -10;	// Red - White Clip (Sony F55,F5,FS7)
	this.doFCPurple = false;
	this.doFCYellow = false;
	this.doFCRed = false;
	if (this.tweaks && typeof params.twkFC !== 'undefined') {
		var p = params.twkFC;
		if (typeof p.doFC === 'boolean' && p.doFC) {
			this.doFC = true;
			var noFCs = true;
			if (typeof p.fcs !== 'undefined') {
				var fcs = p.fcs;
				if (fcs[0]) { 
					this.fcVals[0] = Math.pow(2,-8)*0.2; // default 8 stops below 18% gray
					this.doFCPurple = true;
					noFCs = false;
				}
				if (fcs[1]) {
					if (typeof p.blue === 'number') {
						this.fcVals[1] = Math.pow(2,-p.blue)*0.2;
					} else {
						this.fcVals[1] = Math.pow(2,-6.1)*0.2; // default 6.1 stops below 18% gray
					}
					this.fcVals[0] = Math.pow(2,-10)*0.2; // default 10 stops below 18% gray
					noFCs = false;
				}
				if (fcs[2]) {
					this.fcVals[2] = 0.174110113;
					this.fcVals[3] = 0.229739671;
					noFCs = false;
				}
				if (fcs[3]) {
					this.fcVals[4] = 0.354307008;
					this.fcVals[5] = 0.451585762;
					noFCs = false;
				}
				if (fcs[4]) {
					this.fcVals[6] = 0.885767519;
					this.fcVals[7] = 1.128964405;
					noFCs = false;
				}
				if (fcs[5]) {
					if (typeof p.yellow === 'number') {
						if (typeof p.red === 'number') {
							this.fcVals[8] = Math.pow(2,p.red-p.yellow)*0.2;
						} else {
							this.fcVals[8] = Math.pow(2,5.95-p.yellow)*0.2;
						}
					} else {
						if (typeof p.red === 'number') {
							this.fcVals[8] = Math.pow(2,p.red-0.26)*0.2; // default 0.26 stops below white clip
						} else {
							this.fcVals[8] = Math.pow(2,5.95-0.26)*0.2; // default 0.26 stops below white clip
						}
					}
					this.fcVals[9] = Math.pow(2,5.95)*0.2; // default 5.95 stops above mid gray
					this.doFCYellow = true;
					noFCs = false;
				}
				if (fcs[6]) {
					if (typeof p.red === 'number') {
						this.fcVals[9] = Math.pow(2,p.red)*0.2;
					} else {
						this.fcVals[9] = Math.pow(2,5.95)*0.2; // default 5.95 stops above mid gray
					}
					this.doFCRed = true;
					noFCs = false;
				}
				if (noFCs) {
					this.doFC = false;
				}
			} else {
				this.doFC = false;
			}
		}
	}
	out.blue = Math.log(this.fcVals[1]/0.2)/Math.log(2);
	out.yellow = Math.log(this.fcVals[8]/0.2)/Math.log(2);
	out.red = Math.log(this.fcVals[9]/0.2)/Math.log(2);
	out.doFC = this.doFC;
	return out;
};
// Adjustment functions
LUTColourSpace.prototype.multiOut = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var Y, stp, sat, r, b;
	var mt = this.multiStop.length;
	var mono = new Float64Array(3);
	var Y2, mul, mL, mH;
	for (var j=0; j<m; j +=3) {
		Y = (this.y[0]*c[j])+(this.y[1]*c[j+1])+(this.y[2]*c[j+2]);
		if (Y <= 0) {
			sat = this.multiSat[0];
			mono[0] = Y;
			mono[1] = Y;
			mono[2] = Y;
		} else {
			stp = (Math.log(Y/0.2)/Math.LN2) + 8;
			if (stp <= 0) {
				sat = this.multiSat[0];
			} else if (stp >= 16) {
				sat = this.multiSat[16];
			} else {
				b = Math.floor(stp);
				r = stp - b;
				sat = ((1-r)*this.multiSat[b]) + (r*this.multiSat[b+1]);
			}
			if (sat >= 1) {
				mono[0] = Y;
				mono[1] = Y;
				mono[2] = Y;
			} else {
				if (mt === 1) {
					mono[0] = this.multiRGB[0];
					mono[1] = this.multiRGB[1];
					mono[2] = this.multiRGB[2];
				} else if (mt > 1) {
					stp -= 8;
					mL = mt-1;
					mH = mt;
					for (var k=0; k<mt; k++) {
						if (this.multiStop[k] > stp) {
							mL = k-1;
							mH = k;
							break;
						}
					}
					if (mL < 0) {
						mono[0] = this.multiRGB[0];
						mono[1] = this.multiRGB[1];
					mono[2] = this.multiRGB[2];
					} else if (mH >= mt) {
						mono[0] = this.multiRGB[ ((mt-1)*3) ];
						mono[1] = this.multiRGB[((mt-1)*3)+1];
						mono[2] = this.multiRGB[((mt-1)*3)+2];
					} else {
						r = (stp-this.multiStop[mL])/(this.multiStop[mH]-this.multiStop[mL]);
						mono[0] = ((1-r)*this.multiRGB[ ((mL)*3) ])+(r*this.multiRGB[ ((mH)*3) ]);
						mono[1] = ((1-r)*this.multiRGB[((mL)*3)+1])+(r*this.multiRGB[((mH)*3)+1]);
						mono[2] = ((1-r)*this.multiRGB[((mL)*3)+2])+(r*this.multiRGB[((mH)*3)+2]);
					} 
				} else {
					mono[0] = Y;
					mono[1] = Y;
					mono[2] = Y;
				}
				if (mt > 0) {
					Y2 = (this.y[0]*mono[0])+(this.y[1]*mono[1])+(this.y[2]*mono[2]);
					if (Y2 > 0) {
						mul = Y/Y2;
						mono[0] *= mul;
						mono[1] *= mul;
						mono[2] *= mul;
					} else {
						mono[0] = Y;
						mono[1] = Y;
						mono[2] = Y;
					}
				}
			}
		}
		c[ j ] = mono[0] + (sat*(c[ j ]-mono[0]));
		c[j+1] = mono[1] + (sat*(c[j+1]-mono[1]));
		c[j+2] = mono[2] + (sat*(c[j+2]-mono[2]));
	}
};
// Colour space data objects
function CCTxy(LUT) {
	this.lut = LUT;
	this.u = 0.32;
	this.v = 0.21;
}
CCTxy.prototype.setxy = function(x,y) {
	this.u = (4*x)/((-2*x) + (12*y) + 3);
	this.v = (6*y)/((-2*x) + (12*y) + 3);
};
CCTxy.prototype.setuv = function(u,v) {
	this.u = u;
	this.v = v;
};
CCTxy.prototype.f = function(T) {
	var T0 = T - 0.05;
	var T1 = T + 0.05;
	var xy0 = this.lut.lRCub(T0);
	var uv0 = new Float64Array([
		4 * xy0[0] / ((-2*xy0[0]) + (12*xy0[1]) + 3),
		6 * xy0[1] / ((-2*xy0[0]) + (12*xy0[1]) + 3)
	]);
	var xy1 = this.lut.lRCub(T1);
	var uv1 = new Float64Array([
		4 * xy1[0] / ((-2*xy1[0]) + (12*xy1[1]) + 3),
		6 * xy1[1] / ((-2*xy1[0]) + (12*xy1[1]) + 3)
	]);
	var d0 = Math.pow(Math.pow(this.u - uv0[0],2) + Math.pow(this.v - uv0[1],2),0.5);
	var d1 = Math.pow(Math.pow(this.u - uv1[0],2) + Math.pow(this.v - uv1[1],2),0.5);
	return (d0-d1)*10;
};
function Planck() {
	this.loci = new LUTs();
	this.setLoci();
	this.slope = new CCTxy(this.loci);
	this.brent = new Brent(this.slope,0,50000);
	this.brent.setDelta(1000);
}
Planck.prototype.setLoci = function() {
	this.loci.setDetails({
		title: 'loci',
		format: 'cube',
		dims: 1,
		s: 501,
		min: [100,100,100],
		max: [50100,50100,50100],
		C: [new Float64Array(
			[
				0.7346901, 0.7346893, 0.7343438, 0.7304724, 0.7213855, 0.7092079, 0.6955663, 0.6813343, 0.6669815, 0.6527507,
				0.6387563, 0.6250448, 0.6116315, 0.5985211, 0.5857180, 0.5732296, 0.5610674, 0.5492451, 0.5377773, 0.5266775,
				0.5159573, 0.5056253, 0.4956867, 0.4861436, 0.4769946, 0.4682353, 0.4598590, 0.4518569, 0.4442182, 0.4369311,
				0.4299827, 0.4233596, 0.4170480, 0.4110339, 0.4053035, 0.3998431, 0.3946393, 0.3896790, 0.3849498, 0.3804395,
				0.3761367, 0.3720303, 0.3681099, 0.3643654, 0.3607875, 0.3573673, 0.3540963, 0.3509665, 0.3479705, 0.3451012,
				0.3423519, 0.3397163, 0.3371885, 0.3347629, 0.3324344, 0.3301979, 0.3280487, 0.3259827, 0.3239954, 0.3220832,
				0.3202423, 0.3184693, 0.3167609, 0.3151141, 0.3135259, 0.3119936, 0.3105146, 0.3090864, 0.3077068, 0.3063736,
				0.3050847, 0.3038382, 0.3026321, 0.3014648, 0.3003345, 0.2992398, 0.2981790, 0.2971509, 0.2961540, 0.2951870,
				0.2942488, 0.2933382, 0.2924541, 0.2915955, 0.2907613, 0.2899506, 0.2891625, 0.2883962, 0.2876509, 0.2869256,
				0.2862198, 0.2855327, 0.2848636, 0.2842119, 0.2835769, 0.2829581, 0.2823549, 0.2817668, 0.2811931, 0.2806336,
				0.2800876, 0.2795547, 0.2790345, 0.2785265, 0.2780304, 0.2775458, 0.2770723, 0.2766095, 0.2761572, 0.2757149,
				0.2752824, 0.2748594, 0.2744456, 0.2740407, 0.2736444, 0.2732565, 0.2728767, 0.2725048, 0.2721406, 0.2717838,
				0.2714343, 0.2710918, 0.2707561, 0.2704270, 0.2701044, 0.2697881, 0.2694778, 0.2691735, 0.2688750, 0.2685821,
				0.2682946, 0.2680125, 0.2677356, 0.2674637, 0.2671968, 0.2669346, 0.2666771, 0.2664242, 0.2661757, 0.2659315,
				0.2656916, 0.2654558, 0.2652240, 0.2649961, 0.2647720, 0.2645517, 0.2643351, 0.2641220, 0.2639123, 0.2637061,
				0.2635032, 0.2633035, 0.2631070, 0.2629136, 0.2627232, 0.2625358, 0.2623513, 0.2621696, 0.2619907, 0.2618144,
				0.2616409, 0.2614699, 0.2613014, 0.2611355, 0.2609719, 0.2608108, 0.2606520, 0.2604954, 0.2603411, 0.2601890,
				0.2600390, 0.2598911, 0.2597453, 0.2596015, 0.2594597, 0.2593198, 0.2591818, 0.2590457, 0.2589114, 0.2587788,
				0.2586481, 0.2585191, 0.2583917, 0.2582660, 0.2581420, 0.2580195, 0.2578986, 0.2577792, 0.2576614, 0.2575450,
				0.2574301, 0.2573166, 0.2572046, 0.2570939, 0.2569845, 0.2568765, 0.2567698, 0.2566643, 0.2565602, 0.2564572,
				0.2563555, 0.2562550, 0.2561557, 0.2560575, 0.2559605, 0.2558645, 0.2557697, 0.2556759, 0.2555833, 0.2554916,
				0.2554010, 0.2553114, 0.2552228, 0.2551352, 0.2550485, 0.2549628, 0.2548780, 0.2547942, 0.2547112, 0.2546291,
				0.2545479, 0.2544676, 0.2543881, 0.2543095, 0.2542317, 0.2541546, 0.2540784, 0.2540030, 0.2539283, 0.2538544,
				0.2537813, 0.2537089, 0.2536372, 0.2535663, 0.2534960, 0.2534265, 0.2533576, 0.2532894, 0.2532219, 0.2531551,
				0.2530888, 0.2530233, 0.2529583, 0.2528940, 0.2528303, 0.2527672, 0.2527047, 0.2526428, 0.2525815, 0.2525207,
				0.2524605, 0.2524009, 0.2523418, 0.2522832, 0.2522252, 0.2521677, 0.2521107, 0.2520543, 0.2519983, 0.2519429,
				0.2518879, 0.2518334, 0.2517795, 0.2517259, 0.2516729, 0.2516203, 0.2515682, 0.2515165, 0.2514653, 0.2514145,
				0.2513641, 0.2513142, 0.2512647, 0.2512156, 0.2511669, 0.2511186, 0.2510708, 0.2510233, 0.2509762, 0.2509295,
				0.2508832, 0.2508373, 0.2507917, 0.2507465, 0.2507017, 0.2506572, 0.2506131, 0.2505694, 0.2505260, 0.2504829,
				0.2504402, 0.2503978, 0.2503558, 0.2503141, 0.2502727, 0.2502316, 0.2501908, 0.2501504, 0.2501102, 0.2500704,
				0.2500309, 0.2499917, 0.2499527, 0.2499141, 0.2498757, 0.2498377, 0.2497999, 0.2497624, 0.2497252, 0.2496882,
				0.2496516, 0.2496152, 0.2495790, 0.2495432, 0.2495075, 0.2494722, 0.2494371, 0.2494022, 0.2493676, 0.2493333,
				0.2492991, 0.2492653, 0.2492316, 0.2491982, 0.2491651, 0.2491321, 0.2490994, 0.2490670, 0.2490347, 0.2490027,
				0.2489709, 0.2489393, 0.2489079, 0.2488767, 0.2488458, 0.2488150, 0.2487845, 0.2487542, 0.2487240, 0.2486941,
				0.2486644, 0.2486348, 0.2486055, 0.2485764, 0.2485474, 0.2485186, 0.2484901, 0.2484617, 0.2484335, 0.2484054,
				0.2483776, 0.2483499, 0.2483224, 0.2482951, 0.2482680, 0.2482410, 0.2482142, 0.2481876, 0.2481611, 0.2481348,
				0.2481087, 0.2480827, 0.2480569, 0.2480313, 0.2480058, 0.2479804, 0.2479553, 0.2479302, 0.2479054, 0.2478806,
				0.2478561, 0.2478317, 0.2478074, 0.2477833, 0.2477593, 0.2477354, 0.2477117, 0.2476882, 0.2476648, 0.2476415,
				0.2476183, 0.2475953, 0.2475724, 0.2475497, 0.2475271, 0.2475046, 0.2474823, 0.2474601, 0.2474380, 0.2474160,
				0.2473942, 0.2473725, 0.2473509, 0.2473294, 0.2473081, 0.2472868, 0.2472657, 0.2472448, 0.2472239, 0.2472031,
				0.2471825, 0.2471620, 0.2471416, 0.2471213, 0.2471011, 0.2470810, 0.2470611, 0.2470412, 0.2470215, 0.2470018,
				0.2469823, 0.2469629, 0.2469436, 0.2469243, 0.2469052, 0.2468862, 0.2468673, 0.2468485, 0.2468298, 0.2468112,
				0.2467927, 0.2467743, 0.2467559, 0.2467377, 0.2467196, 0.2467016, 0.2466836, 0.2466658, 0.2466480, 0.2466304,
				0.2466128, 0.2465953, 0.2465779, 0.2465606, 0.2465434, 0.2465263, 0.2465093, 0.2464923, 0.2464754, 0.2464587,
				0.2464420, 0.2464254, 0.2464088, 0.2463924, 0.2463760, 0.2463597, 0.2463435, 0.2463274, 0.2463114, 0.2462954,
				0.2462795, 0.2462637, 0.2462480, 0.2462323, 0.2462167, 0.2462012, 0.2461858, 0.2461704, 0.2461552, 0.2461400,
				0.2461248, 0.2461098, 0.2460948, 0.2460799, 0.2460650, 0.2460502, 0.2460355, 0.2460209, 0.2460063, 0.2459918,
				0.2459774, 0.2459630, 0.2459487, 0.2459345, 0.2459203, 0.2459062, 0.2458922, 0.2458782, 0.2458643, 0.2458505,
				0.2458367, 0.2458230, 0.2458093, 0.2457957, 0.2457822, 0.2457687, 0.2457553, 0.2457420, 0.2457287, 0.2457155,
				0.2457023, 0.2456892, 0.2456761, 0.2456631, 0.2456502, 0.2456373, 0.2456245, 0.2456117, 0.2455990, 0.2455864,
				0.2455738
			]).buffer,
			new Float64Array(
		    [
				0.2653099, 0.2653107, 0.2656557, 0.2695173, 0.2785681, 0.2906601, 0.3041078, 0.3179314, 0.3315172, 0.3444616,
				0.3564976, 0.3674542, 0.3772323, 0.3857882, 0.3931213, 0.3992642, 0.4042739, 0.4082249, 0.4112022, 0.4132970,
				0.4146018, 0.4152076, 0.4152017, 0.4146658, 0.4136754, 0.4122992, 0.4105990, 0.4086300, 0.4064408, 0.4040740,
				0.4015669, 0.3989516, 0.3962561, 0.3935040, 0.3907157, 0.3879084, 0.3850966, 0.3822926, 0.3795065, 0.3767468,
				0.3740204, 0.3713329, 0.3686888, 0.3660918, 0.3635445, 0.3610490, 0.3586068, 0.3562189, 0.3538859, 0.3516080,
				0.3493852, 0.3472171, 0.3451032, 0.3430428, 0.3410352, 0.3390794, 0.3371744, 0.3353191, 0.3335125, 0.3317534,
				0.3300405, 0.3283728, 0.3267490, 0.3251679, 0.3236283, 0.3221291, 0.3206690, 0.3192470, 0.3178619, 0.3165126,
				0.3151980, 0.3139171, 0.3126689, 0.3114523, 0.3102664, 0.3091102, 0.3079829, 0.3068835, 0.3058113, 0.3047652,
				0.3037446, 0.3027487, 0.3017766, 0.3008278, 0.2999014, 0.2989968, 0.2981134, 0.2972504, 0.2964073, 0.2955834,
				0.2947783, 0.2939913, 0.2932219, 0.2924696, 0.2917339, 0.2910143, 0.2903104, 0.2896216, 0.2889476, 0.2882878,
				0.2876421, 0.2870098, 0.2863907, 0.2857843, 0.2851904, 0.2846086, 0.2840385, 0.2834798, 0.2829322, 0.2823955,
				0.2818693, 0.2813533, 0.2808473, 0.2803510, 0.2798641, 0.2793865, 0.2789178, 0.2784578, 0.2780064, 0.2775632,
				0.2771282, 0.2767010, 0.2762815, 0.2758695, 0.2754648, 0.2750672, 0.2746766, 0.2742928, 0.2739156, 0.2735448,
				0.2731804, 0.2728221, 0.2724698, 0.2721234, 0.2717828, 0.2714477, 0.2711181, 0.2707939, 0.2704749, 0.2701610,
				0.2698521, 0.2695481, 0.2692488, 0.2689543, 0.2686643, 0.2683787, 0.2680975, 0.2678206, 0.2675479, 0.2672793,
				0.2670147, 0.2667540, 0.2664972, 0.2662441, 0.2659947, 0.2657489, 0.2655066, 0.2652678, 0.2650324, 0.2648004,
				0.2645715, 0.2643459, 0.2641234, 0.2639039, 0.2636875, 0.2634740, 0.2632634, 0.2630557, 0.2628507, 0.2626484,
				0.2624488, 0.2622519, 0.2620575, 0.2618657, 0.2616763, 0.2614893, 0.2613048, 0.2611226, 0.2609427, 0.2607651,
				0.2605897, 0.2604164, 0.2602453, 0.2600764, 0.2599094, 0.2597445, 0.2595817, 0.2594207, 0.2592617, 0.2591046,
				0.2589494, 0.2587959, 0.2586443, 0.2584945, 0.2583464, 0.2582000, 0.2580552, 0.2579122, 0.2577707, 0.2576309,
				0.2574926, 0.2573559, 0.2572207, 0.2570870, 0.2569548, 0.2568240, 0.2566946, 0.2565667, 0.2564401, 0.2563149,
				0.2561911, 0.2560685, 0.2559473, 0.2558273, 0.2557086, 0.2555912, 0.2554750, 0.2553599, 0.2552461, 0.2551334,
				0.2550219, 0.2549115, 0.2548022, 0.2546940, 0.2545869, 0.2544809, 0.2543759, 0.2542720, 0.2541691, 0.2540672,
				0.2539663, 0.2538663, 0.2537674, 0.2536694, 0.2535723, 0.2534761, 0.2533809, 0.2532866, 0.2531931, 0.2531006,
				0.2530089, 0.2529180, 0.2528280, 0.2527388, 0.2526505, 0.2525629, 0.2524761, 0.2523902, 0.2523050, 0.2522205,
				0.2521369, 0.2520539, 0.2519717, 0.2518903, 0.2518095, 0.2517295, 0.2516501, 0.2515715, 0.2514935, 0.2514162,
				0.2513396, 0.2512636, 0.2511883, 0.2511136, 0.2510395, 0.2509661, 0.2508932, 0.2508210, 0.2507494, 0.2506784,
				0.2506079, 0.2505381, 0.2504688, 0.2504001, 0.2503319, 0.2502643, 0.2501973, 0.2501307, 0.2500648, 0.2499993,
				0.2499344, 0.2498699, 0.2498060, 0.2497426, 0.2496797, 0.2496172, 0.2495553, 0.2494938, 0.2494328, 0.2493723,
				0.2493123, 0.2492527, 0.2491935, 0.2491348, 0.2490766, 0.2490188, 0.2489614, 0.2489044, 0.2488479, 0.2487918,
				0.2487361, 0.2486808, 0.2486259, 0.2485715, 0.2485174, 0.2484637, 0.2484104, 0.2483575, 0.2483050, 0.2482528,
				0.2482010, 0.2481496, 0.2480986, 0.2480479, 0.2479976, 0.2479476, 0.2478980, 0.2478487, 0.2477997, 0.2477511,
				0.2477029, 0.2476549, 0.2476073, 0.2475601, 0.2475131, 0.2474665, 0.2474202, 0.2473742, 0.2473285, 0.2472831,
				0.2472380, 0.2471932, 0.2471487, 0.2471045, 0.2470606, 0.2470170, 0.2469737, 0.2469306, 0.2468879, 0.2468454,
				0.2468032, 0.2467613, 0.2467196, 0.2466782, 0.2466371, 0.2465962, 0.2465556, 0.2465152, 0.2464751, 0.2464353,
				0.2463957, 0.2463564, 0.2463173, 0.2462784, 0.2462398, 0.2462014, 0.2461633, 0.2461254, 0.2460877, 0.2460503,
				0.2460131, 0.2459761, 0.2459393, 0.2459028, 0.2458665, 0.2458304, 0.2457945, 0.2457588, 0.2457234, 0.2456881,
				0.2456531, 0.2456182, 0.2455836, 0.2455492, 0.2455150, 0.2454810, 0.2454471, 0.2454135, 0.2453801, 0.2453469,
				0.2453138, 0.2452810, 0.2452483, 0.2452158, 0.2451835, 0.2451514, 0.2451195, 0.2450877, 0.2450562, 0.2450248,
				0.2449936, 0.2449625, 0.2449317, 0.2449010, 0.2448704, 0.2448401, 0.2448099, 0.2447799, 0.2447500, 0.2447203,
				0.2446908, 0.2446614, 0.2446322, 0.2446032, 0.2445743, 0.2445455, 0.2445169, 0.2444885, 0.2444602, 0.2444321,
				0.2444041, 0.2443763, 0.2443486, 0.2443211, 0.2442937, 0.2442664, 0.2442393, 0.2442123, 0.2441855, 0.2441588,
				0.2441323, 0.2441059, 0.2440796, 0.2440535, 0.2440275, 0.2440016, 0.2439759, 0.2439503, 0.2439248, 0.2438994,
				0.2438742, 0.2438491, 0.2438241, 0.2437993, 0.2437746, 0.2437500, 0.2437255, 0.2437012, 0.2436770, 0.2436528,
				0.2436289, 0.2436050, 0.2435812, 0.2435576, 0.2435341, 0.2435107, 0.2434874, 0.2434642, 0.2434411, 0.2434182,
				0.2433953, 0.2433726, 0.2433500, 0.2433275, 0.2433050, 0.2432827, 0.2432605, 0.2432384, 0.2432165, 0.2431946,
				0.2431728, 0.2431511, 0.2431295, 0.2431081, 0.2430867, 0.2430654, 0.2430442, 0.2430232, 0.2430022, 0.2429813,
				0.2429605, 0.2429398, 0.2429192, 0.2428987, 0.2428783, 0.2428580, 0.2428378, 0.2428176, 0.2427976, 0.2427776,
				0.2427578, 0.2427380, 0.2427183, 0.2426987, 0.2426792, 0.2426598, 0.2426405, 0.2426212, 0.2426021, 0.2425830,
				0.2425640, 0.2425451, 0.2425262, 0.2425075, 0.2424888, 0.2424702, 0.2424517, 0.2424333, 0.2424150, 0.2423967,
				0.2423785
		    ]).buffer,
			new Float64Array(
			[
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1,1,1,1,1,1,1,1,1,1,
				1
			]).buffer
		]
	});
};
Planck.prototype.getCCT = function(white) {
	if (white[0] < 0 || white[1] < 0 || white[0]+white[1] > 1) {
		return false;
	} else {
		var u = 4 * white[0] / ((-2*white[0]) + (12*white[1]) + 3);
		var v = 6 * white[1] / ((-2*white[0]) + (12*white[1]) + 3);
		// Test if in triangles below 1000K or above 25000K
/*
		var left = (0.42644748-0.44800714)*(v-0.3546253) - (0.1055567-0.3546253)*(u-0.44800714);
		if (left >= 0) {
			return 1000;
		} else 
*/
		left = (0.42207761-0.18293282)*(v-0.2740731) - (0.2012049-0.2740731)*(u-0.18293282);
		if (left <= 0) {
			return 25000;
		}
		// Find CCT using Brents method
		this.slope.setuv(u,v);
		var m = 26;
		var best = 0;
		var bDist = 999;
		var root, xy, dist;
		var uv = new Float64Array(2);
		for (var j=0; j<m; j++) {
			root = this.brent.findRoot((j*1000)+100,0);
			if (root > 100) {
				xy = this.loci.lRCub(root);
				uv = this.xy2uv(xy);
				dist = Math.pow(Math.pow(u - uv[0],2) + Math.pow(v - uv[1],2),0.5);
				if (dist < bDist) {
					best = root;
					bDist = dist;
				}
			}
		}
		if (best < 500) {
			best = 500;
		} else if (best > 25000) {
			best = 25000;
		}
		return Math.round(best);
	}
};
Planck.prototype.getDuvMag = function(white,T) {
	var xy = this.loci.lRCub(T);
	var xy1 = this.loci.lRCub(T + 0.1);
	var xy2 = this.loci.lRCub(T - 0.1);
	var uv = this.xy2uv(xy);
	var uv1 = this.xy2uv(xy1);
	var uv2 = this.xy2uv(xy2);
	var uvW = this.xy2uv(white);
	var a = uv2[0]-uv1[0];
	var b = uv2[1]-uv1[1];
	var c = - (a * uv[0]) - (b * uv[1]);
	var u = ((b*((b*uvW[0])-(a*uvW[1]))) - (a*c))/((a*a) + (b*b));
	var v = ((a*((-b*uvW[0])+(a*uvW[1]))) - (b*c))/((a*a) + (b*b));
	var du = u - uv[0];
	var dv = v - uv[1];
	var nBelow = (uv1[0]-uv2[0])*(v-uv2[1]) - (uv1[1]-uv2[1])*(u-uv2[0]);
	var nMag = Math.pow((du*du)+(dv*dv),0.5);
	var dut = u - uvW[0];
	var dvt = v - uvW[1];
	var tLeft = (uv[0]-u)*(uvW[1]-v) - (uv[1]-v)*(uvW[0]-u);
	var tMag = Math.pow((dut*dut)+(dvt*dvt),0.5);
	var out = new Float64Array(2);
	if (nBelow > 0 && nMag > 0.0000001) {
		out[0] = -nMag;
	} else if (nMag > 0.0000001) {
		out[0] = nMag;
	} else {
		out[0] = 0;
	}
	if (tLeft > 0 && tMag > 0.0000001) {
		out[1] = tMag;
	} else if (tMag > 0.0000001) {
		out[1] = -tMag;
	} else {
		out[1] = 0;
	}
	return out;
};
Planck.prototype.getDxy = function(white,T) {
	var xyY = this.loci.lRCub(T);
	var xyY1 = this.loci.lRCub(T + 0.1);
	var xyY2 = this.loci.lRCub(T - 0.1);
	var uv = new Float64Array([
		(4*xyY[0])/((-2*xyY[0]) + (12*xyY[1]) + 3),
		(6*xyY[1])/((-2*xyY[0]) + (12*xyY[1]) + 3)
	]);
	var uv1 = new Float64Array([
		(4*xyY1[0])/((-2*xyY1[0]) + (12*xyY1[1]) + 3),
		(6*xyY1[1])/((-2*xyY1[0]) + (12*xyY1[1]) + 3)
	]);
	var uv2 = new Float64Array([
		(4*xyY2[0])/((-2*xyY2[0]) + (12*xyY2[1]) + 3),
		(6*xyY2[1])/((-2*xyY2[0]) + (12*xyY2[1]) + 3)
	]);
	var a = uv2[0]-uv1[0];
	var b = uv2[1]-uv1[1];
	var c = - (a * uv[0]) - (b * uv[1]);
	var u0 = 4 * white[0] / ((-2*white[0]) + (12*white[1]) + 3);
	var v0 = 6 * white[1] / ((-2*white[0]) + (12*white[1]) + 3);
	var u = ((b*((b*u0)-(a*v0))) - (a*c))/((a*a) + (b*b));
	var v = ((a*((-b*u0)+(a*v0))) - (b*c))/((a*a) + (b*b));
	var x = (3*u)/((2*u)-(8*v)+4);
	var y = (2*v)/((2*u)-(8*v)+4);
	var dx = x - xyY[0];
	var dy = y - xyY[1];
	var left = (xyY1[0]-xyY2[0])*(y-xyY2[1]) - (xyY1[1]-xyY2[1])*(x-xyY2[0]);
	var mag = Math.pow((dx*dx)+(dy*dy),0.5);
// self.postMessage({msg:true,details:'xy, x, y - ' + xyY[0] + ' , ' + xyY[1] + ' , ' + x + ' , ' + y});
	if (left > 0) {
		return -mag;
	} else {
		return mag;
	}
};
Planck.prototype.xyY = function(T) {
	var out = this.loci.lRCub(T);
	out[2] = 1;
	return out;
};
Planck.prototype.xyz = function(T) {
	var xyY = this.loci.lRCub(T);
	return new Float64Array([
		xyY[0],xyY[1],1-xyY[0]-xyY[1]
	]);
};
Planck.prototype.XYZ = function(T) {
	var xyY = this.loci.lRCub(T);
	return new Float64Array([
		xyY[0]/xyY[1],1,(1-xyY[0]-xyY[1])/xyY[1]
	]);
};
Planck.prototype.uv = function(T) {
	var xy = this.loci.lRCub(T);
	var den = (-2*xy[0]) + (12*xy[1]) + 3;
	return new Float64Array([
		4*xy[0] / den,
		6*xy[1] / den
	]);
};
Planck.prototype.xy2uv = function(xy) {
	var den = (-2*xy[0]) + (12*xy[1]) + 3;
	return new Float64Array([
		4*xy[0] / den,
		6*xy[1] / den
	]);
};
Planck.prototype.uv2xy = function(uv) {
	var den = (2*uv[0]) - (8*uv[1]) + 4;
	return new Float64Array([
		3*uv[0] / den,
		2*uv[1] / den,
		1 - (((3*uv[0]) + (2*uv[1])) / den)
	]);
};
Planck.prototype.uv2XYZ = function(uv) {
	var xy = this.uv2xy(uv);
	return new Float64Array([
		xy[0]/xy[1],
		1,
		xy[2]/xy[1]
	]);
};
Planck.prototype.Dxy = function(T) {
	var xyY = this.loci.lRCub(T);
	var xyY1 = this.loci.lRCub(T + 0.1);
	var xyY2 = this.loci.lRCub(T - 0.1);
	var uv = new Float64Array([
		(4*xyY[0])/((-2*xyY[0]) + (12*xyY[1]) + 3),
		(6*xyY[1])/((-2*xyY[0]) + (12*xyY[1]) + 3)
	]);
	var uv1 = new Float64Array([
		(4*xyY1[0])/((-2*xyY1[0]) + (12*xyY1[1]) + 3),
		(6*xyY1[1])/((-2*xyY1[0]) + (12*xyY1[1]) + 3)
	]);
	var uv2 = new Float64Array([
		(4*xyY2[0])/((-2*xyY2[0]) + (12*xyY2[1]) + 3),
		(6*xyY2[1])/((-2*xyY2[0]) + (12*xyY2[1]) + 3)
	]);
	var dvdu = Math.atan2(uv2[1]-uv1[1], uv2[0]-uv1[0]) + (Math.PI/2);
// self.postMessage({msg:true,details:'xy('+T+'): x - ' + xyY[0] + ', y - ' + xyY[1]});
// self.postMessage({msg:true,details:'dv/du('+T+'): rad - ' + dvdu + ', deg - ' + Math.round(180*dvdu/Math.PI)});
	var u = uv[0] + Math.sin(dvdu);
	var v = uv[1] + Math.cos(dvdu);
	var x = (3*u)/((2*u)-(8*v)+4);
	var y = (2*v)/((2*u)-(8*v)+4);
	var dx = x - xyY[0];
	var dy = y - xyY[1];
	var mag = Math.pow((dx*dx)+(dy*dy),0.5);
	return new Float64Array([mag, Math.atan2(dy, dx)]);
};
Planck.prototype.Duv = function(T) {
	var uv1 = this.uv(T + 1);
	var uv2 = this.uv(T - 1);
	var du = uv2[0]-uv1[0];
	var dv = uv2[1]-uv1[1];
	var norm = Math.atan2(du,-dv); // Locus offset (normal)
	var tang = Math.atan2(dv, du); // Planck slope (tangent)
	return new Float64Array([norm,tang]);
};
function CSCAT() {
	this.names = [];
	this.M = [];
	this.models();
}
CSCAT.prototype.models = function() {
	this.addModel('CIECAT02', new Float64Array([0.7328,0.4296,-0.1624, -0.7036,1.6975,0.0061, 0.003,0.0136,0.9834]));
	this.addModel('CIECAT97s', new Float64Array([0.8562,0.3372,-0.1934, -0.8360,1.8327,0.0033, 0.0357,-0.0469,1.0112]));
	this.addModel('Bradford Chromatic Adaptation', new Float64Array([0.8951,0.2664,-0.1614, -0.7502,1.7135,0.0367, 0.0389,-0.0685,1.0296]));
	this.addModel('Von Kries', new Float64Array([0.40024,0.7076,-0.08081, -0.2263,1.16532,0.0457, 0,0,0.91822]));
	this.addModel('Sharp', new Float64Array([1.2694,-0.0988,-0.1706, -0.8364,1.8006,0.0357, 0.0297,-0.0315,1.0018]));
	this.addModel('CMCCAT2000', new Float64Array([0.7982,0.3389,-0.1371, -0.5918,1.5512,0.0406, 0.0008,0.0239,0.9753]));
	this.addModel('Bianco BS', new Float64Array([0.8752,0.2787,-0.1539, -0.8904,1.8709,0.0195, -0.0061,0.0162,0.9899]));
	this.addModel('Bianco BS-PC', new Float64Array([0.6489,0.3915,-0.0404, -0.3775,1.3055,0.0720, -0.0271,0.0888,0.9383]));
	this.addModel('XYZ Scaling', new Float64Array([1,0,0, 0,1,0, 0,0,1]));
};
CSCAT.prototype.addModel = function(name,M) {
	this.names.push(name);
	this.M.push(M);
};
CSCAT.prototype.getModel = function(idx) {
	return new Float64Array(this.M[idx]);
};
CSCAT.prototype.getModels = function() {
	return this.names.slice(0);
};
CSCAT.prototype.modelIdx = function(model) {
	var m = this.names.length;
	for (var j=0; j<m; j++) {
		if (model.toLowerCase() === this.names[j].toLowerCase()) {
			return j;
		}
	}
	return 0;
};
// Adjustment objects
function CSWB(sysWhite, toXYZ, planck, CATs) {
	this.fromSys = toXYZ;
	this.toSys = this.mInverse(toXYZ);
	this.planck = planck;

	this.sysWhiteXYZ = new Float64Array([sysWhite[0]/sysWhite[1],1,(1-sysWhite[0]-sysWhite[1])/sysWhite[1]]);
	this.CCT0 = this.planck.getCCT(sysWhite);
	this.Duv0 = this.planck.getDuvMag(sysWhite,this.CCT0)[0];
	var uv0 = this.planck.uv(this.CCT0);
	var a = this.planck.Duv(this.CCT0);
	uv0[0] += this.Duv0 * Math.cos(a[0]);
	uv0[1] += this.Duv0 * Math.sin(a[0]);
	
	this.w0 = this.planck.uv2xy(uv0);
	this.W0 = this.planck.uv2XYZ(uv0);
	this.CATs = CATs;

	this.ref = 5500;
	this.ct = 5500;
	this.lamp = 5500;
	this.duv = 0;
	this.dpl = 0;

	this.setModel(0);
}
CSWB.prototype.getSys = function() {
	return this.CCT0;
};
CSWB.prototype.setModel = function(idx) {
	this.cur = idx;
	this.M = this.CATs.getModel(idx);
	this.Minv = this.mInverse(this.M);
	this.setToLocus();
	this.setCAT();
};
CSWB.prototype.setToLocus = function() {
	var Msys = this.mMult(this.M,this.sysWhiteXYZ);
	var Mcct = this.mMult(this.M,this.planck.XYZ(this.CCT0));
	var Mtolocus = new Float64Array([
		Mcct[0]/Msys[0],	0,					0,
		0,					Mcct[1]/Msys[1],	0,
		0,					0,					Mcct[2]/Msys[2]
	]);
	this.Ntolocus = this.mMult(this.Minv,this.mMult(Mtolocus, this.M));
};
CSWB.prototype.setCAT = function() {
	var Msys = this.mMult(this.M,this.planck.XYZ(this.CCT0));
	var Mctd = this.mMult(this.M,this.planck.XYZ(this.base));
	var Mcts = this.mMult(this.M,this.planck.XYZ(this.ct));
	var Md = this.mMult(this.M,this.planck.XYZ(this.lamp));
	var UVlamp = this.planck.uv(this.lamp);
	var a = this.planck.Duv(this.lamp);
	this.uvAdd(
		UVlamp,
		(this.duv * Math.cos(a[0])) + (this.dpl * Math.cos(a[1])),
		(this.duv * Math.sin(a[0])) + (this.dpl * Math.sin(a[1]))
	);
	var Ms = this.mMult(this.M,this.planck.uv2XYZ(UVlamp));

	var Mct = new Float64Array([
		Mctd[0]/Mcts[0],	0,					0,
		0,					Mctd[1]/Mcts[1],	0,
		0,					0,					Mctd[2]/Mcts[2]
	]);
	var Mduv = new Float64Array([
		Md[0]/Ms[0],	0,				0,
		0,				Md[1]/Ms[1],	0,
		0,				0,				Md[2]/Ms[2]
	]);

	var Mnet = this.mMult(this.mMult(this.mMult(Mduv,Mct), this.M),this.fromSys);
	this.N = this.mMult(this.toSys,this.mMult(this.Minv,Mnet));
	this.Ninv = this.mMult(this.toSys,this.mMult(this.Minv,Mnet));
};
CSWB.prototype.uvAdd = function(uv, du, dv) {
	uv[0] += du;
	uv[1] += dv;
	var xyz = this.planck.uv2xy(uv);
	if (xyz[0]<0) {
		xyz[0] = 0;
	}
	if (xyz[1]<0) {
		xyz[1] = 0;
	}
	var bar = xyz[0] + xyz[1];
	if (bar > 1) {
		xyz[0] /= bar;
		xyz[1] /= bar;
	}
	xyz[2] = 1 - xyz[0] - xyz[1];
	var uv2 = this.planck.xy2uv(xyz);
	uv[0] = uv2[0];
	uv[1] = uv2[1];
};
CSWB.prototype.setVals = function(ref,ctShift,lampShift,duv,dpl) {
	// Colour Temperature Shift
	this.base = this.CCT0;
	var baseMired = 1000000 / this.base;
	var ctMired;
	if (-ctShift > baseMired * 0.9 || -lampShift > baseMired * 0.9) {
		if (ctShift < lampShift) {
			baseMired = -ctShift / 0.9;
		} else {
			baseMired = -lampShift / 0.9;
		}
		this.base = 1000000 / baseMired;
	}
	this.ct = 1000000 / (baseMired + ctShift);
	this.lamp = 1000000 / (baseMired + lampShift);
	// Duv / Dpl
	this.duv = -duv * 0.0175;
	this.dpl = dpl * 0.0175;
	this.setCAT();
};
CSWB.prototype.toLocus = function(XYZ) {
	return new Float64Array([
		(this.Ntolocus[0]*XYZ[0])+(this.Ntolocus[1]*XYZ[1])+(this.Ntolocus[2]*XYZ[2]),
		(this.Ntolocus[3]*XYZ[0])+(this.Ntolocus[4]*XYZ[1])+(this.Ntolocus[5]*XYZ[2]),
		(this.Ntolocus[6]*XYZ[0])+(this.Ntolocus[7]*XYZ[1])+(this.Ntolocus[8]*XYZ[2])
	]);
};
CSWB.prototype.mInverse = function(m) {
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
CSWB.prototype.mMult = function(m1,m2) {
	if (m1.length !== 9) {
		return false;
	}
	var len = m2.length;
	if (len === 3) {
		var out = new Float64Array(3);
		out[0] = (m1[0]*m2[0]) + (m1[1]*m2[1]) + (m1[2]*m2[2]);
		out[1] = (m1[3]*m2[0]) + (m1[4]*m2[1]) + (m1[5]*m2[2]);
		out[2] = (m1[6]*m2[0]) + (m1[7]*m2[1]) + (m1[8]*m2[2]);
		return out;
	} else if (len === 9) {
		var out = new Float64Array(9);
		out[0] = (m1[0]*m2[0]) + (m1[1]*m2[3]) + (m1[2]*m2[6]);
		out[1] = (m1[0]*m2[1]) + (m1[1]*m2[4]) + (m1[2]*m2[7]);
		out[2] = (m1[0]*m2[2]) + (m1[1]*m2[5]) + (m1[2]*m2[8]);
		out[3] = (m1[3]*m2[0]) + (m1[4]*m2[3]) + (m1[5]*m2[6]);
		out[4] = (m1[3]*m2[1]) + (m1[4]*m2[4]) + (m1[5]*m2[7]);
		out[5] = (m1[3]*m2[2]) + (m1[4]*m2[5]) + (m1[5]*m2[8]);
		out[6] = (m1[6]*m2[0]) + (m1[7]*m2[3]) + (m1[8]*m2[6]);
		out[7] = (m1[6]*m2[1]) + (m1[7]*m2[4]) + (m1[8]*m2[7]);
		out[8] = (m1[6]*m2[2]) + (m1[7]*m2[5]) + (m1[8]*m2[8]);
		return out;
	} else {
		return false;
	}
};
CSWB.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	for (var j=0; j<max; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (this.N[0]*r)+(this.N[1]*g)+(this.N[2]*b);
		c[j+1] = (this.N[3]*r)+(this.N[4]*g)+(this.N[5]*b);
		c[j+2] = (this.N[6]*r)+(this.N[7]*g)+(this.N[8]*b);
	}
};
// Log Gamma calculation objects
function CSSL3() {
}
CSSL3.prototype.f = function(i) {
	i *= 0.9;
	if (i >= 0.01125) {
		return (420.0 + (Math.log((i + 0.01) / 0.19)*261.5/Math.log(10))) / 1023.0;
	} else {
		return ((i * 76.2102946929 / 0.01125) + 95.0) / 1023.0;
	}
};
CSSL3.prototype.r = function(i) {
	if (i >= 171.2102946929 / 1023.0) {
		return (((Math.pow(10,((i*1023)-420)/261.5)*(0.18 +0.01))-0.01))/0.9;
	} else {
		return (((((i*1023)-95.0)*0.01125)/(171.2102946929 - 95.0)))/0.9;
	}
};
function CSLogC(iso) {
	this.nomEI = 400;
	this.blackSig = 0.003907;
	this.blackOff = 0;
	this.midGray = 0.01;
	this.encGain = 0.256598;
	this.encOff = 0.391007;
	this.iso = iso;
	var gain,encGain,encOffset,nz;
	var slope, offset, gray, s, t;
	this.cut = 1/9;
	slope = 1 / (this.cut*Math.LN10);
	offset = (Math.log(this.cut)/Math.LN10) - slope * this.cut;
	gain = iso / this.nomEI;
	gray = this.midGray / gain;
	encGain = (Math.log(iso/this.nomEI)/Math.log(2) * (0.89 - 1) / 3 + 1) * this.encGain;
	encOffset = this.encOff;
	for (var j=0; j<3; j++) {
		nz = ((95.0 / 1023.0 - encOffset) / encGain - offset) / slope;
		encOffset = this.encOff - (Math.log(1 + nz)/Math.LN10) * encGain
	}
	this.a = 1/gray;
	this.b = nz - this.blackSig / gray;
	this.e = slope * this.a * encGain;
	this.ff = encGain * (slope*this.b + offset) + encOffset;
	s = 4 / (0.18*iso);
	t = this.blackSig;
	this.b = this.b + this.a * t;
	this.a = this.a * s;
	this.ff = this.ff + this.e * t;
	this.e = this.e * s;
	this.c = encGain;
	this.d = encOffset;
	this.cut = (this.cut - this.b) / this.a;
	this.ecf = (this.e * this.cut) + this.ff;
}
CSLogC.prototype.f = function(i) {
	i *= 0.9;
	if (i > this.cut) {
		return (this.c*Math.log((this.a*i)+this.b)/Math.LN10) + this.d;
	} else {
		return (this.e*i)+this.ff;
	}
};
CSLogC.prototype.r = function(i) {
	if (i > this.ecf) {
		return (Math.pow(10, (i - this.d) / this.c) - this.b) / (this.a*0.9);
	} else {
		return (i - this.ff) / (this.e*0.9);
	}
};
function CSVLog() {
}
CSVLog.prototype.f = function(i) {
	i *= 0.9;
	if (i < 0.01) {
		return (5.6*i)+0.125;
	} else {
		return (0.241514*Math.log(i+0.00873)/Math.log(10))+0.598206
	}
};
CSVLog.prototype.r = function(i) {
	if (i < 0.181) {
		return ((i-0.125)/5.6)/0.9;
	} else {
		return (Math.pow(10,((i-0.598206)/0.241514))-0.00873)/0.9;
	}
};
// Colour space calculation objects
function CSMatrix(name,params,wp) {
	this.name = name;
	this.m = params;
	this.wp = wp;
}
CSMatrix.prototype.getWP = function() {
	return new Float64Array(this.wp.slice(0));
};
CSMatrix.prototype.isMatrix = function() {
	return true;
};
CSMatrix.prototype.cb = function() {
	return false;
};
CSMatrix.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	for (var j=0; j<max; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (this.m[0]*r)+(this.m[1]*g)+(this.m[2]*b);
		c[j+1] = (this.m[3]*r)+(this.m[4]*g)+(this.m[5]*b);
		c[j+2] = (this.m[6]*r)+(this.m[7]*g)+(this.m[8]*b);
	}
};
CSMatrix.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	for (var j=0; j<max; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (this.m[0]*r)+(this.m[1]*g)+(this.m[2]*b);
		c[j+1] = (this.m[3]*r)+(this.m[4]*g)+(this.m[5]*b);
		c[j+2] = (this.m[6]*r)+(this.m[7]*g)+(this.m[8]*b);
	}
};
function CSToneCurve(name,params) {
	this.name = name;
	this.o = params.isOut;
	if (params.isOut) {
		this.m1 = params.linMatrix;
		this.m2 = params.tcMatrix;
	} else {
		this.m1 = this.mInverse(params.linMatrix);
		this.m2 = this.mInverse(params.tcMatrix);
	}
	this.l = params.logBase;
	this.tc = params.tc;
	this.wp = params.wp;
	this.sb = true;
	this.sb = params.sb;
	this.cB = false;
	this.cB = params.cb;
}
CSToneCurve.prototype.mInverse = function(m) {
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
CSToneCurve.prototype.getWP = function() {
	return new Float64Array(this.wp.slice(0));
};
CSToneCurve.prototype.isMatrix = function() {
	return false;
};
CSToneCurve.prototype.cb = function() {
	return this.cB;
};
CSToneCurve.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	var sb = this.sb;
	if (this.o) {
		for (var j=0; j<max; j+= 3) {
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (this.m1[0]*r)+(this.m1[1]*g)+(this.m1[2]*b);
			c[j+1] = (this.m1[3]*r)+(this.m1[4]*g)+(this.m1[5]*b);
			c[j+2] = (this.m1[6]*r)+(this.m1[7]*g)+(this.m1[8]*b);
			c[ j ] = this.tc.f(this.l.f(c[ j ]));
			c[j+1] = this.tc.f(this.l.f(c[j+1]));
			c[j+2] = this.tc.f(this.l.f(c[j+2]));
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (this.m2[0]*r)+(this.m2[1]*g)+(this.m2[2]*b);
			c[j+1] = (this.m2[3]*r)+(this.m2[4]*g)+(this.m2[5]*b);
			c[j+2] = (this.m2[6]*r)+(this.m2[7]*g)+(this.m2[8]*b);
			c[ j ] = this.l.r(this.tc.r(c[ j ]));
			c[j+1] = this.l.r(this.tc.r(c[j+1]));
			c[j+2] = this.l.r(this.tc.r(c[j+2]));
			if (!sb) {
				c[ j ] = Math.max(0,c[ j ]);
				c[j+1] = Math.max(0,c[j+1]);
				c[j+2] = Math.max(0,c[j+2]);
			}
		}
	} else {
		for (var j=0; j<max; j+= 3) {
			r = this.tc.f(this.l.f(c[ j ]));
			g = this.tc.f(this.l.f(c[j+1]));
			b = this.tc.f(this.l.f(c[j+2]));
			c[ j ] = (this.m2[0]*r)+(this.m2[1]*g)+(this.m2[2]*b);
			c[j+1] = (this.m2[3]*r)+(this.m2[4]*g)+(this.m2[5]*b);
			c[j+2] = (this.m2[6]*r)+(this.m2[7]*g)+(this.m2[8]*b);
			r = this.l.r(this.tc.r(c[ j ]));
			g = this.l.r(this.tc.r(c[j+1]));
			b = this.l.r(this.tc.r(c[j+2]));
			c[ j ] = (this.m1[0]*r)+(this.m1[1]*g)+(this.m1[2]*b);
			c[j+1] = (this.m1[3]*r)+(this.m1[4]*g)+(this.m1[5]*b);
			c[j+2] = (this.m1[6]*r)+(this.m1[7]*g)+(this.m1[8]*b);
		}
	}
};
CSToneCurve.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	var sb = this.sb;
	if (this.o) {
		for (var j=0; j<max; j+= 3) {
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (this.m1[0]*r)+(this.m1[1]*g)+(this.m1[2]*b);
			c[j+1] = (this.m1[3]*r)+(this.m1[4]*g)+(this.m1[5]*b);
			c[j+2] = (this.m1[6]*r)+(this.m1[7]*g)+(this.m1[8]*b);
			c[ j ] = this.tc.f(this.l.f(c[ j ]));
			c[j+1] = this.tc.f(this.l.f(c[j+1]));
			c[j+2] = this.tc.f(this.l.f(c[j+2]));
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (this.m2[0]*r)+(this.m2[1]*g)+(this.m2[2]*b);
			c[j+1] = (this.m2[3]*r)+(this.m2[4]*g)+(this.m2[5]*b);
			c[j+2] = (this.m2[6]*r)+(this.m2[7]*g)+(this.m2[8]*b);
			c[ j ] = this.l.r(this.tc.r(c[ j ]));
			c[j+1] = this.l.r(this.tc.r(c[j+1]));
			c[j+2] = this.l.r(this.tc.r(c[j+2]));
			if (!sb) {
				c[ j ] = Math.max(0,c[ j ]);
				c[j+1] = Math.max(0,c[j+1]);
				c[j+2] = Math.max(0,c[j+2]);
			}
		}
	} else {
		for (var j=0; j<max; j+= 3) {
			r = this.tc.f(this.l.f(c[ j ]));
			g = this.tc.f(this.l.f(c[j+1]));
			b = this.tc.f(this.l.f(c[j+2]));
			c[ j ] = (this.m2[0]*r)+(this.m2[1]*g)+(this.m2[2]*b);
			c[j+1] = (this.m2[3]*r)+(this.m2[4]*g)+(this.m2[5]*b);
			c[j+2] = (this.m2[6]*r)+(this.m2[7]*g)+(this.m2[8]*b);
			r = this.l.r(this.tc.r(c[ j ]));
			g = this.l.r(this.tc.r(c[j+1]));
			b = this.l.r(this.tc.r(c[j+2]));
			c[ j ] = (this.m1[0]*r)+(this.m1[1]*g)+(this.m1[2]*b);
			c[j+1] = (this.m1[3]*r)+(this.m1[4]*g)+(this.m1[5]*b);
			c[j+2] = (this.m1[6]*r)+(this.m1[7]*g)+(this.m1[8]*b);
		}
	}
};
function CSToneCurvePlus(name,params) {
	this.name = name;
	this.o = params.isOut;
	if (params.isOut) {
		this.m1 = params.linMatrix;
		this.m2 = params.tcMatrix;
	} else {
		this.m1 = this.mInverse(params.linMatrix);
		this.m2 = this.mInverse(params.tcMatrix);
	}
	this.l = params.logBase;
	this.tc = params.tc;
	this.wp = params.wp;
	this.lY = params.linY;
	this.lC = params.linClamp;
	this.tcY = params.tcY;
	this.tcC = params.tcClamp;
	this.sb = true;
	this.sb = params.sb;
	this.cB = false;
	this.cB = params.cb;
}
CSToneCurvePlus.prototype.mInverse = function(m) {
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
CSToneCurvePlus.prototype.getWP = function() {
	return new Float64Array(this.wp.slice(0));
};
CSToneCurvePlus.prototype.isMatrix = function() {
	return false;
};
CSToneCurvePlus.prototype.cb = function() {
	return this.cB;
};
CSToneCurvePlus.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	var Y, pB, pR;
	var lC = this.lC;
	var lY = this.lY;
	var	dB = 2*(1-lY[2]);
	var dR = 2*(1-lY[0]);
	var tcC = this.tcC;
	var tcY = this.tcY;
	var	tcB = 2*(1-lY[2]);
	var tcR = 2*(1-lY[0]);
	if (this.o) {
		for (var j=0; j<max; j+= 3) {
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (this.m1[0]*r)+(this.m1[1]*g)+(this.m1[2]*b);
			c[j+1] = (this.m1[3]*r)+(this.m1[4]*g)+(this.m1[5]*b);
			c[j+2] = (this.m1[6]*r)+(this.m1[7]*g)+(this.m1[8]*b);
			if (lC) {
				Y = (lY[0]*c[j])+(lY[1]*c[j+1])+(lY[2]*c[j+2]);
				pB = (c[j+2]-Y)/dB;
				pR = (c[ j ]-Y)/dR;
				if (pB >0.5) {
					pB = 0.5;
				} else if (pB < -0.5) {
					pB = -0.5;
				}
				if (pR >0.5) {
					pR = 0.5;
				} else if (pR < -0.5) {
					pR = -0.5;
				}
				c[ j ] = (pR * dR) + Y;
				c[j+2] = (pB * dB) + Y;
				c[j+1] = (Y - (lY[0]*c[ j ]) - (lY[2]*c[j+2]))/lY[1];
			}
			c[ j ] = this.tc.f(this.l.f(c[ j ]));
			c[j+1] = this.tc.f(this.l.f(c[j+1]));
			c[j+2] = this.tc.f(this.l.f(c[j+2]));
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (this.m2[0]*r)+(this.m2[1]*g)+(this.m2[2]*b);
			c[j+1] = (this.m2[3]*r)+(this.m2[4]*g)+(this.m2[5]*b);
			c[j+2] = (this.m2[6]*r)+(this.m2[7]*g)+(this.m2[8]*b);
			if (tcC) {
				Y = (tcY[0]*c[j])+(tcY[1]*c[j+1])+(tcY[2]*c[j+2]);
				pB = (c[j+2]-Y)/tcB;
				pR = (c[ j ]-Y)/tcR;
				if (pB >0.5) {
					pB = 0.5;
				} else if (pB < -0.5) {
					pB = -0.5;
				}
				if (pR >0.5) {
					pR = 0.5;
				} else if (pR < -0.5) {
					pR = -0.5;
				}
				c[ j ] = (pR * tcR) + Y;
				c[j+2] = (pB * tcB) + Y;
				c[j+1] = (Y - (tcY[0]*c[ j ]) - (tcY[2]*c[j+2]))/tcY[1];
			}
			c[ j ] = this.l.r(this.tc.r(c[ j ]));
			c[j+1] = this.l.r(this.tc.r(c[j+1]));
			c[j+2] = this.l.r(this.tc.r(c[j+2]));
			if (!sb) {
				c[ j ] = Math.max(0,c[ j ]);
				c[j+1] = Math.max(0,c[j+1]);
				c[j+2] = Math.max(0,c[j+2]);
			}
		}
	} else {
		for (var j=0; j<max; j+= 3) {
			r = this.tc.f(this.l.f(c[ j ]));
			g = this.tc.f(this.l.f(c[j+1]));
			b = this.tc.f(this.l.f(c[j+2]));
			c[ j ] = (this.m2[0]*r)+(this.m2[1]*g)+(this.m2[2]*b);
			c[j+1] = (this.m2[3]*r)+(this.m2[4]*g)+(this.m2[5]*b);
			c[j+2] = (this.m2[6]*r)+(this.m2[7]*g)+(this.m2[8]*b);
			r = this.l.r(this.tc.r(c[ j ]));
			g = this.l.r(this.tc.r(c[j+1]));
			b = this.l.r(this.tc.r(c[j+2]));
			c[ j ] = (this.m1[0]*r)+(this.m1[1]*g)+(this.m1[2]*b);
			c[j+1] = (this.m1[3]*r)+(this.m1[4]*g)+(this.m1[5]*b);
			c[j+2] = (this.m1[6]*r)+(this.m1[7]*g)+(this.m1[8]*b);
		}
	}
};
CSToneCurvePlus.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var max = c.length;
	var r,g,b;
	var Y, pB, pR;
	var lC = this.lC;
	var lY = this.lY;
	var	dB = 2*(1-lY[2]);
	var dR = 2*(1-lY[0]);
	var tcC = this.tcC;
	var tcY = this.tcY;
	var	tcB = 2*(1-lY[2]);
	var tcR = 2*(1-lY[0]);
	if (this.o) {
		for (var j=0; j<max; j+= 3) {
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (this.m1[0]*r)+(this.m1[1]*g)+(this.m1[2]*b);
			c[j+1] = (this.m1[3]*r)+(this.m1[4]*g)+(this.m1[5]*b);
			c[j+2] = (this.m1[6]*r)+(this.m1[7]*g)+(this.m1[8]*b);
			if (this.lC) {
				Y = (lY[0]*c[j])+(lY[1]*c[j+1])+(lY[2]*c[j+2]);
				pB = (c[j+2]-Y)/dB;
				pR = (c[ j ]-Y)/dR;
				if (pB >0.5) {
					pB = 0.5;
				} else if (pB < -0.5) {
					pB = -0.5;
				}
				if (pR >0.5) {
					pR = 0.5;
				} else if (pR < -0.5) {
					pR = -0.5;
				}
				c[ j ] = (pR * dR) + Y;
				c[j+2] = (pB * dB) + Y;
				c[j+1] = (Y - (lY[0]*c[ j ]) -(lY[2]*c[j+2]))/lY[1];
			}
			c[ j ] = this.tc.f(this.l.f(c[ j ]));
			c[j+1] = this.tc.f(this.l.f(c[j+1]));
			c[j+2] = this.tc.f(this.l.f(c[j+2]));
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (this.m2[0]*r)+(this.m2[1]*g)+(this.m2[2]*b);
			c[j+1] = (this.m2[3]*r)+(this.m2[4]*g)+(this.m2[5]*b);
			c[j+2] = (this.m2[6]*r)+(this.m2[7]*g)+(this.m2[8]*b);
			if (tcC) {
				Y = (tcY[0]*c[j])+(tcY[1]*c[j+1])+(tcY[2]*c[j+2]);
				pB = (c[j+2]-Y)/tcB;
				pR = (c[ j ]-Y)/tcR;
				if (pB >0.5) {
					pB = 0.5;
				} else if (pB < -0.5) {
					pB = -0.5;
				}
				if (pR >0.5) {
					pR = 0.5;
				} else if (pR < -0.5) {
					pR = -0.5;
				}
				c[ j ] = (pR * tcR) + Y;
				c[j+2] = (pB * tcB) + Y;
				c[j+1] = (Y - (tcY[0]*c[ j ]) - (tcY[2]*c[j+2]))/tcY[1];
			}
			c[ j ] = this.l.r(this.tc.r(c[ j ]));
			c[j+1] = this.l.r(this.tc.r(c[j+1]));
			c[j+2] = this.l.r(this.tc.r(c[j+2]));
			if (!sb) {
				c[ j ] = Math.max(0,c[ j ]);
				c[j+1] = Math.max(0,c[j+1]);
				c[j+2] = Math.max(0,c[j+2]);
			}
		}
	} else {
		for (var j=0; j<max; j+= 3) {
			r = this.tc.f(this.l.f(c[ j ]));
			g = this.tc.f(this.l.f(c[j+1]));
			b = this.tc.f(this.l.f(c[j+2]));
			c[ j ] = (this.m2[0]*r)+(this.m2[1]*g)+(this.m2[2]*b);
			c[j+1] = (this.m2[3]*r)+(this.m2[4]*g)+(this.m2[5]*b);
			c[j+2] = (this.m2[6]*r)+(this.m2[7]*g)+(this.m2[8]*b);
			r = this.l.r(this.tc.r(c[ j ]));
			g = this.l.r(this.tc.r(c[j+1]));
			b = this.l.r(this.tc.r(c[j+2]));
			c[ j ] = (this.m1[0]*r)+(this.m1[1]*g)+(this.m1[2]*b);
			c[j+1] = (this.m1[3]*r)+(this.m1[4]*g)+(this.m1[5]*b);
			c[j+2] = (this.m1[6]*r)+(this.m1[7]*g)+(this.m1[8]*b);
		}
	}
};
function CSLUT(name,params) {
	this.name = name;
	this.wp = params.wp.buffer;
	this.lut = new LUTs();
	var xhr = new XMLHttpRequest();
	xhr.open('GET', params.filename, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = (function(lut) {
//		var lut = lut;
		return function(e) {
			var lutBuf = this.response;
  			if (!lut.le) { // files are little endian, swap if system is big endian
self.postMessage({msg:true,details:'Gamut LUTs: Big Endian System'});
  				var lutArr = new Uint8Array(lutBuf);
  				var max = Math.round(lutArr.length / 4); // Float32s === 4 bytes
  				var i,b0,b1,b2,b3;
  				for (var j=0; j<max; j++) {
  					i = j*4;
  					b0=lutArr[ i ];
  					b1=lutArr[i+1];
  					b2=lutArr[i+2];
  					b3=lutArr[i+3];
  					lutArr[ i ] = b3;
  					lutArr[i+1] = b2;
  					lutArr[i+2] = b1;
  					lutArr[i+3] = b0;
  				}
  			}
  			var in32 = new Int32Array(lutBuf);
  			var tfS = in32[0];
	  		var dim = in32[1];
 			var csS = dim*dim*dim;
// Internal processing is Float64, files are scaled Int32
 			var C = [	new Float64Array(csS),
 						new Float64Array(csS),
 						new Float64Array(csS) ];
 			for (var j=0; j<csS; j++){
 				C[0][j] = parseFloat(in32[((2+tfS)) + j])/1073741824;
 				C[1][j] = parseFloat(in32[((2+tfS+csS)) + j])/1073741824;
 				C[2][j] = parseFloat(in32[((2+tfS+(2*csS))) + j])/1073741824;
 			}
  			lut.lut.setDetails({
				title: lut.name,
				format: lut.format,
				dims: 3,
				s: dim,
				min: lut.min,
				max: lut.max,
				C: [	C[0].buffer,
 						C[1].buffer,
 						C[2].buffer ]
			});
		};
	})({
		name: name,
		lut: this.lut,
		format: params.format,
		min: params.min,
		max: params.max,
		le: params.le
	});
	xhr.send();
}
CSLUT.prototype.getWP = function() {
	return new Float64Array(this.wp.slice(0));
};
CSLUT.prototype.isMatrix = function() {
	return false;
};
CSLUT.prototype.cb = function() {
	return false;
};
CSLUT.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.0125) {
			c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			c[j] = (c[j] + 0.0155818840)/0.1677922920;
		}
	}
	this.lut.rRsCub(buff);
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.1673609920) {
			c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			c[j] = (0.1677922920 * c[j]) - 0.0155818840;
		}
	}
};
CSLUT.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.0125) {
			c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			c[j] = (c[j] + 0.0155818840)/0.1677922920;
		}
	}
	this.lut.rRsLin(buff);
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.1673609920) {
			c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			c[j] = (0.1677922920 * c[j]) - 0.0155818840;
		}
	}
};
function CSLA(name,wp) {
	this.name = name;
	this.wp = wp.buffer;
}
CSLA.prototype.getWP = function() {
	return new Float64Array(this.wp.slice(0));
};
CSLA.prototype.setLUT = function(lut) {
	this.lut = new LUTs();
	this.lut.setDetails(lut);
};
CSLA.prototype.setTitle = function(name) {
	this.name = name;
};
CSLA.prototype.isMatrix = function() {
	return false;
};
CSLA.prototype.cb = function() {
	return false;
};
CSLA.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.0125) {
			c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			c[j] = (c[j] + 0.0155818840)/0.1677922920;
		}
	}
	this.lut.rRsCub(buff);
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.1673609920) {
			c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			c[j] = (0.1677922920 * c[j]) - 0.0155818840;
		}
	}
};
CSLA.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.0125) {
			c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
		} else {
			c[j] = (c[j] + 0.0155818840)/0.1677922920;
		}
	}
	this.lut.rRsLin(buff);
	for (var j=0; j<m; j++) {
		if (c[j] >= 0.1673609920) {
			c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
		} else {
			c[j] = (0.1677922920 * c[j]) - 0.0155818840;
		}
	}
};
function CSCanonIDT(name, day, toSys, wp) {
	this.name = name;
	this.day = day;
	this.toSys = toSys;
	this.wp = wp;
	this.setParams();
}
CSCanonIDT.prototype.getWP = function() {
	return new Float64Array(this.wp.slice(0));
};
CSCanonIDT.prototype.setParams = function() {
	if (this.day) {
		this.cR = new Float64Array([
					 1.08190037262167000,-0.1802987013687820, 0.09839832874710690,
					 1.94585453645180000,-0.5095399369373750,-0.47489567735516000,
					-0.77808675219706800,-0.7412266070049000, 0.55789443704270100,
					-3.27787395719078000, 0.2548784176387170, 3.45581530576474000,
					 0.33547171397473900,-0.4335212547847600,-1.65050137344141000, 1.46581418175682,
					 0.94464656660567600,-0.7236530991558810,-0.37107650116785700]);
		this.cG = new Float64Array([
					-0.00858997792576314, 1.0067374011962100, 0.00185257672955608,
					 0.08487361382964520, 0.3476269064489020, 0.00202302744639390,
					-0.07905084140915240,-0.1794975829587160,-0.17597512335707200,
					 2.30205579706951000,-0.6272576133852190,-2.90795250918851000,
					 1.37002437502321000,-0.1086681585655630,-2.21150552827555000, 1.53315057595445,
					-0.54318870669950500, 1.6379303849037600,-0.44458861683658700]);
		this.cB = new Float64Array([
					 0.12696639806511000,-0.0118914411278690, 0.88492504306275900,
					 1.34780279822258000, 1.0364735225736500, 0.45911328995592200,
					-0.87815742229526800,-1.3066278750436000,-0.65860431341328300,
					-1.44440779967030000, 0.5566765887851730, 2.18798497054968000,
					-1.43030768398665000,-0.0388323570817641, 2.63698573112453000,-1.66598882056039,
					 0.33450249360103000,-1.6585693073090100, 0.52195618454768500]);
		this.sys = this.mMult(this.toSys,new Float64Array([
			0.561538969,0.402060105,0.036400926,
			0.092739623,0.924121198,-0.016860821,
			0.084812961,0.006373835,0.908813204					
		]));
	} else {
		this.cR = new Float64Array([
					 0.9638030044548990,-0.1607222025706550, 0.19691919811575600,
					 2.0344468563981900,-0.4426769314510210,-0.40798378153750900,
					-0.6407033231292540,-0.8602427982478480, 0.31715997796744600,
					-4.8056708010296600, 0.2711837039756700, 5.10690050495570000,
					 0.3408958169205850,-0.4869417385078620,-2.23737935753692000, 1.96647555251297,
					 1.3020405176624300,-1.0650311762855400,-0.39247302266737800]);
		this.cG = new Float64Array([
					-0.0421935892309314, 1.0484595917518300,-0.00626600252090315,
					-0.1064388968872160, 0.3629086214707810, 0.11807070047226100,
					 0.0193542539838734,-0.1560830295432670,-0.23781164949643300,
					 1.6791642058219800,-0.6328353271678970,-1.95984471387461000,
					 0.9532214645628140, 0.0599085176294623,-1.66452046236246000, 1.14041188349761,
					-0.3875526235503080, 1.1482009968551200,-0.33615394141170900]);
		this.cB = new Float64Array([
					 0.1702950331350280,-0.0682984448537245, 0.89800341171869700,
					 1.2210682199239900, 1.6019486592292500, 0.37759919113712400,
					-0.8257814284875310,-1.4459086807674900,-0.92892596103534400,
					-0.8385489974558520, 0.7580939721711600, 1.32966795243196000,
					-1.2002190566835500,-0.2548389958451290, 2.33232411639308000,-1.86381505762773,
					 0.1115760389564230,-1.1259331584976600, 0.75169318615728700]);
		this.sys = this.mMult(this.toSys,new Float64Array([
			0.566996399,0.365079418,0.067924183,
			0.070901044,0.880331008,0.048767948,
			0.073013542,-0.066540862,0.99352732
		]));
	}
};
CSCanonIDT.prototype.mMult = function(m1,m2) {
	var out = new Float64Array(9);
	out[0] = (m1[0]*m2[0]) + (m1[1]*m2[3]) + (m1[2]*m2[6]);
	out[1] = (m1[0]*m2[1]) + (m1[1]*m2[4]) + (m1[2]*m2[7]);
	out[2] = (m1[0]*m2[2]) + (m1[1]*m2[5]) + (m1[2]*m2[8]);
	out[3] = (m1[3]*m2[0]) + (m1[4]*m2[3]) + (m1[5]*m2[6]);
	out[4] = (m1[3]*m2[1]) + (m1[4]*m2[4]) + (m1[5]*m2[7]);
	out[5] = (m1[3]*m2[2]) + (m1[4]*m2[5]) + (m1[5]*m2[8]);
	out[6] = (m1[6]*m2[0]) + (m1[7]*m2[3]) + (m1[8]*m2[6]);
	out[7] = (m1[6]*m2[1]) + (m1[7]*m2[4]) + (m1[8]*m2[7]);
	out[8] = (m1[6]*m2[2]) + (m1[7]*m2[5]) + (m1[8]*m2[8]);
	return out;
};
CSCanonIDT.prototype.isMatrix = function() {
	return false;
};
CSCanonIDT.prototype.cb = function() {
	return false;
};
CSCanonIDT.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var R2, G2, B2;
	var off;
	var lin = new Float64Array(3);
	for (var j=0; j<m; j++) {
// Linear to C-Log ire
		off = (10.1596*c[j])+1;
		if (off <= 0 ) {
			off = 0.00000000001;
		}
		c[j] = (0.529136*Math.log(off)/Math.LN10) + 0.0730597;
	}
	for (var j=0; j<m; j += 3) {
		R2 = c[ j ]*c[ j ];
		G2 = c[j+1]*c[j+1];
		B2 = c[j+2]*c[j+2];
		var vec = new Float64Array([
			c[ j ],					c[j+1],			c[j+2],
			c[ j ]*c[j+1],			c[j+1]*c[j+2],	c[j+2]*c[ j ],
			R2,						G2,				B2,
			R2*c[j+1],				R2*c[j+2],		c[ j ]*G2,
			c[ j ]*c[j+1]*c[j+2],	c[ j ]*B2,		G2*c[j+2],		c[j+1]*B2,
			c[ j ]*R2,				c[j+1]*G2,		c[j+2]*B2
		]);
// ACES conversion stage 1 (C-Log space)
		c[ j ] =	(this.cR[0]  * vec[0] ) + (this.cR[1]  * vec[1] ) + (this.cR[2]  * vec[2] ) +
			  		(this.cR[3]  * vec[3] ) + (this.cR[4]  * vec[4] ) + (this.cR[5]  * vec[5] ) +
			  		(this.cR[6]  * vec[6] ) + (this.cR[7]  * vec[7] ) + (this.cR[8]  * vec[8] ) +
			  		(this.cR[9]  * vec[9] ) + (this.cR[10] * vec[10]) + (this.cR[11] * vec[11]) +
			  		(this.cR[12] * vec[12]) + (this.cR[13] * vec[13]) + (this.cR[14] * vec[14]) + (this.cR[15] * vec[15]) +
			  		(this.cR[16] * vec[16]) + (this.cR[17] * vec[17]) + (this.cR[18] * vec[18]);
		c[j+1] =	(this.cG[0]  * vec[0] ) + (this.cG[1]  * vec[1] ) + (this.cG[2]  * vec[2] ) +
			  		(this.cG[3]  * vec[3] ) + (this.cG[4]  * vec[4] ) + (this.cG[5]  * vec[5] ) +
			  		(this.cG[6]  * vec[6] ) + (this.cG[7]  * vec[7] ) + (this.cG[8]  * vec[8] ) +
			  		(this.cG[9]  * vec[9] ) + (this.cG[10] * vec[10]) + (this.cG[11] * vec[11]) +
			  		(this.cG[12] * vec[12]) + (this.cG[13] * vec[13]) + (this.cG[14] * vec[14]) + (this.cG[15] * vec[15]) +
			  		(this.cG[16] * vec[16]) + (this.cG[17] * vec[17]) + (this.cG[18] * vec[18]);
		c[j+2] =	(this.cB[0]  * vec[0] ) + (this.cB[1]  * vec[1] ) + (this.cB[2]  * vec[2] ) +
			  		(this.cB[3]  * vec[3] ) + (this.cB[4]  * vec[4] ) + (this.cB[5]  * vec[5] ) +
			  		(this.cB[6]  * vec[6] ) + (this.cB[7]  * vec[7] ) + (this.cB[8]  * vec[8] ) +
			  		(this.cB[9]  * vec[9] ) + (this.cB[10] * vec[10]) + (this.cB[11] * vec[11]) +
			  		(this.cB[12] * vec[12]) + (this.cB[13] * vec[13]) + (this.cB[14] * vec[14]) + (this.cB[15] * vec[15]) +
			  		(this.cB[16] * vec[16]) + (this.cB[17] * vec[17]) + (this.cB[18] * vec[18]);
// C-Log back to linear
		lin[0] = (Math.pow(10,(c[ j ]-0.0730597)/0.529136)-1)/10.1596;
		lin[1] = (Math.pow(10,(c[j+1]-0.0730597)/0.529136)-1)/10.1596;
		lin[2] = (Math.pow(10,(c[j+2]-0.0730597)/0.529136)-1)/10.1596;
// CP -> ACES stage 2 -> system (Canon's IDT sets clip to max for Uint16 - ACES is actually half float and sets max to 65504)
		c[ j ] = Math.min(65504,(this.sys[0] * lin[0]) + (this.sys[1] * lin[1]) + (this.sys[2] * lin[2]));
		c[j+1] = Math.min(65504,(this.sys[3] * lin[0]) + (this.sys[4] * lin[1]) + (this.sys[5] * lin[2]));
		c[j+2] = Math.min(65504,(this.sys[6] * lin[0]) + (this.sys[7] * lin[1]) + (this.sys[8] * lin[2]));
	}
};
CSCanonIDT.prototype.lf = function(buff) {
	this.lc(buff);
};
// IO functions
LUTColourSpace.prototype.setParams = function(params) {
	var out = {	t: 20, v: this.ver };
	if (typeof params.v !== 'number') {
		out.err = true;
		out.details = 'Missing version no.';
		return out;
	}
	out.to = [];
	if (typeof params.inGamut === 'number') {
		this.curIn = params.inGamut;
		out.inGamut = this.curIn;
	}
	if (typeof params.outGamut === 'number') {
		this.curOut = params.outGamut;
		out.outGamut = this.curOut;
	}
	if (typeof params.tweaks === 'boolean') {
		this.tweaks = params.tweaks;
	} else {
		this.tweaks = false;
	}
	out.twkCS = this.setCS(params);
	out.twkWB = this.setWB(params);
	out.twkASCCDL = this.setASCCDL(params);
	out.twkPSSTCDL = this.setPSSTCDL(params);
	out.twkHG = this.setHG(params);
	out.twkMulti = this.setMulti(params);
	out.twkFC = this.setFC(params);
	if (typeof params.isTrans === 'boolean') {
		this.isTrans = params.isTrans;
	}
	this.ver = params.v;
	out.v = this.ver;
	return out;
};
LUTColourSpace.prototype.calc = function(p,t,i,g) {
	var buff = i.o;
	var o = new Float64Array(buff);
	var out = { p: p, t: t+20, v: this.ver, outGamut: this.curOut, o:buff,  cb: this.csOut[this.curOut].cb()};
	out.to = ['o'];
	if (g) {
		out.R = i.R;
		out.G = i.G;
		out.B = i.B;
		out.vals = i.vals;
		out.dim = i.dim;
	} else {
		out.leg = i.leg;
		out.line =  i.line;
		out.upd = i.upd;
		out.threeD = true;
	}
	if (!this.nul) {
		if (g) {
			this.csIn[this.curIn].lc(buff);
		}
		var y = this.y;
		var max = o.length;
		var eiMult = i.eiMult;
		var Y;
// CineEI / Exposure Shift
		for (var j=0; j<max; j++) {
			if (isNaN(o[j])) {
				o[j] = 0;
			} else {
				o[j] *= eiMult;
			}
		}
// False Colour
		if (this.doFC) {
			var fc = new Uint8Array(max);
			out.fc = fc.buffer;
			out.to.push('fc');
			var k;
			for (var j=0; j<max; j += 3) {
				k = parseInt(j/3);
				Y = (y[0]*o[j])+(y[1]*o[j+1])+(y[2]*o[j+2]);
				for (var s=0; s<10; s++) {
					if (this.fcVals[s] !==-10 && Y <= this.fcVals[s]) {
						fc[k] = s;
						break;
					}
				}
				if (fc[k] === 0 && this.doFCRed && Y > this.fcVals[9]) {
					fc[k] = 10;
				} else if ((fc[k] === 0  && Y > this.fcVals[0]) || (fc[k] === 0 && !this.doFCPurple && Y < 0.1) || (fc[k] === 9 && !this.doFCYellow)) {
					fc[k] = 8;
				}
			}
		}
		out.doFC = this.doFC;
// Colour Temperature Shift
		if (this.doWB) {
			this.wb.lc(buff);
		}
// PSST-CDL
		if (this.doPSSTCDL) {
			var Pb,Pr;
			var m,h,f,y1,y2,m1,m2,col,sat,S,O,P,M,a;
			var Db = 2*(1-y[2]);
			var Dr = 2*(1-y[0]);
			for (var j=0; j<max; j += 3) {
				Y = (y[0]*o[j])+(y[1]*o[j+1])+(y[2]*o[j+2]);
				Pb = (o[j+2]-Y)/Db;
				Pr = (o[ j ]-Y)/Dr;
				m = Math.pow((Pb*Pb)+(Pr*Pr),0.5);
				h = Math.atan2(Pr,Pb)/(2*Math.PI); // converts coordinates to angle from x-axis. 0-deg = 0, 360-deg = 1
				if (h < 0) {
					h += 1;
				}
				f = this.psstF.lLCub(h);
				y1 = this.psstY.lLLin(f);
				m1 = this.psstM.lLLin(f);
				col = this.psstC.lLCub(f);
				sat = this.psstSat.lLCub(f);
				if (sat < 0) {
					sat = 0;
				}
				S = this.psstS.lLCub(f);
				if (S < 0) {
					S = 0;
				}
				O = this.psstO.lLCub(f);
				P = this.psstP.lLCub(f);
				if (P < 0) {
					P = 0;
				}
				f = (f+col)%1;
				if (this.psstYC) {
					y2 = this.psstY.lLLin(f);
				} else {
					y2 = y1;
				}
				if (this.psstMC) {
					m2 = this.psstM.lLLin(f);
				} else {
					m2 = m1;
				}
				M = m*sat*m2/m1;
				a = this.psstB.lLCub(f);
				if (m > 0.005) {
					Y = (Y*S/y1)+O;
					Y = ((Y<0)?Y:Math.pow(Y,P));
					Y = (isNaN(Y)?0:Y);
					Y *= y2;
					Pb = M * Math.cos(a);
					Pr = M * Math.sin(a);
				} else {
					var Y2 = (Y*S/y1)+O;
					Y2 = ((Y2<0)?Y2:Math.pow(Y2,P));
					Y2 = (isNaN(Y2)?0:Y2);
					Y2 *= y2;
					Y =  (((0.005-m) * Y) + (m * Y2))/0.005;
					Pb = (((0.005-m) * Pb) + (m * M * Math.cos(a)))/0.005;
					Pr = (((0.005-m) * Pr) + (m * M * Math.sin(a)))/0.005;
				}
				o[ j ] = (Pr * Dr) + Y;
				o[j+2] = (Pb * Db) + Y;
				o[j+1] = (Y - (y[0]*o[ j ]) -(y[2]*o[j+2]))/y[1];
			}
		}
// ASC-CDL
		if (this.doASCCDL) {
			for (var j=0; j<max; j += 3) {
				o[ j ] = (o[ j ]*this.asc[0])+this.asc[3];
				o[ j ] = ((o[ j ]<0)?o[ j ]:Math.pow(o[ j ],this.asc[6]));
				o[ j ] = (isNaN(o[ j ])?0:o[ j ]);
				o[j+1] = (o[j+1]*this.asc[1])+this.asc[4];
				o[j+1] = ((o[j+1]<0)?o[j+1]:Math.pow(o[j+1],this.asc[7]));
				o[j+1] = (isNaN(o[j+1])?0:o[j+1]);
				o[j+2] = (o[j+2]*this.asc[2])+this.asc[5];
				o[j+2] = ((o[j+2]<0)?o[j+2]:Math.pow(o[j+2],this.asc[8]));
				o[j+2] = (isNaN(o[j+2])?0:o[j+2]);
				Y = (y[0]*o[j])+(y[1]*o[j+1])+(y[2]*o[j+2]);
				o[ j ] = Y + (this.asc[9]*(o[ j ]-Y));
				o[j+1] = Y + (this.asc[9]*(o[j+1]-Y));
				o[j+2] = Y + (this.asc[9]*(o[j+2]-Y));
			}
		}
// MultiTone
		if (this.doMulti) {
			this.multiOut(o.buffer);
		}		
// Highlight Gamut
		if (this.doHG) {
			var h = new Float64Array(o.buffer.slice(0));
			if (g) {
				this.csOut[this.curOut].lc(buff);
				this.csOut[this.curHG].lc(h.buffer);
			} else {
				this.csOut[this.curOut].lf(buff);
				this.csOut[this.curHG].lf(h.buffer);
			}
			var r;
			for (var j=0; j<max; j += 3) {
				Y = (y[0]*o[j])+(y[1]*o[j+1])+(y[2]*o[j+2]);
				if (Y >= this.hgHigh) {
					o[ j ] = h[j];
					o[j+1] = h[j+1];
					o[j+2] = h[j+2];
				} else if (Y > this.hgLow) {
					if (this.hgLin) {
						r = (this.hgHigh - Y)/(this.hgHigh - this.hgLow);
					} else {
						r = (this.hgHighStop - (Math.log(Y * 5)/Math.LN2))/(this.hgHighStop - this.hgLowStop);
					}
					o[ j ] = (o[ j ] * (r)) + (h[ j ] * (1-r));
					o[j+1] = (o[j+1] * (r)) + (h[j+1] * (1-r));
					o[j+2] = (o[j+2] * (r)) + (h[j+2] * (1-r));
				}
			}
		} else {
			if (g) {
				this.csOut[this.curOut].lc(buff);
			} else {
				this.csOut[this.curOut].lf(buff);
			}
		}
	}
	return out;
};
LUTColourSpace.prototype.laCalc = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, dim: i.dim, gamma: i.gamma, gamut: i.gamut, legIn: i.legIn, o: i.o };
	this.csOut[i.gamut].lc(i.o);
	out.to = ['o'];
	return out;
};
LUTColourSpace.prototype.recalcMatrix = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, idx: i.idx, wcs: i.newWCS};
	var oMat = new Float64Array(i.matrix);
	var oToXYZ = this.g[i.oldWCS].toXYZ;
	var nFromXYZ = this.mInverse(this.g[i.newWCS].toXYZ);
	var oToN = this.mMult(nFromXYZ, this.calcCAT(i.cat,oToXYZ,this.g[i.oldWCS].white,this.g[i.newWCS].white));
	var matrix = this.mMult(oToN,oMat);
	out.matrix = matrix.buffer;
	out.to = ['matrix'];
	return out;
};
LUTColourSpace.prototype.getLists = function(p,t) {
	return {
		p: p,
		t: t+20,
		v: this.ver,
		inList: this.inList,
		outList: this.outList,
		laList: this.laList,
		matList: this.matList,
		subNames: this.subNames,
		inSub: this.csInSub,
		outSub: this.csOutSub,
		laSub: this.csLASub,
		CATList: this.CATs.getModels(),
		pass: this.pass,
		LA: this.LA
	};
};
LUTColourSpace.prototype.setLA = function(p,t,i) {
	this.csOut[this.LA].setLUT(i);
	return { p: p, t:t+20, v: this.ver, i: i.title };
};
LUTColourSpace.prototype.setLATitle = function(p,t,i) {
	this.csOut[this.LA].setTitle(i);
	return { p: p, t:t+20, v: this.ver, i: i };
};
LUTColourSpace.prototype.getColSqr = function(p,t,i) {
	var c = this.colSqr.slice(0);
	var f = new Float64Array(c);
	this.csOut[this.curOut].lc(c);
	var m = 256*256;
	var o = new Uint8Array(Math.round(4*m));
	var M;
	for (var j=0; j<m; j++) {
		M = 255 / Math.max.apply(Math, [f[ (j*3) ],f[(j*3)+1],f[(j*3)+2]]);
		if (M>255) {
			M = 255;
		}
		o[ (j*4) ] = Math.min(255,Math.max(0,f[ (j*3) ]*M));
		o[(j*4)+1] = Math.min(255,Math.max(0,f[(j*3)+1]*M));
		o[(j*4)+2] = Math.min(255,Math.max(0,f[(j*3)+2]*M));
		o[(j*4)+3] = 255;
	}
	return {p: p, t: t+20, v: this.ver, tIdx: i.tIdx, o: o.buffer, cb: this.csOut[this.curOut].cb(), to: ['o']};
};
LUTColourSpace.prototype.multiColours = function(p,t,i) {
	var c = this.mclrs.slice(0);
	this.multiOut(c);
	this.csOut[this.curOut].lc(c);
	var m = i.hues.length;
	var hf = new Float64Array(m*3);
	var f = new Float64Array(this.colSqr);
	var k;
	for (var j=0; j<m; j++) {
		k = (i.hues[j]+(256*(255-i.sats[j])))*3;
		hf[ (j*3) ] = f[ k ];
		hf[(j*3)+1] = f[k+1];
		hf[(j*3)+2] = f[k+2];
	}
	this.csOut[this.curOut].lc(hf.buffer);
	var hs = new Uint8Array(m*3);
	var M;
	for (var j=0; j<m; j++) {
		M = 255 / Math.max.apply(Math, [hf[ (j*3) ],hf[(j*3)+1],hf[(j*3)+2]]);
		if (M>255) {
			M = 255;
		}
		hs[ (j*3) ] = Math.min(255,Math.max(0,hf[ (j*3) ]*M));
		hs[(j*3)+1] = Math.min(255,Math.max(0,hf[(j*3)+1]*M));
		hs[(j*3)+2] = Math.min(255,Math.max(0,hf[(j*3)+2]*M));
	}
	return {p: p, t: t+20, v: this.ver, o: c, hs: hs.buffer, cb: this.csOut[this.curOut].cb(), to: ['o','hs']};
};
LUTColourSpace.prototype.ioNames = function(p,t) {
	var out = {};
	out.inName = this.csIn[this.curIn].name;
	out.outName = this.csOut[this.curOut].name;
	out.hgName = this.csOut[this.curHG].name;
	return {p: p, t: t+20, v: this.ver, o: out};
};
LUTColourSpace.prototype.chartVals = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, cb: this.csOut[this.curOut].cb()};
	if (typeof i.colIn !== 'undefined') {
		var y = this.y;
		var colIn = new Float64Array(i.colIn);
		var m = colIn.length*3;
		var rIn = new Float64Array(m);
		var gIn = new Float64Array(m);
		var bIn = new Float64Array(m);
		var k = 0;
		var last = Math.round((m/3)-1);
		var rM = 12.8/(colIn[last-2] * 0.2126);
		var gM = 12.8/(colIn[last-1] * 0.7152);
		var bM = 12.8/(colIn[ last ] * 0.0722);
		for (var j=0; j<m; j += 3) {
			rIn[ j ] = Math.pow(colIn[k] * rM, 1.5);
			gIn[j+1] = Math.pow(colIn[k] * gM, 1.5);
			bIn[j+2] = Math.pow(colIn[k] * bM, 1.5);
			k++;
		}
		this.csIn[this.rec709In].lc(rIn.buffer);
		this.csIn[this.rec709In].lc(gIn.buffer);
		this.csIn[this.rec709In].lc(bIn.buffer);
		var r = new Float64Array(rIn.buffer.slice(0));
		var g = new Float64Array(gIn.buffer.slice(0));
		var b = new Float64Array(bIn.buffer.slice(0));
		var eiMult = i.eiMult;
		var max = this.csOut.length;
		var got = false;
		for (var j=0; j<max; j++) {
			if (this.csOut[j].name === this.csIn[this.curIn].name) {
				this.csOut[j].lc(rIn.buffer);
				this.csOut[j].lc(gIn.buffer);
				this.csOut[j].lc(bIn.buffer);
				got = true;
				break;
			}
		}
		if (!got) {
			self.postMessage({msg:true,details:this.csIn[this.curIn].name});
			return out;
		}
// self.postMessage({msg:true,details:r});
// self.postMessage({msg:true,details:g});
// self.postMessage({msg:true,details:b});
		for (var j=0; j<m; j++) {
			if (isNaN(r[j])) {
				r[j] = 0;
			} else {
				r[j] *= eiMult;
			}
			if (isNaN(g[j])) {
				g[j] = 0;
			} else {
				g[j] *= eiMult;
			}
			if (isNaN(b[j])) {
				b[j] = 0;
			} else {
				b[j] *= eiMult;
			}
		}
	// Colour Temperature Shift
		if (this.doWB) {
			this.wb.lc(r.buffer);
			this.wb.lc(g.buffer);
			this.wb.lc(b.buffer);
		}
/*
		if (this.doCT) {
			this.CAT.lc(r.buffer);
			this.CAT.lc(g.buffer);
			this.CAT.lc(b.buffer);
		}
*/
	// Fluori Correction
/*
		if (this.doFL) {
			this.green.lc(r.buffer);
			this.green.lc(g.buffer);
			this.green.lc(b.buffer);
		}
*/
	// ASC-CDL
		if (this.doASCCDL) {
			var Y;
			for (var j=0; j<m; j += 3) {
				r[ j ] = (r[ j ]*this.asc[0])+this.asc[3];
				r[ j ] = ((r[ j ]<0)?r[ j ]:Math.pow(r[ j ],this.asc[6]));
				r[ j ] = (isNaN(r[ j ])?0:r[ j ]);
				r[j+1] = (r[j+1]*this.asc[1])+this.asc[4];
				r[j+1] = ((r[j+1]<0)?r[j+1]:Math.pow(r[j+1],this.asc[7]));
				r[j+1] = (isNaN(r[j+1])?0:r[j+1]);
				r[j+2] = (r[j+2]*this.asc[2])+this.asc[5];
				r[j+2] = ((r[j+2]<0)?r[j+2]:Math.pow(r[j+2],this.asc[8]));
				r[j+2] = (isNaN(r[j+2])?0:r[j+2]);
				Y = (y[0]*r[j])+(y[1]*r[j+1])+(y[2]*r[j+2]);
				r[ j ] = Y + (this.asc[9]*(r[ j ]-Y));
				r[j+1] = Y + (this.asc[9]*(r[j+1]-Y));
				r[j+2] = Y + (this.asc[9]*(r[j+2]-Y));
				g[ j ] = (g[ j ]*this.asc[0])+this.asc[3];
				g[ j ] = ((g[ j ]<0)?g[ j ]:Math.pow(g[ j ],this.asc[6]));
				g[ j ] = (isNaN(g[ j ])?0:g[ j ]);
				g[j+1] = (g[j+1]*this.asc[1])+this.asc[4];
				g[j+1] = ((g[j+1]<0)?g[j+1]:Math.pow(g[j+1],this.asc[7]));
				g[j+1] = (isNaN(g[j+1])?0:g[j+1]);
				g[j+2] = (g[j+2]*this.asc[2])+this.asc[5];
				g[j+2] = ((g[j+2]<0)?g[j+2]:Math.pow(g[j+2],this.asc[8]));
				g[j+2] = (isNaN(g[j+2])?0:g[j+2]);
				Y = (y[0]*g[j])+(y[1]*g[j+1])+(y[2]*g[j+2]);
				g[ j ] = Y + (this.asc[9]*(g[ j ]-Y));
				g[j+1] = Y + (this.asc[9]*(g[j+1]-Y));
				g[j+2] = Y + (this.asc[9]*(g[j+2]-Y));
				b[ j ] = (b[ j ]*this.asc[0])+this.asc[3];
				b[ j ] = ((b[ j ]<0)?b[ j ]:Math.pow(b[ j ],this.asc[6]));
				b[ j ] = (isNaN(b[ j ])?0:b[ j ]);
				b[j+1] = (b[j+1]*this.asc[1])+this.asc[4];
				b[j+1] = ((b[j+1]<0)?b[j+1]:Math.pow(b[j+1],this.asc[7]));
				b[j+1] = (isNaN(b[j+1])?0:b[j+1]);
				b[j+2] = (b[j+2]*this.asc[2])+this.asc[5];
				b[j+2] = ((b[j+2]<0)?b[j+2]:Math.pow(b[j+2],this.asc[8]));
				b[j+2] = (isNaN(b[j+2])?0:b[j+2]);
				Y = (y[0]*b[j])+(y[1]*b[j+1])+(y[2]*b[j+2]);
				b[ j ] = Y + (this.asc[9]*(b[ j ]-Y));
				b[j+1] = Y + (this.asc[9]*(b[j+1]-Y));
				b[j+2] = Y + (this.asc[9]*(b[j+2]-Y));
			}
		}
	// Highlight Gamut
		if (this.doHG) {
			var Y;
			var hr = new Float64Array(r.buffer.slice(0));
			var hg = new Float64Array(g.buffer.slice(0));
			var hb = new Float64Array(b.buffer.slice(0));
			this.csOut[this.curOut].lf(r.buffer);
			this.csOut[this.curHG].lf(hr.buffer);
			this.csOut[this.curOut].lf(g.buffer);
			this.csOut[this.curHG].lf(hg.buffer);
			this.csOut[this.curOut].lf(b.buffer);
			this.csOut[this.curHG].lf(hb.buffer);
			var rat;
			for (var j=0; j<m; j += 3) {
				Y = (y[0]*r[j])+(y[1]*r[j+1])+(y[2]*r[j+2]);
				if (Y >= this.hgHigh) {
					r[ j ] = hr[j];
					r[j+1] = hr[j+1];
					r[j+2] = hr[j+2];
				} else if (Y > this.hgLow) {
					if (this.hgLin) {
						rat = (this.hgHigh - Y)/(this.hgHigh - this.hgLow);
					} else {
						rat = (this.hgHighStop - (Math.log(Y * 5)/Math.LN2))/(this.hgHighStop - this.hgLowStop);
					}
					r[ j ] = (r[ j ] * (rat)) + (hr[ j ] * (1-rat));
					r[j+1] = (r[j+1] * (rat)) + (hr[j+1] * (1-rat));
					r[j+2] = (r[j+2] * (rat)) + (hr[j+2] * (1-rat));
				}
				Y = (y[0]*g[j])+(y[1]*g[j+1])+(y[2]*g[j+2]);
				if (Y >= this.hgHigh) {
					g[ j ] = hg[j];
					g[j+1] = hg[j+1];
					g[j+2] = hg[j+2];
				} else if (Y > this.hgLow) {
					if (this.hgLin) {
						rat = (this.hgHigh - Y)/(this.hgHigh - this.hgLow);
					} else {
						rat = (this.hgHighStop - (Math.log(Y * 5)/Math.LN2))/(this.hgHighStop - this.hgLowStop);
					}
					g[ j ] = (g[ j ] * (rat)) + (hg[ j ] * (1-rat));
					g[j+1] = (g[j+1] * (rat)) + (hg[j+1] * (1-rat));
					g[j+2] = (g[j+2] * (rat)) + (hg[j+2] * (1-rat));
				}
				Y = (y[0]*b[j])+(y[1]*b[j+1])+(y[2]*b[j+2]);
				if (Y >= this.hgHigh) {
					b[ j ] = hb[j];
					b[j+1] = hb[j+1];
					b[j+2] = hb[j+2];
				} else if (Y > this.hgLow) {
					if (this.hgLin) {
						rat = (this.hgHigh - Y)/(this.hgHigh - this.hgLow);
					} else {
						rat = (this.hgHighStop - (Math.log(Y * 5)/Math.LN2))/(this.hgHighStop - this.hgLowStop);
					}
					b[ j ] = (b[ j ] * (rat)) + (hb[ j ] * (1-rat));
					b[j+1] = (b[j+1] * (rat)) + (hb[j+1] * (1-rat));
					b[j+2] = (b[j+2] * (rat)) + (hb[j+2] * (1-rat));
				}
			}
		} else {
			this.csOut[this.curOut].lf(r.buffer);
			this.csOut[this.curOut].lf(g.buffer);
			this.csOut[this.curOut].lf(b.buffer);
		}
		var rInput = new Float64Array(colIn.length);
		var gInput = new Float64Array(colIn.length);
		var bInput = new Float64Array(colIn.length);
		var rOutput = new Float64Array(colIn.length);
		var gOutput = new Float64Array(colIn.length);
		var bOutput = new Float64Array(colIn.length);
		k = 0;
		for (var j=0; j<m; j += 3) {
			rInput[k] = ((0.2126*rIn[j])+(0.7152*rIn[j+1])+(0.0722*rIn[j+2]));
			gInput[k] = ((0.2126*gIn[j])+(0.7152*gIn[j+1])+(0.0722*gIn[j+2]));
			bInput[k] = ((0.2126*bIn[j])+(0.7152*bIn[j+1])+(0.0722*bIn[j+2]));
			rOutput[k] = ((0.2126*r[j])+(0.7152*r[j+1])+(0.0722*r[j+2]));
			gOutput[k] = ((0.2126*g[j])+(0.7152*g[j+1])+(0.0722*g[j+2]));
			bOutput[k] = ((0.2126*b[j])+(0.7152*b[j+1])+(0.0722*b[j+2]));
			k++;
		}
		out.rIn = rInput.buffer;
		out.gIn = gInput.buffer;
		out.bIn = bInput.buffer;
		out.rOut = rOutput.buffer;
		out.gOut = gOutput.buffer;
		out.bOut = bOutput.buffer;
		out.to = ['rIn', 'gIn', 'bIn', 'rOut', 'gOut', 'bOut'];
	}
	return out;
};
LUTColourSpace.prototype.getCATs = function(p,t) {
	return {
		p: p,
		t: t+20,
		v: this.ver,
		o: this.CATs.getModels()
	};
};
LUTColourSpace.prototype.previewLin = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, gamma: i.gamma, gamut: i.gamut, legal: i.legal, i: i.i, o: i.o };
	this.csIn[i.gamut].lc(i.o);
	out.to = ['i','o'];
	return out;
};
LUTColourSpace.prototype.getPrimaries = function(p,t) {
	var c = this.clrs.slice(0);
	this.csOut[this.curOut].lc(c);
	return {p: p, t: t+20, v: this.ver, o: c, cb: this.csOut[this.curOut].cb(), to: ['o']};
};
LUTColourSpace.prototype.psstColours = function(p,t) {
	var out = { p: p, t: t+20, v: this.ver,  cb: this.csOut[this.curOut].cb() };
	var bef64 = new Float64Array(84);
	var aft64 = new Float64Array(84);
	var f,a,m1,m2,M,Y,c,sat,Pb,Pr;
	var y = this.y;
	var Db = 2*(1-y[2]);
	var Dr = 2*(1-y[0]);
	var i=0;
	for (var j=0; j<84; j += 3) {
		f = i;
		i += 1/28;
		a = this.psstB.lLCub(f);
		m1 = this.psstM.lLLin(f);
		c = this.psstC.lLCub(f);
		sat = this.psstSat.lLCub(f);
		if (sat < 0) {
			sat = 0;
		}
		S = this.psstS.lLCub(f);
		if (S < 0) {
			S = 0;
		}
		O = this.psstO.lLCub(f);
		P = this.psstP.lLCub(f);
		if (P < 0) {
			P = 0;
		}
		M = 0.5 * m1;
		y1 = this.psstY.lLLin(f);
		Y = 0.7*y1;
		Pb = M * Math.cos(a);
		Pr = M * Math.sin(a);
		bef64[ j ] = (Pr * Dr) + Y;
		bef64[j+2] = (Pb * Db) + Y;
		bef64[j+1] = (Y - (y[0]*bef64[ j ]) -(y[2]*bef64[j+2]))/y[1];
		f = (f+c%1);
		if (this.psstYC) {
			y2 = this.psstY.lLLin(f);
		} else {
			y2 = y1;
		}
		if (this.psstMC) {
			m2 = this.psstM.lLLin(f);
		} else {
			m2 = m1;
		}
		M = M * m2 * sat / m1;
		a = this.psstB.lLCub(f);
		Y = (Y*S/y1)+O;
		Y = ((Y<0)?Y:Math.pow(Y,P));
		Y = (isNaN(Y)?0:Y);
		Y *= y2;
		Pb = M * Math.cos(a);
		Pr = M * Math.sin(a);
		aft64[ j ] = (Pr * Dr) + Y;
		aft64[j+2] = (Pb * Db) + Y;
		aft64[j+1] = (Y - (y[0]*aft64[ j ]) -(y[2]*aft64[j+2]))/y[1];
	}
	this.csOut[this.curOut].lc(bef64.buffer);
	this.csOut[this.curOut].lc(aft64.buffer);
	out.b = bef64.buffer;
	out.a = aft64.buffer;
	out.to = ['b','a'];
	return out;
};
LUTColourSpace.prototype.getCCTDuv = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver };
	var rgb = new Float64Array(i.rgb);
	var XYZ = this.wb.toLocus(this.mMult(this.system.toXYZ,rgb));
	var L = XYZ[0] + XYZ[1] + XYZ[2];
	var xyz = new Float64Array([XYZ[0]/L,XYZ[1]/L,XYZ[2]/L]);
	var CCT = this.planck.getCCT(xyz);
	var delta = this.planck.getDuvMag(xyz,CCT);
	out.sys = this.wb.getSys();
	out.ct = CCT;
	out.lamp = out.ct;
	out.duv = (-delta[0] / 0.0175).toFixed(2);
//	out.dpl = (-delta[1] / 0.0175).toFixed(2);
	out.dpl = 0;
	this.wb.setVals(out.sys,out.ct,out.lamp,out.duv,out.dpl);
	return out;
};
LUTColourSpace.prototype.calcPrimaries = function(p,t) {
	var d = 0.001;
	var B = new Float64Array(9);
	var g = new Float64Array([
		0.2,0.2,0.2,
		0.05,0,0,
		0,0.05,0,
		0,0,0.05
	]);
	var m = Math.round(g.length)/3;
	var a = new Float64Array(m*3);
	var xy = new Float64Array(m*2*2);
	var goal;
	var guess,g0;
	
	var x0,x1,dx0,dx1;
	var den;
	var f0,f1,df1;
	var J0,iJ0,dJ1,diJ1,J1,iJdf;
	var delta;
	var k;
	for (var i=0; i<m; i++) {
		k = i*3;
		goal = new Float64Array([g[k],g[k+1],g[k+2]]);
		g0 = new Float64Array([ g[k],g[k+1],g[k+2] ]);
		guess = this.firstGuess(
			goal,
			g0,
			d
		);
		x0 = guess.x;
		f0 = guess.f;
		if (isNaN(f0[0]) || isNaN(f0[1]) || isNaN(f0[2])) {
			a[ k ] = NaN;
			a[k+1] = NaN;
			a[k+2] = NaN;
			break;
		} else if (Math.pow(Math.pow(f0[0],2)+Math.pow(f0[1],2)+Math.pow(f0[2],2),0.5) < 0.00001) {
			a[ k ] = x0[0];
			a[k+1] = x0[1];
			a[k+2] = x0[2];
		} else {
			J0 = guess.J;
			iJ0 = this.mInverse(J0);
			for (var j=0; j<15; j++) {
				delta = this.mMult(iJ0,f0);
				x1 = new Float64Array([x0[0]-delta[0],x0[1]-delta[1],x0[2]-delta[2]]);
				f1 = this.fx(x1.buffer.slice(0));
				f1[0] -= goal[0];
				f1[1] -= goal[1];
				f1[2] -= goal[2];
				if (isNaN(f1[0]) || isNaN(f1[1]) || isNaN(f1[2])) {
					a[ k ] = NaN;
					a[k+1] = NaN;
					a[k+2] = NaN;
					break;
				} else if (Math.pow(Math.pow(f1[0],2)+Math.pow(f1[1],2)+Math.pow(f1[2],2),0.5) < 0.00001) {
					a[ k ] = x1[0];
					a[k+1] = x1[1];
					a[k+2] = x1[2];
					break;
				} else {
// console.log(i + ' - ' + j + ' - ' + Math.pow(Math.pow(f1[0],2)+Math.pow(f1[1],2)+Math.pow(f1[2],2),0.5));
					dx1 = new Float64Array([-delta[0],-delta[1],-delta[2]]);
					df1 = new Float64Array([f1[0]-f0[0],f1[1]-f0[1],f1[2]-f0[2]]);
					// Good Broyden's
					dJ1 = this.mMult(J0,dx1);
					den = Math.pow(dx1[0],2) + Math.pow(dx1[1],2) + Math.pow(dx1[2],2);
					dJ1[0] = (df1[0] - dJ1[0])/den;
					dJ1[1] = (df1[1] - dJ1[1])/den;
					dJ1[2] = (df1[2] - dJ1[2])/den;
					J0 = new Float64Array([
						J0[0]+(dJ1[0]*dx1[0]), J0[1]+(dJ1[0]*dx1[1]), J0[2]+(dJ1[0]*dx1[2]),
						J0[3]+(dJ1[1]*dx1[0]), J0[4]+(dJ1[1]*dx1[1]), J0[5]+(dJ1[1]*dx1[2]),
						J0[6]+(dJ1[2]*dx1[0]), J0[7]+(dJ1[2]*dx1[1]), J0[8]+(dJ1[2]*dx1[2])
					]);
					iJ0 = this.mInverse(J0);
					x0 = x1;
					f0 = f1;
/*
					// Bad Broyden's
					diJ1 = this.mMult(iJ0,df1);
					den = Math.pow(df1[0],2) + Math.pow(df1[1],2) + Math.pow(df1[2],2);
					diJ1[0] = (dx1[0] - diJ1[0])/den;
					diJ1[1] = (dx1[1] - diJ1[1])/den;
					diJ1[2] = (dx1[2] - diJ1[2])/den;
					iJ0 = new Float64Array([
						iJ0[0]+(diJ1[0]*df1[0]), iJ0[1]+(diJ1[0]*df1[1]), iJ0[2]+(diJ1[0]*df1[2]),
						iJ0[3]+(diJ1[1]*df1[0]), iJ0[4]+(diJ1[1]*df1[1]), iJ0[5]+(diJ1[1]*df1[2]),
						iJ0[6]+(diJ1[2]*df1[0]), iJ0[7]+(diJ1[2]*df1[1]), iJ0[8]+(diJ1[2]*df1[2])
					]);
					x0 = x1;
					f0 = f1;
*/
				}
			}
		}
	}
	var k,l,den;
	var wd,ws;
	var XYZ;

	this.csIn[this.curIn].lc(g.buffer);
	this.csOut[this.XYZOut].lc(g.buffer);
	wd = this.csIn[this.curIn].getWP();
	ws = this.system.white;
	for (var j=0; j<m; j++) {
		k = j*3;
		l = j*2;
		XYZ = this.ciecat02(new Float64Array([g[k],g[k+1],g[k+2]]),ws,wd);
		den = XYZ[0] + XYZ[1] + XYZ[2];
		xy[ l ] = (XYZ[0]/den);
		xy[l+1] = (XYZ[1]/den);
	}

	var step = m*2;
	this.csOut[this.XYZOut].lc(a.buffer);
	wd = this.csOut[this.curOut].getWP();
	ws = this.system.white;
	for (var j=0; j<m; j++) {
		k = j*3;
		l = j*2;
		XYZ = this.ciecat02(new Float64Array([a[k],a[k+1],a[k+2]]),ws,wd);
		den = XYZ[0] + XYZ[1] + XYZ[2];
		xy[ l+step ] = (XYZ[0]/den);
		xy[l+step+1] = (XYZ[1]/den);
	}
/*
console.log(
	'Output - WP: ' + parseFloat(xy[step].toFixed(4)) + ', ' + parseFloat(xy[step+1].toFixed(4)) +
	' Rxy: ' + parseFloat(xy[step+2].toFixed(4)) + ', ' + parseFloat(xy[step+3].toFixed(4)) +
	' Gxy: ' + parseFloat(xy[step+4].toFixed(4)) + ', ' + parseFloat(xy[step+5].toFixed(4)) +
	' Bxy: ' + parseFloat(xy[step+6].toFixed(4)) + ', ' + parseFloat(xy[step+7].toFixed(4))
);
*/
	return {
		p: p,
		t: t+20,
		v: this.ver,
		xy: xy
	};
};
// Web worker messaging functions
function sendMessage(d) {
	if (cs.isTrans && typeof d.to !== 'undefined') {
		var max = d.to.length;
		var objArray = [];
		for (var j=0; j < max; j++) {
			objArray.push(d[d.to[j]]);
		}
		postMessage(d,objArray);
	} else {
		postMessage(d);
	}
}
if (typeof importScripts === 'function') {
	importScripts('lut.js','ring.js','brent.js');
	var cs = new LUTColourSpace();
	var trans = false;
	this.addEventListener('message', function(e) {
		var d = e.data;
		if (typeof d.t === 'undefined') {
		} else if (d.t !== 0 && d.t < 20 && d.v !== cs.ver) {
			this.postMessage({p: d.p, t: d.t, v: d.v, resend: true, d: d.d});
		} else {
			switch (d.t) {
				case 0:	sendMessage(cs.setParams(d.d));
						break;
				case 1: sendMessage(cs.calc(d.p,d.t,d.d,true)); 
						break;
				case 2: sendMessage(cs.laCalc(d.p,d.t,d.d)); 
						break;
				case 3: sendMessage(cs.recalcMatrix(d.p,d.t,d.d)); 
						break;
				case 5: sendMessage(cs.getLists(d.p,d.t)); 
						break;
				case 6: sendMessage(cs.setLA(d.p,d.t,d.d)); 
						break;
				case 7: sendMessage(cs.setLATitle(d.p,d.t,d.d)); 
						break;
				case 8: sendMessage(cs.getColSqr(d.p,d.t,d.d)); 
						break;
				case 9: sendMessage(cs.multiColours(d.p,d.t,d.d)); 
						break;
				case 10:sendMessage(cs.ioNames(d.p,d.t));
						break;
				case 11:sendMessage(cs.chartVals(d.p,d.t,d.d));
						break;
				case 12:sendMessage(cs.calc(d.p,d.t,d.d,false)); 
						break;
				case 14:sendMessage(cs.previewLin(d.p,d.t,d.d));
						break;
				case 15:sendMessage(cs.getPrimaries(d.p,d.t));
						break;
				case 16:sendMessage(cs.psstColours(d.p,d.t));
						break;
				case 17:sendMessage(cs.getCATs(d.p,d.t));
						break;
				case 18:sendMessage(cs.getCCTDuv(d.p,d.t,d.d));
						break;
				case 19:sendMessage(cs.calcPrimaries(d.p,d.t));
						break;
			}
		}
	}.bind(this), false);
}
