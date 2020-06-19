document.addEventListener("DOMContentLoaded", event => {
  const app = firebase.app();
  const db = firebase.firestore();
  var stripe = Stripe('pk_test_FjTxRNal2FWcwhlqw0WtIETQ00ZDxO3D9S');  
});

function createState(){
  console.log("state Created");
}

function googleLogin(){
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
  .then(result => {
      const user = result.user;
      //console.log(user);
      //document.write(`Hello ${user.displayName}`);
      document.getElementById("banner-login").innerText = `${user.displayName}`;
      //use the user object for something if you want
      //console.log(user.displayName);

      //top one id = AIzaSyD3cl1hLrxS7EVLJHkGj0fpwNROOrsOcI0
      //nope id is this I guess = H7EOGhnQW5fkOWY8lXmKUpEbjRk1
      //and the other id is cJuXijzikvZWfVzdGnKHlCjdGUh1
      console.log("email is " + user.email);
      console.log("photo URL is " + user.photoURL)
      console.log("id is " + user.uid)
      console.log("Display name is " + user.displayName)

      //let id = db.collection('businesses').doc('user.uid').set(data);

      const db = firebase.firestore();
      const usersRef = db.collection('businesses').doc(user.uid);

      usersRef.get()
        .then((docSnapshot) => {
          //you can make it so that if it doesn't exist, you add a login time. Idk why exactly I'd need that,
          //but it's something to do.
          if (!docSnapshot.exists) {
            let data = {
              name: user.displayName,
              email: user.email,
              profilePic: user.photoURL,
              createdAt: new Date()
            };
            usersRef.set(data) // create the document
          }
      });

  })
  .catch(console.log);
}

function onboardBusiness(){
  var onboardingURL;
  var firstChunk = "https://connect.stripe.com/oauth/authorize?client_id=ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG&state=";
  var secondChunk = "&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com";
  var state = "23823948qfnadgba8sas";
  onboardingURL = firstChunk + state + secondChunk;
  window.location.replace(onboardingURL); //Note: The difference between href and replace, is that replace() removes the URL of the current document from the document history, meaning that it is not possible to use the "back" button to navigate back to the original document.
}








  /*
  Customize banner: https://dashboard.stripe.com/settings/applications-->
  Page in Docs that helps create this link: https://stripe.com/docs/connect/enable-payment-acceptance-guide#step-21-add-an-authentication-buttonclient-side
  my test id // ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG
  my real id // ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH
  test URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  real URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  */