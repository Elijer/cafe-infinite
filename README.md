# About
Firebase is a rapid development web-development tool released by google in 2018. It modularly allows for the convenient integration of a database, hosting, a testing suite, file storage, and cloud functions. If you're interested in learning more, [this is the intro](https://www.youtube.com/watch?v=9kRgVxULbag) that peaked my interest initially.

Stripe is probably the most widely-used (at least by developers) and feature-rich API for managing different kinds of payments online.

This repo is a boiler-plate I am building as I learn to integrate different Stripe features with firebase. I ultimately plan on incorporating it into another project, but as I'm new to both Stripe and Firebase, I thought I would create an isolated version that I could refer back to in the future and build upon. For one, Stripe is really useful if you're creating any kind of business online. Secondly, Firebase is looking hella powerful and Stripe is a diverse API that brings out a lot of Firebases cool features and puts them out in the open.

If you are using these two technologies together, I hope that this is a useful reference for how they integrate.
<br/><br/>

# Stripe
#### (0) Signing Up
To sign up for a stripe account, create a stripe account. Then create a stripe connect account and fill out the Platform Profile, which will allow you to move forward with both testing stripe connect AND give you recommenation of what stripe Connect Connected Account type you'll want to use: Standard, Express, Or Custom (I'm using Standard in this repo, as I said above). 

#### (1) Business Onboarding
This is a part of the process of accepting direct payments [as outlined here on the stripe docs](https://stripe.com/docs/connect/enable-payment-acceptance-guide)
Securely onboard new businesses through a link and upon return to a stripe-facing URI, save the business's ID to firestore. Stripe refers to this as "Stripe Connect" for "Standard Accounts". This project only focuses on onboarding "Standard Accounts" because Stipe requires a lot of information from the business and consequently volunteers to cover financial disputes. However, "Express Accounts" represent another option that can be used with Stripe Connect and are attractive because they require less information and have a more visually simple (and pretty) onboarding interface that would essentially make for a much faster (hence "express) and less intimidating onboarding process for potential business partners. However, Stripe does NOT assume liability for these businesses, which is why they are probably not a good choice for a budding online marketplace with limited (read "no") legal and financial staff.

#### (2) Accept a Payment
This is a continuation of accepting direct payments, [also outlined here on the stripe docs](https://stripe.com/docs/connect/enable-payment-acceptance-guide). I haven't gotten here yet.
<br/><br/>

# FireBase
If you're new to firebase, [watch this tutorial by the amazing youtuber Fireship](https://www.youtube.com/watch?v=9kRgVxULbag) and then [get acquainted with the docs here](https://firebase.google.com/docs). I set up my first few projects by watching the Fireship video above, but also referenced [this page in the docs](https://firebase.google.com/docs/web/setup), which is a bit confusing. You'll be using the CLI (command line tools) heavily to use firebase. [Here is a link if you have any questions about the firebase CLI tools](https://firebase.google.com/docs/cli#mac-linux-npm). I've added my own list of steps below that hopefully simplify the process further:

### Getting Started
(2) Go to firebase.com, log in with a google acount, and create a firebase project.
(1) Download Node.js on your machine
(3) Create empty directory on your computer and name it the same as the project you created on firebase.com
(4) Navigate to that directory with your terminal
(4) Download firebase command line tools by running: `npm install firebase-tools` -g (in your terminal/console)
(5) run: `firebase init` from the directory you created on your computer
(6) This is not a full guide of the options that will come up in your console, but are not complicated. Select the project you created from the list (if you only have one project, there will obviously only be one)
(7) you might have to run: `firebase login` first.
(8) To serve app locally: `firebase serve` (you’ll find it on localhost:5000)
(9) To deploy it to the inter webs, run `firebase deploy`. This will give you back a live URL

#### Paint Points
(1) If you're getting this error from NPM: pm WARN enoent ENOENT: no such file or directory, it's because you're trying to run NPM functions from the `functions` directory in your firebase project. Switch up to the main Firebase Directory. If that's not it, [try this](https://github.com/visionmedia/debug/issues/261) 

### Setting up Emulators for Firebase
By running `firebase serve` in your app, you can run your app locally, which is awesome. It runs fast. However, firebase has an even more powerful tool at your disposal for full local testing, from firestore to cloud functions. It's called the emulators suite. I'm still figuring it out.

### Reading
#### (1) [Google.Dev? What is this?](https://google.dev/pathways/firebase-emulators)
#### (2) [Install, configure and integrate Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure?authuser=0)
#### (3) [Run Functions Locally](https://firebase.google.com/docs/functions/local-emulator)
#### (4) Run Firestore locally ---- Haven't found a link for this yet.

#### Commands
`firebase emulators:start`

#### Notes
* `localhost:500` is still the default address for your index.html to run
* `localhost:900` is the default emulator suite dashboard port

#### Pain Points
(1) Make absolute sure that your JAVA Developer Kit (JDK) [is fully updated or the emulator suite won't work.](https://stackoverflow.com/questions/56819840/firebase-cloud-functions-emulator-throws-exited-with-code-1-error) The short way to check this is 
(2) You should probably make sure your Firebase CLI tools are up to date for good measure. Useful commands: `firebase --version`, `npm install firebase-tools`
<br/><br/>

### Google Maps
I will be using the Google maps API, and possibly other google cloud APIs. We'll see.
