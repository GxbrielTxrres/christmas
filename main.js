import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import gsap from "gsap";

// stats
const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new dat.GUI();
const fullRotation = Math.PI * 2;
let model = null;

const changeColors = ["#ffffff", "#000000"];
const keyframeDuration = 2;
// Loaders and their children

const params = {
  color: 0xffffff,
  angle: Math.random() * Math.PI * 2,
  treeAngle: Math.random() - 0.5 * Math.PI * 2,
  candyCaneCount: 20,
};

//Textures and Loaders
const textureLoader = new THREE.TextureLoader();
const fontLoader = new FontLoader();
const gltfLoader = new GLTFLoader();
const clock = new THREE.Clock();

const particleTexture = textureLoader.load("/textures/particles/1.png");
const snowTexture = textureLoader.load("/textures/snow2k.jpg", () => {
  console.log("loaded");
});
const snowRoughTexture = textureLoader.load("/textures/snowRough.jpg", () => {
  console.log("loaded");
});
const snowDisplacementTexture = textureLoader.load(
  "/textures/snowDisplacement.png",
  () => {
    console.log("loaded");
  }
);
const snowAoTexture = textureLoader.load("/textures/snowTrans.png", () => {
  console.log("loaded");
});

snowTexture.repeat.set(20, 20);
snowAoTexture.repeat.set(20, 20);
snowDisplacementTexture.repeat.set(20, 20);
snowRoughTexture.repeat.set(20, 20);

snowAoTexture.wrapS = THREE.RepeatWrapping;
snowDisplacementTexture.wrapS = THREE.RepeatWrapping;
snowRoughTexture.wrapS = THREE.RepeatWrapping;
snowTexture.wrapS = THREE.RepeatWrapping;

snowAoTexture.wrapT = THREE.RepeatWrapping;
snowDisplacementTexture.wrapT = THREE.RepeatWrapping;
snowRoughTexture.wrapT = THREE.RepeatWrapping;
snowTexture.wrapT = THREE.RepeatWrapping;

// Canvas
const canvas = document.querySelector("canvas");

// Scene
const scene = new THREE.Scene();

//particles
const particlesGeometry = new THREE.BufferGeometry();
const count = 2000;

//x,y,z * 3
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 80;
  colors[i] = Math.random();
}

//name of attribute, buffer attribute, 3 xyz
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
// particlesGeometry.setAttribute()
console.log(particlesGeometry.attributes);

const particlesMaterial = new THREE.PointsMaterial({
  transparent: true,
  alphaMap: particleTexture,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
});

//depthWrite, depthTest, alphaTest
particlesMaterial.size = 0.1;
particlesMaterial.sizeAttenuation = true;
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

//Candy canes
const candyCanes = new THREE.Group();
scene.add(candyCanes);
THREE.Cache.enabled;

function generateCandyCanes() {
  let i = 0;
  const count = params.candyCaneCount;

  if (candyCanes !== null) {
    candyCanes.remove(candyCanes.children[i]);
  }

  for (i; i < count; i++) {
    gltfLoader.load("/models/candyCane/scene.gltf", function (gltf) {
      model = gltf.scene;
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 7;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      model.position.set(x, 0.85, z);
      model.scale.set(0.15, 0.15, 0.15);
      model.rotation.y = (Math.random() - 0.5) * Math.PI * 4;

      model.castShadow = true;

      if (candyCanes !== null) {
        candyCanes.remove(candyCanes.children[i]);
      }
      candyCanes.add(model);
    });
  }
}

// Trees
const trees = new THREE.Group();
scene.add(trees);

function generateTrees() {
  for (let i = 0; i < 6; i++) {
    gltfLoader.load("/models/tree/scene.gltf", function (gltf) {
      model = gltf.scene;
      const angle = Math.random() * 5 * Math.PI * 2;
      const radius = 6 + Math.random() * 8;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      model.position.set(x, 0.57, z);
      model.scale.set(0.4, 0.4, 0.4);
      model.rotation.y = (Math.random() - 0.5) * Math.PI * 4;

      model.castShadow = true;

      if (trees !== null) {
        trees.remove(trees.children[i]);
      }
      trees.add(model);
    });
  }
}

generateTrees();
generateCandyCanes();

const treeTweaks = gui.addFolder("Tree Tweaks");
treeTweaks.close();
treeTweaks
  .add(params, "angle")
  .min(0.1)
  .max(10)
  .step(0.01)
  .onFinishChange(generateTrees);

const candyCaneTweaks = gui.addFolder("Candy Cane Tweaks");
candyCaneTweaks.close();

candyCaneTweaks
  .add(params, "angle")
  .min(0.1)
  .max(10)
  .step(0.01)
  .onChange(generateCandyCanes);

candyCaneTweaks
  .add(params, "candyCaneCount")
  .min(0)
  .max(40)
  .step(1)
  .onChange(generateCandyCanes);

// 3d Obj's
gltfLoader.load("models/gingerHouse/scene.gltf", (gltf) => {
  const model = gltf.scene;
  model.position.set(8.7, -0.36, 0);
  model.scale.set(3.5, 3.5, 3.5);
  model.rotation.y = Math.PI / 2;
  model.rotation.z = -0.04;
  scene.add(model);

  const houseFolder = gui.addFolder("House");
  houseFolder.add(model, "visible");
  const houseFolderPos = houseFolder.addFolder("Position");
  houseFolderPos.close();
  // Position
  houseFolderPos.add(model.position, "x").min(-10).max(10).step(0.01);
  houseFolderPos.add(model.position, "y").min(-10).max(10).step(0.01);
  houseFolderPos.add(model.position, "z").min(-10).max(10).step(0.01);
  // Rotation
  const houseFolderRot = houseFolder.addFolder("Rotation");
  houseFolderRot.close();
  houseFolderRot.add(model.rotation, "x").min(-6).max(6).step(0.01);
  houseFolderRot.add(model.rotation, "y").min(-6).max(6).step(0.01);
  houseFolderRot.add(model.rotation, "z").min(-6).max(6).step(0.01);

  //Scale
  const houseFolderScale = houseFolder.addFolder("Scale");
  houseFolderScale.close();
  houseFolderScale.add(model.scale, "x").min(0).max(4).step(0.01);
  houseFolderScale.add(model.scale, "y").min(0).max(4).step(0.01);
  houseFolderScale.add(model.scale, "z").min(0).max(4).step(0.01);

  houseFolder.close();
});

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      console.log("w");
      camera.position.lerp(new THREE.Vector3(0, 2, 0), 1);
      break;

    case "a":
      console.log("a");
      camera.position.lerp(new THREE.Vector3(-50, 2, 0), 0.1);
      break;
    case "s":
      console.log("s");
      camera.position.lerp(new THREE.Vector3(0, 2, 50), 0.01);
      break;
    case "d":
      console.log("d");
      camera.position.lerp(new THREE.Vector3(50, 2, 0), 0.1);
      break;
  }
});

// 3d text
fontLoader.load("/fonts/gentilis_regular.typeface.json", (font) => {
  const geometry = new TextGeometry("Merry Christmas", {
    font: font,
    size: 0.75,
    height: 0.2,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
  });
  geometry.center();

  geometry.computeBoundingBox();

  const text = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
  text.castShadow = true;
  text.material.transparent = true;
  text.position.set(-6, 6, -1);
  text.rotation.y = Math.PI / 4;
  scene.add(text);

  const textFolder = gui.addFolder("Text Folder");
  // Tweaks
  const textFolderTweaks = textFolder.addFolder("Tweaks");
  textFolderTweaks.close();
  textFolderTweaks.add(text.material, "wireframe");
  textFolderTweaks.add(text.material, "opacity").min(0).max(1).step(0.01);
  textFolderTweaks.add(text.material, "roughness").min(0).max(2).step(0.01);
  textFolderTweaks.add(text.material, "metalness").min(0).max(2).step(0.01);
  textFolderTweaks.addColor(params, "color").onChange(() => {
    text.material.color.set(params.color);
  });
  // Position
  const textFolderPosition = textFolder.addFolder("Position");
  textFolderPosition.close();
  textFolderPosition.add(text.position, "x").min(-6).max(6).step(0.01);
  textFolderPosition.add(text.position, "y").min(-6).max(6).step(0.01);
  textFolderPosition.add(text.position, "z").min(-6).max(6).step(0.01);

  // Rotation
  const textFolderRotation = textFolder.addFolder("Rotation");
  textFolderRotation.close();
  textFolderRotation
    .add(text.rotation, "x")
    .min(-fullRotation)
    .max(fullRotation)
    .step(0.01);
  textFolderRotation
    .add(text.rotation, "y")
    .min(-fullRotation)
    .max(fullRotation)
    .step(0.01);
  textFolderRotation
    .add(text.rotation, "z")
    .min(-fullRotation)
    .max(fullRotation)
    .step(0.01);

  textFolder.close();
});

// Lights
const spotLight = new THREE.SpotLight("green", 9.26, 99.22, 0.16, 1, 1.47);
spotLight.position.set(8.85, 4.68, 8.03);
// const spotLightHelper = new THREE.SpotLightHelper(spotLight, "green");
const spotLightTarget = spotLight.target;
spotLightTarget.position.set(-10, 4.96, 4.68);
scene.add(spotLight, spotLight.target);
console.log(spotLight);

gsap.fromTo(
  spotLight.color,
  {
    ease: "linear",
    r: 0,
    g: 1,
    b: 0,
  },
  {
    ease: "linear",
    r: 1,
    g: 0,
    b: 0,
    duration: 1.5,
    repeatDelay: 3,
    repeat: -1,
    yoyo: true,
  }
);

// Pointlight
const pointLight = new THREE.PointLight("white", 1.2, 23, 2.02);

pointLight.position.y = 1.26;
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0, "yellow");
scene.add(pointLight);
pointLight.castShadow = true;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 1;
pointLight.shadow.camera.far = 6;

const pointLight2 = new THREE.PointLight("white", 2, 50, 2.02);

pointLight2.position.y = 1.26;
// const pointLightHelper2 = new THREE.PointLightHelper(pointLight2, 0, "yellow");
scene.add(pointLight2);
pointLight2.castShadow = true;
pointLight2.shadow.mapSize.height = 1024;
pointLight2.shadow.camera.near = 1;
pointLight2.shadow.camera.far = 6;

//Debug Lights
const lightFolder = gui.addFolder("Light Folder");
lightFolder.close();
// Spotlight
const spotLightFolder = lightFolder.addFolder("Spotlight");
spotLightFolder.close();
// Spotlight Position
const spotLightTweaks = spotLightFolder.addFolder("Tweaks");
spotLightTweaks.close();
spotLightTweaks
  .addColor(params, "color")
  .onChange(() => {
    spotLight.color.set(params.color);
  })
  .name("Color");
spotLightTweaks.add(spotLight, "angle").min(0).max(1).step(0.001).name("Angle");
spotLightTweaks
  .add(spotLight, "distance")
  .min(0)
  .max(200)
  .step(0.001)
  .name("Distance");
spotLightTweaks
  .add(spotLight, "intensity")
  .min(0)
  .max(25)
  .step(0.01)
  .name("Intensity");
spotLightTweaks
  .add(spotLight, "penumbra")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Penumbra");
spotLightTweaks.add(spotLight, "decay").min(0).max(2).step(0.01).name("Decay");
spotLightTweaks.add(spotLight, "visible").name("Visible");
// Spotlight Target Position
const spotLightTargetPosition = spotLightFolder.addFolder("Target Position");
spotLightTargetPosition.close();
spotLightTargetPosition
  .add(spotLightTarget.position, "x")
  .min(-10)
  .max(10)
  .step(0.01);
spotLightTargetPosition
  .add(spotLightTarget.position, "y")
  .min(-10)
  .max(10)
  .step(0.01);
spotLightTargetPosition
  .add(spotLightTarget.position, "z")
  .min(-10)
  .max(10)
  .step(0.01);
// Spotlight Position
const spotLightPosition = spotLightFolder.addFolder("Light Position");
spotLightPosition.close();
spotLightPosition.add(spotLight.position, "x").min(-10).max(10).step(0.01);
spotLightPosition.add(spotLight.position, "y").min(-10).max(10).step(0.01);
spotLightPosition.add(spotLight.position, "z").min(-10).max(10).step(0.01);

// Pointlight
const pointLightFolder = lightFolder.addFolder("Pointlight");
pointLightFolder.close();
// Position
const pointLightPosition = pointLightFolder.addFolder("Position");
pointLightPosition.close();
pointLightPosition.add(pointLight.position, "x").min(-6).max(6).step(0.01);
pointLightPosition.add(pointLight.position, "y").min(-6).max(6).step(0.01);
pointLightPosition.add(pointLight.position, "z").min(-6).max(6).step(0.01);

// Tweaks
const pointLightTweaks = pointLightFolder.addFolder("Tweaks");
pointLightTweaks.close();
pointLightTweaks.addColor(params, "color").onChange(() => {
  pointLight.color.set(params.color);
});
pointLightTweaks.add(pointLight, "decay").min(0).max(10).step(0.01);
pointLightTweaks.add(pointLight, "intensity").min(0).max(10).step(0.01);
pointLightTweaks.add(pointLight, "distance").min(0).max(30).step(0.01);
pointLightTweaks.add(pointLight, "visible");

// Pointlight
const pointLightFolder2 = lightFolder.addFolder("Pointlight #2");
pointLightFolder2.close();
// Position
const pointLightPosition2 = pointLightFolder2.addFolder("Position");
pointLightPosition2.close();
pointLightPosition2.add(pointLight2.position, "x").min(-6).max(6).step(0.01);
pointLightPosition2.add(pointLight2.position, "y").min(-6).max(6).step(0.01);
pointLightPosition2.add(pointLight2.position, "z").min(-6).max(6).step(0.01);

// Tweaks
const pointLightTweaks2 = pointLightFolder2.addFolder("Tweaks");
pointLightTweaks2.close();
pointLightTweaks2.addColor(params, "color").onChange(() => {
  pointLight2.color.set(params.color);
});
pointLightTweaks2.add(pointLight2, "decay").min(0).max(10).step(0.01);
pointLightTweaks2.add(pointLight2, "intensity").min(0).max(10).step(0.01);
pointLightTweaks2.add(pointLight2, "distance").min(0).max(30).step(0.01);
pointLightTweaks2.add(pointLight2, "visible");

//Material
const material = new THREE.MeshStandardMaterial({
  map: snowTexture,
  roughnessMap: snowRoughTexture,
  displacementMap: snowDisplacementTexture,
  aoMap: snowAoTexture,
});
material.transparent = true;
material.roughness = 0.21;
material.metalness = 0.1;
material.opacity = 0.83;
// geometry
const planeGeometry = new THREE.PlaneGeometry(40, 40);
const plane = new THREE.Mesh(planeGeometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
plane.receiveShadow = true;
plane.transparent = true;

//Debug Plane
const planeFolder = gui.addFolder("Plane Folder");
planeFolder.close();
const planeFolderTweaks = planeFolder.addFolder("Tweaks");
planeFolderTweaks.close();
planeFolderTweaks.add(plane.material, "roughness").min(0).max(1).step(0.01);
planeFolderTweaks.add(plane.material, "metalness").min(0).max(1).step(0.01);
planeFolderTweaks.add(plane.material, "opacity").min(0).max(1).step(0.01);

//
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 5, 10);

const controls = new OrbitControls(camera, canvas);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.sRGBEncoding;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  camera.position.x = Math.sin(elapsedTime * 0.075) * 7;
  camera.position.z = Math.cos(elapsedTime * 0.3) * 10;

  pointLight.position.x = Math.sin(elapsedTime * 0.25) * 2;
  pointLight.position.z = Math.cos(elapsedTime * 0.25) * 2;
  pointLight.intensity = Math.sin(elapsedTime * 0.4);

  pointLight2.position.x = Math.sin(elapsedTime * 0.25) * 8;
  pointLight2.position.z = Math.cos(elapsedTime * 0.25) * 8;
  pointLight2.intensity = Math.sin(elapsedTime * 0.2) * 5;
  pointLight2.decay = Math.sin(elapsedTime * 0.25) * 10;
  pointLight2.distance = Math.sin(elapsedTime * 0.01) * 100;

  // particles
  particles.rotation.y += 0.001;
  particles.position.y = Math.sin(elapsedTime * 0.5) * 3;

  // spotlight
  spotLight.target.position.x = Math.abs(Math.cos(elapsedTime * 0.25) * 6);

  //controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
