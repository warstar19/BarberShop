import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  addDays, addMonths, addWeeks,
  isSameDay, isSameMonth,
  startOfDay, startOfMonth, startOfWeek,
  subDays, subMonths, subWeeks,
  format
} from 'date-fns';

interface Day {
  date: Date;
  events: CalendarEvent[];
}

interface CalendarEvent {
  start: Date;
  title: string;
  color?: {
    primary: string;
    secondary: string;
  };
  meta?: {
    cliente: string;
    servicio: string;
    tiempo: string;
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
  imports: [CommonModule, DatePipe],
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

  get viewTitleFormat(): string {
    switch (this.view) {
      case CalendarView.Month:
        return 'MMMM yyyy';
      case CalendarView.Week:
        return "MMMM d, yyyy";
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
    this.generateCalendar();
    this.selectToday();
  }

  loadEvents(): void {
    this.events = [
      {
        start: addDays(startOfDay(new Date()), 1),
        title: 'Cita con Juan Pérez',
        color: { primary: '#ffc107', secondary: '#fff3cd' },
        meta: {
          cliente: 'Juan Pérez',
          servicio: 'Corte de cabello',
          tiempo: '30 minutos'
        }
      },
      {
        start: addDays(startOfDay(new Date()), 1),
        title: 'Cita con Ana López',
        color: { primary: '#20c997', secondary: '#d1f2eb' },
        meta: {
          cliente: 'Ana López',
          servicio: 'Tinte',
          tiempo: '60 minutos'
        }
      },
      {
        start: addDays(startOfDay(new Date()), 3),
        title: 'Cita con María Gómez',
        color: { primary: '#fd7e14', secondary: '#ffe8d9' },
        meta: {
          cliente: 'María Gómez',
          servicio: 'Coloración',
          tiempo: '60 minutos'
        }
      },
      {
        start: addDays(startOfDay(new Date()), 5),
        title: 'Cita con Carlos Ruiz',
        color: { primary: '#0dcaf0', secondary: '#d1f5ff' },
        meta: {
          cliente: 'Carlos Ruiz',
          servicio: 'Barba',
          tiempo: '20 minutos'
        }
      }
    ];
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
