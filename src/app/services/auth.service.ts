// src/app/auth.service.ts (Versión para Sesiones PHP Nativas)

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError} from 'rxjs';
import { tap, catchError, map, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; // Importa HttpClient

// Interfaces para las respuestas de la API de sesión PHP
interface AuthUser {
  id: number;
  username: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: AuthUser; // El usuario es opcional en la respuesta de login ahora
}

interface CheckSessionResponse {
  loggedIn: boolean;
  user?: AuthUser;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // URLs de tus endpoints PHP para sesiones (¡AJUSTA RUTAS SI SON DIFERENTES!)
  private loginUrl = 'http://localhost/barberia/backend/api/auth.php';
  private logoutUrl = 'http://localhost/barberia/backend/api/logout.php';
  private checkSessionUrl =
    'http://localhost/barberia/backend/api/check_session.php';
  // URL para registrar (si la tienes separada)
  private registerUrl = 'http://localhost/barberia/backend/api/register.php'; // Ajusta si es necesario

  // --- Estados Internos (Basados en la respuesta del servidor) ---
  // Inician como "desconocido" hasta que checkSession responda
  private loggedIn = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<AuthUser | null>(null);
  private isLoadingSession = new BehaviorSubject<boolean>(true); // Para saber si aún se está verificando

  // --- Observables Públicos ---
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  currentUser$: Observable<AuthUser | null> = this.currentUser.asObservable();
  userRole$: Observable<string | null> = this.currentUser$.pipe(
    map((user) => user?.role || null)
  );
  userId$: Observable<number | null> = this.currentUser$.pipe(
    map((user) => user?.id || null)
  );
  isLoadingSession$: Observable<boolean> = this.isLoadingSession.asObservable(); // Para UI

  constructor(private http: HttpClient) {
    // Al iniciar el servicio, SIEMPRE verifica el estado de la sesión con el backend
    this.checkSession().subscribe();
  }

  /**
   * Llama a check_session.php para ver si hay una sesión PHP activa.
   * Actualiza el estado local (loggedIn, currentUser).
   * Crucial para saber si el usuario ya está logueado al cargar/refrescar la app.
   * Notar: withCredentials será añadido por el interceptor.
   */
  checkSession(): Observable<CheckSessionResponse> {
    this.isLoadingSession.next(true);
    return this.http
      .get<CheckSessionResponse>(
        this
          .checkSessionUrl /* { withCredentials: true } <- Lo hará el interceptor */
      )
      .pipe(
        tap((response) => {
          this.loggedIn.next(response.loggedIn);
          this.currentUser.next(response.user || null);
          console.log(
            'AuthService: CheckSession Response -> loggedIn:',
            response.loggedIn
          );
        }),
        catchError((error) => {
          console.error('AuthService: Error en checkSession:', error);
          this.logoutLocally(); // Asume logout si hay error al verificar
          return of({ loggedIn: false }); // Devuelve estado conocido
        }),
        finalize(() => {
          this.isLoadingSession.next(false); // Termina la carga inicial
        })
      );
  }

  /**
   * Llama a auth.php para intentar iniciar sesión.
   * Notar: withCredentials será añadido por el interceptor.
   */
  login(credentials: { email: string, password: string }): Observable<LoginResponse> {
    // Especificamos que esperamos LoginResponse del POST
    return this.http.post<LoginResponse>(this.loginUrl, credentials /* { withCredentials: true } <- Interceptor */).pipe(
      tap((response: LoginResponse) => {
        // --- Efectos Secundarios para RESPUESTAS HTTP Exitosas (código 2xx) ---

        // Verificamos la lógica de negocio devuelta por el backend
        if (response && response.success && response.user) {
          // Caso 1: Login exitoso según el backend
          this.loggedIn.next(true);
          this.currentUser.next(response.user);
          console.log("AuthService: Login success data received:", response.user);
        } else {
          // Caso 2: Petición HTTP fue OK (2xx), pero el backend indica fallo lógico
          // (ej: credenciales incorrectas devolviendo {success: false})
          console.warn("AuthService: Login API returned success=false or missing user data.");
          // Limpiamos estado local porque el login NO fue exitoso lógicamente
          this.logoutLocally();
          // NO lanzamos error aquí desde tap. El componente que se suscribe
          // debería verificar response.success si es necesario.
        }
      }),
      catchError((error): Observable<never> => {
        // --- Manejo de ERRORES HTTP (códigos NO 2xx) ---
        console.error("AuthService: HTTP Error during login:", error);
        this.logoutLocally(); // Limpia estado local en cualquier error HTTP

        // Construir un mensaje de error útil para el componente
        // Intenta obtener el mensaje de error del cuerpo de la respuesta, si existe
        const errorMessage = error.error?.error || // ¿Devuelve PHP { "error": "mensaje" } ?
                             error.error?.message || // ¿O devuelve { "message": "mensaje" } ?
                             error.message || // Mensaje genérico de HttpErrorResponse
                            'Error de autenticación desconocido';

        // Propagar el error como una notificación de error en el Observable
        return throwError(() => new Error(errorMessage));
      })
      // El tipo de retorno de este pipe sigue siendo Observable<LoginResponse>
      // porque 'tap' no cambia el tipo y 'catchError' con 'throwError'
      // devuelve un Observable que emite una notificación de error, lo cual es compatible.
    );
  }

  /**
   * Llama a register.php para registrar un nuevo usuario.
   * Notar: withCredentials NO suele ser necesario para registro público.
   * Si tu endpoint register.php REQUIERE sesión por alguna razón, el interceptor lo añadirá.
   */
  register(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(this.registerUrl, userData).pipe(
      catchError((error) => {
        console.error('AuthService: Error en la petición de registro:', error);
        return throwError(
          () => new Error(error.error?.error || 'Error en el registro.')
        );
      })
    );
  }

  /**
   * Llama a logout.php para destruir la sesión en el backend y limpia estado local.
   * Notar: withCredentials será añadido por el interceptor.
   */
  logout(): Observable<LogoutResponse> {
    return this.http
      .post<LogoutResponse>(
        this.logoutUrl,
        {} /* { withCredentials: true } <- Lo hará el interceptor */
      )
      .pipe(
        tap(() => this.logoutLocally()), // Siempre limpia localmente después de llamar a logout
        catchError((error) => {
          console.error('AuthService: Error en la petición de logout:', error);
          this.logoutLocally(); // Limpia estado local también si falla la petición de logout
          // Puedes decidir si propagar el error o simplemente completar
          return of({
            success: false,
            message: 'Error en logout API, sesión local limpiada.',
          }); // Ejemplo: no propagar error crítico
          // return throwError(() => new Error(error.error?.error || 'Error al cerrar sesión')); // Si prefieres propagar
        })
      );
  }

  /** Limpia el estado de autenticación localmente en Angular */
  private logoutLocally(): void {
    this.loggedIn.next(false);
    this.currentUser.next(null);
    console.log('AuthService: Estado local limpiado (logout).');
  }

  // --- Métodos para obtener el estado actual (síncronos) ---
  // Útiles para guards o lógica inmediata, pero prefiere los observables ($)
  getCurrentUserRole(): string | null {
    return this.currentUser.getValue()?.role || null;
  }
  getCurrentUserId(): number | null {
    return this.currentUser.getValue()?.id || null;
  }
  isUserLoggedIn(): boolean {
    // Renombrado para claridad vs observable
    return this.loggedIn.getValue();
  }
}




