import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { SucursalesService } from '../../../sucursales/sucursales.service'; // Asegúrate de tener el servicio de sucursales

declare var L: any;  // Necesario para acceder a Leaflet

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css']
})
export class ReservaComponent implements OnInit, AfterViewInit {
  tiendas: any[] = [];
  tiendaSeleccionada: any;
  formSubmitted: boolean = false;
  loading: boolean = false;
  reservaData: any = null;
  mapa: any;
  marker: any;
  userLocation: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sucursalesService: SucursalesService
  ) {}

  ngOnInit(): void {
    this.tiendas = this.sucursalesService.getTiendas();
    if (isPlatformBrowser(this.platformId)) {
      this.iniciarMapa();  // Solo se ejecuta en el navegador
    }
    this.obtenerUbicacionUsuario();
  }

  ngAfterViewInit(): void {
    if (this.tiendaSeleccionada) {
      this.refrescarMapa();  // Al cambiar la tienda, refrescar el mapa
    }
  }

  // Método para manejar el envío del formulario
  onSubmit(): void {
    if (!this.loading) {
      this.loading = true;
      setTimeout(() => {
        this.reservaData = {
          tienda: this.tiendaSeleccionada?.nombre || 'No seleccionada',
          barbero: 'Juan Pérez',  // Ejemplo
          servicio: 'Corte de cabello',
          fecha: new Date().toLocaleString(),
        };
        this.formSubmitted = true;
        this.loading = false;
        this.refrescarMapa();  // Actualiza el mapa después de enviar la reserva
      }, 2000);
    }
  }

  // Método para restablecer el formulario
  resetForm(): void {
    this.formSubmitted = false;
    this.reservaData = null;
    this.tiendaSeleccionada = null;
    this.marker = null;
    if (this.mapa) {
      this.mapa.setView([9.865912, -83.922097], 13);  // Volver al centro inicial
    }
  }

  // Método para cambiar la tienda seleccionada
  cambiarTienda(event: any): void {
    this.tiendaSeleccionada = this.tiendas.find(tienda => tienda.nombre === event.target.value);
    this.refrescarMapa();
  }

  // Método para inicializar el mapa
  iniciarMapa(): void {
    if (this.mapa) return;  // Evitar inicializarlo más de una vez

    if (isPlatformBrowser(this.platformId)) {
      this.mapa = L.map('mapa').setView([9.865912, -83.922097], 13);  // Mapa centrado en Cartago
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapa);
    }
  }

  // Método para obtener la ubicación del usuario
  obtenerUbicacionUsuario(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          this.userLocation = { lat: userLat, lng: userLng };

          // Determinar la tienda más cercana
          this.tiendaSeleccionada = this.obtenerTiendaMasCercana(userLat, userLng);
          this.refrescarMapa();
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
          this.tiendaSeleccionada = this.tiendas[0];  // Si falla, usa la primera tienda por defecto
          this.refrescarMapa();
        }
      );
    }
  }

  // Método para calcular la distancia entre el usuario y la tienda
  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;  // Distancia en kilómetros
  }

  // Conversión de grados a radianes
  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Método para obtener la tienda más cercana
  obtenerTiendaMasCercana(userLat: number, userLng: number): any {
    const distances = this.tiendas.map(tienda => {
      const distance = this.calcularDistancia(userLat, userLng, tienda.lat, tienda.lng);
      return { tienda, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].tienda;
  }
// Método para refrescar el mapa con la tienda seleccionada
refrescarMapa(): void {
  if (this.mapa && this.tiendaSeleccionada) {
    const { lat, lng, nombre, direccion, telefono, horario, servicio } = this.tiendaSeleccionada;

    // Mover el mapa a la tienda seleccionada
    this.mapa.setView([lat, lng], 13);  // Mover el mapa a la tienda seleccionada
    this.mapa.invalidateSize();

    if (this.marker) {
      this.mapa.removeLayer(this.marker);  // Eliminar marcador anterior
    }

    // Crear un nuevo marcador con más detalles
    this.marker = L.marker([lat, lng]).addTo(this.mapa)
      .bindPopup(`
        <h4>${nombre}</h4>
        <p><strong>Dirección:</strong> ${direccion}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Horario:</strong> ${horario || 'No disponible'}</p>
      `)
      .openPopup();
  }
}

}
