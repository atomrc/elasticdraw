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
	welcomePensConfig.push(ela2);

	var elaImage = new Image();
	elaImage.src = "images/elasticDraw.png";

	var elaLogo = new Pen(new GPoint(350, 0), "transparent");
	elaLogo.drawInContext = (function(context) {
		var x = this.position.x - Math.floor(elaImage.width/2);
		context.drawImage(elaImage, x, this.position.y);
	}).bind(elaLogo);
	var ela3 = new Elastic(60, new GPoint(350, 200), elaLogo);
	ela3.isStable = function() { return false; };
	welcomePensConfig.push(ela3);
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
