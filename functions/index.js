/*>>>>>CURRENT ISSUE: Detailed stack trace: Error: Cannot find module 'stripe'
*/

//Firebase and Firestore
const functions = require('firebase-functions'); // The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const admin = require('firebase-admin'); //initialize an admin app instance from which Cloud Firestore changes can be made // The Firebase Admin SDK to access Cloud Firestore.
admin.initializeApp();
let db = admin.firestore();
const stripe = require('stripe')('sk_test_ilxfLf0PNi61WCkO3n9gmoYM00eKzyC0FQ', {apiVersion: ''});
//here's the page for the stripe npm module https://github.com/stripe/stripe-node
//express
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));

app.get("/api", async (req, res) => {
    const { code, state } = req.query;

    // Assert the state matches the state you provided in the OAuth link (optional).
    if(state != "23823948qfnadgba8sas") {
      return res.status(403).json({ error: 'Incorrect state parameter: ' + state });
    }
  
    // Send the authorization code to Stripe's API.
    stripe.oauth.token({
      grant_type: 'authorization_code',
      code
    }).then(
      (response) => {
        var connected_account_id = response.stripe_user_id;
        let data = {
            businessID: connected_account_id,
          };

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
        let id = db.collection('businesses').doc('firstBiz').set(data);
  
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
  

exports.app = functions.https.onRequest(app);

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