import * as THREE from 'three';

import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';

import cnoise from './perlin.js';

const UP = new THREE.Vector3(0, 1, 0);

function hexToVec(hex) {
  const tmp = (hex + '').replace(/[^0-9a-fA-F]/g, '');
  return [
    parseInt(tmp.substring(0, 2), 16) / 255.0,
    parseInt(tmp.substring(2, 4), 16) / 255.0,
    parseInt(tmp.substring(4, 6), 16) / 255.0
  ];
}

function vecToHex(vec) {
  return (
    '#' +
    Math.abs(vec[0] * 255.0).toString(16).padStart(2, '0') +
    Math.abs(vec[1] * 255.0).toString(16).padStart(2, '0') +
    Math.abs(vec[2] * 255.0).toString(16).padStart(2, '0')
  );
}

function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const material = new THREE.ShaderMaterial({
  uniforms: {
    minDepth: { value: 0.0 },
    maxDepth: { value: 0.333 },
    startColor: { value: hexToVec(isDarkMode() ? '#2A3A41' : '#EEEEEF') },
    endColor: { value: hexToVec(isDarkMode() ? '#201A09' : '#FFFFFF') }
  },
  vertexShader: `
uniform float minDepth;
uniform float maxDepth;

varying float depth;

float mapLinear(float x, float a1, float a2, float b1, float b2) {
	return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
}

void main() {
  vec4 camPos = vec4(cameraPosition, 1.0);
  vec4 pos = instanceMatrix * modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * pos;
  depth = mapLinear(abs(camPos.z / camPos.w - pos.z / pos.w), minDepth, maxDepth, 0.0, 1.0);
}`,
  fragmentShader: `
uniform vec3 startColor;
uniform vec3 endColor;

varying float depth;

void main() {
  gl_FragColor.rgb = mix(startColor, endColor, depth);
  gl_FragColor.a = 1.0;
}`
});

class BackgroundCanvas {
  constructor(count) {
    this.speed = 0.00012;
    this.noiseScale = 0.224;
    this.effectStrength = 0.35;
    this.spacingX = 0.0164;
    this.spacingY = 0.03;
    this.mouseStrength = 0.008;

    this.count = count;

    this.updateCount = this.updateCount.bind(this);
    this.setupCanvasElement = this.setupCanvasElement.bind(this);
    this.setupCamera = this.setupCamera.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateInstanceMatrices = this.updateInstanceMatrices.bind(this);
    this.animate = this.animate.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(isDarkMode() ? 0x000000 : 0xFFFFFF, 1);
    this.elt = this.setupCanvasElement();
    this.handleResize();

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.boxGeometry = new THREE.CapsuleGeometry(0.005, 0.25, 10, 20);
    this.boxMaterial = material;

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

    this.updateCount(count);

    this.instanceMatrix = new THREE.Matrix4();
    this.instancePos = new THREE.Vector3();
    this.instanceRotMat = new THREE.Matrix4();
    this.instanceMouseMat = new THREE.Matrix4();
    this.instanceOffset = new THREE.Vector3();
    this.instanceTarget = new THREE.Vector3();
    this.instanceEuler = new THREE.Euler();
    this.instanceNoiseUV = new THREE.Vector2();
  }

  updateCount(count) {
    this.count = count;
    this.rowCount = Math.sqrt(this.count);
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
    this.mesh = new THREE.InstancedMesh(this.boxGeometry, this.boxMaterial, this.count);
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
    const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.14, 2);
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
    this.instanceOffset.copy(this.raycaster.ray.direction).multiplyScalar(this.mouseStrength);
    this.instanceTarget.copy(this.raycaster.ray.origin).add(this.instanceOffset);

    const t = timestamp * this.speed;

    const middleX = (this.rowCount * 0.5) * this.spacingX;
    const middleY = (this.rowCount * 0.5) * this.spacingY;

    for (let i = 0; i < this.count; ++i) {
      const px = i % this.rowCount;
      const py = Math.floor(i / this.rowCount);
      this.instancePos.x = (px * this.spacingX) - middleX;
      this.instancePos.y = (py * this.spacingY) - middleY;
      this.instanceMouseMat.lookAt(this.instancePos, this.instanceTarget, UP);
      this.instanceNoiseUV.set(px * this.noiseScale, t);
      this.instanceEuler.x = (Math.PI * 0.5) + (cnoise(this.instanceNoiseUV) * this.effectStrength);
      this.instanceNoiseUV.set(t, py * this.noiseScale);
      this.instanceEuler.z = cnoise(this.instanceNoiseUV) * this.effectStrength;
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

/*
/////////////////////////////////
///////// CONFIG PANEL

////////////
/// Count
const bkgCount = document.getElementById('bkg-count');
const bkgCountLabel = document.getElementById('bkg-count-label');

const updateCountLabel = () => {
  bkgCountLabel.textContent = 'Count ' + bkgCount.value;
};
bkgCount.value = bkg.count;
updateCountLabel();

bkgCount.addEventListener('input', () => {
  updateCountLabel();
  bkg.updateCount(parseInt(bkgCount.value, 10));
});

////////////
/// Speed
const bkgSpeed = document.getElementById('bkg-speed');
const bkgSpeedLabel = document.getElementById('bkg-speed-label');

const updateSpeedLabel = () => {
  bkgSpeedLabel.textContent = 'Speed ' + bkgSpeed.value;
};
bkgSpeed.value = bkg.speed;
updateSpeedLabel();

bkgSpeed.addEventListener('input', () => {
  updateSpeedLabel();
  bkg.speed = parseFloat(bkgSpeed.value);
});

/////////////////
/// NoiseScale
const bkgNoiseScale = document.getElementById('bkg-noise-scale');
const bkgNoiseScaleLabel = document.getElementById('bkg-noise-scale-label');

const updateNoiseScaleLabel = () => {
  bkgNoiseScaleLabel.textContent = 'Noise Scale ' + bkgNoiseScale.value;
};
bkgNoiseScale.value = bkg.noiseScale;
updateNoiseScaleLabel();

bkgNoiseScale.addEventListener('input', () => {
  updateNoiseScaleLabel();
  bkg.noiseScale = parseFloat(bkgNoiseScale.value);
});

/////////////////////
/// EffectStrength
const bkgEffectStrength = document.getElementById('bkg-effect-strength');
const bkgEffectStrengthLabel = document.getElementById('bkg-effect-strength-label');

const updateEffectStrengthLabel = () => {
  bkgEffectStrengthLabel.textContent = 'Effect Strength ' + bkgEffectStrength.value;
};
bkgEffectStrength.value = bkg.effectStrength;
updateEffectStrengthLabel();

bkgEffectStrength.addEventListener('input', () => {
  updateEffectStrengthLabel();
  bkg.effectStrength = parseFloat(bkgEffectStrength.value);
});

///////////////
/// SpacingX
const bkgSpacingX = document.getElementById('bkg-spacing-x');
const bkgSpacingXLabel = document.getElementById('bkg-spacing-x-label');

const updateSpacingXLabel = () => {
  bkgSpacingXLabel.textContent = 'Spacing X ' + bkgSpacingX.value;
};
bkgSpacingX.value = bkg.spacingX;
updateSpacingXLabel();

bkgSpacingX.addEventListener('input', () => {
  updateSpacingXLabel();
  bkg.spacingX = parseFloat(bkgSpacingX.value);
});

///////////////
/// SpacingY
const bkgSpacingY = document.getElementById('bkg-spacing-y');
const bkgSpacingYLabel = document.getElementById('bkg-spacing-y-label');

const updateSpacingYLabel = () => {
  bkgSpacingYLabel.textContent = 'Spacing Y ' + bkgSpacingY.value;
};
bkgSpacingY.value = bkg.spacingY;
updateSpacingYLabel();

bkgSpacingY.addEventListener('input', () => {
  updateSpacingYLabel();
  bkg.spacingY = parseFloat(bkgSpacingY.value);
});

////////////////////
/// MouseStrength
const bkgMouseStrength = document.getElementById('bkg-mouse-strength');
const bkgMouseStrengthLabel = document.getElementById('bkg-mouse-strength-label');

const updateMouseStrengthLabel = () => {
  bkgMouseStrengthLabel.textContent = 'Mouse Strength ' + bkgMouseStrength.value;
};
bkgMouseStrength.value = bkg.mouseStrength;
updateMouseStrengthLabel();

bkgMouseStrength.addEventListener('input', () => {
  updateMouseStrengthLabel();
  bkg.mouseStrength = parseFloat(bkgMouseStrength.value);
});

/////////////////////
/// Capsule Radius
const bkgCapsuleRadius = document.getElementById('bkg-capsule-radius');
const bkgCapsuleRadiusLabel = document.getElementById('bkg-capsule-radius-label');

const updateCapsuleRadiusLabel = () => {
  bkgCapsuleRadiusLabel.textContent = 'Capsule Radius ' + bkgCapsuleRadius.value;
};
bkgCapsuleRadius.value = bkg.boxGeometry.radius;
updateCapsuleRadiusLabel();

bkgCapsuleRadius.addEventListener('input', () => {
  updateCapsuleRadiusLabel();
  bkg.boxGeometry = new THREE.CapsuleGeometry(parseFloat(bkgCapsuleRadius.value), parseFloat(bkgCapsuleLength.value), 10, 20);
  bkg.updateCount(bkg.count);
});

/////////////////////
/// Capsule Length
const bkgCapsuleLength = document.getElementById('bkg-capsule-length');
const bkgCapsuleLengthLabel = document.getElementById('bkg-capsule-length-label');

const updateCapsuleLengthLabel = () => {
  bkgCapsuleLengthLabel.textContent = 'Capsule Length ' + bkgCapsuleLength.value;
};
bkgCapsuleLength.value = bkg.boxGeometry.parameters.height;
updateCapsuleLengthLabel();

bkgCapsuleLength.addEventListener('input', () => {
  updateCapsuleLengthLabel();
  bkg.boxGeometry = new THREE.CapsuleGeometry(parseFloat(bkgCapsuleRadius.value), parseFloat(bkgCapsuleLength.value), 10, 20);
  bkg.updateCount(bkg.count);
});

///////////////
/// Camera Z
const bkgCameraZ = document.getElementById('bkg-camera-z');
const bkgCameraZLabel = document.getElementById('bkg-camera-z-label');

const updateCameraZLabel = () => {
  bkgCameraZLabel.textContent = 'Camera Z ' + bkgCameraZ.value;
};
bkgCameraZ.value = bkg.camera.position.z;
updateCameraZLabel();

bkgCameraZ.addEventListener('input', () => {
  updateCameraZLabel();
  bkg.camera.position.z = parseFloat(bkgCameraZ.value);
});

//////////////////
/// Z Color Max
const bkgZColorMax = document.getElementById('bkg-z-color-max');
const bkgZColorMaxLabel = document.getElementById('bkg-z-color-max-label');

const updateZColorMaxLabel = () => {
  bkgZColorMaxLabel.textContent = 'Z Color Max ' + bkgZColorMax.value;
};
bkgZColorMax.value = bkg.boxMaterial.uniforms.maxDepth.value;
updateZColorMaxLabel();

bkgZColorMax.addEventListener('input', () => {
  updateZColorMaxLabel();
  bkg.boxMaterial.uniforms.maxDepth.value = parseFloat(bkgZColorMax.value);
});

////////////////////
/// Z Color Start
const bkgZColorStart = document.getElementById('bkg-z-color-start');

bkgZColorStart.value = vecToHex(bkg.boxMaterial.uniforms.startColor.value);

bkgZColorStart.addEventListener('input', () => {
  bkg.boxMaterial.uniforms.startColor.value = hexToVec(bkgZColorStart.value);
});

///////////////////
/// Z Color End
const bkgZColorEnd = document.getElementById('bkg-z-color-end');

bkgZColorEnd.value = vecToHex(bkg.boxMaterial.uniforms.endColor.value);

bkgZColorEnd.addEventListener('input', () => {
  bkg.boxMaterial.uniforms.endColor.value = hexToVec(bkgZColorEnd.value);
});
*/