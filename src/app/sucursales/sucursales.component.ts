import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

declare var L: any;

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.css']
})
export class SucursalesComponent implements OnInit {
  tiendas = [
    {
      nombre: "Barbershop Cartago",
      lat: 9.865912,
      lng: -83.922097,
      telefono: "+506 1234-5678",
      correo: "cartago@barbershop.com",
      imagen: "../../assets/img/barberia1.png",
      whatsapp: "https://wa.me/50612345678",  // Enlace de WhatsApp
      direccion: "Avenida 2, Cartago, Costa Rica",
      horario: "Lunes - Viernes: 9:00 AM - 6:00 PM",
      servicios: ["Corte de cabello", "Afeitado", "Corte de barba"],
      mapa: "https://www.google.com/maps?q=9.865912,-83.922097"  // Enlace de Google Maps
    },
    {
      nombre: "Barbershop San José",
      lat: 9.934739,
      lng: -84.084206,
      telefono: "+506 8765-4321",
      correo: "sanjose@barbershop.com",
      imagen: "../../assets/img/barberia2.png",
      whatsapp: "https://wa.me/50687654321",  // Enlace de WhatsApp
      direccion: "Avenida Central, San José, Costa Rica",
      horario: "Lunes - Viernes: 10:00 AM - 7:00 PM",
      servicios: ["Corte de cabello", "Afeitado", "Corte de barba", "Masajes faciales"],
      mapa: "https://www.google.com/maps?q=9.934739,-84.084206"  // Enlace de Google Maps
    },
    {
      nombre: "Barbershop Heredia",
      lat: 9.998566,
      lng: -84.116344,
      telefono: "+506 1122-3344",
      correo: "heredia@barbershop.com",
      imagen: "../../assets/img/barberia2.png",
      whatsapp: "https://wa.me/50611223344",  // Enlace de WhatsApp
      direccion: "Calle 1, Heredia, Costa Rica",
      horario: "Lunes - Viernes: 8:00 AM - 5:00 PM",
      servicios: ["Corte de cabello", "Corte de barba", "Coloración"],
      mapa: "https://www.google.com/maps?q=9.998566,-84.116344"  // Enlace de Google Maps
    }
  ];


  tiendaSeleccionada: any;
  userLocation: any;
  errorMessage: string = '';
  mapa: any;
  marker: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

          // Si el mapa está disponible, actualizar la vista
          if (this.mapa) {
            this.refrescarMapa();
          }
        },
        (error) => {
          this.errorMessage = 'No se pudo obtener la ubicación. Mostrando la tienda más cercana por defecto.';
          this.tiendaSeleccionada = this.tiendas[0];  // Default: Cartago

          // Si el mapa está disponible, actualizar la vista con la tienda por defecto
          if (this.mapa) {
            this.refrescarMapa();
          }
        }
      );
    } else {
      this.errorMessage = 'Geolocalización no soportada por tu navegador. Mostrando la tienda más cercana por defecto.';
      this.tiendaSeleccionada = this.tiendas[0];  // Default: Cartago

      // Si el mapa está disponible, actualizar la vista con la tienda por defecto
      if (this.mapa) {
        this.refrescarMapa();
      }
    }
  }

  obtenerTiendaMasCercana(userLat: number, userLng: number) {
    // Calcular la distancia más corta utilizando la fórmula Haversine o cualquier otra fórmula de distancia
    const distances = this.tiendas.map(tienda => {
      const tiendaLat = tienda.lat;
      const tiendaLng = tienda.lng;

      const distance = this.calcularDistancia(userLat, userLng, tiendaLat, tiendaLng);
      return { tienda, distance };
    });

    // Ordenar las tiendas por la distancia más cercana
    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].tienda;  // Retorna la tienda más cercana
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;  // Resultado en km
    return distancia;
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  cambiarUbicacion() {
    const selectedSucursal = (document.getElementById('sucursal') as HTMLSelectElement).value;
    this.tiendaSeleccionada = this.tiendas.find(tienda => tienda.nombre === selectedSucursal);

    // Actualizar el mapa según la tienda seleccionada
    if (this.mapa) {
      this.refrescarMapa();
    }
  }

  refrescarMapa() {
    // Si el mapa está disponible, actualizamos la vista al seleccionar una nueva tienda o ubicación
    if (this.mapa && this.tiendaSeleccionada) {
      const { lat, lng } = this.tiendaSeleccionada;

      // Establecer la vista del mapa en la ubicación de la tienda seleccionada
      this.mapa.setView([lat, lng], 13);  // Centrado en la tienda seleccionada

      // Forzar actualización del tamaño del mapa (para evitar problemas de visibilidad)
      this.mapa.invalidateSize();

      // Si ya existe un marcador, lo eliminamos antes de crear uno nuevo
      if (this.marker) {
        this.mapa.removeLayer(this.marker);
      }

      // Agregar un marcador para la tienda seleccionada
      this.marker = L.marker([lat, lng]).addTo(this.mapa)
        .bindPopup(this.tiendaSeleccionada.nombre)
        .openPopup();
    }
  }

}
