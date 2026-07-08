// ============================================================
// quiz.js — 퀴즈(능동 회상)
// 유형: (a) 이름 맞히기  (b) 위치 찾기(3D 클릭)  (c) 듣고 맞히기  (d) 기능/임상
// 점수·연속 정답 표시, 오답은 저장 후 세션 후반 재출제, 결과·오답 복습·AI 해설.
// ============================================================
import { t, getLang } from '../i18n/index.js';
import { STRUCTURES, STRUCTURE_BY_ID } from '../data/structures.js';
import { store } from '../state/store.js';
import { speak } from './pronunciation.js';
import { callGemini, errorMessageForCode } from './aiProfessor.js';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const POOL = STRUCTURES.filter((s) => s.quizEnabled);

export function createQuiz({ container, onFocus, onExit }) {
  let questions = [];
  let qIndex = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let wrongIds = [];
  let answered = false;
  let awaitingLocate = false;
  let config = { type: 'mixed', length: 10 };

  const TYPES = ['name', 'locate', 'listen', 'function'];

  // 오답 우선 + 무작위로 대상 구조 선택
  function pickTargets(n) {
    const wrongStore = store.getQuizWrong();
    const wrongFirst = POOL.filter((s) => wrongStore[s.id]);
    const rest = POOL.filter((s) => !wrongStore[s.id]);
    const ordered = [...shuffle(wrongFirst), ...shuffle(rest)];
    // 부족하면 순환
    const out = [];
    let i = 0;
    while (out.length < n && ordered.length) {
      out.push(ordered[i % ordered.length]);
      i++;
    }
    return out;
  }

  function distractors(target, n) {
    const others = shuffle(POOL.filter((s) => s.id !== target.id));
    return others.slice(0, n);
  }

  function buildQuestions() {
    const targets = pickTargets(config.length);
    return targets.map((target, i) => {
      const type = config.type === 'mixed' ? TYPES[i % TYPES.length] : config.type;
      const q = { target, type };
      if (type !== 'locate') {
        const opts = shuffle([target, ...distractors(target, 3)]);
        q.options = opts;
      }
      return q;
    });
  }

  // ── 설정 화면 ──
  function renderConfig() {
    container.hidden = false;
    if (POOL.length < 4) {
      container.innerHTML = `<div class="mode-card"><p class="mode-sub">${t('quiz.needMore')}</p>
        <button class="ghost-btn mode-exit">${t('quiz.exit')}</button></div>`;
      container.querySelector('.mode-exit').addEventListener('click', exit);
      return;
    }
    const types = [
      ['mixed', t('quiz.typeMixed')],
      ['name', t('quiz.typeName')],
      ['locate', t('quiz.typeLocate')],
      ['listen', t('quiz.typeListen')],
      ['function', t('quiz.typeFunction')]
    ];
    container.innerHTML = `
      <div class="mode-card">
        <div class="mode-card-head"><h2>${t('quiz.title')}</h2>
          <button class="icon-btn mode-exit" title="${t('quiz.exit')}">✕</button></div>
        <p class="mode-sub">${t('quiz.pickType')}</p>
        <div class="deck-grid">
          ${types.map(([k, l]) => `<button class="deck-btn type-btn${k === config.type ? ' sel' : ''}" data-type="${k}">${l}</button>`).join('')}
        </div>
        <div class="len-row">
          <span>${t('quiz.length')}:</span>
          ${[5, 10, 15].map((n) => `<button class="len-btn${n === config.length ? ' sel' : ''}" data-len="${n}">${n}</button>`).join('')}
        </div>
        <button class="primary-btn quiz-start">${t('quiz.start')}</button>
      </div>`;
    container.querySelector('.mode-exit').addEventListener('click', exit);
    container.querySelectorAll('.type-btn').forEach((b) =>
      b.addEventListener('click', () => {
        config.type = b.dataset.type;
        container.querySelectorAll('.type-btn').forEach((x) => x.classList.toggle('sel', x === b));
      })
    );
    container.querySelectorAll('.len-btn').forEach((b) =>
      b.addEventListener('click', () => {
        config.length = parseInt(b.dataset.len, 10);
        container.querySelectorAll('.len-btn').forEach((x) => x.classList.toggle('sel', x === b));
      })
    );
    container.querySelector('.quiz-start').addEventListener('click', start);
  }

  function start() {
    questions = buildQuestions();
    qIndex = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    wrongIds = [];
    renderQuestion();
  }

  function header() {
    return `
      <div class="mode-card-head quiz-head">
        <span class="quiz-count">${t('quiz.q')} ${qIndex + 1}/${questions.length}</span>
        <span class="quiz-score">⭐ ${t('quiz.score')}: ${score}</span>
        <span class="quiz-streak">🔥 ${t('quiz.streak')}: ${streak}</span>
        <button class="icon-btn mode-exit" title="${t('quiz.exit')}">✕</button>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${(qIndex / questions.length) * 100}%"></div></div>`;
  }

  function renderQuestion() {
    if (qIndex >= questions.length) return renderResults();
    answered = false;
    awaitingLocate = false;
    const q = questions[qIndex];
    const lang = getLang();

    let prompt = '';
    let bodyHtml = '';

    if (q.type === 'name') {
      onFocus && onFocus(q.target.id, true); // 하이라이트(이름 가림)
      prompt = t('quiz.nameAsk');
      bodyHtml = choicesHtml(q.options, lang);
    } else if (q.type === 'locate') {
      onFocus && onFocus(q.target.id, false); // 레이어만 표시(정답 비강조)
      awaitingLocate = true;
      prompt = `${t('quiz.locateAsk')} <b>${q.target.names[lang]}</b>`;
      bodyHtml = `<div class="locate-hint">🖱️ ${t('quiz.locateHint')}</div>`;
    } else if (q.type === 'listen') {
      onFocus && onFocus(null); // 안 보이게
      prompt = t('quiz.listenAsk');
      bodyHtml = `<button class="ghost-btn replay-btn">🔊 ${t('quiz.replay')}</button>` + choicesHtml(q.options, lang);
      setTimeout(() => speak(q.target.names.en, 'en-US', 0.85), 300);
    } else {
      // function/clinical
      onFocus && onFocus(null);
      prompt = t('quiz.functionAsk');
      const text = Math.random() < 0.5 ? q.target.function[lang] : q.target.clinical[lang];
      bodyHtml = `<div class="q-desc">"${text}"</div>` + choicesHtml(q.options, lang);
    }

    container.innerHTML = `
      <div class="mode-card quiz-card">
        ${header()}
        <div class="q-prompt">${prompt}</div>
        <div class="q-body">${bodyHtml}</div>
        <div class="q-feedback" hidden></div>
        <div class="q-next-row" hidden>
          <button class="primary-btn q-next">${qIndex + 1 >= questions.length ? t('quiz.finish') : t('quiz.next')}</button>
        </div>
      </div>`;

    container.querySelector('.mode-exit').addEventListener('click', exit);
    const replay = container.querySelector('.replay-btn');
    if (replay) replay.addEventListener('click', () => speak(q.target.names.en, 'en-US', 0.85));

    container.querySelectorAll('.choice-btn').forEach((b) =>
      b.addEventListener('click', () => handleAnswer(b.dataset.id, b))
    );
    const nextBtn = container.querySelector('.q-next');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      qIndex++;
      renderQuestion();
    });
  }

  function choicesHtml(options, lang) {
    return `<div class="choices">${options
      .map((o) => `<button class="choice-btn" data-id="${o.id}">${o.names[lang]}</button>`)
      .join('')}</div>`;
  }

  // 4지선다/듣기/기능 정답 처리
  function handleAnswer(chosenId, btn) {
    if (answered) return;
    const q = questions[qIndex];
    grade(chosenId === q.target.id, chosenId, btn);
  }

  // 위치 찾기: main 이 3D 클릭을 전달
  function handleLocatePick(pickedId) {
    if (!awaitingLocate || answered) return;
    const q = questions[qIndex];
    grade(pickedId === q.target.id, pickedId, null);
  }

  function grade(correct, chosenId, btn) {
    answered = true;
    awaitingLocate = false;
    const q = questions[qIndex];
    const lang = getLang();
    onFocus && onFocus(q.target.id, true); // 정답 구조 강조

    if (correct) {
      score++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      store.clearQuizWrongItem(q.target.id);
    } else {
      streak = 0;
      wrongIds.push(q.target.id);
      store.addQuizWrong(q.target.id);
    }

    // 선택지 색칠
    container.querySelectorAll('.choice-btn').forEach((b) => {
      b.disabled = true;
      if (b.dataset.id === q.target.id) b.classList.add('correct');
      else if (b.dataset.id === chosenId) b.classList.add('wrong');
    });

    const fb = container.querySelector('.q-feedback');
    fb.hidden = false;
    fb.classList.add(correct ? 'ok' : 'no');
    fb.innerHTML = correct
      ? `✅ ${t('quiz.correct')}`
      : `❌ ${t('quiz.wrong')} <b>${t('quiz.answerWas')}: ${q.target.names[lang]}</b>`;
    container.querySelector('.q-next-row').hidden = false;
  }

  function renderResults() {
    onFocus && onFocus(null);
    const lang = getLang();
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    // 통계 저장
    const stats = store.getQuizStats();
    stats.played++;
    stats.bestStreak = Math.max(stats.bestStreak, bestStreak);
    stats.totalCorrect += score;
    stats.totalQuestions += total;
    store.saveQuizStats(stats);

    const encourage = pct >= 80 ? t('quiz.encourageHigh') : pct >= 50 ? t('quiz.encourageMid') : t('quiz.encourageLow');
    const uniqueWrong = [...new Set(wrongIds)];
    const wrongHtml = uniqueWrong.length
      ? uniqueWrong
          .map((id) => {
            const s = STRUCTURE_BY_ID[id];
            return `<div class="wrong-item"><b>${s.names[lang]}</b> <span class="ipa">${s.ipa?.en || ''}</span>
              <p>${s.function[lang]}</p></div>`;
          })
          .join('')
      : `<p class="mode-sub">${t('quiz.noWrong')}</p>`;

    container.innerHTML = `
      <div class="mode-card result-card">
        <div class="mode-card-head"><h2>🏁 ${t('quiz.resultTitle')}</h2>
          <button class="icon-btn mode-exit" title="${t('quiz.exit')}">✕</button></div>
        <div class="result-stats">
          <div class="stat"><span class="stat-num">${score}/${total}</span><span>${t('quiz.finalScore')}</span></div>
          <div class="stat"><span class="stat-num">${pct}%</span><span>${t('quiz.accuracy')}</span></div>
          <div class="stat"><span class="stat-num">${bestStreak}</span><span>${t('quiz.bestStreak')}</span></div>
        </div>
        <p class="encourage">${encourage}</p>
        <div class="wrong-review">
          <h3>${t('quiz.reviewWrong')}</h3>
          ${wrongHtml}
          ${uniqueWrong.length ? `<button class="ghost-btn ai-explain-btn">🎓 ${t('quiz.aiExplain')}</button><div class="ai-explain-out"></div>` : ''}
        </div>
        <div class="mode-actions">
          <button class="primary-btn quiz-again">${t('quiz.again')}</button>
          <button class="ghost-btn mode-exit2">${t('quiz.exit')}</button>
        </div>
      </div>`;

    container.querySelector('.mode-exit').addEventListener('click', exit);
    container.querySelector('.mode-exit2').addEventListener('click', exit);
    container.querySelector('.quiz-again').addEventListener('click', renderConfig);

    const aiBtn = container.querySelector('.ai-explain-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', async () => {
        const out = container.querySelector('.ai-explain-out');
        out.textContent = t('quiz.aiExplainLoad');
        const names = uniqueWrong.map((id) => STRUCTURE_BY_ID[id].names[lang]).join(', ');
        try {
          const reply = await callGemini(
            `${lang === 'ko' ? '다음 구조들을 각각 1~2문장으로 핵심만 복습시켜 주세요' : 'Briefly review each of these structures in 1-2 sentences'}: ${names}`
          );
          out.textContent = reply;
        } catch (err) {
          // 키 없거나 오류 → 내장 설명으로 폴백(이미 위에 기능 표시됨)
          out.textContent = errorMessageForCode(err.code);
        }
      });
    }
  }

  function open() {
    renderConfig();
  }
  function exit() {
    container.hidden = true;
    container.innerHTML = '';
    onFocus && onFocus(null);
    onExit && onExit();
  }

  return {
    open,
    exit,
    handleLocatePick,
    isAwaitingLocate: () => awaitingLocate
  };
}
