import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  // Controla la visibilidad de la barra lateral
  sidebarVisible: boolean = false;

  // Función para alternar la visibilidad de la barra lateral
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Lógica para verificar las rutas disponibles para Admin
  isRouteAvailable(route: string): boolean {
    const availableRoutes = ['perfil', 'gestion-usuarios', 'gestion-citas', 'calendario', 'historial-financiero'];
    return availableRoutes.includes(route);
  }
}
