// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 30.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

  
// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_FragColor
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType=POINT;
let g_selectedSeg = 10;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick   = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes();};
  document.getElementById('drawPicButton').onclick = function() { drawPicture(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

  // Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

  // Segment Slider Events
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSeg = this.value; });

}

function main() {

  // set up canvas and gl variables
  setupWebGL();
  // set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes =  []; // The array to store the size of a point

function click(ev) {
  
  // extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  point.segments = g_selectedSeg;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();

}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}


// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  
  // check the time at the start of this function
  var startTime = performance.now();
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw each shape in the list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawPicture() {
  // 20+ triangle coordinates
  // blue lamppost
  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // blue bottom left
  drawTriangle([-0.7, -0.9, -0.6, -0.9, -0.6, -0.75]);

  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // blue bottom right
  drawTriangle([-0.4, -0.9, -0.5, -0.9, -0.5, -0.75]);

  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // blue middle long 1
  drawTriangle([-0.6, -0.9, -0.6, -0.2, -0.5, -0.2]);

  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // blue middle long 2
  drawTriangle([-0.5, -0.9, -0.6, -0.9, -0.5, -0.2]);

  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // blue top left 1
  drawTriangle([-0.55, -0.2, -0.6, -0.2, -0.7, 0]);

  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // blue top left 2
  drawTriangle([-0.7, 0, -0.75, 0, -0.6, -0.2]);

  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // blue top right 1
  drawTriangle([-0.55, -0.2, -0.5, -0.2, -0.4, 0]);

  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // blue top right 2
  drawTriangle([-0.35, 0, -0.4, 0, -0.5, -0.2]);

  // yellow lamplight
  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); // yellow top
  drawTriangle([-0.7, 0.1, -0.55, 0.2, -0.4, 0.1]);

  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); // yellow middle 1
  drawTriangle([-0.7, 0.1, -0.4, 0.1, -0.7, 0]);

  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); // yellow middle 2
  drawTriangle([-0.7, 0, -0.4, 0.1, -0.4, 0]);

  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); // yellow bottom
  drawTriangle([-0.7, 0, -0.4, 0, -0.55, -0.2]);

  // brown bench
  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown bottom left 1
  drawTriangle([-0.15, -0.7, -0.15, -0.9, -0.05, -0.7]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown bottom left 2
  drawTriangle([-0.05, -0.9, -0.05, -0.7, -0.15, -0.9]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown bottom right 1
  drawTriangle([0.85, -0.9, 0.85, -0.7, 0.75, -0.7]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown bottom right 2
  drawTriangle([0.75, -0.9, 0.75, -0.7, 0.85, -0.9]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown bottom middle 1
  drawTriangle([-0.2, -0.7, -0.1, -0.6, 0.9, -0.7]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown bottom middle 2
  drawTriangle([-0.1, -0.6, 0.8, -0.6, 0.9, -0.7]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown middle left 1
  drawTriangle([0, -0.5, 0, -0.8, 0.05, -0.5]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown middle left 2
  drawTriangle([0, -0.8, 0.05, -0.8, 0.05, -0.5]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown middle right 1
  drawTriangle([0.65, -0.5, 0.65, -0.8, 0.7, -0.5]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown middle right 2
  drawTriangle([0.7, -0.5, 0.7, -0.8, 0.65, -0.8]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown top 1
  drawTriangle([-0.1, -0.35, -0.1, -0.5, 0.8, -0.35]);

  gl.uniform4f(u_FragColor, 0.8, 0.5, 0.2, 1.0); // brown top 2
  drawTriangle([-0.1, -0.5, 0.8, -0.5, 0.8, -0.35]);

  // red music note
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);

  let x_center = 0.6;
  let y_center = 0.1;
  let size = 20.0;
  let segments = 10;

  var d = size/200.0;
  let angleStep = 360/segments;
  for(var angle = 0; angle < 360; angle=angle+angleStep) {
    let vec1 = [Math.cos(angle*Math.PI/180)*d, Math.sin(angle*Math.PI/180)*d];
    let vec2 = [Math.cos((angle+angleStep)*Math.PI/180)*d, Math.sin((angle+angleStep)*Math.PI/180)*d];
    let pt1 = [x_center+vec1[0], y_center+vec1[1]];
    let pt2 = [x_center+vec2[0], y_center+vec2[1]];
    drawTriangle([x_center, y_center, pt1[0], pt1[1], pt2[0], pt2[1]] );
  }

  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0); //long 1
  drawTriangle([0.65, 0.4, 0.65, 0.1, 0.7, 0.1]);
}