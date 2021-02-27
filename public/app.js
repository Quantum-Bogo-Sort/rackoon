document.addEventListener("DOMContentLoaded", event => {

    const app = firebase.app();
    // console.log(app);
    
    getFoods();
});

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
        let price_per_unit = 0;
        if("reduced" in toCmp.data()){
            price_per_unit = toCmp.data().reduced / toCmp.data().weight;
        }
        else{
            price_per_unit = toCmp.data().price / toCmp.data().weight;
        }
        let price = price_per_unit*weight;
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

    remove(id){
        let ind = findIndexInCart(id);
        if(ind!=-1)
        {
            this.price-=cart.items[ind].price;
            cart.items.splice(ind,1);
        }
        else
        {
            throw 'Element id not found';
        }
    }

    async buy() {
        const db = firebase.firestore();
        for (const elem of cart.items){

            const elemRef = db.collection("foods").doc(elem.id);
            let curr = await elemRef.get();
            elemRef.update({
                price: curr.data().price - elem.price,
                weight: curr.data().weight-elem.weight
            })
            .then(()=>{
                addFoodSaved(curr.data().store, elem.weight);
                console.log("Successfully updated weight and price of elem!");
            })
            .catch((error)=>{
                console.error("Error while updating elem weight and price", error);
            })
            if(curr.data().weight == 0)
            {
                console.log("bruh");
                removeFoodByDocID(elem.id);
            }
            this.remove(elem.id);
        }
    }
};

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

let cart = new Cart(new Array(),0);

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
            return doc.data().status;
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
                let final = ingredients[i+1]*price_per_unit;
                offers.push({food, final} );
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