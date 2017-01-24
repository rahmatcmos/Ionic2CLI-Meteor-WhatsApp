Our next step is to add a new type of message using geolocation and Google Maps. 

## Geo Location

So let's start by getting access to the device's location by adding Cordova plugin:

{{{diff_step 11.1}}}

## Angular 2 Google Maps

Now, add Angular 2 Google Maps package:

  $ npm install --save angular2-google-maps
  
And import it into your `NgModule`, and make sure to use your API key for Google Maps ([more instructions here](https://developers.google.com/maps/documentation/javascript/get-api-key)).  

{{{diff_step 11.3}}}

## Attachment Menu

Now, let's add a new message type for location messages:

{{{diff_step 11.4}}}

We will add a menu for attachments (later we will add more types of messages), so let's create a stub component for that:

{{{diff_step 11.5}}}

And now the template and styles:

{{{diff_step 11.6}}}

{{{diff_step 11.7}}}

Add it to your `NgModule`:

{{{diff_step 11.8}}}

And let's add styles for the menu wrapper, so it will open in the correct place:

{{{diff_step 11.9}}}

Let's add a method to open this menu from `Messages` component:

{{{diff_step 11.10}}}

And bind it to click event:

{{{diff_step 11.11}}}

## Send Location

Now, let's create a new model, that represent `Location`, with lat, lng and zoom properties:

{{{diff_step 11.12}}}

Next, let's create a Component that will allow us to select the actual location using Geo Location and Google Maps:

{{{diff_step 11.13}}}

So what do we have here?

First, we create the Component and wait for the `Platform` service (part of Ionic 2) to load and ready, because we will later use one of it's features.

Next, we are running `reloadLocation` method, which uses `Geolocation` from Ionic 2 to fetch the device current location, and return it as `Observable` - we are doing it in order to fetch the initial location, and when use RxJS `interval` to reload the location again every 1 second.

So we have the location and it's updating each second, we also get from Ionic 2 the accuracy of the GPS location, and we can use this number to calculate the zoom level we need to use in our view.

Finally, we implement `sendLocation` which dismiss the view with the location fetched for the Geolocation.

Now let's add the view:

{{{diff_step 11.14}}}

We are using `sebm-google-map` to create the map, and provide `lat`, `lng` and `zoom` from the Geolocation as the center point of the map.

We also create a `sebm-google-map-marker` with the same location, to display the marker icon on the map.

Let's add CSS to make sure the map is visible:

{{{diff_step 11.15}}}

And let's import it:

{{{diff_step 11.16}}}

Now, we need to use this new `Component`, and open it from the attachment menu we created earlier:

{{{diff_step 11.17}}}

The goal is to get the location from the location message component, and the dismiss the attachment menu again with the location, so it will be available for use from the messages menu, which is the parent of the attachment menu - that way we can send it to our Meteor server.

Now bind this method to click event on the attachment menu:

{{{diff_step 11.18}}}

Now, implement `sendLocationMessage` in `Messages` page, in order to send the actual message using the Meteor method, we will use the new message type we created, and create a string representation for our picked location.

{{{diff_step 11.19}}}

In the server side, we need allow this new message type:

{{{diff_step 11.20}}}

## View Location Message

Our next step is to view those location message in `Messages` page. 

We will use the same implementation for the map, but this time, we get the location for `message` object:

{{{diff_step 11.21}}}

And implement `getLocation` method, that converts our string representation into a `Location` object:

{{{diff_step 11.22}}}

Now add some styles to make sure the map looks good:

{{{diff_step 11.23}}}
