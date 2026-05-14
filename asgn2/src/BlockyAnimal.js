// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  g_perfBuffer = gl.createBuffer();
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  // Get the storage location of a_Position
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
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
//const POINT = 0;
//const TRIANGLE = 1;
//const CIRCLE = 2;

// Globals related UI elements
//let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
//let g_selectedSize = 5;
//let g_selectedType = POINT;

let g_globalAngle = 0;
let g_globalAngleM = 0;
let g_mouse_xpos = 0;
let g_mouse_ypos = 0;
let g_mousedown = false;

function mouseDownclick(ev) {
  if (ev.shiftKey) {
    g_pokeAnimate = true;
    g_pokestartTime = g_seconds;
    return;
  }
  g_mouse_xpos = ev.clientX;
  g_mouse_ypos = ev.clientY;
  g_mousedown = true; //clicking down on mouse
}

function mouseUpclick() {
  g_mousedown = false; //let go of mouse
}

function mouseControlclick(ev) {
  if (!g_mousedown) {
    return;
  }
  let xpos = ev.clientX - g_mouse_xpos;
  let ypos = ev.clientY - g_mouse_ypos;
  g_globalAngle += xpos * 0.3;
  g_globalAngleM += ypos * 0.3;
  g_mouse_xpos = ev.clientX;
  g_mouse_ypos = ev.clientY;
  renderScene();
}

function setupMouseclicks() {
  canvas.addEventListener('mousemove', mouseControlclick);
  canvas.addEventListener('mousedown', mouseDownclick);
  canvas.addEventListener('mouseup', mouseUpclick);
}

//let g_yellowAngle = 0;
//let g_magentaAngle = 0;

// sheep body part angles
let g_headAngle = 0;

let g_frontleftleg1 = 0;
let g_frontleftleg2 = 0;
let g_frontleftfoot = 0;

let g_backleftleg1 = 0;
let g_backleftleg2 = 0;

let g_frontrightleg1 = 0;
let g_frontrightleg2 = 0;
let g_frontrightfoot = 0;

let g_backrightleg1 = 0;
let g_backrightleg2 = 0;

let g_tailAngle = 0;

// let g_yellowAnimation = false;
let g_animation = false;
let g_pokeAnimate = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Button Events
  document.getElementById('animationYellowOffButton').onclick = function() { g_animation = false; };
  document.getElementById('animationYellowOnButton').onclick   = function() { g_animation = true; };
  document.getElementById('animationMagentaOffButton').onclick = function() { g_animation = false; };
  document.getElementById('animationMagentaOnButton').onclick   = function() { g_animation = true; };
  // Color Slider Events
  //document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('yellowSlide').addEventListener('input', function() { g_frontleftleg1= parseFloat(this.value); renderScene();});
  //document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes();});
  document.getElementById('magentaSlide').addEventListener('input', function() { g_frontleftleg2 = parseFloat(this.value); renderScene();});
  // Size Slider Events
  //document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('input', function() { g_globalAngle = parseFloat(this.value); renderScene(); });
  document.getElementById('redSlide').addEventListener('input', function() { g_headAngle = parseFloat(this.value) - 50; renderScene(); });
}

function main() {
  // set up canvas and gl variables
  setupWebGL();
  // set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();
  setupMouseclicks();
  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.5, 0.8, 1.0, 1.0); // sky color background for sheep
  // Render
  requestAnimationFrame(tick);
}

var g_pokestartTime = 0;
var g_startTime = performance.now()/1000.0;
// var g_seconds = performance.now()/1000.0 - g_startTime;
var g_seconds = 0;
let g_perfBuffer = null;

// Called by browser repeatedly whenever it's time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  // Update Animation Angles
  updateAnimationAngles();
  // Draw everything
  renderScene();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  //if (g_yellowAnimation) {
  //  g_yellowAngle = (45*Math.sin(g_seconds));
  //}
  //if (g_magentaAnimation) {
  //  g_magentaAngle = (45*Math.sin(3*g_seconds));
  //}
  if (g_pokeAnimate) {
    let stime = g_seconds - g_pokestartTime;
    if (stime < 4.0) {
      g_headAngle = Math.sin(stime * Math.PI * 3) * 30;
      g_globalAngleM = Math.sin(stime * Math.PI * 4) * 40;
      g_tailAngle = Math.sin(stime * Math.PI * 5) * 50;
    } else {
      g_headAngle = 0;
      g_globalAngleM = 0;
      g_tailAngle = 0;
      g_pokeAnimate = false;
    }
    return;
  }

  if (!g_animation) {
    return;
  }

  let STime = g_seconds;
  g_headAngle = 8 * Math.sin(STime * 2);

  g_frontleftleg1 = 17 * Math.sin(STime * 2);
  g_frontleftleg2 = 10 * Math.sin(STime * 2 + 1.0);
  g_frontleftfoot = 8 * Math.sin(STime * 2 + 1.0);
  g_backleftleg1 = -17 * Math.sin(STime * 2);
  g_backleftleg2 = -10 * Math.sin(STime * 2 + 1.0);

  g_frontrightleg1 = -17 * Math.sin(STime * 2);
  g_frontrightleg2 = -10 * Math.sin(STime * 2 + 1.0);
  g_frontrightfoot = 8 * Math.sin(STime * 2 + 1.0);
  g_backrightleg1 = 17 * Math.sin(STime * 2);
  g_backrightleg2 = 10 * Math.sin(STime * 2 + 1.0);

  g_tailAngle = 23 * Math.sin(STime * 7);
}

// Draw every shape that is supposed to be in the canvas
//function renderAllShapes() {
function renderScene() {
  // Check the time at the start of this function
  var startTime = performance.now();
  // Pass the matrix to u_ModelMatrix attribute
  //var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  var globalRotMat = new Matrix4()
    .rotate(g_globalAngle,0,1,0)
    .rotate(g_globalAngleM,1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  const WOOLFUR = [0.9, 0.9, 0.9, 1.0];
  const SKIN = [0.77, 0.6, 0.5, 1.0];
  //const FEET_NOSE = [0.25, 0.2, 0.2, 1.0];
  //const EARS = [0.9, 0.6, 0.6, 1.0];
  const EYES = [0.05, 0.05, 0.05, 1.0];

  // sheep head
  var head = new Matrix4();
  head.translate(0, 0.25, -0.28);
  head.rotate(g_headAngle, 1, 0, 0);
  var head1 = new Matrix4(head);
  head1.translate(-0.14, 0, -0.24);
  head1.scale(0.28, 0.25, 0.26);
  drawCube(head1, WOOLFUR);
  var woolhead = new Matrix4(head);
  woolhead.translate(-0.14, 0.22, -0.22);
  woolhead.scale(0.28, 0.14, 0.22);
  drawCube(woolhead, WOOLFUR);

  // sheep face
  var nose = new Matrix4(head);
  nose.translate(-0.15, -0.06, -0.32);
  nose.scale(0.3, 0.2, 0.2);
  drawCube(nose, SKIN);
  var noseleft = new Matrix4(head);
  noseleft.translate(-0.07, 0.05, -0.33);
  noseleft.scale(0.04, 0.04, 0.04);
  drawCube(noseleft, EYES);
  var noseright = new Matrix4(head);
  noseright.translate(0.03, 0.05, -0.33);
  noseright.scale(0.04, 0.04, 0.04);
  drawCube(noseright, EYES);
  var lefteye = new Matrix4(head);
  lefteye.translate(-0.12, 0.14, -0.28);
  lefteye.scale(0.08, 0.06, 0.04);
  drawCube(lefteye, EYES);
  var righteye = new Matrix4(head);
  righteye.translate(0.05, 0.14, -0.28);
  righteye.scale(0.08, 0.06, 0.04);
  drawCube(righteye, EYES);
  var leftear = new Matrix4(head);
  leftear.translate(-0.21, 0.12, -0.22);
  leftear.rotate(-20, 0, 0, 1);
  leftear.scale(0.07, 0.14, 0.06);
  drawCube(leftear, SKIN);
  var rightear = new Matrix4(head);
  rightear.translate(0.14, 0.1, -0.22);
  rightear.rotate(20, 0, 0, 1);
  rightear.scale(0.07, 0.14, 0.06);
  drawCube(rightear, SKIN);

  // sheep body
  var body = new Matrix4();
  body.translate(-0.3, -0.05, -0.3);
  body.scale(0.6, 0.55, 0.7);
  drawCube(body, WOOLFUR);

  // sheep tail
  var tail = new Matrix4()
    .translate(0, 0.18, 0.35)
    .rotate(-g_tailAngle, 0, 1, 0);
  tail.translate(-0.05, -0.05, 0);
  tail.scale(0.1, 0.1, 0.12);
  drawCube(tail, WOOLFUR);

  // sheep legs + feet
  renderLegs(-0.18, -0.25, g_frontleftleg1, g_frontleftleg2, g_frontleftfoot);
  renderLegs(0.1, -0.25, g_frontrightleg1, g_frontrightleg2, g_frontrightfoot);
  renderLegs(-0.18, 0.28, g_backleftleg1, g_backleftleg2, 0);                
  renderLegs(0.1, 0.28, g_backrightleg1, g_backrightleg2, 0);                

  // Draw the body cube
  //var body = new Cube();
  //body.color = [1.0,0.0,0.0,1.0];
  //body.matrix.translate(-.25, -.75, 0.0);
  //body.matrix.rotate(-5, 1, 0, 0);
  //body.matrix.scale(0.5, .3, .5);
  //body.render();

  // Draw a left arm
  //var yellow = new Cube();
  //yellow.color = [1,1,0,1];
  //yellow.matrix.setTranslate(0, -.5, 0.0);
  //yellow.matrix.rotate(-5, 1, 0, 0);
  //yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  //var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  //yellow.matrix.scale(0.25, .7, .5);
  //yellow.matrix.translate(-.5,0,0);
  //yellow.render();

  // Test box
  //var magenta = new Cube();
  //magenta.color = [1,0,1,1];
  //magenta.matrix = yellowCoordinatesMat;
  //magenta.matrix.translate(0, 0.65, 0);
  //magenta.matrix.rotate(g_magentaAngle,0,0,1);
  //magenta.matrix.scale(.3,.3,.3);
  //magenta.matrix.translate(-.5,0,-0.001);
  //magenta.render();

  // A bunch of rotating cubes
  //var K=300.0;
  //for (var i=1; i<K; i++) {
    //var c = new Cube();
    //c.matrix.translate(-.8,1.9*i/K-1.0,0);
    //c.matrix.rotate(g_seconds*100,1,1,1);
    //c.matrix.scale(.1, 0.5/K, 1.0/K);
  //c.render();
  //}

  const GRASS = [0,0.5,0,1];
  var neck = new Matrix4();
  neck.translate(-0.05, -0.37, -0.7);
  neck.scale(0.5, 0.15, 0.5);
  drawCylinder(neck, GRASS);

  // check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function renderLegs(xpos, zpos, leg1Angle, leg2Angle, footAngle) {
  const TAN     = [0.77, 0.6, 0.5, 1.0];
  const GRAY = [0.25, 0.2, 0.2, 1.0];
  const WHITE     = [1, 1, 1, 1.0];

  var leg12 = new Matrix4()
    .translate(xpos, -0.05, zpos)
    .rotate(leg1Angle,1,0,0);
  var leg1 = new Matrix4(leg12);
  leg1.translate(-0.055, -0.1, -0.055);
  leg1.scale(0.11, 0.22, 0.11);
  drawCube(leg1, WHITE);

  var leg22 = new Matrix4(leg12)
    .translate(0, -0.22, 0)
    .rotate(leg2Angle,1,0,0);
  var leg2 = new Matrix4(leg22);
  leg2.translate(-0.045, 0, -0.045);
  leg2.scale(0.09, 0.18, 0.09);
  drawCube(leg2, TAN);

  var feet1 = new Matrix4(leg22)
    .translate(0, -0.18, 0)
    .rotate(footAngle, 1, 0, 0);
  var feet = new Matrix4(feet1);
  feet.translate(-0.05, 0.08, -0.06);
  feet.scale(0.10, 0.1, 0.12);
  drawCube(feet, GRAY);
}

function drawCylinder(matrix, color, segments = 12) {
  var r = color[0], g = color[1], b = color[2], a = color[3];
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  
  gl.uniform4f(u_FragColor, r, g, b, a);
  for (let i = 0; i < segments; i++) {
    let angle1 = (i / segments) * 2 * Math.PI;
    let angle2 = ((i + 1) / segments) * 2 * Math.PI;
    let x = 0.5 * Math.cos(angle1);
    let z = 0.5 * Math.sin(angle1);
    let x2 = 0.5 * Math.cos(angle2);
    let z2 = 0.5 * Math.sin(angle2);

    drawTriangle3D([x,0,z,   x2,0,z2,   x2,1,z2]);
    drawTriangle3D([x,0,z,   x2,1,z2,   x,1,z]);
    drawTriangle3D([0,1,0,   x,1,z,   x2,1,z2]);
    drawTriangle3D([0,0,0,   x2,0,z2,   x,0,z]);
  }
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

//from Cube.js
function drawCube(matrix, color) {
  // Pass the color of a point to u_FragColor variable
  //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  var r = color[0], g = color[1], b = color[2], a = color[3];
  // Pass the matrix to u_ModelMatrix attribute
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

  // Front of cube
  gl.uniform4f(u_FragColor, r, g, b, a);
  drawTriangle3D( [0,0,0,   1,1,0,   1,0,0 ]);
  drawTriangle3D( [0,0,0,   0,1,0,   1,1,0 ]);

  // Back of cube
  gl.uniform4f(u_FragColor, r*0.8, g*0.8, b*0.8, a);
  drawTriangle3D( [0,0,1,  1,0,1,  1,1,1] );
  drawTriangle3D( [0,0,1,  1,1,1,  0,1,1] );

  // Pass the color of a point to u_FragColor uniform variable
  gl.uniform4f(u_FragColor, r*.9, g*.9, b*.9, a);
  // Top of cube
  drawTriangle3D( [0,1,0,   0,1,1,   1,1,1] );
  drawTriangle3D( [0,1,0,   1,1,1,   1,1,0] );
        
  // Bottom of cube
  gl.uniform4f(u_FragColor, r*.7, g*.7, b*.7, a);
  drawTriangle3D( [0,0,0,   1,0,0,   1,0,1] );
  drawTriangle3D( [0,0,0,   1,0,1,   0,0,1] );

  // Left face of cube
  gl.uniform4f(u_FragColor, r*.85, g*.85, b*.85, a);
  drawTriangle3D( [0,0,0,   0,0,1,   0,1,1] );
  drawTriangle3D( [0,0,0,   0,1,1,   0,1,0] );

  // Right face of cube
  gl.uniform4f(u_FragColor, r*.75, g*.75, b*.75, a);
  drawTriangle3D( [1,0,0,   1,1,0,   1,1,1] );
  drawTriangle3D( [1,0,0,   1,1,1,   1,0,1] );
}

function drawTriangle3D(vertices) {
  var n = 3; // The number of vertices
  // Create a buffer object
  //var vertexBuffer = gl.createBuffer();
  //if (!vertexBuffer) {
    //console.log('Failed to create the buffer object');
    //return -1;
  //}
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_perfBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

//var g_shapesList = [];
//function click(ev) {
  // extract the event click and return it in WebGL coordinates
  //let [x,y] = convertCoordinatesEventToGL(ev);
  // Create and store the new point
  //let point;
  //if (g_selectedType==POINT) {
  //  point = new Point();
  //} else if (g_selectedType==TRIANGLE) {
  //  point = new Triangle();
  //} else {
  //  point = new Circle();
  //}
  //point.position=[x,y];
  //point.color=g_selectedColor.slice();
  //point.size=g_selectedSize;
  //g_shapesList.push(point);
  // Draw every shape that is supposed to be in the canvas
  //renderAllShapes();
//}
// Extract the event click and return it in WebGL coordinates
//function convertCoordinatesEventToGL(ev) {
  //var x = ev.clientX; // x coordinate of a mouse pointer
  //var y = ev.clientY; // y coordinate of a mouse pointer
  //var rect = ev.target.getBoundingClientRect();
  //x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  //y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  //return([x,y]);
//}

