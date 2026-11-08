// 알림을 누르면 앱의 해당 화면(기본: 오늘의 미션)을 연다
// vite.config.ts 의 workbox.importScripts 로 서비스워커에 포함된다
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const tab = (event.notification.data && event.notification.data.open) || 'todo';
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      client.postMessage({ type: 'open-tab', tab });
      if ('focus' in client) return client.focus();
    }
    return self.clients.openWindow('/?open=' + tab);
  })());
});
