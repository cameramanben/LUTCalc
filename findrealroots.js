/* findrealroots.js
* Finds real root values for a function / data set using
* Chebyshev polynomials as an approximation
*
* 6th February 2015
*
* Javascript object based on the 'FindRealRoots' Matlab function
* ( http://uk.mathworks.com/matlabcentral/fileexchange/15122-real-roots-on-interval/content/FindRealRoots.m )
* by Stephen Morris, Nightingale-EOS Ltd., St. Asaph, Wales.
*
* Also uses implements 'chebft' from Numerical Recipes in C / Fortran 90 / BASIC section 5.6
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
*/
function FindRealRoots(func, a, b, N) {
	this.func = func;		// Object providing function / data set for analysis - requires a method 'f' which supplies f(x)
	this.setRange(a,b);
	this.setN(N);
}
FindRealRoots.prototype.setRange = function(a,b) {
	this.a = a;			// For f(x), minimum value of x
	this.b = b;			// For f(x), maximum value of x
	this.bma = 0.5*(b-a);
	this.bpa = 0.5*(b+a);
	if (typeof this.N !== 'undefined') {
		for (var j=0; j<N; j++) {
			this.f[j] = this.func.f((Math.cos(Math.PI*(k+0.5)/N)*this.bma)+this.bpa);
		}
	}
}
FindRealRoots.prototype.setN = function(N) {
	this.N = N;			// Degree of the Chebyshev polynomials
	this.f = new Float64Array(this.N);
	this.c = new Float64Array(this.N);
	this.y = new Float64Array(this.N);
	for (var j=0; j<N; j++) {
		this.f[j] = this.func.f((Math.cos(Math.PI*(k+0.5)/N)*this.bma)+this.bpa);
	}
}
FindRealRoots.prototype.findRoot = function(I,O) { // Public single root method, O is the f(x) to match to if not zero (root), finds closest root to I
	if (typeof O === 'number') {
		this.o = O;
	} else {
		this.o = 0;
	}
	var roots = this.findRealRoots();
	var max = roots.length;
	var r = 9999;
	for (var j=0; j<max; j++) {
		if (Math.abs(roots[j]-I) < Math.abs(r - I)) {
			r = roots[j];
		}
	}
	return r;
}
FindRealRoots.prototype.findRoots = function(O) { // Public multiple root root method, O is the f(x) to match to if not zero (root)
	if (typeof O === 'number') {
		this.o = O;
	} else {
		this.o = 0;
	}
	return this.findRealRoots();
}
FindRealRoots.prototype.findRealRoots = function() {
	this.chebft();
	var dim = this.N-1;
	var A = new Float64Array(dim*dim); // dim x dim matrix expressed as a 1D strided typed array for speed
	// A(Row,Column) in Matlab, so A[(Row*dim)+Column] in JS typed array
	A[0 + 1] = 1;
	// Build Frobenius-Chebyshev companion matrix
	for (var j=1; j<(dim-1); j++) {
		for (var k=0; k<dim; k++) {
			if (j === (k+1) || j === (k-1)) {
				A[(j*dim) + k] = 0.5;
			}
		}
	}
	var cn = this.c[dim];
	for (var k=0; k<dim; k++) {
		A[(dim*dim) + k] = -this.c[k]/(2*cn);
	}
	A[(dim*dim) + (dim-1)] += 0.5;
	// Find Eigenvalues
	var eig = this.eigenValues(A,dim);
}
FindRealRoots.prototype.eigenValues = function(M,n) {
}
FindRealRoots.prototype.chebft = function() {
	var N = this.N;
	var o = this.o;
	for (var j=0; j<N; j++) {
		var sum = 0;
		for (var k=0; k<N; k++) {
			sum += (this.f[k] - o)*Math.cos(Math.PI*j*(k+0.5)/N);
		}
		this.c[j] = sum*2/N;
	}
	c[0] = c[0]/2; // check this
}
FindRealRoots.prototype.test = function() {
	var dim = 100;
	var N = this.c.length;
	var x = new Float64Array(dim);
	var f = new Float64Array(dim);
	var cheb = new Float64Array(dim);
	var error = new Float64Array(dim);
	var sv,d,dd;
	var RMS = 0;
	for (var j=0; j<dim; j++) {
		x[j] = ((this.b-this.a)*(j/(dim-1)))+this.a;
		var y=(2.0*x[j]-a-b)/(b-a);
		var y2=2*y;
		d=0;
		dd=0;
		for (var k=N-1; k>=1; k--) {
			sv=d;
			d=(y2*d)-dd+this.c[k];
			dd=sv;
		}
		f[j] = this.func.f(x[j]);
		cheb[j] = y*d-dd+0.5*c[0];
		error[j] = f[j]-cheb[j];
		RMS += Math.sqr(error[j]);
	}
	RMS = Math.sqrt(rms/dim);
	console.log('RMS Error: ' + RMS);
	console.log('Data Values:');
	console.log(f);
	console.log('Chebyshev Values:');
	console.log(cheb);
	console.log('Errors:');
	console.log(error);
}
