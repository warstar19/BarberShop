import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent implements OnInit {

  usuarios: any[] = [];
  usuario: any = {};
  historyRecords: any[] = [];
  roles = ['admin', 'barbero', 'cliente'];
  estados = ['activo', 'inactivo'];

  // Filtros
  searchQuery: string = '';
  roleFilter: string = '';
  statusFilter: string = '';
  historySearchQuery: string = '';
  historyStartDate: string = '';
  historyEndDate: string = '';
  historyActionFilter: string = '';

  // Mensaje para mostrar cuando no se encuentran usuarios
  noUsersMessage: string = '';

  // Paginación
  page: number = 1;
  pageHistory: number = 1;

  // Formulario
  userForm: any = {
    id: null,
    username: '',
    email: '',
    telefono: '',
    rol: 'cliente',
    estado: 'activo',
    password: '',
    confirmPassword: '',
    token: '' // Asegúrate de incluir el campo token
  };

  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  activeTab: string = 'usuarios';

  // Token y rol
  token: string = ''; // Token del usuario
  userRole: string = 'cliente'; // Rol del usuario (por defecto cliente)

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Obtener el token desde el almacenamiento (por ejemplo, localStorage)
    this.token = localStorage.getItem('token') || '';
    // Asignar el rol basándonos en el token
    this.userRole = this.token === 'admin' || this.token === 'barbero' ? this.token : 'cliente';

    this.loadUsuarios();
    this.loadHistory();
  }

  loadUsuarios(): void {
    const params: any = {};

    // Filtros
    if (this.searchQuery) {
      params.username = this.searchQuery.trim();
    }
    if (this.roleFilter) {
      params.rol = this.roleFilter;
    }
    if (this.statusFilter) {
      params.estado = this.statusFilter;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `http://localhost/barberia/backend/api/usuarios/read_allusuarios.php?${queryString}`;

    this.http.get<any>(url, {withCredentials:true}).subscribe(
      (data) => {
        if (data && data.mensaje) {
          this.noUsersMessage = data.mensaje;
          this.usuarios = [];
        } else {
          this.usuarios = Array.isArray(data) ? data : [];
          this.noUsersMessage = '';
        }
      },
      (error) => {
        console.error('Error al cargar usuarios', error);
        alert('Error al cargar usuarios');
      }
    );
  }

  loadHistory(): void {
    const params: any = {};

    if (this.historySearchQuery) {
      params.tabla_afectada = this.historySearchQuery;
    }
    if (this.historyActionFilter) {
      params.tipo_cambio = this.historyActionFilter;
    }
    if (this.historyStartDate && this.historyEndDate) {
      params.fecha_inicio = this.historyStartDate;
      params.fecha_fin = this.historyEndDate;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `http://localhost/barberia/backend/api/usuarios/read_cambios.php?${queryString}`;

    this.http.get<any[]>(url, {withCredentials:true}).subscribe(
      (data) => {
        this.historyRecords = Array.isArray(data) ? data : [];
      },
      (error) => {
        console.error('Error al cargar historial', error);
        alert('Error al cargar historial');
      }
    );
  }

  getUsernameById(id: number): string {
    const user = Array.isArray(this.usuarios) ? this.usuarios.find(u => u.id === id) : null;
    return user ? user.username : 'Desconocido';
  }

  openModalCreateUser(): void {
    this.isEditMode = false;
    this.userForm = {
      id: null,
      username: '',
      email: '',
      telefono: '',
      rol: this.userRole === 'admin' || this.userRole === 'barbero' ? 'cliente' : 'cliente', // Solo 'cliente' si no es admin ni barbero
      estado: 'activo',
      password: '',
      confirmPassword: '',
      token: this.userRole === 'admin' || this.userRole === 'barbero' ? '' : 'cliente' // Token por defecto si no es admin ni barbero
    };
    this.isModalOpen = true;
  }

  openModalEditUser(usuario: any): void {
    this.isEditMode = true;
    this.userForm = {
      ...usuario,
      password: '',
      confirmPassword: '',
      token: usuario.token || '' // Asigna el token o cadena vacía si no tiene
    };
    this.isModalOpen = true;
  }


  closeModal(): void {
    this.isModalOpen = false;
  }

  saveUser(): void {
    if (this.isEditMode) {
      this.updateUser();
    } else {
      if (this.validateForm()) {
        this.createUser();
      } else {
        alert('Por favor, complete todos los campos correctamente.');
      }
    }
  }

  createUser(): void {
    const url = 'http://localhost/barberia/backend/api/usuarios/add_usuario.php';  // Ruta para crear un usuario
    this.http.post(url, { ...this.userForm, token: this.token }, {withCredentials:true}).subscribe(
      () => {
        this.loadUsuarios();
        this.closeModal();
        alert('Usuario creado con éxito');
      },
      (error) => {
        console.error('Error al crear usuario', error);
        alert('Error al crear usuario');
      }
    );
  }

  updateUser(): void {
    const url = 'http://localhost/barberia/backend/api/usuarios/edit_usuario.php';  // Ruta para editar un usuario
    this.http.put(url, { ...this.userForm, token: this.token }, {withCredentials:true}).subscribe(
      () => {
        this.loadUsuarios();
        this.closeModal();
        alert('Usuario actualizado con éxito');
      },
      (error) => {
        console.error('Error al actualizar usuario', error);
        alert('Error al actualizar usuario');
      }
    );
  }

  toggleUserStatus(userId: number): void {
    const url = `http://localhost/barberia/backend/api/usuarios/delete_usuario.php?id=${userId}`;
    this.http.get(url, {withCredentials:true}).subscribe(
      () => {
        this.loadUsuarios();
      },
      (error) => {
        console.error('Error al cambiar el estado del usuario', error);
        alert('Error al cambiar el estado del usuario');
      }
    );
  }

  applyFilters(): void {
    this.loadUsuarios();
  }

  applyHistoryFilters(): void {
    this.loadHistory();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadUsuarios();
  }

  onHistoryPageChange(page: number): void {
    this.pageHistory = page;
    this.loadHistory();
  }

  validateForm(): boolean {
    // Mantenemos el objeto userForm que ya usas
    const { username, email, password /*, confirmPassword */ } = this.userForm; // Comentamos confirmPassword aquí

    // Modificamos la condición: Quitamos la comprobación de !confirmPassword
    if (!username || !email || !password /* || !confirmPassword */) {
      alert('Por favor, complete todos los campos requeridos (Usuario, Email, Contraseña).');
      return false;
    }

    // ¡ADVERTENCIA! Al quitar la comprobación de confirmPassword de aquí arriba,
    // también se elimina la siguiente comprobación de coincidencia.
    // Se puede considerar añadir esta verificación de coincidencia dentro de createUser()
    // DESPUÉS de añadir el campo HTML para confirmPassword.
    /*
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return false;
    }
    */

    // Si llegamos aquí, los campos requeridos BÁSICOS (sin confirmación) están llenos
    return true;
  }

  getUserById(id: number): void {
    const url = `http://localhost/barberia/backend/api/usuarios/read_usuarioedit.php?id=${id}`;
    this.http.get<any>(url, {withCredentials:true}).subscribe(
      (data) => {
        if (data) {
          this.openModalEditUser(data); // Cargar los datos en el modal
        } else {
          alert('Usuario no encontrado');
        }
      },
      (error) => {
        console.error('Error al obtener usuario', error);
        alert('Error al obtener usuario');
      }
    );
  }
}
