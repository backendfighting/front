import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { BASE_URL, authHeaders, readError } from '../api/client';
import { C } from '../constants/colors';

// ===== 비밀번호 변경 =====
export function PasswordView({ setView }: any) {
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
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color={C.g3} />
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
