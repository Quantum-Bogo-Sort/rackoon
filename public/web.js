async function doSomething()
{
    foode = await getFoods();
    foode.forEach(element => {
        console.log(element.data().name);
    });
}