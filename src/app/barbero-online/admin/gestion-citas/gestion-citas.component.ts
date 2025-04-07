import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
    estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  };
}



@Component({
  selector: 'app-gestion-citas',
  templateUrl: './gestion-citas.component.html',
  styleUrls: ['./gestion-citas.component.css'],
  providers: [DatePipe],
  imports: [CommonModule,FormsModule, HttpClientModule],
  standalone: true,
})
export class GestionCitasComponent implements OnInit {
  events: Cita[] = [];
  citaAReprogramar: Cita | null = null;
  mostrarFormularioReprogramar: boolean = false;
  nuevaFechaInicioReprogramar: string | null = null; // Propiedad para almacenar la fecha de inicio
  nuevaFechaFinReprogramar: string | null = null; // Propiedad para almacenar la fecha de fin
  constructor(private datePipe: DatePipe, private apiService: ApiService) {} // Inyecta el servicio API

  ngOnInit(): void {
    this.loadCitas(); // Llama a la función para cargar las citas al inicializar el componente
  }  

  loadCitas(): void {
    console.log('Cargando citas backend');
    this.apiService.getCitas().subscribe(
      (data: any[]) => {
        console.log('Respuesta de backend:', data);// Ver si llega JSON válido
        
        this.events = data.map(cita => ({
          id: cita.id,
          cliente_id: cita.cliente_id,
          barbero_id: cita.barbero_id,
          servicio_id: cita.servicio_id,
          sucursal_id: cita.sucursal_id,
          fecha_inicio: new Date(cita.fecha_inicio),
          fecha_fin: new Date(cita.fecha_fin),
          estado: cita.estado,
          notas: cita.notas,
          servicio_nombre: cita.servicio_nombre || 'No disponible',
          cliente_nombre: cita.cliente_nombre || 'No disponible',
          barbero_nombre: cita.barbero_nombre || 'No disponible',         
          meta: {
            estado: cita.estado,
            cliente: cita.cliente_nombre || 'No disponible',
            servicio: cita.servicio_nombre || 'No disponible',
            barbero: cita.barbero_nombre || 'No disponible', 
          },
        }));
      },
      (error:any) => {
        console.error('Error al cargar las citas:', error);
      }
    );
  }

  nuevaCita: Cita = { // Define un objeto para almacenar los datos de la nueva cita
    id: 0, // O algún valor inicial
    cliente_id: 0,
    barbero_id: 0,
    servicio_id: 0,
    sucursal_id: 0,
    fecha_inicio: new Date(),
    fecha_fin: new Date(),
    estado: 'pendiente',
    notas:'',
    title: '',
    meta: {}
  };
  mostrarFormularioNuevaCita: boolean = false;
  clientes: any[] = [];
  barberos: any[] = [];
  servicios: any[] = [];
  sucursales: any[] = [];
  agregarCita(): void {
    this.mostrarFormularioNuevaCita = true;
    this.apiService.listarClientes().subscribe(clientes => {
      this.clientes = clientes;
      console.log('Clientes cargados:', this.clientes); // <---  log de clientes
    });
    this.apiService.listarBarberos().subscribe(barberos => {
      this.barberos = barberos;
      console.log('Barberos cargados:', this.barberos); // <--- LOG de barberos
    });
    this.apiService.listarSucursales().subscribe(sucursales => {
      this.sucursales = sucursales;
      console.log('Sucursales cargadas:', this.sucursales); // <--- LOG de sucursales
    });
    // Los servicios se cargarán al seleccionar la sucursal
  }

  cargarServiciosPorSucursal(sucursalId: number): void {
    this.apiService.listarServiciosPorSucursal(sucursalId).subscribe(servicios => {
      this.servicios = servicios;
      console.log('Servicios cargados:', this.servicios); // <--- lOG de servicios por sucursal
    });
  }

  guardarNuevaCita(): void {
    console.log('this.nuevaCita:', this.nuevaCita); // <--- LOG del objeto nuevaCita

    // Cargar servicios si no se han cargado o si la sucursal ha cambiado
    if (this.nuevaCita.sucursal_id && (this.servicios.length === 0 || this.nuevaCita.sucursal_id !== this.sucursalSeleccionadaAnterior)) {
      this.apiService.listarServiciosPorSucursal(this.nuevaCita.sucursal_id).subscribe(servicios => {
        this.servicios = servicios;
        console.log('Servicios cargados (en guardarNuevaCita):', this.servicios); // <--- LOG de servicios
        this.buscarYGuardarCita(); // Llama a una nueva función para buscar y guardar
      });
    } else {
      this.buscarYGuardarCita(); // Si los servicios ya están cargados, busca y guarda directamente
    }
    this.sucursalSeleccionadaAnterior = this.nuevaCita.sucursal_id; // Guarda la sucursal actual para la próxima verificación
  }

  sucursalSeleccionadaAnterior: number | null = null; // Propiedad para rastrear la sucursal anterior

  buscarYGuardarCita(): void {
    const clienteSeleccionado = this.clientes.find(cliente => cliente.id === this.nuevaCita.cliente_id);
    const barberoSeleccionado = this.barberos.find(barbero => barbero.id === this.nuevaCita.barbero_id);
    const servicioSeleccionado = this.servicios.find(servicio => servicio.id === Number(this.nuevaCita.servicio_id));
    const sucursalSeleccionada = this.sucursales.find(sucursal => sucursal.id === this.nuevaCita.sucursal_id);

    console.log('servicioSeleccionado:', servicioSeleccionado); // <--- LOG de servicio seleccionado

    if (clienteSeleccionado && barberoSeleccionado && servicioSeleccionado && sucursalSeleccionada) {
      this.nuevaCita.cliente_id = clienteSeleccionado.id;
      this.nuevaCita.barbero_id = barberoSeleccionado.id;
      this.nuevaCita.servicio_id = servicioSeleccionado.id;
      this.nuevaCita.sucursal_id = sucursalSeleccionada.id;

      this.apiService.agregarCita(this.nuevaCita).subscribe(
        response => {
          console.log('Cita agregada exitosamente:', response);
          this.mostrarFormularioNuevaCita = false;
          this.loadCitas();
        },
        error => {
          console.error('Error al agregar la cita:', error);
        }
      );
    } else {
      console.error('Error: No se pudieron encontrar los IDs correspondientes.');
    }
  }

  cancelarNuevaCita(): void {
    this.mostrarFormularioNuevaCita = false; // Oculta el formulario si el usuario cancela
    this.nuevaCita = { ...this.nuevaCita }; // Limpia o resetea el objeto nuevaCita si es necesario
  }
  confirmCita(cita: Cita): void {
    console.log('Confirmar cita:', cita);
    cita.estado = 'confirmada';  // Es importante mantenerlo consistente en el frontend
  
    this.apiService.actualizarEstadoCita(cita.id, cita.estado).subscribe(
      () => {
        console.log('Cita confirmada');
        // Aquí puedes actualizar la lista de citas o realizar alguna acción extra si es necesario
        this.loadCitas();  // Método para recargar las citas (si es necesario)
      },
      error => {
        console.error('Error al confirmar la cita:', error);
      }
    );
  }
  
  cancelCita(cita: Cita): void {
    console.log('Cancelar cita:', cita);
    if (cita.estado !== 'cancelada') {  // Solo hacer la acción si no está ya cancelada
      cita.estado = 'cancelada';  // Cambiar el estado de la cita en el frontend
      this.apiService.actualizarEstadoCita(cita.id, cita.estado).subscribe(
        () => {
          console.log('Cita cancelada');
          // Aquí también puedes actualizar la lista de citas si es necesario
          this.loadCitas();  // Recargar citas después de la cancelación
        },
        error => {
          console.error('Error al cancelar la cita:', error);
        }
      );
    } else {
      console.log('La cita ya está cancelada.');
    }
  }
  
  
  rescheduleCita(cita: Cita): void {
    // Lógica para reprogramar la cita
    console.log('Reprogramando cita:', cita);
    this.citaAReprogramar = { ...cita }; // Copia la cita a reprogramar para no modificar la original hasta guardar
    this.nuevaFechaInicioReprogramar = this.datePipe.transform(cita.fecha_inicio, 'yyyy-MM-ddTHH:mm'); // Formatea la fecha si es necesario
    this.nuevaFechaFinReprogramar = this.datePipe.transform(cita.fecha_fin, 'yyyy-MM-ddTHH:mm'); // Formatea la fecha si es necesario
    this.mostrarFormularioReprogramar = true; // Muestra el formulario de reprogramación    
  
  }

  guardarReprogramacion(): void {
    if (this.citaAReprogramar) {
      console.log('Guardando reprogramación:', this.citaAReprogramar);
      const reprogramacionData = {
        id: this.citaAReprogramar.id,
        fecha_inicio: this.citaAReprogramar.fecha_inicio.toISOString(),
        fecha_fin: this.citaAReprogramar.fecha_fin.toISOString()
      };
      this.apiService.reprogramarCita(this.citaAReprogramar).subscribe(
        response => {
          console.log('Cita reprogramada exitosamente:', response);
          this.mostrarFormularioReprogramar = false; // Oculta el formulario
          this.citaAReprogramar = null; // Limpia la cita a reprogramar
          this.loadCitas(); // Recarga la lista de citas
        },
        error => {
          console.error('Error al reprogramar la cita:', error);
          // Aquí podrías mostrar un mensaje de error al usuario
        }
      );
    }
  }

  cancelarReprogramacion(): void {
    this.mostrarFormularioReprogramar = false;
    this.citaAReprogramar = null; // Limpia la cita a reprogramar
  }

  

}