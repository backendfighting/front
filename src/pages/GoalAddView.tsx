import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Toggle } from '../components/Toggle';
import { C, NAVY_SCOPE } from '../constants/colors';
import { GOAL_ADD_BANNERS, categoryOptions } from '../constants/goals';
import { isRealDate } from '../utils/date';

export function GoalAddView({ setView, onAddGoal, onUpdateGoal, editingGoal, globalDate }: any) {
  const [banner] = useState(() => GOAL_ADD_BANNERS[Math.floor(Math.random() * GOAL_ADD_BANNERS.length)]);
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
    <div className="card" style={NAVY_SCOPE}>
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color={C.g3} />
        <h3 className="header-title">{isEdit ? '목표 수정' : '목표 추가'}</h3>
        <span className="text-link" onClick={handleSave}>저장</span>
      </div>
      <div className="scroll-content">
        {/* 좁은 폰에서도 한 줄 문구가 한 줄에 들어가도록 좌우 여백을 줄이고 글자 크기를 화면 너비에 맞춤 (최대 16px) */}
        <div style={{ background: 'var(--navy1)', color: 'var(--navy)', padding: '24px 12px', borderRadius: '16px', textAlign: 'center', fontWeight: 'bold', fontSize: 'clamp(13px, 3.7vw, 16px)', marginBottom: '20px', wordBreak: 'keep-all', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
          {isEdit ? '목표를 수정해보세요!' : banner}
        </div>

        <div className="input-group">
          <label>목표 제목</label>
          <input placeholder="예 : SQLD 자격증 취득" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="input-group">
          <label>카테고리</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categoryOptions(editingGoal?.category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label>메모</label>
          <textarea
            placeholder="목표에 대한 설명이나 다짐을 적어보세요"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid var(--line)', borderRadius: '12px', minHeight: '80px', resize: 'none' }}
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', border: '1px solid var(--surface)', borderRadius: '16px' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--g4)' }}>⏰ 리마인더 알림</div>
            <div style={{ fontSize: '11px', color: 'var(--g1)', marginTop: '3px' }}>마감일에 알림을 보내드려요</div>
          </div>
          <Toggle on={reminder} onClick={() => setReminder(!reminder)} label="리마인더 알림" />
        </div>
      </div>
    </div>
  );
}
