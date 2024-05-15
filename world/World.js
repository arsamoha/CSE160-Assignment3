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
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`;

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3; 
  uniform int u_whichTexture;
  uniform bool u_Clicked;
  void main() {
    if(u_Clicked){
      vec4(1,1,1,1);
   }

   if (u_whichTexture == -2) {
    gl_FragColor = u_FragColor;
 } else if (u_whichTexture == -1) {
   gl_FragColor = vec4(v_UV,1.0,1.0);
 } else if (u_whichTexture == 0) {
   gl_FragColor = texture2D(u_Sampler0, v_UV);
 } else if (u_whichTexture == 1) {
   gl_FragColor = texture2D(u_Sampler1, v_UV);
 } else if (u_whichTexture == 2) {
  gl_FragColor = texture2D(u_Sampler2, v_UV);
 } else if (u_whichTexture == 3) {
  gl_FragColor = texture2D(u_Sampler3, v_UV);
 } else {
   gl_FragColor = vec4(1,.2,.2,1);
 }
  }`;

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let g_rotateX = 0;
let g_rotateY = 0;
let mouseDown = false;
let lastMouseX = null;
let lastMouseY = null;
var g_camera;
var u_Clicked;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;
let g_worldPieces = [];

function setUpWebGL() {
  canvas = document.getElementById("webgl");

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablestoGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }

  u_Clicked = gl.getUniformLocation(gl.program, "u_Clicked");
  if (!u_Clicked) {
    console.log("Failed to get u_Clicked");
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sampler1");
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  if (!u_Sampler2) {
    console.log("Failed to get the storage location of u_Sampler2");
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, "u_Sampler3");
  if (!u_Sampler3) {
    console.log("Failed to get the storage location of u_Sampler3");
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    console.log("Failed to get the storage loction of u_whichTexture");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 180;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_footAngle1=0;
let g_footAngle2=0;
let g_legAngle1=0;
let g_legAngle2=0;
let g_legAngle3=0;
let g_legAngle4=0;
let g_mouthAngle=-49;
let g_tailAngle=0;

function addActionsForHtmlUI() {
  document.getElementById("animationYellowOffButton").onclick = function () {
    g_yellowAnimation = false;
  };
  document.getElementById("animationYellowOnButton").onclick = function () {
    g_yellowAnimation = true;
  };
  document.getElementById("animationMagentaOffButton").onclick = function () {
    g_magentaAnimation = false;
  };
  document.getElementById("animationMagentaOnButton").onclick = function () {
    g_magentaAnimation = true;
  };

  document
    .getElementById("magentaSlide")
    .addEventListener("mousemove", function () {
      g_magentaAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("yellowSlide")
    .addEventListener("mousemove", function () {
      g_yellowAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderAllShapes();
    });
}

function initTextures() {
  var image = new Image();
  var image1 = new Image();
  var painting = new Image();
  var rug = new Image();

  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }
  image.onload = function () {
    sendImageToTEXTURE0(image);
  };
  image.src = "../resources/wallpaper.jpg";

  if (!image1) {
    console.log("Failed to create the image1 object");
    return false;
  }
  image1.onload = function () {
    sendImageToTEXTURE1(image1);
  };
  image1.src = "../resources/woodfloor.jpg";

  if (!painting) {
    console.log("Failed to create the painting object");
    return false; 
  }
  painting.onload = function () {
    sendImageToTEXTURE2(painting);
  };
  painting.src = "../resources/painting.png";

  if (!rug) {
    console.log("Failed to create the rug object");
    return false;
  }
  rug.onload = function () {
    sendImageToTEXTURE3(rug);
  };
  rug.src = "../resources/rug.jpeg";

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);

  console.log("finished loadTexture");
}

function sendImageToTEXTURE1(image) {
  var texture1 = gl.createTexture();
  if (!texture1) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);

  console.log("finished loadTexture1");
}

function sendImageToTEXTURE2(image) {
  var texture2 = gl.createTexture();
  if (!texture2) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);

  console.log("finished loadTexture2");
}

function sendImageToTEXTURE3(image) {
  var texture3 = gl.createTexture();
  if (!texture3) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture3);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler3, 3);

  console.log("finished loadTexture3");
}

function main() {
  //set up canvas and gl variables
  setUpWebGL();
  //set up GLSL shader programs and connect to GLSL variables
  connectVariablestoGLSL();

  //set up actions for the HTML UI elements
  addActionsForHtmlUI();

  g_camera = new Camera();
  document.onkeydown = keydown;

  canvas.onmousemove = function (ev) {
    mouseCam(ev);
  };

  initTextures();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  //save current time
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = 15 * Math.abs(Math.sin(g_seconds));
  }

  if (g_magentaAnimation) {
    g_magentaAngle = 10 * Math.abs(Math.sin(2 * g_seconds));
  }
}

function check(ev) {
  var picked = false;
  var x = ev.clientX,
    y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();
  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
    // inside canvas
    var x_in_canvas = x - rect.left,
      y_in_canvas = rect.bottom - y;
    gl.uniform1i(u_Clicked, 1); // Pass true to u_Clicked
    // Read pixel at the clicked position
    var pixels = new Uint8Array(4); // Array for storing the pixel value
    gl.readPixels(
      x_in_canvas,
      y_in_canvas,
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
    );
    console.log(pixels[0]);
    if (pixels[0] == 255)
      // The mouse in on cube if R(pixels[0]) is 255
      picked = true;

    gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked(rewrite the cube)
  }
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  // set coordinates based on origin
  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  // Print coordinate in console
  // console.log("("+x+","+y+")");

  return [x, y];
}

function mouseCam(ev) {
  coord = convertCoordinatesEventToGL(ev);
  if (coord[0] < 0.5) {
    // left side
    g_camera.panMLeft(coord[0] * -10);
  } else {
    g_camera.panMRight(coord[0] * -10);
  }
}

var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

function keydown(ev) {
  if (ev.keyCode == 39) {
    g_camera.right();
  } else if (ev.keyCode == 37) {
    g_camera.left();
  } else if (ev.keyCode == 81) {
    g_camera.panLeft();
  } else if (ev.keyCode == 69) {
    g_camera.panRight();
  }

  renderAllShapes();
  console.log(ev.keyCode);
}

function getIndex(x, y, z) {
  return ((z * SIZE.x * SIZE.y) + (y * SIZE.x) + x) + 2;
}

// Places a block at the specified coordinates
function setBlock(x, y, z) {
  if(g_worldPieces[getIndex(x,y,z)]) {
    // Block alrady exists. Don't place another one
    return;
  }

  let block = new Cube();
  block.color = [1.0,0.0,0.0,1.0];
  block.setTranslate(x - (SIZE.x / 2), y + MIN_Y, z - (SIZE.z / 2));
  block.setScale(1, 1, 1);
  g_worldPieces[getIndex(x, y, z)] = block;
}

// Removes a block at the specified coordinates
function removeBlock(x, y, z) {
  g_worldPieces[getIndex(x, y, z)] = undefined;
}

//Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  //check the time at the start of this function
  var startTime = performance.now();

  var projMat = g_camera.projMat;
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = g_camera.viewMat;
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //for clearing the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  var sky = new Cube();
  sky.color = [0.0, 0.0, 1.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum = 1;
  body.matrix.translate(0, -0.75, 0.0);
  body.matrix.scale(10, 0, 10);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  // Leg Joint 1
  var foot1leg = new Cube();
  foot1leg.color = [0.29, 0.29, 0.29, 1.0];
  foot1leg.matrix.translate(0.1, -0.43, -.11);
  foot1leg.matrix.rotate(180,1,0,0);
  foot1leg.matrix.rotate(g_legAngle1,1,0,0);
  var leg1CoordintesMat=new Matrix4(foot1leg.matrix);
  foot1leg.matrix.scale(0.08, .3, .1);
  foot1leg.render();

  var foot1 = new Cube();
  foot1.color = [0.58, 0.565, 0.565, 1.0];
  foot1.matrix = leg1CoordintesMat;
  foot1.matrix.translate(-0.02, 0.21, -0.005);
  foot1.matrix.rotate(360,1,0,0);
  foot1.matrix.rotate(g_footAngle1,1,0,0);
  foot1.matrix.scale(0.12, .12, .11);
  foot1.render();


  // Leg Joint 2
  var foot2leg = new Cube();
  foot2leg.color = [0.29, 0.29, 0.29, 1.0];
  foot2leg.matrix.translate(-0.25, -0.45, -.11);
  foot2leg.matrix.rotate(180,1,0,0);
  foot2leg.matrix.rotate(g_legAngle2,1,0,0);
  var leg2CoordintesMat=new Matrix4(foot2leg.matrix);
  foot2leg.matrix.scale(0.08, .3, .1);
  foot2leg.render();

  var foot2 = new Cube();
  foot2.color = [0.58, 0.565, 0.565, 1.0];
  foot2.matrix = leg2CoordintesMat;
  foot2.matrix.translate(-0.01, 0.19, -0.005);
  foot2.matrix.rotate(360,1,0,0);
  foot2.matrix.rotate(g_footAngle2,1,0,0);
  foot2.matrix.scale(0.12, .12, .11);
  foot2.render();
  

  // Leg Joint 3
  var foot3leg = new Cube();
  foot3leg.color = [0.29, 0.29, 0.29, 1.0];
  foot3leg.matrix.translate(0.1, -0.45, 0.33);
  foot3leg.matrix.rotate(180,1,0,0);
  foot3leg.matrix.rotate(g_legAngle3,1,0,0);
  var leg3CoordintesMat=new Matrix4(foot3leg.matrix);
  foot3leg.matrix.scale(0.08, .3, .1);
  foot3leg.render();

  var foot3 = new Cube();
  foot3.color = [0.58, 0.565, 0.565, 1.0];
  foot3.matrix = leg3CoordintesMat;
  foot3.matrix.translate(-0.01, 0.19, -0.005);
  foot3.matrix.rotate(360,1,0,0);
  foot3.matrix.scale(0.12, .12, .11);
  foot3.render();


  // Leg Joint 4
  var foot4leg = new Cube();
  foot4leg.color = [0.29, 0.29, 0.29, 1.0];
  foot4leg.matrix.translate(-0.25, -0.45, 0.33);
  foot4leg.matrix.rotate(180,1,0,0);
  foot4leg.matrix.rotate(g_legAngle4,1,0,0);
  var leg4CoordintesMat=new Matrix4(foot4leg.matrix);
  foot4leg.matrix.scale(0.08, .3, .1);
  foot4leg.render();

  var foot4 = new Cube();
  foot4.color = [0.58, 0.565, 0.565, 1.0];
  foot4.matrix = leg4CoordintesMat;
  foot4.matrix.translate(-0.01, 0.19, -0.01);
  foot4.matrix.rotate(0,1,0,0);
  foot4.matrix.scale(0.12, .12, .11);
  foot4.render();


  // Cat Body
  var body = new Cube();
  body.color = [0.58, 0.565, 0.565, 1.0];
  body.matrix = leg2CoordintesMat;
  body.matrix.translate(-0.05, -2.9, -4);
  body.matrix.rotate(0,1,0,0);
  var bodyCoordinatesMat=new Matrix4(body.matrix);
  body.matrix.scale(4, 2, 5);
  body.render();


  // Cat Head
  var head = new Cube();
  head.color = [0.58, 0.565, 0.565, 1.0];
  head.matrix.translate(-0.3, -0.3, -0.3);
  head.matrix.rotate(0,1,0,0);
  head.matrix.scale(0.55, 0.4, 0.35);
  head.render();
  

  // Snout Area
  var snoutRect = new Cube();
  snoutRect.color = [0.831, 0.831, 0.831, 1.0];
  snoutRect.matrix.translate(-0.17, -0.25, -0.35);
  snoutRect.matrix.rotate(0,1,0,0);
  snoutRect.matrix.scale(0.3, 0.1, 0.05);
  snoutRect.render();

  var snoutSq1 = new Cube();
  snoutSq1.color = [0.831, 0.831, 0.831, 1.0];
  snoutSq1.matrix.translate(-0.17, -0.28, -0.35);
  snoutSq1.matrix.rotate(0,1,0,0);
  snoutSq1.matrix.scale(0.12, 0.12, 0.05);
  snoutSq1.render();

  var snoutSq2 = new Cube();
  snoutSq2.color = [0.831, 0.831, 0.831, 1.0];
  snoutSq2.matrix.translate(0.01, -0.28, -0.35);
  snoutSq2.matrix.rotate(0,1,0,0);
  snoutSq2.matrix.scale(0.12, 0.12, 0.05);
  snoutSq2.render();

  var mouth = new Cube();
  mouth.color = [0.831, 0.831, 0.831, 1.0];
  var mouthOffset = -0.1 + (g_mouthAngle - (-40)) * (0.2 / (-31 - (-40)));
  mouth.matrix.translate(-0.08, mouthOffset, -0.35);
  mouth.matrix.rotate(0,1,0,0);
  mouth.matrix.scale(0.12, 0.03, 0.05);
  mouth.render();


  // Nose
  var noseBridge = new Cube();
  noseBridge.color = [0.29, 0.29, 0.29, 1.0];
  noseBridge.matrix.translate(-0.08, -0.15, -0.35);
  noseBridge.matrix.rotate(0,1,0,0);
  noseBridge.matrix.scale(0.12, 0.04, 0.05);
  noseBridge.render();

  var noseRect1 = new Cube();
  noseRect1.color = [0.831, 0.62, 0.588, 1.0];
  noseRect1.matrix.translate(-0.055, -0.17, -0.4);
  noseRect1.matrix.rotate(0,1,0,0);
  noseRect1.matrix.scale(0.07, 0.04, 0.05);
  noseRect1.render();

  var noseRect2 = new Cube();
  noseRect2.color = [0.831, 0.62, 0.588, 1.0];
  noseRect2.matrix.translate(-0.001, -0.2, -0.4);
  noseRect2.matrix.rotate(90,0,0,1);
  noseRect2.matrix.scale(0.07, 0.04, 0.05);
  noseRect2.render();


  // Eyes
  var leftEye = new Cube();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix.translate(-0.13, -0.15, -0.32);
  leftEye.matrix.rotate(0,1,0,0);
  leftEye.matrix.scale(0.08, 0.13, 0.05);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix.translate(0.008, -0.15, -0.32);
  rightEye.matrix.rotate(0,1,0,0);
  rightEye.matrix.scale(0.08, 0.13, 0.05);
  rightEye.render();

  var whiteLeftEye = new Cube();
  whiteLeftEye.color = [1.0, 1.0, 1.0, 1.0];
  whiteLeftEye.matrix.translate(-0.15, -0.15, -0.31);
  whiteLeftEye.matrix.rotate(0,1,0,0);
  whiteLeftEye.matrix.scale(0.12, 0.15, 0.05);
  whiteLeftEye.render();
  
  var whiteRightEye = new Cube();
  whiteRightEye.color = [1.0, 1.0, 1.0, 1.0];
  whiteRightEye.matrix.translate(-0.01, -0.15, -0.31);
  whiteRightEye.matrix.rotate(0,1,0,0);
  whiteRightEye.matrix.scale(0.12, 0.15, 0.05);
  whiteRightEye.render();

  var glintLeftEye = new Cube();
  glintLeftEye.color = [1.0, 1.0, 1.0, 1.0];
  glintLeftEye.matrix.translate(-0.11, -0.07, -0.322);
  glintLeftEye.matrix.rotate(0,1,0,0);
  glintLeftEye.matrix.scale(0.02, 0.02, 0.05);
  glintLeftEye.render();

  var glintRightEye = new Cube();
  glintRightEye.color = [1.0, 1.0, 1.0, 1.0];
  glintRightEye.matrix.translate(0.03, -0.07, -0.322);
  glintRightEye.matrix.rotate(0,1,0,0);
  glintRightEye.matrix.scale(0.02, 0.02, 0.05);
  glintRightEye.render();

  // Tail
  var bottomTail = new Cube();
  bottomTail.color = [0.29, 0.29, 0.29, 1.0];
  bottomTail.matrix = bodyCoordinatesMat;
  bottomTail.matrix.translate(1.5, 0.5, 1.2);
  bottomTail.matrix.rotate(180,1,0,0);
  bottomTail.matrix.rotate(g_tailAngle,0,0,1);
  var bottomTailCoordinatesMat=new Matrix4(bottomTail.matrix);
  bottomTail.matrix.scale(1, 4, 1);
  bottomTail.render();

  var topTail = new Cube();
  topTail.color = [0.58, 0.565, 0.565, 1.0];
  topTail.matrix = bottomTailCoordinatesMat;
  topTail.matrix.translate(-0.001, 0.2, 0.1);
  topTail.matrix.rotate(0,1,0,0);
  topTail.matrix.scale(0.08, .28, .1);
  topTail.render();

  var cubePrism = new CubePrism();
  cubePrism.color = [0.29, 0.29, 0.29, 1.0];
  cubePrism.matrix.translate(0.05, 0.1, -0.2);
  cubePrism.matrix.rotate(0,1,0,0);
  cubePrism.matrix.scale(0.2, 0.2, 0.1);
  cubePrism.render();

  var cubePrism = new CubePrism();
  cubePrism.color = [.831, 0.62, 0.588, 1.0];
  cubePrism.matrix.translate(0.09, 0.1, -0.2);
  cubePrism.matrix.rotate(0,1,0,0);
  cubePrism.matrix.scale(0.12, 0.12, 0.05);
  cubePrism.render();

  var cubePrism = new CubePrism();
  cubePrism.color = [0.29, 0.29, 0.29, 1.0];
  cubePrism.matrix.translate(-0.3, 0.1, -0.2);
  cubePrism.matrix.rotate(0,1,0,0);
  cubePrism.matrix.scale(0.2, 0.2, 0.1);
  cubePrism.render();

  var cubePrism = new CubePrism();
  cubePrism.color = [.831, 0.62, 0.588, 1.0];
  cubePrism.matrix.translate(-0.26, 0.1, -0.2);
  cubePrism.matrix.rotate(0,1,0,0);
  cubePrism.matrix.scale(0.12, 0.12, 0.05);
  cubePrism.render();

  // Sofa
  var sofaleg = new Cube();
  sofaleg.color = [0.431, 0.243, 0.082, 1.0];
  sofaleg.matrix.translate(-2.8, -0.74, 2.5);
  sofaleg.matrix.rotate(360,1,0,0);
  sofaleg.matrix.scale(0.12, .2, .11);
  sofaleg.render();

  var sofaleg2 = new Cube();
  sofaleg2.color = [0.431, 0.243, 0.082, 1.0];
  sofaleg2.matrix.translate(-2.8, -0.74, 3.9);
  sofaleg2.matrix.rotate(360,1,0,0);
  sofaleg2.matrix.scale(0.12, .2, .11);
  sofaleg2.render();

  var sofaleg3 = new Cube();
  sofaleg3.color = [0.431, 0.243, 0.082, 1.0];
  sofaleg3.matrix.translate(0.9, -0.74, 2.5);
  sofaleg3.matrix.rotate(360,1,0,0);
  sofaleg3.matrix.scale(0.12, .2, .11);
  sofaleg3.render();

  var sofaleg4 = new Cube();
  sofaleg4.color = [0.431, 0.243, 0.082, 1.0];
  sofaleg4.matrix.translate(0.9, -0.74, 3.9);
  sofaleg4.matrix.rotate(360,1,0,0);
  sofaleg4.matrix.scale(0.12, .2, .11);
  sofaleg4.render();

  var base = new Cube();
  base.color = [0.651, 0.204, 0.133, 1.0];
  base.matrix.translate(-2.9, -0.53, 2);
  base.matrix.rotate(360,1,0,0);
  base.matrix.scale(3.9, 0.5, 2.3);
  base.render();

  var rightside = new Cube();
  rightside.color = [0.651, 0.204, 0.133, 1.0];
  rightside.matrix.translate(-2.9, -0.2, 2);
  rightside.matrix.rotate(360,1,0,0);
  rightside.matrix.scale(0.5, 0.5, 2.3);
  rightside.render();

  var leftside = new Cube();
  leftside.color = [0.651, 0.204, 0.133, 1.0];
  leftside.matrix.translate(0.5, -0.2, 2);
  leftside.matrix.rotate(360,1,0,0);
  leftside.matrix.scale(0.5, 0.5, 2.3);
  leftside.render();

  var back = new Cube();
  back.color = [0.651, 0.204, 0.133, 1.0];
  back.matrix.translate(-2.9, -0.1, 3.7);
  back.matrix.rotate(360,1,0,0);
  back.matrix.scale(3.9, 0.9, -0.2);
  back.render();

  // Painting
  var painting = new Cube();
  painting.color = [1.0,0.0,0.0,1.0];
  painting.textureNum = 2;
  painting.matrix.translate(-2.9, 1, 4);
  painting.matrix.rotate(360,1,0,0);
  painting.matrix.scale(3.9, 3.9, -0.2);
  painting.render();

  // Cat Tower
  var towerBase = new Cube();
  towerBase.color = [0.239, 0.153, 0.071, 1.0];
  towerBase.matrix.translate(1.5, -0.74, 2.8);
  towerBase.matrix.rotate(360,1,0,0);
  towerBase.matrix.scale(2.5, .15, 1.5);
  towerBase.render();

  var cubicle = new Cube();
  cubicle.color = [0.941, 0.776, 0.494, 1.0];
  cubicle.matrix.translate(1.7, -0.7, 3);
  cubicle.matrix.rotate(360,1,0,0);
  cubicle.matrix.scale(0.9, 1, 0.9);
  cubicle.render();

  var door = new Cube();
  door.color = [0, 0, 0, 1.0];
  door.matrix.translate(1.85, -0.61, 2.95);
  door.matrix.rotate(360,1,0,0);
  door.matrix.scale(0.6, 0.8, 0.1);
  door.render();

  var longPole = new Cube();
  longPole.color = [0.988, 0.886, 0.714, 1.0];
  longPole.matrix.translate(2.1, -0.7, 3.2);
  longPole.matrix.rotate(360,1,0,0);
  longPole.matrix.scale(0.2, 3, 0.2);
  longPole.render();
  
  var topBase = new Cube();
  topBase.color = [0.239, 0.153, 0.071, 1.0];
  topBase.matrix.translate(1.7, 2.3, 2.8);
  topBase.matrix.rotate(360,1,0,0);
  topBase.matrix.scale(1, .15, 1);
  topBase.render();
  
  var shortPole = new Cube();
  shortPole.color = [0.988, 0.886, 0.714, 1.0];
  shortPole.matrix.translate(3.2, -0.7, 3.2);
  shortPole.matrix.rotate(360,1,0,0);
  shortPole.matrix.scale(0.2, 1.8, 0.2);
  shortPole.render();

  var middleBase = new Cube();
  middleBase.color = [0.239, 0.153, 0.071, 1.0];
  middleBase.matrix.translate(1.5, 1.1, 2.8);
  middleBase.matrix.rotate(360,1,0,0);
  middleBase.matrix.scale(2.5, .15, 1.5);
  middleBase.render();

  var bottomBase = new Cube();
  bottomBase.color = [0.239, 0.153, 0.071, 1.0];
  bottomBase.matrix.translate(2.9, 0.2, 2.8);
  bottomBase.matrix.rotate(360,1,0,0);
  bottomBase.matrix.scale(0.7, .15, 0.7);
  bottomBase.render();

  // Rug
  var rug = new Cube();
  rug.color = [0.239, 0.153, 0.071, 1.0];
  rug.textureNum = 3;
  rug.matrix.translate(-3, -0.74, -2);
  rug.matrix.rotate(360,1,0,0);
  rug.matrix.scale(4, .1, 4);
  rug.render();

  // Light
  var lightString = new Cube();
  lightString.color = [0.431, 0.431, 0.427, 1.0];
  lightString.matrix.translate(0, 2, -0.1);
  lightString.matrix.rotate(360,1,0,0);
  lightString.matrix.scale(0.02, 1, 0.02);
  lightString.render();
  
  var metal = new Cube();
  metal.color = [0.431, 0.431, 0.427, 1.0];
  metal.matrix.translate(-0.04, 2, -0.15);
  metal.matrix.rotate(360,1,0,0);
  metal.matrix.scale(0.1, 0.1, 0.1);
  metal.render();
  
  var casing = new CubePrism();
  casing.color = [0.624, 0.859, 0.4, 1.0];
  casing.matrix.translate(-0.23, 1.75, -0.3);
  casing.matrix.rotate(0,1,0,0);
  casing.matrix.scale(0.5, 0.5, 0.4);
  casing.render();

  var light = new Cube();
  light.color = [0.945, 0.949, 0.153, 1.0];
  light.matrix.translate(-0.13, 1.69, -0.18);
  light.matrix.rotate(360,1,0,0);
  light.matrix.scale(0.3, 0.05, 0.2);
  light.render();

  // Mouse Toy
  var mouseBody = new CubePrism();
  mouseBody.color = [0.38, 0.286, 0.239, 1.0];
  mouseBody.matrix.translate(0.5, -0.5, 2);
  mouseBody.matrix.rotate(-90,0,0,1);
  mouseBody.matrix.scale(.1, 0.5, 0.2);
  mouseBody.render();

  var mouseNose = new Cube();
  mouseNose.color = [1, 0.8, 0.98, 1.0];
  mouseNose.matrix.translate(0.7, -0.6, 2.05);
  mouseNose.matrix.scale(.05, 0.05, 0.05);
  mouseNose.render();

  var mouseTail = new Cube();
  mouseTail.color = [0.38, 0.286, 0.239, 1.0];
  mouseTail.matrix.translate(0.4, -0.6, 2.05);
  mouseTail.matrix.scale(.4, 0.02, 0.05);
  mouseTail.render();

  //check the time at the end of the function and show on the webpage
  var duration = performance.now() - startTime;
  sendTextToHTML(
    " ms: " +
      Math.floor(duration) +
      " fps: " +
      Math.floor(1000 / duration) / 10,
    "numdot"
  );
}

//set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
