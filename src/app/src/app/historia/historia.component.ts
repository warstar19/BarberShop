import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historia.component.html',
  styleUrls: ['./historia.component.css']
})
export class HistoriaComponent implements OnInit {
  historia = [
    {
      titulo: 'Nuestra Historia',
      descripcion: 'En el corazón de la ciudad, nuestra barbería nació con el propósito de ofrecer un espacio donde cada corte de cabello sea una experiencia única. Desde nuestros humildes comienzos hasta convertirnos en un lugar de referencia, nuestra pasión por el buen servicio y la atención al detalle siempre ha sido nuestra guía.',
      imagen: 'assets/img/historia1.jpg',
      alt: 'Imagen histórica de la barbería',
      bgColor: true
    },
    {
      titulo: 'Evolución de la Barbería',
      descripcion: 'A lo largo de los años, hemos evolucionado, pero nuestros valores fundamentales nunca han cambiado. Hemos adaptado nuestros servicios para satisfacer las necesidades de los tiempos modernos sin perder el toque tradicional que nos distingue. Desde los primeros barberos hasta el equipo actual, hemos cultivado una comunidad de clientes leales que nos han ayudado a crecer.',
      imagen: 'assets/img/historia2.png',
      alt: 'Imagen del equipo actual de la barbería',
      bgColor: true
    },
    {
      titulo: 'Nuestra Misión y Futuro',
      descripcion: 'Hoy en día, no solo ofrecemos cortes de cabello, sino que creamos una atmósfera relajante y amigable, en la que cada cliente se siente como en casa. Nuestra misión es continuar brindando servicios de la más alta calidad y seguir creciendo, mientras mantenemos el compromiso con la tradición, la calidad y la innovación.',
      imagen: 'assets/img/historia3.jpg',
      alt: 'Imagen de la barbería actual',
      bgColor: true
    }
  ];

  ngOnInit() {
    this.addScrollListener();
  }

  // Detecta cuando los elementos entran en la vista
  addScrollListener() {
    const options = {
      root: null, // Se observa todo el documento
      threshold: 0.1 // Se activa cuando el 10% del elemento es visible
    };
    const observer = new IntersectionObserver(this.handleIntersection, options);

    const rows = document.querySelectorAll('.row');
    rows.forEach(row => observer.observe(row));
  }

  // Maneja el evento de intersección
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
