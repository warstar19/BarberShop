import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { ApiService } from '../../../services/api.service'; // Ajusta la ruta
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css'],
})
export class PerfilAdminComponent implements OnInit {
  // --- Propiedades de Datos (vinculadas a ngModel) ---
  username: string = '';
  email: string = '';
  telefono: string = '';
  direccion: string = '';
  fechaNacimiento: string = ''; // Formato YYYY-MM-DD
  genero: string = '';
  password: string = ''; // Contraseña actual
  newPassword: string = ''; // Nueva contraseña
  confirmPassword: string = ''; // Confirmar nueva contraseña

  // --- Estado de UI (mínimo) ---
  isEditing: boolean = false;

  // --- Añadir: Estado para visibilidad de contraseñas ---
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // --- Identificador ---
  private originalEmail: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAdminProfile();
  }

  // --- Carga Inicial ---
  loadAdminProfile(): void {
    this.apiService.getadmin().subscribe(
      (data) => {
        console.log('Datos recibidos: ', data);
        if (data) {
          this.username = data.username || '';
          this.email = data.email || '';
          this.telefono = data.telefono || '';
          this.direccion = data.direccion || '';
          // Asegúrate que el nombre de propiedad de la API GET sea 'fecha_nacimiento'
          this.fechaNacimiento = data.fecha_nacimiento || '';
          this.genero = data.genero || '';
          this.originalEmail = data.email || '';
        } else {
          console.warn('Admin no encontrado o respuesta vacía.');
          // Considera mostrar un mensaje al usuario aquí si data es null
        }
      },
      (error) => {
        console.error('Error al cargar el perfil:', error);
        // Considera mostrar un mensaje de error al usuario aquí
        alert(
          'Error al cargar el perfil. Verifique la conexión o inténtelo más tarde.'
        );
      }
    );
  }

  // --- Control de Edición ---
  toggleEditMode(): void {
    this.password = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.isEditing = !this.isEditing;
    // Podrías considerar recargar los datos aquí si quieres descartar cambios no guardados al volver a editar
    // if (this.isEditing) { this.loadAdminProfile(); }
  }

  cancelEdit(): void {
    // Considera recargar datos originales para descartar cambios visuales no guardados
    this.loadAdminProfile(); // Recarga los datos frescos desde la API
    this.isEditing = false; // Sale del modo edición
    // Los campos de contraseña se limpiarán en el siguiente toggleEditMode o al recargar
  }

  // --- Guardado (CON VALIDACIÓN y esperando JSON) ---
  saveChanges(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    // --- VALIDACIÓN ---
    if (
      !this.username.trim() ||
      !this.email.trim() ||
      !this.telefono.trim() ||
      !this.direccion.trim() ||
      !this.fechaNacimiento // La fecha no debería necesitar trim
    ) {
      alert(
        'Por favor, complete todos los campos del perfil (nombre, email, teléfono, dirección, fecha nacimiento).'
      );
      console.error('Validación fallida: Campos requeridos incompletos.');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      alert('El correo electrónico no tiene un formato válido.');
      console.error('Validación fallida: Email inválido.');
      return;
    }
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      alert('La nueva contraseña y su confirmación no coinciden.');
      console.error('Validación fallida: Contraseñas no coinciden.');
      return;
    }
    if (this.newPassword && !this.password) {
      alert('Se requiere la contraseña actual para establecer una nueva.');
      console.error('Validación fallida: Falta contraseña actual para cambio.');
      return;
    }
    // --- FIN VALIDACIÓN ---

    // Preparar datos para enviar en JSON
    const dataToUpdate: any = {
      email_original: this.originalEmail,
      username: this.username.trim(),
      email: this.email.trim(),
      telefono: this.telefono.trim(),
      direccion: this.direccion.trim(),
      fechaNacimiento: this.fechaNacimiento, // Enviar como 'fechaNacimiento' (camelCase)
      genero: this.genero,
    };

    // Añadir contraseñas solo si se intenta cambiar
    if (
      this.newPassword &&
      this.password &&
      this.newPassword === this.confirmPassword
    ) {
      dataToUpdate.password = this.password;
      dataToUpdate.newPassword = this.newPassword;
    }

    console.log('Enviando para actualizar:', dataToUpdate);

    // Llamar a la API (esperando JSON)
    this.apiService.updateAdmin(dataToUpdate).subscribe(
      (response: any) => {
        // La respuesta es un objeto JSON
        console.log('Actualización exitosa:', response);
        // Leer mensaje del JSON de respuesta (asumiendo que tiene propiedad 'mensaje')
        alert(response?.mensaje || '¡Perfil actualizado con éxito!');
        this.originalEmail = this.email; // Actualizar email original si cambió
        this.isEditing = false; // Salir modo edición
        // Limpiar contraseñas
        this.password = '';
        this.newPassword = '';
        this.confirmPassword = '';
        // Opcional: Recargar datos para asegurar consistencia visual
        // this.loadAdminProfile();
      },
      (error) => {
        // error es HttpErrorResponse
        console.error('Error al actualizar:', error);
        let errorMsg = 'Ocurrió un error al guardar los cambios.';
        // Intentar leer el mensaje de error del JSON de respuesta ({error: "..."})
        if (
          error.error &&
          typeof error.error === 'object' &&
          error.error.error
        ) {
          errorMsg = `Error del servidor: ${error.error.error}`;
        } else if (error.error && typeof error.error === 'string') {
          // Si el backend envió un string (error PHP no JSON)
          errorMsg = `Respuesta inesperada: ${error.error}`;
          if (
            error.error.includes('not valid JSON') ||
            error.error.includes('<')
          ) {
            errorMsg += ' (Error interno PHP - revise logs servidor)';
          }
        } else if (error.message) {
          // Error de red u otro tipo
          errorMsg = `Error de conexión/cliente: ${error.message}`;
        }
        alert(errorMsg);
        // NO salimos del modo edición si hay error
      }
    );
  } // Fin saveChanges
   // --- Añadir: Métodos para alternar visibilidad ---
  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleShowNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

// Fin clase
