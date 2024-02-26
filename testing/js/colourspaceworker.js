var lutCSWorker;
if (typeof importScripts === 'function') {
	importScripts('colourspace.js','lut.js','ring.js','brent.js');
	lutCSWorker = new LUTCSWorker();
}