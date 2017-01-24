import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ChatsPage } from '../pages/chats/chats';
import { MomentModule } from 'angular2-moment';
import { MessagesPage } from '../pages/messages/messages';
import { LoginPage } from '../pages/login/login';
import { PhoneService } from '../services/phone';
import { VerificationPage } from '../pages/verification/verification';
import { ProfilePage } from '../pages/profile/profile';
import { ChatsOptionsComponent } from '../pages/chats/chats-options';
import { NewChatComponent } from '../pages/chats/new-chat';
import { MessagesOptionsComponent } from '../pages/messages/messages-options';
import { AgmCoreModule } from 'angular2-google-maps/core';
import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
import { NewLocationMessageComponent } from '../pages/messages/location-message';

@NgModule({
  declarations: [
    MyApp,
    ChatsPage,
    MessagesPage,
    LoginPage,
    VerificationPage,
    ProfilePage,
    ChatsOptionsComponent,
    NewChatComponent,
    MessagesOptionsComponent,
    MessagesAttachmentsComponent,
    NewLocationMessageComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    MomentModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA'
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ChatsPage,
    MessagesPage,
    LoginPage,
    VerificationPage,
    ProfilePage,
    ChatsOptionsComponent,
    NewChatComponent,
    MessagesOptionsComponent,
    MessagesAttachmentsComponent,
    NewLocationMessageComponent
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    PhoneService
  ]
})
export class AppModule {}
