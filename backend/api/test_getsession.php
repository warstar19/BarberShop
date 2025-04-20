<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
echo "Intentando leer sesión...<br>";
echo "ID de sesión actual: " . session_id() . "<br>";
if (isset($_SESSION['test_data'])) {
    echo "Éxito. Datos encontrados: " . htmlspecialchars($_SESSION['test_data']);
} else {
    echo "ERROR: No se encontró 'test_data' en la sesión.";
    echo "<pre>Contenido de \$_SESSION: ";
    print_r($_SESSION);
    echo "</pre>";
}
echo '<br><a href="test_setsession.php">Restablecer sesión</a>';
?>