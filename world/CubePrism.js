class CubePrism{
  constructor(){
     this.color = [1.0, 1.0, 1.0, 1.0];
     this.matrix = new Matrix4();
  }

  render() {
     var rgba = this.color;
     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);


     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

     // Front of Cube
     drawTriangle3D([0.0,0.0,1.0, .25,0.5,.25, 1.0,0.0,1.0 ]);
     drawTriangle3D([1.0,0.0,1.0, .25,0.5,.25, .75,0.5,.25 ]);
     // Left
     drawTriangle3D([0.0,0.0,0.0, .25,0.5,.25, .25,0.5,.75 ]);
     drawTriangle3D([.25,0.5,.75, 0.0,0.0,0.0, 0.0,0.0,1.0 ]);
     // Right
     drawTriangle3D([1.0,0.0,0.0, .75,0.5,.25, .75,0.5,.75 ]);
     drawTriangle3D([.75,0.5,.75, 1.0,0.0,0.0, 1.0,0.0,1.0 ]);
     // Back
     drawTriangle3D([0.0,0.0,1.0, .25,0.5,.75, 1.0,0.0,1.0 ]);
     drawTriangle3D([1.0,0.0,1.0, .25,0.5,.75, .75,0.5,.75 ]);

     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
     }
}