document.addEventListener("DOMContentLoaded", event => {
<<<<<<< HEAD
    const app = firebase.app();
    const db = firebase.firestore();

    //const products = db.collection('products').doc('HzTEK6EP0ekwxeSVwx1n');

    //console.log(app);
    
    /*products.get()                //get a single product
      .then(doc => {
        const data = doc.data();
        console.log(data.name);
      })*/

      /*products.onSnapshot(doc => { //get a single product whenever db changes. also does this when app loads, unfortunately. It probably does this because it's still loading though, soooo if I just move it maybe it will act differently
        const data = doc.data();
        newElement(data.name);
        //document.write(data.name + `<br>`);
      })*/



      const productsRef = db.collection('products');
      const query = productsRef.where('price', '<', 10); // where is a db qeury. here it's saying, get all products with a price that is less than 10
      //const query = productsRef.where('price', '==', 10); // where is a db qeury. here it's saying, get all products with a price that is less than 10
      //const query = productsRef.orderBy('price', 'desc'); //change order
      //const query = productsRef.orderBy('price', 'desc').limit(1); //caps the number of documents that come back in the array.

      //

      
      console.log({query});
      query.get()
        .then(products => {
          products.forEach(doc => {
            data = doc.data()
            newElement(data.name + " at $" + data.price);
          })
        })
=======
  const app = firebase.app();
  const db = firebase.firestore();
  var functions = firebase.functions();
  //do I need to 'require' any of these?
  var stripe = Stripe('pk_test_FjTxRNal2FWcwhlqw0WtIETQ00ZDxO3D9S');  
  document.getElementById("banner-login").innerText = "login";
>>>>>>> cc63b24b33a9f56da84f89e8a7547387840d8360
});

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