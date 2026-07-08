// ============================================================
// layers.js — 레이어 토글 / 깊이 슬라이더 / 디졸브 전환
// ------------------------------------------------------------
// - 각 레이어(skin·muscle·skeleton·organs)의 표시/숨김 토글
// - 깊이 슬라이더(0~4): 바깥 레이어부터 점진적으로 "벗김"(디졸브)
// - 디졸브 진행 중에는 dissolve 셰이더, 완전히 보일 때는 rim 셰이더 사용
// - 가려진(디졸브된) 구조는 클릭 대상에서 제외
// ============================================================
import * as THREE from 'three';
import { LAYER_KEYS } from '../data/structures.js';
import { dissolveVertex, dissolveFragment } from './shaders/dissolve.js';
import { t } from '../i18n/index.js';

const LAYER_INDEX = { skin: 0, muscle: 1, skeleton: 2, organs: 3 };
const EDGE_COLOR = new THREE.Color(0x66e0ff);

// 구조 mesh 각각에 dissolve 머티리얼을 미리 만들어 붙임
function makeDissolveMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 1 },
      uProgress: { value: 0 },
      uEdgeColor: { value: EDGE_COLOR }
    },
    vertexShader: dissolveVertex,
    fragmentShader: dissolveFragment,
    transparent: true,
    depthWrite: false
  });
}

export function createLayerManager({ model, onTick }) {
  // 레이어별 상태
  const state = {};
  LAYER_KEYS.forEach((k) => {
    state[k] = { shown: true, current: 0 }; // current: 애니메이션된 peel(0~1)
  });
  let depth = 0; // 깊이 슬라이더 값(0~4)

  // 각 구조 mesh 에 rim/dissolve 머티리얼 준비
  model.structures.forEach((struct) => {
    struct.userData.meshes.forEach((m) => {
      m.userData.rimMat = m.material;
      m.userData.dissolveMat = makeDissolveMaterial(m.userData.baseColor);
    });
  });

  const shell = model.layers.skin.userData.contextShell || null;

  // 특정 레이어가 슬라이더에 의해 얼마나 벗겨졌는지(0~1)
  function sliderPeel(layerKey) {
    return THREE.MathUtils.clamp(depth - LAYER_INDEX[layerKey], 0, 1);
  }
  // 최종 목표 peel: 숨김이면 1, 아니면 슬라이더 값
  function targetPeel(layerKey) {
    return state[layerKey].shown ? sliderPeel(layerKey) : 1;
  }

  // 구조의 각 mesh 에 peel 적용
  function applyPeelToStruct(struct, p) {
    struct.userData.meshes.forEach((m) => {
      if (p <= 0.002) {
        // 완전히 보임 → rim 셰이더(하이라이트 가능)
        if (m.material !== m.userData.rimMat) m.material = m.userData.rimMat;
        m.material.uniforms.uOpacity.value = 1;
        m.visible = true;
      } else if (p >= 0.998) {
        // 완전히 사라짐
        m.visible = false;
      } else {
        // 전환 중 → dissolve 셰이더
        if (m.material !== m.userData.dissolveMat) m.material = m.userData.dissolveMat;
        m.material.uniforms.uProgress.value = p;
        m.material.uniforms.uOpacity.value = 1.0 - 0.35 * p;
        m.visible = true;
      }
    });
  }

  // 매 프레임: current → target 로 부드럽게 이동
  onTick(() => {
    LAYER_KEYS.forEach((layerKey) => {
      const st = state[layerKey];
      const target = targetPeel(layerKey);
      st.current += (target - st.current) * 0.15;
      if (Math.abs(target - st.current) < 0.001) st.current = target;

      // 해당 레이어의 모든 구조에 적용
      model.layers[layerKey].children.forEach((child) => {
        if (child.userData && child.userData.id) applyPeelToStruct(child, st.current);
      });
    });

    // 피부 맥락 실루엣 처리
    if (shell) {
      const p = state.skin.current;
      const vis = state.skin.shown && p < 0.98;
      shell.visible = vis;
      shell.children.forEach((m) => {
        if (m.material && m.material.uniforms) {
          m.material.uniforms.uOpacity.value = 0.22 * (1 - p);
        }
      });
    }
  });

  // 레이어가 현재 상호작용(클릭) 가능한지
  function isLayerActive(layerKey) {
    return state[layerKey].shown && state[layerKey].current < 0.5;
  }

  // 깊이 슬라이더
  function setDepth(v) {
    depth = v;
  }
  function getDepth() {
    return depth;
  }

  // 특정 레이어를 화면에 드러냄(암기·퀴즈에서 대상 구조를 보이게)
  // 바깥 레이어는 벗겨서(깊이=레이어 인덱스) 대상 레이어를 최상위로 노출.
  function focusLayer(layerKey) {
    LAYER_KEYS.forEach((k) => (state[k].shown = true));
    depth = LAYER_INDEX[layerKey];
    // 토글 UI 동기화
    Object.entries(uiButtons).forEach(([k, btn]) => {
      btn.classList.add('active');
      const eye = btn.querySelector('.eye');
      if (eye) eye.textContent = '👁';
    });
    return depth;
  }

  // 레이어 표시/숨김
  function setLayerShown(layerKey, shown) {
    state[layerKey].shown = shown;
  }
  function toggleLayer(layerKey) {
    state[layerKey].shown = !state[layerKey].shown;
    return state[layerKey].shown;
  }

  // ── 레이어 토글 UI 생성 ──
  let uiButtons = {};
  function buildLayerUI(container) {
    container.innerHTML = '';
    uiButtons = {};
    LAYER_KEYS.forEach((layerKey) => {
      const btn = document.createElement('button');
      btn.className = 'layer-toggle active';
      btn.dataset.layer = layerKey;
      btn.innerHTML = `<span class="dot dot-${layerKey}"></span><span class="layer-name">${t('layer.' + layerKey)}</span><span class="eye">👁</span>`;
      btn.addEventListener('click', () => {
        const shown = toggleLayer(layerKey);
        btn.classList.toggle('active', shown);
        btn.querySelector('.eye').textContent = shown ? '👁' : '🚫';
      });
      container.appendChild(btn);
      uiButtons[layerKey] = btn;
    });
  }
  // 언어 변경 시 라벨 갱신
  function relabelUI() {
    LAYER_KEYS.forEach((layerKey) => {
      const btn = uiButtons[layerKey];
      if (btn) btn.querySelector('.layer-name').textContent = t('layer.' + layerKey);
    });
  }

  return {
    buildLayerUI,
    relabelUI,
    setDepth,
    getDepth,
    focusLayer,
    setLayerShown,
    toggleLayer,
    isLayerActive,
    state
  };
}
