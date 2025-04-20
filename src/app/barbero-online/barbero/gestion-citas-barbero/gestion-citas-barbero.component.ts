import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export interface Cita {
  id: number;
  cliente_id: number;
  barbero_id: number;
  servicio_id: number;
  sucursal_id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  title?: string;
  cliente_nombre?: string;
  servicio_nombre?: string;
  barbero_nombre?: string;
  meta?: {
    cliente?: string;
    barbero?: string;
    servicio?: string;
    sucursal?: string;
    tiempo?: string;
    estado?: Cita['estado'];
  };
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: 'cliente' | 'barbero' | 'admin';
  estado: string;
  fecha_creacion: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
}



@Component({
  selector: 'app-gestion-citas-barbero',  
  templateUrl: './gestion-citas-barbero.component.html',
  styleUrl: './gestion-citas-barbero.component.css',
  providers: [DatePipe],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class GestionCitasBarberoComponent implements OnInit {

  baseUrl = 'http://localhost/barberia/backend/api';
  
    events: Cita[] = [];
    citaAReprogramar: Cita | null = null;
    mostrarFormularioReprogramar = false;
    nuevaFechaInicioReprogramar: string | null = null;
    nuevaFechaFinReprogramar: string | null = null;
  
    nuevaCita: Cita = this.getNuevaCitaInicial();
  
    mostrarFormularioNuevaCita = false;
  
    clientes: Usuario[] = [];
    barberos: Usuario[] = [];
    servicios: Servicio[] = [];
    sucursales: Sucursal[] = [];
  
    constructor(private http: HttpClient, private datePipe: DatePipe) {}
  
    ngOnInit(): void {
      this.loadServicios();  // Cargar servicios primero
      this.loadCitas();      // Luego cargar las citas
      this.loadClientes();
      this.loadBarberos();
      this.loadSucursales();
    }
  
    private getNuevaCitaInicial(): Cita {
      const now = new Date();
      return {
        id: 0,
        cliente_id: 0,
        barbero_id: 0,
        servicio_id: 0,
        sucursal_id: 0,
        fecha_inicio: now,
        fecha_fin: now,
        estado: 'pendiente',
        notas: '',
        title: '',
        meta: {}
      };
    }
  
    private handleApiError(error: any): void {
      console.error('Error en la API:', error);
    }
  
    loadCitas(): void {
      this.http.get<any[]>(`${this.baseUrl}/citas/read_cita.php`,{withCredentials:true}).pipe(
        catchError(error => {
          this.handleApiError(error);
          return of([]);
        })
      ).subscribe(data => {
        this.events = data.map(cita => {
          // Buscar el servicio correspondiente usando el servicio_id
          const servicio = this.servicios.find(s => s.id === cita.servicio_id);
  
          return {
            ...cita,
            fecha_inicio: new Date(cita.fecha_inicio),
            fecha_fin: new Date(cita.fecha_fin),
            cliente_nombre: cita.cliente_nombre ?? 'No disponible',
            barbero_nombre: cita.barbero_nombre ?? 'No disponible',
            servicio_nombre: servicio ? servicio.nombre : 'No disponible',  // Asignamos el nombre del servicio
            meta: {
              estado: cita.estado,
              cliente: cita.cliente_nombre ?? 'No disponible',
              barbero: cita.barbero_nombre ?? 'No disponible',
              servicio: servicio ? servicio.nombre : 'No disponible'  // También asignamos aquí el nombre del servicio
            }
          };
        });
      });
    }
  
    loadClientes(): void {
      this.http.get<Usuario[]>(`${this.baseUrl}/usuarios/select.php?accion=clientes`).pipe(
        catchError(error => {
          this.handleApiError(error);
          return of([]);
        })
      ).subscribe(clientes => {
        this.clientes = clientes;
      });
    }
  
    loadBarberos(): void {
      this.http.get<Usuario[]>(`${this.baseUrl}/usuarios/select.php?accion=barberos`).pipe(
        catchError(error => {
          this.handleApiError(error);
          return of([]);
        })
      ).subscribe(barberos => {
        this.barberos = barberos;
      });
    }
  
    loadSucursales(): void {
      this.http.get<Sucursal[]>(`${this.baseUrl}/sucursales/read_sucursal.php`).pipe(
        catchError(error => {
          this.handleApiError(error);
          return of([]);
        })
      ).subscribe(sucursales => {
        this.sucursales = sucursales;
      });
    }
  
    loadServicios(): void {
      this.http.get<Servicio[]>(`${this.baseUrl}/servicios/read_servicio.php`).pipe(
        catchError(error => {
          this.handleApiError(error);
          return of([]);
        })
      ).subscribe(servicios => {
        this.servicios = servicios;  // Aquí se deben cargar correctamente los servicios
      });
    }
  
    cargarServiciosPorSucursal(sucursalId: number): void {
      this.http.get<Servicio[]>(`${this.baseUrl}/servicios_sucursal/read_servicio_sucursal.php?sucursal_id=${sucursalId}`).pipe(
        catchError(error => {
          this.handleApiError(error);
          return of([]);
        })
      ).subscribe(servicios => {
        this.servicios = servicios;  // Aquí se actualizan los servicios con los filtrados por sucursal
      });
    }
    confirmCita(cita: Cita): void {
      window.alert("Accion no autorizada");
  }
  
  cancelCita(cita: Cita): void {
    window.alert("Accion no autorizada");
  }
  
  
  
    rescheduleCita(cita: Cita): void {
      window.alert("Accion no autorizada");
    }
  
    guardarReprogramacion(): void {
      window.alert("Accion no autorizada");
    }
  
    cancelarReprogramacion(): void {
      window.alert("Accion no autorizada");
    }
  
    agregarCita(): void {
      this.mostrarFormularioNuevaCita = true;
      this.nuevaCita = this.getNuevaCitaInicial();
    }
  
    guardarNuevaCita(): void {
      const { cliente_id, barbero_id, servicio_id, sucursal_id } = this.nuevaCita;
  
      // Validar que la fecha de inicio no sea posterior a la fecha de fin
      if (new Date(this.nuevaCita.fecha_inicio) >= new Date(this.nuevaCita.fecha_fin)) {
        alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
        return;
      }
  
      if (
        this.clientes.some(c => c.id === cliente_id) &&
        this.barberos.some(b => b.id === barbero_id) &&
        this.servicios.some(s => s.id === servicio_id) &&
        this.sucursales.some(su => su.id === sucursal_id)
      ) {
        this.http.post(`${this.baseUrl}/citas/create_cita.php`, this.nuevaCita).subscribe(
          () => {
            this.mostrarFormularioNuevaCita = false;
            this.nuevaCita = this.getNuevaCitaInicial();
            this.loadCitas();
          },
          error => this.handleApiError(error)
        );
      } else {
        console.error('Error: Faltan datos válidos para guardar la cita.');
      }
    }
    rejectCita(cita: Cita): void {
      window.alert("Accion no autorizada");
    }
  
    cancelarNuevaCita(): void {
      window.alert("Accion no autorizada");
    }

}
