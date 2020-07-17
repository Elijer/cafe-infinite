// refactor so that biz html scripts and biz.js files aren't redundant

var stripeKey = "pk_live_iAmLf84b4gdmw8uYObbVKayL00nN5Dtb3p";

document.addEventListener("DOMContentLoaded", event => {
  const app = firebase.app();
  const db = firebase.firestore();
  var functions = firebase.functions();


  // enforce use of EMULATED firestore and functions if app is local
  if (window.location.hostname === "localhost") {
    firebase.functions().useFunctionsEmulator("http://localhost:5001");
    console.log("localhost detected! Will use firestore and functions emulators instead of actual firebase instances of those things.");
    db.settings({ 
      host: "localhost:8080",
      ssl: false
    });
    stripeKey = "pk_test_FjTxRNal2FWcwhlqw0WtIETQ00ZDxO3D9S";
  }

  document.getElementById("login").innerText = "login";
  document.getElementById("loading-stripe-ID").style.visibility = "hidden";

  // checkComplete bool added to firebase object so that checkForUserPersistence() is only called once
  firebase.checkComplete = false;
  firebase.auth().onAuthStateChanged(user => checkForUserPersistence(db));
});



// ### Called once to see if a user already persists in browser
function checkForUserPersistence(_db){
  if (firebase.checkComplete == false){
    if (firebase.auth().currentUser != null){
      const uid = firebase.auth().currentUser.uid;

      console.log("Persistent user found in browser: " + uid);
      const docRef = _db.collection('businesses').doc(uid);
      docRef.get()
      .then(function(doc) {
        const d = doc.data();
        if (d) {
          console.log("And persistent user exists in DB. Okay! We'll let you stay logged in.");
          loginFormat(uid);
          document.getElementById("are-you-biz").innerText = 'Go to biz dash.';
          populateMarket(_db);
        } else {
          console.log("Hmm weird. Your account has no data in the database. Sorry, we're gonna log you out.");
          logOut();
        }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });

    } else {
      console.log("No persistent user found in browser.")
    }
  }

  firebase.checkComplete = true;
  
}



function populateMarket(_db){
  _db.collection("businesses").where("status", "==", "doingBusiness")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          const d = doc.data();
          const data = {
            biz: d.stripeBusinessID,
            prod: d.product,
            price: "$" + d.price
          }
          addRow(data); // Create a row for each document returned from db
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}



// ### Populates table (#product-table) with data from db.collection("businesses").
// ### Will eventual transition to use with db.collection("products")
function addRow(d) {
  const row = document.createElement('tr');
  row.className = 'product-row';

  row.innerHTML =
  `
      <td class = "td-first"> ${d.biz} </td>
      <td> ${d.prod} </td>
      <td class = "td-money"> ${d.price} </td>
      <td class = "product-detail-last" onclick = "buyProduct('${d.biz}')" > buy </td>
  `;

  document.getElementById('product-table').appendChild(row);

}



// ######### Calls http callable function: paymentIntent()
function buyProduct(_bizID){
  var paymentIntent = firebase.functions().httpsCallable('paymentIntent');
  paymentIntent({bizID: _bizID})
  .then(function(result){

    const theBigSecret = result.data.secret;
    console.log(theBigSecret);

    var stripe = Stripe(result.data.publicKey, {
      stripeAccount: _bizID
    });

    // create, style and mount card elements to the Dom
    var elements = stripe.elements();
    var style = styleStripeForm();
    var card = elements.create('card', {style: style});
    card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    card.on('change', function(event) {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    // Handle form submission.
    var form = document.getElementById('payment-form');

    form.addEventListener('submit', function(ev) {
      ev.preventDefault(); // prevents page from refreshing on form submit
      // use the client secret from before
      stripe.confirmCardPayment(theBigSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: 'Jenny Rosen' // This is where I get the billing details from whatever fields are in the form
          }
        }
      }).then(function(result) {
        console.log(result);
        if (result.error) {
          console.log(result.error.message); // Show error to your customer (e.g., insufficient funds)
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            console.log("### The payment SUCCEEDED! ###");
            // Show a success message to your customer
            // There's a risk of the customer closing the window before callback
            // execution. Set up a webhook or plugin to listen for the
            // payment_intent.succeeded event that handles any business critical
            // post-payment actions.
          }
        }
      });
    });

    // Submit the form with the token ID.
    function stripeTokenHandler(token) {
      // Insert the token ID into the form so it gets submitted to the server
      var form = document.getElementById('payment-form');
      var hiddenInput = document.createElement('input');
      hiddenInput.setAttribute('type', 'hidden');
      hiddenInput.setAttribute('name', 'stripeToken');
      hiddenInput.setAttribute('value', token.id);
      form.appendChild(hiddenInput);

      // Submit the form
      form.submit();
    }
  })
}

function styleStripeForm(){
  var style = {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  };

  return style;
}





// ### Called when user logs in: formats login button to say their ID
function loginFormat(id){
  document.getElementById("username").style.visibility = 'visible';
  document.getElementById("are-you-biz").style.visibility = 'visible';
  document.getElementById("username").style.fontSize = '20px';
  document.getElementById("username").innerText = `user: ${id}`;
  document.getElementById("login").innerText = 'logout';
}



// ### Formats logout AND actually logs user out
function logOut(){ // more on logging out: https://stackoverflow.com/questions/37343309/best-way-to-implement-logout-in-firebase-v3-0-1-firebase-unauth-is-removed-aft
  document.getElementById("login").innerText = 'login';
  document.getElementById("username").style.visibility = 'hidden';
  document.getElementById("are-you-biz").style.visibility = 'hidden';
  firebase.auth().signOut()
  .then(function() {
    console.log("sign-out successful");
  })
  .catch(function(error) {
    console.log("There was an error signing out");
  });
}


// ### Creates an anonymous login that persists when tab is closed
function anonLogin(){
  if (firebase.auth().currentUser){
    logOut();
  } else {
    firebase.auth().signInAnonymously().catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("There is an error with the login of code: " + errorCode + " and message: " + errorMessage);
    })
    .then( result => {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          var isAnonymous = user.isAnonymous;
          var uid = user.uid;
          //console.log("User is: " + uid + " .Is anonymous? " + isAnonymous);
    
          loginFormat(user.uid);
    
          const db = firebase.firestore();
          const usersRef = db.collection('businesses').doc(uid);
    
          usersRef.get()
            .then((docSnapshot) => {
              if (!docSnapshot.exists) {
                let data = {
                  isAnonymous: isAnonymous,
                  createdAt: new Date()
                };
                usersRef.set(data, {merge: true}) // create the document
                console.log("new anon user created in db for UID:  " + user.uid);
              }
            })
          .catch(console.log);
        } else {
          console.log("user is not signed in");
        }
      });
    })
  }
}



// ### Starts stripe business onboarding process
function onboardBusiness(){
  var user = firebase.auth().currentUser;
  console.log(user);

  // check to see if someone is logged in
  if (!user){
    alert("you have to be logged in to register your business with Cafe Infinite!");
    return;
  } else {
    console.log("the user is " + user.displayName);
  }
  
  //check to see if the account already has business ID
      const db = firebase.firestore();
      const docRef = db.collection('businesses').doc(user.uid);
      docRef.get().then(function(doc) {
        if (doc != null && doc != undefined){
          if (doc.data().stripeBusinessID) {
            // If there's already a business ID, user is navigated to biz.html
            console.log("Nice, there's already a biz ID! Let's take you to the dashboard", doc.data().stripeBusinessID);
            window.location.href = "/biz.html";
          } else {
              // doc.data() will be undefined in this case
              console.log("No biz ID yet! Let's make it!");
              var stripeState = firebase.functions().httpsCallable('stripeState');
              stripeState({text: "1234"})
              .then(function(result){
                console.log("new state in database, URL returned successfully, redirecting now");
                var returnedURL = result.data.text;
                window.location.replace(returnedURL);
              }).catch(function(error){
                console.log("Error calling https-callable stripeState in firebase with error: ", error);
              })
          }
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}