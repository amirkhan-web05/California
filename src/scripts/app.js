import iconRemove from '../assets/images/delete-icon.svg';

window.addEventListener('DOMContentLoaded', () => {
  const element = (tag, classes, id, content, set) => {
    const node = document.createElement(tag);
    if (classes.length) {
      node.classList.add(...classes);
    }

    if (id) {
      node.id = id;
    }

    if (content) {
      node.textContent = content;
    }

    if (set) {
      node.dataset.button = set;
    }

    return node;
  };

  const selector = (tag) => document.querySelector(tag);

  const cartEl = selector('.header__data-cart');
  const cart = selector('.cart');
  const cardList = selector('.card__items');
  const cartList = selector('.cart__inner');
  const details = selector('.details');
  const cartTotal = selector('#cartTotal');

  let hash = location.hash.substring(1);

  cartEl.addEventListener('click', () => {
    cart.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    cart.classList.toggle('active');
  });

  window.addEventListener('click', (event) => {
    if (event.target !== cartEl) {
      cart.classList.remove('active');
    }
  });

  let cartData = [];

  const methods = {
    items: 'http://localhost:3001/items',
    cart: 'http://localhost:3001/cart',
  };

  const checkEmplyCart = (data) => {
    if (!data.length) {
      const cartEmpty = element('h3', ['cart__empty']);
      cartEmpty.innerHTML = 'Корзина пустая';

      cartList.insertAdjacentElement('beforeend', cartEmpty);
    }
  };

  const updateCartTotal = () => {
    const total = cartData.reduce((acc, item) => {
      const clearPrice = item.price.trim().substring(1, 9);
      const price = parseFloat(clearPrice);
      return (acc += price && item.count * price);
    }, 0);

    cartTotal.innerHTML = `
      <div>
        <h3>Итого:</h3>
        <strong class="cart__total">$ ${total.toFixed(2)} USD</strong>
      </div>`;
    cartList.append(cartTotal);
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

  const renderCard = ({ id, name, images, description, price }) => {
    const cardItem = element('div', ['card__item'], id);

    cardItem.innerHTML = `
        <img class='card__images' width="200" src="${images}" alt="${name}">
        <a href="../details.html#${id}">
          <h3 class='card__name'>${name}</h3>
        </a>
        <div>
          <p class='card__description'>${description}</p>
          <span class='card__price'>$ ${Number(price).toFixed(2)} USD</span>
          <button data-id='add' class='card__btn'>Добавить в корзину</button>
        </div>
      `;

    cardList.insertAdjacentElement('beforeend', cardItem);
  };

  const getDataPage = async (callback, prop, value) => {
    try {
      await fetchData(methods.items).then((data) => {
        if (value) {
          callback(data.filter((item) => item[prop] === value));
        } else {
          return data.forEach((item) => renderCard(item));
        }
      });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const renderDetailsPage = (data) => {
    data.forEach((item) => {
      details.insertAdjacentHTML(
        'beforeend',
        `
        <div class='container'>
          <div id=${item.id} class='details__item'>
            <img class='details__image' src="${
              item.images
            }" width="340" height="260">
            <h1 class='details__name'>${item.name}</h1>
            <p class='details__price'>$ ${Number(item.price).toFixed(2)} USD</p>
            <span class='details__description'>${item.description}</span>
          </div>
        </div>
      `
      );
    });
  };

  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);
  });

  const renderCart = async () => {
    try {
      const res = await fetch(methods.cart);
      const data = await res.json();

      cartList.innerHTML = '';

      checkEmplyCart(data);

      data.forEach((item) => {
        const cartItem = element('li', ['cart__item'], item.id);

        cartItem.innerHTML = `
              <div class="cart__item-row">
                <img width="120" height="120" src="${item.images}" alt="">
                <div>
                  <span class="cart__title">${item.name}</span>
                  <p class="cart__price">${item.price}</p>
                  <div class='cart__total-item'>
                    <button data-id='plus' class='cart__plus'>+</button>
                    <span class='cart__count'>${item.count}</span>
                    <button data-id='minus' class='cart__minus'>-</button>
                  </div>
                </div>
              </div>
              <div>
                <img class='cart__remove' data-id='remove' width="25" height="25" src="${iconRemove}" alt="">
              </div>
            `;

        cartList.insertAdjacentElement('beforeend', cartItem);
        updateCartTotal();
      });
    } catch (error) {
      console.log('Error', error);
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
          await fetch(methods.cart, {
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
            });

          // add cart
          renderCart();
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const updateCartCount = async (event) => {
    try {
      if (event.target.dataset.id === 'plus') {
        const parentNode = event.target.closest('.cart__item');
        const id = parentNode.id;
        const cartCount = parentNode.querySelector('.cart__count');

        const items = cartData.find((item) => item.id === id);

        await fetch(`${methods.cart}/${items.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: items.count + 1 }),
        })
          .then((res) => res.json())
          .then(() => {
            cartCount.innerHTML = ++items.count;
          });

        updateCartTotal();
      }

      if (event.target.dataset.id === 'minus') {
        const parentNode = event.target.closest('.cart__item');
        const id = parentNode.id;
        const cartCount = parentNode.querySelector('.cart__count');

        const items = cartData.find((item) => item.id === id);

        await fetch(`${methods.cart}/${items.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: items.count - 1 }),
        })
          .then((res) => {
            return res.json();
          })
          .then(() => {
            cartCount.innerHTML =
              items.count === 1 ? (items.count = 1) : (items.count -= 1);
          });

        updateCartTotal();
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

        await fetch(`${methods.cart}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        parentNode.remove();
        checkEmplyCart(cartData);
        updateCartTotal();
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  getDataPage(renderDetailsPage, 'id', hash);
  renderCart();

  cardList.addEventListener('click', onAddToCart);
  cartList.addEventListener('click', onRemoveCart);
  cartList.addEventListener('click', updateCartCount);

  // Clear cart
});
