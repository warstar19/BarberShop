import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-barbero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-barbero.component.html',
  styleUrls: ['./perfil-barbero.component.css']
})
export class PerfilBarberoComponent implements OnInit {
  username: string = '';
  email: string = '';
  telefono: string = '';
  direccion: string = '';
  fechaNacimiento: string = '';
  genero: string = '';
  password: string = ''; // Contraseña actual
  newPassword: string = ''; // Nueva contraseña
  confirmPassword: string = ''; // Confirmar nueva contraseña

  isEditing: boolean = false;
  isUpdated: boolean = false; // Bandera para el mensaje de actualización

  errorMessages: string[] = [];

  // Datos originales (simulados)
  originalData: any = {};

  ngOnInit(): void {
    // Datos simulados al cargar el perfil
    this.originalData = {
      username: 'Barbero Juan',
      email: 'juan@barberia.com',
      telefono: '987-654-3210',
      direccion: 'Calle del Barbero 456',
      fechaNacimiento: '1990-08-15',
      genero: 'Masculino'
    };

    // Cargar datos originales en las variables
    this.loadData();
  }

  loadData(): void {
    this.username = this.originalData.username;
    this.email = this.originalData.email;
    this.telefono = this.originalData.telefono;
    this.direccion = this.originalData.direccion;
    this.fechaNacimiento = this.originalData.fechaNacimiento;
    this.genero = this.originalData.genero;
    this.password = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessages = [];
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    this.isUpdated = false; // Reinicia el estado de actualización cuando se entra al modo de edición
  }

  saveChanges(event: Event): void {
    event.preventDefault(); // Evitar recarga de página

    // Limpiar errores antes de la validación
    this.errorMessages = [];

    // Validación de contraseñas
    if (this.password || this.newPassword || this.confirmPassword) {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessages.push('Las contraseñas no coinciden.');
      }
    }

    // Validación de campos obligatorios
    if (!this.username || !this.email || !this.telefono || !this.direccion || !this.fechaNacimiento || !this.genero) {
      this.errorMessages.push('Todos los campos son obligatorios.');
    }

    // Validación de formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (this.email && !emailRegex.test(this.email)) {
      this.errorMessages.push('El correo electrónico no es válido.');
    }

    // Detener el envío si hay errores
    if (this.errorMessages.length > 0) {
      return;
    }

    // Simula guardar los datos
    console.log('Datos guardados', {
      username: this.username,
      email: this.email,
      telefono: this.telefono,
      direccion: this.direccion,
      fechaNacimiento: this.fechaNacimiento,
      genero: this.genero
    });

    // Mostrar el mensaje de actualización exitosa
    this.isUpdated = true;
    this.toggleEditMode(); // Cambia el modo de edición
  }

  cancelEdit(): void {
    // Restablece los datos a los valores originales
    this.loadData();
    this.toggleEditMode(); // Sale del modo de edición
  }
}
