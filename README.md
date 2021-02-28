<h1>🦝 Rackoon</h1> 
is a service, where business owners can list their soon-to-expire products up for sale at a reduced price.
<h2>How to run</h2>
If you've configured firebase like so: https://firebase.google.com/docs/cli
Then you should be able to host the frontend locally with:
<addr>firebase serve</addr>
To use the server:
<addr>npm install</addr>
Go to the server folder and run:
We are using the firebase sdk so you would need to get the json file and put it in the server folder.
<addr>node server.js</addr>

We decided to use firebase for the databases and account handling because it's easy to use and scale.
The drawback is that it's a paid service.

We are planning to add a bunch more features like user submissions for the recipes. A recipe rating system. Suggestions for store owners to further reduce waste.
