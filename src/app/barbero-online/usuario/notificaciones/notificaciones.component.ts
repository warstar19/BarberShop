import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Notificacion {
  id: number;
  fecha_hora: string;
  servicio: string;
  tiempoEstimado: number;
  barbero: string;
  cliente: string;
  telefono: string;
  tiempoRestante: number;
  mensajeCita: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  citaSeleccionada: Notificacion | null = null;
  cargando: boolean = true;
  citaMasCercana: Notificacion | null = null; // Guardamos la cita más cercana
  intervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarNotificaciones();

    // Refrescar notificaciones cada 60 segundos
    this.intervalId = setInterval(() => {
      this.cargarNotificaciones();
    }, 60000); // Cada 60 segundos

    // Inicialmente calculamos el tiempo restante
    this.calcularTiempoRestante();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Cargar las notificaciones desde la API
  cargarNotificaciones(): void {
    this.http.get<Notificacion[]>('http://localhost/barberia/backend/api/notificaciones/read_notificacion.php')
      .subscribe(
        (data) => {
          this.notificaciones = data;
          this.cargando = false;
          this.calcularTiempoRestante(); // Calculamos el tiempo restante de todas las citas
        },
        (error) => {
          console.error('Error al cargar las notificaciones', error);
          this.cargando = false;
        }
      );
  }

  // Calcular el tiempo restante para cada cita
  calcularTiempoRestante(): void {
    const ahora = new Date().getTime();

    this.notificaciones.forEach((notificacion) => {
      const citaTiempo = new Date(notificacion.fecha_hora).getTime();
      const diferencia = citaTiempo - ahora;

      if (diferencia <= 0) {
        notificacion.mensajeCita = 'La cita ya ha pasado';
        notificacion.tiempoRestante = 0;
      } else {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        notificacion.tiempoRestante = diferencia;
        notificacion.mensajeCita = `${dias}d ${horas}h ${minutos}m ${segundos}s restantes`;

        if (dias === 0) {
          notificacion.mensajeCita = `La cita es hoy a las ${new Date(notificacion.fecha_hora).toLocaleTimeString()}`;
        }
      }
    });

    // Ordenamos las citas de la más cercana a la más lejana
    this.notificaciones.sort((a, b) => a.tiempoRestante - b.tiempoRestante);

    // Establecemos la cita más cercana
    this.citaMasCercana = this.notificaciones[0] || null;
  }

  // Manejar el despliegue de detalles de la cita seleccionada
  toggleDetalle(cita: Notificacion): void {
    // Si ya está seleccionada, la desmarcamos; si no, la mostramos
    this.citaSeleccionada = this.citaSeleccionada === cita ? null : cita;
  }
}
