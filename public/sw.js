// This is a basic service worker. It's required for the app to be installable.
self.addEventListener('fetch', (event) => {
  // This service worker doesn't do any caching, it just satisfies the PWA requirement.
  return;
});