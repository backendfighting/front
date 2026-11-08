import { ChevronLeft, Settings, X } from 'lucide-react';
import { C } from '../constants/colors';

export function NotiView({ setView, notifications, notiFilter, setNotiFilter, onRead, onDelete, onOpenSettings, onDemo }: any) {


  const filteredNoti = (notifications || []).filter((n: any) => notiFilter === 'unread' ? n.unread : true);
  const unreadCount = (notifications || []).filter((n: any) => n.unread).length;

  return (
    <div className="card">
      <div className="header-row">
        <ChevronLeft onClick={() => setView('main')} className="cursor-pointer" color={C.g3} />
        <h3 className="header-title">알림</h3>
        <Settings size={22} className="cursor-pointer" color={C.g3} onClick={onOpenSettings} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: '24px' }}>
        <div className="filter-tabs" style={{ padding: 0, marginBottom: 0, gap: '8px' }}>
          <button className={`chip ${notiFilter === 'all' ? 'active' : ''}`} style={notiFilter !== 'all' ? { background: 'var(--surface)', color: 'var(--g2)' } : { background: 'var(--ctl)', color: 'white' }} onClick={() => setNotiFilter('all')}>전체</button>
          <button className={`chip ${notiFilter === 'unread' ? 'active' : ''}`} style={notiFilter !== 'unread' ? { background: 'var(--surface)', color: 'var(--g2)' } : { background: 'var(--ctl)', color: 'white' }} onClick={() => setNotiFilter('unread')}>읽지 않음{unreadCount > 0 ? ` ${unreadCount}` : ''}</button>
        </div>
      </div>

      <div className="scroll-content">
        {/* 전시회 시연용: 오늘 남은 미션 개수 알림을 바로 보냄 (기기 알림 설정과 상관없이) */}
        <button className="primary-button" style={{ marginBottom: '16px', background: 'var(--p5)' }} onClick={onDemo}>
          🔔 시연용 테스트 알림 보내기
        </button>

        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--g1)', marginBottom: '12px', marginLeft: '4px' }}>최근 알림</div>
        {filteredNoti.length === 0 && (
          <p style={{ color: 'var(--g1)', textAlign: 'center', fontSize: '13px', padding: '40px 0' }}>새 알림이 없습니다.</p>
        )}

        {filteredNoti.map((n: any) => (
          <div key={n.id}
               style={{
                 background: '#fff',
                 border: '1px solid var(--surface)',
                 borderRadius: '20px',
                 padding: '20px',
                 marginBottom: '16px',
                 display: 'flex',
                 alignItems: 'flex-start',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                 cursor: 'pointer',
                 opacity: n.unread ? 1 : 0.6,
                 position: 'relative'
               }}
               onClick={() => onRead(n)}
          >
            {/* 알림 삭제: 오른쪽 위 x (읽지 않음 글씨와 같은 회색) */}
            <button className="noti-delete" aria-label="알림 삭제" title="알림 삭제"
                    onClick={(e) => { e.stopPropagation(); onDelete(n); }}>
              <X size={16} strokeWidth={2.4} color={C.g2} />
            </button>
            <div style={{
              width: 44, height: 44,
              background: String(n.type).startsWith('goal') ? 'var(--red1)' : 'var(--p15)',
              borderRadius: 14, marginRight: 16, display: 'flex',
              justifyContent: 'center', alignItems: 'center', fontSize: '20px', flexShrink: 0
            }}>
              {n.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingRight: '18px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--g4)', marginBottom: '6px' }}>{n.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--g2)', marginBottom: '12px', lineHeight: '1.4' }}>{n.desc}</div>
              <div style={{ fontSize: '12px', color: 'var(--g1)', fontWeight: '500' }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
