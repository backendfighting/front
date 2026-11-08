import { AlertCircle, RotateCcw } from 'lucide-react';
import { C } from '../constants/colors';
import type { SetView } from '../types';

export function ErrorView({ setView }: { setView: SetView }) {
  return (
    <div className="card" style={{ justifyContent: 'center', paddingBottom: '30px' }}>
      <div style={{ width: '84px', height: '84px', backgroundColor: 'var(--surface)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
        <AlertCircle size={42} color={C.p5} />
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 700 }}>문제가 발생했습니다</h2>
      <button className="dark-button" onClick={() => setView('login')}><RotateCcw size={18} /> 다시 시도</button>
    </div>
  );
}
