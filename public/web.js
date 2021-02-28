function addEventListeners() {
    const loginButton = document.querySelector('#login-button');

    loginButton.addEventListener('click', onLoginButtonClick);

    document.addEventListener("DOMContentLoaded", async (event) => {
        const savings = await getGlobalFoodSaved()
        const savingsDiv = document.querySelector('#savings');
        savingsDiv.textContent = Number.parseFloat(savings / 1000).toFixed(2);
    });
}

function addFormListeners(store) {
    const formModal = document.querySelector('#form-container');
    const closeForm = document.querySelector('#close-form');
    const openFormBtn = document.querySelector('.add-item-btn');
    
    openFormBtn.addEventListener('click', () => {
        formModal.style.display = "block";
    });

    closeForm.addEventListener('click', () => {
        formModal.style.display = "none";
    });

    window.addEventListener('click', (e) => {
        if (e.target == formModal) {
            formModal.style.display = "none";
        }
    });

    const form = document.querySelector('#add-item-form');
    const expirationInput = document.querySelector('#expiration');
    expirationInput.min = getMinExpirationDate();

    const nameInput = document.querySelector('#food-name');
    const quantityInput = document.querySelector('#quantity');
    const categoryInput = document.querySelector('#category');
    const priceInput = document.querySelector('#price');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addFood(categoryInput.value, new Date(expirationInput.value), nameInput.value, Number(priceInput.value), Number(quantityInput.value), store);
        alert('Item added successfully!');
        refreshListings(store);
    });
}

function refreshListings(store) {
    document.querySelectorAll('table > tr').forEach(tr => tr.remove());
    addListings(store);
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
        cart.buy();
        alert('Purchase successful');
        emptyCart();

        setTimeout(() => {
            refreshProducts();
        }, 1000);
    } else {
        alert('Cart is empty!');
    }
}

function refreshProducts() {
    if (document.querySelector('.active-btn').textContent.toLowerCase() === 'ingredients') {
        addFoods();
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
    console.log(authResult);
    onLoggedIn(authResult);
}

async function onLoggedIn({user, type}) {
    user = user.user;
    const { status, store } = type;
    const app = Vue.createApp({
        data() {
            return {
                name: store || user.displayName,
                avatar: user.photoURL,
            }
        }
    });

    const loginPage = document.querySelector('.login-page');
    loginPage.style.display = "none";

    const appElement = document.querySelector('#app');
    appElement.style.display = "block";

    const storeName = document.querySelector('#store-name');
    storeName.textContent = store; 

    if (status === 'owner') {
        const ownerContent = document.querySelector('#shop-owner-content');
        ownerContent.style.display = "flex";
        addListings(store);

    } else if (status === 'user' || status == null) {
        const userContent = document.querySelector('#user-content');
        userContent.style.display = 'block';
    }

    app.mount('#app');

    setActiveCategory('ingredients');
    addCartButtonListeners();
    if (store != null) addFormListeners(store);
}

async function addListings(store) {
    const foods = await filterByStore(store);
    const listings = document.querySelector('#listings');
     
    foods.forEach(food => {
        const tr = document.createElement('tr');
        const data = food.data();
        const price = data.reduced || data.price;

        tr.innerHTML = `
            <td>${data.name}</td>
            <td>${data.weight / 1000}kg</td>
            <td>$${Number.parseFloat(price).toFixed(2)}</td>
        `;
        listings.appendChild(tr);
    });
}

async function addFoods() {
    let foods = await getFoods();
    
    clearShopItems();

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
            clearShopItems();
            addFoods();
            return true;
        }
    } else if (string === 'recipes') {
        if (recipesBtn.classList.contains('active-btn')) return false;
        else {
            ingredientsBtn.classList.remove('active-btn');
            recipesBtn.classList.add('active-btn');
            clearShopItems();
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
    const recipes = await filterRecipes();
    
    clearShopItems();

    let i = 0;
    for (recipe of recipes) {
        if (i % 4 === 0) addRow();
        addRecipeElement(recipe);
        i++;
    }
}

function addRecipeElement(recipe) {
    const lastRow = document.querySelector('.card-container:last-child');

    const foodItemDiv = document.createElement('div');
    foodItemDiv.classList.add('food-item');

    const foodName = document.createElement('span');
    foodName.classList.add('item-name');
    foodName.textContent = recipe.recipe.data().name;

    const offers = document.createElement('p');
    offers.textContent = `Ingredients:`;

    const ingredients = addIngredients(recipe.offers);

    foodItemDiv.append(foodName, offers, ingredients);
    const button = document.createElement('button');
    button.textContent = "Add to cart";
    button.classList.add('btn', 'add-to-cart-btn');
    button.addEventListener('click', () => {
        ingredients.querySelectorAll('input').forEach(async (ingredient) => {
            if (!ingredient.checked) return;
            else {
                addToCart({ name: ingredient.name }, parseInt(ingredient.value), ingredient.id);
            }
        });
        alert('Added to cart!');
    });

    foodItemDiv.appendChild(button);

    lastRow.appendChild(foodItemDiv);
}

function getPriceLocal(foodData, amount) {
    let price = 0;
    let reducedPrice = null;
    
    if(foodData.reduced) {
        reducedPrice = (foodData.reduced / foodData.weight ) * amount;
    }

    price = (foodData.price / foodData.weight) * amount;
    
    
    return {
        price,
        reducedPrice,
    };
}

function addIngredients(offers) {
    const container = document.createElement('div');
    container.classList.add('ingredients-container');

    for (const offer of offers) {
        const ingredient = document.createElement('div');
        const input = document.createElement('input');
        const label = document.createElement('label');

        const price = Number.parseFloat(offer.final).toFixed(2)

        input.type = "checkbox";
        input.id = offer.food.id;
        input.name = offer.food.data().name;
        input.value = offer.quantity;

        label.for = offer.food.id;
        label.textContent = `${offer.food.data().name} by ${offer.food.data().store} (${offer.quantity}g) - $${price}`;

        ingredient.append(input, label);
        container.appendChild(ingredient);
    }
    return container;
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

// sorry for code duplication :p
function getMinExpirationDate() {
    const date = new Date();
    date.setDate(date.getDate() + 3);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const output = `${year}-${month}-${day}`;
    return output;
}

function addFoodElement(foodData, id) {
    const lastRow = document.querySelector('.card-container:last-child');

    const foodItemDiv = document.createElement('div');
    foodItemDiv.classList.add('food-item');

    const foodName = document.createElement('span');
    foodName.classList.add('item-name')
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
    
    const provider = document.createElement('span');
    provider.textContent = `Provider: ${foodData.store}`;
    
    input.oninput = updatePrice;

    function updatePrice() {
        const prices = getPriceLocal(foodData, input.value);
        if (prices.reducedPrice) {
            foodPrice.classList.add('discount-price');
            foodPrice.textContent = `$${Number.parseFloat(prices.reducedPrice).toFixed(2)} `;
    
            const oldPrice = document.createElement('span');
            oldPrice.textContent = `$${Number.parseFloat(prices.price).toFixed(2)}`;
            foodPrice.appendChild(oldPrice);
    
        } else {
            foodPrice.textContent = `$${Number.parseFloat(prices.price).toFixed(2)}`;
        }
    }

    updatePrice();

    foodItemDiv.append(foodName, foodPrice, inputDiv, daysUntilExpirationDiv, provider);
    const button = document.createElement('button');
    button.textContent = "Add to cart";
    button.classList.add('btn', 'add-to-cart-btn');
    button.addEventListener('click', async () => {
        const amount = parseInt(input.value);
        if (amount == NaN) return;
        await addToCart(foodData, amount, id);
        alert('Added to cart!');
    });

    foodItemDiv.appendChild(button);

    lastRow.appendChild(foodItemDiv);
}

async function addToCart(foodData, amount, id) {
    const cartItems = document.querySelector('.cart-items');
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
