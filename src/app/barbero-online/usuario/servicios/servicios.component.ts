import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  duracion_minutos: string;
  imagen_url: string;
  activo: string;
  fecha_creacion: string;
}

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent implements OnInit {

  servicios: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadServicios();
    this.addScrollListener();
  }

  loadServicios(): void {
    this.http.get<Servicio[]>('http://localhost/barberia/backend/api/servicios/read_servicio.php')
      .subscribe(
        data => {
          this.servicios = data
            .filter(s => s.activo == '1')
            .map(s => ({
              titulo: s.nombre,
              descripcion: s.descripcion,
              precio: `₡${parseInt(s.precio).toLocaleString()}`,
              imagen: 'http://localhost/barberia/src/assets/img/'+s.imagen_url,
              alt: s.nombre,
              bgColor: true
            }));
        },
        error => {
          console.error('Error al cargar servicios', error);
        }
      );
  }

  addScrollListener() {
    const options = {
      root: null,
      threshold: 0.1
    };
    const observer = new IntersectionObserver(this.handleIntersection, options);
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => observer.observe(row));
  }

  handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }
}
