const functions = require('firebase-functions');



// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});




//the admin sdk can only be used in a back-end environment, and it bypasses any security rules you've defined in your firebase app
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

//create a new functions function called 'sendMessage'
exports.sendMessage = functions.firestore //
    .document(products/{productID}) //the brackets make the ID a 'wild card', so it runs this function everytime a new document is created. So I guess if there was an actual id in there it would only fun for that specific id.
    .onCreate(event => {

        const docId = event.params.productId;

        const name = event.data.data().name;  //data.data(), wtf??

        const productRef = admin.firestore().collection('products').doc(docId)

        return productRef.update({ message: `Nice ${name}! - Love Cloud Functions`}) // this line, or I guess update() itself, is a promise. This 'sendMessage' function will terminate as soon as the promise resolves
    })



    //Run "firebase deploy --only functions" to deploy new functions you've written without redeploying entire webapp