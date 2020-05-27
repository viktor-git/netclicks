(function() {	
	'use strict';

	const leftMenu = document.querySelector('.left-menu');
	const menuHamburger = document.querySelector('.hamburger');
	const dropDownMenus = document.querySelectorAll('.dropdown');
	const tvShows = document.querySelector('.tv-shows');
	const modalForm = document.querySelector('.modal');
	const tvShowList = document.querySelector('.tv-shows__list');
	const modalCardImg = document.querySelector('.modal .tv-card__img');
	const modalTitle = document.querySelector('.modal__title');
	const genresList = document.querySelector('.genres-list');
	const rating = document.querySelector('.rating');
	const description = document.querySelector('.description');
	const modalLink = document.querySelector('.modal__link');
	const searchForm= document.querySelector('.search__form');
	const searchFormInput = document.querySelector('.search__form-input');

	const imgUrl = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
	const apiKey = '5862ea2a6a449f1430efcb47f5e3dec4';

	const util = {
		hideActiveDropMenu(menuDropLinkArray) {
			if ( !leftMenu.classList.contains('.openMenu') ) {
				menuDropLinkArray.forEach( (item) => {
					if ( !item.classList.contains('open') ) {
						item.classList.remove('active');
					}
				});
			}
		},
		getRandId() {
			return `action${Math.round(Math.random() * 1e8).toString(16)}`;
		},
		changeElementSource(elem, newSource) {
			elem.setAttribute('src', newSource);
		}
	};

	const loading  = document.createElement('div');
	loading.classList.add('loading');


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

		if ( target.matches('.tv-card__img') ) {
			imgSrcBase = target.getAttribute('src');

			if ( target.dataset.backdrop ) {
				util.changeElementSource(target, target.dataset.backdrop);
			}
			
			const imgMouseOutHandler = function () {
				util.changeElementSource(target, imgSrcBase);
				target.removeEventListener('mouseout', imgMouseOutHandler);
			};

			target.addEventListener('mouseout', imgMouseOutHandler);
		}
	});

	tvShows.addEventListener('click', (evt) => {
		const target = evt.target;
		const card = target.closest('.tv-card');


		if ( card ) {
			new bdRequest()
			.getTvDetails(card.id)
			.then( (response) => {
				console.log(response);
				modalCardImg.src = imgUrl + response.poster_path;
				modalTitle.textContent = response.name;
				genresList.innerHTML = '';
				for (let item of response.genres) {
					genresList.innerHTML +=  `<li>${item.name}</li>`;
				}
			
				rating.textContent = response.vote_average;
				description.textContent = response.overview;
				modalLink.href = response.homepage;
			});

			document.body.style.overflow = 'hidden';
			modalForm.classList.remove('hide');
			modalForm.style.backgroundColor = 'transparent';
		}
		modalForm.addEventListener('click', modalCloseHandler);
		
	});

	const modalCloseHandler = function(evt) {
		if ( evt.target.closest('.cross') || 
			 !evt.target.closest('.modal__content')) {
			modalForm.classList.add('hide');
			document.body.style.overflow = '';
		}
		modalForm.removeEventListener('click', modalCloseHandler);
	};
	
	const createCard = function (serverDataItem) {
		
		const {
			backdrop_path: backdrop, 
			name: title, 
			poster_path: poster, 
			vote_average: vote,
			original_name: altName,
			id

		} = serverDataItem;

		const posterImg = poster ? imgUrl + poster : 'img/no-poster.jpg';
		const backdropImg = backdrop ? imgUrl + backdrop : '';
		const voteElem = (!vote) ? '' : `<span class="tv-card__vote">${vote}</span>`;

		const card = document.createElement('li');
		card.classList.add('tv-shows__item');
		card.innerHTML = `
			<a href="#" id="${id}"class="tv-card">
                ${voteElem}
                <img class="tv-card__img" src="${posterImg}" 
                data-backdrop="${backdropImg}" alt="${altName}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
		`;
		
		return card;
	};

	const renderCard = (response) => {
		console.log(response);
		
		const cardListFragment = new DocumentFragment();
		tvShowList.innerHTML = '';

		response.results.forEach((item) => {
			cardListFragment.append(createCard(item));
		});

		loading.remove();
		tvShowList.append(cardListFragment);

	};
	const bdRequest = class {
		getData = async (url) => {
			const res = await fetch(url);
			if ( res.ok) {
				return res.json();
			} else {
				throw new Error(`Данные не получены по адресу ${url}`);
			}
			
		};

		getTestData = async () => {
			return await this.getData('test.json');
		};

		getTestCard = async () => {
			return await this.getData('card.json');
		};

		getSearchResult = (query) => {
			return this.getData(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${query}&language=ru-RU`);
		}

		getTvDetails = (id) => {
			return this.getData(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=ru-RU`);
		}
	}
	
	searchForm.addEventListener('submit', (evt) => {
		evt.preventDefault();
		let value = searchFormInput.value.trim();
		if ( value ) {
			tvShowList.append(loading);
			new bdRequest().getSearchResult(value).then(renderCard);
		}
		searchFormInput.value = '';
	});

	new bdRequest().getTestData().then(renderCard);


}());


