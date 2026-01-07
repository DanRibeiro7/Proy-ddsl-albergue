import { Routes } from '@angular/router';

// Componentes Base
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';

// Componentes del Sistema (TUYOS + FUSIONADOS)
import { HabitacionListComponent } from './components/habitacion-list/habitacion-list.component';
import { RegistroListComponent } from './components/registro-list/registro-list.component'; // Lista de Registros
import { RegistroComponent } from './components/registro-form/registro-form.component';     // Formulario Registro
import { PersonaListComponent } from './components/persona-list/persona-list.component';     // Lista Personas
import { PersonaFormComponent } from './components/persona-form/persona-form.component';     // Formulario Persona
import { UsuarioListComponent } from './components/usuario-list/usuario-list.component';     // Gestión Usuarios

// Reportes (DEL COMPAÑERO)
import { ReporteTotalComponent } from './components/reportes/reporte-total.component';
import { ReportePacientesComponent } from './components/reportes/reporte-pacientes.component';
import { ReporteEstudiantesComponent } from './components/reportes/reporte-estudiantes.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [

  // 🔓 LOGIN (Pública)
  { path: 'login', component: LoginComponent },

  // 🔐 PRIVADO CON SIDEBAR (Protegido por AuthGuard)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      
      // === TUS RUTAS FUSIONADAS ===
      
      // 1. Habitaciones (Dashboard Principal)
      { path: 'habitaciones', component: HabitacionListComponent },

      // 2. Registros (Hospedaje)
      { path: 'registros', component: RegistroListComponent },        // Lista
      { path: 'registro/nuevo', component: RegistroComponent },       // Formulario

      // 3. Personas (Huéspedes)
      { path: 'personas', component: PersonaListComponent },          // Lista
      { path: 'personas/nuevo', component: PersonaFormComponent },    // Crear
      { path: 'personas/editar/:id', component: PersonaFormComponent }, // Editar

      // === RUTAS DEL COMPAÑERO ===

      // 👑 Usuarios (Solo Admin)
      {
        path: 'usuarios',
        component: UsuarioListComponent,
        canActivate: [AdminGuard]
      },

      // 📊 Reportes
      { path: 'reportes/total', component: ReporteTotalComponent },
      { path: 'reportes/pacientes', component: ReportePacientesComponent },
      { path: 'reportes/estudiantes', component: ReporteEstudiantesComponent },

      // Redirección por defecto al entrar logueado
      { path: '', redirectTo: 'habitaciones', pathMatch: 'full' }
    ]
  },

  // ❌ Ruta desconocida -> Login
  { path: '**', redirectTo: 'login' }
];