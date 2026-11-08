import { useState, useEffect, Fragment } from 'react';
import {
  Mail, Lock, Eye, ChevronLeft, Flag, Bell,
  CheckCircle2, Circle,
  Plus, Calendar, BarChart2, ClipboardList, Repeat,
  AlertCircle, RotateCcw, X, Check, Menu, Trash2, LogOut, User, Pencil, Settings, ArrowUpDown
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
      if (!response.ok) {
        alert(await readError(response));
        return;
      }
      alert('회원가입이 정상적으로 완료되었습니다!');

      // 가입한 정보로 바로 로그인까지 진행
      const loginRes = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (loginRes.ok) {
        const data = await loginRes.json();
        const token = data.token || data.accessToken;
        if (token) {
          localStorage.setItem('token', token);
          setView('main');
          return;
        }
      }
      // 자동 로그인이 안 되면 로그인 화면으로
      setView('login');
    } catch (error) {
      console.error(error);
      alert('서버와 통신할 수 없습니다. 백엔드가 켜져 있는지 확인해주세요.');
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
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '8px 0', color: '#1a191b' }}>새로운 시작을 함께해요</h2>
          <p style={{ fontSize: '13px', color: '#7a7680' }}>간단한 정보를 입력하고 서비스를 시작하세요.</p>
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

function NotiView({ setView, notifications, notiFilter, setNotiFilter, onRead, onOpenSettings }: any) {
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
        <Settings size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenSettings} />
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

        <div style={{ fontSize: '13px', fontWeight: '700', color: '#b5b1bc', marginBottom: '12px', marginLeft: '4px' }}>최근 알림</div>
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
               onClick={() => onRead(n)}
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

// ===== 공통: 서버 에러 메시지 꺼내기 =====
const readError = async (res: Response) => {
  try {
    const d = await res.json();
    return d?.message || `오류 코드 ${res.status}`;
  } catch {
    return `오류 코드 ${res.status}`;
  }
};
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
};

// ===== 서버 알림 -> 화면용 형태 =====
const formatNotiTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return d.toDateString() === new Date().toDateString() ? `오늘 ${hh}:${mm}` : `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
};
const toServerNoti = (n: any) => {
  const isDeadline = n.type === 'DEADLINE';
  return {
    id: `server-${n.notificationId}`,
    serverId: n.notificationId,
    type: isDeadline ? 'deadline' : 'summary',
    icon: isDeadline ? '⏰' : '📋',
    title: isDeadline ? '마감 임박' : '오늘의 할 일',
    desc: n.message,
    time: formatNotiTime(n.createdAt),
    unread: !n.read,
  };
};

// ===== 프로필 수정 =====
function ProfileView({ setView, userProfile, setUserProfile }: any) {
  const [name, setName] = useState(userProfile?.name === '사용자' ? '' : userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email === '이메일 없음' ? '' : userProfile?.email || '');

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return alert('닉네임과 이메일을 모두 입력해주세요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return alert('이메일 형식이 올바르지 않습니다.');
    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) return alert(`프로필 수정에 실패했습니다.\n${await readError(res)}`);
      const data = await res.json().catch(() => ({}));
      setUserProfile({ name: data?.name || name.trim(), email: data?.email || email.trim() });
      alert('프로필이 수정되었습니다.');
      setView('main');
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">프로필 수정</h3>
        <span className="text-link" onClick={handleSave}>저장</span>
      </div>
      <div className="scroll-content">
        <div className="input-group"><label>👤 닉네임</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="닉네임" /></div>
        <div className="input-group"><label>✉️ 이메일</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" /></div>
        <p style={{ fontSize: '12px', color: '#b5b1bc', marginTop: '8px' }}>이메일을 바꾸면 다음 로그인부터 새 이메일을 사용해요.</p>
      </div>
    </div>
  );
}

// ===== 비밀번호 변경 =====
function PasswordView({ setView }: any) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const handleSave = async () => {
    if (!current || !next || !confirmPw) return alert('모든 칸을 입력해주세요.');
    if (next !== confirmPw) return alert('새 비밀번호가 서로 일치하지 않습니다.');
    if (next === current) return alert('현재 비밀번호와 다른 비밀번호를 입력해주세요.');
    try {
      const res = await fetch(`${BASE_URL}/api/users/password`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (!res.ok) return alert(`비밀번호 변경에 실패했습니다.\n${await readError(res)}`);
      alert('비밀번호가 변경되었습니다.');
      setView('main');
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">비밀번호 변경</h3>
        <span className="text-link" onClick={handleSave}>저장</span>
      </div>
      <div className="scroll-content">
        <div className="input-group"><label>🔒 현재 비밀번호</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="현재 비밀번호" /></div>
        <div className="input-group"><label>🔑 새 비밀번호</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="새 비밀번호" /></div>
        <div className="input-group"><label>🔑 새 비밀번호 확인</label>
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="새 비밀번호 다시 입력" /></div>
      </div>
    </div>
  );
}

// ===== 루틴 관리 (일시중지 포함 전체 루틴) =====
function RoutineManageView({ setView, onEditRoutine, onDeleteRoutine }: any) {
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
      setRoutines(prev => prev.map(x => x.routineId === r.routineId ? { ...x, active: updated ? updated.active : !x.active } : x));
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">루틴 관리</h3>
        <div style={{ width: 24 }} />
      </div>
      <div className="scroll-content">
        <p style={{ fontSize: '12px', color: '#b5b1bc', margin: '0 4px 16px' }}>일시중지한 루틴은 할 일 화면에 나타나지 않아요.</p>
        {loading && <p style={{ color: '#b5b1bc', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>불러오는 중...</p>}
        {!loading && failed && <p style={{ color: '#b5b1bc', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>루틴 목록을 불러오지 못했습니다.</p>}
        {!loading && !failed && routines.length === 0 && <p style={{ color: '#b5b1bc', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>등록된 루틴이 없습니다.</p>}
        {!loading && !failed && routines.map((r: any) => (
          <div key={r.routineId} style={{ background: '#fff', border: '1px solid #f1f0f5', borderRadius: '20px', padding: '18px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', opacity: r.active ? 1 : 0.55 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a191b', marginBottom: '6px' }}>{r.title}</div>
              <div style={{ fontSize: '12px', color: '#7a7680' }}>🔁 {dayText(r.repeatDays)}{r.active ? '' : '  ·  일시중지됨'}</div>
            </div>
            <div role="switch" aria-checked={!!r.active} aria-label={`${r.title} ${r.active ? '일시중지' : '다시 시작'}`}
                 onClick={() => toggleActive(r)} className="cursor-pointer"
                 style={{ width: 44, height: 26, borderRadius: 13, background: r.active ? '#586589' : '#d9d7e0', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: r.active ? 21 : 3, transition: 'left 0.2s' }} />
            </div>
            <Pencil size={18} color="#b5b1bc" className="cursor-pointer" onClick={() => onEditRoutine(r)} />
            <Trash2 size={18} color="#ff4d4d" className="cursor-pointer" onClick={async () => {
              if (!confirm('이 루틴을 삭제하시겠습니까?')) return;
              await onDeleteRoutine(r.routineId);
              load();
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function NotiSettingsView({ setView, backTo = 'main' }: any) {
  const [perm, setPerm] = useState<string>(typeof Notification !== 'undefined' ? Notification.permission : 'denied');

  const requestPerm = async () => {
    if (typeof Notification === 'undefined') return alert('이 브라우저는 알림을 지원하지 않아요.');
    if (Notification.permission === 'denied') {
      return alert('이 사이트의 알림이 차단되어 있어요.\n\n브라우저 설정에서 이 사이트를 "허용"으로 바꿔주세요.');
    }
    const result = await Notification.requestPermission();
    setPerm(result);
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView(backTo)} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">알림 설정</h3>
        <div style={{ width: 24 }} />
      </div>
      <div className="scroll-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', border: '1px solid #f1f0f5', borderRadius: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a191b' }}>기기 알림</div>
            <div style={{ fontSize: '12px', color: '#b5b1bc', marginTop: '4px' }}>
              {perm === 'granted' ? '켜져 있습니다' : perm === 'denied' ? '브라우저에서 차단됨' : '꺼져 있습니다'}
            </div>
          </div>
          {perm !== 'granted' && (
            <button className="chip" onClick={requestPerm}>켜기</button>
          )}
        </div>

        <div style={{ background: '#f5f4ff', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#6c63ff', marginBottom: '6px' }}>준비 중</div>
          <div style={{ fontSize: '13px', color: '#7a7680', lineHeight: 1.6 }}>
            할 일·루틴별 알림 시점 설정은<br />목표 기능 정리 후 추가할 예정이에요.
          </div>
        </div>
      </div>
    </div>
  );
}

const DAY_OPTIONS = [
  { v: 'MONDAY', l: '월' }, { v: 'TUESDAY', l: '화' }, { v: 'WEDNESDAY', l: '수' },
  { v: 'THURSDAY', l: '목' }, { v: 'FRIDAY', l: '금' }, { v: 'SATURDAY', l: '토' }, { v: 'SUNDAY', l: '일' },
];
const ALL_DAYS = DAY_OPTIONS.map(d => d.v);
const sortDays = (days: string[]) => ALL_DAYS.filter(d => days.includes(d));

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

// ===== 통계 계산 =====
const DOW_KEYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// 통계에 필요한 기간: 요약은 최근 3개월, 그래프는 이번 주/이번 달/올해
const statsRanges = (today: Date) => {
  const summaryStart = addDays(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const weekStart = addDays(today, -today.getDay());
  const fetchStart = [summaryStart, yearStart, weekStart].reduce((a, b) => (a < b ? a : b));
  return { summaryStart, yearStart, weekStart, fetchStart };
};

type DayStat = { expected: number; done: number };

// 그 날짜에 달력에 보이는 루틴인지 (켜져 있고, 요일이 맞고, 시작일~종료일 사이)
// 종료일은 '이 날부터 안 보임'을 뜻한다
const isScheduledOn = (r: any, k: string, dow: string) =>
  r.active !== false &&
  Array.isArray(r.repeatDays) && r.repeatDays.includes(dow) &&
  (!r.startDate || String(r.startDate).slice(0, 10) <= k) &&
  (!r.endDate || k < String(r.endDate).slice(0, 10));

const groupDoneRecords = (records: any[]) => {
  const byDate: Record<string, any[]> = {};
  records.forEach((r: any) => {
    if (r.completed === false) return;
    const k = String(r.recordDate).slice(0, 10);
    (byDate[k] = byDate[k] || []).push(r);
  });
  return byDate;
};

// 날짜마다 "해야 했던 루틴"과 "실제로 한 루틴"을 루틴 단위로 센다.
// 체크한 루틴은 그날 해야 했던 루틴에도 반드시 포함되므로 달성률이 100%를 넘지 않는다.
const buildDailyStats = (routines: any[], records: any[], start: Date, end: Date) => {
  const doneByDate = groupDoneRecords(records);
  const out: Record<string, DayStat> = {};
  for (let d = new Date(start); toDateStr(d) <= toDateStr(end); d = addDays(d, 1)) {
    const k = toDateStr(d);
    const dow = DOW_KEYS[d.getDay()];
    const expectedIds = new Set<any>(routines.filter((r: any) => isScheduledOn(r, k, dow)).map((r: any) => r.routineId));
    const doneIds = new Set<any>((doneByDate[k] || []).map((r: any) => r.routineId));
    doneIds.forEach(id => expectedIds.add(id));
    out[k] = { expected: expectedIds.size, done: doneIds.size };
  }
  return out;
};

const sumRange = (daily: Record<string, DayStat>, from: Date, to: Date) => {
  let e = 0, d = 0;
  for (let x = new Date(from); toDateStr(x) <= toDateStr(to); x = addDays(x, 1)) {
    const v = daily[toDateStr(x)];
    if (v) { e += v.expected; d += v.done; }
  }
  return { e, d };
};

// 기록이 하나도 없는 구간은 0%가 아니라 '기록 없음'(null)
const rangeRate = (daily: Record<string, DayStat>, from: Date, to: Date) => {
  const { e, d } = sumRange(daily, from, to);
  return e > 0 ? Math.round((d / e) * 100) : null;
};

// 요일별 달성률 (from~to 사이만)
const buildWeekdayStats = (daily: Record<string, DayStat>, from: Date, to: Date) => {
  const agg = Array.from({ length: 7 }, () => ({ expected: 0, done: 0 }));
  for (let x = new Date(from); toDateStr(x) <= toDateStr(to); x = addDays(x, 1)) {
    const v = daily[toDateStr(x)];
    if (!v) continue;
    agg[x.getDay()].expected += v.expected;
    agg[x.getDay()].done += v.done;
  }
  return agg.map((a, i) => ({
    label: WEEKDAY_KO[i],
    expected: a.expected,
    rate: a.expected > 0 ? Math.round((a.done / a.expected) * 100) : null,
  }));
};

// 카테고리별 루틴 달성률 (루틴 단위로 셈)
const buildCategoryStats = (routines: any[], records: any[], start: Date, end: Date) => {
  const doneByDate = groupDoneRecords(records);
  const exp: Record<string, number> = {};
  const done: Record<string, number> = {};
  for (let d = new Date(start); toDateStr(d) <= toDateStr(end); d = addDays(d, 1)) {
    const k = toDateStr(d);
    const dow = DOW_KEYS[d.getDay()];
    const catOf = new Map<any, string>();
    routines.forEach((r: any) => { if (isScheduledOn(r, k, dow)) catOf.set(r.routineId, r.category || '기타'); });
    (doneByDate[k] || []).forEach((rec: any) => {
      if (!catOf.has(rec.routineId)) catOf.set(rec.routineId, rec.category || '기타');
      const c = catOf.get(rec.routineId) as string;
      done[c] = (done[c] || 0) + 1;
    });
    catOf.forEach(c => { exp[c] = (exp[c] || 0) + 1; });
  }
  return Object.keys(exp).map(c => ({
    name: c, done: done[c] || 0, expected: exp[c],
    rate: Math.round(((done[c] || 0) / exp[c]) * 100),
  })).sort((a, b) => b.rate - a.rate);
};

// 지난 달 대비 증감률 (상대 비율: 14% -> 0% 이면 100% 감소)
const monthOverMonth = (daily: Record<string, DayStat>, today: Date) => {
  const thisM = sumRange(daily, new Date(today.getFullYear(), today.getMonth(), 1), today);
  const lastM = sumRange(daily, new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0));
  if (thisM.e === 0 || lastM.e === 0) return { kind: 'none' as const };
  const now = thisM.d / thisM.e;
  const before = lastM.d / lastM.e;
  if (before === 0) return now === 0 ? { kind: 'same' as const } : { kind: 'fromZero' as const, now: Math.round(now * 100) };
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return { kind: 'same' as const };
  return { kind: pct > 0 ? ('up' as const) : ('down' as const), pct: Math.abs(pct) };
};

// 달성률이 가장 낮은 항목들 (동점이면 전부)
const lowestOf = <T extends { rate: number | null }>(items: T[]) => {
  const valid = items.filter(x => x.rate !== null);
  if (valid.length === 0) return [];
  const min = Math.min(...valid.map(x => x.rate as number));
  return valid.filter(x => x.rate === min);
};



// 루틴과 목표가 함께 쓰는 카테고리
const CATEGORIES = ['공부', '업무', '운동', '건강', '취미', '자기 관리', '생활 습관', '기타'];
// 예전에 저장된 카테고리(독서 등)도 목록에서 사라지지 않도록
const categoryOptions = (current?: string) =>
  current && !CATEGORIES.includes(current) ? [current, ...CATEGORIES] : CATEGORIES;

// 시간 선택용 (오전/오후 + 12시간)
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const BASE_MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

// 2026-02-31 처럼 달력에 없는 날짜를 걸러낸다
const isRealDate = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (y < 2000 || y > 2100 || m < 1 || m > 12) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
};

const isRealTime = (s: string) => {
  if (!/^\d{2}:\d{2}$/.test(s || '')) return false;
  const [h, m] = s.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
};

function TodoAddView({ setView, onAddTodo, onUpdateTodo, onUpdateRoutine, editingItem, editingKind, globalDate }: any) {
  const isEdit = !!editingItem;
  const isRoutineEdit = isEdit && editingKind === 'routine';

  const [title, setTitle] = useState(editingItem?.title || '');
  const [memo, setMemo] = useState(editingItem?.description || '');
  const [date, setDate] = useState(editingItem?.todoDate || globalDate);
  const [time, setTime] = useState(editingItem?.todoTime ? String(editingItem.todoTime).slice(0, 5) : '14:00');
  // 기본값은 '보통'
  const [priority, setPriority] = useState(
    editingItem?.priority === 'HIGH' ? 'high' : editingItem?.priority === 'LOW' ? 'low' : 'normal'
  );
  const [category, setCategory] = useState(editingItem?.category || '공부');
  const [type, setType] = useState(isRoutineEdit ? 'routine' : 'todo');
  const [repeatDays, setRepeatDays] = useState<string[]>(
    Array.isArray(editingItem?.repeatDays) ? sortDays(editingItem.repeatDays) : []
  );
  const isRoutine = isRoutineEdit || (!isEdit && type === 'routine');
  const toggleDay = (d: string) =>
    setRepeatDays(prev => sortDays(prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]));

  // 오전/오후 + 시 + 분 조합 (내부 값은 "HH:MM" 24시간)
  const safeTime = isRealTime(time) ? time : '14:00';
  const hour24 = Number(safeTime.slice(0, 2));
  const minutePart = safeTime.slice(3, 5);
  const meridiem: 'AM' | 'PM' = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minuteOptions = BASE_MINUTES.includes(minutePart) ? BASE_MINUTES : [...BASE_MINUTES, minutePart].sort();
  const setTimeParts = (m: 'AM' | 'PM', h12: number, min: string) => {
    const h = (h12 % 12) + (m === 'PM' ? 12 : 0);
    setTime(`${String(h).padStart(2, '0')}:${min}`);
  };

  const handleSave = () => {
    if (!title.trim()) return alert('제목을 입력하세요.');
    if (isRoutine && repeatDays.length === 0) return alert('반복할 요일을 하나 이상 선택하세요.');
    if (!isRoutine) {
      if (!isRealDate(date)) return alert('날짜를 다시 확인해주세요. 달력에 없는 날짜입니다.');
      if (!isRealTime(time)) return alert('시간을 다시 확인해주세요. 존재하지 않는 시간입니다.');
    }
    if (isRoutineEdit) onUpdateRoutine(editingItem, title, memo, repeatDays, category);
    else if (isEdit) onUpdateTodo(editingItem.todoId || editingItem.id, title, memo, date, time, priority);
    else onAddTodo(title, memo, date, time, priority, type, repeatDays, category);
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
        {isRoutine ? (
          <div className="input-group">
            <label>🔁 반복 요일</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {DAY_OPTIONS.map(d => (
                <button key={d.v} className={`chip ${repeatDays.includes(d.v) ? 'active' : ''}`} onClick={() => toggleDay(d.v)}
                  style={{ flex: 1, minWidth: 0, padding: '8px 0', textAlign: 'center' }}>
                  {d.l}
                </button>
              ))}
            </div>
            <div className="filter-tabs" style={{ marginTop: '8px' }}>
              <button className="chip" onClick={() => setRepeatDays(ALL_DAYS)}>매일</button>
              <button className="chip" onClick={() => setRepeatDays(ALL_DAYS.slice(0, 5))}>평일</button>
              <button className="chip" onClick={() => setRepeatDays(ALL_DAYS.slice(5))}>주말</button>
            </div>
            <label style={{ marginTop: '20px' }}>카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categoryOptions(editingItem?.category).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <>
            <div className="input-group"><label>📅 날짜 지정</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>

            <div className="input-group">
              <label>🕒 시간 지정</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button className={`chip ${meridiem === 'AM' ? 'active' : ''}`} style={{ padding: '10px 14px' }}
                        onClick={() => setTimeParts('AM', hour12, minutePart)}>오전</button>
                <button className={`chip ${meridiem === 'PM' ? 'active' : ''}`} style={{ padding: '10px 14px' }}
                        onClick={() => setTimeParts('PM', hour12, minutePart)}>오후</button>
                <select value={hour12} style={{ flex: 1, minWidth: 0 }}
                        onChange={(e) => setTimeParts(meridiem, Number(e.target.value), minutePart)}>
                  {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}시</option>)}
                </select>
                <select value={minutePart} style={{ flex: 1, minWidth: 0 }}
                        onChange={(e) => setTimeParts(meridiem, hour12, e.target.value)}>
                  {minuteOptions.map(m => <option key={m} value={m}>{m}분</option>)}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>⭐ 중요도</label>
              <div className="filter-tabs">
                {['high', 'normal', 'low'].map(p => (
                  <button key={p} className={`chip ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                    {p === 'high' ? '높음' : p === 'normal' ? '보통' : '낮음'}
                  </button>
                ))}
              </div>
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
  const [category, setCategory] = useState(editingGoal?.category || '공부');
  const [desc, setDesc] = useState(editingGoal?.desc || editingGoal?.description || '');
  const [startDate, setStartDate] = useState(editingGoal?.startDate || globalDate);
  const [endDate, setEndDate] = useState(editingGoal?.endDate || globalDate);
  const [reminder, setReminder] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return alert('목표를 입력하세요.');
    if (!isRealDate(startDate)) return alert('시작일을 다시 확인해주세요. 달력에 없는 날짜입니다.');
    if (!isRealDate(endDate)) return alert('목표일을 다시 확인해주세요. 달력에 없는 날짜입니다.');
    if (endDate < startDate) return alert('마감일은 시작일 이후여야 합니다.');
    // 저장에 실패하면 입력한 내용이 사라지지 않도록 화면을 그대로 둔다
    const ok = isEdit
      ? await onUpdateGoal(editingGoal, title, category, desc, startDate, endDate)
      : await onAddGoal(title, category, desc, startDate, endDate);
    if (ok !== false) setView('main');
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
            {categoryOptions(editingGoal?.category).map(c => <option key={c} value={c}>{c}</option>)}
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
  onEditTodo, onEditRoutine, onEditGoal,
  statsRecords = [], allRoutines = []
}: any) {
  
  const [failReasons, setFailReasons] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');
  // 달력에서 날짜를 더블클릭하면 열리는 '그 날짜의 미션' 페이지 (하단 탭은 달력 그대로)
  const [dayPageOpen, setDayPageOpen] = useState(false);
  // 달력 상단의 연도·월 선택 창
  const [pickerOpen, setPickerOpen] = useState<'year' | 'month' | null>(null);

  // 오늘의 미션 탭은 언제나 오늘 날짜만 보여준다
  const goTab = (tab: string) => {
    setDayPageOpen(false);
    setPickerOpen(null);
    if (tab === 'todo') setGlobalDate(getTodayStr());
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

  // 중요도 순서: 높음 > 보통 > 낮음
  const PRIORITY_RANK: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sortItems = (list: any[]) => {
    const copy = [...list];
    if (sortBy === 'priority') {
      copy.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1));
    } else {
      // 시간 순 (시간이 없는 항목은 뒤로)
      copy.sort((a, b) => {
        const ta = a.todoTime ? String(a.todoTime).slice(0, 5) : '99:99';
        const tb = b.todoTime ? String(b.todoTime).slice(0, 5) : '99:99';
        return ta.localeCompare(tb);
      });
    }
    return copy;
  };

  const filteredTodos = sortItems(
    (todos || []).filter((t: any) => (todoFilter === 'done' ? isItemDone(t) : true))
  );
  const filteredRoutines = sortItems(
    (backendRoutines || []).filter((r: any) => (todoFilter === 'done' ? r.isCompleted === true : true))
  );

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
        <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }} onClick={() => onToggleTodo(id)}>
          {isDone ?
            <CheckCircle2 size={22} color="#6c63ff" style={{ marginRight: 12, flexShrink: 0 }} /> :
            <Circle size={22} color="#e5e4e7" style={{ marginRight: 12, flexShrink: 0 }} />
          }
          {/* 시간·중요도는 제목 위에 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {t.todoTime && (
                <span className="item-meta">{String(t.todoTime).slice(0, 5)}</span>
              )}
              <span className={`priority-badge ${priorityClass}`} style={t.todoTime ? undefined : { marginLeft: 0 }}>{priorityText}</span>
            </div>
            <span className="item-title" style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#b5b1bc' : '#333' }}>
              {t.title}
            </span>
          </div>
        </div>
        <Pencil size={18} className="cursor-pointer" color="#b5b1bc" style={{ marginRight: 12 }} onClick={(e) => { e.stopPropagation(); onEditTodo(t); }} />
        <Trash2 size={18} className="cursor-pointer" color="#b5b1bc" onClick={(e) => {
          e.stopPropagation();
          if (confirm('이 일정을 삭제하시겠습니까?')) onDeleteTodo(id);
        }} />
      </div>
    );
  };

  // 할 일 탭과 달력 탭에서 똑같이 쓰는 미션 목록 (일반 할 일 + 반복 루틴)
  // 달력 탭에서는 전체/완료 필터와 상관없이 그 날의 미션을 전부 보여준다
  const renderMissionLists = (ignoreFilter = false) => {
  const todoList = ignoreFilter ? sortItems(todos || []) : filteredTodos;
  const routineList = ignoreFilter ? sortItems(backendRoutines || []) : filteredRoutines;
  const doneMode = !ignoreFilter && todoFilter === 'done';
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 12px 4px', fontSize: '14px', fontWeight: '700', color: '#4e4b52' }}>
        <span style={{ color: '#ff4d4d', marginRight: '6px' }}>📌</span> 일반 할 일 ({todoList.length}개)
      </div>
      {todoList.length === 0 ? (
        <p style={{ color: '#b5b1bc', textAlign: 'center', fontSize: '13px', padding: '20px 0' }}>
          {doneMode ? '완료된 할 일이 없습니다.' : '할 일이 없습니다.'}
        </p>
      ) : todoList.map(renderItemRow)}

      <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0 12px 4px', fontSize: '14px', fontWeight: '700', color: '#6c63ff' }}>
        <span style={{ color: '#6c63ff', marginRight: '6px' }}>🔄</span> 반복 루틴 ({routineList.length}개)
      </div>
      {routineList.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#b5b1bc', textAlign: 'center', padding: '24px 0', borderRadius: '16px', border: '1px dashed #e0dcfc' }}>
          {doneMode ? '완료된 루틴이 없습니다.' : '루틴 기록이 비어있습니다.'}
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
                <CheckCircle2 size={22} color="#6c63ff" style={{ marginRight: 12, flexShrink: 0 }} /> :
                <Circle size={22} color="#e5e4e7" style={{ marginRight: 12, flexShrink: 0 }} />
              }
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                {(r.todoTime || pText || r.category) && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {r.todoTime && <span className="item-meta">{String(r.todoTime).slice(0, 5)}</span>}
                    {r.category && <span className="item-meta">{r.category}</span>}
                    {pText && <span className={`priority-badge ${pClass}`}>{pText}</span>}
                  </div>
                )}
                <span className="item-title" style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#b5b1bc' : '#333' }}>{title}</span>
              </div>
            </div>
            <Pencil size={18} className="cursor-pointer" color="#b5b1bc" style={{ marginRight: 12 }} onClick={(e) => { e.stopPropagation(); onEditRoutine(r); }} />
            <Trash2 size={18} className="cursor-pointer" color="#b5b1bc" onClick={(e) => {
              e.stopPropagation();
              if (confirm('이 루틴을 삭제하시겠습니까?')) onDeleteRoutine(id);
            }} />
          </div>
        );
      })}

      {/* 추가 버튼이 마지막 루틴의 수정·삭제 버튼을 가리지 않도록 넉넉히 비워둔다 */}
      <div style={{ textAlign: 'center', color: '#c9c5d0', fontSize: '12px', fontWeight: '600', lineHeight: 1.8, padding: '64px 0 69px' }}>
        꾸준한 실천으로 만드는 갓생 루틴!<br />Goal Tracker가 응원합니다.
      </div>
    </>
  );
  };

  // 전체/완료 필터 + 시간 순·중요도 순 정렬
  const renderFilterBar = () => (
    <div className="filter-tabs" style={{ marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className={`chip ${todoFilter === 'all' ? 'active' : ''}`} onClick={() => setTodoFilter('all')}>전체</button>
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

  const renderProgressCard = (label: string) => {
    const p = missionProgress();
    return (
      <div className="dashboard-card" style={{ background: '#f5f4ff', padding: '24px', borderRadius: '24px', textAlign: 'left', marginBottom: '32px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#6c63ff' }}>{label}</span>
        <h3 style={{ fontSize: '21px', fontWeight: '800', margin: '8px 0 6px 0', color: '#1a191b' }}>{p.rate}% 완료</h3>
        <span style={{ fontSize: '10.5px', color: '#7a7680', fontWeight: '500' }}>남은 미션 : {p.remain}개</span>
      </div>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'todo':
        return (
          <>
            <div className="header-row">
              <Menu size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenMenu} />
              <h3 className="header-title">오늘의 미션 <span style={{fontSize:'13px', color:'#6c63ff', marginLeft:'8px'}}>{calMonth}/{selectedCalendarDay} {WEEKDAY_KO[targetDateObj.getDay()]}</span></h3>
              <Bell size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenNoti} />
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
                <ChevronLeft size={22} className="cursor-pointer" color="#4e4b52" onClick={() => setDayPageOpen(false)} />
                <h3 className="header-title">
                  {calMonth}/{selectedCalendarDay} ({WEEKDAY_KO[targetDateObj.getDay()]}) 미션
                </h3>
                <Bell size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenNoti} />
              </div>
              <div className="scroll-content">
                {renderProgressCard('미션 종합 달성도')}
                {renderMissionLists(true)}
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
            <div className="header-row"><Menu size={22} className="cursor-pointer" onClick={onOpenMenu} /><h3 className="header-title">달력</h3><Bell size={22} color="#4e4b52" onClick={onOpenNoti} /></div>
            <div className="scroll-content">
              <div style={{ background: '#fbfbff', border: '1px solid #f1f0f5', borderRadius: '24px', padding: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <button className="chip" onClick={() => { setPickerOpen(null); handlePrevMonth(); }}>이전 달</button>
                  {/* 연도와 월을 눌러 바로 이동 */}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', gap: '6px' }}>
                    <span className="date-picker-btn" onClick={() => setPickerOpen(pickerOpen === 'year' ? null : 'year')}>{calYear}년</span>
                    <span className="date-picker-btn" onClick={() => setPickerOpen(pickerOpen === 'month' ? null : 'month')}>{calMonth}월</span>
                  </h4>
                  <button className="chip" onClick={() => { setPickerOpen(null); handleNextMonth(); }}>다음 달</button>
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
                    return (
                      <div key={dayNum} className={`calendar-cell ${dayNum === selectedCalendarDay ? 'active' : ''}`}
                           title="더블클릭하면 그 날짜의 미션이 열려요"
                           style={isToday ? {
                             border: '2px solid #6c63ff',
                             flexDirection: 'column',
                             gap: '3px',
                             lineHeight: 1,
                           } : undefined}
                           onClick={() => setGlobalDate(dateStr)}
                           onDoubleClick={() => { setGlobalDate(dateStr); setDayPageOpen(true); }}>
                        {dayNum}
                        {/* 오늘 날짜 표시 */}
                        {isToday && (
                          <span style={{ fontSize: '8px', fontWeight: '700', color: dayNum === selectedCalendarDay ? '#fff' : '#6c63ff' }}>오늘</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: '20px', fontWeight: '700', fontSize: '15px' }}>
                {calMonth}월 {selectedCalendarDay}일 미션
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: '500', color: '#7a7680' }}>
                종합 미션 달성률 {missionProgress().rate}%
              </div>
              {/* 달력에서도 할 일 페이지처럼 바로 완료 처리 가능 */}
              {renderMissionLists(true)}
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
  <Trash2 size={18} color="#b5b1bc" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); if(confirm('삭제하시겠습니까?')) onDeleteGoal(g.id); }} />
</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="fab" onClick={() => setView('goal-add')}><Plus /></div>
          </>
        );

      case 'stats': {
        const today = new Date();
        const thisYear = today.getFullYear();
        const { summaryStart, weekStart, fetchStart } = statsRanges(today);

        // 올해 + 최근 3개월을 한 번에 계산해 두고 필요한 구간만 꺼내 쓴다
        const daily = buildDailyStats(allRoutines || [], statsRecords || [], fetchStart, today);
        const hasRecentData = sumRange(daily, summaryStart, today).e > 0;

        // --- 기간별 그래프: 일간=이번 주, 주간=이번 달 주차, 월간=올해 ---
        const period = statsPeriod === 'day' ? 'day' : statsPeriod === 'month' ? 'month' : 'week';
        const chartData: { label: string; rate: number | null }[] = [];
        let periodDesc = '';

        if (period === 'day') {
          periodDesc = '이번 주 요일별 달성 통계를 보여드려요';
          for (let i = 0; i < 7; i++) {
            const d = addDays(weekStart, i);
            chartData.push({ label: WEEKDAY_KO[d.getDay()], rate: toDateStr(d) <= toDateStr(today) ? rangeRate(daily, d, d) : null });
          }
        } else if (period === 'week') {
          periodDesc = '이번 달 주차별 달성 통계를 보여드려요';
          // 달력의 한 줄(일~토)이 한 주차
          const first = new Date(today.getFullYear(), today.getMonth(), 1);
          const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
          for (let w = 0; w < weeks; w++) {
            const rowStart = addDays(first, w * 7 - first.getDay());
            const from = rowStart < first ? first : rowStart;
            const rowEnd = addDays(rowStart, 6);
            const to = rowEnd > last ? last : rowEnd;
            chartData.push({ label: `${w + 1}주차`, rate: toDateStr(from) <= toDateStr(today) ? rangeRate(daily, from, to < today ? to : today) : null });
          }
        } else {
          periodDesc = '이번 년도 월별 달성 통계를 보여드려요';
          for (let m = 0; m < 12; m++) {
            const from = new Date(thisYear, m, 1);
            const to = new Date(thisYear, m + 1, 0);
            chartData.push({ label: `${m + 1}월`, rate: from <= today ? rangeRate(daily, from, to < today ? to : today) : null });
          }
        }
        const maxRateValue = Math.max(0, ...chartData.map(c => c.rate ?? 0));

        // --- 요약 (최근 3개월 기준) ---
        const worstDays = lowestOf(buildWeekdayStats(daily, summaryStart, today));
        const mom = monthOverMonth(daily, today);
        const routineCats = buildCategoryStats(allRoutines || [], statsRecords || [], summaryStart, today);
        const worstRoutineCats = lowestOf(routineCats);

        // --- 목표: 올해 기준 ---
        const yearGoals = (goals || []).filter((g: any) => {
          const base = g.endDate || g.startDate || g.createdAt;
          return base ? Number(String(base).slice(0, 4)) === thisYear : false;
        });
        const goalCatMap: Record<string, { success: number; done: number; total: number }> = {};
        yearGoals.forEach((g: any) => {
          const c = g.category || '기타';
          if (!goalCatMap[c]) goalCatMap[c] = { success: 0, done: 0, total: 0 };
          goalCatMap[c].total++;
          if (g.status === '성공') { goalCatMap[c].success++; goalCatMap[c].done++; }
          if (g.status === '실패') goalCatMap[c].done++;
        });
        const goalCats = Object.keys(goalCatMap).map(c => {
          const v = goalCatMap[c];
          return { name: c, ...v, rate: v.done > 0 ? Math.round((v.success / v.done) * 100) : null };
        }).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));

        const failedGoals = yearGoals.filter((g: any) => g.status === '실패');
        const counts: Record<string, number> = { '⏱️ 시간 부족': 0, '🎯 동기 부족': 0, '🔋 체력 저하': 0, '📅 계획 오류': 0, '🌍 외부 요인': 0 };
        failedGoals.forEach((g: any) => {
          if (!g.reason) return;
          g.reason.split(',').map((r: string) => r.trim()).forEach((r: string) => {
            if (counts[r] !== undefined) counts[r]++;
          });
        });
        const dynamicFailData = Object.keys(counts).map(name => ({
          name,
          rate: failedGoals.length > 0 ? Math.round((counts[name] / failedGoals.length) * 100) : 0,
        }));

        // 저채도·중명도 보라 (요약에서 강조할 때)
        const MUTED_PURPLE = '#8478b0';

        const sectionTitle = (icon: any, text: string, sub: string, color: string) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 2px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1a191b', lineHeight: 1.2 }}>{text}</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: color }}>{sub}</div>
            </div>
          </div>
        );

        const barRow = (name: string, rate: number | null, note: string, color: string) => (
          <div key={name} style={{ fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '600', color: '#4e4b52' }}>
              <span>{name}</span>
              <span style={{ color: rate === null ? '#c9c5d0' : '#4e4b52' }}>
                {rate === null ? '기록 없음' : `${rate}%`}
                <span style={{ fontSize: '11px', color: '#c9c5d0', marginLeft: '6px' }}>{note}</span>
              </span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${rate ?? 0}%`, background: color, borderRadius: '4px' }}></div></div>
          </div>
        );

        // 요약 레포트: 동그란 글머리 + 항목 사이 여유
        const summaryLines: any[] = !hasRecentData
          ? ['아직 최근 3개월 루틴 기록이 없어요. 루틴을 만들고 체크해보세요.']
          : [
              worstDays.length > 0
                ? <>최근 3개월 간 트래커님은 <b style={{ color: MUTED_PURPLE }}>{worstDays.map(d => d.label).join(', ')}요일</b>에 가장 달성률이 저조했어요.</>
                : '아직 요일별로 비교할 기록이 부족해요.',
              mom.kind === 'none' ? '지난 달 기록이 없어 비교할 수 없어요.'
                : mom.kind === 'same' ? '지난 달과 달성률이 같아요.'
                : mom.kind === 'fromZero' ? <>지난 달 달성률이 0%라 증감률은 계산할 수 없지만, 이번 달은 <b>{mom.now}%</b>를 달성했어요.</>
                : <>지난 달 대비 달성률은 <b style={{ color: mom.kind === 'up' ? '#3f9a5a' : '#d0605e' }}>{mom.pct}% {mom.kind === 'up' ? '증가' : '감소'}</b>했어요.</>,
              worstRoutineCats.length > 0
                ? <>최근 3개월 간 <b style={{ color: MUTED_PURPLE }}>{worstRoutineCats.map(c => c.name).join(', ')}</b> 카테고리의 달성률이 가장 낮았어요.</>
                : '카테고리별로 비교할 기록이 부족해요.',
            ];

        return (
          <>
            <div className="header-row"><Menu size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenMenu} /><h3 className="header-title">통계</h3><Bell size={22} color="#4e4b52" onClick={onOpenNoti} /></div>
            <div className="scroll-content">
              <div style={{ fontSize: '12.5px', color: '#7a7680', lineHeight: 1.7, textAlign: 'left', marginBottom: '24px', fontWeight: '500' }}>
                올해의 <b style={{ color: '#6c63ff' }}>루틴 달성률</b>과 <b style={{ color: '#5b678c' }}>목표 달성률</b>을 보여드려요.
              </div>

              {/* ===================== 루틴 ===================== */}
              <div style={{ background: '#fbfbff', border: '1px solid #efedfa', borderRadius: '20px', padding: '18px 16px', marginBottom: '28px' }}>
                {sectionTitle(<Repeat size={16} color="#6c63ff" />, '루틴', `${thisYear}년`, '#6c63ff')}

                <div style={{ fontSize: '13px', fontWeight: '700', textAlign: 'left', marginLeft: '2px' }}>기간별 루틴 달성률</div>
                <div className="filter-tabs" style={{ padding: 0, margin: '10px 0 6px', gap: '8px' }}>
                  <button className={`chip ${period === 'day' ? 'active' : ''}`} onClick={() => setStatsPeriod('day')}>일간</button>
                  <button className={`chip ${period === 'week' ? 'active' : ''}`} onClick={() => setStatsPeriod('week')}>주간</button>
                  <button className={`chip ${period === 'month' ? 'active' : ''}`} onClick={() => setStatsPeriod('month')}>월간</button>
                </div>
                {/* 그래프 제목의 0.7배, 얇게 */}
                <div style={{ fontSize: '9px', fontWeight: '500', color: '#8e8a96', textAlign: 'left', marginLeft: '2px' }}>{periodDesc}</div>

                <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 8px 10px', background: '#fff', border: '1px solid #f1f0f5', borderRadius: '16px', marginTop: '10px' }}>
                  {chartData.map((item, idx) => {
                    const isTop = item.rate !== null && item.rate === maxRateValue && maxRateValue > 0;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '8px', color: '#b5b1bc', fontWeight: '600', minHeight: '10px' }}>{item.rate === null ? '' : `${item.rate}%`}</span>
                        <div title={item.rate === null ? '기록 없음' : `${item.rate}%`}
                             style={{ height: `${(item.rate ?? 0) * 1.0}px`, width: period === 'month' ? '12px' : '20px', background: isTop ? '#6c63ff' : '#e9e7ff', borderRadius: '5px', transition: '0.3s' }}></div>
                        <span style={{ fontSize: '9px', color: '#a9a5b0', fontWeight: '600', whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '26px 0 10px 2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>카테고리별 루틴 달성률</span>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#a9a5b0' }}>최근 3개월</span>
                </div>
                <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid #f1f0f5' }}>
                  {routineCats.length === 0
                    ? <div style={{ fontSize: '13px', color: '#b5b1bc', paddingBottom: '16px' }}>아직 기록이 없어요.</div>
                    : routineCats.map(c => barRow(c.name, c.rate, `${c.done}/${c.expected}`, '#6c63ff'))}
                </div>

                {/* 요약 레포트 (최근 3개월) */}
                <div className="stats-summary">
                  {summaryLines.map((l, i) => (
                    <div key={i} className="stats-summary-item">
                      <span className="stats-summary-dot" />
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ===================== 목표 ===================== */}
              <div style={{ background: '#fbfcff', border: '1px solid #e9edf6', borderRadius: '20px', padding: '18px 16px', marginBottom: '20px' }}>
                {sectionTitle(<Flag size={16} color="#5b678c" />, '목표', `${thisYear}년`, '#5b678c')}

                <div style={{ fontSize: '13px', fontWeight: '700', textAlign: 'left', marginLeft: '2px' }}>카테고리별 목표 달성률</div>
                <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid #f1f0f5', marginTop: '10px' }}>
                  {goalCats.length === 0
                    ? <div style={{ fontSize: '13px', color: '#b5b1bc', paddingBottom: '16px' }}>올해 등록한 목표가 없어요.</div>
                    : goalCats.map(c => barRow(c.name, c.rate, c.done > 0 ? `성공 ${c.success}/완료 ${c.done}` : `진행중 ${c.total}`, '#5b678c'))}
                </div>

                <div style={{ fontSize: '13px', fontWeight: '700', textAlign: 'left', margin: '26px 0 10px 2px' }}>실패 원인 분석</div>
                <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid #f1f0f5' }}>
                  {failedGoals.length === 0
                    ? <div style={{ fontSize: '13px', color: '#b5b1bc', paddingBottom: '16px' }}>올해 실패로 기록된 목표가 없어요.</div>
                    : dynamicFailData.map(f => barRow(f.name, f.rate, '', '#ff8a8a'))}
                </div>
              </div>

              <div style={{ height: '40px' }} />
            </div>
          </>
        );
      }
    }
  };

  return (
    <div className="card" style={{ paddingBottom: '80px' }}>
      {/* 탭마다 화면 구조가 달라서, key를 주어 탭이 바뀔 때 이전 탭의 요소가 남지 않도록 함 */}
      <Fragment key={activeTab}>{renderTabContent()}</Fragment>

      <div className="bottom-nav" style={{ justifyContent: 'space-around' }}>
        <div className={`nav-item ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => goTab('todo')}><ClipboardList size={22} /><span>오늘의 미션</span></div>
        <div className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => goTab('calendar')}><Calendar size={22} /><span>달력</span></div>
        <div className={`nav-item ${activeTab === 'goal' ? 'active' : ''}`} onClick={() => goTab('goal')}><Flag size={22} /><span>목표</span></div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => goTab('stats')}><BarChart2 size={22} /><span>통계</span></div>
      </div>

      {showGoalResult && (
        <div className="bottom-sheet-overlay" onClick={() => setShowGoalResult(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1a191b' }}>결과 상태 업데이트</h3>
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

  useEffect(() => {
    if (view === 'main') { setEditingItem(null); setEditingKind(null); setEditingGoal(null); }
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

  const handleAddTodo = async (title: string, memo: string, date: string, time: string, priority: string, type: string, repeatDays: string[] = [], category: string = '기타') => {
    const token = localStorage.getItem('token');
    try {
      if (type === 'routine') {
        const payload = { title, description: memo, category, repeatDays: repeatDays.length ? sortDays(repeatDays) : ALL_DAYS };
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

  const handleAddGoal = async (title: string, category: string, desc: string, startDate: string, endDate: string) => {
    const token = localStorage.getItem('token');
    try {
      const payload = { title, category, description: desc, startDate, endDate };
      const response = await fetch(`${BASE_URL}/api/goals`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify(payload)
      });
      if (response.ok) { fetchGoals(); return true; }
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

  const handleUpdateRoutine = async (r: any, title: string, memo: string, repeatDays: string[] = [], category?: string) => {
    const token = localStorage.getItem('token');
    const id = r.routineId || r.id;
    try {
      const response = await fetch(`${BASE_URL}/api/routines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ title, description: memo, category: category || r.category || '기타', repeatDays: repeatDays.length ? sortDays(repeatDays) : (r.repeatDays || ALL_DAYS) })
      });
      if (response.ok) fetchBackendRoutines();
      else alert(`수정에 실패했습니다. (오류 코드 ${response.status})`);
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  const handleUpdateGoal = async (g: any, title: string, category: string, desc: string, startDate: string, endDate: string) => {
    const token = localStorage.getItem('token');
    const id = g.id ?? g.goalId;
    try {
      // 목표 자체를 수정 (번호 · 성공/실패 결과는 그대로 유지)
      const res = await fetch(`${BASE_URL}/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ title, category, description: desc, startDate, endDate })
      });
      if (res.ok) { fetchGoals(); return true; }
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
  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('lastView');
      localStorage.removeItem('lastTab');
      setView('login');
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${BASE_URL}/api/users/me`, { 
          method: 'DELETE',
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (response.ok) {
          alert('회원 탈퇴가 완료되었습니다.');
          localStorage.removeItem('token');
          localStorage.removeItem('lastView');
          localStorage.removeItem('lastTab');
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
  } catch (e) { console.error('서버 알림 로딩 실패', e); }
};

// 통계 화면에서 쓸 데이터(올해 + 최근 3개월)를 한 번에 받아온다
  const fetchStatsData = async () => {
    if (!localStorage.getItem('token')) return;
    const end = new Date();
    const start = statsRanges(end).fetchStart;
    try {
      const [recRes, routRes] = await Promise.all([
        fetch(`${BASE_URL}/api/records/range?start=${toDateStr(start)}&end=${toDateStr(end)}`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/routines`, { headers: authHeaders() }),
      ]);
      if (recRes.ok) {
        const d = await recRes.json();
        if (Array.isArray(d)) setStatsRecords(d);
      } else {
        console.error('루틴 기록 조회 실패', recRes.status);
      }
      if (routRes.ok) {
        const d = await routRes.json();
        if (Array.isArray(d)) setAllRoutines(d);
      }
    } catch (e) {
      console.error('통계 데이터 로딩 실패', e);
    }
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
  const timer = setInterval(fetchServerNotifications, 60000);
  return () => clearInterval(timer);
}, [isLoggedInView, view]);
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

  // 통계 탭을 열 때만 불러온다
  useEffect(() => {
    if (view === 'main' && activeTab === 'stats') fetchStatsData();
  }, [view, activeTab]);

  
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
          onOpenSettings={() => { setNotiSettingsBack('noti'); setView('noti-settings'); }}
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
            statsRecords={statsRecords} allRoutines={allRoutines}
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'auto' }}>
                  {[
                    { key: 'profile', label: '프로필 수정', icon: <User size={18} style={{ marginRight: '12px' }} /> },
                    { key: 'password', label: '비밀번호 변경', icon: <Lock size={18} style={{ marginRight: '12px' }} /> },
                    { key: 'routines', label: '루틴 관리', icon: <RotateCcw size={18} style={{ marginRight: '12px' }} /> },
                    { key: 'noti-settings', label: '알림 설정', icon: <Bell size={18} style={{ marginRight: '12px' }} /> },
                  ].map(m => (
                    <div key={m.key} className="cursor-pointer"
                         style={{ background: '#f5f4ff', color: '#6c63ff', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '14px' }}
                         onClick={() => { setIsSidebarOpen(false); setNotiSettingsBack('main'); setView(m.key); }}>
                      {m.icon} {m.label}
                    </div>
                  ))}
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
      {view === 'profile' && <ProfileView setView={setView} userProfile={userProfile} setUserProfile={setUserProfile} />}
      {view === 'password' && <PasswordView setView={setView} />}
      {view === 'noti-settings' && <NotiSettingsView setView={setView} backTo={notiSettingsBack} />}
      {view === 'routines' && <RoutineManageView setView={setView} onEditRoutine={handleEditRoutine} onDeleteRoutine={handleDeleteRoutine} />}
      {view === 'goal-add' && <GoalAddView setView={setView} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} editingGoal={editingGoal} globalDate={globalDate} />}
    </div>
  );
}

export default App;