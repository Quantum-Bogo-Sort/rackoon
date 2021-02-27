//Firebase
var admin = require("firebase-admin");
//Express
const express = require('express')
const app = express()
const port = 9000

var serviceAccount = require("./rackoon-cf696-a55ebdec3fb5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

setInterval(reducePricesInDB, 1*1000*60 , 'reduce');
setInterval(updateGlobalFoodSaved, 500 , 'savedSum');
//
async function printFoode() //This is just for testing at the moment
{
  const result = await admin
  .firestore()
  .collection('foods').get();

  result.forEach(element => {
      console.log(element.data().name);
  });
}

//Returns the number of days between two dates
function getNumOfDays(dateFuture, datePast)
{
  let diff = Number(dateFuture) - Number(datePast);
  //Seconds to days
  return Math.floor((((diff)/60)/60)/24);
}
function mapRange(input, inMin, inMax, outMin, outMax) {
  return (input - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

async function removeFoodByDocID(id)
{
  const db = await admin
    .firestore()
    .collection('foods').doc(id).delete().then(() => {
      console.log("Document successfully deleted!");
  }).catch((error) => {
      console.error("Error removing document: ", error);
  });
}

async function reducePricesInDB()
{
  const result = await admin
    .firestore()
    .collection('foods').get();

    result.forEach(element => {
        diff = getNumOfDays(element.data().expiration._seconds, Date.now()/1000);
        if(diff < 0)
        {
          removeFoodByDocID(element.id);
        }
        if(diff <= 7)
        {
          let discount = mapRange(diff, 0, 7, 0.75, 0.25);
          console.log(discount);
          toReplace = element.data();
          toReplace.reduced = discount*element.data().price;
          admin.firestore().collection("foods").doc(element.id).set(toReplace);
        }
    });
}

async function updateGlobalFoodSaved()
{
  const stores = await admin
    .firestore()
    .collection('stores').get();

  let savedSum = 0;
  stores.forEach(element => {
    if(element.id != "ALL")
      savedSum += element.data().saved;
  });
  await admin
    .firestore()
    .collection('stores')
    .doc("ALL")
    .update({saved: savedSum});
}