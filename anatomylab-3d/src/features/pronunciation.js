// ============================================================
// pronunciation.js — Web Speech API 발음 재생
// 외부 오디오/API 키 없이 브라우저 내장 SpeechSynthesis 사용.
// voices 는 비동기 로드되므로 voiceschanged 로 목록을 갱신합니다.
// ============================================================

let voices = [];
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export function isSupported() {
  return !!synth;
}

// voices 로드(비동기). 초기에 비어 있으면 이벤트/재시도로 채웁니다.
function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices();
}
if (synth) {
  loadVoices();
  synth.addEventListener('voiceschanged', loadVoices);
  // 일부 브라우저는 이벤트가 늦거나 안 와서 한 번 더 시도
  setTimeout(loadVoices, 300);
  setTimeout(loadVoices, 1200);
}

// lang('en-US'|'ko-KR')에 가장 잘 맞는 voice 선택
function pickVoice(lang) {
  if (!voices.length) loadVoices();
  const base = lang.split('-')[0];
  // 정확히 일치 우선
  let v = voices.find((vo) => vo.lang === lang);
  if (v) return v;
  // 언어 계열 일치
  v = voices.find((vo) => vo.lang && vo.lang.toLowerCase().startsWith(base));
  return v || null;
}

/**
 * 텍스트를 지정 언어로 읽어줍니다.
 * @param {string} text
 * @param {string} lang 'en-US' | 'ko-KR'
 * @param {number} rate 0.5~1.2 (학습용 기본 0.85)
 */
export function speak(text, lang = 'en-US', rate = 0.85) {
  if (!synth || !text) return;
  try {
    synth.cancel(); // 이전 발화 중단
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = 1;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    synth.speak(u);
  } catch (e) {
    /* 무시 */
  }
}

// 라틴 학명은 전용 음성이 없어 en-US 로 근사 재생
export function speakLatin(text, rate = 0.8) {
  speak(text, 'en-US', rate);
}

export function stopSpeaking() {
  if (synth) synth.cancel();
}
