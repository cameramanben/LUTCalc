window.onload = function() {
	var tocAbout = document.getElementById('toc-about');
	var tocInstall = document.getElementById('toc-install');
	var tocHowTo = document.getElementById('toc-howto');
	var tocFeatures = document.getElementById('toc-features');
	var tocFAQ = document.getElementById('toc-faq');
	var tocTechLinks = document.getElementById('toc-tech-links');

	tocAbout.removeAttribute('href');
	tocInstall.removeAttribute('href');
	tocHowTo.removeAttribute('href');
	tocFeatures.removeAttribute('href');
	tocFAQ.removeAttribute('href');
	tocTechLinks.removeAttribute('href');

	var secAbout = document.getElementById('about');
	var secInstall = document.getElementById('install');
	var secHowTo = document.getElementById('howto');
	var secFeatures = document.getElementById('features');
	var secFAQ = document.getElementById('faq');
	var secTechLinks = document.getElementById('tech-links');

	function showAbout() {
		secAbout.style.display = 'block';
		secInstall.style.display = 'none';
		secHowTo.style.display = 'none';
		secFeatures.style.display = 'none';
		secFAQ.style.display = 'none';
		secTechLinks.style.display = 'none';
	}
	function showInstall() {
		secAbout.style.display = 'none';
		secInstall.style.display = 'block';
		secHowTo.style.display = 'none';
		secFeatures.style.display = 'none';
		secFAQ.style.display = 'none';
		secTechLinks.style.display = 'none';
	}
	function showHowTo() {
		secAbout.style.display = 'none';
		secInstall.style.display = 'none';
		secHowTo.style.display = 'block';
		secFeatures.style.display = 'none';
		secFAQ.style.display = 'none';
		secTechLinks.style.display = 'none';
	}
	function showFeatures() {
		secAbout.style.display = 'none';
		secInstall.style.display = 'none';
		secHowTo.style.display = 'none';
		secFeatures.style.display = 'block';
		secFAQ.style.display = 'none';
		secTechLinks.style.display = 'none';
	}
	function showFAQ() {
		secAbout.style.display = 'none';
		secInstall.style.display = 'none';
		secHowTo.style.display = 'none';
		secFeatures.style.display = 'none';
		secFAQ.style.display = 'block';
		secTechLinks.style.display = 'none';
	}
	function showTechLinks() {
		secAbout.style.display = 'none';
		secInstall.style.display = 'none';
		secHowTo.style.display = 'none';
		secFeatures.style.display = 'none';
		secFAQ.style.display = 'none';
		secTechLinks.style.display = 'block';
	}

	tocAbout.onclick = function(){ showAbout(); };
	tocInstall.onclick = function(){ showInstall(); };
	tocHowTo.onclick = function(){ showHowTo(); };
	tocFeatures.onclick = function(){ showFeatures(); };
	tocFAQ.onclick = function(){ showFAQ(); };
	tocTechLinks.onclick = function(){ showTechLinks(); };

	document.getElementById('about-1').removeAttribute('href');
	document.getElementById('about-1').onclick = function(){ showFeatures(); };

	showAbout();
}