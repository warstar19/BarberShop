<?php
include __DIR__ . '/../cors.php';
include __DIR__ . '/../conexion.php';

$whereClauses = [];
$params = [];

$accion = isset($_GET['accion']) ? $_GET['accion'] : '';

// Acción para obtener solo los barberos o clientes
if ($accion === 'clientes') {
    $whereClauses[] = "rol = 'cliente'";
} elseif ($accion === 'barberos') {
    $whereClauses[] = "rol = 'barbero'";
} elseif ($accion === 'admin') {
    // Si se necesita solo el admin (id = 1)
    $whereClauses[] = "id = 1";
} else {
    echo json_encode(["error" => "Acción no especificada o no válida."]);
    exit;
}

// Consulta básica para obtener los usuarios
$sql = "SELECT id, username, email, rol, estado FROM usuarios";

// Si hay filtros adicionales, los aplicamos
if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($usuarios)) {
        echo json_encode($usuarios);
    } else {
        echo json_encode(["mensaje" => "No se encontraron resultados."]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
