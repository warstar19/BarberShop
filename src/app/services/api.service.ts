import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost/barberia/index.php';

  constructor(private http: HttpClient) {}

  getBarberos(): Observable<any> {
    return this.http.get(`${this.apiUrl}?accion=listar_barberos`);
  }

  getCitas(): Observable<any> {
    return this.http.get(`${this.apiUrl}?accion=listar_citas`);
  }

  agendarCita(cita: any): Observable<any> {
    return this.http.post(`${this.apiUrl}?accion=agendar_cita`, cita);
  }

  actualizarCita(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}?accion=actualizar_cita&id=${id}`, { estado });
  }

  eliminarCita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?accion=eliminar_cita&id=${id}`);
  }
}

