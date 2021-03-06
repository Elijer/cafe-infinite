# About
This repo is a live demo of Stripe's payment API to register the bank info of businesses and then pay them with card transactions. [Check it out here](https://firestripe-boilerplate.web.app/).

This project is capable of making real transactions with credit cards and bank data, but I have it set in test mode because it is only intended as a boilerplate. Stripe has a very robust set of testing tools that mimic the actual transactions in almost very way, allowing you to see the test transactions from the console. It's really cool. They even have a CLI that allows you to test your webhooks on the backend by sending test events to your server.

**Firebase**: A rapid development web-development tool released by google in 2018. It modularly allows for the convenient integration of a database, hosting, a testing suite, file storage, and cloud functions. If you're interested in learning more, [this is the intro](https://www.youtube.com/watch?v=9kRgVxULbag) that peaked my interest initially.

**Stripe**: Probably the most widely-used API for managing different kinds of payments online. Useful for entrepreneurs building web marketplaces or platforms.

### Table of Contents
- [Stripe](#stripe)
    + [Signing Up](#signing-up)
    + [Business Onboarding](#business-onboarding)
    + [Accept a Payment](#accept-a-payment)
    + [Using Webhooks](#using-webhooks)
    + [Dev Tips](#dev-tips)
- [FireBase](#firebase)
    + [Getting Started](#getting-started)
    + [Using the Emulators](#using-the-emulators)
        
*Table of contents generated with markdown-toc:* [check it out](http://ecotrust-canada.github.io/markdown-toc/)

<br/><br/>

# Stripe
### Signing Up
* create a stripe account at stripe.com
* Fill out the Platform Profile, which will allow you to move forward with both testing stripe connect AND give you recommenation of what stripe Connect Connected Account type you'll want to use: Standard, Express, Or Custom (I'm using Standard in this repo, as I said above).
* Begin exploring the Stripe website, which is pretty elaborate
* In particular, begin exploring the stripe docs at [stripe.com/docs](https://stripe.com/docs), which are also intimidating, but are pretty impressively organized once you get used to them.

### Business Onboarding (with Stripe Connect: Standard Accounts)
This is a part of the process of accepting direct payments [as outlined here on the stripe docs](https://stripe.com/docs/connect/enable-payment-acceptance-guide)
Securely onboard new businesses through a link and upon return to a stripe-facing URI, save the business's ID to firestore. Stripe refers to this as "Stripe Connect" for "Standard Accounts". This project only focuses on onboarding "Standard Accounts" because Stipe requires a lot of information from the business and consequently volunteers to cover financial disputes. However, "Express Accounts" represent another option that can be used with Stripe Connect and are attractive because they require less information and have a more visually simple (and pretty) onboarding interface that would essentially make for a much faster (hence "express) and less intimidating onboarding process for potential business partners. However, Stripe does NOT assume liability for these businesses, which is why they are probably not a good choice for a budding online marketplace with limited (read "no") legal and financial staff.

### Accept a Payment
This is a continuation of accepting direct payments, [also outlined here on the stripe docs](https://stripe.com/docs/connect/enable-payment-acceptance-guide).
This is how, once you have connected businesses, you can collect the card information of customers and send their money to the connected businesses.

1. **Generate a PaymentIntent object on the server** (using the stripe API), which includes the price and the Connected Account ID that is being paid. You can also specify a 'processing fee' here, which goes to you.

1. **A 'client secret' from the PaymentIntent is returned to the client** (to show proof that a valid PaymentIntent object exists to be used)

1. **Collect Card details** using 'Stripe Elements', a library of UI elements that you can use to easily collect the user info you need to make accept a stripe payment (card number, zip code, security code, etc.)

1. **Set up an error handler** that tells you if something goes wrong with user info input

1. **Submit the payment to Stripe** (still on the client). Take all the user info you collected AND the 'client secret' from before to send in the payment! <br/>

1. **Set up a webhook to 'catch' successful payments** so that you can process them yourself. Log them to the database, maybe show them in the billing info on your Business Interface, etc. <br/>

#### Explain it like I'm 12:
* Generate a PaymentIntent object with a client_secret field
* pass client_secret to client
* collect card # and stuff
* send card number to stripe along with client secret
* recieve a success or error response
* meanwhile, set up webhook endpoints on your server to listen for successful payments so that you can do stuff with them.

##### Pain Points:
* The boilerplate code I used from stripe to do all of this logged errors perfectly and even has a [great guide for reading those errors here](https://stripe.com/docs/error-codes). However, the boilerplate code doesn't display any 'success' messages by default.
* While in the server, you initialize stripe using your **Secret Key** (your **Test Secret Key** while you are testing) through a require only **once**, you will probably want to initialize your stripe object at the top of **every function** in your client code, and NOT at the top of the page. For your **Accept a Payment** function, whatever you write, you must initialize Stripe **with** the **Connected Account ID** you are using, like this:
````
    var stripe = Stripe('pk_test_**********************************', {
      stripeAccount: '{{The Stripe Connected Account ID for whatever business your are sending money to goes here}}'
    });
````

* Additionally, make sure you are passing that **Stripe Connected Account ID** your server function that generates the PaymentIntent, as you *also* need that ID in order to construct the PaymentIntent object through stripe:
````
  const paymentIntent = await stripe.paymentIntents.create({ //https://www.youtube.com/watch?v=vn3tm0quoqE
      payment_method_types: ['card'],
      amount: 1000,
      currency: 'usd',
      application_fee_amount: 123,
    }, {
      stripeAccount: '{{The Stripe Connected Account ID for whatever business your are sending money to goes here}}'
    })
````
* I had trouble installing the [stripe CLI](https://stripe.com/docs/stripe-cli#install) for endpoint webhook testing. Stripe allows you to donwload the stripe CLI with homebrew or directly. I also found ways to supposedly do so with npm or yarn. None of those worked though (I had an issue with installing homebrew -- hopefully you already have it.) What I ended up doing was download the stripe CLI file for MacOS directly, unzipping it, and then pasting it into my usr/local/bin by going to finder and using the hotkeys shift+command+g and pasting it there. After that, the `stripe` keyword worked from my path and I used `stripe login` to get started.

### Using Webhooks
At this point I'm beginning to set up environmental variables for firebase.
This is [stripes page about webhooks](https://stripe.com/docs/payments/handling-payment-events)
And this is a bomb [walkthrough for using them with firebase](https://medium.com/@GaryHarrower/working-with-stripe-webhooks-firebase-cloud-functions-5366c206c6c)

### Dev Tips
* If you are logged in, the code snippets in the docs include your various api keys automatically in them, so you can just copy and paste them
* If you actually want to use stripe, you need to get your Connect Account authorized by stripe by sending in a Platform Profile. Hypothetically, stripe can reject this, so it might be a good idea to get it accepted before continuing on with development.
* Stripe offers many products. Connect is just one of them. If you are interested in creating a store just for yourself, Connect is far more elaborate than you need. Or if you want to make it easy for people to donate to you, Paypal or Patreon could easily be better options.
<br/><br/>

# FireBase
If you're new to firebase, [watch this tutorial by the amazing youtuber Fireship](https://www.youtube.com/watch?v=9kRgVxULbag) and then [get acquainted with the docs here](https://firebase.google.com/docs). I set up my first few projects by watching the Fireship video above, but also referenced [this page in the docs](https://firebase.google.com/docs/web/setup), which is a bit confusing. You'll be using the CLI (command line tools) heavily to use firebase. [Here is a link if you have any questions about the firebase CLI tools](https://firebase.google.com/docs/cli#mac-linux-npm). I've added my own list of steps below that hopefully simplify the process further:

### Getting Started
1. Go to firebase.com, log in with a google acount, and create a firebase project.
1. Download Node.js on your machine
1. Create empty directory on your computer and name it the same as the project you created on firebase.com
1. Navigate to that directory with your terminal
1. Download firebase command line tools by running: `npm install firebase-tools` -g (in your terminal/console)
1. run: `firebase init` from the directory you created on your computer
1. This is not a full guide of the options that will come up in your console, but are not complicated. Select the project you created from the list (if you only have one project, there will obviously only be one)
1. you might have to run: `firebase login` first.
1. To serve app locally: `firebase serve` (you’ll find it on localhost:5000)
1. To deploy it to the inter webs, run `firebase deploy`. This will give you back a live URL

##### General Pain Points
* You're getting `npm WARN enoent ENOENT: no such file or directory`. Are you in the ``function`` folder of your firebase project? Cause you should be.

### Using the Emulators
By running ```firebase serve``` in your app, you can run your app locally, which is awesome. It runs fast. However, firebase has an even more powerful tool at your disposal for full local testing, from firestore to cloud functions. It's called the emulators suite.

[**Here's is a google code lab**](https://google.dev/pathways/firebase-emulators) to learn how to use it correctly. Tips: when it says 'use default', it means actually type out 'default', not your project ID. It doesn't matter what project you use.

In order to direct the code in your public folder to talk to firestore emulator and/or the functions emulator instead of the REAL firestore or the REAL functions, add this block in:

````
  if (window.location.hostname === "localhost") {
    firebase.functions().useFunctionsEmulator("http://localhost:5001"); //enforces functions to run through functions emulator
    console.log("localhost detected!");
    db.settings({ //directs firestore to run through firestore emulator
      host: "localhost:8080",
      ssl: false
    });
  }
````
It should live inside of whatever codes when your doc loads. Make sure it is after wherever you load your app, db and functions.

##### Other Links
* [Install, configure and integrate Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure?authuser=0)
* [Run Functions Locally](https://firebase.google.com/docs/functions/local-emulator)
* Run Firestore locally ---- Haven't found a link for this yet.

##### Pain Points
* Make absolute sure that your JAVA Developer Kit (JDK) [is fully updated or the emulator suite won't work.](https://stackoverflow.com/questions/56819840/firebase-cloud-functions-emulator-throws-exited-with-code-1-error) The short way to check this is 
* You should probably make sure your Firebase CLI tools are up to date for good measure. Useful commands: `firebase --version`, `npm install firebase-tools`
<br/><br/>
