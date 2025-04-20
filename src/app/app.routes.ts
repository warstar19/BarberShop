import { Routes } from '@angular/router';

import { InicioComponent } from './inicio/inicio.component';
import { HistoriaComponent } from './historia/historia.component';
import { BarberosComponent } from './barberos/barberos.component';
import { SucursalesComponent } from './sucursales/sucursales.component';
import { ContactoComponent } from './contacto/contacto.component';
import { BarberoOnlineComponent } from './barbero-online/barbero-online.component';

// Importamos el componente 'UsuarioComponent' y sus rutas hijas
import { UsuarioComponent } from './barbero-online/usuario/usuario/usuario.component';
import { ReservaComponent } from './barbero-online/usuario/reserva/reserva.component';
import { HistorialComponent } from './barbero-online/usuario/historial/historial.component';
import { PerfilComponent } from './barbero-online/usuario/perfil/perfil.component';
import { NotificacionesComponent } from './barbero-online/usuario/notificaciones/notificaciones.component';
import { ServiciosComponent } from './barbero-online/usuario/servicios/servicios.component';
import { GaleriaComponent } from './barbero-online/usuario/galeria/galeria.component';
import { SoporteComponent } from './barbero-online/usuario/soporte/soporte.component';

// Importamos los componentes de Barbero y sus subcomponentes
import { BarberoComponent } from './barbero-online/barbero/barbero/barbero.component';
import { PerfilBarberoComponent } from './barbero-online/barbero/perfil-Barbero/perfil-barbero.component';
import { CitasDelDiaComponent } from './barbero-online/barbero/citas-del-dia/citas-del-dia.component';
import { HistorialBarberoComponent } from './barbero-online/barbero/historial-Barbero/historial-Barberos.component';
import { GestionCitasBarberoComponent } from './barbero-online/barbero/gestion-citas-barbero/gestion-citas-barbero.component';

// Importamos los componentes de Admin y sus subcomponentes
import { AdminComponent } from './barbero-online/admin/admin/admin.component';
import { PerfilAdminComponent } from './barbero-online/admin/perfil-Admin/perfil-Admin.component';
import { GestionUsuariosComponent } from './barbero-online/admin/gestion-usuarios/gestion-usuarios.component';
import { GestionCitasComponent } from './barbero-online/admin/gestion-citas/gestion-citas.component';
import { CalendarioComponent } from './barbero-online/admin/calendario/calendario.component';
import { HistorialFinancieroComponent } from './barbero-online/admin/historial-financiero/historial-financiero.component';
// Importa el guard
import { AuthGuard } from './auth.guard'; //Este guard se usa en la configuración de rutas para protegerlas. 
// Verifica si el usuario está logueado y si tiene el rol necesario (definido en la data de la ruta).

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'historia', component: HistoriaComponent },
  { path: 'barberos', component: BarberosComponent },
  { path: 'sucursales', component: SucursalesComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'barbero-online', component: BarberoOnlineComponent },
   // --- Ruta de Login/Registro ---
  // Apunta al componente que tiene el HTML/TS del login/registro
  { path: 'login', component: BarberoOnlineComponent },
  // Ruta de 'usuario' con subrutas hijas, accesible solo a través de un enlace dentro de la aplicación
  {
    path: 'usuario',
    component: UsuarioComponent,
    canActivate: [AuthGuard],
    data: {roles:['cliente']},
    children: [
      { path: 'reserva', component: ReservaComponent },
      { path: 'historial', component: HistorialComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'notificaciones', component: NotificacionesComponent },
      { path: 'servicios', component: ServiciosComponent },
      { path: 'galeria', component: GaleriaComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: '', redirectTo: 'reserva', pathMatch: 'full' }  // Ruta por defecto dentro de UsuarioComponent
    ]
  },

  // Ruta de 'barbero' con subrutas
  {
    path: 'barbero',
    component: BarberoComponent,
    canActivate: [AuthGuard],      
    data: { roles: ['barbero'] },
    children: [
      { path: 'perfil', component: PerfilBarberoComponent },
      { path: 'citas-del-dia', component: CitasDelDiaComponent },
      { path: 'historial', component: HistorialBarberoComponent },
      { path: '', redirectTo: 'citas-del-dia', pathMatch: 'full' },  // Ruta por defecto dentro de BarberoComponent
      { path: 'gestion-citas-barbero', component: GestionCitasBarberoComponent },
    ]
  },

  // Ruta de 'admin' con subrutas
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],       
    data: { roles: ['admin'] },
    children: [
      { path: 'perfil', component: PerfilAdminComponent },
      { path: 'gestion-usuarios', component: GestionUsuariosComponent },
      { path: 'gestion-citas', component: GestionCitasComponent },
      { path: 'calendario', component: CalendarioComponent },
      { path: 'historial-financiero', component: HistorialFinancieroComponent },
      { path: '', redirectTo: 'calendario', pathMatch: 'full' }  // Ruta por defecto dentro de AdminComponent
    ]
  },

  // Redirigir cualquier otra ruta a 'inicio' como ruta por defecto
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio' }
];
