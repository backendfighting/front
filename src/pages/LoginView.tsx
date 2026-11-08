import { useState } from 'react';
import { Eye, Flag, Lock, Mail } from 'lucide-react';
import { BASE_URL } from '../api/client';
import { C } from '../constants/colors';
import type { SetView } from '../types';

export function LoginView({ setView }: { setView: SetView }) {
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
      <div style={{ backgroundColor: 'var(--p15)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '48px auto 16px' }}>
        <Flag size={24} color={C.p5} fill={C.p5} />
      </div>
      <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px', color: 'var(--g4)' }}>Goal Tracker</h2>
      <div className="input-group">
        <label>이메일</label>
        <div style={{ position: 'relative' }}>
          <input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Mail size={18} style={{ position: 'absolute', right: '14px', top: '20px', color: 'var(--g1)' }} />
        </div>
      </div>
      <div className="input-group">
        <label>비밀번호</label>
        <div style={{ position: 'relative' }}>
          <input type={showPassword ? "text" : "password"} placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Lock size={18} style={{ position: 'absolute', right: '44px', top: '20px', color: 'var(--g1)' }} />
          <Eye size={18} className="cursor-pointer" style={{ position: 'absolute', right: '14px', top: '20px', color: showPassword ? 'var(--p5)' : 'var(--g1)' }} onClick={() => setShowPassword(!showPassword)} />
        </div>
      </div>
      <div style={{ height: '10px' }} />
      <button className="primary-button" onClick={handleLogin}>로그인</button>
      <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--g2)' }}>
        계정이 없으신가요? <span className="text-link" onClick={() => setView('register')}>회원가입</span>
      </p>
    </div>
  );
}
