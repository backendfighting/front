import { Bell, Menu, Pencil, Plus, Trash2, X } from 'lucide-react';
import { C } from '../../constants/colors';
import { daysUntil } from '../../utils/date';
import { goalYearOf } from '../../utils/stats';
import { CheerFooter } from '../../components/CheerFooter';

export function GoalTab({ bannerClosedYear, goTab, goalFilter, goals, onDeleteGoal, onEditGoal, onOpenMenu, onOpenNoti, setBannerClosedYear, setFailReasons, setGoalFilter, setResultType, setSelectedGoalId, setShowGoalResult, setStatsPeriod, setStatsYear, setView }: any) {
  // 올해 목표 달성률 (끝난 목표 중 성공 비율)
  const thisYearGoals = (goals || []).filter((g: any) => goalYearOf(g) === new Date().getFullYear());
  const thisYearDone = thisYearGoals.filter((g: any) => g.status === '성공' || g.status === '실패');
  const dynamicOverallProgress = thisYearDone.length > 0
    ? Math.round((thisYearDone.filter((g: any) => g.status === '성공').length / thisYearDone.length) * 100) : 0;

 
    // 올해 목표만 보여준다. 단, 진행중 목표는 연도와 상관없이 보여준다 (결과를 기록해야 하니까)
    const goalThisYear = new Date().getFullYear();
    const goalEndKey = (g: any) => String(g.endDate || g.startDate || g.createdAt || '').slice(0, 10);
    const pageGoals = (goals || []).filter((g: any) => {
      const y = goalYearOf(g);
      return g.status === '진행중' || y === null || y === goalThisYear;
    });
    // 정렬: 진행중(마감이 급한 순, 마감일 없는 건 뒤) -> 성공·실패(최근에 끝난 순)
    const activeGoals = pageGoals.filter((g: any) => g.status === '진행중')
      .sort((a: any, b: any) => (a.endDate ? String(a.endDate) : '9999').localeCompare(b.endDate ? String(b.endDate) : '9999'));
    const doneGoals = pageGoals.filter((g: any) => g.status !== '진행중')
      .sort((a: any, b: any) => goalEndKey(b).localeCompare(goalEndKey(a)));
    const filteredGoals = [...activeGoals, ...doneGoals].filter((g:any) => {
      if (goalFilter === 'active') return g.status === '진행중';
      if (goalFilter === 'success') return g.status === '성공';
      if (goalFilter === 'fail') return g.status === '실패';
      return true;
    });
    // 달성률 칸: 올해 성공·실패 개수, 오늘 이후로 마감이 가장 가까운 진행중 목표
    const goalSuccessCount = thisYearGoals.filter((g: any) => g.status === '성공').length;
    const goalFailCount = thisYearGoals.filter((g: any) => g.status === '실패').length;
    const upcoming = activeGoals.filter((g: any) => g.endDate && daysUntil(g.endDate) >= 0);
    const nearestGoal: any = upcoming.length ? upcoming[0] : null;
    const nearestLeft = nearestGoal ? daysUntil(nearestGoal.endDate) : 0;
    // 숨겨진 지난 연도 목표가 있으면 새해 안내 (닫으면 그 해에는 다시 안 보임)
    const pastGoalYears = (goals || []).filter((g: any) => g.status !== '진행중')
      .map((g: any) => goalYearOf(g)).filter((y: any) => y !== null && y < goalThisYear) as number[];
    const showYearBanner = pastGoalYears.length > 0 && bannerClosedYear !== String(goalThisYear);
    const openPastGoalStats = () => {
      goTab('stats');
      setStatsYear(Math.max(...pastGoalYears));
      setStatsPeriod('year');
    };
    const closeYearBanner = () => {
      setBannerClosedYear(String(goalThisYear));
      try { localStorage.setItem('goalYearBannerClosed', String(goalThisYear)); } catch { /* 저장 불가 */ }
    };

    return (
      <>
        <div className="header-row"><Menu size={22} className="cursor-pointer" color={C.g3} onClick={onOpenMenu} /><h3 className="header-title">목표</h3><Bell size={22} color={C.g3} onClick={onOpenNoti} /></div>
        
        <div className="filter-tabs" style={{ justifyContent: 'flex-start', gap: '8px', padding: 0, marginBottom: '16px' }}>
          <button className={`chip ${goalFilter === 'all' ? 'active' : ''}`} style={goalFilter !== 'all' ? { background: 'var(--surface)', color: 'var(--g2)' } : { background: 'var(--navy)', color: 'white' }} onClick={() => setGoalFilter('all')}>전체</button>
          <button className={`chip ${goalFilter === 'active' ? 'active' : ''}`} style={goalFilter !== 'active' ? { background: 'var(--surface)', color: 'var(--g2)' } : { background: 'var(--navy)', color: 'white' }} onClick={() => setGoalFilter('active')}>진행중</button>
          <button className={`chip ${goalFilter === 'success' ? 'active' : ''}`} style={goalFilter !== 'success' ? { background: 'var(--surface)', color: 'var(--g2)' } : { background: 'var(--navy)', color: 'white' }} onClick={() => setGoalFilter('success')}>성공</button>
          <button className={`chip ${goalFilter === 'fail' ? 'active' : ''}`} style={goalFilter !== 'fail' ? { background: 'var(--surface)', color: 'var(--g2)' } : { background: 'var(--navy)', color: 'white' }} onClick={() => setGoalFilter('fail')}>실패</button>
        </div>

        <div className="scroll-content">
          <div className="rate-card goal">
            <div className="rate-row">
              <div className="rate-ring" style={{ background: `conic-gradient(#ffffff 0 ${dynamicOverallProgress}%, rgba(255,255,255,.22) ${dynamicOverallProgress}% 100%)` }}><b>{dynamicOverallProgress}%</b></div>
              <div>
                <div className="rate-label">나의 목표 달성률</div>
                <div className="rate-counts">성공 {goalSuccessCount} · 실패 {goalFailCount} · 진행중 {activeGoals.length}</div>
              </div>
            </div>
            <div className="rate-next">
              <span style={{ minWidth: 0 }}>
                <span className="rate-next-label">가장 가까운 마감</span>
                <span className="rate-next-title">{nearestGoal ? nearestGoal.title : '다가오는 마감이 없어요'}</span>
              </span>
              {nearestGoal && <span className="rate-next-chip">{nearestLeft === 0 ? 'D-day' : `D-${nearestLeft}`}</span>}
            </div>
          </div>

          {showYearBanner && (
            <div className="year-banner" onClick={openPastGoalStats}>
              <div className="year-banner-text">
                <b>새로운 한 해가 시작됐어요!</b>
                <span>트래커님의 작년 목표들은 통계 탭에 정리해 뒀어요{'\u00a0'}→</span>
              </div>
              <button className="year-banner-close" aria-label="안내 닫기" onClick={(e) => { e.stopPropagation(); closeYearBanner(); }}><X size={14} /></button>
            </div>
          )}

          {filteredGoals.length === 0 && (
            <p style={{ color: 'var(--g1)', textAlign: 'center', fontSize: '13px', padding: '20px 0' }}>
              {goalFilter === 'active' ? '진행중인 목표가 없어요.' : goalFilter === 'success' ? '올해 성공한 목표가 없어요.' : goalFilter === 'fail' ? '올해 실패한 목표가 없어요.' : '올해 목표가 없어요. 새 목표를 세워보세요!'}
            </p>
          )}
          
          {filteredGoals.map((g:any) => {
            const isSuccess = g.status === '성공';
            const isFail = g.status === '실패';
            const statusColor = isSuccess ? 'var(--green)' : isFail ? 'var(--red)' : 'var(--orange)';
            // 진행중 목표: 마감 7일 전부터 D-n, 마감이 지났으면 결과 기록 필요
            const left = !isSuccess && !isFail && g.endDate ? daysUntil(g.endDate) : null;
            const dBadge = left !== null && left >= 0 && left <= 7
              ? <span className="goal-badge dday">{left === 0 ? 'D-day' : `D-${left}`}</span> : null;
            const overdueBadge = left !== null && left < 0 ? <span className="goal-badge overdue small">결과 기록 필요</span> : null;

            return (
              <div key={`goal-${g.id}`} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px', background: '#fff', borderRadius: '20px', marginBottom: '16px', border: '1px solid var(--surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} 
                   onClick={() => { 
                     setSelectedGoalId(g.id); 
                     setResultType(isSuccess ? 'success' : isFail ? 'fail' : null); 
                     setFailReasons(g.reason ? g.reason.split(',').map((r: string) => r.trim()) : []);
                     setShowGoalResult(true); 
                   }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (g.description || g.desc) ? '6px' : '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--g4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{g.title}</span>
                    {dBadge}
                  </span>
                  <span style={{ color: statusColor, fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>{g.status}</span>
                </div>

                {/* 목표 내용: 제목과 날짜의 중간 색 */}
                {(g.description || g.desc) && (
                  <div style={{ fontSize: '11px', color: 'var(--g3)', lineHeight: 1.5, marginBottom: '14px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                    {g.description || g.desc}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--g1)', fontWeight: '500' }}>
                    {g.startDate || '-'} ~ {g.endDate || '-'}{overdueBadge}
                  </span>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
  <Pencil size={18} color={C.g1} onClick={(e) => { e.stopPropagation(); onEditGoal(g); }} />
  <Trash2 size={18} color={C.g1} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); if(confirm('삭제하시겠습니까?')) onDeleteGoal(g.id); }} />
</div>
                </div>
              </div>
            );
          })}
          <CheerFooter />
        </div>
        <div className="fab" onClick={() => setView('goal-add')}><Plus /></div>
      </>
    );
}
