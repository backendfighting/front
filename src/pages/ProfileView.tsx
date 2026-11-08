import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { BASE_URL, authHeaders, readError } from '../api/client';
import { C } from '../constants/colors';

// ===== 프로필 수정 =====
export function ProfileView({ setView, userProfile, setUserProfile }: any) {
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
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color={C.g3} />
        <h3 className="header-title">프로필 수정</h3>
        <span className="text-link" onClick={handleSave}>저장</span>
      </div>
      <div className="scroll-content">
        <div className="input-group"><label>👤 닉네임</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="닉네임" /></div>
        <div className="input-group"><label>✉️ 이메일</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" /></div>
        <p style={{ fontSize: '12px', color: 'var(--g1)', marginTop: '8px' }}>이메일을 바꾸면 다음 로그인부터 새 이메일을 사용해요.</p>
      </div>
    </div>
  );
}
