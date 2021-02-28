# 🦝 Rackoon
is a service, where business owners can list their soon-to-expire products up for sale at a reduced price.
## How to run
If you've configured firebase [like so](https://firebase.google.com/docs/cli) then you should be able to host the frontend locally with:  `` firebase serve``  

To use the server run: ``npm install``

Go to the server folder and run:
``node server.js``
We are using the firebase sdk so you would need to get the json file and put it in the server folder.

We decided to use firebase for the databases and account handling because it's easy to use, scalable, feature rich for future development, Google Analytics.
The drawback is that it's a paid service.

We are planning to add a bunch more features like user submissions for the recipes. A recipe rating system. Suggestions for store owners to further reduce waste.
