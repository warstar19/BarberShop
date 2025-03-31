import { Component, OnInit } from '@angular/core';
import { MapaPreviewComponent } from '../mapa-preview/mapa-preview.component';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [MapaPreviewComponent, CommonModule, FormsModule],  // Incluir CommonModule y FormsModule
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {
  tiendas = [
    {
      nombre: "Barbershop Cartago",
      lat: 9.865912,
      lng: -83.922097,
      telefono: "+506 1234-5678",
      correo: "cartago@barbershop.com",
      imagen: "../../assets/img/barberia1.png",
      whatsapp: "https://wa.me/50612345678",  // Enlace de WhatsApp
      direccion: "Avenida 2, Cartago, Costa Rica",
      horario: "Lunes - Viernes: 9:00 AM - 6:00 PM",
      servicios: ["Corte de cabello", "Afeitado", "Corte de barba"],
      mapa: "https://www.google.com/maps?q=9.865912,-83.922097"  // Enlace de Google Maps
    },
    {
      nombre: "Barbershop San José",
      lat: 9.934739,
      lng: -84.084206,
      telefono: "+506 8765-4321",
      correo: "sanjose@barbershop.com",
      imagen: "../../assets/img/barberia2.png",
      whatsapp: "https://wa.me/50687654321",  // Enlace de WhatsApp
      direccion: "Avenida Central, San José, Costa Rica",
      horario: "Lunes - Viernes: 10:00 AM - 7:00 PM",
      servicios: ["Corte de cabello", "Afeitado", "Corte de barba", "Masajes faciales"],
      mapa: "https://www.google.com/maps?q=9.934739,-84.084206"  // Enlace de Google Maps
    },
    {
      nombre: "Barbershop Heredia",
      lat: 9.998566,
      lng: -84.116344,
      telefono: "+506 1122-3344",
      correo: "heredia@barbershop.com",
      imagen: "../../assets/img/barberia2.png",
      whatsapp: "https://wa.me/50611223344",  // Enlace de WhatsApp
      direccion: "Calle 1, Heredia, Costa Rica",
      horario: "Lunes - Viernes: 8:00 AM - 5:00 PM",
      servicios: ["Corte de cabello", "Corte de barba", "Coloración"],
      mapa: "https://www.google.com/maps?q=9.998566,-84.116344"  // Enlace de Google Maps
    }
  ];

  formSubmitted: boolean = false;  // Variable para controlar si el formulario fue enviado

  constructor() {}

  ngOnInit(): void {}

  // Método para manejar el envío del formulario
  onSubmit(): void {
    this.formSubmitted = true;  // Cambiar el estado a "formulario enviado"
  }

  // Método para restablecer el formulario
  resetForm(): void {
    this.formSubmitted = false;  // Restaurar el estado del formulario
  }
}
