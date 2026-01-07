import { Routes } from '@angular/router';

// Componentes de Login y Layout
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';

// Componentes Principales
import { HabitacionListComponent } from './components/habitacion-list/habitacion-list.component';
import { RegistroComponent } from './components/registro-form/registro-form.component';
import { UsuarioListComponent } from './components/usuario-list/usuario-list.component';

// ✅ ÚNICO COMPONENTE DE REPORTES (EL NUEVO DASHBOARD)
// Nota: Ajusta la ruta si creaste una carpeta extra, pero según tu imagen está aquí:
import { ReporteDashboardComponent } from './components/reportes/reporte-dashboard.component';

// Guards de Seguridad
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [

  // 🔓 LOGIN (Pública)
  { path: 'login', component: LoginComponent },

  // 🔐 ÁREA PRIVADA (Con Menú Lateral/Layout)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // Protege todas las rutas hijas
    children: [
      
      // Rutas Principales
      { path: 'habitaciones', component: HabitacionListComponent },
      { path: 'registro', component: RegistroComponent },

      // 👑 GESTIÓN DE USUARIOS (Solo Admin)
      {
        path: 'usuarios',
        component: UsuarioListComponent,
        canActivate: [AdminGuard]
      },

      // 📊 REPORTES (DASHBOARD)
      // Esta es la única ruta que necesitas ahora. 
      // Al entrar a /reportes se verán las tarjetas y gráficas.
      { path: 'reportes', component: ReporteDashboardComponent },

      // Redirección por defecto al entrar al sistema
      { path: '', redirectTo: 'habitaciones', pathMatch: 'full' }
    ]
  },

  // ❌ RUTAS NO ENCONTRADAS (Redirigir al Login)
  { path: '**', redirectTo: 'login' }
];