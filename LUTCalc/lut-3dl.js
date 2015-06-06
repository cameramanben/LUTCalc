/* lut-3dl.js
* .3dl LUT building / parsing for the LUTCalc Web App.
* 3rd June 2015
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function threedlLUT(messages, isLE) {
	this.messages = messages;
	this.isLE = isLE;
}
threedlLUT.prototype.build = function(buff) {
}
threedlLUT.prototype.header = function() {
}
threedlLUT.prototype.parse = function(title, text, lut) {
}
