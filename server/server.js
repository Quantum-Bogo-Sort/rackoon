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

setInterval(printFoode, 500, 'test');

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