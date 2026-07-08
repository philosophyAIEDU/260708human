// ============================================================
// flashcards.js — 암기 모드
// 앞면: 3D 하이라이트(이름 가림) + 🔊 발음 듣기
// 뒷면: 이름·IPA·기능·임상 노트
// [알아요]/[다시 볼래요] → "다시 볼래요"는 복습 목록으로. 진행 localStorage 저장.
// ============================================================
import { t, getLang } from '../i18n/index.js';
import { STRUCTURES, STRUCTURE_BY_ID } from '../data/structures.js';
import { store } from '../state/store.js';
import { speak } from './pronunciation.js';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createFlashcards({ container, onFocus, onExit }) {
  let deck = [];
  let idx = 0;
  let flipped = false;
  let counts = { known: 0, review: 0 };

  function buildDeck(kind) {
    let list;
    if (kind === 'all') list = STRUCTURES.slice();
    else if (kind === 'review') list = STRUCTURES.filter((s) => store.getFlashProgress()[s.id] === 'review');
    else if (kind === 'fav') list = store.getFlashDeck().map((id) => STRUCTURE_BY_ID[id]).filter(Boolean);
    else list = STRUCTURES.filter((s) => s.layer === kind);
    return shuffle(list);
  }

  // ── 덱 선택 화면 ──
  function renderDeckPicker() {
    container.hidden = false;
    const decks = [
      ['all', t('fc.deckAll')],
      ['skin', t('fc.deckSkin')],
      ['muscle', t('fc.deckMuscle')],
      ['skeleton', t('fc.deckSkeleton')],
      ['organs', t('fc.deckOrgans')],
      ['review', t('fc.deckReview')],
      ['fav', t('fc.deckFav')]
    ];
    container.innerHTML = `
      <div class="mode-card">
        <div class="mode-card-head">
          <h2>${t('fc.title')}</h2>
          <button class="icon-btn mode-exit" title="${t('fc.exit')}">✕</button>
        </div>
        <p class="mode-sub">${t('fc.pickDeck')}</p>
        <div class="deck-grid">
          ${decks.map(([k, label]) => `<button class="deck-btn" data-kind="${k}">${label}</button>`).join('')}
        </div>
        <button class="ghost-btn small reset-progress">${t('fc.resetProgress')}</button>
      </div>
    `;
    container.querySelector('.mode-exit').addEventListener('click', exit);
    container.querySelector('.reset-progress').addEventListener('click', () => {
      store.resetFlashProgress();
    });
    container.querySelectorAll('.deck-btn').forEach((b) => {
      b.addEventListener('click', () => {
        deck = buildDeck(b.dataset.kind);
        if (deck.length === 0) {
          renderEmpty();
          return;
        }
        idx = 0;
        counts = { known: 0, review: 0 };
        renderCard();
      });
    });
  }

  function renderEmpty() {
    container.innerHTML = `
      <div class="mode-card">
        <div class="mode-card-head"><h2>${t('fc.title')}</h2>
          <button class="icon-btn mode-exit" title="${t('fc.exit')}">✕</button></div>
        <p class="mode-sub">${t('fc.emptyDeck')}</p>
        <button class="primary-btn back-picker">${t('fc.restart')}</button>
      </div>`;
    container.querySelector('.mode-exit').addEventListener('click', exit);
    container.querySelector('.back-picker').addEventListener('click', renderDeckPicker);
  }

  // ── 카드 화면 ──
  function renderCard() {
    if (idx >= deck.length) return renderDone();
    const s = deck[idx];
    flipped = false;
    onFocus && onFocus(s.id); // 3D 하이라이트 + 레이어 포커스
    const lang = getLang();

    container.innerHTML = `
      <div class="mode-card flashcard">
        <div class="mode-card-head">
          <span class="fc-progress">${t('fc.progress')} ${idx + 1} / ${deck.length}</span>
          <button class="icon-btn mode-exit" title="${t('fc.exit')}">✕</button>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${((idx) / deck.length) * 100}%"></div></div>

        <div class="fc-body">
          <div class="fc-front">
            <div class="fc-hint">${t('fc.front')}</div>
            <div class="fc-badge badge-${s.layer}">${t('layer.' + s.layer)}</div>
            <button class="tts-btn big fc-listen" title="${t('info.listen')}">🔊</button>
            <div class="fc-look">👉 3D</div>
          </div>
          <div class="fc-back" hidden>
            <h3 class="fc-name">${s.names[lang]} <span class="fc-name-sub">${lang === 'ko' ? s.names.en : s.names.ko}</span></h3>
            <div class="fc-ipa">${s.ipa?.en || ''} · <span class="latin">${s.latin}</span></div>
            <div class="fc-field"><b>${t('info.function')}</b><p>${s.function[lang]}</p></div>
            <div class="fc-field"><b>🩺 ${t('info.clinical')}</b><p>${s.clinical[lang]}</p></div>
          </div>
        </div>

        <div class="fc-controls">
          <button class="primary-btn fc-flip">${t('fc.reveal')}</button>
          <div class="fc-judge" hidden>
            <button class="ghost-btn fc-know">✅ ${t('fc.know')}</button>
            <button class="ghost-btn fc-review">🔁 ${t('fc.review')}</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('.mode-exit').addEventListener('click', exit);
    container.querySelector('.fc-listen').addEventListener('click', () => speak(s.names.en, 'en-US', 0.85));

    const flipBtn = container.querySelector('.fc-flip');
    flipBtn.addEventListener('click', () => {
      flipped = true;
      container.querySelector('.fc-front').hidden = true;
      container.querySelector('.fc-back').hidden = false;
      flipBtn.hidden = true;
      container.querySelector('.fc-judge').hidden = false;
    });

    container.querySelector('.fc-know').addEventListener('click', () => judge('known'));
    container.querySelector('.fc-review').addEventListener('click', () => judge('review'));
  }

  function judge(state) {
    const s = deck[idx];
    store.setFlashState(s.id, state);
    counts[state === 'known' ? 'known' : 'review']++;
    idx++;
    renderCard();
  }

  function renderDone() {
    onFocus && onFocus(null);
    container.innerHTML = `
      <div class="mode-card">
        <div class="mode-card-head"><h2>🎉 ${t('fc.done')}</h2>
          <button class="icon-btn mode-exit" title="${t('fc.exit')}">✕</button></div>
        <div class="result-stats">
          <div class="stat"><span class="stat-num">${counts.known}</span><span>${t('fc.knownCount')}</span></div>
          <div class="stat"><span class="stat-num">${counts.review}</span><span>${t('fc.reviewCount')}</span></div>
        </div>
        <div class="mode-actions">
          <button class="primary-btn restart">${t('fc.restart')}</button>
          <button class="ghost-btn mode-exit2">${t('fc.exit')}</button>
        </div>
      </div>`;
    container.querySelector('.mode-exit').addEventListener('click', exit);
    container.querySelector('.mode-exit2').addEventListener('click', exit);
    container.querySelector('.restart').addEventListener('click', renderDeckPicker);
  }

  function open() {
    renderDeckPicker();
  }
  function exit() {
    container.hidden = true;
    container.innerHTML = '';
    onFocus && onFocus(null);
    onExit && onExit();
  }

  return { open, exit };
}
