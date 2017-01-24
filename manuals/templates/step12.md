In this step, we will use Ionic 2 to get images from the device, and use them for picture messages and profile image.

## Image Picker

The first step is to add the native plugin inside `package.json`:

{{{diff_step 12.1}}}

## Meteor FS

Next, we need to add Meteor packages, so we will get the ability to upload, store and fetch images, so start with adding those packages:

  $ cd api/
  $ meteor add jalik:ufs jalik:ufs-gridfs
  
We also need to add those for the client side, so let's update the bundler config:

{{{diff_step 12.3}}}

And make sure to generate the client side bundle again (from the root directory!):

  $ cd .. 
  $ npm run meteor-client:bundle
  
## Client Side
  
So let's start with the client side, by creating a new service called `PictureService`, and implement `select` method to pick an image from the device. 
  
`UploadFS` package has this feature for the **browser**, and we just need to use it and then wrap it in a Promise in order to know when the pick is done:

For **mobile**, we need to use `ImagePicker` which fetch image from the actual device:

{{{diff_step 12.4}}}

Now import this server as a `provider`:

{{{diff_step 12.5}}}

Also, let's add a new type of message:

{{{diff_step 12.6}}}

Go back to attachment menu, and implement `sendPicture`:

{{{diff_step 12.7}}}

And bind it to the button:

{{{diff_step 12.8}}}

Now, let's implement the login to send the actual image message, starting with handling the result of the attachment menu, and then call `sendPictureMessage`:

{{{diff_step 12.9}}}

And let's create a stub method for the `upload` function we just called:

{{{diff_step 12.10}}}

## Server Side 

In the server, we need to handle the picture message and store it.

First, let's create a model for the `Picture` object, as Meteor will store it.

{{{diff_step 12.11}}}

Now, we need a package to convert and modify our images so we'll be able to create thumbnails.

`sharp` does it good, so let's add it:

  $ meteor npm install --save sharp
  
And let's create the store:
  
{{{diff_step 12.13}}}

The store is just like any collection, only it created from `GridFS`, and define it's own rules and transform methods.

Our transformation is about shrinking the image size with `sharp`. 

We also extend the store instance with a custom util method that will fetch images URL from an image selector.

And let's export if from the main collections file:

{{{diff_step 12.14}}}

Now, we will implement `upload` method, using the store we created now:

{{{diff_step 12.15}}}

We also need to make sure that `sharp` is not loaded in our client side, because it's package for server-side only. To do that, we can use Webpack configuration to ignore `sharp`:

{{{diff_step 12.16}}}

## View Picture Message

Let's add a view for our new type of message!

So let's start by displaying our `message` object as image tag:

{{{diff_step 12.17}}}

> We also bind the click event, and later implement it to display the image in full-screen.

Let's create the full-screen image viewer component:

{{{diff_step 12.18}}}

{{{diff_step 12.19}}}

{{{diff_step 12.20}}}

{{{diff_step 12.21}}}

Now implement `showMessage` and use the new component:

{{{diff_step 12.22}}}

## Profile Picture

Now, let's add the ability to set the user's profile image. Start by adding a new field called `pictureId` which we'll use to contain the id of the profile picture as it stored in the images store.

{{{diff_step 12.23}}}

Add a button for picking a new profile picture:

{{{diff_step 12.24}}}

And implement the actual image picking, upload and set it:

{{{diff_step 12.25}}}

Now, we will implement a collection hook, so after each profile update, we will remove the old image from the database:

{{{diff_step 12.26}}}

We also need to add TypeScript definition for those collection hooks:

// TODO: Replace with npm install after Eytan's PR

{{{diff_step 12.27}}}

Add the `user` publication that will publish the user data and image:

{{{diff_step 12.28}}}

Also, we need to modify our publications, and add the images data for those publications:

{{{diff_step 12.29}}}

{{{diff_step 12.30}}}

And since we touched the collection hooks events, we can implement more features using this tool - for example, the following code will remove old messages when you remove chat:

{{{diff_step 12.31}}}

Now we just need to allow updating the pictureId of the user:

{{{diff_step 12.32}}}

We also need to update our data fixtures, and use real user accounts with a real user images using the images store, so let's update those:

{{{diff_step 12.33}}}

To avoid weird errors and bugs, we need to reset our MongoDB to match the new structure:

  $ cd api/
  $ meteor reset
  
We also need to update our client side and use the new field (`pictureId`) instead of the old one:

{{{diff_step 12.34}}}

Now, let's do the same with the new chat component:

{{{diff_step 12.35}}}

{{{diff_step 12.36}}}
