/* Mejora progresiva: sin JavaScript, la navegación permanece visible. */
(() => {
	'use strict';

	const header = document.querySelector('.site-header');
	const toggle = header?.querySelector('.site-header__toggle');
	const navigation = header?.querySelector('.site-header__nav');

	if (!toggle || !navigation) return;

	const mobile = window.matchMedia('(max-width: 1100px)');

	const setOpen = (open, restoreFocus = false) => {
		toggle.setAttribute('aria-expanded', String(open));
		navigation.hidden = mobile.matches && !open;
		if (restoreFocus) toggle.focus();
	};

	const syncViewport = () => {
		const focusInNavigation = navigation.contains(document.activeElement);
		const focusOnToggle = document.activeElement === toggle;
		toggle.hidden = !mobile.matches;
		setOpen(false, mobile.matches && focusInNavigation);
		if (!mobile.matches && focusOnToggle) navigation.querySelector('a')?.focus();
	};

	toggle.addEventListener('click', () => {
		setOpen(toggle.getAttribute('aria-expanded') !== 'true');
	});

	header.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && mobile.matches && !navigation.hidden) {
			setOpen(false, true);
		}
	});

	navigation.addEventListener('click', (event) => {
		if (mobile.matches && event.target.closest('a')) setOpen(false, true);
	});

	document.addEventListener('click', (event) => {
		if (mobile.matches && !navigation.hidden && !header.contains(event.target)) {
			setOpen(false, navigation.contains(document.activeElement));
		}
	});

	header.addEventListener('focusout', (event) => {
		if (mobile.matches && !header.contains(event.relatedTarget)) setOpen(false);
	});

	mobile.addEventListener('change', syncViewport);
	syncViewport();
})();
