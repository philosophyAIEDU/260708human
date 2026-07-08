// ============================================================
// infoPanel.js — 선택 구조 정보 패널
// 이름(한/영)·라틴 학명·레이어·설명·기능·임상·인접 구조 표시.
// 영어/한국어 각각 🔊 발음 버튼, IPA 표기, [AI 질문][암기카드 추가] 버튼.
// ============================================================
import { t, getLang } from '../i18n/index.js';
import { STRUCTURE_BY_ID } from '../data/structures.js';
import { speak, speakLatin, isSupported } from './pronunciation.js';
import { store } from '../state/store.js';

export function createInfoPanel({ container, onAskAI, onAddCard, onClose, onSelectNeighbor }) {
  let currentId = null;

  function show(id) {
    const s = STRUCTURE_BY_ID[id];
    if (!s) return;
    currentId = id;
    const lang = getLang();
    const ttsOK = isSupported();
    const inDeck = store.getFlashDeck().includes(id);

    // 인접 구조 칩
    const neighbors = (s.neighbors || [])
      .map((nid) => STRUCTURE_BY_ID[nid])
      .filter(Boolean)
      .map((n) => `<button class="chip neighbor-chip" data-id="${n.id}">${n.names[lang]}</button>`)
      .join('');

    const ttsDisabled = ttsOK ? '' : 'disabled';
    const ttsNote = ttsOK ? '' : `<div class="tts-note">🔇 ${lang === 'ko' ? '이 브라우저는 음성 합성을 지원하지 않습니다.' : 'Speech synthesis is not supported in this browser.'}</div>`;

    container.hidden = false;
    container.innerHTML = `
      <button class="icon-btn info-close" title="${t('info.close')}">✕</button>
      <div class="info-layer-badge badge-${s.layer}">${t('layer.' + s.layer)}</div>

      <h2 class="info-name-ko">
        <span>${s.names.ko}</span>
        <button class="tts-btn" data-tts="ko" ${ttsDisabled} title="${t('info.listen')}">🔊</button>
      </h2>
      <div class="info-name-en">
        <span class="en-word">${s.names.en}</span>
        <span class="ipa">${s.ipa?.en || ''}</span>
        <button class="tts-btn" data-tts="en" ${ttsDisabled} title="${t('info.listen')}">🔊</button>
        <button class="tts-btn slow" data-tts="en-slow" ${ttsDisabled} title="${t('info.slow')}">🐢</button>
      </div>

      <div class="info-latin">
        <span class="info-k">${t('info.latin')}</span>
        <span class="info-v latin-word">${s.latin}</span>
        ${s.ipa?.latin ? `<span class="ipa">${s.ipa.latin}</span>` : ''}
        <button class="tts-btn" data-tts="latin" ${ttsDisabled} title="${t('info.latinApprox')}">🔊</button>
        <span class="latin-approx" title="${t('info.latinApprox')}">≈</span>
      </div>
      ${ttsNote}

      <div class="info-section">
        <div class="info-k">${t('info.description')}</div>
        <p class="info-p">${s.description[lang]}</p>
      </div>
      <div class="info-section">
        <div class="info-k">${t('info.function')}</div>
        <p class="info-p">${s.function[lang]}</p>
      </div>
      <div class="info-section">
        <div class="info-k">🩺 ${t('info.clinical')}</div>
        <p class="info-p">${s.clinical[lang]}</p>
      </div>
      ${
        neighbors
          ? `<div class="info-section"><div class="info-k">${t('info.neighbors')}</div><div class="chips">${neighbors}</div></div>`
          : ''
      }

      <div class="info-actions">
        <button class="primary-btn info-ask">🎓 ${t('info.askAI')}</button>
        <button class="ghost-btn info-add">${inDeck ? t('info.added') : '➕ ' + t('info.addCard')}</button>
      </div>
    `;

    // 발음 버튼
    container.querySelectorAll('.tts-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.tts;
        if (kind === 'ko') speak(s.names.ko, 'ko-KR', 0.85);
        else if (kind === 'en') speak(s.names.en, 'en-US', 0.9);
        else if (kind === 'en-slow') speak(s.names.en, 'en-US', 0.6);
        else if (kind === 'latin') speakLatin(s.latin, 0.8);
      });
    });

    container.querySelector('.info-close').addEventListener('click', () => {
      hide();
      onClose && onClose();
    });
    container.querySelector('.info-ask').addEventListener('click', () => onAskAI && onAskAI(id));
    const addBtn = container.querySelector('.info-add');
    addBtn.addEventListener('click', () => {
      store.addToFlashDeck(id);
      addBtn.textContent = t('info.added');
      onAddCard && onAddCard(id);
    });

    // 인접 구조 이동
    container.querySelectorAll('.neighbor-chip').forEach((chip) => {
      chip.addEventListener('click', () => onSelectNeighbor && onSelectNeighbor(chip.dataset.id));
    });
  }

  function hide() {
    container.hidden = true;
    container.innerHTML = '';
    currentId = null;
  }

  function relabel() {
    if (currentId) show(currentId);
  }

  return { show, hide, relabel, getCurrentId: () => currentId };
}
