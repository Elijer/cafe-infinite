document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    //console.log(app);
});

// Auth function
function googleLogin(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)

    .then(result => {
        const user = result.user;
        //document.write(`Hello ${user.displayName}`);
        document.getElementById("login-button-div").innerText = `${user.displayName}`;
        //use the user object for something if you want
        console.log(user);
    })
    .catch(console.log);
}

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}
/*
//Map Function
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 0, lng: 0},
      zoom: 3,
      styles: [{
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]  // Turn off POI.
      },
      {
        featureType: 'transit.station',
        stylers: [{ visibility: 'off' }]  // Turn off bus, train stations etc.
      }],
      disableDoubleClickZoom: true,
      streetViewControl: false,
    });
    console.log(map);
}*/