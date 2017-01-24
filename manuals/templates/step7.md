## Configure Meteor Accounts

In this step we will authenticate and identify users in our app.

Before we go ahead and start extending our app, we will add a few packages which will make our lives a bit less complex when it comes to authentication and users management.

First we will update our Meteor server and add few Meteor packages called `accounts-base` and `accounts-phone` which will give us the ability to verify a user using an SMS code, so run the following inside `api` directory:

  $ cd api/
  $ meteor add accounts-base
  $ meteor add npm-bcrypt
  $ meteor add mys:accounts-phone

Now, we need to make sure that Meteor accounts package are also available on our client side, which get its Meteor abilities from the bundler configured earlier.

So let's config it again, and add the packages we need, and the exports we need in our client side:

{{{diff_step 7.2}}}

Now, we need to make sure that our bundle in up-to-date with those packages, so lets run it again, in our root directory:

  $ cd ..
  $ npm run meteor-client:bundle

For the sake of debugging we gonna write an authentication settings file (`api/private/settings.json`) which might make our life easier, but once your'e in production mode you *shouldn't* use this configuration:

{{{diff_step 7.3}}}

Now anytime we run our app we should provide it with a `settings.json`:

  $ cd api/
  $ meteor run --settings private/settings.json

To make it simpler we can add `start` script to `package.json`:

{{{diff_step 7.4}}}

> *NOTE*: If you would like to test the verification with a real phone number, `accounts-phone` provides an easy access for [twilio's API](https://www.twilio.com/), for more information see [accounts-phone's repo](https://github.com/okland/accounts-phone).

We will now apply the settings file we've just created so it can actually take effect:

{{{diff_step 7.5}}}

We also need to make sure we have the correct Typings for the TypeScript compiler, which matches Meteor's accounts package, so let's install it (from the root directory):

  $ cd ..
  $ npm install --save-dev @types/meteor-accounts-phone

And tell TypeScript compiler to use it when compiling our files:

{{{diff_step 7.7}}}

## Use Meteor Accounts

Now, we will use the meteor account in our client side, our first use will be to delay our app bootstrap phase, until Meteor accounts system has done it's initialization.

Meteor accounts exposes a method called `loggingIn` which indicates if the authorization flow is done, so we will use it, and bootstrap our Angular 2 application only when it's done. We are doing it because we want to make sure that we know it there is a user logged in or not.

{{{diff_step 7.8}}}

> The logic waits to Meteor to trigger it's autorun, then checks `loggingIn` flag, and only when it's done, the `bootstrapModule` or Angular 2 is executed.

Great, now that we're set, let's start implementing the auth views!

## UI

For authentication we gonna create the following flow in our app:

- login - The initial page. Ask for the user's phone number.
- verification - Verify a user's phone number by an SMS authentication.
- profile - Ask a user to pickup its name. Afterwards he will be promoted to the tabs page.

Let's start by creating the `LoginComponent`. In this component we will request an SMS verification right after a phone number has been entered:

{{{diff_step 7.9}}}

> We use a service called `PhoneService` - don't worry, we will implement in soon!

The `onInputKeypress` handler is used to detect key press events. 

Once we press the login button, the `login` method is called and shows and alert dialog to confirm the action (See [reference](http://ionicframework.com/docs/v2/components/#alert)). If an error has occurred, the `handlerError` method is called and shows an alert dialog with the received error. If everything went as expected the `handleLogin` method is called. It requests for an SMS verification using `Accounts.requestPhoneVerification`, and promotes us to the verification view.

Hopefully that the component's logic is clear now, let's move to the template:

{{{diff_step 7.10}}}

And add some style into it:

{{{diff_step 7.11}}}

As usual, newly created components should be imported in the app's module:

{{{diff_step 7.12}}}

Now let's add the ability to identify which page should be loaded - the chats page or the login page:

{{{diff_step 7.13}}}

Let's proceed and implement the verification page. We will start by creating its component, called `VerificationComponent`:

Now, we will create a service called `PhoneService` which combine the logic related to phone validation, so let's create this service:

{{{diff_step 7.14}}}

> `verify` method uses Meteor accounts package, to validate and user with SMS message.

And we also need to declare this service as `provider` in our `NgModule`:

{{{diff_step 7.15}}}

Now that we use Meteor accounts features in our client side, we also need to make sure that the TypeScript compiler know this package, so let's import it into the typescript config file:

{{{diff_step 7.16}}}

Let's continue to our `VerificationPage`.

Logic is pretty much the same as in the login component.

{{{diff_step 7.17}}}

{{{diff_step 7.18}}}

{{{diff_step 7.19}}}

And add it to the NgModule:

{{{diff_step 7.20}}}

And now let's implement `login` method, which we used in `VerificationPage` to login our user with his phone number and code:

{{{diff_step 7.21}}}

And now that we have the `VerificationComponent` we can use it inside the `LoginComponent`:

{{{diff_step 7.22}}}

Last step of our authentication pattern is to pickup a name. We will create a `Profile` interface so the compiler can recognize profile-data structures:

{{{diff_step 7.23}}}

And let's create the `ProfileComponent`:

{{{diff_step 7.24}}}

{{{diff_step 7.25}}}

{{{diff_step 7.26}}}

Now let's use it inside our `VerificationPage`, because we want to redirect to the profile page after a sucessfull login:

{{{diff_step 7.27}}}

Don't forget to import in into the `NgModule`:

{{{diff_step 7.28 }}}

The `ProfileComponent` logic is simple. We call the `updateProfile` method and redirect the user to the `TabsPage` if the action succeeded. 

The `updateProfile` method should look like so:

{{{diff_step 7.29}}}

If you'll take a look at the constructor's logic of the `ProfileComponent` we set the default profile picture to be one of ionicon's svgs. We need to make sure there is an access point available through the network to that asset. If we'd like to serve files as-is we simply gonna add them to the `www` dir. But first we'll need to update our `.gitignore` file to contain the upcoming changes:

// TODO: Fix this issue somewhere

Our authentication flow is complete! However there are some few adjustments we need to make before we proceed to the next step. 

For the messaging system, each message should have an owner. If a user is logged-in a message document should be inserted with an additional `senderId` field:

{{{diff_step 7.30}}}

{{{diff_step 7.31}}}

We can determine message ownership inside the component:

{{{diff_step 7.32}}}

## Chat Options Menu

Now we're going to add the abilities to log-out and edit our profile as well, which are going to be presented to us using a popover. Let's show a [popover](http://ionicframework.com/docs/v2/components/#popovers) any time we press on the options icon in the top right corner of the chats view.

A popover, just like a page in our app, consists of a component, view, and style:

{{{diff_step 7.33}}}

{{{diff_step 7.34}}}

{{{diff_step 7.35}}}

And import it:

{{{diff_step 7.36}}}

And because we have a logout feature now, let's implement it's logic in `PhoneService`:

{{{diff_step 7.37}}}

Now let's use it inside the `ChatsPage`:

{{{diff_step 7.38}}}

And let's add an event handler in the view which will show the popover:

{{{diff_step 7.39}}}

As for now, once you click on the options icon in the chats view, the popover should appear in the middle of the screen. To fix it, we simply gonna edit the `scss` file of the chats page:

{{{diff_step 7.40}}}
