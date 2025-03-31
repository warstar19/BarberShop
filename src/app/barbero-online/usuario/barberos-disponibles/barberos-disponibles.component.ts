import { Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-barberos-disponibles',
  imports: [],
  templateUrl: './barberos-disponibles.component.html',
  styleUrl: './barberos-disponibles.component.css'
})
export class BarberosDisponiblesComponent {
  barberos: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getBarberos().subscribe(data => {
      this.barberos = data;
    });
  }
}
