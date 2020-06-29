document.addEventListener("DOMContentLoaded", event => {
  const app = firebase.app();
  const db = firebase.firestore();
  var functions = firebase.functions();

  if (window.location.hostname === "localhost") {
    firebase.functions().useFunctionsEmulator("http://localhost:5001"); //enforces functions to run through functions emulator
    console.log("localhost detected!");
    db.settings({ 
      host: "localhost:8080",    //directs firestore to run through firestore emulator
      ssl: false
    });
    // stripe test keys could go here, while production keys could be kept in a different condition
  }

  var stripe = Stripe('pk_test_FjTxRNal2FWcwhlqw0WtIETQ00ZDxO3D9S');  
  document.getElementById("banner-login").innerText = "login";
  firebase.checkComplete = false;
  firebase.auth().onAuthStateChanged(user => checkForUserPersistence());
});

function checkForUserPersistence(){
  if (firebase.checkComplete == false){
      var user = firebase.auth().currentUser;
    if (user){
      console.log("Persistent user found in browser.");
      const db = firebase.firestore(); //will this fuck up the locahost thing?
      const docRef = db.collection('businesses').doc(user.uid);
      docRef.get().then(function(doc) {
        if (doc.data()) {
          console.log("And persistent user exists in DB. Okay! We'll let you stay logged in.");
          loginFormat(user.uid)
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

function loginFormat(id){
  document.getElementById("business-login").style.display = 'inline';
  document.getElementById("banner-login").style.fontSize = '30px';
  document.getElementById("banner-login").style.width = '45%';
  document.getElementById("banner-login").innerText = `${id}`;
  document.getElementById("business-logout").style.display = 'inline';
}

function logOut(){ // more on logging out: https://stackoverflow.com/questions/37343309/best-way-to-implement-logout-in-firebase-v3-0-1-firebase-unauth-is-removed-aft
  document.getElementById("business-logout").style.display = 'none';
  document.getElementById("banner-login").innerText = "login";
  firebase.auth().signOut()
  .then(function() {
    console.log("sign-out successful");
  })
  .catch(function(error) {
    console.log("There was an error signing out");
  });
}

function anonLogin(){
  /* should check to see if user data has been created in the database
  if (firebase.auth().currentUser){
    var user = firebase.auth().currentUser;
    console.log("User already exists in browser. UID: " + user.uid);
  } else {
  }*/

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

  //check to also see if there's an actual User Account, too

  //check to see if the account already has business ID
      const db = firebase.firestore(); //will this fuck up the locahost thing?
      const docRef = db.collection('businesses').doc(user.uid);
      docRef.get().then(function(doc) {
        if (doc.data().stripeBusinessID) {
          console.log("There is a Biz ID already", doc.data().stripeBusinessID)
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
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
  
  /*
  // User is present but has no business ID. Generate a state and send them to stripe
  var stripeState = firebase.functions().httpsCallable('stripeState');
  stripeState({text: "1234"})
  .then(function(result){
    console.log("new state in database, URL returned successfully, redirecting now");
    var returnedURL = result.data.text;
    window.location.replace(returnedURL);
  })*/
}


  /*
  Customize banner: https://dashboard.stripe.com/settings/applications-->
  Page in Docs that helps create this link: https://stripe.com/docs/connect/enable-payment-acceptance-guide#step-21-add-an-authentication-buttonclient-side
  my test id // ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG
  my real id // ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH
  test URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  real URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  */