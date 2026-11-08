import { C } from '../constants/colors';

// 루틴 심볼: 굵기는 어디나 같게, 화살표 몸통이 정사각형에 가깝게 직접 그림
export const RoutineIcon = ({ size = 32, color = C.p5, strokeWidth = 2.2 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <svg className="routine-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m16 1 4 4-4 4" />
    <path d="M4 12V9a4 4 0 0 1 4-4h12" />
    <path d="m8 23-4-4 4-4" />
    <path d="M20 12v3a4 4 0 0 1-4 4H4" />
  </svg>
);
