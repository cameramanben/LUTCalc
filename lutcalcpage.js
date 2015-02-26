var firefoxApp = document.getElementById('firefox-app');
firefoxApp.onclick = function() {
	var manifestUrl = 'https://cameramanben.github.io/LUTCalc/manifest.webapp';
	var req = navigator.mozApps.installPackage(manifestUrl);
	req.onsuccess = function() {
		alert(this.result.origin);
	};
	req.onerror = function() {
		alert(this.error.name);
	};
}
