"use strict";

var vs = `#version 300 es

in vec4 a_position;
in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// Output the color to the fragment shader
out vec4 v_color;

// All shaders have a main function
void main()
{
    // Multiply the position by the matrix
    gl_Position = u_matrix * a_position;

    // Pass the color to the fragment shader.
    v_color = a_color;
}
`;

var fs = `#version 300 es

precision highp float;

// The color passed from the vertex
in vec4 v_color;

uniform vec4 u_colorMult;

out vec4 outColor;

void main()
{
    outColor = v_color * u_colorMult;
}
`;

function main()
{
    // Load coordinates
    // ----------------
    var request = new XMLHttpRequest();  
    request.open("GET", "./galaxy_materials/coords_x.txt", false);   
    request.send(null);  

    var coords_x = request.responseText.split(/\r?\n|\r/);

    request.open("GET", "./galaxy_materials/coords_y.txt", false);   
    request.send(null);

    var coords_y = request.responseText.split(/\r?\n|\r/);

    request.open("GET", "./galaxy_materials/coords_z.txt", false);   
    request.send(null);

    var coords_z = request.responseText.split(/\r?\n|\r/);


    // Get a WebGL context
    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl2");
    if(!gl)
    {
        return;
    }
    
    // Tell the twgl to match position with a_position, n
    // normal with a_normal etc...
    twgl.setAttributePrefix("a_")
    
    var sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 1, 6, 6);

    // Setup GLSL program
    var programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    
    var sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);

    function radToDeg(r)
    {
        return r * 180 / Math.PI;
    }

    function degToRad(d)
    {
        return d * Math.PI / 180;
    }

    function rand(min, max)
    {
        if(max === undefined)
        {
            max = min;
            min = 0;
        }

        return Math.random() * (max - min) + min;
    }

    function emod(x, n)
    {
        return x >= 0 ? (x % n) : ((n - (-x % n)) % n);
    }

    var fieldOfViewRadians = degToRad(90);
    var cameraAngleXRadians = degToRad(0);

    // Put the shapes in an array so it's easy to pick them at random
    var shapes =
    [
        {bufferInfo: sphereBufferInfo, vertexArray: sphereVAO,},
    ];

    var objectsToDraw = [];
    var objects = [];

    // Make infos for each object
    var baseHue = 0;
    var numObjects = 2000;
    for(var ii = 0; ii < numObjects; ++ii)
    {
        // Pick a shape
        var shape = shapes[rand(shapes.length) | 0];

        // Make an object
        var object =
        {
            uniforms:
            {
                u_colorMult: chroma.hsv(emod(baseHue + rand(60), 360), rand(0.8, 1), rand(0.8, 1)).gl(),
                u_matrix: m4.identity(),
            },
            translation: [coords_x[ii] * 200, coords_y[ii] * 200, coords_z[ii] * 200],
            xRotationSpeed: rand(0.1, 0.15),
            yRotationSpeed: rand(0.1, 0.15),
        };
        objects.push(object);

        // Add it to the list of things to draw
        objectsToDraw.push
        ({
            programInfo: programInfo,
            bufferInfo: shape.bufferInfo,
            vertexArray: shape.vertexArray,
            uniforms: object.uniforms,
        });
    }

    var radius = 200;

    function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation)
    {
        var matrix = m4.translate(viewProjectionMatrix,
                                  translation[0],
                                  translation[1],
                                  translation[2]);
        matrix = m4.xRotate(matrix, xRotation);
        return m4.yRotate(matrix, yRotation);
    }

    // Setup a ui.
    webglLessonsUI.setupSlider("#RotateX",            {value: radToDeg(cameraAngleXRadians), slide: updateCameraAngleX, min: -360, max: 360});
    webglLessonsUI.setupSlider("#fieldOfView",        {value: radToDeg(fieldOfViewRadians), slide: updateFieldOfView, min: 0, max: 180});

    function updateCameraAngleX(event, ui) {
        cameraAngleXRadians = degToRad(ui.value);
        drawScene();
    }

    function updateCameraAngleY(event, ui) {
        cameraAngleYRadians = degToRad(ui.value);
        drawScene();
    }

    function updateFieldOfView(event, ui)
    {
        fieldOfViewRadians = degToRad(ui.value);
        drawScene();
    }

    // Resize canvas
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Compute the matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;

    requestAnimationFrame(drawScene);

    // Draw the scene
    function drawScene(time)
    {
        time = time * 0.0005;

        // Clear the canvas
        gl.clearColor(0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        var cameraMatrix = m4.yRotation(cameraAngleXRadians);
        cameraMatrix = m4.multiply(m4.xRotation(time / 50), cameraMatrix);
        cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        // create a viewProjection matrix. This will both apply perspective
        // AND move the world so that the camera is effectively the origin
        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        // Compute the matrices for each object
        objects.forEach(function(object)
        {
            object.uniforms.u_matrix = computeMatrix
            (
                viewProjectionMatrix,
                object.translation,
                object.xRotationSpeed * time,
                object.yRotationSpeed * time
            );
        });

        // Draw the objects
        // ----------------

        var lastUsedProgramInfo = null;
        var lastUsedVertexArray = null;

        objectsToDraw.forEach(function(object)
        {
            var programInfo = object.programInfo;
            var vertexArray = object.vertexArray;

            if(programInfo !== lastUsedProgramInfo)
            {
                lastUsedProgramInfo = programInfo;
                gl.useProgram(programInfo.program);
            }

            // Setup all the needed attributes
            if(lastUsedVertexArray !== vertexArray)
            {
                lastUsedVertexArray = vertexArray;
                gl.bindVertexArray(vertexArray);
            }

            // Set the uniforms
            twgl.setUniforms(programInfo, object.uniforms);

            // Draw
            twgl.drawBufferInfo(gl, object.bufferInfo);
        });

        requestAnimationFrame(drawScene);
    }
}

main();