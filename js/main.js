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
	const searchHeader = document.querySelector('.tv-shows__head'); 
	const preloader = document.querySelector('.preloader'); 

	const loading  = document.createElement('div');
	loading.classList.add('loading');

	const paginationList = document.querySelector('.pagination');

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
		// Дописать вывод названия в заголовке
		if (target.closest('#top-rated')) {
			new bdRequest().getTopRated().then((response) => renderCard(response));
		}

		if (target.closest('#popular')) {
			new bdRequest().getPopular().then((response) => renderCard(response));
		}

		if (target.closest('#week')) {
			new bdRequest().getWeek().then((response) => renderCard(response));
		}

		if (target.closest('#today')) {
			new bdRequest().getToday().then((response) => renderCard(response));
		}

		if (target.closest('#search')) {
			searchFormInput.focus();
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
			preloader.style.display = 'block';

			new bdRequest()
			.getTvDetails(card.id)
			.then( (response) => {
				console.log(response);

				if ( response.poster_path ) {
					modalCardImg.src = imgUrl + response.poster_path;
					modalCardImg.alt = response.name;
				} else {
					modalCardImg.src = 'img/no-poster.jpg';
				}
				
				modalTitle.textContent = response.name;
				genresList.innerHTML = '';
				for (let item of response.genres) {
					genresList.innerHTML +=  `<li>${item.name}</li>`;
				}
			
				rating.textContent = response.vote_average;
				description.textContent = response.overview;
				modalLink.href = response.homepage;
			}).finally( () => {
				preloader.classList.add('visually-hidden');
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

	const checkSearchRequest = function(response, searchRequest) {
		let uppercase = searchRequest.charAt(0).toUpperCase() + searchRequest.slice(1);
		if ( !response.total_results ) {
			searchHeader.textContent = `По вашему запросу «${uppercase}» ничего не найдено`;
			return false;
		} else if ( !searchRequest ) {
			searchHeader.textContent = ``;
			return false;
		} else {
			searchHeader.textContent = `Результаты поиска по запросу «${uppercase}». Найдено ${response.total_results} ТВ-Шоу`;
			return false;
		}
		searchFormInput.value = '';
		return true;
	};
	
	const renderCard = (response, value) => {
		console.log(response, value);
		tvShowList.append(loading);
		
		if (value) {
			console.log(value, 123);
			checkSearchRequest(response, value);
		}
		
		const cardListFragment = new DocumentFragment();
		tvShowList.innerHTML = '';

		response.results.forEach((item) => {
			cardListFragment.append(createCard(item));
		});

		loading.remove();
		tvShowList.append(cardListFragment);

		// Вынести в функцию
		paginationList.innerHTML = '';
		if ( response.total_pages > 1) {
			for ( let i = 1; i <= response.total_pages; i++) {
				paginationList.innerHTML += `<li><a href="#"class="pagination__link">${i}</a></li>`;
			}
		}

	};

	let currentAPIRequest = '';
	const bdRequest = class {

		constructor() {
			this.server = 'https://api.themoviedb.org/3/';
			this.temp = '';
		}

		getData = async (url) => {
			console.log(url);
			const res = await fetch(url);
			if ( res.ok) {
				return res.json();
			} else {
				throw new Error(`Данные не получены по адресу ${url}`);
			}
			
		};

		checkRequest = (page) => {
			return (page === undefined) ? 1 : page;
		}

		getTestData = async () => {
			return await this.getData('test.json');
		};

		getTestCard = async () => {
			return await this.getData('card.json');
		};

		getSearchResult = (query, page) => {
			page = this.checkRequest(page);
			this.temp = `${this.server}search/tv?api_key=${apiKey}&query=${query}&language=ru-RU&page=${page}`;
			currentAPIRequest = this.temp;
			return this.getData(this.temp);
		}

		getTvDetails = (id) => {
			page = this.checkRequest(page);
			this.temp = `${this.server}tv/${id}?api_key=${apiKey}&language=ru-RU`;
			currentAPIRequest = this.temp;
			return this.getData(this.temp);
		}

		getTopRated = (page) => {
			page = this.checkRequest(page);
			this.temp = `${this.server}tv/top_rated?api_key=${apiKey}&language=ru-RU&page=${page}`;
			currentAPIRequest = this.temp;
			return this.getData(this.temp);
		}

		getPopular = (page) => {
			page = this.checkRequest(page);
			this.temp = `${this.server}tv/popular?api_key=${apiKey}&language=ru-RU&page=${page}`;
			currentAPIRequest = this.temp;
			return this.getData(this.temp);
		}

		getToday = (page) => {
			page = this.checkRequest(page);
			this.temp = `${this.server}tv/airing_today?api_key=${apiKey}&language=ru-RU&page=${page}`;
			currentAPIRequest = this.temp;
			return this.getData(this.temp);
		}

		getWeek = (page) => {
			page = this.checkRequest(page);
			this.temp = `${this.server}tv/on_the_air?api_key=${apiKey}&language=ru-RU&page=${page}`;
			currentAPIRequest = this.temp;
			return this.getData(this.temp);
		}

		// Не работает https://developers.themoviedb.org/3/tv/get-latest-tv
		getLatest = () => {
			return this.getData(`${this.server}tv/latest?api_key=${apiKey}&language=en-En`);
		}
	}

	searchForm.addEventListener('submit', (evt) => {
		evt.preventDefault();
		let value = searchFormInput.value.trim();
		if ( value ) {
			new bdRequest().getSearchResult(value).then((response) => renderCard(response, value));
		}
	});

	paginationList.addEventListener('click', (evt) => {
		evt.preventDefault();
		const target = evt.target;
		let value = searchFormInput.value.trim();
		if (target.classList.contains('pagination__link')) {
			tvShowList.append(loading);
	
			if (currentAPIRequest.indexOf('search') !== -1) {
				new bdRequest().getSearchResult(value, target.textContent ).then(renderCard);
				return;
			}
			if (currentAPIRequest.indexOf('top_rated') !== -1) {
				new bdRequest().getTopRated(target.textContent).then(renderCard);
				return;
			}
			if (currentAPIRequest.indexOf('popular') !== -1) {
				new bdRequest().getPopular(target.textContent ).then(renderCard);
				return;
			}
			if (currentAPIRequest.indexOf('airing_today') !== -1) {
				new bdRequest().getToday(target.textContent ).then(renderCard);
				return;
			}
			if (currentAPIRequest.indexOf('on_the_air') !== -1) {
				new bdRequest().getWeek(target.textContent ).then(renderCard);
				return;
			}
		}
		
		
	})

	tvShowList.append(loading);
	new bdRequest().getWeek().then(renderCard);


}());


