import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistorialCambiosService {
  filtrarHistorial(logs: any[], filtros: any): any[] {
    let filteredLogs = logs;

    if (filtros.changeLogFilter !== 'todos') {
      filteredLogs = filteredLogs.filter(log =>
        log.action.toLowerCase().includes(filtros.changeLogFilter.toLowerCase())
      );
    }

    if (filtros.filterDate) {
      filteredLogs = filteredLogs.filter(log =>
        log.fecha.includes(filtros.filterDate)
      );
    }

    if (filtros.startTime && filtros.endTime) {
      filteredLogs = filteredLogs.filter(log => {
        const logTime = new Date(log.timestamp).getHours();
        const startTime = new Date(filtros.startTime).getHours();
        const endTime = new Date(filtros.endTime).getHours();
        return logTime >= startTime && logTime <= endTime;
      });
    }

    if (filtros.searchQuery) {
      filteredLogs = filteredLogs.filter(log =>
        log.username.toLowerCase().includes(filtros.searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(filtros.searchQuery.toLowerCase())
      );
    }

    return filteredLogs;
  }
}
