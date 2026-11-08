import type React from 'react';

// 목표·알림 설정 화면: 버튼·스위치·선택된 칩(--ctl)을 남색으로
export const NAVY_SCOPE = { '--ctl': 'var(--navy)', '--ctl-soft': 'var(--navy1)', '--ctl-line': 'var(--navy2)' } as React.CSSProperties;

// ===== 앱 색 (App.css 맨 위의 색 변수와 같은 값) =====
// 아이콘처럼 실제 색값이 필요한 곳에서만 쓴다. 나머지는 'var(--p5)' 같은 CSS 변수를 쓴다
export const C = {
  p5: '#6a60de',
  p4: '#8b83e9',
  p3: '#aea8f2',
  p2: '#d3d0f9',
  p1: '#f9f8ff',
  p15: '#e6e4fc',
  navy3: '#444f70',
  navy: '#5b678c',
  navy2: '#c5cbe0',
  navy1: '#eef1f8',
  red: '#e8787c',
  red1: '#fdeeee',
  orange: '#eba44c',
  orange2: '#f4cc99',
  orange1: '#fdf3e6',
  green: '#5aaf78',
  g4: '#2e2c33',
  g3: '#4e4b52',
  g2: '#7a7680',
  g1: '#b5b1bc',
  bg: '#f7f6fb',
  surface: '#f1f0f5',
  line: '#ecebf1',
};
