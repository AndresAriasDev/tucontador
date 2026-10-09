/* Scroll nativo, sin autoplay. Sticky CSS condicionado al espacio disponible. */
(() => {
	'use strict';
	document.querySelectorAll('[data-related-carousel]').forEach(root => {
		const track = root.querySelector('.blog-related__track');
		const slides = [...root.querySelectorAll('.blog-related__slide')];
		const controls = root.querySelector('.blog-related__dots');
		if (!track || !slides.length || !controls) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		let active = 0;
		const select = index => {
			const left = slides[index].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
			track.scrollTo({ left, behavior: reduced.matches ? 'auto' : 'smooth' });
		};
		const dots = slides.length > 1 ? slides.map((slide, index) => {
			const button = document.createElement('button');
			button.type = 'button';
			const title = slide.querySelector('.blog-card__title')?.textContent.trim() || `Artículo ${index + 1}`;
			button.setAttribute('aria-label', `Mostrar artículo ${index + 1} de ${slides.length}: ${title}`);
			button.addEventListener('click', () => select(index));
			controls.append(button);
			return button;
		}) : [];
		controls.hidden = !dots.length;
		const sync = () => {
			const left = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
			active = slides.reduce((best, slide, index) => Math.abs(slide.getBoundingClientRect().left - left) < Math.abs(slides[best].getBoundingClientRect().left - left) ? index : best, 0);
			dots.forEach((dot, index) => {
				if (index === active) dot.setAttribute('aria-current', 'true');
				else dot.removeAttribute('aria-current');
			});
		};
		let frame = 0;
		track.addEventListener('scroll', () => {
			if (!frame) frame = requestAnimationFrame(() => { frame = 0; sync(); });
		}, { passive: true });
		track.addEventListener('keydown', event => {
			let next;
			if (event.key === 'ArrowRight') next = Math.min(active + 1, slides.length - 1);
			if (event.key === 'ArrowLeft') next = Math.max(active - 1, 0);
			if (event.target === track && event.key === 'Home') next = 0;
			if (event.target === track && event.key === 'End') next = slides.length - 1;
			if (next === undefined) return;
			event.preventDefault();
			select(next);
		});
		const header = document.querySelector('.site-header');
		const admin = document.getElementById('wpadminbar');
		const resize = () => {
			const top = (header?.offsetHeight || 0) + (admin?.offsetHeight || 0) + 16;
			root.style.setProperty('--related-sticky-top', `${top}px`);
			root.classList.toggle('can-stick', window.innerWidth > 960 && root.offsetHeight + top + 16 <= window.innerHeight);
			sync();
		};
		if ('ResizeObserver' in window) {
			const observer = new ResizeObserver(resize);
			[root, track, header, admin].filter(Boolean).forEach(element => observer.observe(element));
		}
		window.addEventListener('resize', resize);
		window.addEventListener('load', resize);
		resize();
	});
})();
