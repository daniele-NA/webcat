/* ============================================================
   Remocat — minimal client-side i18n for the static pages.
   Languages: en (default), it, es, fr, hi.
   Each page defines window.REMOCAT_I18N before loading this file.
   Translated strings are keyed by the elements' data-i18n value;
   "__title" is a special key applied to document.title.

   The language comes from the "lang" query parameter, so the app
   can open a page in a given language:  privacy.html?lang=it
   When that parameter is present the picker in the header is
   hidden (see the inline snippet in each page's <head>), and the
   host app is the single source of truth. Without it the page
   opens in English and the picker lets the visitor switch.
   ============================================================ */
(function () {
    var LANGS = ['en', 'it', 'es', 'fr', 'hi'];
    var DEFAULT = 'en';

    /* Accepts a bare code or a full locale ("it-IT", "es_419") and
       returns the supported base code, falling back to DEFAULT. */
    function normalize(raw) {
        if (!raw) return DEFAULT;
        var base = String(raw).toLowerCase().split(/[-_]/)[0];
        return LANGS.indexOf(base) === -1 ? DEFAULT : base;
    }

    function dict(lang) {
        return (window.REMOCAT_I18N && window.REMOCAT_I18N[lang]) || null;
    }

    /* Same-origin page links must carry the language forward, otherwise every hop
       resets to English and — inside the host app — the picker reappears. Only when
       the language was pinned by the caller: on the public site the picker stays. */
    function propagateLang(lang) {
        document.querySelectorAll('a[href]').forEach(function (a) {
            var href = a.getAttribute('href');
            if (!href || /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) return;
            var hash = href.indexOf('#');
            var frag = hash === -1 ? '' : href.slice(hash);
            var path = (hash === -1 ? href : href.slice(0, hash)).split('?')[0];
            a.setAttribute('href', path + '?lang=' + lang + frag);
        });
    }

    function apply(lang) {
        var strings = dict(lang) || dict(DEFAULT) || {};

        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (Object.prototype.hasOwnProperty.call(strings, key)) {
                el.innerHTML = strings[key];
            }
        });

        if (strings.__title) document.title = strings.__title;

        var sel = document.getElementById('langSelect');
        if (sel) sel.value = lang;
    }

    /* Public site only: remember the visitor's pick for the session, so moving between
       pages keeps the language without pinning it in the URL (which would hide the picker). */
    function remember(lang) {
        try { sessionStorage.setItem('remocat_lang', lang); } catch (e) { /* private mode */ }
    }

    function remembered() {
        try { return sessionStorage.getItem('remocat_lang'); } catch (e) { return null; }
    }

    function init() {
        var sel = document.getElementById('langSelect');
        if (sel) {
            sel.addEventListener('change', function () {
                var lang = normalize(sel.value);
                remember(lang);
                apply(lang);
            });
        }

        var pinned = new URLSearchParams(location.search).get('lang');
        var lang = normalize(pinned || remembered());
        apply(lang);
        if (pinned) propagateLang(lang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
