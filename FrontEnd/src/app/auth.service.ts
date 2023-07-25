export class AuthService {
    loggedIn = false;
  
    isAuthenticated() {
      const promise = new Promise((resolve, reject) => {
        resolve(this.loggedIn);
      });
      return promise;
    }
  
    haslogin(): boolean {

      return this.loggedIn;
      
    }
    haslogout(): boolean {

      return this.loggedIn;
    }
  }
  