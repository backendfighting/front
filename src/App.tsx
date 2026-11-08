import { useEffect, useRef, useState } from 'react';
import { Bell, Lock, LogOut, RotateCcw, Trash2, User } from 'lucide-react';
import { BASE_URL, authHeaders, readError, toServerPriority } from './api/client';
import { C } from './constants/colors';
import { ALL_DAYS, sortDays } from './constants/days';
import { ErrorView } from './pages/ErrorView';
import { GoalAddView } from './pages/GoalAddView';
import { LoginView } from './pages/LoginView';
import { MainAppView } from './pages/MainAppView';
import { NotiSettingsView } from './pages/NotiSettingsView';
import { NotiView } from './pages/NotiView';
import { PasswordView } from './pages/PasswordView';
import { ProfileView } from './pages/ProfileView';
import { RegisterView } from './pages/RegisterView';
import { RoutineManageView } from './pages/RoutineManageView';
import { TodoAddView } from './pages/TodoAddView';
import { WithdrawView } from './pages/WithdrawView';
import { getTodayStr, toDateStr } from './utils/date';
import { ensureGoalAlarmOn, formatNotiTime, getNotified, showDeviceNotification, toServerNoti } from './utils/notifications';
import { statsRanges, statsYearsOf } from './utils/stats';
import './App.css';

// 새로고침해도 돌아올 수 있는 화면들 (추가/수정 화면은 입력 중이던 내용이 없으므로 제외)
const RESTORABLE_VIEWS = ['main', 'profile', 'password', 'routines', 'noti', 'noti-settings'];

const TABS = ['todo', 'calendar', 'goal', 'stats'];

function App() {
  // 토큰이 남아 있으면 로그인 상태를 유지하고, 보고 있던 화면으로 복원
  const [view, setView] = useState<string>(() => {
    if (!localStorage.getItem('token')) return 'login';
    const saved = localStorage.getItem('lastView') || '';
    return RESTORABLE_VIEWS.includes(saved) ? saved : 'main';
  });
    const [editingItem, setEditingItem] = useState<any>(null);
  const [editingKind, setEditingKind] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  // 할 일/루틴 추가·수정 화면을 닫으면 돌아갈 곳 (메인 또는 루틴 관리)
  const [addFrom, setAddFrom] = useState<string>('main');

  useEffect(() => {
    if (view === 'main' || view === 'routines') { setEditingItem(null); setEditingKind(null); setEditingGoal(null); }
    if (view === 'main') setAddFrom('main');
  }, [view]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('lastTab') || '';
    return TABS.includes(saved) ? saved : 'todo';
  });

  // 현재 화면·탭을 기억해 두었다가 새로고침 시 복원
  useEffect(() => {
    if (RESTORABLE_VIEWS.includes(view)) localStorage.setItem('lastView', view);
  }, [view]);
  useEffect(() => { localStorage.setItem('lastTab', activeTab); }, [activeTab]);
  const [globalDate, setGlobalDate] = useState<string>(getTodayStr());
  
  // 🌟 안전장치 초기값 적용
  const [todos, setTodos] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [backendRoutines, setBackendRoutines] = useState<any[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  // 알림 설정 화면에서 뒤로가기를 눌렀을 때 돌아갈 곳
  const [notiSettingsBack, setNotiSettingsBack] = useState<string>('main');
  // 이미 확인한 서버 알림 id (처음 불러올 때는 null)
  const serverSeenRef = useRef<Set<string> | null>(null);
  // 처리 중인 루틴 체크 요청 (빠른 연속 클릭으로 중복 요청이 가지 않게 막음)
  const routineTogglingRef = useRef<Set<number>>(new Set());
  // 통계용 데이터 (최근 3개월 루틴 기록 + 내 루틴 전체)
  const [statsRecords, setStatsRecords] = useState<any[]>([]);
  const [allRoutines, setAllRoutines] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<{name: string, email: string}>({ name: '사용자', email: '이메일 없음' });

  const [notiFilter, setNotiFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<any[]>([]);

  // 🌟 1. 프로필 안전 조회
    const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/users/me`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          name: data?.name || data?.nickname || '사용자',
          email: data?.email || '이메일 없음'
        });
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        resetNotificationState();
        setView('login');
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
      }
    } catch (e) {
      console.error("프로필 로딩 실패", e);
    }
  };

  // 🌟 2. 할 일 안전 조회 (배열 검증)
  const fetchTodos = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/todos?date=${globalDate}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(Array.isArray(data) ? data : []); // 배열 형태가 아니면 빈 배열 강제 할당
      }
    } catch (e) { console.error("할일 로딩 실패", e); }
  };

  // 🌟 3. 목표 안전 조회 (배열 검증)
  const fetchGoals = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/goals`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(Array.isArray(data) ? data.map((g: any) => ({ ...g, id: g.id ?? g.goalId ?? g.goal_id, desc: g.desc ?? g.description ?? '' })) : []);
      }
    } catch (e) { console.error("목표 로딩 실패", e); }
  };

  // 🌟 4. 루틴 안전 조회 (배열 검증)
  const fetchBackendRoutines = async () => {
    const token = localStorage.getItem('token');
    try {
      const routineRes = await fetch(`${BASE_URL}/api/routines/list?date=${globalDate}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      
      let routines: any[] = [];
      if (routineRes.ok) {
        const rData = await routineRes.json();
        if (Array.isArray(rData)) routines = rData;
      }

      const recordRes = await fetch(`${BASE_URL}/api/records?date=${globalDate}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      
      let records: any[] = [];
      if (recordRes.ok) {
        const recData = await recordRes.json();
        if (Array.isArray(recData)) records = recData;
      }

      const mergedRoutines = routines.map((routine: any) => {
        const rId = routine?.routineId || routine?.id || routine?.routine_id;
        const matchedRecord = records.find((rec: any) => {
            const recRId = rec?.routineId || rec?.routine?.routineId || rec?.routine?.id || rec?.routine_id;
            return recRId === rId;
        });
        
        let isDone = false;
        if (matchedRecord) {
            isDone = matchedRecord.completed === true || matchedRecord.isCompleted === true || matchedRecord.isCompleted === 'true';
        }
        
        return {
          ...routine,
          routineId: rId,
          isCompleted: isDone,
        };
      });

      setBackendRoutines(mergedRoutines);
    } catch (e) { console.error("루틴 로딩 실패", e); }
  };

  const handleToggleTodo = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/todos/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) fetchTodos();
    } catch (e) { console.error(e); }
  };

  const handleToggleBackendRoutine = async (routineId: number) => {
    if (!routineId || routineTogglingRef.current.has(routineId)) return;
    routineTogglingRef.current.add(routineId);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/records/toggle?routineId=${routineId}&date=${globalDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) await fetchBackendRoutines();
    } catch (e) { console.error(e); }
    finally { routineTogglingRef.current.delete(routineId); }
  };

  // date: 이 날짜부터 달력에서 사라짐 (그 날 이미 완료했으면 다음 날부터). 기본은 지금 보고 있는 날짜
  const handleDeleteRoutine = async (routineId: number, date?: string) => {
    try {
      const base = date || globalDate || getTodayStr();
      const response = await fetch(`${BASE_URL}/api/routines/${routineId}?date=${base}`, { method: 'DELETE', headers: authHeaders() });
      if (response.ok) {
        fetchBackendRoutines();
      } else {
        alert(`루틴 삭제에 실패했습니다.\n\n${await readError(response)}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTodo = async (title: string, memo: string, date: string, time: string, priority: string, type: string, repeatDays: string[] = [], category: string = '기타', extra: any = {}) => {
    try {
      if (type === 'routine') {
        const payload = {
          title, description: memo, category,
          repeatDays: repeatDays.length ? sortDays(repeatDays) : ALL_DAYS,
          startDate: extra.startDate || null,
          routineTime: extra.routineTime ? `${extra.routineTime}:00` : null,
          priority: toServerPriority(priority),
          notifyBefore: extra.notifyBefore ?? null,
        };
        const response = await fetch(`${BASE_URL}/api/routines`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
        if (response.ok) { fetchBackendRoutines(); }
        else alert(`루틴 추가에 실패했습니다.\n\n${await readError(response)}`);
      } else {
        const todoPayload = {
          title, description: memo, todoDate: date, todoTime: time + ':00',
          priority: toServerPriority(priority),
          notifyBefore: extra.notifyBefore ?? null,
        };
        const response = await fetch(`${BASE_URL}/api/todos`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(todoPayload) });
        if (response.ok) { fetchTodos(); }
        else alert(`할 일 추가에 실패했습니다.\n\n${await readError(response)}`);
      }
    } catch (error) { console.error(error); alert('서버와 통신할 수 없습니다.'); }
  };

  const handleDeleteTodo = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/todos/${id}`, { method: 'DELETE', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      if(response.ok) fetchTodos();
    } catch { }
  };

    const handleUpdateGoalStatus = async (id: number, status: string, _progress: number, reason: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/goals/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status, reason })
      });

      if (response.ok) {
        fetchGoals();
      } else {
        alert(`목표 결과 저장에 실패했습니다. (오류 코드 ${response.status})`);
      }
    } catch (error) {
      console.error('서버 통신 에러:', error);
      alert('서버와 통신할 수 없습니다.');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/goals/${id}`, { method: 'DELETE', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      if(response.ok) fetchGoals();
      else setGoals(prev => prev.filter(g => g.id !== id));
    } catch { setGoals(prev => prev.filter(g => g.id !== id)); }
  };

  const handleAddGoal = async (title: string, category: string, desc: string, startDate: string, endDate: string, remindOn: boolean = false) => {
    const token = localStorage.getItem('token');
    try {
      const payload = { title, category, description: desc, startDate, endDate, remindOn };
      const response = await fetch(`${BASE_URL}/api/goals`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify(payload)
      });
      if (response.ok) { fetchGoals(); if (remindOn) ensureGoalAlarmOn(); return true; }
      // 서버가 알려준 실제 원인을 그대로 보여준다
      const msg = await readError(response);
      console.error('목표 추가 실패', response.status, msg, payload);
      alert(`목표 추가에 실패했습니다.\n\n${msg}`);
      return false;
    } catch (e) {
      console.error('목표 추가 통신 실패', e);
      alert('서버와 통신할 수 없습니다. 백엔드가 켜져 있는지 확인해주세요.');
      return false;
    }
  };

    const handleEditTodo = (t: any) => { setEditingItem(t); setEditingKind('todo'); setView('todo-add'); };
  const handleEditRoutine = (r: any) => { setEditingItem(r); setEditingKind('routine'); setView('todo-add'); };
  const handleEditGoal = (g: any) => { setEditingGoal(g); setView('goal-add'); };

  const handleUpdateTodo = async (id: number, title: string, memo: string, date: string, time: string, priority: string, extra: any = {}) => {
    try {
      const response = await fetch(`${BASE_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          title, description: memo, todoDate: date, todoTime: time.length === 5 ? time + ':00' : time,
          priority: toServerPriority(priority),
          notifyBefore: extra.notifyBefore ?? null,
        })
      });
      if (response.ok) { fetchTodos(); }
      else alert(`수정에 실패했습니다. (오류 코드 ${response.status})`);
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  const handleUpdateRoutine = async (r: any, title: string, memo: string, repeatDays: string[] = [], category?: string, priority?: string, extra: any = {}) => {
    const id = r.routineId || r.id;
    try {
      // 시작일·시간·알림은 서버가 보낸 값 그대로 덮어쓰므로 항상 같이 보낸다
      const response = await fetch(`${BASE_URL}/api/routines/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          title, description: memo, category: category || r.category || '기타',
          repeatDays: repeatDays.length ? sortDays(repeatDays) : (r.repeatDays || ALL_DAYS),
          priority: priority ? toServerPriority(priority) : (r.priority || 'MEDIUM'),
          startDate: 'startDate' in extra ? extra.startDate : (r.startDate || null),
          routineTime: 'routineTime' in extra ? (extra.routineTime ? `${extra.routineTime}:00` : null) : (r.routineTime || null),
          notifyBefore: 'notifyBefore' in extra ? extra.notifyBefore : (r.notifyBefore ?? null),
        })
      });
      if (response.ok) { fetchBackendRoutines(); }
      else alert(`수정에 실패했습니다. (오류 코드 ${response.status})`);
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  const handleUpdateGoal = async (g: any, title: string, category: string, desc: string, startDate: string, endDate: string, remindOn: boolean = false) => {
    const token = localStorage.getItem('token');
    const id = g.id ?? g.goalId;
    try {
      // 목표 자체를 수정 (번호 · 성공/실패 결과는 그대로 유지)
      const res = await fetch(`${BASE_URL}/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ title, category, description: desc, startDate, endDate, remindOn })
      });
      if (res.ok) { fetchGoals(); if (remindOn) ensureGoalAlarmOn(); return true; }
      const msg = await readError(res);
      console.error('목표 수정 실패', res.status, msg);
      alert(`목표 수정에 실패했습니다.\n\n${msg}`);
      return false;
    } catch (e) {
      console.error('목표 수정 통신 실패', e);
      alert('서버와 통신할 수 없습니다. 백엔드가 켜져 있는지 확인해주세요.');
      return false;
    }
  };
  // 계정이 바뀌면 이전 계정의 알림 목록을 지우고, 새 계정의 지난 알림이 한꺼번에 뜨지 않게 처음 상태로 되돌린다
  const resetNotificationState = () => {
    serverSeenRef.current = null;
    setNotifications([]);
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('lastView');
      localStorage.removeItem('lastTab');
      resetNotificationState();
      setView('login');
      setIsSidebarOpen(false);
    }
  };

  // 회원 탈퇴가 끝난 뒤: 저장된 로그인 정보를 지우고 로그인 화면으로
  const handleAfterWithdraw = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastView');
    localStorage.removeItem('lastTab');
    resetNotificationState();
    setIsSidebarOpen(false);
    setView('login');
  };


  // 목표·할 일 알림은 알림 설정에 따라 서버가 만들어서 보낸다 (fetchServerNotifications 참고)

const isLoggedInView = view !== 'login' && view !== 'register' && view !== 'error';

// 알림을 누르면 해당 화면(기본: 오늘의 미션)으로 이동
const openFromNotification = (tab: string) => {
  if (!localStorage.getItem('token')) return;
  const target = TABS.includes(tab) ? tab : 'todo';
  setIsSidebarOpen(false);
  if (target === 'todo') setGlobalDate(getTodayStr());
  setActiveTab(target);
  setView('main');
};
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const open = params.get('open');
  if (open) {
    openFromNotification(open);
    window.history.replaceState(null, '', window.location.pathname);
  }
  const onSwMessage = (e: MessageEvent) => {
    if (e.data && e.data.type === 'open-tab') openFromNotification(e.data.tab);
  };
  const onPageNoti = (e: Event) => openFromNotification((e as CustomEvent).detail);
  navigator.serviceWorker?.addEventListener('message', onSwMessage);
  window.addEventListener('open-tab', onPageNoti);
  return () => {
    navigator.serviceWorker?.removeEventListener('message', onSwMessage);
    window.removeEventListener('open-tab', onPageNoti);
  };
}, []);

// 서버에서 만든 알림 (매일 아침 할 일 요약, 마감 1시간 전) 불러오기
const fetchServerNotifications = async () => {
  if (!localStorage.getItem('token')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/notifications`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data)) return;
    const server = data.map(toServerNoti);
    setNotifications((prev: any[]) => [...prev.filter((n: any) => !n.serverId), ...server]);

    // 처음 불러온 알림은 이미 지난 것이므로 띄우지 않고, 그 뒤에 새로 생긴 것만 기기 알림으로 띄운다
    const seen = serverSeenRef.current;
    if (seen === null) {
      serverSeenRef.current = new Set(server.map((n: any) => n.id));
      return;
    }
    const fresh = server.filter((n: any) => n.unread && !seen.has(n.id));
    fresh.forEach((n: any) => seen.add(n.id));
    const notified = getNotified();
    const toShow = fresh.filter((n: any) => !notified.includes(n.id));
    toShow.forEach((n: any) => showDeviceNotification(n.title, n.desc, String(n.type).startsWith('goal') ? 'goal' : 'todo'));
    if (toShow.length) {
      localStorage.setItem('notifiedIds', JSON.stringify([...new Set([...notified, ...toShow.map((n: any) => n.id)])].slice(-100)));
    }
  } catch (e) { console.error('서버 알림 로딩 실패', e); }
};

// 통계 화면에서 쓸 데이터(올해 + 최근 3개월)를 한 번에 받아온다
  // 달력의 날짜별 달성률용: 보고 있는 달의 할 일·루틴 기록·루틴
  const [calMonthData, setCalMonthData] = useState<any>(null);
  const fetchCalendarMonth = async (dateStr: string) => {
    if (!localStorage.getItem('token')) return;
    const [y, m] = dateStr.split('-').map(Number);
    const start = `${y}-${String(m).padStart(2, '0')}-01`;
    const end = toDateStr(new Date(y, m, 0));
    try {
      const [tRes, rRes, routRes] = await Promise.all([
        fetch(`${BASE_URL}/api/todos/range?start=${start}&end=${end}`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/records/range?start=${start}&end=${end}`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/routines`, { headers: authHeaders() }),
      ]);
      const todosM = tRes.ok ? await tRes.json() : [];
      const recs = rRes.ok ? await rRes.json() : [];
      const routs = routRes.ok ? await routRes.json() : [];
      setCalMonthData({ key: `${y}-${String(m).padStart(2, '0')}`, todos: Array.isArray(todosM) ? todosM : [], records: Array.isArray(recs) ? recs : [], routines: Array.isArray(routs) ? routs : [] });
    } catch (e) { console.error('달력 달성률 데이터 로딩 실패', e); }
  };

  const fetchStatsData = async () => {
    if (!localStorage.getItem('token')) return;
    const end = new Date();
    try {
      // 루틴을 먼저 받아서, 연간 그래프에 필요한 해(처음 루틴을 만든 해, 최근 5년까지)부터 기록을 받는다
      const routRes = await fetch(`${BASE_URL}/api/routines`, { headers: authHeaders() });
      let routs: any[] = [];
      if (routRes.ok) {
        const d = await routRes.json();
        if (Array.isArray(d)) { routs = d; setAllRoutines(d); }
      }
      const firstYear = statsYearsOf(routs, [], end.getFullYear())[0];
      const recent = statsRanges(end).fetchStart;
      const yearStartDay = new Date(firstYear, 0, 1);
      const start = yearStartDay < recent ? yearStartDay : recent;
      const recRes = await fetch(`${BASE_URL}/api/records/range?start=${toDateStr(start)}&end=${toDateStr(end)}`, { headers: authHeaders() });
      if (recRes.ok) {
        const d = await recRes.json();
        if (Array.isArray(d)) setStatsRecords(d);
      } else {
        console.error('루틴 기록 조회 실패', recRes.status);
      }
    } catch (e) {
      console.error('통계 데이터 로딩 실패', e);
    }
  };

  // 시연용 테스트 알림: 오늘의 남은 미션 개수를 바로 알림으로 보낸다
  const sendDemoNotification = async () => {
    if (typeof Notification === 'undefined') return alert('이 브라우저는 알림을 지원하지 않아요.');
    if (Notification.permission === 'denied') {
      return alert('이 사이트의 알림이 브라우저에서 차단되어 있어요.\n\n주소창 왼쪽 아이콘 → 알림 → "허용"으로 바꿔주세요.');
    }
    if (Notification.permission !== 'granted') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') return alert('브라우저 알림을 허용해야 시연할 수 있어요.');
    }
    const today = getTodayStr();
    let remain = 0;
    try {
      const [tRes, rRes, recRes] = await Promise.all([
        fetch(`${BASE_URL}/api/todos?date=${today}`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/routines/list?date=${today}`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/records?date=${today}`, { headers: authHeaders() }),
      ]);
      const todayTodos = tRes.ok ? await tRes.json() : [];
      const todayRoutines = rRes.ok ? await rRes.json() : [];
      const todayRecords = recRes.ok ? await recRes.json() : [];
      const doneRoutineIds = new Set((Array.isArray(todayRecords) ? todayRecords : [])
        .filter((r: any) => r.completed !== false).map((r: any) => r.routineId));
      remain = (Array.isArray(todayTodos) ? todayTodos : []).filter((t: any) => !(t.completed || t.isCompleted || t.done)).length
        + (Array.isArray(todayRoutines) ? todayRoutines : []).filter((r: any) => !doneRoutineIds.has(r.routineId)).length;
    } catch (e) { console.error('시연용 알림: 오늘 미션 조회 실패', e); }

    const desc = `오늘의 남은 미션은 ${remain}개 입니다.`;
    await showDeviceNotification('오늘의 미션', desc, 'todo');
    // 알림 목록에도 바로 보이게
    setNotifications((prev: any[]) => [
      { id: `demo-${Date.now()}`, type: 'mission', icon: '📋', title: '오늘의 미션', desc, time: formatNotiTime(new Date().toISOString()), unread: true },
      ...prev,
    ]);
  };

  // 알림 삭제: 목록에서 바로 지우고, 서버 알림이면 서버에서도 지운다 (실패하면 다시 불러옴)
const handleDeleteNotification = async (n: any) => {
  setNotifications((prev: any[]) => prev.filter((item: any) => item.id !== n.id));
  if (!n.serverId) return;
  try {
    const res = await fetch(`${BASE_URL}/api/notifications/${n.serverId}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) { alert(`알림 삭제에 실패했습니다.\n${await readError(res)}`); fetchServerNotifications(); }
  } catch { alert('서버와 통신할 수 없습니다.'); fetchServerNotifications(); }
};

const handleReadNotification = async (n: any) => {
  setNotifications((prev: any[]) => prev.map((item: any) => item.id === n.id ? { ...item, unread: false } : item));
  if (n.serverId && n.unread) {
    try { await fetch(`${BASE_URL}/api/notifications/${n.serverId}/read`, { method: 'PATCH', headers: authHeaders() }); }
    catch (e) { console.error('알림 읽음 처리 실패', e); }
  }
};

useEffect(() => {
  if (!isLoggedInView) return;
  fetchServerNotifications();
  const timer = setInterval(fetchServerNotifications, 30000);
  return () => clearInterval(timer);
}, [isLoggedInView, view]);

  useEffect(() => {
    if (view === 'main') {
      fetchUserProfile();
      fetchBackendRoutines();
      fetchTodos();
      fetchGoals();
    }
  }, [view, globalDate]);

  // 통계 탭을 열 때만 불러온다
  useEffect(() => {
    if (view === 'main' && activeTab === 'stats') fetchStatsData();
  }, [view, activeTab]);

  // 달력: 보고 있는 달이 바뀌거나, 미션을 체크해서 그 날 목록이 바뀌면 날짜별 달성률을 다시 계산
  const calMonthKey = String(globalDate || getTodayStr()).slice(0, 7);
  useEffect(() => {
    if (view === 'main' && activeTab === 'calendar') fetchCalendarMonth(globalDate || getTodayStr());
  }, [view, activeTab, calMonthKey, todos, backendRoutines]);

  
const [todoFilter, setTodoFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [statsPeriod, setStatsPeriod] = useState<string>('week');
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [showGoalResult, setShowGoalResult] = useState<boolean>(false);
  const [resultType, setResultType] = useState<'success' | 'fail' | null>(null);


  return (
    <div className="container">
      {view === 'login' && <LoginView setView={setView} />}
      {view === 'register' && <RegisterView setView={setView} />}
      {view === 'error' && <ErrorView setView={setView} />}
      
      {view === 'noti' && (
        <NotiView 
          setView={setView} 
          notifications={notifications} 
          notiFilter={notiFilter} 
          setNotiFilter={setNotiFilter} 
          onRead={handleReadNotification}
          onDelete={handleDeleteNotification}
          onOpenSettings={() => { setNotiSettingsBack('noti'); setView('noti-settings'); }}
          onDemo={sendDemoNotification}
        />
      )}
      
      {view === 'main' && (
        <>
          <MainAppView
            setView={setView} activeTab={activeTab} setActiveTab={setActiveTab}
            todos={todos} setTodoFilter={setTodoFilter} todoFilter={todoFilter}
            goals={goals} setGoalFilter={setGoalFilter} goalFilter={goalFilter}
            statsPeriod={statsPeriod} setStatsPeriod={setStatsPeriod}
            setSelectedGoalId={setSelectedGoalId} selectedGoalId={selectedGoalId}
            setResultType={setResultType} setShowGoalResult={setShowGoalResult}
            showGoalResult={showGoalResult} resultType={resultType}
            backendRoutines={backendRoutines} 
            onToggleBackendRoutine={handleToggleBackendRoutine}
            onDeleteTodo={handleDeleteTodo} onDeleteRoutine={handleDeleteRoutine} 
            onToggleTodo={handleToggleTodo} 
            onUpdateGoalStatus={handleUpdateGoalStatus} onDeleteGoal={handleDeleteGoal}
            globalDate={globalDate} setGlobalDate={setGlobalDate}
            onOpenNoti={() => setView('noti')} 
            onOpenMenu={() => setIsSidebarOpen(true)}
            onEditTodo={handleEditTodo} onEditRoutine={handleEditRoutine} onEditGoal={handleEditGoal} 
            statsRecords={statsRecords} allRoutines={allRoutines} calMonthData={calMonthData}
          />
          
          {isSidebarOpen && (
            <>
              <div 
                className="bottom-sheet-overlay" 
                onClick={() => setIsSidebarOpen(false)} 
                style={{ zIndex: 999 }}
              ></div>
              <div style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#fff',
                zIndex: 1000, display: 'flex', flexDirection: 'column', padding: '32px 24px',
                boxShadow: '2px 0 12px rgba(0,0,0,0.1)', animation: 'slideRight 0.3s forwards'
              }}>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--p1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16px' }}>
                    <User size={24} color={C.p5} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--g4)' }}>{userProfile.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--g1)' }}>{userProfile.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'auto' }}>
                  {[
                    { key: 'profile', label: '프로필 수정', icon: <User size={18} style={{ marginRight: '12px' }} /> },
                    { key: 'password', label: '비밀번호 변경', icon: <Lock size={18} style={{ marginRight: '12px' }} /> },
                    { key: 'routines', label: '루틴 관리', icon: <RotateCcw size={18} style={{ marginRight: '12px' }} /> },
                    { key: 'noti-settings', label: '알림 설정', icon: <Bell size={18} style={{ marginRight: '12px' }} /> },
                  ].map(m => (
                    <div key={m.key} className="cursor-pointer"
                         style={{ background: 'var(--p1)', color: 'var(--p5)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '14px' }}
                         onClick={() => { setIsSidebarOpen(false); setNotiSettingsBack('main'); setView(m.key); }}>
                      {m.icon} {m.label}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', padding: '16px 0', fontSize: '15px', fontWeight: '600', color: 'var(--g2)' }} onClick={handleLogout}>
                    <LogOut size={20} style={{ marginRight: '16px' }} /> 로그아웃
                  </div>
                  <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', padding: '16px 0', fontSize: '15px', fontWeight: '600', color: 'var(--red)' }} onClick={() => { setIsSidebarOpen(false); setView('withdraw'); }}>
                    <Trash2 size={20} style={{ marginRight: '16px' }} /> 회원 탈퇴
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
            {view === 'todo-add' && <TodoAddView setView={setView} onAddTodo={handleAddTodo} onUpdateTodo={handleUpdateTodo} onUpdateRoutine={handleUpdateRoutine} editingItem={editingItem} editingKind={editingKind} globalDate={globalDate} returnTo={addFrom} />}
      {view === 'profile' && <ProfileView setView={setView} userProfile={userProfile} setUserProfile={setUserProfile} />}
      {view === 'password' && <PasswordView setView={setView} />}
      {view === 'withdraw' && <WithdrawView setView={setView} onDone={handleAfterWithdraw} />}
      {view === 'noti-settings' && <NotiSettingsView setView={setView} backTo={notiSettingsBack} />}
      {view === 'routines' && <RoutineManageView setView={setView} onDeleteRoutine={handleDeleteRoutine}
        onEditRoutine={(r: any) => { setAddFrom('routines'); handleEditRoutine(r); }}
        onAddRoutine={() => { setEditingItem(null); setEditingKind(null); setAddFrom('routines'); setView('todo-add'); }} />}
      {view === 'goal-add' && <GoalAddView setView={setView} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} editingGoal={editingGoal} globalDate={globalDate} />}
    </div>
  );
}

export default App;
