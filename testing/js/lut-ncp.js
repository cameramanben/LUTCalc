/* lut-ncp.js
* Nikon custom picture .ncp building for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*
* NCP file structure suggested by 'coderat' on this thread: https://nikonhacker.com/viewtopic.php?t=1803
*/
function ncpLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
	this.profileName = [
		'Nikon Vivid',
		'Nikon Standard',
		'Nikon Neutral',
		'Nikon D2X Mode 1',
		'Nikon D2X Mode 2',
		'Nikon D2X Mode 3',
		'Nikon Portrait',
		'Nikon Landscape',
		'Nikon Monochrome'
	];
	this.profileCode = new Uint16Array([
		0x00C3,
		0x0001,
		0x03C2,
		0x0014,
		0x03D5,
		0x00D6,
		0x0486,
		0x04C7,
		0x064D
	]);
}
ncpLUT.prototype.build = function(buff, fileName, ext) {
	var lut = new Float64Array(buff);
	var info = {};
	this.messages.getInfo(info);
	var m = lut.length;
	var y;
	var yMin = 999;
	var yMax = -999;
	for (var j=0; j<m; j += 3) {
		y = (0.2126 * lut[ j ]) + (0.7152 * lut[j+1]) + (0.0722 * lut[j+2]);
		if (y < yMin) {
			yMin = y;
		}
		if (y > yMax) {
			yMax = y;
		}
	}
	if (yMin < 0) {
		yMin = 0;
	}
	if (yMax > 1) {
		yMax = 1;
	}
	var yScale = 1/(yMax - yMin);
	var h = new Uint8Array(64);
	this.header(h, Math.round(yMin*255), Math.round(yMax*255), info);
	var p = new Uint8Array(58);
	p[0] = 18;
	var k = 0;
	var i = 0;
	for (var j=0; j<18; j++) {
		i = j * 15;
		p[k+1] = i;
		p[k+2] = Math.min(255,Math.max(0,Math.round(((
			(0.2126 * (lut[ (i*3) ])) +
			(0.7152 * (lut[(i*3)+1])) +
			(0.0722 * (lut[(i*3)+2]))
		)-yMin)*yScale*255)));
		k += 2;
	}
	var d = new Uint8Array(512);
	k=0;
	for (var j=0; j<m; j += 3) {
		d.set(this.beShort(Math.min(32767,Math.max(0,Math.round((
			(0.2126 * lut[ j ]) +
			(0.7152 * lut[j+1]) +
			(0.0722 * lut[j+2])
		)*32767)))),k);
		k += 2;
	}
	var out = new Uint8Array(h.length + p.length + d.length + 4);
	out.set(h);
	out.set(p,h.length);
	out.set(d,h.length + p.length);
	var bank;
	if (info.nikonBank < 10) {
		bank = '0' + info.nikonBank.toString();
	} else {
		bank = info.nikonBank.toString();
	}
	return {
		lut: out,
		fileName: 'PICCON' + bank,
		ext: 'NCP'
	};
};
ncpLUT.prototype.header = function(out, yMin, yMax, info) {
	var t = new Uint32Array(out.buffer);
	var s = new Uint16Array(out.buffer);
	var k = 0;
// Signature - hex codes for padded 'NCP' in 32-bit big endian
	out.set(this.beWord(0x4E435000),k);
	k += 4;
// First block head
	out.set(this.beWord(1),k);					// Block of data number 1
	k += 4;
	out.set(this.beWord(36),k); 				// Size of this block
	k += 4;
// Data
	this.beString('0100',out,k);				// Version
	k += 4;
	var title = info.name;
	if (title.length > 20) {
		title = title.substr(0,20);
	} else if (title.length === 0) {
		title = 'LUTCalc';
	}
	this.beString(title,out,k);					// Title
	k += 20;
	var profile = 2;
	var m = this.profileName.length;
	for (var j=0; j<m; j++) {
		if (info.inGammaName === this.profileName[j]) {
			profile = j;
			break;
		}
	}
	out.set(this.beShort(this.profileCode[profile]),k);	// Nikon profile code
	k += 2;
	out.set(this.beShort(0x02FF),k);			// Tell camera that the values have been modified
	k += 2;
	out[k] = info.nikonSharp + 0x80;			// Sharpening 0
	k++;
	out[k] = 1;									// Use LUT table for contrast
	k++;
	out[k] = 1;									// Use LUT table for brightness
	k++;
	out[k] = info.nikonSat + 0x80;				// Saturation 0
	k++;
	out[k] = info.nikonHue + 0x80;				// Hue 0
	k++;
	out[k] = 0xFF;								// Monochrome Filter N/A
	k++;
	out[k] = 0xFF;								// Monochrome Toning N/A
	k++;
	out[k] = 0xFF;								// Monochrome Toning Strength N/A
	k++;
// Second block head
	out.set(this.beWord(2),k);					// Block of data number 2
	k += 4;
	out.set(this.beWord(578),k); 				// Size of this block
	k += 4;
// Data
	out[k] = 0x49;								// ** Got to find out what these ones mean - 'I'? **
	k++;
	out[k] = 0x30;								// ** As above - '0'? **
	k++;
	out[k] = 0;									// Input Black = 0
	k++;
	out[k] = 0xFF;								// Input White = 255
	k++;
	out[k] = yMin;								// Output Black = lowest value in LUT data * 255
	k++;
	out[k] = yMax;								// Output White = highest value in LUT data * 255
	k++;
	out[k] = 1;									// Gamma value integer part (halftone point) - keep it simple!
	k++;
	out[k] = 0;									// Gamma value decimal part (halftone point)
	k++;
// The rest is the polynomial table (compressed LUT) and full 255-point LUT so return the header
	return out;
};
ncpLUT.prototype.beWord = function(input) {
// Turn values into 4-byte big-endian words
	var t = new Uint32Array([input]);
	var e = new Uint8Array(t.buffer);
	if (this.isLE) {
		return new Uint8Array([e[3],e[2],e[1],e[0]]);
	} else {
		return e;
	}
};
ncpLUT.prototype.beShort = function(input) {
// Turn values into 16-bit big-endian short
	var t = new Uint16Array([input]);
	var e = new Uint8Array(t.buffer);
	if (this.isLE) {
		return new Uint8Array([e[1],e[0]]);
	} else {
		return e;
	}
};
ncpLUT.prototype.beString = function(text,out,idx) {
	var m = text.length;
	for (var j=0; j<m; j++) {
		out[idx + j] = text.charCodeAt(j);
	}
};
