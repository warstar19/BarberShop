import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // CommonModule provee TitleCasePipe, *ngFor, etc.
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../services/api.service'; // Ajusta la ruta si es necesario

// --- INTERFAZ User CORREGIDA ---
// Representa los datos de un usuario como vienen de la lista de la API
// *** NO incluye la contraseña/hash ***
interface User {
  id: number;
  username: string;
  email: string;
  telefono: string | null;
  rol: 'admin' | 'barbero' | 'cliente' | string;
  estado: 'activo' | 'inactivo' | string;
  // Campos opcionales si tu API los devuelve en la lista y los necesitas
  fecha_nacimiento?: string | null;
  genero?: string | null;
  token?: string | null;
}

// --- INTERFAZ SelectedUser CORREGIDA ---
// Representa los datos en el formulario de Agregar/Editar
interface SelectedUser extends Partial<User> {
  // Hereda las propiedades de User como opcionales
  password?: string; // <-- Añadido: Propiedad opcional para la contraseña en el formulario de *agregar*
  //          (No se usa al editar a menos que implementes cambio de pwd aquí)
}

// Interfaz básica para logs (sin cambios)
interface ChangeLog {
  hora: string;
  fecha: string;
  username: string;
  action: string;
  modifico: string;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css'],
})
// Asegúrate que el nombre de la clase coincida con el archivo (GestionUsuariosComponent)
export class GestionUsuariosComponent implements OnInit {
  // --- Listas de Datos ---
  users: User[] = [];
  filteredUsers: User[] = [];
  availableRoles: string[] = [];
  changeLog: ChangeLog[] = [];
  filteredChangeLogPaginated: ChangeLog[] = [];

  // --- Estado de Carga y Errores ---
  isLoading: boolean = false;
  loadingError: string | null = null;
  errorMessage: string = ''; // Para errores del formulario popup

  // --- Filtros ---
  searchQuery: string = '';
  filterRol: string = 'all';
  userFilterStatus: string = 'todos';
  startTime: string = '';
  endTime: string = '';
  filterDate: string = '';
  changeLogFilter: string = 'todos';

  // --- Paginación ---
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;

  // --- Estado del Formulario Popup ---
  showForm: boolean = false;
  isEditing: boolean = false;
  selectedUser: SelectedUser = {}; // Usa la interfaz corregida

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    // this.loadChangeLog();
  }

  /**
   * Carga la lista de usuarios desde la API.
   */
  loadUsers(): void {
    this.isLoading = true;
    this.loadingError = null;
    // Esperamos un array de User (sin password)
    this.apiService.getUsuarios().subscribe(
      (data: User[]) => {
        // <-- Usa la interfaz User corregida
        if (data && Array.isArray(data)) {
          this.users = data;
          this.applyFiltersAndPagination();
        } else {
          console.warn('Respuesta de API usuarios no válida:', data);
          this.users = [];
          this.filteredUsers = [];
          this.loadingError = 'No se pudieron cargar los usuarios.';
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar usuarios:', error);
        this.loadingError = 'Error al cargar usuarios.';
        this.isLoading = false;
        this.users = [];
        this.filteredUsers = [];
      }
    );
  }

  /**
   * Carga los roles disponibles desde la API.
   */
  loadRoles(): void {
    this.apiService.getRoles().subscribe(
      (roles: string[]) => {
        if (roles && Array.isArray(roles)) {
          this.availableRoles = roles;
        } else {
          console.warn('Respuesta de API roles no válida:', roles);
          this.availableRoles = [];
        }
      },
      (error) => {
        console.error('Error al cargar roles:', error);
        this.availableRoles = [];
      }
    );
  }

  /**
   * Aplica los filtros y la lógica de paginación actuales a la lista de usuarios.
   */
  applyFiltersAndPagination(): void {
    console.log(
      `Aplicando filtros: Rol='${this.filterRol}', Estado='${this.userFilterStatus}', Query='${this.searchQuery}'`
    );
    let tempUsers = [...this.users]; // Empezar con la lista completa

    // Filtrar por Rol
    if (this.filterRol !== 'all') {
      tempUsers = tempUsers.filter((user) => user.rol === this.filterRol);
    }

    // Filtrar por Estado
    if (this.userFilterStatus !== 'todos') {
      tempUsers = tempUsers.filter(
        (user) => user.estado === this.userFilterStatus
      );
    }

    // Filtrar por Búsqueda (username o email)
    if (this.searchQuery.trim() !== '') {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      tempUsers = tempUsers.filter(
        (user) =>
          (user.username?.toLowerCase() || '').includes(searchTerm) ||
          (user.email?.toLowerCase() || '').includes(searchTerm)
      );
    }

    // --- Paginación (Ejemplo básico, ajustar según necesidad) ---
    // const totalItems = tempUsers.length;
    // const userPageSize = 10; // O define otra variable para tamaño de página de usuarios
    // this.totalPages = Math.ceil(totalItems / userPageSize);
    // if (this.currentPage < 1) this.currentPage = 1;
    // if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    // const startIndex = (this.currentPage - 1) * userPageSize;
    // const endIndex = startIndex + userPageSize;
    // this.filteredUsers = tempUsers.slice(startIndex, endIndex);
    // --- Fin Paginación Ejemplo ---

    // Sin paginación por ahora:
    this.filteredUsers = tempUsers;
    this.totalPages = 1; // Resetear si no hay paginación implementada
    this.currentPage = 1;

    console.log('Usuarios filtrados:', this.filteredUsers.length);
  }

  /**
   * Aplica filtros y paginación al historial de cambios.
   */
  applyLogFiltersAndPagination(): void {
    console.log('Aplicando filtros y paginación de logs...');
    // Pendiente: Lógica de filtrado/paginación para logs
    this.filteredChangeLogPaginated = [...this.changeLog];
  }

  // --- Métodos asociados al HTML ---

  loadChangeLog(): void {
    console.log('Cargando historial...');
    // Pendiente: Llamar a this.apiService.getChangeLog()
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedUser = {}; // Resetear usuario seleccionado
    this.errorMessage = '';
  }

  openAddUserForm(): void {
    // Inicializa selectedUser con valores por defecto y la propiedad password
    this.selectedUser = { rol: '', estado: 'activo', password: '' };
    this.isEditing = false;
    this.showForm = true;
    this.errorMessage = '';
  }

  toggleEditMode(user: User): void {
    // Copia el usuario y asegura que password (opcional en SelectedUser) no esté presente
    // a menos que específicamente quieras permitir editarla aquí (lo cual no es lo usual)
    const { ...userData } = user; // Excluye password si viene en User
    this.selectedUser = { ...userData }; // Copia sin la propiedad password original
    this.isEditing = true;
    this.showForm = true;
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.closeForm();
  }

  cancelAddUser(): void {
    this.closeForm();
  }

  addUser(): void {
    console.log('Intentando agregar usuario:', this.selectedUser);
    // Validación básica en frontend (similar a la del perfil de admin)
    if (
      !this.selectedUser.username?.trim() ||
      !this.selectedUser.email?.trim() ||
      !this.selectedUser.rol ||
      !this.selectedUser.password?.trim()
    ) {
      this.errorMessage =
        'Nombre de usuario, correo, rol y contraseña son requeridos para agregar.';
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.selectedUser.email)) {
      this.errorMessage = 'El correo electrónico no tiene un formato válido.';
      return;
    }
    this.errorMessage = ''; // Limpiar error si pasa validación

    // Pendiente: Llamar a this.apiService.addUser(this.selectedUser)
    alert('[SIMULADO] Llamando a API para agregar usuario...');
    // Ejemplo de cómo sería tras llamar a la API:
    /*
         this.apiService.addUser(this.selectedUser).subscribe(
             (response) => {
                 alert('Usuario agregado con éxito');
                 this.closeForm();
                 this.loadUsers(); // Recargar la lista
             },
             (error) => {
                 console.error("Error al agregar:", error);
                 this.errorMessage = error?.error?.error || error?.error?.message || 'Error desconocido al agregar.';
             }
         );
         */
  }

  saveUserChanges(): void {
    console.log('Intentando actualizar usuario:', this.selectedUser);
    // Validación básica en frontend
    if (
      !this.selectedUser.username?.trim() ||
      !this.selectedUser.email?.trim() ||
      !this.selectedUser.rol
    ) {
      this.errorMessage = 'Nombre de usuario, correo y rol son requeridos.';
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.selectedUser.email)) {
      this.errorMessage = 'El correo electrónico no tiene un formato válido.';
      return;
    }
    this.errorMessage = '';

    // OJO: No enviamos 'password' al actualizar normalmente,
    // la actualización de contraseña debería ser un proceso separado o requerir campos adicionales.
    // Creamos un objeto sin la posible propiedad 'password' que está en SelectedUser
    const { password, ...updateData } = this.selectedUser;

    // Pendiente: Llamar a this.apiService.updateUser(updateData)
    alert('[SIMULADO] Llamando a API para actualizar usuario...');
    /*
          this.apiService.updateUser(updateData).subscribe(
             (response) => {
                 alert('Usuario actualizado con éxito');
                 this.closeForm();
                 this.loadUsers(); // Recargar la lista
             },
             (error) => {
                 console.error("Error al actualizar:", error);
                 this.errorMessage = error?.error?.error || error?.error?.message || 'Error desconocido al actualizar.';
             }
         );
         */
  }

  toggleUserState(user: User): void {
    console.log('Intentando cambiar estado para:', user.username);
    const nuevoEstado = user.estado === 'activo' ? 'inactivo' : 'activo';
    // Pendiente: Llamar a this.apiService.updateUserState(user.id, nuevoEstado)
    alert(`[SIMULADO] Llamando a API para cambiar estado a ${nuevoEstado}...`);
    /*
          this.apiService.updateUserState(user.id, nuevoEstado).subscribe(
             (response) => {
                 alert(`Estado de ${user.username} cambiado a ${nuevoEstado}`);
                 this.loadUsers(); // Recargar la lista
             },
             (error) => {
                 console.error("Error al cambiar estado:", error);
                 alert(error?.error?.error || error?.error?.message || 'Error desconocido al cambiar estado.');
             }
         );
         */
  }

  restoreUser(user: User): void {
    // Asumiendo que restaurar es simplemente activar
    if (user.estado === 'inactivo') {
      this.toggleUserState(user);
    } else {
      console.warn(
        'Intentando restaurar un usuario que ya está activo:',
        user.username
      );
    }
  }

  goToPage(page: number): void {
    console.log('Ir a página:', page);
    // Pendiente: Lógica de paginación real
    alert('Funcionalidad Paginación pendiente de implementación.');
  }

  changePageSize(newSizeString: string): void {
    const newSize = parseInt(newSizeString, 10);
    if (isNaN(newSize) || newSize <= 0) return; // Evitar valores inválidos
    console.log('Cambiando tamaño de página a:', newSize);
    this.pageSize = newSize;
    this.currentPage = 1;
    this.applyLogFiltersAndPagination(); // Asumiendo que es para logs
    alert('Funcionalidad Cambiar Tamaño de Página pendiente.');
  }
}
