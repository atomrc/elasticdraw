/****************************************** 
	VIEWS 
******************************************/

function Path() {
	this.lines = [];
}
Path.prototype = {
	color:"black",
	width:1,
	lines:[],
	continuousLines:true,
	
	addLine:function(line) {
		if(this.lines.length == 2) {
			this.lines[0] = this.lines[1];
			this.lines[1] = line;
		} else {
			this.lines.push(line);
		}
	},	

	drawInContext:function(context) {
		context.strokeStyle = this.color;
		context.fillStyle = this.color;
		context.lineWidth = this.width;
		context.lineJoin = "round";
		context.beginPath();
		if(this.lines.length != 0) {
			var firstLine = this.lines[0];
			context.moveTo(firstLine.start.x, firstLine.start.y);
		}
		if(this.continuousLines) {
			this.drawContinuousLines(context);
		}else{
			this.drawDottedLines(context);
		}
	},

	drawContinuousLines:function(context) {
		for(var li in this.lines) {
			var line = this.lines[li];
			context.lineTo(line.end.x, line.end.y);
		}
		context.stroke();
	},

	drawDottedLines:function(context) {
			var line = this.lines[0];
			context.moveTo(line.end.x, line.end.y);
			context.arc(line.end.x, line.end.y, Math.floor(this.width/2), PI_2, 0);
			context.fill();
	}
}

function Line(start, end) {
	this.start = start;
	this.end = end;
}	
Line.prototype = {
	start:null, 	//the starting point of the line 
	end:null, 	//the end point of the line
}


function Elastic(size, start, object) {
	this.size = size;
	this.start = start;
	this.object = object;
	this.strengthVector = new GVector(0, 0);
}
Elastic.prototype = {
	size:0,
	start:null,
	object:null,
	strengthVector:null,
	elasticity:0.05,

	update:function() {
		this.object.update();
		
		var height = this.getHeight();
		var width = this.getWidth();
			
		var currentSize = this.getCurrentSize();
		var dif =  Math.max(0, currentSize - this.size);
		var bounce = this.elasticity * dif;

		var cos = currentSize != 0 ?  Math.abs(width / currentSize) : 0;
		var sin = currentSize != 0 ? Math.abs(height / currentSize) : 0;
		
		cos = width <= 0 ? -cos :  cos;
		sin = height <= 0 ? -sin : sin;

		this.strengthVector.dx = cos * bounce;
		this.strengthVector.dy = bounce * sin;

		this.object.speedVector.addVector(this.strengthVector);
		this.object.speedVector.multVector(speedDown);
	
	},

	isStable:function() {
		var seuil = 0.00001;
		var compVect = this.strengthVector.getAddedVector(gravity);
		return Math.pow(compVect.dx, 2) < seuil && Math.pow(compVect.dy, 2) < seuil;
	},

	drawInContext:function(context) {
		var objCenter = this.object.getCenter();
		context.beginPath();
		context.moveTo(this.start.x, this.start.y);
		context.lineTo(objCenter.x, objCenter.y);
		context.stroke();
	},
	
	//returns the current size of the link 
	getCurrentSize:function() {
		return Math.sqrt(Math.pow(this.getWidth(), 2) + Math.pow(this.getHeight(), 2));
	},
	
	//returns the width of the link (needed to compute the bouncing vector)
	getWidth:function() {
		var objPos = this.object.getCenter();
		
		return this.start.x - objPos.x;
	},

	getHeight:function() {
		var objPos = this.object.getCenter();
		
		return this.start.y - objPos.y;
		
	}
}

function Pen(position, color) {
	this.position = position;
	this.color = color;
	this.speedVector = new GVector(0, 0);
	this.id = ""+nbPens;
	nbPens++;
}
Pen.prototype = {
	color:null,	//the color of the pen
	size:4,	//the size of the pen 
	speedVector:null,
	position:null,
	delegate:null,
	continuousLines:true,

	drawInContext:function(context) {
		var center = this.getCenter();
		context.save();
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(center.x, center.y, Math.floor(this.size/2), PI_2, 0);
		context.fill();
		context.restore();
	},

	update:function() {
		this.speedVector.addVector(gravity);
		var previousPosition = this.getCenter();
		this.speedVector.applyToPoint(this.position);
		var curPosition = this.getCenter();
		if(this.delegate) {
			this.delegate.penDidMove(this, previousPosition, curPosition);
		}
	},

	getCenter:function() {
		var midSize = Math.floor(this.size/2);
		return new GPoint(this.position.x + midSize, this.position.y + midSize);
	},

	setCenter:function(point) {
		var midSize = Math.floor(this.size/2);
		point.x -= midSize;
		point.y -= midSize;
		this.position = point;
	}

}
