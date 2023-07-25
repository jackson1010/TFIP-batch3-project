import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { StorageServices } from './storageServices';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  storageService = inject(StorageServices);
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const jwtToken = this.storageService.getToken();

    if (jwtToken) {
      req = req.clone({
        setHeaders: {
          Authorization: jwtToken,
        },
        withCredentials: true,
      });
    }

    return next.handle(req).pipe(
      catchError((error) => {
        console.log('error:', error);
        return throwError(() => error);
      })
    );
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
