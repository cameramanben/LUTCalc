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
	this.systemMatrices();
	this.loadColourSpaces();
}
// Prepare Colour Spaces
LUTColourSpace.prototype.loadColourSpaces = function() {
	this.SG3C = this.csIn.length;
	this.csIn.push(this.toSys('Sony S-Gamut3.cine'));
	this.csIn.push(this.toSys('Sony S-Gamut3'));
	this.csIn.push(this.toSys('Sony S-Gamut3'));
	this.csIn.push(this.toSys('Alexa Wide Gamut'));
//	this.csIn.push(new LUTGamutCanonIDT('Canon CP IDT',{ camera: 0, day: true }));
	this.csIn.push(this.toSys('Canon Cinema Gamut'));
	this.csIn.push(this.toSys('Panasonic V-Gamut'));
	this.csIn.push(this.toSys('Rec709'));
	this.csIn.push(this.toSys('sRGB'));
	this.csIn.push(this.toSys('Rec2020'));
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
	this.csOut.push(this.fromSys('Sony S-Gamut3'));
	this.csOut.push(this.fromSys('Alexa Wide Gamut'));
	this.csOut.push(this.fromSys('Canon Cinema Gamut'));
	this.csOut.push(this.fromSys('Panasonic V-Gamut'));
	this.csOut.push(this.fromSys('Rec709'));
	this.csOut.push(this.fromSys('sRGB'));
	this.csOut.push(this.fromSys('Rec2020'));
	this.csOut.push(this.fromSys('ACES'));
	this.csOut.push(this.fromSys('XYZ'));
	this.csOut.push(this.fromSys('DCI-P3'));
	this.csOut.push(this.fromSys('DCI-P3D60'));
	this.csOut.push(this.fromSys('Canon DCI-P3+'));
	this.csOut.push(this.fromSys('Adobe RGB'));
	this.csOut.push(this.fromSys('Adobe Wide Gamut RGB'));
	this.csOut.push(new CSMatrix('Passthrough', new Float64Array([1,0,0, 0,1,0, 0,0,1])));
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
LUTColourSpace.prototype.toSys = function(title) {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
		if (title === this.g[j].title) {
			return new CSMatrix(title, this.g[j].toSys);
		}
	}
	return false;
}
LUTColourSpace.prototype.fromSys = function(title) {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
		if (title === this.g[j].title) {
			return new CSMatrix(title, this.mInverse(this.g[j].toSys));
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
	sgamut3cine.title = 'Sony S-Gamut3.cine';
	sgamut3cine.xy = new Float64Array([0.766,0.275, 0.225,0.800, 0.089,-0.087]);
	sgamut3cine.white = this.illuminant('d65');
	sgamut3cine.toXYZ = this.RGBtoXYZ(sgamut3cine.xy,sgamut3cine.white);
	this.g.push(sgamut3cine);
// S-Gamut3
	var sgamut3 = {};
	sgamut3.title = 'Sony S-Gamut3';
	sgamut3.xy = new Float64Array([0.730,0.280, 0.140,0.855, 0.100,-0.05]);
	sgamut3.white = this.illuminant('d65');
	sgamut3.toXYZ = this.RGBtoXYZ(sgamut3.xy,sgamut3.white);
	this.g.push(sgamut3);
// S-Gamut
	var sgamut = {};
	sgamut.title = 'Sony S-Gamut';
	sgamut.xy = new Float64Array([0.730,0.280, 0.140,0.855, 0.100,-0.05]);
	sgamut.white = this.illuminant('d65');
	sgamut.toXYZ = this.RGBtoXYZ(sgamut.xy,sgamut.white);
	this.g.push(sgamut);
// ALEXA Wide Gamut RGB
	var alexawgrgb = {};
	alexawgrgb.title = 'Alexa Wide Gamut';
	alexawgrgb.xy = new Float64Array([0.6840,0.3130, 0.2210,0.8480, 0.0861,-0.1020]);
	alexawgrgb.white = this.illuminant('d65');
	alexawgrgb.toXYZ = this.RGBtoXYZ(alexawgrgb.xy,alexawgrgb.white);
	this.g.push(alexawgrgb);
// Canon Cinema Gamut
	var canoncg = {};
	canoncg.title = 'Canon Cinema Gamut';
	canoncg.xy = new Float64Array([0.74,0.27, 0.17,1.14, 0.08,-0.10]);
	canoncg.white = this.illuminant('d65');
	canoncg.toXYZ = this.RGBtoXYZ(canoncg.xy,canoncg.white);
	this.g.push(canoncg);
// Panasonic V-Gamut
	var vgamut = {};
	vgamut.title = 'Panasonic V-Gamut';
	vgamut.xy = new Float64Array([0.730,0.280, 0.165,0.840, 0.100,-0.030]);
	vgamut.white = this.illuminant('d65');
	vgamut.toXYZ = this.RGBtoXYZ(vgamut.xy,vgamut.white);
	this.g.push(vgamut);
// Rec709
	var rec709 = {};
	rec709.title = 'Rec709';
	rec709.xy = new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]);
	rec709.white = this.illuminant('d65');
	rec709.toXYZ = this.RGBtoXYZ(rec709.xy,rec709.white);
	this.g.push(rec709);
// Rec2020
	var rec2020 = {};
	rec2020.title = 'Rec2020';
	rec2020.xy = new Float64Array([0.708,0.292, 0.170,0.797, 0.131,0.046]);
	rec2020.white = this.illuminant('d65');
	rec2020.toXYZ = this.RGBtoXYZ(rec2020.xy,rec2020.white);
	this.g.push(rec2020);
// sRGB
	var srgb = {};
	srgb.title = 'sRGB';
	srgb.xy = new Float64Array([0.64,0.33, 0.30,0.60, 0.15,0.06]);
	srgb.white = this.illuminant('d65');
	srgb.toXYZ = this.RGBtoXYZ(srgb.xy,srgb.white);
	this.g.push(srgb);
// ACES
	var aces = {};
	aces.title = 'ACES';
	aces.xy = new Float64Array([0.73470,0.26530, 0.00000,1.00000, 0.00010,-0.07700]);
	aces.white = new Float64Array([0.32168, 0.33767, 0.34065]);
	aces.toXYZ = this.RGBtoXYZ(aces.xy,aces.white);
	this.g.push(aces);
// XYZ
	var xyz = {};
	xyz.title = 'XYZ';
	xyz.xy = false;
	xyz.white = this.illuminant('d65');
	xyz.toXYZ = new Float64Array([1,0,0, 0,1,0, 0,0,1]);
	this.g.push(xyz);
// DCI-P3
	var p3 = {};
	p3.title = 'DCI-P3';
	p3.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3.white = new Float64Array([0.3140,0.3510,0.3350]);
	p3.toXYZ = this.RGBtoXYZ(p3.xy,p3.white);
	this.g.push(p3);
// DCI-P3D60
	var p3d60 = {};
	p3d60.title = 'DCI-P3D60';
	p3d60.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3d60.white = this.illuminant('d60');
	p3d60.toXYZ = this.RGBtoXYZ(p3d60.xy,p3d60.white);
	this.g.push(p3d60);
// Canon DCI-P3+
	var canonp3p = {};
	canonp3p.title = 'Canon DCI-P3+';
	canonp3p.xy = new Float64Array([0.74,0.27, 0.22,0.78, 0.09,-0.09]);
	canonp3p.white = new Float64Array([0.3140,0.3510,0.3350]);
	canonp3p.toXYZ = this.RGBtoXYZ(canonp3p.xy,canonp3p.white);
	this.g.push(canonp3p);
// Adobe RGB
	var adobergb = {};
	adobergb.title = 'Adobe RGB';
	adobergb.xy = new Float64Array([0.64,0.33, 0.21,0.71, 0.15,0.06]);
	adobergb.white = this.illuminant('d65');
	adobergb.toXYZ = this.RGBtoXYZ(adobergb.xy,adobergb.white);
	this.g.push(adobergb);
// Adobe Wide Gamut RGB
	var adobewg = {};
	adobewg.title = 'Adobe Wide Gamut RGB';
	adobewg.xy = new Float64Array([0.7347,0.2653, 0.1152,0.8264, 0.1566,0.0177]);
	adobewg.white = this.illuminant('d50');
	adobewg.toXYZ = this.RGBtoXYZ(adobewg.xy,adobewg.white);
	this.g.push(adobewg);

//	console.log(this.mMult(this.mInverse(this.xyz.aces),this.xyz.sgamut3));

}
LUTColourSpace.prototype.systemMatrices = function() {
	var max = this.g.length;
	for (var j=0; j<max; j++) {
		if (j === this.sysIdx) {
			this.g[j].toSys = new Float64Array([1,0,0, 0,1,0, 0,0,1]);
		} else if (this.g[j].title === 'XYZ') {
			this.g[j].toSys = this.system.inv;
		} else if (this.g[j].white[0] !== this.system.white[0] && this.g[j].white[1] !== this.system.white[1] && this.g[j].white[2] !== this.system.white[2]) {
			this.g[j].toSys = this.mMult(this.system.inv, this.ciecat02(this.g[j].toXYZ,this.g[j].white,this.system.white));
		} else {
			this.g[j].toSys = this.mMult(this.system.inv, this.g[j].toXYZ);
		}
	}
}
// Colour Space Calculation Objects
function CSMatrix(title,params) {
	this.title = title;
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


var cs = new LUTColourSpace();
