import { useEffect, useState } from 'react';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { BASE_URL, authHeaders, readError } from '../api/client';
import { TimeSelect } from '../components/TimeSelect';
import { Toggle } from '../components/Toggle';
import { C, NAVY_SCOPE } from '../constants/colors';

export function NotiSettingsView({ setView, backTo = 'main' }: any) {
  const [perm, setPerm] = useState<string>(typeof Notification !== 'undefined' ? Notification.permission : 'denied');
  // 기기 알림 = 전체 알림 스위치 (서버에 저장, 기본값 꺼짐)
  // 끄면 아래 알림이 모두 꺼지고, 다시 켜면 이전에 정해둔 설정 그대로 돌아온다
  const [deviceOn, setDeviceOn] = useState(false);
  const [settings, setSettings] = useState<any>({
    missionAlarmOn: false, missionAlarmTimes: ['08:00'],
    goalAlarmOn: false, goalAlarmTime: '09:00',
  });
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fromServer = (d: any) => ({
    missionAlarmOn: !!d.missionAlarmOn,
    missionAlarmTimes: Array.isArray(d.missionAlarmTimes) && d.missionAlarmTimes.length ? d.missionAlarmTimes : ['08:00'],
    goalAlarmOn: !!d.goalAlarmOn,
    goalAlarmTime: d.goalAlarmTime || '09:00',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/users/me`, { headers: authHeaders() });
        const d = res.ok ? await res.json() : null;
        if (d) { setDeviceOn(!!d.deviceAlarmOn); setSettings(fromServer(d)); }
      } catch { /* 기본값으로 표시 */ }
      finally { setLoaded(true); }
    })();
  }, []);

  const change = (patch: any) => { setSettings((prev: any) => ({ ...prev, ...patch })); setDirty(true); };
  const times: string[] = settings.missionAlarmTimes;

  // 이 기기에서 브라우저 알림 허용 받기
  const askPermission = async () => {
    if (typeof Notification === 'undefined') return alert('이 브라우저는 알림을 지원하지 않아요.');
    if (Notification.permission === 'denied') {
      return alert('이 사이트의 알림이 브라우저에서 차단되어 있어요.\n\n주소창 왼쪽 아이콘 → 알림 → "허용"으로 바꿔주세요.');
    }
    if (Notification.permission === 'default') setPerm(await Notification.requestPermission());
  };

  // 기기 알림 스위치는 누르는 즉시 저장
  const toggleDevice = async () => {
    const next = !deviceOn;
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/alarm-settings`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ deviceAlarmOn: next }),
      });
      if (!res.ok) return alert(`저장에 실패했습니다.\n${await readError(res)}`);
      setDeviceOn(next);
      // 처음 켤 때 서버가 오늘의 미션·목표 리마인더를 켜주므로 그 결과를 반영 (저장 안 한 변경은 유지)
      const d = await res.json().catch(() => null);
      if (d && next && !dirty) setSettings(fromServer(d));
    } catch { return alert('서버와 통신할 수 없습니다.'); }
    if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') await askPermission();
  };

  const addTime = () => {
    const next = ['21:00', '12:00', '18:00', '07:00', '09:00'].find(t => !times.includes(t)) || '09:00';
    change({ missionAlarmTimes: [...times, next] });
  };

  const save = async () => {
    const body = { ...settings, missionAlarmTimes: Array.from(new Set(times)).sort() };
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/alarm-settings`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body),
      });
      if (!res.ok) return alert(`저장에 실패했습니다.\n${await readError(res)}`);
      setSettings(body);
      setDirty(false);
      alert('알림 설정이 저장되었습니다.');
    } catch { alert('서버와 통신할 수 없습니다.'); }
  };

  const goBack = () => {
    if (dirty && !confirm('저장하지 않은 변경 사항이 있어요. 저장하지 않고 나갈까요?')) return;
    setView(backTo);
  };

  // locked: 기기 알림이 꺼져 있어서 꺼진 것으로 보이고 누를 수 없음 (정해둔 값은 그대로 기억)
  const section = (title: string, desc: string, on: boolean, onToggle: () => void, label: string, body?: any, locked = false) => (
    <div className="noti-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ opacity: locked ? 0.55 : 1 }}>
          <div className="noti-section-title">{title}</div>
          <div className="noti-section-desc">{desc}</div>
        </div>
        <Toggle xs on={on && !locked} onClick={onToggle} label={label} disabled={locked} />
      </div>
      {on && !locked && body}
    </div>
  );

  const deviceDesc = !deviceOn ? '모든 알림을 받지 않아요'
    : perm === 'granted' ? '알림을 받고 있어요'
    : perm === 'denied' ? '이 기기는 브라우저에서 알림이 차단되어 있어요'
    : '이 기기에서 알림 허용이 필요해요';

  return (
    <div className="card" style={NAVY_SCOPE}>
      <div className="header-row">
        <ChevronLeft onClick={goBack} className="cursor-pointer" color={C.g3} />
        <h3 className="header-title">알림 설정</h3>
        <span className="text-link" onClick={save}>저장</span>
      </div>
      <div className="scroll-content">
        {loaded && (
          <>
            {section('기기 알림', deviceDesc, deviceOn, toggleDevice, '기기 알림',
              perm === 'default' ? (
                <button className="add-time-btn" onClick={askPermission}>이 기기에서 알림 허용하기</button>
              ) : null)}

            {section('오늘의 미션 알림', '오늘 해야 할 미션의 개수를 알려드려요',
              settings.missionAlarmOn, () => change({ missionAlarmOn: !settings.missionAlarmOn }), '오늘의 미션 알림',
              <>
                {times.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <TimeSelect value={t} onChange={(v) => change({ missionAlarmTimes: times.map((x, j) => (j === i ? v : x)) })} />
                    <button className="time-remove-btn" aria-label="이 시간 삭제" onClick={() => change({ missionAlarmTimes: times.filter((_, j) => j !== i) })}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {times.length === 0 && (
                  <p className="field-hint" style={{ marginTop: '10px' }}>알림 시간을 추가해주세요.</p>
                )}
                <button className="add-time-btn" onClick={addTime}>
                  <span className="add-time-icon"><Plus size={14} /></span>
                  시간 추가
                </button>
              </>, !deviceOn)}

            {section('목표 리마인더 알림', '목표 마감일과 완료 상태 업데이트가 필요한 시점에 알림을 보내드려요',
              settings.goalAlarmOn, () => change({ goalAlarmOn: !settings.goalAlarmOn }), '목표 리마인더 알림',
              <div style={{ marginTop: '10px' }}>
                <TimeSelect value={settings.goalAlarmTime} onChange={(v) => change({ goalAlarmTime: v })} />
              </div>, !deviceOn)}
          </>
        )}

        <p className="field-hint" style={{ margin: '14px 4px 0', lineHeight: 1.6 }}>
          할 일·루틴 알림은 추가하거나 수정할 때 정할 수 있어요.
        </p>
      </div>
    </div>
  );
}
