import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-barbero-online', // Tu selector
  standalone: true,
  templateUrl: './barbero-online.component.html',
  styleUrls: ['./barbero-online.component.css'],
  imports: [CommonModule, FormsModule],
})
export class BarberoOnlineComponent implements OnInit {
  isLoginMode: boolean = true;
  fadeIn: boolean = false;
  // Campos del formulario (ngModel)
  username: string = '';
  email: string = ''; // Usado para Login y Registro
  password: string = '';
  confirmPassword: string = '';
  // Estado para UI
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private authService: AuthService, // Inyecta el AuthService correcto (versión sesiones)
    private router: Router
  ) {}

  ngOnInit(): void {
    // Animación inicial
    setTimeout(() => (this.fadeIn = true), 100);
    setTimeout(() => {
    const userRole = this.authService.getCurrentUserRole();
    console.log('Rol actual detectado en ngOnInit:', userRole);
    if (userRole) {
      this.navigateToDashboard(userRole);
    }
  }, 200); // Espera un poco para la animación
    
  
    // Si ya hay una sesión activa, redirigir automáticamente
    
  }

  toggleMode(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;
    // Resetear campos podría ser útil
    // this.username = ''; this.email = ''; this.password = ''; this.confirmPassword = '';
    this.fadeIn = false;
    setTimeout(() => {
      this.isLoginMode = !this.isLoginMode;
      this.fadeIn = true;
    }, 200);
  }

  onSubmit(): void {
    this.errorMessage = null; // Limpiar mensajes
    this.successMessage = null;
    this.isLoading = true;

    if (this.isLoginMode) {
      // --- LOGIN ---
      if (!this.email || !this.password) {
        this.errorMessage = 'Ingrese correo y contraseña.';
        this.isLoading = false;
        return;
      }
      this.authService
        .login({ email: this.email, password: this.password })
        .subscribe({
          next: (response) => {
            // El tap dentro de authService.login ya actualizó el estado
            this.isLoading = false;
            const userRole = this.authService.getCurrentUserRole(); // Obtiene rol actualizado
            this.navigateToDashboard(userRole);
          },
          error: (err) => {
            this.isLoading = false;
            // El error viene propagado desde AuthService
            this.errorMessage = err.message || 'Error de autenticación.';
            console.error('Error en componente login:', err);
          },
        });
    } else {
      // --- REGISTRO ---
      // Validaciones básicas (ya las tenías y están bien)
      if (
        !this.username ||
        !this.email ||
        !this.password ||
        !this.confirmPassword
      ) {
        this.errorMessage = 'Complete todos los campos para registrarse.';
        this.isLoading = false;
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        this.isLoading = false;
        return;
      }
      if (this.password.length < 6) {
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        this.isLoading = false;
        return;
      }

      // Llamar al método register del AuthService
      this.authService
        .register({
          username: this.username,
          email: this.email,
          password: this.password,
        })
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            // Mostrar mensaje de éxito y cambiar a modo login
            this.successMessage =
              response.message ||
              'Usuario registrado correctamente. Ahora puedes iniciar sesión.';
            this.isLoginMode = true;
            // Limpiar campos sensibles
            this.password = '';
            this.confirmPassword = '';
            // Podrías limpiar username también si quieres
            // this.username = '';
          },
          error: (err) => {
            this.isLoading = false;
            // Mostrar error de registro (ej: email/usuario ya existe)
            this.errorMessage = err.message || 'Error en el registro.';
            console.error('Error en componente registro:', err);
          },
        });
    }
  }

  // Función helper para redirigir basado en rol (sin cambios)
  private navigateToDashboard(role: string | null): void {
    console.log('Redirigiendo para rol:', role);
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'cliente':
        this.router.navigate(['/usuario']);
        break;
      case 'barbero':
        this.router.navigate(['/barbero']);
        break;
      default:
        console.warn(
          'Rol desconocido o nulo post-login, redirigiendo a login.'
        );
        this.router.navigate(['/login']); // Fallback a login si el rol no es claro
        break;
    }
  }
}
