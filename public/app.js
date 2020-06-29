/* >>>>CURRENT PROBLEM: Somewhere in the last 3 commits, my "are you a business"
stops finishing. Figure out why. Still works before the commit with the parens.
This might somehow just be the same problem. It looks like a new Biz account ID
is showing up in the database along with a totally new UID, and not in the
supposedly current anonymous account like it was before and it like it should.
However, it would only do this the first time before, and the second time around it
would still fuck it up by adding a new one if the first one already
did have a business ID. I think that what happens in the /"api" endpoint just
needs looking at -- I wrote it and then never reassessed it.
"*/

document.addEventListener("DOMContentLoaded", event => {
  const app = firebase.app();
  const db = firebase.firestore();
  var functions = firebase.functions();

  if (window.location.hostname === "localhost") {
    //enforces functions to run through functions emulator
    firebase.functions().useFunctionsEmulator("http://localhost:5001");
    console.log("localhost detected!");
    //directs firestore to run through firestore emulator
    db.settings({
      host: "localhost:8080",
      ssl: false
    });
    // stripe test keys could go here, while production keys could be kept in a different condition
  }

  var stripe = Stripe('pk_test_FjTxRNal2FWcwhlqw0WtIETQ00ZDxO3D9S');  
  document.getElementById("banner-login").innerText = "login";

  firebase.auth().onAuthStateChanged(user => checkForUser(user));
});

function checkForUser(user){
  if (user){
        //console.log("User already exists in browser. UID: " + user.uid);
    document.getElementById("business-login").style.display = 'inline';
    document.getElementById("banner-login").style.fontSize = '30px';
    document.getElementById("banner-login").style.width = '45%';
    document.getElementById("banner-login").innerText = `${user.uid}`;
    document.getElementById("business-logout").style.display = 'inline';
  } else {
    console.log("No uid in browser");
  }
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
  // should check to see if user data has been created in the database
  if (firebase.auth().currentUser){
    var user = firebase.auth().currentUser;
    console.log("User already exists in browser. UID: " + user.uid);
  } else {
  }


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
  
        document.getElementById("business-login").style.display = 'inline';
        document.getElementById("banner-login").style.fontSize = '30px';
        document.getElementById("banner-login").style.width = '45%';
        document.getElementById("banner-login").innerText = `${uid}`;
        document.getElementById("business-logout").style.display = 'inline';

  
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
              console.log("new user created with the following data " + {user});
            }
          })
        .catch(console.log);
      } else {
        console.log("user is not signed in");
      }
    });
  })
}

// Not being used rn
function googleLogin(){
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
  .then(result => {
      document.getElementById("business-login").style.display = 'inline';
      const user = result.user;
      document.getElementById("banner-login").innerText = `${user.displayName}`;

      const db = firebase.firestore();
      const usersRef = db.collection('businesses').doc(user.uid);

      usersRef.get()
        .then((docSnapshot) => {
          if (!docSnapshot.exists) {
            let data = {
              name: user.displayName,
              email: user.email,
              profilePic: user.photoURL,
              createdAt: new Date()
            };
            usersRef.set(data, {merge: true}) // create the document
            console.log("new user created with the following data " + data);
          }
      })
      .catch(console.log);
  })
  .catch(console.log);
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

function randomEleven(){
  //return a random alphanumeric string with 11 digits
  return Math.random().toString(36).slice(2);
}








  /*
  Customize banner: https://dashboard.stripe.com/settings/applications-->
  Page in Docs that helps create this link: https://stripe.com/docs/connect/enable-payment-acceptance-guide#step-21-add-an-authentication-buttonclient-side
  my test id // ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG
  my real id // ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH
  test URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  real URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  */



  /*function randomStr(length, characters) { //console.log(randomStr(8, '123456abcdefg'));
  var ans = ''; 
  for (var i = length; i > 0; i--) { 
      ans +=  
        characters[Math.floor(Math.random() * characters.length)]; 
  } 
  return ans; 
}*/