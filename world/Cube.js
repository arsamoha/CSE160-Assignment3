class Cube {
  constructor() {
    this.type = "cube";
  //   this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
  //   this.size = 5.0;
  //   this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum=-2;
  }

  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);

    // pass the color of a point to u_FragColor uniform variable 
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front of Cube 
    drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9,rgba[3]);

    // Top of Cube
    drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,1, 0,0, 1,0]);
    drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,1, 1,0, 1,1]);

    // Right Face of Cube
    drawTriangle3DUV([1,0,0,  1,1,0,  1,1,1], [0,1, 0,0, 1,0]);
    drawTriangle3DUV([1,0,0,  1,1,1,  1,0,1], [0,1, 1,0, 1,1]); 

    // Back Face of Cube
    drawTriangle3DUV([1,1,1,  0,1,1,  0,0,1], [1,0, 0,0, 0,1]);
    drawTriangle3DUV([1,1,1,  0,0,1,  1,0,1], [1,0, 0,1, 1,1]);

    // Bottom Face of Cube
    drawTriangle3DUV([1,0,1,  0,0,1,  0,0,0], [1,0, 0,0, 0,1]);
    drawTriangle3DUV([1,0,1,  0,0,0,  1,0,0], [1,0, 0,1, 1,1]);

    // Left Face of Cube
    drawTriangle3DUV([0,0,0,  0,0,1,  0,1,1], [0,1, 0,0, 1,0]);
    drawTriangle3DUV([0,0,0,  0,1,1,  0,1,0], [0,1, 1,0, 1,1]);

  }
}