// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
//initialize an admin app instance from which Cloud Firestore changes can be made
admin.initializeApp();
//A hash generator package I found on NPM
let db = admin.firestore();
//let statesRef = db.collection('states');

//const createHash = require('hash-generator');
/* how to use:
var hashLength = 8;
var hash = createHash(8);*/

//This kind of cloud function creates an HTTP endpoint event. Can't make it work yet.
//Got this function from here: https://firebase.google.com/docs/functions/get-started
// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into Cloud Firestore using the Firebase Admin SDK.
    const writeResult = await admin.firestore().collection('messages').add({original: original});
    // Send back a message that we've succesfully written the message
    res.json({result: `Message with ID: ${writeResult.id} added.`});
  });
  
// This function returns a json object with the message "it worked" if you go to the following URL endpoint:
//http://localhost:5001/firestripe-boilerplate/us-central1/uploadFile
exports.uploadFile = functions.https.onRequest((req, res) => {
    res.status(200).json({
        message: 'it worked'
    })
})

//This kind of function runs whenever the app is deployed I think, because it has no listeners/events/etc. to qualify it
exports.addState = db.collection('states').add({
        state: 'moose'
    }).then(ref => {
        console.log("added a document with ", ref.id);
});