//Firebase/Firestore
var randomstring = require("randomstring");
const functions = require('firebase-functions'); // The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const admin = require('firebase-admin'); //initialize an admin app instance from which Cloud Firestore changes can be made // The Firebase Admin SDK to access Cloud Firestore.
admin.initializeApp();
let db = admin.firestore();

//stripe
const stripe = require('stripe')('sk_test_ilxfLf0PNi61WCkO3n9gmoYM00eKzyC0FQ', {apiVersion: ''});

//express
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));

// Route that Stripe uses when onboarding is complete
app.get("/api", async (req, res) => {
    const { code, state } = req.query;
    // 11 is an arbitrary number, but if the function used to construct state makes a state of a different size, it will break this endpoint
    var justState = state.substring(0, 11);
    var justUID = state.slice(11);
    let docRef = db.collection('businesses').doc(justUID);
    //get state field of doc with corredct uid to see if that state parameter matches
    let getDoc = docRef.get()
      .then(doc => {
        if (!doc.exists) {
          console.log("No such document for UID: " + justUID + "With state of: " + justState);
        } else {
          //console.log('Document data:', doc.data().state);
          if (justState == doc.data().state){
            console.log("the returned state matches!")
          } else if (justState != doc.data().state){
            return res.status(403).json({ error: 'Incorrect state parameter: ' + state });
          } else {
            return res.status(403).json({ error: 'Incorrect and possibly missing state parameter: ' + state });
            // this is where I want to break away, otherwise a Business ID is going to be returned to the database and just float around, unconnected to any UID
            // Also -- if the UID already has a business ID, it shouldn't go through all this anyways.
          }
        }
      })
      .catch(err => {
        console.log('Error getting document', err);
      });
  
    // Send the authorization code to Stripe's API.
    stripe.oauth.token({
      grant_type: 'authorization_code',
      code
    }).then(
      (response) => {
        var connected_account_id = response.stripe_user_id;
        let data = {
            stripeBusinessID: connected_account_id,
          };

        let id = db.collection('businesses').doc(justUID).set(data, {merge: true});
  
        /*>> [3] TO CODE: This is where I will redirect user to their business portal*/
        // Render some HTML or redirect to a different page.
        //return res.status(200).json({success: true});
        return res.redirect('/stripe_return.html');
      },
      (err) => {
        if (err.type === 'StripeInvalidGrantError') {
          return res.status(400).json({error: 'Invalid authorization code: ' + code});
        } else {
          return res.status(500).json({error: 'An unknown error occurred.'});
        }
      }
    );
  });
  

exports.app = functions.https.onRequest(app);

exports.stripeState = functions.https.onCall((data, context) => {
    
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }
   
    //constructing state;
    // (1) output is nestled inside of the STRIPE url
    // (2) state is logged to the firestore document of the current business
    const uid = context.auth.uid;
    console.log ("uid is " + uid)
    const state = randomstring.generate(11); // 11 is an arbitrary number, but it IS hard-coded into the endpoint above, so if you change it change it there too //uses randomstring node package
    console.log("state has been generated to be " + state);
    var output = state + uid;
    console.log("output variable is " + output);

    //constructing redirect URL
    var firstChunk = "https://connect.stripe.com/oauth/authorize?client_id=ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG&state=";
    var secondChunk = "&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com";
    var stateChunk = output;
    var onboardingURL = firstChunk + stateChunk + secondChunk;
    console.log("the onboardingURL that's going to be returned is " + onboardingURL);

    return db.collection('businesses').doc(uid).set({state: state}, {merge: true}) //or use .update({state: state}), not sure
    .then(() => {
      console.log("yo, okay so firebase was accessed and updated. Now we're returning the URL");
      return { text: onboardingURL };
    })
});



/*>> [2] TO CODE:
    (1) separate the state variable here into state and uid.
    (2) Use the UID to query firestore for a current business. (or use cookies/user sessions to do this)
    (3) Get the state from that business.
    (4) Compare that state with the one from (1)
    (5) Throw an error if they are not the same
    (6) If they are the same, DELETE the state from the database and then continue*/

    //separate state from UID (they are passed back together as a single string, state first, then UID)
    //And alternative to this is getting the UID from a session variable/a cookie, but I haven't looked into it yet.
























/*
// build multiple CRUD interfaces:              CRUD stands for CREATE, READ, UPDATE, and DELETE. This is routing for direct database alterations!! Exciting!
app.get('/:id', (req, res) => res.send(Widgets.getById(req.params.id)));
app.post('/', (req, res) => res.send(Widgets.create()));
app.put('/:id', (req, res) => res.send(Widgets.update(req.params.id, req.body)));
app.delete('/:id', (req, res) => res.send(Widgets.delete(req.params.id)));
app.get('/', (req, res) => res.send(Widgets.list()));

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);
*/


/*
//I've put in my specified URI and commented out state validation for now
//However, this is stripes syntax, not compatable with Firebase. I don't think.
app.get("/stripe_return.html", async (req, res) => {
    const { code, state } = req.query;
  
    // Assert the state matches the state you provided in the OAuth link (optional).
    if(!stateMatches(state)) {
      return res.status(403).json({ error: 'Incorrect state parameter: ' + state });
    }

      // Send the authorization code to Stripe's API.
  stripe.oauth.token({
    grant_type: 'authorization_code',
    code
  }).then(
    (response) => {
      var connected_account_id = response.stripe_user_id;
      saveAccountId(connected_account_id);

      // Render some HTML or redirect to a different page.
      return res.status(200).json({success: true});
    },
    (err) => {
      if (err.type === 'StripeInvalidGrantError') {
        return res.status(400).json({error: 'Invalid authorization code: ' + code});
      } else {
        return res.status(500).json({error: 'An unknown error occurred.'});
      }
    }
  );
});
*/













/*
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
*/


        /* check to see if any businesses already have this stripe biz id,
        cause that would be a problem. And also check to see
        if the current logged in google Uath already has a stripe biz id
        cause that ALSO would be a problem. That's a 'contact administrator' type of
        problem. I should be able to fix that.
        The question is, how do I access the UAth session from this index.js file?

        Here are all the options I can think of:
        1. pass the user id through the stripe link (I think I can do that. Dunno how to use it though)
        2. Pass the user email through the link. Same challenges I think, plus it's more prone to error, in theory.
        3. Trigger something in the client somehow? The client should have the data in their window.


        Okay yeah definitely 1 or 2, whatever works. Think how easy it would be. I want to do this:
        let id = db.collection('businesses').doc('userID').set(data);

        AND THEN. Once you're done with that, I think I know how to do the state stuff the right way.
        You're going to have to call a google cloud function FROM the client from the same
        onClick function you have for the stripe link.
        That onClick function will fire a google cloud functon, passing
        it the google Auth account, which will run a hash generator
        and save the temporary 'state'. Then in THIS routing event,
        farther up where its validating the 'state' (where I currently have a fake one)
        it will first get the UAth ID from #1 or #2 in the list above and use
        that to make a database query about the state. Then I'll have the UAuth already
        saved to save the Stripe Account ID! That's it. It'll look sort of like

        var googleCloudFunctionCalledFromClient = function(GoogleUID){
            var state = new Hash("14 digits");
            var data = {
                state: state
            }
            db.collection('businesses').doc(GoogleUID).set(data);
        }

        My biggest concern with this method is promises and if they work alongside HTTP
        requests. Cause I have no idea if they do. However, I haven't
        had a problem with them so far, as I have been
        setting data to the database here already. I can do that
        at least.
        */
