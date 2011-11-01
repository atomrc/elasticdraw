/*
*	htmlresume : an original way to diplay a resume
*	Thomas Belin
*/

var isPaused = false;
var animationController = null;
var drawingController = null;
var statesController = null;
var panelController = null;
var nbPens = 0;

var mainMenuDiv;
var animationContext;
var drawingContext;
var addingContext;
var addingInformationsDiv;

var welcomePensConfig = []; //the set of pens to draw the welcome screen

var gravity = new GVector(0, 0.5);
var speedDown = new GVector(0.97, 0.97);

var floatPrecision = 5;
var PI_2 = Math.PI * 2;
window.onload = init;

function init() {

	mainMenuDiv = document.getElementById("mainMenu");
	animationContext = document.getElementById("penCanvas").getContext("2d");;
	drawingContext = document.getElementById("drawingCanvas").getContext("2d");
	addingContext = document.getElementById("addingCanvas").getContext("2d");
	addingInformationsDiv = document.getElementById("addingInfos");
	panelDiv = document.getElementById("configPanelDiv");

	drawingController = new DrawingController(drawingContext);
	statesController = new ApplicationStateController();
	statesController.setMenuState();
	animationController = new AnimationController(animationContext, drawingController);
	panelController = new ConfigPanelController(panelDiv);


	document.onkeypress = statesController.onKeyPress.bind(statesController);
	addingContext.canvas.onmousemove = statesController.onMouseMove.bind(statesController);
	addingContext.canvas.onclick = statesController.onClick.bind(statesController);
};


function keyPressed(event) {
	switch(event.charCode) {
		case 112:
			isPaused = !isPaused;
	}
	if(!isPaused) {
		runAnimation();
	}
}

function initWelcomeScreenConfig() {
	var devImage = new Image();
	devImage.src = "images/devDerbyLogo.png";

	var devDerbyLogo = new Pen(new GPoint(0, 400), "transparent");
	devDerbyLogo.drawInContext = (function(context) {
		var x = this.position.x - Math.floor(devImage.width/2);
		context.drawImage(devImage, x, this.position.y);
	}).bind(devDerbyLogo);
	var ela1 = new Elastic(50, new GPoint(200, 0), devDerbyLogo);
	ela1.isStable = function() { return false; };
	ela1.drawInContext = function(context) {};
	welcomePensConfig.push(ela1);

	var tomImage = new Image();
	tomImage.src = "images/tom.png";
	
	var tomLogo = new Pen(new GPoint(700, 400), "transparent");
	tomLogo.drawInContext = (function(context) {
		var x = this.position.x - Math.floor(tomImage.width/2);
		context.drawImage(tomImage, x, this.position.y);
	}).bind(tomLogo);
	var ela2 = new Elastic(50, new GPoint(500, 0), tomLogo);
	ela2.isStable = function() { return false; };
	ela2.drawInContext = function(context) {};
	welcomePensConfig.push(ela2);

	var penColor = "#4D90FE";

	var nbPens = 11;
	var width = 570;
	var step = width/(nbPens + 1);
	var startingX = 100;
	for(var i=0; i < nbPens; i++) {
		var x = startingX + i*step;
		var backPen = new Pen(new GPoint(x, 350), penColor);
		backPen.size = 30;
		backPen.continuousLines = false;
		backPen.color = '#'+Math.floor(Math.random()*16777215).toString(16);
		var backEla = new Elastic(20, new GPoint(x, 300), backPen);
		welcomePensConfig.push(backEla);
	}

	var elaImage = new Image();
	elaImage.src = "images/elasticDraw.png";

	var elaLogo = new Pen(new GPoint(350, 0), "transparent");
	elaLogo.drawInContext = (function(context) {
		var x = this.position.x - Math.floor(elaImage.width/2);
		context.drawImage(elaImage, x, this.position.y);
	}).bind(elaLogo);
	var ela3 = new Elastic(100, new GPoint(350, 160), elaLogo);
	ela3.isStable = function() { return false; };
	ela3.drawInContext = function(context) {};
	welcomePensConfig.push(ela3);
	
	var startX = 350;
	var startY = 700;
	var elaSize = 200;
	var elaY = 450;
	var nbPens = 4;
	var xStep = 700/(nbPens+1);
	for(var i = 1; i<=nbPens; i++) {
		var elaX = xStep * i;	
		var pen = new Pen(new GPoint(startX, startY), penColor);
		pen.size = 10;
		pen.continuousLines = false;
		//pen.color = '#'+Math.floor(Math.random()*16777215).toString(16);
		var ela = new Elastic(elaSize, new GPoint(elaX, elaY), pen);
		welcomePensConfig.push(ela);
	}

	var underLineStart = 400;
	var underLine = new Pen(new GPoint(100, underLineStart + 10), penColor);
	var underEla = new Elastic(25, new GPoint(350, underLineStart), underLine);
	welcomePensConfig.push(underEla);


}	
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
		if(this.lines.length >= 2) {
			for(var li in this.lines) {
				var line = this.lines[li];
				context.lineTo(line.end.x, line.end.y);
			}
			context.stroke();
		}
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
		var seuil = 0.00008;
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
		var radius = Math.floor(this.size/2);
		var delta = radius + Math.floor(this.size /2);
		var deltaY = (delta)*sin_pi3;
		var deltaX = (delta)*cos_pi3;
		context.save();
		context.fillStyle = "orange";
		context.beginPath();
		context.moveTo(center.x - delta, center.y);
		context.lineTo(center.x - deltaX, center.y - deltaY);
		context.lineTo(center.x + deltaX, center.y - deltaY);
		context.lineTo(center.x + delta, center.y);
		context.lineTo(center.x + deltaX, center.y + deltaY);
		context.lineTo(center.x - deltaX, center.y + deltaY);
		context.closePath();
		context.fill();

		context.fillStyle = this.color;
		context.beginPath();
		context.arc(center.x, center.y, radius, PI_2, 0);
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
/****************************************** 
	CONTROLLERS
******************************************/
/* Main controller of the resume
	idContainer : the id of the DOM element that will contain the resume
 */
function AnimationController(context, drawer) {
	this.context = context;
	context.lineJoin = "round";
	context.lineCap = "round";
	this.drawer = drawer;

}
AnimationController.prototype = {
	context:null,		//the context in which the pen and the elastics are drawn
	drawer:null,
	arrayOfElastics:[],
	isRunning:false,

	launchWelcomeAnimation:function(penConfig) {
		this.arrayOfElastics = 	penConfig;
		for(var p in penConfig) {
			var ela = penConfig[p];
			ela.object.delegate = this.drawer;
		}
	},

	mainMenu:function() {
		this.pause();
		statesController.setMenuState();
	},

	resume:function() {
		this.isRunning = true;
		this.run();
	},

	run:function() {
		this.step();
		if(this.isRunning) {
			requestAnimFrame(this.run.bind(this));
		}
	},

	clear:function() {
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
		this.arrayOfElastics = [];
		if(this.drawer) {
			this.drawer.clear();
		}
	},

	pause:function() {
		this.isRunning = false;
	},

	addPen:function(elastic) {
		elastic.object.delegate = this.drawer;
		this.arrayOfElastics.push(elastic);
	},

	step:function() {
		if(this.arrayOfElastics.length > 0) {
			this.update();
			this.draw();
		}
	},

	update:function() {
		var tempArray = []; //array of elastics that are stable and will be deleted 
		for(var elaIndex in this.arrayOfElastics) {
			var elastic = this.arrayOfElastics[elaIndex];
			elastic.update();
			if(elastic.isStable()) {
				tempArray.push(elastic);
			}
		}
		for(var i in tempArray) {
			removeFromArray(this.arrayOfElastics, tempArray[i]);
		}
	},
	
	draw:function() {
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
		this.context.save();
		for(var elaIndex in this.arrayOfElastics) {
			var elastic = this.arrayOfElastics[elaIndex];
			elastic.drawInContext(this.context);
		}
		this.context.restore();

		for(var penIndex in this.arrayOfElastics) {
			var pen = this.arrayOfElastics[penIndex].object;
			pen.drawInContext(this.context);
		}

		if(this.drawer) {
			this.drawer.draw();
		}
	
	}
}


/* The controller that draw the lines in the drawing context */
function DrawingController(context) {
	this.context = context;
	context.lineJoin = "round";
	context.lineCap = "round";
}
DrawingController.prototype = {
	context:null,
	arrayOfPaths:[],

	penDidMove:function(pen, from, to) {
		var toPoint = new GPoint(to.x, to.y);
		var line = new Line(from, toPoint);
		if(!this.arrayOfPaths[pen.id]) {
			var path = new Path();
			path.color = pen.color;
			path.width = pen.size;
			path.continuousLines = pen.continuousLines;
			this.arrayOfPaths[pen.id] = path;
		}
		this.arrayOfPaths[pen.id].addLine(line);
	},

	//draw all the buffured lines in the context
	draw:function() {
	//this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
		for(var pathIndex in this.arrayOfPaths) {
	//	if(pathIndex == "1") debugger;
			var path = this.arrayOfPaths[pathIndex];
			path.drawInContext(this.context);
		}
	},

	exportImage:function() {
		window.location = this.context.canvas.toDataURL('image/png');
	},

	clear:function() {
		var context = this.context;
		this.arrayOfPaths = [];
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	},
}

/* The controller that handles the user interaction with the pen's configuration panel */
function ConfigPanelController(context) {
	this.context = context;
	this.init();
}
ConfigPanelController.prototype = {
	pen:null,
	context:null,	//the div in which the panel will be created
	colorInput:null,
	widthInput:null,
	hidingPanel:null,
	instructions:null,
	
	init:function() {
		this.instructions = document.getElementById("panelInstructions");

		//the panel that hides the toolbox
		var hidingPanel = document.createElement("div");
		hidingPanel.className = "hidingPanel close";
		this.context.appendChild(hidingPanel);
		this.hidingPanel = hidingPanel;
	
		var editModeButton = document.createElement("button");
		editModeButton.innerHTML = "Edit";
		editModeButton.onclick = statesController.setAddPenState.bind(statesController);
		this.hidingPanel.appendChild(editModeButton);

		//colorPicker
		var colorInput = document.createElement("input");
		colorInput.className = "color {hash:true}";
		colorInput.value = "#C0C0C0";
		colorInput.id = "colorPicker";
		colorInput.onchange = this.colorDidChange.bind(this);
		this.colorInput = colorInput;

		//widthpicker
		var widthInput = document.createElement("select");
		widthInput.name = "width";
		for(var i = 2; i<= 20; i += 2) {
			var option = document.createElement("option");
			option.value = i;
			option.innerHTML = i+" px";
			widthInput.appendChild(option);
		}
		widthInput.onchange = this.widthDidChange.bind(this);
		this.widthInput = widthInput;


		//lineTypePicker
		var lineInput = document.createElement("select");
		lineInput.name = "lineType";
		
		//continuous
		var contopt = document.createElement("option");
		contopt.value = "1";
		contopt.innerHTML = "continuous";
		contopt.className = "continousOption";
		lineInput.appendChild(contopt);

		//dotted
		var dotopt = document.createElement("option");
		dotopt.value = "0";
		dotopt.innerHTML = "dotted";
		dotopt.className = "dottedOption";
		lineInput.appendChild(dotopt);

		lineInput.onchange = this.lineTypeDidChange.bind(this);
		this.lineInput = lineInput;

		var sub1 = this.createSubPanel("Color");
		var sub2 = this.createSubPanel("Size");
		var sub3 = this.createSubPanel("Line type");
		
		sub1.appendChild(this.colorInput);
		sub2.appendChild(this.widthInput);
		sub3.appendChild(this.lineInput);
	},

	//create a new sub panel. The sub panel is automatically added to the context 
	createSubPanel:function(title) {
		var sub = document.createElement("div");
		sub.className = "subPanel";
		sub.innerHTML = title +"<br/>";
		this.context.appendChild(sub);
		return sub;
	},

	setPen:function(pen) {
		this.pen = pen;
		this.pen.color = "#"+this.colorInput.color;
		this.pen.size = parseInt(this.widthInput.value);
		this.pen.continuousLine = parseInt(this.lineInput.value);
	},

	open:function() {
		this.hidingPanel.className = "hidingPanel open";
		this.instructions.style.display = "block";
	},

	close:function() {
		this.hidingPanel.className = "hidingPanel close";
		this.instructions.style.display = "none";
	},
	
	//Event listeners
	colorDidChange:function(event) {
		if(this.pen) {
			this.pen.color = "#"+event.target.color;
		}
	},

	widthDidChange:function(event) {
		if(this.pen) {
			this.pen.size = parseInt(event.currentTarget.value);
		}
	},

	lineTypeDidChange:function(event) {
		if(this.pen) {
			this.pen.continuousLines = parseInt(event.currentTarget.value);
		}
	}
}
/************************************
	STATES
*************************************/
//the controller of all the differents states of the application
//on each event of the application, it diffuse the event to its current state
//then the current state deals with the event
function ApplicationStateController() {
}
ApplicationStateController.prototype = {
	state:null,
	
	//STATES
	changeState:function(newState) {
		this.finalize();
		newState.controller = this;
		this.state = newState;
		this.init();
	},

	setMenuState:function() {
		this.changeState(new MenuState(mainMenuDiv));
	},

	setDrawingState:function() {
		this.changeState(new DrawingState());
	},

	setAddPenState:function() {
		this.changeState(new AddPenState(addingContext, addingInformationsDiv));
	},

	//DELAGATE METHODS
	init:function() {
		if(this.state && this.state.finalize) {
			this.state.init();
		}
	},

	finalize:function() {
		if(this.state && this.state.finalize) {
			this.state.finalize(); 
		}
	},

	onClick:function(event) {
		if(this.state && this.state.onClick) {
			this.state.onClick(event); 
		}
	},

	onMouseMove:function(event) {
		if(this.state && this.state.onMouseMove) {
			this.state.onMouseMove(event);
		}
	},

	onKeyPress:function(event) {
		if(this.state && this.state.onKeyPress) {
			this.state.onKeyPress(event); 
		}
	},
}

function MenuState(menuDiv) {
	this.menuDiv = menuDiv;
}
MenuState.prototype = {
	animController:null, 	//the controller that handles the welcome animation of the main menu

	init:function() {
		initWelcomeScreenConfig();
		var mainMenuCanvas = document.getElementById("mainMenuCanvas").getContext("2d");;
		this.animController = new AnimationController(mainMenuCanvas, drawingController);
		this.menuDiv.style.display = "block";
		this.animController.launchWelcomeAnimation(welcomePensConfig);
		this.animController.resume();
	},

	finalize:function() {
		this.animController.clear();
		this.menuDiv.style.display = "none";
	},
}

function DrawingState() {
}
DrawingState.prototype = {
	init:function() {
		animationController.resume();
	},

	finalize:function() {
		animationController.pause();
	},

	onKeyPress:function(event) {
		switch(event.charCode) {
			case 112:
				animationController.pause();
				break;
			case 97:
				this.controller.setAddPenState();
				break;
		}
	},
}

function AddPenState(context, infoDiv) {
	this.context = context;
	this.infoDiv = infoDiv;
}

AddPenState.prototype = {
	state:null,
	context:null,
	elastic:null,
	infoDiv:null,
	instructionsDiv:null,
	orderedStatesClasses:[EditMenuState, ChooseAnchorState, ChooseSizeState, ChoosePenState],
	currentState:0, //define the current state of the application

	//init the state of adding a new pen in the canvas
	init:function() {
		this.currentState = 0;
		this.infoDiv.style.display = "block";
		this.instructionsDiv = document.getElementById("instructions");
		this.context.font = "20pt Arial";
		
		var pen = new Pen(new GPoint(-100, -100), "#C0C0C0");
		this.elastic = new Elastic(0, new  GPoint(-100, -100), pen);
	
		panelController.setPen(pen);
		//init the state of adding the elastic anchor in the canvas
		this.nextState();
	},


	onKeyPress:function(event) {
		switch(event.keyCode) {
			case 27:
				this.controller.setDrawingState();
				break;
		}
	},

	setDrawingState:function() {
		this.controller.setDrawingState();
	},
	//call the onClick event of the current state
	onClick:function(event) {
		if(this.state) {
			if(this.state.updateParameters) {
				this.state.updateParameters();
			}
			this.nextState();
		}
	},

	//call the onMouseMove event of the current state
	onMouseMove:function(event) {
		if(this.state) {
			this.state.onMouseMove(event, this.context);
		}
	},

	onMouseDown:function(event) {
		if(this.state) {
			this.state.onMouseDown(event, this.context);
		}
	},

	onMouseUp:function(event) {
		if(this.state) {
			this.state.onMouseUp(event, this.context);
		}
	},

	nextState:function() {
		if(this.currentState < this.orderedStatesClasses.length) {
			this.state = new this.orderedStatesClasses[this.currentState]();
			this.state.elastic = this.elastic;
			this.state.controller = this;
			this.state.printInformations(this.instructionsDiv);
			this.currentState++;
		} else {
			this.addPen();
			this.init();
			return;
		}
	},

	addPen:function() {
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
		animationController.addPen(this.elastic);
		animationController.draw();
	},

	//close the adding pan state
	finalize:function() {
		panelController.close();
		this.currentState = 0;
		this.state = null;
		this.infoDiv.style.display = "none";
		var canvas = this.context.canvas;
		this.context.clearRect(0, 0, canvas.width, canvas.height);
	}
}

function AddingState() {
}
AddingState.prototype = {
	elastic:null,
	textualValue:"",
	controller:null,

	printInformations:function(infoDiv) {
		infoDiv.innerHTML = this.textualValue;
		panelController.open();
	},

	onMouseMove:function(event, context) {
		this.elastic.drawInContext(context);
		this.elastic.object.drawInContext(context);
	}
}

function EditMenuState(){
	this.textualValue = "<p>Click anywhere to add a new pencil</p><p>press (esc) to quit the editing mode and run the animation</p>";
}
EditMenuState.prototype.__proto__ = AddingState.prototype;

function ChooseAnchorState() {
	this.textualValue = "Place the point of the anchor of the elastic";
}
ChooseAnchorState.prototype.__proto__ = AddingState.prototype;
ChooseAnchorState.prototype.onMouseMove = function(event, context) {
	var x = event.layerX;
	var y = event.layerY;
	var cursorSize = 5;
	this.elastic.start.x = x;
	this.elastic.start.y = y;
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.save();
	context.fillText("("+x+", "+y+")", x, y);
	context.strokeStyle = "red";
	context.beginPath();
	context.moveTo(x - cursorSize, y - cursorSize);
	context.lineTo(x + cursorSize, y + cursorSize);
	context.moveTo(x - cursorSize, y + cursorSize);
	context.lineTo(x + cursorSize, y - cursorSize);
	context.stroke();
	context.restore();
}

function ChooseSizeState() {
	this.textualValue = "Choose the size of the elastic";
}
ChooseSizeState.prototype.__proto__ = AddingState.prototype;
ChooseSizeState.prototype.onMouseMove = function(event, context) {
	var ela = this.elastic;
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	ela.object.setCenter(new GPoint(event.layerX, event.layerY));
	ela.drawInContext(context);
	ela.object.drawInContext(context);
	context.fillText(parseInt(this.elastic.getCurrentSize())+"px", ela.object.position.x, ela.object.position.y);
}
ChooseSizeState.prototype.updateParameters = function() {
	this.elastic.size = this.elastic.getCurrentSize();
}

function ChoosePenState() {
	this.textualValue = "Choose the starting point of the pencil";
}
ChoosePenState.prototype.__proto__ = AddingState.prototype
ChoosePenState.prototype.onMouseMove = function(event, context) {
	var ela = this.elastic;
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.fillText("("+event.layerX+", "+event.layerY+")", event.layerX, event.layerY);
	ela.object.setCenter(new GPoint(event.layerX, event.layerY));
	ela.drawInContext(context);
	ela.object.drawInContext(context);
}

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


