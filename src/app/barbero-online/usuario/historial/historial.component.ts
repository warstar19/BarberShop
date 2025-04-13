import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-historial',
  standalone: true,
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
  imports: [
    CommonModule,
    HttpClientModule
  ]
})
export class HistorialComponent implements OnInit {
  historial: any[] = [];
  isLoading: boolean = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.http.get<any[]>('http://localhost/barberia/backend/api/historial_financiero/read_historialcitasbyid.php')
      .subscribe(
        (data) => {
          this.historial = data.map(item => ({
            ...item,
            estado: item.monto ? 'completada' : 'cancelada',
            isExpanded: false
          }));
          this.isLoading = false;
        },
        (error) => {
          console.error('Error al cargar el historial de citas', error);
          this.isLoading = false;
        }
      );
  }

  toggleDetails(item: any): void {
    item.isExpanded = !item.isExpanded;
  }
}
