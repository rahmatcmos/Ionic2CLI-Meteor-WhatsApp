[{]: <region> (header)
# Step 11: Google Maps & Geolocation
[}]: #
[{]: <region> (body)
Our next step is to add a new type of message using geolocation and Google Maps. 

## Geo Location

So let's start by getting access to the device's location by adding Cordova plugin:

[{]: <helper> (diff_step 11.1)
#### Step 11.1: Add cordova plugin for geolocation

##### Changed package.json
```diff
@@ -51,6 +51,7 @@
 ┊51┊51┊    "cordova-plugin-console",
 ┊52┊52┊    "cordova-plugin-statusbar",
 ┊53┊53┊    "cordova-plugin-device",
+┊  ┊54┊    "cordova-plugin-geolocation",
 ┊54┊55┊    "ionic-plugin-keyboard",
 ┊55┊56┊    "cordova-plugin-splashscreen"
 ┊56┊57┊  ],
```
[}]: #

## Angular 2 Google Maps

Now, add Angular 2 Google Maps package:

  $ npm install --save angular2-google-maps
  
And import it into your `NgModule`, and make sure to use your API key for Google Maps ([more instructions here](https://developers.google.com/maps/documentation/javascript/get-api-key)).  

[{]: <helper> (diff_step 11.3)
#### Step 11.3: Import google maps module

##### Changed src/app/app.module.ts
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊import { ChatsOptionsComponent } from '../pages/chats/chats-options';
 ┊12┊12┊import { NewChatComponent } from '../pages/chats/new-chat';
 ┊13┊13┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
+┊  ┊14┊import { AgmCoreModule } from 'angular2-google-maps/core';
 ┊14┊15┊
 ┊15┊16┊@NgModule({
 ┊16┊17┊  declarations: [
```
```diff
@@ -26,7 +27,10 @@
 ┊26┊27┊  ],
 ┊27┊28┊  imports: [
 ┊28┊29┊    IonicModule.forRoot(MyApp),
-┊29┊  ┊    MomentModule
+┊  ┊30┊    MomentModule,
+┊  ┊31┊    AgmCoreModule.forRoot({
+┊  ┊32┊      apiKey: 'AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA'
+┊  ┊33┊    })
 ┊30┊34┊  ],
 ┊31┊35┊  bootstrap: [IonicApp],
 ┊32┊36┊  entryComponents: [
```
[}]: #

## Attachment Menu

Now, let's add a new message type for location messages:

[{]: <helper> (diff_step 11.4)
#### Step 11.4: Added location message type

##### Changed api/server/models.ts
```diff
@@ -4,7 +4,8 @@
 ┊ 4┊ 4┊}
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊export enum MessageType {
-┊ 7┊  ┊  TEXT = <any>'text'
+┊  ┊ 7┊  TEXT = <any>'text',
+┊  ┊ 8┊  LOCATION = <any>'location'
 ┊ 8┊ 9┊}
 ┊ 9┊10┊
 ┊10┊11┊export interface Chat {
```
[}]: #

We will add a menu for attachments (later we will add more types of messages), so let's create a stub component for that:

[{]: <helper> (diff_step 11.5)
#### Step 11.5: Added stub for messages attachment menu

##### Added src/pages/messages/messages-attachments.ts
```diff
@@ -0,0 +1,15 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { AlertController, Platform, ModalController, ViewController } from 'ionic-angular';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'messages-attachments',
+┊  ┊ 6┊  templateUrl: 'messages-attachments.html'
+┊  ┊ 7┊})
+┊  ┊ 8┊export class MessagesAttachmentsComponent {
+┊  ┊ 9┊  constructor(
+┊  ┊10┊    private alertCtrl: AlertController,
+┊  ┊11┊    private platform: Platform,
+┊  ┊12┊    private viewCtrl: ViewController,
+┊  ┊13┊    private modelCtrl: ModalController
+┊  ┊14┊  ) {}
+┊  ┊15┊}
```
[}]: #

And now the template and styles:

[{]: <helper> (diff_step 11.6)
#### Step 11.6: Added messages attachment menu template

##### Added src/pages/messages/messages-attachments.html
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊<ion-content class="messages-attachments-page-content">
+┊  ┊ 2┊  <ion-list class="attachments">
+┊  ┊ 3┊    <button ion-item class="attachment attachment-gallery">
+┊  ┊ 4┊      <ion-icon name="images" class="attachment-icon"></ion-icon>
+┊  ┊ 5┊      <div class="attachment-name">Gallery</div>
+┊  ┊ 6┊    </button>
+┊  ┊ 7┊
+┊  ┊ 8┊    <button ion-item class="attachment attachment-camera">
+┊  ┊ 9┊      <ion-icon name="camera" class="attachment-icon"></ion-icon>
+┊  ┊10┊      <div class="attachment-name">Camera</div>
+┊  ┊11┊    </button>
+┊  ┊12┊
+┊  ┊13┊    <button ion-item class="attachment attachment-location">
+┊  ┊14┊      <ion-icon name="locate" class="attachment-icon"></ion-icon>
+┊  ┊15┊      <div class="attachment-name">Location</div>
+┊  ┊16┊    </button>
+┊  ┊17┊  </ion-list>
+┊  ┊18┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 11.7)
#### Step 11.7: Added styles for messages attachment

##### Added src/pages/messages/messages-attachments.scss
```diff
@@ -0,0 +1,46 @@
+┊  ┊ 1┊.messages-attachments-page-content {
+┊  ┊ 2┊  $icon-background-size: 60px;
+┊  ┊ 3┊  $icon-font-size: 20pt;
+┊  ┊ 4┊
+┊  ┊ 5┊  .attachments {
+┊  ┊ 6┊    width: 100%;
+┊  ┊ 7┊    margin: 0;
+┊  ┊ 8┊    display: inline-flex;
+┊  ┊ 9┊  }
+┊  ┊10┊
+┊  ┊11┊  .attachment {
+┊  ┊12┊    text-align: center;
+┊  ┊13┊    margin: 0;
+┊  ┊14┊    padding: 0;
+┊  ┊15┊
+┊  ┊16┊    .item-inner {
+┊  ┊17┊      padding: 0
+┊  ┊18┊    }
+┊  ┊19┊
+┊  ┊20┊    .attachment-icon {
+┊  ┊21┊      width: $icon-background-size;
+┊  ┊22┊      height: $icon-background-size;
+┊  ┊23┊      line-height: $icon-background-size;
+┊  ┊24┊      font-size: $icon-font-size;
+┊  ┊25┊      border-radius: 50%;
+┊  ┊26┊      color: white;
+┊  ┊27┊      margin-bottom: 10px
+┊  ┊28┊    }
+┊  ┊29┊
+┊  ┊30┊    .attachment-name {
+┊  ┊31┊      color: gray;
+┊  ┊32┊    }
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  .attachment-gallery .attachment-icon {
+┊  ┊36┊    background: linear-gradient(#e13838 50%, #f53d3d 50%);
+┊  ┊37┊  }
+┊  ┊38┊
+┊  ┊39┊  .attachment-camera .attachment-icon {
+┊  ┊40┊    background: linear-gradient(#3474e1 50%, #387ef5 50%);
+┊  ┊41┊  }
+┊  ┊42┊
+┊  ┊43┊  .attachment-location .attachment-icon {
+┊  ┊44┊    background: linear-gradient(#2ec95c 50%, #32db64 50%);
+┊  ┊45┊  }
+┊  ┊46┊}
```
[}]: #

Add it to your `NgModule`:

[{]: <helper> (diff_step 11.8)
#### Step 11.8: Import MessagesAttachmentsComponent

##### Changed src/app/app.module.ts
```diff
@@ -12,6 +12,7 @@
 ┊12┊12┊import { NewChatComponent } from '../pages/chats/new-chat';
 ┊13┊13┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
 ┊14┊14┊import { AgmCoreModule } from 'angular2-google-maps/core';
+┊  ┊15┊import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
 ┊15┊16┊
 ┊16┊17┊@NgModule({
 ┊17┊18┊  declarations: [
```
```diff
@@ -23,7 +24,8 @@
 ┊23┊24┊    ProfilePage,
 ┊24┊25┊    ChatsOptionsComponent,
 ┊25┊26┊    NewChatComponent,
-┊26┊  ┊    MessagesOptionsComponent
+┊  ┊27┊    MessagesOptionsComponent,
+┊  ┊28┊    MessagesAttachmentsComponent
 ┊27┊29┊  ],
 ┊28┊30┊  imports: [
 ┊29┊31┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -42,7 +44,8 @@
 ┊42┊44┊    ProfilePage,
 ┊43┊45┊    ChatsOptionsComponent,
 ┊44┊46┊    NewChatComponent,
-┊45┊  ┊    MessagesOptionsComponent
+┊  ┊47┊    MessagesOptionsComponent,
+┊  ┊48┊    MessagesAttachmentsComponent
 ┊46┊49┊  ],
 ┊47┊50┊  providers: [
 ┊48┊51┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
```
[}]: #

And let's add styles for the menu wrapper, so it will open in the correct place:

[{]: <helper> (diff_step 11.9)
#### Step 11.9: Added styles for the popover container

##### Changed src/app/app.scss
```diff
@@ -27,3 +27,15 @@
 ┊27┊27┊  left: calc(100% - #{$options-popover-width} - #{$options-popover-margin}) !important;
 ┊28┊28┊  top: $options-popover-margin !important;
 ┊29┊29┊}
+┊  ┊30┊
+┊  ┊31┊// Attachments Popover Component
+┊  ┊32┊// --------------------------------------------------
+┊  ┊33┊
+┊  ┊34┊$attachments-popover-width: 100%;
+┊  ┊35┊
+┊  ┊36┊.attachments-popover .popover-content {
+┊  ┊37┊  width: $attachments-popover-width;
+┊  ┊38┊  transform-origin: 300px 30px !important;
+┊  ┊39┊  left: calc(100% - #{$attachments-popover-width}) !important;
+┊  ┊40┊  top: 58px !important;
+┊  ┊41┊}
```
[}]: #

Let's add a method to open this menu from `Messages` component:

[{]: <helper> (diff_step 11.10)
#### Step 11.10: Add showAttachments method

##### Changed src/pages/messages/messages.ts
```diff
@@ -7,6 +7,7 @@
 ┊ 7┊ 7┊import { _ } from 'meteor/underscore';
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from './messages-options';
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from 'rxjs';
+┊  ┊10┊import { MessagesAttachmentsComponent } from './messages-attachments';
 ┊10┊11┊
 ┊11┊12┊@Component({
 ┊12┊13┊  selector: 'messages-page',
```
```diff
@@ -211,4 +212,18 @@
 ┊211┊212┊      this.message = '';
 ┊212┊213┊    });
 ┊213┊214┊  }
+┊   ┊215┊
+┊   ┊216┊  showAttachments(): void {
+┊   ┊217┊    const popover = this.popoverCtrl.create(MessagesAttachmentsComponent, {
+┊   ┊218┊      chat: this.selectedChat
+┊   ┊219┊    }, {
+┊   ┊220┊      cssClass: 'attachments-popover'
+┊   ┊221┊    });
+┊   ┊222┊
+┊   ┊223┊    popover.onDidDismiss((params) => {
+┊   ┊224┊      // TODO: Handle result
+┊   ┊225┊    });
+┊   ┊226┊
+┊   ┊227┊    popover.present();
+┊   ┊228┊  }
 ┊214┊229┊}
```
[}]: #

And bind it to click event:

[{]: <helper> (diff_step 11.11)
#### Step 11.11: Bind click event to showAttachments

##### Changed src/pages/messages/messages.html
```diff
@@ -7,7 +7,7 @@
 ┊ 7┊ 7┊    <ion-title class="chat-title">{{title}}</ion-title>
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊    <ion-buttons end>
-┊10┊  ┊      <button ion-button icon-only class="attach-button"><ion-icon name="attach"></ion-icon></button>
+┊  ┊10┊      <button ion-button icon-only class="attach-button" (click)="showAttachments()"><ion-icon name="attach"></ion-icon></button>
 ┊11┊11┊      <button ion-button icon-only class="options-button" (click)="showOptions()"><ion-icon name="more"></ion-icon></button>
 ┊12┊12┊    </ion-buttons>
 ┊13┊13┊  </ion-navbar>
```
[}]: #

## Send Location

Now, let's create a new model, that represent `Location`, with lat, lng and zoom properties:

[{]: <helper> (diff_step 11.12)
#### Step 11.12: Added location model

##### Changed api/server/models.ts
```diff
@@ -29,3 +29,9 @@
 ┊29┊29┊export interface User extends Meteor.User {
 ┊30┊30┊  profile?: Profile;
 ┊31┊31┊}
+┊  ┊32┊
+┊  ┊33┊export interface Location {
+┊  ┊34┊  lat: number;
+┊  ┊35┊  lng: number;
+┊  ┊36┊  zoom: number;
+┊  ┊37┊}
```
[}]: #

Next, let's create a Component that will allow us to select the actual location using Geo Location and Google Maps:

[{]: <helper> (diff_step 11.13)
#### Step 11.13: Implement location message component

##### Added src/pages/messages/location-message.ts
```diff
@@ -0,0 +1,75 @@
+┊  ┊ 1┊import { Component, OnInit, OnDestroy } from '@angular/core';
+┊  ┊ 2┊import { ViewController, Platform } from 'ionic-angular';
+┊  ┊ 3┊import { Geolocation } from 'ionic-native';
+┊  ┊ 4┊import { Location } from 'api/models';
+┊  ┊ 5┊import { Observable, Subscription } from 'rxjs';
+┊  ┊ 6┊
+┊  ┊ 7┊const DEFAULT_ZOOM = 8;
+┊  ┊ 8┊const EQUATOR = 40075004;
+┊  ┊ 9┊const DEFAULT_LAT = 51.678418;
+┊  ┊10┊const DEFAULT_LNG = 7.809007;
+┊  ┊11┊const LOCATION_REFRESH_INTERVAL = 500;
+┊  ┊12┊
+┊  ┊13┊@Component({
+┊  ┊14┊  selector: 'location-message',
+┊  ┊15┊  templateUrl: 'location-message.html'
+┊  ┊16┊})
+┊  ┊17┊export class NewLocationMessageComponent implements OnInit, OnDestroy {
+┊  ┊18┊  lat: number = DEFAULT_LAT;
+┊  ┊19┊  lng: number = DEFAULT_LNG;
+┊  ┊20┊  zoom: number = DEFAULT_ZOOM;
+┊  ┊21┊  accuracy: number = -1;
+┊  ┊22┊  intervalObs: Subscription;
+┊  ┊23┊
+┊  ┊24┊  constructor(
+┊  ┊25┊    private viewCtrl: ViewController,
+┊  ┊26┊    private platform: Platform) {
+┊  ┊27┊  }
+┊  ┊28┊
+┊  ┊29┊  ngOnInit() {
+┊  ┊30┊    this.platform.ready().then(() => {
+┊  ┊31┊      this.intervalObs = this.reloadLocation()
+┊  ┊32┊        .flatMapTo(Observable
+┊  ┊33┊          .interval(LOCATION_REFRESH_INTERVAL)
+┊  ┊34┊          .timeInterval())
+┊  ┊35┊        .subscribe(() => {
+┊  ┊36┊          this.reloadLocation();
+┊  ┊37┊        });
+┊  ┊38┊    });
+┊  ┊39┊  }
+┊  ┊40┊
+┊  ┊41┊  ngOnDestroy() {
+┊  ┊42┊    if (this.intervalObs) {
+┊  ┊43┊      this.intervalObs.unsubscribe();
+┊  ┊44┊    }
+┊  ┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  calculateZoomByAccureacy(accuracy: number): number {
+┊  ┊48┊    // Source: http://stackoverflow.com/a/25143326
+┊  ┊49┊    const deviceHeight = this.platform.height();
+┊  ┊50┊    const deviceWidth = this.platform.width();
+┊  ┊51┊    const screenSize = Math.min(deviceWidth, deviceHeight);
+┊  ┊52┊    const requiredMpp = accuracy / screenSize;
+┊  ┊53┊
+┊  ┊54┊    return ((Math.log(EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;
+┊  ┊55┊  }
+┊  ┊56┊
+┊  ┊57┊  reloadLocation() {
+┊  ┊58┊    return Observable.fromPromise(Geolocation.getCurrentPosition().then((position) => {
+┊  ┊59┊      if (this.lat && this.lng) {
+┊  ┊60┊        this.accuracy = position.coords.accuracy;
+┊  ┊61┊        this.lat = position.coords.latitude;
+┊  ┊62┊        this.lng = position.coords.longitude;
+┊  ┊63┊        this.zoom = this.calculateZoomByAccureacy(this.accuracy);
+┊  ┊64┊      }
+┊  ┊65┊    }));
+┊  ┊66┊  }
+┊  ┊67┊
+┊  ┊68┊  sendLocation() {
+┊  ┊69┊    this.viewCtrl.dismiss(<Location>{
+┊  ┊70┊      lat: this.lat,
+┊  ┊71┊      lng: this.lng,
+┊  ┊72┊      zoom: this.zoom
+┊  ┊73┊    });
+┊  ┊74┊  }
+┊  ┊75┊}
```
[}]: #

So what do we have here?

First, we create the Component and wait for the `Platform` service (part of Ionic 2) to load and ready, because we will later use one of it's features.

Next, we are running `reloadLocation` method, which uses `Geolocation` from Ionic 2 to fetch the device current location, and return it as `Observable` - we are doing it in order to fetch the initial location, and when use RxJS `interval` to reload the location again every 1 second.

So we have the location and it's updating each second, we also get from Ionic 2 the accuracy of the GPS location, and we can use this number to calculate the zoom level we need to use in our view.

Finally, we implement `sendLocation` which dismiss the view with the location fetched for the Geolocation.

Now let's add the view:

[{]: <helper> (diff_step 11.14)
#### Step 11.14: Added location message template

##### Added src/pages/messages/location-message.html
```diff
@@ -0,0 +1,22 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-toolbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Send Location</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="dismiss-button" (click)="viewCtrl.dismiss()"><ion-icon name="close"></ion-icon></button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-toolbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content class="location-message-content">
+┊  ┊12┊  <ion-list>
+┊  ┊13┊    <sebm-google-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
+┊  ┊14┊      <sebm-google-map-marker [latitude]="lat" [longitude]="lng"></sebm-google-map-marker>
+┊  ┊15┊    </sebm-google-map>
+┊  ┊16┊    <ion-item (click)="sendLocation()">
+┊  ┊17┊      <ion-icon name="compass" item-left></ion-icon>
+┊  ┊18┊      <h2>Send your current location</h2>
+┊  ┊19┊      <p *ngIf="accuracy !== -1">Accurate to {{accuracy}} meters</p>
+┊  ┊20┊    </ion-item>
+┊  ┊21┊  </ion-list>
+┊  ┊22┊</ion-content>
```
[}]: #

We are using `sebm-google-map` to create the map, and provide `lat`, `lng` and `zoom` from the Geolocation as the center point of the map.

We also create a `sebm-google-map-marker` with the same location, to display the marker icon on the map.

Let's add CSS to make sure the map is visible:

[{]: <helper> (diff_step 11.15)
#### Step 11.15: Added location message stylesheet

##### Added src/pages/messages/location-message.scss
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊.location-message-content {
+┊  ┊ 2┊  .scroll-content {
+┊  ┊ 3┊    margin-top: 44px;
+┊  ┊ 4┊  }
+┊  ┊ 5┊
+┊  ┊ 6┊  sebm-google-map {
+┊  ┊ 7┊    padding: 0;
+┊  ┊ 8┊  }
+┊  ┊ 9┊
+┊  ┊10┊  .sebm-google-map-container {
+┊  ┊11┊    height: 300px;
+┊  ┊12┊    margin-top: -15px;
+┊  ┊13┊  }
+┊  ┊14┊}
```
[}]: #

And let's import it:

[{]: <helper> (diff_step 11.16)
#### Step 11.16: Import NewLocationMessageComponent

##### Changed src/app/app.module.ts
```diff
@@ -13,6 +13,7 @@
 ┊13┊13┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
 ┊14┊14┊import { AgmCoreModule } from 'angular2-google-maps/core';
 ┊15┊15┊import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
+┊  ┊16┊import { NewLocationMessageComponent } from '../pages/messages/location-message';
 ┊16┊17┊
 ┊17┊18┊@NgModule({
 ┊18┊19┊  declarations: [
```
```diff
@@ -25,7 +26,8 @@
 ┊25┊26┊    ChatsOptionsComponent,
 ┊26┊27┊    NewChatComponent,
 ┊27┊28┊    MessagesOptionsComponent,
-┊28┊  ┊    MessagesAttachmentsComponent
+┊  ┊29┊    MessagesAttachmentsComponent,
+┊  ┊30┊    NewLocationMessageComponent
 ┊29┊31┊  ],
 ┊30┊32┊  imports: [
 ┊31┊33┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -45,7 +47,8 @@
 ┊45┊47┊    ChatsOptionsComponent,
 ┊46┊48┊    NewChatComponent,
 ┊47┊49┊    MessagesOptionsComponent,
-┊48┊  ┊    MessagesAttachmentsComponent
+┊  ┊50┊    MessagesAttachmentsComponent,
+┊  ┊51┊    NewLocationMessageComponent
 ┊49┊52┊  ],
 ┊50┊53┊  providers: [
 ┊51┊54┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
```
[}]: #

Now, we need to use this new `Component`, and open it from the attachment menu we created earlier:

[{]: <helper> (diff_step 11.17)
#### Step 11.17: Implement the sendLocation message to display the new location modal

##### Changed src/pages/messages/messages-attachments.ts
```diff
@@ -1,5 +1,7 @@
 ┊1┊1┊import { Component } from '@angular/core';
 ┊2┊2┊import { AlertController, Platform, ModalController, ViewController } from 'ionic-angular';
+┊ ┊3┊import { NewLocationMessageComponent } from './location-message';
+┊ ┊4┊import { MessageType } from 'api/models';
 ┊3┊5┊
 ┊4┊6┊@Component({
 ┊5┊7┊  selector: 'messages-attachments',
```
```diff
@@ -12,4 +14,22 @@
 ┊12┊14┊    private viewCtrl: ViewController,
 ┊13┊15┊    private modelCtrl: ModalController
 ┊14┊16┊  ) {}
+┊  ┊17┊
+┊  ┊18┊  sendLocation(): void {
+┊  ┊19┊    const locationModal = this.modelCtrl.create(NewLocationMessageComponent);
+┊  ┊20┊    locationModal.onDidDismiss((location) => {
+┊  ┊21┊      if (!location) {
+┊  ┊22┊        this.viewCtrl.dismiss();
+┊  ┊23┊
+┊  ┊24┊        return;
+┊  ┊25┊      }
+┊  ┊26┊
+┊  ┊27┊      this.viewCtrl.dismiss({
+┊  ┊28┊        messageType: MessageType.LOCATION,
+┊  ┊29┊        selectedLocation: location
+┊  ┊30┊      });
+┊  ┊31┊    });
+┊  ┊32┊
+┊  ┊33┊    locationModal.present();
+┊  ┊34┊  }
 ┊15┊35┊}
```
[}]: #

The goal is to get the location from the location message component, and the dismiss the attachment menu again with the location, so it will be available for use from the messages menu, which is the parent of the attachment menu - that way we can send it to our Meteor server.

Now bind this method to click event on the attachment menu:

[{]: <helper> (diff_step 11.18)
#### Step 11.18: Bind click event to sendLocation

##### Changed src/pages/messages/messages-attachments.html
```diff
@@ -10,7 +10,7 @@
 ┊10┊10┊      <div class="attachment-name">Camera</div>
 ┊11┊11┊    </button>
 ┊12┊12┊
-┊13┊  ┊    <button ion-item class="attachment attachment-location">
+┊  ┊13┊    <button ion-item class="attachment attachment-location" (click)="sendLocation()">
 ┊14┊14┊      <ion-icon name="locate" class="attachment-icon"></ion-icon>
 ┊15┊15┊      <div class="attachment-name">Location</div>
 ┊16┊16┊    </button>
```
[}]: #

Now, implement `sendLocationMessage` in `Messages` page, in order to send the actual message using the Meteor method, we will use the new message type we created, and create a string representation for our picked location.

[{]: <helper> (diff_step 11.19)
#### Step 11.19: Implement send location message

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,6 +1,6 @@
 ┊1┊1┊import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
 ┊2┊2┊import { NavParams, PopoverController } from 'ionic-angular';
-┊3┊ ┊import { Chat, Message, MessageType } from 'api/models';
+┊ ┊3┊import { Chat, Message, MessageType, Location } from 'api/models';
 ┊4┊4┊import { Messages } from 'api/collections';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
 ┊6┊6┊import * as moment from 'moment';
```
```diff
@@ -213,6 +213,16 @@
 ┊213┊213┊    });
 ┊214┊214┊  }
 ┊215┊215┊
+┊   ┊216┊  sendLocationMessage(location: Location): void {
+┊   ┊217┊    MeteorObservable.call('addMessage', MessageType.LOCATION,
+┊   ┊218┊      this.selectedChat._id,
+┊   ┊219┊      `${location.lat},${location.lng},${location.zoom}`
+┊   ┊220┊    ).zone().subscribe(() => {
+┊   ┊221┊      // Zero the input field
+┊   ┊222┊      this.message = '';
+┊   ┊223┊    });
+┊   ┊224┊  }
+┊   ┊225┊
 ┊216┊226┊  showAttachments(): void {
 ┊217┊227┊    const popover = this.popoverCtrl.create(MessagesAttachmentsComponent, {
 ┊218┊228┊      chat: this.selectedChat
```
```diff
@@ -221,7 +231,12 @@
 ┊221┊231┊    });
 ┊222┊232┊
 ┊223┊233┊    popover.onDidDismiss((params) => {
-┊224┊   ┊      // TODO: Handle result
+┊   ┊234┊      if (params) {
+┊   ┊235┊        if (params.messageType === MessageType.LOCATION) {
+┊   ┊236┊          const location = params.selectedLocation;
+┊   ┊237┊          this.sendLocationMessage(location);
+┊   ┊238┊        }
+┊   ┊239┊      }
 ┊225┊240┊    });
 ┊226┊241┊
 ┊227┊242┊    popover.present();
```
[}]: #

In the server side, we need allow this new message type:

[{]: <helper> (diff_step 11.20)
#### Step 11.20: Allow location message type on server side

##### Changed api/server/methods.ts
```diff
@@ -70,7 +70,7 @@
 ┊70┊70┊    if (!this.userId) throw new Meteor.Error('unauthorized',
 ┊71┊71┊      'User must be logged-in to create a new chat');
 ┊72┊72┊
-┊73┊  ┊    check(type, Match.OneOf(String, [ MessageType.TEXT ]));
+┊  ┊73┊    check(type, Match.OneOf(String, [ MessageType.TEXT, MessageType.LOCATION ]));
 ┊74┊74┊    check(chatId, nonEmptyString);
 ┊75┊75┊    check(content, nonEmptyString);
```
[}]: #

## View Location Message

Our next step is to view those location message in `Messages` page. 

We will use the same implementation for the map, but this time, we get the location for `message` object:

[{]: <helper> (diff_step 11.21)
#### Step 11.21: Implement location message view

##### Changed src/pages/messages/messages.html
```diff
@@ -19,6 +19,12 @@
 ┊19┊19┊      <div *ngFor="let message of day.messages" class="message-wrapper">
 ┊20┊20┊        <div [class]="'message message-' + message.ownership">
 ┊21┊21┊          <div *ngIf="message.type == 'text'" class="message-content message-content-text">{{message.content}}</div>
+┊  ┊22┊          <div *ngIf="message.type == 'location'" class="message-content message-content-text">
+┊  ┊23┊            <sebm-google-map [zoom]="getLocation(message.content).zoom" [latitude]="getLocation(message.content).lat" [longitude]="getLocation(message.content).lng">
+┊  ┊24┊              <sebm-google-map-marker [latitude]="getLocation(message.content).lat" [longitude]="getLocation(message.content).lng"></sebm-google-map-marker>
+┊  ┊25┊            </sebm-google-map>
+┊  ┊26┊          </div>
+┊  ┊27┊
 ┊22┊28┊          <span class="message-timestamp">{{ message.createdAt | amDateFormat: 'HH:mm' }}</span>
 ┊23┊29┊        </div>
 ┊24┊30┊      </div>
```
[}]: #

And implement `getLocation` method, that converts our string representation into a `Location` object:

[{]: <helper> (diff_step 11.22)
#### Step 11.22: Implement getLocation for parsing the location

##### Changed src/pages/messages/messages.ts
```diff
@@ -241,4 +241,14 @@
 ┊241┊241┊
 ┊242┊242┊    popover.present();
 ┊243┊243┊  }
+┊   ┊244┊
+┊   ┊245┊  getLocation(locationString: string): Location {
+┊   ┊246┊    const splitted = locationString.split(',').map(Number);
+┊   ┊247┊
+┊   ┊248┊    return <Location>{
+┊   ┊249┊      lat: splitted[0],
+┊   ┊250┊      lng: splitted[1],
+┊   ┊251┊      zoom: Math.min(splitted[2] || 0, 19)
+┊   ┊252┊    };
+┊   ┊253┊  }
 ┊244┊254┊}
```
[}]: #

Now add some styles to make sure the map looks good:

[{]: <helper> (diff_step 11.23)
#### Step 11.23: Added map styles

##### Changed src/pages/messages/messages.scss
```diff
@@ -93,6 +93,11 @@
 ┊ 93┊ 93┊        content: " \00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0";
 ┊ 94┊ 94┊        display: inline;
 ┊ 95┊ 95┊      }
+┊   ┊ 96┊
+┊   ┊ 97┊      .sebm-google-map-container {
+┊   ┊ 98┊        height: 25vh;
+┊   ┊ 99┊        width: 35vh;
+┊   ┊100┊      }
 ┊ 96┊101┊    }
 ┊ 97┊102┊
 ┊ 98┊103┊    .message-timestamp {
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step10.md) | [Next Step >](step12.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #