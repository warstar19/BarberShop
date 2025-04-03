import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialCambiosService } from './historial-cambios'; // Importar el servicio

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent implements OnInit {
  users = [
    { id: 1, username: 'Carlos López', email: 'carlos@example.com', telefono: '123-456-7890', estado: 'activo', rol: 'admin' },
    { id: 2, username: 'María Pérez', email: 'maria@example.com', telefono: '987-654-3210', estado: 'activo', rol: 'barbero' },
    // ... (otros usuarios)
  ];

  changeLog: any[] = [];
  filteredChangeLog: any[] = [];
  selectedUser: any = null;
  isEditing: boolean = false;
  isAddingUser: boolean = false;
  filterRol: string = 'all';
  searchQuery: string = '';
  loggedInUserId: number = 1;
  filterDate: string = '';
  startTime: string = '';
  endTime: string = '';
  userFilterStatus: string = 'todos';
  changeLogFilter: string = 'todos';
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  errorMessage: string = '';
  showForm: boolean = false;

  constructor(private historialCambiosService: HistorialCambiosService) {} // Inyectar el servicio

  ngOnInit(): void {
    this.filterChangeLog();
  }

  toggleUserState(user: any): void {
    user.estado = user.estado === 'activo' ? 'inactivo' : 'activo';
    const action = user.estado === 'activo' ? 'activado' : 'desactivado';
    this.addChangeLog(user.username, action);
  }

  get filteredUsers() {
    let filteredUsers = this.users;

    if (this.userFilterStatus === 'activos') {
      filteredUsers = filteredUsers.filter(user => user.estado === 'activo');
    } else if (this.userFilterStatus === 'inactivos') {
      filteredUsers = filteredUsers.filter(user => user.estado === 'inactivo');
    }

    if (this.filterRol !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.rol === this.filterRol);
    }

    if (this.searchQuery) {
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    this.totalPages = Math.ceil(filteredUsers.length / this.pageSize);
    return paginatedUsers;
  }

  toggleEditMode(user: any): void {
    this.selectedUser = { ...user };
    this.isEditing = true;
    this.errorMessage = '';
    this.showForm = true;
  }

  saveUserChanges(): void {
    if (!this.selectedUser.username || !this.selectedUser.email || !this.selectedUser.telefono) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    if ((this.selectedUser.rol === 'admin' || this.selectedUser.rol === 'barbero') && !this.selectedUser.token) {
      this.errorMessage = 'El token es obligatorio para este rol.';
      return;
    }

    const index = this.users.findIndex(user => user.id === this.selectedUser.id);
    if (index !== -1) {
      this.users[index] = { ...this.selectedUser };
    }

    this.addChangeLog(this.selectedUser.username, 'actualizado');
    this.isEditing = false;
    this.selectedUser = null;
    this.errorMessage = '';
    this.showForm = false;
  }

  addUser(): void {
    if (!this.selectedUser.username || !this.selectedUser.email || !this.selectedUser.telefono) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }
    if ((this.selectedUser.rol === 'admin' || this.selectedUser.rol === 'barbero') && !this.selectedUser.token) {
      this.errorMessage = 'El token es obligatorio para este rol.';
      return;
    }
    const newUser = { ...this.selectedUser };
    newUser.id = this.users.length + 1;
    this.users.push(newUser);
    this.addChangeLog(newUser.username, 'creado');
    this.isAddingUser = false;
    this.selectedUser = null;
    this.errorMessage = '';
    this.showForm = false;
  }

  addChangeLog(username: string, action: string): void {
    const currentDate = new Date();
    const formattedTime = currentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formattedDate = currentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const logMessage = {
      hora: formattedTime,
      fecha: formattedDate,
      username: username,
      action: action,
      modifico: `Administrador (ID: ${this.loggedInUserId})`,
      timestamp: currentDate.getTime(),
    };

    this.changeLog.unshift(logMessage);
    this.filterChangeLog();
  }

  filterChangeLog(): void {
    const filtros = {
      changeLogFilter: this.changeLogFilter,
      filterDate: this.filterDate,
      startTime: this.startTime,
      endTime: this.endTime,
      searchQuery: this.searchQuery,
    };

    this.filteredChangeLog = this.historialCambiosService.filtrarHistorial(this.changeLog, filtros);
    this.calculatePages();
  }

  get filteredChangeLogPaginated() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredChangeLog.slice(startIndex, endIndex);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.filterChangeLog();
  }

  calculatePages(): void {
    this.totalPages = Math.ceil(this.filteredChangeLog.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openAddUserForm(): void {
    this.isAddingUser = true;
    this.selectedUser = { username: '', email: '', telefono: '', rol: 'usuario', token: '' };
    this.errorMessage = '';
    this.showForm = true;
  }

  cancelAddUser(): void {
    this.isAddingUser = false;
    this.selectedUser = null;
    this.errorMessage = '';
    this.showForm = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedUser = null;
    this.errorMessage = '';
    this.showForm = false;
  }

  restoreUser(user: any): void {
    user.estado = 'activo';
    this.addChangeLog(user.username, 'restaurado');
  }

  closeForm(): void {
    this.isAddingUser = false;
    this.isEditing = false;
    this.showForm = false;
  }
}
