import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { HistoriaComponent } from './historia/historia.component';
import { BarberosComponent } from './barberos/barberos.component';
import { SucursalesComponent } from './sucursales/sucursales.component';
import { ContactoComponent } from './contacto/contacto.component';
import { BarberoOnlineComponent } from './barbero-online/barbero-online.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'historia', component: HistoriaComponent },
  { path: 'barberos', component: BarberosComponent },
  { path: 'sucursales', component: SucursalesComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'barbero-online', component: BarberoOnlineComponent },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio' }
];
