// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    //gl_Position = u_ModelMatrix * u_GlobalRotateMatrix * a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  varying vec2 v_UV;
  uniform sampler2D u_sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){
        gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1){           // UV debug color
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0){            // use texture 0
        gl_FragColor = texture2D(u_sampler0, v_UV);
    } else {                                    // error, use red
        gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
  }`;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let canvas;
let gl;

// shader variables used to pass JS info to WebGL
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;
let u_sampler0;

// UI variables
let g_selectedSize = 10; 
let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSegments = 10;
let g_globalAngleX = 0.0;
let g_globalAngleY = 0.0;
let g_armAngle = -40.0;
let g_lowerArmAngle = 0.0;
let g_animationOn = false;
let g_legAngle = 0.0;

// colors for gengar
let purple = [0.314, 0.0, 0.78, 1.0];
let darkPurple = [0.314 * 0.8, 0.0 * 0.8, 0.78 *0.8, 1.0];

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById("webgl");

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    // enable depth test
    gl.enable(gl.DEPTH_TEST);

    colorCanvas = document.getElementById("colorCanvas");
    colorgl = colorCanvas.getContext("webgl", { preserveDrawingBuffer: true });
    if(!colorgl){
        console.log("Failed to get the rendering context for colorCanvas");
        return;
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to intialize shaders.");
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if(a_UV < 0){
        console.log("Failed to get the storage location of a_UV");
        return;
    }
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (!u_FragColor) {
        console.log("Failed to get the storage location of u_FragColor");
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    if(!u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
    if (!u_GlobalRotateMatrix){
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    if (!u_ViewMatrix){
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
    if (!u_ViewMatrix){
        console.log("Failed to get the storage location of u_ProjectionMatrix");
        return;
    }

    let identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    u_sampler0 = gl.getUniformLocation(gl.program, 'u_sampler0');
    if(!u_sampler0){
        console.log("Failed to get the storage location of u_sampler0");
        return false;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if(!u_whichTexture){
        console.log("Failed to get the storage location of u_whichTexture");
        return false;
    }
}

function initTextures(numTexture, imgSrc){
    // change this function and next function to work with other textures

    let image = new Image();
    if(!image){
        console.log("Failed to create the image object");
        return false;
    }

    image.onload = () => { sendImageToTexture(image, numTexture); };
    image.src = imgSrc;

    return true;
}

function sendImageToTexture(image, numTexture){
    let texture = gl.createTexture();                                           // create a texture object
    if(!texture){
        console.log("Failed to create the texture object");
        return false;
    }

    let samplerVar;
    let glTex;
    switch(numTexture){
        case 0:
            samplerVar = u_sampler0;
            glTex = gl.TEXTURE0;
            break;
        case 1:
            samplerVar = u_sampler1;
            glTex = gl.TEXTURE1;
            break;
        case 2:
            samplerVar = u_sampler2;
            glTex = gl.TEXTURE2;
            break;
        case 3:
            samplerVar = u_sampler3;
            glTex = gl.TEXTURE3;
            break;
        case 4:
            samplerVar = u_sampler4;
            glTex = gl.TEXTURE4;
            break;
        case 5:
            samplerVar = u_sampler5;
            glTex = gl.TEXTURE5;
            break;
        case 6:
            samplerVar = u_sampler6;
            glTex = gl.TEXTURE6;
            break;
        case 7:
            samplerVar = u_sampler7;
            glTex = gl.TEXTURE7;
            break;
        case 8:
            samplerVar = u_sampler8;
            glTex = gl.TEXTURE8;
            break;
        case 9:
            samplerVar = u_sampler9;
            glTex = gl.TEXTURE9;
            break;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);                                  // flip coordinates to match GL coords                              // flip image's y axis
    gl.activeTexture(glTex);                                              // enable texture unit0
    gl.bindTexture(gl.TEXTURE_2D, texture);                                     // bind texture object to target
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);          // set texture parameters
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);   // set texture image to the image we passed in 
    gl.uniform1i(samplerVar, numTexture);                                                // pass the texure unit 0 to u_sampler0
    console.log("texture loaded");
}

function updateAnimationAngles(){
    if(g_animationOn){
        g_lowerArmAngle = (15*Math.sin(g_seconds));
        g_armAngle = (10*Math.sin(g_seconds));
        g_legAngle = (15*Math.sin(g_seconds));
    }
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // -------- shapes list ----------------
    // commented out temporarily -----------
    // let len = g_shapesList.length;
    // for(let i = 0; i < len; i++){
    //     g_shapesList[i].render();
    // }
    // -------------------------------------

    //drawTriangle3D([-1.0,0.0,0.0, -0.5, -1.0, 0.0, 0.0, 0.0, 0.0]);

    let projMat = new Matrix4();
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    let viewMat = new Matrix4();
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // pass the matrix to rotate the shape
    let globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleX, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    let body = new Cube();
    body.color = purple;
    body.matrix.translate(-0.4, -0.5, 0.0);
    let bodyMatrix = new Matrix4(body.matrix);
    body.matrix.scale(0.75, 0.75, 0.75);
    body.textureNum = 0;
    body.render();

    let rightEar = new Pyramid();
    rightEar.color = purple;
    rightEar.matrix = new Matrix4(bodyMatrix);
    rightEar.matrix.translate(0.0, 0.7, 0.4);
    rightEar.matrix.rotate(45, 50, -40, 0);
    rightEar.matrix.scale(0.5, 0.7, 0.5);
    rightEar.render();

    let leftEar = new Pyramid();
    leftEar.color = purple;
    leftEar.matrix = new Matrix4(bodyMatrix);
    leftEar.matrix.translate(0.3, 0.7, 0.6);
    leftEar.matrix.rotate(55, 70, 30, 0);
    leftEar.matrix.scale(0.5, 0.7, 0.5);
    leftEar.render();

    let topSpike1 = new Pyramid();
    topSpike1.color = darkPurple;
    topSpike1.matrix = new Matrix4(bodyMatrix);
    topSpike1.matrix.translate(0.15, 0.7, 0.5);
    topSpike1.matrix.scale(0.25,0.15, 0.25);
    topSpike1.render();

    let topSpike2 = new Pyramid();
    topSpike2.color = darkPurple;
    topSpike2.matrix = new Matrix4(bodyMatrix);
    topSpike2.matrix.translate(0.35, 0.7, 0.5);
    topSpike2.matrix.scale(0.25,0.15, 0.25);
    topSpike2.render();

    let topSpike3 = new Pyramid();
    topSpike3.color = darkPurple;
    topSpike3.matrix = new Matrix4(bodyMatrix);
    topSpike3.matrix.translate(0.25, 0.7, 0.4);
    topSpike3.matrix.scale(0.25,0.15, 0.25);
    topSpike3.render();

    let smile = new Pyramid();
    smile.color = [1, 1, 1, 1];
    smile.matrix = new Matrix4(bodyMatrix);
    smile.matrix.translate(0.1, 0.3, -0.01);
    smile.matrix.scale(0.5, 0.15, -0.01);
    smile.matrix.rotate(180, 180, 0, 1);
    smile.render();

    let rightArmMat;
    let leftArmMat;

    let rightArm = new Cube();
    rightArm.color = purple;
    rightArm.matrix = new Matrix4(bodyMatrix);
    rightArm.matrix.translate(0.75, 0.5, 0.2);
    rightArm.matrix.rotate(-g_armAngle, 0, 0, 1);
    rightArmMat = new Matrix4(rightArm.matrix);
    rightArm.matrix.scale(0.25, -0.2, 0.25);
    rightArm.render();

    let leftArm = new Cube();
    leftArm.color = purple;
    leftArm.matrix = new Matrix4(bodyMatrix);
    leftArm.matrix.translate(0, 0.5, 0.2);
    leftArm.matrix.rotate(g_armAngle, 0, 0, 1);
    leftArmMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(-0.25, -0.2, 0.25);
    leftArm.render();

    let lowerRightArm = new Cube();
    lowerRightArm.color = purple;
    lowerRightArm.matrix = new Matrix4(rightArmMat);
    lowerRightArm.matrix.translate(0.25, -0.2, 0.25);
    lowerRightArm.matrix.rotate(g_lowerArmAngle, 1, 0, 0);
    lowerRightArm.matrix.scale(-0.25, -0.2, -0.25);
    lowerRightArm.render();

    let lowerLeftArm = new Cube();
    lowerLeftArm.color = purple;
    lowerLeftArm.matrix = new Matrix4(leftArmMat);
    lowerLeftArm.matrix.translate(0, -0.2, 0.25);
    lowerLeftArm.matrix.rotate(g_lowerArmAngle, 1, 0, 0);
    lowerLeftArm.matrix.scale(-0.25, -0.2, -0.25);
    lowerLeftArm.render();

    let rightEye = new Pyramid();
    rightEye.color = [1.0, 0.0, 0.0, 1.0];
    rightEye.matrix = new Matrix4(bodyMatrix);
    rightEye.matrix.translate(0.7, 0.4, -0.05);
    rightEye.matrix.scale(0.25, 0.1, 0.05);
    rightEye.matrix.rotate(90, 0, 0, 1);
    rightEye.render();

    let rightPupil = new Cube();
    rightPupil.color = [0.0, 0.0, 0.0, 1.0];
    rightPupil.matrix = new Matrix4(bodyMatrix);
    rightPupil.matrix.translate(0.61, 0.42, -0.06);
    rightPupil.matrix.scale(0.03, 0.05, 0.05);
    rightPupil.render();

    let leftEye = new Pyramid();
    leftEye.color = [1.0, 0.0, 0.0, 1.0];
    leftEye.matrix = new Matrix4(bodyMatrix);
    leftEye.matrix.translate(0.05, 0.5, -0.05);
    leftEye.matrix.scale(0.25, 0.1, 0.05);
    leftEye.matrix.rotate(-90, 0, 0, 1);
    leftEye.render();

    let leftPupil = new Cube();
    leftPupil.color = [0.0, 0.0, 0.0, 1.0];
    leftPupil.matrix = new Matrix4(bodyMatrix);
    leftPupil.matrix.translate(0.1, 0.42, -0.06);
    leftPupil.matrix.scale(0.03, 0.05, 0.05);
    leftPupil.render();

    let leftLegMat;
    let leftLeg = new Cube();
    leftLeg.color = darkPurple;
    leftLeg.matrix = new Matrix4(bodyMatrix);
    leftLeg.matrix.translate(0.0001, -0.2, 0.2);
    leftLeg.matrix.rotate(g_legAngle, -1, 0, 0);
    leftLegMat = new Matrix4(leftLeg.matrix);   // copy this matrix for the next joint
    leftLeg.matrix.scale(0.25, 0.5, 0.25);
    leftLeg.render();

    let rightLegMat;
    let rightLeg = new Cube();
    rightLeg.color = darkPurple;
    rightLeg.matrix = new Matrix4(bodyMatrix);
    rightLeg.matrix.translate(0.49, -0.2, 0.2);
    rightLeg.matrix.rotate(-g_legAngle, -1, 0, 0);
    rightLegMat = new Matrix4(rightLeg.matrix);   // copy this matrix for the next joint
    rightLeg.matrix.scale(0.25, 0.3, 0.25);
    rightLeg.render();
    
    let tail = new Cone();
    tail.color = darkPurple;
    tail.matrix = new Matrix4(bodyMatrix);
    tail.matrix.translate(0.4, 0.1, 0.7);
    tail.matrix.scale(1.5, 1.5, 0.6);
    tail.render();


}

function convertCoords(ev) {
    let x = ev.clientX; // x coordinate of a mouse pointer
    let y = ev.clientY; // y coordinate of a mouse pointer
    let rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    return [x, y];
}

let g_shapesList = [];


function updateColor(){
    colorgl.clearColor(g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]); 
    colorgl.clear(colorgl.COLOR_BUFFER_BIT);
}

function setupHTMLElements(){
   
    // sliders
    document.getElementById("angleSliderX").addEventListener("mousemove", function () { g_globalAngleX = this.value; renderAllShapes(); } );
    document.getElementById("angleSliderY").addEventListener("mousemove", function () { g_globalAngleY = this.value; renderAllShapes(); } );
    document.getElementById("armSlider").addEventListener("mousemove", function () { g_armAngle = this.value; renderAllShapes(); } );
    document.getElementById("lowerArmSlider").addEventListener("mousemove", function () { g_lowerArmAngle = this.value; renderAllShapes(); } );
    document.getElementById("legSlider").addEventListener("mousemove", function () { g_legAngle = this.value; renderAllShapes(); } );

    // Buttons 
    // document.getElementById("animationBttn").onclick = function () { g_animationOn = true };
    // document.getElementById("animationOffBttn").onclick = function () { g_animationOn = false };
}

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;
    console.log(g_seconds);
    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    setupHTMLElements();

    initTextures(0, 'sky.jpg');

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderAllShapes();
    //requestAnimationFrame(tick);
}