import * as THREE from 'three';

import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

import cnoise from './perlin.js';

const UP = new THREE.Vector3(0, 1, 0);

class BackgroundCanvas {
  constructor(count) {
    this.speed = 0.00025;
    this.noiseScale = 0.5;
    this.dampening = 0.35;
    this.spacing = 0.0125;

    this.count = count;
    this.rowCount = Math.sqrt(this.count);

    this.setupCanvasElement = this.setupCanvasElement.bind(this);
    this.setupCamera = this.setupCamera.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateInstanceMatrices = this.updateInstanceMatrices.bind(this);
    this.animate = this.animate.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x000000, 1);
    this.elt = this.setupCanvasElement();
    this.handleResize();

    this.textureLoader = new THREE.TextureLoader();

    this.scene = new THREE.Scene();

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    //this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.1, 0.4, 0.85);
    //this.composer.addPass(this.bloomPass);

    this.boxGeometry = new THREE.CapsuleGeometry(0.0025, 0.25, 10, 20);
    this.boxMaterial = new THREE.MeshDepthMaterial();

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
    this.scene.add(this.directionalLight);
    this.directionalTarget = new THREE.Object3D();
    this.directionalTarget.position.x = 0;
    this.directionalTarget.position.y = 1;
    this.directionalTarget.position.z = 1;
    this.scene.add(this.directionalTarget);
    this.directionalLight.target = this.directionalTarget;

    this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xcccccc, .99);
    this.scene.add(this.hemisphereLight);

    this.instanceMatrix = new THREE.Matrix4();
    this.instancePos = new THREE.Vector3();
    this.instanceRotMat = new THREE.Matrix4();
    this.instanceMouseMat = new THREE.Matrix4();
    this.instanceOffset = new THREE.Vector3();
    this.instanceTarget = new THREE.Vector3();
    this.instanceEuler = new THREE.Euler();
    this.instanceNoiseUV = new THREE.Vector2();
    this.mesh = new THREE.InstancedMesh(this.boxGeometry, this.boxMaterial, this.count);
    this.scene.add(this.mesh);

    this.noiseTexture = null;
    this.textureLoader.load('textures/noise.png', (texture) => {
      this.noiseTexture = texture;
    }, undefined, (err) => {
      console.log('Could not load noise texture');
    })
  }

  setupCanvasElement() {
    const elt = this.renderer.domElement;
    elt.style.position = 'fixed';
    elt.style.zIndex = -1;
    elt.style.top = '0px';
    elt.style.right = '0px';
    elt.style.bottom = '0px';
    elt.style.left = '0px';
    document.body.appendChild(elt);
    return elt;
  }

  setupCamera() {
    const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.14, 0.5);
    cam.position.z = 0.27;
    return cam;
  }

  handleResize() {
    console.log('Window Size (', window.innerWidth, 'x', window.innerHeight, ')');
    this.camera = this.setupCamera();
    if (this.renderPass) {
      this.renderPass.camera = this.camera;

      //this.composer.removePass(this.bloomPass);
      //this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.1, 0.4, 0.85);
      //this.composer.addPass(this.bloomPass);
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateInstanceMatrices(timestamp) {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.instanceOffset.copy(this.raycaster.ray.direction).multiplyScalar(0.05);
    this.instanceTarget.copy(this.raycaster.ray.origin).add(this.instanceOffset);

    const t = timestamp * this.speed;

    const middleX = (this.rowCount * 0.5) * this.spacing;
    const middleY = (this.rowCount * 0.5) * this.spacing;

    for (let i = 0; i < this.count; ++i) {
      const px = i % this.rowCount;
      const py = Math.floor(i / this.rowCount);
      this.instancePos.x = (px * this.spacing) - middleX;
      this.instancePos.y = (py * this.spacing) - middleY;
      this.instanceMouseMat.lookAt(this.instancePos, this.instanceTarget, UP);
      this.instanceNoiseUV.set(px * this.noiseScale, t);
      this.instanceEuler.x = (Math.PI * 0.5) + (cnoise(this.instanceNoiseUV) * this.dampening);
      this.instanceNoiseUV.set(t, py * this.noiseScale);
      this.instanceEuler.z = cnoise(this.instanceNoiseUV) * this.dampening;
      this.instanceRotMat.makeRotationFromEuler(this.instanceEuler);
      this.instanceMatrix
        .makeTranslation(this.instancePos.x, this.instancePos.y, this.instancePos.z)
        .multiply(this.instanceRotMat)
        .multiply(this.instanceMouseMat);
      this.mesh.setMatrixAt(i, this.instanceMatrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  animate(timestamp) {
    requestAnimationFrame(this.animate);
    this.updateInstanceMatrices(timestamp);
    this.camera.position.y = window.scrollY * -0.0001;
    this.composer.render();
  }

  handleMouseMove(ev) {
    this.pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = - (ev.clientY / window.innerHeight) * 2 + 1;
  }
}

const bkg = new BackgroundCanvas(2000);

window.addEventListener('resize', bkg.handleResize);
window.addEventListener('mousemove', bkg.handleMouseMove);

requestAnimationFrame(bkg.animate);