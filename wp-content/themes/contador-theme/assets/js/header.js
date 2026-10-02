/* Mejora progresiva: sin JavaScript, la navegación permanece visible. */
(() => {
	'use strict';

	const header = document.querySelector('.site-header');
	const toggle = header?.querySelector('.site-header__toggle');
	const navigation = header?.querySelector('.site-header__nav');

	if (!header) return;

	// El header ya es overlay: fijarlo no retira espacio del documento.
	const adminBar = document.getElementById('wpadminbar');
	let previousY = Math.max(0, window.scrollY);
	let direction = 0;
	let distance = 0;
	let frame = 0;
	let scrollLocked = false;
	let touchInteraction = false;
	const syncKeyboardFocus = () => {
		const focused = document.activeElement;
		header.classList.toggle('has-keyboard-focus', !touchInteraction && header.contains(focused) && focused.matches(':focus-visible'));
	};
	// El foco restaurado al botón no debe inmovilizar el header tras un toque.
	window.addEventListener('touchstart', () => {
		touchInteraction = true;
		syncKeyboardFocus();
	}, { passive: true });
	window.addEventListener('pointerdown', (event) => {
		touchInteraction = event.pointerType === 'touch' || event.pointerType === 'pen';
		syncKeyboardFocus();
	}, { passive: true });
	window.addEventListener('keydown', (event) => {
		if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
			touchInteraction = false;
			window.requestAnimationFrame(syncKeyboardFocus);
		}
	});
	header.addEventListener('focusout', () => window.requestAnimationFrame(syncKeyboardFocus));
	const updateScroll = () => {
		frame = 0;
		if (scrollLocked) return;
		const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		const y = Math.max(0, Math.min(window.scrollY, maxY));
		const delta = y - previousY;
		const nextDirection = Math.sign(delta);
		const atTop = y <= 4;
		const menuOpen = toggle?.getAttribute('aria-expanded') === 'true';
		const hasFocus = !touchInteraction && header.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
		const offset = adminBar ? Math.max(0, adminBar.getBoundingClientRect().bottom) : 0;
		header.style.setProperty('--header-scroll-offset', `${offset}px`);
		header.classList.toggle('is-scrolled', !atTop);

		if (nextDirection && nextDirection !== direction) {
			distance = 0;
			direction = nextDirection;
		}
		distance += Math.abs(delta);
		if (atTop || menuOpen || hasFocus) {
			header.classList.remove('is-scroll-hidden');
			distance = 0;
		} else if (direction < 0 && distance >= 4) {
			header.classList.remove('is-scroll-hidden');
		} else if (direction > 0 && distance >= 8 && y > header.offsetHeight) {
			header.classList.add('is-scroll-hidden');
		}
		previousY = y;
	};
	const scheduleScroll = () => {
		if (!frame) frame = window.requestAnimationFrame(updateScroll);
	};
	header.classList.add('has-scroll-behavior');
	updateScroll();
	window.addEventListener('scroll', scheduleScroll, { passive: true });
	window.addEventListener('resize', scheduleScroll);
	window.addEventListener('pageshow', scheduleScroll);
	header.addEventListener('focusin', (event) => {
		syncKeyboardFocus();
		if (!scrollLocked && !touchInteraction && event.target.matches(':focus-visible')) header.classList.remove('is-scroll-hidden');
	});

	if (!toggle || !navigation) return;

	const mobile = window.matchMedia('(max-width: 1100px)');
	const anchor = document.createComment('primary-navigation');
	navigation.before(anchor);
	const dialog = document.createElement('dialog');
	dialog.id = 'mobile-navigation-dialog';
	dialog.className = 'site-header-mobile-dialog';
	dialog.setAttribute('aria-modal', 'true');
	dialog.setAttribute('aria-label', navigation.getAttribute('aria-label') || 'Menú principal');
	const panel = document.createElement('div');
	panel.className = 'site-header-mobile-panel';
	const closeButton = document.createElement('button');
	closeButton.type = 'button';
	closeButton.className = 'site-header-mobile-close';
	closeButton.setAttribute('aria-label', 'Cerrar menú principal');
	panel.append(closeButton);
	dialog.append(panel);
	document.body.append(dialog);
	let savedScroll = 0;
	let savedX = 0;
	let savedStyles = null;
	let closing = false;
	let closeTimer;
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const finishClose = (restoreFocus) => {
		clearTimeout(closeTimer);
		dialog.close();
		dialog.classList.remove('is-open');
		anchor.after(navigation);
		navigation.hidden = mobile.matches;
		if (savedStyles) {
			Object.assign(document.body.style, savedStyles);
			savedStyles = null;
			const root = document.documentElement;
			const behavior = root.style.scrollBehavior;
			root.style.scrollBehavior = 'auto';
			window.scrollTo(savedX, savedScroll);
			root.style.scrollBehavior = behavior;
		}
		if (restoreFocus) {
			const target = mobile.matches ? toggle : navigation.querySelector('a');
			target?.focus({ preventScroll: true });
		}
		previousY = Math.max(0, window.scrollY);
		distance = 0;
		direction = 0;
		closing = false;
		window.requestAnimationFrame(() => {
			if (dialog.open) return;
			// Ignorar el desplazamiento producido al restaurar el body y el foco.
			previousY = Math.max(0, window.scrollY);
			distance = 0;
			direction = 0;
			scrollLocked = false;
		});
	};

	const setOpen = (open, restoreFocus = false) => {
		if (open) {
			if (!mobile.matches || dialog.open || closing) return;
			scrollLocked = true;
			savedScroll = window.scrollY;
			savedX = window.scrollX;
			const body = document.body;
			const gap = window.innerWidth - document.documentElement.clientWidth;
			savedStyles = {};
			for (const key of ['position', 'top', 'left', 'width', 'overflow', 'paddingRight', 'boxSizing']) savedStyles[key] = body.style[key];
			const padding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
			Object.assign(body.style, { position: 'fixed', top: `${-savedScroll}px`, left: `${-savedX}px`, width: '100%', overflow: 'hidden', boxSizing: 'border-box', paddingRight: `${padding + gap}px` });
			panel.append(navigation);
			navigation.hidden = false;
			toggle.setAttribute('aria-expanded', 'true');
			dialog.showModal();
			closeButton.focus({ preventScroll: true });
			window.requestAnimationFrame(() => { if (dialog.open && !closing) dialog.classList.add('is-open'); });
		} else {
			toggle.setAttribute('aria-expanded', 'false');
			if (dialog.open && !closing) {
				closing = true;
				dialog.classList.remove('is-open');
				if (reducedMotion.matches || !mobile.matches) finishClose(restoreFocus);
				else closeTimer = window.setTimeout(() => finishClose(restoreFocus), 180);
			} else if (!dialog.open) navigation.hidden = mobile.matches;
		}
	};
	closeButton.addEventListener('click', () => setOpen(false, true));
	dialog.addEventListener('cancel', (event) => { event.preventDefault(); setOpen(false, true); });
	dialog.addEventListener('click', (event) => { if (event.target === dialog) setOpen(false, true); });
	dialog.addEventListener('keydown', (event) => {
		if (event.key !== 'Tab') return;
		const items = Array.from(dialog.querySelectorAll('button, a[href]')).filter((item) => item.getClientRects().length && !item.disabled);
		const first = items[0], last = items[items.length - 1];
		if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
		else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
	});
	dialog.addEventListener('touchmove', (event) => { if (event.target === dialog) event.preventDefault(); }, { passive: false });

	const syncViewport = () => {
		const focusInNavigation = navigation.contains(document.activeElement);
		const focusOnToggle = document.activeElement === toggle;
		toggle.hidden = !mobile.matches;
		toggle.setAttribute('aria-controls', mobile.matches ? dialog.id : navigation.id);
		if (closing && !mobile.matches) finishClose(false);
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
		if (mobile.matches && !navigation.hidden && !header.contains(event.target) && !dialog.contains(event.target)) {
			setOpen(false, navigation.contains(document.activeElement));
		}
	});

	header.addEventListener('focusout', (event) => {
		if (mobile.matches && !dialog.open && !header.contains(event.relatedTarget)) setOpen(false);
	});

	mobile.addEventListener('change', syncViewport);
	syncViewport();
})();
