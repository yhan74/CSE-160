class Camera {
  constructor() {
    this.pov = 60;
    this.eye = new Vector3([0, 1, 5]);
    this.at = new Vector3([0, 1, 0]);
    this.up = new Vector3([0, 1, 0]);
    this.projectionMatrix = new Matrix4();
    this.viewMatrix = new Matrix4();
    this.updateMatrix();
  }

  updateMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
    this.projectionMatrix.setPerspective(this.pov, canvas.width/canvas.height, 0.1, 1000);
  }

  forwardHelper() {
    var fx = this.at.elements[0] - this.eye.elements[0];
    var fy = this.at.elements[1] - this.eye.elements[1];
    var fz = this.at.elements[2] - this.eye.elements[2];
    var len = Math.sqrt(fx*fx + fy*fy + fz*fz);
    return { x: fx/len, y: fy/len, z: fz/len };
  }

  crossProduct(a, b) {
    var cx = a.y*b.z - a.z*b.y;
    var cy = a.z*b.x - a.x*b.z;
    var cz = a.x*b.y - a.y*b.x;
    var len = Math.sqrt(cx*cx + cy*cy + cz*cz);
    return { x: cx/len, y: cy/len, z: cz/len };
  }

  moveForward(s) {
    s = 0.3; // for now this would be the speed of the player
    var f = this.forwardHelper();
    this.eye.elements[0] += f.x * s;
    this.eye.elements[1] += f.y * s;
    this.eye.elements[2] += f.z * s;
    this.at.elements[0] += f.x * s;
    this.at.elements[1] += f.y * s;
    this.at.elements[2] += f.z * s;
    this.updateMatrix();
  }

  moveBackward(s) {
    s = 0.3;
    var f = this.forwardHelper();
    this.eye.elements[0] -= f.x * s;
    this.eye.elements[1] -= f.y * s;
    this.eye.elements[2] -= f.z * s;
    this.at.elements[0] -= f.x * s;
    this.at.elements[1] -= f.y * s;
    this.at.elements[2] -= f.z * s;
    this.updateMatrix();
  }

  moveLeft(s) {
    s = 0.3;
    var f = this.forwardHelper();
    var up = { x: this.up.elements[0], y: this.up.elements[1], z: this.up.elements[2] };
    var r = this.crossProduct(f, up);
    this.eye.elements[0] -= r.x * s;
    this.eye.elements[1] -= r.y * s;
    this.eye.elements[2] -= r.z * s;
    this.at.elements[0] -= r.x * s;
    this.at.elements[1] -= r.y * s;
    this.at.elements[2] -= r.z * s;
    this.updateMatrix();
  }

  moveRight(s) {
    s = 0.3;
    var f = this.forwardHelper();
    var up = { x: this.up.elements[0], y: this.up.elements[1], z: this.up.elements[2] };
    var r = this.crossProduct(up, f);
    this.eye.elements[0] -= r.x * s;
    this.eye.elements[1] -= r.y * s;
    this.eye.elements[2] -= r.z * s;
    this.at.elements[0] -= r.x * s;
    this.at.elements[1] -= r.y * s;
    this.at.elements[2] -= r.z * s;
    this.updateMatrix();
  }

  panLeft(a) {
    a = a || 3;//alpha value
    var fx = this.at.elements[0] - this.eye.elements[0];
    var fy = this.at.elements[1] - this.eye.elements[1];
    var fz = this.at.elements[2] - this.eye.elements[2];
    var rot = new Matrix4();
    rot.setRotate(a, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var fv = new Vector3([fx, fy, fz]);
    var fd = rot.multiplyVector3(fv);
    this.at.elements[0] = this.eye.elements[0] + fd.elements[0];
    this.at.elements[1] = this.eye.elements[1] + fd.elements[1];
    this.at.elements[2] = this.eye.elements[2] + fd.elements[2];
    this.updateMatrix();
  }

  panRight(a) {
    a = 3;
    this.panLeft(-a);
  }

  exploreMouse(xd, yd) {
    this.panLeft(-xd * 0.3);

    var fx = this.at.elements[0] - this.eye.elements[0];
    var fy = this.at.elements[1] - this.eye.elements[1];
    var fz = this.at.elements[2] - this.eye.elements[2];
    var flen = Math.sqrt(fx*fx + fy*fy + fz*fz);
    fx /= flen; fy /= flen; fz /= flen;

    var ux = this.up.elements[0];
    var uy = this.up.elements[1];
    var uz = this.up.elements[2];

    var rx = fy*uz - fz*uy;
    var ry = fz*ux - fx*uz;
    var rz = fx*uy - fy*ux;
    var rlen = Math.sqrt(rx*rx + ry*ry + rz*rz);
    rx /= rlen; ry /= rlen; rz /= rlen;

    var rm = new Matrix4();
    rm.setRotate(yd * 0.3, rx, ry, rz);
    var fv = new Vector3([fx, fy, fz]);
    var fd = rm.multiplyVector3(fv);

    if (Math.abs(fd.elements[1]) < 0.99) {
      this.at.elements[0] = this.eye.elements[0] + fd.elements[0];
      this.at.elements[1] = this.eye.elements[1] + fd.elements[1];
      this.at.elements[2] = this.eye.elements[2] + fd.elements[2];
    }
    this.updateMatrix();
  }
}