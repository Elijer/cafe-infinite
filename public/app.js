/* >>>>CURRENT PROBLEM 1.3: Okay! identified and fixed the problem. However, I really should
still do the following:
1) Check if current user exists in the database and if it doesn't, log user out
*/

/* >>>>CURRENT PROBLEM 1.2: WOOH. Found the specific problem. I found a time when the 
hash generated on the server is only 10 characters, not 11. Since I hardcoded
the extraction to be for 11 characters, this is a problem.
A problem that really can be avoided in many ways, especially now that
I'm finding that the browser DOES store the user IN the browser but.
Honestly, my way might be better. Well, it WORKS better. Is it more secure? Not sure.
The most secure thing would, I guess, be to ALSO look at the browser, cross-referenced
the returned UID and make sure it's all kosher. That might be too secure. So here are my
options for solutions
1) Make the hash the same number of characters every time
2) Use a dynamic number to cut with by getting length of the state in firestore
3) doing both 1 and 2 just in cas
4) Making a hash generously too long to begin with and cutting it at a hard-coded point
5) 
*/

/* >>>>CURRENT PROBLEM 1.1: Okay! Everything seems to work well as long as the database
and browser are in sync. If the database is purged manually or the emulators are stopped
though, well, there's still a bullet (user) in the chamber (the browser).
And that's ALMOST okay, because there SHOULD be firestore data for anyone in 
the browser 85% of the time in a production setting. But nope. Gotta fix it.
1) Most superficially, the extraction of the UID from the STATE doesn't quite work in this case
2) This should be prevented to begin with by checking to see if there even IS firebase data
for the current UID. If there isn't, either
  a) It should be created
  b) The user should be logged out and any incomplete data destroyed.

I should also just be thinking about how the health of this data is assessed in general.
Is it everytime someone logs in? Everytime they log out? Probably a bit of both.
*/

/* >>>>CURRENT PROBLEM 1.0: Really just the overall flow of creating a business ID
has no control. At one point, I could keep going in for one ID and logging business
Id after business ID (they're all the same, but I'll get to that) to no avail!
The firebase doc that was supposed to be logged to never got it for some reason.
I think. And then sometimes, the id gets added no problem and when you try
again it shuts you down with the message I recently made, "biz id already exists",
so that works well but. Only sometimes. 
And it still doesn't answer the question of, where does this other UID come from
that's used to create these stray firestore documents? Is it possible firebase AUTH
is somehow keeping a couple UIDs alive at a time and using them at random? I don't know yet,
but I think that even if I did fix THIS problem, it wouldn't solve the bigger problem
that I barely have any validation for the coordination of the OATH and firestore. There
need to be more checks in place here.
To fix it, don't just add MORE checks and stuff. You should also look more carefully at
the code you have.

Also, side note; when a UID is already in the browser, the code to format the login
button accordingly should be reused in a function called both at the end of the doc.load
event AND in the anonLogin.

Plus, you should have a plan for the login stuff, right? I guess if it's just
firestripe, both options -- google AND anon should work. But anon should probably work
pretty automatically. That's the point.
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
    console.log("Okay, we found a user ID saved in the browser.");

    const db = firebase.firestore(); //will this fuck up the locahost thing?
    const docRef = db.collection('businesses').doc(user.uid);
    docRef.get().then(function(doc) {
      if (doc.data()) {
        console.log("And there seems to be data for for this account in the db. Okay! We'll let you stay logged in.");
        loginFormat(user.uid)
      } else {
        console.log("Hmm weird. Your account has no data in the database. Sorry, we're gonna log you out.");
        logOut();
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

  } else {
    console.log("No uid in browser");
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
  
        //loginFormat(id);
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