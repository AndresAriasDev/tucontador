/* Selector de situaciones: mejora el acordeón nativo sin duplicar contenido. */
(() => {
	'use strict';
	const selector = document.querySelector('[data-situations]');
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
