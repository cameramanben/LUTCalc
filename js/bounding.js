/* bounding.js
* Bounding Box objects for the LUTCalc Web App.
* 10th June 2016
*
* LUTCalc generates 1D and 3D Lookup Tables (LUTs) for video cameras that shoot log gammas, 
* principally the Sony CineAlta line.
*
* By Ben Turley, http://turley.tv
* First License: GPLv2
* Github: https://github.com/cameramanben/LUTCalc
*/
function Bound(baseMatrix,boxList) {
	this.b = baseMatrix;
	this.l = boxList;
}
Bound.prototype.lc = function(pBuff) {
	var p = new Float64Array(pBuff);
	var m = Math.round(p.length)/3;
	var m2 = this.l.length;
	var rgb;
	var r1,r2;
	var R,G,B;
	var mat = new Float64Array(11);
	var mat2 = new Float64Array(11);
	var buff = mat2.buffer;
	for (var j=0; j<m; j++) {
		rgb = p.subarray(j*3,3);
		mat[0] = 0;
		mat[1] = 0;
		mat[2] = 0;
		mat[3] = 0;
		mat[4] = 0;
		mat[5] = 0;
		mat[6] = 0;
		mat[7] = 0;
		mat[8] = 0;
		mat[9] = 0;
		mat[10] = 0;
		for (var k=0; k<m2; k++) {
			mat2[0] = 0;
			mat2[1] = 0;
			mat2[2] = 0;
			mat2[3] = 0;
			mat2[4] = 0;
			mat2[5] = 0;
			mat2[6] = 0;
			mat2[7] = 0;
			mat2[8] = 0;
			mat2[9] = 0;
			mat2[10] = 0;
			this.l[k].lc(buff,1,rgb);
			if (mat2[9] > 0) { // If point is in the bounding box, add to the total
				mat[0] += mat2[0];
				mat[1] += mat2[1];
				mat[2] += mat2[2];
				mat[3] += mat2[3];
				mat[4] += mat2[4];
				mat[5] += mat2[5];
				mat[6] += mat2[6];
				mat[7] += mat2[7];
				mat[8] += mat2[8];
				mat[9] += mat2[9];
				mat[10] += mat2[10];
			}
		}
		if (mat[9] > 0) {
			if (mat[10] > 0) {
				r1 = mat[9] / (mat[9] + mat[10]);
				r2 = mat[10] / (mat[9] + mat[10]);
				mat[0] = (r1*mat[0])+(r2*this.b[0]);
				mat[1] = (r1*mat[1])+(r2*this.b[1]);
				mat[2] = (r1*mat[2])+(r2*this.b[2]);
				mat[3] = (r1*mat[3])+(r2*this.b[3]);
				mat[4] = (r1*mat[4])+(r2*this.b[4]);
				mat[5] = (r1*mat[5])+(r2*this.b[5]);
				mat[6] = (r1*mat[6])+(r2*this.b[6]);
				mat[7] = (r1*mat[7])+(r2*this.b[7]);
				mat[8] = (r1*mat[8])+(r2*this.b[8]);
			} else {
				mat[0] /= mat[9];
				mat[1] /= mat[9];
				mat[2] /= mat[9];
				mat[3] /= mat[9];
				mat[4] /= mat[9];
				mat[5] /= mat[9];
				mat[6] /= mat[9];
				mat[7] /= mat[9];
				mat[8] /= mat[9];
			}
			R = rgb[0];
			G = rgb[1];
			B = rgb[2];
			rgb[0] = (mat[0]*R) + (mat[1]*G) + (mat[2]*B);
			rgb[1] = (mat[3]*R) + (mat[4]*G) + (mat[5]*B);
			rgb[2] = (mat[6]*R) + (mat[7]*G) + (mat[8]*B);
		} else { // Apply the base matrix
			R = rgb[0];
			G = rgb[1];
			B = rgb[2];
			rgb[0] = (this.b[0]*R) + (this.b[1]*G) + (this.b[2]*B);
			rgb[1] = (this.b[3]*R) + (this.b[4]*G) + (this.b[5]*B);
			rgb[2] = (this.b[6]*R) + (this.b[7]*G) + (this.b[8]*B);
		}
	}
};
function BoundBase() {
	this.mat = false;
}
BoundBase.prototype.lc = function(buff,rat,rgb) {
	if (typeof rat === "number" && rat > 0) {
		var mat = new Float64Array(buff);
		mat[10] += Math.min(1,rat);
	}
};
function BoundNull() {
	this.mat = false;
}
BoundNull.prototype.lc = function(buff,rat,rgb) {
	if (typeof rat === "number" && rat > 0) {
		var mat = new Float64Array(buff);
		mat[10] += Math.min(1,rat);
	}
};
function BoundMatrix(matrix,idx) {
	this.mat = matrix;
}
BoundMatrix.prototype.lc = function(buff,rat,rgb) {
	var mat = new Float64Array(buff);
	if (typeof rat !== "number" || rat >= 1) {
		mat[0] = this.mat[0];
		mat[1] = this.mat[1];
		mat[2] = this.mat[2];
		mat[3] = this.mat[3];
		mat[4] = this.mat[4];
		mat[5] = this.mat[5];
		mat[6] = this.mat[6];
		mat[7] = this.mat[7];
		mat[8] = this.mat[8];
		mat[9] += 1;
	} else {
		mat[0] = this.mat[0]*rat;
		mat[1] = this.mat[1]*rat;
		mat[2] = this.mat[2]*rat;
		mat[3] = this.mat[3]*rat;
		mat[4] = this.mat[4]*rat;
		mat[5] = this.mat[5]*rat;
		mat[6] = this.mat[6]*rat;
		mat[7] = this.mat[7]*rat;
		mat[8] = this.mat[8]*rat;
		mat[9] += rat;
	}
};
function BoundLine(overMatrix,underMatrix,xAxis,yAxis,width,a,b) {
	this.o = overMatrix;
	this.u = underMatrix;
	if (typeof xAxis === "string") {
		xAxis = xAxis.substr(0,1).toLowerCase();
		switch(xAxis) {
			case "r":	this.x = 0;
						break;
			case "g":	this.x = 1;
						break;
			case "b":	this.x = 2;
			break;
		}
	} else if (typeof xAxis === "number" && xAxis <= 2 && xAxis >= 0) {
		this.x = Math.round(xAxis);
	} else {
		this.x = 0;
	}
	if (typeof yAxis === "string") {
		yAxis = yAxis.substr(0,1).toLowerCase();
		switch(yAxis) {
			case "r":	this.y = 0;
						break;
			case "g":	this.y = 1;
						break;
			case "b":	this.y = 2;
			break;
		}
	} else if (typeof yAxis === "number" && yAxis <= 2 && xAxis >= 0) {
		this.y = Math.round(yAxis);
	} else {
		this.y = 1;
	}
	if (width > 0) {
		this.w = Math.abs(width);
		this.f = this.w/2;
	} else {
		this.w = false;
		this.f = false;
	}
	this.a = a;
	this.b = b;
}
BoundLine.prototype.lc = function(buff,rat,rgb) {
	if (rat > 0) {
		var Y = (this.a*rgb[this.x]) + this.b;
		if (this.w) {
			if (rgb[this.y] <= Y - this.f) {
				if (rat >= 1) {
					this.u.lc(buff);
				} else {
					this.u.lc(buff,rat);
				}
			} else if (rgb[this.y] > Y + this.f) {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			} else {
				var r = (rgb[this.y] - Y + this.f) / this.w;
				if (rat >= 1) {
					this.u.lc(buff,1-r);
					this.o.lc(buff,r);
				} else {
					this.u.lc(buff,(1-r)*rat);
					this.o.lc(buff,r*rat);
				}
			}
		} else {
			if (rgb[this.y] <= Y) {
				if (rat >= 1) {
					this.u.lc(buff);
				} else {
					this.u.lc(buff,rat);
				}
			} else {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			}
		}
	}
};
function BoundParabolic(overMatrix,underMatrix,xAxis,yAxis,width,a,b,c) {
	this.o = overMatrix;
	this.u = underMatrix;
	if (typeof xAxis === "string") {
		xAxis = xAxis.substr(0,1).toLowerCase();
		switch(xAxis) {
			case "r":	this.x = 0;
						break;
			case "g":	this.x = 1;
						break;
			case "b":	this.x = 2;
			break;
		}
	} else if (typeof xAxis === "number" && xAxis <= 2 && xAxis >= 0) {
		this.x = Math.round(xAxis);
	} else {
		this.x = 0;
	}
	if (typeof yAxis === "string") {
		yAxis = yAxis.substr(0,1).toLowerCase();
		switch(yAxis) {
			case "r":	this.y = 0;
						break;
			case "g":	this.y = 1;
						break;
			case "b":	this.y = 2;
			break;
		}
	} else if (typeof yAxis === "number" && yAxis <= 2 && xAxis >= 0) {
		this.y = Math.round(yAxis);
	} else {
		this.y = 1;
	}
	if (width > 0) {
		this.w = Math.abs(width);
		this.f = this.w/2;
	} else {
		this.w = false;
		this.f = false;
	}
	this.a = a;
	this.b = b;
	this.c = c;
}
BoundParabolic.prototype.lc = function(buff,rat,rgb) {
	if (rat > 0) {
		var Y = (this.a*rgb[this.x]*rgb[this.x]) + (this.b*rgb[this.x]) + this.c;
		if (this.w) {
			if (rgb[this.y] <= Y - this.f) {
				if (rat >= 1) {
					this.u.lc(buff);
				} else {
					this.u.lc(buff,rat);
				}
			} else if (rgb[this.y] > Y + this.f) {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			} else {
				var r = (rgb[this.y] - Y + this.f) / this.w;
				if (rat >= 1) {
					this.u.lc(buff,1-r);
					this.o.lc(buff,r);
				} else {
					this.u.lc(buff,(1-r)*rat);
					this.o.lc(buff,r*rat);
				}
			}
		} else {
			if (rgb[this.y] <= Y) {
				if (rat >= 1) {
					this.u.lc(buff);
				} else {
					this.u.lc(buff,rat);
				}
			} else {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			}
		}
	}
};
function BoundCubic(overMatrix,underMatrix,xAxis,yAxis,width,a,b,c,d) {
	this.o = overMatrix;
	this.u = underMatrix;
	if (typeof xAxis === "string") {
		xAxis = xAxis.substr(0,1).toLowerCase();
		switch(xAxis) {
			case "r":	this.x = 0;
						break;
			case "g":	this.x = 1;
						break;
			case "b":	this.x = 2;
			break;
		}
	} else if (typeof xAxis === "number" && xAxis <= 2 && xAxis >= 0) {
		this.x = Math.round(xAxis);
	} else {
		this.x = 0;
	}
	if (typeof yAxis === "string") {
		yAxis = yAxis.substr(0,1).toLowerCase();
		switch(yAxis) {
			case "r":	this.y = 0;
						break;
			case "g":	this.y = 1;
						break;
			case "b":	this.y = 2;
			break;
		}
	} else if (typeof yAxis === "number" && yAxis <= 2 && xAxis >= 0) {
		this.y = Math.round(yAxis);
	} else {
		this.y = 1;
	}
	if (width > 0) {
		this.w = Math.abs(width);
		this.f = this.w/2;
	} else {
		this.w = false;
		this.f = false;
	}
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
}
BoundCubic.prototype.lc = function(buff,rat,rgb) {
	if (rat > 0) {
		var Y = (this.a*rgb[this.x]*rgb[this.x]*rgb[this.x]) + (this.b*rgb[this.x]*rgb[this.x]) + (this.c*rgb[this.x]) + this.d;
		if (this.w) {
			if (rgb[this.y] <= Y - this.f) {
				if (rat >= 1) {
					this.u.lc(buff);
				} else {
					this.u.lc(buff,rat);
				}
			} else if (rgb[this.y] > Y + this.f) {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			} else {
				var r = (rgb[this.y] - Y + this.f) / this.w;
				if (rat >= 1) {
					this.u.lc(buff,1-r);
					this.o.lc(buff,r);
				} else {
					this.u.lc(buff,(1-r)*rat);
					this.o.lc(buff,r*rat);
				}
			}
		} else {
			if (rgb[this.y] <= Y) {
				if (rat >= 1) {
					this.u.lc(buff);
				} else {
					this.u.lc(buff,rat);
				}
			} else {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			}
		}
	}
};
function BoundPlane(insideMatrix,outsideMatrix,axis,value,width,feather) {
	this.i = insideMatrix;
	this.o = outsideMatrix;
	if (typeof axis === "string") {
		axis = axis.substr(0,1).toLowerCase();
		switch(axis) {
			case "r":	this.x = 0;
						break;
			case "g":	this.x = 1;
						break;
			case "b":	this.x = 2;
			break;
		}
	} else if (typeof axis === "number" && axis <= 2 && axis >= 0) {
		this.x = Math.round(axis);
	} else {
		this.x = 0;
	}
	width = Math.abs(width);
	this.h = value + (width/2);
	this.l = value - (width/2);
	if (typeof feather === "number" && feather > 0) {
		this.f = feather;
		this.h2 = this.h + this.f;
		this.l2 = this.l - this.f;
	} else {
		this.f = false;
	}
}
BoundPlane.prototype.lc = function(buff,rat,rgb) {
	if (rat > 0) {
		if (rgb[this.x] > this.l && rgb[this.x] < this.h) { // within the bounding plane
			if (rat >= 1) {
				this.i.lc(buff);
			} else {
				this.i.lc(buff,rat);
			}
		} else if (this.f) {
			if (rgb[this.x] > this.l2 && rgb[this.x] < this.h2) { // within the feather
				var r = Math.min(rgb[this.x]-this.l2, this.h2-rgb[this.x]);
				r /= this.f;
				this.i.lc(buff,(1-r)*rat);
				this.o.lc(buff,r*rat);
			} else {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			}
		} else {
			if (rat >= 1) {
				this.o.lc(buff);
			} else {
				this.o.lc(buff,rat);
			}
		}
	}
};
function BoundSphere(insideMatrix,outsideMatrix,point,radius,feather) {
	this.i = insideMatrix;
	this.o = outsideMatrix;
	this.p = point;
	this.r = radius;
	this.r2 = radius*radius;
	if (typeof feather === "number" && feather > 0) {
		this.f = feather;
		this.f2 = (feather + radius) * (feather + radius);
	} else {
		this.f = false;
	}
}
BoundSphere.prototype.lc = function(buff,rat,rgb) {
	if (rat > 0) {
		var d2 = ((rgb[0]-this.p[0])*(rgb[0]-this.p[0])) + ((rgb[1]-this.p[1])*(rgb[1]-this.p[1])) + ((rgb[2]-this.p[2])*(rgb[2]-this.p[2]));
		if (d2 < this.r2) { // within the bounding sphere
			if (rat >= 1) {
				this.i.lc(buff);
			} else {
				this.i.lc(buff,rat);
			}
		} else if (this.f) {
			if (d2 < this.f2) { // within the feather
				var r = (Math.sqrt(d2)-this.r)/this.f;
				this.i.lc(buff,(1-r)*rat);
				this.o.lc(buff,r*rat);
			} else {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			}
		} else {
			if (rat >= 1) {
				this.o.lc(buff);
			} else {
				this.o.lc(buff,rat);
			}
		}
	}
};
function BoundBox(insideMatrix,outsideMatrix,minPoint,maxPoint,feather) {
	this.i = insideMatrix;
	this.o = outsideMatrix;
	this.p1 = minPoint;
	this.p2 = maxPoint;
	if (typeof feather === "number" && feather > 0) {
		this.f = feather;
		this.f1 = new Float64Array([this.p1[0] - this.f, this.p1[1] - this.f,this.p1[2] - this.f]);
		this.f2 = new Float64Array([this.p2[0] + this.f, this.p2[1] + this.f,this.p2[2] + this.f]);
	} else {
		this.f = false;
		this.d = new Float64Array(3);
	}
}
BoundBox.prototype.lc = function(buff,rat,rgb) {
	if (rat > 0) {
		if (
			rgb[0] >= this.p1[0] && rgb[0] <= this.p2[0] &&
			rgb[1] >= this.p1[1] && rgb[1] <= this.p2[1] &&
			rgb[2] >= this.p1[2] && rgb[2] <= this.p2[2]
		) { // within the bounding box
			if (rat >= 1) {
				this.i.lc(buff);
			} else {
				this.i.lc(buff,rat);
			}
		} else if (this.f) {
			if (
				rgb[0] >= this.f1[0] && rgb[0] <= this.f2[0] &&
				rgb[1] >= this.f1[1] && rgb[1] <= this.f2[1] &&
				rgb[2] >= this.f1[2] && rgb[2] <= this.f2[2]
			) { // within the feather
				this.d[0] = Math.max(this.p1[0]-rgb[0], 0, rgb[0]-this.p2[0]);
				this.d[1] = Math.max(this.p1[1]-rgb[1], 0, rgb[1]-this.p2[1]);
				this.d[2] = Math.max(this.p1[2]-rgb[2], 0, rgb[2]-this.p2[2]);
				var r = Math.sqrt((this.d[0]*this.d[0])+(this.d[1]*this.d[1])+(this.d[2]*this.d[2]))/this.f;
				this.i.lc(buff,(1-r)*rat);
				this.o.lc(buff,r*rat);
			} else {
				if (rat >= 1) {
					this.o.lc(buff);
				} else {
					this.o.lc(buff,rat);
				}
			}
		} else {
			if (rat >= 1) {
				this.o.lc(buff);
			} else {
				this.o.lc(buff,rat);
			}
		}
	}
};
