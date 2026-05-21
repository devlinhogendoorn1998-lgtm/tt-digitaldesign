// legal-modals.js — modal open/close voor Privacybeleid & Algemene Voorwaarden
(function () {
    window.openModal = function (id) {
        var el = document.getElementById(id);
        if (el) { el.classList.add('modal-open'); document.body.style.overflow = 'hidden'; }
    };
    window.closeModal = function (id) {
        var el = document.getElementById(id);
        if (el) { el.classList.remove('modal-open'); document.body.style.overflow = ''; }
    };
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.legal-modal-overlay.modal-open').forEach(function (m) {
                window.closeModal(m.id);
            });
        }
    });
    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('legal-modal-overlay')) {
            window.closeModal(e.target.id);
        }
    });
}());
