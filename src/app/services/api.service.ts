import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../barbero-online/admin/gestion-citas/gestion-citas.component';

interface User {
  id: number;
  username: string;
  email: string;
  telefono: string | null;
  rol: 'admin' | 'barbero' | 'cliente' | string; // Ahora usa 'cliente'
  estado: 'activo' | 'inactivo' | string;
}


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost/barberia/index.php'; // URL base

  constructor(private http: HttpClient) {}

  // listar datos de usuario admin (espera JSON)
  getadmin(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?accion=listar_admin`); // Especificar tipo <any> o una interfaz
  }

  //Obtiene la lista de todos los usuarios (admin, barbero, usuario).
  getUsuarios(): Observable<User[]> {
    // Devuelve un Observable de array de User
    return this.http.get<User[]>(`${this.apiUrl}?accion=listar_usuarios`);
  }

  /**
   * Obtiene la lista de roles posibles desde la definición ENUM de la BD.
   */
  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}?accion=listar_roles`);
  }

  // cargar datos para actualizar los del usuario admin (envía y espera JSON)
  updateAdmin(adminData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json', // Envía JSON
      }),
      // Por defecto espera JSON como respuesta
    };
    // Llamamos usando POST y enviamos los datos JSON en el cuerpo
    return this.http.post<any>(
      `${this.apiUrl}?accion=actualizar_admin`,
      adminData,
      httpOptions
    );
  }

  getCitas(): Observable<Cita[]> { 
    console.log('cargando hacia api');
    return this.http.get<Cita[]>(`${this.apiUrl}?accion=listarCitas`);    
  }

  actualizarEstadoCita(id: number, estado: string): Observable<any> {
    console.log('actualizando estado de cita', id, estado);
    const citaData = {
      id: id,
      estado: estado,
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json', // Enviar JSON
      }),
      // Por defecto espera JSON como respuesta
    };

    // Llamamos usando POST y enviamos los datos JSON en el cuerpo
    return this.http.post<any>(
      `${this.apiUrl}?accion=actualizar_estado_cita`, // Acción en la URL
      citaData,
      httpOptions
    );
  }
  
  agregarCita(cita: Cita): Observable<any> {
    console.log('estoy en el API agregar cita');
    return this.http.post(`${this.apiUrl}?accion=agregar_cita`, cita);
  }

  listarClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?accion=listarClientes`);
  }

  listarBarberos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?accion=listarBarberos`);
  }

  listarSucursales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?accion=listarSucursales`);
  }

  listarServiciosPorSucursal(sucursalId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?accion=listarServiciosPorSucursal&sucursal_id=${sucursalId}`);
  }
  
  reprogramarCita(cita: Cita): Observable<any> {
    return this.http.post(`${this.apiUrl}?accion=reprogramar_cita`, cita);
  }

}