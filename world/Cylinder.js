class Cylinder {
    constructor() {
        this.type = "cylinder";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.radius = 0.3;
        this.height = 2.3;
        this.segments = 50;

        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.init();
    }

    init() {
        let vertices = [];
        let indices = [];
        let step = Math.PI * 2 / this.segments;

        // Generate vertices for the top and bottom circle
        for (let i = 0; i < this.segments; i++) {
            let angle = step * i;
            let x = Math.cos(angle) * this.radius;
            let y = Math.sin(angle) * this.radius;

            // Bottom circle (z = 0)
            vertices.push(x, y, 0);
            // Top circle (z = height)
            vertices.push(x, y, this.height);
        }

        // Push the center points for top and bottom
        vertices.push(0, 0, 0);          // Center bottom
        vertices.push(0, 0, this.height); // Center top

        let bottomCenterIndex = this.segments * 2;
        let topCenterIndex = bottomCenterIndex + 1;

        // Generate indices for the bottom and top circle
        for (let i = 0; i < this.segments; i++) {
            let next = (i + 1) % this.segments;

            // Bottom circle
            indices.push(i * 2, bottomCenterIndex, next * 2);

            // Top circle
            indices.push(i * 2 + 1, next * 2 + 1, topCenterIndex);

            // Side walls
            indices.push(i * 2, next * 2, i * 2 + 1);
            indices.push(i * 2 + 1, next * 2, next * 2 + 1);
        }

        // Create and bind the vertex buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Create and bind the index buffer
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.indexCount = indices.length;
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); // Update model matrix in shader
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}

