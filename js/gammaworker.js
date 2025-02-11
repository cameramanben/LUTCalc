var lutGammaWorker;
if (typeof importScripts === 'function') {
	importScripts('gammaworkerscripts.min.js');
	lutGammaWorker = new LUTGammaWorker();
}