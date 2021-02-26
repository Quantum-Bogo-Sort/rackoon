document.addEventListener("DOMContentLoaded", event => {

    const app = firebase.app();
    // console.log(app);
    
    getFoods();
});

function googleLogin()
{
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result => {
        const user = result.user;
        document.write(`Hello ${user.displayName}`);
        console.log(user);
    })
}

function getFoods()
{
    const db = firebase.firestore();
    db.collection("foods").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            //Print everything from database by name
            console.log(`${doc.id} => ${doc.data().name}`);
        });
    });
}

function addFood(category, expiration, name, price, weight)
{
    const db = firebase.firestore();
    db.collection("foods").add({
        category: category,
        expiration: expiration,
        name: name,
        price: price,
        weight: weight
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}