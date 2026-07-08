// ============================================================
// rim.js — (a) 프레넬/림 하이라이트 셰이더
// 구조의 기본 표면 라이팅 + 가장자리(프레넬) 발광.
// uHighlight: 0=없음, 1=호버, 2=선택 → 림 색/강도가 달라짐.
// 라이팅은 뷰 공간에서 계산하여 비균일 스케일(타원체 등)에도 안정적입니다.
// ============================================================

export const rimVertex = /* glsl */ `
  varying vec3 vViewNormal;   // 뷰 공간 법선
  varying vec3 vViewPos;      // 뷰 공간 위치

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mvPos.xyz;
    // normalMatrix = transpose(inverse(modelView)) → 스케일 보정된 법선
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const rimFragment = /* glsl */ `
  precision highp float;

  uniform vec3  uColor;       // 구조 기본 색
  uniform float uOpacity;     // 불투명도(레이어 페이드)
  uniform float uHighlight;   // 0/1/2
  uniform float uTime;        // 애니메이션(선택 시 은은한 맥동)

  varying vec3 vViewNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 N = normalize(vViewNormal);
    vec3 V = normalize(-vViewPos);           // 카메라 방향(뷰 공간)

    // ── 간단한 3점 라이팅(뷰 공간 고정 방향) ──
    vec3 keyDir  = normalize(vec3( 0.5,  0.7,  0.8));
    vec3 fillDir = normalize(vec3(-0.7,  0.2,  0.5));
    vec3 rimDir  = normalize(vec3( 0.0, -0.4, -1.0));
    float key  = max(dot(N, keyDir),  0.0) * 0.85;
    float fill = max(dot(N, fillDir), 0.0) * 0.35;
    float back = max(dot(N, rimDir),  0.0) * 0.25;
    float ambient = 0.28;
    vec3 base = uColor * (ambient + key + fill + back);

    // ── 프레넬(가장자리일수록 1에 가까움) ──
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

    // ── 하이라이트 색/강도 ──
    vec3 rimColor = vec3(0.0);
    float rimStrength = 0.0;
    if (uHighlight > 1.5) {
      // 선택: 따뜻한 금빛 + 은은한 맥동
      rimColor = vec3(1.0, 0.78, 0.30);
      rimStrength = 1.6 + 0.4 * sin(uTime * 3.0);
    } else if (uHighlight > 0.5) {
      // 호버: 청록빛
      rimColor = vec3(0.35, 0.9, 1.0);
      rimStrength = 1.1;
    }

    vec3 color = base + rimColor * fres * rimStrength;

    gl_FragColor = vec4(color, uOpacity);
  }
`;
