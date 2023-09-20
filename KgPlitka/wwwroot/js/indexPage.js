/* eslint-disable no-undef */
const showLoadAnimation = () => $('.load-anim').show();
const hideLoadAnimation = () => $('.load-anim').hide();
const pageReload = () => location.reload();
const sendHubMassage = () => hubConnection.invoke('Send');

function getFormData () {
  const formData = new FormData(formProductData);
  const productData = {};
  for (const [key, value] of formData.entries()) {
    productData[key] = value;
  }
  return productData;
}

hubConnection = new signalR.HubConnectionBuilder()
  .withUrl('/send')
  .build();

hubConnection.on('Send', function (data) {
  console.log(data);
  messageUpdate.show();
});
hubConnection.start();

function getProductsHtml (products) {
  let index = 1;
  const productBox = document.querySelector('.products');
  productBox.innerHTML = '';
  for (const product of products) {
    productBox.innerHTML += '<div class="products__item products__item-' + product.id + `">
                                  <div class="products__body">
                                      <div class="products__title">
                                          <span class="products__order">` + index + `.</span>
                                          <span class="products__name" title = "` + product.name + '">' + product.name + `</span>
                                      </div>
                                      <div class="products__article-num">` + product.part + `</div>
                                      <div class="products__position">
                                          <div class="products__position-elem1">` + product.location + `</div>
                                          <div class="products__position-elem2">` + product.locationNum + `</div>
                                      </div>
                                  </div>
                                  <div class="products__btn hide">
                                      <div class="nav">
                                          <div class="nav__select">
                                              <div class="nav__item products__btn-change" data-change-id = "` + product.id + `"><a href="#">Изменить</a></div>
                                              <div class="line nav__line"></div>
                                              <div class="nav__item products__btn-remove" data-Remove-Id = "` + product.id + `"><a href="#">Удалить</a></div>
                                          </div>
                                      </div>
                                  </div>
                                  <div class="line products__line"></div>
                              </div>`;
    index++;
  }
}

function fillFormData (product) {
  const form = document.getElementById('formProductData');
  form.elements.id.value = product.id;
  form.elements.name.value = product.name;
  form.elements.part.value = product.part;
  form.elements.location.value = product.location;
  form.elements.locationNum.value = product.locationNum;
}

const messageUpdate = {
  element: document.querySelector('.warning'),
  reloadButton: document.querySelector('.warning__icon'),
  closeButton: document.querySelector('.warning__close'),

  show () {
    $(this.element).show();
    this.addEventListener();
  },
  hide () {
    $(this.element).hide();
    this.removeEventListener();
  },
  addEventListener () {
    this.reloadButton.addEventListener('click', () => {
      pageReload();
    });
    this.closeButton.addEventListener('click', () => {
      this.hide();
    });
  }
};

async function getSearchProduct () {
  const searchTag = document.querySelector('input[name="radio"]:checked').value;
  const searchData = document.querySelector('.search__input').value;

  await fetch(`/home/searchValues?searchData=${searchData}&searchTag=${searchTag}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  }).then(async response => {
    if (response.ok === true) {
      const searchProduct = await response.json();
      getProductsHtml(searchProduct);
    }
  });
}

async function getJsonProducts () {
  showLoadAnimation();
  const response = await fetch('home/getJsonProducts', {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
  if (response.ok === true) {
    hideLoadAnimation();
    getProductsHtml(await response.json());
  }
}

async function getProductById (id) {
  await fetch('/home/getProductById/' + id, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  }).then(async response => {
    if (response.ok === true) {
      const product = await response.json();
      fillFormData(product);
    }
  });
}

async function addProduct () {
  await fetch('/home', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(getFormData())
  }).then(async response => {
    if (response.ok === true) {
      await sendHubMassage();
      await getJsonProducts();
    }
  });
}

async function deleteProduct (id) {
  fetch('/home/' + id, {
    method: 'DELETE',
    headers: { Accept: 'application/json' }
  }).then(async response => {
    if (response.ok === true) {
      await sendHubMassage();
      await getJsonProducts();
    }
  });
}

async function editProduct () {
  fetch('/home', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(getFormData())
  }).then(async response => {
    if (response.ok === true) {
      await sendHubMassage();
      await getJsonProducts();
    }
  });
}

addEventListener('load', async (event) => {
  event.preventDefault();
  await getJsonProducts();
});

document.querySelector('.search__btn').addEventListener('click', async (event) => {
  event.preventDefault();
  if (document.querySelector('.search__input').value !== 0) {
    $('.main__search-btn-close').show();
    await getSearchProduct();
  } else {
    await getJsonProducts();
  }
});

$(document).ready(function () {
  $('.main__search-btn-close').on('click', async function (event) {
    event.preventDefault();
    $(this).hide();
    await getJsonProducts();
  });
});

document.querySelector('.add').addEventListener('submit', (event) => {
  event.preventDefault();
  const id = document.querySelector('.add').elements.id.value;
  if (id === '0') {
    addProduct();
  } else {
    editProduct();
  }
});

$(document).ready(function () {
  $('.main').on('click', '.products__btn-remove', function (event) {
    event.preventDefault();
    const deleteMass = confirm('Удалить объект?');
    if (deleteMass) {
      deleteProduct($(this).attr('data-Remove-Id'));
    }
  });
});

$(document).ready(function () {
  $('.main').on('click', '.products__btn-change', async function (event) {
    event.preventDefault();
    await getProductById($(this).attr('data-change-id'));
  });
});

$(document).ready(function () {
  $('.main').on('click', '.products__item', function () {
    if ($(this).find('.products__btn').hasClass('hide')) {
      $(this).find('.products__btn').toggle(100);
    }
  });
});
