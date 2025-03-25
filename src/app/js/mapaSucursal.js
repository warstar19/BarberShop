const tiendas = [
  { nombre: "Barbershop Cartago", lat: 9.865912, lng: -83.922097, telefono: "+506 1234-5678", correo: "cartago@barbershop.com", imagen: "cartago.jpg" },
  { nombre: "Barbershop San José", lat: 9.934739, lng: -84.084206, telefono: "+506 8765-4321", correo: "sanjose@barbershop.com", imagen: "sanjose.jpg" },
  { nombre: "Barbershop Heredia", lat: 9.998566, lng: -84.116344, telefono: "+506 1122-3344", correo: "heredia@barbershop.com", imagen: "heredia.jpg" }
];

let mapa;
let marcador;

document.addEventListener("DOMContentLoaded", function () {
  initMap();
});
function refresmap(){
  initMap();}

function initMap() {

  if (document.getElementById("mapa")) {

    mapa = L.map('mapa').setView([9.933977, -84.094893], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showClosestStore, handleError);
    } else {
      alert("Geolocalización no es soportada por este navegador.");
    }


    tiendas.forEach(store => {
      L.marker([store.lat, store.lng]).addTo(mapa)
        .bindPopup(`
          <strong>${store.nombre}</strong><br>
          <img src="images/${store.imagen}" alt="${store.nombre}" width="100"><br>
          Tel: ${store.telefono}<br>
          Email: <a href="mailto:${store.correo}">${store.correo}</a>
        `);
    });
  }

  if (document.getElementById("mapaContacto")) {

    mapa = L.map('mapaContacto').setView([9.933977, -84.094893], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showClosestStore, handleError);
    } else {
      alert("Geolocalización no es soportada por este navegador.");
    }


    tiendas.forEach(store => {
      L.marker([store.lat, store.lng]).addTo(mapa)
        .bindPopup(`
          <strong>${store.nombre}</strong><br>
          <img src="images/${store.imagen}" alt="${store.nombre}" width="100"><br>
          Tel: ${store.telefono}<br>
          Email: <a href="mailto:${store.correo}">${store.correo}</a>
        `);
    });
  }
}

function showClosestStore(position) {
  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;

  let closestStore = null;
  let minDistance = Infinity;


  tiendas.forEach(store => {
    const distance = calculateDistance(userLat, userLng, store.lat, store.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestStore = store;
    }
  });

  if (document.getElementById("mapaContacto")) {
    mapa.setView([closestStore.lat, closestStore.lng], 13);
    if (marcador) {
      marcador.remove();
    }

    marcador = L.marker([closestStore.lat, closestStore.lng]).addTo(mapa)
      .bindPopup(`
        <strong>${closestStore.nombre}</strong><br>
        <img src="images/${closestStore.imagen}" alt="${closestStore.nombre}" width="100"><br>
        Tel: ${closestStore.telefono}<br>
        Email: <a href="mailto:${closestStore.correo}">${closestStore.correo}</a>
      `)
      .openPopup();
  }


  if (document.getElementById("mapa")) {
    mapa.setView([closestStore.lat, closestStore.lng], 13);
  }

  document.getElementById("sucursalInfo").innerText = `La sucursal más cercana es: ${closestStore.nombre}`;
}

function handleError() {
  alert("No se pudo obtener tu ubicación.");
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function cambiarUbicacion() {
  var sucursal = document.getElementById("sucursal").value;
  var store = tiendas.find(t => t.nombre.includes(sucursal));

  if (store) {
    mapa.setView([store.lat, store.lng], 13);

    if (marcador) {
      marcador.remove();
    }

    marcador = L.marker([store.lat, store.lng]).addTo(mapa)
      .bindPopup(`
        <strong>${store.nombre}</strong><br>
        <img src="images/${store.imagen}" alt="${store.nombre}" width="100"><br>
        Tel: ${store.telefono}<br>
        Email: <a href="mailto:${store.correo}">${store.correo}</a>
      `)
      .openPopup();

    document.getElementById("sucursalInfo").innerText = `Sucursal seleccionada: ${store.nombre}`;
  }
}
