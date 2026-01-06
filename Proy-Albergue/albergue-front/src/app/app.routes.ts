import { Routes } from '@angular/router';
import { HabitacionListComponent } from './components/habitacion-list/habitacion-list.component';
import { RegistroComponent } from './components/registro-form/registro-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'habitaciones', pathMatch: 'full' },
  { path: 'habitaciones', component: HabitacionListComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '**', redirectTo: 'habitaciones' }
];
