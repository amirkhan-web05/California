window.addEventListener('DOMContentLoaded', () => {
  // const swiper = new Swiper('.block', {
  //   navigation: {
  //     nextEl: '.swiper-button-next',
  //     prevEl: '.swiper-button-prev',
  //   },
  //   pagination: {
  //     el: '.swiper-pagination',
  //   },
  // });

  const cartEl = document.querySelector('.header__data-cart');
  const cart = document.querySelector('.cart');
  const cardList = document.querySelector('.card__items');
  const cartList = document.querySelector('.cart__inner');
  const details = document.querySelector('.details');
  const detailsName = document.querySelector('.details__test');

  console.log(detailsName);

  let hash = location.hash.substring(1);

  const openCart = () => {
    if (cart.classList.contains('cart')) {
      cart.classList.toggle('active');
    }
  };

  cartEl.addEventListener('click', openCart);

  const requestUrlItems = 'http://localhost:3001/items';
  const requestUrlCart = 'http://localhost:3001/cart';

  let cartData = [];

  const renderCard = ({ id, name, images, description, price }) => {
    const cardItem = document.createElement('div');
    cardItem.classList.add('card__item');
    cardItem.id = id;

    cardItem.innerHTML = `
        <img class='card__images' width=${250} src="${images}" alt="${name}">
        <a href="../details.html#${id}">
          <h3 class='card__name'>${name}</h3>
        </a>
        <div>
          <p class='card__description'>${description}</p>
          <span class='card__price'>${price}</span>
          <button data-id='add' class='card__btn'>Добавить в корзину</button>
        </div>
      `;

    cardList.insertAdjacentElement('beforeend', cardItem);
  };

  const fetchData = async (url) => {
    try {
      return await fetch(url).then((res) => {
        if (!res.ok) {
          throw Error('Error');
        }
        return res.json();
      });
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const getDataPage = async (callback, prop, value) => {
    try {
      await fetchData(requestUrlItems).then((data) => {
        if (value) {
          callback(data.filter((item) => item[prop] === value));
        } else {
          callback(data);
        }
      });
    } catch (error) {
      console.log('Error', error);
    }
  };

  fetchData(requestUrlItems).then((data) =>
    data.forEach((item) => renderCard(item))
  );

  const renderDetailsPage = (data) => {
    data.forEach((item) => {
      details.insertAdjacentHTML(
        'beforeend',
        `
        <div class='container'>
          <h1 class='details__name'>${item.name}</h1>
          <p class='details__price'>${item.price}</p>
          <span class='details__description'>${item.description}</span>
          <div>
            <button data-id='add' class='details__add'>Добавить в корзину</button>
          </div>
        </div>
      `
      );
    });
  };

  getDataPage(renderDetailsPage, 'id', hash);

  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);
  });

  const renderCart = (data) => {
    cartList.innerHTML = '';

    data.forEach((item) => {
      const cartItem = document.createElement('li');
      cartItem.id = item.id;
      cartItem.classList.add('cart__item');

      cartItem.innerHTML = `
        <div class="cart__item-row">
          <img width="120" height="120" src="${item.images}" alt="">
          <div>
            <span class="cart__title">${item.name}</span>
            <p class="cart__price">${item.price}</p>
          </div>
        </div>
        <div>
          <img class='cart__remove' data-id='remove' width="25" height="25" src="../assets/images/delete-icon.svg" alt="">
        </div>
      `;

      cartList.insertAdjacentElement('beforeend', cartItem);
    });

    return data;
  };

  const fetchCart = async (url) => {
    try {
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw Error('Error');
          }
          return res.json();
        })
        .then((data) => {
          renderCart(data);
        });
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const onAddToCart = async (event) => {
    try {
      if (event.target.dataset.id === 'add') {
        const parentNode = event.target.closest('.card__item');
        const id = parentNode.id;
        const name = parentNode.querySelector('.card__name').textContent;
        const price = parentNode.querySelector('.card__price').textContent;
        const images = parentNode.querySelector('.card__images').src;
        const count = 1;

        const newItems = {
          id,
          name,
          price,
          images,
          count,
        };

        const findCart = cartData.find((item) => item.id === id);

        if (findCart) {
          cartData.find((item) =>
            item.id === id ? { ...item, count: item.count + 1 } : item
          );
        } else {
          await fetch(requestUrlCart, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newItems),
          })
            .then((res) => {
              if (res.status === 201) {
                return res.json();
              }

              throw new Error('Error');
            })
            .then((data) => {
              cartData.push(data);
              // add cart
              renderCart(cartData);
            });
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const onRemoveCart = async (event) => {
    try {
      if (event.target.dataset.id === 'remove') {
        const parentNode = event.target.closest('.cart__item');
        const id = parentNode.id;

        cartData = cartData.filter((cart) => cart.id !== id);

        await fetch(`${requestUrlCart}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        parentNode.remove();
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  cardList.addEventListener('click', onAddToCart);
  cartList.addEventListener('click', onRemoveCart);
  details.addEventListener('click', onAddToCart);

  fetchCart(requestUrlCart);
  // Clear cart
});
