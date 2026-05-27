import { useState } from 'react';
import {
  Mail, Lock, Eye, ChevronLeft, Flag, Bell,
  Search, CheckCircle2, Circle, MoreVertical,
  Plus, Calendar, BarChart2, Users, ClipboardList,
  AlertCircle, RotateCcw, Home, X, Check, Star, Menu
} from 'lucide-react';
import './App.css';

type SetView = (view: string) => void;

// ==========================================
// 1. 초기 게이트웨이 영역 (로그인, 회원가입, 에러)
// ==========================================

function LoginView({ setView } : { setView: SetView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
      return(
      <div className="card">
                    <div style={{ backgroundColor: '#e9e7ff', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '48px auto 16px' }}>
                      <Flag size={24} color="#6c63ff" fill="#6c63ff" />
                    </div>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px', color: '#1a191b' }}>Goal Tracker</h2>
                    <div className="input-group">
                      <label>이메일</label>
                      <div style={{ position: 'relative' }}>
                        <input type="email" 
                        value = {email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"/>
                        <Mail size={18} style={{ position: 'absolute', right: '14px', top: '20px', color: '#b5b1bc' }} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>비밀번호</label>
                      <div style={{ position: 'relative' }}>
                        <input type="password" 
                        value = {password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"/>
                        <Lock size={18} style={{ position: 'absolute', right: '44px', top: '20px', color: '#b5b1bc' }} />
                        <Eye size={18} style={{ position: 'absolute', right: '14px', top: '20px', color: '#b5b1bc' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#7a7680', alignSelf: 'flex-end', margin: '-4px 4px 20px 0', cursor: 'pointer' }}>비밀번호를 잊으셨나요?</span>
                    <button className="primary-button" onClick={() => setView('main')}>로그인</button>
                    <p style={{ marginTop: '24px', fontSize: '13px', color: '#7a7680' }}>
                      계정이 없으신가요? <span className="text-link" onClick={() => setView('register')}>회원가입</span>
                    </p>
                    <small style={{ marginTop: 'auto', color: '#e5e4e7', cursor: 'pointer' }} onClick={() => setView('error')}>오류 레이아웃 시뮬레이션</small>
                  </div>);
}

function RegisterView({ setView }: { setView: SetView }) {
  return (
    <div className="card">
      <SharedHeader title="회원가입" showBack onBack={() => setView('login')} showNoti={false} setView={setView} />
      <div style={{ textAlign: 'left', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '8px 0' }}>새로운 시작을 함께해요</h2>
        <p style={{ fontSize: '13px', color: '#b5b1bc' }}>간단한 정보를 입력하고 서비스를 시작하세요.</p>
      </div>
      <div className="input-group"><label>이메일</label><input type="email" placeholder="example@email.com" /></div>
      <div className="input-group"><label>비밀번호</label><input type="password" placeholder="비밀번호를 입력하세요" /></div>
      <div className="input-group"><label>비밀번호 확인</label><input type="password" placeholder="비밀번호를 다시 입력하세요" /></div>
      <div className="input-group"><label>닉네임</label><input type="text" placeholder="닉네임을 입력하세요" /></div>
      <div className="agreement-box">
        <div className="agreement-item" style={{ borderBottom: '1px solid #f1f0f5', paddingBottom: '8px', marginBottom: '4px' }}><input type="checkbox" /> <b>전체 동의</b></div>
        <div className="agreement-item"><input type="checkbox" /> 이용약관(필수) <span className="view-link">보기</span></div>
        <div className="agreement-item"><input type="checkbox" /> 개인정보처리방침(필수) <span className="view-link">보기</span></div>
        <div className="agreement-item"><input type="checkbox" /> 마케팅 수신 동의(선택) <span className="view-link">보기</span></div>
      </div>
      <button className="dark-button" style={{ backgroundColor: '#586589' }} onClick={() => setView('login')}>회원가입</button>
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

function NotiView({ setView }: { setView: SetView }) {
  return (
    <div className="card">
      <SharedHeader title="알림" showBack onBack={() => setView('main')} showNoti={false} setView={setView} />
      <div className="filter-tabs">
        <button className="chip active">전체</button>
        <button className="chip">읽지 않음</button>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#b5b1bc', alignSelf: 'center' }}>새 알림: 3</span>
      </div>
      <div style={{ textAlign: 'left', fontSize: '12px', color: '#b5b1bc', margin: '4px 0 8px 4px' }}>오늘</div>
      <div className="list-item">
        <div style={{ width: 36, height: 36, background: '#eef2ff', borderRadius: 10, marginRight: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📊</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: '700', color: '#1a191b' }}>할 일 마감 임박</div>
          <div style={{ fontSize: 11, color: '#6c63ff', marginTop: '2px' }}>프로젝트 보고서 마감이 1시간 남았습니다</div>
          <div style={{ fontSize: 10, color: '#b5b1bc', marginTop: '4px' }}>1시간 전</div>
        </div>
        <div className="unread-dot"></div>
      </div>
      <div className="list-item">
        <div style={{ width: 36, height: 36, background: '#fff5ed', borderRadius: 10, marginRight: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🎉</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: '700', color: '#1a191b' }}>목표 달성!</div>
          <div style={{ fontSize: 11, color: '#7a7680', marginTop: '2px' }}>영어 공부 목표를 달성했습니다</div>
          <div style={{ fontSize: 10, color: '#b5b1bc', marginTop: '4px' }}>3시간 전</div>
        </div>
        <div className="unread-dot"></div>
      </div>
    </div>
  );
}

// ==========================================
// 2. 추가 및 편집 제어 입력 레이아웃 영역
// ==========================================
function TodoAddView({ setView }: { setView: SetView }) {
  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">할 일 추가</h3>
        <span className="text-link" onClick={() => setView('main')}>저장</span>
      </div>
      <div style={{ textAlign: 'left', marginTop: '12px' }}>
        <input style={{ fontSize: '18px', fontWeight: '700', border: 'none', background: 'transparent', padding: '6px 0' }} placeholder="할 일을 입력하세요" />
        <textarea style={{ border: 'none', background: 'transparent', padding: '12px 0', minHeight: '100px', fontSize: '14px' }} placeholder="메모 (선택)" />
      </div>
      <div className="list-item" style={{ background: '#fff', justifyContent: 'space-between', padding: '14px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>📅 2026년 4월 6일</span>
        <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', color: '#b5b1bc' }} />
      </div>
      <div className="list-item" style={{ background: '#fff', justifyContent: 'space-between', padding: '14px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>🕒 오후 2:00</span>
        <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', color: '#b5b1bc' }} />
      </div>
      <div style={{ textAlign: 'left', marginTop: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#7a7680' }}>우선순위</label>
        <div className="filter-tabs" style={{ marginTop: '8px' }}>
          <button className="chip active">높음</button><button className="chip">보통</button><button className="chip">낮음</button>
        </div>
      </div>
      <button className="dark-button del-btn">🗑️ 삭제</button>
    </div>
  );
}

function GoalAddView({ setView }: { setView: SetView }) {
  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color="#4e4b52" />
        <h3 className="header-title">목표 추가</h3>
        <span className="text-link" onClick={() => setView('main')}>저장</span>
      </div>
      <div style={{ width: '100%', height: '110px', background: 'linear-gradient(135deg, #e0dcfc 0%, #f4f3ff 100%)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c63ff', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
        새로운 도전을 시작해보세요
      </div>
      <div className="input-group"><label>목표 제목</label><input placeholder="예: 매일 30분 조깅하기" /></div>
      <div className="input-group">
        <label>카테고리</label>
        <select><option>운동</option><option>공부</option><option>독서</option></select>
      </div>
      <div className="input-group"><label>목표 내용 / 설명</label><textarea placeholder="목표에 대한 상세한 내용을 적어주세요..." style={{ height: '70px' }} /></div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="input-group" style={{ flex: 1 }}><label>시작일</label><input type="date" defaultValue="2026-03-01" /></div>
        <div className="input-group" style={{ flex: 1 }}><label>목표일 (마감일)</label><input type="date" defaultValue="2026-03-31" /></div>
      </div>
      <button className="primary-button" onClick={() => setView('main')}>저장하기</button>
      <button className="dark-button del-btn" style={{ marginTop: '10px' }}>목표 삭제하기</button>
    </div>
  );
}

// ==========================================
// 3. 일별 캘린더 상세 레이아웃 화면
// ==========================================
function CalendarDetailView({ setView }: { setView: SetView }) {
  return (
    <div className="card">
      <SharedHeader title="4월 6일 월요일" showBack onBack={() => setView('main')} setView={setView} />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: '24px' }}>
        {['수 3', '목 4', '금 5', '월 6', '화 7', '수 8', '목 9'].map((day, idx) => (
          <div key={idx} style={{ padding: '8px 10px', borderRadius: '12px', background: idx === 3 ? '#586589' : 'transparent', color: idx === 3 ? 'white' : '#7a7680', textAlign: 'center', fontSize: '12px', cursor: 'pointer' }}>
            {day.split(' ')[0]}<br/><b style={{ fontSize: '14px' }}>{day.split(' ')[1]}</b>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a191b' }}>할 일</span>
        <span style={{ fontSize: '11px', color: '#b5b1bc', marginLeft: 'auto', cursor: 'pointer' }}>모두 보기</span>
      </div>
      <div className="list-item" style={{ background: '#fff' }}>
        <Circle size={18} color="#ff6b6b" style={{ marginRight: 10 }} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700' }}>프로젝트 보고서 작성</div>
          <div style={{ fontSize: '11px', color: '#b5b1bc', marginTop: '2px' }}>🕒 오후 2:00</div>
        </div>
      </div>
      <div className="list-item" style={{ background: '#fff' }}>
        <CheckCircle2 size={18} color="#6c63ff" style={{ marginRight: 10 }} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', textDecoration: 'line-through', color: '#b5b1bc' }}>운동 30분</div>
          <div style={{ fontSize: '11px', color: '#b5b1bc', marginTop: '2px' }}>🕒 오후 6:00</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', margin: '16px 0 12px 0' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a191b' }}>목표</span>
      </div>
      <div className="list-item" style={{ background: '#fff', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6c63ff' }}>📖 매일 독서 30분</div>
          <div style={{ fontSize: '11px', color: '#7a7680', marginTop: '4px' }}>오늘 목표 달성까지 15분 남음</div>
        </div>
        <Star size={18} color="#ffb700" fill="#ffb700" />
      </div>
    </div>
  );
}

// ==========================================
// 4. 친구 추가 레이아웃 화면
// ==========================================
function FriendAddView({ setView }: { setView: SetView }) {
  return (
    <div className="card">
      <SharedHeader title="친구 추가" showBack onBack={() => setView('main')} showNoti={false} setView={setView} />
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input placeholder="닉네임 또는 아이디로 검색" style={{ paddingLeft: '40px' }} />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '20px', color: '#b5b1bc' }} />
      </div>
      <div style={{ textAlign: 'left', fontSize: '12px', color: '#7a7680', marginBottom: '12px', fontWeight: '600' }}>검색 결과</div>
      <div className="list-item" style={{ background: '#fff', justifyContent: 'space-between' }}>
        <div><div style={{ fontSize: '14px', fontWeight: '700' }}>홍길동</div><div style={{ fontSize: '11px', color: '#b5b1bc' }}>@gildong1</div></div>
        <button style={{ padding: '6px 14px', background: '#586589', color: 'white', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>추가</button>
      </div>
      <div className="list-item" style={{ background: '#fff', justifyContent: 'space-between', opacity: 0.7 }}>
        <div><div style={{ fontSize: '14px', fontWeight: '700' }}>홍길동</div><div style={{ fontSize: '11px', color: '#b5b1bc' }}>@gildong2</div></div>
        <button disabled style={{ padding: '6px 14px', background: '#e5e4e7', color: '#7a7680', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>요청됨</button>
      </div>
      <div style={{ textAlign: 'left', fontSize: '12px', color: '#7a7680', margin: '16px 0 12px 0', fontWeight: '600' }}>보낸 요청 <span style={{ background: '#e9e7ff', color: '#6c63ff', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>1</span></div>
      <div className="list-item" style={{ background: '#fff', borderStyle: 'dashed', borderColor: '#d1ced6', justifyContent: 'space-between' }}>
        <div><div style={{ fontSize: '14px', fontWeight: '700' }}>홍길동</div><div style={{ fontSize: '11px', color: '#b5b1bc' }}>@hong</div></div>
        <span style={{ fontSize: '12px', color: '#ff4d4d', fontWeight: '600', cursor: 'pointer' }}>요청 취소</span>
      </div>
    </div>
  );
}

// ==========================================
// 5. 로그인 허가 후 핵심 메인 대시보드 뷰 컨트롤러
// ==========================================
function MainAppView({ setView, activeTab, setActiveTab, showGoalResult, setShowGoalResult, resultType, setResultType }: {
  setView: SetView;
  activeTab: string;
  setActiveTab: (t: string) => void;
  showGoalResult: boolean;
  setShowGoalResult: (v: boolean) => void;
  resultType: 'success' | 'fail' | null;
  setResultType: (v: 'success' | 'fail' | null) => void;
}) {
  const renderTabContent = () => {
    switch(activeTab) {
      // --- (A) 할 일 탭 ---
      case 'todo': return (
        <>
          <SharedHeader title="할 일" leftIcon={<Menu size={22} color="#4e4b52" />} setView={setView} />
          <div className="filter-tabs">
            <button className="chip active">전체</button><button className="chip">오늘</button><button className="chip">이번 주</button><button className="chip">완료</button>
          </div>
          <div className="dashboard-card">
            <span style={{ fontSize: '12px', color: '#6c63ff', fontWeight: '700' }}>진행률</span>
            <h3>75% 완료</h3>
            <div className="progress-bar"><div className="progress-fill" style={{ width: '75%' }}></div></div>
            <small style={{ color: '#7a7680', marginTop: '6px', display: 'block', fontSize: '11px' }}>오늘 남은 할 일: 3개</small>
          </div>
          <div className="list-item"><Circle size={18} color="#ff6b6b" style={{ marginRight: 12 }} /> <span style={{ fontWeight: '600', fontSize: '14px' }}>프로젝트 보고서 작성</span> <MoreVertical size={16} className="ml-auto" color="#b5b1bc" /></div>
          <div className="list-item"><Circle size={18} color="#ffb700" style={{ marginRight: 12 }} /> <span style={{ fontWeight: '600', fontSize: '14px' }}>운동 30분 (러닝머신)</span> <MoreVertical size={16} className="ml-auto" color="#b5b1bc" /></div>
          <div className="list-item" style={{ opacity: 0.6 }}><CheckCircle2 size={18} color="#6c63ff" style={{ marginRight: 12 }} /> <span style={{ textDecoration: 'line-through', fontSize: '14px' }}>한국사 인강 듣기</span> <MoreVertical size={16} className="ml-auto" color="#b5b1bc" /></div>
          {/* 액션 연동: 할 일 추가 화면 이동 */}
          <div className="fab" onClick={() => setView('todo-add')}><Plus /></div>
        </>
      );
      // --- (B) 달력 탭 ---
      case 'calendar': return (
        <>
          <SharedHeader title="달력" leftIcon={<Menu size={22} color="#4e4b52" />} setView={setView} />
          <div style={{ background: '#fbfbff', border: '1px solid #f1f0f5', borderRadius: '24px', padding: '24px', height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#b5b1bc', cursor: 'pointer' }} onClick={() => setView('calendar-detail')}>
            <h4 style={{ color: '#1a191b', margin: '0 0 12px 0' }}>2026년 4월</h4>
            <p style={{ fontSize: '12px' }}>[ 여기를 클릭하면 일별 상세 페이지로 진입합니다 ]</p>
          </div>
          <div className="list-item" style={{ marginTop: '16px', background: '#eef2ff', color: '#6c63ff', fontWeight: '600', fontSize: '13px' }}>
            <span>오늘 남은 할 일: 3개</span>
            <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', marginLeft: 'auto' }} />
          </div>
        </>
      );
      // --- (C) 목표 탭 ---
      case 'goal': return (
        <>
          <SharedHeader title="목표" leftIcon={<Menu size={22} color="#4e4b52" />} setView={setView} />
          <div className="filter-tabs">
            <button className="chip active">전체</button><button className="chip">진행중</button><button className="chip">성공</button><button className="chip">실패</button>
          </div>
          <div className="dashboard-card" style={{ background: '#586589', color: 'white' }}>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>나의 전체 달성률</span>
            <h2 style={{ fontSize: '26px', margin: '4px 0 10px 0', fontWeight: '800', color: '#fff' }}>72% <span style={{ fontSize: '13px', color: '#a5b4fc' }}>↗ +5%</span></h2>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}><div className="progress-fill" style={{ width: '72%', background: 'white' }}></div></div>
          </div>
          {/* 액션 연동: 누르면 결과 바텀시트가 팝업됨 */}
          <div className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => setShowGoalResult(true)}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '4px' }}>
              <b style={{ fontSize: '14px' }}>매일 운동 30분</b>
              <span style={{ fontSize: '11px', color: '#6c63ff', fontWeight: '700' }}>진행중</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: '60%' }}></div></div>
            <span style={{ fontSize: '11px', color: '#b5b1bc', marginTop: '6px' }}>60% 달성</span>
          </div>
          {/* 액션 연동: 목표 추가 화면 이동 */}
          <div className="fab" onClick={() => setView('goal-add')}><Plus /></div>
        </>
      );
      // --- (D) 통계 탭 ---
      case 'stats': return (
        <>
          <SharedHeader title="통계" setView={setView} />
          <div className="filter-tabs" style={{ justifyContent: 'center' }}>
            <button className="chip">주간</button><button className="chip active">월간</button><button className="chip">연간</button>
          </div>
          <div style={{ display: 'flex', background: '#fbfbff', border: '1px solid #f1f0f5', borderRadius: '18px', padding: '16px', justifyContent: 'space-around', textAlign: 'center', marginBottom: '16px' }}>
            <div><p style={{ fontSize: '11px', color: '#7a7680' }}>총 목표</p><b style={{ fontSize: '16px', color: '#1a191b' }}>12</b></div>
            <div><p style={{ fontSize: '11px', color: '#7a7680' }}>성공</p><b style={{ fontSize: '16px', color: '#6c63ff' }}>67%</b></div>
            <div><p style={{ fontSize: '11px', color: '#7a7680' }}>실패</p><b style={{ fontSize: '16px', color: '#ff4d4d' }}>33%</b></div>
          </div>
          <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 40px', background: '#fff', border: '1px solid #f1f0f5', borderRadius: '18px' }}>
            <div style={{ height: '40%', width: '28px', background: '#e5e4e7', borderRadius: '6px' }}></div>
            <div style={{ height: '55%', width: '28px', background: '#e5e4e7', borderRadius: '6px' }}></div>
            <div style={{ height: '80%', width: '28px', background: '#6c63ff', borderRadius: '6px' }}></div>
          </div>
        </>
      );
      // --- (E) 친구 탭 ---
      case 'friend': return (
        <>
          <SharedHeader title="친구" leftIcon={<Users onClick={() => setView('friend-add')} size={22} className="cursor-pointer" color="#6c63ff" />} setView={setView} />
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input placeholder="친구 검색" style={{ paddingLeft: '40px' }} />
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '20px', color: '#b5b1bc' }} />
          </div>
          <div className="list-item" style={{ background: '#fff', padding: '20px', justifyContent: 'center', fontWeight: '700', color: '#7a7680', borderStyle: 'dashed' }}>나의 프로필</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7a7680', margin: '12px 0 8px 4px', fontWeight: '600' }}>
            <span>친구 8명</span><span className="text-link" style={{ fontSize: '11px', fontWeight: '500' }}>전체보기</span>
          </div>
          <div className="list-item">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e4e7', marginRight: 12 }}></div>
            <b style={{ fontSize: '14px' }}>홍길동</b>
            <MoreVertical size={16} className="ml-auto" color="#b5b1bc" />
          </div>
        </>
      );
    }
  };

  return (
    <div className="card" style={{ paddingBottom: '80px' }}>
      {renderTabContent()}

      {/* 하단 고정 글로벌 네비게이션 컨트롤 구조 */}
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}><ClipboardList size={22} /><span>할 일</span></div>
        <div className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}><Calendar size={22} /><span>달력</span></div>
        <div className={`nav-item ${activeTab === 'goal' ? 'active' : ''}`} onClick={() => setActiveTab('goal')}><Flag size={22} /><span>목표</span></div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><BarChart2 size={22} /><span>통계</span></div>
        <div className={`nav-item ${activeTab === 'friend' ? 'active' : ''}`} onClick={() => setActiveTab('friend')}><Users size={22} /><span>친구</span></div>
      </div>

      {/* 6. 목표 결과 바텀 시트 인터랙션 레이어 */}
      {showGoalResult && (
        <div className="bottom-sheet-overlay" onClick={() => setShowGoalResult(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>매일 운동 30분</h3>
            <p style={{ fontSize: '12px', color: '#b5b1bc', margin: 0 }}>3월 1일 ~ 3월 31일</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#7a7680', marginTop: '20px', marginBottom: '0' }}>결과를 선택하세요</p>
            <div className="result-toggle-group">
              <button className={`result-btn success ${resultType === 'success' ? 'active' : ''}`} onClick={() => setResultType('success')}><Check size={16} /> 성공</button>
              <button className={`result-btn fail ${resultType === 'fail' ? 'active' : ''}`} onClick={() => setResultType('fail')}><X size={16} /> 실패</button>
            </div>
            {resultType === 'fail' && (
              <div className="input-group" style={{ marginTop: '12px' }}>
                <label>실패 원인</label>
                <select><option>시간 부족</option><option>의지 부족</option><option>체력/건강 문제</option><option>외부 요인</option></select>
              </div>
            )}
            <div className="input-group" style={{ marginTop: '12px' }}>
              <label>메모 (선택)</label>
              <textarea placeholder="실패 이유나 내일의 다짐을 적어보세요" style={{ height: '60px', marginTop: '6px' }} />
            </div>
            <button className="primary-button" style={{ marginTop: '16px' }} onClick={() => { setShowGoalResult(false); setResultType(null); }}>저장</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 글로벌 헤더 모듈 ---
function SharedHeader({ title, showBack = false, onBack = () => {}, showNoti = true, leftIcon = null, setView }: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showNoti?: boolean;
  leftIcon?: React.ReactNode;
  setView: SetView;
}) {
  return (
    <div className="header-row">
      {showBack ? (
        <ChevronLeft onClick={onBack} className="cursor-pointer" color="#4e4b52" />
      ) : leftIcon ? (
        leftIcon
      ) : (
        <div style={{ width: 24 }} />
      )}
      <h3 className="header-title">{title}</h3>
      {showNoti ? (
        <Bell size={22} onClick={() => setView('noti')} className="cursor-pointer" color="#4e4b52" />
      ) : (
        <div style={{ width: 24 }} />
      )}
    </div>
  );
}

// ==========================================
// App: 상태만 관리하고 각 뷰에 props로 전달
// ==========================================
function App() {
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('todo');
  const [showGoalResult, setShowGoalResult] = useState(false);
  const [resultType, setResultType] = useState<'success' | 'fail' | null>(null);

  return (
    <div className="container">
      {view === 'login' && <LoginView setView={setView} />}
      {view === 'register' && <RegisterView setView={setView} />}
      {view === 'error' && <ErrorView setView={setView} />}
      {view === 'noti' && <NotiView setView={setView} />}
      {view === 'main' && (
        <MainAppView
          setView={setView}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showGoalResult={showGoalResult}
          setShowGoalResult={setShowGoalResult}
          resultType={resultType}
          setResultType={setResultType}
        />
      )}
      {view === 'todo-add' && <TodoAddView setView={setView} />}
      {view === 'goal-add' && <GoalAddView setView={setView} />}
      {view === 'calendar-detail' && <CalendarDetailView setView={setView} />}
      {view === 'friend-add' && <FriendAddView setView={setView} />}
    </div>
  );
}

export default App;
