<?php
// backend/api/includes/session_config.php
// Configuración de Cookies de Sesión

session_set_cookie_params([
    'lifetime' => 0, // 0 = expira al cerrar navegador
    'path' => '/',   // Disponible en todo el dominio
    // 'domain' => '.tudominio.com', // Descomentar y ajustar en producción si usas subdominios
    'secure' => false, // true solo en HTTPS
    'httponly' => true, // No accesible por JavaScript (más seguro)
    'samesite' => 'Lax' // Protección CSRF ('Lax' o 'Strict')
]);

// Establece un nombre descriptivo para la sesión (opcional)
// session_name('BARBERONLINESESS');

// Puedes añadir otras directivas de sesión si es necesario
// ini_set('session.use_strict_mode', 1);
// ini_set('session.gc_maxlifetime', 7200); // Tiempo de vida basura sesión (ej: 2 horas)
?>