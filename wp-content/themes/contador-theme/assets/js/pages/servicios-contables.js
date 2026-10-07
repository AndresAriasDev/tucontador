/* Reserva dentro del hero el espacio del header superpuesto, sin modificarlo. */
(() => {
	'use strict';
	const hero = document.querySelector('.accounting-service__hero');
	const header = document.querySelector('.site-header');
	const adminBar = document.getElementById('wpadminbar');
	if (!hero || !header) return;
	const syncHeight = () => {
		hero.style.setProperty('--service-header-height', `${header.offsetHeight}px`);
		hero.style.setProperty('--service-admin-height', `${adminBar?.offsetHeight || 0}px`);
	};
	syncHeight();
	if ('ResizeObserver' in window) {
		const observer = new ResizeObserver(syncHeight);
		observer.observe(header);
		if (adminBar) observer.observe(adminBar);
	}
	window.addEventListener('resize', syncHeight);
	window.addEventListener('load', syncHeight);
})();

/* Problemas del servicio: patrón de la Home, aislado de su selector. */
(() => {
	'use strict';
	const selector = document.querySelector('[data-service-needs]');
	if (!selector) return;
	const items = [...selector.querySelectorAll('details')];
	const summaries = items.map((item) => item.querySelector('summary'));
	const desktop = window.matchMedia('(min-width: 901px)');

	const select = (index) => {
		items.forEach((item, position) => {
			item.open = position === index;
			summaries[position].setAttribute('aria-expanded', String(item.open));
		});
	};

	summaries.forEach((summary, index) => {
		summary.addEventListener('click', (event) => {
			event.preventDefault();
			select(!desktop.matches && items[index].open ? -1 : index);
		});
		summary.addEventListener('keydown', (event) => {
			if (!desktop.matches) return;
			let next;
			if (event.key === 'ArrowDown') next = (index + 1) % items.length;
			if (event.key === 'ArrowUp') next = (index + items.length - 1) % items.length;
			if (event.key === 'Home') next = 0;
			if (event.key === 'End') next = items.length - 1;
			if (next === undefined) return;
			event.preventDefault();
			summaries[next].focus();
			select(next);
		});
	});

	desktop.addEventListener('change', () => {
		if (desktop.matches && !items.some((item) => item.open)) select(0);
	});
	select(0);
	selector.classList.add('is-enhanced');
})();

/* Prestaciones: selección única; el enlace de asesoría queda fuera del botón. */
(() => {
	'use strict';
	const root = document.querySelector('[data-service-included]');
	if (!root) return;
	const items = [...root.querySelectorAll('.accounting-service__included-item')];
	const buttons = items.map(item => item.querySelector('button'));
	const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
	if (panels.some(panel => !panel)) return;
	const select = (selected) => {
		items.forEach((item, index) => {
			const active = index === selected;
			item.classList.toggle('is-active', active);
			buttons[index].setAttribute('aria-expanded', String(active));
			panels[index].hidden = !active;
		});
	};
	buttons.forEach((button, index) => {
		button.disabled = false;
		button.addEventListener('click', () => select(index));
		button.addEventListener('keydown', (event) => {
			let next;
			if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
			if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
			if (event.key === 'Home') next = 0;
			if (event.key === 'End') next = buttons.length - 1;
			if (next === undefined) return;
			event.preventDefault();
			buttons[next].focus({ preventScroll: true });
			select(next);
		});
	});
	select(0);
	root.classList.add('is-enhanced');
})();
