const CACHE_NAME = "human-ai-therapist-v1";
const APP_SHELL = [
    "./",
    "./index.html",
    "./mode3.css",
    "./script.js",
    "./icon.svg",
    "./title1.svg",
    "./title2.svg",
    "./title3.svg",
    "./title4.svg"
];
const APP_SHELL_URLS = new Set(
    APP_SHELL.map((asset) => new URL(asset, self.registration.scope).href)
);

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key.startsWith("human-ai-therapist-") && key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match(new URL("./index.html", self.registration.scope)))
        );
        return;
    }

    if (!APP_SHELL_URLS.has(requestUrl.href)) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const responseCopy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});