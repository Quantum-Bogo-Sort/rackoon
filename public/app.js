document.addEventListener("DOMContentLoaded", event => {

    const app = firebase.app();
    // console.log(app);
    
    getFoods();
});

let cart = [];

async function googleLogin()
{
    const provider = new firebase.auth.GoogleAuthProvider();
    let user = await firebase.auth().signInWithPopup(provider);
    return user;
}

async function getFoods()
{
    const db = firebase.firestore();
    let foods = await db.collection("foods").get();
    return foods;
}

function addFood(category, expiration, name, price, weight, store)
{
    const db = firebase.firestore();
    db.collection("foods").add({
        category: category,
        expiration: expiration,
        name: name,
        price: price,
        weight: weight,
        store: store
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

function removeFoodByDocID(id)
{
    const db = firebase.firestore();
    db.collection("foods").doc(id).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}

async function addToCart(id)
{
    const db = firebase.firestore();
    let canAdd = true;

    for await (element of cart) 
    {
        let curr = await db.collection("foods").doc(element).get();
        let toCmp = await db.collection("foods").doc(id).get();

        if(curr.data().store != toCmp.data().store)
        {
            canAdd = false;
        }
    }

    if(canAdd)
    {
        cart.push(id);
    }
    else
    {
        throw 'Element not from the same store';
    }
}

async function hasIngredients(recipe, offers)
{
    const db = firebase.firestore();
    let ingredients = recipe.data().ingredients;
    let len = ingredients.length;
    for(let i = 0; i < len-1; i+=2)
    {
        canAdd = true;
        const foods = await db.collection("foods").where("name", "==", ingredients[i]).where("weight", ">=", ingredients[i+1]).get();
        if(foods.empty)
        {
            return false;
        }
        else
        {
            foods.forEach(food => {
                offers.push(food.id);
            })
        }
    }
    return true;
}

async function filterRecipes()
{
     const db = firebase.firestore();
     let recipes =await db.collection("recipes").get();
     let available_rec = [];
     
     let ind = 0;
     let size = recipes.size;

     return new Promise((resolve) => {
         recipes.forEach(async (recipe)=>{
             let offers = [];
             if(await hasIngredients(recipe, offers))
             {
                 available_rec.push({recipe, offers});
             }
             ind++;
             if(ind==size)
             {
                 resolve(available_rec);
             } 
         });
     });
}