/* >>>>Problem fixed 1.5: Okay I am running a firebase.checkComplete bool that checks to see if
a check for user persistence has been run. If it has, this global variable is set to false, and
the check isn't run again. Probably not the absolute way to do things, but it works.
*/

/* >>>>CURRENT PROBLEM 1.4: Hmm. Okay created nice validation for whether, IF there
is a user already in the browser, to check whether there are any docs in the database.
Unfortunately, it checks this WHENEVER there is an auth change, which includes signing in,
so it automatically signs people out immediately after they sign in as well, even though
it works beautiful for if they are already signed in.
*/

/* >>>>CURRENT PROBLEM 1.3: Okay! identified and fixed the problem. However, I really should
still do the following:
1) Check if current user exists in the database and if it doesn't, log user out
*/

/* >>>>CURRENT PROBLEM 1.2: WOOH. Found the specific problem. I found a time when the 
hash generated on the server is only 10 characters, not 11. Since I hardcoded
the extraction to be for 11 characters, this is a problem.
A problem that really can be avoided in many ways, especially now that
I'm finding that the browser DOES store the user IN the browser but.
Honestly, my way might be better. Well, it WORKS better. Is it more secure? Not sure.
The most secure thing would, I guess, be to ALSO look at the browser, cross-referenced
the returned UID and make sure it's all kosher. That might be too secure. So here are my
options for solutions
1) Make the hash the same number of characters every time
2) Use a dynamic number to cut with by getting length of the state in firestore
3) doing both 1 and 2 just in cas
4) Making a hash generously too long to begin with and cutting it at a hard-coded point
5) 
*/

/* >>>>CURRENT PROBLEM 1.1: Okay! Everything seems to work well as long as the database
and browser are in sync. If the database is purged manually or the emulators are stopped
though, well, there's still a bullet (user) in the chamber (the browser).
And that's ALMOST okay, because there SHOULD be firestore data for anyone in 
the browser 85% of the time in a production setting. But nope. Gotta fix it.
1) Most superficially, the extraction of the UID from the STATE doesn't quite work in this case
2) This should be prevented to begin with by checking to see if there even IS firebase data
for the current UID. If there isn't, either
  a) It should be created
  b) The user should be logged out and any incomplete data destroyed.

I should also just be thinking about how the health of this data is assessed in general.
Is it everytime someone logs in? Everytime they log out? Probably a bit of both.
*/

/* >>>>CURRENT PROBLEM 1.0: Really just the overall flow of creating a business ID
has no control. At one point, I could keep going in for one ID and logging business
Id after business ID (they're all the same, but I'll get to that) to no avail!
The firebase doc that was supposed to be logged to never got it for some reason.
I think. And then sometimes, the id gets added no problem and when you try
again it shuts you down with the message I recently made, "biz id already exists",
so that works well but. Only sometimes. 
And it still doesn't answer the question of, where does this other UID come from
that's used to create these stray firestore documents? Is it possible firebase AUTH
is somehow keeping a couple UIDs alive at a time and using them at random? I don't know yet,
but I think that even if I did fix THIS problem, it wouldn't solve the bigger problem
that I barely have any validation for the coordination of the OATH and firestore. There
need to be more checks in place here.
To fix it, don't just add MORE checks and stuff. You should also look more carefully at
the code you have.

Also, side note; when a UID is already in the browser, the code to format the login
button accordingly should be reused in a function called both at the end of the doc.load
event AND in the anonLogin.

Plus, you should have a plan for the login stuff, right? I guess if it's just
firestripe, both options -- google AND anon should work. But anon should probably work
pretty automatically. That's the point.
"*/