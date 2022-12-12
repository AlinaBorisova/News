'use strict';

const API_KEY = 'b96d982147d4484cb0cc9083c66a5a8d';
const choicesElem = document.querySelector('.js-choice');
const newsListSearch = document.querySelectorAll('.news-list')[0];
const newsListNew = document.querySelectorAll('.news-list')[1];
const formSearch = document.querySelector('.form-search');
const title = document.querySelector('.title');

const declOfNum = (n, titles) => titles[n % 10 === 1 && n % 100 !== 11 ?
  0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];

const choises = new Choices(choicesElem, {
  searchEnabled: false,
  shouldSort: false,
  itemSelectText: '',
  classNames: {
    containerInner: 'choices__inner choices-box',
  }
});

const getdata = (error, url) => {
  return fetch(url, {
    headers: {
      'X-Api-Key': API_KEY,
    }
  }).then(response => {
    if(!response.ok) {
      throw error(new Error(response.status));
    };
  
    return response.json();
  })
  .catch(error);
};

const getDateFormat = date => {
  const getDate = new Date(date);
  const fullDate = getDate.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const fullTime =  getDate.toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `<span class="news-date">${fullDate}</span> ${fullTime}`
};

const getImage = url => new Promise((resolve) => {
  const image = new Image(270, 200);

  image.addEventListener('load', () => {
    resolve(image);
  });

  image.addEventListener('error', () => {
    image.src = './img/no-photo.jpg'; // Для дополнительного задания
    resolve(image);
  });

  image.src = url || './img/no-photo.jpg';
  image.className = 'news-image';

  return image;
});

const renderCardSearch = (data) => {
  newsListSearch.textContent = '';
  data.forEach(async news => {
    const card = document.createElement('li');
    card.className = 'news-item';

    const image = await getImage(news.urlToImage);
    image.alt = title;
    card.append(image)

    card.innerHTML += `
      <h3 class="news-title">
        <a href="${news.url}" class="news-link" target="_blank">${news.title || ''}</a>
      </h3>
      <p class="news-description">${news.description || ''}</p>
      <div class="news-footer">
        <time class="news-datetime" datetime="${news.publishedAt}">
          ${getDateFormat(news.publishedAt)}
        </time>
        <p class="news-author">${news.author || ''}</p>
      </div>
    `;

    newsListSearch.append(card)
  });
};

const renderCardNew = (data) => {
  newsListNew.textContent = '';
  data.forEach(async news => {
    const card = document.createElement('li');
    card.className = 'news-item';

    const image = await getImage(news.urlToImage);
    image.alt = title;
    card.append(image)

    card.innerHTML += `
      <h3 class="news-title">
        <a href="${news.url}" class="news-link" target="_blank">${news.title || ''}</a>
      </h3>
      <p class="news-description">${news.description || ''}</p>
      <div class="news-footer">
        <time class="news-datetime" datetime="${news.publishedAt}">
          ${getDateFormat(news.publishedAt)}
        </time>
        <p class="news-author">${news.author || ''}</p>
      </div>
    `;

    newsListNew.append(card);
  });
};

const showError = () => {
  newsListSearch.textContent = '';
  title.textContent = `Упс, ошибочка`;
  title.classList.remove('hide');
};

const loadNews = async () => {
  newsListNew.innerHTML = '<li class="preload"></li>'; // Для дополнительного задания
  const country = localStorage.getItem('country') || 'ru';
  choises.setChoiceByValue(country);
  title.classList.add('hide')

  const data = await getdata(showError, `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=20`);
  
  return Promise.all([
      data, {
      callback: renderCardNew(data.articles),
    }
  ])
};

const loadSearch = async value => {
  newsListSearch.innerHTML = '<li class="preload"></li>'; // Для дополнительного задания
  const data = await getdata(showError, `https://newsapi.org/v2/everything?q=${value}&pageSize=8`);
  title.classList.remove('hide');
  const found = ['найден', 'найдено', 'найдено'];
  const result = ['результат', 'результата', 'результатов'];
  const count = data.articles.length;
  title.textContent = `По вашему запросу "${value}" ${declOfNum(count, found)} ${count} ${declOfNum(count, result)}`;
  choises.setChoiceByValue('');

  return Promise.all([
    data, {
    callback: renderCardSearch(data.articles),
  }
])
}

choicesElem.addEventListener('change', function(event) {
  const valueCountry = event.detail.value;
  localStorage.setItem('country', valueCountry);
  loadNews();
});

formSearch.addEventListener('submit', event => {
  event.preventDefault();
  loadSearch(formSearch.search.value);
  formSearch.reset();
});

const twitter = document.querySelectorAll('.social-link')[0];
const habr = document.querySelectorAll('.social-link')[1];
const vk = document.querySelectorAll('.social-link')[2];


loadNews();
