import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { BASE_URL, authHeaders, readError } from '../api/client';
import { C } from '../constants/colors';

// ===== 회원 탈퇴 (비밀번호 확인 후 탈퇴) =====
export function WithdrawView({ setView, onDone }: any) {
  const [pw, setPw] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const ready = pw.length > 0 && agreed && !busy;

  const handleWithdraw = async () => {
    if (!pw) return alert('비밀번호를 입력해주세요.');
    if (!agreed) return alert('안내 내용을 확인하고 체크해주세요.');
    setBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) { alert(`회원 탈퇴에 실패했습니다.\n${await readError(res)}`); return; }
      alert('회원 탈퇴가 완료되었습니다.');
      onDone();
    } catch { alert('서버와 통신할 수 없습니다.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color={C.g3} />
        <h3 className="header-title">회원 탈퇴</h3>
        <div style={{ width: 24 }} />
      </div>
      <div className="scroll-content" style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--g4)' }}>탈퇴하기 전에 확인해 주세요</h2>
        <p style={{ fontSize: '13px', color: 'var(--g2)', margin: '0 0 18px', wordBreak: 'keep-all' }}>본인 확인을 위해 비밀번호를 한 번 더 입력해 주세요.</p>
        <div className="withdraw-notice">
          <div><span>•</span>루틴, 수행 기록, 할 일을 포함한 모든 정보가 사라져요.</div>
          <div><span>•</span>같은 이메일로 다시 가입할 수 있지만, 삭제된 기록은 되돌릴 수 없어요.</div>
        </div>
        <div className="input-group" style={{ marginTop: '20px' }}>
          <label>비밀번호 확인</label>
          <input type="password" placeholder="비밀번호를 입력하세요" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <label className="withdraw-check">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          위 내용을 모두 확인했어요
        </label>
        <button className="withdraw-button" disabled={!ready} onClick={handleWithdraw}>{busy ? '처리 중...' : '회원 탈퇴'}</button>
      </div>
    </div>
  );
}
