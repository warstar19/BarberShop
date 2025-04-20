<?php
header("Access-Control-Allow-Origin: http://localhost:4200"); // Permitimos todas las solicitudes desde cualquier origen
header("Access-Control-Allow-Credentials: true"); // Permitimos credenciales (cookies, autenticación HTTP, etc.)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Métodos permitidos
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"); // Cabeceras permitidas
header("Access-Control-Max-Age: 86400"); // Cache de preflight por 1 día (86400 segundos)

// Para manejar preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>