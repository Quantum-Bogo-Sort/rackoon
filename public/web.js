function addEventListeners() {
    const loginButton = document.querySelector('#login-button');

    loginButton.addEventListener('click', onLoginButtonClick);
}

function addCartButtonListeners() {
    const cartModal = document.querySelector('#cart');
    const closeCart = document.querySelector('#close-cart');
    const cartButton = document.querySelector('#cart-button');
    cartButton.addEventListener('click', () => {
        cartModal.style.display = "block";
    });

    closeCart.addEventListener('click', () => {
        cartModal.style.display = "none";
    });

    window.addEventListener('click', (e) => {
        if (e.target == cartModal) {
            cartModal.style.display = "none";
        }
    });

    const ingredientsBtn = document.querySelector('#ingredients-btn');
    const recipesBtn = document.querySelector('#recipes-btn');

    ingredientsBtn.addEventListener('click', () => {
        setActiveCategory('ingredients');
    });

    recipesBtn.addEventListener('click', () => {
        setActiveCategory('recipes');
    });

    const buyButton = document.querySelector('#buy-button');
    buyButton.addEventListener('click', onBuy);

    const emptyCartButton = document.querySelector('#empty-cart-btn');
    emptyCartButton.addEventListener('click', () => {
        emptyCart();
    })
}

function onBuy() {
    if (cart.items.length) {
        alert('Purchase successful');
    } else {
        alert('Cart is empty!');
    }
}

function emptyCart() {
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = '';

    cart.items = [];
    cart.price = 0;

    const totalPriceDiv = document.querySelector('#total-price')
    totalPriceDiv.textContent = cart.price;
}

async function onLoginButtonClick() {
    const authResult = await googleLogin();
    onLoggedIn(authResult);
}

async function onLoggedIn({user, type}) {
    console.log(type);
    user = user.user;
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

    setActiveCategory('ingredients')
    addCartButtonListeners();
}

async function addFoods() {
    clearShopItems();

    let foods = await getFoods();

    let i = 0;
    foods.forEach((element) => {
        const foodData = element.data();
        if (i % 4 === 0) addRow();
        addFoodElement(foodData, element.id);
        i++;
    });
}

function setActiveCategory(string) {
    const ingredientsBtn = document.querySelector('#ingredients-btn');
    const recipesBtn = document.querySelector('#recipes-btn');

    if (string === 'ingredients') {
        if (ingredientsBtn.classList.contains('active-btn')) return false;
        else {
            recipesBtn.classList.remove('active-btn');
            ingredientsBtn.classList.add('active-btn');

            addFoods();
            return true;
        }
    } else if (string === 'recipes') {
        if (recipesBtn.classList.contains('active-btn')) return false;
        else {
            ingredientsBtn.classList.remove('active-btn');
            recipesBtn.classList.add('active-btn');

            addRecipes();
            return true;
        }
    }
    return false;
}

function clearShopItems() {
    const shopItems = document.querySelector('.shop-items');

    shopItems.innerHTML = '';
}

async function addRecipes() {
    const shopItems = document.querySelector('.shop-items');
    clearShopItems();

    const recipes = await filterRecipes();

    let i = 0;
    for (recipe of recipes) {
        if (i % 4 === 0) addRow();
        addRecipeElement(recipe);
        i++;
    }
}

function addRecipeElement(recipe) {
    console.log(recipe);

    const lastRow = document.querySelector('.card-container:last-child');

    const foodItemDiv = document.createElement('div');
    foodItemDiv.classList.add('food-item');

    const foodName = document.createElement('h3');
    foodName.textContent = recipe.recipe.data().name;

    // const foodPrice = document.createElement('p');

    // const date = new Date(foodData.expiration.seconds * 1000);
    // const daysUntilExpirationDiv = document.createElement('h4');
    // daysUntilExpirationDiv.textContent = `Best before: ${getFormattedDate(date)}`;

    // if (foodData.reduced) {
    //     foodPrice.classList.add('discount-price');
    //     foodPrice.textContent = `$${Number.parseFloat(foodData.reduced).toFixed(2)} `;

    //     const oldPrice = document.createElement('span');
    //     oldPrice.textContent = `$${Number.parseFloat(foodData.price).toFixed(2)}`;
    //     foodPrice.appendChild(oldPrice);

    // } else {
    //     foodPrice.textContent = `$${Number.parseFloat(foodData.price).toFixed(2)}`;
    // }

    // foodItemDiv.append(foodName, foodPrice, daysUntilExpirationDiv);
    const offers = document.createElement('p');
    offers.textContent = `Ingredients: ${recipe.offers.length}`;

    foodItemDiv.append(foodName, offers);
    const button = document.createElement('button');
    button.textContent = "Add to cart";
    button.classList.add('btn');
    button.addEventListener('click', () => {
        recipe.offers.forEach(id => {
            // addToCart(id);
        });
    });

    foodItemDiv.appendChild(button);

    lastRow.appendChild(foodItemDiv);
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

function getFormattedDate(date) {

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const output = month  + '\n'+ day  + ' ' + year;
    return output;
}

function addFoodElement(foodData, id) {
    const lastRow = document.querySelector('.card-container:last-child');

    const foodItemDiv = document.createElement('div');
    foodItemDiv.classList.add('food-item');

    const foodName = document.createElement('h3');
    foodName.textContent = foodData.name;

    const inputDiv = document.createElement('div');
    inputDiv.style.display = 'flex';
    inputDiv.style.justifyContent = 'center';
    inputDiv.style.alignItems = 'center';
    inputDiv.style.gap = '10px';

    const input = document.createElement('input');
    input.type = "number";
    input.id = "quantity";
    input.name = "quantity";
    input.value = 100 < foodData.weight ? 100 : foodData.weight;
    input.min = 10 < foodData.weight ? 10 : foodData.weight;
    input.step = 10;
    input.max = foodData.weight;

    const label = document.createElement('label')
    label.for = "quantity";
    label.textContent = `Quantity (${foodData.weight}g available): `;

    inputDiv.append(label, input);

    const foodPrice = document.createElement('p');

    const date = new Date(foodData.expiration.seconds * 1000);
    const daysUntilExpirationDiv = document.createElement('h4');
    daysUntilExpirationDiv.textContent = `Best before: ${getFormattedDate(date)}`;

    if (foodData.reduced) {
        foodPrice.classList.add('discount-price');
        foodPrice.textContent = `$${Number.parseFloat(foodData.reduced).toFixed(2)} `;

        const oldPrice = document.createElement('span');
        oldPrice.textContent = `$${Number.parseFloat(foodData.price).toFixed(2)}`;
        foodPrice.appendChild(oldPrice);

    } else {
        foodPrice.textContent = `$${Number.parseFloat(foodData.price).toFixed(2)}`;
    }

    foodItemDiv.append(foodName, foodPrice, inputDiv, daysUntilExpirationDiv);
    const button = document.createElement('button');
    button.textContent = "Add to cart";
    button.classList.add('btn');
    button.addEventListener('click', () => {
        const amount = parseInt(input.value);
        if (amount == NaN) return;
        addToCart(foodData, amount, id);
    });

    foodItemDiv.appendChild(button);

    lastRow.appendChild(foodItemDiv);
}

async function addToCart(foodData, amount, id) {
    const cartItems = document.querySelector('.cart-items');
    console.log(id, amount);
    const obj = await cart.add(id, amount);
    const price = Number.parseFloat(obj.price).toFixed(2)

    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `<span>${foodData.name}</span><span>${amount}g</span><span>$${price}</span>`;

    const totalPriceDiv = document.querySelector('#total-price')
    totalPriceDiv.textContent = Number.parseFloat(cart.price).toFixed(2);

    cartItems.appendChild(div);
}

(function init() {
    addEventListeners();
})();
