import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, OnDestroy {
  // Datos del carrusel
  carruselItems = [
    {
      imagen: 'assets/img/barberia1.png',
      titulo: 'Corte Clásico',
      descripcion: 'El estilo clásico para un look impecable.'
    },
    {
      imagen: 'assets/img/barberia2.png',
      titulo: 'Corte Moderno',
      descripcion: 'Estilos modernos para cualquier personalidad.'
    },
    {
      imagen: 'assets/img/barberia3.jpeg',
      titulo: 'Ambiente Relajante',
      descripcion: 'Disfruta de un ambiente cómodo mientras te atienden.'
    }
  ];

  // Datos de la columna de información
  informacion = [
    {
      titulo: 'Bienvenido a Nuestra Barbería',
      descripcion1: 'Ofrecemos servicios de barbería de alta calidad con un equipo de profesionales experimentados. ¡Ven a visitarnos y descubre la diferencia!',
      descripcion2: 'Nos destacamos por ser una barbería Old School, donde lo más importante es que vivas una experiencia única. Hemos creado un ambiente en donde nuestros clientes se pueden relajar, escuchar buena música, disfrutar una bebida y hasta jugar una partida de billar.',
      botonTexto: 'Conoce a nuestros barberos',
      botonEnlace: '/barberos'
    },
    {
      titulo: 'Historia',
      descripcion1: 'Conoce la rica historia de nuestra barbería, un lugar que ha sido testigo de miles de cortes de cabello y muchas sonrisas.',
      descripcion2: 'Desde que comenzamos, nos hemos comprometido con ofrecer lo mejor a nuestros clientes, creando una atmósfera única que va más allá de un simple corte.',
      botonTexto: 'Descubre nuestra historia',
      botonEnlace: '/historia'
    },
    {
      titulo: 'Sucursales',
      descripcion1: 'Estamos más cerca de ti con múltiples sucursales donde te ofrecemos la mejor experiencia en barbería.',
      descripcion2: 'Cada sucursal ha sido diseñada para brindarte confort, estilo y una atención personalizada. Visítanos y vive la experiencia.',
      botonTexto: 'Ver sucursales',
      botonEnlace: '/sucursales'
    },
    {
      titulo: 'Contacto',
      descripcion1: '¿Tienes alguna pregunta? No dudes en ponerte en contacto con nosotros.',
      descripcion2: 'Ya sea por teléfono, correo electrónico o en persona, estamos aquí para ayudarte con todo lo que necesites.',
      botonTexto: 'Contáctanos',
      botonEnlace: '/contacto'
    }
  ];

  // Índice de información actual
  indiceActual: number = 0;

  // Variables para vincular a la vista
  titulo: string = this.informacion[this.indiceActual].titulo;
  descripcion1: string = this.informacion[this.indiceActual].descripcion1;
  descripcion2: string = this.informacion[this.indiceActual].descripcion2;
  botonTexto: string = this.informacion[this.indiceActual].botonTexto;
  botonEnlace: string = this.informacion[this.indiceActual].botonEnlace;

  private intervalId: any;

  // Variable para manejar la animación de fade out y fade in
  isFadingOut: boolean = false;

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
    // Cambiar el contenido con el efecto fade out
    this.isFadingOut = true;
    setTimeout(() => {
      this.indiceActual = (this.indiceActual + 1) % this.informacion.length;
      this.titulo = this.informacion[this.indiceActual].titulo;
      this.descripcion1 = this.informacion[this.indiceActual].descripcion1;
      this.descripcion2 = this.informacion[this.indiceActual].descripcion2;
      this.botonTexto = this.informacion[this.indiceActual].botonTexto;
      this.botonEnlace = this.informacion[this.indiceActual].botonEnlace;

      // Cambiar a fade in después de actualizar el contenido
      this.isFadingOut = false;
    }, 500); // Tiempo de duración del fade out (500ms)
  }
}
