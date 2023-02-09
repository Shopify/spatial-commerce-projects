import * as THREE from 'three';

import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

const UP = new THREE.Vector3(0, 1, 0);
const DEFAULT_MESH_ROTATION = (new THREE.Matrix4()).makeRotationX(Math.PI * 0.5);

class BackgroundCanvas {
  constructor(count) {
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
    this.renderer.setClearColor(0xFFFFFF, 1);
    this.elt = this.setupCanvasElement();
    this.handleResize();

    this.scene = new THREE.Scene();

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.1, 0.4, 0.85);
    this.composer.addPass(this.bloomPass);

    this.boxGeometry = new THREE.CapsuleGeometry(0.1, 1, 10, 20);
    this.boxMaterial = new THREE.MeshPhysicalMaterial({color: 0xffffff});

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
    this.mesh = new THREE.InstancedMesh(this.boxGeometry, this.boxMaterial, this.count);
    this.updateInstanceMatrices();
    this.scene.add(this.mesh);
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
    return new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  }

  handleResize() {
    console.log('Window Size (', window.innerWidth, 'x', window.innerHeight, ')');
    this.camera = this.setupCamera();
    if (this.renderPass) {
      this.renderPass.camera = this.camera;

      this.composer.removePass(this.bloomPass);
      this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.1, 0.4, 0.85);
      this.composer.addPass(this.bloomPass);
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateInstanceMatrices() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const offset = this.raycaster.ray.direction.clone().multiplyScalar(1.2);
    const target = this.raycaster.ray.origin.clone().add(offset);

    const pos = new THREE.Vector3(0, 0, 0);
    const rot = new THREE.Matrix4();
    for (let i = 0; i < this.count; ++i) {
      const px = i % this.rowCount;
      const py = Math.floor(i / this.rowCount);
      pos.x = 5.5 - (px * 0.3);
      pos.y = 3 - (py * 0.3);
      pos.z = -2;
      rot.lookAt(pos, target, UP);
      this.instanceMatrix
        .makeTranslation(pos.x, pos.y, pos.z)
        .multiply(DEFAULT_MESH_ROTATION)
        .multiply(rot);
      this.mesh.setMatrixAt(i, this.instanceMatrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.updateInstanceMatrices();
    this.camera.position.y = window.scrollY * -0.001;
    this.composer.render();
  }

  handleMouseMove(ev) {
    this.pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = - (ev.clientY / window.innerHeight) * 2 + 1;
  }
}

const bkg = new BackgroundCanvas(1000);

window.addEventListener('resize', bkg.handleResize);
window.addEventListener('mousemove', bkg.handleMouseMove);

bkg.animate();