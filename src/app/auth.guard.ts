// src/app/auth.guard.ts (Versión para Sesiones PHP Nativas)

import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs'; // Importar 'of' si se usa en catchError
import { map, take, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service'; // 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot, // Info de la ruta destino
    state: RouterStateSnapshot // Info del estado del router (URL original)
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Usaremos el estado isLoggedIn$ que AuthService mantiene actualizado
    // gracias a la llamada inicial a checkSession() y las respuestas de login/logout.
    return this.authService.isLoggedIn$.pipe(
      take(1), // Tomamos solo el valor más reciente del estado de login
      map(isLoggedIn => {
        if (isLoggedIn) {
          // --- Usuario está logueado según AuthService ---

          // 1. Verificar si la ruta requiere roles específicos
          const requiredRoles = route.data['roles'] as Array<string>;
          if (!requiredRoles || requiredRoles.length === 0) {
            return true; // No se requieren roles, acceso permitido
          }

          // 2. Obtener el rol actual del usuario (desde AuthService)
          const userRole = this.authService.getCurrentUserRole(); // Método síncrono

          // 3. Comparar rol de usuario con roles requeridos
          if (userRole && requiredRoles.includes(userRole)) {
            return true; // Rol permitido, acceso concedido
          } else {
            // Rol no permitido
            console.error(`AuthGuard: Acceso Denegado a ${state.url}. Rol Requerido: ${requiredRoles}, Rol Usuario: ${userRole}`);
            // Redirigir a una página adecuada (login o 'acceso-denegado')
            // Podrías redirigir al dashboard del rol actual si lo prefieres a mandar a login
            // if (userRole === 'cliente') return this.router.createUrlTree(['/usuario']);
            // if (userRole === 'barbero') return this.router.createUrlTree(['/barbero']);
            // etc.
            return this.router.createUrlTree(['/login']); // Opción simple: redirigir a login
          }
        } else {
          // --- Usuario NO está logueado según AuthService ---
          console.log(`AuthGuard: Usuario no logueado. Redirigiendo a login desde ${state.url}`);
          // Redirigir a login, guardando la URL a la que intentaba acceder
          return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }
      })
      // Nota: Podríamos añadir un switchMap a checkSession() aquí para MÁXIMA seguridad
      // y verificar con el backend en CADA navegación, pero puede ser más lento.
      // El enfoque actual confía en que AuthService mantiene el estado razonablemente actualizado.
    );
  }
}