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
	this.ready = 0;
	
	this.lutMaker = new LUTs();
	this.g = [];
	this.csIn = [];
	this.csOut = [];
	this.csM = [];
	this.CATs = new CSCAT();
	// CIECAT02
	// CIECAT97s
	// Bradford Chromatic Adaptation
	// Von Kries
	// Sharp
	// CMCCAT2000
	// Bianco BS
	// Bianco BS-PC
	// XYZ Scaling
	this.sysCAT = 'CIECAT02';
	this.sysCATIdx = this.CATs.setDefault(this.sysCAT);
	this.matList = [];
	this.xyzMatrices();
	this.system = this.g[this.sysIdx];
	this.system.fromXYZ = this.mInverse(this.system.toXYZ);
	this.y = new Float64Array([	0.2126, 0.7152, 0.0722 ]);
	this.systemMatrices();
	this.setSaturated();
	this.Ys = {};
	this.setYCoeffs();

	this.defLUTs = {};

	this.nul = false;
	this.isTrans = false;
	this.ver = 0;
	this.curIn = 0;
	this.curOut = 0;
	this.planck = new Planck(this.lutMaker);
	this.system.CCT = this.planck.getCCT(this.system.white);
	this.system.Dxy = this.planck.getDxy(this.system.white,this.system.CCT);
	this.wb = new CSWB(this.system.white,this.system.toXYZ, this.planck, this.CATs);
	this.curHG = 0;
	this.hgLow = 0;
	this.hgHigh = 0;
	this.hgLin = true;
	this.hgLowStop = 0;
	this.hgHighStop = 0;
	this.sdrSatGamma = 1.2;
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
	this.gLimLin = false;
	this.gLimL = 1;
	this.gLimY = new Float64Array(this.y.buffer.slice(0));
	this.gLimGIn = 0;
	this.gLimGOut = 0;
	this.gLimC = false;
	this.gLimB = true;

	this.doHG = false;
	this.doWB = false;
	this.doASCCDL = false;
	this.doPSSTCDL = false;
	this.doGamutLim = false;
	this.doFC = false;

	this.loadColourSpaces();
	this.buildColourSquare();
	this.buildMultiColours();

	this.ready++;
	
}
// Prepare colour spaces
LUTColourSpace.prototype.subIdx = function(cat) {
	switch (cat) {
		case 'Sony': 		return 0;
		case 'ARRI': 		return 1;
		case 'Canon':		return 2;
		case 'Apple':		return 3;
		case 'Panasonic':	return 4;
		case 'Fujifilm':	return 5;
		case 'RED':			return 6;
		case 'DJI':			return 7;
		case 'GoPro':		return 8;
		case 'Blackmagic':	return 9;
		case 'Nikon':		return 10;
		case 'Bolex':		return 11;
		case 'Adobe':		return 12;
		case 'Rec709':		return 13;
		case 'Rec2020':		return 14;
		case 'Rec2100':		return 15;
		case 'P3':			return 16;
		case 'Wide Gamut':	return 17;
		case 'ACES':		return 18;
		case 'All':			return 19;
	}
	return false;
};
LUTColourSpace.prototype.loadColourSpaces = function() {
	this.subNames = [	'Sony',
						'ARRI',
						'Canon',
						'Apple',
						'Panasonic',
						'Fujifilm',
						'RED',
						'DJI',
						'GoPro',
						'Blackmagic',
						'Nikon',
						'Bolex',
						'Adobe',
						'Rec709',
						'Rec2020',
						'Rec2100',
						'P3',
						'Wide Gamut',
						'ACES',
						'All'
	];						
	this.SG3C = this.csIn.length;
	this.csIn.push(this.toSys('Sony S-Gamut3.cine'));
	this.csInSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Sony S-Gamut3.cine (Venice)'));
	this.csInSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Sony S-Gamut3'));
	this.csInSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Sony S-Gamut3 (Venice)'));
	this.csInSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Sony S-Gamut'));
	this.csInSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('ARRI Wide Gamut 4'));
	this.csInSub.push([this.subIdx('ARRI'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Alexa Wide Gamut'));
	this.csInSub.push([this.subIdx('ARRI'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Canon Cinema Gamut'));
	this.csInSub.push([this.subIdx('Canon'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Panasonic V-Gamut'));
	this.csInSub.push([this.subIdx('Panasonic'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Fujifilm F-Log Gamut'));
	this.csInSub.push([this.subIdx('Fujifilm'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Blackmagic Wide Gamut'));
	this.csInSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('DaVinci Wide Gamut'));
	this.csInSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Blackmagic 4.6k Film'));
	this.csInSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Blackmagic 4k Film'));
	this.csInSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Blackmagic Pocket 6k Film'));
	this.csInSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
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
	this.csIn.push(this.toSys('DJI D-Gamut'));
	this.csInSub.push([this.subIdx('DJI'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('DJI D-GamutM'));
	this.csInSub.push([this.subIdx('DJI'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Protune Native'));
	this.csInSub.push([this.subIdx('GoPro'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Bolex Wide Gamut'));
	this.csInSub.push([this.subIdx('Bolex'),this.subIdx('Wide Gamut')]);
	this.rec709In = this.csIn.length;
	this.csIn.push(this.toSys('Rec709'));
	this.csInSub.push([this.subIdx('Rec709'),this.subIdx('DJI')]);
	this.csIn.push(this.toSys('Rec2020'));
	this.csInSub.push([this.subIdx('Rec2020'),this.subIdx('Apple'),this.subIdx('Nikon'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('Rec2100'));
	this.csInSub.push([this.subIdx('Rec2100'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('sRGB'));
	this.csInSub.push([]);
	this.csIn.push(this.toSys('ACES AP0'));
	this.csInSub.push([this.subIdx('ACES'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('ACEScg AP1'));
	this.csInSub.push([this.subIdx('ACES'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('XYZ'));
	this.csInSub.push([this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('P3 - DCI'));
	this.csInSub.push([this.subIdx('P3')]);
	this.csIn.push(this.toSys('P3 - D60'));
	this.csInSub.push([this.subIdx('P3')]);
	this.csIn.push(this.toSys('P3 - D65'));
	this.csInSub.push([this.subIdx('P3')]);
	this.csIn.push(new CSCanonIDT('Canon CP IDT (Daylight)', true, this.toSys('ACES AP0').m, this.system.white.buffer.slice(0)));
	this.csInSub.push([this.subIdx('Canon'),this.subIdx('Rec709')]);
	this.csIn.push(new CSCanonIDT('Canon CP IDT (Tungsten)', false, this.toSys('ACES AP0').m, this.system.white.buffer.slice(0)));
	this.csInSub.push([this.subIdx('Canon'),this.subIdx('Rec709')]);
	this.csIn.push(this.toSys('Canon DCI-P3+'));
	this.csInSub.push([this.subIdx('Canon'),this.subIdx('P3')]);
	this.csIn.push(this.toSys('Adobe RGB'));
	this.csInSub.push([this.subIdx('Adobe')]);
	this.csIn.push(this.toSys('Adobe Wide Gamut RGB'));
	this.csInSub.push([this.subIdx('Adobe'),this.subIdx('Wide Gamut')]);
	this.csIn.push(this.toSys('ProPhoto RGB'));
	this.csInSub.push([this.subIdx('Wide Gamut')]);
	this.csIn.push(new CSLabSpace('CIELAB D65', 95.0489, 100.0, 108.8840, true, this.toSys('XYZ')));
	this.csInSub.push([this.subIdx('Wide Gamut')]);
	this.csIn.push(new CSLabSpace('CIELAB D50', 96.4212, 100.0, 82.5188, true, this.toSys('XYZ')));
	this.csInSub.push([this.subIdx('Wide Gamut')]);
	this.custIn = this.csIn.length;
	this.csIn.push(this.toSys('Custom In'));
	this.csInSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
	this.csIn.push(new CSMatrix('Passthrough', new Float64Array([1,0,0, 0,1,0, 0,0,1]), this.system.white.buffer.slice(0)));
	this.csInSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);

	this.csOut.push(this.fromSys('Sony S-Gamut3.cine'));
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Sony S-Gamut3.cine (Venice)'));
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Sony S-Gamut3'));
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Sony S-Gamut3 (Venice)'));
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Sony S-Gamut'));
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('ARRI Wide Gamut 4'));
	this.csOutSub.push([this.subIdx('ARRI'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Alexa Wide Gamut'));
	this.csOutSub.push([this.subIdx('ARRI'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Canon Cinema Gamut'));
	this.csOutSub.push([this.subIdx('Canon'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Panasonic V-Gamut'));
	this.csOutSub.push([this.subIdx('Panasonic'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Fujifilm F-Log Gamut'));
	this.csOutSub.push([this.subIdx('Fujifilm'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Blackmagic Wide Gamut'));
	this.csOutSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('DaVinci Wide Gamut'));
	this.csOutSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Blackmagic 4.6k Film'));
	this.csOutSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Blackmagic 4k Film'));
	this.csOutSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Blackmagic Pocket 6k Film'));
	this.csOutSub.push([this.subIdx('Blackmagic'),this.subIdx('Wide Gamut')]);
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
	this.csOut.push(this.fromSys('DJI D-Gamut'));
	this.csOutSub.push([this.subIdx('DJI'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('DJI D-GamutM'));
	this.csOutSub.push([this.subIdx('DJI'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Protune Native'));
	this.csOutSub.push([this.subIdx('GoPro'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Bolex Wide Gamut'));
	this.csOutSub.push([this.subIdx('Bolex'),this.subIdx('Wide Gamut')]);
	this.rec709Out = this.csIn.length;
	this.csOut.push(this.fromSys('Rec709'));
	this.csOutSub.push([this.subIdx('Rec709'),this.subIdx('DJI')]);
	this.defLUTs.Amira709 = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('Amira709',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('ARRI'),this.subIdx('Rec709')]);
	this.defLUTs.AlexaX2 = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('Alexa-X-2',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('ARRI'),this.subIdx('Rec709')]);

	this.defLUTs.s709 = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('s709',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Rec709')]);

	this.defLUTs.LC709 = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('LC709',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Rec709')]);
	this.defLUTs.LC709A = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('LC709A',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Rec709')]);
	this.defLUTs.Cine709 = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('Sony Cine+709',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('Sony'),this.subIdx('Rec709')]);
	this.defLUTs.cpoutdaylight = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('Canon CP IDT (Daylight)',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('Canon'),this.subIdx('Rec709')]);
	this.defLUTs.cpouttungsten = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('Canon CP IDT (Tungsten)',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('Canon'),this.subIdx('Rec709')]);
	this.defLUTs.V709 = this.csOut.length;
	this.csOut.push(
		this.fromSysLUT('Varicam V709',
			{
				format: 'cube',
				min: [0,0,0],
				max: [1,1,1],
				wp: this.illuminant('d65'),
				genInt: 1,
				preInt: 1
			}
		)
	);
	this.csOutSub.push([this.subIdx('Panasonic'),this.subIdx('Rec709')]);
	this.csOut.push(this.fromSys('Rec2020'));
	this.csOutSub.push([this.subIdx('Rec2020'),this.subIdx('Nikon'),this.subIdx('Apple'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('Rec2100'));
	this.csOutSub.push([this.subIdx('Rec2100'),this.subIdx('Wide Gamut')]);
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
	this.csOut.push(this.fromSys('P3 - DCI'));
	this.csOutSub.push([this.subIdx('P3')]);
	this.csOut.push(this.fromSys('P3 - D60'));
	this.csOutSub.push([this.subIdx('P3')]);
	this.csOut.push(this.fromSys('P3 - D65'));
	this.csOutSub.push([this.subIdx('P3')]);
	this.csOut.push(this.fromSys('Canon DCI-P3+'));
	this.csOutSub.push([this.subIdx('Canon'),this.subIdx('P3')]);
	this.csOut.push(this.fromSys('Adobe RGB'));
	this.csOutSub.push([this.subIdx('Adobe')]);
	this.csOut.push(this.fromSys('Adobe Wide Gamut RGB'));
	this.csOutSub.push([this.subIdx('Adobe'),this.subIdx('Wide Gamut')]);
	this.csOut.push(this.fromSys('ProPhoto RGB'));
	this.csOutSub.push([this.subIdx('Wide Gamut')]);
	this.csOut.push(new CSLabSpace('CIELAB D65', 95.0489, 100.0, 108.8840, false, this.fromSys('XYZ')));
	this.csOutSub.push([this.subIdx('Wide Gamut')]);
	this.csOut.push(new CSLabSpace('CIELAB D50', 96.4212, 100.0, 82.5188, false, this.fromSys('XYZ')));
	this.csOutSub.push([this.subIdx('Wide Gamut')]);
	this.custOut = this.csOut.length;
	this.csOut.push(this.toSys('Custom Out'));
	this.csOutSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
	this.pass = this.csOut.length;
	this.csOut.push(this.fromSysMatrix('Passthrough', new Float64Array([1,0,0, 0,1,0, 0,0,1]), this.system.white.buffer.slice(0)));
	this.csM.push(this.csOut[this.csOut.length - 1]);
	this.csOutSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
	this.LA = this.csOut.length;
	this.csOut.push(this.fromSysLA('LA', {wp: this.illuminant('d65')}));
	this.csOutSub.push([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);

	var max = this.csIn.length;
	this.inCATs = [];
	this.outCATs = [];
	for (var j=0; j<max; j++) {
		this.inList.push({name: this.csIn[j].name,idx: j});
		this.inCATs.push(this.getCSCat(this.csIn[j].name));
	}
	var max2 = this.csOut.length;
	for (var j=0; j<max2; j++) {
		if (j !== this.LA) {
			this.outList.push({name: this.csOut[j].name,idx: j});
		}
		this.outCATs.push(this.getCSCat(this.csOut[j].name));
	}
	max2 = this.outList.length;
	var k=0;
	for (var i=0; i<max; i++) {
		if (this.csIn[i].isMatrix() && this.csIn[i].name !== 'Passthrough') {
			this.laList.push({name: this.csIn[i].name});
			this.csLASub.push(this.csInSub[i].slice(0));
			if (this.laList[k].name === 'Custom In') {
				this.laList[k].idx = this.custOut;
				this.csLASub[k] = this.csOutSub[this.custOut].slice(0);
			} else {
				for (var j=0; j<max2; j++) {
					if (this.laList[k].name === this.outList[j].name) {
						this.laList[k].idx = this.outList[j].idx;
						this.csLASub[k] = this.csOutSub[j].slice(0);
						break;
					}
				}
			}
			k++;
		}
	}
};
LUTColourSpace.prototype.getCSCat = function(name) {
	var m = this.g.length;
	for (var j=0; j<m; j++) {
		if (name === this.g[j].name) {
			return this.g[j].cat;
		}
	}
	return this.sysCATIdx; // fall back to default
};
// Colour calculations
LUTColourSpace.prototype.RGBtoXYZ = function(xy, white) {
//	xy = [	xr, yr,
//			xg, yg,
//			xb, yb ]
//	white = [ xw, yw, zw ];
	if (typeof white === 'undefined' || !white) {
		return false;
	}
	var XYZ = new Float64Array([
		xy[0]/xy[1],			xy[2]/xy[3],			xy[4]/xy[5],
		1,						1,						1,
		(1-xy[0]-xy[1])/xy[1],	(1-xy[2]-xy[3])/xy[3],	(1-xy[4]-xy[5])/xy[5]
	]);
	var invXYZ = this.mInverse(XYZ);
	if (!invXYZ) {
		return false;
	}
	var S = this.mMult(invXYZ, new Float64Array([white[0]/white[1],1,white[2]/white[1]]));
	return new Float64Array([
		S[0]*XYZ[0], S[1]*XYZ[1], S[2]*XYZ[2],
		S[0]*XYZ[3], S[1]*XYZ[4], S[2]*XYZ[5],
		S[0]*XYZ[6], S[1]*XYZ[7], S[2]*XYZ[8]
	]);
};
LUTColourSpace.prototype.calcCAT = function(m, ws, wd, model) {
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
	var m = this.g.length;
	for (var j=0; j<m; j++) {
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
			this.Ys[name] = this.getYCoeffs(j);
// console.log(name);
// console.log(this.Ys[name]);
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
LUTColourSpace.prototype.fromSysLUT = function(name,params) {
	var colours = new Float64Array([
			1,0,0,
			0,1,0,
			0,0,1,
			1,1,1,
			0.8,0,0,
			0,0.8,0,
			0,0,0.8,
			0.4,0,0,
			0,0.4,0,
			0,0,0.4,
			0.2,0,0,
			0,0.2,0,
			0,0,0.2,
			0.8,0.8,0.8,
			0.4,0.4,0.4,
			0.2,0.2,0.2
		]);
	this.csIn[this.rec709In].lc(colours.buffer);
	var csLUT = new CSLUT(name, params, this.lutMaker, colours);
	this.csM.push(csLUT);	
	return csLUT;
};
LUTColourSpace.prototype.fromSysTC = function(name,params,xy,white,model) {
	var cat = this.CATs.getModel(model);
	var toXYZ = this.RGBtoXYZ(xy,white);
	this.csM.push(new CSMatrix(
		name,
		this.mInverse(this.mMult(this.system.fromXYZ, this.calcCAT(toXYZ,white,this.system.white,cat))),
		white
	));
	return new CSToneCurve(name, params);
};
LUTColourSpace.prototype.fromSysLA = function(name,params) {
	var colours = new Float64Array([
			1,0,0,
			0,1,0,
			0,0,1,
			1,1,1,
			0.8,0,0,
			0,0.8,0,
			0,0,0.8,
			0.4,0,0,
			0,0.4,0,
			0,0,0.4,
			0.2,0,0,
			0,0.2,0,
			0,0,0.2,
			0.8,0.8,0.8,
			0.4,0.4,0.4,
			0.2,0.2,0.2
		]);
	this.csIn[this.rec709In].lc(colours.buffer);
	var csLA = new CSLUT(name, params, this.lutMaker, colours);
	this.csM.push(csLA);
	return csLA;
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
			Y = ((y[0]*o[j])+(y[1]*o[j+1])+(y[2]*o[j+2])) * (1-this.asc[9]);
			o[ j ] = Y + (this.asc[9]*o[ j ]);
			o[j+1] = Y + (this.asc[9]*o[j+1]);
			o[j+2] = Y + (this.asc[9]*o[j+2]);
		}
	}
	this.csM[this.curOut].lc(buff);
	return o;
};
LUTColourSpace.prototype.rx = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var y = this.y;
	var Y;
	this.csM[this.curOut].rc(buff);
// Colour Temperature Shift
	if (this.doWB) {
		this.wb.rc(buff);
	}
// ASC-CDL
	if (this.doASCCDL) {
		var s = 1/Math.max(this.asc[9],0.00000001); // avoid division by zero
		for (var j=0; j<m; j += 3) {
			Y = ((y[0]*o[j])+(y[1]*o[j+1])+(y[2]*o[j+2])) * (1-s);
			o[ j ] = (o[ j ]*s) + Y;
			o[j+1] = (o[j+1]*s) + Y;
			o[j+2] = (o[j+2]*s) + Y;
			o[ j ] = ((o[ j ]<0)?o[ j ]:Math.pow(o[ j ],1/this.asc[6]));
			o[ j ] = (o[ j ] - this.asc[3])/this.asc[0];
			o[ j ] = (isNaN(o[ j ])?0:o[ j ]);
			o[j+1] = ((o[j+1]<0)?o[j+1]:Math.pow(o[j+1],1/this.asc[7]));
			o[j+1] = (o[j+1] - this.asc[4])/this.asc[1];
			o[j+1] = (isNaN(o[j+1])?0:o[j+1]);
			o[j+2] = ((o[j+2]<0)?o[j+2]:Math.pow(o[j+2],1/this.asc[8]));
			o[j+2] = (o[j+2] - this.asc[5])/this.asc[2];
			o[j+2] = (isNaN(o[j+2])?0:o[j+2]);
		}
	}
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
LUTColourSpace.prototype.mInverse = function(M) {
	var det =	(M[0]*((M[4]*M[8]) - (M[5]*M[7]))) -
				(M[1]*((M[3]*M[8]) - (M[5]*M[6]))) +
				(M[2]*((M[3]*M[7]) - (M[4]*M[6])));
	if (det === 0) {
		return false;
	}
	return new Float64Array([
		((M[4]*M[8])-(M[5]*M[7]))/det, ((M[2]*M[7])-(M[1]*M[8]))/det, ((M[1]*M[5])-(M[2]*M[4]))/det,
		((M[5]*M[6])-(M[3]*M[8]))/det, ((M[0]*M[8])-(M[2]*M[6]))/det, ((M[2]*M[3])-(M[0]*M[5]))/det,
		((M[3]*M[7])-(M[4]*M[6]))/det, ((M[1]*M[6])-(M[0]*M[7]))/det, ((M[0]*M[4])-(M[1]*M[3]))/det
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
// Venice S-Gamut3.cine
	var vsgamut3cine = {};
	vsgamut3cine.name = 'Sony S-Gamut3.cine (Venice)';
	vsgamut3cine.cat = this.CATs.modelIdx('CIECAT02');
	vsgamut3cine.xy = new Float64Array([0.775901872,0.274502393,	0.188682903,0.828684937,	0.101337383,-0.089187517]);
	vsgamut3cine.white = this.illuminant('d65');
	vsgamut3cine.toXYZ = this.RGBtoXYZ(vsgamut3cine.xy,vsgamut3cine.white);
	this.g.push(vsgamut3cine);
// S-Gamut3
	var sgamut3 = {};
	sgamut3.name = 'Sony S-Gamut3';
	sgamut3.cat = this.CATs.modelIdx('CIECAT02');
	sgamut3.xy = new Float64Array([0.730,0.280, 0.140,0.855, 0.100,-0.05]);
	sgamut3.white = this.illuminant('d65');
	sgamut3.toXYZ = this.RGBtoXYZ(sgamut3.xy,sgamut3.white);
	this.g.push(sgamut3);
// Venice S-Gamut3
	var vsgamut3 = {};
	vsgamut3.name = 'Sony S-Gamut3 (Venice)';
	vsgamut3.cat = this.CATs.modelIdx('CIECAT02');
	vsgamut3.xy = new Float64Array([0.740464264,0.279364375,	0.089241145,0.893809529,	0.110488237,-0.052579333]);
	vsgamut3.white = this.illuminant('d65');
	vsgamut3.toXYZ = this.RGBtoXYZ(vsgamut3.xy,vsgamut3.white);
	this.g.push(vsgamut3);
// S-Gamut
	var sgamut = {};
	sgamut.name = 'Sony S-Gamut';
	sgamut.cat = this.CATs.modelIdx('CIECAT02');
	sgamut.xy = new Float64Array([0.730,0.280, 0.140,0.855, 0.100,-0.05]);
	sgamut.white = this.illuminant('d65');
	sgamut.toXYZ = this.RGBtoXYZ(sgamut.xy,sgamut.white);
	this.g.push(sgamut);
// ARRI Wide Gamut 4
	var arriwg4 = {};
	arriwg4.name = 'ARRI Wide Gamut 4';
	arriwg4.cat = this.CATs.modelIdx('CIECAT02');
	arriwg4.xy = new Float64Array([0.7347,0.2653, 0.1424,0.8576, 0.0991,-0.0308]);
	arriwg4.white = this.illuminant('d65');
	arriwg4.toXYZ = this.RGBtoXYZ(arriwg4.xy,arriwg4.white);
	this.g.push(arriwg4);
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
	canoncg.cat = this.CATs.modelIdx('CIECAT02');
	canoncg.xy = new Float64Array([0.74,0.27, 0.17,1.14, 0.08,-0.10]);
	canoncg.white = this.illuminant('d65');
	canoncg.toXYZ = this.RGBtoXYZ(canoncg.xy,canoncg.white);
	this.g.push(canoncg);
// Blackmagic Wide Gamut
	var blackmagicwg = {};
	blackmagicwg.name = 'Blackmagic Wide Gamut';
	blackmagicwg.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	blackmagicwg.xy = new Float64Array([0.7177215,0.3171181, 0.2280410,0.8615690, 0.1005841,-0.0820452]);
	blackmagicwg.white = new Float64Array([ 0.3127170, 0.3290312, 0.3582518 ]);
	blackmagicwg.toXYZ = this.RGBtoXYZ(blackmagicwg.xy,blackmagicwg.white);
	this.g.push(blackmagicwg);
// DaVinci Wide Gamut
	var davinciwg = {};
	davinciwg.name = 'DaVinci Wide Gamut';
	davinciwg.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	davinciwg.xy = new Float64Array([0.8000,0.3130, 0.1682,0.9877, 0.0790,-0.1155]);
	davinciwg.white = this.illuminant('d65');
	davinciwg.toXYZ = this.RGBtoXYZ(davinciwg.xy,davinciwg.white);
	this.g.push(davinciwg);
// Panasonic V-Gamut
	var vgamut = {};
	vgamut.name = 'Panasonic V-Gamut';
	vgamut.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	vgamut.xy = new Float64Array([0.730,0.280, 0.165,0.840, 0.100,-0.030]);
	vgamut.white = this.illuminant('d65');
	vgamut.toXYZ = this.RGBtoXYZ(vgamut.xy,vgamut.white);
	this.g.push(vgamut);
// BMD 4k Film
	var bmd4k = {};
	bmd4k.name = 'Blackmagic 4k Film';
	bmd4k.cat = this.CATs.modelIdx('CIECAT02');
	bmd4k.xy = new Float64Array([1.065485164,0.395870911, 0.369219642,0.778131628, 0.095906214,0.033373394]);
	bmd4k.white = new Float64Array([ 0.313122422, 0.32974025, 0.357137329 ]);
	bmd4k.toXYZ = this.RGBtoXYZ(bmd4k.xy,bmd4k.white);
	this.g.push(bmd4k);
// BMD 4.6k Film
	var bmd46k = {};
	bmd46k.name = 'Blackmagic 4.6k Film';
	bmd46k.cat = this.CATs.modelIdx('CIECAT02');
	bmd46k.xy = new Float64Array([0.860834693,0.368871184, 0.328213148,0.615592065, 0.07825175,-0.023256123]);
	bmd46k.white = this.illuminant('d65');
	bmd46k.toXYZ = this.RGBtoXYZ(bmd46k.xy,bmd46k.white);
	this.g.push(bmd46k);
// BMD Pocket 6k Film
	var bmdp6k = {};
	bmdp6k.name = 'Blackmagic Pocket 6k Film';
	bmdp6k.cat = this.CATs.modelIdx('CIECAT02');
	bmdp6k.xy = new Float64Array([0.720597149,0.329307006, 0.298281489,0.629701953, 0.132079051,0.031392256]);
	bmdp6k.white = this.illuminant('d65');
	bmdp6k.toXYZ = this.RGBtoXYZ(bmdp6k.xy,bmdp6k.white);
	this.g.push(bmdp6k);
// Fujifilm F-Log Gamut
	var fgamut = {};
	fgamut.name = 'Fujifilm F-Log Gamut';
	fgamut.cat = this.sysCATIdx;
	fgamut.xy = new Float64Array([0.70800,0.29200, 0.17000,0.79700, 0.13100,0.04600]);
	fgamut.white = this.illuminant('d65');
	fgamut.toXYZ = this.RGBtoXYZ(fgamut.xy,fgamut.white);
	this.g.push(fgamut);
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
// Bolex
	var bolex = {};
	bolex.name = 'Bolex Wide Gamut';
	bolex.cat = this.CATs.modelIdx('Bradford Chromatic Adaptation');
	bolex.xy = new Float64Array([0.73000,0.29400, 0.22300,0.82000, 0.10300,-0.05500]);
	bolex.white = this.illuminant('d65');
	bolex.toXYZ = this.RGBtoXYZ(bolex.xy,bolex.white);
	this.g.push(bolex);
// DJI D-Gamut
	var djidgamut = {};
	djidgamut.name = 'DJI D-Gamut';
	djidgamut.cat = this.sysCATIdx;
	djidgamut.xy = new Float64Array([0.71,0.31, 0.21,0.88, 0.09,-0.08]);
	djidgamut.white = this.illuminant('d65');
	djidgamut.toXYZ = this.RGBtoXYZ(djidgamut.xy,djidgamut.white);
	this.g.push(djidgamut);
// DJI D-GamutM
	var djidgamutm = {};
	djidgamutm.name = 'DJI D-GamutM';
	djidgamutm.cat = this.sysCATIdx;
	djidgamutm.xy = new Float64Array([0.721565,0.305591,0.229956,0.802053,0.074012,-0.056283]);
	djidgamutm.white = this.illuminant('d65');
	djidgamutm.toXYZ = this.RGBtoXYZ(djidgamutm.xy,djidgamutm.white);
	this.g.push(djidgamutm);
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
// Rec2100
	var rec2100 = {};
	rec2100.name = 'Rec2100';
	rec2100.cat = this.sysCATIdx;
	rec2100.xy = new Float64Array([0.708,0.292, 0.170,0.797, 0.131,0.046]);
	rec2100.white = this.illuminant('d65');
	rec2100.toXYZ = this.RGBtoXYZ(rec2100.xy,rec2100.white);
	this.g.push(rec2100);
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
	this.xyzIdx = this.g.length;
	this.g.push(xyz);
// P3 - DCI
	var p3 = {};
	p3.name = 'P3 - DCI';
	p3.cat = this.sysCATIdx;
	p3.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3.white = this.illuminant('p3');
	p3.toXYZ = this.RGBtoXYZ(p3.xy,p3.white);
	this.g.push(p3);
// P3 - D60
	var p3d60 = {};
	p3d60.name = 'P3 - D60';
	p3d60.cat = this.sysCATIdx;
	p3d60.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3d60.white = this.illuminant('d60');
	p3d60.toXYZ = this.RGBtoXYZ(p3d60.xy,p3d60.white);
	this.g.push(p3d60);
// P3 - D65
	var p3d65 = {};
	p3d65.name = 'P3 - D65';
	p3d65.cat = this.sysCATIdx;
	p3d65.xy = new Float64Array([0.680,0.320, 0.265,0.690, 0.150,0.060]);
	p3d65.white = this.illuminant('d65');
	p3d65.toXYZ = this.RGBtoXYZ(p3d65.xy,p3d65.white);
	this.g.push(p3d65);
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
			this.g[j].toSys = this.system.fromXYZ;
		} else if (this.g[j].white[0] !== this.system.white[0] && this.g[j].white[1] !== this.system.white[1] && this.g[j].white[2] !== this.system.white[2]) {
			this.g[j].toSys = this.mMult(this.system.fromXYZ, this.calcCAT(this.g[j].toXYZ,this.g[j].white,this.system.white,this.g[j].cat));
		} else {
			this.g[j].toSys = this.mMult(this.system.fromXYZ, this.g[j].toXYZ);
		}
		// console.log(this.g[j].name);
		// console.log(this.g[j].toXYZ);
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
LUTColourSpace.prototype.calcYCoeffs = function(cs) {
	var cur = this.curOut;
	if (typeof cs !== 'undefined') {
		var m = this.csOut.length;
		for (var j=0; j<m; j++) {
			if (this.csOut[j].name === cs) {
				cur = j;
			}
		}
	}
	var g = new Float64Array([ // The output gamut - these values to be converted to XYZ then xy
		1,0,0,
		0,1,0,
		0,0,1
	]);
	var xy = new Float64Array(9);
	var l,den;
	var wd,ws;
	var XYZ;
//	this.rx(g.buffer);
	this.csM[cur].rc(g.buffer);
	this.csOut[this.XYZOut].lc(g.buffer);
	wd = this.csOut[cur].getWP();
	ws = this.system.white;
	for (var j=0; j<3; j++) {
		k = j*3;
		XYZ = this.calcCAT(new Float64Array([g[k],g[k+1],g[k+2]]),ws,wd,this.outCATs[cur]);
		den = XYZ[0] + XYZ[1] + XYZ[2];
		xy[ k ] = (XYZ[0]/den);
		xy[k+1] = (XYZ[1]/den);
		xy[k+2] = (XYZ[2]/den);
	}
	var C = new Float64Array([
		xy[0],xy[3],xy[6],
		xy[1],xy[4],xy[7],
		xy[2],xy[5],xy[8]
	]);
	var invC = this.mInverse(C);
	var W = new Float64Array([wd[0]/wd[1],1,(1-wd[0]-wd[1])/wd[1]]);
	var J = this.mMult(invC,W);
	return new Float64Array([J[0]*C[3],J[1]*C[4],J[2]*C[5]]);
};
LUTColourSpace.prototype.setYCoeffs = function() {
	this.y = this.getYCoeffs(this.system.name);
};
LUTColourSpace.prototype.getYCoeffs = function(cs) {
	var xy,w;
	if (typeof cs === 'number') {
		xy = this.g[cs].xy;
		w = this.g[cs].white;
	} else {
		var m = this.g.length;
		for (var j=0; j<m; j++) {
			if (this.g[j].name === cs) {
				xy = this.g[j].xy;
				w = this.g[j].white;
			}
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
//	console.log(W);
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

		var edit = {};
		var customIn = {};
		var customOut = {};

		if (!p.edit.isMatrix && p.lock) {
			edit.xy = new Float64Array([
				p.edit.rx, p.edit.ry,
				p.edit.gx, p.edit.gy,
				p.edit.bx, p.edit.by
			]);
			edit.white = new Float64Array([
				p.edit.wx, p.edit.wy, 1 - p.edit.wx - p.edit.wy
			]);
			edit.toXYZ = this.RGBtoXYZ(edit.xy,edit.white);
			if (p.edit.wcs === this.xyzIdx) {
				this.edMatrix = this.RGBtoXYZ(edit.xy,edit.white);
			} else {
				this.edMatrix = this.mMult(this.mInverse(this.g[p.edit.wcs].toXYZ), this.calcCAT(edit.toXYZ,edit.white,this.g[p.edit.wcs].white,modelEdit));
			}
			out.editMatrix = new Float64Array(this.edMatrix.buffer.slice(0));
			out.wcs = p.edit.wcs;
			out.xyVals = edit.xy;
		} else if (p.edit.isMatrix) {
// primaries from matrix and white point code would go here!
			edit.white = new Float64Array([
				p.edit.wx, p.edit.wy, 1 - p.edit.wx - p.edit.wy
			]);
			var editToXYZ = this.calcCAT(
				this.mMult(this.g[p.edit.wcs].toXYZ,p.edit.matrix),
				this.g[p.edit.wcs].white,
				edit.white,
				modelIn
			);
			var mu = new Float64Array([
				(editToXYZ[0]+editToXYZ[3]+editToXYZ[6]),
				(editToXYZ[1]+editToXYZ[4]+editToXYZ[7]),
				(editToXYZ[2]+editToXYZ[5]+editToXYZ[8])
			]);
			edit.xy = new Float64Array([
				Math.round(editToXYZ[0]/mu[0]*10000000)/10000000, Math.round(editToXYZ[3]/mu[0]*10000000)/10000000,
				Math.round(editToXYZ[1]/mu[1]*10000000)/10000000, Math.round(editToXYZ[4]/mu[1]*10000000)/10000000,
				Math.round(editToXYZ[2]/mu[2]*10000000)/10000000, Math.round(editToXYZ[5]/mu[2]*10000000)/10000000
			]);
			out.xyVals = edit.xy;
		}

		if (p.input.isMatrix) {
			customIn.white = new Float64Array([ p.input.wx, p.input.wy, 1 - p.input.wx - p.input.wy ]);
			if (p.input.wcs === this.xyzIdx) {
				var inWCSToSys = this.system.fromXYZ;
			} else {
				var inWCSToSys = this.mMult(
					this.system.fromXYZ,
					this.calcCAT(
						this.g[p.input.wcs].toXYZ,
						this.g[p.input.wcs].white,
						this.system.white,
						modelIn
					)
				);
			}
			customIn.toSys = this.mMult(inWCSToSys, p.input.matrix);
		} else {
			customIn.white = new Float64Array([ p.input.wx, p.input.wy, 1 - p.input.wx - p.input.wy ]);
			customIn.xy = new Float64Array([
				p.input.rx, p.input.ry,
				p.input.gx, p.input.gy,
				p.input.bx, p.input.by
			]);
			customIn.toXYZ = this.RGBtoXYZ(customIn.xy,customIn.white);
			customIn.toSys = this.mMult(
				this.system.fromXYZ,
				this.calcCAT(
					customIn.toXYZ,
					customIn.white,
					this.system.white,
					modelIn
				)
			);
		}

		if (p.output.isMatrix) {
			customOut.white = new Float64Array([ p.output.wx, p.output.wy, 1 - p.output.wx - p.output.wy ])
			if (p.output.wcs === this.xyzIdx) {
				var outWCSFromSys = this.system.toXYZ;
			} else {
				var outWCSFromSys = this.mInverse(this.mMult(
					this.system.fromXYZ,
					this.calcCAT(
						this.g[p.output.wcs].toXYZ,
						this.g[p.output.wcs].white,
						this.system.white,
						modelOut
					)
				));
			}
			customOut.fromSys = this.mMult(p.output.matrix, outWCSFromSys);
		} else {
			customOut.white = new Float64Array([ p.output.wx, p.output.wy, 1 - p.output.wx - p.output.wy ])
			customOut.xy = new Float64Array([
				p.output.rx, p.output.ry,
				p.output.gx, p.output.gy,
				p.output.bx, p.output.by
			]);
			customOut.toXYZ = this.RGBtoXYZ(customOut.xy,customOut.white);
			customOut.fromSys = this.mInverse(this.mMult(
				this.system.fromXYZ,
				this.calcCAT(
					customOut.toXYZ,
					customOut.white,
					this.system.white,
					modelOut
				)
			));
		}

		this.csIn[this.custIn] = new CSMatrix(
			'Custom',
			customIn.toSys,
			customIn.white.buffer
		);
		this.csOut[this.custOut] = new CSMatrix(
			'Custom',
			customOut.fromSys,
			customOut.white.buffer
		);
		this.csM[this.custOut] = this.csOut[this.custOut];

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
LUTColourSpace.prototype.setSDRSat = function(params) {
	var out = {};
	this.doSDRSat = false;
	if (this.tweaks && typeof params.twkSDRSat !== 'undefined') {
		var p = params.twkSDRSat;
		if (typeof p.doSDRSat === 'boolean' && p.doSDRSat) {
			this.doSDRSat = true;
			if (typeof p.gamma === 'number') {
				this.sdrSatGamma = p.gamma;
			}
		}
	}
	out.doSDRSat = this.doSDRSat;
	return out;
};
LUTColourSpace.prototype.setGamutLim = function(params) {
	var out = {};
	this.doGamutLim = false;
	if (this.tweaks && typeof params.twkGamutLim !== 'undefined') {
		var p = params.twkGamutLim;
		if (typeof p.doGamutLim === 'boolean' && p.doGamutLim) {
			this.doGamutLim = true;
			this.gLimY = this.calcYCoeffs();
			if (typeof p.gamut === 'string') {
				this.gLimC = false;
				this.gLimB = true;
				var m = this.csOut.length;
				for (var j=0; j<m; j++) {
					if (this.csOut[j].name === p.gamut) {
						if (j === this.curOut) {
							this.gLimGIn = 0;
							this.gLimGOut = this.curOut;
							break;
						} else {
							this.gLimGOut = j;
							var m2 = this.csIn.length;
							for (var k=0; k<m2; k++) {
								if (this.csIn[k].name === this.csOut[this.curOut].name) {
									this.gLimGIn = k;
									this.gLimC = true;
									this.gLimB = p.both;
									break;
								}
							}
						}
						break;
					}
				}
			} else {
				this.gLimC = false;
			}
			if (typeof p.lin === 'boolean') {
				this.gLimLin = p.lin;
			} else {
				this.gLimLin = false;
			}
			if (typeof p.level === 'number') {
				this.gLimL = parseFloat(p.level);
			}
		}
	}
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
LUTColourSpace.prototype.FCOut = function(buff,out) {
	var o = new Float64Array(buff);
	var m = o.length;
	var y = this.y;
	var Y;
	var fc = new Uint8Array(m/3);
	out.fc = fc.buffer;
	out.to.push('fc');
	var k;
	for (var j=0; j<m; j += 3) {
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
};
LUTColourSpace.prototype.PSSTCDLOut = function(buff) {
	var o = new Float64Array(buff);
	var max = o.length;
	var y = this.y;
	var Y;
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
		f = this.psstF.fCub(h);
		y1 = this.psstY.fLin(f);
		m1 = this.psstM.fLin(f);
		col = this.psstC.fCub(f);
		sat = Math.max(0,this.psstSat.fCub(f));
		S = Math.max(0,this.psstS.fCub(f));
		O = this.psstO.fCub(f);
		P = Math.max(0,this.psstP.fCub(f));
		f = (f+col)%1;
		if (this.psstYC) {
			y2 = this.psstY.fLin(f);
		} else {
			y2 = y1;
		}
		if (this.psstMC) {
			m2 = this.psstM.fLin(f);
		} else {
			m2 = m1;
		}
		M = m*sat*m2/m1;
		a = this.psstB.fCub(f);
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
};
LUTColourSpace.prototype.ASCCDLOut = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var y = this.y;
	var Y;
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
};
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
LUTColourSpace.prototype.HGOut = function(buff,g) {
	var o = new Float64Array(buff);
	var m = o.length;
	var y = this.y;
	var Y,r;
	var h = new Float64Array(o.buffer.slice(0));
	if (typeof g === 'boolean' && g) {
		this.csOut[this.curOut].lc(buff);
		this.csOut[this.curHG].lc(h.buffer);
	} else {
		this.csOut[this.curOut].lf(buff);
		this.csOut[this.curHG].lf(h.buffer);
	}
	for (var j=0; j<m; j += 3) {
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
};
LUTColourSpace.prototype.SDRSatOut = function(buff) {
	if (typeof this.Ys[this.csOut[this.curOut].name] !== 'undefined') {
		var o = new Float64Array(buff);
		var m = o.length;
		var y = this.Ys[this.csOut[this.curOut].name];
		var Y, Pb, Pr;
		var R,G,B;
		var Db = 2*(1-y[2]);
		var Dr = 2*(1-y[0]);
		var gi = this.sdrSatGamma;
		var g = 1/gi;
		for (var j=0; j<m; j += 3) {
			R = ((o[ j ]<0)?o[ j ]/12:Math.pow(o[ j ]/12,g));
			R = (isNaN(R)?0:R);
			G = ((o[j+1]<0)?o[j+1]/12:Math.pow(o[j+1]/12,g));
			G = (isNaN(G)?0:G);
			B = ((o[j+2]<0)?o[j+2]/12:Math.pow(o[j+2]/12,g));
			B = (isNaN(B)?0:B);
			Y = (y[0]*R)+(y[1]*G)+(y[2]*B);
			if (Y>0) {
				Pb = (B-Y)/Db;
				Pr = (R-Y)/Dr;
				Y = Math.pow(Y,gi);
				o[ j ] = (Pr * Dr) + Y;
				o[j+2] = (Pb * Db) + Y;
				o[j+1] = (Y - (y[0]*o[ j ]) -(y[2]*o[j+2]))/y[1];
				o[ j ] *= 12;
				o[j+1] *= 12;
				o[j+2] *= 12;
			}
		}
	}
};
LUTColourSpace.prototype.gamutLimOut = function(buff,out) {
	var o = new Float64Array(buff);
	var max = o.length;
	var y = this.y;
	var Y,k;
	if (this.gLimLin) { // Linear Space
		out.doGamutLim = false;
		if (this.gLimC) { // Secondary colourspace to protect 
			for (var j=0; j<max; j++) {
				o[ j ] = Math.max(0, o[ j ]);
			}
			var og = new Float64Array(o.buffer.slice(0));
			this.csIn[this.gLimGIn].lc(og.buffer);
			this.csOut[this.gLimGOut].lc(og.buffer);
			var gMX, gMN, gSat;
			var gY = this.gLimY;
			var gL = this.gLimL;
			if (this.gLimB) { // Protect both Primary and Secondary
				var gMX2, gMN2;
				for (var j=0; j<max; j += 3) {
					k = parseInt(j/3);
					gMX = Math.max(o[ j ], o[j+1], o[j+2]);
					gMN = Math.min(o[ j ], o[j+1], o[j+2]);
					gMX2 = Math.max(og[ j ], og[j+1], og[j+2]);
					gMN2 = Math.min(og[ j ], og[j+1], og[j+2]);
					gSat = Math.max(gMX - gMN, gMX2 - gMN2)/gL ;
					if (gSat > 1) {
						Y = (gY[0]*o[j])+(gY[1]*o[j+1])+(gY[2]*o[j+2]);
						o[ j ] = Y + ((o[ j ]-Y)/gSat);
						o[j+1] = Y + ((o[j+1]-Y)/gSat);
						o[j+2] = Y + ((o[j+2]-Y)/gSat);
					}
				}
			} else { // Protect Secondary only
				for (var j=0; j<max; j += 3) {
					k = parseInt(j/3);
					gMX = Math.max(og[ j ], og[j+1], og[j+2]);
					gMN = Math.min(og[ j ], og[j+1], og[j+2]);
					gSat = (gMX - gMN)/gL;
					if (gSat > 1) {
						Y = (gY[0]*o[j])+(gY[1]*o[j+1])+(gY[2]*o[j+2]);
						o[ j ] = Y + ((o[ j ]-Y)/gSat);
						o[j+1] = Y + ((o[j+1]-Y)/gSat);
						o[j+2] = Y + ((o[j+2]-Y)/gSat);
					}
				}
			}
		} else { // Protect Primary
			var gMX, gMN;
			var gSat;
			var gY = this.gLimY;
			var gL = this.gLimL;
			for (var j=0; j<max; j += 3) {
				k = parseInt(j/3);
				o[ j ] = Math.max(0, o[ j ]);
				o[j+1] = Math.max(0, o[j+1]);
				o[j+2] = Math.max(0, o[j+2]);
				gMX = Math.max(o[ j ], o[j+1], o[j+2]);
				if (gMX > gL) {
					gMN = Math.min(o[ j ], o[j+1], o[j+2]);
					gSat = (gMX - gMN)/gL;
					if (gSat > 1) {
						Y = (gY[0]*o[j])+(gY[1]*o[j+1])+(gY[2]*o[j+2]);
						o[ j ] = Y + ((o[ j ]-Y)/gSat);
						o[j+1] = Y + ((o[j+1]-Y)/gSat);
						o[j+2] = Y + ((o[j+2]-Y)/gSat);
					}
				}
			}
		}
	} else { // Post Gamma
		out.doGamutLim = true;
		out.gLimY = this.gLimY;
		out.gLimL = this.gLimL;
		if (this.gLimC) { // Secondary colourspace to protect
			var og = new Float64Array(o.buffer.slice(0));
			this.csIn[this.gLimGIn].lc(og.buffer);
			this.csOut[this.gLimGOut].lc(og.buffer);
			out.og = og.buffer;
			out.to.push('og');
			out.gLimB = this.gLimB;
		}
	} // Default protects Primary
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
	var xy0 = this.lut.fRGBCub(T0);
	var uv0 = new Float64Array([
		4 * xy0[0] / ((-2*xy0[0]) + (12*xy0[1]) + 3),
		6 * xy0[1] / ((-2*xy0[0]) + (12*xy0[1]) + 3)
	]);
	var xy1 = this.lut.fRGBCub(T1);
	var uv1 = new Float64Array([
		4 * xy1[0] / ((-2*xy1[0]) + (12*xy1[1]) + 3),
		6 * xy1[1] / ((-2*xy1[0]) + (12*xy1[1]) + 3)
	]);
	var d0 = Math.pow(Math.pow(this.u - uv0[0],2) + Math.pow(this.v - uv0[1],2),0.5);
	var d1 = Math.pow(Math.pow(this.u - uv1[0],2) + Math.pow(this.v - uv1[1],2),0.5);
	return (d0-d1)*10;
};
function Planck(lutMaker) {
	this.setLoci(lutMaker);
	this.slope = new CCTxy(this.loci);
	this.brent = new Brent(this.slope,0,50000);
	this.brent.setDelta(1000);
}
Planck.prototype.setLoci = function(lutMaker) {
	this.loci = lutMaker.newLUT({
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
				xy = this.loci.fRGBCub(root);
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
	var xy = this.loci.fRGBCub(T);
	var xy1 = this.loci.fRGBCub(T + 0.1);
	var xy2 = this.loci.fRGBCub(T - 0.1);
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
	var xyY = this.loci.fRGBCub(T);
	var xyY1 = this.loci.fRGBCub(T + 0.1);
	var xyY2 = this.loci.fRGBCub(T - 0.1);
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
	var out = this.loci.fRGBCub(T);
	out[2] = 1;
	return out;
};
Planck.prototype.xyz = function(T) {
	var xyY = this.loci.fRGBCub(T);
	return new Float64Array([
		xyY[0],xyY[1],1-xyY[0]-xyY[1]
	]);
};
Planck.prototype.XYZ = function(T) {
	var xyY = this.loci.fRGBCub(T);
	return new Float64Array([
		xyY[0]/xyY[1],1,(1-xyY[0]-xyY[1])/xyY[1]
	]);
};
Planck.prototype.uv = function(T) {
	var xy = this.loci.fRGBCub(T);
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
	var xyY = this.loci.fRGBCub(T);
	var xyY1 = this.loci.fRGBCub(T + 0.1);
	var xyY2 = this.loci.fRGBCub(T - 0.1);
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
	this.def = 0;
	this.names = [];
	this.lower = [];
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
	this.lower.push(name.toLowerCase())
	this.M.push(M);
};
CSCAT.prototype.getModel = function(idx) {
	if (typeof idx === 'string' && isNaN(idx)) {
		idx = this.modelIdx(idx); // if it gets sent a title rather than index
	} else if (typeof idx !== 'number' || isNaN(idx)) {
		idx = this.def; // the default fallback
	}
	return new Float64Array(this.M[idx]);
};
CSCAT.prototype.getModels = function() {
	return this.names.slice(0);
};
CSCAT.prototype.modelIdx = function(model) {
	if (typeof model === 'number' && !isNaN(model)) {
		return model; // if accidentally sent a number, assume the index has already been found
	} else if (typeof model === 'undefined' || model === '') {
		return this.def; // the default option
	}
	var m = this.lower.length;
	for (var j=0; j<m; j++) {
		if (model.toLowerCase() === this.lower[j]) {
			return j;
		}
	}
	return this.def;
};
CSCAT.prototype.setDefault = function(model) {
	if (typeof model !== 'string' || model === '') {
		this.def = 0;
		return 0; // the default option
	}
	var m = this.lower.length;
	for (var j=0; j<m; j++) {
		if (model.toLowerCase() === this.lower[j]) {
			this.def = j;
			return j;
		}
	}
	this.def = 0;
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
	this.NInv = this.mInverse(this.N);
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
CSWB.prototype.mInverse = function(M) {
	var det =	(M[0]*((M[4]*M[8]) - (M[5]*M[7]))) -
				(M[1]*((M[3]*M[8]) - (M[5]*M[6]))) +
				(M[2]*((M[3]*M[7]) - (M[4]*M[6])));
	if (det === 0) {
		return false;
	}
	return new Float64Array([
		((M[4]*M[8])-(M[5]*M[7]))/det, ((M[2]*M[7])-(M[1]*M[8]))/det, ((M[1]*M[5])-(M[2]*M[4]))/det,
		((M[5]*M[6])-(M[3]*M[8]))/det, ((M[0]*M[8])-(M[2]*M[6]))/det, ((M[2]*M[3])-(M[0]*M[5]))/det,
		((M[3]*M[7])-(M[4]*M[6]))/det, ((M[1]*M[6])-(M[0]*M[7]))/det, ((M[0]*M[4])-(M[1]*M[3]))/det
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
	var m = c.length;
	var r,g,b;
	var M = this.N;
	for (var j=0; j<m; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (M[0]*r)+(M[1]*g)+(M[2]*b);
		c[j+1] = (M[3]*r)+(M[4]*g)+(M[5]*b);
		c[j+2] = (M[6]*r)+(M[7]*g)+(M[8]*b);
	}
};
CSWB.prototype.rc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var r,g,b;
	var M = this.NInv;
	for (var j=0; j<m; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (M[0]*r)+(M[1]*g)+(M[2]*b);
		c[j+1] = (M[3]*r)+(M[4]*g)+(M[5]*b);
		c[j+2] = (M[6]*r)+(M[7]*g)+(M[8]*b);
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
	this.mInv = this.mInverse(this.m);
	this.wp = wp;
}
CSMatrix.prototype.getWP = function() {
	return new Float64Array(this.wp.slice(0));
};
CSMatrix.prototype.isMatrix = function() {
	return true;
};
CSMatrix.prototype.getMatrix = function() {
	return this.m;
};
CSMatrix.prototype.cb = function() {
	return false;
};
CSMatrix.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var M = this.m;
	var r,g,b;
	for (var j=0; j<m; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (M[0]*r)+(M[1]*g)+(M[2]*b);
		c[j+1] = (M[3]*r)+(M[4]*g)+(M[5]*b);
		c[j+2] = (M[6]*r)+(M[7]*g)+(M[8]*b);
	}
};
CSMatrix.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var M = this.m;
	var r,g,b;
	for (var j=0; j<m; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (M[0]*r)+(M[1]*g)+(M[2]*b);
		c[j+1] = (M[3]*r)+(M[4]*g)+(M[5]*b);
		c[j+2] = (M[6]*r)+(M[7]*g)+(M[8]*b);
	}
};
CSMatrix.prototype.rc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var M = this.mInv;
	var r,g,b;
	for (var j=0; j<m; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (M[0]*r)+(M[1]*g)+(M[2]*b);
		c[j+1] = (M[3]*r)+(M[4]*g)+(M[5]*b);
		c[j+2] = (M[6]*r)+(M[7]*g)+(M[8]*b);
	}
};
CSMatrix.prototype.mInverse = function(M) {
	var det =	(M[0]*((M[4]*M[8]) - (M[5]*M[7]))) -
				(M[1]*((M[3]*M[8]) - (M[5]*M[6]))) +
				(M[2]*((M[3]*M[7]) - (M[4]*M[6])));
	if (det === 0) {
		return false;
	}
	return new Float64Array([
		((M[4]*M[8])-(M[5]*M[7]))/det, ((M[2]*M[7])-(M[1]*M[8]))/det, ((M[1]*M[5])-(M[2]*M[4]))/det,
		((M[5]*M[6])-(M[3]*M[8]))/det, ((M[0]*M[8])-(M[2]*M[6]))/det, ((M[2]*M[3])-(M[0]*M[5]))/det,
		((M[3]*M[7])-(M[4]*M[6]))/det, ((M[1]*M[6])-(M[0]*M[7]))/det, ((M[0]*M[4])-(M[1]*M[3]))/det
	]);
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
CSToneCurve.prototype.mInverse = function(M) {
	var det =	(M[0]*((M[4]*M[8]) - (M[5]*M[7]))) -
				(M[1]*((M[3]*M[8]) - (M[5]*M[6]))) +
				(M[2]*((M[3]*M[7]) - (M[4]*M[6])));
	if (det === 0) {
		return false;
	}
	return new Float64Array([
		((M[4]*M[8])-(M[5]*M[7]))/det, ((M[2]*M[7])-(M[1]*M[8]))/det, ((M[1]*M[5])-(M[2]*M[4]))/det,
		((M[5]*M[6])-(M[3]*M[8]))/det, ((M[0]*M[8])-(M[2]*M[6]))/det, ((M[2]*M[3])-(M[0]*M[5]))/det,
		((M[3]*M[7])-(M[4]*M[6]))/det, ((M[1]*M[6])-(M[0]*M[7]))/det, ((M[0]*M[4])-(M[1]*M[3]))/det
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
CSToneCurvePlus.prototype.mInverse = function(M) {
	var det =	(M[0]*((M[4]*M[8]) - (M[5]*M[7]))) -
				(M[1]*((M[3]*M[8]) - (M[5]*M[6]))) +
				(M[2]*((M[3]*M[7]) - (M[4]*M[6])));
	if (det === 0) {
		return false;
	}
	return new Float64Array([
		((M[4]*M[8])-(M[5]*M[7]))/det, ((M[2]*M[7])-(M[1]*M[8]))/det, ((M[1]*M[5])-(M[2]*M[4]))/det,
		((M[5]*M[6])-(M[3]*M[8]))/det, ((M[0]*M[8])-(M[2]*M[6]))/det, ((M[2]*M[3])-(M[0]*M[5]))/det,
		((M[3]*M[7])-(M[4]*M[6]))/det, ((M[1]*M[6])-(M[0]*M[7]))/det, ((M[0]*M[4])-(M[1]*M[3]))/det
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
function CSLUT(name,params,lutMaker,colours) {
	this.name = name;
	this.wp = params.wp.buffer;
	if (typeof params.format !== 'undefined') {
		this.format = params.format;
	} else {
		this.format = 'cube';
	}
	if (typeof params.min !== 'undefined') {
		this.min = params.min;
	} else {
		this.min = [0,0,0];
	}
	if (typeof params.max !== 'undefined') {
		this.max = params.max;
	} else {
		this.max = [1,1,1];
	}
	this.lutMaker = lutMaker;
	this.colours = colours;
	if (typeof params.genInt === 'number' && typeof params.preInt === 'number') {
		this.genInt = params.genInt;
		this.preInt = params.preInt;
	} else {
		this.genInt = 1;
		this.preInt = 1;
	}
	this.im = false;
	this.natTF = 0;
	this.inL = false;
}
CSLUT.prototype.setLUT = function(params) {
	var meta = params.meta;
	if (typeof meta.inputMatrix !== 'undefined' && meta.inputMatrix) {
		this.inM = meta.inputMatrix;
		this.im = true;
	} else {
		this.im = false;
	}
	if (typeof meta.inputTF === 'string' && meta.inputTF !== '') {
		switch (meta.inputTF) {
			case 'S-Log3': this.natTF = 0;
				break;
			case 'S-Log2': this.natTF = 1;
				break;
			case 'S-Log': this.natTF = 2;
				break;
			case 'C-Log': this.natTF = 3;
				break;
			case 'Canon C-Log2': this.natTF = 4;
				break;
			case 'Panasonic V-Log': this.natTF = 5;
				break;
			case 'REDLogFilm': this.natTF = 6;
				break;
			case 'Cineon': this.natTF = 7;
				break;
			case 'LogC (Sup 3.x & 4.x)': this.natTF = 8;
				if (typeof meta.baseISO === 'number') {
					this.setISO(meta.baseISO);
				} else {
					this.setISO(800);
				}
				break;
			case 'LogC (Sup 2.x)': this.natTF = 9;
				if (typeof meta.baseISO === 'number') {
					this.setISO(meta.baseISO);
				} else {
					this.setISO(800);
				}
				break;
			default : this.natTF = 0;
				break;
		}
	} else if (typeof meta.nativeTF === 'number') {
		this.natTF = meta.nativeTF;
		if (this.natTF === 8 || this.natTF === 9) { // LogC
			if (typeof meta.baseISO === 'number') {
				this.setISO(meta.baseISO);
			} else {
				this.setISO(800);
			}
		}
	} else {
		this.natTF = 0;
	}
	if (typeof meta.inputEX === 'boolean') {
		this.inL = !meta.inputEX;
	} else {
		this.inL = false;
	}
	if (typeof params.format !== 'undefined') {
		this.format = params.format;
	} else {
		this.format = 'cube';
	}
	if (typeof params.min !== 'undefined') {
		this.min = params.min;
	} else {
		this.min = [0,0,0];
	}
	if (typeof params.max !== 'undefined') {
		this.max = params.max;
	} else {
		this.max = [1,1,1];
	}
	this.lut = this.lutMaker.newLUT({
		title: this.name,
		format: this.format,
		dims: 3,
		s: params.s,
		min: this.min,
		max: this.max,
		C: params.C
	});
	this.setRC();
};
CSLUT.prototype.setISO = function(iso) {
	if (this.natTF === 8) { //	LogC (Sup 3.x & 4.x)
		this.arri = {};
		var gain,encGain,encOffset,nz;
		var slope, offset, gray, s, t;
		this.arri.cut = 1/9;
		slope = 1 / (this.arri.cut*Math.LN10);
		offset = (Math.log(this.arri.cut)/Math.LN10) - slope * this.arri.cut;
		gain = iso / 400;
		gray = 0.01 / gain;
		encGain = (Math.log(iso/400)/Math.log(2) * (0.89 - 1) / 3 + 1) * 0.256598;
		encOffset = 0.391007;
		for (var j=0; j<3; j++) {
			nz = ((95.0 / 1023.0 - encOffset) / encGain - offset) / slope;
			encOffset = 0.391007 - (Math.log(1 + nz)/Math.LN10) * encGain
		}
		this.arri.a = 1/gray;
		this.arri.b = nz - 0.003907 / gray;
		this.arri.e = slope * this.arri.a * encGain;
		this.arri.ff = encGain * (slope*this.arri.b + offset) + encOffset;
		s = 4 / (0.18*iso);
		t = 0.003907;
		this.arri.b = this.arri.b + this.arri.a * t;
		this.arri.a = this.arri.a * s;
		this.arri.ff = this.arri.ff + this.arri.e * t;
		this.arri.e = this.arri.e * s;
		this.arri.c = encGain;
		this.arri.d = encOffset;
		this.arri.cut = (this.arri.cut - this.arri.b) / this.arri.a;
	} else if (this.natTF === 9) { // LogC (Sup 2.x)
		this.arri = {};
		var encGain, f16, f17;
		encGain = (Math.log(iso/400)/Math.log(2) * -0.11 / 3 + 1) * 0.256598;
		f16 = (Math.log(0.000977 / 0.010977) * encGain / Math.LN10) + 0.391007;
		f17 = (Math.log((((0.003907 + 1.0 / 4095.0) - 0.003907) * (iso/400) + 0.000977) / 0.010977)/Math.LN10) * encGain + 0.391007;
		this.arri.cut = 0.003907;
		this.arri.d = 0.391007;
		this.arri.c = encGain;
		this.arri.b = 0.000977 / 0.010977;
		this.arri.a = (iso / (400*0.010977))/(iso * (0.18/(400*0.01)));
		this.arri.ff = f16;
		this.arri.e = 4095 * (f17-f16)/(iso*(0.18/(400*0.01)));
	}
};
CSLUT.prototype.getWP = function() {
	return new Float64Array(this.wp.slice(0));
};
CSLUT.prototype.setRC = function() {
	var MI = this.colours;
	var MO = new Float64Array(MI.buffer.slice(0));
	this.lc(MO.buffer);
	// MI = matrix of input values, MO = matrix of output values, M is the approximate matrix of the colourspace
	// then M MI = MO
	// M (MI MIT) = (MO MIT) 
	// M (MI MIT)(MI MIT)-1 = (MO MIT)(MI MIT)-1
	// M = (MO MIT)(MI MIT)-1
	var m = MI.length;
	var MIMIT = new Float64Array(9);
	var MOMIT = new Float64Array(9);
	for (var j=0; j<m; j+=3) {
		// MIMIT
		MIMIT[0] += MI[ j ]*MI[ j ];
		MIMIT[1] += MI[ j ]*MI[j+1];
		MIMIT[2] += MI[ j ]*MI[j+2];
//		MIMIT[3] += MI[j+1]*MI[ j ];
		MIMIT[4] += MI[j+1]*MI[j+1];
		MIMIT[5] += MI[j+1]*MI[j+2];
//		MIMIT[6] += MI[j+2]*MI[ j ];
//		MIMIT[7] += MI[j+2]*MI[j+1];
		MIMIT[8] += MI[j+2]*MI[j+2];
		// MOMIT
		MOMIT[0] += MO[ j ]*MI[ j ];
		MOMIT[1] += MO[ j ]*MI[j+1];
		MOMIT[2] += MO[ j ]*MI[j+2];
		MOMIT[3] += MO[j+1]*MI[ j ];
		MOMIT[4] += MO[j+1]*MI[j+1];
		MOMIT[5] += MO[j+1]*MI[j+2];
		MOMIT[6] += MO[j+2]*MI[ j ];
		MOMIT[7] += MO[j+2]*MI[j+1];
		MOMIT[8] += MO[j+2]*MI[j+2];
	}
	MIMIT[3] = MIMIT[1];
	MIMIT[6] = MIMIT[2];
	MIMIT[7] = MIMIT[5];
	MI = MIMIT;
	MO = MOMIT;
	var det =	(MI[0]*((MI[4]*MI[8]) - (MI[5]*MI[7]))) -
				(MI[1]*((MI[3]*MI[8]) - (MI[5]*MI[6]))) +
				(MI[2]*((MI[3]*MI[7]) - (MI[4]*MI[6])));
	var MIInv = new Float64Array([
		((MI[4]*MI[8])-(MI[5]*MI[7]))/det, ((MI[2]*MI[7])-(MI[1]*MI[8]))/det, ((MI[1]*MI[5])-(MI[2]*MI[4]))/det,
		((MI[5]*MI[6])-(MI[3]*MI[8]))/det, ((MI[0]*MI[8])-(MI[2]*MI[6]))/det, ((MI[2]*MI[3])-(MI[0]*MI[5]))/det,
		((MI[3]*MI[7])-(MI[4]*MI[6]))/det, ((MI[1]*MI[6])-(MI[0]*MI[7]))/det, ((MI[0]*MI[4])-(MI[1]*MI[3]))/det
	]);
	var M = new Float64Array([
		(MO[0]*MIInv[0])+(MO[1]*MIInv[3])+(MO[2]*MIInv[6]), (MO[0]*MIInv[1])+(MO[1]*MIInv[4])+(MO[2]*MIInv[7]), (MO[0]*MIInv[2])+(MO[1]*MIInv[5])+(MO[2]*MIInv[8]),
		(MO[3]*MIInv[0])+(MO[4]*MIInv[3])+(MO[5]*MIInv[6]), (MO[3]*MIInv[1])+(MO[4]*MIInv[4])+(MO[5]*MIInv[7]), (MO[3]*MIInv[2])+(MO[4]*MIInv[5])+(MO[5]*MIInv[8]),
		(MO[6]*MIInv[0])+(MO[7]*MIInv[3])+(MO[8]*MIInv[6]), (MO[6]*MIInv[1])+(MO[7]*MIInv[4])+(MO[8]*MIInv[7]), (MO[6]*MIInv[2])+(MO[7]*MIInv[5])+(MO[8]*MIInv[8])
	]);
	det =	(M[0]*((M[4]*M[8]) - (M[5]*M[7]))) -
			(M[1]*((M[3]*M[8]) - (M[5]*M[6]))) +
			(M[2]*((M[3]*M[7]) - (M[4]*M[6])));
	this.mInv = new Float64Array([
		((M[4]*M[8])-(M[5]*M[7]))/det, ((M[2]*M[7])-(M[1]*M[8]))/det, ((M[1]*M[5])-(M[2]*M[4]))/det,
		((M[5]*M[6])-(M[3]*M[8]))/det, ((M[0]*M[8])-(M[2]*M[6]))/det, ((M[2]*M[3])-(M[0]*M[5]))/det,
		((M[3]*M[7])-(M[4]*M[6]))/det, ((M[1]*M[6])-(M[0]*M[7]))/det, ((M[0]*M[4])-(M[1]*M[3]))/det
	]);
};
CSLUT.prototype.isMatrix = function() {
	return false;
};
CSLUT.prototype.setInterpolation = function(genInt,preInt) {
	this.genInt = genInt;
	this.preInt = preInt;
};
CSLUT.prototype.setTitle = function(name) {
	this.name = name;
};
CSLUT.prototype.rc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var M = this.mInv;
	var r,g,b;
	for (var j=0; j<m; j+= 3) {
		r = c[ j ];
		g = c[j+1];
		b = c[j+2];
		c[ j ] = (M[0]*r)+(M[1]*g)+(M[2]*b);
		c[j+1] = (M[3]*r)+(M[4]*g)+(M[5]*b);
		c[j+2] = (M[6]*r)+(M[7]*g)+(M[8]*b);
	}
};
CSLUT.prototype.cb = function() {
	return false;
};
CSLUT.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var p;
	if (this.im) {
		var M = this.inM;
		var r,g,b;
		for (var j=0; j<m; j += 3) {
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (M[0]*r)+(M[1]*g)+(M[2]*b);
			c[j+1] = (M[3]*r)+(M[4]*g)+(M[5]*b);
			c[j+2] = (M[6]*r)+(M[7]*g)+(M[8]*b);
		}
	}
	switch (this.natTF) {
		case 0: // S-Log3
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.0125) {
					c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
				} else {
					c[j] = (c[j] + 0.0155818840)/0.1677922920;
				}
			}
			break;
		case 1: // S-Log2
			for (var j=0; j<m; j++) {
				if (c[j] >= 0) {
					c[j] = (0.3705223107287920 * Math.log((c[j] * 0.7077625570776260) + 0.0375840001141552)/Math.LN10) + 0.6162444730868150;
				} else {
					c[j] = (c[j] + 0.0291229262672453)/0.330000000129966;
				}
			}
			break;
		case 2: // S-log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.000000000000001) {
					c[j] = (0.3705223110 * Math.log(c[j] + 0.0375840000)/Math.LN10) + 0.6162444740;
				} else {
					c[j] = (c[j] + 0.0286107171)/0.3241960136;
				}
			}
			break;
		case 3: // C-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= -0.0452664) {
					c[j] = (0.45310179472141 * Math.log((c[j] * 10.1596) + 1)/Math.LN10) + 0.1251224801564;
				} else {
					c[j] = (c[j] + 0.0467265867)/0.3734467748;
				}
			}
			break;
		case 4: // C-Log2
			for (var j=0; j<m; j++) {
				if (c[j] >= -0.006747091156) {
					c[j] = (0.241360772 * Math.log((c[j] * 87.09937546) + 1)/Math.LN10) + 0.092864125;
				} else {
					c[j] = (c[j] + 0.006747091156)/0.045164984;
				}
			}
			break;
		case 5: // V-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.009) {
					c[j] = (0.241514 * Math.log((c[j] * 0.9) + 0.00873)/Math.LN10) + 0.598206;
				} else {
					c[j] = (c[j] + 0.024801587)/0.198412698;
				}
			}
			break;
		case 6: // Cineon
		case 7: // RedLogFilm
			for (var j=0; j<m; j++) {
				if (c[j] < -0.006278688) {
					c[j] = (c[j] + 0.006278688)/0.045949378;
				} else {
					c[j] = ((Math.log((c[j]*0.890282024)+0.010797752)/(Math.LN10*0.003333333))+685)/1023;
				}
			}
			break;
		case 8: // LogC (Sup 3.x & 4.x)
		case 9: // LogC (Sup 2.x)
			p = this.arri;
			for (var j=0; j<m; j++) {
				c[j] = c[j] * 0.9;
				if (c[j] > p.cut) {
					c[j] = ((p.c * Math.log((p.a * c[j]) + p.b)/Math.LN10) + p.d);
				} else {
					c[j] = ((p.e * c[j]) + p.ff);
				}
			}
			break;
		default: // S-Log3
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.0125) {
					c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
				} else {
					c[j] = (c[j] + 0.0155818840)/0.1677922920;
				}
			}
	}
	if (this.inL) {
		for (var j=0; j<m; j++) {
			c[j] = ((c[j]*1023)-64)/876;
		}
	}
	if (this.genInt === 0) {
		this.lut.RGBCub(buff);
	} else if (this.genInt === 1) {
		this.lut.RGBTet(buff);
	} else {
		this.lut.RGBLin(buff);
	}
	if (this.inL) {
		for (var j=0; j<m; j++) {
			c[j] = ((c[j]*876)+64)/1023;
		}
	}
	switch (this.natTF) {
		case 0: // S-Log3
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.1673609920) {
					c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
				} else {
					c[j] = (0.1677922920*c[j]) - 0.0155818840;
				}
			}
			break;
		case 1: // S-Log2
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.0375840001141552) {
					c[j] = (Math.pow(10,(c[j] - 0.6162444730868150)/0.3705223107287920) - 0.0375840001141552)/0.7077625570776260;		
				} else {
					c[j] = (0.330000000129966*c[j]) - 0.0291229262672453;
				}
			}
			break;
		case 2: // S-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.0882900450) {
					c[j] = (Math.pow(10,(c[j] - 0.6162444740)/0.3705223110) - 0.0375840000);		
				} else {
					c[j] = (0.3241960136*c[j]) - 0.0286107171;
				}
			}
			break;
		case 3: // C-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.00391002619746) {
					c[j] = (Math.pow(10,(c[j] - 0.1251224801564)/0.45310179472141) - 1)/10.1596;		
				} else {
					c[j] = (0.3734467748*c[j]) - 0.0467265867;
				}
			}
			break;
		case 4: // C-Log2
			for (var j=0; j<m; j++) {
				if (c[j] >= 0) {
					c[j] = (Math.pow(10,(c[j] - 0.092864125)/0.241360772) - 1)/87.09937546;		
				} else {
					c[j] = (0.045164984*c[j]) - 0.006747091156;
				}
			}
			break;
		case 5: // V-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.181) {
					c[j] = (Math.pow(10,(c[j] - 0.598206)/0.241514) - 0.00873)/0.9;		
				} else {
					c[j] = (0.198412698*c[j]) - 0.024801587;
				}
			}
			break;
		case 6: // Cineon
		case 7: // RedLogFilm
			for (var j=0; j<m; j++) {
				if (c[j] < 0) {
					c[j] = (c[j]*0.045949378) - 0.006278688;
				} else {
					c[j] = (Math.pow(10,((c[j]*1023)-685)*0.003333333) - 0.010797752)/0.890282024;
				}
			}
			break;
		case 8: // LogC (Sup 3.x & 4.x)
		case 9: // LogC (Sup 2.x)
			p = this.arri;
			for (var j=0; j<m; j++) {
				if (c[j] > ((p.e * p.cut) + p.ff)) {
					c[j] = (Math.pow(10, (c[j] - p.d) / p.c) - p.b)/(p.a*0.9);
				} else {
					c[j] = ((c[j] - p.ff) / (p.e*0.9));
				}
			}
			break;
		default: // S-Log3
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.1673609920) {
					c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
				} else {
					c[j] = (0.1677922920 * c[j]) - 0.0155818840;
				}
			}
	}
};
CSLUT.prototype.lf = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var p;
	if (this.im) {
		var M = this.inM;
		var r,g,b;
		for (var j=0; j<m; j += 3) {
			r = c[ j ];
			g = c[j+1];
			b = c[j+2];
			c[ j ] = (M[0]*r)+(M[1]*g)+(M[2]*b);
			c[j+1] = (M[3]*r)+(M[4]*g)+(M[5]*b);
			c[j+2] = (M[6]*r)+(M[7]*g)+(M[8]*b);
		}
	}
	switch (this.natTF) {
		case 0: // S-Log3
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.0125) {
					c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
				} else {
					c[j] = (c[j] + 0.0155818840)/0.1677922920;
				}
			}
			break;
		case 1: // S-Log2
			for (var j=0; j<m; j++) {
				if (c[j] >= 0) {
					c[j] = (0.3705223107287920 * Math.log((c[j] * 0.7077625570776260) + 0.0375840001141552)/Math.LN10) + 0.6162444730868150;
				} else {
					c[j] = (c[j] + 0.0291229262672453)/0.330000000129966;
				}
			}
			break;
		case 2: // S-log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.000000000000001) {
					c[j] = (0.3705223110 * Math.log(c[j] + 0.0375840000)/Math.LN10) + 0.6162444740;
				} else {
					c[j] = (c[j] + 0.0286107171)/0.3241960136;
				}
			}
			break;
		case 3: // C-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= -0.0452664) {
					c[j] = (0.45310179472141 * Math.log((c[j] * 10.1596) + 1)/Math.LN10) + 0.1251224801564;
				} else {
					c[j] = (c[j] + 0.0467265867)/0.3734467748;
				}
			}
			break;
		case 4: // C-Log2
			for (var j=0; j<m; j++) {
				if (c[j] >= -0.006747091156) {
					c[j] = (0.241360772 * Math.log((c[j] * 87.09937546) + 1)/Math.LN10) + 0.092864125;
				} else {
					c[j] = (c[j] + 0.006747091156)/0.045164984;
				}
			}
			break;
		case 5: // V-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.009) {
					c[j] = (0.241514 * Math.log((c[j] * 0.9) + 0.00873)/Math.LN10) + 0.598206;
				} else {
					c[j] = (c[j] + 0.024801587)/0.198412698;
				}
			}
			break;
		case 6: // Cineon
		case 7: // RedLogFilm
			for (var j=0; j<m; j++) {
				if (c[j] < -0.006278688) {
					c[j] = (c[j] + 0.006278688)/0.045949378;
				} else {
					c[j] = ((Math.log((c[j]*0.890282024)+0.010797752)/(Math.LN10*0.003333333))+685)/1023;
				}
			}
			break;
		case 8: // LogC (Sup 3.x & 4.x)
		case 9: // LogC (Sup 2.x)
			p = this.arri;
			for (var j=0; j<m; j++) {
				c[j] = c[j] * 0.9;
				if (c[j] > p.cut) {
					c[j] = ((p.c * Math.log((p.a * c[j]) + p.b)/Math.LN10) + p.d);
				} else {
					c[j] = ((p.e * c[j]) + p.ff);
				}
			}
			break;
		default: // S-Log3
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.0125) {
					c[j] = (0.2556207230 * Math.log((c[j] * 4.7368421060) + 0.0526315790)/Math.LN10) + 0.4105571850;
				} else {
					c[j] = (c[j] + 0.0155818840)/0.1677922920;
				}
			}
	}
	if (this.inL) {
		for (var j=0; j<m; j++) {
			c[j] = ((c[j]*1023)-64)/876;
		}
	}
	if (this.preInt === 0) {
		this.lut.RGBCub(buff);
	} else if (this.preInt === 1) {
		this.lut.RGBTet(buff);
	} else {
		this.lut.RGBLin(buff);
	}
	if (this.inL) {
		for (var j=0; j<m; j++) {
			c[j] = ((c[j]*876)+64)/1023;
		}
	}
	switch (this.natTF) {
		case 0: // S-Log3
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.1673609920) {
					c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
				} else {
					c[j] = (0.1677922920*c[j]) - 0.0155818840;
				}
			}
			break;
		case 1: // S-Log2
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.0375840001141552) {
					c[j] = (Math.pow(10,(c[j] - 0.6162444730868150)/0.3705223107287920) - 0.0375840001141552)/0.7077625570776260;		
				} else {
					c[j] = (0.330000000129966*c[j]) - 0.0291229262672453;
				}
			}
			break;
		case 2: // S-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.0882900450) {
					c[j] = (Math.pow(10,(c[j] - 0.6162444740)/0.3705223110) - 0.0375840000);		
				} else {
					c[j] = (0.3241960136*c[j]) - 0.0286107171;
				}
			}
			break;
		case 3: // C-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.00391002619746) {
					c[j] = (Math.pow(10,(c[j] - 0.1251224801564)/0.45310179472141) - 1)/10.1596;		
				} else {
					c[j] = (0.3734467748*c[j]) - 0.0467265867;
				}
			}
			break;
		case 4: // C-Log2
			for (var j=0; j<m; j++) {
				if (c[j] >= 0) {
					c[j] = (Math.pow(10,(c[j] - 0.092864125)/0.241360772) - 1)/87.09937546;		
				} else {
					c[j] = (0.045164984*c[j]) - 0.006747091156;
				}
			}
			break;
		case 5: // V-Log
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.181) {
					c[j] = (Math.pow(10,(c[j] - 0.598206)/0.241514) - 0.00873)/0.9;		
				} else {
					c[j] = (0.198412698*c[j]) - 0.024801587;
				}
			}
			break;
		case 6: // Cineon
		case 7: // RedLogFilm
			for (var j=0; j<m; j++) {
				if (c[j] < 0) {
					c[j] = (c[j]*0.045949378) - 0.006278688;
				} else {
					c[j] = (Math.pow(10,((c[j]*1023)-685)*0.003333333) - 0.010797752)/0.890282024;
				}
			}
			break;
		case 8: // LogC (Sup 3.x & 4.x)
		case 9: // LogC (Sup 2.x)
			p = this.arri;
			for (var j=0; j<m; j++) {
				if (c[j] > ((p.e * p.cut) + p.ff)) {
					c[j] = (Math.pow(10, (c[j] - p.d) / p.c) - p.b)/(p.a*0.9);
				} else {
					c[j] = ((c[j] - p.ff) / (p.e*0.9));
				}
			}
			break;
		default: // S-Log3
			for (var j=0; j<m; j++) {
				if (c[j] >= 0.1673609920) {
					c[j] = (Math.pow(10,(c[j] - 0.4105571850)/0.2556207230) - 0.0526315790)/4.7368421060;		
				} else {
					c[j] = (0.1677922920 * c[j]) - 0.0155818840;
				}
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
function CSLabSpace(name, Xn, Yn, Zn, toSys, XYZ) {
	this.name = name;
	this.toSys = toSys;
	this.XYZ = XYZ;
	this.Xn = Xn / Yn;
	this.Yn = 1.0;
	this.Zn = Zn / Yn;
	this.d = 6.0 / 29.0;
	this.d3 = Math.pow(this.d, 3);
	this.oneover3d2 = 1.0 / (3.0 * this.d * this.d);
	this.threed2 = 3.0 * this.d * this.d;
	this.fourover29 = 4.0 / 29.0;
	
	this.p1 = 24389.0 / 2700.0;
	this.p2 = 0.16;
	this.p3 = 216.0 / 24389.0;
	this.p4 = 216.0 / 2700.0;
}
CSLabSpace.prototype.f = function(buff, transfer) {
	var c = new Float64Array(buff);
	var m = c.length;
	if (transfer) {
		for (var j=0; j<m; j++) {
			if (c[j] >= this.p3) {
				c[j] = (1.16 * Math.cbrt(c[j])) - 0.16;
			} else {
				c[j] = this.p1 * c[j];
			}
		}
	} else {
		for (var j=0; j<m; j++) {
			if (c[j] >= this.p3) {
				c[j] = Math.cbrt(c[j]);
			} else {
				c[j] = ((this.p1 * c[j]) + 0.16) / 1.16;
			}
		}
	}
};
CSLabSpace.prototype.fInv = function(buff, transfer) {
	var c= new Float64Array(buff);
	var m = c.length;
	if (transfer) {
		for (var j=0; j<m; j++) {
			if (c[j] >= this.p4) {
				c[j] = Math.pow((c[j] + 0.16)/(1.16), 3.0);		
			} else {
				c[j] = (c[j] / this.p1);
			}
		}
	} else {
		for (var j=0; j<m; j++) {
			if (c[j] >= this.p4) {
				c[j] = Math.pow(c[j], 3.0);		
			} else {
				c[j] = ((c[j] * 1.16) - 0.16) / this.p1;
			}
		}
	}
};
CSLabSpace.prototype.getWP = function() {
	return new Float64Array([this.Xn, this.Yn, this.Zn]);
};
CSLabSpace.prototype.isMatrix = function() {
	return false;
};
CSLabSpace.prototype.cb = function() {
	return false;
};
CSLabSpace.prototype.lc = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	if (this.toSys) {
		this.f(c.buffer, true);
		var m = c.length;
		var fY;
		for (var j=0; j<m; j+= 3) {
			fY = (c[ j ] + 0.16) / 1.16;
			c[ j ] = (c[j+1] + fY) / 5.0;
			c[j+2] = (c[j+2] + fY) / 2.0;
			c[j+1] = fY;
		}
		this.fInv(c.buffer, false);
		for (var j=0; j<m; j+= 3) {
			c[ j ] *= this.Xn;
			c[j+1] *= this.Yn;
			c[j+2] *= this.Zn;
		}
		this.XYZ.lc(c.buffer);
	} else {
		this.XYZ.lc(c.buffer);
		for (var j=0; j<m; j+= 3) {
			c[ j ] /= this.Xn;
			c[j+1] /= this.Yn;
			c[j+2] /= this.Zn;
		}
		this.f(c.buffer, false);
		var fY;
		for (var j=0; j<m; j+= 3) {
			fY = c[j+1];
			c[j+1] = 5.0 * (c[ j ] - fY);	// a*
			c[j+2] = 2.0 * (c[j+2] - fY);	// b*
			c[ j ] = (1.16 * fY) - 0.16;	// L*
		}
		this.fInv(c.buffer, true);
	}
};
CSLabSpace.prototype.lf = function(buff) {
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
	if (typeof params.twkLA !== 'undefined') {
		var genInt,preInt;
		if (typeof params.twkLA.genInt === 'number' ) {
			genInt = params.twkLA.genInt;
		} else {
			genInt = 0; // tricubic
		}
		if (typeof params.twkLA.preInt === 'number' ) {
			preInt = params.twkLA.preInt;
		} else {
			preInt = 1; // tetrahedral
		}
		this.csOut[this.LA].setInterpolation(genInt,preInt);
	}
	out.twkCS = this.setCS(params);
	out.twkWB = this.setWB(params);
	out.twkASCCDL = this.setASCCDL(params);
	out.twkPSSTCDL = this.setPSSTCDL(params);
	out.twkHG = this.setHG(params);
	out.twkMulti = this.setMulti(params);
	out.twkSDRSat = this.setSDRSat(params);
	out.twkGamutLim = this.setGamutLim(params);
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
			this.FCOut(buff,out);
		}
		out.doFC = this.doFC;
// Colour Temperature Shift
		if (this.doWB) {
			this.wb.lc(buff);
		}
// PSST-CDL
		if (this.doPSSTCDL) {
			this.PSSTCDLOut(buff);
		}
// ASC-CDL
		if (this.doASCCDL) {
			this.ASCCDLOut(buff);
		}
// MultiTone
		if (this.doMulti) {
			this.multiOut(buff);
		}		
// Highlight Gamut
		if (this.doHG) {
			this.HGOut(buff,g);
		} else {
			if (g) {
				this.csOut[this.curOut].lc(buff);
			} else {
				this.csOut[this.curOut].lf(buff);
			}
		}
// SDR Saturation
		if (this.doSDRSat) {
			this.SDRSatOut(buff);
		}		
// Gamut Limiter
		if (this.doGamutLim) {
			this.gamutLimOut(buff,out);
		} else {
			out.doGamutLim = false;
		}
	}
// Done
	return out;
};
LUTColourSpace.prototype.laCalc = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, dim: i.dim, gamma: i.gamma, gamut: i.gamut };
	if (i.gamut === this.custOut) {
		out.inputMatrix = this.mInverse(this.csIn[this.custIn].getMatrix()).buffer;
	} else {
		out.inputMatrix = this.csOut[i.gamut].getMatrix().buffer.slice(0);
	}
	out.to = ['inputMatrix'];
	return out;
};
LUTColourSpace.prototype.recalcMatrix = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver, idx: i.idx, wcs: i.newWCS};
	var matrix;
	var oMat = new Float64Array(i.matrix);
	if (i.newWCS === this.xyzIdx) {
		matrix = this.mMult(this.g[i.oldWCS].toXYZ,oMat);
	} else if (i.oldWCS === this.xyzIdx) {
		matrix = this.mMult(this.mInverse(this.g[i.newWCS].toXYZ),oMat);
	} else {
		var oToXYZ = this.g[i.oldWCS].toXYZ;
		var nFromXYZ = this.mInverse(this.g[i.newWCS].toXYZ);
		var oToN = this.mMult(nFromXYZ, this.calcCAT(oToXYZ,this.g[i.oldWCS].white,this.g[i.newWCS].white,i.cat));
		matrix = this.mMult(oToN,oMat);
	}
	out.matrix = matrix.buffer;
	out.to = ['matrix'];
	return out;
};
LUTColourSpace.prototype.loadDefaultLUTs = function(p,t,i) {
	var out = { p: p, t: t+20, v: this.ver};
	var meta;
	if (typeof i.meta !== 'undefined') {
		meta = i.meta;
	} else {
		meta = {};
	}
	if (typeof i.title !== 'undefined') {
		out.title = i.title;
	}
	var lut = this.csOut[this.defLUTs[i.fileName]];
	var idx = -1;
	if (typeof meta.inputCS !== 'undefined' && meta.inputCS !== '') {
		var list = this.laList;
		var m = list.length;
		var idx = -1
		if (meta.inputCS !== 'Custom In') {
			for (var j=0; j<m; j++) {
				if (list.name === meta.inputCS) {
					idx = list.idx;
					break;
				}
			}
		}
	}
	if (idx < 0) { // custom / unknown gamut - use the matrix supplied with the LA LUT
	} else if (idx !== this.sysIdx) {
		meta.inputMatrix = this.csOut[idx].getMatrix();
	} else { // The system default so no input matrix needed
		meta.inputMatrix = new Float64Array([1,0,0, 0,1,0, 0,0,1]);
	}
	var params = {
		name: lut.name,
		format: 'cube',
		dims: i.dims,
		s: i.s,
		min: i.min,
		max: i.max,
		C: i.C,
		meta: meta
	};
	lut.setLUT(params);
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
	var out = { p: p, t: t+20, v: this.ver};
	var meta;
	if (typeof i.meta !== 'undefined') {
		meta = i.meta;
	} else {
		meta = {};
	}
	if (typeof i.title !== 'undefined') {
		out.title = i.title;
	}
	var lut = this.csOut[this.LA];
	var idx = -1;
	if (typeof meta.inputCS !== 'undefined' && meta.inputCS !== '') {
		var list = this.laList;
		var m = list.length;
		var idx = -1
		if (meta.inputCS !== 'Custom In') {
			for (var j=0; j<m; j++) {
				if (list.name === meta.inputCS) {
					idx = list.idx;
					break;
				}
			}
		}
	}
	if (idx < 0) { // custom / unknown gamut - use the matrix supplied with the LA LUT
	} else if (idx !== this.sysIdx) {
		meta.inputMatrix = this.csOut[idx].getMatrix();
	} else { // The system default so no input matrix needed
		meta.inputMatrix = new Float64Array([1,0,0, 0,1,0, 0,0,1]);
	}
	var params = {
		name: lut.name,
		format: 'cube',
		dims: i.dims,
		s: i.s,
		min: i.min,
		max: i.max,
		C: i.C,
		meta: meta
	};
	lut.setLUT(params);
	return out;
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
	var buff = this.mclrs.slice(0);
	out = {p: p, t: t+20, v: this.ver, o: buff, cb: this.csOut[this.curOut].cb(), to: ['o','hs']};
// Colour Temperature Shift
	if (this.doWB) {
		this.wb.lc(buff);
	}
// PSST-CDL
	if (this.doPSSTCDL) {
		this.PSSTCDLOut(buff);
	}
// ASC-CDL
	if (this.doASCCDL) {
		this.ASCCDLOut(buff);
	}
// MultiTone
	this.multiOut(buff);		
// Highlight Gamut
	if (this.doHG) {
		this.HGOut(buff,false);
	} else {
		this.csOut[this.curOut].lf(buff);
	}
// Gamut Limiter
	if (this.doGamutLim) {
		this.gamutLimOut(buff,out);
	} else {
		out.doGamutLim = false;
	}
// Multi Tones
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
	out.hs = hs.buffer;
	return out;
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
		a = this.psstB.fCub(f);
		m1 = this.psstM.fLin(f);
		c = this.psstC.fCub(f);
		sat = this.psstSat.fCub(f);
		if (sat < 0) {
			sat = 0;
		}
		S = this.psstS.fCub(f);
		if (S < 0) {
			S = 0;
		}
		O = this.psstO.fCub(f);
		P = this.psstP.fCub(f);
		if (P < 0) {
			P = 0;
		}
		M = 0.5 * m1;
		y1 = this.psstY.fLin(f);
		Y = 0.7*y1;
		Pb = M * Math.cos(a);
		Pr = M * Math.sin(a);
		bef64[ j ] = (Pr * Dr) + Y;
		bef64[j+2] = (Pb * Db) + Y;
		bef64[j+1] = (Y - (y[0]*bef64[ j ]) -(y[2]*bef64[j+2]))/y[1];
		f = (f+c%1);
		if (this.psstYC) {
			y2 = this.psstY.fLin(f);
		} else {
			y2 = y1;
		}
		if (this.psstMC) {
			m2 = this.psstM.fLin(f);
		} else {
			m2 = m1;
		}
		M = M * m2 * sat / m1;
		a = this.psstB.fCub(f);
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
	var gIn = new Float64Array([ // The input or recorded gamut - these values to be converted to XYZ then xy
		1,1,1,
		1,0,0,
		0,1,0,
		0,0,1
	]);
	var gOut = new Float64Array([ // The output gamut - these values to be converted to XYZ then xy
		1,1,1,
		1,0,0,
		0,1,0,
		0,0,1
	]);
	var m = 4;
	var xy = new Float64Array(16);
	var k,l,den;
	var wd,ws;
	var XYZ;

	// Input Gamut
	this.csIn[this.curIn].lc(gIn.buffer);
	this.csOut[this.XYZOut].lc(gIn.buffer);
	wd = this.csIn[this.curIn].getWP();
	ws = this.system.white;
	for (var j=0; j<4; j++) {
		k = j*3;
		l = j*2;
		XYZ = this.calcCAT(new Float64Array([gIn[k],gIn[k+1],gIn[k+2]]),ws,wd,this.inCATs[this.curIn]);
		den = XYZ[0] + XYZ[1] + XYZ[2];
		xy[ l ] = (XYZ[0]/den);
		xy[l+1] = (XYZ[1]/den);
	}
	// Output Gamut
	this.rx(gOut.buffer);
	this.csOut[this.XYZOut].lc(gOut.buffer);
	wd = this.csOut[this.curOut].getWP();
	ws = this.system.white;
	for (var j=0; j<4; j++) {
		k = j*3;
		l = j*2;
		XYZ = this.calcCAT(new Float64Array([gOut[k],gOut[k+1],gOut[k+2]]),ws,wd,this.outCATs[this.curOut]);
		den = XYZ[0] + XYZ[1] + XYZ[2];
		xy[l+8] = (XYZ[0]/den);
		xy[l+9] = (XYZ[1]/den);
	}
	// Return object
	return {
		p: p,
		t: t+20,
		v: this.ver,
		xy: xy
	};
};
// Web worker messaging functions
function LUTCSWorker() {
	this.cs = new LUTColourSpace();
	addEventListener('message', function(e) {
		var d = e.data;
		if (typeof d.t === 'undefined') {
		} else if (d.t !== 0 && d.t < 20 && d.v !== lutCSWorker.cs.ver) {
			postMessage({p: d.p, t: d.t, v: d.v, resend: true, d: d.d});
		} else {
			switch (d.t) {
				case 0:	lutCSWorker.sendCSMessage(lutCSWorker.cs.setParams(d.d));
						break;
				case 1: lutCSWorker.sendCSMessage(lutCSWorker.cs.calc(d.p,d.t,d.d,true)); 
						break;
				case 2: lutCSWorker.sendCSMessage(lutCSWorker.cs.laCalc(d.p,d.t,d.d)); 
						break;
				case 3: lutCSWorker.sendCSMessage(lutCSWorker.cs.recalcMatrix(d.p,d.t,d.d)); 
						break;
				case 4: lutCSWorker.sendCSMessage(lutCSWorker.cs.loadDefaultLUTs(d.p,d.t,d.d)); 
						break;
				case 5: lutCSWorker.sendCSMessage(lutCSWorker.cs.getLists(d.p,d.t)); 
						break;
				case 6: lutCSWorker.sendCSMessage(lutCSWorker.cs.setLA(d.p,d.t,d.d)); 
						break;
				case 7: lutCSWorker.sendCSMessage(lutCSWorker.cs.setLATitle(d.p,d.t,d.d)); 
						break;
				case 8: lutCSWorker.sendCSMessage(lutCSWorker.cs.getColSqr(d.p,d.t,d.d)); 
						break;
				case 9: lutCSWorker.sendCSMessage(lutCSWorker.cs.multiColours(d.p,d.t,d.d)); 
						break;
				case 10:lutCSWorker.sendCSMessage(lutCSWorker.cs.ioNames(d.p,d.t));
						break;
				case 11:lutCSWorker.sendCSMessage(lutCSWorker.cs.chartVals(d.p,d.t,d.d));
						break;
				case 12:lutCSWorker.sendCSMessage(lutCSWorker.cs.calc(d.p,d.t,d.d,false)); 
						break;
				case 14:lutCSWorker.sendCSMessage(lutCSWorker.cs.previewLin(d.p,d.t,d.d));
						break;
				case 15:lutCSWorker.sendCSMessage(lutCSWorker.cs.getPrimaries(d.p,d.t));
						break;
				case 16:lutCSWorker.sendCSMessage(lutCSWorker.cs.psstColours(d.p,d.t));
						break;
				case 17:lutCSWorker.sendCSMessage(lutCSWorker.cs.getCATs(d.p,d.t));
						break;
				case 18:lutCSWorker.sendCSMessage(lutCSWorker.cs.getCCTDuv(d.p,d.t,d.d));
						break;
				case 19:lutCSWorker.sendCSMessage(lutCSWorker.cs.calcPrimaries(d.p,d.t));
						break;
			}
		}
	}, false);
}
LUTCSWorker.prototype.sendCSMessage = function(d) {
	if (this.cs.isTrans && typeof d.to !== 'undefined') {
		var max = d.to.length;
		var objArray = [];
		for (var j=0; j < max; j++) {
			objArray.push(d[d.to[j]]);
		}
		postMessage(d,objArray);
	} else {
		postMessage(d);
	}
};
// Stringify for inline Web Workers
function getCSString() {
	var out = "";
	// LUTColourSpace
	out += LUTColourSpace.toString() + "\n";
	for (var j in LUTColourSpace.prototype) {
		out += 'LUTColourSpace.prototype.' + j + '=' + LUTColourSpace.prototype[j].toString() + "\n";
	}
	// CCTxy
	out += CCTxy.toString() + "\n";
	for (var j in CCTxy.prototype) {
		out += 'CCTxy.prototype.' + j + '=' + CCTxy.prototype[j].toString() + "\n";
	}
	// Planck
	out += Planck.toString() + "\n";
	for (var j in Planck.prototype) {
		out += 'Planck.prototype.' + j + '=' + Planck.prototype[j].toString() + "\n";
	}
	// CSCAT
	out += CSCAT.toString() + "\n";
	for (var j in CSCAT.prototype) {
		out += 'CSCAT.prototype.' + j + '=' + CSCAT.prototype[j].toString() + "\n";
	}
	// CSWB
	out += CSWB.toString() + "\n";
	for (var j in CSWB.prototype) {
		out += 'CSWB.prototype.' + j + '=' + CSWB.prototype[j].toString() + "\n";
	}
	// CSSL3
	out += CSSL3.toString() + "\n";
	for (var j in CSSL3.prototype) {
		out += 'CSSL3.prototype.' + j + '=' + CSSL3.prototype[j].toString() + "\n";
	}
	// CSLogC
	out += CSLogC.toString() + "\n";
	for (var j in CSLogC.prototype) {
		out += 'CSLogC.prototype.' + j + '=' + CSLogC.prototype[j].toString() + "\n";
	}
	// CSVLog
	out += CSVLog.toString() + "\n";
	for (var j in CSVLog.prototype) {
		out += 'CSVLog.prototype.' + j + '=' + CSVLog.prototype[j].toString() + "\n";
	}
	// CSMatrix
	out += CSMatrix.toString() + "\n";
	for (var j in CSMatrix.prototype) {
		out += 'CSMatrix.prototype.' + j + '=' + CSMatrix.prototype[j].toString() + "\n";
	}
	// CSToneCurve
	out += CSToneCurve.toString() + "\n";
	for (var j in CSToneCurve.prototype) {
		out += 'CSToneCurve.prototype.' + j + '=' + CSToneCurve.prototype[j].toString() + "\n";
	}
	// CSToneCurvePlus
	out += CSToneCurvePlus.toString() + "\n";
	for (var j in CSToneCurvePlus.prototype) {
		out += 'CSToneCurvePlus.prototype.' + j + '=' + CSToneCurvePlus.prototype[j].toString() + "\n";
	}
	// CSLUT
	out += CSLUT.toString() + "\n";
	for (var j in CSLUT.prototype) {
		out += 'CSLUT.prototype.' + j + '=' + CSLUT.prototype[j].toString() + "\n";
	}
	// CSCanonIDT
	out += CSCanonIDT.toString() + "\n";
	for (var j in CSCanonIDT.prototype) {
		out += 'CSCanonIDT.prototype.' + j + '=' + CSCanonIDT.prototype[j].toString() + "\n";
	}
	// CSLabSpace
	out += CSLabSpace.toString() + "\n";
	for (var j in CSLabSpace.prototype) {
		out += 'CSLabSpace.prototype.' + j + '=' + CSLabSpace.prototype[j].toString() + "\n";
	}
	// LUTCSWorker
	out += LUTCSWorker.toString() + "\n";
	for (var j in LUTCSWorker.prototype) {
		out += 'LUTCSWorker.prototype.' + j + '=' + LUTCSWorker.prototype[j].toString() + "\n";
	}
	out += 'var lutCSWorker = new LUTCSWorker();' + "\n";
	return out;
}
var workerCSString = getCSString();
/* lut.js
* LUT handling object for the LUTCalc Web App.
* 31st December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function LUTs() {
}
LUTs.prototype.newLUT = function(d) {
	var params = {};
	if (typeof d.title === 'string') {
		params.title = d.title;
	}
	if (typeof d.format === 'string') {
		params.format = d.format;
	}
	if (typeof d.dims === 'number') {
		this.dims = d.dims;
	} else {
		dims = 1;
	}
	if (typeof d.min !== 'undefined' && (d.min[0] !== 0 || d.min[1] !== 0 || d.min[2] !== 0)) {
		params.fL = d.min[0];
		params.fLR = d.min[0];
		params.fLG = d.min[1];
		params.fLB = d.min[2];
	}
	if (typeof d.max !== 'undefined' && (d.max[0] !== 1 || d.max[1] !== 1 || d.max[2] !== 1)) {
		params.fH = d.max[0];
		params.fHR = d.max[0];
		params.fHG = d.max[1];
		params.fHB = d.max[2];
	}
	if (typeof d.fL === 'number') {
		params.fL = d.fL;
	}
	if (typeof d.fH === 'number') {
		params.fH = d.fH;
	}
	if (typeof d.fLR === 'number') {
		params.fLR = d.fLR;
	}
	if (typeof d.fLG === 'number') {
		params.fLG = d.fLG;
	}
	if (typeof d.fLB === 'number') {
		params.fLB = d.fLB;
	}
	if (typeof d.fHR === 'number') {
		params.fHR = d.fHR;
	}
	if (typeof d.fHG === 'number') {
		params.fHG = d.fHG;
	}
	if (typeof d.fHB === 'number') {
		params.fHB = d.fHB;
	}
	if (typeof d.spline !== 'undefined') {
		params.inSpline = d.spline;
	}
	if (typeof d.meta !== 'undefined') {
		params.meta = d.meta;
	}
	if (d.C.length === 3) {
		params.buffR = d.C[0].slice(0);
		params.buffG = d.C[1].slice(0);
		params.buffB = d.C[2].slice(0);
		if (this.dims === 3) {
			return new LUTVolume(params);
		} else {
			return new LUTRGBSpline(params);
		}
	} else {
		params.buff = d.C[0].slice(0);
		return new LUTSpline(params);
	}
};
// LUTSpline - base spline object; forward only but with arbitrary input range
function LUTSpline(params) {
	// Metadata
	if (typeof params.title === 'string') {
		this.title = params.title;
	} else {
		this.title = '';
	}
	if (typeof params.format === 'string') {
		this.format = params.format;
	} else {
		this.format = '';
	}
	if (typeof params.meta !== 'undefined') {
		this.meta = params.meta;
	} else {
		this.meta = {};
	}
	// Precalculate forward parameters
	this.FD = new Float64Array(params.buff);
	var fm = this.FD.length;
	var mono = this.FD[fm-1]-this.FD[0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	this.FA = new Float64Array(fm);
	this.FB = new Float64Array(fm);
	this.FC = new Float64Array(fm);
	var FP1 = new Float64Array(fm);
	var FD1 = new Float64Array(fm);
	for (var j=0; j<fm; j++) {
		if (j === 0) {
			FP1[0] = this.FD[1];
//			this.FC[0] = (0.1*this.FD[3]) - (0.8*this.FD[2]) + (2.3*this.FD[1]) - (1.6*this.FD[0]);
//			if (this.FC[0]*mono <= 0) { // opposite slope to monotonic
				this.FC[0] = -(0.5*this.FD[2]) + (2*this.FD[1]) - (1.5*this.FD[0]);
				if (this.FC[0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[0] = 0.0075 * mono / (fm-1);
				}
//			}
			FD1[0] = (this.FD[2] - this.FD[0])/2;
		} else if (j < fm-1) {
			FP1[j] = this.FD[j+1];
			this.FC[j] = (this.FD[j+1] - this.FD[j-1])/2;
			if (j === fm-2) {
//				FD1[j] = (-0.1*this.FD[j-2]) + (0.8*this.FD[j-1]) - (2.3*this.FD[j]) + (1.6*this.FD[j+1]);
//				if (FD1[j]*mono <= 0) { // opposite slope to monotonic
					FD1[j] = (0.5*this.FD[j-1]) - (2*this.FD[j]) + (1.5*this.FD[j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (fm-1);
					}
//				}
			} else {
				FD1[j] = (this.FD[j+2] - this.FD[j])/2;
			}
		} else {
			FP1[j] = this.FD[j];
			this.FC[j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[j] = (2*this.FD[j]) + this.FC[j] - (2*FP1[j]) + FD1[j];
		this.FB[j] = (-3*this.FD[j]) - (2*this.FC[j]) + (3*FP1[j]) - FD1[j];
	}
	this.FM = fm-1;
	// Set forward range
	this.fS = false;
	if (typeof params.fL === 'undefined' && typeof params.min !== 'undefined' && params.min[0] !== 0) {
		params.fL = params.min[0];
	}
	if (typeof params.fH === 'undefined' && typeof params.max !== 'undefined' && params.max[0] !== 1) {
		params.fH = params.max[0];
	}
	if (typeof params.fH === 'number') {
		this.fH = params.fH;
		if (typeof params.fL === 'number') {
			this.fL = params.fL;
		} else {
			this.fL = 0;
		}
	} else {
		this.fH = 1;
		this.fL = 0;
	}
	this.fLH = this.fH-this.fL;
	if (this.fL !== 0 || this.fH !==1) {
		this.fS = true;
	}
	// Allow for spline input (a bit nuts for 1D, but being robust)
	if (typeof params.inSpline !== 'undefined') {
		this.sin = true;
		this.ins = new LUTQSpline(params.inSpline);
	} else {
		this.sin = false;
	}
}
LUTSpline.prototype.buildL = function() {
	var fm = this.FD.length;
	var mono = this.FD[fm-1]-this.FD[0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	var FP1 = new Float64Array(fm);
	var FD1 = new Float64Array(fm);
	for (var j=0; j<fm; j++) {
		if (j === 0) {
			FP1[0] = this.FD[1];
				this.FC[0] = -(0.5*this.FD[2]) + (2*this.FD[1]) - (1.5*this.FD[0]);
				if (this.FC[0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[0] = 0.0075 * mono / (fm-1);
				}
			FD1[0] = (this.FD[2] - this.FD[0])/2;
		} else if (j < fm-1) {
			FP1[j] = this.FD[j+1];
			this.FC[j] = (this.FD[j+1] - this.FD[j-1])/2;
			if (j === fm-2) {
					FD1[j] = (0.5*this.FD[j-1]) - (2*this.FD[j]) + (1.5*this.FD[j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (fm-1);
					}
			} else {
				FD1[j] = (this.FD[j+2] - this.FD[j])/2;
			}
		} else {
			FP1[j] = this.FD[j];
			this.FC[j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[j] = (2*this.FD[j]) + this.FC[j] - (2*FP1[j]) + FD1[j];
		this.FB[j] = (-3*this.FD[j]) - (2*this.FC[j]) + (3*FP1[j]) - FD1[j];
	}
	this.FM = fm-1;
};
LUTSpline.prototype.f = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTSpline.prototype.df = function(L) {
	var s = this.FM;
	var o;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		o = s*this.FC[0];
	} else if (L >= s) {
		o = s*this.FC[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		o = s*((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
	}
	// Allow for nonlinear inputs
	if (this.sin) {
		var dO = this.ins.df(L);
		o *= dO;
	}
	if (this.fS) {
		o /= this.fLH;
	}
	return o;
};
LUTSpline.prototype.fCub = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTSpline.prototype.fTet = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTSpline.prototype.fLin = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTSpline.prototype.FCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
		}
	}
};
LUTSpline.prototype.FTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTSpline.prototype.FLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTSpline.prototype.fRGBCub = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		L = (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		L = ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		L = (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
	return new Float64Array([L,L,L]);
};
LUTSpline.prototype.fRGBTet = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		L = (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		L = ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		L = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
	return new Float64Array([L,L,L]);
};
LUTSpline.prototype.fRGBLin = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		L = (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		L = ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		L = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
	return new Float64Array([L,L,L]);
};
LUTSpline.prototype.rgbCub = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FCub(out.buffer);
	return out;
};
LUTSpline.prototype.rgbTet = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FTet(out.buffer);
	return out;
};
LUTSpline.prototype.rgbLin = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTSpline.prototype.RGBCub = function(buff) {
	this.FCub(out);
};
LUTSpline.prototype.RGBLin = function(buff) {
	this.FTet(out);
};
LUTSpline.prototype.RGBLin = function(buff) {
	this.FLin(out);
};
LUTSpline.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var s = this.FM;
		var r,l;
		if (this.fS) {
			c[0] = (c[0] - this.fL)/(this.fLH);
			c[1] = (c[1] - this.fL)/(this.fLH);
			c[2] = (c[2] - this.fL)/(this.fLH);
		}
		if (this.sin) {
			c[0] = this.ins.f(c[0]);
			c[1] = this.ins.f(c[1]);
			c[2] = this.ins.f(c[2]);
		}
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		if (c[0] <= 0) {
			J[0] = this.FC[0];
		} else if (c[0] >= s) {
			J[0] = this.FC[s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			J[0] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[1] <= 0) {
			J[4] = this.FC[0];
		} else if (c[1] >= s) {
			J[4] = this.FC[s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			J[4] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[2] <= 0) {
			J[8] = this.FC[0];
		} else if (c[2] >= s) {
			J[8] = this.FC[s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			J[8] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		return J;
	} else {
		return false;
	}
};
LUTSpline.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	if (M[0] !== 0 && M[4] !== 0 && M[8] !== 0) {
		return new Float64Array([
			1/M[0],	0,		0,
			0,		1/M[4],	0,
			0,		0,		1/M[8]
		]);
	} else {
		return false;
	}
};
LUTSpline.prototype.getDetails = function() {
	var out = {
		title: this.title,
		format: this.format,
		dims: 1,
		s: this.FM+1,
		min: new Float64Array([this.fL,this.fL,this.fL]),
		max: new Float64Array([this.fH,this.fH,this.fH]),
		C: [this.FD.buffer],
		meta: this.meta
	};
	return out;
};
LUTSpline.prototype.getL = function() {
	return this.FD.buffer;
};
LUTSpline.prototype.getRGB = function() {
	return [this.FD.buffer];
};
LUTSpline.prototype.getSize = function() {
	return this.FM+1;
};
LUTSpline.prototype.is1D = function() {
	return true;
};
LUTSpline.prototype.is3D = function() {
	return false;
};
LUTSpline.prototype.getTitle = function() {
	return this.title;
};
LUTSpline.prototype.getMetadata = function() {
	return this.meta;
};
LUTSpline.prototype.isClamped = function() {
	if (typeof this.clamped === 'undefined') {
		var mm = this.minMax();
		if ((mm[0] === 0 && mm[1] <= 1) || (mm[0] >= 0 && mm[1] === 1)) {
			this.clamped = true;
		} else {
			this.clamped = false;
		}
	}
	return this.clamped;
};
LUTSpline.prototype.deClamp = function() {
	if (this.isClamped()) {
		var m,c,C,L,H,LH,S;
		var fL,fH,fLH;
		var FD = this.FD;
		m = FD.length;
		var C = false;
		var L = 0;
		var H = m-1;
		for (var j=0; j<m; j++) {
			if (j>0) {
				if (FD[j] === 0) {
					C = true;
					L = j+1;
				}
			}
		}
		for (var j=m-2; j>=0; j--) {
			if (FD[j] === 1) {
				C = true;
				H = j-1;
			}
		}
		if (C) {
			if (L > H) {
				var low = H;
				var H = Math.min(L-2,m-1);
				var L = Math.max(low+2,0);
			}
			var LH = H-L;
			var S = new LUTQSpline(new Float64Array(c.subarray(L,LH+1)).buffer);
			var fL = this.fL;
			var fH = this.fH;
			var fLH= fH-fL;
			for (var j=0; j<m; j++) {
				if (j===L) {
					j = H;
				}
				// pass through the splines
				FD[j] = S.fCub((j - L)/LH);
			}
		}
		this.buildL();
		this.clamped = false;
	}
};
LUTSpline.prototype.minMax = function() {
	var x = new Float64Array([
		 9999,	// Absolute min value
		-9999	// Absolute max value
	]);
	var FD = this.FD;
	var m = FD.length;
	for (var j=0; j<m; j++) {
		if (FD[j] < x[0]) {
			x[0] = FD[j];
		}
		if (FD[j] > x[1]) {
			x[1] = FD[j];
		}
	}
	return x;
};
// LUTRSpline - spline object with arbitrary input range and inverse automatically calculated
function LUTRSpline(params) {
	this.method = 0; // choose which approach to use on 'f(x)', cubic, or linear - used by brent to calculate the reverse
	// Metadata
	if (typeof params.title === 'string') {
		this.title = params.title;
	} else {
		this.title = '';
	}
	if (typeof params.format === 'string') {
		this.format = params.format;
	} else {
		this.format = '';
	}
	if (typeof params.meta !== 'undefined') {
		this.meta = params.meta;
	} else {
		this.meta = {};
	}
	// Precalculate forward parameters
	this.FD = new Float64Array(params.buff);
	var fm = this.FD.length;
	var mono = this.FD[fm-1]-this.FD[0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	this.FA = new Float64Array(fm);
	this.FB = new Float64Array(fm);
	this.FC = new Float64Array(fm);
	var FP1 = new Float64Array(fm);
	var FD1 = new Float64Array(fm);
	for (var j=0; j<fm; j++) {
		if (j === 0) {
			FP1[0] = this.FD[1];
//			this.FC[0] = (0.1*this.FD[3]) - (0.8*this.FD[2]) + (2.3*this.FD[1]) - (1.6*this.FD[0]);
//			if (this.FC[0]*mono <= 0) { // opposite slope to monotonic
				this.FC[0] = -(0.5*this.FD[2]) + (2*this.FD[1]) - (1.5*this.FD[0]);
				if (this.FC[0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[0] = 0.0075 * mono / (fm-1);
				}
//			}
			FD1[0] = (this.FD[2] - this.FD[0])/2;
		} else if (j < fm-1) {
			FP1[j] = this.FD[j+1];
			this.FC[j] = (this.FD[j+1] - this.FD[j-1])/2;
			if (j === fm-2) {
//				FD1[j] = (-0.1*this.FD[j-2]) + (0.8*this.FD[j-1]) - (2.3*this.FD[j]) + (1.6*this.FD[j+1]);
//				if (FD1[j]*mono <= 0) { // opposite slope to monotonic
					FD1[j] = (0.5*this.FD[j-1]) - (2*this.FD[j]) + (1.5*this.FD[j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (fm-1);
					}
//				}
			} else {
				FD1[j] = (this.FD[j+2] - this.FD[j])/2;
			}
		} else {
			FP1[j] = this.FD[j];
			this.FC[j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[j] = (2*this.FD[j]) + this.FC[j] - (2*FP1[j]) + FD1[j];
		this.FB[j] = (-3*this.FD[j]) - (2*this.FC[j]) + (3*FP1[j]) - FD1[j];
	}
	this.FM = fm-1;
	// Allow for spline input (a bit nuts for 1D, but being robust)
	if (typeof params.inSpline !== 'undefined') {
		this.sin = true;
		this.ins = new LUTQSpline(params.inSpline);
	} else {
		this.sin = false;
	}
	// Set forward range
	this.fS = false;
	if (typeof params.fL === 'undefined' && typeof params.min !== 'undefined' && params.min[0] !== 0) {
		params.fL = params.min[0];
	}
	if (typeof params.fH === 'undefined' && typeof params.max !== 'undefined' && params.max[0] !== 1) {
		params.fH = params.max[0];
	}
	if (typeof params.fH === 'number') {
		this.fH = params.fH;
		if (typeof params.fL === 'number') {
			this.fL = params.fL;
		} else {
			this.fL = 0;
		}
	} else {
		this.fH = 1;
		this.fL = 0;
	}
	this.fLH = this.fH-this.fL;
	if (this.fL !== 0 || this.fH !==1) {
		this.fS = true;
	}
	// Set reverse range
	if (typeof params.rL === 'undefined' && typeof params.rmin !== 'undefined' && params.rmin[0] !== 0) {
		params.rL = params.rmin[0];
	}
	if (typeof params.rH === 'undefined' && typeof params.rmax !== 'undefined' && params.rmax[0] !== 1) {
		params.rH = params.rmax[0];
	}
	if (typeof params.rH === 'number') {
		this.rH = rH;
		if (typeof params.rL === 'number') {
			this.rL = rL;
		} else {
			this.rL = this.fL;
		}
	} else {
		this.rH = this.FD[fm - 1];
		this.rL = this.FD[0];
	}
	this.rLH = this.rH-this.rL;
	// Create reverse data points
	var rm;
	if (typeof params.minRM === 'number') {
		rm = Math.max(fm, minRM);
	} else {
		rm = Math.max(fm, 1024);
	}
	this.RM = rm-1;
	this.brent = new Brent(this);
	this.buildReverse();
}
LUTRSpline.prototype.f = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		if (this.method === 0) { // cubic
			return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
		} else { // tetrahedral or linear
			return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTRSpline.prototype.df = function(L) {
	var s = this.FM;
	var o;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		o = s*this.FC[0];
	} else if (L >= s) {
		o = s*this.FC[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		if (this.method === 0) { // cubic
			o = s*((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		} else { // tetrahedral or linear
			return s*(this.FD[l+1]-this.FD[l]);
		}
	}
	// Allow for nonlinear inputs
	if (this.sin) {
		var dO = this.ins.df(L);
		o *= dO;
	}
	if (this.fS) {
		o /= this.fLH;
	}
	return o;
};
LUTRSpline.prototype.fCub = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTRSpline.prototype.fTet = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTRSpline.prototype.fLin = function(L) {
	var s = this.FM;
	var r,l;
	if (this.fS) {
		L = (L - this.fL)/(this.fLH);
	}
	if (this.sin) {
		L = this.ins.f(L);
	}
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTRSpline.prototype.FCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
		}
	}
};
LUTRSpline.prototype.FTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTRSpline.prototype.FLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - this.fL)/(this.fLH);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTRSpline.prototype.fRGBCub = function(L) {
	L = this.f(L);
	return new Float64Array([L,L,L]);
};
LUTRSpline.prototype.fRGBTet = function(L) {
	L = this.fLin(L);
	return new Float64Array([L,L,L]);
};
LUTRSpline.prototype.fRGBLin = function(L) {
	L = this.fLin(L);
	return new Float64Array([L,L,L]);
};
LUTRSpline.prototype.rgbCub = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FCub(out.buffer);
	return out;
};
LUTRSpline.prototype.rgbTet = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTRSpline.prototype.rgbLin = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTRSpline.prototype.RGBCub = function(buff) {
	this.FCub(out);
};
LUTRSpline.prototype.RGBTet = function(buff) {
	this.FLin(out);
};
LUTRSpline.prototype.RGBLin = function(buff) {
	this.FLin(out);
};
LUTRSpline.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var s = this.FM;
		var r,l;
		if (this.fS) {
			c[0] = (c[0] - this.fL)/(this.fLH);
			c[1] = (c[1] - this.fL)/(this.fLH);
			c[2] = (c[2] - this.fL)/(this.fLH);
		}
		if (this.sin) {
			c[0] = this.ins.f(c[0]);
			c[1] = this.ins.f(c[1]);
			c[2] = this.ins.f(c[2]);
		}
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		if (c[0] <= 0) {
			J[0] = this.FC[0];
		} else if (c[0] >= s) {
			J[0] = this.FC[s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			J[0] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[1] <= 0) {
			J[4] = this.FC[0];
		} else if (c[1] >= s) {
			J[4] = this.FC[s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			J[4] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[2] <= 0) {
			J[8] = this.FC[0];
		} else if (c[2] >= s) {
			J[8] = this.FC[s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			J[8] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		return J;
	} else {
		return false;
	}
};
LUTRSpline.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	if (M[0] !== 0 && M[4] !== 0 && M[8] !== 0) {
		return new Float64Array([
			1/M[0],	0,		0,
			0,		1/M[4],	0,
			0,		0,		1/M[8]
		]);
	} else {
		return false;
	}
};
LUTRSpline.prototype.getDetails = function() {
	var out = {
		title: this.title,
		format: this.format,
		dims: 1,
		s: this.FM+1,
		min: new Float64Array([this.fL,this.fL,this.fL]),
		max: new Float64Array([this.fH,this.fH,this.fH]),
		C: [this.FD.buffer],
		meta: this.meta
	};
	return out;
};
LUTRSpline.prototype.getL = function() {
	return this.FD.buffer;
};
LUTRSpline.prototype.getRGB = function() {
	return [this.FD.buffer];
};
LUTRSpline.prototype.getSize = function() {
	return this.FM+1;
};
LUTRSpline.prototype.is1D = function() {
	return true;
};
LUTRSpline.prototype.is3D = function() {
	return false;
};
LUTRSpline.prototype.getTitle = function() {
	return this.title;
};
LUTRSpline.prototype.getMetadata = function() {
	return this.meta;
};
//
LUTRSpline.prototype.r = function(L) {
	var s = this.RM;
	var r,l;
	L = s * (L - this.rL)/(this.rLH);
	if (L <= 0) {
		return (L * this.RC[0]) + this.RD[0];
	} else if (L >= s) {
		return ((L-s) * this.RC[s]) + this.RD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		if (this.method === 0) { // cubic
			return (((((this.RA[l] * r) + this.RB[l]) * r) + this.RC[l]) * r) + this.RD[l];
		} else { // tetrahedral or linear
			return ((1-r)*this.RD[l]) + (r*this.RD[l+1]);
		}
	}
};
LUTRSpline.prototype.R = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.RM;
	var r,l;
	for (var j=0; j<m; j++) {
		c[j] = s * (c[j] - this.rL)/(this.rLH);
		if (c[j] <= 0) {
			c[j] = (c[j] * this.RC[0]) + this.RD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.RC[s]) + this.RD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			if (this.method === 0) { // cubic
				c[j] = (((((this.RA[l] * r) + this.RB[l]) * r) + this.RC[l]) * r) + this.RD[l];
			} else { // tetrahedral or linear
				c[j] = ((1-r)*this.RD[l]) + (r*this.RD[l+1]);
			}
		}
	}
};
LUTRSpline.prototype.buildReverse = function() {
	var rm = this.RM + 1;
	this.RD = new Float64Array(rm);
	var x;
	for (var j=0; j<rm; j++) {
		x = ((j/(rm-1))*(this.rLH)) + this.rL;
		if (j === 0 || x <= 0 || isNaN(this.RD[j-1]) || this.RD[j-1] <= -65534 || this.RD[j-1] >= 65534) {
			this.RD[j] = this.brent.findRoot(x,x);
		} else {
			this.RD[j] = this.brent.findRoot(this.RD[j-1],x);
		}
		if (this.RD[j] < -65534) {
			this.RD[j] = -65534;
		} else if (this.RD[j] > 65534) {
			this.RD[j] = 65534;
		}
	}
	if (isNaN(this.RD[0])) {
		for (var j=0; j<rm; j++) {
			if (!isNaN(this.RD[j])) {
				this.RD[0] = this.RD[j];
				break;
			}
		}
	}
	for (var j=1; j<rm; j++) {
		if (isNaN(this.RD[j])) {
			this.RD[j] = this.RD[j-1];
		}
	}
	for (var j=1; j<rm; j++) {
		this.RD[j] = (this.RD[j] * this.fLH) + this.fL;
	}
	mono = this.RD[rm-1]-this.RD[0]; // If things are working, should be unchanged, but belt and braces....
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	// Precalculate reverse parameters
	this.RA = new Float64Array(rm);
	this.RB = new Float64Array(rm);
	this.RC = new Float64Array(rm);
	var RP1 = new Float64Array(rm);
	var RD1 = new Float64Array(rm);
	for (var j=0; j<rm; j++) {
		if (j === 0) {
			RP1[0] = this.RD[1];
//			this.RC[0] = (0.1*this.RD[3]) - (0.8*this.RD[2]) + (2.3*this.RD[1]) - (1.6*this.RD[0]);
//			if (this.RC[0]*mono <= 0) { // opposite slope to monotonic
				this.RC[0] = -(0.5*this.RD[2]) + (2*this.RD[1]) - (1.5*this.RD[0]);
				if (this.RC[0]*mono <= 0) { // still opposite slope to monotonic
					this.RC[0] = 0.0075 * mono / (rm-1);
				}
//			}
			RD1[0] = (this.RD[2] - this.RD[0])/2;
		} else if (j < rm-1) {
			RP1[j] = this.RD[j+1];
			this.RC[j] = (this.RD[j+1] - this.RD[j-1])/2
			if (j === rm-2) {
//				RD1[j] = (-0.1*this.RD[j-2]) + (0.8*this.RD[j-1]) - (2.3*this.RD[j]) + (1.6*this.RD[j+1]);
//				if (RD1[j]*mono <= 0) { // opposite slope to monotonic
					RD1[j] = (0.5*this.RD[j-1]) - (2*this.RD[j]) + (1.5*this.RD[j+1]);
					if (RD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						RD1[j] = 0.0075 * mono / (rm-1);
					}
//				}
			} else {
				RD1[j] = (this.RD[j+2] - this.RD[j])/2;
			}
		} else {
			RP1[j] = this.RD[j];
			this.RC[j] = RD1[j-1];
			RD1[j] = RD1[j-1];
		}
		this.RA[j] = (2*this.RD[j]) + this.RC[j] - (2*RP1[j]) + RD1[j];
		this.RB[j] = (-3*this.RD[j]) - (2*this.RC[j]) + (3*RP1[j]) - RD1[j];
	}
};
LUTRSpline.prototype.setMethod = function(idx) {
	if (typeof idx === 'number') {
		this.method = idx;
		this.buildReverse();
		return true;
	} else {
		return false;
	}
};
LUTRSpline.prototype.getMethod = function() {
	return this.method;
};
LUTRSpline.prototype.getReverse = function() {
	return this.RD.buffer;
};
LUTRSpline.prototype.getMinMax = function() {
	var a=0;
	var b=1;
	var m = this.RD.length;
	for (var j=0; j<m; j++) {
		if (this.RD[j] > b) {
			b = this.RD[j];
		} else if (this.RD[j] < a) {
			a = this.RD[j];
		}
	}
	return {a: a, b: b};
};
LUTRSpline.prototype.getHighLow = function() {
	return {forH:this.fH,forL:this.fL,revH:this.rH,revL:this.rL}
};
LUTRSpline.prototype.getRM = function() {
	return this.RM + 1;
};
LUTRSpline.prototype.getR = function() {
	return this.RD.buffer;
};
// LUTQSpline - spline object paired down to forward only and mesh over 0-1.0
function LUTQSpline(buff) {
	this.meta = {};
	// Precalculate forward parameters
	this.FD = new Float64Array(buff);
	var fm = this.FD.length;
	var mono = this.FD[fm-1]-this.FD[0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	this.FA = new Float64Array(fm);
	this.FB = new Float64Array(fm);
	this.FC = new Float64Array(fm);
	var FP1 = new Float64Array(fm);
	var FD1 = new Float64Array(fm);
	for (var j=0; j<fm; j++) {
		if (j === 0) {
			FP1[0] = this.FD[1];
//			this.FC[0] = (0.1*this.FD[3]) - (0.8*this.FD[2]) + (2.3*this.FD[1]) - (1.6*this.FD[0]);
//			if (this.FC[0]*mono <= 0) { // opposite slope to monotonic
				this.FC[0] = -(0.5*this.FD[2]) + (2*this.FD[1]) - (1.5*this.FD[0]);
				if (this.FC[0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[0] = 0.0075 * mono / (fm-1);
				}
//			}
			FD1[0] = (this.FD[2] - this.FD[0])/2;
		} else if (j < fm-1) {
			FP1[j] = this.FD[j+1];
			this.FC[j] = (this.FD[j+1] - this.FD[j-1])/2;
			if (j === fm-2) {
//				FD1[j] = (-0.1*this.FD[j-2]) + (0.8*this.FD[j-1]) - (2.3*this.FD[j]) + (1.6*this.FD[j+1]);
//				if (FD1[j]*mono <= 0) { // opposite slope to monotonic
					FD1[j] = (0.5*this.FD[j-1]) - (2*this.FD[j]) + (1.5*this.FD[j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (fm-1);
					}
//				}
			} else {
				FD1[j] = (this.FD[j+2] - this.FD[j])/2;
			}
		} else {
			FP1[j] = this.FD[j];
			this.FC[j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[j] = (2*this.FD[j]) + this.FC[j] - (2*FP1[j]) + FD1[j];
		this.FB[j] = (-3*this.FD[j]) - (2*this.FC[j]) + (3*FP1[j]) - FD1[j];
	}
	this.FM = fm-1;
}
LUTQSpline.prototype.f = function(L) {
	var s = this.FM;
	var r,l;
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTQSpline.prototype.df = function(L) {
	var s = this.FM;
	var o;
	var r,l;
	L *= s;
	if (L <= 0) {
		return s*this.FC[0];
	} else if (L >= s) {
		return s*this.FC[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return s*((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
	}
};
LUTQSpline.prototype.fCub = function(L) {
	var s = this.FM;
	var r,l;
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
	}
};
LUTQSpline.prototype.fTet = function(L) {
	var s = this.FM;
	var r,l;
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTQSpline.prototype.fLin = function(L) {
	var s = this.FM;
	var r,l;
	L *= s;
	if (L <= 0) {
		return (L * this.FC[0]) + this.FD[0];
	} else if (L >= s) {
		return ((L-s) * this.FC[s]) + this.FD[s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
	}
};
LUTQSpline.prototype.FCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = (((((this.FA[l] * r) + this.FB[l]) * r) + this.FC[l]) * r) + this.FD[l];
		}
	}
};
LUTQSpline.prototype.FTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTQSpline.prototype.FLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM;
	var r,l;
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[0]) + this.FD[0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[s]) + this.FD[s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[l]) + (r*this.FD[l+1]);
		}
	}
};
LUTQSpline.prototype.fRGBCub = function(L) {
	L = this.f(L);
	return new Float64Array([L,L,L]);
};
LUTQSpline.prototype.fRGBTet = function(L) {
	L = this.fLin(L);
	return new Float64Array([L,L,L]);
};
LUTQSpline.prototype.fRGBLin = function(L) {
	L = this.fLin(L);
	return new Float64Array([L,L,L]);
};
LUTQSpline.prototype.rgbCub = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FCub(out.buffer);
	return out;
};
LUTQSpline.prototype.rgbTet = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTQSpline.prototype.rgbLin = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.FLin(out.buffer);
	return out;
};
LUTQSpline.prototype.RGBCub = function(buff) {
	this.FCub(out);
};
LUTQSpline.prototype.RGBTet = function(buff) {
	this.FLin(out);
};
LUTQSpline.prototype.RGBLin = function(buff) {
	this.FLin(out);
};
LUTQSpline.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var s = this.FM;
		var r,l;
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		if (c[0] <= 0) {
			J[0] = this.FC[0];
		} else if (c[0] >= s) {
			J[0] = this.FC[s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			J[0] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[1] <= 0) {
			J[4] = this.FC[0];
		} else if (c[1] >= s) {
			J[4] = this.FC[s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			J[4] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[2] <= 0) {
			J[8] = this.FC[0];
		} else if (c[2] >= s) {
			J[8] = this.FC[s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			J[8] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		J[0] *= s;
		J[4] *= s;
		J[8] *= s;
		return J;
	} else {
		return false;
	}
};
LUTQSpline.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	if (M[0] !== 0 && M[4] !== 0 && M[8] !== 0) {
		return new Float64Array([
			1/M[0],	0,		0,
			0,		1/M[4],	0,
			0,		0,		1/M[8]
		]);
	} else {
		return false;
	}
};
LUTQSpline.prototype.getDetails = function() {
	return {
		title: '',
		format: '',
		dims: 1,
		s: this.FM+1,
		min: new Float64Array([0,0,0]),
		max: new Float64Array([1,1,1]),
		C: [this.FD.buffer],
		meta: this.meta
	};
};
LUTQSpline.prototype.getL = function() {
	return this.FD.buffer;
};
LUTQSpline.prototype.getRGB = function() {
	return [this.FD.buffer];
};
LUTQSpline.prototype.getSize = function() {
	return this.FM+1;
};
LUTQSpline.prototype.is1D = function() {
	return true;
};
LUTQSpline.prototype.is3D = function() {
	return false;
};
LUTQSpline.prototype.getTitle = function() {
	return '';
};
LUTQSpline.prototype.getMetadata = function() {
	return this.meta;
};
//
LUTQSpline.prototype.dRGB = function(rgbIn) {
	// no point in a full, square Jacobian matrix for a 1D LUT
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var o = new Float64Array(3);
		var s = this.FM;
		var r,l;
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		if (c[0] <= 0) {
			o[0] = this.FC[0];
		} else if (c[0] >= s) {
			o[0] = this.FC[s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			o[0] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[1] <= 0) {
			o[1] = this.FC[0];
		} else if (c[1] >= s) {
			o[1] = this.FC[s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			o[1] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		if (c[2] <= 0) {
			o[2] = this.FC[0];
		} else if (c[2] >= s) {
			o[2] = this.FC[s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			o[2] = ((((3*this.FA[l] * r) + (2*this.FB[l])) * r) + this.FC[l]);
		}
		o[0] *= s;
		o[1] *= s;
		o[2] *= s;
		return o;
	} else {
		return false;
	}
};
// LUTRGBSpline - spline object with different 1D splines for each RGB channel
function LUTRGBSpline(params) {
	// Metadata
	if (typeof params.title === 'string') {
		this.title = params.title;
	} else {
		this.title = '';
	}
	if (typeof params.format === 'string') {
		this.format = params.format;
	} else {
		this.format = '';
	}
	if (typeof params.meta !== 'undefined') {
		this.meta = params.meta;
	} else {
		this.meta = {};
	}
	this.Y = new Float64Array([0.2126,0.7152,0.0722]); // Rec709 luma coefficients
	// Set forward range
	this.fL = new Float64Array(4);
	this.fH = new Float64Array(4);
	this.fS = false;
	if (typeof params.min !== 'undefined' && (params.min[0] !== 0 || params.min[1] !== 0 || params.min[2] !== 0)) {
		params.fL = params.min[0];
		params.fLR = params.min[0];
		params.fLG = params.min[1];
		params.fLB = params.min[2];
	}
	if (typeof params.max !== 'undefined' && (params.max[0] !== 1 || params.max[1] !== 1 || params.max[2] !== 1)) {
		params.fH = params.max[0];
		params.fHR = params.max[0];
		params.fHG = params.max[1];
		params.fHB = params.max[2];
	}
	if (typeof params.fH === 'number') {
		this.fH[0] = params.fH;
		this.fH[1] = params.fH;
		this.fH[2] = params.fH;
	} else {
		this.fH[0] = 1;
		this.fH[1] = 1;
		this.fH[2] = 1;
	}
	if (typeof params.fL === 'number') {
		this.fL[0] = params.fL;
		this.fL[1] = params.fL;
		this.fL[2] = params.fL;
	} else {
		this.fL[0] = 0;
		this.fL[1] = 0;
		this.fL[2] = 0;
	}
	if (typeof params.fLR === 'number' &&
		typeof params.fHR === 'number' &&
		typeof params.fLG === 'number' &&
		typeof params.fHG === 'number' &&
		typeof params.fLB === 'number' &&
		typeof params.fHB === 'number') {
		this.fL[0] = params.fLR;
		this.fH[0] = params.fHR;
		this.fL[1] = params.fLG;
		this.fH[1] = params.fHG;
		this.fL[2] = params.fLB;
		this.fH[2] = params.fHB;
	}
	this.fLH = new Float64Array([this.fH[0]-this.fL[0],this.fH[1]-this.fL[1],this.fH[2]-this.fL[2],0]);
	if (this.fL[0] !== 0 || this.fL[1] !== 0 || this.fL[2] !== 0 || this.fH[0] !== 1 || this.fH[1] !== 1 || this.fH[2] !== 1) {
		this.fS = true;
	}
	// Allow for spline input (a bit nuts for 1D, but being robust)
	if (typeof params.inSpline !== 'undefined') {
		this.sin = true;
		this.ins = new LUTQSpline(params.inSpline);
	} else {
		this.sin = false;
	}
	// Create three separate splines for the red, green and blue channels.
	this.FA = [];
	this.FB = [];
	this.FC = [];
	this.FD = [];
	this.FM = [];
	this.FD[0] = new Float64Array(params.buffR);
	this.FD[1] = new Float64Array(params.buffG);
	this.FD[2] = new Float64Array(params.buffB);
	var fm;
	for (var i=0; i<3; i++) {
		fm = this.FD[i].length;
		this.FA[i] = new Float64Array(fm);
		this.FB[i] = new Float64Array(fm);
		this.FC[i] = new Float64Array(fm);
		this.FM[i] = fm-1;
	}
	this.buildMesh();
	// Precalculate Luma arrays
	this.buildL();
}
LUTRGBSpline.prototype.buildMesh = function() {
	var buff,fm,mono;
	var FP1,FD1;
	// Precalculate forward parameters
	for (var i=0; i<3; i++) {
		fm = this.FD[i].length;
		mono = this.FD[i][fm-1]-this.FD[i][0];
		if (mono >= 0) {
			mono = 1;
		} else if (mono < 0) {
			mono = -1;
		}
		FP1 = new Float64Array(fm);
		FD1 = new Float64Array(fm);
		for (var j=0; j<fm; j++) {
			if (j === 0) {
				FP1[0] = this.FD[i][1];
//				this.FC[i][0] = (0.1*this.FD[i][3]) - (0.8*this.FD[i][2]) + (2.3*this.FD[i][1]) - (1.6*this.FD[i][0]);
//				if (this.FC[i][0]*mono <= 0) { // opposite slope to monotonic
					this.FC[i][0] = -(0.5*this.FD[i][2]) + (2*this.FD[i][1]) - (1.5*this.FD[i][0]);
					if (this.FC[i][0]*mono <= 0) { // still opposite slope to monotonic
						this.FC[i][0] = 0.0075 * mono / (fm-1);
					}
//				}
				FD1[0] = (this.FD[i][2] - this.FD[i][0])/2;
			} else if (j < fm-1) {
				FP1[j] = this.FD[i][j+1];
				this.FC[i][j] = (this.FD[i][j+1] - this.FD[i][j-1])/2;
				if (j === fm-2) {
//					FD1[j] = (-0.1*this.FD[i][j-2]) + (0.8*this.FD[i][j-1]) - (2.3*this.FD[i][j]) + (1.6*this.FD[i][j+1]);
//					if (FD1[j]*mono <= 0) { // opposite slope to monotonic
						FD1[j] = (0.5*this.FD[i][j-1]) - (2*this.FD[i][j]) + (1.5*this.FD[i][j+1]);
						if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
							FD1[j] = 0.0075 * mono / (fm-1);
						}
//					}
				} else {
					FD1[j] = (this.FD[i][j+2] - this.FD[i][j])/2;
				}
			} else {
				FP1[j] = this.FD[i][j];
				this.FC[i][j] = FD1[j-1];
				FD1[j] = FD1[j-1];
			}
			this.FA[i][j] = (2*this.FD[i][j]) + this.FC[i][j] - (2*FP1[j]) + FD1[j];
			this.FB[i][j] = (-3*this.FD[i][j]) - (2*this.FC[i][j]) + (3*FP1[j]) - FD1[j];
		}
	}
};
LUTRGBSpline.prototype.buildL = function() {
	this.fL[3] = Math.min(this.fL[0],this.fL[1],this.fL[2]);
	this.fH[3] = Math.max(this.fH[0],this.fH[1],this.fH[2]);
	this.fLH[3]= this.fH[3]-this.fL[3];
	this.FM[3] = Math.max(this.FM[0],this.FM[1],this.FM[2]);
	if (this.FM[3] < 64) {
		this.FM[3] = 64;
	}
	var m = this.FM[3] + 1;
	this.FD[3] = new Float64Array(m);
	var input,L,s,r,l,mono;
	// First build array of luma values from RGB splines
	for (var j=0; j<m; j++) {
		input = (j*(this.fLH[3])/(m-1))+this.fL[3];
		for (var i=0; i<3; i++) {
			s = this.FM[i];
			L = (input - this.fL[i])/(this.fLH[i]);
			if (this.sin) {
				L = this.ins.f(L);
			}
			L *= s;
			if (L <= 0) {
				L = (L * this.FC[i][0]) + this.FD[i][0];
			} else if (L >= s) {
				L = ((L-s) * this.FC[i][s]) + this.FD[i][s];
			} else {
				l = Math.floor(L);
				r = L-l;
				L = (((((this.FA[i][l] * r) + this.FB[i][l]) * r) + this.FC[i][l]) * r) + this.FD[i][l];
			}
			this.FD[3][j] += L * this.Y[i];
		}
	}
	// Now precalculate forward parameters
	this.FA[3] = new Float64Array(m);
	this.FB[3] = new Float64Array(m);
	this.FC[3] = new Float64Array(m);
	var FP1 = new Float64Array(m);
	var FD1 = new Float64Array(m);
	mono = this.FD[3][m-1]-this.FD[3][0];
	if (mono >= 0) {
		mono = 1;
	} else if (mono < 0) {
		mono = -1;
	}
	for (var j=0; j<m; j++) {
		if (j === 0) {
			FP1[0] = this.FD[3][1];
//			this.FC[3][0] = (0.1*this.FD[3][3]) - (0.8*this.FD[3][2]) + (2.3*this.FD[3][1]) - (1.6*this.FD[3][0]);
//			if (this.FC[3][0]*mono <= 0) { // opposite slope to monotonic
				this.FC[3][0] = -(0.5*this.FD[3][2]) + (2*this.FD[3][1]) - (1.5*this.FD[3][0]);
				if (this.FC[3][0]*mono <= 0) { // still opposite slope to monotonic
					this.FC[3][0] = 0.0075 * mono / (m-1);
				}
//			}
			FD1[0] = (this.FD[3][2] - this.FD[3][0])/2;
		} else if (j < m-1) {
			FP1[j] = this.FD[3][j+1];
			this.FC[3][j] = (this.FD[3][j+1] - this.FD[3][j-1])/2;
			if (j === m-2) {
//				FD1[j] = (-0.1*this.FD[3][j-2]) + (0.8*this.FD[3][j-1]) - (2.3*this.FD[3][j]) + (1.6*this.FD[3][j+1]);
//				if (FD1[j]*mono <= 0) { // opposite slope to monotonic
					FD1[j] = (0.5*this.FD[3][j-1]) - (2*this.FD[3][j]) + (1.5*this.FD[3][j+1]);
					if (FD1[j]*mono <= 0) { // still opposite slope to monotonic - give up!
						FD1[j] = 0.0075 * mono / (m-1);
					}
//				}
			} else {
				FD1[j] = (this.FD[3][j+2] - this.FD[3][j])/2;
			}
		} else {
			FP1[j] = this.FD[3][j];
			this.FC[3][j] = FD1[j-1];
			FD1[j] = FD1[j-1];
		}
		this.FA[3][j] = (2*this.FD[3][j]) + this.FC[3][j] - (2*FP1[j]) + FD1[j];
		this.FB[3][j] = (-3*this.FD[3][j]) - (2*this.FC[3][j]) + (3*FP1[j]) - FD1[j];
	}
};
LUTRGBSpline.prototype.f = function(L) {
	var s = this.FM[3];
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		return (L * this.FC[3][0]) + this.FD[3][0];
	} else if (L >= s) {
		return ((L-s) * this.FC[3][s]) + this.FD[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[3][l] * r) + this.FB[3][l]) * r) + this.FC[3][l]) * r) + this.FD[3][l];
	}
};
LUTRGBSpline.prototype.df = function(L) {
	var s = this.FM[3];
	var o;
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		o = s*this.FC[3][0];
	} else if (L >= s) {
		o = s*this.FC[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		o = s*((((3*this.FA[3][l] * r) + (2*this.FB[3][l])) * r) + this.FC[3][l]);
	}
	// Allow for scaled inputs
	if (this.fS) {
		o /= this.fLH[3];
	}
	return o;
};
LUTRGBSpline.prototype.fCub = function(L) {
	var s = this.FM[3];
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		return (L * this.FC[3][0]) + this.FD[3][0];
	} else if (L >= s) {
		return ((L-s) * this.FC[3][s]) + this.FD[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return (((((this.FA[3][l] * r) + this.FB[3][l]) * r) + this.FC[3][l]) * r) + this.FD[3][l];
	}
};
LUTRGBSpline.prototype.fTet = function(L) {
	var s = this.FM[3];
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		return (L * this.FC[3][0]) + this.FD[3][0];
	} else if (L >= s) {
		return ((L-s) * this.FC[3][s]) + this.FD[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[3][l]) + (r*this.FD[3][l+1]);
	}
};
LUTRGBSpline.prototype.fLin = function(L) {
	var s = this.FM[3];
	var r,l;
	if (this.fS) {
		L = s * (L - this.fL[3])/(this.fLH[3]);
	} else {
		L *= s;
	}
	if (L <= 0) {
		return (L * this.FC[3][0]) + this.FD[3][0];
	} else if (L >= s) {
		return ((L-s) * this.FC[3][s]) + this.FD[3][s];
	} else {
		l = Math.floor(L);
		r = L-l;
		return ((1-r)*this.FD[3][l]) + (r*this.FD[3][l+1]);
	}
};
LUTRGBSpline.prototype.FCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM[3];
	var fL = this.fL[3];
	var fLH = this.fLH[3];
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = (c[j] - fL)/(fLH);
		}
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[3][0]) + this.FD[3][0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[3][s]) + this.FD[3][s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = (((((this.FA[3][l] * r) + this.FB[3][l]) * r) + this.FC[3][l]) * r) + this.FD[3][l];
		}
	}
};
LUTRGBSpline.prototype.FTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM[3];
	var fL = this.fL[3];
	var fLH = this.fLH[3];
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = s * (c[j] - fL)/(fLH);
		}
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[3][0]) + this.FD[3][0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[3][s]) + this.FD[3][s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[3][l]) + (r*this.FD[3][l+1]);
		}
	}
};
LUTRGBSpline.prototype.FLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var s = this.FM[3];
	var fL = this.fL[3];
	var fLH = this.fLH[3];
	var r,l;
	if (this.fS) {
		for (var j=0; j<m; j++) {
			c[j] = s * (c[j] - fL)/(fLH);
		}
	}
	for (var j=0; j<m; j++) {
		c[j] *= s;
		if (c[j] <= 0) {
			c[j] = (c[j] * this.FC[3][0]) + this.FD[3][0];
		} else if (c[j] >= s) {
			c[j] = ((c[j]-s) * this.FC[3][s]) + this.FD[3][s];
		} else {
			l = Math.floor(c[j]);
			r = c[j]-l;
			c[j] = ((1-r)*this.FD[3][l]) + (r*this.FD[3][l+1]);
		}
	}
};
LUTRGBSpline.prototype.fRGBCub = function(L) {
	var s;
	var r,l;
	var o = new Float64Array(3);
	if (this.fS) {
		o[0] = (L - this.fL[0])/(this.fLH[0]);
		o[1] = (L - this.fL[1])/(this.fLH[1]);
		o[2] = (L - this.fL[2])/(this.fLH[2]);
	}
	if (this.sin) {
		this.ins.FCub(o.buffer);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		o[i] *= s;
		if (o[i] <= 0) {
			o[i] = (o[i] * this.FC[i][0]) + this.FD[i][0];
		} else if (o[i] >= s) {
			o[i] = ((o[i]-s) * this.FC[i][s]) + this.FD[i][s];
		} else {
			l = Math.floor(o[i]);
			r = o[i]-l;
			o[i] = (((((this.FA[i][l] * r) + this.FB[i][l]) * r) + this.FC[i][l]) * r) + this.FD[i][l];
		}
	}
	return o;
};
LUTRGBSpline.prototype.fRGBTet = function(L) {
	var s;
	var r,l;
	var o = new Float64Array(3);
	if (this.fS) {
		o[0] = (L - this.fL[0])/(this.fLH[0]);
		o[1] = (L - this.fL[1])/(this.fLH[1]);
		o[2] = (L - this.fL[2])/(this.fLH[2]);
	}
	if (this.sin) {
		this.ins.FCub(o.buffer);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		o[i] *= s;
		if (o[i] <= 0) {
			o[i] = (o[i] * this.FC[i][0]) + this.FD[i][0];
		} else if (o[i] >= s) {
			o[i] = ((o[i]-s) * this.FC[i][s]) + this.FD[i][s];
		} else {
			l = Math.floor(o[i]);
			r = o[i]-l;
			o[j] = ((1-r)*this.FD[i][l]) + (r*this.FD[i][l+1]);
		}
	}
	return o;
};
LUTRGBSpline.prototype.fRGBLin = function(L) {
	var s;
	var r,l;
	var o = new Float64Array(3);
	if (this.fS) {
		o[0] = (L - this.fL[0])/(this.fLH[0]);
		o[1] = (L - this.fL[1])/(this.fLH[1]);
		o[2] = (L - this.fL[2])/(this.fLH[2]);
	}
	if (this.sin) {
		this.ins.FCub(o.buffer);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		o[i] *= s;
		if (o[i] <= 0) {
			o[i] = (o[i] * this.FC[i][0]) + this.FD[i][0];
		} else if (o[i] >= s) {
			o[i] = ((o[i]-s) * this.FC[i][s]) + this.FD[i][s];
		} else {
			l = Math.floor(o[i]);
			r = o[i]-l;
			o[j] = ((1-r)*this.FD[i][l]) + (r*this.FD[i][l+1]);
		}
	}
	return o;
};
LUTRGBSpline.prototype.rgbCub = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.RGBCub(out.buffer);
	return out;
};
LUTRGBSpline.prototype.rgbTet = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.RGBLin(out.buffer);
	return out;
};
LUTRGBSpline.prototype.rgbLin = function(rgb) {
	var out = new Float64Array(rgb.buffer.slice(0));
	this.RGBLin(out.buffer);
	return out;
};
LUTRGBSpline.prototype.RGBCub = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var fL = this.fL;
	var fLH = this.fLH;
	var s,k,l,r;
	if (this.fS) {
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		for (var j=0; j<m; j+=3) {
			k = j+i;
			c[k] *= s;
			if (c[k] <= 0) {
				c[k] = (c[k] * this.FC[i][0]) + this.FD[i][0];
			} else if (c[k] >= s) {
				c[k] = ((c[k]-s) * this.FC[i][s]) + this.FD[i][s];
			} else {
				l = Math.floor(c[k]);
				r = c[k]-l;
				c[k] = (((((this.FA[i][l] * r) + this.FB[i][l]) * r) + this.FC[i][l]) * r) + this.FD[i][l];
			}
		}
	}
};
LUTRGBSpline.prototype.RGBTet = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var fL = this.fL;
	var fLH = this.fLH;
	var s,k,l,r;
	if (this.fS) {
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		for (var j=0; j<m; j+=3) {
			k = j+i;
			c[k] *= s;
			if (c[k] <= 0) {
				c[k] = (c[k] * this.FC[i][0]) + this.FD[i][0];
			} else if (c[k] >= s) {
				c[k] = ((c[k]-s) * this.FC[i][s]) + this.FD[i][s];
			} else {
				l = Math.floor(c[k]);
				r = c[k]-l;
				c[j] = ((1-r)*this.FD[i][l]) + (r*this.FD[i][l+1]);
			}
		}
	}
};
LUTRGBSpline.prototype.RGBLin = function(buff) {
	var c = new Float64Array(buff);
	var m = c.length;
	var fL = this.fL;
	var fLH = this.fLH;
	var s,k,l,r;
	if (this.fS) {
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var i=0; i<3; i++) {
		s = this.FM[i];
		for (var j=0; j<m; j+=3) {
			k = j+i;
			c[k] *= s;
			if (c[k] <= 0) {
				c[k] = (c[k] * this.FC[i][0]) + this.FD[i][0];
			} else if (c[k] >= s) {
				c[k] = ((c[k]-s) * this.FC[i][s]) + this.FD[i][s];
			} else {
				l = Math.floor(c[k]);
				r = c[k]-l;
				c[j] = ((1-r)*this.FD[i][l]) + (r*this.FD[i][l+1]);
			}
		}
	}
};
LUTRGBSpline.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var s;
		var r,l;
		if (this.fS) {
			c[0] = (c[0] - this.fL[0])/(this.fLH[0]);
			c[1] = (c[1] - this.fL[1])/(this.fLH[1]);
			c[2] = (c[2] - this.fL[2])/(this.fLH[2]);
		}
		if (this.sin) {
			c[0] = this.ins.f(c[0]);
			c[1] = this.ins.f(c[1]);
			c[2] = this.ins.f(c[2]);
		}
		s = this.FM[0];
		c[0] *= s;
		if (c[0] <= 0) {
			J[0] = this.FC[0][0];
		} else if (c[0] >= s) {
			J[0] = this.FC[0][s];
		} else {
			l = Math.floor(c[0]);
			r = c[0]-l;
			J[0] = ((((3*this.FA[0][l] * r) + (2*this.FB[0][l])) * r) + this.FC[0][l]);
		}
		s = this.FM[1];
		c[1] *= s;
		if (c[1] <= 0) {
			J[4] = this.FC[1][0];
		} else if (c[1] >= s) {
			J[4] = this.FC[1][s];
		} else {
			l = Math.floor(c[1]);
			r = c[1]-l;
			J[4] = ((((3*this.FA[1][l] * r) + (2*this.FB[1][l])) * r) + this.FC[1][l]);
		}
		s = this.FM[2];
		c[2] *= s;
		if (c[2] <= 0) {
			J[8] = this.FC[2][0];
		} else if (c[2] >= s) {
			J[8] = this.FC[2][s];
		} else {
			l = Math.floor(c[2]);
			r = c[2]-l;
			J[8] = ((((3*this.FA[2][l] * r) + (2*this.FB[2][l])) * r) + this.FC[2][l]);
		}
		// Scale to 0-1 range (from 0-s)
		J[0] *= s;
		J[1] *= s;
		J[2] *= s;
		J[3] *= s;
		J[4] *= s;
		J[5] *= s;
		J[6] *= s;
		J[7] *= s;
		J[8] *= s;
		if (this.sin) {
			var dRGB = this.ins.dRGB(rgbIn.buffer);
			J[0] *= dRGB[0];
			J[1] *= dRGB[1];
			J[2] *= dRGB[2];
			J[3] *= dRGB[0];
			J[4] *= dRGB[1];
			J[5] *= dRGB[2];
			J[6] *= dRGB[0];
			J[7] *= dRGB[1];
			J[8] *= dRGB[2];
		}
		if (this.fS) {
			J[0] /= fLH[0];
			J[1] /= fLH[1];
			J[2] /= fLH[2];
			J[3] /= fLH[0];
			J[4] /= fLH[1];
			J[5] /= fLH[2];
			J[6] /= fLH[0];
			J[7] /= fLH[1];
			J[8] /= fLH[2];
		}
		return J;
	} else {
		return false;
	}
};
LUTRGBSpline.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	if (M[0] !== 0 && M[4] !== 0 && M[8] !== 0) {
		return new Float64Array([
			1/M[0],	0,		0,
			0,		1/M[4],	0,
			0,		0,		1/M[8]
		]);
	} else {
		return false;
	}
};
LUTRGBSpline.prototype.getDetails = function(L) {
	var out;
	if (typeof L !== 'undefined' && L ) {
		out = {
			title: this.title,
			format: this.format,
			dims: 1,
			s: this.FM[3]+1,
			min: new Float64Array([this.fL[3],this.fL[3],this.fL[3]]),
			max: new Float64Array([this.fH[3],this.fH[3],this.fH[3]]),
			C: [this.FD[3].buffer],
			meta: this.meta
		};
	} else {
		out = {
			title: this.title,
			format: this.format,
			dims: 1,
			s: this.FM[3]+1,
			min: new Float64Array([this.fL[0],this.fL[1],this.fL[2]]),
			max: new Float64Array([this.fH[0],this.fH[1],this.fH[2]]),
			C: [this.FD[0].buffer,this.FD[1].buffer,this.FD[2].buffer],
			meta: this.meta
		};
	}
	return out;
};
LUTRGBSpline.prototype.getL = function() {
	return this.FD[3].buffer;
};
LUTRGBSpline.prototype.getRGB = function() {
	return [this.FD[0].buffer,this.FD[1].buffer,this.FD[2].buffer];
};
LUTRGBSpline.prototype.getSize = function() {
	return this.FM[3]+1;
};
LUTRGBSpline.prototype.is1D = function() {
	return true;
};
LUTRGBSpline.prototype.is3D = function() {
	return false;
};
LUTRGBSpline.prototype.getTitle = function() {
	return this.title;
};
LUTRGBSpline.prototype.getMetadata = function() {
	return this.meta;
};
LUTRGBSpline.prototype.isClamped = function() {
	if (typeof this.clamped === 'undefined') {
		var mm = this.minMax();
		var min = Math.min(mm[0],mm[1],mm[2]);
		var max = Math.max(mm[3],mm[4],mm[5]);
		if ((min === 0 && max <= 1) || (min >= 0 && max === 1)) {
			this.clamped = true;
		} else {
			this.clamped = false;
		}
	}
	return this.clamped;
};
LUTRGBSpline.prototype.deClamp = function() {
	if (this.isClamped()) {
		var m,c,C,L,H,LH,S;
		var fL,fH,fLH;
		for (var i=0; i<3; i++) {
			c = this.FD[i];
			m = c.length;
			C = false;
			L = 0;
			H = m-1;
			for (var j=0; j<m; j++) {
				if (j>0) {
					if (c[j] === 0) {
						C = true;
						L = j+1;
					}
				}
			}
			for (var j=m-2; j>=0; j--) {
				if (c[j] === 1) {
					C = true;
					H = j-1;
				}
			}
			if (C) {
				if (L > H) {
					var low = H;
					H = Math.min(L-2,m-1);
					L = Math.max(low+2,0);
				}
				LH = H-L;
				S = new LUTQSpline(new Float64Array(c.subarray(L,LH+1)).buffer);
				fL = this.fL[i];
				fH = this.fH[i];
				fLH= fH-fL;
				for (var j=0; j<m; j++) {
					if (j===L) {
						j = H;
					}
					// pass through the splines
					c[j] = S.fCub((j - L)/LH);
				}
			}
		}
		this.buildMesh();
		this.buildL();
		this.clamped = false;
	}
};
//
LUTRGBSpline.prototype.getColourSpace = function() {
	var d = this.d;
	var fL = this.fL;
	var fH = this.fH;
	var fLH = this.fLH;
	var out = {
		title: this.title + 'CS',
		format: this.format,
		fLR: fL[0],
		fLG: fL[1],
		fLB: fL[2],
		fHR: fH[0],
		fHG: fH[1],
		fHB: fH[2]
	};
	var reverse = new LUTRSpline({ buff:this.L.getL(), fH:fH[3], fL:fL[3] });
	var base = this.getRGB();
	reverse.R(base[0]);
	reverse.R(base[1]);
	reverse.R(base[2]);
	out.buffR = base[0];
	out.buffG = base[1];
	out.buffB = base[2];
	return new LUTRGBSpline(out);
};
LUTRGBSpline.prototype.compare = function(tgtBuff,tstBuff,method) {
	// returns the RMS differences in the red channels between a target dataset (tgt) and a test dataset (tst) which 'compare' passes through the lut
	// method sets the interpolation method used on the test set, currently trilinear (1, 'lin' or 'linear') or tricubic (anything else or the default if 'method' is not present.
	var tgt = new Float64Array(tgtBuff.slice(0));
	var tst = new Float64Array(tstBuff.slice(0));
	var m = tgt.length;
	if (m !== tst.length) {
		return false;
	}
	if (typeof method !== 'undefined') {
		method = method.toString().toLowerCase();
		if (method === '1' || method === 'tet') {
			this.RGBTet(tst.buffer);
		} else if (method === '2' || method === 'lin') {
			this.RGBLin(tst.buffer);
		} else {
			this.RGBCub(tst.buffer);
		}
	} else {
		this.RGBCub(tst.buffer);
	} 
	var e = new Float64Array(3);
	for (var j=0; j<m; j += 3) {
		e[0]  += Math.pow(tst[ j ] - tgt[ j ],2);
		e[1]  += Math.pow(tst[j+1] - tgt[j+1],2);
		e[2]  += Math.pow(tst[j+2] - tgt[j+2],2);
	}
	e[0] = Math.pow(e[0]*3/m,0.5);
	e[1] = Math.pow(e[1]*3/m,0.5);
	e[2] = Math.pow(e[2]*3/m,0.5);
	return e;
};
LUTRGBSpline.prototype.minMax = function() {
	var x = new Float64Array([
		 9999, 9999, 9999,	// Absolute min values
		-9999,-9999,-9999	// Absolute max values
	]);
	var c,m;
	for (var i=0; i<3; i++) {
		c = this.FD[i];
		m = c.length;
		for (var j=0; j<m; j++) {
			if (c[j] < x[i]) {
				x[i] = c[j];
			}
			if (c[j] > x[i+3]) {
				x[i+3] = c[j];
			}
		}
	}
	return x;
};
// LUTVolume - 3D mesh object
function LUTVolume(params) {
	// Metadata
	if (typeof params.title === 'string') {
		this.title = params.title;
	} else {
		this.title = '';
	}
	if (typeof params.format === 'string') {
		this.format = params.format;
	} else {
		this.format = '';
	}
	if (typeof params.meta !== 'undefined') {
		this.meta = params.meta;
	} else {
		this.meta = {};
	}
	this.Y = new Float64Array([0.2126,0.7152,0.0722]); // Rec709 luma coefficients
	// Set forward range
	this.fL = new Float64Array(4);
	this.fH = new Float64Array(4);
	this.fS = false;
	if (typeof params.min !== 'undefined' && (params.min[0] !== 0 || params.min[1] !== 0 || params.min[2] !== 0)) {
		params.fL = params.min[0];
		params.fLR = params.min[0];
		params.fLG = params.min[1];
		params.fLB = params.min[2];
	}
	if (typeof params.max !== 'undefined' && (params.max[0] !== 1 || params.max[1] !== 1 || params.max[2] !== 1)) {
		params.fH = params.max[0];
		params.fHR = params.max[0];
		params.fHG = params.max[1];
		params.fHB = params.max[2];
	}
	if (typeof params.fH === 'number') {
		this.fH[0] = params.fH;
		this.fH[1] = params.fH;
		this.fH[2] = params.fH;
	} else {
		this.fH[0] = 1;
		this.fH[1] = 1;
		this.fH[2] = 1;
	}
	if (typeof params.fL === 'number') {
		this.fL[0] = params.fL;
		this.fL[1] = params.fL;
		this.fL[2] = params.fL;
	} else {
		this.fL[0] = 0;
		this.fL[1] = 0;
		this.fL[2] = 0;
	}
	if (typeof params.fLR === 'number' &&
		typeof params.fHR === 'number' &&
		typeof params.fLG === 'number' &&
		typeof params.fHG === 'number' &&
		typeof params.fLB === 'number' &&
		typeof params.fHB === 'number') {
		this.fL[0] = params.fLR;
		this.fH[0] = params.fHR;
		this.fL[1] = params.fLG;
		this.fH[1] = params.fHG;
		this.fL[2] = params.fLB;
		this.fH[2] = params.fHB;
	}
	this.fL[3] = Math.min(this.fL[0],this.fL[1],this.fL[2]);
	this.fH[3] = Math.max(this.fH[0],this.fH[1],this.fH[2]);
	this.fLH = new Float64Array([this.fH[0]-this.fL[0],this.fH[1]-this.fL[1],this.fH[2]-this.fL[2],0]);
	if (this.fL[0] !== 0 || this.fL[1] !== 0 || this.fL[2] !== 0 || this.fH[0] !== 1 || this.fH[1] !== 1 || this.fH[2] !== 1) {
		this.fS = true;
	}
	// Allow for spline input (a bit nuts for 1D, but being robust)
	if (typeof params.inSpline !== 'undefined') {
		this.sin = true;
		this.ins = new LUTQSpline(params.inSpline);
	} else {
		this.sin = false;
	}
	// create a 'mesh' object to do the 3D interpolation
	this.pR = new Float64Array(4);
	this.pG = new Float64Array(4);
	this.pB = new Float64Array(4);
	this.buildMesh(params.buffR,params.buffG,params.buffB);
	// Precalculate Luma arrays
	this.buildL();
	// Store some typed arrays for repeat use to minimise garbage collection
	this.extVars= {
		dc: new Float64Array(this.d),
		r: new Float64Array(this.d),
		J: new Float64Array(this.d*3),
		JtJ: new Float64Array(9),
		JtJI: new Float64Array(9),
		Jtr: new Float64Array(3),
		del: new Float64Array(3)
	};
	this.ABab = new Float64Array([1,0,1,0]);
}
LUTVolume.prototype.buildMesh = function(buffR,buffG,buffB) {
	var red = new Float64Array(buffR);
	var green = new Float64Array(buffG);
	var blue = new Float64Array(buffB);
	var Y = new Float64Array([0.2126,0.7152,0.0722]); // Rec709 luma coefficients
	this.d = Math.round(Math.pow(red.length,1/3)); // dimensions of the base mesh
	var d = this.d;
	this.s = d-1;
	var d2 = d*d;
	var d3 = red.length;
	var nd = d + 2;
	this.nd = nd;
	var nd2 = nd * nd;
	var nd3 = nd2 * nd;
	var sG = nd3;
	var sB = 2 * sG;
	this.mesh = new Float64Array(nd3*3); // the new mesh is two points larger per side, with all three channels in one array for speed
	var k = nd2 + nd + 1; // first point in the new mesh at which to place mesh values
	var l=0;
	// create 4x4x4 array of offsets for quickly getting cubic control points;
	this.off = new Float64Array(64);
	for (var b=0; b<4; b++) {
		for (var g=0; g<4; g++) {
			for (var r=0; r<4; r++) {
				this.off[r + (g*4) + (b*16)] = r + (g*nd) + (b*nd2);
			}
		}
	}
	// populate the core of the new mesh with the old one
	for (var b=0; b<d; b++) {
		for (var g=0; g<d; g++) {
			for (var r=0; r<d; r++) { // typedarray slice and copywithin would allow block copying, but are not generally available in IE and Safari JS
				this.mesh[ k  ] = red[l];
				this.mesh[k+sG] = green[l];
				this.mesh[k+sB] = blue[l];
				l++;
				k++;
			}
			k += 2;
		}
		k += 2 * nd;
	}
	// Fill in the gaps around the larger mesh for quicker extrapolation
	this.fillEdges();
	// create object-scope typed arrays to minimise garbage collection
	this.rgb = new Float64Array(18);
	this.R = new Float64Array(8);
	this.G = new Float64Array(8);
	this.B = new Float64Array(8);
};
LUTVolume.prototype.buildL = function() {
	var fL = this.fL[3];
	var fH = this.fH[3];
	var fLH= fH-fL;
	var m = this.getSize();
	if (m < 65) {
		m = 65;
	}
	var FD = new Float64Array(m);
	var rgb = new Float64Array(m*3);
	var m2 = rgb.length;
	var k;
	for (var j=0; j<m; j++) { // create rgb array of input values
		k = j*3;
		rgb[ k ] = (j*(fLH)/(m-1))+fL;
		rgb[k+1] = rgb[k];
		rgb[k+2] = rgb[k];
	}
	// apply input scaling as required
	if (this.fS) {
		for (var j=0; j<m2; j += 3) {
			rgb[ j ] = (rgb[ j ] - this.fL[0])/(this.fLH[0]);
			rgb[j+1] = (rgb[j+1] - this.fL[1])/(this.fLH[1]);
			rgb[j+2] = (rgb[j+2] - this.fL[2])/(this.fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(rgb.buffer);
	}
	this.RGBCub(rgb.buffer); // calculate output rgb values
	for (var j=0; j<m; j++) {
		k = j*3;
		FD[j] = (rgb[ k ]*this.Y[0]) + (rgb[k+1]*this.Y[1]) + (rgb[k+2]*this.Y[2]);
	}
	this.L = new LUTSpline({ buff:FD.buffer, fH:fH, fL:fL });
};
LUTVolume.prototype.f = function(L) {
	return this.L.f(L);
};
LUTVolume.prototype.df = function(L) {
	return this.L.df(L);
};
LUTVolume.prototype.fCub = function(L) {
	return this.L.fCub(L);
};
LUTVolume.prototype.fTet = function(L) {
	return this.L.fLin(L);
};
LUTVolume.prototype.fLin = function(L) {
	return this.L.fLin(L);
};
LUTVolume.prototype.FCub = function(buff) {
	this.L.FCub(buff);
};
LUTVolume.prototype.FTet = function(buff) {
	this.L.FLin(buff);
};
LUTVolume.prototype.FLin = function(buff) {
	this.L.FLin(buff);
};
LUTVolume.prototype.fRGBCub = function(L) {
	var o = new Float64Array([L,L,L]);
	this.RGBCub(o.buffer);
	return o;
};
LUTVolume.prototype.fRGBTet = function(L) {
	var o = new Float64Array([L,L,L]);
	this.RGBTet(o.buffer);
	return o;
};
LUTVolume.prototype.fRGBLin = function(L) {
	var o = new Float64Array([L,L,L]);
	this.RGBLin(o.buffer);
	return o;
};
LUTVolume.prototype.rgbCub = function(rgbIn) {
	var rgb = new Float64Array(rgbIn.buffer.slice(0));
	this.RGBCub(rgb.buffer);
	return rgb;
};
LUTVolume.prototype.rgbTet = function(rgbIn) {
	var rgb = new Float64Array(rgbIn.buffer.slice(0));
	this.RGBTet(rgb.buffer);
	return rgb;
};
LUTVolume.prototype.rgbLin = function(rgbIn) {
	var rgb = new Float64Array(rgbIn.buffer.slice(0));
	this.RGBLin(rgb.buffer);
	return rgb;
};
LUTVolume.prototype.RGBCub = function(buff) {
	var c = new Float64Array(buff);
	var p = this.mesh;
	var o = this.off;
	var rgb = this.rgb;
	var m = c.length;
	var mm = Math.round(this.mesh.length/3);
	var s = this.s;
	var nd = s + 2;
	var nd1 = nd + 1;
	var k,b;
	var R = this.R;
	var G = this.G;
	var B = this.B;
	var E = false;
	var rE = false;
	var gE = false;
	var bE = false;
	if (this.fS) {
		var fL = this.fL;
		var fLH = this.fLH;
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j +=3) {
		c[ j ] *= s;
		c[j+1] *= s;
		c[j+2] *= s;
		rgb[ 9] = Math.max(0,Math.min(s-1,Math.floor(c[ j ])));
		rgb[10] = Math.max(0,Math.min(s-1,Math.floor(c[j+1])));
		rgb[11] = Math.max(0,Math.min(s-1,Math.floor(c[j+2])));
		c[ j ] -= rgb[ 9];
		c[j+1] -= rgb[10];
		c[j+2] -= rgb[11];
		// clamp values between 0-1.0 for interpolation
		rgb[0] = Math.max(0,Math.min(1,c[ j ]));
		rgb[1] = Math.max(0,Math.min(1,c[j+1]));
		rgb[2] = Math.max(0,Math.min(1,c[j+2]));
		// note that extrapolation will be needed if values were clamped
		if (rgb[0] !== c[ j ]) {
			rE = true;
			E = true;
		}
		if (rgb[1] !== c[j+1]) {
			gE = true;
			E = true;
		}
		if (rgb[2] !== c[j+2]) {
			bE = true;
			E = true;
		}
		// Prep all the squares, cubes and cubics
		rgb[3] = rgb[0]*rgb[0];
		rgb[4] = rgb[1]*rgb[1];
		rgb[5] = rgb[2]*rgb[2];
		rgb[6] = rgb[3]*rgb[0];
		rgb[7] = rgb[4]*rgb[1];
		rgb[8] = rgb[5]*rgb[2];
		R[0] = (-0.5*rgb[6]) + rgb[3] - (0.5*rgb[0]);
		R[1] = (1.5*rgb[6]) - (2.5*rgb[3]) + 1;
		R[2] = (-1.5*rgb[6]) + (2*rgb[3]) + (0.5*rgb[0]);
		R[3] = (0.5*rgb[6]) - (0.5*rgb[3]);
		G[0] = (-0.5*rgb[7]) + rgb[4] - (0.5*rgb[1]);
		G[1] = (1.5*rgb[7]) - (2.5*rgb[4]) + 1;
		G[2] = (-1.5*rgb[7]) + (2*rgb[4]) + (0.5*rgb[1]);
		G[3] = (0.5*rgb[7]) - (0.5*rgb[4]);
		B[0] = (-0.5*rgb[8]) + rgb[5] - (0.5*rgb[2]);
		B[1] = (1.5*rgb[8]) - (2.5*rgb[5]) + 1;
		B[2] = (-1.5*rgb[8]) + (2*rgb[5]) + (0.5*rgb[2]);
		B[3] = (0.5*rgb[8]) - (0.5*rgb[5]);
		// if any or all channels need extrapolation find out the scaling
		if (rE) {
			rgb[12] = c[ j ] - rgb[0];
		}
		if (gE) {
			rgb[13] = c[j+1] - rgb[1];
		}
		if (bE) {
			rgb[14] = c[j+2] - rgb[2];
		}
		// set value for first control point in the mesh - P[-1,-1,-1]
		b = (rgb[9]) + ((rgb[10] + (rgb[11]*nd1))*nd1);
		k = b;
		// multiply and add the cubics and the control points
		c[ j ]  = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[0])+
				  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[3]);
		k += mm;
		c[j+1]  = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[0])+
				  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[3]);
		k += mm;
		c[j+2]  = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[0])+
				  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[3]);
		// find slopes and perform extrapolation as needed
		if (E) {
			if (rE) {
				R[4] = (-1.5*rgb[3]) + (2*rgb[0]) - 0.5;
				R[5] = (4.5*rgb[3]) - (5*rgb[0]);
				R[6] = (-4.5*rgb[3]) + (4*rgb[0]) + 0.5;
				R[7] = (1.5*rgb[3] - rgb[0]);
				k = b;
				rgb[15] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
							(((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
							(((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
							(((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
				  		  (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
							(((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
							(((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
							(((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
						  (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
							(((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
							(((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
							(((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
						  (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
							(((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
							(((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
							(((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
				k += mm;
				rgb[16] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
							(((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
							(((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
							(((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
				  		  (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
							(((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
							(((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
							(((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
						  (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
							(((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
							(((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
							(((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
						  (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
							(((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
							(((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
							(((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
				k += mm;
				rgb[27] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
							(((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
							(((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
							(((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
				  		  (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
							(((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
							(((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
							(((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
						  (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
							(((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
							(((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
							(((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
						  (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
							(((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
							(((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
							(((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
				c[ j ] += rgb[12] * rgb[15];
				c[j+1] += rgb[12] * rgb[16];
				c[j+2] += rgb[12] * rgb[17];
			}
			if (gE) {
				G[4] = (-1.5*rgb[4]) + (2*rgb[1]) - 0.5;
				G[5] = (4.5*rgb[4]) - (5*rgb[1]);
				G[6] = (-4.5*rgb[4]) + (4*rgb[1]) + 0.5;
				G[7] = (1.5*rgb[4] - rgb[1]);
				k = b;
				rgb[15] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
				k += mm;
				rgb[16] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
				k += mm;
				rgb[17] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
				c[ j ] += rgb[13] * rgb[15];
				c[j+1] += rgb[13] * rgb[16];
				c[j+2] += rgb[13] * rgb[17];
			}
			if (bE) {
				B[4] = (-1.5*rgb[5]) + (2*rgb[2]) - 0.5;
				B[5] = (4.5*rgb[5]) - (5*rgb[2]);
				B[6] = (-4.5*rgb[5]) + (4*rgb[2]) + 0.5;
				B[7] = (1.5*rgb[5] - rgb[2]);
				k = b;
				rgb[15] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
				k += mm;
				rgb[16] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
				k += mm;
				rgb[17] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
							(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
							(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
							(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
				  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
							(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
							(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
							(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
						  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
							(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
							(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
							(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
						  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
							(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
							(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
							(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
				c[ j ] += rgb[14] * rgb[15];	
				c[j+1] += rgb[14] * rgb[16];
				c[j+2] += rgb[14] * rgb[17];
			}
			E = false;
			rE = false;
			gE = false;
			bE = false;
		}
	}
};
LUTVolume.prototype.RGBTet = function(buff) {
	var c = new Float64Array(buff);
	var p = this.mesh;
	var o = this.off;
	var rgb = this.rgb;
	var m = c.length;
	var mm = Math.round(this.mesh.length/3);
	var s = this.s;
	var nd = s + 2;
	var nd1 = nd + 1;
	var k,b;
	var R = this.R;
	var G = this.G;
	var B = this.B;
	var E = false;
	var rE = false;
	var gE = false;
	var bE = false;
	if (this.fS) {
		var fL = this.fL;
		var fLH = this.fLH;
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j +=3) {
		c[ j ] *= s;
		c[j+1] *= s;
		c[j+2] *= s;
		rgb[ 9] = Math.max(0,Math.min(s-1,Math.floor(c[ j ])));
		rgb[10] = Math.max(0,Math.min(s-1,Math.floor(c[j+1])));
		rgb[11] = Math.max(0,Math.min(s-1,Math.floor(c[j+2])));
		c[ j ] -= rgb[ 9];
		c[j+1] -= rgb[10];
		c[j+2] -= rgb[11];
		// clamp values between 0-1.0 for interpolation
		rgb[0] = Math.max(0,Math.min(1,c[ j ]));
		rgb[1] = Math.max(0,Math.min(1,c[j+1]));
		rgb[2] = Math.max(0,Math.min(1,c[j+2]));
		// note that extrapolation will be needed if values were clamped
		if (rgb[0] !== c[ j ]) {
			rE = true;
			E = true;
		}
		if (rgb[1] !== c[j+1]) {
			gE = true;
			E = true;
		}
		if (rgb[2] !== c[j+2]) {
			bE = true;
			E = true;
		}
		// if any or all channels need extrapolation find out the scaling
		if (rE) {
			rgb[12] = c[ j ] - rgb[0];
		}
		if (gE) {
			rgb[13] = c[j+1] - rgb[1];
		}
		if (bE) {
			rgb[14] = c[j+2] - rgb[2];
		}
		// set value for first control point in the mesh - P[-1,-1,-1]
		b = (rgb[9]) + ((rgb[10] + (rgb[11]*nd1))*nd1);
		k = b;
		// find which tetrahedron to use
		var tet = (rgb[0]>rgb[1]) + ((rgb[1]>rgb[2])*2) + ((rgb[2]>rgb[0])*4);
		// perform tetrahedral interpolation
		switch (tet) {
			case 0: // rgb[0] === rgb[1] === rgb[2] so straight linear interpolation
				c[ j ] = ((1-rgb[0])*p[k+o[21]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[1])*p[k+o[21]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[2])*p[k+o[21]]) + (rgb[2]*p[k+o[42]]);
				break;
			case 1:
				c[ j ] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[2])*p[k+o[22]]) + ((rgb[2]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[2])*p[k+o[22]]) + ((rgb[2]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[2])*p[k+o[22]]) + ((rgb[2]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				break;
			case 2:
				c[ j ] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[0])*p[k+o[25]]) + ((rgb[0]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[0])*p[k+o[25]]) + ((rgb[0]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[0])*p[k+o[25]]) + ((rgb[0]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				break;
			case 3:
				c[ j ] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[1])*p[k+o[22]]) + ((rgb[1]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[1])*p[k+o[22]]) + ((rgb[1]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[0])*p[k+o[21]]) + ((rgb[0]-rgb[1])*p[k+o[22]]) + ((rgb[1]-rgb[2])*p[k+o[26]]) + (rgb[2]*p[k+o[42]]);
				break;
			case 4:
				c[ j ] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[1])*p[k+o[37]]) + ((rgb[1]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[1])*p[k+o[37]]) + ((rgb[1]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[1])*p[k+o[37]]) + ((rgb[1]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				break;
			case 5:
				c[ j ] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[0])*p[k+o[37]]) + ((rgb[0]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[0])*p[k+o[37]]) + ((rgb[0]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[2])*p[k+o[21]]) + ((rgb[2]-rgb[0])*p[k+o[37]]) + ((rgb[0]-rgb[1])*p[k+o[38]]) + (rgb[1]*p[k+o[42]]);
				break;
			case 6:
				c[ j ] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[2])*p[k+o[25]]) + ((rgb[2]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+1] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[2])*p[k+o[25]]) + ((rgb[2]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				k += mm;
				c[j+2] = ((1-rgb[1])*p[k+o[21]]) + ((rgb[1]-rgb[2])*p[k+o[25]]) + ((rgb[2]-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]);
				break;
			default: // shouldn't be possible, but include fallback to trilinear interpolation
				c[ j ]  = ((((((1-rgb[0])*p[k+o[21]]) + (rgb[0]*p[k+o[22]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[25]]) + (rgb[0]*p[k+o[26]]))*rgb[1]))*(1-rgb[2]))+
						  ((((((1-rgb[0])*p[k+o[37]]) + (rgb[0]*p[k+o[38]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]))*rgb[1]))*rgb[2]);
				k += mm;
				c[j+1]  = ((((((1-rgb[0])*p[k+o[21]]) + (rgb[0]*p[k+o[22]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[25]]) + (rgb[0]*p[k+o[26]]))*rgb[1]))*(1-rgb[2]))+
						  ((((((1-rgb[0])*p[k+o[37]]) + (rgb[0]*p[k+o[38]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]))*rgb[1]))*rgb[2]);
				k += mm;
				c[j+2]  = ((((((1-rgb[0])*p[k+o[21]]) + (rgb[0]*p[k+o[22]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[25]]) + (rgb[0]*p[k+o[26]]))*rgb[1]))*(1-rgb[2]))+
						  ((((((1-rgb[0])*p[k+o[37]]) + (rgb[0]*p[k+o[38]]))*(1-rgb[1])) + ((((1-rgb[0])*p[k+o[41]]) + (rgb[0]*p[k+o[42]]))*rgb[1]))*rgb[2]);
		}
		// find slopes and perform extrapolation as needed
		// Actually use Trilinear for EXTRAPOLATION, as tends to be smoother than tetrahedral
		if (E) {
			R[0] = 1-rgb[0];
			R[1] = rgb[0];
			G[0] = 1-rgb[1];
			G[1] = rgb[1];
			B[0] = 1-rgb[2];
			B[1] = rgb[2];
			if (rE) {
				k = b;
				rgb[15] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				k += mm;
				rgb[16] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				k += mm;
				rgb[17] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				c[ j ] += rgb[12] * rgb[15];
				c[j+1] += rgb[12] * rgb[16];
				c[j+2] += rgb[12] * rgb[17];
			}
			if (gE) {
				k = b;
				rgb[15] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				k += mm;
				rgb[16] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				k += mm;
				rgb[17] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				c[ j ] += rgb[13] * rgb[15];
				c[j+1] += rgb[13] * rgb[16];
				c[j+2] += rgb[13] * rgb[17];
			}
			if (bE) {
				k = b;
				rgb[15] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				k += mm;
				rgb[16] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				k += mm;
				rgb[17] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				c[ j ] += rgb[14] * rgb[15];	
				c[j+1] += rgb[14] * rgb[16];
				c[j+2] += rgb[14] * rgb[17];
			}
			E = false;
			rE = false;
			gE = false;
			bE = false;
		}
/* Tetrahedral EXTRAPOLATION is not great - LUTCalc currently uses Trilinear. The following is tetrahedral code
		if (E) {
			// check for and perform extrapolation
			if (rE) {
				k=b;
				switch (tet) {
					case 0: // rgb[0] === rgb[1] === rgb[2]
						rgb[15] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[21]];
						break;
					case 1:
						rgb[15] = p[k+o[22]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[22]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[22]]-p[k+o[21]];
						break;
					case 2:
						rgb[15] = p[k+o[26]]-p[k+o[25]];
						k += mm;
						rgb[16] = p[k+o[26]]-p[k+o[25]];
						k += mm;
						rgb[17] = p[k+o[26]]-p[k+o[25]];
						break;
					case 3:
						rgb[15] = p[k+o[22]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[22]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[22]]-p[k+o[21]];
						break;
					case 4:
						rgb[15] = p[k+o[42]]-p[k+o[41]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[41]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[41]];
						break;
					case 5:
						rgb[15] = p[k+o[38]]-p[k+o[37]];
						k += mm;
						rgb[16] = p[k+o[38]]-p[k+o[37]];
						k += mm;
						rgb[17] = p[k+o[38]]-p[k+o[37]];
						break;
					case 6:
						rgb[15] = p[k+o[42]]-p[k+o[41]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[41]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[41]];
						break;
					default: // shouldn't be possible, but include fallback to trilinear interpolation
						rgb[15] = ((((p[k+o[22]]-p[k+o[21]])*(1-rgb[1])) + ((p[k+o[26]]-p[k+o[25]])*rgb[1]))*(1-rgb[2]))+
								  ((((p[k+o[38]]-p[k+o[37]])*(1-rgb[1])) + ((p[k+o[42]]-p[k+o[41]])*rgb[1]))*rgb[2]);
						k += mm;
						rgb[16] = ((((p[k+o[22]]-p[k+o[21]])*(1-rgb[1])) + ((p[k+o[26]]-p[k+o[25]])*rgb[1]))*(1-rgb[2]))+
								  ((((p[k+o[38]]-p[k+o[37]])*(1-rgb[1])) + ((p[k+o[42]]-p[k+o[41]])*rgb[1]))*rgb[2]);
						k += mm;
						rgb[17] = ((((p[k+o[22]]-p[k+o[21]])*(1-rgb[1])) + ((p[k+o[26]]-p[k+o[25]])*rgb[1]))*(1-rgb[2]))+
								  ((((p[k+o[38]]-p[k+o[37]])*(1-rgb[1])) + ((p[k+o[42]]-p[k+o[41]])*rgb[1]))*rgb[2]);
				}
				c[ j ] += rgb[12] * rgb[15];
				c[j+1] += rgb[12] * rgb[16];
				c[j+2] += rgb[12] * rgb[17];
			}
			if (gE) {
				k = b;
				switch (tet) {
					case 0: // rgb[0] === rgb[1] === rgb[2]
						rgb[15] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[21]];
						break;
					case 1:
						rgb[15] = p[k+o[42]]-p[k+o[38]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[38]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[38]];
						break;
					case 2:
						rgb[15] = p[k+o[25]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[25]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[25]]-p[k+o[21]];
						break;
					case 3:
						rgb[15] = p[k+o[26]]-p[k+o[22]];
						k += mm;
						rgb[16] = p[k+o[26]]-p[k+o[22]];
						k += mm;
						rgb[17] = p[k+o[26]]-p[k+o[22]];
						break;
					case 4:
						rgb[15] = p[k+o[41]]-p[k+o[37]];
						k += mm;
						rgb[16] = p[k+o[41]]-p[k+o[37]];
						k += mm;
						rgb[17] = p[k+o[41]]-p[k+o[37]];
						break;
					case 5:
						rgb[15] = p[k+o[42]]-p[k+o[38]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[38]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[38]];
						break;
					case 6:
						rgb[15] = p[k+o[25]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[25]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[25]]-p[k+o[21]];
						break;
					default: // shouldn't be possible, but include fallback to trilinear interpolation
						rgb[15] = ((((p[k+o[25]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[26]]-p[k+o[22]])*rgb[0]))*(1-rgb[2]))+
								  ((((p[k+o[41]]-p[k+o[37]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[38]])*rgb[0]))*rgb[2]);
						k += mm;
						rgb[16] = ((((p[k+o[25]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[26]]-p[k+o[22]])*rgb[0]))*(1-rgb[2]))+
								  ((((p[k+o[41]]-p[k+o[37]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[38]])*rgb[0]))*rgb[2]);
						k += mm;
						rgb[17] = ((((p[k+o[25]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[26]]-p[k+o[22]])*rgb[0]))*(1-rgb[2]))+
								  ((((p[k+o[41]]-p[k+o[37]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[38]])*rgb[0]))*rgb[2]);
				}
				c[ j ] += rgb[13] * rgb[15];
				c[j+1] += rgb[13] * rgb[16];
				c[j+2] += rgb[13] * rgb[17];
			}
			if (bE) {
				k = b;
				switch (tet) {
					case 0: // rgb[0] === rgb[1] === rgb[2]
						rgb[15] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[21]];
						break;
					case 1:
						rgb[15] = p[k+o[38]]-p[k+o[22]];
						k += mm;
						rgb[16] = p[k+o[38]]-p[k+o[22]];
						k += mm;
						rgb[17] = p[k+o[38]]-p[k+o[22]];
						break;
					case 2:
						rgb[15] = p[k+o[42]]-p[k+o[26]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[26]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[26]];
						break;
					case 3:
						rgb[15] = p[k+o[42]]-p[k+o[26]];
						k += mm;
						rgb[16] = p[k+o[42]]-p[k+o[26]];
						k += mm;
						rgb[17] = p[k+o[42]]-p[k+o[26]];
						break;
					case 4:
						rgb[15] = p[k+o[37]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[37]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[37]]-p[k+o[21]];
						break;
					case 5:
						rgb[15] = p[k+o[37]]-p[k+o[21]];
						k += mm;
						rgb[16] = p[k+o[37]]-p[k+o[21]];
						k += mm;
						rgb[17] = p[k+o[37]]-p[k+o[21]];
						break;
					case 6:
						rgb[15] = p[k+o[41]]-p[k+o[25]];
						k += mm;
						rgb[16] = p[k+o[41]]-p[k+o[25]];
						k += mm;
						rgb[17] = p[k+o[41]]-p[k+o[25]];
						break;
					default: // shouldn't be possible, but include fallback to trilinear interpolation
						rgb[15] = ((((p[k+o[37]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[38]]-p[k+o[22]])*rgb[0]))*(1-rgb[1]))+
								  ((((p[k+o[41]]-p[k+o[25]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[26]])*rgb[0]))*rgb[1]);
						k += mm;
						rgb[16] = ((((p[k+o[37]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[38]]-p[k+o[22]])*rgb[0]))*(1-rgb[1]))+
								  ((((p[k+o[41]]-p[k+o[25]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[26]])*rgb[0]))*rgb[1]);
						k += mm;
						rgb[17] = ((((p[k+o[37]]-p[k+o[21]])*(1-rgb[0])) + ((p[k+o[38]]-p[k+o[22]])*rgb[0]))*(1-rgb[1]))+
								  ((((p[k+o[41]]-p[k+o[25]])*(1-rgb[0])) + ((p[k+o[42]]-p[k+o[26]])*rgb[0]))*rgb[1]);
				}
				c[ j ] += rgb[14] * rgb[15];	
				c[j+1] += rgb[14] * rgb[16];
				c[j+2] += rgb[14] * rgb[17];
			}
			E = false;
			rE = false;
			gE = false;
			bE = false;
		}
*/
	}
};
LUTVolume.prototype.RGBLin = function(buff) {
	var c = new Float64Array(buff);
	var p = this.mesh;
	var o = this.off;
	var rgb = this.rgb;
	var m = c.length;
	var mm = Math.round(this.mesh.length/3);
	var s = this.s;
	var nd = s + 2;
	var nd1 = nd + 1;
	var k,b;
	var R = this.R;
	var G = this.G;
	var B = this.B;
	var E = false;
	var rE = false;
	var gE = false;
	var bE = false;
	if (this.fS) {
		var fL = this.fL;
		var fLH = this.fLH;
		for (var j=0; j<m; j+=3) {
			c[ j ] = (c[ j ] - fL[0])/(fLH[0]);
			c[j+1] = (c[j+1] - fL[1])/(fLH[1]);
			c[j+2] = (c[j+2] - fL[2])/(fLH[2]);
		}
	}
	if (this.sin) {
		this.ins.FCub(buff);
	}
	for (var j=0; j<m; j +=3) {
		c[ j ] *= s;
		c[j+1] *= s;
		c[j+2] *= s;
		rgb[ 9] = Math.max(0,Math.min(s-1,Math.floor(c[ j ])));
		rgb[10] = Math.max(0,Math.min(s-1,Math.floor(c[j+1])));
		rgb[11] = Math.max(0,Math.min(s-1,Math.floor(c[j+2])));
		c[ j ] -= rgb[ 9];
		c[j+1] -= rgb[10];
		c[j+2] -= rgb[11];
		// clamp values between 0-1.0 for interpolation
		rgb[0] = Math.max(0,Math.min(1,c[ j ]));
		rgb[1] = Math.max(0,Math.min(1,c[j+1]));
		rgb[2] = Math.max(0,Math.min(1,c[j+2]));
		// note that extrapolation will be needed if values were clamped
		if (rgb[0] !== c[ j ]) {
			rE = true;
			E = true;
		}
		if (rgb[1] !== c[j+1]) {
			gE = true;
			E = true;
		}
		if (rgb[2] !== c[j+2]) {
			bE = true;
			E = true;
		}
		// Prep all the squares, cubes and cubics
		R[0] = 1-rgb[0];
		R[1] = rgb[0];
		G[0] = 1-rgb[1];
		G[1] = rgb[1];
		B[0] = 1-rgb[2];
		B[1] = rgb[2];
		// if any or all channels need extrapolation find out the scaling
		if (rE) {
			rgb[12] = c[ j ] - rgb[0];
		}
		if (gE) {
			rgb[13] = c[j+1] - rgb[1];
		}
		if (bE) {
			rgb[14] = c[j+2] - rgb[2];
		}
		// set value for first control point in the mesh - P[-1,-1,-1]
		b = (rgb[9]) + ((rgb[10] + (rgb[11]*nd1))*nd1);
		k = b;
		// multiply and add the cubics and the control points
		c[ j ]  = (((((R[0]*p[k+o[21]]) + (R[1]*p[k+o[22]]))*G[0]) + (((R[0]*p[k+o[25]]) + (R[1]*p[k+o[26]]))*G[1]))*B[0])+
				  (((((R[0]*p[k+o[37]]) + (R[1]*p[k+o[38]]))*G[0]) + (((R[0]*p[k+o[41]]) + (R[1]*p[k+o[42]]))*G[1]))*B[1]);
		k += mm;
		c[j+1]  = (((((R[0]*p[k+o[21]]) + (R[1]*p[k+o[22]]))*G[0]) + (((R[0]*p[k+o[25]]) + (R[1]*p[k+o[26]]))*G[1]))*B[0])+
				  (((((R[0]*p[k+o[37]]) + (R[1]*p[k+o[38]]))*G[0]) + (((R[0]*p[k+o[41]]) + (R[1]*p[k+o[42]]))*G[1]))*B[1]);
		k += mm;
		c[j+2]  = (((((R[0]*p[k+o[21]]) + (R[1]*p[k+o[22]]))*G[0]) + (((R[0]*p[k+o[25]]) + (R[1]*p[k+o[26]]))*G[1]))*B[0])+
				  (((((R[0]*p[k+o[37]]) + (R[1]*p[k+o[38]]))*G[0]) + (((R[0]*p[k+o[41]]) + (R[1]*p[k+o[42]]))*G[1]))*B[1]);
		// find slopes and perform extrapolation as needed
		if (E) {
			if (rE) {
				k = b;
				rgb[15] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				k += mm;
				rgb[16] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				k += mm;
				rgb[17] = ((((p[k+o[22]]-p[k+o[21]])*G[0]) + ((p[k+o[26]]-p[k+o[25]])*G[1]))*B[0])+
						  ((((p[k+o[38]]-p[k+o[37]])*G[0]) + ((p[k+o[42]]-p[k+o[41]])*G[1]))*B[1]);
				c[ j ] += rgb[12] * rgb[15];
				c[j+1] += rgb[12] * rgb[16];
				c[j+2] += rgb[12] * rgb[17];
			}
			if (gE) {
				k = b;
				rgb[15] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				k += mm;
				rgb[16] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				k += mm;
				rgb[17] = ((((p[k+o[25]]-p[k+o[21]])*R[0]) + ((p[k+o[26]]-p[k+o[22]])*R[1]))*B[0])+
						  ((((p[k+o[41]]-p[k+o[37]])*R[0]) + ((p[k+o[42]]-p[k+o[38]])*R[1]))*B[1]);
				c[ j ] += rgb[13] * rgb[15];
				c[j+1] += rgb[13] * rgb[16];
				c[j+2] += rgb[13] * rgb[17];
			}
			if (bE) {
				k = b;
				rgb[15] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				k += mm;
				rgb[16] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				k += mm;
				rgb[17] = ((((p[k+o[37]]-p[k+o[21]])*R[0]) + ((p[k+o[38]]-p[k+o[22]])*R[1]))*G[0])+
						 ((((p[k+o[41]]-p[k+o[25]])*R[0]) + ((p[k+o[42]]-p[k+o[26]])*R[1]))*G[1]);
				c[ j ] += rgb[14] * rgb[15];	
				c[j+1] += rgb[14] * rgb[16];
				c[j+2] += rgb[14] * rgb[17];
			}
			E = false;
			rE = false;
			gE = false;
			bE = false;
		}
	}
};
LUTVolume.prototype.J = function(rgbIn) {
	// calculate the Jacobian matrix at rgbIn
	if (rgbIn.length === 3) {
		var c = new Float64Array(rgbIn.buffer.slice(0));
		var J = new Float64Array(9);
		var p = this.mesh;
		var o = this.off;
		var s = this.s;
		var rgb = this.rgb;
		var R = this.R;
		var G = this.G;
		var B = this.B;
		var nd = s + 2;
		var nd1 = nd + 1;
		var b,k;
		var fL = this.fL;
		var fLH = this.fLH;
		if (this.fS) {
			for (var j=0; j<m; j+=3) {
				c[0] = (c[0] - fL[0])/(fLH[0]);
				c[1] = (c[1] - fL[1])/(fLH[1]);
				c[2] = (c[2] - fL[2])/(fLH[2]);
			}
		}
		if (this.sin) {
			this.ins.FCub(c.buffer);
		}
		c[0] *= s;
		c[1] *= s;
		c[2] *= s;
		rgb[ 9] = Math.max(0,Math.min(s-1,Math.floor(c[ j ])));
		rgb[10] = Math.max(0,Math.min(s-1,Math.floor(c[j+1])));
		rgb[11] = Math.max(0,Math.min(s-1,Math.floor(c[j+2])));
		c[0] -= rgb[ 9];
		c[1] -= rgb[10];
		c[2] -= rgb[11];
		// clamp values between 0-1.0 for interpolation
		rgb[0] = Math.max(0,Math.min(1,c[0]));
		rgb[1] = Math.max(0,Math.min(1,c[1]));
		rgb[2] = Math.max(0,Math.min(1,c[2]));
		// Prep all the squares, cubes and cubics
		rgb[3] = rgb[0]*rgb[0];
		rgb[4] = rgb[1]*rgb[1];
		rgb[5] = rgb[2]*rgb[2];
		rgb[6] = rgb[3]*rgb[0];
		rgb[7] = rgb[4]*rgb[1];
		rgb[8] = rgb[5]*rgb[2];
		R[0] = (-0.5*rgb[6]) + rgb[3] - (0.5*rgb[0]);
		R[1] = (1.5*rgb[6]) - (2.5*rgb[3]) + 1;
		R[2] = (-1.5*rgb[6]) + (2*rgb[3]) + (0.5*rgb[0]);
		R[3] = (0.5*rgb[6]) - (0.5*rgb[3]);
		G[0] = (-0.5*rgb[7]) + rgb[4] - (0.5*rgb[1]);
		G[1] = (1.5*rgb[7]) - (2.5*rgb[4]) + 1;
		G[2] = (-1.5*rgb[7]) + (2*rgb[4]) + (0.5*rgb[1]);
		G[3] = (0.5*rgb[7]) - (0.5*rgb[4]);
		B[0] = (-0.5*rgb[8]) + rgb[5] - (0.5*rgb[2]);
		B[1] = (1.5*rgb[8]) - (2.5*rgb[5]) + 1;
		B[2] = (-1.5*rgb[8]) + (2*rgb[5]) + (0.5*rgb[2]);
		B[3] = (0.5*rgb[8]) - (0.5*rgb[5]);
		// set value for first control point in the mesh - P[-1,-1,-1]
		b = (rgb[9]) + ((rgb[10] + (rgb[11]*nd1))*nd1);
		// d/dR
		R[4] = (-1.5*rgb[3]) + (2*rgb[0]) - 0.5;
		R[5] = (4.5*rgb[3]) - (5*rgb[0]);
		R[6] = (-4.5*rgb[3]) + (4*rgb[0]) + 0.5;
		R[7] = (1.5*rgb[3] - rgb[0]);
		k = b;
		J[0] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
				 (((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
				 (((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
				 (((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
			   (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
				 (((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
				 (((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
				 (((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
			   (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
				 (((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
				 (((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
				 (((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
			   (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
				 (((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
				 (((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
				 (((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
		k += mm;
		J[3] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
				 (((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
				 (((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
				 (((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
			   (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
				 (((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
				 (((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
				 (((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
			   (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
				 (((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
				 (((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
				 (((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
			   (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
				 (((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
				 (((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
				 (((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
		k += mm;
		J[6] = (((((R[4]*p[k+o[ 0]])+(R[5]*p[k+o[ 1]])+(R[6]*p[k+o[ 2]])+(R[7]*p[k+o[ 3]]))*G[0])+
				 (((R[4]*p[k+o[ 4]])+(R[5]*p[k+o[ 5]])+(R[6]*p[k+o[ 6]])+(R[7]*p[k+o[ 7]]))*G[1])+
				 (((R[4]*p[k+o[ 8]])+(R[5]*p[k+o[ 9]])+(R[6]*p[k+o[10]])+(R[7]*p[k+o[11]]))*G[2])+
				 (((R[4]*p[k+o[12]])+(R[5]*p[k+o[13]])+(R[6]*p[k+o[14]])+(R[7]*p[k+o[15]]))*G[3]))*B[0])+
			   (((((R[4]*p[k+o[16]])+(R[5]*p[k+o[17]])+(R[6]*p[k+o[18]])+(R[7]*p[k+o[19]]))*G[0])+
				 (((R[4]*p[k+o[20]])+(R[5]*p[k+o[21]])+(R[6]*p[k+o[22]])+(R[7]*p[k+o[23]]))*G[1])+
				 (((R[4]*p[k+o[24]])+(R[5]*p[k+o[25]])+(R[6]*p[k+o[26]])+(R[7]*p[k+o[27]]))*G[2])+
				 (((R[4]*p[k+o[28]])+(R[5]*p[k+o[29]])+(R[6]*p[k+o[30]])+(R[7]*p[k+o[31]]))*G[3]))*B[1])+
			   (((((R[4]*p[k+o[32]])+(R[5]*p[k+o[33]])+(R[6]*p[k+o[34]])+(R[7]*p[k+o[35]]))*G[0])+
				 (((R[4]*p[k+o[36]])+(R[5]*p[k+o[37]])+(R[6]*p[k+o[38]])+(R[7]*p[k+o[39]]))*G[1])+
				 (((R[4]*p[k+o[40]])+(R[5]*p[k+o[41]])+(R[6]*p[k+o[42]])+(R[7]*p[k+o[43]]))*G[2])+
				 (((R[4]*p[k+o[44]])+(R[5]*p[k+o[45]])+(R[6]*p[k+o[46]])+(R[7]*p[k+o[47]]))*G[3]))*B[2])+
			   (((((R[4]*p[k+o[48]])+(R[5]*p[k+o[49]])+(R[6]*p[k+o[50]])+(R[7]*p[k+o[51]]))*G[0])+
				 (((R[4]*p[k+o[52]])+(R[5]*p[k+o[53]])+(R[6]*p[k+o[54]])+(R[7]*p[k+o[55]]))*G[1])+
				 (((R[4]*p[k+o[56]])+(R[5]*p[k+o[57]])+(R[6]*p[k+o[58]])+(R[7]*p[k+o[59]]))*G[2])+
				 (((R[4]*p[k+o[60]])+(R[5]*p[k+o[61]])+(R[6]*p[k+o[62]])+(R[7]*p[k+o[63]]))*G[3]))*B[3]);
		// d/dG
		G[4] = (-1.5*rgb[4]) + (2*rgb[1]) - 0.5;
		G[5] = (4.5*rgb[4]) - (5*rgb[1]);
		G[6] = (-4.5*rgb[4]) + (4*rgb[1]) + 0.5;
		G[7] = (1.5*rgb[4] - rgb[1]);
		k = b;
		J[1] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
		k += mm;
		J[4] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
		 		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
		k += mm;
		J[7] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[4])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[5])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[6])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[7]))*B[0])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[4])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[5])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[6])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[7]))*B[1])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[4])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[5])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[6])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[7]))*B[2])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[4])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[5])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[6])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[7]))*B[3]);
		// d/dB
		B[4] = (-1.5*rgb[5]) + (2*rgb[2]) - 0.5;
		B[5] = (4.5*rgb[5]) - (5*rgb[2]);
		B[6] = (-4.5*rgb[5]) + (4*rgb[2]) + 0.5;
		B[7] = (1.5*rgb[5] - rgb[2]);
		k = b;
		J[2] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
		k += mm;
		J[5] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
		k += mm;
		J[8] = (((((R[0]*p[k+o[ 0]])+(R[1]*p[k+o[ 1]])+(R[2]*p[k+o[ 2]])+(R[3]*p[k+o[ 3]]))*G[0])+
					(((R[0]*p[k+o[ 4]])+(R[1]*p[k+o[ 5]])+(R[2]*p[k+o[ 6]])+(R[3]*p[k+o[ 7]]))*G[1])+
					(((R[0]*p[k+o[ 8]])+(R[1]*p[k+o[ 9]])+(R[2]*p[k+o[10]])+(R[3]*p[k+o[11]]))*G[2])+
					(((R[0]*p[k+o[12]])+(R[1]*p[k+o[13]])+(R[2]*p[k+o[14]])+(R[3]*p[k+o[15]]))*G[3]))*B[4])+
		  		  (((((R[0]*p[k+o[16]])+(R[1]*p[k+o[17]])+(R[2]*p[k+o[18]])+(R[3]*p[k+o[19]]))*G[0])+
					(((R[0]*p[k+o[20]])+(R[1]*p[k+o[21]])+(R[2]*p[k+o[22]])+(R[3]*p[k+o[23]]))*G[1])+
					(((R[0]*p[k+o[24]])+(R[1]*p[k+o[25]])+(R[2]*p[k+o[26]])+(R[3]*p[k+o[27]]))*G[2])+
					(((R[0]*p[k+o[28]])+(R[1]*p[k+o[29]])+(R[2]*p[k+o[30]])+(R[3]*p[k+o[31]]))*G[3]))*B[5])+
				  (((((R[0]*p[k+o[32]])+(R[1]*p[k+o[33]])+(R[2]*p[k+o[34]])+(R[3]*p[k+o[35]]))*G[0])+
					(((R[0]*p[k+o[36]])+(R[1]*p[k+o[37]])+(R[2]*p[k+o[38]])+(R[3]*p[k+o[39]]))*G[1])+
					(((R[0]*p[k+o[40]])+(R[1]*p[k+o[41]])+(R[2]*p[k+o[42]])+(R[3]*p[k+o[43]]))*G[2])+
					(((R[0]*p[k+o[44]])+(R[1]*p[k+o[45]])+(R[2]*p[k+o[46]])+(R[3]*p[k+o[47]]))*G[3]))*B[6])+
				  (((((R[0]*p[k+o[48]])+(R[1]*p[k+o[49]])+(R[2]*p[k+o[50]])+(R[3]*p[k+o[51]]))*G[0])+
					(((R[0]*p[k+o[52]])+(R[1]*p[k+o[53]])+(R[2]*p[k+o[54]])+(R[3]*p[k+o[55]]))*G[1])+
					(((R[0]*p[k+o[56]])+(R[1]*p[k+o[57]])+(R[2]*p[k+o[58]])+(R[3]*p[k+o[59]]))*G[2])+
					(((R[0]*p[k+o[60]])+(R[1]*p[k+o[61]])+(R[2]*p[k+o[62]])+(R[3]*p[k+o[63]]))*G[3]))*B[7]);
		// Scale to 0-1 range (from 0-s)
		J[0] *= s;
		J[1] *= s;
		J[2] *= s;
		J[3] *= s;
		J[4] *= s;
		J[5] *= s;
		J[6] *= s;
		J[7] *= s;
		J[8] *= s;
		if (this.sin) {
			var dRGB = this.ins.dRGB(rgbIn.buffer);
			J[0] *= dRGB[0];
			J[1] *= dRGB[1];
			J[2] *= dRGB[2];
			J[3] *= dRGB[0];
			J[4] *= dRGB[1];
			J[5] *= dRGB[2];
			J[6] *= dRGB[0];
			J[7] *= dRGB[1];
			J[8] *= dRGB[2];
		}
		if (this.fS) {
			J[0] /= fLH[0];
			J[1] /= fLH[1];
			J[2] /= fLH[2];
			J[3] /= fLH[0];
			J[4] /= fLH[1];
			J[5] /= fLH[2];
			J[6] /= fLH[0];
			J[7] /= fLH[1];
			J[8] /= fLH[2];
		}
		return J;
	} else {
		return false;
	}
};
LUTVolume.prototype.JInv = function(rgbIn) {
	var M = this.J(rgbIn);
	var det =	(M[0]*((M[4]*M[8]) - (M[5]*M[7]))) -
				(M[1]*((M[3]*M[8]) - (M[5]*M[6]))) +
				(M[2]*((M[3]*M[7]) - (M[4]*M[6])));
	if (det === 0) {
		return false;
	}
	return new Float64Array([
		((M[4]*M[8])-(M[5]*M[7]))/det, ((M[2]*M[7])-(M[1]*M[8]))/det, ((M[1]*M[5])-(M[2]*M[4]))/det,
		((M[5]*M[6])-(M[3]*M[8]))/det, ((M[0]*M[8])-(M[2]*M[6]))/det, ((M[2]*M[3])-(M[0]*M[5]))/det,
		((M[3]*M[7])-(M[4]*M[6]))/det, ((M[1]*M[6])-(M[0]*M[7]))/det, ((M[0]*M[4])-(M[1]*M[3]))/det
	]);
};
LUTVolume.prototype.getDetails = function() {
	var out = {
		title: this.title,
		format: this.format,
		dims: 3,
		s: this.d,
		min: new Float64Array([this.fL[0],this.fL[1],this.fL[2]]),
		max: new Float64Array([this.fH[0],this.fH[1],this.fH[2]]),
		C: this.getRGB(),
		meta: this.meta
	};
	return out;
};
LUTVolume.prototype.getL = function() {
	return this.L.getL();
};
LUTVolume.prototype.getRGB = function() {
	var d = this.d;
	var nd = d+2;
	var m = d*d*d;
	var nm = nd*nd*nd;
	var R = new Float64Array(m);
	var G = new Float64Array(m);
	var B = new Float64Array(m);
	var k,l;
	var p = this.mesh;
	for (var b=0; b<d; b++) {
		for (var g=0; g<d; g++) {
			for (var r=0; r<d; r++) {
				k = r + ((g + (b*d))*d);
				l = (r+1) + (((g+1) + ((b+1)*nd))*nd);
				R[k] = p[l];
				l += nm;
				G[k] = p[l];
				l += nm;
				B[k] = p[l];
			}
		}
	}
	return [R.buffer,G.buffer,B.buffer];
};
LUTVolume.prototype.getSize = function() {
	return this.d;
};
LUTVolume.prototype.is1D = function() {
	return false;
};
LUTVolume.prototype.is3D = function() {
	return true;
};
LUTVolume.prototype.getTitle = function() {
	return this.title;
};
LUTVolume.prototype.getMetadata = function() {
	return this.meta;
};
LUTVolume.prototype.isClamped = function() {
	if (typeof this.clamped === 'undefined') {
		var mm = this.minMax();
		var min = Math.min(mm[0],mm[1],mm[2]);
		var max = Math.max(mm[3],mm[4],mm[5]);
		if ((min === 0 && max <= 1) || (min >= 0 && max === 1)) {
			this.clamped = true;
		} else {
			this.clamped = false;
		}
	}
	return this.clamped;
};
LUTVolume.prototype.deClamp = function() {
	if (this.isClamped()) {
		this.deClamp1D();
		this.deClamp3D();
	}
};
//
LUTVolume.prototype.getColourSpace = function() {
	var d = this.d;
	var fL = this.fL;
	var fH = this.fH;
	var fLH = this.fLH;
	var out = {
		title: this.title + 'CS',
		format: this.format,
		fLR: fL[0],
		fLG: fL[1],
		fLB: fL[2],
		fHR: fH[0],
		fHG: fH[1],
		fHB: fH[2]
	};
	var reverse = new LUTRSpline({ buff:this.L.getL(), fH:fH[3], fL:fL[3] });
	var base = this.getRGB();
	reverse.R(base[0]);
	reverse.R(base[1]);
	reverse.R(base[2]);
	out.buffR = base[0];
	out.buffG = base[1];
	out.buffB = base[2];
	return new LUTVolume(out);
};
LUTVolume.prototype.deClamp1D = function() {
	var m = this.d;
	var r = new Float64Array(m);
	var g = new Float64Array(m);
	var b = new Float64Array(m);
	var rL = 0;
	var gL = 0;
	var bL = 0;
	var rH = m-1;
	var gH = m-1;
	var bH = m-1;
	var nd = this.d + 2;
	var nm = nd*nd*nd;
	var k;
	var M = this.mesh;
	var rC = false;
	var gC = false;
	var bC = false;
	var fL = Math.min(this.fL[0],this.fL[1],this.fL[2]);
	var fH = Math.max(this.fH[0],this.fH[1],this.fH[2]);
	var fLH= fH-fL;
	// Fill three arrays with values from the gray diagonal of the mesh, and find the index where the values are not 0 or 1
	for (var j=0; j<m; j++) {
		k = (j+1) + (((j+1) + ((j+1)*nd))*nd);
		r[j] = M[k];
		k += nm;
		g[j] = M[k];
		k += nm;
		b[j] = M[k];
		if (j>0) {
//			if (r[j] === 0 && r[j-1] === 0) {
			if (r[j] === 0) {
				rC = true;
				rL = j+1;
			}
//			if (g[j] === 0 && g[j-1] === 0) {
			if (g[j] === 0) {
				gC = true;
				gL = j+1;
			}
//			if (b[j] === 0 && b[j-1] === 0) {
			if (b[j] === 0) {
				bC = true;
				bL = j+1;
			}
		}
	}
	for (var j=m-2; j>=0; j--) {
//		if (r[j] === 1 && (r[j+1] === 1 || rC)) {
		if (r[j] === 1) {
			rC = true;
			rH = j-1;
		}
//		if (g[j] === 1 && (g[j+1] === 1 || gC)) {
		if (g[j] === 1) {
			gC = true;
			gH = j-1;
		}
//		if (b[j] === 1 && (b[j+1] === 1 || bC)) {
		if (b[j] === 1) {
			bC = true;
			bH = j-1;
		}
	}
	// if the 0 index is greater than 0 or the 1 index less than m-1, make a spline to fill in the gaps
	if (rC || gC || bC) {
		var low;
		if (rL > rH) {
			low = rH;
			rH = Math.min(rL-2,m-1);
			rL = Math.max(low+2,0);
		}
		if (gL > gH) {
			low = gH;
			gH = Math.min(gL-2,m-1);
			gL = Math.max(low+2,0);
		}
		if (bL > bH) {
			low = bH;
			bH = Math.min(bL-2,m-1);
			bL = Math.max(low+2,0);
		}
		var rS,gS,bS;
		if (rC) {
			rS = new LUTQSpline(new Float64Array(r.subarray(rL,rH-rL+1)).buffer);
		} else {
			rS = new LUTQSpline(r.buffer);
		}
		if (gC) {
			gS = new LUTQSpline(new Float64Array(g.subarray(gL,gH-gL+1)).buffer);
		} else {
			gS = new LUTQSpline(g.buffer);
		}
		if (bC) {
			bS = new LUTQSpline(new Float64Array(b.subarray(bL,bH-bL+1)).buffer);
		} else {
			bS = new LUTQSpline(b.buffer);
		}
		// Now built an array to replace the 'L' spline from this.buildL()
		var m2 = m;
		if (m < 65) {
			m2 = 65;
		}
		var FD = new Float64Array(m2);
		var rI = new Float64Array(m2);
		for (var j=0; j<m2; j++) { // create rgb array of input values
			rI[j] = (j*(fLH)/(m2-1))+fL;
		}
		var gI = new Float64Array(rI);
		var bI = new Float64Array(rI);
		// apply input scaling as required
		if (this.fS) {
			for (var j=0; j<m2; j++) {
				rI[j] = (rI[j] - this.fL[0])/(this.fLH[0]);
				gI[j] = (gI[j] - this.fL[1])/(this.fLH[1]);
				bI[j] = (bI[j] - this.fL[2])/(this.fLH[2]);
			}
		}
		if (this.sin) {
			this.ins.FCub(rI.buffer);
			this.ins.FCub(gI.buffer);
			this.ins.FCub(bI.buffer);
		}
		// scale for any clamped splines
		for (var j=0; j<m2; j++) {
			rI[j] = ((rI[j]*(m-1)) - rL)/(rH-rL);
			gI[j] = ((gI[j]*(m-1)) - gL)/(gH-gL);
			bI[j] = ((bI[j]*(m-1)) - bL)/(bH-bL);
		}
		// pass through the splines
		rS.FCub(rI.buffer);
		gS.FCub(gI.buffer);
		bS.FCub(bI.buffer);
		// bring together the results to make the L array
		for (var j=0; j<m2; j++) {
			rI[j] = (rI[j]*this.Y[0]) + (gI[j]*this.Y[1]) + (bI[j]*this.Y[2]);
		}
		// replace the 'L' spline - make it reversible as that will be needed for 3D declamping
		this.L = new LUTSpline({ buff:rI.buffer, fH:fH, fL:fL });
		this.clamped = false;
		return true;
	} else {
		return false;
	}
};
LUTVolume.prototype.deClamp3D = function() {
	var d = this.d;
	var d3 = 3*d;
	var nd = d+2;
	var nd2 = nd * nd;
	var nm = nd*nd*nd;
	var sG = nd2 * nd;
	var sB = 2 * sG;
	var M = this.mesh;
	var r = new Float64Array(d);
	var g = new Float64Array(d);
	var b = new Float64Array(d);
	var l,k;
	var rC,gC,bC;
	var rL,gL,bL;
	var rH,gH,bH;
	var low;
	var minMax = this.minMax();
	var lo = Math.min(0, Math.min(minMax[0],minMax[1],minMax[2])); // 0, or the lowest value in the mesh, whichever the lesser
	var hi = Math.max(1, Math.max(minMax[3],minMax[4],minMax[5])); // 1.0, or the highest value in the mesh, whichever the greater
	var min = lo - 0.1; // 10% below the 'lo' value
	var max = hi + 0.175; // 17.5% above 'hi' value
	var limits = new Float64Array([lo,hi,min,max]);
	// First sort out inner splines
	for (var x=0; x<d; x++) {
		for (var y=0; y<d; y++) {
			rL = 0;
			gL = 0;
			bL = 0;
			rH = d-1;
			gH = d-1;
			bH = d-1;
			rC = false;
			gC = false;
			bC = false;
			for (var z=0; z<d; z++) {
				l = (z+1) + (((y+1) + ((x+1)*nd))*nd);
				r[z] = M[l];
				l = (y+1) + (((z+1) + ((x+1)*nd))*nd) + nm;
				g[z] = M[l];
				l = (y+1) + (((x+1) + ((z+1)*nd))*nd) + (2*nm);
				b[z] = M[l];
				if (z>0) {
//					if (r[z] === 0 && r[z-1] === 0) {
					if (r[z] === 0) {
						rC = true;
						rL = z+1;
					}
//					if (g[z] === 0 && g[z-1] === 0) {
					if (g[z] === 0) {
						gC = true;
						gL = z+1;
					}
//					if (b[z] === 0 && b[z-1] === 0) {
					if (b[z] === 0) {
						bC = true;
						bL = z+1;
					}
				}
			}
			for (var z=d-2; z>=0; z--) {
//				if (r[z] === 1 && (r[z+1] === 1 || rC)) {
				if (r[z] === 1) {
					rC = true;
					rH = z-1;
				}
//				if (g[z] === 1 && (g[z+1] === 1 || gC)) {
				if (g[z] === 1) {
					gC = true;
					gH = z-1;
				}
//				if (b[z] === 1 && (b[z+1] === 1 || bC)) {
				if (b[z] === 1) {
					bC = true;
					bH = z-1;
				}
			}
			if (rC) {
				if (rL > rH) {
					low = rH;
					rH = Math.min(rL-2,m-1);
					rL = Math.max(low+2,0);
				}
				this.extrap(r,rL,rH,limits);
				for (var z=0; z<d; z++) {
					if (z === rL) {
						z = rH;
					}
					l = (z+1) + (((y+1) + ((x+1)*nd))*nd);
					M[l] = r[z];
				}
			}
			if (gC) {
				if (gL > gH) {
					low = gH;
					gH = Math.min(gL-2,m-1);
					gL = Math.max(low+2,0);
				}
				this.extrap(g,gL,gH,limits);
				for (var z=0; z<d; z++) {
					if (z === gL) {
						z = gH;
					}
					l = (y+1) + (((z+1) + ((x+1)*nd))*nd) + nm;
					M[l] = g[z];
				}
			}
			if (bC) {
				if (bL > bH) {
					low = bH;
					bH = Math.min(bL-2,m-1);
					bL = Math.max(low+2,0);
				}
				this.extrap(b,bL,bH,limits);
				for (var z=0; z<d; z++) {
					if (z === bL) {
						z = bH;
					}
					l = (y+1) + (((x+1) + ((z+1)*nd))*nd) + (2*nm);
					M[l] = b[z];
				}
			}
		}
	}
	// Now fill in the edges and corners as with this.fillEdges()
	d--;
	for (var x=1; x<(d); x++) {
		for (var y=0; y<d; y++) {
			this.n3b( x, y, 0);
			this.n3b( x, y, d);
			this.n3b( x, 0, y);
			this.n3b( x, d, y);
			this.n3b( 0, x, y);
			this.n3b( d, x, y);
		}
		this.n3b( x, 0, 0);
		this.n3b( x, 0, d);
		this.n3b( x, d, 0);
		this.n3b( x, d, d);
		this.n3b( 0, x, 0);
		this.n3b( 0, x, d);
		this.n3b( d, x, 0);
		this.n3b( d, x, d);
		this.n3b( 0, 0, x);
		this.n3b( 0, d, x);
		this.n3b( d, 0, x);
		this.n3b( d, d, x);
	}
	this.n3b( 0, 0, 0);
	this.n3b( 0, 0, d);
	this.n3b( 0, d, 0);
	this.n3b( 0, d, d);
	this.n3b( d, 0, 0);
	this.n3b( d, 0, d);
	this.n3b( d, d, 0);
	this.n3b( d, d, d);
	// Repopulate the outer edges of the mesh
	this.fillEdges();
	this.clamped = false;
};
LUTVolume.prototype.extrap = function(c,L,H,limits) {
	var m = c.length;
	var dcLo,dcHi;
	if (H-L > 2) { // more than four points
		dcLo = (0.1*c[L+3]) - (0.8*c[L+2]) + (2.3*c[L+1]) - (1.6*c[L]);
		dcHi = (-0.1*c[H-3]) + (0.8*c[H-2]) - (2.3*c[H-1]) + (1.6*c[H]);
	} else if (H-L > 1) { // three points
		dcLo = 1;
		dcHi = 1;
	} else { // two points
		dcLo = c[L+1] - c[L];
		dcHi = c[H] - c[H-1];
	}
	if (L > 0) {
		for (var j=0; j<L; j++) {
			c[j] = c[L] + ((j-L)*dcLo);
		}
	}
	if (H < m-1) {
		for (var j=H+1; j<m; j++) {
			c[j] = c[H] + ((j-H)*dcHi);
		}
	}
	if (typeof limits !== 'undefined') {
		var lo = limits[0];
		var hi = limits[1];
		var min = limits[2];
		var max = limits[3];
		var numLo = Math.pow(min-lo,2);
		var denLo = min-lo;
		var numHi = Math.pow(max-hi,2);
		var denHi = max-hi;
		for (var j=0; j<m; j++) {
			if (j === L) {
				j = H+1;
			}
			if (c[j] < lo) {
				c[j] = min - (numLo/((dcLo*(c[j]-lo))+denLo));
			} else if (c[j] > hi) {
				c[j] = max - (numHi/((dcHi*(c[j]-hi))+denHi));
			}
		}
	}
};
LUTVolume.prototype.fillEdges = function() {
	var d = this.d;
	// fill in the gaps in the new mesh
	for (var x=0; x<d; x++) {
		for (var y=0; y<d; y++) {
			this.n3( x, y,-1);
			this.n3( x, y, d);
			this.n3( x,-1, y);
			this.n3( x, d, y);
			this.n3(-1, x, y);
			this.n3( d, x, y);
		}
		this.n3( x,-1,-1);
		this.n3( x,-1, d);
		this.n3( x, d,-1);
		this.n3( x, d, d);
		this.n3(-1, x,-1);
		this.n3(-1, x, d);
		this.n3( d, x,-1);
		this.n3( d, x, d);
		this.n3(-1,-1, x);
		this.n3(-1, d, x);
		this.n3( d,-1, x);
		this.n3( d, d, x);
	}
	this.n3(-1,-1,-1);
	this.n3(-1,-1, d);
	this.n3(-1, d,-1);
	this.n3(-1, d, d);
	this.n3( d,-1,-1);
	this.n3( d,-1, d);
	this.n3( d, d,-1);
	this.n3( d, d, d);
};
LUTVolume.prototype.setP = function(rM,gM,bM,rgb) {
	// setP is used to change an individual mesh point. The inputs rM, gM, bM are zero-indexed coordinates on the base mesh
	// rgb is a Float64Array of the r, g and b values to be set at the specified mesh point
	// setP returns a Float64Array of the rgb value before changing
	var M = this.mesh;
	var d = this.d-1;
	var s = d-4;
	var nd = this.nd;
	var nd2 = nd*nd;
	var sG = nd2*nd;
	var sB = 2 * sG;
	var k = (rM + 1) + ((gM + 1)*nd) + ((bM + 1)*nd2);
	var o = new Float64Array([M[ k ], M[k+sG], M[k+sB]]);
	M[ k ] = rgb[0];
	M[k+sG] = rgb[1];
	M[k+sB] = rgb[2];
	// recalculate any edges, faces or corners in the extended mesh affected by the value change
	if (rM < 4) {
		// faces
		this.n3(-1,gM,bM);
		// edges
		if (gM ===   rM) { this.n3(-1,-1,bM); }
		if (gM === s-rM) { this.n3(-1, d,bM); }
		if (bM ===   rM) { this.n3(-1,gM,-1); }
		if (bM === s-rM) { this.n3(-1,gM, d); }
		// corners
		if (gM ===   rM && bM ===   rM) { this.n3(-1,-1,-1); }
		if (gM === s-rM && bM ===   rM) { this.n3(-1, d,-1); }
		if (gM === s-rM && bM === s-rM) { this.n3(-1, d, d); }
		if (gM ===   rM && bM === s-rM) { this.n3(-1,-1, d); }
	}
	if (rM > s) {
		// faces
		this.n3( d,gM,bM);
		// edges
		if (gM ===   rM) { this.n3( d, d,bM); }
		if (gM === rM-s) { this.n3( d,-1,bM); }
		if (bM ===   rM) { this.n3( d,gM, d); }
		if (bM === rM-s) { this.n3( d,gM,-1); }
		// corners
		if (gM ===   rM && bM ===   rM) { this.n3( d, d, d); }
		if (gM === rM-s && bM ===   rM) { this.n3( d,-1, d); }
		if (gM === rM-s && bM === rM-s) { this.n3( d,-1,-1); }
		if (gM ===   rM && bM === rM-s) { this.n3( d, d,-1); }
	}
	if (gM < 4) {
		// faces
		this.n3(rM,-1,bM);
		// edges
		if (bM ===   gM) { this.n3(rM,-1,-1); }
		if (bM === s-gM) { this.n3(rM,-1, d); }
	}
	if (gM > s) {
		// faces
		this.n3(rM, d,bM);
		// edges
		if (bM ===   gM) { this.n3(rM, d,-1); }
		if (bM === gM-s) { this.n3(rM, d, d); }
	}
	if (bM < 4) { this.n3(rM,gM,-1); }
	if (bM > s) { this.n3(rM,gM, d); }
	return o;
};
LUTVolume.prototype.getP = function(rM,gM,bM) {
	var M = this.mesh;
	var nd = this.nd;
	var nd2 = nd*nd;
	var sG = nd2*nd;
	var sB = 2 * sG;
	var k = (rM + 1) + ((gM + 1)*nd) + ((bM + 1)*nd2);
	return new Float64Array([M[ k ],M[k+sG],M[k+sB]]);
};
LUTVolume.prototype.n3 = function(rM,gM,bM,mono) {
	// 3D extrapolation - calculates all colour channels at once
	// rM, gM and bM are mesh point coordinates relative to the base mesh, not the extended, precalculated one
	// ie -1 means the bottom edge of the extended mesh, this.d the top edge
	var rD,gD,bD;
	var d = this.d - 1;
	var pR = this.pR;
	var pG = this.pG;
	var pB = this.pB;
	var o,m;
	// Get the array position on the extended mesh that we are going to fill
	var nd = this.nd;
	var nd2 = nd*nd
	var k = (rM+1) + ((gM + 1)*nd) + ((bM + 1)*nd2);
	// Establish which way the points need to go, and from what base
	if (rM < 0) {
		rD = 1;
	} else if (rM > d) {
		rD = -1;
	} else {
		rD = 0;
	}
	if (gM < 0) {
		gD = 1;
	} else if (gM > d) {
		gD = -1;
	} else {
		gD = 0;
	}
	if (bM < 0) {
		bD = 1;
	} else if (bM > d) {
		bD = -1;
	} else {
		bD = 0;
	}
	// Fill in the points to be extrapolated
	var M = this.mesh;
	var sG = nd2*nd;
	var sB = 2 * sG;
	var l = k + rD + (gD*nd) + (bD*nd2);
	pR[3] = M[l];
	pG[3] = M[l + sG];
	pB[3] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[2] = M[l];
	pG[2] = M[l + sG];
	pB[2] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[1] = M[l];
	pG[1] = M[l + sG];
	pB[1] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[0] = M[l];
	pG[0] = M[l + sG];
	pB[0] = M[l + sB];
	// Now calculate the values
	// Red
	m = 0;
	if (pR[3] === pR[1]) {
		M[k] = pR[2];
//	} else if (typeof mono !== 'undefined') {
//		m = -mono*rD;
	} else if (pR[3] > pR[1]) {
		m = 1;
	} else {
		m = -1;
	}

	if (m !== 0) {
		o = (-0.4*pR[0]) + (2.2*pR[1]) - (4.2*pR[2]) + (3.4*pR[3]);
		if ((o-pR[2])*m <= 0) { // make sure that the slope at y(1) doesn't change sign
			o = pR[1] - (3*pR[2]) + (3*pR[3]);
			if ((o-pR[2])*m <= 0) { // if it is still swapping signs, use a slope of 0, ie y(2) = y(1)
				o = pR[2]; // this allows for a completely flat extrapolation, ie slope = 0 at y(1)
			}
		}
		M[k] = o;
	}
	// Green
	m = 0;
	if (pG[3] === pG[1]) {
		M[k + sG] = pG[2];
//	} else if (typeof mono !== 'undefined') {
//		m = -mono*gD;
	} else if (pG[3] > pG[1]) {
		m = 1;
	} else {
		m = -1;
	}
	if (m !== 0) {
		o = (-0.4*pG[0]) + (2.2*pG[1]) - (4.2*pG[2]) + (3.4*pG[3]);
		if ((o-pG[2])*m <= 0) { // make sure that the slope at y(1) doesn't change sign
			o = pG[1] - (3*pG[2]) + (3*pG[3]);
			if ((o-pG[2])*m <= 0) { // if it is still swapping signs, use a slope of 0, ie y(2) = y(1)
				o = pG[2]; // this allows for a completely flat extrapolation, ie slope = 0 at y(1)
			}
		}
		M[k + sG] = o;
	}
	// Blue
	m = 0;
	if (pB[3] === pB[1]) {
		M[k + sB] = pB[2];
//	} else if (typeof mono !== 'undefined') {
//		m = -mono*bD;
	} else if (pB[3] > pB[1]) {
		m = 1;
	} else {
		m = -1;
	}
	if (m !== 0) {
		o = (-0.4*pB[0]) + (2.2*pB[1]) - (4.2*pB[2]) + (3.4*pB[3]);
		if ((o-pB[2])*m <= 0) { // make sure that the slope at y(1) doesn't change sign
			o = pB[1] - (3*pB[2]) + (3*pB[3]);
			if ((o-pB[2])*m <= 0) { // if it is still swapping signs, use a slope of 0, ie y(2) = y(1)
				o = pB[2]; // this allows for a completely flat extrapolation, ie slope = 0 at y(1)
			}
		}
		M[k + sB] = o;
	}
};
LUTVolume.prototype.n3b = function(rM,gM,bM) {
	// 3D extrapolation - calculates all colour channels at once
	// rM, gM and bM are mesh point coordinates relative to the base mesh, not the extended, precalculated one
	// this differs from the basic n3 as it is for filling in the edges, corners and faces of the base mesh
	// after a declamp, to allow for interaction of colour channels, ie 0 is to bottom, this.d-1 the top.
	var rD,gD,bD;
	var d = this.d - 1;
	var pR = this.pR;
	var pG = this.pG;
	var pB = this.pB;
	var o,m;
	// Get the array position on the extended mesh that we are going to fill
	var nd = this.nd;
	var nd2 = nd*nd
	var k = (rM+1) + ((gM + 1)*nd) + ((bM + 1)*nd2);
	// Establish which way the points need to go, and from what base
	if (rM <= 0) {
		rD = 1;
	} else if (rM >= d) {
		rD = -1;
	} else {
		rD = 0;
	}
	if (gM <= 0) {
		gD = 1;
	} else if (gM >= d) {
		gD = -1;
	} else {
		gD = 0;
	}
	if (bM <= 0) {
		bD = 1;
	} else if (bM >= d) {
		bD = -1;
	} else {
		bD = 0;
	}
	// Fill in the points to be extrapolated
	var M = this.mesh;
	var sG = nd2*nd;
	var sB = 2 * sG;
	var l = k + rD + (gD*nd) + (bD*nd2);
	pR[3] = M[l];
	pG[3] = M[l + sG];
	pB[3] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[2] = M[l];
	pG[2] = M[l + sG];
	pB[2] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[1] = M[l];
	pG[1] = M[l + sG];
	pB[1] = M[l + sB];
	l += rD + (gD*nd) + (bD*nd2);
	pR[0] = M[l];
	pG[0] = M[l + sG];
	pB[0] = M[l + sB];
	// Now calculate the values
	M[ k  ] = - (0.1*pR[0]) + (0.8*pR[1]) - (2.3*pR[2]) + (2.6*pR[3]);
	M[k+sG] = - (0.1*pG[0]) + (0.8*pG[1]) - (2.3*pG[2]) + (2.6*pG[3]);
	M[k+sB] = - (0.1*pB[0]) + (0.8*pB[1]) - (2.3*pB[2]) + (2.6*pB[3]);
};
LUTVolume.prototype.compare = function(tgtBuff,tstBuff,method) {
	// returns the RMS differences in the red channels between a target dataset (tgt) and a test dataset (tst) which 'compare' passes through the lut
	// method sets the interpolation method used on the test set, currently trilinear (1, 'lin' or 'linear') or tricubic (anything else or the default if 'method' is not present.
	var tgt = new Float64Array(tgtBuff.slice(0));
	var tst = new Float64Array(tstBuff.slice(0));
	var m = tgt.length;
	if (m !== tst.length) {
		return false;
	}
	if (typeof method !== 'undefined') {
		method = method.toString().toLowerCase();
		if (method === '1' || method === 'tet') {
			this.RGBTet(tst.buffer);
		} else if (method === '2' || method === 'lin') {
			this.RGBLin(tst.buffer);
		} else {
			this.RGBCub(tst.buffer);
		}
	} else {
		this.RGBCub(tst.buffer);
	} 
	var e = new Float64Array(3);
	for (var j=0; j<m; j += 3) {
		e[0]  += Math.pow(tst[ j ] - tgt[ j ],2);
		e[1]  += Math.pow(tst[j+1] - tgt[j+1],2);
		e[2]  += Math.pow(tst[j+2] - tgt[j+2],2);
	}
	e[0] = Math.pow(e[0]*3/m,0.5);
	e[1] = Math.pow(e[1]*3/m,0.5);
	e[2] = Math.pow(e[2]*3/m,0.5);
	return e;
};
LUTVolume.prototype.NR3D = function(tgt,tolerence,maxIterations,seed) { // Multivariate (3D) Newton-Raphson
	if (tgt.length === 3) {
		var tol,m,x;
		if (typeof tolerence === 'number') { // tolerence for what is considered close enough
			tol = tolerence;
		} else {
			tol = 0.00000001;
		}
		tol *= tol; // saves putting a square root into the convergence test
		if (typeof maxItrss === 'number') { // maximum number of iterations before giving up (ie poor convergence)
			m = maxItrs;
		} else {
			m = 50;
		}
		if (typeof seed !== 'undefined' && seed.length === 3) { // initial 'seed' value - if none given use the target
			x = new Float64Array([seed[0],seed[1],seed[2]],0);
		} else {
			x = new Float64Array([tgt[0],tgt[1],tgt[2]],0);
		}
		var f,Jinv,d;
		for (var j=0; j<m; j++) {
			f = this.rgbCub(x);
			JInv = this.JInv(x);
			if (JInv) {
				// Newton-Raphson is a root (0) finder, so subtract the target values
				f[0] -= tgt[0];
				f[1] -= tgt[1];
				f[2] -= tgt[2];
				// Test for convergence
				x[3] = (f[0]*f[0]) + (f[1]*f[1]) + (f[2]*f[2]);
				if (x[3] < tol) {
					x[3] = 0;
					return x;
				} else if (j === m-1) { // last pass - it's not converging
					x[3] = Math.pow(x[3],0.5); // distance from target 
					return x;
				} else {
					x[0] -= (Jinv[0]*f[0]) + (JInv[1]*f[1]) + (JInv[2]*f[2]);
					x[1] -= (Jinv[3]*f[0]) + (JInv[4]*f[1]) + (JInv[5]*f[2]);
					x[2] -= (Jinv[6]*f[0]) + (JInv[7]*f[1]) + (JInv[8]*f[2]);
				}
			} else {
				return false;
			}
		}
	} else {
		return false
	}
};
LUTVolume.prototype.minMax = function() {
	var p = this.mesh;
	var x = new Float64Array([
		 9999, 9999, 9999,	// Absolute min values
		-9999,-9999,-9999	// Absolute max values
	]);
	var rgb = new Float64Array(3);
	var m = this.d;
	var nd = this.d+2;
	var nm = nd*nd*nd;
	var l;
	// First find the minimum and maximum values in the mesh, independent of each other
	for (var b=0; b<m; b++) {
		for (var g=0; g<m; g++) {
			for (var r=0; r<m; r++) {
				l = (r+1) + (((g+1) + ((b+1)*nd))*nd);
				if (p[l] < x[0]) {
					x[0] = p[l];
				} else if (p[l] > x[3]) {
					x[3] = p[l];
				}
				l += nm;
				if (p[l] < x[1]) {
					x[1] = p[l];
				} else if (p[l] > x[4]) {
					x[4] = p[l];
				}
				l += nm;
				if (p[l] < x[2]) {
					x[2] = p[l];
				} else if (p[l] > x[5]) {
					x[5] = p[l];
				}
			}
		}
	}
	return x;
};
LUTVolume.prototype.getLimits = function(minMax) {
	var p = this.mesh;
	var x;
	if (typeof minMax !== 'undefined') {
		x = minMax;
	} else {
		x = this.minMax();
	}
	var o = new Float64Array([
		 9999, 9999, 9999,	// Black
		-9999, 9999, 9999,	// Red
		-9999,-9999, 9999,	// Yellow
		 9999,-9999, 9999,	// Green
		 9999,-9999,-9999,	// Cyan
		 9999, 9999,-9999,	// Blue
		-9999, 9999,-9999,	// Magenta
		-9999,-9999,-9999	// White
	]);
	var i = new Float64Array(24);
	var d = new Float64Array([
		9999,9999,9999,9999,9999,9999,9999,9999
	]);
	var rgb = new Float64Array(3);
	var m = this.d;
	var nd = this.d+2;
	var nm = nd*nd*nd;
	var s = m-1;
	var D;
	var l;
	// Now go back through the mesh, comparing distances from the absolute corners
	for (var b=0; b<m; b++) {
		for (var g=0; g<m; g++) {
			for (var r=0; r<m; r++) {
				l = (r+1) + (((g+1) + ((b+1)*nd))*nd);
				rgb[0] = p[l];
				l += nm;
				rgb[1] = p[l];
				l += nm;
				rgb[2] = p[l];
				D = Math.pow(rgb[0]-x[0],2)+Math.pow(rgb[1]-x[1],2)+Math.pow(rgb[2]-x[2],2);	// Black
				if (D < d[0]) {
					o[ 0] = rgb[0];
					o[ 1] = rgb[1];
					o[ 2] = rgb[2];
					i[ 0] = r;
					i[ 1] = g;
					i[ 2] = b;
					d[0] = D;
				}
				D = Math.pow(rgb[0]-x[3],2)+Math.pow(rgb[1]-x[1],2)+Math.pow(rgb[2]-x[2],2);	// Red
				if (D < d[1]) {
					o[ 3] = rgb[0];
					o[ 4] = rgb[1];
					o[ 5] = rgb[2];
					i[ 3] = r;
					i[ 4] = g;
					i[ 5] = b;
					d[1] = D;
				}
				D = Math.pow(rgb[0]-x[3],2)+Math.pow(rgb[1]-x[4],2)+Math.pow(rgb[2]-x[2],2);	// Yellow
				if (D < d[2]) {
					o[ 6] = rgb[0];
					o[ 7] = rgb[1];
					o[ 8] = rgb[2];
					i[ 6] = r;
					i[ 7] = g;
					i[ 8] = b;
					d[2] = D;
				}
				D = Math.pow(rgb[0]-x[0],2)+Math.pow(rgb[1]-x[4],2)+Math.pow(rgb[2]-x[2],2);	// Green
				if (D < d[3]) {
					o[ 9] = rgb[0];
					o[10] = rgb[1];
					o[11] = rgb[2];
					i[ 9] = r;
					i[10] = g;
					i[11] = b;
					d[3] = D;
				}
				D = Math.pow(rgb[0]-x[0],2)+Math.pow(rgb[1]-x[4],2)+Math.pow(rgb[2]-x[5],2);	// Cyan
				if (D < d[4]) {
					o[12] = rgb[0];
					o[13] = rgb[1];
					o[14] = rgb[2];
					i[12] = r;
					i[13] = g;
					i[14] = b;
					d[4] = D;
				}
				D = Math.pow(rgb[0]-x[0],2)+Math.pow(rgb[1]-x[1],2)+Math.pow(rgb[2]-x[5],2);	// Blue
				if (D < d[5]) {
					o[15] = rgb[0];
					o[16] = rgb[1];
					o[17] = rgb[2];
					i[15] = r;
					i[16] = g;
					i[17] = b;
					d[5] = D;
				}
				D = Math.pow(rgb[0]-x[3],2)+Math.pow(rgb[1]-x[1],2)+Math.pow(rgb[2]-x[5],2);	// Magenta
				if (D < d[6]) {
					o[18] = rgb[0];
					o[19] = rgb[1];
					o[20] = rgb[2];
					i[18] = r;
					i[19] = g;
					i[20] = b;
					d[6] = D;
				}
				D = Math.pow(rgb[0]-x[3],2)+Math.pow(rgb[1]-x[4],2)+Math.pow(rgb[2]-x[5],2);	// White
				if (D < d[7]) {
					o[21] = rgb[0];
					o[22] = rgb[1];
					o[23] = rgb[2];
					i[21] = r;
					i[22] = g;
					i[23] = b;
					d[7] = D;
				}
			}
		}
	}
	for (var j=0; j<24; j++) {
		i[j] /= s
	}
	if (this.sin) {
		var rev = new LUTRSpline({
			buff: this.ins.getL()
		});
		rev.R(i.buffer);
	}
	if (this.fS) {
		var fL = this.fL;
		var fLH = this.fLH;
		for (var j=0; j<24; j += 3) {
			i[ j ] = (i[ j ]*fLH[0]) + fL[0];
			i[j+1] = (i[j+1]*fLH[1]) + fL[1];
			i[j+2] = (i[j+2]*fLH[2]) + fL[2];
		}
	}
	return {minMax:x, i:i, o:o};
};
// Stringify for inline Web Workers
function getLUTString() {
	var out = "";
	// LUTs
	out += LUTs.toString() + "\n";
	for (var j in LUTs.prototype) {
		out += 'LUTs.prototype.' + j + '=' + LUTs.prototype[j].toString() + "\n";
	}
	// LUTSpline
	out += LUTSpline.toString() + "\n";
	for (var j in LUTSpline.prototype) {
		out += 'LUTSpline.prototype.' + j + '=' + LUTSpline.prototype[j].toString() + "\n";
	}
	// LUTRGBSpline
	out += LUTRGBSpline.toString() + "\n";
	for (var j in LUTRGBSpline.prototype) {
		out += 'LUTRGBSpline.prototype.' + j + '=' + LUTRGBSpline.prototype[j].toString() + "\n";
	}
	// LUTRSpline
	out += LUTRSpline.toString() + "\n";
	for (var j in LUTRSpline.prototype) {
		out += 'LUTRSpline.prototype.' + j + '=' + LUTRSpline.prototype[j].toString() + "\n";
	}
	// LUTQSpline
	out += LUTQSpline.toString() + "\n";
	for (var j in LUTQSpline.prototype) {
		out += 'LUTQSpline.prototype.' + j + '=' + LUTQSpline.prototype[j].toString() + "\n";
	}
	// LUTVolume
	out += LUTVolume.toString() + "\n";
	for (var j in LUTVolume.prototype) {
		out += 'LUTVolume.prototype.' + j + '=' + LUTVolume.prototype[j].toString() + "\n";
	}
	return out;
}
var workerLUTString = getLUTString();
/* ring.js
* LUT handling object for the LUTCalc Web App.
* 31st December 2014
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function Ring() {
	this.title = '';
	this.s = 1024; // Dimension - eg 1024 or 4096 for 1D, 17, 33 or 65 for 3D
	this.r = 1; // increase in output value for each multiple of input 1
	this.p = false; // Specify if the output is monotonal (eg conversion to PSST angle)
	this.mod = false; // Specify if output reaches a modulus (eg colour). False or numeric value;
}
Ring.prototype.getSize = function() {
	return this.s;
};
Ring.prototype.getDetails = function() {
	var out = {
			title: this.title,
			s: this.s,
			r: this.r,
			p: this.p,
			L: this.L.buffer
	};
	return out;
};
Ring.prototype.setDetails = function(d) {
	this.title = d.title;
	if (typeof d.L !== 'undefined') {
		this.L = new Float64Array(d.L);
		this.s = this.L.length;
		if (typeof d.p === 'boolean') {
			if (typeof d.r === 'number') {
				this.r = d.r;
			} else {
				this.r = this.L[this.s-1] - this.L[0];
			}
			this.p = d.p;
		} else {
			this.p = false;
			this.r = 0;
		}
	}
	if (typeof d.mod === 'number') {
		this.mod = d.mod;
	} else {
		this.mod = false;
	}
};
Ring.prototype.reset = function() {
	this.title = '';
	this.s = 1024;
	this.r = 1;
	this.p = false;
};
Ring.prototype.setL = function(bufL) {
	this.L = new Float64Array(bufL);
	this.s = this.L.length;
};
Ring.prototype.getL = function() {
	return this.L.buffer;
};
Ring.prototype.f = function(L) {
	var top = (this.s - 1);
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var f = Math.floor(L);
	var p0,p1;
	var d0,d1;
	p0 = this.L[f];
	if (f === top) {
		p1 = this.L[1] + this.r;
		d0 = (p1 - this.L[f-1])/2;
	} else if (f === 0) {
		p1 = this.L[1];
		d0 = (p1 - this.L[top-1] + this.r)/2;
	} else {
		p1 = this.L[f+1];
		d0 = (p1 - this.L[f - 1])/2;
	}
	if (f > top-2) {
		d1 = (this.L[(f + 3)%top] + this.r - this.L[f])/2;
	} else {
		d1 = (this.L[f + 2] - this.L[f])/2;
	}
	var a = (2 * p0) + d0 - (2 * p1) + d1;
	var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
	var c = d0;
	var d = p0;
	L -= f;
	return (((((a * L) + b) * L) + c) * L) + d;
};
Ring.prototype.fCub = function(L) {
	if (this.mod) {
		return this.cubMod(L);
	} else {
		return this.cub(L);
	}
};
Ring.prototype.fLin = function(L) {
	if (this.mod) {
		return this.linMod(L);
	} else {
		return this.lin(L);
	}
};
Ring.prototype.cub = function(L) {
	var top = (this.s - 1);
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var f = Math.floor(L);
	var p0,p1;
	var d0,d1;
	p0 = this.L[f];
	if (f === top) {
		p1 = this.L[1] + this.r;
		d0 = (p1 - this.L[f-1])/2;
	} else if (f === 0) {
		p1 = this.L[1];
		d0 = (p1 - this.L[top-1] + this.r)/2;
	} else {
		p1 = this.L[f+1];
		d0 = (p1 - this.L[f - 1])/2;
	}
	if (f > top-2) {
		d1 = (this.L[(f + 3)%top] + this.r - this.L[f])/2;
	} else {
		d1 = (this.L[f + 2] - this.L[f])/2;
	}
	var a = (2 * p0) + d0 - (2 * p1) + d1;
	var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
	var c = d0;
	var d = p0;
	L -= f;
	return (((((a * L) + b) * L) + c) * L) + d;
};
Ring.prototype.cubMod = function(L) {
	var top = (this.s - 1);
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L = L * top;
	var f = Math.floor(L);
	var mod = this.mod;
	var sp = mod * 0.5;
	var p0,p1;
	var pm1,p2;
	var d0,d1;
	p0 = this.L[f];
	if (f === top) {
		p1 = this.L[1] + this.r;
		pm1 = this.L[f-1];
	} else if (f === 0) {
		p1 = this.L[1];
		pm1 = this.L[top-1] - this.r;
	} else {
		p1 = this.L[f+1];
		pm1 = this.L[f - 1];
	}
	if (f > top-2) {
		p2 = this.L[(f + 3)%top] + this.r;
	} else {
		p2 = this.L[f + 2];
	}
	if (p0-pm1 > sp) {
		pm1 += mod;
	} else if (pm1-p0 > sp) {
		pm1 -= mod;
	}
	if (p0-p1 > sp) {
		p1 += mod;
	} else if (p1-p0 > sp) {
		p1 -= mod;
	}
	if (p0-p2 > sp) {
		p2 += mod;
	} else if (p2-p0 > sp) {
		p2 -= mod;
	}
	pm1 = pm1%mod;
	p0 = p0%mod;
	p1 = p1%mod;
	p2 = p2%mod;
	d0 = (p1 - pm1)/2;
	d1 = (p2 - p0)/2;
	var a = (2 * p0) + d0 - (2 * p1) + d1;
	var b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
	var c = d0;
	var d = p0;
	L -= f;
	return (((((a * L) + b) * L) + c) * L) + d;
};
Ring.prototype.lin = function(L) {
	var top = this.s - 1;
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L *= top;
	var f = Math.floor(L);
	var dy = L - f;
	if (f === top) {
		return (this.L[f] * (1 - dy)) + ((this.L[1]+this.r) * dy);
	} else {
		return (this.L[f] * (1 - dy)) + (this.L[f + 1] * dy);
	}
};
Ring.prototype.linMod = function(L) {
	var top = this.s - 1;
	var mod = this.mod;
	var sp = mod * 0.5;
	L = L%1;
	if (L<0) {
		L += 1;
	}
	L *= top;
	var f = Math.floor(L);
	var dy = L - f;
	var p0 = this.L[f];
	var p1;
	if (f === top) {
		p1 = this.L[1]+this.r;
	} else {
		p1 = this.L[f + 1];
	}
	if (p0-p1 > sp) {
		p1 += mod;
	} else if (p1-p0 > sp) {
		p1 -= mod;
	}
	p1 = p1%mod;
	return (p0 * (1 - dy)) + (p1 * dy);
};
Ring.prototype.lLsCub = function(buff) {
	if (this.mod) {
		this.cubsMod(buff);
	} else {
		this.cubs(buff);
	}
};
Ring.prototype.cubs = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var max = this.s - 1;
	var f;
	var p0,p1;
	var d0,d1;
	var a,b,c,d;
	for (var j=0; j<m; j++) {
		o[j] = o[j]%1;
		if (o[j]<0) {
			o[j] += 1;
		}
		o[j] *= max;
		f = Math.floor(o[j]);
		p0 = this.L[f];
		if (f === max) {
			p1 = this.L[1] + this.r;
			d0 = (p1 - this.L[f-1])/2;
		} else if (f === 0) {
			p1 = this.L[1];
			d0 = (p1 - this.L[max-1] + this.r)/2;
		} else {
			p1 = this.L[f+1];
			d0 = (this.L[f+1] - this.L[f - 1])/2;
		}
		if (f > max-2) {
			d1 = (this.L[(f + 3)%max] + this.r - this.L[f])/2;
		} else {
			d1 = (this.L[f + 2] - this.L[f])/2;
		}
		a = (2 * p0) + d0 - (2 * p1) + d1;
		b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
		c = d0;
		d = p0;
		o[j] -= f;
		o[j] = (((((a * o[j]) + b) * o[j]) + c) * o[j]) + d;
	}
};
Ring.prototype.cubsMod = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var max = this.s - 1;
	var f;
	var p0,p1;
	var pm1,p2;
	var d0,d1;
	var a,b,c,d;
	var mod = this.mod;
	var sp = mod * 0.5;
	for (var j=0; j<m; j++) {
		o[j] = o[j]%1;
		if (o[j]<0) {
			o[j] += 1;
		}
		o[j] *= max;
		f = Math.floor(o[j]);
		p0 = this.L[f];
		if (f === max) {
			p1 = this.L[1] + this.r;
			pm1 = this.L[f-1];
		} else if (f === 0) {
			p1 = this.L[1];
			pm1 = this.L[max-1] - this.r;
		} else {
			p1 = this.L[f+1];
			pm1 = this.L[f - 1];
		}
		if (f > max-2) {
			p2 = this.L[(f + 3)%max] + this.r;
		} else {
			p2 = this.L[f + 2];
		}
		if (p0-pm1 > sp) {
			pm1 += mod;
		} else if (pm1-p0 > sp) {
			pm1 -= mod;
		}
		if (p0-p1 > sp) {
			p1 += mod;
		} else if (p1-p0 > sp) {
			p1 -= mod;
		}
		if (p0-p2 > sp) {
			p2 += mod;
		} else if (p2-p0 > sp) {
			p2 -= mod;
		}
		pm1 = pm1%mod;
		p0 = p0%mod;
		p1 = p1%mod;
		p2 = p2%mod;
		d0 = (p1 - pm1)/2;
		d1 = (p2 - p0)/2;
		a = (2 * p0) + d0 - (2 * p1) + d1;
		b = - (3 * p0) - (2 * d0) + (3 * p1) - d1;
		c = d0;
		d = p0;
		o[j] -= f;
		o[j] = (((((a * o[j]) + b) * o[j]) + c) * o[j]) + d;
	}
};
Ring.prototype.lLsLin = function(buff) {
	if (this.mod) {
		this.linsMod(buff);
	} else {
		this.lins(buff);
	}
};
Ring.prototype.lins = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var max = this.s - 1;
	var f, dy;
	for (var j=0; j<m; j++) {
		o[j] = o[j]%1;
		if (o[j]<0) {
			o[j] += 1;
		}
		o[j] *= max;
		var f = Math.floor(o[j]);
		var dy = o[j] - f;
		if (f === top) {
			o[j] = (this.L[f] * (1 - dy)) + ((this.L[1]+this.r) * dy);
		} else {
			o[j] = (this.L[f] * (1 - dy)) + (this.L[f + 1] * dy);
		}
	}
};
Ring.prototype.linMod = function(buff) {
	var o = new Float64Array(buff);
	var m = o.length;
	var max = this.s - 1;
	var f, dy;
	var p0,p1;
	var mod = this.mod;
	var sp = mod * 0.5;
	for (var j=0; j<m; j++) {
		o[j] = o[j]%1;
		if (o[j]<0) {
			o[j] += 1;
		}
		o[j] *= top;
		f = Math.floor(o[j]);
		dy = o[j] - f;
		p0 = this.L[f];
		if (f === max) {
			p1 = this.L[1]+this.r;
		} else {
			p1 = this.L[f + 1];
		}
		if (p0-p1 > sp) {
			p1 += mod;
		} else if (p1-p0 > sp) {
			p1 -= mod;
		}
		p1 = p1%mod;
		o[j] = (p0 * (1 - dy)) + (p1 * dy);
	}
};
// Stringify for inline Web Workers
function getRingString() {
	var out = "";
	// Ring
	out += Ring.toString() + "\n";
	for (var j in Ring.prototype) {
		out += 'Ring.prototype.' + j + '=' + Ring.prototype[j].toString() + "\n";
	}
	return out;
}
var workerRingString = getRingString();
