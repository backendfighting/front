import { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, ChevronLeft, Flag, Bell, 
  CheckCircle2, Circle, MoreVertical, 
  Plus, Calendar, BarChart2, ClipboardList,
  AlertCircle, RotateCcw, X, Check, Menu, Trash2, LogOut, User, Pencil
} from 'lucide-react';
import './App.css';

const BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:8080'

type SetView = (view: string) => void;

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNotified = (): string[] => {
  try { return JSON.parse(localStorage.getItem('notifiedIds') || '[]'); } catch { return []; }
};

const showDeviceNotification = async (title: string, body: string) => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) { reg.showNotification(title, { body, icon: '/pwa-192x192.png' }); return; }
  } catch { /* 아래로 이동 */ }
  new Notification(title, { body, icon: '/pwa-192x192.png' });
};


function LoginView({ setView }: { setView: SetView }) {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');   
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');
    if (email === 'example@email.com' && password === '12345678') { setView('main'); return; }
    try {
      const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      let data: any = {};
      if (response.headers.get("content-type")?.includes("application/json")) {
        data = await response.json();
      }
      if (response.ok) {
        const token = data.token || data.accessToken;
        if (token) localStorage.setItem('token', token); 
        setView('main');
      } else {
        alert(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      alert('서버와 통신 중 에러가 발생했습니다.');
    }
  };

  return (
    <div className="card">
      <div style={{ backgroundColor: '#e9e7ff', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '48px auto 16px' }}>
        <Flag size={24} color="#6c63ff" fill="#6c63ff" />
      </div>
      <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px', color: '#1a191b' }}>Goal Tracker</h2>
      <div className="input-group">
        <label>이메일</label>
        <div style={{ position: 'relative' }}>
          <input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Mail size={18} style={{ position: 'absolute', right: '14px', top: '20px', color: '#b5b1bc' }} />
        </div>
      </div>
      <div className="input-group">
        <label>비밀번호</label>
        <div style={{ position: 'relative' }}>
          <input type={showPassword ? "text" : "password"} placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Lock size={18} style={{ position: 'absolute', right: '44px', top: '20px', color: '#b5b1bc' }} />
          <Eye size={18} className="cursor-pointer" style={{ position: 'absolute', right: '14px', top: '20px', color: showPassword ? '#6c63ff' : '#b5b1bc' }} onClick={() => setShowPassword(!showPassword)} />
        </div>
      </div>
      <div style={{ height: '10px' }} />
      <button className="primary-button" onClick={handleLogin}>로그인</button>
      <p style={{ marginTop: '24px', fontSize: '13px', color: '#7a7680' }}>
        계정이 없으신가요? <span className="text-link" onClick={() => setView('register')}>회원가입</span>
      </p>
    </div>
  );
}

function RegisterView({ setView }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, marketing: false });

  const allChecked = agreements.terms && agreements.privacy && agreements.marketing;

  const handleRegisterSubmit = async () => {
    if (!email || !password || !nickname) return alert('모든 정보를 입력해주세요.');
    if (password !== passwordCheck) return alert('비밀번호가 일치하지 않습니다.');
    if (!agreements.terms || !agreements.privacy) return alert('필수 약관에 동의하셔야 가입이 가능합니다.');

    try {
      const response = await fetch(`${BASE_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: nickname }),
      });
      if (response.ok) {
        alert('회원가입을 축하합니다! 로그인을 진행해주세요.');
        setView('login');
      } else {
        alert('회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('서버 통신 실패');
    }
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('login')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">회원가입</h3>
        <div style={{ width: 24 }} />
      </div>
      <div className="scroll-content" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 230px)', paddingBottom: '20px' }}>
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '8px 0' }}>새로운 시작을 함께해요</h2>
          <p style={{ fontSize: '13px', color: '#b5b1bc' }}>간단한 정보를 입력하고 서비스를 시작하세요.</p>
        </div>
        <div className="input-group"><label>이메일</label><input type="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
        <div className="input-group"><label>비밀번호</label><input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e)=>setPassword(e.target.value)} /></div>
        <div className="input-group"><label>비밀번호 확인</label><input type="password" placeholder="비밀번호를 다시 입력하세요" value={passwordCheck} onChange={(e)=>setPasswordCheck(e.target.value)} /></div>
        <div className="input-group"><label>닉네임</label><input type="text" placeholder="닉네임을 입력하세요" value={nickname} onChange={(e)=>setNickname(e.target.value)} /></div>
        
        <div className="agreement-box">
          <div className="agreement-item" style={{ borderBottom: '1px solid #f1f0f5', paddingBottom: '10px', marginBottom: '8px' }}>
            <input type="checkbox" id="all-agree" checked={allChecked} onChange={(e) => setAgreements({ terms: e.target.checked, privacy: e.target.checked, marketing: e.target.checked })} />
            <label htmlFor="all-agree"><b>전체 동의</b></label>
          </div>
          <div className="agreement-item"><input type="checkbox" id="terms" checked={agreements.terms} onChange={(e) => setAgreements(p => ({...p, terms: e.target.checked}))} /><label htmlFor="terms">이용약관(필수)</label></div>
          <div className="agreement-item"><input type="checkbox" id="privacy" checked={agreements.privacy} onChange={(e) => setAgreements(p => ({...p, privacy: e.target.checked}))} /><label htmlFor="privacy">개인정보처리방침(필수)</label></div>
        </div>
        <button className="primary-button" style={{ marginTop: '24px' }} onClick={handleRegisterSubmit}>회원가입 완료</button>
      </div>
    </div>
  );
}

function ErrorView({ setView }: { setView: SetView }) {
  return (
    <div className="card" style={{ justifyContent: 'center', paddingBottom: '30px' }}>
      <div style={{ width: '84px', height: '84px', backgroundColor: '#f1f0f5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
        <AlertCircle size={42} color="#586589" />
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 700 }}>문제가 발생했습니다</h2>
      <button className="dark-button" onClick={() => setView('login')}><RotateCcw size={18} /> 다시 시도</button>
    </div>
  );
}

function NotiView({ setView, notifications, setNotifications, notiFilter, setNotiFilter }: any) {
  const [perm, setPerm] = useState<string>(typeof Notification !== 'undefined' ? Notification.permission : 'denied');

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    const timer = setInterval(() => setPerm(Notification.permission), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredNoti = (notifications || []).filter((n: any) => notiFilter === 'unread' ? n.unread : true);
  const unreadCount = (notifications || []).filter((n: any) => n.unread).length;

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">알림</h3>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: '24px' }}>
        <div className="filter-tabs" style={{ padding: 0, marginBottom: 0, gap: '8px' }}>
          <button className={`chip ${notiFilter === 'all' ? 'active' : ''}`} style={notiFilter !== 'all' ? { background: '#f1f0f5', color: '#7a7680' } : { background: '#5b678c', color: 'white' }} onClick={() => setNotiFilter('all')}>전체</button>
          <button className={`chip ${notiFilter === 'unread' ? 'active' : ''}`} style={notiFilter !== 'unread' ? { background: '#f1f0f5', color: '#7a7680' } : { background: '#5b678c', color: 'white' }} onClick={() => setNotiFilter('unread')}>읽지 않음</button>
        </div>
        <span style={{ fontSize: '13px', color: '#b5b1bc', fontWeight: '500' }}>새 알림: {unreadCount}</span>
      </div>

      <div className="scroll-content">
        {perm !== 'granted' && typeof Notification !== 'undefined' && (
          <button className="primary-button" style={{ marginBottom: '16px' }} onClick={async () => {
            if (Notification.permission === 'granted') { setPerm('granted'); return; }
            if (Notification.permission === 'denied') {
              alert('이 사이트의 알림이 차단되어 있어요.\n\nEdge 주소창에 edge://settings/content/notifications 를 입력해서 localhost:5173을 "허용"으로 바꿔주세요.');
              return;
            }
            const result = await Notification.requestPermission();
            setPerm(result);
          }}>🔔 기기 알림 켜기</button>
        )}
        {perm === 'granted' && (
          <button className="primary-button" style={{ marginBottom: '16px', background: '#6c63ff' }} onClick={() => showDeviceNotification('테스트 알림', '알림이 정상적으로 동작합니다 🎉')}>
            🔔 테스트 알림 보내기
          </button>
        )}

        <div style={{ fontSize: '13px', fontWeight: '700', color: '#b5b1bc', marginBottom: '12px', marginLeft: '4px' }}>오늘</div>
        {filteredNoti.length === 0 && (
          <p style={{ color: '#b5b1bc', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>새 알림이 없습니다.</p>
        )}

        {filteredNoti.map((n: any) => (
          <div key={n.id}
               style={{
                 background: '#fff',
                 border: '1px solid #f1f0f5',
                 borderRadius: '20px',
                 padding: '20px',
                 marginBottom: '16px',
                 display: 'flex',
                 alignItems: 'flex-start',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                 cursor: 'pointer',
                 opacity: n.unread ? 1 : 0.6
               }}
               onClick={() => setNotifications((prev: any) => prev.map((item: any) => item.id === n.id ? { ...item, unread: false } : item))}
          >
            <div style={{
              width: 44, height: 44,
              background: n.type === 'goal' ? '#fff0f0' : '#eef2ff',
              borderRadius: 14, marginRight: 16, display: 'flex',
              justifyContent: 'center', alignItems: 'center', fontSize: '20px', flexShrink: 0
            }}>
              {n.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a191b', marginBottom: '6px' }}>{n.title}</div>
              <div style={{ fontSize: '13px', color: '#7a7680', marginBottom: '12px', lineHeight: '1.4' }}>{n.desc}</div>
              <div style={{ fontSize: '12px', color: '#b5b1bc', fontWeight: '500' }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodoAddView({ setView, onAddTodo, onUpdateTodo, onUpdateRoutine, editingItem, editingKind, globalDate }: any) {
  const isEdit = !!editingItem;
  const isRoutineEdit = isEdit && editingKind === 'routine';

  const [title, setTitle] = useState(editingItem?.title || '');
  const [memo, setMemo] = useState(editingItem?.description || '');
  const [date, setDate] = useState(editingItem?.todoDate || globalDate);
  const [time, setTime] = useState(editingItem?.todoTime ? String(editingItem.todoTime).slice(0, 5) : '14:00');
  const [priority, setPriority] = useState(
    editingItem?.priority === 'LOW' ? 'low' : editingItem?.priority === 'MEDIUM' ? 'normal' : 'high'
  );
  const [type, setType] = useState(isRoutineEdit ? 'routine' : 'todo');

  const handleSave = () => {
    if (!title.trim()) return alert('제목을 입력하세요.');
    if (isRoutineEdit) onUpdateRoutine(editingItem, title, memo);
    else if (isEdit) onUpdateTodo(editingItem.todoId || editingItem.id, title, memo, date, time, priority);
    else onAddTodo(title, memo, date, time, priority, type);
    setView('main');
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">{isEdit ? (isRoutineEdit ? '루틴 수정' : '할 일 수정') : '할 일 / 루틴 추가'}</h3>
        <span className="text-link" onClick={handleSave}>저장</span>
      </div>
      <div className="scroll-content">
        {!isEdit && (
          <div style={{ marginBottom: '16px' }}>
            <div className="filter-tabs">
              <button className={`chip ${type === 'todo' ? 'active' : ''}`} onClick={() => setType('todo')}>📌 일반 할 일</button>
              <button className={`chip ${type === 'routine' ? 'active' : ''}`} onClick={() => setType('routine')}>🔄 반복 루틴</button>
            </div>
          </div>
        )}
        <input style={{ fontSize: '18px', fontWeight: '700', border: 'none', width: '100%' }} placeholder="내용을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="input-group" style={{ marginTop: '12px' }}>
          <label>📝 메모</label>
          <input placeholder="메모 (선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
        {!isRoutineEdit && (
          <>
            <div className="input-group"><label>📅 날짜 지정</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="input-group"><label>🕒 시간 지정</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
            <div className="filter-tabs" style={{ marginTop: '12px' }}>
              {['high', 'normal', 'low'].map(p => (
                <button key={p} className={`chip ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                  {p === 'high' ? '높음' : p === 'normal' ? '보통' : '낮음'}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GoalAddView({ setView, onAddGoal, onUpdateGoal, editingGoal, globalDate }: any) {
  const isEdit = !!editingGoal;
  const [title, setTitle] = useState(editingGoal?.title || '');
  const [category, setCategory] = useState(editingGoal?.category || '운동');
  const [desc, setDesc] = useState(editingGoal?.desc || editingGoal?.description || '');
  const [startDate, setStartDate] = useState(editingGoal?.startDate || globalDate);
  const [endDate, setEndDate] = useState(editingGoal?.endDate || globalDate);
  const [reminder, setReminder] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return alert('목표를 입력하세요.');
    if (endDate < startDate) return alert('마감일은 시작일 이후여야 합니다.');
    if (isEdit) onUpdateGoal(editingGoal, title, category, desc, startDate, endDate);
    else onAddGoal(title, category, desc, startDate, endDate);
    setView('main');
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">{isEdit ? '목표 수정' : '목표 추가'}</h3>
        <span className="text-link" onClick={handleSave}>저장</span>
      </div>
      <div className="scroll-content">
        <div style={{ background: '#f5f4ff', color: '#6c63ff', padding: '24px', borderRadius: '16px', textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>
          {isEdit ? '목표를 수정해보세요' : '새로운 도전을 시작해보세요'}
        </div>

        <div className="input-group">
          <label>목표 제목</label>
          <input placeholder="예: 매일 30분 조깅하기" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="input-group">
          <label>카테고리</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>운동</option><option>공부</option><option>독서</option><option>기타</option>
          </select>
        </div>

        <div className="input-group">
          <label>목표 내용 / 설명</label>
          <textarea
            placeholder="목표에 대한 상세한 내용을 적어주세요..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #e5e4e7', borderRadius: '12px', minHeight: '80px', resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>시작일</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>목표일 (마감일)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', border: '1px solid #f1f0f5', borderRadius: '16px' }}>
          <span style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>⏰ 리마인더 알림 설정</span>
          <div
            className="cursor-pointer"
            onClick={() => setReminder(!reminder)}
            style={{ width: '44px', height: '24px', background: reminder ? '#6c63ff' : '#e5e4e7', borderRadius: '12px', position: 'relative', transition: '0.2s' }}
          >
            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: reminder ? '22px' : '2px', transition: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainAppView({ 
  setView, activeTab, setActiveTab, todos, todoFilter, setTodoFilter, 
  goals, goalFilter, setGoalFilter, statsPeriod, setStatsPeriod, 
  setSelectedGoalId, selectedGoalId, setResultType, setShowGoalResult, 
  showGoalResult, resultType, backendRoutines, 
  onToggleBackendRoutine, onUpdateGoalStatus, onDeleteTodo, onDeleteGoal, onDeleteRoutine, onToggleTodo,
  globalDate, setGlobalDate,
  onOpenNoti, onOpenMenu,
  onEditTodo, onEditRoutine, onEditGoal 
}: any) {
  
  const [failReasons, setFailReasons] = useState<string[]>([]);
  
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

  const filteredTodos = (todos || []).filter((t:any) => {
    if (todoFilter === 'done') return t.isCompleted === true || t.completed === true || t.done === true;
    return true; 
  });

  const getGoalProgress = (g: any) => g.status === '성공' ? 100 : g.status === '실패' ? 0 : (g.progress || 0);

  const dynamicOverallProgress = (goals || []).length > 0 ? Math.floor(((goals || []).filter((g: any) => g.status === '성공').length / (goals || []).length) * 100) : 0;

  const renderItemRow = (t: any) => {
    const id = t.todoId || t.id || t.todo_id;
    const isDone = t.isCompleted === true || t.completed === true || t.done === true;
    let priorityText = '보통';
    let priorityClass = 'badge-medium';
    if (t.priority === 'HIGH') { priorityText = '높음'; priorityClass = 'badge-high'; }
    if (t.priority === 'LOW') { priorityText = '낮음'; priorityClass = 'badge-low'; }

    return (
      <div key={`todo-${id}`} className="list-item">
        <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', flex: 1 }} onClick={() => onToggleTodo(id)}>
          {isDone ? 
            <CheckCircle2 size={22} color="#6c63ff" style={{ marginRight: 12 }} /> : 
            <Circle size={22} color="#e5e4e7" style={{ marginRight: 12 }} />
          }
          <span style={{ fontWeight: '600', textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#b5b1bc' : '#333' }}>
            {t.title}
          </span>
          <span className={`priority-badge ${priorityClass}`}>{priorityText}</span>
        </div>
        <Pencil size={18} className="cursor-pointer" color="#b5b1bc" style={{ marginRight: 12 }} onClick={(e) => { e.stopPropagation(); onEditTodo(t); }} />
        <MoreVertical size={20} className="cursor-pointer" color="#b5b1bc" onClick={(e) => { 
          e.stopPropagation(); 
          if (confirm('이 일정을 삭제하시겠습니까?')) onDeleteTodo(id); 
        }} />
      </div>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'todo': 
        const regularTodos = filteredTodos || [];
        const totalMissions = (todos || []).length + (backendRoutines || []).length;
        const doneTodos = (todos || []).filter((t:any) => t.isCompleted === true || t.completed === true || t.done === true).length;
        const doneRoutines = (backendRoutines || []).filter((r:any) => r.isCompleted === true).length;
        const doneTotal = doneTodos + doneRoutines;
        const remainCount = totalMissions - doneTotal;
        const liveProgress = totalMissions > 0 ? Math.round((doneTotal / totalMissions) * 100) : 0;

        return (
          <>
            <div className="header-row">
              <Menu size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenMenu} />
              <h3 className="header-title">할 일 <span style={{fontSize:'13px', color:'#6c63ff', marginLeft:'8px'}}>{calMonth}/{selectedCalendarDay}</span></h3>
              <Bell size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenNoti} />
            </div>
            <div className="filter-tabs" style={{ marginBottom: '24px' }}>
              <button className={`chip ${todoFilter === 'all' ? 'active' : ''}`} onClick={() => setTodoFilter('all')}>전체</button>
              <button className={`chip ${todoFilter === 'today' ? 'active' : ''}`} onClick={() => {
                setGlobalDate(getTodayStr()); 
                setTodoFilter('all');
              }}>오늘로 이동</button>
              <button className={`chip ${todoFilter === 'done' ? 'active' : ''}`} onClick={() => setTodoFilter('done')}>완료</button>
            </div>
            <div className="scroll-content">
              <div className="dashboard-card" style={{ background: '#f5f4ff', padding: '24px', borderRadius: '24px', textAlign: 'left', marginBottom: '32px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#6c63ff' }}>해당 일자 미션 종합 달성도</span>
                <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 6px 0', color: '#1a191b' }}>{liveProgress}% 완료</h3>
                <span style={{ fontSize: '13px', color: '#7a7680', fontWeight: '600' }}>남은 미션: {remainCount}개</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 12px 4px', fontSize: '14px', fontWeight: '700', color: '#4e4b52' }}>
                <span style={{ color: '#ff4d4d', marginRight: '6px' }}>📌</span> 일반 할 일 ({regularTodos.length}개)
              </div>
              {regularTodos.length === 0 ? 
                <p style={{ color: '#b5b1bc', textAlign: 'center', fontSize: '13px', padding: '20px 0' }}>할 일이 없습니다.</p> : 
                regularTodos.map(renderItemRow)
              }

              <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0 12px 4px', fontSize: '14px', fontWeight: '700', color: '#6c63ff' }}>
                <span style={{ color: '#6c63ff', marginRight: '6px' }}>🔄</span> 반복 루틴 ({(backendRoutines || []).length}개)
              </div>
              {!backendRoutines || backendRoutines.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#b5b1bc', textAlign: 'center', padding: '24px 0', borderRadius: '16px', border: '1px dashed #e0dcfc' }}>루틴 기록이 비어있습니다.</div>
              ) : (
                backendRoutines.map((r: any) => {
                  const id = r.routineId || r.id; 
                  const title = r.title || '알 수 없는 루틴';
                  const isDone = r.isCompleted === true;
                  
                  let pText = '높음'; let pClass = 'badge-high';
                  if (r.priority === 'MEDIUM') { pText = '보통'; pClass = 'badge-medium'; }
                  if (r.priority === 'LOW') { pText = '낮음'; pClass = 'badge-low'; }

                  return (
                    <div key={`routine-${id}`} className="list-item">
                      <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', flex: 1 }} onClick={() => onToggleBackendRoutine(id)}>
                        {isDone ? 
                          <CheckCircle2 size={22} color="#6c63ff" style={{ marginRight: 12 }} /> : 
                          <Circle size={22} color="#e5e4e7" style={{ marginRight: 12 }} />
                        }
                        <span style={{ fontWeight: '600', textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#b5b1bc' : '#333' }}>{title}</span>
                        <span className={`priority-badge ${pClass}`}>{pText}</span>
                      </div>
                                            <Pencil size={18} className="cursor-pointer" color="#b5b1bc" style={{ marginRight: 12 }} onClick={(e) => { e.stopPropagation(); onEditRoutine(r); }} />
                      <MoreVertical size={20} className="cursor-pointer" color="#b5b1bc" onClick={(e) => { 
                        e.stopPropagation(); 
                        if (confirm('이 루틴을 삭제하시겠습니까?')) onDeleteRoutine(id); 
                      }} />
                    </div>
                  );
                })
              )}
            </div>
            <div className="fab" onClick={() => setView('todo-add')}><Plus /></div>
          </>
        );

      case 'calendar': 
        const allMissionsForDay = [...(todos || []), ...(backendRoutines || [])];
        return (
          <>
            <div className="header-row"><Menu size={22} className="cursor-pointer" onClick={onOpenMenu} /><h3 className="header-title">달력</h3><Bell size={22} color="#4e4b52" onClick={onOpenNoti} /></div>
            <div className="scroll-content">
              <div style={{ background: '#fbfbff', border: '1px solid #f1f0f5', borderRadius: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <button className="chip" onClick={handlePrevMonth}>이전 달</button>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{calYear}년 {calMonth}월</h4>
                  <button className="chip" onClick={handleNextMonth}>다음 달</button>
                </div>
                <div className="calendar-grid">
                  {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="calendar-day-header">{d}</div>)}
                  {Array(firstDayIndex).fill(null).map((_, i) => <div key={`e-${i}`} className="calendar-cell empty"></div>)}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const dayNum = i + 1;
                    return (
                      <div key={dayNum} className={`calendar-cell ${dayNum === selectedCalendarDay ? 'active' : ''}`} 
                           onClick={() => {
                             const newDateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                             setGlobalDate(newDateStr);
                           }}>
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: '16px', fontWeight: '700' }}>{calMonth}월 {selectedCalendarDay}일 미션 목록 ({allMissionsForDay.length}개)</div>
              {allMissionsForDay.map((t: any) => (
                <div key={`cal-item-${t.id || t.routineId || t.todoId || Math.random()}`} className="list-item" style={{ background: '#fff', padding: '12px 16px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{t.title || '제목 없음'}</span>
                </div>
              ))}
            </div>
          </>
        );

      case 'goal': 
        const filteredGoals = (goals || []).filter((g:any) => {
          if (goalFilter === 'active') return g.status === '진행중';
          if (goalFilter === 'success') return g.status === '성공';
          if (goalFilter === 'fail') return g.status === '실패';
          return true;
        });

        return (
          <>
            <div className="header-row"><Menu size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenMenu} /><h3 className="header-title">목표</h3><Bell size={22} color="#4e4b52" onClick={onOpenNoti} /></div>
            
            <div className="filter-tabs" style={{ justifyContent: 'flex-start', gap: '8px', padding: '0 20px', marginBottom: '16px' }}>
              <button className={`chip ${goalFilter === 'all' ? 'active' : ''}`} style={goalFilter !== 'all' ? { background: '#f1f0f5', color: '#7a7680' } : { background: '#5b678c', color: 'white' }} onClick={() => setGoalFilter('all')}>전체</button>
              <button className={`chip ${goalFilter === 'active' ? 'active' : ''}`} style={goalFilter !== 'active' ? { background: '#f1f0f5', color: '#7a7680' } : { background: '#5b678c', color: 'white' }} onClick={() => setGoalFilter('active')}>진행중</button>
              <button className={`chip ${goalFilter === 'success' ? 'active' : ''}`} style={goalFilter !== 'success' ? { background: '#f1f0f5', color: '#7a7680' } : { background: '#5b678c', color: 'white' }} onClick={() => setGoalFilter('success')}>성공</button>
              <button className={`chip ${goalFilter === 'fail' ? 'active' : ''}`} style={goalFilter !== 'fail' ? { background: '#f1f0f5', color: '#7a7680' } : { background: '#5b678c', color: 'white' }} onClick={() => setGoalFilter('fail')}>실패</button>
            </div>

            <div className="scroll-content">
              <div className="dashboard-card" style={{ background: '#5b678c', color: 'white', padding: '24px', borderRadius: '24px', textAlign: 'left', marginBottom: '24px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', opacity: 0.9 }}>나의 전체 달성률</span>
                <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 0 0', color: 'white' }}>{dynamicOverallProgress}%</h2>
              </div>
              
              {filteredGoals.map((g:any) => {
                const isSuccess = g.status === '성공';
                const isFail = g.status === '실패';
                const statusColor = isSuccess ? '#28a745' : isFail ? '#dc3545' : '#6c63ff';

                return (
                  <div key={`goal-${g.id}`} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px', background: '#fff', borderRadius: '20px', marginBottom: '16px', border: '1px solid #f1f0f5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} 
                       onClick={() => { 
                         setSelectedGoalId(g.id); 
                         setResultType(isSuccess ? 'success' : isFail ? 'fail' : null); 
                         setFailReasons(g.reason ? g.reason.split(',').map((r: string) => r.trim()) : []);
                         setShowGoalResult(true); 
                       }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a191b' }}>{g.title}</span>
                      <span style={{ color: statusColor, fontSize: '13px', fontWeight: '700' }}>{g.status}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#b5b1bc', fontWeight: '500' }}>
                        {getGoalProgress(g)}% 달성 ({g.startDate || '2026-03-01'} ~ {g.endDate || '2026-03-31'})
                      </span>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
  <Pencil size={18} color="#b5b1bc" onClick={(e) => { e.stopPropagation(); onEditGoal(g); }} />
  <Trash2 size={18} color="#ff4d4d" onClick={(e) => { e.stopPropagation(); if(confirm('삭제하시겠습니까?')) onDeleteGoal(g.id); }} />
</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="fab" onClick={() => setView('goal-add')}><Plus /></div>
          </>
        );

      case 'stats': 
        let chartData: { label: string; rate: number }[] = [];
        
        const [bYear, bMonthStr, bDayStr] = (globalDate || getTodayStr()).split('-');
        const currentYear = parseInt(bYear || '2026');
        const currentMonth = parseInt(bMonthStr || '1') - 1; 

        const calculateRate = (filterFn: (y: number, m: number, d: number, fullDate: string) => boolean) => {
          const matchedGoals = (goals || []).filter((g: any) => {
            if (!g.endDate) return false;
            const [gy, gm, gd] = g.endDate.split('-').map(Number);
            return filterFn(gy, gm - 1, gd, g.endDate);
          });
          const successCount = matchedGoals.filter((g: any) => g.status === '성공').length;
          return matchedGoals.length > 0 ? Math.round((successCount / matchedGoals.length) * 100) : 0;
        };

        if (statsPeriod === 'week') {
          const base = new Date(currentYear, currentMonth, parseInt(bDayStr || '1'));
          const day = base.getDay();
          const diff = base.getDate() - day + (day === 0 ? -6 : 1); 
          const monday = new Date(base.setDate(diff));

          const weekLabels = ['월', '화', '수', '목', '금', '토', '일'];
          chartData = weekLabels.map((label, index) => {
            const tDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
            const tDateStr = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}-${String(tDate.getDate()).padStart(2, '0')}`;
            return { label, rate: calculateRate((_y, _m, _d, fullDate) => fullDate === tDateStr) };
          });

        } else if (statsPeriod === 'month') {
          const monthLabels = ['1주차', '2주차', '3주차', '4주차', '5주차'];
          chartData = monthLabels.map((label, index) => {
            const startDay = index * 7 + 1;
            const endDay = (index + 1) * 7;
            return { 
              label, 
              rate: calculateRate((y, m, d) => y === currentYear && m === currentMonth && d >= startDay && d <= endDay) 
            };
          });

        } else if (statsPeriod === 'year') {
          const yearLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
          chartData = yearLabels.map((label, index) => {
            return { label, rate: calculateRate((y, m) => y === currentYear && m === index) };
          });
        }

        const failedGoals = (goals || []).filter((g: any) => g.status === '실패');
        const totalFailed = failedGoals.length;
        const counts: Record<string, number> = { '⏱️ 시간 부족': 0, '🎯 동기 부족': 0, '🔋 체력 저하': 0, '📅 계획 오류': 0, '🌍 외부 요인': 0 };
        
        failedGoals.forEach((g: any) => { 
          if (g.reason) {
            const reasonsArray = g.reason.split(',').map((r: string) => r.trim());
            reasonsArray.forEach((r: string) => {
              if (counts[r] !== undefined) counts[r]++;
            });
          } 
        });

        const dynamicFailData = Object.keys(counts).map(name => ({
          name,
          rate: totalFailed > 0 ? Math.round((counts[name] / totalFailed) * 100) : 0,
          color: name === '⏱️ 시간 부족' ? '#ff4d4d' : '#ffb700'
        }));

        const maxRateValue = chartData.length > 0 ? Math.max(...chartData.map(c => c.rate)) : 0;

        return (
          <>
            <div className="header-row"><Menu size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenMenu} /><h3 className="header-title">통계</h3><Bell size={22} color="#4e4b52" onClick={onOpenNoti} /></div>
            <div className="filter-tabs" style={{ padding: '0 20px', marginBottom: '8px' }}>
              <button className={`chip ${statsPeriod === 'week' ? 'active' : ''}`} onClick={() => setStatsPeriod('week')}>주간</button>
              <button className={`chip ${statsPeriod === 'month' ? 'active' : ''}`} onClick={() => setStatsPeriod('month')}>월간</button>
              <button className={`chip ${statsPeriod === 'year' ? 'active' : ''}`} onClick={() => setStatsPeriod('year')}>연간</button>
            </div>
            <div className="scroll-content">
              <div style={{ fontSize: '14px', fontWeight: '700', marginLeft: '4px' }}>달성 추이</div>
              
              <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 12px 10px', background: '#fff', border: '1px solid #f1f0f5', borderRadius: '18px', marginTop: '12px' }}>
                {chartData.map((item: any, idx: number) => {
                  const barWidth = statsPeriod === 'year' ? '12px' : statsPeriod === 'month' ? '30px' : '20px';
                  const isHighlighted = item.rate === maxRateValue && maxRateValue > 0;
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                      <div style={{ height: `${item.rate * 1.2}px`, width: barWidth, background: isHighlighted ? '#6c63ff' : '#e9e7ff', borderRadius: '6px', transition: '0.3s' }}></div>
                      <span style={{ fontSize: '10px', color: '#7a7680', fontWeight: '500' }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '28px', marginLeft: '4px' }}>실패 원인 분석</div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '18px', border: '1px solid #f1f0f5', marginTop: '12px' }}>
                {dynamicFailData.map((f: any, idx: number) => (
                  <div key={idx} style={{ fontSize: '13px', marginTop: idx === 0 ? '0' : '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '600', color: '#4e4b52' }}>
                      <span>{f.name}</span>
                      <span>{f.rate}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${f.rate}%`, background: f.color, borderRadius: '4px' }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="card" style={{ paddingBottom: '80px' }}>
      {renderTabContent()}
      
      <div className="bottom-nav" style={{ justifyContent: 'space-around' }}>
        <div className={`nav-item ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}><ClipboardList size={22} /><span>할 일</span></div>
        <div className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}><Calendar size={22} /><span>달력</span></div>
        <div className={`nav-item ${activeTab === 'goal' ? 'active' : ''}`} onClick={() => setActiveTab('goal')}><Flag size={22} /><span>목표</span></div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><BarChart2 size={22} /><span>통계</span></div>
      </div>

      {showGoalResult && (
        <div className="bottom-sheet-overlay" onClick={() => setShowGoalResult(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>결과 상태 업데이트</h3>
            <div className="result-toggle-group">
              <button className={`result-btn success ${resultType === 'success' ? 'active' : ''}`} onClick={() => setResultType('success')}><Check size={16} /> 성공</button>
              <button className={`result-btn fail ${resultType === 'fail' ? 'active' : ''}`} onClick={() => setResultType('fail')}><X size={16} /> 실패</button>
            </div>

            {resultType === 'fail' && (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#4e4b52', display: 'block', marginBottom: '8px' }}>실패 사유 다중 선택</label>
                <div className="filter-tabs" style={{ flexWrap: 'wrap', gap: '6px', padding: 0 }}>
                  {['⏱️ 시간 부족', '🎯 동기 부족', '🔋 체력 저하', '📅 계획 오류', '🌍 외부 요인'].map((reason) => (
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
              if(selectedGoalId) {
                const reasonString = resultType === 'fail' ? failReasons.join(',') : '';
                onUpdateGoalStatus(selectedGoalId, resultType === 'success' ? '성공' : '실패', resultType === 'success' ? 100 : 0, reasonString);
              }
              setShowGoalResult(false);
            }}>변동 사항 반영 저장</button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [view, setView] = useState<string>(localStorage.getItem('token') ? 'main' : 'login');
    const [editingItem, setEditingItem] = useState<any>(null);
  const [editingKind, setEditingKind] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  useEffect(() => {
    if (view === 'main') { setEditingItem(null); setEditingKind(null); setEditingGoal(null); }
  }, [view]);
  const [activeTab, setActiveTab] = useState<string>('todo'); 
  const [globalDate, setGlobalDate] = useState<string>(getTodayStr());
  
  // 🌟 안전장치 초기값 적용
  const [todos, setTodos] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [backendRoutines, setBackendRoutines] = useState<any[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
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
        setGoals(Array.isArray(data) ? data : []); // 배열 형태가 아니면 빈 배열 강제 할당
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
    if (!routineId) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/records/toggle?routineId=${routineId}&date=${globalDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (response.ok) fetchBackendRoutines();
    } catch (e) { console.error(e); }
  };

  const handleDeleteRoutine = async (routineId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/routines/${routineId}`, { method: 'DELETE', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      if (response.ok) {
        fetchBackendRoutines();
      } else {
        alert('루틴 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTodo = async (title: string, memo: string, date: string, time: string, priority: string, type: string) => {
    const token = localStorage.getItem('token');
    try {
      if (type === 'routine') {
        const payload = { title, description: memo, category: '기본', repeatDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] };
        const response = await fetch(`${BASE_URL}/api/routines`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify(payload)
        });
        if (response.ok) fetchBackendRoutines(); 
      } else {
        const todoPayload = { title, description: memo, todoDate: date, todoTime: time + ":00", priority: priority === 'normal' ? 'MEDIUM' : priority.toUpperCase() };
        const response = await fetch(`${BASE_URL}/api/todos`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify(todoPayload)
        });
        if (response.ok) fetchTodos();
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteTodo = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/todos/${id}`, { method: 'DELETE', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      if(response.ok) fetchTodos();
    } catch { }
  };

  const handleUpdateGoalStatus = async (id: number, status: string, progress: number, reason: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/goals/${id}/status`, {
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': token ? `Bearer ${token}` : '' 
        }, 
        body: JSON.stringify({ status, progress, reason })
      });
      
      if (response.ok) fetchGoals(); 
    } catch (error) {
      console.error('서버 통신 에러:', error);
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

  const handleAddGoal = async (title: string, category: string, desc: string, startDate: string, endDate: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/goals`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify({ title, category, desc, startDate, endDate, progress: 0, status: '진행중', reason: '' })
      });
      if (response.ok) fetchGoals();
      else setGoals(prev => [...prev, { id: Date.now(), title, category, desc, startDate, endDate, progress: 0, status: '진행중', reason: '' }]);
    } catch {
      setGoals(prev => [...prev, { id: Date.now(), title, category, desc, startDate, endDate, progress: 0, status: '진행중', reason: '' }]);
    }
  };

    const handleEditTodo = (t: any) => { setEditingItem(t); setEditingKind('todo'); setView('todo-add'); };
  const handleEditRoutine = (r: any) => { setEditingItem(r); setEditingKind('routine'); setView('todo-add'); };
  const handleEditGoal = (g: any) => { setEditingGoal(g); setView('goal-add'); };

  const handleUpdateTodo = async (id: number, title: string, memo: string, date: string, time: string, priority: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ title, description: memo, todoDate: date, todoTime: time.length === 5 ? time + ':00' : time, priority: priority === 'normal' ? 'MEDIUM' : priority.toUpperCase() })
      });
      if (response.ok) fetchTodos();
      else alert(`수정에 실패했습니다. (오류 코드 ${response.status})`);
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  const handleUpdateRoutine = async (r: any, title: string, memo: string) => {
    const token = localStorage.getItem('token');
    const id = r.routineId || r.id;
    try {
      const response = await fetch(`${BASE_URL}/api/routines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ title, description: memo, category: r.category || '기본', repeatDays: r.repeatDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] })
      });
      if (response.ok) fetchBackendRoutines();
      else alert(`수정에 실패했습니다. (오류 코드 ${response.status})`);
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  const handleUpdateGoal = async (g: any, title: string, category: string, desc: string, startDate: string, endDate: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL}/api/goals/${g.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ title, category, desc, startDate, endDate, progress: g.progress ?? 0, status: g.status || '진행중', reason: g.reason || '' })
      });
      if (response.ok) fetchGoals();
      else alert(`목표 수정에 실패했습니다. (오류 코드 ${response.status})`);
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };
  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('token'); 
      setView('login');
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${BASE_URL}/api/users`, { 
          method: 'DELETE',
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (response.ok) {
          alert('회원 탈퇴가 완료되었습니다.');
          localStorage.removeItem('token');
          setView('login');
          setIsSidebarOpen(false);
        } else {
          alert('회원 탈퇴에 실패했습니다.');
        }
      } catch (error) {
        console.error(error);
        alert('서버와 통신할 수 없습니다.');
      }
    }
  };

  const checkReminders = async () => {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
  const today = getTodayStr();
  const now = new Date();
  const timeLabel = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const items: any[] = [];

  try {
    // 1) 오늘 할 일: 마감 30분 전 ~ 마감 후 1시간까지
    const todoRes = await fetch(`${BASE_URL}/api/todos?date=${today}`, { headers });
    if (todoRes.ok) {
      const data = await todoRes.json();
      if (Array.isArray(data)) {
        data.forEach((t: any) => {
          const done = t.isCompleted === true || t.completed === true || t.done === true;
          if (done || !t.todoTime) return;
          const [h, m] = String(t.todoTime).split(':').map(Number);
          const due = new Date();
          due.setHours(h, m, 0, 0);
          const diffMin = Math.round((due.getTime() - now.getTime()) / 60000);
          const id = t.todoId || t.id;
          if (diffMin >= 0 && diffMin <= 30) {
            items.push({ id: `todo-soon-${id}-${today}`, type: 'todo', icon: '⏰', unread: true, time: timeLabel,
              title: '할 일 마감 임박', desc: `"${t.title}" 마감이 ${diffMin}분 남았습니다` });
          } else if (diffMin < 0 && diffMin >= -60) {
            items.push({ id: `todo-late-${id}-${today}`, type: 'todo', icon: '📊', unread: true, time: timeLabel,
              title: '마감 시간이 지났어요', desc: `"${t.title}"을(를) 아직 완료하지 않았어요` });
          }
        });
      }
    }

    // 2) 목표: 오늘이 마감일이거나 마감일이 지난 진행중 목표
    const goalRes = await fetch(`${BASE_URL}/api/goals`, { headers });
    if (goalRes.ok) {
      const data = await goalRes.json();
      if (Array.isArray(data)) {
        data.forEach((g: any) => {
          if (g.status !== '진행중' || !g.endDate) return;
          if (g.endDate === today) {
            items.push({ id: `goal-today-${g.id}-${today}`, type: 'goal', icon: '🎯', unread: true, time: timeLabel,
              title: '목표 마감일이에요', desc: `"${g.title}" 목표의 마감일이 오늘입니다` });
          } else if (g.endDate < today) {
            items.push({ id: `goal-over-${g.id}`, type: 'goal', icon: '🚩', unread: true, time: timeLabel,
              title: '목표 결과를 기록해주세요', desc: `"${g.title}" 목표의 마감일이 지났습니다` });
          }
        });
      }
    }
  } catch (e) { console.error('알림 확인 실패', e); }

  if (items.length === 0) return;

  // 알림 화면 목록에 추가 (이미 있는 건 제외 → 읽음 상태 유지)
  setNotifications((prev: any[]) => {
    const ids = new Set(prev.map((n: any) => n.id));
    const add = items.filter(i => !ids.has(i.id));
    return add.length ? [...add, ...prev] : prev;
  });

  // 컴퓨터 알림 팝업 (한 번 보낸 건 다시 안 보냄)
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const notified = getNotified();
    items.filter(i => !notified.includes(i.id)).forEach(i => showDeviceNotification(i.title, i.desc));
    localStorage.setItem('notifiedIds', JSON.stringify([...new Set([...notified, ...items.map(i => i.id)])].slice(-100)));
  }
};

const isLoggedInView = view !== 'login' && view !== 'register' && view !== 'error';
useEffect(() => {
  if (!isLoggedInView) return;
  checkReminders();
  const timer = setInterval(checkReminders, 30000);
  return () => clearInterval(timer);
}, [isLoggedInView]);

// 할 일/목표가 바뀌거나 화면을 이동할 때 바로 확인
useEffect(() => {
  if (!isLoggedInView) return;
  checkReminders();
}, [todos, goals, view]);

  useEffect(() => {
    if (view === 'main') {
      fetchUserProfile(); 
      fetchBackendRoutines();
      fetchTodos();
      fetchGoals();
    }
  }, [view, globalDate]);

  
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
          setNotifications={setNotifications} 
          notiFilter={notiFilter} 
          setNotiFilter={setNotiFilter} 
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
                  <div style={{ width: '48px', height: '48px', background: '#e9e7ff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16px' }}>
                    <User size={24} color="#6c63ff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a191b' }}>{userProfile.name}</div>
                    <div style={{ fontSize: '13px', color: '#b5b1bc' }}>{userProfile.email}</div>
                  </div>
                </div>

                <div className="cursor-pointer" 
                     style={{ background: '#f5f4ff', color: '#6c63ff', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '14px', marginBottom: 'auto' }}
                     onClick={() => alert(`[회원 세부 정보]\n- 이메일 주소: ${userProfile.email}\n- 가입 닉네임: ${userProfile.name}\n\n목표 및 반복 루틴 데이터 관리 시스템`)}>
                  <User size={18} style={{ marginRight: '12px' }} /> 내 정보 보기
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', padding: '16px 0', fontSize: '15px', fontWeight: '600', color: '#1a191b' }} onClick={handleLogout}>
                    <LogOut size={20} style={{ marginRight: '16px' }} /> 로그아웃
                  </div>
                  <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', padding: '16px 0', fontSize: '15px', fontWeight: '600', color: '#ff4d4d' }} onClick={handleDeleteAccount}>
                    <Trash2 size={20} style={{ marginRight: '16px' }} /> 회원 탈퇴
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
            {view === 'todo-add' && <TodoAddView setView={setView} onAddTodo={handleAddTodo} onUpdateTodo={handleUpdateTodo} onUpdateRoutine={handleUpdateRoutine} editingItem={editingItem} editingKind={editingKind} globalDate={globalDate} />}
      {view === 'goal-add' && <GoalAddView setView={setView} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} editingGoal={editingGoal} globalDate={globalDate} />}
    </div>
  );
}

export default App;