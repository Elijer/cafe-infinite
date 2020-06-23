/* Instructions for changing to server-facing
instead of emulator-facing:
1. get rid of if (window.location.hostname === "localhost") codeblock
2. anonlogin
3. Consider firestore rules
4. Possibly disable anonymous auth on firebase console

*/

document.addEventListener("DOMContentLoaded", event => {
  const app = firebase.app();
  const db = firebase.firestore();

  if (window.location.hostname === "localhost") {
    console.log("localhost detected!");
    db.settings({
      host: "localhost:8080",
      ssl: false
    });
  }

  var functions = firebase.functions();
  //do I need to 'require' any of these?
  var stripe = Stripe('pk_test_FjTxRNal2FWcwhlqw0WtIETQ00ZDxO3D9S');  
  document.getElementById("banner-login").innerText = "login";
});

function anonLogin(){
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
        console.log("User is: " + uid + " .Is anonymous? " + isAnonymous);
  
        document.getElementById("business-login").style.display = 'inline';
        document.getElementById("banner-login").style.fontSize = '30px';
        document.getElementById("banner-login").style.width = '45%';
        document.getElementById("banner-login").innerText = `${uid}`;
  
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
              console.log("new user created with the following data " + data);
            }
          })
        .catch(console.log);
      } else {
        console.log("user is not signed in");
      }
    });
  })
}


/*
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
*/


function onboardBusiness(){
  var user = firebase.auth().currentUser;
  console.log(user);
  if (!user){
    alert("you have to be logged in to register your business with Cafe Infinite!");
    return;
  } else {
    console.log("the user is " + user.displayName);
  }
  var stripeState = firebase.functions().httpsCallable('stripeState');
  stripeState({text: "1234"})
  .then(function(result){
    console.log("new state in database, URL returned successfully, redirecting now");
    var returnedURL = result.data.text;
    window.location.replace(returnedURL);
  })
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