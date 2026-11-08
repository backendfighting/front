import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { PickField } from '../components/PickField';
import { TimeSelect } from '../components/TimeSelect';
import { Toggle } from '../components/Toggle';
import { C } from '../constants/colors';
import { ALL_DAYS, DAY_OPTIONS, sortDays } from '../constants/days';
import { categoryOptions } from '../constants/goals';
import { getTodayStr, isRealDate, isRealTime } from '../utils/date';
import { ALARM_MINUTES, formatAlarm } from '../utils/notifications';

export function TodoAddView({ setView, onAddTodo, onUpdateTodo, onUpdateRoutine, editingItem, editingKind, globalDate, returnTo = 'main' }: any) {
  const isEdit = !!editingItem;
  // 루틴 관리에서 들어오면 루틴만 추가하고, 저장하면 루틴 관리로 돌아간다
  const fromRoutines = returnTo === 'routines';
  const goBack = () => setView(returnTo);
  const isRoutineEdit = isEdit && editingKind === 'routine';

  const [title, setTitle] = useState(editingItem?.title || '');
  const [memo, setMemo] = useState(editingItem?.description || '');
  const [date, setDate] = useState(editingItem?.todoDate || globalDate);
  const initialTime = editingItem?.todoTime || editingItem?.routineTime;
  const [time, setTime] = useState(initialTime ? String(initialTime).slice(0, 5) : '14:00');
  // 기본값은 '보통'
  const [priority, setPriority] = useState(
    editingItem?.priority === 'HIGH' ? 'high' : editingItem?.priority === 'LOW' ? 'low' : 'normal'
  );
  const [category, setCategory] = useState(editingItem?.category || '공부');
  const [type, setType] = useState(isRoutineEdit || fromRoutines ? 'routine' : 'todo');
  const [repeatDays, setRepeatDays] = useState<string[]>(
    Array.isArray(editingItem?.repeatDays) ? sortDays(editingItem.repeatDays) : []
  );
  // 루틴 전용: 시작일(새 루틴은 지금 보고 있는 날짜), 시간 지정 여부
  const [startDate, setStartDate] = useState<string>(
    isRoutineEdit ? (editingItem?.startDate ? String(editingItem.startDate).slice(0, 10) : '') : fromRoutines ? getTodayStr() : globalDate
  );
  const [useTime, setUseTime] = useState<boolean>(isRoutineEdit ? !!editingItem?.routineTime : false);
  // 알림: 끄기 / 몇 분 전 (0 = 시작 시간)
  const hasAlarm = editingItem?.notifyBefore !== null && editingItem?.notifyBefore !== undefined;
  const [alarmOn, setAlarmOn] = useState<boolean>(hasAlarm);
  const [alarmMin, setAlarmMin] = useState<number>(hasAlarm ? Number(editingItem.notifyBefore) : 0);

  const isRoutine = isRoutineEdit || (!isEdit && type === 'routine');
  const timeOn = !isRoutine || useTime; // 할 일은 항상 시간이 있다
  const toggleDay = (d: string) =>
    setRepeatDays(prev => sortDays(prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]));

  const handleSave = async () => {
    if (!title.trim()) return alert('제목을 입력하세요.');
    if (isRoutine && repeatDays.length === 0) return alert('반복할 요일을 하나 이상 선택하세요.');
    if (!isRoutine && !isRealDate(date)) return alert('날짜를 다시 확인해주세요. 달력에 없는 날짜입니다.');
    if (isRoutine && startDate && !isRealDate(startDate)) return alert('시작일을 다시 확인해주세요. 달력에 없는 날짜입니다.');
    if (timeOn && !isRealTime(time)) return alert('시간을 다시 확인해주세요. 존재하지 않는 시간입니다.');

    let notifyBefore: number | null = null;
    if (timeOn && alarmOn) {
      notifyBefore = alarmMin;
      // 알림을 켰는데 브라우저 알림 권한을 아직 안 정했다면 이때 물어본다
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }

    const extra = isRoutine
      ? { startDate: startDate || null, routineTime: useTime ? time : null, notifyBefore }
      : { notifyBefore };

    const saving = isRoutineEdit ? onUpdateRoutine(editingItem, title, memo, repeatDays, category, priority, extra)
      : isEdit ? onUpdateTodo(editingItem.todoId || editingItem.id, title, memo, date, time, priority, extra)
      : onAddTodo(title, memo, date, time, priority, type, repeatDays, category, extra);
    // 루틴 관리로 돌아갈 때는 저장이 끝난 뒤에 돌아가야 목록에 바로 보인다
    if (fromRoutines) await saving;
    goBack();
  };

  const alarmSection = (
    <div className="input-group">
      <label>🔔 알림 설정</label>
      {timeOn && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
          <button className={`chip chip-sm ${!alarmOn ? 'active' : ''}`} onClick={() => setAlarmOn(false)}>알림 없음</button>
          <button className={`chip chip-sm ${alarmOn ? 'active' : ''}`} onClick={() => setAlarmOn(true)}>알림 시간 설정</button>
          {alarmOn && (
            <PickField value={alarmMin} options={ALARM_MINUTES} min={0} max={1440} ariaLabel="알림 시점"
                       format={(m) => formatAlarm(m, isRoutine ? '루틴 시작 시간' : '일정 시작 시간')}
                       onChange={setAlarmMin} style={{ width: '128px' }} />
          )}
        </div>
      )}
    </div>
  );

  const prioritySection = (
    <div className="input-group">
      <label>⭐ 중요도</label>
      <div className="filter-tabs" style={{ marginTop: '6px' }}>
        {['high', 'normal', 'low'].map(p => (
          <button key={p} className={`chip chip-sm ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
            {p === 'high' ? '높음' : p === 'normal' ? '보통' : '낮음'}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={goBack} className="cursor-pointer" color={C.g3} />
        <h3 className="header-title">{isEdit ? (isRoutineEdit ? '루틴 수정' : '할 일 수정') : fromRoutines ? '루틴 추가' : '할 일 / 루틴 추가'}</h3>
        <span className="text-link" onClick={handleSave}>저장</span>
      </div>
      <div className="scroll-content">
        {!isEdit && !fromRoutines && (
          <div style={{ marginBottom: '16px' }}>
            <div className="filter-tabs">
              <button className={`chip ${type === 'todo' ? 'active' : ''}`} onClick={() => setType('todo')}>📌 일반 할 일</button>
              <button className={`chip ${type === 'routine' ? 'active' : ''}`} onClick={() => setType('routine')}>🔄 반복 루틴</button>
            </div>
          </div>
        )}
        <input style={{ fontSize: '18px', fontWeight: '700', width: '100%' }} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="input-group" style={{ marginTop: '12px' }}>
          <label>📝 메모</label>
          <input placeholder="메모 (선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
        {isRoutine ? (
          <>
            <div className="input-group">
              <label>🏷️ 카테고리</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categoryOptions(editingItem?.category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>🔁 반복 요일</label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {DAY_OPTIONS.map(d => (
                  <button key={d.v} className={`chip ${repeatDays.includes(d.v) ? 'active' : ''}`} onClick={() => toggleDay(d.v)}
                    style={{ flex: 1, minWidth: 0, padding: '6px 0', fontSize: '12px', textAlign: 'center' }}>
                    {d.l}
                  </button>
                ))}
              </div>
              <div className="filter-tabs" style={{ marginTop: '8px' }}>
                <button className="chip chip-sm" onClick={() => setRepeatDays(ALL_DAYS)}>매일</button>
                <button className="chip chip-sm" onClick={() => setRepeatDays(ALL_DAYS.slice(0, 5))}>평일</button>
                <button className="chip chip-sm" onClick={() => setRepeatDays(ALL_DAYS.slice(5))}>주말</button>
              </div>
            </div>

            <div className="input-group">
              <label>📅 시작일</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              {!startDate && <p className="field-hint">비워두면 처음부터 있던 루틴으로 계산돼요.</p>}
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label>🕒 시간 지정</label>
                <Toggle small on={useTime} onClick={() => setUseTime(v => !v)} label="루틴 시간 지정" />
              </div>
              {useTime
                ? <div style={{ marginTop: '10px' }}><TimeSelect value={time} onChange={setTime} /></div>
                : <p className="field-hint">시간을 정하면 알림을 받을 수 있어요.</p>}
            </div>

            {useTime && alarmSection}
            {prioritySection}
          </>
        ) : (
          <>
            <div className="input-group"><label>📅 날짜 지정</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>

            <div className="input-group">
              <label>🕒 시간 지정</label>
              <div style={{ marginTop: '6px' }}><TimeSelect value={time} onChange={setTime} /></div>
            </div>

            {alarmSection}
            {prioritySection}
          </>
        )}
      </div>
    </div>
  );
}
