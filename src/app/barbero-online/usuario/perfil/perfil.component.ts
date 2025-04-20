import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-perfil-barbero',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  username: string = '';
  email: string = '';
  telefono: string = '';
  direccion: string = '';
  fechaNacimiento: string = '';
  genero: string = '';
  password: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isEditing: boolean = false;
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  private originalEmail: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  formModified: boolean = false;

  usernameError: string = '';
  emailError: string = '';
  telefonoError: string = '';
  direccionError: string = '';
  fechaNacimientoError: string = '';
  generoError: string = '';
  passwordError: string = '';
  newPasswordError: string = '';
  confirmPasswordError: string = '';

  originalUsername: string = '';
  originalTelefono: string = '';
  originalDireccion: string = '';
  originalFechaNacimiento: string = '';
  originalGenero: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadBarberoProfile();
  }

  loadBarberoProfile(): void {
    this.isLoading = true;

    this.http.get('http://localhost/barberia/backend/api/usuarios/read_usuario.php',{withCredentials:true}).subscribe(
      (data: any) => {
        this.isLoading = false;
        if (data) {
          this.username = data.username || '';
          this.email = data.email || '';
          this.telefono = data.telefono || '';
          this.direccion = data.direccion || '';
          this.fechaNacimiento = data.fecha_nacimiento || '';
          this.genero = data.genero || '';
          this.originalEmail = data.email || '';

          this.originalUsername = this.username;
          this.originalTelefono = this.telefono;
          this.originalDireccion = this.direccion;
          this.originalFechaNacimiento = this.fechaNacimiento;
          this.originalGenero = this.genero;

          this.formModified = false;
        } else {
          this.errorMessage = 'Barbero no encontrado o respuesta vacía.';
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar el perfil. Verifique la conexión o inténtelo más tarde.';
        console.error('Error al cargar el perfil:', error);
      }
    );
  }

  toggleEditMode(): void {
    this.password = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.isEditing = !this.isEditing;
    this.clearValidationErrors();
    this.errorMessage = '';
    this.successMessage = '';
    this.formModified = false;
  }

  cancelEdit(): void {
    this.loadBarberoProfile();
    this.isEditing = false;
    this.clearValidationErrors();
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearValidationErrors(): void {
    this.usernameError = '';
    this.emailError = '';
    this.telefonoError = '';
    this.direccionError = '';
    this.fechaNacimientoError = '';
    this.generoError = '';
    this.passwordError = '';
    this.newPasswordError = '';
    this.confirmPasswordError = '';
  }

  saveChanges(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    this.validateForm();

    if (this.hasErrors()) {
      return;
    }

    const dataToUpdate: any = {
      email_original: this.originalEmail,
      username: this.username.trim(),
      email: this.email.trim(),
      telefono: this.telefono.trim(),
      direccion: this.direccion.trim(),
      fechaNacimiento: this.fechaNacimiento,
      genero: this.genero,
    };

    if (this.newPassword && this.password && this.newPassword === this.confirmPassword) {
      dataToUpdate.password = this.password;
      dataToUpdate.newPassword = this.newPassword;
    }

    this.isLoading = true;
    this.http.post('http://localhost/barberia/backend/api/usuarios/update_usuario.php', dataToUpdate).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.successMessage = response?.mensaje || 'Datos editados con éxito.';
        this.cdr.detectChanges(); // Fuerza la detección de cambios
        this.originalEmail = this.email;
        this.isEditing = false;
        this.password = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.loadBarberoProfile();
        this.clearMessagesAfterTimeout();
      },
      (error) => {
        this.isLoading = false;
        let errorMsg = 'Ocurrió un error al guardar los cambios.';
        if (error.error && typeof error.error === 'object' && error.error.error) {
          errorMsg = `Error del servidor: ${error.error.error}`;
        } else if (error.error && typeof error.error === 'string') {
          errorMsg = `Respuesta inesperada: ${error.error}`;
          if (error.error.includes('not valid JSON') || error.error.includes('<')) {
            errorMsg += ' (Error interno PHP - revise logs servidor)';
          }
        } else if (error.message) {
          errorMsg = `Error de conexión/cliente: ${error.message}`;
        }
        this.errorMessage = errorMsg;
        console.error('Error al actualizar:', error);
        this.clearMessagesAfterTimeout();
      }
    );
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleShowNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearMessagesAfterTimeout(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 10000);
  }

  checkFormModified(): void {
    this.formModified = (
      this.username !== this.originalUsername ||
      this.email !== this.originalEmail ||
      this.telefono !== this.originalTelefono ||
      this.direccion !== this.originalDireccion ||
      this.fechaNacimiento !== this.originalFechaNacimiento ||
      this.genero !== this.originalGenero ||
      this.password !== '' ||
      this.newPassword !== '' ||
      this.confirmPassword !== ''
    );
  }

  validateForm(): void {
    this.clearValidationErrors();

    if (!this.username.trim()) {
      this.usernameError = 'Nombre de usuario es requerido.';
    }
    if (!this.email.trim()) {
      this.emailError = 'Email es requerido.';
    }
    if (!this.telefono.trim()) {
      this.telefonoError = 'Teléfono es requerido.';
    }
    if (!this.direccion.trim()) {
      this.direccionError = 'Dirección es requerida.';
    }
    if (!this.fechaNacimiento) {
      this.fechaNacimientoError = 'Fecha de nacimiento es requerida.';
    }
    if (!this.genero) {
      this.generoError = 'Género es requerido.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'El correo electrónico no tiene un formato válido.';
    }

    if (this.newPassword) {
      if (!this.password) {
        this.passwordError = 'Se requiere la contraseña actual para cambiarla.';
      }
      if (this.newPassword !== this.confirmPassword) {
        this.confirmPasswordError = 'Las nuevas contraseñas no coinciden.';
      }
      if (this.newPassword.length < 8) {
        this.newPasswordError = 'La nueva contraseña debe tener al menos 8 caracteres.';
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(this.newPassword)) {
        this.newPasswordError = 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
      }
    }
  }

  hasErrors(): boolean {
    return !!(
      this.usernameError ||
      this.emailError ||
      this.telefonoError ||
      this.direccionError ||
      this.fechaNacimientoError ||
      this.generoError ||
      this.passwordError ||
      this.newPasswordError ||
      this.confirmPasswordError
    );
  }
}
