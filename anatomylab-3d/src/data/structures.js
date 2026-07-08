// ============================================================
// data/structures.js — 이중언어 + IPA 해부 구조 콘텐츠
// ------------------------------------------------------------
// ■ 확장 방법
//   - 아래 STRUCTURES 배열에 같은 형식의 객체를 추가하면 됩니다.
//   - id 는 프로젝트 전체에서 고유해야 하며, 3D 모델(bodyModel.js)의
//     mesh.userData.id 와 정확히 일치시켜야 클릭/하이라이트가 연결됩니다.
//   - layer 는 'skin' | 'muscle' | 'skeleton' | 'organs' 중 하나.
//   - ipa.en(영어 IPA)은 필수, ipa.latin(라틴 근사 발음)은 선택.
//   - neighbors 는 인접 구조의 id 배열(정보 패널의 "인접 구조"에 표시).
//   - quizEnabled=false 로 두면 퀴즈 출제에서 제외됩니다.
//
// ■ 실제 정밀 모델(.glb)로 교체할 때
//   - bodyModel.js 의 안내 주석 참고. 각 mesh.name 을 여기의 id 와
//     동일하게 맞추면 데이터가 그대로 연결됩니다.
//
// ※ 콘텐츠는 표준 해부학 지식 범위에서만 작성했습니다.
// ============================================================

export const LAYER_KEYS = ['skin', 'muscle', 'skeleton', 'organs'];

export const STRUCTURES = [
  // ───────────── 피부(skin) ─────────────
  {
    id: 'epidermis',
    layer: 'skin',
    names: { ko: '표피', en: 'Epidermis' },
    latin: 'Epidermis',
    ipa: { en: '/ˌɛpɪˈdɜːrmɪs/' },
    description: {
      ko: '피부의 가장 바깥층으로 혈관이 없는 중층편평상피입니다. 주로 각질형성세포로 이루어지며 기저층에서 표면의 각질층까지 분화합니다. 멜라닌세포·랑게르한스세포·메르켈세포도 포함합니다.',
      en: 'The outermost, avascular layer of skin, a stratified squamous epithelium. It is composed mainly of keratinocytes that differentiate from the basal layer up to the surface stratum corneum. It also contains melanocytes, Langerhans cells and Merkel cells.'
    },
    function: {
      ko: '물리적·화학적 방어벽을 형성하고 수분 손실을 막으며, 멜라닌으로 자외선을 차단합니다.',
      en: 'Forms a physical and chemical barrier, prevents water loss, and shields against UV via melanin.'
    },
    clinical: {
      ko: '기저층의 손상은 흉터로 이어질 수 있고, 멜라닌세포에서 악성 흑색종이, 각질형성세포에서 편평세포암·기저세포암이 발생합니다.',
      en: 'Damage to the basal layer may scar; melanocytes give rise to melanoma, and keratinocytes to squamous and basal cell carcinomas.'
    },
    neighbors: ['dermis'],
    quizEnabled: true
  },
  {
    id: 'dermis',
    layer: 'skin',
    names: { ko: '진피', en: 'Dermis' },
    latin: 'Dermis',
    ipa: { en: '/ˈdɜːrmɪs/' },
    description: {
      ko: '표피 아래의 치밀결합조직층으로 유두층과 그물층으로 나뉩니다. 콜라겐과 탄력섬유가 풍부하여 피부의 강도와 탄력을 제공합니다. 혈관·신경·모낭·땀샘·피지샘이 위치합니다.',
      en: 'A dense connective-tissue layer beneath the epidermis, divided into papillary and reticular layers. Rich in collagen and elastic fibers, it gives skin its strength and elasticity. It houses blood vessels, nerves, hair follicles, sweat and sebaceous glands.'
    },
    function: {
      ko: '표피에 영양과 감각을 공급하고, 체온 조절과 촉각·통각·압각 등 감각 수용을 담당합니다.',
      en: 'Nourishes the epidermis, provides sensation, and contributes to thermoregulation and touch, pain and pressure reception.'
    },
    clinical: {
      ko: '진피까지 손상되면 흉터가 남으며(2도 이상 화상), 콜라겐 감소는 주름과 피부 노화의 원인이 됩니다.',
      en: 'Injury reaching the dermis leaves scars (deeper burns), and collagen loss underlies wrinkles and skin aging.'
    },
    neighbors: ['epidermis', 'hypodermis'],
    quizEnabled: true
  },
  {
    id: 'hypodermis',
    layer: 'skin',
    names: { ko: '피하지방(피하조직)', en: 'Hypodermis' },
    latin: 'Tela subcutanea',
    ipa: { en: '/ˌhaɪpoʊˈdɜːrmɪs/' },
    description: {
      ko: '진피 아래의 지방과 성긴결합조직으로 이루어진 층으로 피하조직이라고도 합니다. 피부를 근막·근육에 연결하며 큰 혈관과 신경이 지나갑니다. 지방량은 부위·개인에 따라 크게 다릅니다.',
      en: 'A layer of adipose and loose connective tissue below the dermis, also called the subcutaneous tissue. It anchors skin to underlying fascia and muscle, and carries larger vessels and nerves. Its fat content varies greatly by region and individual.'
    },
    function: {
      ko: '단열·충격 흡수·에너지 저장을 담당하고, 피부를 하부 구조에 부착시킵니다.',
      en: 'Provides insulation, cushioning and energy storage, and attaches skin to deeper structures.'
    },
    clinical: {
      ko: '피하주사·정맥 확보의 경로이며, 감염이 퍼지면 봉와직염(연조직염)이 됩니다.',
      en: 'It is the route for subcutaneous injections; spreading infection here causes cellulitis.'
    },
    neighbors: ['dermis'],
    quizEnabled: true
  },

  // ───────────── 근육(muscle) ─────────────
  {
    id: 'pectoralis_major',
    layer: 'muscle',
    names: { ko: '대흉근(큰가슴근)', en: 'Pectoralis major' },
    latin: 'Musculus pectoralis major',
    ipa: { en: '/ˌpɛktəˈreɪlɪs ˈmeɪdʒər/' },
    description: {
      ko: '가슴 앞쪽을 덮는 크고 부채꼴인 근육으로 쇄골·흉골·늑연골에서 시작해 상완골 대결절능에 붙습니다. 흉벽의 앞면 윤곽을 만듭니다.',
      en: 'A large, fan-shaped muscle over the anterior chest arising from the clavicle, sternum and costal cartilages and inserting on the crest of the greater tubercle of the humerus. It shapes the front of the chest wall.'
    },
    function: {
      ko: '어깨 관절에서 상완을 굽힘·모음·안쪽돌림합니다(예: 미는 동작, 팔 앞으로 모으기).',
      en: 'Flexes, adducts and medially rotates the arm at the shoulder (e.g., pushing, bringing the arm across the body).'
    },
    clinical: {
      ko: '벤치프레스 등에서 힘줄 파열이 생길 수 있고, 유방 수술·재건 시 중요한 지표가 됩니다.',
      en: 'Its tendon can rupture during heavy pressing, and it is an important landmark in breast surgery and reconstruction.'
    },
    neighbors: ['deltoid', 'rectus_abdominis', 'sternum'],
    quizEnabled: true
  },
  {
    id: 'deltoid',
    layer: 'muscle',
    names: { ko: '삼각근(어깨세모근)', en: 'Deltoid' },
    latin: 'Musculus deltoideus',
    ipa: { en: '/ˈdɛltɔɪd/' },
    description: {
      ko: '어깨를 덮는 삼각형 근육으로 앞·중간·뒤 세 갈래로 나뉩니다. 쇄골·견봉·견갑극에서 일어나 상완골의 삼각근조면에 붙습니다.',
      en: 'A triangular muscle capping the shoulder with anterior, middle and posterior parts. It arises from the clavicle, acromion and scapular spine and inserts at the deltoid tuberosity of the humerus.'
    },
    function: {
      ko: '팔의 벌림(외전)을 주도하며, 앞섬유는 굽힘·안쪽돌림, 뒤섬유는 폄·바깥돌림을 돕습니다.',
      en: 'Chief abductor of the arm; anterior fibers flex and medially rotate, posterior fibers extend and laterally rotate.'
    },
    clinical: {
      ko: '근육주사의 흔한 부위이며, 액와신경 손상 시 마비되어 어깨 외전이 약해집니다.',
      en: 'A common site for intramuscular injection; axillary nerve injury paralyzes it and weakens shoulder abduction.'
    },
    neighbors: ['pectoralis_major', 'biceps_brachii', 'trapezius', 'humerus'],
    quizEnabled: true
  },
  {
    id: 'biceps_brachii',
    layer: 'muscle',
    names: { ko: '상완이두근(위팔두갈래근)', en: 'Biceps brachii' },
    latin: 'Musculus biceps brachii',
    ipa: { en: '/ˈbaɪsɛps ˈbreɪkiaɪ/' },
    description: {
      ko: '위팔 앞쪽의 두 갈래 근육으로 긴갈래는 관절위결절, 짧은갈래는 부리돌기에서 시작해 요골거친면에 붙습니다. 위팔의 앞면 융기를 만듭니다.',
      en: 'A two-headed muscle on the front of the arm; the long head arises from the supraglenoid tubercle and the short head from the coracoid process, both inserting on the radial tuberosity. It forms the anterior bulge of the arm.'
    },
    function: {
      ko: '팔꿉을 굽히고 아래팔을 강하게 뒤침(회외)시키며, 어깨 굽힘도 돕습니다.',
      en: 'Flexes the elbow and powerfully supinates the forearm, and assists shoulder flexion.'
    },
    clinical: {
      ko: '긴갈래 힘줄염·파열이 흔하며, 파열 시 "포파이 징후"가 나타날 수 있습니다.',
      en: 'Long-head tendinopathy and rupture are common; rupture can produce a "Popeye" deformity.'
    },
    neighbors: ['triceps_brachii', 'deltoid', 'humerus', 'radius'],
    quizEnabled: true
  },
  {
    id: 'triceps_brachii',
    layer: 'muscle',
    names: { ko: '상완삼두근(위팔세갈래근)', en: 'Triceps brachii' },
    latin: 'Musculus triceps brachii',
    ipa: { en: '/ˈtraɪsɛps ˈbreɪkiaɪ/' },
    description: {
      ko: '위팔 뒤쪽의 세 갈래 근육으로 긴·가쪽·안쪽갈래로 이루어집니다. 견갑골과 상완골에서 시작해 자뼈 팔꿈치머리(주두)에 붙습니다.',
      en: 'A three-headed muscle on the back of the arm consisting of long, lateral and medial heads. It arises from the scapula and humerus and inserts on the olecranon of the ulna.'
    },
    function: {
      ko: '팔꿉을 폄(신전)하는 주된 근육이며, 긴갈래는 어깨 폄·모음도 돕습니다.',
      en: 'The chief extensor of the elbow; the long head also assists extension and adduction of the shoulder.'
    },
    clinical: {
      ko: '요골신경 손상 시 약해지며, 팔꿈치 폄 반사(삼두근 반사, C7)의 평가 대상입니다.',
      en: 'Weakened by radial nerve injury; it is tested by the triceps (elbow-extension) reflex (C7).'
    },
    neighbors: ['biceps_brachii', 'deltoid', 'humerus', 'ulna'],
    quizEnabled: true
  },
  {
    id: 'rectus_abdominis',
    layer: 'muscle',
    names: { ko: '복직근(배곧은근)', en: 'Rectus abdominis' },
    latin: 'Musculus rectus abdominis',
    ipa: { en: '/ˈrɛktəs æbˈdɒmɪnɪs/' },
    description: {
      ko: '배 앞쪽 정중선 양옆을 세로로 달리는 긴 근육으로 두덩뼈에서 시작해 5~7번 늑연골과 칼돌기에 붙습니다. 나눔힘줄로 구획되어 "식스팩" 모양을 만듭니다.',
      en: 'A long, paired muscle running vertically beside the midline of the abdomen from the pubis to the 5th–7th costal cartilages and xiphoid process. Tendinous intersections divide it into the "six-pack" segments.'
    },
    function: {
      ko: '체간을 굽히고 복압을 높이며(배변·해산·기침), 골반을 안정화합니다.',
      en: 'Flexes the trunk and raises intra-abdominal pressure (defecation, childbirth, coughing), and stabilizes the pelvis.'
    },
    clinical: {
      ko: '백색선을 통한 정중 절개의 지표이며, 복직근 사이가 벌어지면 복직근이개가 됩니다.',
      en: 'A landmark for midline incisions through the linea alba; separation of the two muscles is diastasis recti.'
    },
    neighbors: ['pectoralis_major', 'quadriceps_femoris', 'pelvis'],
    quizEnabled: true
  },
  {
    id: 'quadriceps_femoris',
    layer: 'muscle',
    names: { ko: '대퇴사두근(넙다리네갈래근)', en: 'Quadriceps femoris' },
    latin: 'Musculus quadriceps femoris',
    ipa: { en: '/ˈkwɒdrɪsɛps ˈfɛmərɪs/' },
    description: {
      ko: '허벅지 앞쪽의 네 갈래 근육(대퇴직근·외측/내측/중간광근)으로 이루어집니다. 공통 힘줄이 슬개골을 감싸 슬개인대를 통해 정강뼈거친면에 붙습니다.',
      en: 'A four-part muscle of the anterior thigh (rectus femoris and the vastus lateralis, medialis and intermedius). Their common tendon encloses the patella and inserts via the patellar ligament on the tibial tuberosity.'
    },
    function: {
      ko: '무릎을 강하게 폄(신전)하며, 대퇴직근은 엉덩관절 굽힘도 돕습니다. 서기·걷기·계단 오르기에 필수입니다.',
      en: 'Powerfully extends the knee; the rectus femoris also flexes the hip. Essential for standing, walking and climbing.'
    },
    clinical: {
      ko: '무릎 폄 반사(L2–L4)의 대상이며, 힘줄·슬개인대 파열 시 무릎을 펴지 못합니다.',
      en: 'Tested by the knee-jerk reflex (L2–L4); tendon or patellar-ligament rupture prevents knee extension.'
    },
    neighbors: ['rectus_abdominis', 'femur', 'pelvis'],
    quizEnabled: true
  },
  {
    id: 'trapezius',
    layer: 'muscle',
    names: { ko: '승모근(등세모근)', en: 'Trapezius' },
    latin: 'Musculus trapezius',
    ipa: { en: '/trəˈpiːziəs/' },
    description: {
      ko: '목덜미부터 등 위쪽까지 덮는 넓은 마름모꼴 근육으로 뒤통수뼈·목덜미인대·가시돌기에서 일어나 쇄골·견봉·견갑극에 붙습니다.',
      en: 'A broad, diamond-shaped muscle covering the nape and upper back, arising from the occiput, nuchal ligament and spinous processes and inserting on the clavicle, acromion and scapular spine.'
    },
    function: {
      ko: '견갑골을 올림·내림·모음·상방회전시켜 팔을 머리 위로 드는 동작을 돕습니다.',
      en: 'Elevates, depresses, retracts and upwardly rotates the scapula, aiding overhead arm motion.'
    },
    clinical: {
      ko: '더부신경(CN XI) 손상 시 어깨가 처지고 팔 외전이 약해지며, 긴장성 두통·목통증과 관련됩니다.',
      en: 'Accessory nerve (CN XI) injury causes shoulder drooping and weak abduction; it is linked to tension headaches and neck pain.'
    },
    neighbors: ['deltoid', 'latissimus_dorsi', 'spine'],
    quizEnabled: true
  },
  {
    id: 'latissimus_dorsi',
    layer: 'muscle',
    names: { ko: '광배근(넓은등근)', en: 'Latissimus dorsi' },
    latin: 'Musculus latissimus dorsi',
    ipa: { en: '/ləˈtɪsɪməs ˈdɔːrsaɪ/' },
    description: {
      ko: '등 아래쪽을 넓게 덮는 삼각형 근육으로 아래쪽 가시돌기·엉덩뼈능선·등허리근막에서 일어나 상완골 결절사이고랑에 붙습니다.',
      en: 'A broad, triangular muscle of the lower back arising from the lower spinous processes, iliac crest and thoracolumbar fascia and inserting in the intertubercular groove of the humerus.'
    },
    function: {
      ko: '상완을 폄·모음·안쪽돌림시킵니다(당기기·수영·노 젓기, 목발 보행 시 몸통 들기).',
      en: 'Extends, adducts and medially rotates the arm (pulling, swimming, rowing; lifts the trunk in crutch walking).'
    },
    clinical: {
      ko: '피판 재건(유방·조직 재건)에 흔히 사용되며, 흉배신경이 지배합니다.',
      en: 'Commonly used as a flap in reconstruction (e.g., breast); innervated by the thoracodorsal nerve.'
    },
    neighbors: ['trapezius', 'spine', 'pelvis', 'humerus'],
    quizEnabled: true
  },

  // ───────────── 골격(skeleton) ─────────────
  {
    id: 'skull',
    layer: 'skeleton',
    names: { ko: '두개골(머리뼈)', en: 'Skull' },
    latin: 'Cranium',
    ipa: { en: '/skʌl/' },
    description: {
      ko: '머리를 이루는 뼈들의 총칭으로 뇌를 감싸는 뇌머리뼈와 얼굴을 이루는 얼굴머리뼈로 나뉩니다. 성인은 아래턱을 제외한 대부분이 봉합으로 단단히 결합되어 있습니다.',
      en: 'The collective bones of the head, divided into the neurocranium enclosing the brain and the facial skeleton. In adults most bones are firmly united by sutures, except the mandible.'
    },
    function: {
      ko: '뇌와 감각기관(눈·귀 등)을 보호하고, 얼굴 구조와 씹기·발성의 토대를 제공합니다.',
      en: 'Protects the brain and sense organs and provides the framework for the face, chewing and speech.'
    },
    clinical: {
      ko: '두개골 골절은 뇌손상·경막외/경막하 출혈을 동반할 수 있으며, 영아의 숫구멍(천문)으로 두개내압을 평가합니다.',
      en: 'Skull fractures may accompany brain injury or epidural/subdural hemorrhage; infant fontanelles allow assessment of intracranial pressure.'
    },
    neighbors: ['brain', 'spine'],
    quizEnabled: true
  },
  {
    id: 'sternum',
    layer: 'skeleton',
    names: { ko: '흉골(복장뼈)', en: 'Sternum' },
    latin: 'Sternum',
    ipa: { en: '/ˈstɜːrnəm/' },
    description: {
      ko: '가슴 앞 정중앙의 납작한 뼈로 자루(병)·몸통·칼돌기 세 부분으로 이루어집니다. 위쪽에서 쇄골, 옆에서 늑연골과 관절합니다.',
      en: 'A flat bone in the midline of the anterior chest consisting of the manubrium, body and xiphoid process. It articulates with the clavicles above and the costal cartilages at the sides.'
    },
    function: {
      ko: '앞가슴을 보호하고 늑골·쇄골과 함께 흉곽을 완성하며 호흡근의 부착점이 됩니다.',
      en: 'Protects the anterior chest, completes the thoracic cage with the ribs and clavicles, and anchors respiratory muscles.'
    },
    clinical: {
      ko: '심폐소생술 흉부압박의 기준점(복장뼈 아래 절반)이며, 흉골자루의 각(흉골각)은 2번 늑골 확인의 지표입니다.',
      en: 'The landmark for CPR chest compressions (lower half of the sternum); the sternal angle marks the 2nd rib.'
    },
    neighbors: ['ribs', 'heart', 'pectoralis_major'],
    quizEnabled: true
  },
  {
    id: 'ribs',
    layer: 'skeleton',
    names: { ko: '늑골(갈비뼈)', en: 'Ribs' },
    latin: 'Costae',
    ipa: { en: '/rɪbz/' },
    description: {
      ko: '흉곽을 이루는 12쌍의 활 모양 뼈로, 뒤로는 흉추와 관절합니다. 1~7번은 참갈비뼈, 8~10번은 거짓갈비뼈, 11~12번은 뜬갈비뼈입니다.',
      en: 'Twelve pairs of curved bones forming the thoracic cage, articulating posteriorly with the thoracic vertebrae. Ribs 1–7 are true, 8–10 false, and 11–12 floating.'
    },
    function: {
      ko: '심장·폐 등 흉부 장기를 보호하고, 호흡 시 흉곽을 넓혀 환기를 돕습니다.',
      en: 'Protect thoracic organs such as the heart and lungs and expand the cage during breathing to aid ventilation.'
    },
    clinical: {
      ko: '늑골 골절은 흔하며, 여러 대가 여러 곳에서 부러지면 동요가슴(flail chest)이 될 수 있습니다. 늑간 신경·혈관은 늑골 아래모서리를 지납니다.',
      en: 'Rib fractures are common; multiple breaks can cause flail chest. Intercostal nerves and vessels run along the inferior rib margin.'
    },
    neighbors: ['sternum', 'spine', 'lungs', 'heart'],
    quizEnabled: true
  },
  {
    id: 'spine',
    layer: 'skeleton',
    names: { ko: '척추(척주)', en: 'Vertebral column' },
    latin: 'Columna vertebralis',
    ipa: { en: '/ˈvɜːrtɪbrəl ˈkɒləm/' },
    description: {
      ko: '몸통을 지지하는 33개 척추뼈의 기둥으로 경추 7·흉추 12·요추 5·천추 5(융합)·미추 4(융합)로 구성됩니다. S자 곡선을 이루며 사이에 추간판이 있습니다.',
      en: 'A column of 33 vertebrae supporting the trunk: 7 cervical, 12 thoracic, 5 lumbar, 5 fused sacral and 4 fused coccygeal. It forms an S-shaped curve with intervertebral discs between segments.'
    },
    function: {
      ko: '몸을 지지·직립시키고 척수를 보호하며, 유연한 움직임과 충격 흡수를 제공합니다.',
      en: 'Supports the body upright, protects the spinal cord, and allows flexible movement and shock absorption.'
    },
    clinical: {
      ko: '추간판 탈출은 신경뿌리를 눌러 좌골신경통을 일으키고, 요추천자는 보통 L3–L4/L4–L5 사이에서 시행합니다.',
      en: 'Disc herniation can compress nerve roots causing sciatica; lumbar puncture is usually done at L3–L4/L4–L5.'
    },
    neighbors: ['skull', 'ribs', 'pelvis', 'brain'],
    quizEnabled: true
  },
  {
    id: 'pelvis',
    layer: 'skeleton',
    names: { ko: '골반', en: 'Pelvis' },
    latin: 'Pelvis',
    ipa: { en: '/ˈpɛlvɪs/' },
    description: {
      ko: '좌우 볼기뼈(엉덩·궁둥·두덩뼈 융합)와 천골·꼬리뼈로 이루어진 고리 모양 구조입니다. 척추와 다리를 연결하며 남녀 형태 차이가 뚜렷합니다.',
      en: 'A ring formed by the two hip bones (fused ilium, ischium and pubis) together with the sacrum and coccyx. It links the spine to the legs and shows marked sexual dimorphism.'
    },
    function: {
      ko: '체중을 다리로 전달하고 방광·생식기·직장을 지지하며, 여성에서는 산도를 형성합니다.',
      en: 'Transmits body weight to the legs, supports the bladder, reproductive organs and rectum, and forms the birth canal in females.'
    },
    clinical: {
      ko: '골반 골절은 대량 출혈을 동반할 수 있고, 산과에서 골반 크기(골반계측)는 분만 방식 결정에 중요합니다.',
      en: 'Pelvic fractures can cause massive hemorrhage; in obstetrics, pelvic dimensions guide the mode of delivery.'
    },
    neighbors: ['spine', 'femur', 'large_intestine', 'quadriceps_femoris'],
    quizEnabled: true
  },
  {
    id: 'femur',
    layer: 'skeleton',
    names: { ko: '대퇴골(넙다리뼈)', en: 'Femur' },
    latin: 'Femur',
    ipa: { en: '/ˈfiːmər/' },
    description: {
      ko: '허벅지의 뼈로 인체에서 가장 길고 강한 뼈입니다. 위쪽 머리는 골반 절구와 엉덩관절을, 아래쪽 관절융기는 정강뼈·슬개골과 무릎관절을 이룹니다.',
      en: 'The thigh bone, the longest and strongest bone in the body. Its head forms the hip joint with the acetabulum, and its distal condyles form the knee with the tibia and patella.'
    },
    function: {
      ko: '체중을 지지·전달하고 강력한 다리 근육이 부착하여 보행·도약을 가능하게 합니다.',
      en: 'Supports and transmits body weight and anchors powerful leg muscles for walking and jumping.'
    },
    clinical: {
      ko: '노인의 대퇴골 목 골절은 고관절 골절로 흔하며, 넙다리뼈 골절은 대량 출혈을 유발할 수 있습니다.',
      en: 'Femoral neck fractures are common hip fractures in the elderly; femoral shaft fractures can cause major blood loss.'
    },
    neighbors: ['pelvis', 'quadriceps_femoris'],
    quizEnabled: true
  },
  {
    id: 'humerus',
    layer: 'skeleton',
    names: { ko: '상완골(위팔뼈)', en: 'Humerus' },
    latin: 'Humerus',
    ipa: { en: '/ˈhjuːmərəs/' },
    description: {
      ko: '위팔의 긴뼈로 위쪽 머리는 견갑골과 어깨관절을, 아래쪽은 요골·척골과 팔꿈치관절을 이룹니다. 몸통 뒤를 요골신경이 나선으로 감고 지납니다.',
      en: 'The long bone of the upper arm; its head forms the shoulder joint with the scapula and its distal end the elbow with the radius and ulna. The radial nerve spirals along its posterior shaft.'
    },
    function: {
      ko: '어깨·팔꿈치 운동의 지렛대가 되고 위팔·아래팔 근육의 부착점을 제공합니다.',
      en: 'Serves as a lever for shoulder and elbow motion and anchors muscles of the arm and forearm.'
    },
    clinical: {
      ko: '중간몸통 골절은 요골신경 손상(손목 처짐)을, 외과목 골절은 액와신경 손상을 유발할 수 있습니다.',
      en: 'Mid-shaft fractures can injure the radial nerve (wrist drop); surgical-neck fractures can injure the axillary nerve.'
    },
    neighbors: ['deltoid', 'biceps_brachii', 'triceps_brachii', 'radius', 'ulna'],
    quizEnabled: true
  },
  {
    id: 'radius',
    layer: 'skeleton',
    names: { ko: '요골(노뼈)', en: 'Radius' },
    latin: 'Radius',
    ipa: { en: '/ˈreɪdiəs/' },
    description: {
      ko: '아래팔 가쪽(엄지쪽)의 뼈로, 위쪽에서 상완골·척골과, 아래쪽에서 손목뼈와 관절합니다. 아래팔이 회전(회내·회외)할 때 척골 둘레를 돕니다.',
      en: 'The lateral (thumb-side) forearm bone, articulating proximally with the humerus and ulna and distally with the carpal bones. It rotates around the ulna during pronation and supination.'
    },
    function: {
      ko: '손목 관절을 형성하고 아래팔의 회전 운동을 담당하며 손으로 힘을 전달합니다.',
      en: 'Forms the wrist joint, mediates forearm rotation, and transmits force to the hand.'
    },
    clinical: {
      ko: '먼쪽 요골 골절(콜레스 골절)은 낙상 시 가장 흔한 골절 중 하나입니다.',
      en: 'A distal radius fracture (Colles fracture) is among the most common fractures after a fall.'
    },
    neighbors: ['ulna', 'humerus', 'biceps_brachii'],
    quizEnabled: true
  },
  {
    id: 'ulna',
    layer: 'skeleton',
    names: { ko: '척골(자뼈)', en: 'Ulna' },
    latin: 'Ulna',
    ipa: { en: '/ˈʌlnə/' },
    description: {
      ko: '아래팔 안쪽(새끼손가락쪽)의 뼈로, 위쪽의 팔꿈치머리(주두)가 상완골과 팔꿈치관절을 이룹니다. 요골과 함께 아래팔을 지지합니다.',
      en: 'The medial (little-finger-side) forearm bone; its proximal olecranon forms the elbow joint with the humerus. It supports the forearm together with the radius.'
    },
    function: {
      ko: '팔꿈치의 경첩 운동을 안정화하고 아래팔의 뼈대를 이루며 근육 부착점을 제공합니다.',
      en: 'Stabilizes the hinge motion of the elbow, forms the forearm skeleton, and anchors muscles.'
    },
    clinical: {
      ko: '팔꿈치머리 골절은 삼두근 견인으로 벌어질 수 있고, 자신경은 안쪽위관절융기 뒤(속칭 "찌릿한 뼈")를 지납니다.',
      en: 'Olecranon fractures may be displaced by triceps pull; the ulnar nerve passes behind the medial epicondyle (the "funny bone").'
    },
    neighbors: ['radius', 'humerus', 'triceps_brachii'],
    quizEnabled: true
  },

  // ───────────── 장기(organs) ─────────────
  {
    id: 'heart',
    layer: 'organs',
    names: { ko: '심장', en: 'Heart' },
    latin: 'Cor',
    ipa: { en: '/hɑːrt/', latin: '/kor/' },
    description: {
      ko: '가슴 세로칸(종격) 안에 있는 근육성 펌프로 네 개의 방(좌우 심방·심실)으로 이루어집니다. 판막이 혈류를 한 방향으로 유지합니다. 크기는 대략 주먹만 합니다.',
      en: 'A muscular pump in the mediastinum with four chambers (right and left atria and ventricles). Valves keep blood flowing in one direction. It is roughly the size of a fist.'
    },
    function: {
      ko: '폐순환과 온몸순환으로 혈액을 밀어내어 산소와 영양을 전신에 공급합니다.',
      en: 'Drives the pulmonary and systemic circulations, delivering oxygen and nutrients throughout the body.'
    },
    clinical: {
      ko: '관상동맥이 막히면 심근경색이 생기며, 판막 질환·부정맥·심부전은 흔한 심장 질환입니다.',
      en: 'Coronary occlusion causes myocardial infarction; valvular disease, arrhythmias and heart failure are common cardiac disorders.'
    },
    neighbors: ['lungs', 'sternum', 'ribs'],
    quizEnabled: true
  },
  {
    id: 'lungs',
    layer: 'organs',
    names: { ko: '폐(허파)', en: 'Lungs' },
    latin: 'Pulmones',
    ipa: { en: '/lʌŋz/', latin: '/pulˈmoː.neːs/' },
    description: {
      ko: '가슴 안 좌우 한 쌍의 호흡기관으로 오른쪽은 3엽, 왼쪽은 2엽입니다. 기관지에서 갈라진 세기관지가 폐포로 끝나며 이곳에서 가스교환이 일어납니다.',
      en: 'A pair of respiratory organs in the chest; the right has three lobes and the left two. Bronchi branch into bronchioles ending in alveoli, where gas exchange occurs.'
    },
    function: {
      ko: '들숨의 산소를 혈액으로, 혈액의 이산화탄소를 날숨으로 교환합니다(외호흡).',
      en: 'Exchange oxygen from inhaled air into the blood and carbon dioxide out (external respiration).'
    },
    clinical: {
      ko: '천식·COPD·폐렴·폐색전증이 흔하며, 흉막강에 공기가 차면 기흉이 됩니다.',
      en: 'Asthma, COPD, pneumonia and pulmonary embolism are common; air in the pleural space causes pneumothorax.'
    },
    neighbors: ['heart', 'ribs'],
    quizEnabled: true
  },
  {
    id: 'liver',
    layer: 'organs',
    names: { ko: '간', en: 'Liver' },
    latin: 'Hepar',
    ipa: { en: '/ˈlɪvər/', latin: '/ˈhɛpar/' },
    description: {
      ko: '오른쪽 위 복부(우상복부)에 있는 인체 최대의 샘 장기로 네 개의 엽으로 나뉩니다. 문맥과 간동맥의 이중 혈액 공급을 받습니다.',
      en: 'The largest gland in the body, located in the right upper abdomen and divided into four lobes. It receives a dual blood supply from the portal vein and hepatic artery.'
    },
    function: {
      ko: '해독·담즙 생성·대사(포도당·지질·단백)·혈장단백 합성·저장을 담당합니다.',
      en: 'Handles detoxification, bile production, metabolism (glucose, lipid, protein), plasma-protein synthesis and storage.'
    },
    clinical: {
      ko: '간염·간경변·지방간이 흔하며, 재생능력이 뛰어나 부분 절제·생체 간이식이 가능합니다.',
      en: 'Hepatitis, cirrhosis and fatty liver are common; its strong regenerative capacity enables partial resection and living-donor transplant.'
    },
    neighbors: ['stomach', 'pancreas', 'small_intestine'],
    quizEnabled: true
  },
  {
    id: 'stomach',
    layer: 'organs',
    names: { ko: '위(위장)', en: 'Stomach' },
    latin: 'Gaster',
    ipa: { en: '/ˈstʌmək/', latin: '/ˈɡas.ter/' },
    description: {
      ko: '식도와 소장 사이의 J자 모양 근육성 주머니로 좌상복부에 있습니다. 들문·바닥·몸통·날문으로 나뉘며 점막에 위샘이 있습니다.',
      en: 'A J-shaped muscular sac between the esophagus and small intestine in the left upper abdomen. It has cardia, fundus, body and pylorus, with gastric glands in the mucosa.'
    },
    function: {
      ko: '음식을 저장·혼합하고 위산과 펩신으로 소화를 시작하며, 죽 같은 미즙을 십이지장으로 내보냅니다.',
      en: 'Stores and mixes food, begins digestion with acid and pepsin, and releases chyme into the duodenum.'
    },
    clinical: {
      ko: '헬리코박터균은 소화성 궤양·위암과 관련되며, 위식도역류(GERD)는 흔한 질환입니다.',
      en: 'Helicobacter pylori is linked to peptic ulcers and gastric cancer; reflux (GERD) is common.'
    },
    neighbors: ['liver', 'pancreas', 'spleen', 'small_intestine'],
    quizEnabled: true
  },
  {
    id: 'kidney',
    layer: 'organs',
    names: { ko: '신장(콩팥)', en: 'Kidney' },
    latin: 'Ren',
    ipa: { en: '/ˈkɪdni/', latin: '/reːn/' },
    description: {
      ko: '척주 양옆 후복막에 있는 한 쌍의 강낭콩 모양 장기로, 오른쪽이 간 때문에 약간 낮습니다. 약 100만 개의 네프론이 여과 단위입니다.',
      en: 'A pair of bean-shaped retroperitoneal organs beside the spine; the right sits slightly lower due to the liver. About a million nephrons form its filtering units.'
    },
    function: {
      ko: '혈액을 여과해 소변을 만들고 수분·전해질·산염기 균형과 혈압을 조절하며 에리트로포이에틴을 분비합니다.',
      en: 'Filters blood to form urine, regulates water, electrolyte and acid–base balance and blood pressure, and secretes erythropoietin.'
    },
    clinical: {
      ko: '신결석·신부전·사구체신염이 흔하며, 말기 신부전은 투석이나 이식이 필요합니다.',
      en: 'Kidney stones, renal failure and glomerulonephritis are common; end-stage disease needs dialysis or transplant.'
    },
    neighbors: ['large_intestine', 'spine', 'pancreas'],
    quizEnabled: true
  },
  {
    id: 'small_intestine',
    layer: 'organs',
    names: { ko: '소장(작은창자)', en: 'Small intestine' },
    latin: 'Intestinum tenue',
    ipa: { en: '/smɔːl ɪnˈtɛstɪn/' },
    description: {
      ko: '위와 대장 사이의 긴 관으로 십이지장·공장·회장으로 나뉩니다. 점막의 융모와 미세융모가 표면적을 크게 늘립니다.',
      en: 'A long tube between the stomach and large intestine, divided into duodenum, jejunum and ileum. Mucosal villi and microvilli greatly increase its surface area.'
    },
    function: {
      ko: '소화의 대부분을 완료하고 영양소·수분 흡수의 주된 장소로 작용합니다.',
      en: 'Completes most digestion and is the principal site of nutrient and water absorption.'
    },
    clinical: {
      ko: '크론병·복강병(셀리악)·장폐색이 발생하며, 십이지장은 소화성 궤양의 흔한 부위입니다.',
      en: 'Crohn disease, celiac disease and obstruction occur here; the duodenum is a common site of peptic ulcers.'
    },
    neighbors: ['stomach', 'large_intestine', 'liver', 'pancreas'],
    quizEnabled: true
  },
  {
    id: 'large_intestine',
    layer: 'organs',
    names: { ko: '대장(큰창자)', en: 'Large intestine' },
    latin: 'Intestinum crassum',
    ipa: { en: '/lɑːrdʒ ɪnˈtɛstɪn/' },
    description: {
      ko: '맹장·결장(상행·횡행·하행·구불)·직장으로 이루어진 굵은 관으로 복강 둘레를 액자처럼 감쌉니다. 잘록창자띠·팽대·복막주렁이 특징입니다.',
      en: 'A wide tube of cecum, colon (ascending, transverse, descending, sigmoid) and rectum framing the abdominal cavity. Teniae coli, haustra and epiploic appendages are characteristic.'
    },
    function: {
      ko: '수분·전해질을 흡수하고 대변을 형성·저장하며, 장내 세균이 일부 비타민을 만듭니다.',
      en: 'Absorbs water and electrolytes, forms and stores feces, and hosts bacteria that produce some vitamins.'
    },
    clinical: {
      ko: '대장암·게실염·궤양성 대장염이 흔하며, 대장내시경은 선별검사로 중요합니다.',
      en: 'Colorectal cancer, diverticulitis and ulcerative colitis are common; colonoscopy is a key screening tool.'
    },
    neighbors: ['small_intestine', 'pelvis', 'kidney'],
    quizEnabled: true
  },
  {
    id: 'brain',
    layer: 'organs',
    names: { ko: '뇌', en: 'Brain' },
    latin: 'Encephalon',
    ipa: { en: '/breɪn/' },
    description: {
      ko: '두개강 안의 중추신경 기관으로 대뇌·소뇌·뇌줄기로 나뉩니다. 수막에 싸여 뇌척수액에 떠 있으며 수많은 뉴런과 신경아교세포로 이루어집니다.',
      en: 'The central nervous organ within the cranial cavity, comprising the cerebrum, cerebellum and brainstem. Wrapped in meninges and floating in cerebrospinal fluid, it is made of neurons and glia.'
    },
    function: {
      ko: '감각 처리·운동 명령·인지·기억·감정·항상성 조절 등 신체 전반을 통합·제어합니다.',
      en: 'Integrates and controls the body — sensory processing, motor commands, cognition, memory, emotion and homeostasis.'
    },
    clinical: {
      ko: '뇌졸중·외상성 뇌손상·종양·퇴행성 질환(알츠하이머 등)이 발생하며, 두개내압 상승은 응급 상황입니다.',
      en: 'Stroke, traumatic injury, tumors and degenerative diseases (e.g., Alzheimer) occur here; raised intracranial pressure is an emergency.'
    },
    neighbors: ['skull', 'spine'],
    quizEnabled: true
  },
  {
    id: 'spleen',
    layer: 'organs',
    names: { ko: '비장(지라)', en: 'Spleen' },
    latin: 'Lien',
    ipa: { en: '/spliːn/', latin: '/ˈliː.en/' },
    description: {
      ko: '좌상복부 9~11번 늑골 뒤에 있는 림프 기관으로 백색속질과 적색속질로 이루어집니다. 인체에서 가장 큰 이차 림프기관입니다.',
      en: 'A lymphoid organ in the left upper abdomen behind ribs 9–11, made of white and red pulp. It is the largest secondary lymphoid organ.'
    },
    function: {
      ko: '노화된 적혈구를 걸러 없애고 혈액을 저장하며, 혈액매개 항원에 대한 면역 반응을 담당합니다.',
      en: 'Filters and removes aged red blood cells, stores blood, and mounts immune responses to blood-borne antigens.'
    },
    clinical: {
      ko: '복부 외상에서 파열이 흔해 응급 출혈을 일으키며, 비장 절제 후에는 피막형 세균 감염 위험이 커집니다.',
      en: 'It commonly ruptures in abdominal trauma causing emergency bleeding; after splenectomy the risk of encapsulated-bacteria infection rises.'
    },
    neighbors: ['stomach', 'pancreas', 'kidney'],
    quizEnabled: true
  },
  {
    id: 'pancreas',
    layer: 'organs',
    names: { ko: '췌장(이자)', en: 'Pancreas' },
    latin: 'Pancreas',
    ipa: { en: '/ˈpæŋkriəs/', latin: '/ˈpaŋ.kre.as/' },
    description: {
      ko: '위 뒤 후복막에 가로로 놓인 장기로 머리·몸통·꼬리로 나뉘며, 머리는 십이지장 곡선에 안깁니다. 외분비샘과 내분비샘(랑게르한스섬)을 모두 가집니다.',
      en: 'A retroperitoneal organ lying transversely behind the stomach with a head, body and tail; its head nestles in the duodenal curve. It has both exocrine and endocrine (islets of Langerhans) tissue.'
    },
    function: {
      ko: '소화효소를 십이지장으로 분비하고, 인슐린·글루카곤을 혈액으로 분비해 혈당을 조절합니다.',
      en: 'Secretes digestive enzymes into the duodenum and releases insulin and glucagon into the blood to control glucose.'
    },
    clinical: {
      ko: '췌장염(담석·알코올)과 예후가 나쁜 췌장암이 발생하며, 내분비 이상은 당뇨병을 유발합니다.',
      en: 'Pancreatitis (gallstones, alcohol) and aggressive pancreatic cancer occur here; endocrine failure causes diabetes.'
    },
    neighbors: ['stomach', 'liver', 'spleen', 'small_intestine'],
    quizEnabled: true
  }
];

// id → 구조 객체 빠른 조회
export const STRUCTURE_BY_ID = Object.fromEntries(STRUCTURES.map((s) => [s.id, s]));

// 레이어별 구조 목록
export function structuresByLayer(layer) {
  return STRUCTURES.filter((s) => s.layer === layer);
}
