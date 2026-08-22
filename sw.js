// minimal service worker — its only job is to show a system notification
// when a push arrives (even if no tab is open) and focus/open the right
// page when tapped. No caching/offline behavior here; that's a separate
// concern this doesn't attempt to solve.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Thư Viện";
  const options = {
    body: data.body || "",
    icon: "https://cdn-icons-png.flaticon.com/512/2784/2784539.png",
    badge: "https://cdn-icons-png.flaticon.com/512/2784/2784539.png",
    data: { url: data.url || "index.html" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// tapping the notification focuses an already-open tab on this site if
// there is one, instead of always opening a fresh one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "index.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
