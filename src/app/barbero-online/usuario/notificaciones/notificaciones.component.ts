import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Cita {
  barbero: string;
  fecha: Date;
  servicio: string;
  tiempoEstimado: string;
  cliente: string;
  telefono: string;
  tiempoRestante?: string;
  mensajeCita?: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  citas: Cita[] = [];
  citaSeleccionada: Cita | null = null;
  cargando: boolean = true;  // Variable para mostrar el skeleton loader
  intervalId: any;
  notificacionesEnviadas: Set<string> = new Set();
  notificaciones: string[] = []; // Aquí se almacenan las notificaciones

  ngOnInit(): void {
    // Simulación de carga de citas
    setTimeout(() => {
      this.citas = [
        {
          barbero: 'Juan Pérez',
          fecha: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 1 semana
          servicio: 'Corte de cabello',
          tiempoEstimado: '45 minutos',
          cliente: 'Carlos López',
          telefono: '123-456-7890'
        },
        {
          barbero: 'Ana Rodríguez',
          fecha: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 días
          servicio: 'Afeitado',
          tiempoEstimado: '30 minutos',
          cliente: 'Luis García',
          telefono: '987-654-3210'
        },
        {
          barbero: 'Pedro Gómez',
          fecha: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 días
          servicio: 'Corte y barba',
          tiempoEstimado: '60 minutos',
          cliente: 'José Martín',
          telefono: '555-123-4567'
        }
      ];

      // Ordenar citas de la más cercana a la más lejana (por fecha)
      this.citas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

      this.cargando = false; // Datos cargados, ocultar skeleton loader
      this.citas.forEach(cita => {
        this.calcularTiempoRestante(cita);
      });
    }, 2000);  // Simulamos que los datos tardan 2 segundos en cargar

    this.intervalId = setInterval(() => {
      this.citas.forEach(cita => {
        this.calcularTiempoRestante(cita);
      });
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  toggleDetalle(cita: Cita): void {
    if (this.citaSeleccionada === cita) {
      this.citaSeleccionada = null;
    } else {
      this.citaSeleccionada = cita;
    }
  }

  private calcularTiempoRestante(cita: Cita): void {
    const ahora = new Date().getTime();
    const citaTiempo = cita.fecha.getTime();
    const diferencia = citaTiempo - ahora;

    if (diferencia <= 0) {
      cita.tiempoRestante = 'La cita ya ha pasado';
      cita.mensajeCita = '';
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    const horaDesmilitarizada = cita.fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    cita.tiempoRestante = `${dias}d ${horas}h ${minutos}m ${segundos}s`;

    const diasRestantes = (citaTiempo - ahora) / (1000 * 60 * 60 * 24);
    if (diasRestantes === 0) {
      cita.mensajeCita = `La cita es hoy a las ${horaDesmilitarizada}`;
    } else if (diasRestantes < 7) {
      cita.mensajeCita = `La cita es esta semana el ${cita.fecha.toLocaleDateString('es-ES')} a las ${horaDesmilitarizada}`;
    } else if (diasRestantes < 30) {
      cita.mensajeCita = `La cita es el próximo mes el ${cita.fecha.toLocaleDateString('es-ES')} a las ${horaDesmilitarizada}`;
    } else if (diasRestantes < 180) {
      cita.mensajeCita = `La cita es en los próximos meses el ${cita.fecha.toLocaleDateString('es-ES')} a las ${horaDesmilitarizada}`;
    } else {
      cita.mensajeCita = `La cita está muy lejos (más de 6 meses)`;
    }

    this.generarNotificacion(dias, horas);
  }

  private generarNotificacion(dias: number, horas: number): void {
    const notificaciones = [
      { texto: 'Falta 1 semana para la proxima cita', dias: 7, horas: 0 },
      { texto: 'Faltan 3 días para la proxima cita', dias: 3, horas: 0 },
      { texto: 'Falta 1 día para la proxima cita', dias: 1, horas: 0 },
      { texto: 'Faltan 12 horas para la proxima cita', dias: 0, horas: 12 },
      { texto: 'Faltan 6 horas para la proxima cita', dias: 0, horas: 6 },
      { texto: 'Faltan 3 horas para la proxima cita', dias: 0, horas: 3 },
      { texto: 'Falta 1 hora para la proxima cita', dias: 0, horas: 1 },
    ];

    // Limpiar las notificaciones anteriores
    this.notificaciones = [];

    // Filtrar la notificación más cercana
    let notificacionMasProxima: string | null = null;
    let diasRestantesMinimos = Infinity;

    notificaciones.forEach(notificacion => {
      const diferenciaDias = Math.abs(dias - notificacion.dias);
      const diferenciaHoras = Math.abs(horas - notificacion.horas);

      if (diferenciaDias < diasRestantesMinimos || (diferenciaDias === diasRestantesMinimos && diferenciaHoras < 6)) {
        notificacionMasProxima = notificacion.texto;
        diasRestantesMinimos = diferenciaDias;
      }
    });

    // Solo mostramos la notificación más cercana
    if (notificacionMasProxima) {
      this.notificaciones.push(notificacionMasProxima);
    }
  }
}
