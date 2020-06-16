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
      console.log(user);
      //document.write(`Hello ${user.displayName}`);
      document.getElementById("banner-login").innerText = `${user.displayName}`;
      //use the user object for something if you want
  })
  .catch(console.log);
}

function onboardBusiness(){
  var onboardingURL;
  var state;
  onboardingURL = "https://connect.stripe.com/oauth/authorize?client_id=ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com";
  window.location.replace(onboardingURL); //Note: The difference between href and replace, is that replace() removes the URL of the current document from the document history, meaning that it is not possible to use the "back" button to navigate back to the original document.

  /*
  Customize banner: https://dashboard.stripe.com/settings/applications-->
  Page in Docs that helps create this link: https://stripe.com/docs/connect/enable-payment-acceptance-guide#step-21-add-an-authentication-buttonclient-side
  my test id // ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG
  my real id // ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH
  test URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoTC6BH4yV6X5EFdsC9mrYkZTZLdZtG&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  real URL // https://connect.stripe.com/oauth/authorize?client_id=ca_HLoT1oMFzVR7S0myFwkGwgDml51AcRxH&state={STATE_VALUE}&scope=read_write&response_type=code&stripe_user[email]=user@example.com&stripe_user[url]=example.com
  */
}