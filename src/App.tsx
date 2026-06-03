import { useState } from 'react';
import { 
  Mail, Lock, Eye, ChevronLeft, Flag, Bell, 
  Search, CheckCircle2, Circle, MoreVertical, 
  Plus, Calendar, BarChart2, Users, ClipboardList,
  AlertCircle, RotateCcw, Home, X, Check, Star, Menu, LogOut, User, Trash2
} from 'lucide-react';
import './App.css';

type SetView = (view: string) => void;

// ==========================================
// 1. 외부 게이트웨이 독립 컴포넌트 선언 영역
// ==========================================
function LoginView({ setView }: { setView: SetView }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="card">
      <div style={{ backgroundColor: '#e9e7ff', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '48px auto 16px' }}>
        <Flag size={24} color="#6c63ff" fill="#6c63ff" />
      </div>
      <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px', color: '#1a191b' }}>Goal Tracker</h2>
      <div className="input-group">
        <label>이메일</label>
        <div style={{ position: 'relative' }}>
          <input type="email" placeholder="example@email.com" defaultValue="example@email.com" />
          <Mail size={18} style={{ position: 'absolute', right: '14px', top: '20px', color: '#b5b1bc' }} />
        </div>
      </div>
      <div className="input-group">
        <label>비밀번호</label>
        <div style={{ position: 'relative' }}>
          <input type={showPassword ? "text" : "password"} placeholder="비밀번호를 입력하세요" defaultValue="12345678" />
          <Lock size={18} style={{ position: 'absolute', right: '44px', top: '20px', color: '#b5b1bc' }} />
          <Eye size={18} className="cursor-pointer" style={{ position: 'absolute', right: '14px', top: '20px', color: showPassword ? '#6c63ff' : '#b5b1bc' }} onClick={() => setShowPassword(!showPassword)} />
        </div>
      </div>
      <div style={{ height: '10px' }} />
      <button className="primary-button" onClick={() => setView('main')}>로그인</button>
      <p style={{ marginTop: '24px', fontSize: '13px', color: '#7a7680' }}>
        계정이 없으신가요? <span className="text-link" onClick={() => setView('register')}>회원가입</span>
      </p>
      <small style={{ marginTop: 'auto', color: '#e5e4e7', cursor: 'pointer' }} onClick={() => setView('error')}>오류 레이아웃 시뮬레이션</small>
    </div>
  );
}

function RegisterView({ setView }: { setView: SetView }) {
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });

  const allChecked = agreements.terms && agreements.privacy && agreements.marketing;

  const handleAllAgreeChange = (checked: boolean) => {
    setAgreements({
      terms: checked,
      privacy: checked,
      marketing: checked
    });
  };

  const handleIndividualChange = (key: 'terms' | 'privacy' | 'marketing', checked: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('login')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">회원가입</h3>
        <div style={{ width: 24 }} />
      </div>
      <div className="scroll-content">
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '8px 0' }}>새로운 시작을 함께해요</h2>
          <p style={{ fontSize: '13px', color: '#b5b1bc' }}>간단한 정보를 입력하고 서비스를 시작하세요.</p>
        </div>
        <div className="input-group"><label>이메일</label><input type="email" placeholder="example@email.com" /></div>
        <div className="input-group"><label>비밀번호</label><input type="password" placeholder="비밀번호를 입력하세요" /></div>
        <div className="input-group"><label>비밀번호 확인</label><input type="password" placeholder="비밀번호를 다시 입력하세요" /></div>
        <div className="input-group"><label>닉네임</label><input type="text" placeholder="닉네임을 입력하세요" /></div>
        
        <div className="agreement-box">
          <div className="agreement-item" style={{ borderBottom: '1px solid #f1f0f5', paddingBottom: '10px', marginBottom: '8px' }}>
            <input type="checkbox" id="all-agree" checked={allChecked} onChange={(e) => handleAllAgreeChange(e.target.checked)} />
            <label htmlFor="all-agree"><b>전체 동의</b></label>
          </div>
          <div className="agreement-item">
            <input type="checkbox" id="terms" checked={agreements.terms} onChange={(e) => handleIndividualChange('terms', e.target.checked)} />
            <label htmlFor="terms">이용약관(필수)</label>
            <span className="view-link" onClick={() => alert('[이용약관 안내]\nGoal Tracker 서비스 이용 규정 및 회원의 권리와 의무 사항 일체에 동의합니다.')}>보기</span>
          </div>
          <div className="agreement-item">
            <input type="checkbox" id="privacy" checked={agreements.privacy} onChange={(e) => handleIndividualChange('privacy', e.target.checked)} />
            <label htmlFor="privacy">개인정보처리방침(필수)</label>
            <span className="view-link" onClick={() => alert('[개인정보처리방침 안내]\n안전한 데이터 관리를 위한 개인정보 수집 목적, 항목 및 보유 기간에 동의합니다.')}>보기</span>
          </div>
          <div className="agreement-item">
            <input type="checkbox" id="marketing" checked={agreements.marketing} onChange={(e) => handleIndividualChange('marketing', e.target.checked)} />
            <label htmlFor="marketing">마케팅 수신 동의(선택)</label>
            <span className="view-link" onClick={() => alert('[마케팅 수신 동의 안내]\n신규 기능 런칭 및 목표 리포트 정기 구독 알림 수신에 동의합니다.')}>보기</span>
          </div>
        </div>
        <button className="primary-button" style={{ marginTop: '24px' }} onClick={() => setView('login')}>회원가입 완료</button>
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
      <p style={{ color: '#7a7680', fontSize: '14px', marginBottom: '48px' }}>잠시 후 다시 시도해주세요</p>
      <button className="dark-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0' }} onClick={() => setView('login')}>
        <RotateCcw size={18} /> 다시 시도
      </button>
      <div style={{ marginTop: '24px', color: '#b5b1bc', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} onClick={() => setView('login')}>
        <Home size={14} /> 홈으로 돌아가기
      </div>
    </div>
  );
}

function NotiView({ setView, notifications, setNotifications, notiFilter, setNotiFilter }: any) {
  const filteredNoti = notifications.filter((n: any) => notiFilter === 'unread' ? n.unread : true);
  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">알림</h3>
        <div style={{ width: 24 }} />
      </div>
      <div className="filter-tabs">
        <button className={`chip ${notiFilter === 'all' ? 'active' : ''}`} onClick={() => setNotiFilter('all')}>전체</button>
        <button className={`chip ${notiFilter === 'unread' ? 'active' : ''}`} onClick={() => setNotiFilter('unread')}>읽지 않음</button>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#b5b1bc', alignSelf: 'center' }}>새 알림: {notifications.filter((n:any)=>n.unread).length}</span>
      </div>
      <div className="scroll-content">
        <div style={{ fontSize: '12px', color: '#b5b1bc', marginBottom: '8px', fontWeight: '600' }}>오늘</div>
        {filteredNoti.map((n: any) => (
          <div key={n.id} className="list-item" onClick={() => {
            setNotifications(notifications.map((item: any) => item.id === n.id ? {...item, unread: false} : item));
          }}>
            <div style={{ width: 36, height: 36, background: n.type === 'todo' ? '#eef2ff' : '#fff5ed', borderRadius: 10, marginRight: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {n.type === 'todo' ? '📊' : '🎉'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: '700', color: '#1a191b' }}>{n.title}</div>
              <div style={{ fontSize: 11, color: '#7a7680', marginTop: '2px' }}>{n.desc}</div>
              <div style={{ fontSize: 10, color: '#b5b1bc', marginTop: '4px' }}>{n.time}</div>
            </div>
            {n.unread && <div className="unread-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TodoAddView({ setView, onAddTodo }: { setView: SetView, onAddTodo: (title: string, memo: string, date: string, time: string, priority: string, type: string) => void }) {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState('2026-04-06');
  const [time, setTime] = useState('14:00');
  const [priority, setPriority] = useState('high');
  const [type, setType] = useState('todo');

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">할 일 / 루틴 추가</h3>
        <span className="text-link" onClick={() => {
          if (!title.trim()) return alert('제목을 입력하세요.');
          onAddTodo(title, memo, date, time, priority, type);
          setView('main');
        }}>저장</span>
      </div>
      <div className="scroll-content">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#7a7680' }}>일정 분류</label>
          <div className="filter-tabs" style={{ marginTop: '8px' }}>
            <button className={`chip ${type === 'todo' ? 'active' : ''}`} onClick={() => setType('todo')}>📌 일반 할 일 (일회성)</button>
            <button className={`chip ${type === 'routine' ? 'active' : ''}`} onClick={() => setType('routine')}>🔄 반복 루틴 (반복성)</button>
          </div>
        </div>

        <input style={{ fontSize: '18px', fontWeight: '700', border: 'none', background: 'transparent', padding: '6px 0' }} placeholder={type === 'todo' ? "할 일을 입력하세요" : "반복할 루틴을 입력하세요"} value={title} onChange={(e)=>setTitle(e.target.value)} />
        <textarea style={{ border: 'none', background: 'transparent', padding: '12px 0', minHeight: '80px', fontSize: '14px' }} placeholder="메모 (선택)" value={memo} onChange={(e)=>setMemo(e.target.value)} />
        
        <div className="input-group"><label>📅 날짜 지정</label><input type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></div>
        <div className="input-group"><label>🕒 시간 지정</label><input type="time" value={time} onChange={(e)=>setTime(e.target.value)} /></div>

        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#7a7680' }}>우선순위</label>
          <div className="filter-tabs" style={{ marginTop: '8px' }}>
            {['high', 'normal', 'low'].map(p => (
              <button key={p} className={`chip ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                {p === 'high' ? '높음' : p === 'normal' ? '보통' : '낮음'}
              </button>
            ))}
          </div>
        </div>
        <div className="reward-box">✨ 목표 달성 시 포인트 및 배지 리워드가 획득됩니다!</div>
        <button className="dark-button del-btn" onClick={() => { setTitle(''); setMemo(''); setView('main'); }}>🗑️ 초기화</button>
      </div>
    </div>
  );
}

function GoalAddView({ setView, onAddGoal }: { setView: SetView, onAddGoal: (title: string, category: string, desc: string, start: string, end: string) => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('운동');
  const [desc, setDesc] = useState('');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [notify, setNotify] = useState(true);

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">목표 추가</h3>
        <span className="text-link" onClick={() => {
          if(!title.trim()) return alert('목표를 입력하세요.');
          onAddGoal(title, category, desc, startDate, endDate);
          setView('main');
        }}>저장</span>
      </div>
      <div className="scroll-content">
        <div style={{ width: '100%', height: '100px', background: 'linear-gradient(135deg, #e0dcfc 0%, #f4f3ff 100%)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c63ff', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
          새로운 도전을 시작해보세요
        </div>
        <div className="input-group"><label>목표 제목</label><input placeholder="예: 매일 30분 조깅하기" value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
        <div className="input-group">
          <label>카테고리</label>
          <select value={category} onChange={(e)=>setCategory(e.target.value)}><option>운동</option><option>공부</option><option>독서</option></select>
        </div>
        <div className="input-group"><label>목표 내용 / 설명</label><textarea placeholder="목표에 대한 상세한 내용을 적어주세요..." style={{ height: '60px' }} value={desc} onChange={(e)=>setDesc(e.target.value)} /></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="input-group" style={{ flex: 1 }}><label>시작일</label><input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></div>
          <div className="input-group" style={{ flex: 1 }}><label>목표일 (마감일)</label><input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} /></div>
        </div>
        <div className="list-item" style={{ background: '#fff', marginTop: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>⏰ 리마인더 알림 설정</span>
          <label className="switch-label ml-auto">
            <input type="checkbox" className="switch-input" checked={notify} onChange={(e)=>setNotify(e.target.checked)} />
            <div className="switch-button"></div>
          </label>
        </div>
        <button className="dark-button del-btn" onClick={() => setView('main')}>취소</button>
      </div>
    </div>
  );
}

// ==========================================
// 2. 메인 대시보드 뷰 통합 제어 모듈
// ==========================================
function MainAppView({ setView, activeTab, setActiveTab, todos, setTodos, todoFilter, setTodoFilter, goals, setGoals, goalFilter, setGoalFilter, statsPeriod, setStatsPeriod, friendSearch, setFriendSearch, friends, setFriends, setSelectedGoalId, selectedGoalId, setResultType, setShowGoalResult, showGoalResult, resultType, onOpenMenu, selectedCalendarDay, setSelectedCalendarDay }: any) {
  
  const filteredTodos = todos.filter((t:any) => {
    if (todoFilter === 'today') return t.date === '2026-04-06';
    if (todoFilter === 'done') return t.done;
    return true;
  });

  const totalCount = filteredTodos.length;
  const doneCount = filteredTodos.filter((t:any) => t.done).length;
  const liveProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const renderItemRow = (t: any) => (
    <div key={t.id} className="list-item" style={{ background: '#fff' }}>
      <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', flex: 1 }} onClick={() => {
        setTodos(todos.map((item:any) => item.id === t.id ? {...item, done: !item.done} : item));
      }}>
        {t.done ? <CheckCircle2 size={18} color="#6c63ff" style={{ marginRight: 12 }} /> : <Circle size={18} color="#ccc" style={{ marginRight: 12 }} />}
        <span style={{ fontWeight: '600', fontSize: '14px', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#aaa' : '#333' }}>
          {t.title}
        </span>
      </div>
      <MoreVertical size={16} className="cursor-pointer" color="#b5b1bc" onClick={() => {
        if (confirm('이 일정을 삭제하시겠습니까?')) setTodos(todos.filter((item:any) => item.id !== t.id));
      }} />
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'todo': 
        const regularTodos = filteredTodos.filter((t: any) => t.type === 'todo' || !t.type);
        const routineTodos = filteredTodos.filter((t: any) => t.type === 'routine');

        return (
          <>
            <div className="header-row">
              <Menu size={22} color="#4e4b52" className="cursor-pointer" onClick={onOpenMenu} />
              <h3 className="header-title">할 일</h3>
              <Bell size={22} onClick={() => setView('noti')} className="cursor-pointer" color="#4e4b52" />
            </div>
            <div className="filter-tabs">
              <button className={`chip ${todoFilter === 'all' ? 'active' : ''}`} onClick={() => setTodoFilter('all')}>전체</button>
              <button className={`chip ${todoFilter === 'today' ? 'active' : ''}`} onClick={() => setTodoFilter('today')}>오늘</button>
              <button className={`chip ${todoFilter === 'done' ? 'active' : ''}`} onClick={() => setTodoFilter('done')}>완료</button>
            </div>
            <div className="scroll-content">
              <div className="dashboard-card">
                <span style={{ fontSize: '12px', color: '#6c63ff', fontWeight: '700' }}>오늘의 미션 종합 달성도</span>
                <h3>{liveProgress}% 완료</h3>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${liveProgress}%` }}></div></div>
                <small style={{ color: '#7a7680', marginTop: '6px', display: 'block', fontSize: '11px' }}>
                  남은 미션: {filteredTodos.filter((t:any)=>!t.done).length}개
                </small>
              </div>

              {todoFilter === 'done' ? (
                filteredTodos.map(renderItemRow)
              ) : (
                <>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#4e4b52', margin: '14px 0 8px 4px' }}>
                    📌 일반 할 일 ({regularTodos.length}개)
                  </div>
                  {regularTodos.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '10px 0' }}>할 일이 없습니다.</p>
                  ) : regularTodos.map(renderItemRow)}

                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#6c63ff', margin: '20px 0 8px 4px' }}>
                    🔄 반복 루틴 ({routineTodos.length}개)
                  </div>
                  {routineTodos.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '10px 0' }}>지정된 반복 루틴이 없습니다.</p>
                  ) : routineTodos.map(renderItemRow)}
                </>
              )}
            </div>
            <div className="fab" onClick={() => setView('todo-add')}><Plus /></div>
          </>
        );

      case 'calendar': 
        const targetDateStr = `2026-04-${selectedCalendarDay < 10 ? '0' + selectedCalendarDay : selectedCalendarDay}`;
        const matchedCalendarTodos = todos.filter((t: any) => t.date === targetDateStr);

        return (
          <>
            <div className="header-row">
              <Menu size={22} color="#4e4b52" className="cursor-pointer" onClick={onOpenMenu} />
              <h3 className="header-title">달력</h3>
              <Bell size={22} onClick={() => setView('noti')} className="cursor-pointer" color="#4e4b52" />
            </div>
            <div className="scroll-content">
              <div style={{ background: '#fbfbff', border: '1px solid #f1f0f5', borderRadius: '24px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ color: '#1a191b', margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>2026년 4월</h4>
                <div className="calendar-grid">
                  {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="calendar-day-header">{d}</div>)}
                  {Array(3).fill(null).map((_, i) => <div key={`e-${i}`} className="calendar-cell empty"></div>)}
                  {Array(30).fill(null).map((_, i) => {
                    const dayNum = i + 1;
                    return (
                      <div 
                        key={dayNum} 
                        className={`calendar-cell ${dayNum === selectedCalendarDay ? 'active' : ''}`} 
                        onClick={() => setSelectedCalendarDay(dayNum)}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: '0 4px', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a191b' }}>
                  4월 {selectedCalendarDay}일 미션 목록 ({matchedCalendarTodos.length}개)
                </span>
              </div>

              {matchedCalendarTodos.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '24px', background: '#fff', borderRadius: '18px', border: '1px solid #f5f4f7' }}>
                  등록된 일정이 없습니다.
                </p>
              ) : (
                matchedCalendarTodos.map((t: any) => (
                  <div 
                    key={t.id} 
                    className="list-item" 
                    style={{ background: '#fff', justifyContent: 'space-between' }} 
                    onClick={() => {
                      setTodos(todos.map((item: any) => item.id === t.id ? {...item, done: !item.done} : item));
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {t.done ? <CheckCircle2 size={18} color="#6c63ff" style={{ marginRight: 10 }} /> : <Circle size={18} color="#ccc" style={{ marginRight: 10 }} />}
                      <span style={{ fontSize: '14px', fontWeight: '600', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#b5b1bc' : '#333' }}>
                        {t.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: t.type === 'routine' ? '#6c63ff' : '#aaa', background: t.type === 'routine' ? '#f4f3ff' : '#f0f0f2', padding: '2px 6px', borderRadius: '6px' }}>
                      {t.type === 'routine' ? '루틴' : '할일'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        );

      case 'goal': 
        const filteredGoals = goals.filter((g:any) => {
          if (goalFilter === 'active') return g.status === '진행중';
          if (goalFilter === 'success') return g.status === '성공';
          return true;
        });
        return (
          <>
            <div className="header-row">
              <Menu size={22} color="#4e4b52" className="cursor-pointer" onClick={onOpenMenu} />
              <h3 className="header-title">목표</h3>
              <Bell size={22} onClick={() => setView('noti')} className="cursor-pointer" color="#4e4b52" />
            </div>
            <div className="filter-tabs">
              <button className={`chip ${goalFilter === 'all' ? 'active' : ''}`} onClick={() => setGoalFilter('all')}>전체</button>
              <button className={`chip ${goalFilter === 'active' ? 'active' : ''}`} onClick={() => setGoalFilter('active')}>진행중</button>
              <button className={`chip ${goalFilter === 'success' ? 'active' : ''}`} onClick={() => setGoalFilter('success')}>성공</button>
            </div>
            <div className="scroll-content">
              <div className="dashboard-card" style={{ background: '#586589', color: 'white' }}>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>나의 전체 달성률</span>
                <h2 style={{ fontSize: '26px', margin: '4px 0 10px 0', fontWeight: '800', color: '#fff' }}>72% <span style={{ fontSize: '13px', color: '#a5b4fc' }}>↗ +5%</span></h2>
                <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}><div className="progress-fill" style={{ width: '72%', background: 'white' }}></div></div>
              </div>
              {filteredGoals.map((g:any) => (
                <div key={g.id} className="list-item" style={{ paddingRight: '48px' }} onClick={() => {
                  setSelectedGoalId(g.id);
                  setResultType(g.status === '성공' ? 'success' : g.status === '실패' ? 'fail' : null);
                  setShowGoalResult(true);
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <b style={{ fontSize: '14px', color: '#1a191b' }}>{g.title}</b>
                      <span style={{ fontSize: '11px', color: g.status === '성공' ? '#2ecc71' : '#6c63ff', fontWeight: '700' }}>{g.status}</span>
                    </div>
                    <div className="progress-bar" style={{ margin: '4px 0 6px 0' }}><div className="progress-fill" style={{ width: `${g.progress}%`, background: g.status === '성공' ? '#2ecc71' : '#6c63ff' }}></div></div>
                    <span style={{ fontSize: '11px', color: '#b5b1bc' }}>{g.progress}% 달성 ({g.startDate} ~ {g.endDate})</span>
                  </div>
                  <Trash2 size={15} color="#ff4d4d" className="cursor-pointer" style={{ position: 'absolute', right: '16px', bottom: '18px', zIndex: 2 }} onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('이 목표를 삭제하시겠습니까?')) setGoals(goals.filter((item:any)=>item.id !== g.id));
                  }} />
                </div>
              ))}
            </div>
            <div className="fab" onClick={() => setView('goal-add')}><Plus /></div>
          </>
        );

      case 'stats': return (
        <>
          <div className="header-row">
            <Menu size={22} color="#4e4b52" className="cursor-pointer" onClick={onOpenMenu} />
            <h3 className="header-title">통계</h3>
            <Bell size={22} onClick={() => setView('noti')} className="cursor-pointer" color="#4e4b52" />
          </div>
          <div className="filter-tabs" style={{ justifyContent: 'center' }}>
            <button className={`chip ${statsPeriod === 'week' ? 'active' : ''}`} onClick={() => setStatsPeriod('week')}>주간</button>
            <button className={`chip ${statsPeriod === 'month' ? 'active' : ''}`} onClick={() => setStatsPeriod('month')}>월간</button>
            <button className={`chip ${statsPeriod === 'year' ? 'active' : ''}`} onClick={() => setStatsPeriod('year')}>연간</button>
          </div>
          <div className="scroll-content">
            <div style={{ display: 'flex', background: '#fbfbff', border: '1px solid #f1f0f5', borderRadius: '18px', padding: '16px', justifyContent: 'space-around', textAlign: 'center', marginBottom: '16px' }}>
              <div><p style={{ fontSize: '11px', color: '#7a7680' }}>총 목표</p><b style={{ fontSize: '16px', color: '#1a191b' }}>12</b></div>
              <div><p style={{ fontSize: '11px', color: '#7a7680' }}>성공</p><b style={{ fontSize: '16px', color: '#6c63ff' }}>67%</b></div>
              <div><p style={{ fontSize: '11px', color: '#7a7670' }}>실패</p><b style={{ fontSize: '16px', color: '#ff4d4d' }}>33%</b></div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', marginLeft: '4px' }}>달성 추이</div>
            <div className="bar-chart-wrapper">
              <div className="chart-bar-container"><div className="chart-bar" style={{ height: '40px' }}></div><span className="chart-label">2월(40%)</span></div>
              <div className="chart-bar-container"><div className="chart-bar" style={{ height: '65px' }}></div><span className="chart-label">3월(65%)</span></div>
              <div className="chart-bar-container"><div className="chart-bar active" style={{ height: '90px' }}></div><span className="chart-label">4월(80%)</span></div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', marginLeft: '4px', marginTop: '18px' }}>실패 원인 분석</div>
            <div style={{ background: '#fff', border: '1px solid #f1f0f5', borderRadius: '18px', padding: '14px', marginTop: '8px' }}>
              <div style={{ fontSize: '12px', margin: '4px 0' }}>⏱️ 시간 부족 (40%) <div className="progress-bar"><div className="progress-fill" style={{ width: '40%', background: '#ff4d4d' }}></div></div></div>
              <div style={{ fontSize: '12px', margin: '12px 0 4px 0' }}>🎯 동기 부족 (25%) <div className="progress-bar"><div className="progress-fill" style={{ width: '25%', background: '#ffb700' }}></div></div></div>
            </div>
          </div>
        </>
      );

      case 'friend': 
        return (
          <>
            <div className="header-row">
              <Menu size={22} color="#4e4b52" className="cursor-pointer" onClick={onOpenMenu} />
              <h3 className="header-title">친구</h3>
              <Bell size={22} onClick={() => setView('noti')} className="cursor-pointer" color="#4e4b52" />
            </div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input placeholder="친구 검색" value={friendSearch} onChange={(e)=>setFriendSearch(e.target.value)} style={{ paddingLeft: '40px' }} />
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '20px', color: '#b5b1bc' }} />
            </div>
            <div className="scroll-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7a7680', margin: '4px 0 8px 4px', fontWeight: '600' }}>
                <span>친구 목록 ({friends.length}명)</span>
              </div>
              {friends.filter((f:any)=>f.name.includes(friendSearch)).map((f:any) => (
                <div key={f.id} className="list-item" style={{ background: '#fff' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e4e7', marginRight: 12 }}></div>
                  <b>{f.name}</b>
                  <MoreVertical size={16} className="ml-auto" color="#b5b1bc" onClick={() => {
                    if(confirm('친구를 삭제하시겠습니까?')) setFriends([]);
                  }} />
                </div>
              ))}
            </div>
            <div className="fab" onClick={() => setView('friend-add')}><Plus /></div>
          </>
        );
    }
  };

  return (
    <div className="card" style={{ paddingBottom: '80px' }}>
      {renderTabContent()}
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}><ClipboardList size={22} /><span>할 일</span></div>
        <div className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}><Calendar size={22} /><span>달력</span></div>
        <div className={`nav-item ${activeTab === 'goal' ? 'active' : ''}`} onClick={() => setActiveTab('goal')}><Flag size={22} /><span>목표</span></div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><BarChart2 size={22} /><span>통계</span></div>
        <div className={`nav-item ${activeTab === 'friend' ? 'active' : ''}`} onClick={() => setActiveTab('friend')}><Users size={22} /><span>친구</span></div>
      </div>

      {showGoalResult && (
        <div className="bottom-sheet-overlay" onClick={() => setShowGoalResult(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>결과 상태 업데이트</h3>
            <div className="result-toggle-group">
              <button className={`result-btn success ${resultType === 'success' ? 'active' : ''}`} onClick={() => setResultType('success')}><Check size={16} /> 성공</button>
              <button className={`result-btn fail ${resultType === 'fail' ? 'active' : ''}`} onClick={() => setResultType('fail')}><X size={16} /> 실패</button>
            </div>
            <button className="primary-button" onClick={() => {
              if(selectedGoalId) {
                setGoals(goals.map((g:any) => g.id === selectedGoalId ? {
                  ...g, 
                  status: resultType === 'success' ? '성공' : resultType === 'fail' ? '실패' : '진행중',
                  progress: resultType === 'success' ? 100 : g.progress
                } : g));
              }
              setShowGoalResult(false);
            }}>변동 사항 반영 저장</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. 메인 부모 시스템 아키텍처 제어 허브
// ==========================================
function App() {
  const [view, setView] = useState<string>('login');
  const [activeTab, setActiveTab] = useState<string>('todo');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [todos, setTodos] = useState([
    { id: 1, title: '프로젝트 보고서 작성', memo: '최종 수정본 제출 필수', date: '2026-04-06', time: '14:00', done: false, priority: 'high', type: 'todo' },
    { id: 2, title: '운동 30분 (러닝머신)', memo: '페이스 유지', date: '2026-04-06', time: '18:00', done: false, priority: 'normal', type: 'todo' },
    { id: 3, title: '한국사 인강 듣기', memo: '심화 과정 벼락치기', date: '2026-04-05', time: '10:00', done: true, priority: 'low', type: 'todo' },
    { id: 4, title: '매일 영단어 20개 외우기', memo: '출퇴근 시간 활용', date: '2026-04-06', time: '09:00', done: true, priority: 'high', type: 'routine' },
    { id: 5, title: '물고기 밥 주기', memo: '잊지 말고 꼬박꼬박', date: '2026-04-06', time: '21:00', done: false, priority: 'high', type: 'routine' }
  ]);

  const [goals, setGoals] = useState([
    { id: 1, title: '매일 운동 30분', category: '운동', desc: '주 5회 목표', startDate: '2026-03-01', endDate: '2026-03-31', progress: 60, status: '진행중', reason: '', memo: '' },
    { id: 2, title: '주 3회 독서하기', category: '독서', desc: '한 달에 두 권 완독', startDate: '2026-03-01', endDate: '2026-03-31', progress: 100, status: '성공', reason: '', memo: '' }
  ]);

  const [friends, setFriends] = useState([
    { id: 1, name: '홍길동', handle: '@gildong1', isFriend: true, requestSent: false }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'todo', title: '할 일 마감 임박', desc: '프로젝트 보고서 마감이 1시간 남았습니다', time: '1시간 전', unread: true },
    { id: 2, type: 'goal', title: '목표 달성!', desc: '영어 공부 목표를 달성했습니다', time: '3시간 전', unread: true }
  ]);

  const [todoFilter, setTodoFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [notiFilter, setNotiFilter] = useState<string>('all');
  const [statsPeriod, setStatsPeriod] = useState<string>('month');
  const [friendSearch, setFriendSearch] = useState<string>('');
  
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [showGoalResult, setShowGoalResult] = useState<boolean>(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(6);
  const [resultType, setResultType] = useState<'success' | 'fail' | null>(null);

  const handleAddTodo = (title: string, memo: string, date: string, time: string, priority: string, type: string) => {
    setTodos([...todos, { id: Date.now(), title, memo, date, time, done: false, priority, type }]);
  };

  const handleAddGoal = (title: string, category: string, desc: string, startDate: string, endDate: string) => {
    setGoals([...goals, { id: Date.now(), title, category, desc, startDate, endDate, progress: 0, status: '진행중', reason: '', memo: '' }]);
  };

  return (
    <div className="container">
      {view === 'login' && <LoginView setView={setView} />}
      {view === 'register' && <RegisterView setView={setView} />}
      {view === 'error' && <ErrorView setView={setView} />}
      {view === 'noti' && <NotiView setView={setView} notifications={notifications} setNotifications={setNotifications} notiFilter={notiFilter} setNotiFilter={setNotiFilter} />}
      {view === 'main' && (
        <MainAppView
          setView={setView}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          todos={todos}
          setTodos={setTodos}
          todoFilter={todoFilter}
          setTodoFilter={setTodoFilter}
          goals={goals}
          setGoals={setGoals}
          goalFilter={goalFilter}
          setGoalFilter={setGoalFilter}
          statsPeriod={statsPeriod}
          setStatsPeriod={setStatsPeriod}
          friendSearch={friendSearch}
          setFriendSearch={setFriendSearch}
          friends={friends}
          setFriends={setFriends}
          setSelectedGoalId={setSelectedGoalId}
          selectedGoalId={selectedGoalId}
          setResultType={setResultType}
          setShowGoalResult={setShowGoalResult}
          showGoalResult={showGoalResult}
          resultType={resultType}
          onOpenMenu={() => setIsSidebarOpen(true)}
          selectedCalendarDay={selectedCalendarDay}
          setSelectedCalendarDay={setSelectedCalendarDay}
        />
      )}
      {view === 'todo-add' && <TodoAddView setView={setView} onAddTodo={handleAddTodo} />}
      {view === 'goal-add' && <GoalAddView setView={setView} onAddGoal={handleAddGoal} />}

      {/* 마이페이지 사이드바 슬라이드 오버레이 */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="sidebar-content" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-profile">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e9e7ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <User color="#6c63ff" size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>마이페이지</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#b5b1bc' }}>Cyber Security 전공</p>
                </div>
              </div>
            </div>
            
            <div className="sidebar-menu-item" onClick={() => alert('덕성여자대학교 사이버보안전공 / 목표 관리 앱 버전 1.0.0')}>
              <User size={18} />
              <span>내 정보 보기</span>
            </div>

            <div className="sidebar-menu-item" style={{ marginTop: 'auto', color: '#ff4d4d' }} onClick={() => {
              if (confirm('정말로 Goal Tracker 서비스에서 탈퇴하시겠습니까?\n모든 일정과 목표 데이터가 영구적으로 파괴됩니다.')) {
                setIsSidebarOpen(false);
                setView('login');
              }
            }}>
              <LogOut size={18} />
              <span>회원 탈퇴</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;