import { Component } from '@angular/core';
import { Chats, Pictures, Users } from 'api/collections';
import { User } from 'api/models';
import { AlertController, NavController, Platform, ViewController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { _ } from 'meteor/underscore';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'new-chat',
  templateUrl: 'new-chat.html'
})
export class NewChatComponent {
  searching = false;
  searchPattern: string;
  senderId: string;
  users: Observable<User[]>;
  usersSubscription: Subscription;

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private platform: Platform,
    private viewCtrl: ViewController
  ) {
    this.senderId = Meteor.userId();
  }

  observeSearchBar(observe: (eventName: string) => Observable<Event>): void {
    // Each time the search pattern changes, re-subscribe to the users data-set
    observe('keyup')
      // Prevents the search bar from being spammed
      .debounce(() => Observable.timer(1000))
      .forEach(() => {
        if (this.usersSubscription) {
          this.usersSubscription.unsubscribe();
        }

        this.usersSubscription = this.subscribeUsers();
      });
  }

  addChat(user): void {
    MeteorObservable.call('addChat', user._id).subscribe({
      next: () => {
        this.viewCtrl.dismiss();
      },
      error: (e: Error) => {
        this.viewCtrl.dismiss().then(() => {
          this.handleError(e);
        });
      }
    });
  }

  subscribeUsers(): Subscription {
    // Fetch all users matching search pattern
    const subscription = MeteorObservable.subscribe('users', this.searchPattern);
    const autorun = MeteorObservable.autorun();

    return Observable.merge(subscription, autorun).subscribe(() => {
      this.users = this.findUsers();
    });
  }

  findUsers(): Observable<User[]> {
    // Find all belonging chats
    return Chats.find({
      memberIds: this.senderId
    }, {
      fields: {
        memberIds: 1
      }
    })
    // Invoke merge-map with an empty array in case no chat found
    .startWith([])
    .mergeMap((chats) => {
      // Get all userIDs who we're chatting with
      const receiverIds = _.chain(chats)
        .pluck('memberIds')
        .flatten()
        .concat(this.senderId)
        .value();

      // Find all users which are not in belonging chats
      return Users.find({
        _id: { $nin: receiverIds }
      })
      // Invoke map with an empty array in case no user found
      .startWith([]);
    })
    .map((users) => {
      users.forEach((user) => {
        user.profile.picture = Pictures.getPictureUrl(user.profile.pictureId);
      });

      return users;
    });
  }

  handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      buttons: ['OK'],
      message: e.message,
      title: 'Oops!'
    });

    alert.present();
  }
}
