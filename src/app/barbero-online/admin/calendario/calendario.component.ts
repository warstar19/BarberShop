import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  addDays, addMonths, addWeeks,
  isSameDay, isSameMonth,
  startOfDay, startOfMonth, startOfWeek,
  subDays, subMonths, subWeeks
} from 'date-fns';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Day {
  date: Date;
  events: CalendarEvent[];
}

interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  color?: {
    primary: string;
    secondary: string;
  };
  meta?: {
    cliente: string;
    servicio: string;
    tiempo: string;  // Duration already calculated
    hora: string;
    sucursal: string;
    estado: string;
  };
}

enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day'
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, DatePipe, HttpClientModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  selectedEvent: CalendarEvent | null = null;
  selectedDay: Day | null = null;
  CalendarView = CalendarView;

  weekDays: Date[] = [];
  monthGrid: Day[][] = [];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  spanishDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  constructor(private http: HttpClient) {}

  get viewTitleFormat(): string {
    switch (this.view) {
      case CalendarView.Month:
        return 'MMMM yyyy';
      case CalendarView.Week:
        return 'MMMM d, yyyy';
      case CalendarView.Day:
        return 'fullDate';
      default:
        return 'MMMM yyyy';
    }
  }

  get todayDate(): Date {
    return new Date();
  }

  get todaysEvents(): CalendarEvent[] {
    return this.events.filter(event => isSameDay(event.start, this.todayDate));
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.http.get<any[]>('http://localhost/barberia/backend/api/citas/read_cita.php').subscribe(
      (data) => {
        this.events = data.map(cita => {
          const fechaInicio = new Date(cita.fecha_inicio);
          const fechaFin = new Date(cita.fecha_fin);

          const cliente = `Cliente ${cita.cliente_id}`;  // Ajustar según tu lógica
          const servicio = cita.servicio_id ? `Servicio ${cita.servicio_id}` : 'Servicio desconocido';
          const sucursal = cita.sucursal_id ? `Sucursal ${cita.sucursal_id}` : 'Sucursal desconocida';
          const estado = cita.estado || 'No definido';
          const tiempo = this.calculateDuration(fechaInicio, fechaFin);

          return {
            start: fechaInicio,
            end: fechaFin,
            title: `Cita con ${cliente}`,
            color: {
              primary: cita.color_primario || '#007bff',
              secondary: cita.color_secundario || '#cce5ff'
            },
            meta: {
              cliente: cliente,
              servicio: servicio,
              tiempo: tiempo,
              hora: fechaInicio.toLocaleTimeString(),
              sucursal: sucursal,
              estado: estado
            }
          };
        });
        this.generateCalendar();
        this.selectToday();
      },
      (error) => {
        console.error('Error al cargar las citas:', error);
      }
    );
  }

  // Calcular la duración de la cita
  calculateDuration(start: Date, end: Date): string {
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

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
        const dayEvents = this.events.filter(event =>
          isSameDay(event.start, date)
        );
        weekDays.push({ date, events: dayEvents });
      }
      monthGrid.push(weekDays);
    }

    this.monthGrid = monthGrid;
    this.weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  generateWeekView(): void {
    const start = startOfWeek(this.viewDate);
    this.weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  getDayName(date: Date): string {
    return this.spanishDayNames[date.getDay()];
  }

  getEventsForHour(day: Date, hour: number): CalendarEvent[] {
    const startHour = new Date(day);
    startHour.setHours(hour, 0, 0, 0);
    const endHour = new Date(day);
    endHour.setHours(hour + 1, 0, 0, 0);

    return this.events.filter(event =>
      event.start >= startHour && event.start < endHour
    );
  }

  getDayEvents(date: Date): CalendarEvent[] {
    return this.events.filter(event => isSameDay(event.start, date));
  }

  selectToday(): void {
    const todayEvents = this.getDayEvents(this.todayDate);
    this.selectedDay = {
      date: this.todayDate,
      events: todayEvents
    };
  }

  selectDay(day: Day): void {
    this.selectedDay = day;
    this.selectedEvent = null;
  }

  selectEvent(event: CalendarEvent): void {
    this.selectedEvent = event;
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
}
