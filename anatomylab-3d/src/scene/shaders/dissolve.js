// ============================================================
// dissolve.js — (b) 노이즈 디졸브 셰이더
// 레이어를 벗길 때 스르륵 사라지는 전환.
// uProgress: 0=완전 보임, 1=완전 사라짐. 임계값 근처는 발광 테두리.
// 값비싼 텍스처 없이 해시 기반 3D 노이즈를 GLSL로 직접 구현했습니다.
// ============================================================

export const dissolveVertex = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;   // 노이즈 샘플용 로컬 좌표

  void main() {
    vLocalPos = position;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mvPos.xyz;
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const dissolveFragment = /* glsl */ `
  precision highp float;

  uniform vec3  uColor;
  uniform float uOpacity;
  uniform float uProgress;   // 0..1
  uniform vec3  uEdgeColor;  // 사라지는 경계 발광색

  varying vec3 vViewNormal;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;

  // ── 해시 기반 값 노이즈 ──
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);   // smoothstep 보간
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  void main() {
    // 여러 옥타브를 섞은 노이즈(0..1)
    float n = noise(vLocalPos * 3.0);
    n = 0.6 * n + 0.4 * noise(vLocalPos * 7.0 + 5.0);

    // 노이즈가 진행도보다 작으면 폐기 → 구멍이 점점 커짐
    if (n < uProgress) discard;

    // 간단한 라이팅
    vec3 N = normalize(vViewNormal);
    vec3 keyDir = normalize(vec3(0.5, 0.7, 0.8));
    float lit = 0.3 + max(dot(N, keyDir), 0.0) * 0.8;
    vec3 base = uColor * lit;

    // 사라지는 경계(임계값 바로 위)를 발광시켜 "스르륵" 효과
    float edge = smoothstep(uProgress, uProgress + 0.08, n);
    vec3 color = mix(uEdgeColor, base, edge);

    gl_FragColor = vec4(color, uOpacity);
  }
`;
