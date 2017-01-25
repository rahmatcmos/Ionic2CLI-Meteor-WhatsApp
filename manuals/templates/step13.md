So in this step, we will focus on editing more native device features, provided by Ionic 2 API. 

## Phone Number and SIM

Ionic 2 expose access to the SIM card the the current active phone number - we will use this number and set it as the initial value for the login page.

So let's start by getting access to the SIM card, and fetch the phone number:

{{{diff_step 13.1}}}

And now use the new method inside the `Login` page:

{{{diff_step 13.2}}}

We also need to add the required Cordova plugin:

{{{diff_step 13.3}}}


## Camera

Next - we will get access to the device's camera and send the taken images.

Start by adding the required Cordova plugin to access the camera:

{{{diff_step 13.4}}}

And bind click event in attachment menu:

{{{diff_step 13.5}}}

And implement this method using `Camera` util of Ionic:

{{{diff_step 13.6}}}

> We use the same API for uploading image, which we used in the previous step, and just upload it as-is.
