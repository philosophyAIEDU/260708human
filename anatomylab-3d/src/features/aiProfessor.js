// ============================================================
// aiProfessor.js — Gemini API 기반 AI 해부학 교수 챗 패널
// ------------------------------------------------------------
// - 사용자가 자신의 Gemini API 키를 입력·저장(localStorage 전용)
// - 키는 코드에 없으며, 구글 Gemini 서버로만 전송됨
// - 키가 없어도 나머지 기능(탐색·발음·암기·퀴즈)은 정상 동작
// ============================================================
import { store } from '../state/store.js';
import { t, getLang } from '../i18n/index.js';
import { STRUCTURE_BY_ID } from '../data/structures.js';

const MODEL = 'gemini-3.1-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// 현재 언어 이름(시스템 프롬프트용)
function langName() {
  return getLang() === 'ko' ? '한국어(Korean)' : 'English';
}

function systemPrompt() {
  return (
    '당신은 해부학 교수입니다. 의대생 수준으로 정확하고 간결하게, ' +
    '임상 관점을 곁들여 설명합니다. 표준 해부학 지식만 사용하고 불확실하면 그렇게 말하세요. ' +
    `반드시 사용자가 선택한 언어(${langName()})로 답하세요.`
  );
}

/**
 * Gemini 호출. 성공 시 텍스트 반환, 실패 시 {code} 를 가진 Error throw.
 * code: 'no-key' | 'auth' | 'quota' | 'network' | 'empty' | 'generic'
 */
export async function callGemini(userText, contextText = '') {
  const key = store.getApiKey();
  if (!key) {
    const e = new Error('no key');
    e.code = 'no-key';
    throw e;
  }
  const fullText = contextText ? `${contextText}\n\n${userText}` : userText;
  const body = {
    system_instruction: { parts: [{ text: systemPrompt() }] },
    contents: [{ role: 'user', parts: [{ text: fullText }] }],
    generationConfig: { temperature: 0.4 }
  };

  let res;
  try {
    res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (netErr) {
    const e = new Error('network');
    e.code = 'network';
    throw e;
  }

  if (!res.ok) {
    const e = new Error('http ' + res.status);
    if (res.status === 401 || res.status === 403) e.code = 'auth';
    else if (res.status === 429) e.code = 'quota';
    else e.code = 'generic';
    throw e;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const e = new Error('empty');
    e.code = 'empty';
    throw e;
  }
  return text.trim();
}

// 에러 코드 → 사용자 안내(선택 언어)
export function errorMessageForCode(code) {
  switch (code) {
    case 'no-key':
      return t('ai.errNoKey');
    case 'auth':
      return t('ai.errAuth');
    case 'quota':
      return t('ai.errQuota');
    case 'network':
      return t('ai.errNetwork');
    case 'empty':
      return t('ai.errEmpty');
    default:
      return t('ai.errGeneric');
  }
}

// ============================================================
// 챗 패널 UI
// ============================================================
export function createAIProfessor({ container, getSelectedId }) {
  let open = false;

  function structureContext() {
    const id = getSelectedId();
    if (!id) return '';
    const s = STRUCTURE_BY_ID[id];
    if (!s) return '';
    const nm = `${s.names.ko} / ${s.names.en} (${s.latin})`;
    return `[${t('ai.contextPrefix')}: ${nm}, ${t('layer.' + s.layer)}]`;
  }

  function render() {
    const hasKey = !!store.getApiKey();
    container.innerHTML = `
      <div class="ai-header">
        <span class="ai-title">${t('ai.title')}</span>
        <button class="icon-btn ai-close" title="${t('info.close')}">✕</button>
      </div>
      <div class="ai-key-area">
        <label class="ai-key-label">${t('ai.keyLabel')}</label>
        <div class="ai-key-row">
          <input type="password" class="ai-key-input" placeholder="${t('ai.keyPlaceholder')}" />
          <button class="ghost-btn ai-key-save">${t('ai.save')}</button>
          <button class="ghost-btn ai-key-clear">${t('ai.clearKey')}</button>
        </div>
        <div class="ai-key-notice">${t('ai.keyNotice')}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">${t('ai.getKey')} ↗</a>
        </div>
        <div class="ai-key-status">${hasKey ? '🔑 ✓' : ''}</div>
      </div>
      <div class="ai-messages"></div>
      <div class="ai-suggestions"></div>
      <div class="ai-input-row">
        <input type="text" class="ai-input" placeholder="${t('ai.inputPlaceholder')}" />
        <button class="primary-btn ai-send">${t('ai.send')}</button>
      </div>
    `;

    const messagesEl = container.querySelector('.ai-messages');
    const inputEl = container.querySelector('.ai-input');
    const keyInput = container.querySelector('.ai-key-input');
    const statusEl = container.querySelector('.ai-key-status');

    addMessage(messagesEl, 'bot', t('ai.welcome'));

    // 키 저장/삭제
    container.querySelector('.ai-key-save').addEventListener('click', () => {
      const v = keyInput.value.trim();
      if (v) {
        store.setApiKey(v);
        keyInput.value = '';
        statusEl.textContent = '🔑 ✓ ' + t('ai.keySaved');
      }
    });
    container.querySelector('.ai-key-clear').addEventListener('click', () => {
      store.clearApiKey();
      statusEl.textContent = t('ai.keyCleared');
    });

    container.querySelector('.ai-close').addEventListener('click', () => close());

    // 전송
    const doSend = () => {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      send(messagesEl, text);
    };
    container.querySelector('.ai-send').addEventListener('click', doSend);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSend();
    });

    renderSuggestions(messagesEl, inputEl);
  }

  function renderSuggestions(messagesEl, inputEl) {
    const wrap = container.querySelector('.ai-suggestions');
    if (!wrap) return;
    wrap.innerHTML = '';
    const hasSel = !!getSelectedId();
    const items = hasSel
      ? [t('ai.suggest1'), t('ai.suggest2'), t('ai.suggest3')]
      : [t('ai.suggestNoSel')];
    items.forEach((q) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = q;
      b.addEventListener('click', () => send(messagesEl, q));
      wrap.appendChild(b);
    });
  }

  function addMessage(container_, who, text) {
    const div = document.createElement('div');
    div.className = 'ai-msg ai-msg-' + who;
    div.textContent = text;
    container_.appendChild(div);
    container_.scrollTop = container_.scrollHeight;
    return div;
  }

  async function send(messagesEl, text) {
    addMessage(messagesEl, 'user', text);
    const thinking = addMessage(messagesEl, 'bot', t('ai.thinking'));
    thinking.classList.add('thinking');
    try {
      const reply = await callGemini(text, structureContext());
      thinking.classList.remove('thinking');
      thinking.textContent = reply;
    } catch (err) {
      thinking.classList.remove('thinking');
      thinking.classList.add('ai-msg-error');
      thinking.textContent = errorMessageForCode(err.code);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function openPanel() {
    open = true;
    container.hidden = false;
    render();
  }
  function close() {
    open = false;
    container.hidden = true;
  }
  function toggle() {
    open ? close() : openPanel();
  }
  // 구조 선택 후 "AI 교수에게 질문" 진입
  function askAbout() {
    openPanel();
    const messagesEl = container.querySelector('.ai-messages');
    const inputEl = container.querySelector('.ai-input');
    renderSuggestions(messagesEl, inputEl);
  }
  function relabel() {
    if (open) render();
  }

  return { openPanel, close, toggle, askAbout, relabel };
}
