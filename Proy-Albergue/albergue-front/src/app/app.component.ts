import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. IMPORTA EL COMPONENTE DEL SIDEBAR
import { SidebarComponent } from './components/sidebar/sidebar.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. AGRÉGALO AL ARRAY DE IMPORTS
  imports: [RouterOutlet, SidebarComponent], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AlbergueFront';
}