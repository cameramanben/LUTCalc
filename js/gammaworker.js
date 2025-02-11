var lutGammaWorker;
if (typeof importScripts === 'function') {
	importScripts('gammaworkerscombined.js');
	lutGammaWorker = new LUTGammaWorker();
}