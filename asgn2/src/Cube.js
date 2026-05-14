class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
    
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D( [0,0,0,   1,1,0,   1,0,0 ]);
        drawTriangle3D( [0,0,0,   0,1,0,   1,1,0 ]);

        // Back of cube
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D( [0,0,1,  1,0,1,  1,1,1] );
        drawTriangle3D( [0,0,1,  1,1,1,  0,1,1] );

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        // Top of cube
        drawTriangle3D( [0,1,0,   0,1,1,   1,1,1] );
        drawTriangle3D( [0,1,0,   1,1,1,   1,1,0] );
        
        // Bottom of cube
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        drawTriangle3D( [0,0,0,   1,0,0,   1,0,1] );
        drawTriangle3D( [0,0,0,   1,0,1,   0,0,1] );

        // Left face of cube
        gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);
        drawTriangle3D( [0,0,0,   0,0,1,   0,1,1] );
        drawTriangle3D( [0,0,0,   0,1,1,   0,1,0] );

        // Right face of cube
        gl.uniform4f(u_FragColor, rgba[0]*.75, rgba[1]*.75, rgba[2]*.75, rgba[3]);
        drawTriangle3D( [1,0,0,   1,1,0,   1,1,1] );
        drawTriangle3D( [1,0,0,   1,1,1,   1,0,1] );
    }

}
