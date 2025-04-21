<?php
include "includes/session_config.php"; // Configuración de sesión
// Cabeceras CORS
include 'cors.php'; // Incluye el archivo de configuración CORS

session_start();
   


// Manejo OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido. Use GET."]);
    exit();
}

// Verificar si la variable de sesión clave existe
if (isset($_SESSION['user_id'])) {
    // Hay una sesión activa, devolver estado y datos básicos
    http_response_code(200);
    echo json_encode([
        "loggedIn" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "username" => $_SESSION['username'] ?? null, // Usar operador ?? por si no se guardó
            "role" => $_SESSION['user_role'] ?? null
        ]
    ]);
} else {
    // No hay sesión activa
    http_response_code(200); // La petición fue exitosa, pero no está logueado
    echo json_encode(["loggedIn" => false]);
}
exit();
?>