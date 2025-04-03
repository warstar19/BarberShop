import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barbero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barbero.component.html',
  styleUrls: ['./barbero.component.css']
})
export class BarberoComponent {
  // Controla la visibilidad de la barra lateral
  sidebarVisible: boolean = false;

  // Función para alternar la visibilidad de la barra lateral
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Lógica para verificar las rutas disponibles para Barbero
  isRouteAvailable(route: string): boolean {
    const availableRoutes = ['perfil', 'citas-del-dia', 'historial'];
    return availableRoutes.includes(route);
  }
}
