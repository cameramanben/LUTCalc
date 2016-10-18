var lutGammaWorker;
if (typeof importScripts === 'function') {
	importScripts('gamma.js','lut.js');
	lutGammaWorker = new LUTGammaWorker();
}