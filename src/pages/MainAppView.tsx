import { useState } from 'react';
import { ArrowUpDown, BarChart2, Bell, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, ClipboardList, Flag, Menu, Pencil, Plus, Trash2, X } from 'lucide-react';
import { CheerFooter } from '../components/CheerFooter';
import { GoalTab } from './main/GoalTab';
import { StatsTab } from './main/StatsTab';
import { C, NAVY_SCOPE } from '../constants/colors';
import { DOW_KEYS, WEEKDAY_KO } from '../constants/days';
import { FAIL_REASONS } from '../constants/goals';
import { getTodayStr, toDateStr } from '../utils/date';
import { groupDoneRecords, isScheduledOn } from '../utils/stats';

export function MainAppView({ 
  setView, activeTab, setActiveTab, todos, todoFilter, setTodoFilter, 
  goals, goalFilter, setGoalFilter, statsPeriod, setStatsPeriod, 
  setSelectedGoalId, selectedGoalId, setResultType, setShowGoalResult, 
  showGoalResult, resultType, backendRoutines, 
  onToggleBackendRoutine, onUpdateGoalStatus, onDeleteTodo, onDeleteGoal, onDeleteRoutine, onToggleTodo,
  globalDate, setGlobalDate,
  onOpenNoti, onOpenMenu,
  onEditTodo, onEditRoutine, onEditGoal,
  statsRecords = [], allRoutines = [], calMonthData = null
}: any) {
  
  const [failReasons, setFailReasons] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');
  // 실패 원인 문구를 고를 때 쓰는 값 (통계를 볼 때마다 바뀌지 않게 한 번만 정함)
  // 조언 문구용 무작위 숫자 2개: [0] 동점인 원인 중 하나 고르기, [1] 그 원인의 문장 중 하나 고르기
  const [failMsgSeed, setFailMsgSeed] = useState<number[]>(() => [Math.random(), Math.random()]);
  // 달력에서 날짜를 더블클릭하면 열리는 '그 날짜의 미션' 페이지 (하단 탭은 달력 그대로)
  const [dayPageOpen, setDayPageOpen] = useState(false);
  // 달력 상단의 연도·월 선택 창
  const [pickerOpen, setPickerOpen] = useState<'year' | 'month' | null>(null);
  // 통계에서 보고 있는 지난 연도 (null이면 올해)
  const [statsYear, setStatsYear] = useState<number | null>(null);
  // 목표 탭의 새해 안내를 닫은 연도 (이 기기에 기억)
  const [bannerClosedYear, setBannerClosedYear] = useState<string | null>(() => {
    try { return localStorage.getItem('goalYearBannerClosed'); } catch { return null; }
  });

  // 오늘의 미션 탭은 언제나 오늘 날짜만 보여준다
  const goTab = (tab: string) => {
    setDayPageOpen(false);
    setPickerOpen(null);
    if (tab === 'todo') setGlobalDate(getTodayStr());
    if (tab === 'stats') { setFailMsgSeed([Math.random(), Math.random()]); setStatsYear(null); }
    setActiveTab(tab);
  };

  const targetDateObj = new Date(globalDate || getTodayStr());
  const calYear = targetDateObj.getFullYear();
  const calMonth = targetDateObj.getMonth() + 1;
  const selectedCalendarDay = targetDateObj.getDate();

  const handlePrevMonth = () => {
    const prev = new Date(calYear, calMonth - 2, 1);
    setGlobalDate(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-01`);
  };
  const handleNextMonth = () => {
    const next = new Date(calYear, calMonth, 1);
    setGlobalDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`);
  };

  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth - 1, 1).getDay();

  const isItemDone = (t: any) => t.isCompleted === true || t.completed === true || t.done === true;

  // 달력: 그 달의 날짜별 달성률 (할 일 + 그 날 해야 했던 루틴, 오늘까지만)
  const calRates: Record<string, number> = (() => {
    const out: Record<string, number> = {};
    const d0 = calMonthData || {};
    if (!d0.key) return out;
    const todayKey = getTodayStr();
    const doneByDate = groupDoneRecords(d0.records || []);
    const todosByDate: Record<string, any[]> = {};
    (d0.todos || []).forEach((t: any) => { const k = String(t.todoDate).slice(0, 10); (todosByDate[k] = todosByDate[k] || []).push(t); });
    const [yy, mm] = String(d0.key).split('-').map(Number);
    const last = new Date(yy, mm, 0).getDate();
    for (let i = 1; i <= last; i++) {
      const dt = new Date(yy, mm - 1, i);
      const k = toDateStr(dt);
      if (k > todayKey) break;
      const dow = DOW_KEYS[dt.getDay()];
      const expected = new Set<any>((d0.routines || []).filter((r: any) => isScheduledOn(r, k, dow)).map((r: any) => r.routineId));
      const done = new Set<any>((doneByDate[k] || []).map((r: any) => r.routineId));
      done.forEach(id => expected.add(id));
      const dayTodos = todosByDate[k] || [];
      const total = expected.size + dayTodos.length;
      if (total === 0) continue;
      out[k] = Math.round(((done.size + dayTodos.filter((t: any) => isItemDone(t)).length) / total) * 100);
    }
    return out;
  })();
  // 달성률 색: 40% 미만 2보라, 40~70% 미만 4보라, 70% 이상 6보라 (달력 점과 아래 달성률 숫자에 같이 씀)
  const rateDotColor = (r: number) => (r < 40 ? 'var(--p2)' : r < 70 ? 'var(--p4)' : 'var(--p6)');

  // 중요도 순서: 높음 > 보통 > 낮음
  const PRIORITY_RANK: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sortItems = (list: any[]) => {
    const copy = [...list];
    if (sortBy === 'priority') {
      copy.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1));
    } else {
      // 시간 순 (시간이 없는 항목은 뒤로)
      copy.sort((a, b) => {
        const at = a.todoTime || a.routineTime, bt = b.todoTime || b.routineTime;
        const ta = at ? String(at).slice(0, 5) : '99:99';
        const tb = bt ? String(bt).slice(0, 5) : '99:99';
        return ta.localeCompare(tb);
      });
    }
    return copy;
  };

  const filteredTodos = sortItems(
    (todos || []).filter((t: any) => (todoFilter === 'done' ? isItemDone(t) : todoFilter === 'undone' ? !isItemDone(t) : true))
  );
  const filteredRoutines = sortItems(
    (backendRoutines || []).filter((r: any) => (todoFilter === 'done' ? r.isCompleted === true : todoFilter === 'undone' ? r.isCompleted !== true : true))
  );

  // 나의 목표 달성률: 올해 목표 중 결과가 나온 것(성공+실패) 가운데 성공한 비율 (통계의 목표 달성률과 같은 계산)

  const renderItemRow = (t: any) => {
    const id = t.todoId || t.id || t.todo_id;
    const isDone = t.isCompleted === true || t.completed === true || t.done === true;
    let priorityText = '보통';
    let priorityClass = 'badge-medium';
    if (t.priority === 'HIGH') { priorityText = '높음'; priorityClass = 'badge-high'; }
    if (t.priority === 'LOW') { priorityText = '낮음'; priorityClass = 'badge-low'; }

    return (
      <div key={`todo-${id}`} className="list-item">
        <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }} onClick={() => onToggleTodo(id)}>
          {isDone ?
            <CheckCircle2 size={22} color={C.p3} style={{ marginRight: 12, flexShrink: 0 }} /> :
            <Circle size={22} color={C.line} style={{ marginRight: 12, flexShrink: 0 }} />
          }
          {/* 시간·중요도는 제목 위에 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {t.todoTime && (
                <span className="item-meta">{String(t.todoTime).slice(0, 5)}</span>
              )}
              <span className={`priority-badge ${priorityClass}`} style={t.todoTime ? undefined : { marginLeft: 0 }}>{priorityText}</span>
            </div>
            <span className="item-title" style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--g1)' : 'var(--g4)' }}>
              {t.title}
            </span>
          </div>
        </div>
        <Pencil size={18} className="cursor-pointer" color={C.g1} style={{ marginRight: 12 }} onClick={(e) => { e.stopPropagation(); onEditTodo(t); }} />
        <Trash2 size={18} className="cursor-pointer" color={C.g1} onClick={(e) => {
          e.stopPropagation();
          if (confirm('이 일정을 삭제하시겠습니까?')) onDeleteTodo(id);
        }} />
      </div>
    );
  };

  // 달력에서 날짜를 한 번 눌렀을 때 보이는 간략한 목록 (보기 전용)
  const renderCompactDayList = () => {
    const todoList = sortItems(todos || []);
    const routineList = sortItems(backendRoutines || []);
    const row = (key: string, title: string, time: any, done: boolean) => (
      <div key={key} className="mini-item">
        <span className="mini-check">{done && <Check size={12} strokeWidth={2.6} />}</span>
        <span className={`mini-title ${done ? 'done' : ''}`}>{title}</span>
        {time && <span className="mini-time">{String(time).slice(0, 5)}</span>}
      </div>
    );
    return (
      <div className="mini-list" onClick={() => setDayPageOpen(true)} title="눌러서 이 날의 미션 열기">
        <div className="mini-head">📌 일반 할 일 {todoList.length}</div>
        {todoList.length === 0
          ? <div className="mini-empty">할 일이 없어요</div>
          : todoList.map((t: any) => row(`t-${t.todoId || t.id}`, t.title, t.todoTime, isItemDone(t)))}
        <div className="mini-head" style={{ marginTop: '14px' }}>🔄 반복 루틴 {routineList.length}</div>
        {routineList.length === 0
          ? <div className="mini-empty">루틴이 없어요</div>
          : routineList.map((r: any) => row(`r-${r.routineId || r.id}`, r.title, r.routineTime, r.isCompleted === true))}
      </div>
    );
  };

  // 할 일 탭과 달력의 날짜 페이지에서 똑같이 쓰는 미션 목록 (일반 할 일 + 반복 루틴)
  // 전체/미완료/완료 선택과 정렬은 두 화면이 같이 쓴다
  const renderMissionLists = (ignoreFilter = false) => {
  const todoList = ignoreFilter ? sortItems(todos || []) : filteredTodos;
  const routineList = ignoreFilter ? sortItems(backendRoutines || []) : filteredRoutines;
  const doneMode = !ignoreFilter && todoFilter === 'done';
  const undoneMode = !ignoreFilter && todoFilter === 'undone';
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 12px 4px', fontSize: '14px', fontWeight: '700', color: 'var(--g3)' }}>
        <span style={{ color: 'var(--red)', marginRight: '6px' }}>📌</span> 일반 할 일 ({todoList.length}개)
      </div>
      {todoList.length === 0 ? (
        <p style={{ color: 'var(--g1)', textAlign: 'center', fontSize: '13px', padding: '20px 0' }}>
          {doneMode ? '완료된 할 일이 없습니다.' : undoneMode ? '남은 할 일이 없습니다.' : '할 일이 없습니다.'}
        </p>
      ) : todoList.map(renderItemRow)}

      <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0 12px 4px', fontSize: '14px', fontWeight: '700', color: 'var(--g3)' }}>
        <span style={{ marginRight: '6px' }}>🔄</span> 반복 루틴 ({routineList.length}개)
      </div>
      {routineList.length === 0 ? (
        <div style={{ fontSize: '13px', color: 'var(--g1)', textAlign: 'center', padding: '24px 0', borderRadius: '16px', border: '1px dashed var(--p15)' }}>
          {doneMode ? '완료된 루틴이 없습니다.' : undoneMode ? '남은 루틴이 없습니다.' : '루틴 기록이 비어있습니다.'}
        </div>
      ) : routineList.map((r: any) => {
        const id = r.routineId || r.id;
        const title = r.title || '알 수 없는 루틴';
        const isDone = r.isCompleted === true;

        let pText = ''; let pClass = '';
        if (r.priority === 'HIGH') { pText = '높음'; pClass = 'badge-high'; }
        if (r.priority === 'MEDIUM') { pText = '보통'; pClass = 'badge-medium'; }
        if (r.priority === 'LOW') { pText = '낮음'; pClass = 'badge-low'; }

        return (
          <div key={`routine-${id}`} className="list-item">
            <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }} onClick={() => onToggleBackendRoutine(id)}>
              {isDone ?
                <CheckCircle2 size={22} color={C.p3} style={{ marginRight: 12, flexShrink: 0 }} /> :
                <Circle size={22} color={C.line} style={{ marginRight: 12, flexShrink: 0 }} />
              }
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                {(r.routineTime || pText || r.category) && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {r.routineTime && <span className="item-meta">{String(r.routineTime).slice(0, 5)}</span>}
                    {r.category && <span className="item-meta">{r.category}</span>}
                    {pText && <span className={`priority-badge ${pClass}`}>{pText}</span>}
                  </div>
                )}
                <span className="item-title" style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--g1)' : 'var(--g4)' }}>{title}</span>
              </div>
            </div>
            <Pencil size={18} className="cursor-pointer" color={C.g1} style={{ marginRight: 12 }} onClick={(e) => { e.stopPropagation(); onEditRoutine(r); }} />
            <Trash2 size={18} className="cursor-pointer" color={C.g1} onClick={(e) => {
              e.stopPropagation();
              if (confirm(`이 루틴을 삭제할까요?\n\n${calMonth}/${selectedCalendarDay}부터 달력에서 사라지고, 지난 기록은 통계에 남아요.\n(이 날 이미 완료했다면 다음 날부터 사라져요)`)) onDeleteRoutine(id);
            }} />
          </div>
        );
      })}

      {/* 추가 버튼이 마지막 루틴의 수정·삭제 버튼을 가리지 않도록 넉넉히 비워둔다 */}
      <CheerFooter />
    </>
  );
  };

  // 전체/완료 필터 + 시간 순·중요도 순 정렬
  const renderFilterBar = () => (
    <div className="filter-tabs" style={{ marginBottom: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className={`chip ${todoFilter === 'all' ? 'active' : ''}`} onClick={() => setTodoFilter('all')}>전체</button>
        <button className={`chip ${todoFilter === 'undone' ? 'active' : ''}`} onClick={() => setTodoFilter('undone')}>미완료</button>
        <button className={`chip ${todoFilter === 'done' ? 'active' : ''}`} onClick={() => setTodoFilter('done')}>완료</button>
      </div>
      <button
        className="chip"
        title="정렬 기준 바꾸기"
        style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
        onClick={() => setSortBy(sortBy === 'time' ? 'priority' : 'time')}
      >
        <ArrowUpDown size={13} /> {sortBy === 'time' ? '시간 순' : '중요도 순'}
      </button>
    </div>
  );

  // 선택한 날짜(globalDate)의 미션 달성도
  const missionProgress = () => {
    const total = (todos || []).length + (backendRoutines || []).length;
    const done = (todos || []).filter((t: any) => isItemDone(t)).length
      + (backendRoutines || []).filter((r: any) => r.isCompleted === true).length;
    return { total, remain: total - done, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  // 다음 미션: 지금 고른 정렬(시간순·중요도순)대로 보이는 목록에서 안 끝낸 것 중 맨 위 (일반 할 일 -> 반복 루틴)
  const nextMission = () => {
    const t = sortItems(todos || []).find((x: any) => !isItemDone(x));
    if (t) return { title: t.title, time: t.todoTime ? String(t.todoTime).slice(0, 5) : '' };
    const r = sortItems(backendRoutines || []).find((x: any) => x.isCompleted !== true);
    if (r) return { title: r.title, time: r.routineTime ? String(r.routineTime).slice(0, 5) : '' };
    return null;
  };

  const renderProgressCard = (label: string, showNext = true) => {
    const p = missionProgress();
    const todoDone = (todos || []).filter((t: any) => isItemDone(t)).length;
    const routineDone = (backendRoutines || []).filter((r: any) => r.isCompleted === true).length;
    const next = nextMission();
    return (
      <div className="rate-card mission">
        <div className="rate-row">
          <div className="rate-ring" style={{ background: `conic-gradient(var(--p5) 0 ${p.rate}%, var(--p2) ${p.rate}% 100%)` }}><b>{p.rate}%</b></div>
          <div>
            <div className="rate-label">{label}</div>
            <div className="rate-counts">할 일 {todoDone}/{(todos || []).length} · 루틴 {routineDone}/{(backendRoutines || []).length} · 남은 미션 {p.remain}개</div>
          </div>
        </div>
        {showNext && <div className="rate-next">
          <span style={{ minWidth: 0 }}>
            <span className="rate-next-label">다음 미션</span>
            <span className="rate-next-title">{next ? next.title : p.total > 0 ? '오늘의 미션을 모두 끝냈어요!' : '아직 미션이 없어요'}</span>
          </span>
          {next && next.time && <span className="rate-next-chip">{next.time}</span>}
        </div>}
      </div>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'todo':
        return (
          <>
            <div className="header-row">
              <Menu size={22} className="cursor-pointer" color={C.g3} onClick={onOpenMenu} />
              <h3 className="header-title">오늘의 미션 <span style={{fontSize:'13px', color:'var(--p5)', marginLeft:'8px', lineHeight: 1}}>{calMonth}/{selectedCalendarDay} {WEEKDAY_KO[targetDateObj.getDay()]}</span></h3>
              <Bell size={22} className="cursor-pointer" color={C.g3} onClick={onOpenNoti} />
            </div>
            {renderFilterBar()}
            <div className="scroll-content">
              {renderProgressCard('오늘의 미션 종합 달성도')}

              {renderMissionLists()}
            </div>
            <div className="fab" onClick={() => setView('todo-add')}><Plus /></div>
          </>
        );

      case 'calendar':
        const todayObj = new Date();
        const isTodayInView = todayObj.getFullYear() === calYear && todayObj.getMonth() + 1 === calMonth;
        const todayDayNum = todayObj.getDate();

        // 달력에서 날짜를 더블클릭해서 들어온 '그 날짜의 미션' 페이지
        if (dayPageOpen) {
          return (
            <>
              <div className="header-row">
                <ChevronLeft size={22} className="cursor-pointer" color={C.g3} onClick={() => setDayPageOpen(false)} />
                <h3 className="header-title">
                  {calMonth}/{selectedCalendarDay} ({WEEKDAY_KO[targetDateObj.getDay()]}) 미션
                </h3>
                <Bell size={22} className="cursor-pointer" color={C.g3} onClick={onOpenNoti} />
              </div>
              {renderFilterBar()}
              <div className="scroll-content">
                {renderProgressCard('미션 종합 달성도', false)}
                {renderMissionLists()}
              </div>
              <div className="fab" onClick={() => setView('todo-add')}><Plus /></div>
            </>
          );
        }

        // 연도·월 바로가기 목록
        const YEAR_CHOICES = Array.from({ length: 11 }, (_, i) => todayObj.getFullYear() - 5 + i);
        const MONTH_CHOICES = Array.from({ length: 12 }, (_, i) => i + 1);
        const jumpTo = (y: number, m: number) => {
          const lastDay = new Date(y, m, 0).getDate();
          const d = Math.min(selectedCalendarDay, lastDay);
          setGlobalDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
          setPickerOpen(null);
        };

        return (
          <>
            <div className="header-row"><Menu size={22} className="cursor-pointer" color={C.g3} onClick={onOpenMenu} /><h3 className="header-title">달력</h3><Bell size={22} color={C.g3} onClick={onOpenNoti} /></div>
            <div className="scroll-content">
              <div style={{ background: 'var(--p1)', borderRadius: '24px', padding: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <button className="cal-nav-btn" aria-label="이전 달" onClick={() => { setPickerOpen(null); handlePrevMonth(); }}><ChevronLeft size={18} /></button>
                  {/* 연도와 월을 눌러 바로 이동 */}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', gap: '6px', color: 'var(--ctl)' }}>
                    <span className="date-picker-btn" onClick={() => setPickerOpen(pickerOpen === 'year' ? null : 'year')}>{calYear}년</span>
                    <span className="date-picker-btn" onClick={() => setPickerOpen(pickerOpen === 'month' ? null : 'month')}>{calMonth}월</span>
                  </h4>
                  <button className="cal-nav-btn" aria-label="다음 달" onClick={() => { setPickerOpen(null); handleNextMonth(); }}><ChevronRight size={18} /></button>
                </div>

                {pickerOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setPickerOpen(null)} />
                    <div className="date-picker-pop">
                      {(pickerOpen === 'year' ? YEAR_CHOICES : MONTH_CHOICES).map(v => {
                        const active = pickerOpen === 'year' ? v === calYear : v === calMonth;
                        return (
                          <button key={v} className={`chip ${active ? 'active' : ''}`} style={{ padding: '8px 0', fontSize: '13px' }}
                                  onClick={() => pickerOpen === 'year' ? jumpTo(v, calMonth) : jumpTo(calYear, v)}>
                            {pickerOpen === 'year' ? v : `${v}월`}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="calendar-grid">
                  {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="calendar-day-header">{d}</div>)}
                  {Array(firstDayIndex).fill(null).map((_, i) => <div key={`e-${i}`} className="calendar-cell empty"></div>)}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const dayNum = i + 1;
                    const isToday = isTodayInView && dayNum === todayDayNum;
                    const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const dayRate = calRates[dateStr];
                    const isSel = dayNum === selectedCalendarDay;
                    return (
                      <div key={dayNum} className={`calendar-cell ${dayNum === selectedCalendarDay ? 'active' : ''}`}
                           title="더블클릭하면 이 날의 미션이 열려요"
                           style={isToday ? {
                             border: '2px solid var(--p5)',
                             flexDirection: 'column',
                             gap: '3px',
                             lineHeight: 1,
                           } : { flexDirection: 'column', lineHeight: 1 }}
                           onClick={() => setGlobalDate(dateStr)}
                           onDoubleClick={() => { setGlobalDate(dateStr); setDayPageOpen(true); }}>
                        {dayNum}
                        {/* 오늘 날짜 표시 */}
                        {isToday && (
                          <span style={{ fontSize: '8px', fontWeight: '700', color: dayNum === selectedCalendarDay ? '#fff' : 'var(--p5)' }}>오늘</span>
                        )}
                        {/* 그 날의 달성률 점: 40% 미만 2보라, 40~70% 미만 4보라, 70% 이상 6보라 */}
                        {!isToday && dayRate !== undefined && (
                          <span className="cal-dot" style={{ background: isSel ? '#ffffff' : rateDotColor(dayRate) }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="cal-legend">
                  <span>달성률 0%</span>
                  {['var(--p2)', 'var(--p4)', 'var(--p6)'].map(c => <i key={c} style={{ background: c }} />)}
                  <span>100%</span>
                </div>
              </div>
              <div style={{ marginTop: '20px', fontWeight: '700', fontSize: '15px', color: 'var(--p5)' }}>
                {calMonth}월 {selectedCalendarDay}일 미션
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: '500', color: 'var(--g3)' }}>
                종합 미션 달성률 <b style={{ color: rateDotColor(missionProgress().rate) }}>{missionProgress().rate}%</b>
              </div>
              {/* 날짜를 한 번 누르면 그 날의 미션을 간략하게 보여주고, 이 칸을 누르거나 날짜를 더블클릭하면 그 날의 미션 페이지가 열린다 */}
              {renderCompactDayList()}
            </div>
          </>
        );

      case 'goal':
        return <GoalTab bannerClosedYear={bannerClosedYear} goTab={goTab} goalFilter={goalFilter} goals={goals} onDeleteGoal={onDeleteGoal} onEditGoal={onEditGoal} onOpenMenu={onOpenMenu} onOpenNoti={onOpenNoti} setBannerClosedYear={setBannerClosedYear} setFailReasons={setFailReasons} setGoalFilter={setGoalFilter} setResultType={setResultType} setSelectedGoalId={setSelectedGoalId} setShowGoalResult={setShowGoalResult} setStatsPeriod={setStatsPeriod} setStatsYear={setStatsYear} setView={setView} />;

      case 'stats':
        return <StatsTab allRoutines={allRoutines} failMsgSeed={failMsgSeed} goals={goals} onOpenMenu={onOpenMenu} onOpenNoti={onOpenNoti} setStatsPeriod={setStatsPeriod} setStatsYear={setStatsYear} statsPeriod={statsPeriod} statsRecords={statsRecords} statsYear={statsYear} />;
    }
  };

  return (
    <div className="card" style={{ paddingBottom: '80px' }}>
      {/* 탭마다 화면 구조가 달라서, key를 주어 탭이 바뀔 때 이전 탭의 요소가 남지 않도록 함 */}
      <div key={activeTab} style={{ display: 'contents', ...(activeTab === 'goal' ? NAVY_SCOPE : {}) }}>{renderTabContent()}</div>

      <div className="bottom-nav" style={{ justifyContent: 'space-around' }}>
        <div className={`nav-item ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => goTab('todo')}><ClipboardList size={22} /><span>오늘의 미션</span></div>
        <div className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => goTab('calendar')}><Calendar size={22} /><span>달력</span></div>
        <div className={`nav-item ${activeTab === 'goal' ? 'active' : ''}`} onClick={() => goTab('goal')}><Flag size={22} /><span>목표</span></div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => goTab('stats')}><BarChart2 size={22} /><span>통계</span></div>
      </div>

      {showGoalResult && (
        <div className="bottom-sheet-overlay" style={NAVY_SCOPE} onClick={() => setShowGoalResult(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--g4)' }}>결과 상태 업데이트</h3>
            <div className="result-toggle-group">
              <button className={`result-btn success ${resultType === 'success' ? 'active' : ''}`} onClick={() => setResultType('success')}><Check size={16} /> 성공</button>
              <button className={`result-btn fail ${resultType === 'fail' ? 'active' : ''}`} onClick={() => setResultType('fail')}><X size={16} /> 실패</button>
            </div>

            {resultType === 'fail' && (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--g3)', display: 'block', marginBottom: '8px' }}>실패 사유 (다중 선택 가능)</label>
                {/* 한 줄에 3개씩 */}
                <div className="fail-reason-grid">
                  {FAIL_REASONS.map((reason) => (
                    <button 
                      key={reason} 
                      className={`chip ${failReasons.includes(reason) ? 'active' : ''}`} 
                      onClick={() => {
                        setFailReasons(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]);
                      }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="primary-button" style={{ marginTop: '20px' }} onClick={() => {
  if (!resultType) return alert('성공 또는 실패를 선택해주세요.');
  if (resultType === 'fail' && failReasons.length === 0) return alert('실패 사유를 하나 이상 선택해주세요.');
  if (selectedGoalId === null || selectedGoalId === undefined) {
    alert('목표 번호를 찾지 못했습니다. 화면을 새로고침한 뒤 다시 시도해주세요.');
    return;
  }
  const reasonString = resultType === 'fail' ? failReasons.join(',') : '';
  onUpdateGoalStatus(selectedGoalId, resultType === 'success' ? '성공' : '실패', resultType === 'success' ? 100 : 0, reasonString);
  setShowGoalResult(false);
}}>변동 사항 반영 저장</button>
          </div>
        </div>
      )}
    </div>
  );
}
