import { PickField } from './PickField';
import { isRealTime } from '../utils/date';

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);

const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5);

// 오전/오후 + 시 + 분 (값은 "HH:MM" 24시간). 시·분은 더블클릭하면 직접 입력
export function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const safe = isRealTime(value) ? value : '09:00';
  const h24 = Number(safe.slice(0, 2));
  const min = Number(safe.slice(3, 5));
  const mer: 'AM' | 'PM' = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const set = (m: 'AM' | 'PM', h: number, mm: number) =>
    onChange(`${String((h % 12) + (m === 'PM' ? 12 : 0)).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  return (
    <div className="time-row">
      <div className="ampm" role="group" aria-label="오전 오후">
        <button type="button" className={mer === 'AM' ? 'on' : ''} onClick={() => set('AM', h12, min)}>오전</button>
        <button type="button" className={mer === 'PM' ? 'on' : ''} onClick={() => set('PM', h12, min)}>오후</button>
      </div>
      <PickField value={h12} options={HOURS_12} format={(h) => `${h}시`} min={1} max={12} ariaLabel="시"
                 onChange={(h) => set(mer, h, min)} style={{ flex: 1 }} />
      <PickField value={min} options={MINUTES_5} format={(m) => `${String(m).padStart(2, '0')}분`} min={0} max={59} ariaLabel="분"
                 onChange={(m) => set(mer, h12, m)} style={{ flex: 1 }} />
    </div>
  );
}
