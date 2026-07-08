/* ============================================================
   Remocat — minimal client-side i18n for the static pages.
   Languages: en (default), it, es, fr, hi.
   Each page defines window.REMOCAT_I18N before loading this file.
   Translated strings are keyed by the elements' data-i18n value;
   "__title" is a special key applied to document.title.
   ============================================================ */
(function () {
    var LANGS = ['en', 'it', 'es', 'fr', 'hi'];
    var STORAGE_KEY = 'remocat-lang';
    var DEFAULT = 'en';

    function dict(lang) {
        return (window.REMOCAT_I18N && window.REMOCAT_I18N[lang]) || null;
    }

    function apply(lang) {
        if (LANGS.indexOf(lang) === -1) lang = DEFAULT;
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

        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    }

    function init() {
        var lang = DEFAULT;
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) lang = stored;
        } catch (e) {}

        var urlLang = new URLSearchParams(location.search).get('lang');
        if (urlLang) lang = urlLang;

        var sel = document.getElementById('langSelect');
        if (sel) {
            sel.addEventListener('change', function () { apply(sel.value); });
        }

        apply(lang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
