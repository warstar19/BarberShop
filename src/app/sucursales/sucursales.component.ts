import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { SucursalesService } from './sucursales.service'; // Importar el servicio

declare var L: any;

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.css'],
  providers: [SucursalesService]
})
export class SucursalesComponent implements OnInit {
  tiendas: any[] = [];
  tiendaSeleccionada: any;
  userLocation: any;
  errorMessage: string = '';
  mapa: any;
  marker: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sucursalesService: SucursalesService
  ) {}

  ngOnInit() {
    this.tiendas = this.sucursalesService.getTiendas();

    if (isPlatformBrowser(this.platformId)) {
      this.iniciarMapa(); // Solo se ejecuta en el navegador
    }
    this.obtenerUbicacionUsuario(); // Obtiene la ubicación o usa la predeterminada
  }

  iniciarMapa() {
    // Verifica si el mapa ya ha sido inicializado
    if (this.mapa) {
      return;  // Si ya existe el mapa, no lo inicializamos nuevamente
    }

    if (isPlatformBrowser(this.platformId)) {
      this.mapa = L.map('mapa').setView([9.865912, -83.922097], 13);  // Mapa inicial en Cartago
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapa);
    }
  }

  obtenerUbicacionUsuario() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          this.userLocation = { lat: userLat, lng: userLng };

          // Determinar la tienda más cercana
          this.tiendaSeleccionada = this.obtenerTiendaMasCercana(userLat, userLng);

          // Actualizar el mapa
          if (this.mapa) {
            this.refrescarMapa();
          }
        },
        (error) => {
          this.errorMessage = 'No se pudo obtener la ubicación. Mostrando la tienda más cercana por defecto.';
          this.tiendaSeleccionada = this.tiendas[0];

          if (this.mapa) {
            this.refrescarMapa();
          }
        }
      );
    } else {
      this.errorMessage = 'Geolocalización no soportada por tu navegador. Mostrando la tienda más cercana por defecto.';
      this.tiendaSeleccionada = this.tiendas[0];

      if (this.mapa) {
        this.refrescarMapa();
      }
    }
  }

  obtenerTiendaMasCercana(userLat: number, userLng: number) {
    const distances = this.tiendas.map(tienda => {
      const distance = this.calcularDistancia(userLat, userLng, tienda.lat, tienda.lng);
      return { tienda, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].tienda;
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  cambiarUbicacion() {
    const selectedSucursal = (document.getElementById('sucursal') as HTMLSelectElement).value;
    this.tiendaSeleccionada = this.tiendas.find(tienda => tienda.nombre === selectedSucursal);

    if (this.mapa) {
      this.refrescarMapa();
    }
  }

  refrescarMapa() {
    if (this.mapa && this.tiendaSeleccionada) {
      const { lat, lng } = this.tiendaSeleccionada;

      this.mapa.setView([lat, lng], 13);
      this.mapa.invalidateSize();

      if (this.marker) {
        this.mapa.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.mapa)
        .bindPopup(this.tiendaSeleccionada.nombre)
        .openPopup();
    }
  }
}
