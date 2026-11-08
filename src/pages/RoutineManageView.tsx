import { useEffect, useState } from 'react';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { BASE_URL, authHeaders, readError } from '../api/client';
import { C } from '../constants/colors';
import { ALL_DAYS, DAY_OPTIONS, sortDays } from '../constants/days';
import { getTodayStr } from '../utils/date';

// ===== 루틴 관리 (일시중지 포함 전체 루틴) =====
export function RoutineManageView({ setView, onEditRoutine, onDeleteRoutine, onAddRoutine }: any) {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/routines`, { headers: authHeaders() });
      if (!res.ok) { setFailed(true); return; }
      const data = await res.json();
      setRoutines(Array.isArray(data) ? data : []);
      setFailed(false);
    } catch { setFailed(true); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // 삭제한 루틴(종료일이 정해진 루틴)은 목록에서 숨긴다
  // (오늘 이미 완료한 루틴은 종료일이 내일이라 달력엔 오늘까지 남지만, 관리 목록에서는 바로 사라짐)
  const today = getTodayStr();
  const visibleRoutines = routines.filter((r: any) => !r.endDate);

  const dayText = (days: string[]) => {
    const d = sortDays(days || []);
    if (d.length === 7) return '매일';
    if (d.join() === ALL_DAYS.slice(0, 5).join()) return '평일';
    if (d.join() === ALL_DAYS.slice(5).join()) return '주말';
    return DAY_OPTIONS.filter(o => d.includes(o.v)).map(o => o.l).join(' · ');
  };

  const toggleActive = async (r: any) => {
    try {
      const res = await fetch(`${BASE_URL}/api/routines/${r.routineId}/toggle`, { method: 'PATCH', headers: authHeaders() });
      if (!res.ok) return alert(`상태 변경에 실패했습니다.\n${await readError(res)}`);
      const updated = await res.json().catch(() => null);
      setRoutines(prev => prev.map(x => x.routineId === r.routineId ? (updated ? { ...x, ...updated } : { ...x, active: !x.active }) : x));
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color={C.g3} />
        <h3 className="header-title">루틴 관리</h3>
        {/* 루틴 추가: 5보라 원 + 1보라 십자 */}
        <button className="round-add-btn" aria-label="루틴 추가" onClick={onAddRoutine}>
          <Plus size={16} strokeWidth={3} color={C.p1} />
        </button>
      </div>
      <div className="scroll-content">
        <p style={{ fontSize: '12px', color: 'var(--g1)', margin: '0 4px 16px' }}>일시중지된 루틴은 활성화 전까진 미션 화면에 나타나지 않아요.</p>
        {loading && <p style={{ color: 'var(--g1)', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>불러오는 중...</p>}
        {!loading && failed && <p style={{ color: 'var(--g1)', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>루틴 목록을 불러오지 못했습니다.</p>}
        {!loading && !failed && visibleRoutines.length === 0 && <p style={{ color: 'var(--g1)', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>등록된 루틴이 없습니다.</p>}
        {!loading && !failed && visibleRoutines.map((r: any) => (
          <div key={r.routineId} style={{ background: '#fff', border: '1px solid var(--surface)', borderRadius: '20px', padding: '18px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', opacity: r.active ? 1 : 0.55 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--g4)', marginBottom: '6px' }}>{r.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--g2)' }}>
                🔁 {dayText(r.repeatDays)}
                {r.routineTime ? `  ·  🕒 ${String(r.routineTime).slice(0, 5)}` : ''}
                {r.notifyBefore !== null && r.notifyBefore !== undefined ? '  ·  🔔' : ''}
                {r.active ? '' : '  ·  일시중지됨'}
              </div>
              {r.startDate && String(r.startDate).slice(0, 10) > today && (
                <div style={{ fontSize: '11px', color: 'var(--g1)', marginTop: '4px' }}>{String(r.startDate).slice(0, 10)}부터 시작</div>
              )}
            </div>
            <div role="switch" aria-checked={!!r.active} aria-label={`${r.title} ${r.active ? '일시중지' : '다시 시작'}`}
                 onClick={() => toggleActive(r)} className="cursor-pointer"
                 style={{ width: 44, height: 26, borderRadius: 13, background: r.active ? 'var(--ctl)' : 'var(--g1)', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: r.active ? 21 : 3, transition: 'left 0.2s' }} />
            </div>
            <Pencil size={18} color={C.g1} className="cursor-pointer" onClick={() => onEditRoutine(r)} />
            <Trash2 size={18} color={C.red} className="cursor-pointer" onClick={async () => {
              if (!confirm('이 루틴을 앞으로의 일정에서 영영 삭제할까요?\n지난 기록은 삭제되지 않습니다.\n\n잠시 루틴을 쉬어가고 싶다면, 일시중지 기능으로 원하는 기간 동안 루틴을 멈춰보세요.')) return;
              await onDeleteRoutine(r.routineId, today);
              load();
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
