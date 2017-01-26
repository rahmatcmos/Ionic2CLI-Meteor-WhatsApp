[{]: <region> (header)
# Step 4: Realtime Meteor Server
[}]: #
[{]: <region> (body)
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

[{]: <helper> (diff_step 4.6)
#### Step 4.6: Add server's tsconfig file

##### Added api/tsconfig.json
```diff
@@ -0,0 +1,29 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "compilerOptions": {
+┊  ┊ 3┊    "allowSyntheticDefaultImports": true,
+┊  ┊ 4┊    "declaration": false,
+┊  ┊ 5┊    "emitDecoratorMetadata": true,
+┊  ┊ 6┊    "experimentalDecorators": true,
+┊  ┊ 7┊    "lib": [
+┊  ┊ 8┊      "dom",
+┊  ┊ 9┊      "es2015"
+┊  ┊10┊    ],
+┊  ┊11┊    "module": "commonjs",
+┊  ┊12┊    "moduleResolution": "node",
+┊  ┊13┊    "sourceMap": true,
+┊  ┊14┊    "target": "es5",
+┊  ┊15┊    "skipLibCheck": true,
+┊  ┊16┊    "stripInternal": true,
+┊  ┊17┊    "noImplicitAny": false,
+┊  ┊18┊    "types": [
+┊  ┊19┊      "meteor-typings"
+┊  ┊20┊    ]
+┊  ┊21┊  },
+┊  ┊22┊  "exclude": [
+┊  ┊23┊    "node_modules"
+┊  ┊24┊  ],
+┊  ┊25┊  "compileOnSave": false,
+┊  ┊26┊  "atom": {
+┊  ┊27┊    "rewriteTsconfig": false
+┊  ┊28┊  }
+┊  ┊29┊}
```
[}]: #

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

[{]: <helper> (diff_step 4.11)
#### Step 4.11: Update the models import path

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { Component } from '@angular/core';
 ┊2┊2┊import { Observable } from 'rxjs';
 ┊3┊3┊import * as moment from 'moment';
-┊4┊ ┊import { Chat, MessageType } from '../../models';
+┊ ┊4┊import { Chat, MessageType } from 'api/models';
 ┊5┊5┊
 ┊6┊6┊@Component({
 ┊7┊7┊  templateUrl: 'chats.html'
```
[}]: #

Now, we are going to use `meteor-rxjs` to declare our collections and data streams, so let's add this package:

    $ npm install --save meteor-rxjs

## Collections

In Meteor, we keep data inside `MongoObservable.Collection`.

This collection is actually a reference to a [MongoDB](http://mongodb.com) collection, and it is provided to us by a Meteor package called [Minimongo](https://guide.meteor.com/collections.html), and it shares almost the same API as a native MongoDB collection. In this tutorial we will be wrapping our collections using RxJS's `Observables`, which is available to us thanks to [meteor-rxjs](http://npmjs.com/package/meteor-rxjs).

Let's create a chats and messages collection, which will be used to store data related to newly created chats and written messages:

[{]: <helper> (diff_step 4.13)
#### Step 4.13: Create chats collection

##### Added api/server/collections/chats.ts
```diff
@@ -0,0 +1,4 @@
+┊ ┊1┊import { MongoObservable } from 'meteor-rxjs';
+┊ ┊2┊import { Chat } from '../models';
+┊ ┊3┊
+┊ ┊4┊export const Chats = new MongoObservable.Collection<Chat>('chats');
```
[}]: #

[{]: <helper> (diff_step 4.14)
#### Step 4.14: Added messages collection

##### Added api/server/collections/messages.ts
```diff
@@ -0,0 +1,4 @@
+┊ ┊1┊import { MongoObservable } from 'meteor-rxjs';
+┊ ┊2┊import { Message } from '../models';
+┊ ┊3┊
+┊ ┊4┊export const Messages = new MongoObservable.Collection<Message>('messages');
```
[}]: #

Now, let's create `index.ts` file, that will export all of the collections together, so it will be easier to use in the client side:

[{]: <helper> (diff_step 4.15)
#### Step 4.15: Added main export file

##### Added api/server/collections/index.ts
```diff
@@ -0,0 +1,2 @@
+┊ ┊1┊export * from './chats';
+┊ ┊2┊export * from './messages';
```
[}]: #

## Data fixtures

Since we have real collections now, and not dummy ones, we will need to fill them up with some initial data so we will have something to test our application against to. Let's create our data fixtures in the server:

[{]: <helper> (diff_step 4.16)
#### Step 4.16: Move stubs data to the server side

##### Changed api/server/main.ts
```diff
@@ -1,5 +1,71 @@
 ┊ 1┊ 1┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 2┊import { Chats } from './collections/chats';
+┊  ┊ 3┊import { Messages } from './collections/messages';
+┊  ┊ 4┊import * as moment from 'moment';
+┊  ┊ 5┊import { MessageType } from './models';
 ┊ 2┊ 6┊
 ┊ 3┊ 7┊Meteor.startup(() => {
-┊ 4┊  ┊  // code to run on server at startup
+┊  ┊ 8┊  if (Chats.find({}).cursor.count() === 0) {
+┊  ┊ 9┊    let chatId;
+┊  ┊10┊
+┊  ┊11┊    chatId = Chats.collection.insert({
+┊  ┊12┊      title: 'Ethan Gonzalez',
+┊  ┊13┊      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
+┊  ┊14┊    });
+┊  ┊15┊
+┊  ┊16┊    Messages.collection.insert({
+┊  ┊17┊      chatId: chatId,
+┊  ┊18┊      content: 'You on your way?',
+┊  ┊19┊      createdAt: moment().subtract(1, 'hours').toDate(),
+┊  ┊20┊      type: MessageType.TEXT
+┊  ┊21┊    });
+┊  ┊22┊
+┊  ┊23┊    chatId = Chats.collection.insert({
+┊  ┊24┊      title: 'Bryan Wallace',
+┊  ┊25┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
+┊  ┊26┊    });
+┊  ┊27┊
+┊  ┊28┊    Messages.collection.insert({
+┊  ┊29┊      chatId: chatId,
+┊  ┊30┊      content: 'Hey, it\'s me',
+┊  ┊31┊      createdAt: moment().subtract(2, 'hours').toDate(),
+┊  ┊32┊      type: MessageType.TEXT
+┊  ┊33┊    });
+┊  ┊34┊
+┊  ┊35┊    chatId = Chats.collection.insert({
+┊  ┊36┊      title: 'Avery Stewart',
+┊  ┊37┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
+┊  ┊38┊    });
+┊  ┊39┊
+┊  ┊40┊    Messages.collection.insert({
+┊  ┊41┊      chatId: chatId,
+┊  ┊42┊      content: 'I should buy a boat',
+┊  ┊43┊      createdAt: moment().subtract(1, 'days').toDate(),
+┊  ┊44┊      type: MessageType.TEXT
+┊  ┊45┊    });
+┊  ┊46┊
+┊  ┊47┊    chatId = Chats.collection.insert({
+┊  ┊48┊      title: 'Katie Peterson',
+┊  ┊49┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
+┊  ┊50┊    });
+┊  ┊51┊
+┊  ┊52┊    Messages.collection.insert({
+┊  ┊53┊      chatId: chatId,
+┊  ┊54┊      content: 'Look at my mukluks!',
+┊  ┊55┊      createdAt: moment().subtract(4, 'days').toDate(),
+┊  ┊56┊      type: MessageType.TEXT
+┊  ┊57┊    });
+┊  ┊58┊
+┊  ┊59┊    chatId = Chats.collection.insert({
+┊  ┊60┊      title: 'Ray Edwards',
+┊  ┊61┊      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
+┊  ┊62┊    });
+┊  ┊63┊
+┊  ┊64┊    Messages.collection.insert({
+┊  ┊65┊      chatId: chatId,
+┊  ┊66┊      content: 'This is wicked good ice cream.',
+┊  ┊67┊      createdAt: moment().subtract(2, 'weeks').toDate(),
+┊  ┊68┊      type: MessageType.TEXT
+┊  ┊69┊    });
+┊  ┊70┊  }
 ┊ 5┊71┊});
```
[}]: #

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

[{]: <helper> (diff_step 4.17)
#### Step 4.17: Added meteor-client config files

##### Added meteor-client.config.json
```diff
@@ -0,0 +1,44 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "run-time": {
+┊  ┊ 3┊    "meteorEnv": {},
+┊  ┊ 4┊    "DDP_DEFAULT_CONNECTION_URL": "http://localhost:3000"
+┊  ┊ 5┊  },
+┊  ┊ 6┊  "import": {
+┊  ┊ 7┊    "meteor-base@1.0.4": [
+┊  ┊ 8┊      "underscore",
+┊  ┊ 9┊      "meteor",
+┊  ┊10┊      "modules-runtime",
+┊  ┊11┊      "modules",
+┊  ┊12┊      "promise",
+┊  ┊13┊      "babel-runtime",
+┊  ┊14┊      "ecmascript-runtime",
+┊  ┊15┊      "ecmascript",
+┊  ┊16┊      "base64",
+┊  ┊17┊      "ejson",
+┊  ┊18┊      "jquery",
+┊  ┊19┊      "check",
+┊  ┊20┊      "random",
+┊  ┊21┊      "tracker",
+┊  ┊22┊      "retry",
+┊  ┊23┊      "id-map",
+┊  ┊24┊      "ordered-dict",
+┊  ┊25┊      "geojson-utils",
+┊  ┊26┊      "diff-sequence",
+┊  ┊27┊      "mongo-id",
+┊  ┊28┊      "minimongo",
+┊  ┊29┊      "ddp-common",
+┊  ┊30┊      "ddp-client",
+┊  ┊31┊      "ddp",
+┊  ┊32┊      "allow-deny",
+┊  ┊33┊      "reactive-var",
+┊  ┊34┊      "mongo"
+┊  ┊35┊    ]
+┊  ┊36┊  },
+┊  ┊37┊  "export": {
+┊  ┊38┊    "ddp": ["DDP"],
+┊  ┊39┊    "meteor": ["Meteor"],
+┊  ┊40┊    "mongo": ["Mongo"],
+┊  ┊41┊    "tracker": ["Tracker"],
+┊  ┊42┊    "underscore": ["_"]
+┊  ┊43┊  }
+┊  ┊44┊}
```
[}]: #

At the moment, that's all we need from Meteor in our client side, which are the basic packages only.

Let's add a NPM script, that will execute the bundler and create our bundle file:

[{]: <helper> (diff_step 4.18)
#### Step 4.18: Created a script for generating the Meteor client bundle

##### Changed package.json
```diff
@@ -7,7 +7,8 @@
 ┊ 7┊ 7┊    "clean": "ionic-app-scripts clean",
 ┊ 8┊ 8┊    "build": "ionic-app-scripts build",
 ┊ 9┊ 9┊    "ionic:build": "ionic-app-scripts build",
-┊10┊  ┊    "ionic:serve": "ionic-app-scripts serve"
+┊  ┊10┊    "ionic:serve": "ionic-app-scripts serve",
+┊  ┊11┊    "meteor-client:bundle": "meteor-client bundle"
 ┊11┊12┊  },
 ┊12┊13┊  "dependencies": {
 ┊13┊14┊    "@angular/common": "2.2.1",
```
```diff
@@ -38,6 +39,7 @@
 ┊38┊39┊    "@types/moment": "^2.13.0",
 ┊39┊40┊    "@types/underscore": "^1.7.36",
 ┊40┊41┊    "meteor-typings": "^1.3.1",
+┊  ┊42┊    "tmp": "0.0.31",
 ┊41┊43┊    "typescript": "2.0.9",
 ┊42┊44┊    "typescript-extends": "^1.0.1"
 ┊43┊45┊  },
```
[}]: #

And let's execute it:

    $ npm run meteor-client:bundle

So now we have a new generated NPM package, called `meteor-client` and we can just import it in our main client side file:

[{]: <helper> (diff_step 4.19)
#### Step 4.19: Import meteor client bundle

##### Changed src/app/main.ts
```diff
@@ -1,3 +1,5 @@
+┊ ┊1┊import 'meteor-client';
+┊ ┊2┊
 ┊1┊3┊import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 ┊2┊4┊
 ┊3┊5┊import { AppModule } from './app.module';
```
[}]: #

Now we can use the server side data using our Collections, so let's use the server side data instead of the static client side:

[{]: <helper> (diff_step 4.20)
#### Step 4.20: Use server side data

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,75 +1,37 @@
-┊ 1┊  ┊import { Component } from '@angular/core';
+┊  ┊ 1┊import { Component, OnInit} from '@angular/core';
 ┊ 2┊ 2┊import { Observable } from 'rxjs';
-┊ 3┊  ┊import * as moment from 'moment';
-┊ 4┊  ┊import { Chat, MessageType } from 'api/models';
+┊  ┊ 3┊import { Chat } from 'api/models';
+┊  ┊ 4┊import { Chats, Messages } from 'api/collections';
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊@Component({
 ┊ 7┊ 7┊  templateUrl: 'chats.html'
 ┊ 8┊ 8┊})
-┊ 9┊  ┊export class ChatsPage {
-┊10┊  ┊  chats: Observable<Chat[]>;
+┊  ┊ 9┊export class ChatsPage implements OnInit {
+┊  ┊10┊  chats;
 ┊11┊11┊
 ┊12┊12┊  constructor() {
-┊13┊  ┊    this.chats = this.findChats();
 ┊14┊13┊  }
 ┊15┊14┊
-┊16┊  ┊  private findChats(): Observable<Chat[]> {
-┊17┊  ┊    return Observable.of([
-┊18┊  ┊      {
-┊19┊  ┊        _id: '0',
-┊20┊  ┊        title: 'Ethan Gonzalez',
-┊21┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
-┊22┊  ┊        lastMessage: {
-┊23┊  ┊          content: 'You on your way?',
-┊24┊  ┊          createdAt: moment().subtract(1, 'hours').toDate(),
-┊25┊  ┊          type: MessageType.TEXT
-┊26┊  ┊        }
-┊27┊  ┊      },
-┊28┊  ┊      {
-┊29┊  ┊        _id: '1',
-┊30┊  ┊        title: 'Bryan Wallace',
-┊31┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
-┊32┊  ┊        lastMessage: {
-┊33┊  ┊          content: 'Hey, it\'s me',
-┊34┊  ┊          createdAt: moment().subtract(2, 'hours').toDate(),
-┊35┊  ┊          type: MessageType.TEXT
-┊36┊  ┊        }
-┊37┊  ┊      },
-┊38┊  ┊      {
-┊39┊  ┊        _id: '2',
-┊40┊  ┊        title: 'Avery Stewart',
-┊41┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
-┊42┊  ┊        lastMessage: {
-┊43┊  ┊          content: 'I should buy a boat',
-┊44┊  ┊          createdAt: moment().subtract(1, 'days').toDate(),
-┊45┊  ┊          type: MessageType.TEXT
-┊46┊  ┊        }
-┊47┊  ┊      },
-┊48┊  ┊      {
-┊49┊  ┊        _id: '3',
-┊50┊  ┊        title: 'Katie Peterson',
-┊51┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
-┊52┊  ┊        lastMessage: {
-┊53┊  ┊          content: 'Look at my mukluks!',
-┊54┊  ┊          createdAt: moment().subtract(4, 'days').toDate(),
-┊55┊  ┊          type: MessageType.TEXT
-┊56┊  ┊        }
-┊57┊  ┊      },
-┊58┊  ┊      {
-┊59┊  ┊        _id: '4',
-┊60┊  ┊        title: 'Ray Edwards',
-┊61┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
-┊62┊  ┊        lastMessage: {
-┊63┊  ┊          content: 'This is wicked good ice cream.',
-┊64┊  ┊          createdAt: moment().subtract(2, 'weeks').toDate(),
-┊65┊  ┊          type: MessageType.TEXT
-┊66┊  ┊        }
-┊67┊  ┊      }
-┊68┊  ┊    ]);
+┊  ┊15┊  ngOnInit() {
+┊  ┊16┊    this.chats = Chats
+┊  ┊17┊      .find({})
+┊  ┊18┊      .mergeMap((chats: Chat[]) =>
+┊  ┊19┊        Observable.combineLatest(
+┊  ┊20┊          ...chats.map((chat: Chat) =>
+┊  ┊21┊            Messages
+┊  ┊22┊              .find({chatId: chat._id})
+┊  ┊23┊              .startWith(null)
+┊  ┊24┊              .map(messages => {
+┊  ┊25┊                if (messages) chat.lastMessage = messages[0];
+┊  ┊26┊                return chat;
+┊  ┊27┊              })
+┊  ┊28┊          )
+┊  ┊29┊        )
+┊  ┊30┊      ).zone();
 ┊69┊31┊  }
 ┊70┊32┊
 ┊71┊33┊  removeChat(chat: Chat): void {
-┊72┊  ┊    this.chats = this.chats.map<Chat[]>(chatsArray => {
+┊  ┊34┊    this.chats = this.chats.map(chatsArray => {
 ┊73┊35┊      const chatIndex = chatsArray.indexOf(chat);
 ┊74┊36┊      chatsArray.splice(chatIndex, 1);
```
[}]: #

Now, implement `removeChat` using the actual collection:

[{]: <helper> (diff_step 4.21)
#### Step 4.21: Implement remove chat with the Collection

##### Changed src/pages/chats/chats.ts
```diff
@@ -31,11 +31,7 @@
 ┊31┊31┊  }
 ┊32┊32┊
 ┊33┊33┊  removeChat(chat: Chat): void {
-┊34┊  ┊    this.chats = this.chats.map(chatsArray => {
-┊35┊  ┊      const chatIndex = chatsArray.indexOf(chat);
-┊36┊  ┊      chatsArray.splice(chatIndex, 1);
-┊37┊  ┊
-┊38┊  ┊      return chatsArray;
+┊  ┊34┊    Chats.remove({_id: chat._id}).subscribe(() => {
 ┊39┊35┊    });
 ┊40┊36┊  }
 ┊41┊37┊}
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step3.md) | [Next Step >](step5.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #