import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],  // Añadimos el CommonModule para mantener la consistencia
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  isLoading: boolean = true;
  historial: any[] = [];

  ngOnInit(): void {
    // Simulamos la carga de datos con un retardo
    setTimeout(() => {
      this.historial = [
        { barbero: 'Juan Pérez', fecha: '2025-03-28', hora: '14:30', servicio: 'Corte de Cabello', tiempo: '30 min', cliente: 'Carlos Gómez', telefono: '123-456-7890', estado: 'completada', isExpanded: false },
        { barbero: 'Luis Ramírez', fecha: '2025-03-27', hora: '10:00', servicio: 'Afeitado Clásico', tiempo: '20 min', cliente: 'Miguel Torres', telefono: '098-765-4321', estado: 'cancelada', isExpanded: false },
        { barbero: 'Ana Rodríguez', fecha: '2025-03-26', hora: '09:00', servicio: 'Corte de Cabello', tiempo: '45 min', cliente: 'Laura Sánchez', telefono: '987-654-3210', estado: 'pendiente', isExpanded: false },
      ];

      // Filtrar solo citas completadas o canceladas
      this.historial = this.historial.filter(item => item.estado === 'completada' || item.estado === 'cancelada');

      this.isLoading = false;
    }, 2000); // Simula 2 segundos de carga
  }

  // Método para alternar el despliegue de la cita
  toggleDetails(item: any): void {
    item.isExpanded = !item.isExpanded;
  }
}
