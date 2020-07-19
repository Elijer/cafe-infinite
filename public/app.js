document.addEventListener("DOMContentLoaded", event => {
  //const app = firebase.app();
  //var functions = firebase.functions();
  const db = firebase.firestore();

  // enforce use of EMULATED firestore and functions if app is local
  if (window.location.hostname === "localhost") {
    firebase.functions().useFunctionsEmulator("http://localhost:5001");
    console.log("localhost detected! Will use firestore and functions emulators instead of actual firebase instances of those things.");
    db.settings({ 
      host: "localhost:8080",
      ssl: false
    });

    setMockData(db);
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

      dbu.isThere(_db, "businesses", uid) // checks if user is in db, if so returns that user
      .then(function(result){
        if (result) {
          console.log("And persistent user exists in DB. Okay! We'll let you stay logged in.");
          loginFormat(uid);
          document.getElementById("are-you-biz").innerText = 'Go to biz dash.';
          populateMarket(_db, addRow);
        } else {
          console.log("Hmm weird. Your account has no data in the database. Sorry, we're gonna log you out.");
          logOut();
        }
      })
    } else {
      console.log("No persistent user found in browser.")
    }
  }

  firebase.checkComplete = true;
  
}



function populateMarket(_db, callback){
  dbu.where(_db, "businesses", "status", "==", "doingBusiness", callback);
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

    // paymentIntent returns stripe's public key through the result
    var stripe = Stripe(result.data.publicKey, {
      stripeAccount: _bizID
    });

    // create, style and mount card elements to the Dom
    var elements = stripe.elements();
    var style = styleStripeForm();
    var card = elements.create('card', {style: style});
    card.mount('#card-element');

    //let thePrice = "$" + result.data.price;
    console.log("The price is $" + result.data.price + " Because it's currently hardcoded in index.js");
    //document.getElementById('submit').innerHTML = `Pay ${thePrice}`;
    document.getElementById('submit').innerHTML = "Pay duh munny";


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

          let data = {
            isAnonymous: isAnonymous,
            createdAt: new Date()
            };

          const _db = firebase.firestore();
          
          dbu.addDoc(_db, "businesses", uid, data); // creates a new object in specified collection with data object

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

  dbu.isThere(db, "businesses", user.uid)
  .then(function(data){
    if (data.stripeBusinessID){
      console.log("Nice, there's already a biz ID! Let's take you to the dashboard", doc.data().stripeBusinessID);
      window.location.href = "/biz.html";
    } else {
      console.log("No biz ID yet! Let's make it!");
      const theURI = chooseURI();
      var stripeState = firebase.functions().httpsCallable('stripeState');
      stripeState({uri: theURI})

      .then(function(result){
        console.log("new state in database, URL returned successfully, redirecting now");
        var returnedURL = result.data.text;
        window.location.replace(returnedURL);
      })

    }
  })
}



function chooseURI(){
  if(window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  } else {
    return "https://firestripe-boilerplate.web.app/api";
  }
}



function setMockData(_db){

  var data1 = {
    isAnonymous: true,
    price: "1.00",
    product: "Sandals",
    state: "HFH5XKnpQaJ",
    status: "doingBusiness",
    stripeBusinessID: "acct_1Gn5TjGyLtyoABdR"
  };

  var data2 = {
    isAnonymous: true,
    price: "300.50",
    product: "Bananas",
    state: "eqo13tinhep",
    status: "doingBusiness",
    stripeBusinessID: "acct_1Gn5TjGyLtyoABdR"
  }

  var data3 = {
    isAnonymous: true,
    price: "4.00",
    product: "Carabiner",
    state: "ezvUkoL86Z8",
    status: "doingBusiness",
    stripeBusinessID: "acct_1Gn5TjGyLtyoABdR"
  }

  const usersRef1 = _db.collection('businesses').doc("92ugtu63MYdWRB4EtxQubvcMcaD3");
  const usersRef2 = _db.collection('businesses').doc("qqfb2HozN0fn2aTyRUTLIpE14Nz1");
  const usersRef3 = _db.collection('businesses').doc("heCh1pDwT5QYV61wwXtuoSUkkp42");

  usersRef1.set(data1);
  usersRef2.set(data2);
  usersRef3.set(data3);

}
