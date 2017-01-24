[{]: <region> (header)
# Step 9: Privacy & Subscriptions
[}]: #
[{]: <region> (body)
In this step we gonna take care of the app's security and encapsulation, since we don't want the users to do whatever they want, and we don't want them to be able to see content which is irrelevant for them.

We gonna start by removing a Meteor package named `insecure`.

This package provides the client with the ability to run collection mutation methods. This is a behavior we are not interested in since removing data and creating data should be done in the server and only after certain validations.

Meteor includes this package by default only for development purposes and it should be removed once our app is ready for production.

So let's remove this package by running this command:

    $ meteor remove insecure

Now that we have a remove method that uses Meteor server, we can go ahead and take advantage of in in our app. 

## Chats Removal

So our next goal is to remove chats, but instead of removing them directly from the Collection (which is not allowed now, since we removed `insecure`), we want to remove the chats object from the server side.

So first, let's add `removeChat` method on the server:

[{]: <helper> (diff_step 9.1)
#### Step 9.1: Remove insecure

##### Changed api/.meteor/packages
```diff
@@ -19,7 +19,6 @@
 ┊19┊19┊shell-server@0.2.1            # Server-side component of the `meteor shell` command
 ┊20┊20┊
 ┊21┊21┊autopublish@1.0.7             # Publish all data to the clients (for prototyping)
-┊22┊  ┊insecure@1.0.7                # Allow all DB writes from clients (for prototyping)
 ┊23┊22┊barbatus:typescript
 ┊24┊23┊check
 ┊25┊24┊accounts-base
```

##### Changed api/.meteor/versions
```diff
@@ -36,7 +36,6 @@
 ┊36┊36┊htmljs@1.0.11
 ┊37┊37┊http@1.1.8
 ┊38┊38┊id-map@1.0.9
-┊39┊  ┊insecure@1.0.7
 ┊40┊39┊jquery@1.11.10
 ┊41┊40┊launch-screen@1.0.12
 ┊42┊41┊livedata@1.0.18
```
[}]: #

And let's use this method on the client side, instead of the old implementation:

[{]: <helper> (diff_step 9.2)
#### Step 9.2: Add removeChat method on server side

##### Changed api/server/methods.ts
```diff
@@ -37,6 +37,23 @@
 ┊37┊37┊
 ┊38┊38┊    Chats.insert(chat);
 ┊39┊39┊  },
+┊  ┊40┊  removeChat(chatId: string): void {
+┊  ┊41┊    if (!this.userId) {
+┊  ┊42┊      throw new Meteor.Error('unauthorized',
+┊  ┊43┊        'User must be logged-in to remove chat');
+┊  ┊44┊    }
+┊  ┊45┊
+┊  ┊46┊    check(chatId, nonEmptyString);
+┊  ┊47┊
+┊  ┊48┊    const chatExists = !!Chats.collection.find(chatId).count();
+┊  ┊49┊
+┊  ┊50┊    if (!chatExists) {
+┊  ┊51┊      throw new Meteor.Error('chat-not-exists',
+┊  ┊52┊        'Chat doesn\'t exist');
+┊  ┊53┊    }
+┊  ┊54┊
+┊  ┊55┊    Chats.remove(chatId);
+┊  ┊56┊  },
 ┊40┊57┊  updateProfile(profile: Profile): void {
 ┊41┊58┊    if (!this.userId) throw new Meteor.Error('unauthorized',
 ┊42┊59┊      'User must be logged-in to create a new chat');
```
[}]: #

In the messages page we have two buttons in the navigation bar, one is for sending attachments and one to open the options menu. 

The options menu is gonna be a pop-over, the same as in the chats page. 

Let's implement its component, which is gonna be called `MessagesOptionsComponent`:

[{]: <helper> (diff_step 9.4)
#### Step 9.4: Add message options component

##### Added src/pages/messages/messages-options.ts
```diff
@@ -0,0 +1,76 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { AlertController, NavController, NavParams, ViewController } from 'ionic-angular';
+┊  ┊ 3┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 4┊import { ChatsPage } from '../chats/chats';
+┊  ┊ 5┊
+┊  ┊ 6┊@Component({
+┊  ┊ 7┊  selector: 'messages-options',
+┊  ┊ 8┊  templateUrl: 'messages-options.html'
+┊  ┊ 9┊})
+┊  ┊10┊export class MessagesOptionsComponent {
+┊  ┊11┊  constructor(
+┊  ┊12┊    public alertCtrl: AlertController,
+┊  ┊13┊    public navCtrl: NavController,
+┊  ┊14┊    public params: NavParams,
+┊  ┊15┊    public viewCtrl: ViewController
+┊  ┊16┊  ) {}
+┊  ┊17┊
+┊  ┊18┊  remove(): void {
+┊  ┊19┊    const alert = this.alertCtrl.create({
+┊  ┊20┊      title: 'Remove',
+┊  ┊21┊      message: 'Are you sure you would like to proceed?',
+┊  ┊22┊      buttons: [
+┊  ┊23┊        {
+┊  ┊24┊          text: 'Cancel',
+┊  ┊25┊          role: 'cancel'
+┊  ┊26┊        },
+┊  ┊27┊        {
+┊  ┊28┊          text: 'Yes',
+┊  ┊29┊          handler: () => {
+┊  ┊30┊            this.handleRemove(alert);
+┊  ┊31┊            return false;
+┊  ┊32┊          }
+┊  ┊33┊        }
+┊  ┊34┊      ]
+┊  ┊35┊    });
+┊  ┊36┊
+┊  ┊37┊    this.viewCtrl.dismiss().then(() => {
+┊  ┊38┊      alert.present();
+┊  ┊39┊    });
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  private handleRemove(alert): void {
+┊  ┊43┊    MeteorObservable.call('removeChat', this.params.get('chat')._id).subscribe({
+┊  ┊44┊      next: () => {
+┊  ┊45┊        alert.dismiss().then(() => {
+┊  ┊46┊          this.navCtrl.setRoot(ChatsPage, {}, {
+┊  ┊47┊            animate: true
+┊  ┊48┊          });
+┊  ┊49┊        });
+┊  ┊50┊      },
+┊  ┊51┊      error: (e: Error) => {
+┊  ┊52┊        alert.dismiss().then(() => {
+┊  ┊53┊          if (e) {
+┊  ┊54┊            return this.handleError(e);
+┊  ┊55┊          }
+┊  ┊56┊
+┊  ┊57┊          this.navCtrl.setRoot(ChatsPage, {}, {
+┊  ┊58┊            animate: true
+┊  ┊59┊          });
+┊  ┊60┊        });
+┊  ┊61┊      }
+┊  ┊62┊    });
+┊  ┊63┊  }
+┊  ┊64┊
+┊  ┊65┊  private handleError(e: Error): void {
+┊  ┊66┊    console.error(e);
+┊  ┊67┊
+┊  ┊68┊    const alert = this.alertCtrl.create({
+┊  ┊69┊      title: 'Oops!',
+┊  ┊70┊      message: e.message,
+┊  ┊71┊      buttons: ['OK']
+┊  ┊72┊    });
+┊  ┊73┊
+┊  ┊74┊    alert.present();
+┊  ┊75┊  }
+┊  ┊76┊}
```
[}]: #

[{]: <helper> (diff_step 9.5)
#### Step 9.5: Add messages options template

##### Added src/pages/messages/messages-options.html
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊<ion-content class="chats-options-page-content">
+┊ ┊2┊  <ion-list class="options">
+┊ ┊3┊    <button ion-item class="option option-remove" (click)="remove()">
+┊ ┊4┊      <ion-icon name="trash" class="option-icon"></ion-icon>
+┊ ┊5┊      <div class="option-name">Remove</div>
+┊ ┊6┊    </button>
+┊ ┊7┊  </ion-list>
+┊ ┊8┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 9.6)
#### Step 9.6: Add message options styles

##### Added src/pages/messages/messages-options.scss
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊.chats-options-page-content {
+┊  ┊ 2┊  .options {
+┊  ┊ 3┊    margin: 0;
+┊  ┊ 4┊  }
+┊  ┊ 5┊
+┊  ┊ 6┊  .option-name {
+┊  ┊ 7┊    float: left;
+┊  ┊ 8┊  }
+┊  ┊ 9┊
+┊  ┊10┊  .option-icon {
+┊  ┊11┊    float: right;
+┊  ┊12┊  }
+┊  ┊13┊}
```
[}]: #

[{]: <helper> (diff_step 9.7)
#### Step 9.7: Import messages options component

##### Changed src/app/app.module.ts
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊import { ProfilePage } from '../pages/profile/profile';
 ┊11┊11┊import { ChatsOptionsComponent } from '../pages/chats/chats-options';
 ┊12┊12┊import { NewChatComponent } from '../pages/chats/new-chat';
+┊  ┊13┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
 ┊13┊14┊
 ┊14┊15┊@NgModule({
 ┊15┊16┊  declarations: [
```
```diff
@@ -20,7 +21,8 @@
 ┊20┊21┊    VerificationPage,
 ┊21┊22┊    ProfilePage,
 ┊22┊23┊    ChatsOptionsComponent,
-┊23┊  ┊    NewChatComponent
+┊  ┊24┊    NewChatComponent,
+┊  ┊25┊    MessagesOptionsComponent
 ┊24┊26┊  ],
 ┊25┊27┊  imports: [
 ┊26┊28┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -35,7 +37,8 @@
 ┊35┊37┊    VerificationPage,
 ┊36┊38┊    ProfilePage,
 ┊37┊39┊    ChatsOptionsComponent,
-┊38┊  ┊    NewChatComponent
+┊  ┊40┊    NewChatComponent,
+┊  ┊41┊    MessagesOptionsComponent
 ┊39┊42┊  ],
 ┊40┊43┊  providers: [
 ┊41┊44┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
```
[}]: #

Now we can go ahead and implement the method in the messages page for showing this popover:

[{]: <helper> (diff_step 9.8)
#### Step 9.8: Implemente showOptions method

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,10 +1,11 @@
 ┊ 1┊ 1┊import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
-┊ 2┊  ┊import { NavParams } from 'ionic-angular';
+┊  ┊ 2┊import { NavParams, PopoverController } from 'ionic-angular';
 ┊ 3┊ 3┊import { Chat, Message, MessageType } from 'api/models';
 ┊ 4┊ 4┊import { Messages } from 'api/collections';
 ┊ 5┊ 5┊import { MeteorObservable } from 'meteor-rxjs';
 ┊ 6┊ 6┊import * as moment from 'moment';
 ┊ 7┊ 7┊import { _ } from 'meteor/underscore';
+┊  ┊ 8┊import { MessagesOptionsComponent } from './messages-options';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Component({
 ┊10┊11┊  selector: 'messages-page',
```
```diff
@@ -22,7 +23,8 @@
 ┊22┊23┊
 ┊23┊24┊  constructor(
 ┊24┊25┊    navParams: NavParams,
-┊25┊  ┊    private el: ElementRef
+┊  ┊26┊    private el: ElementRef,
+┊  ┊27┊    private popoverCtrl: PopoverController
 ┊26┊28┊  ) {
 ┊27┊29┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊28┊30┊    this.title = this.selectedChat.title;
```
```diff
@@ -56,6 +58,16 @@
 ┊56┊58┊    this.messagesDayGroups = this.findMessagesDayGroups();
 ┊57┊59┊  }
 ┊58┊60┊
+┊  ┊61┊  showOptions(): void {
+┊  ┊62┊    const popover = this.popoverCtrl.create(MessagesOptionsComponent, {
+┊  ┊63┊      chat: this.selectedChat
+┊  ┊64┊    }, {
+┊  ┊65┊      cssClass: 'options-popover messages-options-popover'
+┊  ┊66┊    });
+┊  ┊67┊
+┊  ┊68┊    popover.present();
+┊  ┊69┊  }
+┊  ┊70┊
 ┊59┊71┊  findMessagesDayGroups() {
 ┊60┊72┊    return Messages.find({
 ┊61┊73┊      chatId: this.selectedChat._id
```
[}]: #

And last but not least, let's update our view and bind the event to its handler:

[{]: <helper> (diff_step 9.9)
#### Step 9.9: Bind showOptions to messages options button

##### Changed src/pages/messages/messages.html
```diff
@@ -8,7 +8,7 @@
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊    <ion-buttons end>
 ┊10┊10┊      <button ion-button icon-only class="attach-button"><ion-icon name="attach"></ion-icon></button>
-┊11┊  ┊      <button ion-button icon-only class="options-button"><ion-icon name="more"></ion-icon></button>
+┊  ┊11┊      <button ion-button icon-only class="options-button" (click)="showOptions()"><ion-icon name="more"></ion-icon></button>
 ┊12┊12┊    </ion-buttons>
 ┊13┊13┊  </ion-navbar>
 ┊14┊14┊</ion-header>
```
[}]: #

Right now all the chats are published to all the clients which is not very good for privacy. Let's fix that.

First thing we need to do in order to stop all the automatic publication of information is to remove the `autopublish` package from the Meteor server:

    $ meteor remove autopublish

Now we need to explicitly define our publications. 

Let's start by sending the users' information:

[{]: <helper> (diff_step 9.11)
#### Step 9.11: Add users publication

##### Added api/server/publications.ts
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊import { User } from './models';
+┊  ┊ 2┊import { Users } from './collections/users';
+┊  ┊ 3┊
+┊  ┊ 4┊Meteor.publish('users', function(): Mongo.Cursor<User> {
+┊  ┊ 5┊  if (!this.userId) {
+┊  ┊ 6┊    return;
+┊  ┊ 7┊  }
+┊  ┊ 8┊
+┊  ┊ 9┊  return Users.collection.find({}, {
+┊  ┊10┊    fields: {
+┊  ┊11┊      profile: 1
+┊  ┊12┊    }
+┊  ┊13┊  });
+┊  ┊14┊});
```
[}]: #

And add the messages:

[{]: <helper> (diff_step 9.12)
#### Step 9.12: Publish messages

##### Changed api/server/publications.ts
```diff
@@ -1,5 +1,6 @@
-┊1┊ ┊import { User } from './models';
+┊ ┊1┊import { User, Message } from './models';
 ┊2┊2┊import { Users } from './collections/users';
+┊ ┊3┊import { Messages } from './collections/messages';
 ┊3┊4┊
 ┊4┊5┊Meteor.publish('users', function(): Mongo.Cursor<User> {
 ┊5┊6┊  if (!this.userId) {
```
```diff
@@ -12,3 +13,15 @@
 ┊12┊13┊    }
 ┊13┊14┊  });
 ┊14┊15┊});
+┊  ┊16┊
+┊  ┊17┊Meteor.publish('messages', function(chatId: string): Mongo.Cursor<Message> {
+┊  ┊18┊  if (!this.userId || !chatId) {
+┊  ┊19┊    return;
+┊  ┊20┊  }
+┊  ┊21┊
+┊  ┊22┊  return Messages.collection.find({
+┊  ┊23┊    chatId
+┊  ┊24┊  }, {
+┊  ┊25┊    sort: { createdAt: -1 }
+┊  ┊26┊  });
+┊  ┊27┊});
```
[}]: #

We will now add the [publish-composite](https://atmospherejs.com/reywood/publish-composite) package which will help us implement joined collection publications.

  $ cd api/
  $ meteor add reywood:publish-composite

And we will install its typings declarations:

  $ cd ..
  $ npm install --save @types/meteor-publish-composite

And import them:

[{]: <helper> (diff_step 9.15)
#### Step 9.15: Import @types/meteor-publish-composite

##### Changed api/tsconfig.json
```diff
@@ -17,7 +17,8 @@
 ┊17┊17┊    "noImplicitAny": false,
 ┊18┊18┊    "types": [
 ┊19┊19┊      "meteor-typings",
-┊20┊  ┊      "@types/meteor-accounts-phone"
+┊  ┊20┊      "@types/meteor-accounts-phone",
+┊  ┊21┊      "@types/meteor-publish-composite"
 ┊21┊22┊    ]
 ┊22┊23┊  },
 ┊23┊24┊  "exclude": [
```
[}]: #

Now we will use `Meteor.publishComposite` from the package we installed and create a publication of `Chats`:

[{]: <helper> (diff_step 9.16)
#### Step 9.16: Implement chats publication

##### Changed api/server/publications.ts
```diff
@@ -1,6 +1,7 @@
-┊1┊ ┊import { User, Message } from './models';
+┊ ┊1┊import { User, Message, Chat } from './models';
 ┊2┊2┊import { Users } from './collections/users';
 ┊3┊3┊import { Messages } from './collections/messages';
+┊ ┊4┊import { Chats } from './collections/chats';
 ┊4┊5┊
 ┊5┊6┊Meteor.publish('users', function(): Mongo.Cursor<User> {
 ┊6┊7┊  if (!this.userId) {
```
```diff
@@ -25,3 +26,35 @@
 ┊25┊26┊    sort: { createdAt: -1 }
 ┊26┊27┊  });
 ┊27┊28┊});
+┊  ┊29┊
+┊  ┊30┊Meteor.publishComposite('chats', function(): PublishCompositeConfig<Chat> {
+┊  ┊31┊  if (!this.userId) {
+┊  ┊32┊    return;
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  return {
+┊  ┊36┊    find: () => {
+┊  ┊37┊      return Chats.collection.find({ memberIds: this.userId });
+┊  ┊38┊    },
+┊  ┊39┊
+┊  ┊40┊    children: [
+┊  ┊41┊      <PublishCompositeConfig1<Chat, Message>> {
+┊  ┊42┊        find: (chat) => {
+┊  ┊43┊          return Messages.collection.find({ chatId: chat._id }, {
+┊  ┊44┊            sort: { createdAt: -1 },
+┊  ┊45┊            limit: 1
+┊  ┊46┊          });
+┊  ┊47┊        }
+┊  ┊48┊      },
+┊  ┊49┊      <PublishCompositeConfig1<Chat, User>> {
+┊  ┊50┊        find: (chat) => {
+┊  ┊51┊          return Users.collection.find({
+┊  ┊52┊            _id: { $in: chat.memberIds }
+┊  ┊53┊          }, {
+┊  ┊54┊            fields: { profile: 1 }
+┊  ┊55┊          });
+┊  ┊56┊        }
+┊  ┊57┊      }
+┊  ┊58┊    ]
+┊  ┊59┊  };
+┊  ┊60┊});
```
[}]: #

The chats publication is a composite publication which is made of several nodes. First we gonna find all the relevant chats for the current user logged in. After we have the chats, we gonna return the following cursor for each chat document we found. 

First we gonna return all the last messages, and second we gonna return all the users we're currently chatting with.

Now let's use our first publication, `users`, in the new chat window, so we will have the list of users there:

[{]: <helper> (diff_step 9.17)
#### Step 9.17: Subscribe to users

##### Changed src/pages/chats/new-chat.ts
```diff
@@ -40,7 +40,13 @@
 ┊40┊40┊  }
 ┊41┊41┊
 ┊42┊42┊  loadUsers(): void {
-┊43┊  ┊    this.users = this.findUsers();
+┊  ┊43┊    // Fetch all users matching search pattern
+┊  ┊44┊    const subscription = MeteorObservable.subscribe('users');
+┊  ┊45┊    const autorun = MeteorObservable.autorun();
+┊  ┊46┊
+┊  ┊47┊    Observable.merge(subscription, autorun).subscribe(() => {
+┊  ┊48┊      this.users = this.findUsers();
+┊  ┊49┊    });
 ┊44┊50┊  }
 ┊45┊51┊
 ┊46┊52┊  findUsers(): Observable<User[]> {
```
[}]: #

The users publication publishes all the users' profiles, and we need to use it in the new chat dialog whenever we wanna create a new chat.

Let's add the subscription for the chats publication in the chats component:

[{]: <helper> (diff_step 9.18)
#### Step 9.18: Subscribe to chats

##### Changed src/pages/chats/chats.ts
```diff
@@ -29,7 +29,11 @@
 ┊29┊29┊  }
 ┊30┊30┊
 ┊31┊31┊  ngOnInit() {
-┊32┊  ┊    this.chats = this.findChats();
+┊  ┊32┊    MeteorObservable.subscribe('chats').subscribe(() => {
+┊  ┊33┊      MeteorObservable.autorun().subscribe(() => {
+┊  ┊34┊        this.chats = this.findChats();
+┊  ┊35┊      });
+┊  ┊36┊    });
 ┊33┊37┊  }
 ┊34┊38┊
 ┊35┊39┊  findChats(): Observable<Chat[]> {
```
[}]: #

The messages publication is responsible for bringing all the relevant messages for a certain chat. This publication is actually parameterized and it requires us to pass a chat id during subscription.

Let's subscribe to the messages publication in the messages component, and pass the current active chat id provided to us by the nav params:

[{]: <helper> (diff_step 9.19)
#### Step 9.19: Subscribe to messages

##### Changed src/pages/messages/messages.ts
```diff
@@ -6,6 +6,7 @@
 ┊ 6┊ 6┊import * as moment from 'moment';
 ┊ 7┊ 7┊import { _ } from 'meteor/underscore';
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from './messages-options';
+┊  ┊ 9┊import { Subscription } from 'rxjs';
 ┊ 9┊10┊
 ┊10┊11┊@Component({
 ┊11┊12┊  selector: 'messages-page',
```
```diff
@@ -20,6 +21,8 @@
 ┊20┊21┊  autoScroller: MutationObserver;
 ┊21┊22┊  scrollOffset = 0;
 ┊22┊23┊  senderId: string;
+┊  ┊24┊  loadingMessages: boolean;
+┊  ┊25┊  messagesComputation: Subscription;
 ┊23┊26┊
 ┊24┊27┊  constructor(
 ┊25┊28┊    navParams: NavParams,
```
```diff
@@ -53,9 +56,32 @@
 ┊53┊56┊    this.autoScroller.disconnect();
 ┊54┊57┊  }
 ┊55┊58┊
-┊56┊  ┊  subscribeMessages() {
+┊  ┊59┊  // Subscribes to the relevant set of messages
+┊  ┊60┊  subscribeMessages(): void {
+┊  ┊61┊    // A flag which indicates if there's a subscription in process
+┊  ┊62┊    this.loadingMessages = true;
+┊  ┊63┊    // A custom offset to be used to re-adjust the scrolling position once
+┊  ┊64┊    // new dataset is fetched
 ┊57┊65┊    this.scrollOffset = this.scroller.scrollHeight;
-┊58┊  ┊    this.messagesDayGroups = this.findMessagesDayGroups();
+┊  ┊66┊
+┊  ┊67┊    MeteorObservable.subscribe('messages',
+┊  ┊68┊      this.selectedChat._id
+┊  ┊69┊    ).subscribe(() => {
+┊  ┊70┊      // Keep tracking changes in the dataset and re-render the view
+┊  ┊71┊      if (!this.messagesComputation) {
+┊  ┊72┊        this.messagesComputation = this.autorunMessages();
+┊  ┊73┊      }
+┊  ┊74┊
+┊  ┊75┊      // Allow incoming subscription requests
+┊  ┊76┊      this.loadingMessages = false;
+┊  ┊77┊    });
+┊  ┊78┊  }
+┊  ┊79┊
+┊  ┊80┊  // Detects changes in the messages dataset and re-renders the view
+┊  ┊81┊  autorunMessages(): Subscription {
+┊  ┊82┊    return MeteorObservable.autorun().subscribe(() => {
+┊  ┊83┊      this.messagesDayGroups = this.findMessagesDayGroups();
+┊  ┊84┊    });
 ┊59┊85┊  }
 ┊60┊86┊
 ┊61┊87┊  showOptions(): void {
```
```diff
@@ -113,6 +139,11 @@
 ┊113┊139┊  }
 ┊114┊140┊
 ┊115┊141┊  scrollDown(): void {
+┊   ┊142┊    // Don't scroll down if messages subscription is being loaded
+┊   ┊143┊    if (this.loadingMessages) {
+┊   ┊144┊      return;
+┊   ┊145┊    }
+┊   ┊146┊
 ┊116┊147┊    // Scroll down and apply specified offset
 ┊117┊148┊    this.scroller.scrollTop = this.scroller.scrollHeight - this.scrollOffset;
 ┊118┊149┊    // Zero offset for next invocation
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step8.md) | [Next Step >](step10.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #