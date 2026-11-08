import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { C } from '../constants/colors';

// 드롭다운처럼 고르고, 더블클릭하면 숫자를 직접 입력할 수 있는 칸
export function PickField({ value, options, format, onChange, min, max, ariaLabel, style }: {
  value: number; options: number[]; format: (v: number) => string; onChange: (v: number) => void;
  min: number; max: number; ariaLabel: string; style?: any;
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const clickTimer = useRef<any>(null);
  const cancelRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const list = options.includes(value) ? options : [...options, value].sort((a, b) => a - b);

  useEffect(() => () => clearTimeout(clickTimer.current), []);

  const openList = () => {
    // 보이는 영역(스크롤 영역) 아래쪽이면 목록을 위로 펼친다
    const r = btnRef.current?.getBoundingClientRect();
    const area = btnRef.current?.closest('.scroll-content')?.getBoundingClientRect();
    const bottomLimit = area ? Math.min(area.bottom, window.innerHeight) : window.innerHeight;
    setUp(!!r && r.bottom + 210 > bottomLimit);
    setOpen(o => !o);
  };
  const startEdit = () => {
    clearTimeout(clickTimer.current);
    setOpen(false);
    setDraft(String(value));
    cancelRef.current = false;
    setEditing(true);
  };
  const commit = () => {
    setEditing(false);
    if (cancelRef.current) return;
    const n = Number(draft);
    if (draft.trim() === '' || !Number.isInteger(n) || n < min || n > max) {
      alert(`${min}~${max} 사이의 숫자로 입력해주세요.`);
      return;
    }
    onChange(n);
  };

  if (editing) {
    return (
      <input className="pick-field pick-input" type="text" inputMode="numeric" autoFocus value={draft}
             aria-label={ariaLabel} style={style}
             onChange={(e) => setDraft(e.target.value)}
             onBlur={commit}
             onKeyDown={(e) => {
               if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
               if (e.key === 'Escape') { cancelRef.current = true; (e.target as HTMLInputElement).blur(); }
             }} />
    );
  }
  return (
    <div className="pick-wrap" style={style}>
      <button ref={btnRef} type="button" className="pick-field" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}
              title="더블클릭하면 직접 입력할 수 있어요"
              onClick={() => { clearTimeout(clickTimer.current); clickTimer.current = setTimeout(openList, 200); }}
              onDoubleClick={startEdit}>
        <span>{format(value)}</span>
        <ChevronDown size={14} color={C.g2} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} />
          <ul className={`pick-list ${up ? 'up' : ''}`} role="listbox" aria-label={ariaLabel}
              ref={(el) => { el?.querySelector('.active')?.scrollIntoView({ block: 'nearest' }); }}>
            {list.map(o => (
              <li key={o} role="option" aria-selected={o === value} className={o === value ? 'active' : ''}
                  onClick={() => { onChange(o); setOpen(false); }}>
                {format(o)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
