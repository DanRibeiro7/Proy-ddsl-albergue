import { Routes } from '@angular/router';

// 1. Componentes Base (Login y Estructura)
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';

// 2. Componentes Principales
import { HabitacionListComponent } from './components/habitacion-list/habitacion-list.component';

// Registros (Importamos Lista y Formulario por separado)
import { RegistroListComponent } from './components/registro-list/registro-list.component';
import { RegistroComponent } from './components/registro-form/registro-form.component';

// Personas (Tus componentes de gestión de huéspedes)
import { PersonaListComponent } from './components/persona-list/persona-list.component';
import { PersonaFormComponent } from './components/persona-form/persona-form.component';

// Usuarios
import { UsuarioListComponent } from './components/usuario-list/usuario-list.component';

// 3. NUEVO Dashboard de Reportes (La versión consolidada)
import { ReporteDashboardComponent } from './components/reportes/reporte-dashboard.component';

// Guards (Están importados, pero los usaremos comentados por ahora)
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [

  // 🔓 LOGIN (Pública)
  { path: 'login', component: LoginComponent },

  // 🔐 SISTEMA PRINCIPAL (Layout con Menú Lateral)
  {
    path: '',
    component: LayoutComponent,
    // canActivate: [AuthGuard], // <--- COMENTADO: Para que puedas desarrollar sin bloqueos
    children: [
      
      // === 1. HABITACIONES (Dashboard Principal) ===
      { path: 'habitaciones', component: HabitacionListComponent },

      // === 2. REGISTROS (Flujo Correcto) ===
      // Ruta para ver la TABLA (Historial)
      { path: 'registro', component: RegistroListComponent }, 
      // Ruta para el FORMULARIO (Nuevo Ingreso)
      { path: 'registro/nuevo', component: RegistroComponent },

      // === 3. PERSONAS (Huéspedes) ===
      { path: 'personas', component: PersonaListComponent },          // Lista
      { path: 'personas/nuevo', component: PersonaFormComponent },    // Crear
      { path: 'personas/editar/:id', component: PersonaFormComponent }, // Editar
        
      // === 4. USUARIOS (Admin) ===
      {
        path: 'usuarios',
        component: UsuarioListComponent,
        // canActivate: [AdminGuard] // <--- COMENTADO
      },

      // === 5. REPORTES (Tu Nuevo Dashboard) ===
      { path: 'reportes', component: ReporteDashboardComponent },

      // Redirección por defecto al entrar
      { path: '', redirectTo: 'habitaciones', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'habitaciones' }
];