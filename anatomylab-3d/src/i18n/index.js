// ============================================================
// i18n/index.js — 언어 전환 로직
// - 딕셔너리(ko/en)에서 키로 문구를 찾아 반환하는 t()
// - 언어 변경 시 localStorage 저장 + 구독자에게 알림
// - data-i18n 속성이 붙은 DOM 요소를 한 번에 갱신하는 applyStaticI18n()
// ============================================================
import ko from './ko.js';
import en from './en.js';
import { store } from '../state/store.js';

const DICTS = { ko, en };
let currentLang = store.getLang(); // 기본 'ko'
const listeners = new Set();

// 키에 해당하는 문구 반환(없으면 키 자체 반환 → 누락 즉시 발견)
export function t(key) {
  const dict = DICTS[currentLang] || DICTS.ko;
  return dict[key] !== undefined ? dict[key] : key;
}

export function getLang() {
  return currentLang;
}

// 'en-US' / 'ko-KR' 형태의 음성 언어 코드
export function getSpeechLang() {
  return currentLang === 'ko' ? 'ko-KR' : 'en-US';
}

export function setLang(lang) {
  if (!DICTS[lang] || lang === currentLang) {
    // 같은 언어라도 정적 문구는 다시 반영(초기 로드 대비)
    if (DICTS[lang]) applyStaticI18n();
    return;
  }
  currentLang = lang;
  store.setLang(lang);
  document.documentElement.setAttribute('lang', lang);
  applyStaticI18n();
  listeners.forEach((fn) => fn(lang));
}

// 언어 변경 구독(패널 다시 그리기 등)
export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// data-i18n 속성을 가진 정적 DOM 요소 일괄 갱신
export function applyStaticI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
}
