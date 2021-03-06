//Firebase/Firestore
var randomstring = require("randomstring");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
// admin SDK allows server to access db with unlimited priveledges, regardless of db rules
admin.initializeApp();
let db = admin.firestore();

// If firebase functions:config:set state.test = "true", stripe will use test keys instead
// of productuons keys.
if (functions.config().state.testing == "true"){
  console.log("testing mode", "true");
  var stripe = require('stripe')(functions.config().testkeys.webhooks);
  var public = functions.config().testkeys.public;
  var clientid = functions.config().testkeys.clientid;
  var signing = functions.config().testkeys.signing;
} else if (functions.config().state.testing == "false"){
  console.log("testing mode", "false");
  var stripe = require('stripe')(functions.config().keys.webhooks);
  var public = functions.config().keys.public;
  var clientid = functions.config().keys.clientid;
  var signing = functions.config().keys.signing;
}

//express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));


exports.testModeIsOn = functions.https.onCall (async(data, context) => {
  return functions.config().state.testing;
});


// STRIPE: Creates Payment Intent Object
exports.paymentIntent = functions.https.onCall (async(data, context) => {
  console.log("Payment intent was called on the server: going to make a payment to bizID of " + data.bizID);


  const paymentIntent = await stripe.paymentIntents.create({ //https://www.youtube.com/watch?v=vn3tm0quoqE
    payment_method_types: ['card'],
    amount: 1000,
    currency: 'usd',
    application_fee_amount: 123,
  }, {
    stripeAccount: data.bizID // this comma might be a typo
  })

  //console.log("Okay the client secret generated is this: " + paymentIntent.data.client_secret);
  //return paymentIntent.client_secret;
  return {secret: paymentIntent.client_secret, publicKey: public, price: paymentIntent.amount};
});



// ###### Callable function that creates the State ######
exports.stripeState = functions.https.onCall((data, context) => {
    
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }
   
    //constructing state;
    // (1) output is nestled inside of the STRIPE url
    // (2) state is logged to the firestore document of the current business
    const _uri = data.uri;
    const uid = context.auth.uid;
    console.log ("uid is " + uid)
    const state = randomstring.generate(11); // 11 is an arbitrary number, but it IS hard-coded into the endpoint above, so if you change it change it there too //uses randomstring node package
    console.log("state has been generated to be " + state);
    var output = state + uid;
    console.log("output variable is " + output);

    var onboardingURL =
    `https://connect.stripe.com/oauth/authorize?` +
    `client_id=${clientid}` + 
    `&state=${output}&scope=read_write&` +
    `redirect_uri=${_uri}` +
    `&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com`


    console.log("the onboardingURL that's going to be returned is " + onboardingURL);

    return db.collection('businesses').doc(uid).set({state: state}, {merge: true}) //or use .update({state: state}), not sure
    .then(() => {
      console.log("yo, okay so firebase was accessed and updated. Now we're returning the URL");
      return { text: onboardingURL };
    })
});



// ##### Route that Stripe uses when biz onboarding is complete ######
app.get("/api", async (req, res) => {
  const { code, state } = req.query;
  console.log("THe code is " + code);
  // 11 is an arbitrary number, but if the function used to construct state makes a state of a different size, it will break this endpoint
  var justState = state.substring(0, 11);
  console.log("just state is: " + justState);
  var justUID = state.slice(11);
  console.log("just UID is " + justUID);
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



app.post('/paymentsuccess', bodyParser.raw({type: 'application/json'}), (request, response) => {
  
  // Webhook Dashboard: https://dashboard.stripe.com/test/webhooks/we_1H4bvvBvEVpcoMaugy2BywKM
  // webhook testing commands for stripe CLI:
  // (1) stripe listen --forward-connect-to localhost:5000/paymentsuccess
  // (2) stripe trigger --stripe-account=acct_1Gn5TjGyLtyoABdR payment_intent.succeeded

  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig, signing);
    //event = stripe.webhooks.constructEvent(request.rawBody, sig, "whsec_D2OLcog9zt7Ud9Xa2QRXrcpok244BbJB");
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

  console.log("webhook has caught a successful payment returned by stripe!");
  let db = admin.firestore();
  var docRef = db.collection('payments').doc('payment');
  docRef.set({paySuccess: true})
  .then (() => {
    console.log("Success!");
  })
  
}

exports.app = functions.https.onRequest(app);
