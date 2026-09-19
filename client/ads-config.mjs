export const ADSENSE_CONFIG = Object.freeze({
  enabled: true,
  publisherId: "ca-pub-2476023536699107",
  reviewMode: true,
  // 검토 중인 무료 공개판에서는 광고 외부 요청을 기본 차단합니다.
  // 실제 승인·동의·운영 검사를 끝낸 뒤에만 true로 바꿉니다.
  allowExternalRequests: false,
  autoAds: true,
  slots: Object.freeze({
    displayTop: "4878595576",
    inArticle: "2462973771",
    multiplexFooter: "6000105555",
  }),
});
