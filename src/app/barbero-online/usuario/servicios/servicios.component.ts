import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'

})
export class ServiciosComponent implements OnInit {

  servicios = [
    {
      titulo: 'Corte Caballero',
      descripcion: 'Nuestro servicio principal y nuestra mayor especialidad es el corte para caballero o niño. ',
      precio:'Precio: $100',
      imagen: 'assets/img/corte-caballero.jpg',
      alt: 'Corte Caballero',
      bgColor: true
    },
    {
      titulo: 'Corte Barba',
      descripcion: '¿Deseas un excelente servicio de corte de barba?¿Barba desalineada? Confiá en nosotros, te daremos una aparencia más masculina.',
      imagen: 'assets/img/corte-barba.jpg',
      precio: 'Precio: $100',
      alt: 'Corte Barba',
      bgColor: true
    },
    {
      titulo: 'Tratamiento Facial para Caballero',
      descripcion: '¿Quién dice que los hombres no se cuidan?, Ven y date un chineo, contrata nuestra especialidad de tratamiento facial para Caballero. No te arrepentirás.',
      imagen: 'assets/img/trat-facial.jpg',
      precio: 'Precio: $150',
      alt: 'Tratamiento Facial',
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
