import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  addDays, addMonths, addWeeks, addMinutes,
  isSameDay, isSameMonth, isSameHour,
  startOfDay, startOfMonth, startOfWeek, endOfDay,
  subDays, subMonths, subWeeks, format,
  getHours, getMinutes, setHours, setMinutes
} from 'date-fns';

interface Day {
  date: Date;
  events: Cita[];
}

// Interfaz corregida
interface Cita {
  id?: string;
  start: Date;
  end?: Date;
  title: string;
  color?: {
    primary: string;
    secondary: string;
  };
  meta: {  // Cambiado a obligatorio en lugar de opcional
    cliente: string;
    servicio: string;
    tiempo: string;
    estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
    notas?: string;
  };
}


enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day'
}

@Component({
  selector: 'app-gestion-citas',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './gestion-citas.component.html',
  styleUrls: ['./gestion-citas.component.css']
})
export class GestionCitasComponent implements OnInit {
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  citas: Cita[] = [];
  selectedCita: Cita | null = null;
  selectedDay: Day | null = null;
  CalendarView = CalendarView;

  // Configuración del calendario
  weekDays: Date[] = [];
  monthGrid: Day[][] = [];
  hours: number[] = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00
  spanishDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  colors = {
    primary: ['#ffc107', '#20c997', '#fd7e14', '#0dcaf0', '#6610f2', '#d63384'],
    secondary: ['#fff3cd', '#d1f2eb', '#ffe8d9', '#d1f5ff', '#e2d9f7', '#f8d7ea']
  };

  // Nuevas propiedades
  isDraggingEvent = false;
  newCita: Partial<Cita> | null = null;
  showCitaForm = false;

  get viewTitleFormat(): string {
    switch (this.view) {
      case CalendarView.Month:
        return 'MMMM yyyy';
      case CalendarView.Week:
        return "MMMM d, yyyy";
      case CalendarView.Day:
        return 'EEEE, d MMMM yyyy';
      default:
        return 'MMMM yyyy';
    }
  }

  get todayDate(): Date {
    return new Date();
  }

  get citasHoy(): Cita[] {
    return this.citas.filter(cita => isSameDay(cita.start, this.todayDate));
  }

  ngOnInit(): void {
    this.loadCitas();
    this.generateCalendar();
    this.selectToday();
  }

  // ========== FUNCIONES PARA LA VISTA SEMANAL HORIZONTAL ==========

  generateWeekView(): void {
    const start = startOfWeek(this.viewDate);
    this.weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  isCurrentHour(hour: number): boolean {
    const now = new Date();
    return isSameDay(now, this.viewDate) && getHours(now) === hour;
  }

  getEventHeight(cita: Cita): number {
    if (!cita.meta?.tiempo) return 100;
    const minutes = parseInt(cita.meta.tiempo.split(' ')[0]);
    return (minutes / 60) * 100;
  }

  getEventTopPosition(cita: Cita): number {
    const minutes = getMinutes(cita.start);
    return (minutes / 60) * 100;
  }

  getEndTime(cita: Cita): string {
    if (!cita.meta?.tiempo || !cita.start) return '';
    const minutes = parseInt(cita.meta.tiempo.split(' ')[0]);
    const endTime = addMinutes(cita.start, minutes);
    return format(endTime, 'HH:mm');
  }

  // ========== FUNCIONES PARA MANEJO DE CITAS ==========

  loadCitas(): void {
    // Datos de ejemplo para citas
    this.citas = [
      {
        id: '1',
        start: setHours(setMinutes(addDays(startOfDay(new Date()), 1), 30), 9), // Mañana a las 9:30
        title: 'Corte de cabello',
        color: { primary: this.colors.primary[0], secondary: this.colors.secondary[0] },
        meta: {
          cliente: 'Juan Pérez',
          servicio: 'Corte de cabello',
          tiempo: '30 minutos',
          estado: 'confirmada',
          notas: 'Prefiere corte estilo clásico'
        }
      },
      {
        id: '2',
        start: setHours(setMinutes(addDays(startOfDay(new Date()), 1), 0), 14), // Mañana a las 14:00
        title: 'Tinte',
        color: { primary: this.colors.primary[1], secondary: this.colors.secondary[1] },
        meta: {
          cliente: 'Ana López',
          servicio: 'Tinte rubio',
          tiempo: '60 minutos',
          estado: 'pendiente',
          notas: 'Retoque de raíces'
        }
      },
      {
        id: '3',
        start: setHours(setMinutes(addDays(startOfDay(new Date()), 3), 15), 11), // En 3 días a las 11:15
        title: 'Coloración',
        color: { primary: this.colors.primary[2], secondary: this.colors.secondary[2] },
        meta: {
          cliente: 'María Gómez',
          servicio: 'Coloración completa',
          tiempo: '90 minutos',
          estado: 'confirmada',
          notas: 'Usar productos sin amoniaco'
        }
      },
      {
        id: '4',
        start: setHours(setMinutes(addDays(startOfDay(new Date()), 5), 0), 16), // En 5 días a las 16:00
        title: 'Arreglo barba',
        color: { primary: this.colors.primary[3], secondary: this.colors.secondary[3] },
        meta: {
          cliente: 'Carlos Ruiz',
          servicio: 'Arreglo de barba',
          tiempo: '20 minutos',
          estado: 'cancelada',
          notas: 'Canceló por viaje de trabajo'
        }
      }
    ];

    // Calcular end time para cada cita
    this.citas.forEach(cita => {
      if (cita.meta?.tiempo) {
        const minutes = parseInt(cita.meta.tiempo.split(' ')[0]);
        cita.end = addMinutes(cita.start, minutes);
      }
    });
  }

  createNewCita(date: Date, hour: number): void {
    this.newCita = {
      start: setHours(setMinutes(date, 0), hour),
      title: 'Nueva cita',
      color: {
        primary: this.colors.primary[Math.floor(Math.random() * this.colors.primary.length)],
        secondary: this.colors.secondary[Math.floor(Math.random() * this.colors.secondary.length)]
      },
      meta: {  // Asegúrate de incluir todos los campos obligatorios
        cliente: 'Nuevo cliente',  // Valor por defecto
        servicio: 'Servicio no especificado',  // Valor por defecto
        tiempo: '30 minutos',
        estado: 'pendiente',
        notas: ''
      }
    };
    this.showCitaForm = true;
  }

  saveCita(): void {
    if (!this.newCita || !this.newCita.meta) return;

    const newId = Math.random().toString(36).substr(2, 9);

    const nuevaCita: Cita = {
      id: newId,
      start: this.newCita.start || new Date(),
      title: this.newCita.title || 'Nueva cita',
      color: this.newCita.color,
      meta: {
        cliente: this.newCita.meta.cliente || 'Nuevo cliente',
        servicio: this.newCita.meta.servicio || 'Servicio no especificado',
        tiempo: this.newCita.meta.tiempo || '30 minutos',
        estado: this.newCita.meta.estado || 'pendiente',
        notas: this.newCita.meta.notas || ''
      }
    };

    // Calcular end time
    const minutes = parseInt(nuevaCita.meta?.tiempo.split(' ')[0] || '30');
    nuevaCita.end = addMinutes(nuevaCita.start, minutes);

    this.citas.push(nuevaCita);
    this.generateCalendar();
    this.showCitaForm = false;
    this.newCita = null;
  }

  updateCita(): void {
    if (!this.selectedCita?.id) return;

    const index = this.citas.findIndex(c => c.id === this.selectedCita?.id);
    if (index !== -1) {
      // Actualizar end time si cambió la duración
      if (this.selectedCita.meta?.tiempo) {
        const minutes = parseInt(this.selectedCita.meta.tiempo.split(' ')[0]);
        this.selectedCita.end = addMinutes(this.selectedCita.start, minutes);
      }

      this.citas[index] = { ...this.selectedCita };
      this.generateCalendar();
    }
  }

  deleteCita(): void {
    if (!this.selectedCita?.id) return;

    this.citas = this.citas.filter(c => c.id !== this.selectedCita?.id);
    this.selectedCita = null;
    this.generateCalendar();
  }

  confirmCita(cita: Cita): void {
    const index = this.citas.findIndex(c => c.id === cita.id);
    if (index !== -1) {
      this.citas[index].meta = { ...this.citas[index].meta, estado: 'confirmada' };
      this.selectedCita = this.citas[index];
      this.generateCalendar();
    }
  }

  cancelCita(cita: Cita): void {
    const index = this.citas.findIndex(c => c.id === cita.id);
    if (index !== -1) {
      this.citas[index].meta = { ...this.citas[index].meta, estado: 'cancelada' };
      this.selectedCita = this.citas[index];
      this.generateCalendar();
    }
  }

  rescheduleCita(cita: Cita): void {
    this.selectedCita = { ...cita };
    this.showCitaForm = true;
  }

  // ========== FUNCIONES DEL CALENDARIO ==========

  generateCalendar(): void {
    if (this.view === CalendarView.Month) {
      this.generateMonthView();
    } else if (this.view === CalendarView.Week) {
      this.generateWeekView();
    }
  }

  generateMonthView(): void {
    const start = startOfWeek(startOfMonth(this.viewDate));
    const monthGrid: Day[][] = [];

    for (let week = 0; week < 6; week++) {
      const weekDays: Day[] = [];
      for (let day = 0; day < 7; day++) {
        const date = addDays(start, week * 7 + day);
        const dayCitas = this.citas.filter(cita => isSameDay(cita.start, date));
        weekDays.push({ date, events: dayCitas });
      }
      monthGrid.push(weekDays);
    }

    this.monthGrid = monthGrid;
    this.weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  getEventsForHour(day: Date, hour: number): Cita[] {
    return this.citas.filter(cita =>
      isSameDay(cita.start, day) && getHours(cita.start) === hour
    );
  }

  getDayEvents(date: Date): Cita[] {
    return this.citas.filter(cita => isSameDay(cita.start, date));
  }

  selectToday(): void {
    const todayCitas = this.getDayEvents(this.todayDate);
    this.selectedDay = {
      date: this.todayDate,
      events: todayCitas
    };
  }

  selectDay(day: Day): void {
    this.selectedDay = day;
    this.selectedCita = null;
  }

  selectEvent(cita: Cita): void {
    this.selectedCita = cita;
    this.showCitaForm = false;
  }

  isSelected(date: Date): boolean {
    return this.selectedDay ? isSameDay(this.selectedDay.date, date) : false;
  }

  changeView(view: CalendarView): void {
    this.view = view;
    this.generateCalendar();
  }

  today(): void {
    this.viewDate = new Date();
    this.generateCalendar();
    this.selectToday();
  }

  prevPeriod(): void {
    switch (this.view) {
      case CalendarView.Month:
        this.viewDate = subMonths(this.viewDate, 1);
        break;
      case CalendarView.Week:
        this.viewDate = subWeeks(this.viewDate, 1);
        break;
      case CalendarView.Day:
        this.viewDate = subDays(this.viewDate, 1);
        break;
    }
    this.generateCalendar();
  }

  nextPeriod(): void {
    switch (this.view) {
      case CalendarView.Month:
        this.viewDate = addMonths(this.viewDate, 1);
        break;
      case CalendarView.Week:
        this.viewDate = addWeeks(this.viewDate, 1);
        break;
      case CalendarView.Day:
        this.viewDate = addDays(this.viewDate, 1);
        break;
    }
    this.generateCalendar();
  }

  isSameMonth(date1: Date, date2: Date): boolean {
    return isSameMonth(date1, date2);
  }

  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  // ========== FUNCIONES DE ARRASTRE (DRAG & DROP) ==========

  onEventDragStart(event: DragEvent, cita: Cita): void {
    event.dataTransfer?.setData('text/plain', cita.id || '');
    this.isDraggingEvent = true;
  }

  onDayDrop(event: DragEvent, day: Date): void {
    event.preventDefault();
    const citaId = event.dataTransfer?.getData('text/plain');
    const cita = this.citas.find(c => c.id === citaId);

    if (cita) {
      // Mantener la misma hora pero cambiar el día
      const hours = getHours(cita.start);
      const minutes = getMinutes(cita.start);
      cita.start = setMinutes(setHours(day, hours), minutes);

      if (cita.end) {
        const duration = cita.end.getTime() - cita.start.getTime();
        cita.end = new Date(cita.start.getTime() + duration);
      }

      this.generateCalendar();
    }
    this.isDraggingEvent = false;
  }

  onHourDrop(event: DragEvent, day: Date, hour: number): void {
    event.preventDefault();
    const citaId = event.dataTransfer?.getData('text/plain');
    const cita = this.citas.find(c => c.id === citaId);

    if (cita) {
      // Cambiar día y hora pero mantener minutos
      const minutes = getMinutes(cita.start);
      cita.start = setMinutes(setHours(day, hour), minutes);

      if (cita.end) {
        const duration = cita.end.getTime() - cita.start.getTime();
        cita.end = new Date(cita.start.getTime() + duration);
      }

      this.generateCalendar();
    }
    this.isDraggingEvent = false;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }
}
