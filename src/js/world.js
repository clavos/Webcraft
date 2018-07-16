// styles

import '../scss/index.scss';



// three.js

import * as THREE from 'three';

import 'three/examples/js/controls/PointerLockControls';

import 'three/examples/js/shaders/CopyShader';
import 'three/examples/js/shaders/DotScreenShader';
import 'three/examples/js/shaders/RGBShiftShader';
import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/ShaderPass';

;
var camera, scene, renderer, geometry, material, composer, controls, light;

var isMusic = false;

var raycaster = new THREE.Raycaster();

// Listener pour l'audio lors du click
var listener = new THREE.AudioListener();

var verticalSpeed = 0;

var keys = [];

document.onkeydown = function(e){

    e = e || window.event;

    keys[e.keyCode] = true;

};



document.onkeyup = function(e){

    e = e || window.event;

    keys[e.keyCode] = false;

};

window.addEventListener("click",()=>{
    raycaster.setFromCamera(new THREE.Vector2(), camera);

    var intersects = raycaster.intersectObjects(scene.children);

    for ( var i = 0; i<intersects.length; i++){
        console.log("found");
        var mesh = new THREE.Mesh(geometry, material);

        console.log(intersects[i].object.position.x);
        console.log(intersects[i].object.position.z);
        console.log(intersects[i].object.position.y);
        if (intersects[i].object.material.transparent) {
            intersects[i].object.material.transparent = false;

        } else {
            intersects[i].object.material.transparent = true;
        }


        break;
    }

    if (isMusic) {
        var soundEvent = new THREE.Audio( listener );
        var audioLoaderEvent = new THREE.AudioLoader();
        audioLoaderEvent.load( '/sounds/scream.ogg', function( buffer ) {
            soundEvent.setBuffer( buffer );
            soundEvent.setLoop( false );
            soundEvent.setVolume( 0.5 );
            soundEvent.play();
        });
    }
}, false)


function init() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color( 0x87CCF9 );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);



    //AUDIO
    camera.add( listener );
    var soundBack = new THREE.Audio( listener );
    var audioLoaderBack = new THREE.AudioLoader();
    audioLoaderBack.load( '/sounds/rain.ogg', function( buffer ) {
        soundBack.setBuffer( buffer );
        soundBack.setLoop( true );
        soundBack.setVolume( 0.5 );
        soundBack.play();
    });
    //AUDIO



    var texture = new THREE.TextureLoader().load('/images/minegrass.jpg');
    var geometry = new THREE.BoxGeometry(2,2,2); // Une


    // Sol sur lequel on marche
    for (var x = 0; x<30; x++){

        for (var y = 0; y<30; y++){
            var material = new THREE.MeshBasicMaterial({
                map : texture,
                transparent: false,
                opacity: 0.0
            });
            var mesh = new THREE.Mesh(geometry, material);

            mesh.position.x -= x * 2;
            mesh.position.z -= y * 2;
            mesh.position.y = -2; // On place les cubes en dessous de notre perspective pour former le sol

            scene.add(mesh);

        }



    }



        // Environnment dans lequel il est possible d'ajouter/supprimer des cubes
        // La zone se trouve au centre du plateau
for(var height = 0; height < 8; height +=2) { // Gère la hauteur des différentes couches

    for (var x = 7; x < 23; x++) {

        for (var y = 7; y < 23; y++) {
            var material_air = new THREE.MeshBasicMaterial({

                map: texture,
                transparent: true,
                opacity: 0.0,
            });

            var mesh = new THREE.Mesh(geometry, material_air);

            mesh.position.x -= x * 2;
            mesh.position.z -= y * 2;
            mesh.position.y = height;

            scene.add(mesh);

        }


    }
}

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

    document.body.appendChild(renderer.domElement);

    // Light
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );


    // Post processing (Noir et blanc + "Noise")
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );
    var effect = new THREE.ShaderPass( THREE.DotScreenShader );
    effect.uniforms[ 'scale' ].value = 4;
    composer.addPass( effect );
    var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
    effect.uniforms[ 'amount' ].value = 0.0015;
    effect.renderToScreen = true;
    composer.addPass( effect );


    controls = new THREE.PointerLockControls(camera);

    scene.add(controls.getObject());



    // pointer lock

    var pointerlockchange = function (event) {

        if (document.pointerLockElement == element) {

            controls.enabled = true;

        } else {

            controls.enabled = false;

        }



    };

    var pointerlockerror = function (event) {};



    // hook pointer lock state change events

    document.addEventListener('pointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);

    var element = document.body;



    element.addEventListener('click', function () {

        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

        element.requestPointerLock();

    }, false);



}



var clock = new THREE.Clock();



function animate() {

    requestAnimationFrame(animate);



    const delta = clock.getDelta();

    var speed = 10;


    // Couper/ Activer la musique
    if (keys[69]) {

        if (isMusic) {
            isMusic = false;
        }
        else {
            isMusic = true;
        }
        console.log(isMusic);

    }


    //Déplacement avant (Z)

    if (keys[90]) {

        controls.getObject().translateZ(-delta * speed);

    }



    //Déplacement arrière (S)

    if (keys[83]) {

        controls.getObject().translateZ(delta * speed);

    }

    if (keys[32] && controls.getObject().position.y == 1) {

        verticalSpeed = 30

    }

    if(verticalSpeed != 0){
        controls.getObject().translateY(delta * verticalSpeed);
    }

    if(controls.getObject().position.y > 1){
        verticalSpeed--;
    }else{
        controls.getObject().position.y = 1;
        verticalSpeed == 0;
    }

    //Déplacement gauche (Q)

    if (keys[81]) {

        controls.getObject().translateX(-delta * speed);

    }



    //Déplacement droite (D)

    if (keys[68]) {

        controls.getObject().translateX(delta * speed);

    }
    composer.render();

};



// window resize

window.addEventListener('resize', () => {

    camera.aspect = window.innerWidth / window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth, window.innerHeight);

}, false);



init();

animate();