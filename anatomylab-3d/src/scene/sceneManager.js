// ============================================================
// sceneManager.js — renderer / camera / lights / OrbitControls / 루프
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createSceneManager(canvas) {
  // ── 렌더러 ──
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0e14, 1); // 다크 배경

  // ── 씬 ──
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e14, 0.015);

  // ── 카메라 ──
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  const DEFAULT_CAM = new THREE.Vector3(0, 3.0, 18);
  const DEFAULT_TARGET = new THREE.Vector3(0, 2.5, 0);
  camera.position.copy(DEFAULT_CAM);

  // ── 은은한 3점 조명(rim 셰이더와 별개로 씬 분위기용) ──
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(6, 10, 8);
  const fill = new THREE.DirectionalLight(0x88aaff, 0.5);
  fill.position.set(-8, 3, 6);
  const back = new THREE.DirectionalLight(0x99ffee, 0.4);
  back.position.set(0, 4, -10);
  const ambient = new THREE.AmbientLight(0x334455, 0.6);
  scene.add(key, fill, back, ambient);

  // ── OrbitControls ──
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.copy(DEFAULT_TARGET);
  controls.minDistance = 6;
  controls.maxDistance = 45;
  controls.update();

  // ── 리사이즈 ──
  function resize() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ── 애니메이션 루프 ──
  const clock = new THREE.Clock();
  const tickCallbacks = [];
  function onTick(fn) {
    tickCallbacks.push(fn);
  }
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    controls.update();
    tickCallbacks.forEach((fn) => fn(elapsed));
    renderer.render(scene, camera);
  }
  animate();

  // 시점 초기화
  function resetView() {
    camera.position.copy(DEFAULT_CAM);
    controls.target.copy(DEFAULT_TARGET);
    controls.update();
  }

  return { renderer, scene, camera, controls, onTick, resize, resetView };
}
