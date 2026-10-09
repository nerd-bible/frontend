// This worker caches web assets so the app can work offline.

// force treating as module despite isolatedModules
export type {};
// ...so we can get good types
declare const self: ServiceWorkerGlobalScope;

// only happens once
self.addEventListener("install", (e: ExtendableEvent) => {
	e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e: ExtendableEvent) => {
	// We could force ourselves to be used handle functional events on first load.
	// e.waitUntil(self.clients.claim());
});

console.log("Worker starting");
