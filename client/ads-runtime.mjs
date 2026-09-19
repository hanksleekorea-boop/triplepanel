import { ADSENSE_CONFIG } from "./ads-config.mjs";

const PUBLISHER_PATTERN = /^ca-pub-\d{16}$/;
const SLOT_PATTERN = /^\d{6,20}$/;

export function validateAdsenseConfig(config = ADSENSE_CONFIG) {
  const errors = [];
  if (typeof config !== "object" || !config) return { valid:false, errors:["설정 객체가 없습니다."] };
  if (config.enabled && !PUBLISHER_PATTERN.test(config.publisherId ?? "")) errors.push("게시자 ID 형식이 올바르지 않습니다.");
  for (const [name, value] of Object.entries(config.slots ?? {})) {
    if (value && !SLOT_PATTERN.test(String(value))) errors.push(`${name} 광고 단위 ID 형식이 올바르지 않습니다.`);
  }
  return { valid:errors.length === 0, errors };
}

export function adsRequestPolicy(config = ADSENSE_CONFIG) {
  const validation = validateAdsenseConfig(config);
  if (!validation.valid) return { allowed: false, reason: "invalid_config", errors: validation.errors };
  if (!config.enabled) return { allowed: false, reason: "disabled", errors: [] };
  if (config.reviewMode === true && config.allowExternalRequests !== true) {
    return { allowed: false, reason: "review_mode_requires_manual_enable", errors: [] };
  }
  if (config.allowExternalRequests !== true) return { allowed: false, reason: "external_requests_not_allowed", errors: [] };
  return { allowed: true, reason: "approved_runtime", errors: [] };
}

export function adSlotHtml(name, label) {
  const slot = ADSENSE_CONFIG.slots?.[name];
  if (!ADSENSE_CONFIG.enabled || !slot || !SLOT_PATTERN.test(String(slot))) return "";
  const attrs = name === "inArticle"
    ? `data-ad-layout="in-article" data-ad-format="fluid"`
    : name === "multiplexFooter"
      ? `data-ad-format="autorelaxed"`
      : `data-ad-format="auto" data-full-width-responsive="true"`;
  return `<aside class="ad-zone ad-zone-${name}" aria-label="${label}"><span class="ad-label">광고</span><ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CONFIG.publisherId}" data-ad-slot="${slot}" ${attrs}></ins></aside>`;
}

function ensureAdsenseScript(onLoad) {
  const existing = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
  if (existing) {
    if (existing.dataset.loaded === "true" || Array.isArray(window.adsbygoogle)) onLoad();
    else existing.addEventListener("load", onLoad, { once:true });
    return;
  }
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
  script.addEventListener("load", () => { script.dataset.loaded = "true"; onLoad(); }, { once:true });
  document.head.append(script);
}

export function initializeAds() {
  const result = validateAdsenseConfig();
  const policy = adsRequestPolicy();
  if (!policy.allowed) return { ...result, initialized: false, blocked: true, reason: policy.reason };
  ensureAdsenseScript(() => document.querySelectorAll("ins.adsbygoogle:not([data-ad-initialized])").forEach((element) => {
      element.dataset.adInitialized = "true";
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
      catch { element.closest(".ad-zone")?.setAttribute("hidden", ""); }
    }));
  return { ...result, initialized: true, blocked: false, reason: policy.reason };
}

export function showPrivacyChoices() {
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  if (typeof window.googlefc.showRevocationMessage === "function") {
    window.googlefc.callbackQueue.push(window.googlefc.showRevocationMessage);
    return true;
  }
  return false;
}
