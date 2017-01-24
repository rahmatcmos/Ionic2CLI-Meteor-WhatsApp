import { Injectable } from '@angular/core';
import { Accounts } from 'meteor/accounts-base';

@Injectable()
export class PhoneService {
  constructor() {

  }

  verify(phoneNumber: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Accounts.requestPhoneVerification(phoneNumber, (e: Error) => {
        if (e) {
          return reject(e);
        }

        resolve();
      });
    });
  }
}
