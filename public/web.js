function addEventListeners() {
    const loginButton = document.querySelector('#login-button');

    loginButton.addEventListener('click', onLoginButtonClick);
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
    })
}

function addRow() {
    const row = document.createElement('div');
    row.classList.add('card-container');

    document.querySelector('.shop-items').appendChild(row);
}

function addFoodElement(foodData, id) {
    const lastRow = document.querySelector('.card-container:last-child');

    const foodItem = document.createElement('div');
    foodItem.classList.add('food-item');

    foodItem.innerHTML = `<h3>${foodData.name}</h3><p>$${foodData.price}</p>`;

    const button = document.createElement('button');
    button.textContent = "Add to cart";
    button.classList.add('btn');
    button.addEventListener('click', () => {
        addToCart(id);
    });

    foodItem.appendChild(button);

    lastRow.appendChild(foodItem);
}

(function init() {
    addEventListeners();
})();
