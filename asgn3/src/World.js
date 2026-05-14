var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int   u_whichTexture;
  uniform float u_texColorWeight;
  void main() {
    vec4 texColor;
    if (u_whichTexture == 0) { 
      texColor = texture2D(u_Sampler0, v_UV); 
    } else if (u_whichTexture == 1) { 
      texColor = texture2D(u_Sampler1, v_UV); 
    } else if (u_whichTexture == 2) { 
      texColor = texture2D(u_Sampler2, v_UV); 
    } else { 
      texColor = u_FragColor; 
    }
    gl_FragColor = mix(u_FragColor, texColor, u_texColorWeight);
  }`

// instead of using 'let'
var canvas;
var gl;
var a_Position;
var a_UV;
var u_FragColor;
var u_ModelMatrix;
var u_GlobalRotateMatrix;
var u_ViewMatrix; 
var u_ProjectionMatrix;
var u_Sampler0, u_Sampler1, u_Sampler2;
var u_whichTexture;
var u_texColorWeight;
var g_camera;
var g_textures = {0:null, 1:null, 2:null};
var g_texturesReady = 0;

var g_headAngle = 0;
var g_frontleftleg1 = 0, g_frontleftleg2 = 0;
var g_backleftleg1 = 0, g_backleftleg2 = 0;
var g_frontleftfoot = 0;
var g_frontrightleg1 = 0, g_frontrightleg2 = 0;
var g_backrightleg1 = 0, g_backrightleg2 = 0;
var g_frontrightfoot = 0;
var g_tailAngle = 0;
var g_animation = true;

//for the mini game (collecting sheep)
var g_score = 0;
var g_sheep1Collected = false;
var g_sheep2Collected = false;
var g_sheep3Collected = false;
var g_sheep4Collected = false;
var g_sheep5Collected = false;
//where the sheep are located on the map
var SHEEP1_POS = [13, 0.5, -13];
var SHEEP2_POS = [-11, 0.5, -13];
var SHEEP3_POS = [22, 0.5, 13]; //on terrain map
var SHEEP4_POS = [30, 0.5, -6]; //on terrain map
var SHEEP5_POS = [26, 0.5, 0]; //on terrain map

// have 4 block wall on the perimeter of map
// walls of various block heights scattered around
// height of the wall (0, 1, 2, 3 or 4) that will be placed at that location
var g_map = [ // 32x32x4 map (flat plane version)
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,3,3,3,3,3,3,3,3,3,3,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,3,0,0,0,0,0,0,0],
  [4,0,0,0,3,3,3,3,3,3,0,0,0,0,0,0,0,3,0,0,3,0,0,0,2,3,3,3,3,3,3,0],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0],
  [4,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0],
  [4,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0],
  [4,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [4,0,0,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,2,3,2,3,3,2,3,0,0,0,0,0,0,0],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,3,3,3,3,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,1,1,1,1,1,0,0,4],
  [4,0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
];

var g_terrainMap = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,2,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,2,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,2,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,1,2,3,3,2,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,1,2,3,3,2,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,2,3,3,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0,2,3,4,3,2,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,2,3,3,2,1,0,0,0,0,0,0,0,0,2,3,3,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,3,3,3,2,1,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,3,2,1,0,0,0,0,0,0,0,0,0,0,1,2,3,2,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,1,2,3,2,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,2,3,2,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

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
  //g_perfBuffer = gl.createBuffer();
}

function connectVariablesToGLSL() {
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
  a_UV = gl.getAttribLocation (gl.program, 'a_UV');
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
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');

  if (a_Position < 0) {
    console.error('Failed to get a_Position');
  }
  if (a_UV < 0) {
    console.error('Failed to get a_UV');
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
  gl.uniform1i(u_whichTexture, -2);
  gl.uniform1f(u_texColorWeight, 0.0);
  gl.uniform4f(u_FragColor,1,1,1,1);
  gl.uniform1i(u_Sampler0, 0);
  gl.uniform1i(u_Sampler1, 1);
  gl.uniform1i(u_Sampler2, 2);
}

function initTextures() {
  //loadTexture('sky.jpg', 0, gl.TEXTURE0); //use blue solid color instead for sky
  loadTexture('rock.jpg', 1, gl.TEXTURE1);
  loadTexture('grass.jpg', 2, gl.TEXTURE2);
}

function loadTexture(src, index, textureUnit) {
  var image = new Image();
  image.onload = function () {
    var tex = gl.createTexture();
    gl.activeTexture(textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    g_textures[index] = {tex: tex, unit: textureUnit, index: index };
    g_texturesReady++;
    console.log('Loaded texture: ' + src + ' (' + g_texturesReady + '/3 ready)');
  };
  image.onerror = function() {
    console.error('Could not load: ' + src);
    g_texturesReady++;
  };
  image.src = src;
}

function bindTextures() {
  for (var x = 0; x <= 2; x++) {
    var t = g_textures[x];
    if (!t) continue;
    gl.activeTexture(t.unit);
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
  }
}

function setupMouseClicks() {
  var g_mouseDown = false;
  var g_lastMouseX = 0;
  var g_lastMouseY = 0;
  canvas.addEventListener('mousedown', function(ev) {
    g_mouseDown = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  });
  canvas.addEventListener('mouseup', function() {
    g_mouseDown = false;
  });
  canvas.addEventListener('mousemove', function(ev) {
    if (!g_mouseDown || !g_camera) return;
    var dx = ev.clientX - g_lastMouseX;
    var dy = ev.clientY - g_lastMouseY;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    g_camera.exploreMouse(dx, dy);
  });
}

function keydown(ev) {
  if (!g_camera) return;
  switch (ev.code) {
    case 'KeyW': g_camera.moveForward(); break; //W moves camera forward.
    case 'KeyA': g_camera.moveLeft(); break; //A moves camera to the left.
    case 'KeyS': g_camera.moveBackward(); break; //S moves camera backwards
    case 'KeyD': g_camera.moveRight(); break; //D moves camera to the right.
    case 'KeyQ': g_camera.panLeft(); break; //Q turn camera left
    case 'KeyE': g_camera.panRight(); break; //E turn camera right
    case 'KeyF': putNewBlock(); break;
    case 'KeyR': deleteSelectedBlock(); break;
  }
}

function selectBlock() {
  var f = new Vector3([
    g_camera.at.elements[0] - g_camera.eye.elements[0],
    g_camera.at.elements[1] - g_camera.eye.elements[1],
    g_camera.at.elements[2] - g_camera.eye.elements[2]
  ]);
  f.normalize();
  var wx = g_camera.eye.elements[0] + f.elements[0] * 1.5;
  var wz = g_camera.eye.elements[2] + f.elements[2] * 1.5;
  var cx = Math.max(0, Math.min(31, Math.floor(wx + 16)));
  var cz = Math.max(0, Math.min(31, Math.floor(wz + 16)));
  return { cx: cx, cz: cz };
}

//add and delete blocks in front of you. 
function putNewBlock() {
  var s = selectBlock();
  if (g_map[s.cz][s.cx] < 8) g_map[s.cz][s.cx]++;
}

function deleteSelectedBlock() {
  var s = selectBlock();
  if (g_map[s.cz][s.cx] > 0) g_map[s.cz][s.cx]--;
}

function addActionsForHtmlUI() {
  document.getElementById('animationYellowOnButton') .onclick = function() { g_animation = true;  };
  document.getElementById('animationYellowOffButton').onclick = function() { g_animation = false; };

  document.getElementById('angleSlide').addEventListener('input', function() {
    g_camera.panLeft(parseFloat(this.value));
  });
  document.getElementById('yellowSlide').addEventListener('input', function() {
    g_frontleftleg1 = parseFloat(this.value);
  });
  document.getElementById('magentaSlide').addEventListener('input', function() {
    g_frontleftleg2 = parseFloat(this.value);
  });
  document.getElementById('redSlide').addEventListener('input', function() {
    g_headAngle = parseFloat(this.value) - 50;
  });
}

function main() {
  setupWebGL();
  if (!gl) return;

  connectVariablesToGLSL();
  initBuffers();
  addActionsForHtmlUI();

  g_camera = new Camera();

  document.addEventListener('keydown', keydown);
  setupMouseClicks();
  initTextures();

  gl.clearColor(0,0,0,1);
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = 0;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  if (g_texturesReady >= 2) {
    renderScene();
  } else {
    sendTextToHTML('Loading textures... (' + g_texturesReady + '/3)', 'numdot');
  }
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
  //if (g_pokeAnimate) {
    //let stime = g_seconds - g_pokestartTime;
    //if (stime < 4.0) {
      //g_headAngle = Math.sin(stime * Math.PI * 3) * 30;
      //g_globalAngleM = Math.sin(stime * Math.PI * 4) * 40;
      //g_tailAngle = Math.sin(stime * Math.PI * 5) * 50;
    //} else {
      //g_headAngle = 0;
      //g_globalAngleM = 0;
      //g_tailAngle = 0;
      //g_pokeAnimate = false;
    //}
    //return;
  //}

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

function checkSheepCollection() {
  var ex = g_camera.eye.elements[0];
  var ez = g_camera.eye.elements[2];

  if (!g_sheep1Collected) {
    var dx = ex - SHEEP1_POS[0];
    var dz = ez - SHEEP1_POS[2];
    //if player approaches the sheep this close, then it's considered collected
    if (Math.sqrt(dx*dx + dz*dz) < 2) { 
      g_sheep1Collected = true; 
      g_score++; 
    }
  }
  if (!g_sheep2Collected) {
    var dx = ex - SHEEP2_POS[0];
    var dz = ez - SHEEP2_POS[2];
    if (Math.sqrt(dx*dx + dz*dz) < 2) { 
      g_sheep2Collected = true; 
      g_score++; 
    }
  }
  if (!g_sheep3Collected) {
    var dx = ex - SHEEP3_POS[0];
    var dz = ez - SHEEP3_POS[2];
    if (Math.sqrt(dx*dx + dz*dz) < 2) { 
      g_sheep3Collected = true; 
      g_score++; 
    }
  }
  if (!g_sheep4Collected) {
    var dx = ex - SHEEP4_POS[0];
    var dz = ez - SHEEP4_POS[2];
    if (Math.sqrt(dx*dx + dz*dz) < 2) { 
      g_sheep4Collected = true; 
      g_score++; 
    }
  }
  if (!g_sheep5Collected) {
    var dx = ex - SHEEP5_POS[0];
    var dz = ez - SHEEP5_POS[2];
    if (Math.sqrt(dx*dx + dz*dz) < 2) { 
      g_sheep5Collected = true; 
      g_score++; 
    }
  }
}

function drawMap() {
  for (var z = 0; z < 32; z++) {
    for (var x = 0; x < 32; x++) {
      var h = g_map[z][x];
      if (h === 0) continue;
      for (var y = 0; y < h; y++) {
        var wall = new Cube();
        wall.textureNum = 1; // rock.jpg
        wall.color      = [1, 1, 1, 1];
        wall.matrix.setIdentity();
        wall.matrix.translate(x - 16, y, z - 16);
        wall.renderfast();
      }
    }
  }
}

function drawTerrainMap() {
  for (var z = 0; z < 32; z++) {
    for (var x = 0; x < 32; x++) {
      var height = g_terrainMap[z][x];
      var flat = new Cube();
      flat.textureNum = 2; // grass.jpg
      flat.color = [0.35, 0.75, 0.25, 1.0];
      flat.matrix.setIdentity();
      // terrain map appears to the right of the flat plane map
      flat.matrix.translate(x+16, -0.03, z-16);
      flat.matrix.scale(1,0.05,1);
      flat.renderfast();

      if (height > 0) {
        for (var y = 0; y < height; y++) {
          var block = new Cube();
          block.textureNum = 2; // grass.jpg
          block.color = [0.35, 0.75, 0.25, 1.0];
          block.matrix.setIdentity();
          block.matrix.translate(x+16, y*0.3, z-16);
          block.matrix.scale(1,0.3,1);
          block.renderfast();
        }
      }
    }
  }
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

    drawTriangle3D([x,0,z, x2,0,z2, x2,1,z2]);
    drawTriangle3D([x,0,z, x2,1,z2, x,1,z]);
    drawTriangle3D([0,1,0, x,1,z, x2,1,z2]);
    drawTriangle3D([0,0,0, x2,0,z2, x,0,z]);
  }
}

function drawSheep(xpos, ypos, zpos) {
  gl.uniform1i(u_whichTexture, -2);
  gl.uniform1f(u_texColorWeight, 0);

  const WOOLFUR = [0.9, 0.9, 0.9, 1.0];
  const SKIN = [0.77, 0.6, 0.5, 1.0];
  const EYES = [0.05, 0.05, 0.05, 1.0];

  var head = new Matrix4();
  head.translate(xpos, ypos + 0.25, zpos - 0.28);
  head.rotate(g_headAngle, 1, 0, 0);

  var head1 = new Matrix4(head);
  head1.translate(-0.14, 0, -0.24);
  head1.scale(0.28, 0.25, 0.26);
  drawCube(head1, WOOLFUR);

  var woolhead = new Matrix4(head);
  woolhead.translate(-0.14, 0.22, -0.22);
  woolhead.scale(0.28, 0.14, 0.22);
  drawCube(woolhead, WOOLFUR);

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

  var body = new Matrix4();
  body.translate(xpos - 0.3, ypos - 0.05, zpos - 0.3);
  body.scale(0.6, 0.55, 0.7);
  drawCube(body, WOOLFUR);

  var tail = new Matrix4();
  tail.translate(xpos, ypos + 0.18, zpos + 0.35);
  tail.rotate(-g_tailAngle, 0, 1, 0);
  tail.translate(-0.05, -0.05, 0);
  tail.scale(0.1, 0.1, 0.12);
  drawCube(tail, WOOLFUR);

  renderLegs(xpos - 0.18, ypos, zpos - 0.25, g_frontleftleg1, g_frontleftleg2);
  renderLegs(xpos + 0.10, ypos, zpos - 0.25, g_frontrightleg1, g_frontrightleg2);
  renderLegs(xpos - 0.18, ypos, zpos + 0.28, g_backleftleg1, g_backleftleg2);
  renderLegs(xpos + 0.10, ypos, zpos + 0.28, g_backrightleg1, g_backrightleg2);
}

function renderLegs(xpos, ypos, zpos, leg1Angle, leg2Angle) {
  gl.uniform1i(u_whichTexture, -2);
  gl.uniform1f(u_texColorWeight, 0.0);

  const TAN  = [0.77, 0.6, 0.5, 1.0];
  const GRAY = [0.25, 0.2, 0.2, 1.0];
  const WHITE = [1, 1, 1, 1.0];

  var leg12 = new Matrix4();
  leg12.translate(xpos, ypos - 0.05, zpos);
  leg12.rotate(leg1Angle, 1, 0, 0);

  var leg1 = new Matrix4(leg12);
  leg1.translate(-0.055, -0.1, -0.055);
  leg1.scale(0.11, 0.22, 0.11);
  drawCube(leg1, WHITE);

  var leg22 = new Matrix4(leg12);
  leg22.translate(0, -0.22, 0);
  leg22.rotate(leg2Angle, 1, 0, 0);

  var leg2 = new Matrix4(leg22);
  leg2.translate(-0.045, 0, -0.045);
  leg2.scale(0.09, 0.18, 0.09);
  drawCube(leg2, TAN);

  var feet1 = new Matrix4(leg22);
  feet1.translate(0, -0.18, 0);
  var feet = new Matrix4(feet1);
  feet.translate(-0.05, 0.08, -0.06);
  feet.scale(0.10, 0.1, 0.12);
  drawCube(feet, GRAY);
}

function renderScene() {
  var t0 = performance.now();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);

  bindTextures();

  gl.depthMask(false);
  var sky = new Cube();
  sky.textureNum = -2;                    
  sky.color = [0.5, 0.75, 0.90, 1.0];
  sky.matrix.setIdentity();
  sky.matrix.scale(500, 500, 500);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();
  gl.depthMask(true);

  var floor = new Cube();
  floor.textureNum = 2;
  floor.color = [0.35, 0.75, 0.25, 1.0];
  floor.matrix.setIdentity();
  floor.matrix.translate(-16, -0.02, -16);
  floor.matrix.scale(32, 0.04, 32);
  floor.render();

  drawMap();
  drawTerrainMap();

  if (!g_sheep1Collected) {
    drawSheep(SHEEP1_POS[0], SHEEP1_POS[1], SHEEP1_POS[2]);
  }
  if (!g_sheep2Collected) {
    drawSheep(SHEEP2_POS[0], SHEEP2_POS[1], SHEEP2_POS[2]);
  }
  if (!g_sheep3Collected) {
    drawSheep(SHEEP3_POS[0], SHEEP3_POS[1], SHEEP3_POS[2]);
  }
  if (!g_sheep4Collected) {
    drawSheep(SHEEP4_POS[0], SHEEP4_POS[1], SHEEP4_POS[2]);
  }
  if (!g_sheep5Collected) {
    drawSheep(SHEEP5_POS[0], SHEEP5_POS[1], SHEEP5_POS[2]);
  }

  checkSheepCollection();

  var ms  = Math.floor(performance.now() - t0);
  var fps = ms > 0 ? Math.floor(1000 / ms) : 999;
  var msg;
  if (g_score >= 5) {
    msg = 'All sheep have been collected! GAME OVER';
  } else {
    msg = 'Find all sheep!  Found: ' + g_score + '/5 total';
  }
  sendTextToHTML(msg + '  |  ms:' + ms + '  fps:' + fps, 'numdot');
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