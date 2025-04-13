import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';

interface Cita {
  hora: string;
  fecha: string;
  cliente: string;
  barbero: string;
  servicio: string;
  tiempo: string;
  monto: number;
  sucursal: string;
}

@Component({
  selector: 'app-historial-Barberos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './historial-Barberos.component.html',
  styleUrls: ['./historial-Barberos.component.css']
})
export class HistorialBarberoComponent implements OnInit {
  citas: Cita[] = [];
  filteredCitas: Cita[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;

  // Filtros
  filtros = {
    cliente: '',
    barbero: '',
    sucursal: '',
    servicio: '',
    fecha_inicio: '',
    fecha_fin: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    let params = new HttpParams();

    // Solo agregar filtros que tengan valor
    Object.entries(this.filtros).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    this.http.get<Cita[]>('http://localhost/barberia/backend/api/historial_financiero/read_historialcitas.php', { params })
      .subscribe({
        next: (data: any) => {
          this.citas = Array.isArray(data) ? data : [];
          this.applyPagination();
        },
        error: err => {
          console.error('Error al obtener citas:', err);
        }
      });
  }

  applyFilters(): void {
    this.cargarCitas(); // Refresca desde el backend con filtros activos
  }

  applyPagination(): void {
    this.totalPages = Math.ceil(this.citas.length / this.itemsPerPage);
    this.goToPage(1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredCitas = this.citas.slice(startIndex, endIndex);
  }
}
