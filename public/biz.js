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
            // #### If User Exists in DB
            console.log("And persistent user exists in DB. Okay! We'll let you stay logged in.");
            displayBizId(result.stripeBusinessID);
            if (result.businessName) displayBusinessName(result.businessName);
            startFormInput();
          } else {
            // #### If User does not exist in DB
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
  
  
  // ### Called when user logs in: formats login button to say their ID
  function loginFormat(id){
    document.getElementById("username").style.visibility = 'visible';
    document.getElementById("are-you-biz").style.visibility = 'visible';
    document.getElementById("username").style.fontSize = '20px';
    document.getElementById("username").innerText = `user: ${id}`;
    document.getElementById("login").innerText = 'logout';
  }

  function displayBizId(id){
    document.getElementById("stripe-ID").innerText = `Stripe ID: ${id}`;
    document.getElementById("loading-stripe-ID").style.visibility = "hidden";
  }
  
  function displayBusinessName(name){
    document.getElementById("td-name").placeholder = name;
  }

  function startFormInput(){
    document.getElementById("td-1").style.visibility = "visible";
    document.getElementById("td-product").style.visibility = "visible";
    document.getElementById("td-1-name").style.visibility = "visible";
    document.getElementById("td-name").style.visibility = "visible";
  }
  
  
  // ### Formats logout AND actually logs user out
  function logOut(){ // more on logging out: https://stackoverflow.com/questions/37343309/best-way-to-implement-logout-in-firebase-v3-0-1-firebase-unauth-is-removed-aft
    window.location.href = "/";
    firebase.auth().signOut()
    .then(function() {
      console.log("sign-out successful");
    })
    .catch(function(error) {
      console.log("There was an error signing out");
    });
  }

  function handleName(e){
    var val = e.target.value;
    if (val == "" || val.length <= 2 || val.length >= 12){
      return;
    } else {
      var user = firebase.auth().currentUser;
      if (!user){
        alert("you must be logged in to do that.");
      } else {
        firebase.businessName = val;
        document.getElementById("name-save").style.visibility = 'visible';
        document.getElementById("name-save").innerText = "Save";
      }
    }
  }


  function handleNameSave(e){

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    const post = db.collection('businesses').doc(user.uid);

    const businessName = firebase.businessName;

    post.update({businessName: businessName})
    .then(function(doc) {
      document.getElementById("name-save").innerText = "Product Saved";
    }).catch(function(error) {
      document.getElementById("name-save").innerText = "Save unsuccessful";
      console.log("Error getting document:", error);
    });
  }

  

  // ### Three functions of handle form input and saving
  function handleProduct(e){
    var val = e.target.value;
    if (val == "" || val.length <= 2 || val.length >= 12){
      return;
    } else {
      var user = firebase.auth().currentUser;
      if (!user){
        alert("you must be logged in to do that.");
      } else {
        firebase.productName = val;
        document.getElementById("product-save").innerText = "Save";
        document.getElementById("td-money").style.visibility = 'visible';
      }
    }
  }

  function handlePrice(e){
    var val = e.target.value;
    if (val == "" || val.length >= 7){
      return;
    } else {
      var user = firebase.auth().currentUser;
      if (!user){
        alert("you must be logged in to do that.");
      } else {
        firebase.productPrice = val;
        document.getElementById("product-save").innerText = "Save";
        document.getElementById("product-save").style.visibility = 'visible';
      }
    }
  }

  function handleSave(e){

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    const post = db.collection('businesses').doc(user.uid);

    const prodName = firebase.productName;
    const prodPrice = firebase.productPrice;

    post.update({product: prodName, price: prodPrice, status: "doingBusiness"})
    .then(function(doc) {
      document.getElementById("product-save").innerText = "Product Saved";
    }).catch(function(error) {
      document.getElementById("product-save").innerText = "Save unsuccessful";
      console.log("Error getting document:", error);
    });
  }