import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component'; // Tu Sidebar está aquí
import { HabitacionListComponent } from './components/habitacion-list/habitacion-list.component';
import { RegistroListComponent } from './components/registro-list/registro-list.component';
import { RegistroComponent } from './components/registro-form/registro-form.component';
import { PersonaListComponent } from './components/persona-list/persona-list.component';
import { PersonaFormComponent } from './components/persona-form/persona-form.component';
import { UsuarioListComponent } from './components/usuario-list/usuario-list.component';
import { ReporteDashboardComponent } from './components/reportes/reporte-dashboard.component';
import { AuthGuard } from './guards/auth.guard'; 

export const routes: Routes = [


  { path: '', redirectTo: 'login', pathMatch: 'full' },


  { path: 'login', component: LoginComponent },

  
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], 
    children: [
      
      // Si entran al Layout pero no especifican ruta, mandar a Reportes (Dashboard)
      { path: '', redirectTo: 'reportes', pathMatch: 'full' }, 

      { path: 'reportes', component: ReporteDashboardComponent },
      
      { path: 'habitaciones', component: HabitacionListComponent },
      
      { path: 'registro', component: RegistroListComponent }, 
      { path: 'registro/nuevo', component: RegistroComponent },

      { path: 'personas', component: PersonaListComponent },       
      { path: 'personas/nuevo', component: PersonaFormComponent },   
      { path: 'personas/editar/:id', component: PersonaFormComponent }, 
        
      { path: 'usuarios', component: UsuarioListComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];