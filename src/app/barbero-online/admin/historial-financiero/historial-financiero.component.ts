import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

interface Historial {
  id: number;
  cita_id: number;
  monto: string;
  metodo_pago: string;
  estado_pago: string;
  notas: string;
  fecha_creacion: string;
}

interface Cita {
  cita_id: number;
  monto: number;
  metodo_pago: string;
  estado_pago: string;
  notas: string;
  fecha_creacion: string;
}

@Component({
  selector: 'app-historial-financiero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-financiero.component.html',
  styleUrls: ['./historial-financiero.component.css']
})
export class HistorialFinancieroComponent implements OnInit {
  historiales: Historial[] = [];
  filteredCitas: Cita[] = [];
  searchQuery: string = '';
  filterDate: string = '';
  filterCitaId: number | null = null;
  filterMetodoPago: string = '';
  filterEstadoPago: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  metodosPago: string[] = ['Efectivo', 'Sinpe', 'Tarjeta'];
  estadosPago: string[] = ['Pendiente', 'Completado', 'Cancelado'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadHistoriales();
  }

  loadHistoriales(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('itemsPerPage', this.itemsPerPage.toString());

    if (this.searchQuery) {
      params = params.set('notas', this.searchQuery);
    }
    if (this.filterDate) {
      params = params.set('fecha_creacion', this.filterDate);
    }
    if (this.filterCitaId !== null) {
      params = params.set('cita_id', this.filterCitaId.toString());
    }
    if (this.filterMetodoPago) {
      params = params.set('metodo_pago', this.filterMetodoPago);
    }
    if (this.filterEstadoPago) {
      params = params.set('estado_pago', this.filterEstadoPago);
    }

    // Eliminar el parámetro 'notas' si searchQuery está vacío
    if (!this.searchQuery) {
      params = params.delete('notas');
    }

    this.http.get<Historial[]>('http://localhost/barberia/backend/api/historial_financiero/read_historial.php', { params })
      .subscribe(historiales => {
        this.historiales = historiales;
        this.mapHistorialesToCitas();
        // Paginación manual en el frontend
        this.totalPages = Math.ceil(this.historiales.length / this.itemsPerPage);
      }, error => {
        console.error('Error al cargar historiales:', error);
      });
  }

  mapHistorialesToCitas(): void {
    this.filteredCitas = this.historiales.map(historial => ({
      cita_id: historial.cita_id,
      monto: parseFloat(historial.monto),
      metodo_pago: historial.metodo_pago,
      estado_pago: historial.estado_pago,
      notas: historial.notas,
      fecha_creacion: historial.fecha_creacion
    }));
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  setItemsPerPage(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.applyFilters();
  }
}
