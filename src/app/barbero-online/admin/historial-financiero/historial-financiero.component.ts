import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cita {
  hora: string;
  fecha: string;
  cliente: string;
  barbero: string;
  tiempo: string;
  monto: number;
  sucursal: string;
}

@Component({
  selector: 'app-historial-financiero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-financiero.component.html',
  styleUrls: ['./historial-financiero.component.css']
})
export class HistorialFinancieroComponent implements OnInit {
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
    return Array.from({ length: 120 }, (_, i) => ({
      hora: '08:00',
      fecha: '2025-04-02',
      cliente: `Cliente ${i + 1}`,
      barbero: `Barbero ${i + 1}`,
      tiempo: '30 min',
      monto: 150 + i,
      sucursal: `Sucursal ${i % 3 + 1}`
    }));
  }

  applyFilters(): void {
    let filtered = this.citas;
    if (this.searchQuery) {
      filtered = filtered.filter(cita =>
        cita.cliente.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        cita.barbero.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        cita.sucursal.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    if (this.filterDate) {
      filtered = filtered.filter(cita => cita.fecha.includes(this.filterDate));
    }
    if (this.filterTime) {
      filtered = filtered.filter(cita => cita.hora.includes(this.filterTime));
    }
    this.filteredCitas = filtered;
    this.totalPages = Math.ceil(this.filteredCitas.length / this.itemsPerPage);
    this.goToPage(1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredCitas = this.filteredCitas.slice(startIndex, endIndex);
  }
}
