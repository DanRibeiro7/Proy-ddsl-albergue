import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Importante para el botón
import { RegistroService } from '../../services/registro.service';

@Component({
  selector: 'app-registro-list',
  standalone: true,
  imports: [CommonModule, RouterLink], // Agregamos RouterLink
  templateUrl: './registro-list.component.html',
  styleUrls: ['./registro-list.component.css']
})
export class RegistroListComponent implements OnInit {

  listaRegistros: any[] = [];
  loading: boolean = true;

  constructor(private registroService: RegistroService) {}

  ngOnInit(): void {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.registroService.obtenerRegistros().subscribe({
      next: (res) => {
        if (res.success) {
          this.listaRegistros = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}