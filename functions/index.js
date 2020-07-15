/* Current problem: "No such payment_intent". WTF? I have been making the payent intent
Not totally clear if the client_secret is being cut off, possibly some problem
with how I'm parsing the return JSON. Or there might be an issue with the stripeAccount
field. I still haven't tried putting my OWN stripeAccount field in there because I don't
know how that would make sense. Then when would the connected account info get put in?
Possibly worth a shot. In over my head anyways though. Things are breaking because
I didn't really take the time to understand everything. Get some goddamn sleep you sorry
soul.
*/

//Firebase/Firestore
var randomstring = require("randomstring");
const functions = require('firebase-functions'); // The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const admin = require('firebase-admin'); //initialize an admin app instance from which Cloud Firestore changes can be made // The Firebase Admin SDK to access Cloud Firestore.
admin.initializeApp();
let db = admin.firestore();

//stripe keys
const stripe = require('stripe')('sk_test_ilxfLf0PNi61WCkO3n9gmoYM00eKzyC0FQ', {apiVersion: ''});

//generated here: https://dashboard.stripe.com/test/webhooks/we_1H4bvvBvEVpcoMaugy2BywKM

//express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));

app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});






// create payment intent
exports.paymentIntent = functions.https.onCall (async(data, context) => {
  console.log("Payment intent was called on the server");
    
  if (!context.auth) {
      throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
          'while authenticated.');
  } else {

    console.log("going to make a payment to bizID of " + data.bizID);


    const paymentIntent = await stripe.paymentIntents.create({ //https://www.youtube.com/watch?v=vn3tm0quoqE
      payment_method_types: ['card'],
      amount: 1000,
      currency: 'usd',
      application_fee_amount: 123,
    }, {
      stripeAccount: data.bizID // this comma might be a typo
    })

    //console.log("Okay the client secret generated is this: " + paymentIntent.data.client_secret);
    return paymentIntent.client_secret;
  

  }
});







// ###### Callable function that creates the state ######
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







// ##### Route that Stripe uses when onboarding is complete ######
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
          status: "standby"
        };

      let id = db.collection('businesses').doc(justUID).set(data, {merge: true});

      /*>> [3] TO CODE: This is where I will redirect user to their business portal*/
      // Render some HTML or redirect to a different page.
      //return res.status(200).json({success: true});
      return res.redirect('/biz.html');
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

 // test commands:
  // (1) stripe listen --forward-connect-to localhost:5000/webhook
  // (2) stripe trigger --stripe-account=acct_1Gn5TjGyLtyoABdR payment_intent.succeeded
    //const signingSecret_TESTING = "whsec_D2OLcog9zt7Ud9Xa2QRXrcpok244BbJB";

app.post('/paymentsuccess', bodyParser.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  // Verify webhook signature and extract the event.
  // See https://stripe.com/docs/webhooks/signatures for more information.
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, "whsec_D2OLcog9zt7Ud9Xa2QRXrcpok244BbJB");
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const connectedAccountId = event.account;
    handleSuccessfulPaymentIntent(connectedAccountId, paymentIntent);
  }

  response.json({received: true});
});

const handleSuccessfulPaymentIntent = (connectedAccountId, paymentIntent) => {
  // Fulfill the purchase.
  console.log('Connected account ID: ' + connectedAccountId);
  console.log(JSON.stringify(paymentIntent));
}

exports.app = functions.https.onRequest(app);