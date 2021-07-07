
// --------------------------------------------- //
// ------- 3D PONG built with Three.JS --------- //
// -------- Created by Nikhil Suresh ----------- //
// -------- Three.JS is by Mr. doob  ----------- //
// --------------------------------------------- //

// ------------------------------------- //
// ------- GLOBAL VARIABLES ------------ //
// ------------------------------------- //

// scene object variables
// import { cubeNum } from './compute'
var renderer, scene, camera, pointLight, spotLight;
var startFlag = false
var textmesh, missmesh
let timerA, timerB, timerC, timerD, timerE
let bpm = [0,
	[2, 4], 3, [2, 4], 3, [1, 3], 3, [3, 5], 3, [2, 4], 3, [2, 4], 3, [1, 3], 3, [3, 5], 3, [2, 4], 3, [2, 4], 3, [1, 3], 3, [3, 5], 3, [2, 4], 3, [2, 4], 3, [1, 3], 3, [3, 5]]
let bpmArr = [1, 29, 60, 90, 121, 151, 180, 211, 237, 266, 297, 327, 355, 385, 414, 446, 473, 501, 532, 563, 591, 619, 649, 682, 710, 741, 769, 798, 827, 859, 886, 917]
// let cubenum = cubeNum(bpm)
const time = Date.parse(new Date())
// field variables
var fieldWidth = 150, fieldHeight = 200;
let timein = 0, index = 0, nowball = []
// paddle variables
var track, track1, track2, track3, track4
var paddleWidth, paddleHeight, paddleDepth, paddleQuality;
var paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 6.6;
const ppostion = -70
const bpostion = 80
var boxArr
let goodFlagA = true, goodFlagB = true, goodFlagC = true, goodFlagD = true, goodFlagE = true
let goodNum = 0
// ball variables
var ball, paddle1, paddle2, paddle3, paddle4, paddle5, ball1, ball2, ball3, ball4;
var ballDirX = -1, ballDirY = 1, ballSpeed = 2.5;
// const ballArr = [ball, ball1, ball2, ball3, ball4]
// const paddleArr = [paddle1, paddle2, paddle3, paddle4, paddle5]
// game-related variables
var score1 = 0, score2 = 0;
// you can change this to any positive whole number
var maxScore = 7;

// set opponent reflexes (0 - easiest, 1 - hardest)
var difficulty = 0.2;
let relData = new Array(8).fill(0)
// ------------------------------------- //
// ------- GAME FUNCTIONS -------------- //
// ------------------------------------- //

const ws = new WebSocket('ws://127.0.0.1:9999')

ws.onopen = () => {
	console.log('ws open')
}
ws.onmessage = (e) => {

	const data = JSON.parse(e.data)
	// console.log(data  )
	// relData.forEach((a,index) => {
	// 	a = data[index*4] + data[index*4+1]*256
	// })
	for (let i = 0; i < relData.length; i++) {
		// console.log(data[i*4],data[i*4+1]*256)
		relData[i] = data.data[i * 4] + data.data[i * 4 + 1] * 256
	}

}


function setup() {
	// update the board to reflect the max score for match win


	// now reset player and opponent scores
	score1 = 0;
	score2 = 0;

	// set up all the 3D objects in the scene	
	createScene();

	// and let's get cracking!
	draw();
}


function createScene() {
	// set the scene size
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;

	// set some camera attributes
	var VIEW_ANGLE = 50,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

	var c = document.getElementById("gameCanvas");

	// create a WebGL renderer, camera
	// and a scene
	renderer = new THREE.WebGLRenderer();
	camera =
		new THREE.PerspectiveCamera(
			VIEW_ANGLE,
			ASPECT,
			NEAR,
			FAR);

	scene = new THREE.Scene();

	// add the camera to the scene
	scene.add(camera);

	// set a default position for the camera
	// not doing this somehow messes up shadow rendering
	camera.position.z = 320;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	c.appendChild(renderer.domElement);

	// set up the playing surface plane 
	var planeWidth = fieldWidth,
		planeHeight = fieldHeight,
		planeQuality = 10;

	// create the paddle1's material
	var paddle1Material =
		new THREE.MeshLambertMaterial(
			{
				color: 0xffcccc,
				transparent: true
			});
	// create the paddle2's material
	var paddle2Material =
		new THREE.MeshLambertMaterial(
			{
				color: 0xffcccc,
				transparent: true
			});

	var paddle3Material =
		new THREE.MeshLambertMaterial(
			{
				color: 0xffcccc,
				transparent: true
			});

	var paddle4Material =
		new THREE.MeshLambertMaterial(
			{
				color: 0xffcccc,
				transparent: true
			});

	var paddle5Material =
		new THREE.MeshLambertMaterial(
			{
				color: 0xffcccc,
				transparent: true
			});
	// create the plane's material	
	var planeMaterial =
		new THREE.MeshLambertMaterial(
			{
				color: 0x666666,
				// opacity : 0.5,
				transparent: true
			});
	// create the table's material
	var tableMaterial =
		new THREE.MeshLambertMaterial(
			{
				color: 0x111111
			});
	// create the pillar's material
	var pillarMaterial =
		new THREE.MeshLambertMaterial(
			{
				color: 0x534d0d
			});
	// create the ground's material
	var groundMaterial =
		new THREE.MeshLambertMaterial(
			{
				color: 0x888888
			});


	// create the playing surface plane
	var plane = new THREE.Mesh(

		new THREE.PlaneGeometry(
			planeWidth * 0.95,	// 95% of table width, since we want to show where the ball goes out-of-bounds
			planeHeight,
			planeQuality,
			planeQuality),

		planeMaterial);

	scene.add(plane);
	plane.receiveShadow = true;

	var table = new THREE.Mesh(

		new THREE.CubeGeometry(
			planeWidth * 1.05,	// this creates the feel of a billiards table, with a lining
			planeHeight * 1.03,
			100,				// an arbitrary depth, the camera can't see much of it anyway
			planeQuality,
			planeQuality,
			1),

		tableMaterial);
	table.position.z = -51;	// we sink the table into the ground by 50 units. The extra 1 is so the plane can be seen
	scene.add(table);
	table.receiveShadow = true;

	// // set up the sphere vars
	// lower 'segment' and 'ring' values will increase performance
	var radius = 5,
		segments = 6,
		rings = 6;

	// // create the sphere's material
	var sphereMaterial =
		new THREE.MeshLambertMaterial(
			{
				color: 0xD43001,
				transparent: true
			});
	var sphereMaterial1 =
		new THREE.MeshLambertMaterial(
			{
				color: 0xD43001,
				transparent: true
			});
	var sphereMaterial2 =
		new THREE.MeshLambertMaterial(
			{
				color: 0xD43001,
				transparent: true
			});
	var sphereMaterial3 =
		new THREE.MeshLambertMaterial(
			{
				color: 0xD43001,
				transparent: true
			});
	var sphereMaterial4 =
		new THREE.MeshLambertMaterial(
			{
				color: 0xD43001,
				transparent: true
			});



	let textLeft, videoLeft, ifVideoLeft = false;
	// videoLeft = document.createElement('video');
	// videoLeft.preload = 'auto';
	// videoLeft.controls = 'controls';
	// videoLeft.volume = 1;
	// videoLeft.style.objectFit = 'fill';
	// let videoSource = document.createElement('source');
	// videoSource.type = 'video/mp4';
	// videoSource.src = './video/video.mp4';
	// videoLeft.appendChild(videoSource);
	videoLeft = document.getElementById('video');
	videoLeft.oncanplay = () => {
		startFlag = true;
	}
	const geometry = new THREE.PlaneGeometry(200, 112);
	var texture = new THREE.VideoTexture(videoLeft);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;
	let materialLeft1 = new THREE.MeshBasicMaterial({
		map: texture
	});
	textLeft = new THREE.Mesh(geometry, materialLeft1);
	textLeft.name = 'videoLeft1';
	textLeft.rotation.y = -Math.PI / 2
	textLeft.rotation.z = -Math.PI / 2
	textLeft.position.x = 80
	textLeft.position.z = 50
	scene.add(textLeft)

	// Create a ball with sphere geometry

	paddleWidth = 10;
	paddleHeight = 30;
	paddleDepth = 2;
	paddleQuality = 1;

	// ball = new THREE.Mesh(

	// 	new THREE.CubeGeometry(
	// 		paddleWidth,
	// 		paddleHeight,
	// 		paddleDepth,
	// 		paddleQuality,
	// 		paddleQuality,
	// 		paddleQuality),

	// 	sphereMaterial);
	// scene.add(ball);
	// ball.position.z = radius;
	// ball.position.x = bpostion;
	// ball.position.y = (0 + 1) * 40 - 100 - 20
	// ball.receiveShadow = true;
	// ball.castShadow = true;




	// ball1 = new THREE.Mesh(

	// 	new THREE.CubeGeometry(
	// 		paddleWidth,
	// 		paddleHeight,
	// 		paddleDepth,
	// 		paddleQuality,
	// 		paddleQuality,
	// 		paddleQuality),

	// 	sphereMaterial1);
	// scene.add(ball1);
	// ball1.position.z = radius;
	// ball1.position.x = bpostion;
	// ball1.position.y = (1 + 1) * 40 - 100 - 20
	// ball1.receiveShadow = true;
	// ball1.castShadow = true;

	// ball2 = new THREE.Mesh(

	// 	new THREE.CubeGeometry(
	// 		paddleWidth,
	// 		paddleHeight,
	// 		paddleDepth,
	// 		paddleQuality,
	// 		paddleQuality,
	// 		paddleQuality),

	// 	sphereMaterial2);
	// scene.add(ball2);
	// ball2.position.z = radius;
	// ball2.position.x = bpostion;
	// ball2.position.y = (2 + 1) * 40 - 100 - 20
	// ball2.receiveShadow = true;
	// ball2.castShadow = true;

	// ball3 = new THREE.Mesh(

	// 	new THREE.CubeGeometry(
	// 		paddleWidth,
	// 		paddleHeight,
	// 		paddleDepth,
	// 		paddleQuality,
	// 		paddleQuality,
	// 		paddleQuality),

	// 	sphereMaterial3);
	// scene.add(ball3);
	// ball3.position.z = radius;
	// ball3.position.x = bpostion;
	// ball3.position.y = (3 + 1) * 40 - 100 - 20
	// ball3.receiveShadow = true;
	// ball3.castShadow = true;

	// ball4 = new THREE.Mesh(

	// 	new THREE.CubeGeometry(
	// 		paddleWidth,
	// 		paddleHeight,
	// 		paddleDepth,
	// 		paddleQuality,
	// 		paddleQuality,
	// 		paddleQuality),

	// 	sphereMaterial4);
	// scene.add(ball4);
	// // ball4.position.z = radius;
	// ball4.position.x = bpostion;
	// ball4.position.y = (4 + 1) * 40 - 100 - 20
	// ball4.receiveShadow = true;
	// ball4.castShadow = true;
	const deliy = 1.0    //延迟
	for (let i = 1; i < bpm.length; i++) {
		if (typeof bpm[i] == 'number') {
			const ball4 = new THREE.Mesh(

				new THREE.BoxGeometry(
					paddleWidth,
					paddleHeight,
					paddleDepth,
				),

				new THREE.MeshLambertMaterial(
					{
						color: 0xD43001,
						transparent: true
					}));
			scene.add(ball4);
			// ball4.position.z = radius;
			ball4.position.x = bpostion * deliy + bpmArr[i - 1] * ballSpeed;
			ball4.position.y = (5 - bpm[i] + 1) * 40 - 100 - 20   //左右距离
			ball4.receiveShadow = true;
			ball4.castShadow = true;
			scene.add(ball4)
		} else {
			for (let j = 0; j < bpm[i].length; j++) {
				const ball4 = new THREE.Mesh(

					new THREE.BoxGeometry(
						paddleWidth,
						paddleHeight,
						paddleDepth,
					),

					new THREE.MeshLambertMaterial(
						{
							color: 0xD43001,
							transparent: true
						}));
				scene.add(ball4);
				// ball4.position.z = radius;
				ball4.position.x = bpostion * deliy + bpmArr[i - 1] * ballSpeed;
				ball4.position.y = (5 - bpm[i][j] + 1) * 40 - 100 - 20   //左右距离
				ball4.receiveShadow = true;
				ball4.castShadow = true;
				scene.add(ball4)
			}
		}


	}

	boxArr = scene.children.filter((a, index) => {
		return a.geometry && a.geometry.type == 'BoxGeometry' && a.geometry.parameters.width == 10
	})
	const loader = new THREE.FontLoader();

	loader.load('font/a.json', function (font) {

		const text = new THREE.TextGeometry('good', {
			font: font,
			size: 20,
			height: 5,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 1,
			bevelOffset: 0,
			bevelSegments: 5
		});
		// materialargs.color = new THREE.Color().setHSL( Math.random(), 0.5, 0.5 );
		const material = new THREE.MeshLambertMaterial({
			transparent: true,
			opacity: 0
		});
		textmesh = new THREE.Mesh(text, material);

		scene.add(textmesh)
		textmesh.rotation.x = Math.PI / 2
		textmesh.rotation.y = -Math.PI / 2
		// textmesh.rotation.z = -Math.PI/2
		textmesh.position.z = 20
		textmesh.position.y = 30
	});

	// miss
	loader.load('font/a.json', function (font) {

		const text = new THREE.TextGeometry('miss', {
			font: font,
			size: 20,
			height: 5,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 1,
			bevelOffset: 0,
			bevelSegments: 5
		});
		// materialargs.color = new THREE.Color().setHSL( Math.random(), 0.5, 0.5 );
		const material = new THREE.MeshLambertMaterial({
			transparent: true,
			opacity: 0
		});
		missmesh = new THREE.Mesh(text, material);

		scene.add(missmesh)
		missmesh.rotation.x = Math.PI / 2
		missmesh.rotation.y = -Math.PI / 2
		// missmesh.rotation.z = -Math.PI/2
		missmesh.position.z = 20
		missmesh.position.y = 30
	});

	// text = new THREE.TextGeometry( 'Hello three.js!', {
	// 	// font: font,
	// 	size: 80,
	// 	height: 5,
	// 	curveSegments: 12,
	// 	bevelEnabled: true,
	// 	bevelThickness: 10,
	// 	bevelSize: 8,
	// 	bevelOffset: 0,
	// 	bevelSegments: 5
	// } );


	paddle1 = new THREE.Mesh(

		new THREE.CubeGeometry(
			paddleWidth,
			paddleHeight,
			paddleDepth,
			paddleQuality,
			paddleQuality,
			paddleQuality),

		paddle1Material);

	// // add the sphere to the scene
	scene.add(paddle1);
	paddle1.receiveShadow = true;
	paddle1.castShadow = true;
	paddle1.position.x = ppostion - 5;
	paddle1.position.y = (0 + 1) * 40 - 100 - 20
	paddle1.position.z = paddleDepth;

	paddle2 = new THREE.Mesh(

		new THREE.CubeGeometry(
			paddleWidth,
			paddleHeight,
			paddleDepth,
			paddleQuality,
			paddleQuality,
			paddleQuality),

		paddle2Material);

	// // add the sphere to the scene
	scene.add(paddle2);
	paddle2.receiveShadow = true;
	paddle2.castShadow = true;
	paddle2.position.x = ppostion - 5;
	paddle2.position.y = (1 + 1) * 40 - 100 - 20
	paddle2.position.z = paddleDepth;


	paddle3 = new THREE.Mesh(

		new THREE.CubeGeometry(
			paddleWidth,
			paddleHeight,
			paddleDepth,
			paddleQuality,
			paddleQuality,
			paddleQuality),

		paddle3Material);

	// // add the sphere to the scene
	scene.add(paddle3);
	paddle3.receiveShadow = true;
	paddle3.castShadow = true;
	paddle3.position.x = ppostion - 5;
	paddle3.position.y = (2 + 1) * 40 - 100 - 20
	paddle3.position.z = paddleDepth;


	paddle4 = new THREE.Mesh(

		new THREE.CubeGeometry(
			paddleWidth,
			paddleHeight,
			paddleDepth,
			paddleQuality,
			paddleQuality,
			paddleQuality),

		paddle4Material);

	// // add the sphere to the scene
	scene.add(paddle4);
	paddle4.receiveShadow = true;
	paddle4.castShadow = true;
	paddle4.position.x = ppostion - 5;
	paddle4.position.y = (3 + 1) * 40 - 100 - 20
	paddle4.position.z = paddleDepth;

	paddle5 = new THREE.Mesh(

		new THREE.CubeGeometry(
			paddleWidth,
			paddleHeight,
			paddleDepth,
			paddleQuality,
			paddleQuality,
			paddleQuality),

		paddle5Material);

	// // add the sphere to the scene
	scene.add(paddle5);
	paddle5.receiveShadow = true;
	paddle5.castShadow = true;
	paddle5.position.x = ppostion - 5;
	paddle5.position.y = (4 + 1) * 40 - 100 - 20
	paddle5.position.z = paddleDepth;


	const trackWidth = 150
	const trackHeight = 30
	const trackDepth = 10
	track = new THREE.Mesh(

		new THREE.PlaneGeometry(
			trackWidth,
			trackHeight,
		),

		new THREE.MeshLambertMaterial(
			{
				color: 0x0000ff,
				transparent: true,
				opacity: 0
			})
	);

	// // add the sphere to the scene
	scene.add(track);
	track.receiveShadow = true;
	track.castShadow = true;
	track.position.x = -5;
	track.position.y = (4 + 1) * 40 - 100 - 20
	track.position.z = 0.5;

	track1 = new THREE.Mesh(

		new THREE.PlaneGeometry(
			trackWidth,
			trackHeight,
		),

		new THREE.MeshLambertMaterial(
			{
				color: 0x0000ff,
				transparent: true,
				opacity: 0
			})
	);

	// // add the sphere to the scene
	scene.add(track1);
	track1.receiveShadow = true;
	track1.castShadow = true;
	track1.position.x = -5;
	track1.position.y = (3 + 1) * 40 - 100 - 20
	track1.position.z = 0.5;


	track2 = new THREE.Mesh(

		new THREE.PlaneGeometry(
			trackWidth,
			trackHeight,
		),

		new THREE.MeshLambertMaterial(
			{
				color: 0x0000ff,
				transparent: true,
				opacity: 0
			})
	);

	// // add the sphere to the scene
	scene.add(track2);
	track2.receiveShadow = true;
	track2.castShadow = true;
	track2.position.x = -5;
	track2.position.y = (2 + 1) * 40 - 100 - 20
	track2.position.z = 0.5;


	track3 = new THREE.Mesh(

		new THREE.PlaneGeometry(
			trackWidth,
			trackHeight,
		),

		new THREE.MeshLambertMaterial(
			{
				color: 0x0000ff,
				transparent: true,
				opacity: 0
			})
	);

	// // add the sphere to the scene
	scene.add(track3);
	track3.receiveShadow = true;
	track3.castShadow = true;
	track3.position.x = -5;
	track3.position.y = (1 + 1) * 40 - 100 - 20
	track3.position.z = 0.5;


	track4 = new THREE.Mesh(

		new THREE.PlaneGeometry(
			trackWidth,
			trackHeight,
		),

		new THREE.MeshLambertMaterial(
			{
				color: 0x0000ff,
				transparent: true,
				opacity: 0
			})
	);

	// // add the sphere to the scene
	scene.add(track4);
	track4.receiveShadow = true;
	track4.castShadow = true;
	track4.position.x = -5;
	track4.position.y = (0 + 1) * 40 - 100 - 20
	track4.position.z = 0.5;




	for (var i = 0; i < 5; i++) {
		var backdrop = new THREE.Mesh(

			new THREE.CubeGeometry(
				30,
				30,
				300,
				1,
				1,
				1),

			pillarMaterial);

		backdrop.position.x = -50 + i * 100;
		backdrop.position.y = 230;
		backdrop.position.z = -30;
		backdrop.castShadow = true;
		backdrop.receiveShadow = true;
		scene.add(backdrop);
	}
	// we iterate 10x (5x each side) to create pillars to show off shadows
	// this is for the pillars on the right
	for (var i = 0; i < 5; i++) {
		var backdrop = new THREE.Mesh(

			new THREE.CubeGeometry(
				30,
				30,
				300,
				1,
				1,
				1),

			pillarMaterial);

		backdrop.position.x = -50 + i * 100;
		backdrop.position.y = -230;
		backdrop.position.z = -30;
		backdrop.castShadow = true;
		backdrop.receiveShadow = true;
		scene.add(backdrop);
	}

	// finally we finish by adding a ground plane
	// to show off pretty shadows
	var ground = new THREE.Mesh(

		new THREE.CubeGeometry(
			1000,
			1000,
			3,
			1,
			1,
			1),

		groundMaterial);
	// set ground to arbitrary z position to best show off shadowing
	ground.position.z = -132;
	ground.receiveShadow = true;
	scene.add(ground);

	// // create a point light
	pointLight =
		new THREE.PointLight(0xF8D898);

	// set its position
	pointLight.position.x = -1000;
	pointLight.position.y = 0;
	pointLight.position.z = 1000;
	pointLight.intensity = 2.9;
	pointLight.distance = 10000;
	// add to the scene
	scene.add(pointLight);

	// add a spot light
	// this is important for casting shadows
	spotLight = new THREE.SpotLight(0xF8D898);
	spotLight.position.set(0, 0, 460);
	spotLight.intensity = 1.5;
	spotLight.castShadow = true;
	// scene.add(spotLight);

	// MAGIC SHADOW CREATOR DELUXE EDITION with Lights PackTM DLC
	renderer.shadowMapEnabled = true;
}

function draw() {
	// draw THREE.JS scene
	if (startFlag) {

		run()
	}
	renderer.render(scene, camera);
	// loop draw function call
	requestAnimationFrame(draw);

	// ballPhysics();
	// paddlePhysics();
	cameraPhysics();
	playerPaddleMovement();


}



function run(ball) {


	boxArr.forEach((a, index) => {




		if (a.position.x >= -80 && a.position.x <= -50) {
			// A按键
			// a.material.opacity = 1
			if (a.position.x == -75) {
				a.material.opacity = 0
			}
			

			// 键盘

			// if (a.position.y == 80) {
			// 	// console.log('jinle2',textmesh.material.opacity)
			// 	if (Key.isDown(Key.A)) {
			// 		paddle5.material.color.r = 0.5
			// 		paddle5.material.color.b = 0.5
			// 		paddle5.material.color.g = 0.5
			// 		// console.log('jinle')
			// 		if (goodFlagA) {
			// 			console.log('80-50', goodFlagA)
			// 			textmesh.material.opacity = 1
			// 			goodFlagA = false
			// 			console.log('80-502', goodFlagA)
			// 			// console.log('jinle2', textmesh.material.opacity)
			// 			if (!timerA) {
			// 				timerA = setTimeout(() => {
			// 					// console.log(false, timerA)
			// 					textmesh.material.opacity = 0
			// 					// goodFlag = tru

			// 					clearTimeout(timerA)
			// 					timerA = null
			// 				}, 100)
			// 			}
			// 		}



			// 	} else {
			// 		paddle5.material.color.r = 1
			// 		paddle5.material.color.b = 0.8125
			// 		paddle5.material.color.g = 0.8125
			// 		// textmesh.material.opacity = 0
			// 	}
			// }

			// if (a.position.y == 40) {
			// 	if (Key.isDown(Key.S)) {
			// 		paddle4.material.color.r = 0.5
			// 		paddle4.material.color.b = 0.5
			// 		paddle4.material.color.g = 0.5
			// 		// textmesh.material.opacity = 1

			// 		if (goodFlagB) {
			// 			console.log('jinle2', goodFlagB)
			// 			textmesh.material.opacity = 1
			// 			goodFlagB = false
			// 			console.log('jinle2', textmesh.material.opacity)
			// 			if (!timerB) {
			// 				timerB = setTimeout(() => {
			// 					console.log(false, timerB)
			// 					textmesh.material.opacity = 0
			// 					// goodFlag = tru

			// 					clearTimeout(timerB)
			// 					timerB = null
			// 				}, 100)
			// 			}
			// 		}
			// 	} else {
			// 		paddle4.material.color.r = 1
			// 		paddle4.material.color.b = 0.8125
			// 		paddle4.material.color.g = 0.8125
			// 		// textmesh.material.opacity = 0
			// 	}
			// }

			// if (a.position.y == 0) {
			// 	if (Key.isDown(Key.D)) {
			// 		paddle3.material.color.r = 0.5
			// 		paddle3.material.color.b = 0.5
			// 		paddle3.material.color.g = 0.5
			// 		// textmesh.material.opacity = 1

			// 		if (goodFlagC) {
			// 			console.log('75', goodFlagC)
			// 			textmesh.material.opacity = 1
			// 			goodFlagC = false
			// 			console.log('75-2', goodFlagC,timerC)
			// 			if (!timerC) {
			// 				console.log('timec')
			// 				timerC = setTimeout(() => {
			// 					console.log(false,textmesh.material.opacity)
			// 					textmesh.material.opacity = 0
			// 					console.log(false,textmesh.material.opacity)
			// 					// goodFlag = tru

			// 					clearTimeout(timerC)
			// 					timerC = null
			// 				}, 100)
			// 			}
			// 		}
			// 	} else {
			// 		paddle3.material.color.r = 1
			// 		paddle3.material.color.b = 0.8125
			// 		paddle3.material.color.g = 0.8125
			// 		// textmesh.material.opacity = 0
			// 	}
			// }


			// if (a.position.y == -40) {
			// 	if (Key.isDown(Key.F)) {
			// 		paddle2.material.color.r = 0.5
			// 		paddle2.material.color.b = 0.5
			// 		paddle2.material.color.g = 0.5
			// 		// textmesh.material.opacity = 1
			// 		if (goodFlagD) {
			// 			console.log('jinle2', goodFlagD)
			// 			textmesh.material.opacity = 1
			// 			goodFlagD = false
			// 			console.log('jinle2', textmesh.material.opacity)
			// 			if (!timerD) {
			// 				timerD = setTimeout(() => {
			// 					console.log(false, timerD)
			// 					textmesh.material.opacity = 0
			// 					// goodFlag = tru

			// 					clearTimeout(timerD)
			// 					timerD = null
			// 				}, 100)
			// 			}
			// 		}
			// 	} else {
			// 		paddle2.material.color.r = 1
			// 		paddle2.material.color.b = 0.8125
			// 		paddle2.material.color.g = 0.8125
			// 		// textmesh.material.opacity = 0
			// 	}
			// }

			// if (a.position.y == -80) {
			// 	if (Key.isDown(Key.G)) {
			// 		paddle1.material.color.r = 0.5
			// 		paddle1.material.color.b = 0.5
			// 		paddle1.material.color.g = 0.5
			// 		// textmesh.material.opacity = 1

			// 		if (goodFlagE) {
			// 			console.log('jinle2', goodFlagE)
			// 			textmesh.material.opacity = 1
			// 			goodFlagE = false
			// 			console.log('jinle2', textmesh.material.opacity,timerE)
			// 			if (!timerE) {
			// 				console.log('timerE')
			// 				timerE = setTimeout(() => {
			// 					console.log(false, timerE,textmesh.material.opacity )
			// 					textmesh.material.opacity = 0
			// 					console.log(false, timerE,textmesh.material.opacity )
			// 					// goodFlag = tru

			// 					clearTimeout(timerE)
			// 					timerE = null
			// 				}, 100)
			// 			}
			// 		}
			// 	} else {
			// 		paddle1.material.color.r = 1
			// 		paddle1.material.color.b = 0.8125
			// 		paddle1.material.color.g = 0.8125
			// 		// textmesh.material.opacity = 0
			// 	}
			// }

			// 瑜伽垫

			if (a.position.y == 80) {
				// console.log('jinle2',textmesh.material.opacity)
				if (relData[7] > 150) {
					paddle5.material.color.r = 0.5
					paddle5.material.color.b = 0.5
					paddle5.material.color.g = 0.5
					// console.log('jinle')
					if (goodFlagA) {
						console.log('80-50', goodFlagA)
						textmesh.material.opacity = 1
						goodFlagA = false
						console.log('80-502', goodFlagA)
						// console.log('jinle2', textmesh.material.opacity)
						if (!timerA) {
							timerA = setTimeout(() => {
								// console.log(false, timerA)
								textmesh.material.opacity = 0
								// goodFlag = tru

								clearTimeout(timerA)
								timerA = null
							}, 100)
						}
					}



				} else {
					paddle5.material.color.r = 1
					paddle5.material.color.b = 0.8125
					paddle5.material.color.g = 0.8125
					// textmesh.material.opacity = 0
				}
			}

			if (a.position.y == 40) {
				if (relData[5] > 150 || relData[6] > 150) {
					paddle4.material.color.r = 0.5
					paddle4.material.color.b = 0.5
					paddle4.material.color.g = 0.5
					// textmesh.material.opacity = 1

					if (goodFlagB) {
						console.log('jinle2', goodFlagB)
						textmesh.material.opacity = 1
						goodFlagB = false
						console.log('jinle2', textmesh.material.opacity)
						if (!timerB) {
							timerB = setTimeout(() => {
								console.log(false, timerB)
								textmesh.material.opacity = 0
								// goodFlag = tru

								clearTimeout(timerB)
								timerB = null
							}, 100)
						}
					}
				} else {
					paddle4.material.color.r = 1
					paddle4.material.color.b = 0.8125
					paddle4.material.color.g = 0.8125
					// textmesh.material.opacity = 0
				}
			}

			if (a.position.y == 0) {
				if (relData[4] > 150) {
					paddle3.material.color.r = 0.5
					paddle3.material.color.b = 0.5
					paddle3.material.color.g = 0.5
					// textmesh.material.opacity = 1

					if (goodFlagC) {
						console.log('75', goodFlagC)
						textmesh.material.opacity = 1
						goodFlagC = false
						console.log('75-2', goodFlagC,timerC)
						if (!timerC) {
							console.log('timec')
							timerC = setTimeout(() => {
								console.log(false,textmesh.material.opacity)
								textmesh.material.opacity = 0
								console.log(false,textmesh.material.opacity)
								// goodFlag = tru

								clearTimeout(timerC)
								timerC = null
							}, 100)
						}
					}
				} else {
					paddle3.material.color.r = 1
					paddle3.material.color.b = 0.8125
					paddle3.material.color.g = 0.8125
					// textmesh.material.opacity = 0
				}
			}


			if (a.position.y == -40) {
				if (relData[2] > 150 || relData[3] > 150) {
					paddle2.material.color.r = 0.5
					paddle2.material.color.b = 0.5
					paddle2.material.color.g = 0.5
					// textmesh.material.opacity = 1
					if (goodFlagD) {
						console.log('jinle2', goodFlagD)
						textmesh.material.opacity = 1
						goodFlagD = false
						console.log('jinle2', textmesh.material.opacity)
						if (!timerD) {
							timerD = setTimeout(() => {
								console.log(false, timerD)
								textmesh.material.opacity = 0
								// goodFlag = tru

								clearTimeout(timerD)
								timerD = null
							}, 100)
						}
					}
				} else {
					paddle2.material.color.r = 1
					paddle2.material.color.b = 0.8125
					paddle2.material.color.g = 0.8125
					// textmesh.material.opacity = 0
				}
			}

			if (a.position.y == -80) {
				if (relData[0] > 150 || relData[1] > 150) {
					paddle1.material.color.r = 0.5
					paddle1.material.color.b = 0.5
					paddle1.material.color.g = 0.5
					// textmesh.material.opacity = 1

					if (goodFlagE) {
						console.log('jinle2', goodFlagE)
						textmesh.material.opacity = 1
						goodFlagE = false
						console.log('jinle2', textmesh.material.opacity,timerE)
						if (!timerE) {
							console.log('timerE')
							timerE = setTimeout(() => {
								console.log(false, timerE,textmesh.material.opacity )
								textmesh.material.opacity = 0
								console.log(false, timerE,textmesh.material.opacity )
								// goodFlag = tru

								clearTimeout(timerE)
								timerE = null
							}, 100)
						}
					}
				} else {
					paddle1.material.color.r = 1
					paddle1.material.color.b = 0.8125
					paddle1.material.color.g = 0.8125
					// textmesh.material.opacity = 0
				}
			}




		}

		else if (a.position.x == -85) {
			console.log(goodFlagA,goodNum,85,textmesh.material.opacity)

			// textmesh.material.opacity = 0
			// if (Key.isDown(Key.A) != true) {
			paddle5.material.color.r = 1
			paddle5.material.color.b = 0.8125
			paddle5.material.color.g = 0.8125
			// }
			// if (Key.isDown(Key.G) != true) {
			paddle1.material.color.r = 1
			paddle1.material.color.b = 0.8125
			paddle1.material.color.g = 0.8125
			// }
			// if (Key.isDown(Key.F) != true) {
			paddle2.material.color.r = 1
			paddle2.material.color.b = 0.8125
			paddle2.material.color.g = 0.8125
			// }
			// if (Key.isDown(Key.D) != true) {
			paddle3.material.color.r = 1
			paddle3.material.color.b = 0.8125
			paddle3.material.color.g = 0.8125
			// }
			// if (Key.isDown(Key.S) != true) {
			paddle4.material.color.r = 1
			paddle4.material.color.b = 0.8125
			paddle4.material.color.g = 0.8125
			// }
			// paddle5.material.color.r = 1
			// paddle5.material.color.b = 0.8
			// paddle5.material.color.g = 0.8
			// a.material.opacity = 0

			// return
		} else if (a.position.x < -85&&a.position.x >= -95) {
			if (a.position.y == 80) {
				// console.log(goodFlagA,goodNum,95)
				if (goodFlagA) {
					textmesh.material.opacity = 0
					// console.log('为1')
					missmesh.material.opacity = 1
					setTimeout(() => {
						missmesh.material.opacity = 0
						// console.log('为0')
					}, 50);
				}
				
			}

			if (a.position.y == 40) {
				// console.log(goodFlagA,goodNum,95)
				if (goodFlagB) {
					textmesh.material.opacity = 0
					// console.log('为1')
					missmesh.material.opacity = 1
					setTimeout(() => {
						missmesh.material.opacity = 0
						// console.log('为0')
					}, 50);
				}
				
			}

			if (a.position.y == 0) {
				// console.log(goodFlagA,goodNum,95)
				if (goodFlagC) {
					textmesh.material.opacity = 0
					// console.log('为1')
					missmesh.material.opacity = 1
					setTimeout(() => {
						missmesh.material.opacity = 0
						// console.log('为0')
					}, 50);
				}
				
			}

			if (a.position.y == -40) {
				// console.log(goodFlagA,goodNum,95)
				if (goodFlagD) {
					textmesh.material.opacity = 0
					// console.log('为1')
					missmesh.material.opacity = 1
					setTimeout(() => {
						missmesh.material.opacity = 0
						// console.log('为0')
					}, 50);
				}
				
			}

			if (a.position.y == -80) {
				// console.log(goodFlagA,goodNum,95)
				if (goodFlagE) {
					textmesh.material.opacity = 0
					// console.log('为1')
					missmesh.material.opacity = 1
					setTimeout(() => {
						missmesh.material.opacity = 0
						// console.log('为0')
					}, 50);
				}
				
			}
			// if(goodFlagB){
			// 	textmesh.material.opacity = 0
			// 	missmesh.material.opacity = 1
			// 	setTimeout(() => {
			// 		missmesh.material.opacity = 0
			// 	}, 50);
			// }
			// if(goodFlagC){
			// 	textmesh.material.opacity = 0
			// 	missmesh.material.opacity = 1
			// 	setTimeout(() => {
			// 		missmesh.material.opacity = 0
			// 	}, 50);
			// }
			// if(goodFlagD){
			// 	textmesh.material.opacity = 0
			// 	missmesh.material.opacity = 1
			// 	setTimeout(() => {
			// 		missmesh.material.opacity = 0
			// 	}, 50);
			// }
			// if(goodFlagE){
			// 	textmesh.material.opacity = 0
			// 	missmesh.material.opacity = 1
			// 	setTimeout(() => {
			// 		missmesh.material.opacity = 0
			// 	}, 50);
			// }
			
			// return
		}else if(a.position.x == -100){
			console.log(textmesh.material.opacity)
			if (a.position.y == 80) {
				goodFlagA = true
				goodNum =0 
			}
			if (a.position.y == 40) {
				goodFlagB = true
			}
			if (a.position.y == 0) {
				goodFlagC = true
			}
			if (a.position.y == -40) {
				goodFlagD = true
			}
			if (a.position.y == -80) {
				goodFlagE = true
			}
			
		}else if(a.position.x == -105){
			// console.log('end')
			return 
		}
		a.position.x += ballDirX * ballSpeed;

	})

	// 键盘
	// if (Key.isDown(Key.A)) {
	// 	track.material.opacity = 1
	// } else {
	// 	track.material.opacity = 0
	// }

	// if (Key.isDown(Key.S)) {
	// 	track1.material.opacity = 1
	// } else {
	// 	track1.material.opacity = 0
	// }

	// if (Key.isDown(Key.D)) {
	// 	track2.material.opacity = 1
	// } else {
	// 	track2.material.opacity = 0
	// }

	// if (Key.isDown(Key.F)) {
	// 	track3.material.opacity = 1
	// } else {
	// 	track3.material.opacity = 0
	// }

	// if (Key.isDown(Key.G)) {
	// 	track4.material.opacity = 1
	// } else {
	// 	track4.material.opacity = 0
	// }



	// 瑜伽垫

	if (relData[7] > 150) {
		track.material.opacity = 1
	} else {
		track.material.opacity = 0
	}

	if (relData[5] > 150 || relData[6] > 150) {
		track1.material.opacity = 1
	} else {
		track1.material.opacity = 0
	}

	if (relData[4] > 150) {
		track2.material.opacity = 1
	} else {
		track2.material.opacity = 0
	}

	if (relData[2] > 150 || relData[3] > 150) {
		track3.material.opacity = 1
	} else {
		track3.material.opacity = 0
	}

	if (relData[0] > 150 || relData[1] > 150) {
		track4.material.opacity = 1
	} else {
		track4.material.opacity = 0
	}
	

}

// Handles CPU paddle movement and logic


// Handles player's paddle movement
function playerPaddleMovement() {

}

// Handles camera and lighting logic
function cameraPhysics() {
	// we can easily notice shadows if we dynamically move lights during the game
	spotLight.position.x = -100;

	// move to behind the player's paddle
	camera.position.x = -90 - 75;
	camera.position.z = 10 + 100 + 0.04 * 20;

	// rotate to face towards the opponent
	camera.rotation.y = -60 * Math.PI / 180;
	camera.rotation.z = -90 * Math.PI / 180;
}

// Handles paddle collision logic
function paddlePhysics() {
	// PLAYER PADDLE LOGIC

	// if ball is aligned with paddle1 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ball.position.x <= paddle1.position.x + paddleWidth
		&& ball.position.x >= paddle1.position.x) {
		// and if ball is aligned with paddle1 on y plane
		if (ball.position.y <= paddle1.position.y + paddleHeight / 2
			&& ball.position.y >= paddle1.position.y - paddleHeight / 2) {
			// and if ball is travelling towards player (-ve direction)
			if (ballDirX < 0) {
				// stretch the paddle to indicate a hit
				paddle1.scale.y = 15;
				// switch direction of ball travel to create bounce
				ballDirX = -ballDirX;
				// we impact ball angle when hitting it
				// this is not realistic physics, just spices up the gameplay
				// allows you to 'slice' the ball to beat the opponent
				ballDirY -= paddle1DirY * 0.7;
			}
		}
	}

	// OPPONENT PADDLE LOGIC	

	// if ball is aligned with paddle2 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ball.position.x <= paddle2.position.x + paddleWidth
		&& ball.position.x >= paddle2.position.x) {
		// and if ball is aligned with paddle2 on y plane
		if (ball.position.y <= paddle2.position.y + paddleHeight / 2
			&& ball.position.y >= paddle2.position.y - paddleHeight / 2) {
			// and if ball is travelling towards opponent (+ve direction)
			if (ballDirX > 0) {
				// stretch the paddle to indicate a hit
				paddle2.scale.y = 15;
				// switch direction of ball travel to create bounce
				ballDirX = -ballDirX;
				// we impact ball angle when hitting it
				// this is not realistic physics, just spices up the gameplay
				// allows you to 'slice' the ball to beat the opponent
				ballDirY -= paddle2DirY * 0.7;
			}
		}
	}
}

function resetBall(ball, index) {


}

var bounceTime = 0;
// checks if either player or opponent has reached 7 points
function matchScoreCheck() {
	// if player has 7 points
	if (score1 >= maxScore) {
		// stop the ball
		ballSpeed = 0;
		// write to the banner

		// make paddle bounce up and down
		bounceTime++;
		paddle1.position.z = Math.sin(bounceTime * 0.1) * 10;
		// enlarge and squish paddle to emulate joy
		paddle1.scale.z = 2 + Math.abs(Math.sin(bounceTime * 0.1)) * 10;
		paddle1.scale.y = 2 + Math.abs(Math.sin(bounceTime * 0.05)) * 10;
	}
	// else if opponent has 7 points
	else if (score2 >= maxScore) {
		// stop the ball
		ballSpeed = 0;
		// write to the banner

		// make paddle bounce up and down
		bounceTime++;
		paddle2.position.z = Math.sin(bounceTime * 0.1) * 10;
		// enlarge and squish paddle to emulate joy
		paddle2.scale.z = 2 + Math.abs(Math.sin(bounceTime * 0.1)) * 10;
		paddle2.scale.y = 2 + Math.abs(Math.sin(bounceTime * 0.05)) * 10;
	}
}