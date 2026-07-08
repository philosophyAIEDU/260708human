// ============================================================
// bodyModel.js — 도식형(스타일라이즈드) 인체 3D 생성
// ------------------------------------------------------------
// 4개 레이어 그룹(skin→muscle→skeleton→organs)을 만들고,
// 각 구조를 Three.js 프리미티브 조합으로 배치합니다.
// 각 구조 루트에 userData={ id, layerKey } 를 부여해 데이터와 연결합니다.
//
// TODO: 실제 정밀 해부 모델은 GLTFLoader 로 public/ 의 .glb 를 로드하고
//       각 mesh.name 을 data/structures.js 의 id 와 매핑하세요
//       (예: Z-Anatomy 등 CC 라이선스 모델).
//       매핑만 맞추면 클릭·하이라이트·정보 패널이 그대로 동작합니다.
//
//   loader.load('/body.glb', (gltf) => {
//     gltf.scene.traverse((o) => {
//       if (o.isMesh && STRUCTURE_BY_ID[o.name]) {
//         registerStructureMesh(o, o.name, STRUCTURE_BY_ID[o.name].layer);
//       }
//     });
//   });
// ============================================================
import * as THREE from 'three';
import { rimVertex, rimFragment } from './shaders/rim.js';

const COLORS = {
  skin: 0xd9a679,
  muscle: 0xb0413c,
  bone: 0xeae4d0,
  heart: 0xc0392b,
  lungs: 0xd98098,
  liver: 0x7a3b2e,
  stomach: 0xcf8a5a,
  kidney: 0x8a4a3a,
  small_intestine: 0xd8a06a,
  large_intestine: 0xc98b55,
  brain: 0xd7a9b0,
  spleen: 0x6e3b5e,
  pancreas: 0xc9a24b
};

// 모든 rim 머티리얼(uTime 갱신용)
const allRimMaterials = [];

// rim 셰이더 머티리얼 생성
function makeRimMaterial(color, opacity = 1, depthWrite = true) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uHighlight: { value: 0 },
      uTime: { value: 0 }
    },
    vertexShader: rimVertex,
    fragmentShader: rimFragment,
    transparent: true,
    depthWrite
  });
  allRimMaterials.push(mat);
  return mat;
}

// 개별 mesh 생성(rim 머티리얼 부착)
function mkMesh(geometry, color, { pos = [0, 0, 0], rot = [0, 0, 0], opacity = 1, depthWrite = true } = {}) {
  const mesh = new THREE.Mesh(geometry, makeRimMaterial(color, opacity, depthWrite));
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.userData.baseColor = color;
  return mesh;
}

// 하나의 "구조"(클릭 단위) 생성: 여러 mesh를 묶어도 하나의 id로 취급
function makeStructure(id, layerKey, meshes) {
  const group = new THREE.Group();
  meshes.forEach((m) => {
    m.userData.structureId = id; // raycast가 부모를 거슬러 올라가 찾음
    group.add(m);
  });
  group.userData = {
    id,
    layerKey,
    meshes,
    // 하이라이트 상태 일괄 적용(0/1/2)
    setHighlight(v) {
      meshes.forEach((m) => (m.material.uniforms.uHighlight.value = v));
    },
    // 불투명도 일괄 적용(레이어 페이드)
    setOpacity(o) {
      meshes.forEach((m) => (m.material.uniforms.uOpacity.value = o));
    }
  };
  return group;
}

// ── 자주 쓰는 프리미티브 헬퍼 ──
const sphere = (r, s = 24) => new THREE.SphereGeometry(r, s, s);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 16);
const cyl = (rt, rb, h) => new THREE.CylinderGeometry(rt, rb, h, 20);
const torus = (r, tube) => new THREE.TorusGeometry(r, tube, 12, 32);

// 좌우 대칭 mesh 한 쌍 생성
function pair(geoFactory, color, x, y, z, opts = {}) {
  return [
    mkMesh(geoFactory(), color, { ...opts, pos: [x, y, z] }),
    mkMesh(geoFactory(), color, { ...opts, pos: [-x, y, z] })
  ];
}

// ============================================================
// 모델 빌드
// ============================================================
export function buildBodyModel() {
  const root = new THREE.Group();
  const layers = {
    skin: new THREE.Group(),
    muscle: new THREE.Group(),
    skeleton: new THREE.Group(),
    organs: new THREE.Group()
  };
  const structures = new Map(); // id → 구조 그룹
  const clickableMeshes = []; // raycast 대상 mesh 목록

  const addStructure = (structGroup) => {
    const { id, layerKey } = structGroup.userData;
    layers[layerKey].add(structGroup);
    structures.set(id, structGroup);
    structGroup.userData.meshes.forEach((m) => clickableMeshes.push(m));
  };

  // ---------- SKIN 레이어 ----------
  // 반투명 전신 실루엣(맥락용, 클릭 대상 아님)
  const skinTone = COLORS.skin;
  const shellOpts = { opacity: 0.22, depthWrite: false };
  const shell = new THREE.Group();
  shell.add(mkMesh(sphere(1.35), skinTone, { pos: [0, 6.5, 0], ...shellOpts })); // 머리
  shell.add(mkMesh(cyl(0.45, 0.55, 1.0), skinTone, { pos: [0, 5.3, 0], ...shellOpts })); // 목
  shell.add(mkMesh(box(3.0, 3.8, 1.7), skinTone, { pos: [0, 3.0, 0], ...shellOpts })); // 몸통
  shell.add(mkMesh(box(2.4, 1.2, 1.4), skinTone, { pos: [0, 0.5, 0], ...shellOpts })); // 골반부
  shell.add(...pair(() => capsule(0.42, 2.0), skinTone, 2.0, 3.4, 0, shellOpts)); // 위팔
  shell.add(...pair(() => capsule(0.36, 1.9), skinTone, 2.15, 1.2, 0, shellOpts)); // 아래팔
  shell.add(...pair(() => capsule(0.55, 3.2), skinTone, 0.72, -1.9, 0, shellOpts)); // 허벅지
  shell.add(...pair(() => capsule(0.45, 3.0), skinTone, 0.75, -5.6, 0, shellOpts)); // 종아리
  shell.userData.isContext = true;
  layers.skin.add(shell);
  layers.skin.userData.contextShell = shell;

  // 피부 3층 단면 인셋(우측 어깨 옆) — 클릭 가능한 실제 구조
  const insetX = 3.4;
  addStructure(
    makeStructure('epidermis', 'skin', [
      mkMesh(box(1.4, 0.35, 0.8), 0xf0c9a0, { pos: [insetX, 4.4, 0] })
    ])
  );
  addStructure(
    makeStructure('dermis', 'skin', [
      mkMesh(box(1.4, 0.7, 0.8), 0xd98c74, { pos: [insetX, 3.85, 0] })
    ])
  );
  addStructure(
    makeStructure('hypodermis', 'skin', [
      mkMesh(box(1.4, 0.6, 0.8), 0xf4d47a, { pos: [insetX, 3.2, 0] })
    ])
  );

  // ---------- MUSCLE 레이어 ----------
  const mus = COLORS.muscle;
  addStructure(makeStructure('pectoralis_major', 'muscle', [
    mkMesh(box(2.4, 1.2, 0.4), mus, { pos: [0, 3.9, 0.75] })
  ]));
  addStructure(makeStructure('deltoid', 'muscle',
    pair(() => sphere(0.72, 20), mus, 1.55, 4.35, 0)
  ));
  addStructure(makeStructure('biceps_brachii', 'muscle',
    pair(() => capsule(0.34, 1.3), mus, 2.0, 3.5, 0.28)
  ));
  addStructure(makeStructure('triceps_brachii', 'muscle',
    pair(() => capsule(0.34, 1.3), mus, 2.0, 3.5, -0.28)
  ));
  addStructure(makeStructure('rectus_abdominis', 'muscle', [
    mkMesh(box(1.2, 2.0, 0.35), mus, { pos: [0, 1.9, 0.72] })
  ]));
  addStructure(makeStructure('quadriceps_femoris', 'muscle',
    pair(() => capsule(0.42, 2.2), mus, 0.72, -1.9, 0.32)
  ));
  addStructure(makeStructure('trapezius', 'muscle', [
    mkMesh(box(2.6, 1.6, 0.4), mus, { pos: [0, 4.5, -0.6] })
  ]));
  addStructure(makeStructure('latissimus_dorsi', 'muscle', [
    mkMesh(box(2.6, 1.9, 0.35), mus, { pos: [0, 2.6, -0.72] })
  ]));

  // ---------- SKELETON 레이어 ----------
  const bone = COLORS.bone;
  addStructure(makeStructure('skull', 'skeleton', [
    mkMesh(sphere(1.12), bone, { pos: [0, 6.5, 0] }),
    mkMesh(box(1.0, 0.7, 0.9), bone, { pos: [0, 5.7, 0.15] }) // 아래턱 느낌
  ]));
  addStructure(makeStructure('sternum', 'skeleton', [
    mkMesh(box(0.42, 1.7, 0.2), bone, { pos: [0, 3.6, 0.55] })
  ]));
  // 늑골: 좌우로 감싸는 여러 개의 토러스 반호
  const ribMeshes = [];
  for (let i = 0; i < 6; i++) {
    const y = 4.3 - i * 0.42;
    const r = 1.25 - i * 0.03;
    ribMeshes.push(mkMesh(torus(r, 0.07), bone, { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0] }));
  }
  addStructure(makeStructure('ribs', 'skeleton', ribMeshes));
  // 척추: 세로 스택
  const spineMeshes = [];
  for (let i = 0; i < 12; i++) {
    spineMeshes.push(mkMesh(sphere(0.24, 12), bone, { pos: [0, 5.0 - i * 0.42, -0.45] }));
  }
  addStructure(makeStructure('spine', 'skeleton', spineMeshes));
  addStructure(makeStructure('pelvis', 'skeleton', [
    mkMesh(torus(0.95, 0.32), bone, { pos: [0, 0.3, 0], rot: [Math.PI / 2.2, 0, 0] })
  ]));
  addStructure(makeStructure('femur', 'skeleton',
    pair(() => cyl(0.22, 0.24, 3.2), bone, 0.72, -1.9, 0)
  ));
  addStructure(makeStructure('humerus', 'skeleton',
    pair(() => cyl(0.18, 0.2, 2.0), bone, 2.0, 3.5, 0)
  ));
  // 요골(가쪽)·척골(안쪽) — 아래팔
  addStructure(makeStructure('radius', 'skeleton',
    pair(() => cyl(0.13, 0.14, 1.9), bone, 2.32, 1.2, 0.05)
  ));
  addStructure(makeStructure('ulna', 'skeleton',
    pair(() => cyl(0.13, 0.15, 1.95), bone, 2.02, 1.2, -0.05)
  ));

  // ---------- ORGANS 레이어 ----------
  addStructure(makeStructure('brain', 'organs', [
    mkMesh(sphere(0.85, 24), COLORS.brain, { pos: [0, 6.6, 0] })
  ]));
  addStructure(makeStructure('heart', 'organs', [
    mkMesh(sphere(0.55, 20), COLORS.heart, { pos: [-0.25, 3.5, 0.15] })
  ]));
  const lung = () => {
    const g = sphere(0.62, 20);
    g.scale(0.8, 1.25, 0.8);
    return g;
  };
  addStructure(makeStructure('lungs', 'organs',
    pair(lung, COLORS.lungs, 0.72, 3.6, 0)
  ));
  addStructure(makeStructure('liver', 'organs', [
    mkMesh(box(1.5, 0.7, 0.9), COLORS.liver, { pos: [0.55, 2.55, 0.15] })
  ]));
  addStructure(makeStructure('stomach', 'organs', [
    mkMesh(sphere(0.5, 20), COLORS.stomach, { pos: [-0.6, 2.35, 0.1] })
  ]));
  addStructure(makeStructure('spleen', 'organs', [
    mkMesh(sphere(0.32, 16), COLORS.spleen, { pos: [-1.0, 2.5, -0.1] })
  ]));
  addStructure(makeStructure('pancreas', 'organs', [
    mkMesh(box(1.0, 0.22, 0.3), COLORS.pancreas, { pos: [-0.1, 2.15, -0.15] })
  ]));
  addStructure(makeStructure('kidney', 'organs',
    pair(() => sphere(0.3, 16), COLORS.kidney, 0.65, 1.75, -0.35)
  ));
  addStructure(makeStructure('large_intestine', 'organs', [
    mkMesh(torus(0.75, 0.22), COLORS.large_intestine, { pos: [0, 1.3, 0.1], rot: [Math.PI / 2, 0, 0] })
  ]));
  addStructure(makeStructure('small_intestine', 'organs', [
    mkMesh(new THREE.TorusKnotGeometry(0.42, 0.14, 80, 8), COLORS.small_intestine, { pos: [0, 1.3, 0.15] })
  ]));

  // 레이어 그룹 조립
  Object.values(layers).forEach((g) => root.add(g));

  // uTime 갱신
  root.userData.updateTime = (t) => {
    for (let i = 0; i < allRimMaterials.length; i++) {
      allRimMaterials[i].uniforms.uTime.value = t;
    }
  };

  return { root, layers, structures, clickableMeshes };
}
