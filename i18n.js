(function () {
    var LANGS = ['en', 'it', 'es', 'fr', 'hi'];
    var DEFAULT = 'en';

    function normalize(raw) {
        if (!raw) return DEFAULT;
        var base = String(raw).toLowerCase().split(/[-_]/)[0];
        return LANGS.indexOf(base) === -1 ? DEFAULT : base;
    }

    function dict(lang) {
        return (window.REMOCAT_I18N && window.REMOCAT_I18N[lang]) || null;
    }

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

    function remember(lang) {
        try { sessionStorage.setItem('remocat_lang', lang); } catch (e) {}
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
