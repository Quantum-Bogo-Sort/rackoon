class Cart{
    constructor(items, price) {
        this.items = items;
        this.price = price;
    }

    async add(id,weight){
        const db = firebase.firestore();
        let canAdd = true;
        let foodRef = db.collection("foods").doc(id)
        let toCmp =await foodRef.get();
        // CAN ADD ONLY ITEMS FROM ONE STORE
        // for await (element of cart) 
        // {
        //     let curr = await db.collection("foods").doc(element).get();
        //     let toCmp = await db.collection("foods").doc(id).get();

        //     if(curr.data().store != toCmp.data().store)
        //     {
        //         canAdd = false;
        //         throw 'Element not from the same store';
        //     }

        // }
        let price = 0;
        price =await getPrice(toCmp.id, weight)
        if(toCmp.data().weight<weight)
        {
            canAdd = false;   
        }
        if(canAdd)
        {
            this.items.push({id, weight, price});
            this.price+=price;
            return {id, weight, price};
        }
        else
        {
            throw 'Exceeding available element quantity';
        }
    }
    empty() {
        this.items = [];
        this.price = 0;
    }

    remove(id){
        let ind = findIndexInCart(id);
        if(ind!=-1)
        {
            this.price-=cart.items[ind].price;
            cart.items.splice(ind,1);
        }
        else
        {
            throw 'Element id not found in cart!';
        }
    }

    async buy() {
        const db = firebase.firestore();
        for (const elem of cart.items){

            const elemRef = db.collection("foods").doc(elem.id);
            let curr = await elemRef.get();
            let newW = curr.data().weight - elem.weight;
            elemRef.update({
                price: curr.data().price - elem.price,
                weight: newW
            })
            .then(()=>{
                addFoodSaved(curr.data().store, elem.weight);
                console.log("Successfully updated weight and price of elem!");
            })
            .catch((error)=>{
                console.error("Error while updating elem weight and price", error);
            });
            const eps = 0.0001;
            //console.log(curr.data().weight);
            if(newW <=0)
            {
                console.log("bruh");
                removeFoodByDocID(elem.id);
            }
            //this.remove(elem.id);
        }
        this.empty();
    }
};

let cart;
document.addEventListener("DOMContentLoaded", event => {

    const app = firebase.app();
    // console.log(app);
    cart = new Cart(new Array(),0);
    // getFoods();
});

async function addFoodSaved(name, ammount)
{
    const db = firebase.firestore();
    //The name of the store is the id
    const store = db.collection("stores").doc(name);
    let curr = await store.get();
    store.update({
        saved: curr.data().saved + ammount
    })
    .then( ()=> {
        console.log("Successfully saved weight!");
    })
    .catch((error)=>{
        console.error("Error while updating saved weight!", error);
    });
}

async function getGlobalFoodSaved()
{
    const db = firebase.firestore();
    const store = db.collection("stores").doc("ALL");
    let curr = await store.get();
    return curr.data().saved;
}



async function googleLogin()
{
    const provider = new firebase.auth.GoogleAuthProvider();
    let user = await firebase.auth().signInWithPopup(provider);
    //For roles
    let status = await addUser(user.user.uid);
    console.log(status);
    return {user: user, type:status};
}

//Returns session type
async function addUser(id)
{
    const db = firebase.firestore();
    let docRef = db.collection("users").doc(id.toString());

    try{
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            // console.log(data);
            return data;
        } else {
            //If user doesn't exist add him/her
            db.collection("users").doc(id).set({status: "user"});
            return "user";
        }
    }
    catch(e)
    {
        db.collection("users").doc(id).set({status: "user"});
        return "user";
    }
}

async function getFoods()
{
    const db = firebase.firestore();
    let foods = await db.collection("foods").get();
    return foods;
}

async function getPrice(id, amount)
{
    const db = firebase.firestore();
    let food = await db.collection("foods").doc(id).get();
    let price = 0;
    if("reduced" in food.data()) {
        price = (food.data().reduced / food.data().weight )*amount;
    }
    else {
        price = (food.data().price / food.data().weight)*amount;
    }
    
    return price;
}

async function addFood(category, expiration, name, price, weight, store)
{
    try {
        const db = firebase.firestore();
        const docRef = await db.collection("foods").add({
            category: category,
            expiration: expiration,
            name: name,
            price: price,
            weight: weight,
            store: store
        });
        console.log("Document written with ID: ", docRef.id);
    }
    catch (error) {
        throw error;
    }
}

function addRecipe(name, ingredients, rating = 0)
{
    const db = firebase.firestore();
    db.collection("recipes").add({
        name: name,
        ingredients: ingredients,
        rating: rating
    })
    .then((docRef)=>{
        console.log("Recipe written with ID: ", docRef.id);
    })
    .catch((error)=>{
        console.error("Error adding recipe: ", error);
    })
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

function findIndexInCart(id)
{
    let len = cart.items.length;
    for(let i = 0;i<len;i++)
    {
        if(cart.items[i].id==id)
        {
            return i;
        }
    }
    return -1;
}

async function filterByStore(store)
{
    const db = firebase.firestore();
    let foods = await db.collection("foods").where("store", "==", store).get();
    return foods;
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
                let price_per_unit = 0;
                if("reduced" in food.data()){
                    price_per_unit = food.data().reduced / food.data().weight;
                }
                else{
                    price_per_unit = food.data().price / food.data().weight;
                }
                let quantity= ingredients[i+1];
                let final = quantity*price_per_unit;
                offers.push({food, final,quantity } );
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