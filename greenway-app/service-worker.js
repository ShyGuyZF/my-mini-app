// Версия кэша - меняйте при обновлении приложения
const CACHE_NAME = 'greenway-v1.1';
const APP_SHELL = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data/articles.json',
    './manifest.json',
    './assets/icons/icon-72x72.png',
    './assets/icons/icon-192x192.png',
    './assets/icons/icon-512x512.png',
    './offline.html'

];


// Установка Service Worker и кэширование ресурсов
self.addEventListener('install', event => {
    console.log('[Service Worker] Установка');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Кэширование ресурсов');
                return cache.addAll(APP_SHELL);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
    console.log('[Service Worker] Активация');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Стратегия кэширования: сначала сеть, потом кэш
self.addEventListener('fetch', event => {
    // Пропускаем запросы к внешним API и аналитике
    if (event.request.url.includes('api.') ||
        event.request.url.includes('analytics') ||
        event.request.url.includes('googleapis')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Клонируем ответ
                const responseClone = response.clone();

                // Кэшируем только успешные GET-запросы
                if (response.status === 200 && event.request.method === 'GET') {
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });
                }

                return response;
            })
            .catch(() => {
                // Если нет сети, ищем в кэше
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }

                        // Для страниц возвращаем офлайн-страницу
                        if (event.request.mode === 'navigate') {
                            return caches.match('./offline.html');
                        }

                        return new Response('Нет подключения к интернету', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Обработка push-уведомлений (если добавите в будущем)
self.addEventListener('push', event => {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

