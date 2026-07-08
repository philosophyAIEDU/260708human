# AnatomyLab 3D — 인체 해부 레이어 뷰어 · AI 튜터 · 발음 학습

의대생·의대 교수·생물학 전공자를 위한 3D 인체 해부 학습 도구입니다.
**피부 → 근육 → 골격 → 장기** 4개 레이어를 3D로 벗겨 탐색하고, 각 구조를 클릭해
한국어/영어 설명 · IPA 발음 기호 · 발음 듣기 · AI 교수 질의응답을 보고,
**암기(플래시카드)** 와 **퀴즈(능동 회상)** 로 스스로 점검할 수 있습니다.

> 개인정보 수집·회원가입·서버 전송·광고·추적이 전혀 없습니다.
> API 키와 학습 진행 상황은 **오직 사용자의 브라우저(localStorage)** 에만 저장됩니다.

---

## ✨ 주요 기능

- **3D 레이어 뷰어**: 4개 레이어 표시/숨김 토글 + 깊이 슬라이더로 스르륵 "벗기기"(커스텀 GLSL 디졸브 셰이더).
- **인터랙션**: 회전·확대·이동, 호버 시 가장자리 발광(프레넬/림 셰이더) + 이름 툴팁, 클릭 시 정보 패널.
- **이중언어 콘텐츠**: 30개 주요 구조. 한/영 이름, 라틴 학명, IPA 발음, 설명·기능·임상적 의의·인접 구조.
- **발음 학습**: 브라우저 내장 음성(Web Speech API)으로 영어/한국어 발음 재생, 느리게 듣기 지원.
- **AI 해부학 교수**: 본인 Gemini API 키를 넣으면 챗으로 질의응답(선택 기능, 키 없이도 나머지 전부 동작).
- **암기 모드**: 레이어/주제별 플래시카드, 알아요/다시 볼래요, 진행 저장.
- **퀴즈 모드**: 이름 맞히기·위치 찾기(3D 클릭)·듣고 맞히기·기능/임상으로 맞히기, 오답 재출제.

---

## 🚀 로컬 실행 방법 (비개발자용)

1. [Node.js](https://nodejs.org) 를 설치합니다(LTS 버전 권장).
2. 이 폴더에서 터미널(명령 프롬프트)을 열고 아래 순서대로 입력합니다.

```bash
npm install     # ① 필요한 라이브러리 설치 (처음 한 번)
npm run dev     # ② 개발 서버 실행 → 표시되는 http://localhost:5173 접속
```

빌드 결과를 미리 보고 싶다면:

```bash
npm run build   # dist 폴더 생성
npm run preview # 빌드된 결과 미리보기
```

---

## 🌐 Netlify 배포 방법 (비개발자용)

### 방법 A — 가장 쉬움 (드래그 앤 드롭)
1. `npm install` 후 `npm run build` 를 실행합니다.
2. 생성된 **`dist` 폴더**를 [Netlify Drop](https://app.netlify.com/drop) 페이지에 **끌어다 놓기** 합니다.
3. 몇 초 뒤 공개 주소가 생성됩니다. 끝!

### 방법 B — GitHub 연결(자동 배포)
1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. Netlify에서 **Add new site → Import an existing project** 로 저장소를 연결합니다.
3. 빌드 설정을 다음과 같이 지정합니다(이미 `netlify.toml`에 포함되어 있어 자동 인식됩니다):
   - **Base directory**: `anatomylab-3d` (이 프로젝트가 하위 폴더에 있는 경우)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

---

## 🔑 AI 교수(Gemini) 사용법

1. 상단의 **🎓 AI 교수** 버튼을 누릅니다.
2. [Google AI Studio](https://aistudio.google.com/apikey) 에서 무료 API 키를 발급받습니다.
3. 패널의 입력칸에 키를 붙여넣고 **저장** 합니다.
   - 키는 **이 브라우저에만 저장**되며, 요청 시 **구글 Gemini 서버로만** 전송됩니다.
   - **키 삭제** 버튼으로 언제든 지울 수 있습니다.
   - 사용 모델: `gemini-3.1-flash-lite`

> 키가 없어도 3D 탐색·발음·암기·퀴즈는 모두 정상 동작합니다.

---

## 🧩 콘텐츠·모델 확장 방법 (개발자용)

- **구조 추가/수정**: `src/data/structures.js` 의 `STRUCTURES` 배열에 같은 형식으로 객체를 추가하세요.
  `id` 는 고유해야 하며, 3D 모델의 `mesh.userData.id` 와 일치해야 클릭/하이라이트가 연결됩니다.
- **실제 정밀 모델(.glb) 교체**: `src/scene/bodyModel.js` 상단 주석 참고.
  `GLTFLoader` 로 `public/` 의 `.glb` 를 로드하고 각 `mesh.name` 을 `structures.js` 의 `id` 와 매핑하면
  기본 도식형 모델을 실제 해부 모델로 대체할 수 있습니다(예: Z-Anatomy 등 CC 라이선스 모델).

---

## 🛠 기술 스택

- **빌드**: Vite (vanilla JS · ES Modules, 프레임워크 없음)
- **3D**: Three.js + OrbitControls, 커스텀 GLSL 셰이더 2종(프레넬 림 / 노이즈 디졸브)
- **발음**: Web Speech API (SpeechSynthesis)
- **AI**: Google Gemini API (사용자 키, 브라우저에서 직접 호출)
- **저장**: localStorage (언어·API 키·학습 진행·오답)

---

## 📁 프로젝트 구조

```
anatomylab-3d/
├─ index.html
├─ package.json
├─ vite.config.js
├─ netlify.toml
├─ README.md
├─ public/
└─ src/
   ├─ main.js
   ├─ styles/style.css
   ├─ scene/  (sceneManager, bodyModel, layers, raycast, shaders/)
   ├─ data/structures.js
   ├─ i18n/   (index, ko, en)
   ├─ features/ (infoPanel, pronunciation, aiProfessor, flashcards, quiz)
   └─ state/store.js
```

---

## 🔒 프라이버시

이 앱은 백엔드가 없습니다. 어떤 개인정보도 수집하지 않으며, 학습 데이터와 API 키는
사용자의 브라우저를 벗어나지 않습니다(단, AI 교수 기능 사용 시 질문 내용은 구글 Gemini 서버로 전송됩니다).
