# Meteor Server

Now that we have the initial chats layout and its component, we will take it a step further by providing the chats data from a server instead of having it locally. In this step we will be implementing the API server and we will do so using Meteor.

First make sure that you have Meteor installed. If not, install it by typing the following command:

    $ curl https://install.meteor.com/ | sh

We will start by creating the Meteor project which will be placed inside the `api` dir:

    $ meteor create api
    $ cd api/

> **NOTE:** Despite our decision to stick to Ionic's CLI, there is no other way to create a proper Meteor project except for using its CLI.

A Meteor project will contain the following dirs by default:

- client - A dir containing all client scripts.
- server - A dir containing all server scripts.

Let's start by removing the client side from the base Meteor project, because we will write only server side code in the `api` project.

These scripts should be loaded automatically by their alphabetic order on their belonging platform, e.g. a script defined under the client dir should be loaded by Meteor only on the client. A script defined in neither of these folders should be loaded on both. Since we're using Ionic's CLI for the client code we have no need in the client dir in the Meteor project. Let's get rid of it:

    $ rm -rf client

We also want to make sure that node modules are accessible from both client and server, and to fulfill it, we will need to remove the server's `package.json` (`api/package.json`):

    $ rm package.json

Now that we share the same resource there is no need in two `package.json` dependencies specifications, so we can just remove it:

And we gonna create a symbolic link in the `api` dir which will reference to the project's root node modules:

    $ ln -s ../node_modules

Since we will be writing our app using Typescript also in the server side, we will need to support it in our Meteor project as well, especially when the client and the server share some of the script files. To add this support let's add the following package to our Meteor project:

    $ meteor add barbatus:typescript

We will also need to add a configuration file for the TypeScript compiler in the Meteor server, which is based on our Ionic app's config:

{{{diff_step 4.6}}}

Because we use TypeScript, let's change the main server file extension from `.js` to `.ts`:

    $ mv server/main.js server/main.ts

Now we will need to create a symbolic link to the declaration file located in `src/declarations.d.ts`. This way we can share external TypeScript declarations in both client and server. To create the desired symbolic link, simply type the following command in the command line:

    $ ln -s ../src/declarations.d.ts

The following dependencies are required to be installed so our server can function properly:

    $ npm install --save babel-runtime
    $ npm install --save meteor-node-stubs

Now we'll have to move our models interfaces to the `api` dir so the server will have access to them as well:

    $ mv src/models.ts api/server/models.ts

This requires us to update its reference in the declarations file as well:

{{{diff_step 4.11}}}

Now, we are going to use `meteor-rxjs` to declare our collections and data streams, so let's add this package:

    $ npm install --save meteor-rxjs

## Collections

In Meteor, we keep data inside `MongoObservable.Collection`.

This collection is actually a reference to a [MongoDB](http://mongodb.com) collection, and it is provided to us by a Meteor package called [Minimongo](https://guide.meteor.com/collections.html), and it shares almost the same API as a native MongoDB collection. In this tutorial we will be wrapping our collections using RxJS's `Observables`, which is available to us thanks to [meteor-rxjs](http://npmjs.com/package/meteor-rxjs).

Let's create a chats and messages collection, which will be used to store data related to newly created chats and written messages:

{{{diff_step 4.13}}}

{{{diff_step 4.14}}}

Now, let's create `index.ts` file, that will export all of the collections together, so it will be easier to use in the client side:

{{{diff_step 4.15}}}

## Data fixtures

Since we have real collections now, and not dummy ones, we will need to fill them up with some initial data so we will have something to test our application against to. Let's create our data fixtures in the server:

{{{diff_step 4.16}}}

Here's a quick overview: We use `.collection` to get the actual `Mongo.Collection` instance, this way we avoid using Observables.

At the beginning we check if Chats Collection is empty by using `.count()` operator.

Then we provide few chats with one message each. We also bundled a message along with a chat using its id.

## Try it out

To test your server, make sure that you are inside `api` directory, and run:

  $ meteor

## Load Meteor from Ionic 2 client

So now we have Meteor server running, we need to load Meteor's client side, but without using Meteor CLI.

Let's start by making sure that we are using the root directory (and not `api`) in the command line interface:

    $ cd ..

We will use `meteor-client-bundler` which is a tool that creates a temporary Meteor client side project, build and compile it, and then create a single file that can be imported and use without Meteor environment.

To use this tool, we need to install it first:

    $ npm install -g meteor-client-bundler

And now we need to create a config file, that tell the bundler which Meteor packages we need in the client side, and which exports we need from those package, so the bundler will make sure to make the accessible for us.

So let's create this config file:

{{{diff_step 4.17}}}

At the moment, that's all we need from Meteor in our client side, which are the basic packages only.

Let's add a NPM script, that will execute the bundler and create our bundle file:

{{{diff_step 4.18}}}

And let's execute it:

    $ npm run meteor-client:bundle

So now we have a new generated NPM package, called `meteor-client` and we can just import it in our main client side file:

{{{diff_step 4.19}}}

Now we can use the server side data using our Collections, so let's use the server side data instead of the static client side:

{{{diff_step 4.20}}}

Now, implement `removeChat` using the actual collection:

{{{diff_step 4.21}}}
