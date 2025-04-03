import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cita {
  hora: string;
  fecha: string;
  cliente: string;
  tiempo: string;
  monto: number;
  sucursal: string;
}

@Component({
  selector: 'app-historial-Barberos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-Barberos.component.html',
  styleUrls: ['./historial-Barberos.component.css']
})
export class HistorialBarberoComponent implements OnInit {
  citas: Cita[] = [];
  filteredCitas: Cita[] = [];
  searchQuery: string = '';
  filterDate: string = '';
  filterTime: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  ngOnInit(): void {
    // Cargar citas de ejemplo (simulando datos)
    this.citas = this.generateSampleData();
    this.applyFilters();
  }

  generateSampleData(): Cita[] {
    const clientes = ['Carlos', 'Ana', 'Juan', 'Maria', 'Luis', 'Sofia', 'Pedro', 'Elena', 'Marco', 'Luisa'];
    const barberos = ['Barbero 1', 'Barbero 2', 'Barbero 3', 'Barbero 4'];
    const sucursales = ['Sucursal 1', 'Sucursal 2', 'Sucursal 3'];
    const tiempos = ['30 min', '45 min', '1 hora'];

    // Función para generar una hora aleatoria entre 08:00 y 18:00
    const generateRandomTime = (): string => {
      const hours = Math.floor(Math.random() * 10) + 8; // Genera horas entre 8 y 17
      const minutes = Math.floor(Math.random() * 2) * 30; // Genera minutos 0 o 30
      return `${hours}:${minutes === 0 ? '00' : '30'}`;
    };

    // Función para generar una fecha aleatoria entre 1 y 30 días desde la fecha actual
    const generateRandomDate = (): string => {
      const today = new Date();
      today.setDate(today.getDate() + Math.floor(Math.random() * 30)); // Genera una fecha dentro de los próximos 30 días
      return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    };

    return Array.from({ length: 120 }, (_, i) => ({
      hora: generateRandomTime(),
      fecha: generateRandomDate(),
      cliente: clientes[Math.floor(Math.random() * clientes.length)], // Elige un cliente aleatorio
      barbero: barberos[Math.floor(Math.random() * barberos.length)], // Elige un barbero aleatorio
      tiempo: tiempos[Math.floor(Math.random() * tiempos.length)], // Elige un tiempo aleatorio
      monto: Math.floor(Math.random() * 100) + 100, // Monto entre 100 y 200
      sucursal: sucursales[Math.floor(Math.random() * sucursales.length)], // Elige una sucursal aleatoria
    }));
  }


  applyFilters(): void {
    let filtered = this.citas;

    // Filtro por cliente o sucursal
    if (this.searchQuery) {
      filtered = filtered.filter(cita =>
        cita.cliente.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        cita.sucursal.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Filtro por fecha
    if (this.filterDate) {
      filtered = filtered.filter(cita => cita.fecha.includes(this.filterDate));
    }

    // Filtro por hora
    if (this.filterTime) {
      filtered = filtered.filter(cita => cita.hora.includes(this.filterTime));
    }

    // Asignar citas filtradas
    this.filteredCitas = filtered;

    // Calcular el número total de páginas
    this.totalPages = Math.ceil(this.filteredCitas.length / this.itemsPerPage);

    // Establecer la página inicial
    this.goToPage(1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredCitas = this.filteredCitas.slice(startIndex, endIndex);
  }
}
