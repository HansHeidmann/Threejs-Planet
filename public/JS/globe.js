import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';

// DATA IMPORT
let data = [];
let xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let response = JSON.parse(xhttp.responseText);
        let output = Object.values(response);
        for(let i=0; i<output.length; i++) {
            data.push(output[i]);
        }
    }
};
xhttp.open("GET", "../DATA/Final_data.json", false);
xhttp.send();
console.log(data);

// THREEJS CODE

// CREATE scene where objects will be placed (like a stage)
const scene = new THREE.Scene();

// CREATE camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// CREATE renderer to display the objects
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CREATE controls so that we can interact with the objects
const controls = new OrbitControls(camera, renderer.domElement);

// CREATE Planet
let earthMap = new THREE.TextureLoader().load('../IMAGES/earthmap4k.jpg');
let earthBumpMap = new THREE.TextureLoader().load('../IMAGES/earthbump4k.jpg');  // adds depth
let earthSpecMap = new THREE.TextureLoader().load('../IMAGES/earthspec4k.jpg'); // adds shinyness

// Geometry
let earthGeometry = new THREE.SphereGeometry(10, 32, 32);

// Material
let earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    bumpMap: earthBumpMap,
    bumpScale: 0.1,
    specularMap: earthSpecMap,
    specular: new THREE.Color('grey')
});

let earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

//Clouds
let earthCloudGeo = new THREE.SphereGeometry(10, 32, 32);
let earthCloudsTexture = new THREE.TextureLoader().load('../IMAGES/earthhiresclouds4K.jpg');
let earthMaterialClouds = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: earthCloudsTexture,
    transparent: true,
    opacity: 0.4
});

let earthClouds = new THREE.Mesh(earthCloudGeo, earthMaterialClouds);  // final texture for the Clouds
earthClouds.scale.set(1.015, 1.015, 1.015);

earth.add(earthClouds);

// LIGHTING
let lights = [];

function createSkyBox(scene) {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        '../IMAGES/space_right.png',
        '../IMAGES/space_left.png',
        '../IMAGES/space_top.png',
        '../IMAGES/space_bot.png',
        '../IMAGES/space_front.png',
        '../IMAGES/space_back.png'
    ])
    scene.background = texture;
}

function createLights(scene) {
    lights[0] = new THREE.PointLight("#004d99", .5, 0);
    lights[1] = new THREE.PointLight("#004d99", .5, 0);
    lights[2] = new THREE.PointLight("#004d99", .7, 0);
    lights[3] = new THREE.AmbientLight("#FFFFFF");

    lights[0].position.set(200, 0, -400);
    lights[1].position.set(200, 200, 400);
    lights[2].position.set(-200, -200, -50);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);
    scene.add(lights[3]);
}


function addSceneObjects(scene) {
    createLights(scene);
    createSkyBox(scene);
}

addSceneObjects(scene);

camera.position.z = 20;

// disable cam movement
controls.minDistance = 12;
controls.maxDistance = 30;
controls.enablePan = false;
controls.update();
controls.saveState();

// ADD EVENT LISTENERS so DOM knows what fucntions to use when object interaction
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}

// Create and add coordinates for the globe
function addCountryCoord(earth, country, language, latitude, longitude, color, region, population, area_sq_mi, gdp_per_capita, climate) {
    let pointOfInterest = new THREE.SphereGeometry(.1, 32, 32);
    let lat = latitude * (Math.PI/180);
    let lon = -longitude * (Math.PI/180);
    let radius = 10;
    const phi = (90-lat)*(Math.PI/180);
    const theta = (lon+180)*(Math.PI/180);

    let material = new THREE.MeshBasicMaterial({
        color:color
    });

    let mesh = new THREE.Mesh(
        pointOfInterest,
        material
    );

    mesh.position.set(
        Math.cos(lat) * Math.cos(lon) * radius,
        Math.sin(lat) * radius,
        Math.cos(lat) * Math.sin(lon) * radius
    );

    mesh.rotation.set(0.0, -lon, lat-Math.PI*0.5);

    mesh.userData.country = country;
    mesh.userData.language = language;
    mesh.userData.color = color;
    mesh.userData.region = region;
    mesh.userData.population = population;
    mesh.userData.area_sq_mi = area_sq_mi;
    mesh.userData.gdp_per_capita = gdp_per_capita;
    mesh.userData.climate = climate;

    earthClouds.add(mesh)
}

function changeToCountry() {
    //

    // get the data from the json file EASTERN EUROPE NORTHERN AFRICA
    for(let i=0; i<data.length; i++) {
        if(data[i].Region == 'ASIA (EX. NEAR EAST)') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'yellow',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'NEAR EAST') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'orange',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'NORTHERN AMERICA') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'lightblue',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'WESTERN EUROPE') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'cyan',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'EASTERN EUROPE') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'red',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'BALTICS') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'purple',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'C.W. OF IND. STATES') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'orange',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'NORTHERN AFRICA') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'beige',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'SUB-SAHARAN AFRICA') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'brown',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'LATIN AMER. & CARIB') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'gold',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        } else if(data[i].Region == 'OCEANIA') {
            addCountryCoord(earth, data[i].Country,  data[i].Languages,  data[i].latitude,  data[i].longitude,  'lightgreen',  data[i].Region,  data[i].Population,  data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate);
        }
    }
}

changeToCountry();
animate();
