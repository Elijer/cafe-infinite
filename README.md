# About
Firebase is a rapid development web-development tool released by google in 2018. It modularly allows for the convenient integration of a database, hosting, a testing suite, file storage, and cloud functions. If you're interested in learning more, [this is the intro](https://www.youtube.com/watch?v=9kRgVxULbag) that peaked my interest initially.

Stripe is probably the most widely-used (at least by developers) and feature-rich API for managing different kinds of payments online.

This repo is a boiler-plate I am building as I learn to integrate different Stripe features with firebase. I ultimately plan on incorporating it into another project, but as I'm new to both Stripe and Firebase, I thought I would create an isolated version that I could refer back to in the future and build upon. For one, Stripe is really useful if you're creating any kind of business online. Secondly, Firebase is looking hella powerful and Stripe is a diverse API that brings out a lot of Firebases cool features and puts them out in the open.

If you are using these two technologies together, I hope that this is a useful reference for how they integrate.

# Stripe
#### (1) Business Onboarding
Securely onboard new businesses through a link and upon return to a stripe-facing URI, save the business's ID to firestore. Stripe refers to this as "Stripe Connect" for "Standard Accounts". This project only focuses on onboarding "Standard Accounts" because Stipe requires a lot of information from the business and consequently volunteers to cover financial disputes. However, "Express Accounts" represent another option that can be used with Stripe Connect and are attractive because they require less information and have a more visually simple (and pretty) onboarding interface that would essentially make for a much faster (hence "express) and less intimidating onboarding process for potential business partners. However, Stripe does NOT assume liability for these businesses, which is why they are probably not a good choice for a budding online marketplace with limited (read "no") legal and financial staff.

### FireBase
I'm going to heavily rely on Google Firebase after being shown this tutorial:
https://www.youtube.com/watch?v=9kRgVxULbag
Which makes it look super easy. This is my first firebase project.

### Google Maps
I will be using the Google maps API, and possibly other google cloud APIs. We'll see.
