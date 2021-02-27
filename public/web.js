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

    foods.forEach(element => {
        const foodData = element.data();

        addFoodElement(foodData, element.id);
    })
}

function addFoodElement(foodData, id) {
    const productContainer = document.querySelector('#product-container');

    const div = document.createElement('div');
    div.classList.add('product');

    const text = document.createElement('p');
    text.textContent = `${foodData.name} - $${foodData.price} weight: ${foodData.weight}`;

    const button = document.createElement('button');
    button.textContent = "Add to cart";
    button.addEventListener('click', () => {
        addToCart(id);
    });

    div.append(text, button);
    productContainer.appendChild(div);
}

(function init() {
    addEventListeners();
})();
