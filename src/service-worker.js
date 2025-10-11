// Tech Trends Talks - Service Worker for PWA and Performance
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `tech-trends-talks-${CACHE_VERSION}`;

// Resources to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/calculator/emi-calculator',
  '/calculator/sip-calculator',
  '/assets/images/logo.png',
  '/assets/images/techtrendstalks-logo.jpeg',
  '/manifest.json'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Determine caching strategy based on resource type
  let strategy = CACHE_STRATEGIES.NETWORK_FIRST;

  if (request.destination === 'image') {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  } else if (request.destination === 'font') {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  } else if (request.destination === 'style' || request.destination === 'script') {
    strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  } else if (url.pathname.includes('/api/')) {
    strategy = CACHE_STRATEGIES.NETWORK_FIRST;
  }

  event.respondWith(handleRequest(request, strategy));
});

/**
 * Handle request based on caching strategy
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    
    default:
      return networkFirst(request);
  }
}

/**
 * Cache-first strategy
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    throw error;
  }
}

/**
 * Network-first strategy
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-calculations') {
    event.waitUntil(syncCalculations());
  }
});

async function syncCalculations() {
  // Implement background sync logic for saved calculations
  console.log('[ServiceWorker] Syncing calculations...');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/assets/images/logo.png',
    badge: '/assets/images/logo.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/assets/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Tech Trends Talks', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

