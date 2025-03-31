import { Component, Input, OnInit, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

declare var L: any;  // Asegúrate de que Leaflet y MarkerCluster están disponibles

@Component({
  selector: 'app-mapa-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="mapa" style="height: 400px;"></div>
    <h3 class="text-center" id="sucursalInfo">Buscando la tienda más cercana...</h3>
  `,
  styleUrls: ['./mapa-preview.component.css']
})
export class MapaPreviewComponent implements OnInit, AfterViewInit {
  @Input() tiendas: any[] = [];  // Recibe las tiendas desde el componente padre
  private mapa: any;
  private usuarioPosicion: any = null;
  private markerSeleccionado: any;
  private tiendaMasCercana: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();  // Inicializa el mapa solo en el navegador
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.obtenerUbicacion();  // Obtener la ubicación del usuario
    }
  }

  initMap() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Inicializa el mapa en una ubicación predeterminada
    this.mapa = L.map('mapa').setView([9.933977, -84.094893], 13); // Posición por defecto
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.mapa);

    this.agregarMarcadores();  // Añadir marcadores de las tiendas
  }

  // Obtener la ubicación del usuario
  obtenerUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          this.usuarioPosicion = {
            lat: posicion.coords.latitude,
            lng: posicion.coords.longitude
          };
          this.mapa.setView([this.usuarioPosicion.lat, this.usuarioPosicion.lng], 13);  // Centrar el mapa en la ubicación del usuario
          this.calcularTiendaMasCercana();  // Calcular la tienda más cercana
        },
        () => {
          // Si no se puede obtener la ubicación, centra el mapa en Cartago
          document.getElementById('sucursalInfo')!.textContent = 'Ubicación desconocida';
          this.mapa.setView([9.865912, -83.922097], 13);  // Centrar en Cartago
          this.calcularTiendaMasCercana();  // No se tiene ubicación, pero se sigue calculando la más cercana
        }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  }

  // Calcula la tienda más cercana usando la fórmula de Haversine
  calcularTiendaMasCercana() {
    if (this.usuarioPosicion) {
      let tiendaMasCercanaDistancia = Infinity;  // Inicializamos con una distancia muy alta
      this.tiendaMasCercana = null;

      this.tiendas.forEach(tienda => {
        const distancia = this.calcularDistancia(this.usuarioPosicion.lat, this.usuarioPosicion.lng, tienda.lat, tienda.lng);

        if (distancia < tiendaMasCercanaDistancia) {
          tiendaMasCercanaDistancia = distancia;
          this.tiendaMasCercana = tienda;
        }
      });

      // Mostrar la tienda más cercana en el texto
      if (this.tiendaMasCercana) {
        document.getElementById('sucursalInfo')!.textContent = `La tienda más cercana es: ${this.tiendaMasCercana.nombre}`;
        this.marcarTiendaMasCercana();  // Marcar la tienda más cercana
      }
    }
  }

  // Función para calcular la distancia entre dos puntos utilizando la fórmula de Haversine
  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;  // Radio de la tierra en kilómetros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;  // Retorna la distancia en kilómetros
  }

  // Convertir grados a radianes
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Marcar la tienda más cercana en el mapa
  marcarTiendaMasCercana() {
    if (this.tiendaMasCercana) {
      // Eliminar el marcador anterior si existe
      if (this.markerSeleccionado) {
        this.markerSeleccionado.remove();
      }

      this.markerSeleccionado = L.marker([this.tiendaMasCercana.lat, this.tiendaMasCercana.lng])
        .bindPopup(`
          <strong>${this.tiendaMasCercana.nombre}</strong><br>
          <img src="${this.tiendaMasCercana.imagen}" alt="Imagen de ${this.tiendaMasCercana.nombre}" width="100"><br>
          Tel: <a href="https://wa.me/${this.tiendaMasCercana.whatsapp}" target="_blank">${this.tiendaMasCercana.telefono}</a><br>
          Email: <a href="mailto:${this.tiendaMasCercana.correo}">${this.tiendaMasCercana.correo}</a><br>
          Dirección: ${this.tiendaMasCercana.direccion}<br>
          Horario: ${this.tiendaMasCercana.horario}<br>
          <a href="${this.tiendaMasCercana.mapa}" target="_blank">Ver en Mapa</a>
        `)
        .addTo(this.mapa)
        .openPopup();  // Mostrar la tienda más cercana
    }
  }

  // Agregar todos los marcadores de las tiendas
  agregarMarcadores() {
    if (!this.tiendas || this.tiendas.length === 0) return;

    this.tiendas.forEach(tienda => {
      const marker = L.marker([tienda.lat, tienda.lng])
        .bindPopup(`
          <strong>${tienda.nombre}</strong><br>
          <img src="${tienda.imagen}" alt="Imagen de ${tienda.nombre}" width="100"><br>
          Tel: <a href="https://wa.me/${tienda.whatsapp}" target="_blank">${tienda.telefono}</a><br>
          Email: <a href="mailto:${tienda.correo}">${tienda.correo}</a><br>
          Dirección: ${tienda.direccion}<br>
          Horario: ${tienda.horario}<br>
          <a href="${tienda.mapa}" target="_blank">Ver en Mapa</a>
        `)
        .addTo(this.mapa);
    });
  }
}
