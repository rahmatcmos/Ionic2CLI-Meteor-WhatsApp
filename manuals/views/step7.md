[{]: <region> (header)
# Step 7: Users & Authentication
[}]: #
[{]: <region> (body)
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

[{]: <helper> (diff_step 7.2)
#### Step 7.2: Updated bundler config

##### Changed meteor-client.config.json
```diff
@@ -32,9 +32,22 @@
 ┊32┊32┊      "allow-deny",
 ┊33┊33┊      "reactive-var",
 ┊34┊34┊      "mongo"
+┊  ┊35┊    ],
+┊  ┊36┊    "npm-bcrypt": [],
+┊  ┊37┊    "accounts-base": [
+┊  ┊38┊      "callback-hook",
+┊  ┊39┊      "localstorage",
+┊  ┊40┊      "accounts-base",
+┊  ┊41┊      "service-configuration"
+┊  ┊42┊    ],
+┊  ┊43┊    "mys:accounts-phone": [
+┊  ┊44┊      "sha",
+┊  ┊45┊      "srp",
+┊  ┊46┊      "mys_accounts-phone"
 ┊35┊47┊    ]
 ┊36┊48┊  },
 ┊37┊49┊  "export": {
+┊  ┊50┊    "accounts-base": ["Accounts"],
 ┊38┊51┊    "ddp": ["DDP"],
 ┊39┊52┊    "meteor": ["Meteor"],
 ┊40┊53┊    "mongo": ["Mongo"],
```
[}]: #

Now, we need to make sure that our bundle in up-to-date with those packages, so lets run it again, in our root directory:

  $ cd ..
  $ npm run meteor-client:bundle

For the sake of debugging we gonna write an authentication settings file (`api/private/settings.json`) which might make our life easier, but once your'e in production mode you *shouldn't* use this configuration:

[{]: <helper> (diff_step 7.3)
#### Step 7.3: Add accounts-phone settings

##### Added api/private/settings.json
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊{
+┊ ┊2┊  "accounts-phone": {
+┊ ┊3┊    "verificationWaitTime": 0,
+┊ ┊4┊    "verificationRetriesWaitTime": 0,
+┊ ┊5┊    "adminPhoneNumbers": ["+9721234567", "+97212345678", "+97212345679"],
+┊ ┊6┊    "phoneVerificationMasterCode": "1234"
+┊ ┊7┊  }
+┊ ┊8┊}
```
[}]: #

Now anytime we run our app we should provide it with a `settings.json`:

  $ cd api/
  $ meteor run --settings private/settings.json

To make it simpler we can add `start` script to `package.json`:

[{]: <helper> (diff_step 7.4)
#### Step 7.4: Updated NPM script

##### Changed package.json
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊  "homepage": "http://ionicframework.com/",
 ┊ 5┊ 5┊  "private": true,
 ┊ 6┊ 6┊  "scripts": {
+┊  ┊ 7┊    "api": "cd api && meteor run --settings private/settings.json",
 ┊ 7┊ 8┊    "clean": "ionic-app-scripts clean",
 ┊ 8┊ 9┊    "build": "ionic-app-scripts build",
 ┊ 9┊10┊    "ionic:build": "ionic-app-scripts build",
```
[}]: #

> *NOTE*: If you would like to test the verification with a real phone number, `accounts-phone` provides an easy access for [twilio's API](https://www.twilio.com/), for more information see [accounts-phone's repo](https://github.com/okland/accounts-phone).

We will now apply the settings file we've just created so it can actually take effect:

[{]: <helper> (diff_step 7.5)
#### Step 7.5: Added meteor accounts config

##### Changed api/server/main.ts
```diff
@@ -3,8 +3,14 @@
 ┊ 3┊ 3┊import { Messages } from './collections/messages';
 ┊ 4┊ 4┊import * as moment from 'moment';
 ┊ 5┊ 5┊import { MessageType } from './models';
+┊  ┊ 6┊import { Accounts } from 'meteor/accounts-base';
 ┊ 6┊ 7┊
 ┊ 7┊ 8┊Meteor.startup(() => {
+┊  ┊ 9┊  if (Meteor.settings) {
+┊  ┊10┊    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
+┊  ┊11┊    SMS.twilio = Meteor.settings['twilio'];
+┊  ┊12┊  }
+┊  ┊13┊
 ┊ 8┊14┊  if (Chats.find({}).cursor.count() === 0) {
 ┊ 9┊15┊    let chatId;
```
[}]: #

We also need to make sure we have the correct Typings for the TypeScript compiler, which matches Meteor's accounts package, so let's install it (from the root directory):

  $ cd ..
  $ npm install --save-dev @types/meteor-accounts-phone

And tell TypeScript compiler to use it when compiling our files:

[{]: <helper> (diff_step 7.7)
#### Step 7.7: Updated tsconfig

##### Changed api/tsconfig.json
```diff
@@ -16,7 +16,8 @@
 ┊16┊16┊    "stripInternal": true,
 ┊17┊17┊    "noImplicitAny": false,
 ┊18┊18┊    "types": [
-┊19┊  ┊      "meteor-typings"
+┊  ┊19┊      "meteor-typings",
+┊  ┊20┊      "@types/meteor-accounts-phone"
 ┊20┊21┊    ]
 ┊21┊22┊  },
 ┊22┊23┊  "exclude": [
```
[}]: #

## Use Meteor Accounts

Now, we will use the meteor account in our client side, our first use will be to delay our app bootstrap phase, until Meteor accounts system has done it's initialization.

Meteor accounts exposes a method called `loggingIn` which indicates if the authorization flow is done, so we will use it, and bootstrap our Angular 2 application only when it's done. We are doing it because we want to make sure that we know it there is a user logged in or not.

[{]: <helper> (diff_step 7.8)
#### Step 7.8: Wait for user if logging in

##### Changed src/app/main.ts
```diff
@@ -1,7 +1,18 @@
 ┊ 1┊ 1┊import 'meteor-client';
 ┊ 2┊ 2┊
 ┊ 3┊ 3┊import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
-┊ 4┊  ┊
+┊  ┊ 4┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 5┊import { Meteor } from 'meteor/meteor';
 ┊ 5┊ 6┊import { AppModule } from './app.module';
 ┊ 6┊ 7┊
-┊ 7┊  ┊platformBrowserDynamic().bootstrapModule(AppModule);
+┊  ┊ 8┊Meteor.startup(() => {
+┊  ┊ 9┊  const subscription = MeteorObservable.autorun().subscribe(() => {
+┊  ┊10┊
+┊  ┊11┊    if (Meteor.loggingIn()) {
+┊  ┊12┊      return;
+┊  ┊13┊    }
+┊  ┊14┊
+┊  ┊15┊    setTimeout(() => subscription.unsubscribe());
+┊  ┊16┊    platformBrowserDynamic().bootstrapModule(AppModule);
+┊  ┊17┊  });
+┊  ┊18┊});
```
[}]: #

> The logic waits to Meteor to trigger it's autorun, then checks `loggingIn` flag, and only when it's done, the `bootstrapModule` or Angular 2 is executed.

Great, now that we're set, let's start implementing the auth views!

## UI

For authentication we gonna create the following flow in our app:

- login - The initial page. Ask for the user's phone number.
- verification - Verify a user's phone number by an SMS authentication.
- profile - Ask a user to pickup its name. Afterwards he will be promoted to the tabs page.

Let's start by creating the `LoginComponent`. In this component we will request an SMS verification right after a phone number has been entered:

[{]: <helper> (diff_step 7.9)
#### Step 7.9: Add login component

##### Added src/pages/login/login.ts
```diff
@@ -0,0 +1,66 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { Alert, AlertController, NavController } from 'ionic-angular';
+┊  ┊ 3┊import { PhoneService } from '../../services/phone';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  selector: 'login',
+┊  ┊ 7┊  templateUrl: 'login.html'
+┊  ┊ 8┊})
+┊  ┊ 9┊export class LoginPage {
+┊  ┊10┊  private phone = '';
+┊  ┊11┊
+┊  ┊12┊  constructor(
+┊  ┊13┊    private alertCtrl: AlertController,
+┊  ┊14┊    private phoneService: PhoneService,
+┊  ┊15┊    private navCtrl: NavController
+┊  ┊16┊  ) {}
+┊  ┊17┊
+┊  ┊18┊  onInputKeypress({keyCode}: KeyboardEvent): void {
+┊  ┊19┊    if (keyCode === 13) {
+┊  ┊20┊      this.login();
+┊  ┊21┊    }
+┊  ┊22┊  }
+┊  ┊23┊
+┊  ┊24┊  login(phone: string = this.phone): void {
+┊  ┊25┊    const alert = this.alertCtrl.create({
+┊  ┊26┊      title: 'Confirm',
+┊  ┊27┊      message: `Would you like to proceed with the phone number ${phone}?`,
+┊  ┊28┊      buttons: [
+┊  ┊29┊        {
+┊  ┊30┊          text: 'Cancel',
+┊  ┊31┊          role: 'cancel'
+┊  ┊32┊        },
+┊  ┊33┊        {
+┊  ┊34┊          text: 'Yes',
+┊  ┊35┊          handler: () => {
+┊  ┊36┊            this.handleLogin(alert);
+┊  ┊37┊            return false;
+┊  ┊38┊          }
+┊  ┊39┊        }
+┊  ┊40┊      ]
+┊  ┊41┊    });
+┊  ┊42┊
+┊  ┊43┊    alert.present();
+┊  ┊44┊  }
+┊  ┊45┊
+┊  ┊46┊  handleLogin(alert: Alert): void {
+┊  ┊47┊    alert.dismiss().then(() => {
+┊  ┊48┊      return this.phoneService.verify(this.phone);
+┊  ┊49┊    })
+┊  ┊50┊    .catch((e) => {
+┊  ┊51┊      this.handleError(e);
+┊  ┊52┊    });
+┊  ┊53┊  }
+┊  ┊54┊
+┊  ┊55┊  handleError(e: Error): void {
+┊  ┊56┊    console.error(e);
+┊  ┊57┊
+┊  ┊58┊    const alert = this.alertCtrl.create({
+┊  ┊59┊      title: 'Oops!',
+┊  ┊60┊      message: e.message,
+┊  ┊61┊      buttons: ['OK']
+┊  ┊62┊    });
+┊  ┊63┊
+┊  ┊64┊    alert.present();
+┊  ┊65┊  }
+┊  ┊66┊}
```
[}]: #

> We use a service called `PhoneService` - don't worry, we will implement in soon!

The `onInputKeypress` handler is used to detect key press events. 

Once we press the login button, the `login` method is called and shows and alert dialog to confirm the action (See [reference](http://ionicframework.com/docs/v2/components/#alert)). If an error has occurred, the `handlerError` method is called and shows an alert dialog with the received error. If everything went as expected the `handleLogin` method is called. It requests for an SMS verification using `Accounts.requestPhoneVerification`, and promotes us to the verification view.

Hopefully that the component's logic is clear now, let's move to the template:

[{]: <helper> (diff_step 7.10)
#### Step 7.10: Add login template

##### Added src/pages/login/login.html
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Login</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="done-button" (click)="login()">Done</button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-navbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content padding class="login-page-content">
+┊  ┊12┊  <div class="instructions">
+┊  ┊13┊    <div>
+┊  ┊14┊      Please enter your phone number including its country code.
+┊  ┊15┊    </div>
+┊  ┊16┊    <br>
+┊  ┊17┊    <div>
+┊  ┊18┊      The messenger will send a one time SMS message to verify your phone number. Carrier SMS charges may apply.
+┊  ┊19┊    </div>
+┊  ┊20┊  </div>
+┊  ┊21┊
+┊  ┊22┊  <ion-item>
+┊  ┊23┊    <ion-input [(ngModel)]="phone" (keypress)="onInputKeypress($event)" type="tel" placeholder="Your phone number"></ion-input>
+┊  ┊24┊  </ion-item>
+┊  ┊25┊</ion-content>
```
[}]: #

And add some style into it:

[{]: <helper> (diff_step 7.11)
#### Step 7.11: Add login component styles

##### Added src/pages/login/login.scss
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊.login-page-content {
+┊  ┊ 2┊  .instructions {
+┊  ┊ 3┊    text-align: center;
+┊  ┊ 4┊    font-size: medium;
+┊  ┊ 5┊    margin: 50px;
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  .text-input {
+┊  ┊ 9┊    text-align: center;
+┊  ┊10┊  }
+┊  ┊11┊}
```
[}]: #

As usual, newly created components should be imported in the app's module:

[{]: <helper> (diff_step 7.12)
#### Step 7.12: Import login component

##### Changed src/app/app.module.ts
```diff
@@ -4,12 +4,14 @@
 ┊ 4┊ 4┊import { ChatsPage } from '../pages/chats/chats';
 ┊ 5┊ 5┊import { MomentModule } from 'angular2-moment';
 ┊ 6┊ 6┊import { MessagesPage } from '../pages/messages/messages';
+┊  ┊ 7┊import { LoginPage } from '../pages/login/login';
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@NgModule({
 ┊ 9┊10┊  declarations: [
 ┊10┊11┊    MyApp,
 ┊11┊12┊    ChatsPage,
-┊12┊  ┊    MessagesPage
+┊  ┊13┊    MessagesPage,
+┊  ┊14┊    LoginPage
 ┊13┊15┊  ],
 ┊14┊16┊  imports: [
 ┊15┊17┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -19,7 +21,8 @@
 ┊19┊21┊  entryComponents: [
 ┊20┊22┊    MyApp,
 ┊21┊23┊    ChatsPage,
-┊22┊  ┊    MessagesPage
+┊  ┊24┊    MessagesPage,
+┊  ┊25┊    LoginPage
 ┊23┊26┊  ],
 ┊24┊27┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊25┊28┊})
```
[}]: #

Now let's add the ability to identify which page should be loaded - the chats page or the login page:

[{]: <helper> (diff_step 7.13)
#### Step 7.13: Add user identification in app's main component

##### Changed src/app/app.component.ts
```diff
@@ -2,14 +2,18 @@
 ┊ 2┊ 2┊import { Platform } from 'ionic-angular';
 ┊ 3┊ 3┊import { StatusBar, Splashscreen } from 'ionic-native';
 ┊ 4┊ 4┊import { ChatsPage } from '../pages/chats/chats';
+┊  ┊ 5┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 6┊import { LoginPage } from '../pages/login/login';
 ┊ 5┊ 7┊
 ┊ 6┊ 8┊@Component({
 ┊ 7┊ 9┊  templateUrl: 'app.html'
 ┊ 8┊10┊})
 ┊ 9┊11┊export class MyApp {
-┊10┊  ┊  rootPage = ChatsPage;
+┊  ┊12┊  rootPage: any;
 ┊11┊13┊
 ┊12┊14┊  constructor(platform: Platform) {
+┊  ┊15┊    this.rootPage = Meteor.user() ? ChatsPage : LoginPage;
+┊  ┊16┊
 ┊13┊17┊    platform.ready().then(() => {
 ┊14┊18┊      // Okay, so the platform is ready and our plugins are available.
 ┊15┊19┊      // Here you can do any higher level native things you might need.
```
[}]: #

Let's proceed and implement the verification page. We will start by creating its component, called `VerificationComponent`:

Now, we will create a service called `PhoneService` which combine the logic related to phone validation, so let's create this service:

[{]: <helper> (diff_step 7.14)
#### Step 7.14: Added phone service

##### Added src/services/phone.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import { Injectable } from '@angular/core';
+┊  ┊ 2┊import { Accounts } from 'meteor/accounts-base';
+┊  ┊ 3┊
+┊  ┊ 4┊@Injectable()
+┊  ┊ 5┊export class PhoneService {
+┊  ┊ 6┊  constructor() {
+┊  ┊ 7┊
+┊  ┊ 8┊  }
+┊  ┊ 9┊
+┊  ┊10┊  verify(phoneNumber: string): Promise<void> {
+┊  ┊11┊    return new Promise<void>((resolve, reject) => {
+┊  ┊12┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) => {
+┊  ┊13┊        if (e) {
+┊  ┊14┊          return reject(e);
+┊  ┊15┊        }
+┊  ┊16┊
+┊  ┊17┊        resolve();
+┊  ┊18┊      });
+┊  ┊19┊    });
+┊  ┊20┊  }
+┊  ┊21┊}
```
[}]: #

> `verify` method uses Meteor accounts package, to validate and user with SMS message.

And we also need to declare this service as `provider` in our `NgModule`:

[{]: <helper> (diff_step 7.15)
#### Step 7.15: Added phone service to NgModule

##### Changed src/app/app.module.ts
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊import { MomentModule } from 'angular2-moment';
 ┊ 6┊ 6┊import { MessagesPage } from '../pages/messages/messages';
 ┊ 7┊ 7┊import { LoginPage } from '../pages/login/login';
+┊  ┊ 8┊import { PhoneService } from '../services/phone';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@NgModule({
 ┊10┊11┊  declarations: [
```
```diff
@@ -24,6 +25,9 @@
 ┊24┊25┊    MessagesPage,
 ┊25┊26┊    LoginPage
 ┊26┊27┊  ],
-┊27┊  ┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
+┊  ┊28┊  providers: [
+┊  ┊29┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
+┊  ┊30┊    PhoneService
+┊  ┊31┊  ]
 ┊28┊32┊})
 ┊29┊33┊export class AppModule {}
```
[}]: #

Now that we use Meteor accounts features in our client side, we also need to make sure that the TypeScript compiler know this package, so let's import it into the typescript config file:

[{]: <helper> (diff_step 7.16)
#### Step 7.16: Added meteor accounts typings to client side

##### Changed tsconfig.json
```diff
@@ -21,7 +21,8 @@
 ┊21┊21┊    "noImplicitAny": false,
 ┊22┊22┊    "types": [
 ┊23┊23┊      "meteor-typings",
-┊24┊  ┊      "@types/underscore"
+┊  ┊24┊      "@types/underscore",
+┊  ┊25┊      "@types/meteor-accounts-phone"
 ┊25┊26┊    ]
 ┊26┊27┊  },
 ┊27┊28┊  "include": [
```
[}]: #

Let's continue to our `VerificationPage`.

Logic is pretty much the same as in the login component.

[{]: <helper> (diff_step 7.17)
#### Step 7.17: Added verification component

##### Added src/pages/verification/verification.ts
```diff
@@ -0,0 +1,48 @@
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
+┊  ┊ 2┊import { AlertController, NavController, NavParams } from 'ionic-angular';
+┊  ┊ 3┊import { PhoneService } from '../../services/phone';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  selector: 'verification',
+┊  ┊ 7┊  templateUrl: 'verification.html'
+┊  ┊ 8┊})
+┊  ┊ 9┊export class VerificationPage implements OnInit {
+┊  ┊10┊  private code: string = '';
+┊  ┊11┊  private phone: string;
+┊  ┊12┊
+┊  ┊13┊  constructor(
+┊  ┊14┊    private alertCtrl: AlertController,
+┊  ┊15┊    private navCtrl: NavController,
+┊  ┊16┊    private navParams: NavParams,
+┊  ┊17┊    private phoneService: PhoneService
+┊  ┊18┊  ) {}
+┊  ┊19┊
+┊  ┊20┊  ngOnInit() {
+┊  ┊21┊    this.phone = this.navParams.get('phone');
+┊  ┊22┊  }
+┊  ┊23┊
+┊  ┊24┊  onInputKeypress({keyCode}: KeyboardEvent): void {
+┊  ┊25┊    if (keyCode === 13) {
+┊  ┊26┊      this.verify();
+┊  ┊27┊    }
+┊  ┊28┊  }
+┊  ┊29┊
+┊  ┊30┊  verify(): void {
+┊  ┊31┊    this.phoneService.login(this.phone, this.code)
+┊  ┊32┊    .catch((e) => {
+┊  ┊33┊      this.handleError(e);
+┊  ┊34┊    });
+┊  ┊35┊  }
+┊  ┊36┊
+┊  ┊37┊  handleError(e: Error): void {
+┊  ┊38┊    console.error(e);
+┊  ┊39┊
+┊  ┊40┊    const alert = this.alertCtrl.create({
+┊  ┊41┊      title: 'Oops!',
+┊  ┊42┊      message: e.message,
+┊  ┊43┊      buttons: ['OK']
+┊  ┊44┊    });
+┊  ┊45┊
+┊  ┊46┊    alert.present();
+┊  ┊47┊  }
+┊  ┊48┊}
```
[}]: #

[{]: <helper> (diff_step 7.18)
#### Step 7.18: Added verification template

##### Added src/pages/verification/verification.html
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Verification</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="verify-button" (click)="verify()">Verify</button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-navbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content padding class="verification-page-content">
+┊  ┊12┊  <div class="instructions">
+┊  ┊13┊    <div>
+┊  ┊14┊      An SMS message with the verification code has been sent to {{phone}}.
+┊  ┊15┊    </div>
+┊  ┊16┊    <br>
+┊  ┊17┊    <div>
+┊  ┊18┊      To proceed, please enter the 4-digit verification code below.
+┊  ┊19┊    </div>
+┊  ┊20┊  </div>
+┊  ┊21┊
+┊  ┊22┊  <ion-item>
+┊  ┊23┊    <ion-input [(ngModel)]="code" (keypress)="onInputKeypress($event)" type="tel" placeholder="Your verification code"></ion-input>
+┊  ┊24┊  </ion-item>
+┊  ┊25┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 7.19)
#### Step 7.19: Added stylesheet for verification component

##### Added src/pages/verification/verification.scss
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊.verification-page-content {
+┊  ┊ 2┊  .instructions {
+┊  ┊ 3┊    text-align: center;
+┊  ┊ 4┊    font-size: medium;
+┊  ┊ 5┊    margin: 50px;
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  .text-input {
+┊  ┊ 9┊    text-align: center;
+┊  ┊10┊  }
+┊  ┊11┊}
```
[}]: #

And add it to the NgModule:

[{]: <helper> (diff_step 7.20)
#### Step 7.20: Import verification component

##### Changed src/app/app.module.ts
```diff
@@ -6,13 +6,15 @@
 ┊ 6┊ 6┊import { MessagesPage } from '../pages/messages/messages';
 ┊ 7┊ 7┊import { LoginPage } from '../pages/login/login';
 ┊ 8┊ 8┊import { PhoneService } from '../services/phone';
+┊  ┊ 9┊import { VerificationPage } from '../pages/verification/verification';
 ┊ 9┊10┊
 ┊10┊11┊@NgModule({
 ┊11┊12┊  declarations: [
 ┊12┊13┊    MyApp,
 ┊13┊14┊    ChatsPage,
 ┊14┊15┊    MessagesPage,
-┊15┊  ┊    LoginPage
+┊  ┊16┊    LoginPage,
+┊  ┊17┊    VerificationPage
 ┊16┊18┊  ],
 ┊17┊19┊  imports: [
 ┊18┊20┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -23,7 +25,8 @@
 ┊23┊25┊    MyApp,
 ┊24┊26┊    ChatsPage,
 ┊25┊27┊    MessagesPage,
-┊26┊  ┊    LoginPage
+┊  ┊28┊    LoginPage,
+┊  ┊29┊    VerificationPage
 ┊27┊30┊  ],
 ┊28┊31┊  providers: [
 ┊29┊32┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
```
[}]: #

And now let's implement `login` method, which we used in `VerificationPage` to login our user with his phone number and code:

[{]: <helper> (diff_step 7.21)
#### Step 7.21: Implement login method

##### Changed src/services/phone.ts
```diff
@@ -18,4 +18,16 @@
 ┊18┊18┊      });
 ┊19┊19┊    });
 ┊20┊20┊  }
+┊  ┊21┊
+┊  ┊22┊  login(phoneNumber: string, code: string): Promise<void> {
+┊  ┊23┊    return new Promise<void>((resolve, reject) => {
+┊  ┊24┊      Accounts.verifyPhone(phoneNumber, code, (e: Error) => {
+┊  ┊25┊        if (e) {
+┊  ┊26┊          return reject(e);
+┊  ┊27┊        }
+┊  ┊28┊
+┊  ┊29┊        resolve();
+┊  ┊30┊      });
+┊  ┊31┊    });
+┊  ┊32┊  }
 ┊21┊33┊}
```
[}]: #

And now that we have the `VerificationComponent` we can use it inside the `LoginComponent`:

[{]: <helper> (diff_step 7.22)
#### Step 7.22: Import and use verfication page from login

##### Changed src/pages/login/login.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import { Component } from '@angular/core';
 ┊2┊2┊import { Alert, AlertController, NavController } from 'ionic-angular';
 ┊3┊3┊import { PhoneService } from '../../services/phone';
+┊ ┊4┊import { VerificationPage } from '../verification/verification';
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  selector: 'login',
```
```diff
@@ -47,6 +48,11 @@
 ┊47┊48┊    alert.dismiss().then(() => {
 ┊48┊49┊      return this.phoneService.verify(this.phone);
 ┊49┊50┊    })
+┊  ┊51┊      .then(() => {
+┊  ┊52┊        this.navCtrl.push(VerificationPage, {
+┊  ┊53┊          phone: this.phone
+┊  ┊54┊        });
+┊  ┊55┊      })
 ┊50┊56┊    .catch((e) => {
 ┊51┊57┊      this.handleError(e);
 ┊52┊58┊    });
```
[}]: #

Last step of our authentication pattern is to pickup a name. We will create a `Profile` interface so the compiler can recognize profile-data structures:

[{]: <helper> (diff_step 7.23)
#### Step 7.23: Add profile interface

##### Changed api/server/models.ts
```diff
@@ -1,3 +1,8 @@
+┊ ┊1┊export interface Profile {
+┊ ┊2┊  name?: string;
+┊ ┊3┊  picture?: string;
+┊ ┊4┊}
+┊ ┊5┊
 ┊1┊6┊export enum MessageType {
 ┊2┊7┊  TEXT = <any>'text'
 ┊3┊8┊}
```
[}]: #

And let's create the `ProfileComponent`:

[{]: <helper> (diff_step 7.24)
#### Step 7.24: Add profile component

##### Added src/pages/profile/profile.ts
```diff
@@ -0,0 +1,48 @@
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
+┊  ┊ 2┊import { Profile } from 'api/models';
+┊  ┊ 3┊import { AlertController, NavController } from 'ionic-angular';
+┊  ┊ 4┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 5┊import { ChatsPage } from '../chats/chats';
+┊  ┊ 6┊
+┊  ┊ 7┊@Component({
+┊  ┊ 8┊  selector: 'profile',
+┊  ┊ 9┊  templateUrl: 'profile.html'
+┊  ┊10┊})
+┊  ┊11┊export class ProfilePage implements OnInit {
+┊  ┊12┊  picture: string;
+┊  ┊13┊  profile: Profile;
+┊  ┊14┊
+┊  ┊15┊  constructor(
+┊  ┊16┊    private alertCtrl: AlertController,
+┊  ┊17┊    private navCtrl: NavController
+┊  ┊18┊  ) {}
+┊  ┊19┊
+┊  ┊20┊  ngOnInit(): void {
+┊  ┊21┊    this.profile = Meteor.user().profile || {
+┊  ┊22┊      name: ''
+┊  ┊23┊    };
+┊  ┊24┊  }
+┊  ┊25┊
+┊  ┊26┊  updateProfile(): void {
+┊  ┊27┊    MeteorObservable.call('updateProfile', this.profile).subscribe({
+┊  ┊28┊      next: () => {
+┊  ┊29┊        this.navCtrl.push(ChatsPage);
+┊  ┊30┊      },
+┊  ┊31┊      error: (e: Error) => {
+┊  ┊32┊        this.handleError(e);
+┊  ┊33┊      }
+┊  ┊34┊    });
+┊  ┊35┊  }
+┊  ┊36┊
+┊  ┊37┊  handleError(e: Error): void {
+┊  ┊38┊    console.error(e);
+┊  ┊39┊
+┊  ┊40┊    const alert = this.alertCtrl.create({
+┊  ┊41┊      title: 'Oops!',
+┊  ┊42┊      message: e.message,
+┊  ┊43┊      buttons: ['OK']
+┊  ┊44┊    });
+┊  ┊45┊
+┊  ┊46┊    alert.present();
+┊  ┊47┊  }
+┊  ┊48┊}
```
[}]: #

[{]: <helper> (diff_step 7.25)
#### Step 7.25: Add profile template

##### Added src/pages/profile/profile.html
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Profile</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="done-button" (click)="updateProfile()">Done</button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-navbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content class="profile-page-content">
+┊  ┊12┊  <div class="profile-picture">
+┊  ┊13┊    <img *ngIf="picture" [src]="picture">
+┊  ┊14┊  </div>
+┊  ┊15┊
+┊  ┊16┊  <ion-item class="profile-name">
+┊  ┊17┊    <ion-label stacked>Name</ion-label>
+┊  ┊18┊    <ion-input [(ngModel)]="profile.name" placeholder="Your name"></ion-input>
+┊  ┊19┊  </ion-item>
+┊  ┊20┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 7.26)
#### Step 7.26: Add profile component style

##### Added src/pages/profile/profile.scss
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊.profile-page-content {
+┊  ┊ 2┊  .profile-picture {
+┊  ┊ 3┊    max-width: 300px;
+┊  ┊ 4┊    display: block;
+┊  ┊ 5┊    margin: auto;
+┊  ┊ 6┊
+┊  ┊ 7┊    img {
+┊  ┊ 8┊      margin-bottom: -33px;
+┊  ┊ 9┊      width: 100%;
+┊  ┊10┊    }
+┊  ┊11┊
+┊  ┊12┊    ion-icon {
+┊  ┊13┊      float: right;
+┊  ┊14┊      font-size: 30px;
+┊  ┊15┊      opacity: 0.5;
+┊  ┊16┊      border-left: black solid 1px;
+┊  ┊17┊      padding-left: 5px;
+┊  ┊18┊    }
+┊  ┊19┊  }
+┊  ┊20┊}
```
[}]: #

Now let's use it inside our `VerificationPage`, because we want to redirect to the profile page after a sucessfull login:

[{]: <helper> (diff_step 7.27)
#### Step 7.27: Use profile component in verification page

##### Changed src/pages/verification/verification.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
 ┊2┊2┊import { AlertController, NavController, NavParams } from 'ionic-angular';
 ┊3┊3┊import { PhoneService } from '../../services/phone';
+┊ ┊4┊import { ProfilePage } from '../profile/profile';
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  selector: 'verification',
```
```diff
@@ -28,7 +29,11 @@
 ┊28┊29┊  }
 ┊29┊30┊
 ┊30┊31┊  verify(): void {
-┊31┊  ┊    this.phoneService.login(this.phone, this.code)
+┊  ┊32┊    this.phoneService.login(this.phone, this.code).then(() => {
+┊  ┊33┊      this.navCtrl.setRoot(ProfilePage, {}, {
+┊  ┊34┊        animate: true
+┊  ┊35┊      });
+┊  ┊36┊    })
 ┊32┊37┊    .catch((e) => {
 ┊33┊38┊      this.handleError(e);
 ┊34┊39┊    });
```
[}]: #

Don't forget to import in into the `NgModule`:

[{]: <helper> (diff_step 7.28 )
#### Step 7.28: Import profile component

##### Changed src/app/app.module.ts
```diff
@@ -7,6 +7,7 @@
 ┊ 7┊ 7┊import { LoginPage } from '../pages/login/login';
 ┊ 8┊ 8┊import { PhoneService } from '../services/phone';
 ┊ 9┊ 9┊import { VerificationPage } from '../pages/verification/verification';
+┊  ┊10┊import { ProfilePage } from '../pages/profile/profile';
 ┊10┊11┊
 ┊11┊12┊@NgModule({
 ┊12┊13┊  declarations: [
```
```diff
@@ -14,7 +15,8 @@
 ┊14┊15┊    ChatsPage,
 ┊15┊16┊    MessagesPage,
 ┊16┊17┊    LoginPage,
-┊17┊  ┊    VerificationPage
+┊  ┊18┊    VerificationPage,
+┊  ┊19┊    ProfilePage
 ┊18┊20┊  ],
 ┊19┊21┊  imports: [
 ┊20┊22┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -26,7 +28,8 @@
 ┊26┊28┊    ChatsPage,
 ┊27┊29┊    MessagesPage,
 ┊28┊30┊    LoginPage,
-┊29┊  ┊    VerificationPage
+┊  ┊31┊    VerificationPage,
+┊  ┊32┊    ProfilePage
 ┊30┊33┊  ],
 ┊31┊34┊  providers: [
 ┊32┊35┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
```
[}]: #

The `ProfileComponent` logic is simple. We call the `updateProfile` method and redirect the user to the `TabsPage` if the action succeeded. 

The `updateProfile` method should look like so:

[{]: <helper> (diff_step 7.29)
#### Step 7.29: Added updateProfile method

##### Changed api/server/methods.ts
```diff
@@ -1,6 +1,6 @@
 ┊1┊1┊import { Chats } from './collections/chats';
 ┊2┊2┊import { Messages } from './collections/messages';
-┊3┊ ┊import { MessageType } from './models';
+┊ ┊3┊import { MessageType, Profile } from './models';
 ┊4┊4┊import { check, Match } from 'meteor/check';
 ┊5┊5┊
 ┊6┊6┊const nonEmptyString = Match.Where((str) => {
```
```diff
@@ -9,6 +9,18 @@
 ┊ 9┊ 9┊});
 ┊10┊10┊
 ┊11┊11┊Meteor.methods({
+┊  ┊12┊  updateProfile(profile: Profile): void {
+┊  ┊13┊    if (!this.userId) throw new Meteor.Error('unauthorized',
+┊  ┊14┊      'User must be logged-in to create a new chat');
+┊  ┊15┊
+┊  ┊16┊    check(profile, {
+┊  ┊17┊      name: nonEmptyString
+┊  ┊18┊    });
+┊  ┊19┊
+┊  ┊20┊    Meteor.users.update(this.userId, {
+┊  ┊21┊      $set: {profile}
+┊  ┊22┊    });
+┊  ┊23┊  },
 ┊12┊24┊  addMessage(type: MessageType, chatId: string, content: string) {
 ┊13┊25┊    check(type, Match.OneOf(String, [ MessageType.TEXT ]));
 ┊14┊26┊    check(chatId, nonEmptyString);
```
[}]: #

If you'll take a look at the constructor's logic of the `ProfileComponent` we set the default profile picture to be one of ionicon's svgs. We need to make sure there is an access point available through the network to that asset. If we'd like to serve files as-is we simply gonna add them to the `www` dir. But first we'll need to update our `.gitignore` file to contain the upcoming changes:

// TODO: Fix this issue somewhere

Our authentication flow is complete! However there are some few adjustments we need to make before we proceed to the next step. 

For the messaging system, each message should have an owner. If a user is logged-in a message document should be inserted with an additional `senderId` field:

[{]: <helper> (diff_step 7.30)
#### Step 7.30: Added restriction on new message method

##### Changed api/server/methods.ts
```diff
@@ -22,6 +22,9 @@
 ┊22┊22┊    });
 ┊23┊23┊  },
 ┊24┊24┊  addMessage(type: MessageType, chatId: string, content: string) {
+┊  ┊25┊    if (!this.userId) throw new Meteor.Error('unauthorized',
+┊  ┊26┊      'User must be logged-in to create a new chat');
+┊  ┊27┊
 ┊25┊28┊    check(type, Match.OneOf(String, [ MessageType.TEXT ]));
 ┊26┊29┊    check(chatId, nonEmptyString);
 ┊27┊30┊    check(content, nonEmptyString);
```
```diff
@@ -36,6 +39,7 @@
 ┊36┊39┊    return {
 ┊37┊40┊      messageId: Messages.collection.insert({
 ┊38┊41┊        chatId: chatId,
+┊  ┊42┊        senderId: this.userId,
 ┊39┊43┊        content: content,
 ┊40┊44┊        createdAt: new Date(),
 ┊41┊45┊        type: type
```
[}]: #

[{]: <helper> (diff_step 7.31)
#### Step 7.31: Added senderId property to Message object

##### Changed api/server/models.ts
```diff
@@ -17,6 +17,7 @@
 ┊17┊17┊export interface Message {
 ┊18┊18┊  _id?: string;
 ┊19┊19┊  chatId?: string;
+┊  ┊20┊  senderId?: string;
 ┊20┊21┊  content?: string;
 ┊21┊22┊  createdAt?: Date;
 ┊22┊23┊  type?: MessageType
```
[}]: #

We can determine message ownership inside the component:

[{]: <helper> (diff_step 7.32)
#### Step 7.32: Use actual ownership of the message

##### Changed src/pages/messages/messages.ts
```diff
@@ -18,6 +18,7 @@
 ┊18┊18┊  message: string = '';
 ┊19┊19┊  autoScroller: MutationObserver;
 ┊20┊20┊  scrollOffset = 0;
+┊  ┊21┊  senderId: string;
 ┊21┊22┊
 ┊22┊23┊  constructor(
 ┊23┊24┊    navParams: NavParams,
```
```diff
@@ -26,6 +27,7 @@
 ┊26┊27┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊27┊28┊    this.title = this.selectedChat.title;
 ┊28┊29┊    this.picture = this.selectedChat.picture;
+┊  ┊30┊    this.senderId = Meteor.userId();
 ┊29┊31┊  }
 ┊30┊32┊
 ┊31┊33┊  private get messagesPageContent(): Element {
```
```diff
@@ -55,8 +57,6 @@
 ┊55┊57┊  }
 ┊56┊58┊
 ┊57┊59┊  findMessagesDayGroups() {
-┊58┊  ┊    let isEven = false;
-┊59┊  ┊
 ┊60┊60┊    return Messages.find({
 ┊61┊61┊      chatId: this.selectedChat._id
 ┊62┊62┊    }, {
```
```diff
@@ -67,8 +67,7 @@
 ┊67┊67┊
 ┊68┊68┊        // Compose missing data that we would like to show in the view
 ┊69┊69┊        messages.forEach((message) => {
-┊70┊  ┊          message.ownership = isEven ? 'mine' : 'other';
-┊71┊  ┊          isEven = !isEven;
+┊  ┊70┊          message.ownership = this.senderId == message.senderId ? 'mine' : 'other';
 ┊72┊71┊
 ┊73┊72┊          return message;
 ┊74┊73┊        });
```
[}]: #

## Chat Options Menu

Now we're going to add the abilities to log-out and edit our profile as well, which are going to be presented to us using a popover. Let's show a [popover](http://ionicframework.com/docs/v2/components/#popovers) any time we press on the options icon in the top right corner of the chats view.

A popover, just like a page in our app, consists of a component, view, and style:

[{]: <helper> (diff_step 7.33)
#### Step 7.33: Add chat options component

##### Added src/pages/chats/chats-options.ts
```diff
@@ -0,0 +1,75 @@
+┊  ┊ 1┊import { Component, Injectable } from '@angular/core';
+┊  ┊ 2┊import { Alert, AlertController, NavController, ViewController } from 'ionic-angular';
+┊  ┊ 3┊import { PhoneService } from '../../services/phone';
+┊  ┊ 4┊import { LoginPage } from '../login/login';
+┊  ┊ 5┊import { ProfilePage } from '../profile/profile';
+┊  ┊ 6┊
+┊  ┊ 7┊@Component({
+┊  ┊ 8┊  selector: 'chats-options',
+┊  ┊ 9┊  templateUrl: 'chats-options.html'
+┊  ┊10┊})
+┊  ┊11┊@Injectable()
+┊  ┊12┊export class ChatsOptionsComponent {
+┊  ┊13┊  constructor(
+┊  ┊14┊    private alertCtrl: AlertController,
+┊  ┊15┊    private navCtrl: NavController,
+┊  ┊16┊    private phoneService: PhoneService,
+┊  ┊17┊    private viewCtrl: ViewController
+┊  ┊18┊  ) {}
+┊  ┊19┊
+┊  ┊20┊  editProfile(): void {
+┊  ┊21┊    this.viewCtrl.dismiss().then(() => {
+┊  ┊22┊      this.navCtrl.push(ProfilePage);
+┊  ┊23┊    });
+┊  ┊24┊  }
+┊  ┊25┊
+┊  ┊26┊  logout(): void {
+┊  ┊27┊    const alert = this.alertCtrl.create({
+┊  ┊28┊      title: 'Logout',
+┊  ┊29┊      message: 'Are you sure you would like to proceed?',
+┊  ┊30┊      buttons: [
+┊  ┊31┊        {
+┊  ┊32┊          text: 'Cancel',
+┊  ┊33┊          role: 'cancel'
+┊  ┊34┊        },
+┊  ┊35┊        {
+┊  ┊36┊          text: 'Yes',
+┊  ┊37┊          handler: () => {
+┊  ┊38┊            this.handleLogout(alert);
+┊  ┊39┊            return false;
+┊  ┊40┊          }
+┊  ┊41┊        }
+┊  ┊42┊      ]
+┊  ┊43┊    });
+┊  ┊44┊
+┊  ┊45┊    this.viewCtrl.dismiss().then(() => {
+┊  ┊46┊      alert.present();
+┊  ┊47┊    });
+┊  ┊48┊  }
+┊  ┊49┊
+┊  ┊50┊  handleLogout(alert: Alert): void {
+┊  ┊51┊    alert.dismiss().then(() => {
+┊  ┊52┊      return this.phoneService.logout();
+┊  ┊53┊    })
+┊  ┊54┊    .then(() => {
+┊  ┊55┊      this.navCtrl.setRoot(LoginPage, {}, {
+┊  ┊56┊        animate: true
+┊  ┊57┊      });
+┊  ┊58┊    })
+┊  ┊59┊    .catch((e) => {
+┊  ┊60┊      this.handleError(e);
+┊  ┊61┊    });
+┊  ┊62┊  }
+┊  ┊63┊
+┊  ┊64┊  handleError(e: Error): void {
+┊  ┊65┊    console.error(e);
+┊  ┊66┊
+┊  ┊67┊    const alert = this.alertCtrl.create({
+┊  ┊68┊      title: 'Oops!',
+┊  ┊69┊      message: e.message,
+┊  ┊70┊      buttons: ['OK']
+┊  ┊71┊    });
+┊  ┊72┊
+┊  ┊73┊    alert.present();
+┊  ┊74┊  }
+┊  ┊75┊}
```
[}]: #

[{]: <helper> (diff_step 7.34)
#### Step 7.34: Added chats options template

##### Added src/pages/chats/chats-options.html
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊<ion-content class="chats-options-page-content">
+┊  ┊ 2┊  <ion-list class="options">
+┊  ┊ 3┊    <button ion-item class="option option-profile" (click)="editProfile()">
+┊  ┊ 4┊      <ion-icon name="contact" class="option-icon"></ion-icon>
+┊  ┊ 5┊      <div class="option-name">Profile</div>
+┊  ┊ 6┊    </button>
+┊  ┊ 7┊
+┊  ┊ 8┊    <button ion-item class="option option-logout" (click)="logout()">
+┊  ┊ 9┊      <ion-icon name="log-out" class="option-icon"></ion-icon>
+┊  ┊10┊      <div class="option-name">Logout</div>
+┊  ┊11┊    </button>
+┊  ┊12┊  </ion-list>
+┊  ┊13┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 7.35)
#### Step 7.35: Added chat options stylesheets

##### Added src/pages/chats/chats-options.scss
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

And import it:

[{]: <helper> (diff_step 7.36)
#### Step 7.36: Import chat options

##### Changed src/app/app.module.ts
```diff
@@ -8,6 +8,7 @@
 ┊ 8┊ 8┊import { PhoneService } from '../services/phone';
 ┊ 9┊ 9┊import { VerificationPage } from '../pages/verification/verification';
 ┊10┊10┊import { ProfilePage } from '../pages/profile/profile';
+┊  ┊11┊import { ChatsOptionsComponent } from '../pages/chats/chats-options';
 ┊11┊12┊
 ┊12┊13┊@NgModule({
 ┊13┊14┊  declarations: [
```
```diff
@@ -16,7 +17,8 @@
 ┊16┊17┊    MessagesPage,
 ┊17┊18┊    LoginPage,
 ┊18┊19┊    VerificationPage,
-┊19┊  ┊    ProfilePage
+┊  ┊20┊    ProfilePage,
+┊  ┊21┊    ChatsOptionsComponent
 ┊20┊22┊  ],
 ┊21┊23┊  imports: [
 ┊22┊24┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -29,7 +31,8 @@
 ┊29┊31┊    MessagesPage,
 ┊30┊32┊    LoginPage,
 ┊31┊33┊    VerificationPage,
-┊32┊  ┊    ProfilePage
+┊  ┊34┊    ProfilePage,
+┊  ┊35┊    ChatsOptionsComponent
 ┊33┊36┊  ],
 ┊34┊37┊  providers: [
 ┊35┊38┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
```
[}]: #

And because we have a logout feature now, let's implement it's logic in `PhoneService`:

[{]: <helper> (diff_step 7.37)
#### Step 7.37: Implement logout method

##### Changed src/services/phone.ts
```diff
@@ -1,5 +1,6 @@
 ┊1┊1┊import { Injectable } from '@angular/core';
 ┊2┊2┊import { Accounts } from 'meteor/accounts-base';
+┊ ┊3┊import { Meteor } from 'meteor/meteor';
 ┊3┊4┊
 ┊4┊5┊@Injectable()
 ┊5┊6┊export class PhoneService {
```
```diff
@@ -30,4 +31,16 @@
 ┊30┊31┊      });
 ┊31┊32┊    });
 ┊32┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  logout(): Promise<void> {
+┊  ┊36┊    return new Promise<void>((resolve, reject) => {
+┊  ┊37┊      Meteor.logout((e: Error) => {
+┊  ┊38┊        if (e) {
+┊  ┊39┊          return reject(e);
+┊  ┊40┊        }
+┊  ┊41┊
+┊  ┊42┊        resolve();
+┊  ┊43┊      });
+┊  ┊44┊    });
+┊  ┊45┊  }
 ┊33┊46┊}
```
[}]: #

Now let's use it inside the `ChatsPage`:

[{]: <helper> (diff_step 7.38)
#### Step 7.38: Added showOptions method

##### Changed src/pages/chats/chats.ts
```diff
@@ -2,8 +2,9 @@
 ┊ 2┊ 2┊import { Observable } from 'rxjs';
 ┊ 3┊ 3┊import { Chat } from 'api/models';
 ┊ 4┊ 4┊import { Chats, Messages } from 'api/collections';
-┊ 5┊  ┊import { NavController } from 'ionic-angular';
+┊  ┊ 5┊import { NavController, PopoverController } from 'ionic-angular';
 ┊ 6┊ 6┊import { MessagesPage } from '../messages/messages';
+┊  ┊ 7┊import { ChatsOptionsComponent } from './chats-options';
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@Component({
 ┊ 9┊10┊  templateUrl: 'chats.html'
```
```diff
@@ -11,7 +12,9 @@
 ┊11┊12┊export class ChatsPage implements OnInit {
 ┊12┊13┊  chats;
 ┊13┊14┊
-┊14┊  ┊  constructor(private navCtrl: NavController) {
+┊  ┊15┊  constructor(
+┊  ┊16┊    private navCtrl: NavController,
+┊  ┊17┊    private popoverCtrl: PopoverController) {
 ┊15┊18┊  }
 ┊16┊19┊
 ┊17┊20┊  ngOnInit() {
```
```diff
@@ -40,4 +43,12 @@
 ┊40┊43┊    Chats.remove({_id: chat._id}).subscribe(() => {
 ┊41┊44┊    });
 ┊42┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  showOptions(): void {
+┊  ┊48┊    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, {
+┊  ┊49┊      cssClass: 'options-popover chats-options-popover'
+┊  ┊50┊    });
+┊  ┊51┊
+┊  ┊52┊    popover.present();
+┊  ┊53┊  }
 ┊43┊54┊}
```
[}]: #

And let's add an event handler in the view which will show the popover:

[{]: <helper> (diff_step 7.39)
#### Step 7.39: Bind click event to showOptions method

##### Changed src/pages/chats/chats.html
```diff
@@ -7,7 +7,7 @@
 ┊ 7┊ 7┊      <button ion-button icon-only class="add-chat-button">
 ┊ 8┊ 8┊        <ion-icon name="person-add"></ion-icon>
 ┊ 9┊ 9┊      </button>
-┊10┊  ┊      <button ion-button icon-only class="options-button">
+┊  ┊10┊      <button ion-button icon-only class="options-button" (click)="showOptions()">
 ┊11┊11┊        <ion-icon name="more"></ion-icon>
 ┊12┊12┊      </button>
 ┊13┊13┊    </ion-buttons>
```
[}]: #

As for now, once you click on the options icon in the chats view, the popover should appear in the middle of the screen. To fix it, we simply gonna edit the `scss` file of the chats page:

[{]: <helper> (diff_step 7.40)
#### Step 7.40: Added chat options popover stylesheet

##### Changed src/app/app.scss
```diff
@@ -14,3 +14,16 @@
 ┊14┊14┊// To declare rules for a specific mode, create a child rule
 ┊15┊15┊// for the .md, .ios, or .wp mode classes. The mode class is
 ┊16┊16┊// automatically applied to the <body> element in the app.
+┊  ┊17┊
+┊  ┊18┊// Options Popover Component
+┊  ┊19┊// --------------------------------------------------
+┊  ┊20┊
+┊  ┊21┊$options-popover-width: 200px;
+┊  ┊22┊$options-popover-margin: 5px;
+┊  ┊23┊
+┊  ┊24┊.options-popover .popover-content {
+┊  ┊25┊  width: $options-popover-width;
+┊  ┊26┊  transform-origin: right top 0px !important;
+┊  ┊27┊  left: calc(100% - #{$options-popover-width} - #{$options-popover-margin}) !important;
+┊  ┊28┊  top: $options-popover-margin !important;
+┊  ┊29┊}
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step6.md) | [Next Step >](step8.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #