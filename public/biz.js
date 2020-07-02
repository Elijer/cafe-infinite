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
    }
  
    var stripe = Stripe('pk_test_FjTxRNal2FWcwhlqw0WtIETQ00ZDxO3D9S');  
  
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
            //loginFormat(user.uid)
            displayBizId(doc.data().stripeBusinessID);
            startFormInput();

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
    document.getElementById("username").style.visibility = 'visible';
    document.getElementById("are-you-biz").style.visibility = 'visible';
    document.getElementById("username").style.fontSize = '20px';
    document.getElementById("username").innerText = `user: ${id}`;
    document.getElementById("login").innerText = 'logout';
  }

  function displayBizId(id){
    document.getElementById("stripe-ID").innerText = `${id}`;
  }

  function startFormInput(){
    document.getElementById("td-1").style.visibility = "visible";
    document.getElementById("td-product").style.visibility = "visible";
  }
  
  
  // ### Formats logout AND actually logs user out
  function logOut(){ // more on logging out: https://stackoverflow.com/questions/37343309/best-way-to-implement-logout-in-firebase-v3-0-1-firebase-unauth-is-removed-aft
    //document.getElementById("banner-login").innerText = "login";
    window.location.href = "/";
    firebase.auth().signOut()
    .then(function() {
      console.log("sign-out successful");
    })
    .catch(function(error) {
      console.log("There was an error signing out");
    });
  }

  /* This is how simple it was initially :( Now I made it all complicated and awful.
  function updatePost1(e){
    var user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const myPost = db.collection('businesses').doc(user.uid);
    myPost.update({promotion: e.target.value })
  }
  */

  // ### Function could be replaced by simpler calls to a "products" collection
  function marketReady(ready){
    var _status;
    if (ready == true){
      _status = "doingBusiness";
    } else {
      _status = "standby"
    };

    var user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const myPost = db.collection('businesses').doc(user.uid);
    myPost.update({status: _status })
  }


  /*### Okay so this is actually working great even though it's not quite working.
  Note that both oninput events are hooked to this function, which ONLY updates the
  product field (line 126).

  Before, I had two different functions, one that updated the product field, another
  that updated the price field.

  I want to instead write this function to do both.

  You'll also have to re-assess the way the status variable is handled. Before status
  can be doingBusiness, it needs to check that both the "product" and "price" field are
  both filled.

  But wait! There's an easier way.

  [x] Make it so that the product and price inputs are visibility: hidden by default
  [x] When the user loads, set the product input to visible.
  [] When the product input has been filled out in a satisfactory way, make the price variable
      visible. Satisfactory means:
        [] Not too short, not too long
        [] not empty
  [] Once the price variable get oninput, allow a "done" button to appear
        [] Only decimal (float) numbers allowed
        [] Has a size limit.
  [] The "done" button will finalize both values and send them to the database. This eliminates
  the inefficieny of sending every keystroke typed to the database, but maintains the elegance --
  ideally, the next button fades in casually.
  [] Then, a "saved" message must show up
  [] lastly, a "delete" message will show up after that.
  [] And that's the process! However, I suppose before doing it, you could just think about
  whether you should actually spend so much time on this. It's the last thing you have to do before
  doing stripe payments.
  */

  function handlePrompt(e){
    var val = e.target.value;
    console.log(val);

    if (val == ""){
      return;
    } else {
      var user = firebase.auth().currentUser;
      if (!user){
        alert("you must be logged in to do that.");
        // window.location.href = "/";
      } else {
        const db = firebase.firestore();
        const post = db.collection('businesses').doc(user.uid);

        post.update({product: val, status: "doingBusiness"})
        .then(function(doc) {
        }).catch(function(error) {
          document.getElementById("product-save").innerText = "Unsuccessful";
          console.log("Error getting document:", error);
        });
      }
    }
  }

  /* Deprecated input event functions

  function updatePost2(e){
    if (e.target.value == ""){
      document.getElementById("product-save").innerText = "Field can't be empty.";
    } else {
      document.getElementById("product-save").innerText = "Loading";
      var user = firebase.auth().currentUser;
      const db = firebase.firestore();
      const myPost = db.collection('businesses').doc(user.uid);
      myPost.update({product: e.target.value, status: "doingBusiness"})
      .then(function(doc) {
        //document.getElementById("product-save").innerText = "Saved";
        promptClear();
      }).catch(function(error) {
        document.getElementById("product-save").innerText = "Unsuccessful";
          console.log("Error getting document:", error);
      });
    }
    //document.getElementById("product-save").innerText = "Saved";
  }

  function updatePost3(e){
    if (e.target.value == ""){
      document.getElementById("product-save").innerText = "Field can't be empty.";
    } else {
      var user = firebase.auth().currentUser;
      const db = firebase.firestore();
      const myPost = db.collection('businesses').doc(user.uid);
      myPost.update({price: e.target.value, status: "doingBusiness"})
      .then(function(doc) {
        //document.getElementById("product-save").innerText = "Saved";
        promptClear();
      }).catch(function(error) {
        document.getElementById("product-save").innerText = "Unsuccessful";
          console.log("Error getting document:", error);
      });
    }
  }

  function newProductPrompt(){
    document.getElementById("product-save").innerText = "Press Enter to Save";
  }

  function promptClear(){
    document.getElementById("product-save").innerText = "Saved";
    document.getElementById("td-product").blur();
    document.getElementById("td-money").blur();
  }

  */