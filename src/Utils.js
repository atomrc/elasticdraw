/****************************************** 
	MATH / GRAPHICS 
******************************************/
var cos_pi3 = 0.5;
var sin_pi3 = Math.sin(Math.PI/3);


function GPoint(x, y) {
	this.x = x;
	this.y = y;
}
GPoint.prototype = {
	x:0,
	y:0,
	
	getVector:function(point) {
		return new GVector(this.x - point.x, this.y - point.y);
	}	
}


function GVector(dx, dy) {
	this.dx = dx; 
	this.dy = dy;
}
GVector.prototype = {
	dx:0,
	dy:0,
	
	//Apply the vector to the point 
	applyToPoint:function(point) {
		point.x += this.dx;
		point.y += this.dy;
	},
	
	addToVector:function(vect) {
		vect.dx += this.dx;
		vect.dy += this.dy;	
		vect.minifyPrecision();
	},
	
	multToVector:function(vect) {
		vect.dx *= this.dx;
		vect.dy *= this.dy;	
		vect.minifyPrecision();
	},
	
	addVector:function(vect) {
		this.dx += vect.dx;
		this.dy += vect.dy;	
		this.minifyPrecision();
	},
	
	
	multVector:function(vect) {
		this.dx *= vect.dx;
		this.dy *= vect.dy;	
		this.minifyPrecision();
	},
	
	minifyPrecision:function() {
		this.dx = parseFloat(this.dx.toFixed(floatPrecision));
		this.dy = parseFloat(this.dy.toFixed(floatPrecision));
	},
	
	//create a new vector by adding values of the current vector and the vector "vect"
	getAddedVector:function(vect) {
		return new GVector(parseFloat((this.dx + vect.dx).toPrecision(floatPrecision)), parseFloat((this.dy + vect.dy).toPrecision(floatPrecision)));
	},

	//create a new vector by multipling values of the current vector and the vector "vect"
	getMultVector:function(vect) {
		return new GVector(parseFloat((this.dx * vect.dx).toPrecision(floatPrecision)), parseFloat((this.dy * vect.dy).toPrecision(floatPrecision)));
	},
}

/****************************************** 
	UTILS 
******************************************/

if (!Function.prototype.bind) {

  Function.prototype.bind = function (oThis) {

    if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));    
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;

  };

}

function removeFromArray(array, obj) {
	var index = array.indexOf(obj);
	if(index != -1) {
		array.splice(index, 1);
	}
}

//simple wraper of the requestAnimationFrame method
window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
	      window.mozRequestAnimationFrame    || 
	      window.oRequestAnimationFrame      || 
	      window.msRequestAnimationFrame     || 
	      function(/* function */ callback, /* DOMElement */ element){
	      window.setTimeout(callback, 1000 / 60);
	};
})();

//simple wraper for the AJAX requests
function getXmlHttpRequest() {
	var xhr_object = null;

	if(window.XMLHttpRequest) // Firefox
		xhr_object = new XMLHttpRequest();
	else if(window.ActiveXObject) // Internet Explorer
   		xhr_object = new ActiveXObject("Microsoft.XMLHTTP");
	else  // XMLHttpRequest non supporté par le navigateur
   		alert("Votre navigateur ne supporte pas les objets XMLHTTPRequest...");
	
   	return xhr_object;;
}


