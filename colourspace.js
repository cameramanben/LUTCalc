/* colourspace.js
* Colour Space (gamut) conversion web worker object for the LUTCalc Web App.
* 30th December 2014
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
	this.cat02 = new Float64Array([
		 0.7328, 0.4296,-0.1624,
		-0.7036, 1.6975, 0.0061,
		 0.0030, 0.0136, 0.9834
	]);
	this.invCat02 = this.mInverse(this.cat02);
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
	this.CAT = new CSTemperature(this.getCCT(this.system.white),this.system.toXYZ);
	this.green = new CSGreen(this.getCCT(this.system.white),this.system.toXYZ);
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
	this.doCT = false;
	this.doFL = false;
	this.doASCCDL = false;
	this.doPSSTCDL = false;
	this.doFC = false;

	this.loadColourSpaces();
}
// Prepare Colour Spaces
LUTColourSpace.prototype.loadColourSpaces = function() {
	this.SG3C = this.csIn.length;
	this.csIn.push(this.toSys('Sony S-Gamut3.cine'));
	this.csIn.push(this.toSys('Sony S-Gamut3'));
	this.csIn.push(this.toSys('Sony S-Gamut'));
	this.csIn.push(this.toSys('Alexa Wide Gamut'));
	this.csIn.push(this.toSys('Canon Cinema Gamut'));
	this.csIn.push(new CSCanonIDT('Canon CP IDT (Daylight)', true, this.toSys('ACES').m));
	this.csIn.push(new CSCanonIDT('Canon CP IDT (Tungsten)', false, this.toSys('ACES').m));
	this.csIn.push(this.toSys('Panasonic V-Gamut'));
	this.csIn.push(this.toSys('Rec709'));
	this.csIn.push(this.toSys('Rec2020'));
	this.csIn.push(this.toSys('sRGB'));
	this.csIn.push(this.toSys('ACES'));
	this.csIn.push(this.toSys('XYZ'));
	this.csIn.push(this.toSys('DCI-P3'));
	this.csIn.push(this.toSys('DCI-P3D60'));
	this.csIn.push(this.toSys('Canon DCI-P3+'));
	this.csIn.push(this.toSys('Adobe RGB'));
	this.csIn.push(this.toSys('Adobe Wide Gamut RGB'));
	this.csIn.push(new CSMatrix('Passthrough', new Float64Array([1,0,0, 0,1,0, 0,0,1])));

	this.csOut.push(this.fromSys('Sony S-Gamut3.cine'));
	this.csOut.push(this.fromSys('Sony S-Gamut3'));
	this.csOut.push(this.fromSys('Sony S-Gamut'));
	this.csOut.push(this.fromSys('Alexa Wide Gamut'));
	this.csOut.push(this.fromSys('Canon Cinema Gamut'));
	this.csOut.push(this.fromSys('Panasonic V-Gamut'));
	this.csOut.push(this.fromSys('Rec709'));
	this.csOut.push(new CSLUT('LC709',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'LC709.labin',
			le: this.isLE
		}));
	this.csOut.push(new CSLUT('LC709A',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'LC709A.labin',
			le: this.isLE
		}));
	this.csOut.push(new CSLUT('Canon CP IDT (Daylight)',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'cpouttungsten.labin',
			le: this.isLE
		}));
	this.csOut.push(new CSLUT('Canon CP IDT (Tungsten)',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'cpoutdaylight.labin',
			le: this.isLE
		}));
	this.csOut.push(new CSLUT('Varicam V709',
		{
			format: 'cube',
			min: [0,0,0],
			max: [1,1,1],
			filename: 'V709.labin',
			le: this.isLE
		}));
	this.csOut.push(this.fromSys('Rec2020'));
	this.csOut.push(this.fromSys('sRGB'));
	this.csOut.push(new CSMatrix('Luma B&W', new Float64Array([ this.y[0],this.y[1],this.y[2], this.y[0],this.y[1],this.y[2], this.y[0],this.y[1],this.y[2] ])));
	this.csOut.push(this.fromSys('ACES'));
	this.csOut.push(this.fromSys('XYZ'));
	this.csOut.push(this.fromSys('DCI-P3'));
	this.csOut.push(this.fromSys('DCI-P3D60'));
	this.csOut.push(this.fromSys('Canon DCI-P3+'));
	this.csOut.push(this.fromSys('Adobe RGB'));
	this.csOut.push(this.fromSys('Adobe Wide Gamut RGB'));
	this.LA = this.csOut.length;
	this.csOut.push(new CSLA('LA'));
	this.pass = this.csOut.length;
	this.csOut.push(new CSMatrix('Passthrough', new Float64Array([1,0,0, 0,1,0, 0,0,1])));

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
		for (var j=0; j<max2; j++) {
			if (this.laList[i].name === this.outList[j].name) {
				this.laList[i].idx = this.outList[j].idx;
				break;
			}
		}
	}

}
// Colour Calculations
LUTColourSpace.prototype.RGBtoXYZ = function(xy, white) {
//	xy = [	xr, yr,
//			xg, yg,
//			xb, yb ]
//	white = [ Xw, Yw, Zw ];
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
}
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
}
LUTColourSpace.prototype.toSys = function(name) {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
		if (name === this.g[j].name) {
			return new CSMatrix(name, this.g[j].toSys);
		}
	}
	return false;
}
LUTColourSpace.prototype.fromSys = function(name) {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
		if (name === this.g[j].name) {
			return new CSMatrix(name, this.mInverse(this.g[j].toSys));
		}
	}
	return false;
}
// Matrix Operations
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
}
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
}
// Base Colour Data
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
	}
}
LUTColourSpace.prototype.xyzMatrices = function() {
// S-Gamut3.cine
	this.sysIdx = this.g.length;
	var sgamut3cine = {};
	sgamut3cine.name = 'Sony S-Gamut3.cine';
	sgamut3cine.xy = new Float64Array([0.766,0.275, 0.225,0.800, 0.089,-0.087]);
	sgamut3cine.white = this.illuminant('d65');
	sgamut3cine.toXYZ = this.RGBtoXYZ(sgamut3cine.xy,sgamut3cine.white);
	this.g.push(sgamut3cine);
// S-Gamut3
	var sgamut3 = {};
	sgamut3.name = 'Sony S-Gamut3';
	sgamut3.xy = new Float64Array([0.730,0.280, 0.140,0.855, 0.100,-0.05]);
	sgamut3.white = this.illuminant('d65');
	sgamut3.toXYZ = this.RGBtoXYZ(sgamut3.xy,sgamut3.white);
	this.g.push(sgamut3);
// S-Gamut
	var sgamut = {};
	sgamut.name = 'Sony S-Gamut';
	sgamut.xy = new Float64Array([0.730,0.280, 0.140,0.855, 0.100,-0.05]);
	sgamut.white = this.illuminant('d65');
	sgamut.toXYZ = this.RGBtoXYZ(sgamut.xy,sgamut.white);
	this.g.push(sgamut);
// ALEXA Wide Gamut RGB
	var alexawgrgb = {};
	alexawgrgb.name = 'Alexa Wide Gamut';
	alexawgrgb.xy = new Float64Array([0.6840,0.3130, 0.2210,0.8480, 0.0861,-0.1020]);
	alexawgrgb.white = this.illuminant('d65');
	alexawgrgb.toXYZ = this.RGBtoXYZ(alexawgrgb.xy,alexawgrgb.white);
	this.g.push(alexawgrgb);
// Canon Cinema Gamut
	var canoncg = {};
	canoncg.name = 'Canon Cinema Gamut';
	canoncg.xy = new Float64Array([0.74,0.27, 0.17,1.14, 0.08,-0.10]);
	canoncg.white = this.illuminant('d65');
	canoncg.toXYZ = this.RGBtoXYZ(canoncg.xy,canoncg.white);
	this.g.push(canoncg);
// Panasonic V-Gamut
	var vgamut = {};
	vgamut.name = 'Panasonic V-Gamut';
	vgamut.xy = new Float64Array([0.730,0.280, 0.165,0.840, 0.100,-0.030]);
	vgamut.white = this.illuminant('d65');
	vgamut.toXYZ = this.RGBtoXYZ(vgamut.xy,vgamut.white);
	this.g.push(vgamut);
// Rec709
	var rec709 = {};
	rec709.name = 'Rec709';
	rec709.xy = new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]);
	rec709.white = this.illuminant('d65');
	rec709.toXYZ = this.RGBtoXYZ(rec709.xy,rec709.white);
	this.g.push(rec709);
// Rec2020
	var rec2020 = {};
	rec2020.name = 'Rec2020';
	rec2020.xy = new Float64Array([0.708,0.292, 0.170,0.797, 0.131,0.046]);
	rec2020.white = this.illuminant('d65');
	rec2020.toXYZ = this.RGBtoXYZ(rec2020.xy,rec2020.white);
	this.g.push(rec2020);
// sRGB
	var srgb = {};
	srgb.name = 'sRGB';
	srgb.xy = new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]);
	srgb.white = this.illuminant('d65');
	srgb.toXYZ = this.RGBtoXYZ(srgb.xy,srgb.white);
	this.g.push(srgb);
// ACES
	var aces = {};
	aces.name = 'ACES';
	aces.xy = new Float64Array([0.73470,0.26530, 0.00000,1.00000, 0.00010,-0.07700]);
	aces.white = new Float64Array([0.32168, 0.33767, 0.34065]);
	aces.toXYZ = this.RGBtoXYZ(aces.xy,aces.white);
	this.g.push(aces);
// XYZ
	var xyz = {};
	xyz.name = 'XYZ';
	xyz.xy = false;
	xyz.white = this.illuminant('d65');
	xyz.toXYZ = new Float64Array([1,0,0, 0,1,0, 0,0,1]);
	this.g.push(xyz);
// DCI-P3
	var p3 = {};
	p3.name = 'DCI-P3';
	p3.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3.white = new Float64Array([0.3140,0.3510,0.3350]);
	p3.toXYZ = this.RGBtoXYZ(p3.xy,p3.white);
	this.g.push(p3);
// DCI-P3D60
	var p3d60 = {};
	p3d60.name = 'DCI-P3D60';
	p3d60.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3d60.white = this.illuminant('d60');
	p3d60.toXYZ = this.RGBtoXYZ(p3d60.xy,p3d60.white);
	this.g.push(p3d60);
// Canon DCI-P3+
	var canonp3p = {};
	canonp3p.name = 'Canon DCI-P3+';
	canonp3p.xy = new Float64Array([0.74,0.27, 0.22,0.78, 0.09,-0.09]);
	canonp3p.white = new Float64Array([0.3140,0.3510,0.3350]);
	canonp3p.toXYZ = this.RGBtoXYZ(canonp3p.xy,canonp3p.white);
	this.g.push(canonp3p);
// Adobe RGB
	var adobergb = {};
	adobergb.name = 'Adobe RGB';
	adobergb.xy = new Float64Array([0.64,0.33, 0.21,0.71, 0.15,0.06]);
	adobergb.white = this.illuminant('d65');
	adobergb.toXYZ = this.RGBtoXYZ(adobergb.xy,adobergb.white);
	this.g.push(adobergb);
// Adobe Wide Gamut RGB
	var adobewg = {};
	adobewg.name = 'Adobe Wide Gamut RGB';
	adobewg.xy = new Float64Array([0.7347,0.2653, 0.1152,0.8264, 0.1566,0.0177]);
	adobewg.white = this.illuminant('d50');
	adobewg.toXYZ = this.RGBtoXYZ(adobewg.xy,adobewg.white);
	this.g.push(adobewg);
}
LUTColourSpace.prototype.systemMatrices = function() {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
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
/*
	console.log('Rec709 to Rec7093200K');
	console.log(this.mMult(this.mInverse(this.g[6].toXYZ),this.ciecat02(this.g[6].toXYZ,this.g[6].white,new Float64Array([0.4254,0.4044,0.1704]))));
*/
}
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
}
LUTColourSpace.prototype.setYCoeffs = function() {
	var max = this.g.length;
	var p = new Float64Array(3);
	for (var j=0; j<max; j++) {
		if (this.g[j].name === 'Rec709') {
			p = this.mMult(this.g[j].toSys, new Float64Array([ 1,0,0,0,1,0,0,0,1 ]));
		}
	}
	var rec709 = new Float64Array([ 0.2126, 0.7152, 0.0722 ]);
	var p2 = this.mInverse(new Float64Array([p[0],p[3],p[6], p[1],p[4],p[7], p[2],p[5],p[8]]));
	this.y = this.mMult(p2,rec709);
console.log(this.y);
}
LUTColourSpace.prototype.setSaturated = function() {
	var max = this.g.length;
	var idx;
	for (var j=0; j<max; j++) {
		if (this.g[j].name === 'Rec709') {
			idx = j;
			break;
		}
	}
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
}
LUTColourSpace.prototype.getCCT = function(white) {
	return 6500; // until I have the CCT algorithm in place, assume D65
}
// Parameter Setting Functions
LUTColourSpace.prototype.setCT = function(params) {
	var out = {};
	this.doCT = false;
	if (this.tweaks && typeof params.twkCT !== 'undefined') {
		var p = params.twkCT;
		if (typeof p.doCT === 'boolean' && p.doCT) {
			this.doCT = true;
			if (typeof p.CAT === 'number') {
				this.CAT.setModel(p.CAT);
				out.CAT = params.CAT;
			}
			if (typeof p.dT === 'number') {
				this.CAT.setTemp(p.dT);
				out.dT = p.dT;
			}
		}
	}
	out.doCT = this.doCT;
	return out;
}
LUTColourSpace.prototype.setFL = function(params) {
	var out = {};
	this.doFL = false;
	if (this.tweaks && typeof params.twkFL !== 'undefined') {
		var p = params.twkFL;
		if (typeof p.doFL === 'boolean' && p.doFL) {
			this.doFL = true;
			if (typeof p.CAT === 'number') {
				this.green.setModel(p.CAT);
				out.CAT = p.CAT;
			}
			if (typeof p.flT === 'number' && typeof p.flMag === 'number') {
				this.green.setGreen(p.flT, p.flMag);
				out.dT = p.flT;
				out.flMag = p.flMag;
			}
/*
			if (typeof p.flMag === 'number' && typeof p.flTemp === 'number') {
				this.green.setGreen(p.flTemp,p.flMag);
				out.flMag = p.flMag;
				out.flTemp = p.flTemp;
			}
*/
		}
	}
	out.doFL = this.doFL;
	return out;
}
LUTColourSpace.prototype.setASCCDL = function(params) {
	var out = {};
	this.doASCCDL = false;
	this.changedASCCDL = false;
	if (this.tweaks && typeof params.twkASCCDL !== 'undefined') {
		var p = params.twkASCCDL;
		if (typeof p.doASCCDL === 'boolean') {
			var didASCCDL = this.doASCCDL;
			this.doASCCDL = p.doASCCDL		
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
}
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
}
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
}
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
}
// Adjustment Objects
function CSTemperature(CCT,toXYZ) {
	this.CCT = CCT;
	this.toSys = this.mInverse(toXYZ);
	this.fromSys = toXYZ;
	this.loci = new LUTs();
	this.setLoci();
	this.cur = 0;
	this.dT = 0;
	this.names = [];
	this.Ms = [];
	this.models();
	this.setModel(this.cur);
	this.setCAT();
}
CSTemperature.prototype.models = function() {
	this.addModel('Bradford Chromatic Adaptation', [0.8951,0.2664,-0.1614, -0.7502,1.7135,0.0367, 0.0389,-0.0685,1.0296]);
	this.addModel('CIECAT02',[0.7328,0.4296,-0.1624, -0.7036,1.6975,0.0061, 0.003,0.0136,0.9834]);
	this.addModel('Von Kries',[0.40024,0.7076,-0.08081, -0.2263,1.16532,0.0457, 0,0,0.91822]);
	this.addModel('Sharp',[1.2694,-0.0988,-0.1706, -0.8364,1.8006,0.0357, 0.0297,-0.0315,1.0018]);
	this.addModel('CMCCAT2000',[0.7982,0.3389,-0.1371, -0.5918,1.5512,0.0406, 0.0008,0.0239,0.9753]);
	this.addModel('XYZ Scaling',[1,0,0, 0,1,0, 0,0,1]);
}
CSTemperature.prototype.addModel = function(name,M) {
	this.names.push(name);
	this.Ms.push(M);
}
CSTemperature.prototype.setModel = function(modelIdx) {
	this.cur = modelIdx;
	this.M = this.Ms[this.cur];
	this.Minv = this.mInverse(this.M);
	this.setCAT();
}
CSTemperature.prototype.getModels = function() {
	var max = this.names.length;
	var out = [];
	for (var j=0; j<max; j++) {
		out.push({idx: j, name: this.names[j]});
	}
	return out;
}
CSTemperature.prototype.mInverse = function(m) {
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
}
CSTemperature.prototype.mMult = function(m1,m2) {
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
}
CSTemperature.prototype.setLoci = function() {
	this.loci.setDetails({
		title: 'loci',
		format: 'cube',
		dims: 1,
		s: 65,
		min: [0,0,0],
		max: [1,1,1],
		C: [new Float64Array(
			[1.34656,1.24451,1.17117,1.11848,1.08017,1.05187,1.03065,1.01455,
			 1.00197,0.99234,0.98506,0.97960,0.97557,0.97264,0.97058,0.96920,
			 0.96835,0.96791,0.96780,0.96794,0.96828,0.96877,0.96937,0.97006,
			 0.97082,0.97163,0.97246,0.97332,0.97419,0.97507,0.97594,0.97681,
			 0.97767,0.97852,0.97936,0.98017,0.98098,0.98176,0.98253,0.98327,
			 0.98400,0.98471,0.98540,0.98607,0.98673,0.98736,0.98798,0.98858,
			 0.98917,0.98974,0.99029,0.99083,0.99135,0.99186,0.99236,0.99284,
			 0.99331,0.99376,0.99421,0.99464,0.99506,0.99547,0.99586,0.99625,
			 0.99663]),
			new Float64Array(
		    [1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1]),
			new Float64Array(
			[0.10372,0.16741,0.24024,0.31663,0.39400,0.47089,0.54644,0.62019,
			 0.69148,0.75874,0.82247,0.88270,0.93953,0.99307,1.04350,1.09097,
			 1.13565,1.17772,1.21733,1.25466,1.28985,1.32304,1.35437,1.38397,
			 1.41196,1.43844,1.46352,1.48728,1.50983,1.53123,1.55157,1.57090,
			 1.58931,1.60684,1.62355,1.63949,1.65471,1.66925,1.68316,1.69646,
			 1.70920,1.72141,1.73311,1.74434,1.75512,1.76548,1.77544,1.78502,
			 1.79423,1.80311,1.81166,1.81991,1.82786,1.83553,1.84294,1.85010,
			 1.85702,1.86371,1.87018,1.87645,1.88251,1.88839,1.89408,1.89960,
			 1.90495])
			]
	});
}
CSTemperature.prototype.setCAT = function() {
	var Ws = this.loci.lRCub((this.dT-1800)/19200);
	var Wd = this.loci.lRCub((this.CCT-1800)/19200);
	var s = this.mMult(this.M,Ws);
	var d = this.mMult(this.M,Wd);
	var M1 = this.mMult(this.mMult(new Float64Array([
		d[0]/s[0],	0,			0,
		0,			d[1]/s[1],	0,
		0,			0,			d[2]/s[2]
	]), this.M),this.fromSys);
	this.N = this.mMult(this.toSys,this.mMult(this.Minv,M1));
}
CSTemperature.prototype.setTemp = function(dT) {
	this.dT = dT * this.CCT;
	this.setCAT();
}
CSTemperature.prototype.lc = function(buff) {
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
}
function CSGreen(CCT,toXYZ) {
	this.CCT = CCT;
	this.toSys = this.mInverse(toXYZ);
	this.fromSys = toXYZ;
	this.loci = new LUTs();
	this.setLoci();
	this.white = this.loci.lRCub((this.CCT-1800)/19200);
	this.cur = 0;
	this.T = CCT;
	this.mag = 0;
	this.names = [];
	this.Ms = [];
	this.models();
	this.setModel(this.cur);
	this.setCAT();
}
CSGreen.prototype.models = function() {
	this.addModel('Bradford Chromatic Adaptation', [0.8951,0.2664,-0.1614, -0.7502,1.7135,0.0367, 0.0389,-0.0685,1.0296]);
	this.addModel('CIECAT02',[0.7328,0.4296,-0.1624, -0.7036,1.6975,0.0061, 0.003,0.0136,0.9834]);
	this.addModel('Von Kries',[0.40024,0.7076,-0.08081, -0.2263,1.16532,0.0457, 0,0,0.91822]);
	this.addModel('Sharp',[1.2694,-0.0988,-0.1706, -0.8364,1.8006,0.0357, 0.0297,-0.0315,1.0018]);
	this.addModel('CMCCAT2000',[0.7982,0.3389,-0.1371, -0.5918,1.5512,0.0406, 0.0008,0.0239,0.9753]);
	this.addModel('XYZ Scaling',[1,0,0, 0,1,0, 0,0,1]);
}
CSGreen.prototype.addModel = function(name,M) {
	this.names.push(name);
	this.Ms.push(M);
}
CSGreen.prototype.setModel = function(modelIdx) {
	this.cur = modelIdx;
	this.M = this.Ms[this.cur];
	this.Minv = this.mInverse(this.M);
	this.setCAT();
}
CSGreen.prototype.getModels = function() {
	var max = this.names.length;
	var out = [];
	for (var j=0; j<max; j++) {
		out.push({idx: j, name: this.names[j]});
	}
	return out;
}
CSGreen.prototype.mInverse = function(m) {
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
}
CSGreen.prototype.mMult = function(m1,m2) {
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
}
CSGreen.prototype.setLoci = function() {
	this.loci.setDetails({
		title: 'loci',
		format: 'cube',
		dims: 1,
		s: 65,
		min: [0,0,0],
		max: [1,1,1],
		C: [new Float64Array(
			[0.549554281,0.515981903,0.485678486,0.459314076,0.436578981,0.416952596,0.399927196,0.385065683,
			 0.3720036,0.360710179,0.350863077,0.34224204,0.334660345,0.327961725,0.322016063,0.316715103,
			 0.311968633,0.307701254,0.303849707,0.3003607,0.297189137,0.294296685,0.291650622,0.289222888,
			 0.286989321,0.28492903,0.283023883,0.281258078,0.279617799,0.278090919,0.276666763,0.275335899,
			 0.274089972,0.272921555,0.27182403,0.270791487,0.269818625,0.268900689,0.268033395,0.267212878,
			 0.266435644,0.265698526,0.264998648,0.264333394,0.263700379,0.263097425,0.262522539,0.261973896,
			 0.261449821,0.260948772,0.260469333,0.260010195,0.259570151,0.259148084,0.258742963,0.258353827,
			 0.257979789,0.257620022,0.257273756,0.256940277,0.256618916,0.256309051,0.256010098,0.255721513,
			 0.255442786]),
			new Float64Array(
			[0.408116416,0.414606817,0.414694684,0.410660277,0.404174524,0.396390777,0.38803413,0.379544456,
			 0.371270504,0.363493931,0.356185759,0.349369467,0.343042515,0.337186884,0.331776025,0.326779327,
			 0.322164915,0.317901341,0.313958564,0.310308465,0.306925075,0.303784628,0.300865504,0.298148114,
			 0.295614754,0.293249445,0.29103778,0.288966769,0.287024695,0.285200986,0.283486092,0.28187138,
			 0.280349037,0.27891198,0.277553785,0.276268614,0.275051153,0.273896563,0.272800426,0.271758707,
			 0.270767715,0.269824064,0.268924652,0.268066625,0.267247361,0.266464443,0.26571564,0.264998896,
			 0.264312306,0.263654108,0.26302267,0.262416477,0.26183412,0.261274291,0.260735771,0.260217427,
			 0.259718197,0.259237094,0.258773194,0.258325631,0.257893596,0.25747633,0.257073122,0.256683302,
			 0.256306244]),
			new Float64Array(
		    [1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1,1,1,1,1,1,1,1,
			 1])
			]
	});
}
CSGreen.prototype.setCAT = function() {
	var Ws = this.white;
	var Wd = this.shift();
	var s = this.mMult(this.M,Ws);
	var d = this.mMult(this.M,Wd);
	var M1 = this.mMult(this.mMult(new Float64Array([
		d[0]/s[0],	0,			0,
		0,			d[1]/s[1],	0,
		0,			0,			d[2]/s[2]
	]), this.M),this.fromSys);
	this.N = this.mMult(this.toSys,this.mMult(this.Minv,M1));
}
CSGreen.prototype.shift = function() {
	var T = (this.T-1800)/19200;
	var xyz1 = this.loci.lRCub(T-0.00005);
	var xyz2 = this.loci.lRCub(T+0.00005);
	var d = (xyz1[1]-xyz2[1])/(xyz2[0]-xyz1[0]);
	var x = -this.mag * 0.041048757* Math.pow(1/(1+(d*d)),0.5);
//	var x = -this.mag * 0.1 * Math.pow(1/(1+(d*d)),0.5);
	return new Float64Array([
		this.white[0] + x,
		this.white[1] + (x*d),
		this.white[2]
	]);
}
CSGreen.prototype.setGreen = function(dT,m) {
	this.T = dT * this.CCT;
	this.mag = m;
	this.setCAT();
}
CSGreen.prototype.lc = function(buff) {
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
}
// Colour Space Calculation Objects
function CSMatrix(name,params) {
	this.name = name;
	this.m = params;
}
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
}
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
}
function CSLUT(name,params) {
	this.name = name;
	this.lut = new LUTs();
	var xhr = new XMLHttpRequest();
	xhr.open('GET', params.filename, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = (function(lut) {
		var lut = lut;
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
}
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
}
function CSLA(name) {
	this.name = name;
}
CSLA.prototype.setLUT = function(lut) {
	this.lut = new LUTs();
	this.lut.setDetails(lut);
}
CSLA.prototype.setTitle = function(name) {
	this.name = name;
}
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
}
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
}
function CSCanonIDT(name, day, toSys) {
	this.name = name;
	this.day = day;
	this.toSys = toSys;
	this.setParams();
}
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
}
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
}
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
}
CSCanonIDT.prototype.lf = function(buff) {
	this.lc(buff);
}
// IO Functions
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
	out.twkCT = this.setCT(params);
	out.twkFL = this.setFL(params);
	out.twkASCCDL = this.setASCCDL(params);
	out.twkPSSTCDL = this.setPSSTCDL(params);
	out.twkHG = this.setHG(params);
	out.twkFC = this.setFC(params);
	if (typeof params.isTrans === 'boolean') {
		this.isTrans = params.isTrans;
	}
	this.ver = params.v;
	out.v = this.ver;
	return out;
}
LUTColourSpace.prototype.calc = function(p,t,i,g) {
	var buff = i.o;
	var o = new Float64Array(buff);
	var out = { p: p, t: t+20, v: this.ver, outGamut: this.curOut, o:buff};
	out.to = ['o'];
	if (g) {
		out.R = i.R;
		out.G = i.G;
		out.B = i.B;
		out.vals = i.vals;
		out.dim = i.dim;
	} else {
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
		if (this.doCT) {
			this.CAT.lc(buff);
		}
// Fluori Correction
		if (this.doFL) {
			this.green.lc(buff);
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
				m = Math.sqrt((Pb*Pb)+(Pr*Pr));
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
// Highlight Gamut
		if (this.doHG) {
			var h = new Float64Array(o);
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
}
LUTColourSpace.prototype.laCalc = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, dim: i.dim, gamma: i.gamma, gamut: i.gamut, legIn: i.legIn, o: i.o };
	this.csOut[i.gamut].lc(i.o);
	out.to = ['o'];
	return out;
}
LUTColourSpace.prototype.getLists = function(p,t) {
	return {
		p: p,
		t: t+20,
		v: this.ver,
		inList: this.inList,
		outList: this.outList,
		laList: this.laList,
		pass: this.pass,
		LA: this.LA
	};
}
LUTColourSpace.prototype.setLA = function(p,t,i) {
	this.csOut[this.LA].setLUT(i);
	return { p: p, t:t+20, v: this.ver, i: i.title };
}
LUTColourSpace.prototype.setLATitle = function(p,t,i) {
	this.csOut[this.LA].setTitle(i);
	return { p: p, t:t+20, v: this.ver, i: i };
}
LUTColourSpace.prototype.ioNames = function(p,t) {
	var out = {};
	out.inName = this.csIn[this.curIn].name;
	out.outName = this.csOut[this.curOut].name;
	out.hgName = this.csOut[this.curHG].name;
	return {p: p, t: t+20, v: this.ver, o: out};
}
LUTColourSpace.prototype.getCATs = function(p,t) {
	return {
		p: p,
		t: t+20,
		v: this.ver,
		o: [this.CAT.getModels(), this.green.getModels()]
	};
}
LUTColourSpace.prototype.previewLin = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, gamma: i.gamma, gamut: i.gamut, legal: i.legal, i: i.i, o: i.o };
	this.csIn[i.gamut].lc(i.o);
	out.to = ['i','o'];
	return out;
}
LUTColourSpace.prototype.getPrimaries = function(p,t) {
	var c = this.clrs.slice(0);
	this.csOut[this.curOut].lc(c);
	return {p: p, t: t+20, v: this.ver, o: c, to: ['o']};
}
LUTColourSpace.prototype.psstColours = function(p,t) {
	var out = { p: p, t: t+20, v: this.ver };
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
	out.b = bef64.buffer
	out.a = aft64.buffer
	out.to = ['b','a'];
	return out;
}
// Web Worker Messaging Functions
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
importScripts('lut.js','ring.js');
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
			case 5: sendMessage(cs.getLists(d.p,d.t)); 
					break;
			case 6: sendMessage(cs.setLA(d.p,d.t,d.d)); 
					break;
			case 7: sendMessage(cs.setLATitle(d.p,d.t,d.d)); 
					break;
			case 10:sendMessage(cs.ioNames(d.p,d.t));
					break;
			case 11:sendMessage(cs.getCATs(d.p,d.t));
					break;
			case 12:sendMessage(cs.calc(d.p,d.t,d.d,false)); 
					break;
			case 14:sendMessage(cs.previewLin(d.p,d.t,d.d));
					break;
			case 15:sendMessage(cs.getPrimaries(d.p,d.t));
					break;
			case 16:sendMessage(cs.psstColours(d.p,d.t));
					break;
		}
	}
}.bind(this), false);
