[{]: <region> (header)
# Step 13: Native Mobile
[}]: #
[{]: <region> (body)
So in this step, we will focus on editing more native device features, provided by Ionic 2 API. 

## Phone Number and SIM

Ionic 2 expose access to the SIM card the the current active phone number - we will use this number and set it as the initial value for the login page.

So let's start by getting access to the SIM card, and fetch the phone number:

[{]: <helper> (diff_step 13.1)
#### Step 13.1: Implement getNumber with native ionic

##### Changed src/services/phone.ts
```diff
@@ -1,13 +1,26 @@
 ┊ 1┊ 1┊import { Injectable } from '@angular/core';
 ┊ 2┊ 2┊import { Accounts } from 'meteor/accounts-base';
 ┊ 3┊ 3┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 4┊import { Platform } from 'ionic-angular';
+┊  ┊ 5┊import { Sim } from 'ionic-native';
 ┊ 4┊ 6┊
 ┊ 5┊ 7┊@Injectable()
 ┊ 6┊ 8┊export class PhoneService {
-┊ 7┊  ┊  constructor() {
+┊  ┊ 9┊  constructor(private platform: Platform) {
 ┊ 8┊10┊
 ┊ 9┊11┊  }
 ┊10┊12┊
+┊  ┊13┊  getNumber(): Promise<string> {
+┊  ┊14┊    if (!this.platform.is('cordova') ||
+┊  ┊15┊      !this.platform.is('mobile')) {
+┊  ┊16┊      return Promise.resolve('');
+┊  ┊17┊    }
+┊  ┊18┊
+┊  ┊19┊    return Sim.getSimInfo().then((info) => {
+┊  ┊20┊      return '+' + info.phoneNumber;
+┊  ┊21┊    });
+┊  ┊22┊  }
+┊  ┊23┊
 ┊11┊24┊  verify(phoneNumber: string): Promise<void> {
 ┊12┊25┊    return new Promise<void>((resolve, reject) => {
 ┊13┊26┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) => {
```
[}]: #

And now use the new method inside the `Login` page:

[{]: <helper> (diff_step 13.2)
#### Step 13.2: Use getNumber native method

##### Changed src/pages/login/login.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import { Component } from '@angular/core';
+┊ ┊1┊import { Component, AfterContentInit } from '@angular/core';
 ┊2┊2┊import { Alert, AlertController, NavController } from 'ionic-angular';
 ┊3┊3┊import { PhoneService } from '../../services/phone';
 ┊4┊4┊import { VerificationPage } from '../verification/verification';
```
```diff
@@ -7,7 +7,7 @@
 ┊ 7┊ 7┊  selector: 'login',
 ┊ 8┊ 8┊  templateUrl: 'login.html'
 ┊ 9┊ 9┊})
-┊10┊  ┊export class LoginPage {
+┊  ┊10┊export class LoginPage implements AfterContentInit {
 ┊11┊11┊  private phone = '';
 ┊12┊12┊
 ┊13┊13┊  constructor(
```
```diff
@@ -16,6 +16,14 @@
 ┊16┊16┊    private navCtrl: NavController
 ┊17┊17┊  ) {}
 ┊18┊18┊
+┊  ┊19┊  ngAfterContentInit() {
+┊  ┊20┊    this.phoneService.getNumber().then((phone) => {
+┊  ┊21┊      if (phone) {
+┊  ┊22┊        this.login(phone);
+┊  ┊23┊      }
+┊  ┊24┊    });
+┊  ┊25┊  }
+┊  ┊26┊
 ┊19┊27┊  onInputKeypress({keyCode}: KeyboardEvent): void {
 ┊20┊28┊    if (keyCode === 13) {
 ┊21┊29┊      this.login();
```
[}]: #

We also need to add the required Cordova plugin:

[{]: <helper> (diff_step 13.3)
#### Step 13.3: Add cordova plugin for sim access

##### Changed package.json
```diff
@@ -54,6 +54,7 @@
 ┊54┊54┊    "cordova-plugin-statusbar",
 ┊55┊55┊    "cordova-plugin-device",
 ┊56┊56┊    "cordova-plugin-geolocation",
+┊  ┊57┊    "cordova-plugin-sim",
 ┊57┊58┊    "ionic-plugin-keyboard",
 ┊58┊59┊    "cordova-plugin-splashscreen",
 ┊59┊60┊    "https://github.com/Telerik-Verified-Plugins/ImagePicker"
```
[}]: #


## Camera

Next - we will get access to the device's camera and send the taken images.

Start by adding the required Cordova plugin to access the camera:

[{]: <helper> (diff_step 13.4)
#### Step 13.4: Added cordova plugin for camera

##### Changed package.json
```diff
@@ -49,6 +49,7 @@
 ┊49┊49┊    "typescript-extends": "^1.0.1"
 ┊50┊50┊  },
 ┊51┊51┊  "cordovaPlugins": [
+┊  ┊52┊    "cordova-plugin-camera",
 ┊52┊53┊    "cordova-plugin-whitelist",
 ┊53┊54┊    "cordova-plugin-console",
 ┊54┊55┊    "cordova-plugin-statusbar",
```
[}]: #

And bind click event in attachment menu:

[{]: <helper> (diff_step 13.5)
#### Step 13.5: Added click event for takePicture

##### Changed src/pages/messages/messages-attachments.html
```diff
@@ -5,7 +5,7 @@
 ┊ 5┊ 5┊      <div class="attachment-name">Gallery</div>
 ┊ 6┊ 6┊    </button>
 ┊ 7┊ 7┊
-┊ 8┊  ┊    <button ion-item class="attachment attachment-camera">
+┊  ┊ 8┊    <button ion-item class="attachment attachment-camera" (click)="takePicture()">
 ┊ 9┊ 9┊      <ion-icon name="camera" class="attachment-icon"></ion-icon>
 ┊10┊10┊      <div class="attachment-name">Camera</div>
 ┊11┊11┊    </button>
```
[}]: #

And implement this method using `Camera` util of Ionic:

[{]: <helper> (diff_step 13.6)
#### Step 13.6: Implement takePicture

##### Changed src/pages/messages/messages-attachments.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { NewLocationMessageComponent } from './location-message';
 ┊4┊4┊import { MessageType } from 'api/models';
 ┊5┊5┊import { PictureService } from '../../services/picture';
+┊ ┊6┊import { Camera } from 'ionic-native';
 ┊6┊7┊
 ┊7┊8┊@Component({
 ┊8┊9┊  selector: 'messages-attachments',
```
```diff
@@ -26,6 +27,21 @@
 ┊26┊27┊    });
 ┊27┊28┊  }
 ┊28┊29┊
+┊  ┊30┊  takePicture(): void {
+┊  ┊31┊    if (!this.platform.is('cordova')) {
+┊  ┊32┊      return console.warn('Device must run cordova in order to take pictures');
+┊  ┊33┊    }
+┊  ┊34┊
+┊  ┊35┊    Camera.getPicture().then((dataURI) => {
+┊  ┊36┊      const blob = this.pictureService.convertDataURIToBlob(dataURI);
+┊  ┊37┊
+┊  ┊38┊      this.viewCtrl.dismiss({
+┊  ┊39┊        messageType: MessageType.PICTURE,
+┊  ┊40┊        selectedPicture: blob
+┊  ┊41┊      });
+┊  ┊42┊    });
+┊  ┊43┊  }
+┊  ┊44┊
 ┊29┊45┊  sendLocation(): void {
 ┊30┊46┊    const locationModal = this.modelCtrl.create(NewLocationMessageComponent);
 ┊31┊47┊    locationModal.onDidDismiss((location) => {
```
[}]: #

> We use the same API for uploading image, which we used in the previous step, and just upload it as-is.

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step12.md) | [Next Step >](step14.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #