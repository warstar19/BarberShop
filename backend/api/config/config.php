<?php
// Configuración JWT y Aplicación Backend

// --- JWT (JSON Web Token) ---

define('JWT_SECRET_KEY', 'B4rb3r1a2025$'); // ¡CAMBIA ESTO!

// Configuración del token (emisor, audiencia, tiempo de expiración en segundos)
define('JWT_ISSUER', 'http://localhost/barberia'); // URL de tu backend (ajusta si es diferente)
define('JWT_AUDIENCE', 'http://localhost:4200');   // URL de tu frontend Angular (ajusta si es diferente)
define('JWT_EXPIRATION_TIME', 60 * 60 * 8); // 8 horas

// NOTA: Las credenciales de BD NO están aquí porque se usa en conexion.php
?>