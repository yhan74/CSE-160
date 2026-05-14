class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
  }

  make_uniformT(rgba) {
    gl.uniform1i(u_whichTexture, this.textureNum);
    if (this.textureNum >= 0) {
      gl.uniform1f(u_texColorWeight, 1.0);
    } else {
      gl.uniform1f(u_texColorWeight, 0.0);
    }
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  }

  render() {
    var rgba = this.color;
    this.make_uniformT(rgba);
    // front cube face
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);
    // back cube face
    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    drawTriangle3DUV([0,0,1, 1,0,1, 1,1,1], [1,0, 0,0, 0,1]);
    drawTriangle3DUV([0,0,1, 1,1,1, 0,1,1], [1,0, 0,1, 1,1]);
    // top cube face
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
    drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);
    // bottom cube face
    gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
    drawTriangle3DUV([0,0,0, 1,0,0, 1,0,1], [0,1, 1,1, 1,0]);
    drawTriangle3DUV([0,0,0, 1,0,1, 0,0,1], [0,1, 1,0, 0,0]);
    // left cube face
    gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);
    drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1]);
    drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [0,0, 1,1, 0,1]);
    // right cube face
    gl.uniform4f(u_FragColor, rgba[0]*.75, rgba[1]*.75, rgba[2]*.75, rgba[3]);
    drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [1,0, 1,1, 0,1]);
    drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [1,0, 0,1, 0,0]);
  }

  renderfast() { //from helper video
    var rgba = this.color;
    this.make_uniformT(rgba);
    var v = [
      // front face
      0,0,0, 0,0, 1,1,0, 1,1, 1,0,0, 1,0,
      0,0,0, 0,0, 0,1,0, 0,1, 1,1,0, 1,1,
      // back face 
      0,0,1, 1,0, 1,0,1, 0,0, 1,1,1, 0,1,
      0,0,1, 1,0, 1,1,1, 0,1, 0,1,1, 1,1,
      // top face
      0,1,0, 0,0, 0,1,1, 0,1, 1,1,1, 1,1,
      0,1,0, 0,0, 1,1,1, 1,1, 1,1,0, 1,0,
      // bottom face 
      0,0,0, 0,1, 1,0,0, 1,1, 1,0,1, 1,0,
      0,0,0, 0,1, 1,0,1, 1,0, 0,0,1, 0,0,
      // left face
      0,0,0, 0,0, 0,0,1, 1,0, 0,1,1, 1,1,
      0,0,0, 0,0, 0,1,1, 1,1, 0,1,0, 0,1,
      // right face
      1,0,0, 1,0, 1,1,0, 1,1, 1,1,1, 0,1,
      1,0,0, 1,0, 1,1,1, 0,1, 1,0,1, 0,0,
    ];

    var FSIZE  = Float32Array.BYTES_PER_ELEMENT; 
    var stride = 5*FSIZE;                      
    gl.bindBuffer(gl.ARRAY_BUFFER, g_interleavedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, stride, 3*FSIZE);
    gl.enableVertexAttribArray(a_UV);
    gl.drawArrays(gl.TRIANGLES, 0, v.length/5); 
  }
}
