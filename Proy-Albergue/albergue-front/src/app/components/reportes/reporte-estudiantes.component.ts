import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../services/reporte.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-estudiantes.component.html'
})
export class ReporteEstudiantesComponent implements OnInit {

  total = 0;

  constructor(private reporte: ReporteService) {}

  ngOnInit(): void {
    this.reporte.estudiantes().subscribe(r => this.total = r.total);
  }
}
