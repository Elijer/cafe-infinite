if (window.location.hostname === "localhost") {
    var scriptPath = "http://js.stripe.com/v3/";
} else {
    var scriptPath = "https://js.stripe.com/v3/";
}

var ele = document.createElement("script");
ele.setAttribute("src", scriptPath);
document.head.appendChild(ele);

