var g_positionBuffer = null;
var g_uvBuffer = null;
var g_interleavedBuffer = null;

function initBuffers() {
  g_positionBuffer = gl.createBuffer();
  g_uvBuffer = gl.createBuffer();
  g_interleavedBuffer = gl.createBuffer();
  if (!g_positionBuffer || !g_uvBuffer || !g_interleavedBuffer) {
    console.error('Failed to create GL buffers');
  }
}

function drawTriangle(vertices) {
  if (!g_positionBuffer) initBuffers();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2); //2D
}

function drawTriangle3D(vertices) {
  if (!g_positionBuffer) initBuffers();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.disableVertexAttribArray(a_UV);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3); //3D
}

function drawTriangle3DUV(vertices, uv) {
  if (!g_positionBuffer) initBuffers();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);
}