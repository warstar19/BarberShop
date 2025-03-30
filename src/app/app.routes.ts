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

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'historia', component: HistoriaComponent },
  { path: 'barberos', component: BarberosComponent },
  { path: 'sucursales', component: SucursalesComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'barbero-online', component: BarberoOnlineComponent },

  // Ruta de 'usuario' con subrutas hijas, accesible solo a través de un enlace dentro de la aplicación
  {
    path: 'usuario',
    component: UsuarioComponent,
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

  // Redirigir cualquier otra ruta a 'inicio' como ruta por defecto
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio' }
];
