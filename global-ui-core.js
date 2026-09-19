/* Global Commercial Service UI & Multilingual Engine */
(() => {
  const I18N_DICT = {
    ko: {
      lang: '한국어', searchPlaceholder: '검색어를 입력하세요...',
      home: '홈', service: '서비스', docs: '문서', support: '고객지원',
      safeNotice: '공식 상용화 서비스 · 개인정보 비수집 원칙 준수',
      copyLink: '링크 복사', copied: '복사 완료!'
    },
    en: {
      lang: 'English', searchPlaceholder: 'Search anything...',
      home: 'Home', service: 'Services', docs: 'Docs', support: 'Support',
      safeNotice: 'Official Commercial Service · Zero Personal Data Collection Policy',
      copyLink: 'Copy Link', copied: 'Copied!'
    },
    th: {
      lang: 'ภาษาไทย', searchPlaceholder: 'ค้นหาข้อมูล...',
      home: 'หน้าแรก', service: 'บริการ', docs: 'เอกสาร', support: 'ช่วยเหลือ',
      safeNotice: 'บริการเชิงพาณิชย์มาตรฐานสากล · นโยบายไม่เก็บข้อมูลส่วนบุคคล',
      copyLink: 'คัดลอกลิงก์', copied: 'คัดลอกแล้ว!'
    },
    ja: {
      lang: '日本語', searchPlaceholder: '検索キーワードを入力...',
      home: 'ホーム', service: 'サービス', docs: 'ドキュメント', support: 'サポート',
      safeNotice: '公式商用サービス · 個人情報非収集ポリシー遵守',
      copyLink: 'リンクをコピー', copied: 'コピー完了!'
    }
  };

  function getActiveLang() {
    return localStorage.getItem('global_service_lang') || document.documentElement.lang || 'ko';
  }

  function applyGlobalLang(lang) {
    const t = I18N_DICT[lang] || I18N_DICT.ko;
    document.documentElement.lang = lang;
    document.documentElement.dataset.globalLang = lang;

    // Update placeholder
    const searchInputs = document.querySelectorAll('input[type="search"], input[name="q"], input#search, input#q');
    searchInputs.forEach(input => {
      if (!input.dataset.origPlaceholder) input.dataset.origPlaceholder = input.placeholder || '';
      input.placeholder = t.searchPlaceholder;
    });

    // Update switcher buttons
    document.querySelectorAll('[data-global-lang-btn]').forEach(btn => {
      btn.style.fontWeight = btn.dataset.globalLangBtn === lang ? '700' : '400';
      btn.style.background = btn.dataset.globalLangBtn === lang ? '#075f37' : 'transparent';
      btn.style.color = btn.dataset.globalLangBtn === lang ? '#ffffff' : '#444444';
    });

    try { localStorage.setItem('global_service_lang', lang); } catch(e) {}
  }

  function injectGlobalSwitcher() {
    if (document.getElementById('global-commercial-topbar')) return;
    const bar = document.createElement('div');
    bar.id = 'global-commercial-topbar';
    bar.style.cssText = 'position:relative;z-index:99999;background:#f8faf9;border-bottom:1px solid #e1e8e4;padding:4px 12px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#4a5568;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';

    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;"></span>
        <span style="font-weight:600;color:#0f172a;">Global Production Service</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;">
        <button type="button" data-global-lang-btn="en" style="border:1px solid #cbd5e1;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;transition:all .15s;">English</button>
        <button type="button" data-global-lang-btn="ko" style="border:1px solid #cbd5e1;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;transition:all .15s;">한국어</button>
        <button type="button" data-global-lang-btn="th" style="border:1px solid #cbd5e1;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;transition:all .15s;">ไทย</button>
      </div>
    `;

    document.body.insertBefore(bar, document.body.firstChild);

    bar.querySelectorAll('[data-global-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => applyGlobalLang(btn.dataset.globalLangBtn));
    });

    applyGlobalLang(getActiveLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGlobalSwitcher);
  } else {
    injectGlobalSwitcher();
  }
})();
