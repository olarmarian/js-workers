// Constants
const SERVER_URL = "http://localhost:3000";
const SAVE_SUBSCRIPTION_URL = `${SERVER_URL}/save-subscription`;
const CACHE_VERSION = "v2";
const KEEP_CACHES_LIST = ["v2"];
const PUBLIC_KEY =
  "BDHKfsruei5H3hWyz5EB91RZvwOZkYUTkWJpjqoZ2YklQOPXBA9mkV7xzNA9JvVS1fcCs6pLOJK7cC2OAXNdi0Y";
const PRIVATE_KEY = "vCPksy1gPXIbbXLZIYkRWqRlSC7rxwftQyLTE-grtN4";

// Start Utils
const urlB64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// End Utils

// Start Caching
const addResourcesToCache = async (resources) => {
  const cache = await caches.open(CACHE_VERSION);
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open(CACHE_VERSION);
  try {
    await cache.put(request, response);
  } catch (err) {
    console.log(err, "cache request error");
  }
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  const fromCache = await caches.match(request);
  if (fromCache) {
    return fromCache;
  }

  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  return fetch(request)
    .then((response) => {
      putInCache(request, response.clone());
      return response;
    })
    .catch(() => caches.match(fallbackUrl))
    .then((fallback) => {
      return (
        fallback ||
        new Response("Network error", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        })
      );
    });
};

const deleteCache = async (key) => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter(
    (key) => !KEEP_CACHES_LIST.includes(key)
  );
  await Promise.all(cachesToDelete.map(deleteCache)).then(() =>
    self.clients.claim()
  );
};

// End Caching

//Start PushNotifications
const showLocalNotification = (title, body, registration) => {
  const options = {
    body, //:string
    // icon: url,
    // image: url,
    // badge: url,
    // vibrate: number[],
    // sound: url,
    // dir: 'auto' | 'ltr' | 'rtl',

    // tag: string,
    // data: any,
    // requireInteraction: boolean,
    // renotify: boolean,
    // silent: boolean,

    // actions: string[],

    // timestamp: number,
  };

  registration.showNotification(title, options);
};

const subscribeRemoteNotifications = async () => {
  const appServerKey = urlB64ToUint8Array(PUBLIC_KEY);
  try {
    const options = {
      applicationServerKey: appServerKey,
      userVisibleOnly: true,
    };
    const subscription = await self.registration.pushManager.subscribe(options);
    console.log(JSON.stringify(subscription), "subscription");

    const response = await saveSubscription(subscription);
    console.log(response, "save subscription response");
  } catch (err) {
    console.log("err => ", err);
  }
};

const saveSubscription = async (subscription) => {
  const response = await fetch(SAVE_SUBSCRIPTION_URL, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });
  return response.json();
};

//End PushNotifications

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};


// ServiceWorker setup
self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache(["/", "/index.html", "/main.js"]).then(() =>
      self.skipWaiting()
    )
  );
});

self.addEventListener("activate", async (event) => {
  event.waitUntil(
    enableNavigationPreload(),
    subscribeRemoteNotifications(),
    deleteOldCaches()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    cacheFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallback: "error.html",
    })
  );
});

self.addEventListener("push", (event) => {
  if (event.data) {
    //Handle data received on push event from server

    showLocalNotification(
      "Push notification",
      event.data.text(),
      self.registration
    );
  }
});
