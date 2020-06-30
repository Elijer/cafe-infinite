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
    document.getElementById("banner-login").innerText = "login";
  
    // checkComplete bool added to firebase object so that checkForUserPersistence() is only called once
    firebase.checkComplete = false;
    firebase.auth().onAuthStateChanged(user => checkForUserPersistence());
  });
  
  
  
  // ### Called once to see if a user already persists in browser
  function checkForUserPersistence(){
    if (firebase.checkComplete == false){
        var user = firebase.auth().currentUser;
      if (user){
        console.log("Persistent user found in browser.");
        const db = firebase.firestore();
        const docRef = db.collection('businesses').doc(user.uid);
        docRef.get().then(function(doc) {
          if (doc.data()) {
            console.log("And persistent user exists in DB. Okay! We'll let you stay logged in.");
            loginFormat(user.uid)
            displayBizId(doc.data().stripeBusinessID);
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
  
  
  
  // ### Called when user logs in: formats login button to say their ID
  function loginFormat(id){
    document.getElementById("banner-login").style.fontSize = '30px';
    document.getElementById("banner-login").style.width = '45%';
    document.getElementById("banner-login").innerText = `${id}`;
  }

  function displayBizId(id){
    document.getElementById("stripe-ID").innerText = `Your Stripe ID is: ${id}`;
  }
  
  
  
  // ### Formats logout AND actually logs user out
  function logOut(){ // more on logging out: https://stackoverflow.com/questions/37343309/best-way-to-implement-logout-in-firebase-v3-0-1-firebase-unauth-is-removed-aft
    document.getElementById("banner-login").innerText = "login";
    firebase.auth().signOut()
    .then(function() {
      console.log("sign-out successful");
    })
    .catch(function(error) {
      console.log("There was an error signing out");
    });
  }

  function updatePost(e){
    var user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const myPost = db.collection('businesses').doc(user.uid);
    myPost.update({productName: e.target.value })

  }