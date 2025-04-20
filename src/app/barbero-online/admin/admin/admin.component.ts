import { Component } from '@angular/core';
import { RouterModule, Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  // Controla la visibilidad de la barra lateral
  sidebarVisible: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    
  }
  // Función para alternar la visibilidad de la barra lateral
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Lógica para verificar las rutas disponibles para Admin
  isRouteAvailable(route: string): boolean {
    const availableRoutes = ['perfil', 'gestion-usuarios', 'gestion-citas', 'calendario', 'historial-financiero'];
    if (route === 'salir'){return true;} 
    return availableRoutes.includes(route);
  }

  logout(): void{
    console.log('AdminComponent: Ejecutando logout...');
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout exitoso desde backend:', response);
        // Redirigir a la página de login después de un logout exitoso
        this.router.navigate(['http://localhost:4200/inicio']);
      },
      error: (err) => {
        console.error('Error durante el logout:', err);
        // Incluso si hay error llamando al backend,
        // AuthService ya limpió el estado local.
        // Forzar redirección a login igualmente.
        this.router.navigate(['http://localhost:4200/barbero-online']);
      },
      // complete: () => { // Opcional: se ejecuta después de next o error si no hubo error no capturado
      //   console.log('Logout observable completado.');
      // }
    });
  }
  
}
