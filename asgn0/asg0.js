// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
  // ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color

  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);         // canvas 400 x 400

  // Instantiate a vector v1 using the Vector3 class from cuon-matrix.js library (set the z coordinate to zero).
  var v1 = new Vector3([2.25, 2.25, 0]);

  // Call drawVector(v1, "red") in the main() function.
  drawVector(v1, "red");
}

// Create a function drawVector(v, color) that takes a Vector3 v and a string color (e.g. "red").
// use lineTo() to draw the vector v1. 
// The resolution of the canvas is 400x400, so scale your v1 coordinates by 20 when drawing it. 
// This will make it easier to visualize vectors with length 1.
function drawVector(v, color) {
  var canvas = document.getElementById('example'); 
  var ctx = canvas.getContext('2d');

  // origin of vector (canvas center)
  var x_origin = 200;
  var y_origin = 200;

  ctx.beginPath();
  ctx.strokeStyle = color;

  ctx.moveTo(x_origin, y_origin);
  ctx.lineTo(x_origin + v.elements[0] * 20, y_origin - v.elements[1] * 20);
  ctx.stroke();
}

// called whenever a user clicks on the draw button
function handleDrawEvent() {
  var canvas = document.getElementById('example'); 
  var ctx = canvas.getContext('2d');

  // Clear the canvas.
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);         // canvas 400 x 400
  // Read the values of the text boxes to create v1.
  var x = parseFloat(document.getElementById('x').value);
  var y = parseFloat(document.getElementById('y').value);
  var v1 = new Vector3([x, y, 0]);
  // Call drawVector(v1, "red")
  drawVector(v1, "red");

  // Read the values of the text boxes to create v2.
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);
  var v2 = new Vector3([x2, y2, 0]);
  // Call drawVector(v1, "red")
  drawVector(v2, "blue");
} 