// src/app/credentials.interceptor.ts

import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor funcional que añade automáticamente `withCredentials: true`
 * a las peticiones salientes dirigidas a la API backend.
 * Esto es necesario para enviar/recibir cookies de sesión PHP.
 */
export const credentialsInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, // La petición original
  next: HttpHandlerFn // Función para continuar la cadena de interceptores/backend
): Observable<HttpEvent<unknown>> => {
  // Define la URL base de tu API para aplicar el interceptor selectivamente (recomendado)
  const apiUrlBase = 'http://localhost/barberia/backend/api'; 
  
  // Log para CUALQUIER petición saliente (para ver si se llama)
  console.log(`CredentialsInterceptor: Interceptando ${req.method} a ${req.url}`);
  // Aplica withCredentials solo a las peticiones que van a tu API
  if (req.url.startsWith(apiUrlBase)) {
    // Clona la petición original para poder modificarla
    console.log(`CredentialsInterceptor: Aplicando withCredentials=true a ${req.url}`);
    const reqWithCreds = req.clone({
      // Establece withCredentials en true
      withCredentials: true,
    });
    // Log DESPUÉS de clonar (para verificar)
    console.log(`CredentialsInterceptor: Petición clonada con withCredentials=${reqWithCreds.withCredentials}`);
    return next(reqWithCreds);
  }

  // Si la petición no es para tu API (ej: pedir archivos locales, otras APIs externas),
  // pásala sin modificar.
  return next(req);
};
