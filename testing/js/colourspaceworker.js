var lutCSWorker;
if (typeof importScripts === 'function') {
	importScripts('colourspaceworkerscombined.js');
	lutCSWorker = new LUTCSWorker();
}