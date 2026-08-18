// Minimal Service Worker para habilitar instalação de PWA no Chrome/Android
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Apenas ignora e faz o fetch normal (pass-through).
  // Suficiente para o navegador reconhecer o Service Worker como válido.
});
