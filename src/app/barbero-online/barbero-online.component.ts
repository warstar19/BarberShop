import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule

@Component({
  selector: 'app-barbero-online',
  standalone: true,
  templateUrl: './barbero-online.component.html',
  styleUrls: ['./barbero-online.component.css'],
  imports: [CommonModule, FormsModule],  // Agrega FormsModule aquí
})
export class BarberoOnlineComponent {
  isLoginMode: boolean = true;
  fadeIn: boolean = true;
  isRegistered: boolean = false;
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor() {}

  toggleMode(event: Event): void {
    event.preventDefault();
    this.fadeIn = false;
    setTimeout(() => {
      this.isLoginMode = !this.isLoginMode;
      this.fadeIn = true
    }, 200);
  }

  onSubmit(): void {
    if (this.isLoginMode) {
      this.login();
    } else {
      this.register();
    }
  }

  register(): void {
    this.isRegistered = true;
    this.isLoginMode = true;
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  login(): void {
    console.log("Usuario logeado");
    // Aquí va la lógica para iniciar sesión, por ejemplo, redirigir.
  }
}
