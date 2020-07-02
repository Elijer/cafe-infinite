document.addEventListener("DOMContentLoaded", event => {
  const app = firebase.app();
  const db = firebase.firestore();
  var functions = firebase.functions();

  // enforce use of EMULATED firestore and functions if app is local
  if (window.location.hostname === "localhost") {
    firebase.functions().useFunctionsEmulator("http://localhost:5001");
    console.log("localhost detected!");
    db.settings({ 
      host: "localhost:8080",
      ssl: false
    });
  }

  var stripe = Stripe('pk_test_FjTxRNal2FWcwhlqw0WtIETQ00ZDxO3D9S');  
  document.getElementById("login").innerText = "login";

  // checkComplete bool added to firebase object so that checkForUserPersistence() is only called once
  firebase.checkComplete = false;
  firebase.auth().onAuthStateChanged(user => checkForUserPersistence());
});

// ### Called once to see if a user already persists in browser
function checkForUserPersistence(){
  if (firebase.checkComplete == false){
      var user = firebase.auth().currentUser;
    if (user){
      console.log("Persistent user found in browser: " + user.uid);
      const db = firebase.firestore();
      const docRef = db.collection('businesses').doc(user.uid);
      docRef.get().then(function(doc) {
        if (doc.data()) {
          console.log("And persistent user exists in DB. Okay! We'll let you stay logged in.");
          loginFormat(user.uid);
          populateMarket();
          document.getElementById("are-you-biz").innerText = 'Go to biz dash.';
        } else {
          console.log("Hmm weird. Your account has no data in the database. Sorry, we're gonna log you out.");
          logOut();
        }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });

    } else {
      console.log("No persistent user in browser");
    }
    firebase.checkComplete = true;
  }
}

function populateMarket(){
  console.log("populateMarket called");
  const db = firebase.firestore();
  db.collection("businesses").where("status", "==", "doingBusiness")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          addRow();
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}

function addRow() {
  console.log("addRow called");
  const tr = document.createElement('tr');

  tr.className = 'product-row';

  tr.innerHTML = `
      <td class = "td-first"> Moose Stuff Llc. </td>
      <td> Magic </td>
      <td class = "td-money"> $200 </td>
      <td class = "product-detail-last"> buy </td>
  `;

    /*
    <tr>
      <td class = "td-first">Moose Stuff Llc.</td>
      <td>Magic</td>
      <td class = "td-money">$200</td>
      <td class = "product-detail-last">buy</td>
    </tr>
    */

  document.getElementById('product-table').appendChild(tr);
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
    /*var user = firebase.auth().currentUser;
    console.log("User already exists in browser. UID: " + user.uid);*/
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
              })
          }
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}


  /* Stripe Notes
  Customize banner: https://dashboard.stripe.com/settings/applications-->
  Page in Docs that helps create this link: https://stripe.com/docs/connect/enable-payment-acceptance-guide#step-21-add-an-authentication-buttonclient-side
  my test id // ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG
  my real id // ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH
  test URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  real URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  */