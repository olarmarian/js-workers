const checkForWorkers = () => {
  if (!navigator.serviceWorker) {
    throw new Error("No ServiceWorker support");
  }

  if (!window.PushManager) {
    throw new Error("No Push API Support");
  }
};

const registerServiceWorker = async () => {
  const registration = await navigator.serviceWorker.register("./worker.js", {
    scope: "/", // '/' is already default value, it can be skipped if is not a specific route
  });

  displayStatus(registration);
  return registration;
};

const displayStatus = (registration) => {
  if (registration.installing) {
    console.log("Worker is installing !");
  }

  if (registration.waiting) {
    console.log("Worker is waiting !");
  }

  if (registration.active) {
    console.log("Worker is active !");
  }
};

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

const requestNotificationPermission = async () => {
  const permission = await window.Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permission not granted for Notification");
  }
};

const triggerLocalNotifications = (registration, time) => {
  setInterval(() => {
    showLocalNotification(
      "Notification title",
      "Notification body",
      registration
    );
  }, time * 1000);
};

const LOCAL_NOTIFICATION_INTERVAL = 5; // in seconds

const runApp = async () => {
  checkForWorkers();

  const registration = await registerServiceWorker();
  const permission = await requestNotificationPermission();

  triggerLocalNotifications(registration, LOCAL_NOTIFICATION_INTERVAL);
};

const permissionBtn = document.getElementById("btn__permission");
permissionBtn.addEventListener("click", () => runApp());
