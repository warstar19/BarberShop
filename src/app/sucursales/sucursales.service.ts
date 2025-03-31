import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  private tiendas = [
    {
      nombre: "Barbershop Cartago",
      lat: 9.865912,
      lng: -83.922097,
      telefono: "+506 1234-5678",
      correo: "cartago@barbershop.com",
      imagen: "../../assets/img/barberia1.png",
      whatsapp: "https://wa.me/50612345678",
      direccion: "Avenida 2, Cartago, Costa Rica",
      horario: "Lunes - Viernes: 9:00 AM - 6:00 PM",
      servicios: ["Corte de cabello", "Afeitado", "Corte de barba"],
      mapa: "https://www.google.com/maps?q=9.865912,-83.922097"
    },
    {
      nombre: "Barbershop San José",
      lat: 9.934739,
      lng: -84.084206,
      telefono: "+506 8765-4321",
      correo: "sanjose@barbershop.com",
      imagen: "../../assets/img/barberia2.png",
      whatsapp: "https://wa.me/50687654321",
      direccion: "Avenida Central, San José, Costa Rica",
      horario: "Lunes - Viernes: 10:00 AM - 7:00 PM",
      servicios: ["Corte de cabello", "Afeitado", "Corte de barba", "Masajes faciales"],
      mapa: "https://www.google.com/maps?q=9.934739,-84.084206"
    },
    {
      nombre: "Barbershop Heredia",
      lat: 9.998566,
      lng: -84.116344,
      telefono: "+506 1122-3344",
      correo: "heredia@barbershop.com",
      imagen: "../../assets/img/barberia2.png",
      whatsapp: "https://wa.me/50611223344",
      direccion: "Calle 1, Heredia, Costa Rica",
      horario: "Lunes - Viernes: 8:00 AM - 5:00 PM",
      servicios: ["Corte de cabello", "Corte de barba", "Coloración"],
      mapa: "https://www.google.com/maps?q=9.998566,-84.116344"
    }
  ];

  getTiendas() {
    return this.tiendas;
  }
}
