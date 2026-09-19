// Fail-safe for slow or failed module loading. app.js clears aria-busy after a successful render.
const root = document.querySelector("#app");
const timer = setTimeout(() => {
  if (!root || root.getAttribute("aria-busy") !== "true") return;
  root.innerHTML = `<div class="boot" role="alert"><strong>화면을 불러오지 못했습니다</strong><span>인터넷 연결을 확인한 뒤 다시 시도하세요. 자료는 삭제하지 않았습니다.</span><div class="inline-actions"><button class="primary-button" type="button" id="boot-retry">다시 시도</button><a class="ghost-button" href="/help">도움말</a><a class="ghost-button" href="/status">서비스 상태</a></div></div>`;
  root.querySelector("#boot-retry")?.addEventListener("click", () => location.reload());
}, 4000);
window.addEventListener("beforeunload", () => clearTimeout(timer), { once: true });
