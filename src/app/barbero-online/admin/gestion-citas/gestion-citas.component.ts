import { Component, OnInit } from '@angular/core';
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
  selector: 'app-gestion-citas',
  templateUrl: './gestion-citas.component.html',
  styleUrls: ['./gestion-citas.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class GestionCitasComponent implements OnInit {
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
    console.log(`GESTION-CITAS: Intentando llamar a ${this.baseUrl}/citas/read_cita.php`);
    this.http.get<any[]>(`${this.baseUrl}/citas/read_cita.php`, {withCredentials:true}).pipe(
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
    const body = { id: cita.id, estado: 'completada' };  // 'completada' es el valor del nuevo estado
    console.log('Completando cita', body);  // Agregado para debug

    // Llamar al endpoint DELETE para actualizar el estado de la cita
    this.http.delete(`${this.baseUrl}/citas/delete_cita.php`, { body }).subscribe(
      () => {
        console.log('Cita completada');
        this.loadCitas();  // Recargar las citas después de actualizar el estado
      },
      error => this.handleApiError(error)  // Manejo de errores
    );
}

cancelCita(cita: Cita): void {
    // Alternar entre 'cancelada' y 'rechazada' dependiendo del estado actual de la cita
    let estado: 'cancelada' | 'rechazada' = cita.estado === 'cancelada' ? 'rechazada' : 'cancelada';
    const body = { id: cita.id, estado: estado };
    console.log('Cancelando cita', body);  // Agregado para debug

    // Llamar al endpoint DELETE para actualizar el estado de la cita
    this.http.delete(`${this.baseUrl}/citas/delete_cita.php`, { body }).subscribe(
      () => {
        console.log('Cita cancelada/rechazada');
        this.loadCitas();  // Recargar las citas después de actualizar el estado
      },
      error => this.handleApiError(error)  // Manejo de errores
    );
}



  rescheduleCita(cita: Cita): void {
    this.citaAReprogramar = { ...cita };
    this.nuevaFechaInicioReprogramar = this.datePipe.transform(cita.fecha_inicio, 'yyyy-MM-ddTHH:mm');
    this.nuevaFechaFinReprogramar = this.datePipe.transform(cita.fecha_fin, 'yyyy-MM-ddTHH:mm');
    this.mostrarFormularioReprogramar = true;
  }

  guardarReprogramacion(): void {
    if (this.citaAReprogramar && this.nuevaFechaInicioReprogramar && this.nuevaFechaFinReprogramar) {
      // Validar que la fecha de inicio no sea posterior a la fecha de fin
      if (new Date(this.nuevaFechaInicioReprogramar) >= new Date(this.nuevaFechaFinReprogramar)) {
        alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
        return;
      }

      // Preparar el objeto con los nuevos datos de la cita, sin modificar cliente, barbero, sucursal, y servicio
      const body = {
        id: this.citaAReprogramar.id,
        cliente_id: this.citaAReprogramar.cliente_id,  // Mantener el cliente
        barbero_id: this.citaAReprogramar.barbero_id,  // Mantener el barbero
        servicio_id: this.citaAReprogramar.servicio_id,  // Mantener el servicio
        sucursal_id: this.citaAReprogramar.sucursal_id,  // Mantener la sucursal
        fecha_inicio: this.nuevaFechaInicioReprogramar,
        fecha_fin: this.nuevaFechaFinReprogramar,
        estado: 'pendiente',  // Cambiar estado si es necesario, por ejemplo, a 'pendiente' al reprogramar
        notas: this.citaAReprogramar.notas ?? '',  // Mantener las notas existentes

      };

      // Enviar los datos a la API para actualizar la cita
      this.http.put(`${this.baseUrl}/citas/update_cita.php`, body).subscribe(
        () => {
          this.mostrarFormularioReprogramar = false;  // Ocultar formulario de reprogramación
          this.citaAReprogramar = null;  // Limpiar la cita que estaba siendo reprogramada
          this.loadCitas();  // Recargar la lista de citas
        },
        error => this.handleApiError(error)  // Manejar posibles errores
      );
    }
  }

  cancelarReprogramacion(): void {
    this.mostrarFormularioReprogramar = false;
    this.citaAReprogramar = null;
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
    const body = { id: cita.id, estado: 'rechazada' };
    this.http.put(`${this.baseUrl}/citas/update_cita.php`, body).subscribe(
      () => this.loadCitas(),  // Recargar las citas después de actualizar el estado
      error => this.handleApiError(error)  // Manejo de errores
    );
  }

  cancelarNuevaCita(): void {
    this.mostrarFormularioNuevaCita = false;
    this.nuevaCita = this.getNuevaCitaInicial();
  }
}
