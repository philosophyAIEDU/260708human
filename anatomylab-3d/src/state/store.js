// ============================================================
// store.js — localStorage 래퍼
// 저장 항목: 언어 / Gemini API 키 / 플래시카드 진행 / 퀴즈 오답 / 안내 표시 여부
// 서버 전송·추적 없음. 모든 데이터는 사용자 브라우저에만 저장됩니다.
// ============================================================

const PREFIX = 'anatomylab3d.';

// localStorage 접근이 막힌 환경(사생활 보호 모드 등)에서도 앱이 죽지 않도록 안전 래핑
function safeGet(key) {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch (e) {
    return null;
  }
}
function safeSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch (e) {
    /* 무시 */
  }
}
function safeRemove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) {
    /* 무시 */
  }
}

function getJSON(key, fallback) {
  const raw = safeGet(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
function setJSON(key, value) {
  safeSet(key, JSON.stringify(value));
}

export const store = {
  // ---- 언어 ----
  getLang() {
    return safeGet('lang') || 'ko';
  },
  setLang(lang) {
    safeSet('lang', lang);
  },

  // ---- Gemini API 키 ----
  getApiKey() {
    return safeGet('geminiKey') || '';
  },
  setApiKey(key) {
    safeSet('geminiKey', key);
  },
  clearApiKey() {
    safeRemove('geminiKey');
  },

  // ---- 첫 진입 안내 표시 여부 ----
  hasSeenIntro() {
    return safeGet('seenIntro') === '1';
  },
  markIntroSeen() {
    safeSet('seenIntro', '1');
  },

  // ---- 플래시카드 진행 (id별 상태: 'known' | 'review') ----
  getFlashProgress() {
    return getJSON('flashProgress', {});
  },
  setFlashState(id, state) {
    const p = this.getFlashProgress();
    p[id] = state;
    setJSON('flashProgress', p);
  },
  resetFlashProgress() {
    setJSON('flashProgress', {});
  },

  // ---- 암기카드 즐겨찾기(사용자가 직접 담은 구조 id 목록) ----
  getFlashDeck() {
    return getJSON('flashDeck', []);
  },
  addToFlashDeck(id) {
    const deck = this.getFlashDeck();
    if (!deck.includes(id)) {
      deck.push(id);
      setJSON('flashDeck', deck);
    }
    return deck;
  },
  removeFromFlashDeck(id) {
    const deck = this.getFlashDeck().filter((x) => x !== id);
    setJSON('flashDeck', deck);
    return deck;
  },

  // ---- 퀴즈 오답 목록 (id별 오답 횟수) ----
  getQuizWrong() {
    return getJSON('quizWrong', {});
  },
  addQuizWrong(id) {
    const w = this.getQuizWrong();
    w[id] = (w[id] || 0) + 1;
    setJSON('quizWrong', w);
  },
  clearQuizWrongItem(id) {
    const w = this.getQuizWrong();
    delete w[id];
    setJSON('quizWrong', w);
  },
  resetQuizWrong() {
    setJSON('quizWrong', {});
  },

  // ---- 퀴즈 누적 통계 ----
  getQuizStats() {
    return getJSON('quizStats', { played: 0, bestStreak: 0, totalCorrect: 0, totalQuestions: 0 });
  },
  saveQuizStats(stats) {
    setJSON('quizStats', stats);
  }
};
