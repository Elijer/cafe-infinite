# About
This repo is a boiler-plate I am building as I learn to integrate different Stripe features with firebase. I ultimately plan on incorporating it into another project, but as I'm new to both Stripe and Firebase, I thought I would create an isolated version that I could refer back to in the future and build upon. For one, Stripe is really useful if you're creating any kind of business online. Secondly, Firebase is looking hella powerful and Stripe is a diverse API that brings out a lot of Firebases cool features and puts them out in the open. If you are using these two technologies together, I hope that this is a useful reference for how they integrate.

* **Firebase**: A rapid development web-development tool released by google in 2018. It modularly allows for the convenient integration of a database, hosting, a testing suite, file storage, and cloud functions. If you're interested in learning more, [this is the intro](https://www.youtube.com/watch?v=9kRgVxULbag) that peaked my interest initially.

* **Stripe** is probably the most widely-used (at least by developers) and feature-rich API for managing different kinds of payments online.
<br/><br/>

# Stripe
### Signing Up
* create a stripe account at stripe.com
* Fill out the Platform Profile, which will allow you to move forward with both testing stripe connect AND give you recommenation of what stripe Connect Connected Account type you'll want to use: Standard, Express, Or Custom (I'm using Standard in this repo, as I said above).
* Begin exploring the Stripe website, which is pretty elaborate
* In particular, begin exploring the stripe docs at [stripe.com/docs](https://stripe.com/docs), which are also intimidating, but are pretty impressively organized once you get used to them.
<br/>

### Business Onboarding
This is a part of the process of accepting direct payments [as outlined here on the stripe docs](https://stripe.com/docs/connect/enable-payment-acceptance-guide)
Securely onboard new businesses through a link and upon return to a stripe-facing URI, save the business's ID to firestore. Stripe refers to this as "Stripe Connect" for "Standard Accounts". This project only focuses on onboarding "Standard Accounts" because Stipe requires a lot of information from the business and consequently volunteers to cover financial disputes. However, "Express Accounts" represent another option that can be used with Stripe Connect and are attractive because they require less information and have a more visually simple (and pretty) onboarding interface that would essentially make for a much faster (hence "express) and less intimidating onboarding process for potential business partners. However, Stripe does NOT assume liability for these businesses, which is why they are probably not a good choice for a budding online marketplace with limited (read "no") legal and financial staff.
<br/>

### Accept a Payment
This is a continuation of accepting direct payments, [also outlined here on the stripe docs](https://stripe.com/docs/connect/enable-payment-acceptance-guide). I haven't gotten here yet.
<br/>

### Tips
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
</br>

### Setting up Emulators
By running ```firebase serve``` in your app, you can run your app locally, which is awesome. It runs fast. However, firebase has an even more powerful tool at your disposal for full local testing, from firestore to cloud functions. It's called the emulators suite. I'm still figuring it out.

* [Google.Dev? What is this?](https://google.dev/pathways/firebase-emulators)
* [Install, configure and integrate Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure?authuser=0)
* [Run Functions Locally](https://firebase.google.com/docs/functions/local-emulator)
* Run Firestore locally ---- Haven't found a link for this yet.

##### Pain Points
* Make absolute sure that your JAVA Developer Kit (JDK) [is fully updated or the emulator suite won't work.](https://stackoverflow.com/questions/56819840/firebase-cloud-functions-emulator-throws-exited-with-code-1-error) The short way to check this is 
* You should probably make sure your Firebase CLI tools are up to date for good measure. Useful commands: `firebase --version`, `npm install firebase-tools`
<br/><br/>
