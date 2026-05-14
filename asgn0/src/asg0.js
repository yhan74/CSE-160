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

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example'); 
  var ctx = canvas.getContext('2d');

  // Clear the canvas.
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);         // canvas 400 x 400
  // Read the values of the text boxes to create v1 and call drawVector(v1, "red")
  var x = parseFloat(document.getElementById('x').value);
  var y = parseFloat(document.getElementById('y').value);
  var v1 = new Vector3([x, y, 0]);
  drawVector(v1, "red");

  // Read the values of the text boxes to create v2 and call drawVector(v2, "blue")
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);
  var v2 = new Vector3([x2, y2, 0]);
  drawVector(v2, "blue");

  // Read the value of the selector and call the respective Vector3 function.
  var op = document.getElementById('operation').value;
  var scalar = parseFloat(document.getElementById('scalar').value); 
  // For add and sub operations, draw a green vector v3 = v1 + v2  or v3 = v1 - v2. 
  // For mul and div operations, draw two green vectors v3 = v1 * s and v4 = v2 * s.
  if (op == "Add") {
    var v3 = new Vector3([x, y, 0]);
    v3.add(v2);
    drawVector(v3, "green");
  } else if (op == "Subtract") {
    var v3 = new Vector3([x, y, 0]);
    v3.sub(v2);
    drawVector(v3, "green");
  } else if (op == "Multiply") {
    var v3 = new Vector3([x, y, 0]);
    var v4 = new Vector3([x2, y2, 0]);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op == "Divide") {
    var v3 = new Vector3([x, y, 0]);
    var v4 = new Vector3([x2, y2, 0]);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op == "Magnitude") {
    console.log("Magnitude v1: " + v1.magnitude());
    console.log("Magnitude v2: " + v2.magnitude());
  } else if (op == "Normalize") {
    // Draw normalized v1 and v2 in green
    var v3 = new Vector3([x, y, 0]);
    var v4 = new Vector3([x2, y2, 0]);
    v3.normalize();
    v4.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
    //console.log("Magnitude v1: " + v1.magnitude());
    //console.log("Magnitude v2: " + v2.magnitude());
  } else if (op == "Angle Between") {
    let angle = angleBetween(v1, v2);
    console.log("Angle: " + angle);
  } else if (op == "Area") {
    let area = areaTriangle(v1, v2);
    console.log("Area of the triangle: " + area);
  }
}

// uses the dot function to compute the angle between v1 and v2. 
// Hint: Use the definition of dot product dot(v1, v2) = ||v1|| * ||v2|| * cos(alpha)
// Print the result of this operation to the browser console. 
function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let magnitude1 = v1.magnitude();
  let magnitude2 = v2.magnitude();
  let cos_alpha = dot / (magnitude1 * magnitude2);
  let angle = Math.acos(cos_alpha) * (180 / Math.PI);
  return angle;
}

// uses the cross function to compute the area of the triangle created with v1 and v2. 
// Hint: Remember  ||v1 x v2]]  equals to the area of the parallelogram that the vectors span
// Print the result of this operation to the browser console. 
function areaTriangle(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  let area = cross.magnitude() / 2;
  return area;
}