import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  ViewChild,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { SucursalesService } from './sucursales.service';

declare var L: any;

interface Cita {
  id: number;
  cliente_id: number;
  barbero_id: number;
  servicio_id: number;
  sucursal_id: number;
  fecha_inicio: any;
  fecha_fin: any;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
}

interface Usuario {
  id: number;
  username: string;
}

interface Sucursal {
  id: number;
  nombre: string;
}

interface Servicio {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-reserva',
  standalone: true,
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [DatePipe]
})
export class ReservaComponent implements OnInit, AfterViewInit {
  baseUrl = 'http://localhost/barberia/backend/api';
  nuevaCita: Cita = this.getNuevaCitaInicial();
  mostrarFormularioNuevaCita = true;
  formSubmitted = false;
  reservaData: any = null;
  loading = false;

  clientes: Usuario[] = [];
  barberos: Usuario[] = [];
  servicios: Servicio[] = [];
  sucursales: Sucursal[] = [];
  tiendas: any[] = [];
  tiendaSeleccionada: any;
  userLocation: any;
  mapaVisual: any;
  marker: any;

  @ViewChild('reservform') reservForm!: NgForm;

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private sucursalesService: SucursalesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.tiendas = this.sucursalesService.getTiendas();
    this.nuevaCita.cliente_id = 4;  // Asignando el cliente por defecto
    this.loadBarberos();
    this.loadSucursales();
    this.loadServicios();

    if (isPlatformBrowser(this.platformId)) {
      this.iniciarMapaVisual();
    }
    this.obtenerUbicacionUsuario();
  }

  ngAfterViewInit(): void {
    if (this.tiendaSeleccionada) {
      this.refrescarMapaVisual();
    }
  }

  getNuevaCitaInicial(): Cita {
    const now = new Date();
    return {
      id: 0,
      cliente_id: 0,
      barbero_id: 0,
      servicio_id: 0,
      sucursal_id: 0,
      fecha_inicio: now,
      fecha_fin: now,
      estado: 'pendiente',
      notas: ''
    };
  }

  handleApiError(error: any): void {
    console.error('Error en la API:', error);
  }

  loadClientes(): void {
    this.http.get<Usuario[]>(`${this.baseUrl}/usuarios/select.php?accion=clientes`).pipe(
      catchError(error => {
        this.handleApiError(error);
        return of([]);
      })
    ).subscribe(clientes => this.clientes = clientes);
  }

  loadBarberos(): void {
    this.http.get<Usuario[]>(`${this.baseUrl}/usuarios/select.php?accion=barberos`).pipe(
      catchError(error => {
        this.handleApiError(error);
        return of([]);
      })
    ).subscribe(barberos => this.barberos = barberos);
  }

  loadSucursales(): void {
    this.http.get<Sucursal[]>(`${this.baseUrl}/sucursales/read_sucursal.php`).pipe(
      catchError(error => {
        this.handleApiError(error);
        return of([]);
      })
    ).subscribe(sucursales => this.sucursales = sucursales);
  }

  loadServicios(): void {
    this.http.get<Servicio[]>(`${this.baseUrl}/servicios/read_servicio.php`).pipe(
      catchError(error => {
        this.handleApiError(error);
        return of([]);
      })
    ).subscribe(servicios => this.servicios = servicios);
  }

  cargarServiciosPorSucursal(sucursalId: number): void {
    this.http.get<Servicio[]>(`${this.baseUrl}/servicios_sucursal/read_servicio_sucursal.php?sucursal_id=${sucursalId}`).pipe(
      catchError(error => {
        console.error('Error al cargar servicios por sucursal:', error);
        return of([]);
      })
    ).subscribe(servicios => this.servicios = servicios);
  }

  onSubmit(): void {
    if (this.reservForm && this.reservForm.valid) {
      const { cliente_id, barbero_id, servicio_id, sucursal_id } = this.nuevaCita;

      if (new Date(this.nuevaCita.fecha_inicio) >= new Date(this.nuevaCita.fecha_fin)) {
        alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
        return;
      }

      if (
        this.barberos.some(b => b.id === barbero_id) &&
        this.servicios.some(s => s.id === servicio_id) &&
        this.sucursales.some(su => su.id === sucursal_id)
      ) {
        this.loading = true;
        this.http.post(`${this.baseUrl}/citas/create_citaUsuario.php`, this.nuevaCita).subscribe(
          () => {
            this.loading = false;
            this.formSubmitted = true;
            this.reservaData = { ...this.nuevaCita };
            this.nuevaCita = this.getNuevaCitaInicial();
          },
          error => {
            this.loading = false;
            this.handleApiError(error);
          }
        );
      } else {
        alert('Por favor, complete todos los campos requeridos.');
      }
    } else {
      console.error('Formulario inválido');
    }
  }

  resetForm(): void {
    this.formSubmitted = false;
    this.reservaData = null;
    this.nuevaCita = this.getNuevaCitaInicial();
    this.tiendaSeleccionada = null;
    if (this.mapaVisual) {
      this.mapaVisual.setView([9.865912, -83.922097], 13);
    }
    this.reservForm.resetForm();
  }

  cambiarTienda(event: any): void {
    this.tiendaSeleccionada = this.tiendas.find(t => t.nombre === event.target.value);
    this.refrescarMapaVisual();
  }

  iniciarMapaVisual(): void {
    if (this.mapaVisual) return;
    if (isPlatformBrowser(this.platformId)) {
      this.mapaVisual = L.map('mapa').setView([9.865912, -83.922097], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapaVisual);
    }
  }

  obtenerUbicacionUsuario(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          this.userLocation = { lat: userLat, lng: userLng };
          this.tiendaSeleccionada = this.obtenerTiendaMasCercana(userLat, userLng);
          this.refrescarMapaVisual();
        },
        error => {
          console.error('Error al obtener ubicación:', error);
          this.tiendaSeleccionada = this.tiendas[0];
          this.refrescarMapaVisual();
        }
      );
    }
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

  obtenerTiendaMasCercana(userLat: number, userLng: number): any {
    const distances = this.tiendas.map(tienda => {
      const distance = this.calcularDistancia(userLat, userLng, tienda.lat, tienda.lng);
      return { tienda, distance };
    });
    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].tienda;
  }

  getNombreCliente(): string {
    const cliente = this.clientes.find(c => c.id === this.reservaData?.cliente_id);
    return cliente ? cliente.username : '';
  }

  getNombreBarbero(): string {
    const barbero = this.barberos.find(b => b.id === this.reservaData?.barbero_id);
    return barbero ? barbero.username : '';
  }

  getNombreServicio(): string {
    const servicio = this.servicios.find(s => s.id === this.reservaData?.servicio_id);
    return servicio ? servicio.nombre : '';
  }

  getNombreSucursal(): string {
    const sucursal = this.sucursales.find(s => s.id === this.reservaData?.sucursal_id);
    return sucursal ? sucursal.nombre : '';
  }

  refrescarMapaVisual(): void {
    if (this.mapaVisual && this.tiendaSeleccionada) {
      const { lat, lng, nombre, direccion, telefono, horario } = this.tiendaSeleccionada;

      this.mapaVisual.setView([lat, lng], 13);
      this.mapaVisual.invalidateSize();

      if (this.marker) {
        this.mapaVisual.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.mapaVisual).bindPopup(`
        <div style="font-size: 14px;">
          <strong>${nombre}</strong><br>
          <strong>Dirección:</strong> ${direccion}<br>
          <strong>Teléfono:</strong> ${telefono}<br>
          <strong>Horario:</strong> ${horario || 'No disponible'}
        </div>
      `).openPopup();
    }
  }
}
