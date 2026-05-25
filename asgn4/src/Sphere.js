class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
    this.vert32 = new Float32Array([]);
  
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
    // gl.uniform1i(u_whichTexture, this.textureNum);
    this.make_uniformT(rgba);

    var d=Math.PI/10;
    var dd=Math.PI/10;

    for (var t=0; t<Math.PI; t+=d) {
        for (var r=0; r< (2*Math.PI); r+=d) {
            var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
            var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
            var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
            var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

            var v = [];
            var uv = [];
            v=v.concat(p1); uv=uv.concat([0,0]);
            v=v.concat(p2); uv=uv.concat([0,0]);
            v=v.concat(p4); uv=uv.concat([0,0]);

            gl.uniform4f(u_FragColor, 1,1,1,1);
            drawTriangle3DUVNormal(v,uv,v);

            v=[]; uv=[];
            v=v.concat(p1); uv=uv.concat([0,0]);
            v=v.concat(p4); uv=uv.concat([0,0]);
            v=v.concat(p3); uv=uv.concat([0,0]);
            gl.uniform4f(u_FragColor, 1,1,1,1);
            drawTriangle3DUVNormal(v,uv,v);
        }
    }
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
    gl.disableVertexAttribArray(a_Normal);
    gl.drawArrays(gl.TRIANGLES, 0, v.length/5); 
  }
}