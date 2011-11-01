/****************************************** 
	CONTROLLERS
******************************************/
/* Main controller of the resume
	idContainer : the id of the DOM element that will contain the resume
 */
function AnimationController(context, drawer) {
	this.context = context;
	this.context.capLine = "round";
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

	init:function() {
		//the panel that hide the toolbox
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
		this.context.appendChild(colorInput);
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
		this.context.appendChild(widthInput);
		this.widthInput = widthInput;

		//lineTypePicker
		var lineInput = document.createElement("select");
		lineInput.name = "lineType";
		
		//continuous
		var contopt = document.createElement("option");
		contopt.value = "1";
		contopt.className = "continousOption";
		lineInput.appendChild(contopt);

		//dotted
		var dotopt = document.createElement("option");
		dotopt.value = "0";
		dotopt.className = "dottedOption";
		lineInput.appendChild(dotopt);

		this.lineInput = lineInput;
		lineInput.onchange = this.lineTypeDidChange.bind(this);
		this.context.appendChild(lineInput);
	},

	setPen:function(pen) {
		this.pen = pen;
		this.pen.color = "#"+this.colorInput.color;
		this.pen.size = parseInt(this.widthInput.value);
		this.pen.continuousLine = parseInt(this.lineInput.value);
	},

	open:function() {
		this.hidingPanel.className = "hidingPanel open";
	},

	close:function() {
		this.hidingPanel.className = "hidingPanel close";
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
