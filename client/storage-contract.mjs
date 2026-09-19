/**
 * Storage capability boundary for the current static Sites build.
 *
 * The public app is deliberately local-first.  This module describes that
 * boundary and provides a deterministic mock used by tests and future work;
 * it does not contact a server or create a fake authenticated session.
 */
export const STORAGE_CONTRACT = Object.freeze({
  selectedStructure: "D",
  mode: "LOCAL_ONLY",
  label: "정적 호스팅 + 기기 초안",
  statusText: "현재 자료는 이 브라우저·기기에만 저장됩니다. 실시간 공동편집은 연결되지 않았습니다.",
  sharedWrite: false,
  realtimeSubscription: false,
  serverAuthorization: false,
  automaticUpload: false,
  automaticMigration: false,
  errorCodes: Object.freeze([
    "SHARED_STORAGE_UNAVAILABLE",
    "RUNTIME_API_UNVERIFIED",
    "FIXED_LINK_WRITE_UNSUPPORTED",
    "CONFLICT_UNRESOLVED",
    "REAL_MULTIUSER_TEST_REQUIRED",
  ]),
});

export const STORAGE_STRUCTURE_OPTIONS = Object.freeze({
  A: "기존 프로젝트 공유 저장소 재사용",
  B: "플랫폼 공식 런타임 공유 상태 API",
  C: "기존 서버에 최소 공유 API 추가",
  D: "정적 호스팅 + 로컬 초안·오프라인·모의 공유 계약",
  E: "공식 조건부 전체 HTML 재발행",
});

export function createOfflineQueue() {
  const queue = [];
  return Object.freeze({
    enqueue(operation) {
      if (!operation || typeof operation !== "object") throw new TypeError("operation must be an object");
      queue.push(structuredClone(operation));
      return queue.length;
    },
    peek() {
      return queue.length ? structuredClone(queue[0]) : null;
    },
    dequeue() {
      return queue.length ? structuredClone(queue.shift()) : null;
    },
    clear() {
      queue.length = 0;
    },
    get size() {
      return queue.length;
    },
  });
}

/**
 * Deterministic in-memory contract test double.  It models only the minimum
 * server behavior needed to validate revision checks and subscriptions.  It
 * must never be used as evidence that the production public page has a
 * shared backend.
 */
export function createMockSharedDocumentStore(initialDocument = {}) {
  let revision = 0;
  let document = structuredClone(initialDocument);
  const listeners = new Set();
  const snapshot = () => ({ revision, document: structuredClone(document) });

  return {
    async get() {
      return snapshot();
    },
    async conditionalSave({ expectedRevision, nextDocument }) {
      if (!Number.isInteger(expectedRevision) || expectedRevision !== revision) {
        return { ok: false, errorCode: "CONFLICT_UNRESOLVED", current: snapshot() };
      }
      document = structuredClone(nextDocument);
      revision += 1;
      const next = snapshot();
      listeners.forEach((listener) => listener(next));
      return { ok: true, ...next };
    },
    subscribe(listener) {
      if (typeof listener !== "function") throw new TypeError("listener must be a function");
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
