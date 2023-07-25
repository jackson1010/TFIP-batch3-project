import { Injectable } from '@angular/core';

const USERKEY = 'authenticateduser';
const JWTToken = 'token';

@Injectable()
export class StorageServices {
  user_id!: string;

  clearStorage() {
    window.sessionStorage.clear();
  }

  saveUser(userData: any) {
    window.sessionStorage.removeItem(USERKEY);
    window.sessionStorage.setItem(USERKEY, JSON.stringify(userData));
  }

  getUser(): any {
    const user = window.sessionStorage.getItem(USERKEY);
    if (user) {
      return JSON.parse(user);
    } else {
      return {};
    }
  }

  isLoggedIn(): boolean {
    const user = window.sessionStorage.getItem(USERKEY);
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  saveToken(data: any) {
    window.sessionStorage.removeItem(JWTToken);
    if (data) {
      window.sessionStorage.setItem(JWTToken, data);
    }
  }

  getToken(): any {
    const jwtToken = window.sessionStorage.getItem(JWTToken);
    if (jwtToken) {
      return jwtToken;
    } else {
      return '';
    }
  }
}
