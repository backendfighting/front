// 켜고 끄는 스위치
export function Toggle({ on, onClick, label, small = false, xs = false, disabled = false }: { on: boolean; onClick: () => void; label: string; small?: boolean; xs?: boolean; disabled?: boolean }) {
  // xs: 기본 크기의 0.7배
  const w = xs ? 31 : small ? 34 : 44, h = xs ? 18 : small ? 20 : 26, k = xs ? 14 : small ? 14 : 20, pad = xs ? 2 : 3;
  return (
    <div role="switch" aria-checked={on} aria-label={label} aria-disabled={disabled || undefined}
         onClick={disabled ? undefined : onClick} className={disabled ? undefined : 'cursor-pointer'}
         style={{ width: w, height: h, borderRadius: h / 2, background: on ? 'var(--ctl)' : 'var(--g1)', position: 'relative', flexShrink: 0, transition: 'background 0.2s', opacity: disabled ? 0.5 : 1 }}>
      <div style={{ width: k, height: k, borderRadius: '50%', background: '#fff', position: 'absolute', top: pad, left: on ? w - k - pad : pad, transition: 'left 0.2s' }} />
    </div>
  );
}
