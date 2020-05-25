'use strict';
const leftMenu = document.querySelector('.left-menu');
const menuHamburger = document.querySelector('.hamburger');
const dropDownMenus = document.querySelectorAll('.dropdown');
const tvShows = document.querySelector('.tv-shows');
const util = {
	hideActiveDropMenu: function(menuDropLinkArray) {
		if ( !leftMenu.classList.contains('.openMenu') ) {
			menuDropLinkArray.forEach( (item) => {
				if ( !item.classList.contains('open) ) {
					item.classList.remove('active');
				}
			})
		}
	},
	getRandId: function () {
		return `action${Math.round(Math.random() * 1e8).toString(16)}`;
	}
};

menuHamburger.addEventListener('click', () => {
	leftMenu.classList.toggle('openMenu');
	menuHamburger.classList.toggle('open'); 
	util.hideActiveDropMenu(dropDownMenus);
});

document.addEventListener('click', (evt) => {
	if ( !evt.target.closest('.left-menu') ) {
		leftMenu.classList.remove('openMenu');
		menuHamburger.classList.remove('open');
	}
});

leftMenu.addEventListener('click', (evt) => {
	const target = evt.target;
	const dropDownMenu = target.closest('.dropdown');

	if ( dropDownMenu ) {
		dropDownMenu.classList.toggle('active');
		leftMenu.classList.add('openMenu');
		menuHamburger.classList.add('open');
	}
});

tvShows.addEventListener('mouseover', (evt) => {
	const target = evt.target;
	let imgSrcBase = '';

	if ( target.classList.contains('tv-card__img') ) {
		imgSrcBase = target.getAttribute('src');
		if ( target.dataset.backdrop ) {
			target.setAttribute('src', target.dataset.backdrop);
		}
		
		const imgMouseOutHandler = function () {
			target.setAttribute('src', imgSrcBase);
			target.removeEventListener('mouseout', imgMouseOutHandler);
		}

		target.addEventListener('mouseout', imgMouseOutHandler);
	}
});




