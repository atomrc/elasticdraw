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
			this.nextState(event);
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

	nextState:function(event) {
		if(this.currentState < this.orderedStatesClasses.length) {
			this.state = new this.orderedStatesClasses[this.currentState]();
			this.state.elastic = this.elastic;
			if(this.state.updateElasticAnchor) {
				this.state.updateElasticAnchor(event);
			}
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
ChooseAnchorState.prototype.updateElasticAnchor = function(event) {
	this.elastic.start = new GPoint(event.layerX, event.layerY);
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

