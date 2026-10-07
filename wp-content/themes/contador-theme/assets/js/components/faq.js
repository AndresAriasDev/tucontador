/* FAQ compartidas: mejora progresiva, con estado independiente por instancia. */
(() => {
	'use strict';
	document.querySelectorAll('[data-site-faq]').forEach(root => {
		const buttons = [...root.querySelectorAll('.site-faq__trigger')];
		const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
		if (!buttons.length || panels.some(panel => !panel || !root.contains(panel))) return;
		const open = selected => {
			buttons.forEach((button, index) => {
				const expanded = index === selected;
				button.setAttribute('aria-expanded', String(expanded));
				panels[index].hidden = !expanded;
				button.closest('.site-faq__item').classList.toggle('is-open', expanded);
			});
		};
		buttons.forEach((button, index) => {
			button.disabled = false;
			button.addEventListener('click', () => open(button.getAttribute('aria-expanded') === 'true' ? -1 : index));
			button.addEventListener('keydown', event => {
				let next;
				if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
				if (event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
				if (event.key === 'Home') next = 0;
				if (event.key === 'End') next = buttons.length - 1;
				if (next === undefined) return;
				event.preventDefault();
				buttons[next].focus();
			});
		});
		open(0);
	});
})();
