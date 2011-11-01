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
