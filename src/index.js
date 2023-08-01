import Notiflix from 'notiflix';

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '38278991-17cfe7c1d9183e0e901f08bd5';
const IMAGE_TYPE = 'photo';
const ORIENTATION = 'horizontal';
const SAFESEARCH = 'true';
const WIDTH = 300;
const HEIGHT = 210;
const PER_PAGE = 40;

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const message = document.querySelector('.js-message');
const guard = document.querySelector('.js-guard');

class Photo {
  constructor() {
    this.page = 1;
    this.currentPage = 1;
    this.arrayLength = 0;
  }

  async getPhoto() {
    const parameters = new URLSearchParams({
      image_type: IMAGE_TYPE,
      orientation: ORIENTATION,
      safesearch: SAFESEARCH,
      per_page: PER_PAGE,
      page: this.page,
    });
    const { hits, totalHits } = await fetch(
      `${BASE_URL}?key=${KEY}&q='${searchRequest}'&${parameters}`
    ).then(resp => {
      if (!resp.ok) throw new Error(resp.statusText);
      return resp.json();
    });
    return { hits, totalHits };
  }

  resetPage() {
    this.page = 1;
    this.arrayLength = 0;
  }

  nextPage() {
    this.page += 1;
  }

  lengthArray(length) {
    return (this.arrayLength += length);
  }
}

async function onSearch(evt) {
  evt.preventDefault();
  message.innerHTML = '';
  searchRequest = evt.target.firstElementChild.value.trim();
  try {
    foundImg.resetPage();
    const { hits, totalHits } = await foundImg.getPhoto();
    gallery.innerHTML = '';
    gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
    observer.observe(guard);
    if (foundImg.lengthArray(hits.length) === totalHits) {
      console.log(totalHits);
      messageEndCollection(
        `We're sorry, but you've reached the end of search results. Found ${totalHits} images.`
      );
    }
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore() {
  try {
    foundImg.nextPage();
    const { hits, totalHits } = await foundImg.getPhoto();
    gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
    if (foundImg.lengthArray(hits.length) === totalHits) {
      console.log(totalHits);
      messageEndCollection(
        `We're sorry, but you've reached the end of search results. Found ${totalHits} images.`
      );
    }
  } catch (error) {
    console.log(error);
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({ webformatURL, tags, likes, views, comments, downloads }) =>
        `<div class="photo-card">
            <img
                src="${webformatURL}"
                alt="${tags}"
                loading="lazy"
                width="${WIDTH}"
                height="${HEIGHT}"
            />
            <div class="info">
                <p class="info-item"><b>Likes</b><span>${likes}</span></p>
                <p class="info-item"><b>Views</b><span>${views}</span></p>
                <p class="info-item"><b>Comments</b><span>${comments}</span></p>
                <p class="info-item"><b>Downloads</b><span>${downloads}</span></p>
            </div>
        </div>
`
    )
    .join('');
}

const options = {
  root: null,
  rootMargin: '50px',
  threshold: 0,
};

const observer = new IntersectionObserver(handlerPaggination, options);

function handlerPaggination(entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      await onLoadMore();
    }
  });
}

const foundImg = new Photo();
form.addEventListener('submit', onSearch);

function messageEndCollection(textWarning) {
  Notiflix.Notify.warning(`${textWarning}`);
  message.insertAdjacentHTML(
    'beforeend',
    `<p class="js-message">${textWarning}</p>`
  );
  observer.unobserve(guard);
  return ``;
}
