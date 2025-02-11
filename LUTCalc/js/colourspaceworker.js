var lutCSWorker;
if (typeof importScripts === 'function') {
	importScripts('colourspaceworkerscripts.min.js');
	lutCSWorker = new LUTCSWorker();
}