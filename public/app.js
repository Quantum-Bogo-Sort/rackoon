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
    const myPromise = new Promise(async (resolve, reject) => {
        for await (element of cart) {
            let curr = await db.collection("foods").doc(element).get();
            let toCmp = await db.collection("foods").doc(id).get();

            if(curr.data().store != toCmp.data().store)
            {
                resolve(false);
            }
        }
        resolve(true);
    });

    const canAdd = await myPromise;

    if(canAdd)
    {
        cart.push(id);
    }
    else
    {
        throw 'Element not from the same store';
    }
}
