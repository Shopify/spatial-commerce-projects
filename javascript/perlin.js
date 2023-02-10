import * as THREE from 'three';

function mod289(x) {
  // return x - floor(x * (1.0 / 289.0)) * 289.0;
  return x.clone().sub(x.clone().multiplyScalar(1.0 / 289.0).floor().multiplyScalar(289.0));
}

function permute(x) {
  // return mod289(((x*34.0)+10.0)*x);
  return mod289(x.clone().multiplyScalar(34.0).addScalar(10.0).multiply(x));
}

function taylorInvSqrt(r) {
  // return 1.79284291400159 - 0.85373472095314 * r;
  return r.clone().multiplyScalar(0.85373472095314).negate().addScalar(1.79284291400159);
}

function fade(t) {
  //return t*t*t*(t*(t*6.0-15.0)+10.0);
  return t.clone().multiplyScalar(6).addScalar(-15).multiply(t).addScalar(10).multiply(t).multiply(t).multiply(t);
}

function fract(x) {
  return x.clone().sub(x.clone().floor());
}

function abs(x) {
  x.x = Math.abs(x.x);
  x.y = Math.abs(x.y);
  x.z = Math.abs(x.z);
  if (x.w !== undefined) {
    x.w = Math.abs(x.w);
  }
  return x;
}

// Classic Perlin noise
export default function cnoise(p) {
  //vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  //Pi = mod289(Pi); // To avoid truncation effects in permutation
  const p_i = mod289((new THREE.Vector4(p.x, p.y, p.x, p.y)).floor().add(new THREE.Vector4(0, 0, 1, 1)));
  //vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  const p_f = fract(new THREE.Vector4(p.x, p.y, p.x, p.y)).sub(new THREE.Vector4(0, 0, 1, 1));
  //vec4 ix = Pi.xzxz;
  const ix = new THREE.Vector4(p_i.x, p_i.z, p_i.x, p_i.z);
  //vec4 iy = Pi.yyww;
  const iy = new THREE.Vector4(p_i.y, p_i.y, p_i.w, p_i.w);
  //vec4 fx = Pf.xzxz;
  const fx = new THREE.Vector4(p_f.x, p_f.z, p_f.x, p_f.z);
  //vec4 fy = Pf.yyww;
  const fy = new THREE.Vector4(p_f.y, p_f.y, p_f.w, p_f.w);

  //vec4 i = permute(permute(ix) + iy);
  const i = permute(permute(ix).add(iy));

  //vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  let gx = fract(i.multiplyScalar(1.0 / 41.0)).multiplyScalar(2).addScalar(-1);
  //vec4 gy = abs(gx) - 0.5 ;
  const gy = abs(gx.clone()).addScalar(-0.5);
  //vec4 tx = floor(gx + 0.5);
  const tx = gx.clone().addScalar(0.5).floor();
  //gx = gx - tx;
  gx = gx.sub(tx);

  //vec2 g00 = vec2(gx.x,gy.x);
  const g00 = new THREE.Vector2(gx.x, gy.x);
  //vec2 g10 = vec2(gx.y,gy.y);
  const g10 = new THREE.Vector2(gx.y, gy.y);
  //vec2 g01 = vec2(gx.z,gy.z);
  const g01 = new THREE.Vector2(gx.z, gy.z);
  //vec2 g11 = vec2(gx.w,gy.w);
  const g11 = new THREE.Vector2(gx.w, gy.w);

  //vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  const norm = taylorInvSqrt(new THREE.Vector4(g00.dot(g00), g01.dot(g01), g10.dot(g10), g11.dot(g11)));
  //g00 *= norm.x;  
  g00.multiplyScalar(norm.x);
  //g01 *= norm.y;  
  g01.multiplyScalar(norm.y);
  //g10 *= norm.z;
  g10.multiplyScalar(norm.z);
  //g11 *= norm.w;  
  g11.multiplyScalar(norm.w);

  //float n00 = dot(g00, vec2(fx.x, fy.x));
  const n00 = g00.dot(new THREE.Vector2(fx.x, fy.x));
  //float n10 = dot(g10, vec2(fx.y, fy.y));
  const n10 = g10.dot(new THREE.Vector2(fx.y, fy.y));
  //float n01 = dot(g01, vec2(fx.z, fy.z));
  const n01 = g01.dot(new THREE.Vector2(fx.z, fy.z));
  //float n11 = dot(g11, vec2(fx.w, fy.w));
  const n11 = g11.dot(new THREE.Vector2(fx.w, fy.w));

  //vec2 fade_xy = fade(Pf.xy);
  const fadeXY = fade(new THREE.Vector2(p_f.x, p_f.y));
  //vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  const nx = (new THREE.Vector2(n00, n01)).lerp(new THREE.Vector2(n10, n11), fadeXY.x);
  //float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  const nxy = THREE.MathUtils.lerp(nx.x, nx.y, fadeXY.y);
  return 2.3 * nxy;
}