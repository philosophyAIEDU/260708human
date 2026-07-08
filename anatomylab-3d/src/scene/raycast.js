// ============================================================
// raycast.js — 호버/클릭 판정
// 마우스 위치에서 광선을 쏴 클릭 가능한 구조를 찾습니다.
// 가려진(디졸브·숨김) 레이어의 구조는 후보에서 제외합니다.
// ============================================================
import * as THREE from 'three';

export function createRaycaster({ canvas, camera, model, layerManager, onHover, onPick }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoveredId = null;
  let downPos = null; // 드래그(회전)와 클릭 구분

  // 화면 좌표 → NDC
  function updatePointer(ev) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  }

  // mesh → 구조 id(부모를 거슬러 올라가며 탐색)
  function findStructureId(obj) {
    let cur = obj;
    while (cur) {
      if (cur.userData && cur.userData.id) return cur.userData.id;
      if (cur.userData && cur.userData.structureId) return cur.userData.structureId;
      cur = cur.parent;
    }
    return null;
  }

  // 현재 클릭 가능한 mesh 목록만 필터
  function activeMeshes() {
    return model.clickableMeshes.filter((m) => {
      if (!m.visible) return false;
      const id = findStructureId(m);
      if (!id) return false;
      const struct = model.structures.get(id);
      if (!struct) return false;
      return layerManager.isLayerActive(struct.userData.layerKey);
    });
  }

  // 광선 교차 → 가장 가까운 구조 id
  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(activeMeshes(), false);
    if (hits.length === 0) return null;
    return findStructureId(hits[0].object);
  }

  function setHighlight(id, level) {
    const s = model.structures.get(id);
    if (s) s.userData.setHighlight(level);
  }

  // 호버
  canvas.addEventListener('pointermove', (ev) => {
    updatePointer(ev);
    const id = pick();
    if (id !== hoveredId) {
      // 이전 호버 해제(선택된 것은 유지)
      if (hoveredId && hoveredId !== currentSelected) setHighlight(hoveredId, 0);
      hoveredId = id;
      if (id && id !== currentSelected) setHighlight(id, 1);
      onHover(id, ev);
    } else {
      onHover(id, ev); // 툴팁 위치 갱신
    }
  });

  // 클릭(드래그와 구분)
  canvas.addEventListener('pointerdown', (ev) => {
    downPos = { x: ev.clientX, y: ev.clientY };
  });
  canvas.addEventListener('pointerup', (ev) => {
    if (!downPos) return;
    const dist = Math.hypot(ev.clientX - downPos.x, ev.clientY - downPos.y);
    downPos = null;
    if (dist > 6) return; // 회전/드래그로 간주
    updatePointer(ev);
    const id = pick();
    if (id) onPick(id);
  });

  // 외부에서 선택 상태를 알려줌(하이라이트 유지용)
  let currentSelected = null;
  function setSelected(id) {
    // 이전 선택 해제
    if (currentSelected && currentSelected !== id) setHighlight(currentSelected, 0);
    currentSelected = id;
    if (id) setHighlight(id, 2);
  }
  function clearSelected() {
    if (currentSelected) setHighlight(currentSelected, 0);
    currentSelected = null;
  }

  return { setSelected, clearSelected, pick };
}
