function addEventListeners() {
    const loginButton = document.querySelector('#login-button');

    loginButton.addEventListener('click', onLoginButtonClick);
}

function addCartButtonListeners() {
    const cartModal = document.querySelector('#cart');
    const closeCart = document.querySelector('#close-cart');
    const cartButton = document.querySelector('#cart-button');
    console.log(cartButton);
    cartButton.addEventListener('click', () => {
        cartModal.style.display = "block";
    });

    console.log('aa');
    closeCart.addEventListener('click', () => {
        cartModal.style.display = "none";
    });

    window.addEventListener('click', (e) => {
        if (e.target == cartModal) {
            cartModal.style.display = "none";
        }
    });
}

async function onLoginButtonClick() {
    const authResult = await googleLogin();
    onLoggedIn(authResult.user);
}

async function onLoggedIn(user) {
    const app = Vue.createApp({
        data() {
            return {
                name: user.displayName,
                avatar: user.photoURL,
            }
        }
    });

    const loginPage = document.querySelector('.login-page');
    loginPage.style.display = "none";

    const appElement = document.querySelector('#app');
    appElement.style.display = "block";

    app.mount('#app');
    let foods = await getFoods();

    let i = 0;
    foods.forEach((element) => {
        const foodData = element.data();
        if (i % 4 === 0) addRow();
        addFoodElement(foodData, element.id);
        i++;
    });

    addCartButtonListeners();
}

function getNumOfDays(dateFuture, datePast)
{
  let diff = Number(dateFuture) - Number(datePast);
  //Seconds to days
  return Math.floor((((diff)/60)/60)/24);
}

function addRow() {
    const row = document.createElement('div');
    row.classList.add('card-container');

    document.querySelector('.shop-items').appendChild(row);
}

function addFoodElement(foodData, id) {
    const lastRow = document.querySelector('.card-container:last-child');

    const foodItemDiv = document.createElement('div');
    foodItemDiv.classList.add('food-item');

    const foodName = document.createElement('h3');
    foodName.textContent = foodData.name;

    const foodPrice = document.createElement('p');

    const days = getNumOfDays(foodData.expiration.seconds, Date.now()/1000);
    const daysUntilExpirationDiv = document.createElement('h4');
    const date = new Date(foodData.expiration.seconds * 1000);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const output = month  + '\n'+ day  + ' ' + year;

    daysUntilExpirationDiv.textContent = `Best before: ${output}`;

    console.log(getNumOfDays(foodData.expiration.seconds, Date.now()/1000));

    if (foodData.reduced) {
        foodPrice.classList.add('discount-price');
        foodPrice.textContent = `$${Number.parseFloat(foodData.reduced).toFixed(2)} `;

        const oldPrice = document.createElement('span');
        oldPrice.textContent = `$${foodData.price}`;
        foodPrice.appendChild(oldPrice);

    } else {
        foodPrice.textContent = `$${foodData.price}`;
    }

    foodItemDiv.append(foodName, foodPrice, daysUntilExpirationDiv);
    console.log(foodData);
    const button = document.createElement('button');
    button.textContent = "Add to cart";
    button.classList.add('btn');
    button.addEventListener('click', () => {
        addToCart(id);
    });

    foodItemDiv.appendChild(button);

    lastRow.appendChild(foodItemDiv);
}

(function init() {
    addEventListeners();
})();
