import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent {
  // Controla la visibilidad de la barra lateral
  sidebarVisible: boolean = false;

  // Función para alternar la visibilidad de la barra lateral
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Lógica para verificar las rutas disponibles
  isRouteAvailable(route: string): boolean {
    const availableRoutes = ['reserva', 'historial', 'perfil', 'notificaciones', 'servicios', 'barberos-disponibles', 'galeria', 'soporte'];
    return availableRoutes.includes(route);
  }
}
