//Este interceptor se encarga de añadir automáticamente el token JWT (si existe) a las cabeceras de las peticiones HTTP salientes.
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service'; // <-- RUTA a AuthService

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {} // Inyecta AuthService

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken(); // Obtiene el token actual

    // Si hay token, clona la petición y añade la cabecera Authorization
    if (authToken) {
      // Evita añadir la cabecera a la propia petición de login (si la URL la contiene)
      // Puede hacer esta condición más específica si es necesario
      if (req.url.includes('/auth.php')) { // Asumiendo que login está en auth.php
           return next.handle(req); // Pasa la petición original sin token
      }

      // Clona la petición para añadir la nueva cabecera (las peticiones son inmutables)
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` } // Formato estándar Bearer
      });
      // console.log('Interceptor: Añadiendo token Bearer'); // Para depuración
      return next.handle(authReq); // Envía la petición clonada con la cabecera
    }

    // Si no hay token, pasa la petición original sin modificar
    return next.handle(req);
  }
}