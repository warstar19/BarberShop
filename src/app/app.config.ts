import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors} from '@angular/common/http'; // Importa withInterceptors
import { routes } from './app.routes';
import { credentialsInterceptor } from './credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Proporciona las rutas a la aplicación
    provideHttpClient(
      withInterceptors([credentialsInterceptor]) // Proporciona el interceptor de credenciales para las solicitudes HTTP
    ),
    
  ]
};
