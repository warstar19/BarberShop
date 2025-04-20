<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$_SESSION['test_data'] = '¡Hola desde la sesión! Hora: ' . date('H:i:s');
echo "Variable de sesión establecida. ID de sesión: " . session_id();
echo '<br><a href="test_getsession.php">Verificar sesión</a>';
?>