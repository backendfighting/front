import { useState } from 'react';
import { ChevronLeft, Flag } from 'lucide-react';
import { BASE_URL, readError } from '../api/client';
import { C } from '../constants/colors';

export function RegisterView({ setView }: any) {
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
        <ChevronLeft onClick={() => setView('login')} className="cursor-pointer" color={C.g3} />
        <h3 className="header-title">회원가입</h3>
        <div style={{ width: 24 }} />
      </div>
      <div className="scroll-content" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 230px)', paddingBottom: '20px' }}>
        {/* 로그인 화면과 같은 결: 깃발 아이콘 + 가운데 제목 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'var(--p15)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '4px auto 12px' }}>
            <Flag size={24} color={C.p5} fill={C.p5} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: 'var(--g4)' }}>반갑습니다, <span style={{ color: 'var(--p5)' }}>트래커님!</span></h2>
          <p style={{ fontSize: '13px', color: 'var(--g2)', wordBreak: 'keep-all' }}>간단한 정보를 입력하고 목표를 시작해 보세요.</p>
        </div>
        <div className="input-group"><label>닉네임</label><input type="text" placeholder="닉네임을 입력하세요" value={nickname} onChange={(e)=>setNickname(e.target.value)} /></div>
        <div className="input-group"><label>이메일</label><input type="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
        <div className="input-group"><label>비밀번호</label><input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e)=>setPassword(e.target.value)} /></div>
        <div className="input-group"><label>비밀번호 확인</label><input type="password" placeholder="비밀번호를 다시 입력하세요" value={passwordCheck} onChange={(e)=>setPasswordCheck(e.target.value)} /></div>

        <div className="agreement-box">
          <div className="agreement-item" style={{ borderBottom: '1px solid var(--surface)', paddingBottom: '10px', marginBottom: '8px' }}>
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
