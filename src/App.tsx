import { useState, useEffect, useRef, Fragment } from 'react';
import {
  Mail, Lock, Eye, ChevronLeft, Flag, Bell,
  CheckCircle2, Circle,
  Plus, Calendar, BarChart2, ClipboardList, Repeat,
  AlertCircle, RotateCcw, X, Check, Menu, Trash2, LogOut, User, Pencil, Settings, ArrowUpDown, ChevronDown, ChevronRight
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

// 컴퓨터/폰 알림 띄우기. 누르면 open 에 적힌 화면(오늘의 미션 등)이 열린다
// (클릭 처리는 public/sw-notification.js 와 App 의 메시지 수신부에서 함)
// 기기 알림(팝업) 켜짐 여부는 이 기기에만 저장. 기본값은 꺼짐
const DEVICE_NOTI_ON_KEY = 'deviceNotiOn';
const isDeviceNotiOn = () => { try { return localStorage.getItem(DEVICE_NOTI_ON_KEY) === '1'; } catch { return false; } };
const setDeviceNotiOn = (on: boolean) => {
  try { if (on) localStorage.setItem(DEVICE_NOTI_ON_KEY, '1'); else localStorage.removeItem(DEVICE_NOTI_ON_KEY); } catch { /* 저장 불가 */ }
};
const showDeviceNotification = async (title: string, body: string, open: string = 'todo', force: boolean = false) => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (!force && !isDeviceNotiOn()) return; // 알림 설정에서 기기 알림을 켜지 않은 경우 (시연용은 예외)
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) { await reg.showNotification(title, { body, icon: '/pwa-192x192.png', data: { open } }); return; }
  } catch { /* 아래로 이동 */ }
  try {
    const n = new Notification(title, { body, icon: '/pwa-192x192.png' });
    n.onclick = () => { window.focus(); n.close(); window.dispatchEvent(new CustomEvent('open-tab', { detail: open })); };
  } catch { /* 이 환경에서는 알림을 띄울 수 없음 */ }
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

function NotiView({ setView, notifications, notiFilter, setNotiFilter, onRead, onOpenSettings, onDemo }: any) {


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
        {/* 전시회 시연용: 오늘 남은 미션 개수 알림을 바로 보냄 (기기 알림 설정과 상관없이) */}
        <button className="primary-button" style={{ marginBottom: '16px', background: '#6c63ff' }} onClick={onDemo}>
          🔔 시연용 테스트 알림 보내기
        </button>

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
// 서버 알림 종류별 제목 (TODO/ROUTINE/MISSION 은 새 방식, 나머지는 예전 알림)
const SERVER_NOTI_META: Record<string, { title: string; icon: string }> = {
  TODO: { title: '오늘의 할일', icon: '📌' },
  ROUTINE: { title: '매일 루틴', icon: '🔄' },
  MISSION: { title: '오늘의 미션', icon: '📋' },
  GOAL: { title: '목표 리마인더', icon: '🚩' },
  DEADLINE: { title: '마감 임박', icon: '⏰' },
  DAILY_SUMMARY: { title: '오늘의 할 일', icon: '📋' },
};
const toServerNoti = (n: any) => {
  const meta = SERVER_NOTI_META[n.type] || { title: '알림', icon: '🔔' };
  return {
    id: `server-${n.notificationId}`,
    serverId: n.notificationId,
    type: String(n.type || '').toLowerCase(),
    icon: meta.icon,
    title: meta.title,
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

  // 삭제한 루틴(종료일이 오늘 이전)은 목록에서 숨긴다
  const today = getTodayStr();
  const visibleRoutines = routines.filter((r: any) => !r.endDate || String(r.endDate).slice(0, 10) > today);

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
        {!loading && !failed && visibleRoutines.length === 0 && <p style={{ color: '#b5b1bc', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>등록된 루틴이 없습니다.</p>}
        {!loading && !failed && visibleRoutines.map((r: any) => (
          <div key={r.routineId} style={{ background: '#fff', border: '1px solid #f1f0f5', borderRadius: '20px', padding: '18px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', opacity: r.active ? 1 : 0.55 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a191b', marginBottom: '6px' }}>{r.title}</div>
              <div style={{ fontSize: '12px', color: '#7a7680' }}>
                🔁 {dayText(r.repeatDays)}
                {r.routineTime ? `  ·  🕒 ${String(r.routineTime).slice(0, 5)}` : ''}
                {r.notifyBefore !== null && r.notifyBefore !== undefined ? '  ·  🔔' : ''}
                {r.active ? '' : '  ·  일시중지됨'}
              </div>
              {r.startDate && String(r.startDate).slice(0, 10) > today && (
                <div style={{ fontSize: '11px', color: '#a9a5b0', marginTop: '4px' }}>{String(r.startDate).slice(0, 10)}부터 시작</div>
              )}
            </div>
            <div role="switch" aria-checked={!!r.active} aria-label={`${r.title} ${r.active ? '일시중지' : '다시 시작'}`}
                 onClick={() => toggleActive(r)} className="cursor-pointer"
                 style={{ width: 44, height: 26, borderRadius: 13, background: r.active ? '#586589' : '#d9d7e0', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: r.active ? 21 : 3, transition: 'left 0.2s' }} />
            </div>
            <Pencil size={18} color="#b5b1bc" className="cursor-pointer" onClick={() => onEditRoutine(r)} />
            <Trash2 size={18} color="#ff4d4d" className="cursor-pointer" onClick={async () => {
              if (!confirm('이 루틴을 삭제할까요?\n\n오늘부터 달력에서 사라지고, 지난 기록은 통계에 남아요.\n(오늘 이미 완료했다면 내일부터 사라져요)')) return;
              await onDeleteRoutine(r.routineId, today);
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
  // 기기 알림(팝업)은 이 기기에만 저장. 기본값 꺼짐
  const [deviceOn, setDeviceOn] = useState<boolean>(perm === 'granted' && isDeviceNotiOn());
  // 알림 종류별 설정 (서버에 저장). 기본값 모두 꺼짐
  const [settings, setSettings] = useState<any>({
    missionAlarmOn: false, missionAlarmTimes: ['08:00'],
    todoAlarmOn: false, routineAlarmOn: false,
    goalAlarmOn: false, goalAlarmTime: '09:00',
  });
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/users/me`, { headers: authHeaders() });
        const d = res.ok ? await res.json() : null;
        if (d) {
          setSettings({
            missionAlarmOn: !!d.missionAlarmOn,
            missionAlarmTimes: Array.isArray(d.missionAlarmTimes) && d.missionAlarmTimes.length ? d.missionAlarmTimes : ['08:00'],
            todoAlarmOn: !!d.todoAlarmOn,
            routineAlarmOn: !!d.routineAlarmOn,
            goalAlarmOn: !!d.goalAlarmOn,
            goalAlarmTime: d.goalAlarmTime || '09:00',
          });
        }
      } catch { /* 기본값으로 표시 */ }
      finally { setLoaded(true); }
    })();
  }, []);

  const change = (patch: any) => { setSettings((prev: any) => ({ ...prev, ...patch })); setDirty(true); };
  const times: string[] = settings.missionAlarmTimes;

  const toggleDevice = async () => {
    if (deviceOn) { setDeviceNotiOn(false); setDeviceOn(false); return; }
    if (typeof Notification === 'undefined') return alert('이 브라우저는 알림을 지원하지 않아요.');
    if (Notification.permission === 'denied') {
      return alert('이 사이트의 알림이 브라우저에서 차단되어 있어요.\n\n주소창 왼쪽 아이콘 → 알림 → "허용"으로 바꾼 뒤 다시 켜주세요.');
    }
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result !== 'granted') return;
    }
    setDeviceNotiOn(true);
    setDeviceOn(true);

    // 기기 알림을 켜면 나머지 알림도 모두 켠다 (받기 싫은 것만 끄면 됨)
    const allOn = { missionAlarmOn: true, todoAlarmOn: true, routineAlarmOn: true, goalAlarmOn: true };
    setSettings((prev: any) => ({ ...prev, ...allOn }));
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/alarm-settings`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(allOn) });
      if (!res.ok) setDirty(true); // 저장 실패 시 '저장' 버튼으로 다시 저장할 수 있게
    } catch { setDirty(true); }
  };

  const addTime = () => {
    const next = ['21:00', '12:00', '18:00', '07:00', '09:00'].find(t => !times.includes(t)) || '09:00';
    change({ missionAlarmTimes: [...times, next] });
  };

  const save = async () => {
    const body = { ...settings, missionAlarmTimes: Array.from(new Set(times)).sort() };
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/alarm-settings`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body),
      });
      if (!res.ok) return alert(`저장에 실패했습니다.\n${await readError(res)}`);
      setSettings(body);
      setDirty(false);
      alert('알림 설정이 저장되었습니다.');
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  const goBack = () => {
    if (dirty && !confirm('저장하지 않은 변경 사항이 있어요. 저장하지 않고 나갈까요?')) return;
    setView(backTo);
  };

  const section = (title: string, desc: string, on: boolean, onToggle: () => void, label: string, body?: any) => (
    <div className="noti-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <div className="noti-section-title">{title}</div>
          <div className="noti-section-desc">{desc}</div>
        </div>
        <Toggle on={on} onClick={onToggle} label={label} />
      </div>
      {on && body}
    </div>
  );

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={goBack} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">알림 설정</h3>
        <span className="text-link" onClick={save}>저장</span>
      </div>
      <div className="scroll-content">
        {section('기기 알림', deviceOn ? '이 기기에 알림 창을 띄워요' : perm === 'denied' ? '브라우저에서 차단됨' : '이 기기에 알림 창을 띄우지 않아요',
          deviceOn, toggleDevice, '기기 알림')}

        {loaded && (
          <>
            {section('오늘의 미션 알림', '오늘 해야 할 미션의 개수를 알려드려요',
              settings.missionAlarmOn, () => change({ missionAlarmOn: !settings.missionAlarmOn }), '오늘의 미션 알림',
              <>
                {times.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <TimeSelect value={t} onChange={(v) => change({ missionAlarmTimes: times.map((x, j) => (j === i ? v : x)) })} />
                    <button className="time-remove-btn" aria-label="이 시간 삭제" onClick={() => change({ missionAlarmTimes: times.filter((_, j) => j !== i) })}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {times.length === 0 && (
                  <p className="field-hint" style={{ marginTop: '10px' }}>알림 시간을 추가해주세요.</p>
                )}
                <button className="add-time-btn" onClick={addTime}>
                  <span className="add-time-icon"><Plus size={14} /></span>
                  시간 추가
                </button>
              </>)}

            {section('할 일 알림', '알림을 설정한 할 일을 정한 시간에 알려드려요',
              settings.todoAlarmOn, () => change({ todoAlarmOn: !settings.todoAlarmOn }), '할 일 알림')}

            {section('루틴 알림', '알림을 설정한 루틴을 정한 시간에 알려드려요',
              settings.routineAlarmOn, () => change({ routineAlarmOn: !settings.routineAlarmOn }), '루틴 알림')}

            {section('목표 리마인더 알림', '목표 마감일에 알림을 보내드려요',
              settings.goalAlarmOn, () => change({ goalAlarmOn: !settings.goalAlarmOn }), '목표 리마인더 알림',
              <div style={{ marginTop: '10px' }}>
                <TimeSelect value={settings.goalAlarmTime} onChange={(v) => change({ goalAlarmTime: v })} />
              </div>)}
          </>
        )}

        <p className="field-hint" style={{ margin: '14px 4px 0', lineHeight: 1.6 }}>
          할 일·루틴 알림 시점은 추가하거나 수정할 때 정할 수 있어요.<br />
          알림은 이 앱이 열려 있을 때 화면에 떠요.
        </p>
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

// 목표 실패 원인별 문구 (원인마다 5개 중 하나를 보여줌)
const FAIL_REASON_MESSAGES: Record<string, string[]> = {
  '시간 부족': [
    '시간이 부족했다면, 이제는 시간부터 확보해 봐요! 하루의 빈틈을 찾아보는 건 어떨까요? ⏰',
    '하루가 24시간이라는 사실은 변하지 않지만, 시간을 사용하는 방법은 바꿀 수 있어요!',
    '모든 일을 다 해내려고 하지 않아도 괜찮아요. 중요한 일부터 하나씩 처리해 봅시다.',
    '시간이 없었던 걸까요, 아니면 시간이 새고 있었던 걸까요? 하루의 사용 내역을 점검해 봐요! 🔍',
    '바쁜 하루 속에서도 나를 위한 시간은 필요해요. 하루 10분부터 루틴에 투자해 보는 건 어떨까요?',
  ],
  '동기 부족': [
    '처음 시작했을 때의 마음을 떠올려 보세요! 그때의 열정을 다시 꺼내 볼 시간이에요. 🔥',
    '의욕이 생길 때까지 기다리지 마세요. 작은 실천이 새로운 의욕을 만들어 줄지도 몰라요!',
    '매일 같은 일상이 지루하게 느껴진다면, 루틴에 작은 변화를 줘보는 건 어떨까요? 🎨',
    '때로는 목표를 향해 달리는 이유를 잊기도 하죠. 내가 이 목표를 세운 이유를 다시 생각해 봐요.',
    '동기부여가 필요하신가요? 오늘은 스스로에게 작은 보상을 선물해 보는 건 어떨까요? 🎁',
  ],
  '체력 저하': [
    '체력을 더 단련해야 해요! 가벼운 운동 루틴부터 추가해 볼까요? 💪',
    '체력은 국력이라고 하죠? 일어나서 가벼운 체조라도 해봅시다! 🤸',
    '몸이 지치면 마음도 지치기 마련이에요. 충분한 수면과 휴식으로 에너지를 충전해 봐요! 💤',
    '건강한 몸이 꾸준한 실천의 바탕이에요. 식사와 수면부터 꼼꼼하게 챙겨보세요! 🥗',
    '무리해서 달리기보다는 잠시 숨을 고르는 것도 중요해요. 건강한 컨디션으로 다시 시작해 봅시다!',
  ],
  '계획 오류': [
    '계획이 너무 빡빡했던 건 아닐까요? 이번에는 조금 더 현실적인 목표를 세워봐요! 📝',
    '처음부터 너무 높은 목표를 잡을 필요는 없어요. 작은 목표부터 차근차근 쌓아 올려 봅시다.',
    '계획은 지키기 위해 세우는 것이지, 지키지 못해 자책하기 위해 세우는 게 아니에요. 필요하다면 과감하게 수정해 보세요!',
    '목표까지 가는 길이 막혔다면 다른 길을 찾아보면 돼요! 새로운 전략을 세워볼까요? 🧭',
    '실패도 계획을 개선할 수 있는 소중한 자료예요. 이번 경험을 바탕으로 더 똑똑하게 도전해 봅시다!',
  ],
  '외부 요인': [
    '때로는 내 의지와 상관없이 일이 꼬이기도 하죠. 너무 자책하지 말아요. 다음 기회는 또 찾아올 거예요!',
    '예상치 못한 일이 생겼다고 해서 지금까지의 노력이 사라지는 건 아니에요. 다시 이어가면 됩니다! 🌱',
    '날씨도, 주변 환경도 내 마음대로 되지는 않죠. 주어진 상황에 맞춰 유연하게 대처해 봐요!',
    '계획대로 흘러가지 않는 날도 있는 법이에요. 잠시 멈췄다고 해서 포기한 것은 아니니까요!',
    '바람이 불면 방향을 바꾸면 되고, 비가 오면 잠시 우산을 쓰면 돼요. 어떤 상황에서도 다시 시작할 방법은 있어요! ☂️',
  ],
};
// '⏱️ 시간 부족' -> '시간 부족'
const plainReason = (r: string) => r.replace(/^[^\s가-힣]+\s*/, '');

// 가로 막대 색: 가장 높은 값(동점 포함)만 진한 색, 나머지는 다른 색
const AMBER = '#f4b740';
const barColorsByRank = (rates: (number | null)[], top: string, rest: string) => {
  const max = Math.max(0, ...rates.map(r => r ?? 0));
  return rates.map(r => (max > 0 && r === max ? top : rest));
};

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
// 체크한 루틴은 그날 해야 했던 루틴에도 반드시 포함되므로 수행률이 100%를 넘지 않는다.
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

// 요일별 수행률 (from~to 사이만)
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

// 카테고리별 루틴 수행률 (루틴 단위로 셈)
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

// 지난 달 대비 수행률 변화 (퍼센트포인트: 40% -> 45% 이면 5%p 증가)
const monthOverMonth = (daily: Record<string, DayStat>, today: Date) => {
  const thisM = sumRange(daily, new Date(today.getFullYear(), today.getMonth(), 1), today);
  const lastM = sumRange(daily, new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0));
  if (thisM.e === 0 || lastM.e === 0) return { kind: 'none' as const };
  const diff = Math.round((thisM.d / thisM.e - lastM.d / lastM.e) * 100);
  if (diff === 0) return { kind: 'same' as const };
  return { kind: diff > 0 ? ('up' as const) : ('down' as const), pct: Math.abs(diff) };
};

// 수행률이 가장 낮은 항목들 (동점이면 전부)
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


// 2026-02-31 처럼 달력에 없는 날짜를 걸러낸다
const isRealDate = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (y < 2000 || y > 2100 || m < 1 || m > 12) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
};

// 드롭다운처럼 고르고, 더블클릭하면 숫자를 직접 입력할 수 있는 칸
function PickField({ value, options, format, onChange, min, max, ariaLabel, style }: {
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
        <ChevronDown size={14} color="#8e8a96" />
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

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5);

// 오전/오후 + 시 + 분 (값은 "HH:MM" 24시간). 시·분은 더블클릭하면 직접 입력
function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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

// 알림: 몇 분 전 (0 = 시작 시간). 30분까지 5분, 1시간까지 10분, 3시간까지 30분 단위. 그 밖은 더블클릭해서 직접 입력
const ALARM_MINUTES = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 90, 120, 150, 180];
const formatAlarm = (m: number, startLabel: string) => {
  if (m === 0) return startLabel;
  if (m >= 60 && m % 60 === 0) return `${m / 60}시간 전`;
  if (m > 60) return `${Math.floor(m / 60)}시간 ${m % 60}분 전`;
  return `${m}분 전`;
};
// 할 일·루틴·목표에서 알림을 켜면, 알림 설정의 해당 종류도 자동으로 켠다
const ensureAlarmTypeOn = async (type: 'todo' | 'routine' | 'goal') => {
  const key = type === 'todo' ? 'todoAlarmOn' : type === 'routine' ? 'routineAlarmOn' : 'goalAlarmOn';
  try {
    await fetch(`${BASE_URL}/api/users/me/alarm-settings`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ [key]: true }) });
  } catch (e) { console.error('알림 설정 변경 실패', e); }
};

const toServerPriority = (p: string) => (p === 'normal' ? 'MEDIUM' : String(p || 'normal').toUpperCase());

// 켜고 끄는 스위치
function Toggle({ on, onClick, label, small = false }: { on: boolean; onClick: () => void; label: string; small?: boolean }) {
  const w = small ? 34 : 44, h = small ? 20 : 26, k = small ? 14 : 20, pad = 3;
  return (
    <div role="switch" aria-checked={on} aria-label={label} onClick={onClick} className="cursor-pointer"
         style={{ width: w, height: h, borderRadius: h / 2, background: on ? '#586589' : '#d9d7e0', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
      <div style={{ width: k, height: k, borderRadius: '50%', background: '#fff', position: 'absolute', top: pad, left: on ? w - k - pad : pad, transition: 'left 0.2s' }} />
    </div>
  );
}

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
  const initialTime = editingItem?.todoTime || editingItem?.routineTime;
  const [time, setTime] = useState(initialTime ? String(initialTime).slice(0, 5) : '14:00');
  // 기본값은 '보통'
  const [priority, setPriority] = useState(
    editingItem?.priority === 'HIGH' ? 'high' : editingItem?.priority === 'LOW' ? 'low' : 'normal'
  );
  const [category, setCategory] = useState(editingItem?.category || '공부');
  const [type, setType] = useState(isRoutineEdit ? 'routine' : 'todo');
  const [repeatDays, setRepeatDays] = useState<string[]>(
    Array.isArray(editingItem?.repeatDays) ? sortDays(editingItem.repeatDays) : []
  );
  // 루틴 전용: 시작일(새 루틴은 지금 보고 있는 날짜), 시간 지정 여부
  const [startDate, setStartDate] = useState<string>(
    isRoutineEdit ? (editingItem?.startDate ? String(editingItem.startDate).slice(0, 10) : '') : globalDate
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

  const handleSave = () => {
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

    if (isRoutineEdit) onUpdateRoutine(editingItem, title, memo, repeatDays, category, priority, extra);
    else if (isEdit) onUpdateTodo(editingItem.todoId || editingItem.id, title, memo, date, time, priority, extra);
    else onAddTodo(title, memo, date, time, priority, type, repeatDays, category, extra);
    setView('main');
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

function GoalAddView({ setView, onAddGoal, onUpdateGoal, editingGoal, globalDate }: any) {
  const isEdit = !!editingGoal;
  const [title, setTitle] = useState(editingGoal?.title || '');
  const [category, setCategory] = useState(editingGoal?.category || '공부');
  const [desc, setDesc] = useState(editingGoal?.desc || editingGoal?.description || '');
  const [startDate, setStartDate] = useState(editingGoal?.startDate || globalDate);
  const [endDate, setEndDate] = useState(editingGoal?.endDate || globalDate);
  const [reminder, setReminder] = useState<boolean>(!!editingGoal?.remindOn);

  const handleSave = async () => {
    if (!title.trim()) return alert('목표를 입력하세요.');
    if (!isRealDate(startDate)) return alert('시작일을 다시 확인해주세요. 달력에 없는 날짜입니다.');
    if (!isRealDate(endDate)) return alert('목표일을 다시 확인해주세요. 달력에 없는 날짜입니다.');
    if (endDate < startDate) return alert('마감일은 시작일 이후여야 합니다.');
    // 저장에 실패하면 입력한 내용이 사라지지 않도록 화면을 그대로 둔다
    const ok = isEdit
      ? await onUpdateGoal(editingGoal, title, category, desc, startDate, endDate, reminder)
      : await onAddGoal(title, category, desc, startDate, endDate, reminder);
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
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>⏰ 리마인더 알림</div>
            <div style={{ fontSize: '11px', color: '#b5b1bc', marginTop: '3px' }}>마감일에 알림을 보내드려요</div>
          </div>
          <Toggle on={reminder} onClick={() => setReminder(!reminder)} label="리마인더 알림" />
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
  // 실패 원인 문구를 고를 때 쓰는 값 (통계를 볼 때마다 바뀌지 않게 한 번만 정함)
  const [failMsgSeed, setFailMsgSeed] = useState(() => Math.random());
  // 달력에서 날짜를 더블클릭하면 열리는 '그 날짜의 미션' 페이지 (하단 탭은 달력 그대로)
  const [dayPageOpen, setDayPageOpen] = useState(false);
  // 달력 상단의 연도·월 선택 창
  const [pickerOpen, setPickerOpen] = useState<'year' | 'month' | null>(null);

  // 오늘의 미션 탭은 언제나 오늘 날짜만 보여준다
  const goTab = (tab: string) => {
    setDayPageOpen(false);
    setPickerOpen(null);
    if (tab === 'todo') setGlobalDate(getTodayStr());
    if (tab === 'stats') setFailMsgSeed(Math.random());
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
        const at = a.todoTime || a.routineTime, bt = b.todoTime || b.routineTime;
        const ta = at ? String(at).slice(0, 5) : '99:99';
        const tb = bt ? String(bt).slice(0, 5) : '99:99';
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

  // 화면 맨 아래 응원 문구 (추가 버튼이 목록을 가리지 않도록 여백 역할도 함)
  const renderCheerFooter = () => (
    <div className="cheer-footer">
      꾸준한 실천으로 만드는 갓생 루틴!<br />Goal Tracker가 응원합니다.
    </div>
  );

  // 달력에서 날짜를 한 번 눌렀을 때 보이는 간략한 목록 (보기 전용)
  const renderCompactDayList = () => {
    const todoList = sortItems(todos || []);
    const routineList = sortItems(backendRoutines || []);
    const row = (key: string, title: string, time: any, done: boolean) => (
      <div key={key} className="mini-item">
        <span className={`mini-dot ${done ? 'done' : ''}`}>{done && <Check size={9} strokeWidth={3} />}</span>
        <span className={`mini-title ${done ? 'done' : ''}`}>{title}</span>
        {time && <span className="mini-time">{String(time).slice(0, 5)}</span>}
      </div>
    );
    return (
      <div className="mini-list">
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

      <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0 12px 4px', fontSize: '14px', fontWeight: '700', color: '#4e4b52' }}>
        <span style={{ marginRight: '6px' }}>🔄</span> 반복 루틴 ({routineList.length}개)
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
                {(r.routineTime || pText || r.category) && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {r.routineTime && <span className="item-meta">{String(r.routineTime).slice(0, 5)}</span>}
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
              if (confirm(`이 루틴을 삭제할까요?\n\n${calMonth}/${selectedCalendarDay}부터 달력에서 사라지고, 지난 기록은 통계에 남아요.\n(이 날 이미 완료했다면 다음 날부터 사라져요)`)) onDeleteRoutine(id);
            }} />
          </div>
        );
      })}

      {/* 추가 버튼이 마지막 루틴의 수정·삭제 버튼을 가리지 않도록 넉넉히 비워둔다 */}
      {renderCheerFooter()}
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
                  <button className="cal-nav-btn" aria-label="이전 달" onClick={() => { setPickerOpen(null); handlePrevMonth(); }}><ChevronLeft size={18} /></button>
                  {/* 연도와 월을 눌러 바로 이동 */}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', gap: '6px', color: '#586589' }}>
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
                    return (
                      <div key={dayNum} className={`calendar-cell ${dayNum === selectedCalendarDay ? 'active' : ''}`}
                           title="더블클릭하면 이 날의 미션이 열려요"
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
              {/* 한 번 클릭: 그 날의 미션을 간략하게 보기만 (수정·완료는 더블클릭해서 여는 페이지에서) */}
              {renderCompactDayList()}
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
                const statusColor = isSuccess ? '#5aaf78' : isFail ? '#e3787d' : '#6c63ff';

                return (
                  <div key={`goal-${g.id}`} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px', background: '#fff', borderRadius: '20px', marginBottom: '16px', border: '1px solid #f1f0f5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} 
                       onClick={() => { 
                         setSelectedGoalId(g.id); 
                         setResultType(isSuccess ? 'success' : isFail ? 'fail' : null); 
                         setFailReasons(g.reason ? g.reason.split(',').map((r: string) => r.trim()) : []);
                         setShowGoalResult(true); 
                       }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (g.description || g.desc) ? '6px' : '16px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a191b' }}>{g.title}</span>
                      <span style={{ color: statusColor, fontSize: '13px', fontWeight: '700' }}>{g.status}</span>
                    </div>

                    {/* 목표 내용: 제목과 날짜의 중간 색 */}
                    {(g.description || g.desc) && (
                      <div style={{ fontSize: '11px', color: '#68656c', lineHeight: 1.5, marginBottom: '14px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                        {g.description || g.desc}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#b5b1bc', fontWeight: '500' }}>
                        {g.startDate || '-'} ~ {g.endDate || '-'}
                      </span>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
  <Pencil size={18} color="#b5b1bc" onClick={(e) => { e.stopPropagation(); onEditGoal(g); }} />
  <Trash2 size={18} color="#b5b1bc" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); if(confirm('삭제하시겠습니까?')) onDeleteGoal(g.id); }} />
</div>
                    </div>
                  </div>
                );
              })}
              {renderCheerFooter()}
            </div>
            <div className="fab" onClick={() => setView('goal-add')}><Plus /></div>
          </>
        );

      case 'stats': {
        const today = new Date();
        const thisYear = today.getFullYear();
        const { summaryStart, yearStart, weekStart, fetchStart } = statsRanges(today);

        // 올해 + 최근 3개월을 한 번에 계산해 두고 필요한 구간만 꺼내 쓴다
        const daily = buildDailyStats(allRoutines || [], statsRecords || [], fetchStart, today);
        const hasRecentData = sumRange(daily, summaryStart, today).e > 0;

        // --- 기간별 그래프: 일간=이번 주, 주간=이번 달 주차, 월간=올해 ---
        const period = statsPeriod === 'day' ? 'day' : statsPeriod === 'month' ? 'month' : 'week';
        const chartData: { label: string; rate: number | null }[] = [];
        let periodDesc = '';

        if (period === 'day') {
          periodDesc = '이번 주 요일별 수행 통계를 보여드려요';
          for (let i = 0; i < 7; i++) {
            const d = addDays(weekStart, i);
            chartData.push({ label: WEEKDAY_KO[d.getDay()], rate: toDateStr(d) <= toDateStr(today) ? rangeRate(daily, d, d) : null });
          }
        } else if (period === 'week') {
          periodDesc = '이번 달 주차별 수행 통계를 보여드려요';
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
          periodDesc = '이번 년도 월별 수행 통계를 보여드려요';
          for (let m = 0; m < 12; m++) {
            const from = new Date(thisYear, m, 1);
            const to = new Date(thisYear, m + 1, 0);
            chartData.push({ label: `${m + 1}월`, rate: from <= today ? rangeRate(daily, from, to < today ? to : today) : null });
          }
        }
        const maxRateValue = Math.max(0, ...chartData.map(c => c.rate ?? 0));

        // --- 요약 (최근 3개월 기준) ---
        const weekdayStats = buildWeekdayStats(daily, summaryStart, today);
        const worstDays = lowestOf(weekdayStats);
        const daysWithData = weekdayStats.filter(d => d.rate !== null).length;
        const mom = monthOverMonth(daily, today);
        // 카테고리별 그래프는 올해 전체, 요약의 '가장 낮은 카테고리'는 최근 3개월 기준
        const routineCats = buildCategoryStats(allRoutines || [], statsRecords || [], yearStart, today);
        const recentCats = buildCategoryStats(allRoutines || [], statsRecords || [], summaryStart, today);
        const worstRoutineCats = lowestOf(recentCats);

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
        })).sort((a, b) => b.rate - a.rate);

        // 가장 많은 실패 원인 + 그 원인에 맞는 문구 (방문할 때마다 5개 중 하나)
        const topFailRate = dynamicFailData.length ? dynamicFailData[0].rate : 0;
        const topFailNames = topFailRate > 0 ? dynamicFailData.filter(f => f.rate === topFailRate).map(f => plainReason(f.name)) : [];
        const pickedCause = topFailNames.length ? topFailNames[Math.floor(failMsgSeed * topFailNames.length)] : '';
        const causeMsgs = FAIL_REASON_MESSAGES[pickedCause] || [];
        const failMessage = causeMsgs.length ? causeMsgs[Math.floor(failMsgSeed * causeMsgs.length) % causeMsgs.length] : '';

        // 막대 색
        const routineCatColors = barColorsByRank(routineCats.map(c => c.rate), '#ff8a8a', AMBER);
        const goalCatColors = barColorsByRank(goalCats.map(c => c.rate), '#5b678c', '#c5cbe0');
        const failColors = barColorsByRank(dynamicFailData.map(f => f.rate), '#ff8a8a', AMBER);

        // 저채도·중명도 보라 (요약에서 강조할 때)
        const MUTED_PURPLE = '#7266a0';

        const sectionTitle = (icon: any, text: string, sub: string, color: string) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 2px' }}>
            <div style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
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

        // 요약 레포트 (최근 3개월): 머리말 아래에 요일 / 카테고리 / 지난 달 대비 순서
        const summaryLines: any[] = [
          // 모든 요일이 동점이면 요일을 전부 나열하는 대신 따로 안내
          daysWithData < 2 ? '요일별로 비교할 기록이 아직 부족해요.'
            : worstDays.length === daysWithData ? '요일마다 수행률이 같았어요.'
            : <><b style={{ color: MUTED_PURPLE }}>{worstDays.map(d => d.label).join(', ')}요일</b>에 가장 수행률이 저조했어요.</>,
          recentCats.length === 0 ? '카테고리별로 비교할 기록이 아직 부족해요.'
            : recentCats.length === 1 ? '카테고리가 하나뿐이라 비교할 수 없어요.'
            : worstRoutineCats.length === recentCats.length ? '카테고리마다 수행률이 같았어요.'
            : <><b style={{ color: MUTED_PURPLE }}>{worstRoutineCats.map(c => c.name).join(', ')}</b> 카테고리의 수행률이 가장 낮았어요.</>,
          mom.kind === 'none' ? '지난 달 기록이 없어 비교할 수 없어요.'
            : mom.kind === 'same' ? '지난 달과 수행률이 같아요.'
            : <>지난 달 대비 수행률은 <b style={{ color: mom.kind === 'up' ? '#3f9a5a' : '#d0605e' }}>{mom.pct}%p {mom.kind === 'up' ? '증가' : '감소'}</b>했어요.</>,
        ];

        return (
          <>
            <div className="header-row"><Menu size={22} className="cursor-pointer" color="#4e4b52" onClick={onOpenMenu} /><h3 className="header-title">통계</h3><Bell size={22} color="#4e4b52" onClick={onOpenNoti} /></div>
            <div className="scroll-content">
              <div style={{ fontSize: '12.5px', color: '#7a7680', lineHeight: 1.7, textAlign: 'left', marginBottom: '24px', fontWeight: '500' }}>
                올해의 <b style={{ color: '#6c63ff' }}>루틴 수행률</b>과 <b style={{ color: '#5b678c' }}>목표 달성률</b>을 보여드려요.
              </div>

              {/* ===================== 루틴 ===================== */}
              <div style={{ background: '#fbfbff', border: '1px solid #efedfa', borderRadius: '20px', padding: '18px 16px', marginBottom: '28px' }}>
                {sectionTitle(<Repeat size={22} strokeWidth={2.6} color="#aea9ff" style={{ transform: 'scaleX(0.9)' }} />, '루틴', `${thisYear}년`, '#6c63ff')}

                <div className="stats-chart-title" style={{ marginLeft: '2px' }}>기간별 루틴 수행률</div>
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

                <div className="stats-chart-title" style={{ margin: '26px 0 10px 2px' }}>카테고리별 루틴 수행률</div>
                <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid #f1f0f5' }}>
                  {routineCats.length === 0
                    ? <div style={{ fontSize: '13px', color: '#b5b1bc', paddingBottom: '16px' }}>아직 기록이 없어요.</div>
                    : routineCats.map((c, i) => barRow(c.name, c.rate, `${c.done}/${c.expected}`, routineCatColors[i]))}
                </div>

                {/* 요약 레포트 (최근 3개월) */}
                <div className="stats-summary">
                  {!hasRecentData ? (
                    <div className="stats-summary-item">아직 최근 3개월 루틴 기록이 없어요. 루틴을 만들고 체크해보세요.</div>
                  ) : (
                    <>
                      <div className="stats-summary-head">최근 3개월 간 트래커님의 루틴은</div>
                      {summaryLines.map((l, i) => (
                        <div key={i} className="stats-summary-item">
                          <span className="stats-summary-dot" />
                          <span>{l}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* ===================== 목표 ===================== */}
              <div style={{ background: '#fbfcff', border: '1px solid #e9edf6', borderRadius: '20px', padding: '18px 16px', marginBottom: '20px' }}>
                {sectionTitle(<Flag size={22} strokeWidth={2.6} color="#5b678c" />, '목표', `${thisYear}년`, '#5b678c')}

                <div className="stats-chart-title" style={{ marginLeft: '2px' }}>카테고리별 목표 달성률</div>
                <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid #f1f0f5', marginTop: '10px' }}>
                  {goalCats.length === 0
                    ? <div style={{ fontSize: '13px', color: '#b5b1bc', paddingBottom: '16px' }}>올해 등록한 목표가 없어요.</div>
                    : goalCats.map((c, i) => barRow(c.name, c.rate, c.done > 0 ? `성공 ${c.success}/완료 ${c.done}` : `진행중 ${c.total}`, goalCatColors[i]))}
                </div>

                <div className="stats-chart-title" style={{ margin: '26px 0 10px 2px' }}>실패 원인 분석</div>
                <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid #f1f0f5' }}>
                  {failedGoals.length === 0
                    ? <div style={{ fontSize: '13px', color: '#b5b1bc', paddingBottom: '16px' }}>올해 실패로 기록된 목표가 없어요.</div>
                    : dynamicFailData.map((f, i) => barRow(f.name, f.rate, '', failColors[i]))}
                </div>

                {/* 실패 원인 레포트 (목표 색에 맞춘 남색 계열). 실패 기록이 없으면 표시하지 않음 */}
                {topFailNames.length > 0 && (
                  <div className="goal-summary">
                    <div className="goal-summary-head">트래커님의 주된 목표 실패 원인은 {topFailNames.join(', ')}!</div>
                    <div className="goal-summary-body">{failMessage}</div>
                  </div>
                )}
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
  // 이미 확인한 서버 알림 id (처음 불러올 때는 null)
  const serverSeenRef = useRef<Set<string> | null>(null);
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
        if (response.ok) { fetchBackendRoutines(); if (payload.notifyBefore !== null) ensureAlarmTypeOn('routine'); }
        else alert(`루틴 추가에 실패했습니다.\n\n${await readError(response)}`);
      } else {
        const todoPayload = {
          title, description: memo, todoDate: date, todoTime: time + ':00',
          priority: toServerPriority(priority),
          notifyBefore: extra.notifyBefore ?? null,
        };
        const response = await fetch(`${BASE_URL}/api/todos`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(todoPayload) });
        if (response.ok) { fetchTodos(); if (todoPayload.notifyBefore !== null) ensureAlarmTypeOn('todo'); }
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
      if (response.ok) { fetchGoals(); if (remindOn) ensureAlarmTypeOn('goal'); return true; }
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
      if (response.ok) { fetchTodos(); if (extra.notifyBefore !== null && extra.notifyBefore !== undefined) ensureAlarmTypeOn('todo'); }
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
      if (response.ok) { fetchBackendRoutines(); if (extra.notifyBefore !== null && extra.notifyBefore !== undefined) ensureAlarmTypeOn('routine'); }
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
      if (res.ok) { fetchGoals(); if (remindOn) ensureAlarmTypeOn('goal'); return true; }
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
    toShow.forEach((n: any) => showDeviceNotification(n.title, n.desc, n.type === 'goal' ? 'goal' : 'todo'));
    if (toShow.length) {
      localStorage.setItem('notifiedIds', JSON.stringify([...new Set([...notified, ...toShow.map((n: any) => n.id)])].slice(-100)));
    }
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
    await showDeviceNotification('오늘의 미션', desc, 'todo', true);
    // 알림 목록에도 바로 보이게
    setNotifications((prev: any[]) => [
      { id: `demo-${Date.now()}`, type: 'mission', icon: '📋', title: '오늘의 미션', desc, time: formatNotiTime(new Date().toISOString()), unread: true },
      ...prev,
    ]);
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