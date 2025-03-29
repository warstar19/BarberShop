import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-barberos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barberos.component.html',
  styleUrls: ['./barberos.component.css']
})
export class BarberosComponent implements OnInit, OnDestroy {
  barberos = [
    { nombre: 'John Peña', especialidad: 'Especialista en cortes clásicos y afeitados.', imagen: 'assets/img/john-pena.jpg' },
    { nombre: 'Carlos Batres', especialidad: 'Experto en estilos modernos y degradados.', imagen: 'assets/img/carlos-batres.jpg' },
    { nombre: 'Ricardo Lens', especialidad: 'Maestro en barba y perfilado de precisión.', imagen: 'assets/img/ricardo-lens.jpg' }
  ];

  private intervalId: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Solo ejecutar en navegador
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => {
        this.cambiarContenido();
      }, 10000);
    }
  }

  ngOnDestroy() {
    // Limpiar el intervalo
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cambiarContenido() {
    // Aquí podrías cambiar el contenido y agregar el fade-out cuando lo cambies
    document.querySelectorAll('.fade-in').forEach((el: any) => {
      el.classList.remove('fade-in');
      el.classList.add('fade-out');
    });

    setTimeout(() => {
      // Actualizar los barberos u otros datos aquí, y luego aplicar fade-in
      this.barberos = this.barberos.slice().reverse(); // Ejemplo de cambio de datos

      document.querySelectorAll('.fade-out').forEach((el: any) => {
        el.classList.remove('fade-out');
        el.classList.add('fade-in');
      });
    }, 1000); // Tiempo de duración del fade-out antes de actualizar el contenido
  }
}
