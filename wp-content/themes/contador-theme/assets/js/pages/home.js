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

/* Módulo independiente: selector de perfiles y acordeón en pantallas pequeñas. */
(() => {
	'use strict';
	const root = document.querySelector('[data-profiles]');
	if (!root) return;
	const items = [...root.querySelectorAll('.home-profiles__item')];
	const buttons = items.map(item => item.querySelector('button'));
	const panels = items.map(item => item.querySelector('.home-profiles__panel'));
	const mobile = window.matchMedia('(max-width: 900px)');
	let active = 0;
	const select = (index) => {
		active = index;
		items.forEach((item, position) => {
			const open = position === index;
			item.classList.toggle('is-active', open);
			buttons[position].setAttribute('aria-expanded', String(open));
			panels[position].hidden = !open;
		});
	};
	buttons.forEach((button, index) => {
		button.disabled = false;
		button.addEventListener('click', () => select(mobile.matches && active === index ? -1 : index));
		button.addEventListener('keydown', event => {
			const nextKey = mobile.matches ? 'ArrowDown' : 'ArrowRight';
			const previousKey = mobile.matches ? 'ArrowUp' : 'ArrowLeft';
			let next;
			if (event.key === nextKey) next = (index + 1) % items.length;
			if (event.key === previousKey) next = (index + items.length - 1) % items.length;
			if (event.key === 'Home') next = 0;
			if (event.key === 'End') next = items.length - 1;
			if (next === undefined) return;
			event.preventDefault();
			buttons[next].focus();
			select(next);
		});
	});
	mobile.addEventListener('change', () => { if (!mobile.matches && active < 0) select(0); });
	select(0);
})();

/* FAQ: apertura exclusiva de paneles; el contenido permanece en el HTML. */
(() => {
	'use strict';
	const root = document.querySelector('[data-home-faq]');
	if (!root) return;
	const buttons = [...root.querySelectorAll('.home-faq__trigger')];
	const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
	if (panels.some(panel => !panel)) return;
	const open = (selected) => {
		buttons.forEach((button, index) => {
			const expanded = index === selected;
			button.setAttribute('aria-expanded', String(expanded));
			panels[index].hidden = !expanded;
			button.closest('.home-faq__item').classList.toggle('is-open', expanded);
		});
	};
	buttons.forEach((button, index) => {
		button.disabled = false;
		button.addEventListener('click', () => {
			open(button.getAttribute('aria-expanded') === 'true' ? -1 : index);
		});
	});
	open(0);
})();
