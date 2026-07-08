// ============================================================
// main.js — 앱 진입점: 초기화 + 이벤트 배선
// ============================================================
import './styles/style.css';
import { createSceneManager } from './scene/sceneManager.js';
import { buildBodyModel } from './scene/bodyModel.js';
import { createLayerManager } from './scene/layers.js';
import { createRaycaster } from './scene/raycast.js';
import { createInfoPanel } from './features/infoPanel.js';
import { createAIProfessor } from './features/aiProfessor.js';
import { createFlashcards } from './features/flashcards.js';
import { createQuiz } from './features/quiz.js';
import { STRUCTURE_BY_ID } from './data/structures.js';
import { t, getLang, setLang, applyStaticI18n, onLangChange } from './i18n/index.js';
import { store } from './state/store.js';

// ── DOM 참조 ──
const canvas = document.getElementById('scene-canvas');
const loader = document.getElementById('loader');
const tooltip = document.getElementById('tooltip');
const layerTogglesEl = document.getElementById('layerToggles');
const depthSlider = document.getElementById('depthSlider');
const infoPanelEl = document.getElementById('infoPanel');
const aiPanelEl = document.getElementById('aiPanel');
const flashcardsRoot = document.getElementById('flashcardsRoot');
const quizRoot = document.getElementById('quizRoot');
const introHint = document.getElementById('introHint');

// ── 초기 언어 반영 ──
document.documentElement.setAttribute('lang', getLang());
applyStaticI18n();

// ── 씬/모델 ──
const sm = createSceneManager(canvas);
const model = buildBodyModel();
sm.scene.add(model.root);
sm.onTick((elapsed) => model.root.userData.updateTime(elapsed));

// ── 레이어 매니저 ──
const layerManager = createLayerManager({ model, onTick: sm.onTick });
layerManager.buildLayerUI(layerTogglesEl);

// ── 상태 ──
let selectedId = null;
let currentMode = 'explore';

// ── 정보 패널 ──
const infoPanel = createInfoPanel({
  container: infoPanelEl,
  onAskAI: (id) => {
    selectStructure(id);
    aiProfessor.askAbout();
  },
  onAddCard: () => {},
  onClose: () => {
    selectedId = null;
    raycaster.clearSelected();
  },
  onSelectNeighbor: (id) => selectStructure(id)
});

// ── AI 교수 ──
const aiProfessor = createAIProfessor({
  container: aiPanelEl,
  getSelectedId: () => selectedId
});

// ── 구조 선택(탐색 모드) ──
function selectStructure(id) {
  if (!STRUCTURE_BY_ID[id]) return;
  selectedId = id;
  raycaster.setSelected(id);
  infoPanel.show(id);
}

// ── 구조 포커스(암기·퀴즈에서 3D에 드러내기) ──
// highlight=true 면 강조까지, false 면 레이어만 노출(정답 숨김)
function focusStructure(id, highlight = true) {
  if (!id) {
    raycaster.clearSelected();
    return;
  }
  const s = STRUCTURE_BY_ID[id];
  if (!s) return;
  layerManager.focusLayer(s.layer);
  depthSlider.value = String(layerManager.getDepth());
  if (highlight) {
    selectedId = id;
    raycaster.setSelected(id);
  } else {
    raycaster.clearSelected();
  }
}

// ── 레이캐스터(호버/클릭) ──
const raycaster = createRaycaster({
  canvas,
  camera: sm.camera,
  model,
  layerManager,
  onHover: (id, ev) => {
    if (currentMode === 'explore' && id) {
      const s = STRUCTURE_BY_ID[id];
      tooltip.hidden = false;
      tooltip.textContent = s ? s.names[getLang()] : '';
      tooltip.style.left = ev.clientX + 14 + 'px';
      tooltip.style.top = ev.clientY + 14 + 'px';
      canvas.style.cursor = 'pointer';
    } else {
      tooltip.hidden = true;
      canvas.style.cursor = currentMode === 'quiz' && quiz.isAwaitingLocate() ? 'crosshair' : 'grab';
    }
  },
  onPick: (id) => {
    if (currentMode === 'quiz' && quiz.isAwaitingLocate()) {
      quiz.handleLocatePick(id);
      return;
    }
    if (currentMode === 'explore') selectStructure(id);
  }
});

// ── 암기/퀴즈 ──
const flashcards = createFlashcards({
  container: flashcardsRoot,
  onFocus: (id) => focusStructure(id, true),
  onExit: () => switchMode('explore')
});
const quiz = createQuiz({
  container: quizRoot,
  onFocus: (id, highlight = true) => focusStructure(id, highlight),
  onExit: () => switchMode('explore')
});

// ── 모드 전환 ──
function switchMode(mode) {
  currentMode = mode;
  // 탭 활성화
  document.querySelectorAll('.mode-tab').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  // 오버레이/패널 정리
  flashcardsRoot.hidden = true;
  quizRoot.hidden = true;
  tooltip.hidden = true;
  if (mode !== 'explore') {
    infoPanel.hide();
    raycaster.clearSelected();
    selectedId = null;
  }
  if (mode === 'flashcards') flashcards.open();
  else if (mode === 'quiz') quiz.open();
}

document.getElementById('modeTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.mode-tab');
  if (!btn) return;
  const mode = btn.dataset.mode;
  if (mode === currentMode && mode === 'explore') return;
  // 다른 모드에서 나올 때 정리
  if (currentMode === 'flashcards') flashcards.exit();
  if (currentMode === 'quiz') quiz.exit();
  switchMode(mode);
});

// ── 깊이 슬라이더 ──
depthSlider.addEventListener('input', () => {
  layerManager.setDepth(parseFloat(depthSlider.value));
});

// ── 시점 초기화 ──
document.getElementById('resetViewBtn').addEventListener('click', () => sm.resetView());

// ── AI 토글 버튼 ──
document.getElementById('aiToggleBtn').addEventListener('click', () => aiProfessor.toggle());

// ── 언어 토글 ──
document.getElementById('langToggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.lang-btn');
  if (!btn) return;
  setLang(btn.dataset.lang);
  document.querySelectorAll('.lang-btn').forEach((b) => b.classList.toggle('active', b === btn));
});

onLangChange(() => {
  layerManager.relabelUI();
  infoPanel.relabel();
  aiProfessor.relabel();
  // 진행 중인 모드 화면 다시 그리기
  if (currentMode === 'flashcards') {
    flashcards.exit();
    switchMode('flashcards');
  } else if (currentMode === 'quiz') {
    quiz.exit();
    switchMode('quiz');
  }
});

// ── 첫 진입 조작 안내 ──
function showIntro() {
  introHint.hidden = false;
  introHint.innerHTML = `
    <div class="intro-box">
      <h3>👋 ${t('intro.title')}</h3>
      <ul>
        <li>🖱️ ${t('intro.rotate')}</li>
        <li>🔍 ${t('intro.zoom')}</li>
        <li>✋ ${t('intro.pan')}</li>
        <li>👆 ${t('intro.click')}</li>
      </ul>
      <button class="primary-btn intro-ok">${t('intro.got')}</button>
    </div>`;
  introHint.querySelector('.intro-ok').addEventListener('click', () => {
    introHint.hidden = true;
    store.markIntroSeen();
  });
}
onLangChange(() => {
  if (!introHint.hidden) showIntro();
});
if (!store.hasSeenIntro()) showIntro();

// ── 로딩 인디케이터 숨김 ──
requestAnimationFrame(() => {
  loader.classList.add('hidden');
  setTimeout(() => (loader.style.display = 'none'), 400);
});
