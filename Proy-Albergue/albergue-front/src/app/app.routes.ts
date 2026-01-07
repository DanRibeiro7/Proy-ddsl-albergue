import { Routes } from '@angular/router';
import { HabitacionListComponent } from './components/habitacion-list/habitacion-list.component';
import { RegistroListComponent } from './components/registro-list/registro-list.component';
import { RegistroComponent } from './components/registro-form/registro-form.component';
import { PersonaListComponent } from './components/persona-list/persona-list.component';
import { PersonaFormComponent } from './components/persona-form/persona-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'habitaciones', pathMatch: 'full' },
  { path: 'habitaciones', component: HabitacionListComponent },
  { path: 'registros', component: RegistroListComponent },
  { path: 'registro/nuevo', component: RegistroComponent },
  { path: 'personas', component: PersonaListComponent },
  { path: 'personas/nuevo', component: PersonaFormComponent },     
  { path: 'personas/editar/:id', component: PersonaFormComponent },
  { path: '**', redirectTo: 'habitaciones' }
];
