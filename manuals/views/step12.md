[{]: <region> (header)
# Step 12: File Upload & Images
[}]: #
[{]: <region> (body)
In this step, we will use Ionic 2 to get images from the device, and use them for picture messages and profile image.

## Image Picker

The first step is to add the native plugin inside `package.json`:

[{]: <helper> (diff_step 12.1)
#### Step 12.1: Add cordova plugin for image picker

##### Changed package.json
```diff
@@ -54,7 +54,8 @@
 ┊54┊54┊    "cordova-plugin-device",
 ┊55┊55┊    "cordova-plugin-geolocation",
 ┊56┊56┊    "ionic-plugin-keyboard",
-┊57┊  ┊    "cordova-plugin-splashscreen"
+┊  ┊57┊    "cordova-plugin-splashscreen",
+┊  ┊58┊    "https://github.com/Telerik-Verified-Plugins/ImagePicker"
 ┊58┊59┊  ],
 ┊59┊60┊  "cordovaPlatforms": [
 ┊60┊61┊    "ios",
```
[}]: #

## Meteor FS

Next, we need to add Meteor packages, so we will get the ability to upload, store and fetch images, so start with adding those packages:

  $ cd api/
  $ meteor add jalik:ufs jalik:ufs-gridfs
  
We also need to add those for the client side, so let's update the bundler config:

[{]: <helper> (diff_step 12.3)
#### Step 12.3: Add meteor client side bundle config for fs packages

##### Changed meteor-client.config.json
```diff
@@ -44,6 +44,19 @@
 ┊44┊44┊      "sha",
 ┊45┊45┊      "srp",
 ┊46┊46┊      "mys_accounts-phone"
+┊  ┊47┊    ],
+┊  ┊48┊    "jalik:ufs": [
+┊  ┊49┊      "observe-sequence",
+┊  ┊50┊      "htmljs",
+┊  ┊51┊      "blaze",
+┊  ┊52┊      "spacebars",
+┊  ┊53┊      "templating-runtime",
+┊  ┊54┊      "templating",
+┊  ┊55┊      "matb33_collection-hooks",
+┊  ┊56┊      "jalik_ufs"
+┊  ┊57┊    ],
+┊  ┊58┊    "jalik:ufs-gridfs": [
+┊  ┊59┊      "jalik_ufs-gridfs"
 ┊47┊60┊    ]
 ┊48┊61┊  },
 ┊49┊62┊  "export": {
```
[}]: #

And make sure to generate the client side bundle again (from the root directory!):

  $ cd .. 
  $ npm run meteor-client:bundle
  
## Client Side
  
So let's start with the client side, by creating a new service called `PictureService`, and implement `select` method to pick an image from the device. 
  
`UploadFS` package has this feature for the **browser**, and we just need to use it and then wrap it in a Promise in order to know when the pick is done:

For **mobile**, we need to use `ImagePicker` which fetch image from the actual device:

[{]: <helper> (diff_step 12.4)
#### Step 12.4: Create PictureService with utils for files

##### Added src/services/picture.ts
```diff
@@ -0,0 +1,80 @@
+┊  ┊ 1┊import { Injectable } from '@angular/core';
+┊  ┊ 2┊import { Platform } from 'ionic-angular';
+┊  ┊ 3┊import { ImagePicker } from 'ionic-native';
+┊  ┊ 4┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 5┊
+┊  ┊ 6┊@Injectable()
+┊  ┊ 7┊export class PictureService {
+┊  ┊ 8┊  constructor(private platform: Platform) {
+┊  ┊ 9┊  }
+┊  ┊10┊
+┊  ┊11┊  select(): Promise<Blob> {
+┊  ┊12┊    if (!this.platform.is('cordova') || !this.platform.is('mobile')) {
+┊  ┊13┊      return new Promise((resolve, reject) => {
+┊  ┊14┊        try {
+┊  ┊15┊          UploadFS.selectFile((file: File) => {
+┊  ┊16┊            resolve(file);
+┊  ┊17┊          });
+┊  ┊18┊        }
+┊  ┊19┊        catch (e) {
+┊  ┊20┊          reject(e);
+┊  ┊21┊        }
+┊  ┊22┊      });
+┊  ┊23┊    }
+┊  ┊24┊
+┊  ┊25┊    return ImagePicker.getPictures({maximumImagesCount: 1}).then((URL: string) => {
+┊  ┊26┊      return this.convertURLtoBlob(URL);
+┊  ┊27┊    });
+┊  ┊28┊  }
+┊  ┊29┊
+┊  ┊30┊  convertURLtoBlob(URL: string): Promise<Blob> {
+┊  ┊31┊    return new Promise((resolve, reject) => {
+┊  ┊32┊      const image = document.createElement('img');
+┊  ┊33┊
+┊  ┊34┊      image.onload = () => {
+┊  ┊35┊        try {
+┊  ┊36┊          const dataURI = this.convertImageToDataURI(image);
+┊  ┊37┊          const blob = this.convertDataURIToBlob(dataURI);
+┊  ┊38┊
+┊  ┊39┊          resolve(blob);
+┊  ┊40┊        }
+┊  ┊41┊        catch (e) {
+┊  ┊42┊          reject(e);
+┊  ┊43┊        }
+┊  ┊44┊      };
+┊  ┊45┊
+┊  ┊46┊      image.src = URL;
+┊  ┊47┊    });
+┊  ┊48┊  }
+┊  ┊49┊
+┊  ┊50┊  convertImageToDataURI(image: HTMLImageElement): string {
+┊  ┊51┊    // Create an empty canvas element
+┊  ┊52┊    const canvas = document.createElement('canvas');
+┊  ┊53┊    canvas.width = image.width;
+┊  ┊54┊    canvas.height = image.height;
+┊  ┊55┊
+┊  ┊56┊    // Copy the image contents to the canvas
+┊  ┊57┊    const context = canvas.getContext('2d');
+┊  ┊58┊    context.drawImage(image, 0, 0);
+┊  ┊59┊
+┊  ┊60┊    // Get the data-URL formatted image
+┊  ┊61┊    // Firefox supports PNG and JPEG. You could check image.src to
+┊  ┊62┊    // guess the original format, but be aware the using 'image/jpg'
+┊  ┊63┊    // will re-encode the image.
+┊  ┊64┊    const dataURL = canvas.toDataURL('image/png');
+┊  ┊65┊
+┊  ┊66┊    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
+┊  ┊67┊  }
+┊  ┊68┊
+┊  ┊69┊  convertDataURIToBlob(dataURI): Blob {
+┊  ┊70┊    const binary = atob(dataURI);
+┊  ┊71┊
+┊  ┊72┊    // Write the bytes of the string to a typed array
+┊  ┊73┊    const charCodes = Object.keys(binary)
+┊  ┊74┊      .map<number>(Number)
+┊  ┊75┊      .map<number>(binary.charCodeAt.bind(binary));
+┊  ┊76┊
+┊  ┊77┊    // Build blob with typed array
+┊  ┊78┊    return new Blob([new Uint8Array(charCodes)], {type: 'image/jpeg'});
+┊  ┊79┊  }
+┊  ┊80┊}
```
[}]: #

Now import this server as a `provider`:

[{]: <helper> (diff_step 12.5)
#### Step 12.5: Import PictureService

##### Changed src/app/app.module.ts
```diff
@@ -14,6 +14,7 @@
 ┊14┊14┊import { AgmCoreModule } from 'angular2-google-maps/core';
 ┊15┊15┊import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
 ┊16┊16┊import { NewLocationMessageComponent } from '../pages/messages/location-message';
+┊  ┊17┊import { PictureService } from '../services/picture';
 ┊17┊18┊
 ┊18┊19┊@NgModule({
 ┊19┊20┊  declarations: [
```
```diff
@@ -52,7 +53,8 @@
 ┊52┊53┊  ],
 ┊53┊54┊  providers: [
 ┊54┊55┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
-┊55┊  ┊    PhoneService
+┊  ┊56┊    PhoneService,
+┊  ┊57┊    PictureService
 ┊56┊58┊  ]
 ┊57┊59┊})
 ┊58┊60┊export class AppModule {}
```
[}]: #

Also, let's add a new type of message:

[{]: <helper> (diff_step 12.6)
#### Step 12.6: Added picture message type

##### Changed api/server/models.ts
```diff
@@ -5,7 +5,8 @@
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊export enum MessageType {
 ┊ 7┊ 7┊  TEXT = <any>'text',
-┊ 8┊  ┊  LOCATION = <any>'location'
+┊  ┊ 8┊  LOCATION = <any>'location',
+┊  ┊ 9┊  PICTURE = <any>'picture'
 ┊ 9┊10┊}
 ┊10┊11┊
 ┊11┊12┊export interface Chat {
```
[}]: #

Go back to attachment menu, and implement `sendPicture`:

[{]: <helper> (diff_step 12.7)
#### Step 12.7: Implement sendPicture method

##### Changed src/pages/messages/messages-attachments.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { AlertController, Platform, ModalController, ViewController } from 'ionic-angular';
 ┊3┊3┊import { NewLocationMessageComponent } from './location-message';
 ┊4┊4┊import { MessageType } from 'api/models';
+┊ ┊5┊import { PictureService } from '../../services/picture';
 ┊5┊6┊
 ┊6┊7┊@Component({
 ┊7┊8┊  selector: 'messages-attachments',
```
```diff
@@ -12,9 +13,19 @@
 ┊12┊13┊    private alertCtrl: AlertController,
 ┊13┊14┊    private platform: Platform,
 ┊14┊15┊    private viewCtrl: ViewController,
-┊15┊  ┊    private modelCtrl: ModalController
+┊  ┊16┊    private modelCtrl: ModalController,
+┊  ┊17┊    private pictureService: PictureService
 ┊16┊18┊  ) {}
 ┊17┊19┊
+┊  ┊20┊  sendPicture(): void {
+┊  ┊21┊    this.pictureService.select().then((file: File) => {
+┊  ┊22┊      this.viewCtrl.dismiss({
+┊  ┊23┊        messageType: MessageType.PICTURE,
+┊  ┊24┊        selectedPicture: file
+┊  ┊25┊      });
+┊  ┊26┊    });
+┊  ┊27┊  }
+┊  ┊28┊
 ┊18┊29┊  sendLocation(): void {
 ┊19┊30┊    const locationModal = this.modelCtrl.create(NewLocationMessageComponent);
 ┊20┊31┊    locationModal.onDidDismiss((location) => {
```
[}]: #

And bind it to the button:

[{]: <helper> (diff_step 12.8)
#### Step 12.8: Bind click event for sendPicture

##### Changed src/pages/messages/messages-attachments.html
```diff
@@ -1,6 +1,6 @@
 ┊1┊1┊<ion-content class="messages-attachments-page-content">
 ┊2┊2┊  <ion-list class="attachments">
-┊3┊ ┊    <button ion-item class="attachment attachment-gallery">
+┊ ┊3┊    <button ion-item class="attachment attachment-gallery" (click)="sendPicture()">
 ┊4┊4┊      <ion-icon name="images" class="attachment-icon"></ion-icon>
 ┊5┊5┊      <div class="attachment-name">Gallery</div>
 ┊6┊6┊    </button>
```
[}]: #

Now, let's implement the login to send the actual image message, starting with handling the result of the attachment menu, and then call `sendPictureMessage`:

[{]: <helper> (diff_step 12.9)
#### Step 12.9: Implement the actual send of picture message

##### Changed src/pages/messages/messages.ts
```diff
@@ -8,6 +8,7 @@
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from './messages-options';
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from 'rxjs';
 ┊10┊10┊import { MessagesAttachmentsComponent } from './messages-attachments';
+┊  ┊11┊import { PictureService } from '../../services/picture';
 ┊11┊12┊
 ┊12┊13┊@Component({
 ┊13┊14┊  selector: 'messages-page',
```
```diff
@@ -29,7 +30,8 @@
 ┊29┊30┊  constructor(
 ┊30┊31┊    navParams: NavParams,
 ┊31┊32┊    private el: ElementRef,
-┊32┊  ┊    private popoverCtrl: PopoverController
+┊  ┊33┊    private popoverCtrl: PopoverController,
+┊  ┊34┊    private pictureService: PictureService
 ┊33┊35┊  ) {
 ┊34┊36┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊35┊37┊    this.title = this.selectedChat.title;
```
```diff
@@ -236,12 +238,25 @@
 ┊236┊238┊          const location = params.selectedLocation;
 ┊237┊239┊          this.sendLocationMessage(location);
 ┊238┊240┊        }
+┊   ┊241┊        else if (params.messageType === MessageType.PICTURE) {
+┊   ┊242┊          const blob: Blob = params.selectedPicture;
+┊   ┊243┊          this.sendPictureMessage(blob);
+┊   ┊244┊        }
 ┊239┊245┊      }
 ┊240┊246┊    });
 ┊241┊247┊
 ┊242┊248┊    popover.present();
 ┊243┊249┊  }
 ┊244┊250┊
+┊   ┊251┊  sendPictureMessage(blob: Blob): void {
+┊   ┊252┊    this.pictureService.upload(blob).then((picture) => {
+┊   ┊253┊      MeteorObservable.call('addMessage', MessageType.PICTURE,
+┊   ┊254┊        this.selectedChat._id,
+┊   ┊255┊        picture.url
+┊   ┊256┊      ).zone().subscribe();
+┊   ┊257┊    });
+┊   ┊258┊  }
+┊   ┊259┊
 ┊245┊260┊  getLocation(locationString: string): Location {
 ┊246┊261┊    const splitted = locationString.split(',').map(Number);
```
[}]: #

And let's create a stub method for the `upload` function we just called:

[{]: <helper> (diff_step 12.10)
#### Step 12.10: Create stub method for upload method

##### Changed src/services/picture.ts
```diff
@@ -27,6 +27,10 @@
 ┊27┊27┊    });
 ┊28┊28┊  }
 ┊29┊29┊
+┊  ┊30┊  upload(blob: Blob): Promise<any> {
+┊  ┊31┊    return Promise.resolve();
+┊  ┊32┊  }
+┊  ┊33┊
 ┊30┊34┊  convertURLtoBlob(URL: string): Promise<Blob> {
 ┊31┊35┊    return new Promise((resolve, reject) => {
 ┊32┊36┊      const image = document.createElement('img');
```
[}]: #

## Server Side 

In the server, we need to handle the picture message and store it.

First, let's create a model for the `Picture` object, as Meteor will store it.

[{]: <helper> (diff_step 12.11)
#### Step 12.11: Create Picture model

##### Changed api/server/models.ts
```diff
@@ -1,3 +1,5 @@
+┊ ┊1┊export const DEFAULT_PICTURE_URL = '/ionicons/dist/svg/ios-contact.svg';
+┊ ┊2┊
 ┊1┊3┊export interface Profile {
 ┊2┊4┊  name?: string;
 ┊3┊5┊  picture?: string;
```
```diff
@@ -36,3 +38,19 @@
 ┊36┊38┊  lng: number;
 ┊37┊39┊  zoom: number;
 ┊38┊40┊}
+┊  ┊41┊
+┊  ┊42┊export interface Picture {
+┊  ┊43┊  _id?: string;
+┊  ┊44┊  complete?: boolean;
+┊  ┊45┊  extension?: string;
+┊  ┊46┊  name?: string;
+┊  ┊47┊  progress?: number;
+┊  ┊48┊  size?: number;
+┊  ┊49┊  store?: string;
+┊  ┊50┊  token?: string;
+┊  ┊51┊  type?: string;
+┊  ┊52┊  uploadedAt?: Date;
+┊  ┊53┊  uploading?: boolean;
+┊  ┊54┊  url?: string;
+┊  ┊55┊  userId?: string;
+┊  ┊56┊}
```
[}]: #

Now, we need a package to convert and modify our images so we'll be able to create thumbnails.

`sharp` does it good, so let's add it:

  $ meteor npm install --save sharp
  
And let's create the store:
  
[{]: <helper> (diff_step 12.13)
#### Step 12.13: Create pictures store

##### Added api/server/collections/pictures.ts
```diff
@@ -0,0 +1,40 @@
+┊  ┊ 1┊import { MongoObservable } from 'meteor-rxjs';
+┊  ┊ 2┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 3┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 4┊import * as Sharp from 'sharp';
+┊  ┊ 5┊import { Picture, DEFAULT_PICTURE_URL } from '../models';
+┊  ┊ 6┊
+┊  ┊ 7┊export interface PicturesCollection<T> extends MongoObservable.Collection<T> {
+┊  ┊ 8┊  getPictureUrl(selector?: Object | string): string;
+┊  ┊ 9┊}
+┊  ┊10┊
+┊  ┊11┊export const Pictures =
+┊  ┊12┊  new MongoObservable.Collection<Picture>('pictures') as PicturesCollection<Picture>;
+┊  ┊13┊
+┊  ┊14┊export const PicturesStore = new UploadFS.store.GridFS({
+┊  ┊15┊  collection: Pictures.collection,
+┊  ┊16┊  name: 'pictures',
+┊  ┊17┊  filter: new UploadFS.Filter({
+┊  ┊18┊    contentTypes: ['image/*']
+┊  ┊19┊  }),
+┊  ┊20┊  permissions: new UploadFS.StorePermissions({
+┊  ┊21┊    insert: picturesPermissions,
+┊  ┊22┊    update: picturesPermissions,
+┊  ┊23┊    remove: picturesPermissions
+┊  ┊24┊  }),
+┊  ┊25┊  transformWrite(from, to) {
+┊  ┊26┊    // Compress picture to 75% from its original quality
+┊  ┊27┊    const transform = Sharp().png({ quality: 75 });
+┊  ┊28┊    from.pipe(transform).pipe(to);
+┊  ┊29┊  }
+┊  ┊30┊});
+┊  ┊31┊
+┊  ┊32┊// Gets picture's url by a given selector
+┊  ┊33┊Pictures.getPictureUrl = function (selector) {
+┊  ┊34┊  const picture = this.findOne(selector) || {};
+┊  ┊35┊  return picture.url || DEFAULT_PICTURE_URL;
+┊  ┊36┊};
+┊  ┊37┊
+┊  ┊38┊function picturesPermissions(userId: string): boolean {
+┊  ┊39┊  return Meteor.isServer || !!userId;
+┊  ┊40┊}
```
[}]: #

The store is just like any collection, only it created from `GridFS`, and define it's own rules and transform methods.

Our transformation is about shrinking the image size with `sharp`. 

We also extend the store instance with a custom util method that will fetch images URL from an image selector.

And let's export if from the main collections file:

[{]: <helper> (diff_step 12.14)
#### Step 12.14: Export pictures collection

##### Changed api/server/collections/index.ts
```diff
@@ -1,3 +1,4 @@
 ┊1┊1┊export * from './chats';
 ┊2┊2┊export * from './messages';
 ┊3┊3┊export * from './users';
+┊ ┊4┊export * from './pictures';
```
[}]: #

Now, we will implement `upload` method, using the store we created now:

[{]: <helper> (diff_step 12.15)
#### Step 12.15: Implement upload method

##### Changed src/services/picture.ts
```diff
@@ -2,6 +2,9 @@
 ┊ 2┊ 2┊import { Platform } from 'ionic-angular';
 ┊ 3┊ 3┊import { ImagePicker } from 'ionic-native';
 ┊ 4┊ 4┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 5┊import { PicturesStore } from 'api/collections';
+┊  ┊ 6┊import { _ } from 'meteor/underscore';
+┊  ┊ 7┊import { DEFAULT_PICTURE_URL } from 'api/models';
 ┊ 5┊ 8┊
 ┊ 6┊ 9┊@Injectable()
 ┊ 7┊10┊export class PictureService {
```
```diff
@@ -28,7 +31,23 @@
 ┊28┊31┊  }
 ┊29┊32┊
 ┊30┊33┊  upload(blob: Blob): Promise<any> {
-┊31┊  ┊    return Promise.resolve();
+┊  ┊34┊    return new Promise((resolve, reject) => {
+┊  ┊35┊      const metadata = _.pick(blob, 'name', 'type', 'size');
+┊  ┊36┊
+┊  ┊37┊      if (!metadata.name) {
+┊  ┊38┊        metadata.name = DEFAULT_PICTURE_URL;
+┊  ┊39┊      }
+┊  ┊40┊
+┊  ┊41┊      const upload = new UploadFS.Uploader({
+┊  ┊42┊        data: blob,
+┊  ┊43┊        file: metadata,
+┊  ┊44┊        store: PicturesStore,
+┊  ┊45┊        onComplete: resolve,
+┊  ┊46┊        onError: reject
+┊  ┊47┊      });
+┊  ┊48┊
+┊  ┊49┊      upload.start();
+┊  ┊50┊    });
 ┊32┊51┊  }
 ┊33┊52┊
 ┊34┊53┊  convertURLtoBlob(URL: string): Promise<Blob> {
```
[}]: #

We also need to make sure that `sharp` is not loaded in our client side, because it's package for server-side only. To do that, we can use Webpack configuration to ignore `sharp`:

[{]: <helper> (diff_step 12.16)
#### Step 12.16: Ignore sharp package on client side

##### Changed webpack.config.js
```diff
@@ -20,6 +20,9 @@
 ┊20┊20┊  },
 ┊21┊21┊
 ┊22┊22┊  externals: [
+┊  ┊23┊    {
+┊  ┊24┊      sharp: '{}'
+┊  ┊25┊    },
 ┊23┊26┊    resolveExternals
 ┊24┊27┊  ],
```
[}]: #

## View Picture Message

Let's add a view for our new type of message!

So let's start by displaying our `message` object as image tag:

[{]: <helper> (diff_step 12.17)
#### Step 12.17: Added view for picture message

##### Changed src/pages/messages/messages.html
```diff
@@ -24,6 +24,7 @@
 ┊24┊24┊              <sebm-google-map-marker [latitude]="getLocation(message.content).lat" [longitude]="getLocation(message.content).lng"></sebm-google-map-marker>
 ┊25┊25┊            </sebm-google-map>
 ┊26┊26┊          </div>
+┊  ┊27┊          <img *ngIf="message.type == 'picture'" (click)="showPicture($event)" class="message-content message-content-picture" [src]="message.content">
 ┊27┊28┊
 ┊28┊29┊          <span class="message-timestamp">{{ message.createdAt | amDateFormat: 'HH:mm' }}</span>
 ┊29┊30┊        </div>
```
[}]: #

> We also bind the click event, and later implement it to display the image in full-screen.

Let's create the full-screen image viewer component:

[{]: <helper> (diff_step 12.18)
#### Step 12.18: Create show picture component

##### Added src/pages/messages/show-picture.ts
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { NavParams, ViewController } from 'ionic-angular';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'show-picture',
+┊  ┊ 6┊  templateUrl: 'show-picture.html'
+┊  ┊ 7┊})
+┊  ┊ 8┊export class ShowPictureComponent {
+┊  ┊ 9┊  pictureSrc: string;
+┊  ┊10┊
+┊  ┊11┊  constructor(private navParams: NavParams, private viewCtrl: ViewController) {
+┊  ┊12┊    this.pictureSrc = navParams.get('pictureSrc');
+┊  ┊13┊  }
+┊  ┊14┊}
```
[}]: #

[{]: <helper> (diff_step 12.19)
#### Step 12.19: Create show picture template

##### Added src/pages/messages/show-picture.html
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-toolbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Show Picture</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons left>
+┊  ┊ 6┊      <button ion-button class="dismiss-button" (click)="viewCtrl.dismiss()"><ion-icon name="close"></ion-icon></button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-toolbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content class="show-picture">
+┊  ┊12┊  <img class="picture" [src]="pictureSrc">
+┊  ┊13┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 12.20)
#### Step 12.20: Create show pictuer component styles

##### Added src/pages/messages/show-picture.scss
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊.show-picture {
+┊  ┊ 2┊  background-color: black;
+┊  ┊ 3┊
+┊  ┊ 4┊  .picture {
+┊  ┊ 5┊    position: absolute;
+┊  ┊ 6┊    top: 50%;
+┊  ┊ 7┊    left: 50%;
+┊  ┊ 8┊    transform: translate(-50%, -50%);
+┊  ┊ 9┊  }
+┊  ┊10┊}🚫↵
```
[}]: #

[{]: <helper> (diff_step 12.21)
#### Step 12.21: Import ShowPictureComponent

##### Changed src/app/app.module.ts
```diff
@@ -15,6 +15,7 @@
 ┊15┊15┊import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
 ┊16┊16┊import { NewLocationMessageComponent } from '../pages/messages/location-message';
 ┊17┊17┊import { PictureService } from '../services/picture';
+┊  ┊18┊import { ShowPictureComponent } from '../pages/messages/show-picture';
 ┊18┊19┊
 ┊19┊20┊@NgModule({
 ┊20┊21┊  declarations: [
```
```diff
@@ -28,7 +29,8 @@
 ┊28┊29┊    NewChatComponent,
 ┊29┊30┊    MessagesOptionsComponent,
 ┊30┊31┊    MessagesAttachmentsComponent,
-┊31┊  ┊    NewLocationMessageComponent
+┊  ┊32┊    NewLocationMessageComponent,
+┊  ┊33┊    ShowPictureComponent
 ┊32┊34┊  ],
 ┊33┊35┊  imports: [
 ┊34┊36┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -49,7 +51,8 @@
 ┊49┊51┊    NewChatComponent,
 ┊50┊52┊    MessagesOptionsComponent,
 ┊51┊53┊    MessagesAttachmentsComponent,
-┊52┊  ┊    NewLocationMessageComponent
+┊  ┊54┊    NewLocationMessageComponent,
+┊  ┊55┊    ShowPictureComponent
 ┊53┊56┊  ],
 ┊54┊57┊  providers: [
 ┊55┊58┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
```
[}]: #

Now implement `showMessage` and use the new component:

[{]: <helper> (diff_step 12.22)
#### Step 12.22: Implement showPicture method

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
-┊2┊ ┊import { NavParams, PopoverController } from 'ionic-angular';
+┊ ┊2┊import { NavParams, PopoverController, ModalController } from 'ionic-angular';
 ┊3┊3┊import { Chat, Message, MessageType, Location } from 'api/models';
 ┊4┊4┊import { Messages } from 'api/collections';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
```
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from 'rxjs';
 ┊10┊10┊import { MessagesAttachmentsComponent } from './messages-attachments';
 ┊11┊11┊import { PictureService } from '../../services/picture';
+┊  ┊12┊import { ShowPictureComponent } from './show-picture';
 ┊12┊13┊
 ┊13┊14┊@Component({
 ┊14┊15┊  selector: 'messages-page',
```
```diff
@@ -31,7 +32,8 @@
 ┊31┊32┊    navParams: NavParams,
 ┊32┊33┊    private el: ElementRef,
 ┊33┊34┊    private popoverCtrl: PopoverController,
-┊34┊  ┊    private pictureService: PictureService
+┊  ┊35┊    private pictureService: PictureService,
+┊  ┊36┊    private modalCtrl: ModalController
 ┊35┊37┊  ) {
 ┊36┊38┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊37┊39┊    this.title = this.selectedChat.title;
```
```diff
@@ -266,4 +268,12 @@
 ┊266┊268┊      zoom: Math.min(splitted[2] || 0, 19)
 ┊267┊269┊    };
 ┊268┊270┊  }
+┊   ┊271┊
+┊   ┊272┊  showPicture({ target }: Event) {
+┊   ┊273┊    const modal = this.modalCtrl.create(ShowPictureComponent, {
+┊   ┊274┊      pictureSrc: (<HTMLImageElement>target).src
+┊   ┊275┊    });
+┊   ┊276┊
+┊   ┊277┊    modal.present();
+┊   ┊278┊  }
 ┊269┊279┊}
```
[}]: #

## Profile Picture

Now, let's add the ability to set the user's profile image. Start by adding a new field called `pictureId` which we'll use to contain the id of the profile picture as it stored in the images store.

[{]: <helper> (diff_step 12.23)
#### Step 12.23: Add pictureId property to Profile

##### Changed api/server/models.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊export interface Profile {
 ┊4┊4┊  name?: string;
 ┊5┊5┊  picture?: string;
+┊ ┊6┊  pictureId?: string;
 ┊6┊7┊}
 ┊7┊8┊
 ┊8┊9┊export enum MessageType {
```
[}]: #

Add a button for picking a new profile picture:

[{]: <helper> (diff_step 12.24)
#### Step 12.24: Add event for changing profile picture

##### Changed src/pages/profile/profile.html
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊<ion-content class="profile-page-content">
 ┊12┊12┊  <div class="profile-picture">
 ┊13┊13┊    <img *ngIf="picture" [src]="picture">
+┊  ┊14┊    <ion-icon name="create" (click)="selectProfilePicture()"></ion-icon>
 ┊14┊15┊  </div>
 ┊15┊16┊
 ┊16┊17┊  <ion-item class="profile-name">
```
[}]: #

And implement the actual image picking, upload and set it:

[{]: <helper> (diff_step 12.25)
#### Step 12.25: Implement pick, update and set of profile image

##### Changed src/pages/profile/profile.ts
```diff
@@ -3,6 +3,8 @@
 ┊ 3┊ 3┊import { AlertController, NavController } from 'ionic-angular';
 ┊ 4┊ 4┊import { MeteorObservable } from 'meteor-rxjs';
 ┊ 5┊ 5┊import { ChatsPage } from '../chats/chats';
+┊  ┊ 6┊import { PictureService } from '../../services/picture';
+┊  ┊ 7┊import { Pictures } from 'api/collections';
 ┊ 6┊ 8┊
 ┊ 7┊ 9┊@Component({
 ┊ 8┊10┊  selector: 'profile',
```
```diff
@@ -14,13 +16,37 @@
 ┊14┊16┊
 ┊15┊17┊  constructor(
 ┊16┊18┊    private alertCtrl: AlertController,
-┊17┊  ┊    private navCtrl: NavController
+┊  ┊19┊    private navCtrl: NavController,
+┊  ┊20┊    private pictureService: PictureService
 ┊18┊21┊  ) {}
 ┊19┊22┊
 ┊20┊23┊  ngOnInit(): void {
 ┊21┊24┊    this.profile = Meteor.user().profile || {
 ┊22┊25┊      name: ''
 ┊23┊26┊    };
+┊  ┊27┊
+┊  ┊28┊    MeteorObservable.subscribe('user').subscribe(() => {
+┊  ┊29┊      this.picture = Pictures.getPictureUrl(this.profile.pictureId);
+┊  ┊30┊    });
+┊  ┊31┊  }
+┊  ┊32┊
+┊  ┊33┊  selectProfilePicture(): void {
+┊  ┊34┊    this.pictureService.select().then((blob) => {
+┊  ┊35┊      this.uploadProfilePicture(blob);
+┊  ┊36┊    })
+┊  ┊37┊      .catch((e) => {
+┊  ┊38┊        this.handleError(e);
+┊  ┊39┊      });
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  uploadProfilePicture(blob: Blob): void {
+┊  ┊43┊    this.pictureService.upload(blob).then((picture) => {
+┊  ┊44┊      this.profile.pictureId = picture._id;
+┊  ┊45┊      this.picture = picture.url;
+┊  ┊46┊    })
+┊  ┊47┊      .catch((e) => {
+┊  ┊48┊        this.handleError(e);
+┊  ┊49┊      });
 ┊24┊50┊  }
 ┊25┊51┊
 ┊26┊52┊  updateProfile(): void {
```
[}]: #

Now, we will implement a collection hook, so after each profile update, we will remove the old image from the database:

[{]: <helper> (diff_step 12.26)
#### Step 12.26: Add after hook for user modification

##### Changed api/server/collections/users.ts
```diff
@@ -1,5 +1,15 @@
 ┊ 1┊ 1┊import { MongoObservable } from 'meteor-rxjs';
 ┊ 2┊ 2┊import { Meteor } from 'meteor/meteor';
 ┊ 3┊ 3┊import { User } from '../models';
+┊  ┊ 4┊import { Pictures } from './pictures';
 ┊ 4┊ 5┊
 ┊ 5┊ 6┊export const Users = MongoObservable.fromExisting<User>(Meteor.users);
+┊  ┊ 7┊
+┊  ┊ 8┊// Dispose unused profile pictures
+┊  ┊ 9┊Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {
+┊  ┊10┊  if (!doc.profile) return;
+┊  ┊11┊  if (!this.previous.profile) return;
+┊  ┊12┊  if (doc.profile.pictureId == this.previous.profile.pictureId) return;
+┊  ┊13┊
+┊  ┊14┊  Pictures.collection.remove({ _id: doc.profile.pictureId });
+┊  ┊15┊}, { fetchPrevious: true });
```
[}]: #

We also need to add TypeScript definition for those collection hooks:

// TODO: Replace with npm install after Eytan's PR

[{]: <helper> (diff_step 12.27)
#### Step 12.27: Add typescript typing for meteor hooks

##### Changed src/declarations.d.ts
```diff
@@ -11,4 +11,188 @@
 ┊ 11┊ 11┊  For more info on type definition files, check out the Typescript docs here:
 ┊ 12┊ 12┊  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
 ┊ 13┊ 13┊*/
-┊ 14┊   ┊declare module '*';🚫↵
+┊   ┊ 14┊declare module '*';
+┊   ┊ 15┊
+┊   ┊ 16┊/* tslint:disable */
+┊   ┊ 17┊
+┊   ┊ 18┊// Type definitions for Meteor package matb33:collection-hooks
+┊   ┊ 19┊// Project: https://github.com/matb33/meteor-collection-hooks
+┊   ┊ 20┊// Source: https://github.com/twastvedt/typed-meteor-collection-hooks
+┊   ┊ 21┊
+┊   ┊ 22┊module 'meteor/mongo' {
+┊   ┊ 23┊  module Mongo {
+┊   ┊ 24┊    interface Collection<T> {
+┊   ┊ 25┊      before: {
+┊   ┊ 26┊        find(hook: {(userId: string, selector: Mongo.Selector, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊ 27┊        findOne(hook: {(userId: string, selector: Mongo.Selector, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊ 28┊        insert(hook: {(userId: string, doc: T): void}): void;
+┊   ┊ 29┊        remove(hook: {(userId: string, doc: T): void}): void;
+┊   ┊ 30┊        update(hook: {(userId: string, doc: T, fieldNames: string[], modifier: Mongo.Modifier, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊ 31┊        upsert(hook: {(userId: string, doc: T, selector: Mongo.Selector, modifier: Mongo.Modifier, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊ 32┊      };
+┊   ┊ 33┊      after: {
+┊   ┊ 34┊        find(hook: {(userId: string, selector: Mongo.Selector, options: { multi?: boolean; upsert?: boolean; }, cursor: Mongo.Cursor<T>): void}): void;
+┊   ┊ 35┊        findOne(hook: {(userId: string, selector: Mongo.Selector, options: { multi?: boolean; upsert?: boolean; }, doc: T): void}): void;
+┊   ┊ 36┊        insert(hook: {(userId: string, doc: T): void}): void;
+┊   ┊ 37┊        remove(hook: {(userId: string, doc: T): void}): void;
+┊   ┊ 38┊        update(hook: {(userId: string, doc: T, fieldNames: string[], modifier: Mongo.Modifier, options: { multi?: boolean; upsert?: boolean; }): void}, options?: HookOptions): void;
+┊   ┊ 39┊        upsert(hook: {(userId: string, doc: T, selector: Mongo.Selector, modifier: Mongo.Modifier, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊ 40┊      };
+┊   ┊ 41┊      direct: {
+┊   ┊ 42┊        find(selector?: Mongo.Selector | Mongo.ObjectID | string, options?: {
+┊   ┊ 43┊          sort?: Mongo.SortSpecifier;
+┊   ┊ 44┊          skip?: number;
+┊   ┊ 45┊          limit?: number;
+┊   ┊ 46┊          fields?: Mongo.FieldSpecifier;
+┊   ┊ 47┊          reactive?: boolean;
+┊   ┊ 48┊          transform?: Function;
+┊   ┊ 49┊        }): Mongo.Cursor<T>;
+┊   ┊ 50┊        findOne(selector?: Mongo.Selector | Mongo.ObjectID | string, options?: {
+┊   ┊ 51┊          sort?: Mongo.SortSpecifier;
+┊   ┊ 52┊          skip?: number;
+┊   ┊ 53┊          fields?: Mongo.FieldSpecifier;
+┊   ┊ 54┊          reactive?: boolean;
+┊   ┊ 55┊          transform?: Function;
+┊   ┊ 56┊        }): T;
+┊   ┊ 57┊        insert(doc: T, callback?: Function): string;
+┊   ┊ 58┊        remove(selector: Mongo.Selector | Mongo.ObjectID | string, callback?: Function): number;
+┊   ┊ 59┊        update(selector: Mongo.Selector | Mongo.ObjectID | string, modifier: Mongo.Modifier, options?: {
+┊   ┊ 60┊          multi?: boolean;
+┊   ┊ 61┊          upsert?: boolean;
+┊   ┊ 62┊        }, callback?: Function): number;
+┊   ┊ 63┊        upsert(selector: Mongo.Selector | Mongo.ObjectID | string, modifier: Mongo.Modifier, options?: {
+┊   ┊ 64┊          multi?: boolean;
+┊   ┊ 65┊        }, callback?: Function): {numberAffected?: number; insertedId?: string;};
+┊   ┊ 66┊      };
+┊   ┊ 67┊      hookOptions: CollectionOptions;
+┊   ┊ 68┊    }
+┊   ┊ 69┊  }
+┊   ┊ 70┊
+┊   ┊ 71┊  var CollectionHooks: CollectionHooksStatic;
+┊   ┊ 72┊
+┊   ┊ 73┊  interface CollectionHooksStatic {
+┊   ┊ 74┊    defaults: CollectionOptions;
+┊   ┊ 75┊  }
+┊   ┊ 76┊
+┊   ┊ 77┊  interface HookOptions {
+┊   ┊ 78┊    fetchPrevious?: boolean;
+┊   ┊ 79┊  }
+┊   ┊ 80┊
+┊   ┊ 81┊  interface CollectionOptions {
+┊   ┊ 82┊    before: {
+┊   ┊ 83┊      all: HookOptions;
+┊   ┊ 84┊      find: HookOptions;
+┊   ┊ 85┊      findOne: HookOptions;
+┊   ┊ 86┊      insert: HookOptions;
+┊   ┊ 87┊      remove: HookOptions;
+┊   ┊ 88┊      update: HookOptions;
+┊   ┊ 89┊      upsert: HookOptions;
+┊   ┊ 90┊    };
+┊   ┊ 91┊    after: {
+┊   ┊ 92┊      all: HookOptions;
+┊   ┊ 93┊      find: HookOptions;
+┊   ┊ 94┊      findOne: HookOptions;
+┊   ┊ 95┊      insert: HookOptions;
+┊   ┊ 96┊      remove: HookOptions;
+┊   ┊ 97┊      update: HookOptions;
+┊   ┊ 98┊      upsert: HookOptions;
+┊   ┊ 99┊    };
+┊   ┊100┊    all: {
+┊   ┊101┊      all: HookOptions;
+┊   ┊102┊      find: HookOptions;
+┊   ┊103┊      findOne: HookOptions;
+┊   ┊104┊      insert: HookOptions;
+┊   ┊105┊      remove: HookOptions;
+┊   ┊106┊      update: HookOptions;
+┊   ┊107┊      upsert: HookOptions;
+┊   ┊108┊    };
+┊   ┊109┊  }
+┊   ┊110┊}
+┊   ┊111┊
+┊   ┊112┊module Mongo {
+┊   ┊113┊  interface Collection<T> {
+┊   ┊114┊    before: {
+┊   ┊115┊      find(hook: {(userId: string, selector: Mongo.Selector, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊116┊      findOne(hook: {(userId: string, selector: Mongo.Selector, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊117┊      insert(hook: {(userId: string, doc: T): void}): void;
+┊   ┊118┊      remove(hook: {(userId: string, doc: T): void}): void;
+┊   ┊119┊      update(hook: {(userId: string, doc: T, fieldNames: string[], modifier: Mongo.Modifier, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊120┊      upsert(hook: {(userId: string, doc: T, selector: Mongo.Selector, modifier: Mongo.Modifier, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊121┊    };
+┊   ┊122┊    after: {
+┊   ┊123┊      find(hook: {(userId: string, selector: Mongo.Selector, options: { multi?: boolean; upsert?: boolean; }, cursor: Mongo.Cursor<T>): void}): void;
+┊   ┊124┊      findOne(hook: {(userId: string, selector: Mongo.Selector, options: { multi?: boolean; upsert?: boolean; }, doc: T): void}): void;
+┊   ┊125┊      insert(hook: {(userId: string, doc: T): void}): void;
+┊   ┊126┊      remove(hook: {(userId: string, doc: T): void}): void;
+┊   ┊127┊      update(hook: {(userId: string, doc: T, fieldNames: string[], modifier: Mongo.Modifier, options: { multi?: boolean; upsert?: boolean; }): void}, options?: HookOptions): void;
+┊   ┊128┊      upsert(hook: {(userId: string, doc: T, selector: Mongo.Selector, modifier: Mongo.Modifier, options: { multi?: boolean; upsert?: boolean; }): void}): void;
+┊   ┊129┊    };
+┊   ┊130┊    direct: {
+┊   ┊131┊      find(selector?: Mongo.Selector | Mongo.ObjectID | string, options?: {
+┊   ┊132┊        sort?: Mongo.SortSpecifier;
+┊   ┊133┊        skip?: number;
+┊   ┊134┊        limit?: number;
+┊   ┊135┊        fields?: Mongo.FieldSpecifier;
+┊   ┊136┊        reactive?: boolean;
+┊   ┊137┊        transform?: Function;
+┊   ┊138┊      }): Mongo.Cursor<T>;
+┊   ┊139┊      findOne(selector?: Mongo.Selector | Mongo.ObjectID | string, options?: {
+┊   ┊140┊        sort?: Mongo.SortSpecifier;
+┊   ┊141┊        skip?: number;
+┊   ┊142┊        fields?: Mongo.FieldSpecifier;
+┊   ┊143┊        reactive?: boolean;
+┊   ┊144┊        transform?: Function;
+┊   ┊145┊      }): T;
+┊   ┊146┊      insert(doc: T, callback?: Function): string;
+┊   ┊147┊      remove(selector: Mongo.Selector | Mongo.ObjectID | string, callback?: Function): number;
+┊   ┊148┊      update(selector: Mongo.Selector | Mongo.ObjectID | string, modifier: Mongo.Modifier, options?: {
+┊   ┊149┊        multi?: boolean;
+┊   ┊150┊        upsert?: boolean;
+┊   ┊151┊      }, callback?: Function): number;
+┊   ┊152┊      upsert(selector: Mongo.Selector | Mongo.ObjectID | string, modifier: Mongo.Modifier, options?: {
+┊   ┊153┊        multi?: boolean;
+┊   ┊154┊      }, callback?: Function): {numberAffected?: number; insertedId?: string;};
+┊   ┊155┊    };
+┊   ┊156┊    hookOptions: CollectionOptions;
+┊   ┊157┊  }
+┊   ┊158┊}
+┊   ┊159┊
+┊   ┊160┊declare var CollectionHooks: CollectionHooksStatic;
+┊   ┊161┊
+┊   ┊162┊interface CollectionHooksStatic {
+┊   ┊163┊  defaults: CollectionOptions;
+┊   ┊164┊}
+┊   ┊165┊
+┊   ┊166┊interface HookOptions {
+┊   ┊167┊  fetchPrevious?: boolean;
+┊   ┊168┊}
+┊   ┊169┊
+┊   ┊170┊interface CollectionOptions {
+┊   ┊171┊  before: {
+┊   ┊172┊    all: HookOptions;
+┊   ┊173┊    find: HookOptions;
+┊   ┊174┊    findOne: HookOptions;
+┊   ┊175┊    insert: HookOptions;
+┊   ┊176┊    remove: HookOptions;
+┊   ┊177┊    update: HookOptions;
+┊   ┊178┊    upsert: HookOptions;
+┊   ┊179┊  };
+┊   ┊180┊  after: {
+┊   ┊181┊    all: HookOptions;
+┊   ┊182┊    find: HookOptions;
+┊   ┊183┊    findOne: HookOptions;
+┊   ┊184┊    insert: HookOptions;
+┊   ┊185┊    remove: HookOptions;
+┊   ┊186┊    update: HookOptions;
+┊   ┊187┊    upsert: HookOptions;
+┊   ┊188┊  };
+┊   ┊189┊  all: {
+┊   ┊190┊    all: HookOptions;
+┊   ┊191┊    find: HookOptions;
+┊   ┊192┊    findOne: HookOptions;
+┊   ┊193┊    insert: HookOptions;
+┊   ┊194┊    remove: HookOptions;
+┊   ┊195┊    update: HookOptions;
+┊   ┊196┊    upsert: HookOptions;
+┊   ┊197┊  };
+┊   ┊198┊}
```
[}]: #

Add the `user` publication that will publish the user data and image:

[{]: <helper> (diff_step 12.28)
#### Step 12.28: Add user publication

##### Changed api/server/publications.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { Users } from './collections/users';
 ┊3┊3┊import { Messages } from './collections/messages';
 ┊4┊4┊import { Chats } from './collections/chats';
+┊ ┊5┊import { Pictures } from './collections/pictures';
 ┊5┊6┊
 ┊6┊7┊Meteor.publishComposite('users', function(
 ┊7┊8┊  pattern: string
```
```diff
@@ -74,3 +75,15 @@
 ┊74┊75┊    ]
 ┊75┊76┊  };
 ┊76┊77┊});
+┊  ┊78┊
+┊  ┊79┊Meteor.publish('user', function () {
+┊  ┊80┊  if (!this.userId) {
+┊  ┊81┊    return;
+┊  ┊82┊  }
+┊  ┊83┊
+┊  ┊84┊  const profile = Users.findOne(this.userId).profile || {};
+┊  ┊85┊
+┊  ┊86┊  return Pictures.collection.find({
+┊  ┊87┊    _id: profile.pictureId
+┊  ┊88┊  });
+┊  ┊89┊});
```
[}]: #

Also, we need to modify our publications, and add the images data for those publications:

[{]: <helper> (diff_step 12.29)
#### Step 12.29: Added images to users publication

##### Changed api/server/publications.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import { User, Message, Chat } from './models';
+┊ ┊1┊import { User, Message, Chat, Picture } from './models';
 ┊2┊2┊import { Users } from './collections/users';
 ┊3┊3┊import { Messages } from './collections/messages';
 ┊4┊4┊import { Chats } from './collections/chats';
```
```diff
@@ -16,7 +16,7 @@
 ┊16┊16┊  if (pattern) {
 ┊17┊17┊    selector = {
 ┊18┊18┊      'profile.name': { $regex: pattern, $options: 'i' }
-┊19┊  ┊    };
+┊  ┊19┊    }
 ┊20┊20┊  }
 ┊21┊21┊
 ┊22┊22┊  return {
```
```diff
@@ -25,7 +25,17 @@
 ┊25┊25┊        fields: { profile: 1 },
 ┊26┊26┊        limit: 15
 ┊27┊27┊      });
-┊28┊  ┊    }
+┊  ┊28┊    },
+┊  ┊29┊
+┊  ┊30┊    children: [
+┊  ┊31┊      <PublishCompositeConfig1<User, Picture>> {
+┊  ┊32┊        find: (user) => {
+┊  ┊33┊          return Pictures.collection.find(user.profile.pictureId, {
+┊  ┊34┊            fields: { url: 1 }
+┊  ┊35┊          });
+┊  ┊36┊        }
+┊  ┊37┊      }
+┊  ┊38┊    ]
 ┊29┊39┊  };
 ┊30┊40┊});
```
[}]: #

[{]: <helper> (diff_step 12.30)
#### Step 12.30: Add images to chats publication

##### Changed api/server/publications.ts
```diff
@@ -80,7 +80,16 @@
 ┊80┊80┊          }, {
 ┊81┊81┊            fields: { profile: 1 }
 ┊82┊82┊          });
-┊83┊  ┊        }
+┊  ┊83┊        },
+┊  ┊84┊        children: [
+┊  ┊85┊          <PublishCompositeConfig2<Chat, User, Picture>> {
+┊  ┊86┊            find: (user, chat) => {
+┊  ┊87┊              return Pictures.collection.find(user.profile.pictureId, {
+┊  ┊88┊                fields: { url: 1 }
+┊  ┊89┊              });
+┊  ┊90┊            }
+┊  ┊91┊          }
+┊  ┊92┊        ]
 ┊84┊93┊      }
 ┊85┊94┊    ]
 ┊86┊95┊  };
```
[}]: #

And since we touched the collection hooks events, we can implement more features using this tool - for example, the following code will remove old messages when you remove chat:

[{]: <helper> (diff_step 12.31)
#### Step 12.31: Add hook for removing unused messages

##### Changed api/server/collections/chats.ts
```diff
@@ -1,4 +1,10 @@
 ┊ 1┊ 1┊import { MongoObservable } from 'meteor-rxjs';
 ┊ 2┊ 2┊import { Chat } from '../models';
+┊  ┊ 3┊import { Messages } from './messages';
 ┊ 3┊ 4┊
 ┊ 4┊ 5┊export const Chats = new MongoObservable.Collection<Chat>('chats');
+┊  ┊ 6┊
+┊  ┊ 7┊// Dispose unused messages
+┊  ┊ 8┊Chats.collection.after.remove(function (userId, doc) {
+┊  ┊ 9┊  Messages.collection.remove({ chatId: doc._id });
+┊  ┊10┊});
```
[}]: #

Now we just need to allow updating the pictureId of the user:

[{]: <helper> (diff_step 12.32)
#### Step 12.32: Allow updating pictureId

##### Changed api/server/methods.ts
```diff
@@ -59,7 +59,8 @@
 ┊59┊59┊      'User must be logged-in to create a new chat');
 ┊60┊60┊
 ┊61┊61┊    check(profile, {
-┊62┊  ┊      name: nonEmptyString
+┊  ┊62┊      name: nonEmptyString,
+┊  ┊63┊      pictureId: Match.Maybe(nonEmptyString)
 ┊63┊64┊    });
 ┊64┊65┊
 ┊65┊66┊    Meteor.users.update(this.userId, {
```
[}]: #

We also need to update our data fixtures, and use real user accounts with a real user images using the images store, so let's update those:

[{]: <helper> (diff_step 12.33)
#### Step 12.33: Update creation of users stubs

##### Changed api/server/main.ts
```diff
@@ -2,7 +2,7 @@
 ┊2┊2┊import { Chats } from './collections/chats';
 ┊3┊3┊import { Messages } from './collections/messages';
 ┊4┊4┊import * as moment from 'moment';
-┊5┊ ┊import { MessageType } from './models';
+┊ ┊5┊import { MessageType, Picture } from './models';
 ┊6┊6┊import { Accounts } from 'meteor/accounts-base';
 ┊7┊7┊import { Users } from './collections/users';
 ┊8┊8┊
```
```diff
@@ -16,43 +16,74 @@
 ┊16┊16┊    return;
 ┊17┊17┊  }
 ┊18┊18┊
+┊  ┊19┊  let picture = importPictureFromUrl({
+┊  ┊20┊    name: 'man1.jpg',
+┊  ┊21┊    url: 'https://randomuser.me/api/portraits/men/1.jpg'
+┊  ┊22┊  });
+┊  ┊23┊
 ┊19┊24┊  Accounts.createUserWithPhone({
 ┊20┊25┊    phone: '+972540000001',
 ┊21┊26┊    profile: {
 ┊22┊27┊      name: 'Ethan Gonzalez',
-┊23┊  ┊      picture: 'https://randomuser.me/api/portraits/men/1.jpg'
+┊  ┊28┊      pictureId: picture._id
 ┊24┊29┊    }
 ┊25┊30┊  });
 ┊26┊31┊
+┊  ┊32┊  picture = importPictureFromUrl({
+┊  ┊33┊    name: 'lego1.jpg',
+┊  ┊34┊    url: 'https://randomuser.me/api/portraits/lego/1.jpg'
+┊  ┊35┊  });
+┊  ┊36┊
 ┊27┊37┊  Accounts.createUserWithPhone({
 ┊28┊38┊    phone: '+972540000002',
 ┊29┊39┊    profile: {
 ┊30┊40┊      name: 'Bryan Wallace',
-┊31┊  ┊      picture: 'https://randomuser.me/api/portraits/lego/1.jpg'
+┊  ┊41┊      pictureId: picture._id
 ┊32┊42┊    }
 ┊33┊43┊  });
 ┊34┊44┊
+┊  ┊45┊  picture = importPictureFromUrl({
+┊  ┊46┊    name: 'woman1.jpg',
+┊  ┊47┊    url: 'https://randomuser.me/api/portraits/women/1.jpg'
+┊  ┊48┊  });
+┊  ┊49┊
 ┊35┊50┊  Accounts.createUserWithPhone({
 ┊36┊51┊    phone: '+972540000003',
 ┊37┊52┊    profile: {
 ┊38┊53┊      name: 'Avery Stewart',
-┊39┊  ┊      picture: 'https://randomuser.me/api/portraits/women/1.jpg'
+┊  ┊54┊      pictureId: picture._id
 ┊40┊55┊    }
 ┊41┊56┊  });
 ┊42┊57┊
+┊  ┊58┊  picture = importPictureFromUrl({
+┊  ┊59┊    name: 'woman2.jpg',
+┊  ┊60┊    url: 'https://randomuser.me/api/portraits/women/2.jpg'
+┊  ┊61┊  });
+┊  ┊62┊
 ┊43┊63┊  Accounts.createUserWithPhone({
 ┊44┊64┊    phone: '+972540000004',
 ┊45┊65┊    profile: {
 ┊46┊66┊      name: 'Katie Peterson',
-┊47┊  ┊      picture: 'https://randomuser.me/api/portraits/women/2.jpg'
+┊  ┊67┊      pictureId: picture._id
 ┊48┊68┊    }
 ┊49┊69┊  });
 ┊50┊70┊
+┊  ┊71┊  picture = importPictureFromUrl({
+┊  ┊72┊    name: 'man2.jpg',
+┊  ┊73┊    url: 'https://randomuser.me/api/portraits/men/2.jpg'
+┊  ┊74┊  });
+┊  ┊75┊
 ┊51┊76┊  Accounts.createUserWithPhone({
 ┊52┊77┊    phone: '+972540000005',
 ┊53┊78┊    profile: {
 ┊54┊79┊      name: 'Ray Edwards',
-┊55┊  ┊      picture: 'https://randomuser.me/api/portraits/men/2.jpg'
+┊  ┊80┊      pictureId: picture._id
 ┊56┊81┊    }
 ┊57┊82┊  });
 ┊58┊83┊});
+┊  ┊84┊
+┊  ┊85┊function importPictureFromUrl(options: { name: string, url: string }): Picture {
+┊  ┊86┊  const description = { name: options.name };
+┊  ┊87┊
+┊  ┊88┊  return Meteor.call('ufsImportURL', options.url, description, 'pictures');
+┊  ┊89┊}
```
[}]: #

To avoid weird errors and bugs, we need to reset our MongoDB to match the new structure:

  $ cd api/
  $ meteor reset
  
We also need to update our client side and use the new field (`pictureId`) instead of the old one:

[{]: <helper> (diff_step 12.34)
#### Step 12.34: Fetch user image from server

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
-┊2┊ ┊import { Chats, Messages, Users } from 'api/collections';
+┊ ┊2┊import { Chats, Messages, Users, Pictures } from 'api/collections';
 ┊3┊3┊import { Chat, Message } from 'api/models';
 ┊4┊4┊import { NavController, PopoverController, ModalController, AlertController } from 'ionic-angular';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
```
```diff
@@ -48,7 +48,7 @@
 ┊48┊48┊
 ┊49┊49┊        if (receiver) {
 ┊50┊50┊          chat.title = receiver.profile.name;
-┊51┊  ┊          chat.picture = receiver.profile.picture;
+┊  ┊51┊          chat.picture = Pictures.getPictureUrl(receiver.profile.pictureId);
 ┊52┊52┊        }
 ┊53┊53┊
 ┊54┊54┊        // This will make the last message reactive
```
[}]: #

Now, let's do the same with the new chat component:

[{]: <helper> (diff_step 12.35)
#### Step 12.35: Use the new pictureId field for new chat modal

##### Changed src/pages/chats/new-chat.html
```diff
@@ -26,7 +26,7 @@
 ┊26┊26┊<ion-content class="new-chat">
 ┊27┊27┊  <ion-list class="users">
 ┊28┊28┊    <button ion-item *ngFor="let user of users | async" class="user" (click)="addChat(user)">
-┊29┊  ┊      <img class="user-picture" [src]="user.profile.picture">
+┊  ┊29┊      <img class="user-picture" [src]="getPic(user.profile.pictureId)">
 ┊30┊30┊      <h2 class="user-name">{{user.profile.name}}</h2>
 ┊31┊31┊    </button>
 ┊32┊32┊  </ion-list>
```
[}]: #

[{]: <helper> (diff_step 12.36)
#### Step 12.36: Implement getPic

##### Changed src/pages/chats/new-chat.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
-┊2┊ ┊import { Chats, Users } from 'api/collections';
+┊ ┊2┊import { Chats, Users, Pictures } from 'api/collections';
 ┊3┊3┊import { User } from 'api/models';
 ┊4┊4┊import { AlertController, ViewController } from 'ionic-angular';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
```
```diff
@@ -107,4 +107,8 @@
 ┊107┊107┊
 ┊108┊108┊    alert.present();
 ┊109┊109┊  }
+┊   ┊110┊
+┊   ┊111┊  getPic(pictureId): string {
+┊   ┊112┊    return Pictures.getPictureUrl(pictureId);
+┊   ┊113┊  }
 ┊110┊114┊}
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step11.md) | [Next Step >](step13.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #