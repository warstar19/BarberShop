<?php
include __DIR__ . '/../cors.php';
include __DIR__ . '/../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por username (opcional)
if (isset($_GET['username']) && !empty($_GET['username'])) {
    $whereClauses[] = "username LIKE :username";
    $params[':username'] = '%' . htmlspecialchars($_GET['username'], ENT_QUOTES, 'UTF-8') . '%';
}

// Filtrado por email (opcional)
if (isset($_GET['email']) && !empty($_GET['email'])) {
    $whereClauses[] = "email = :email";
    $params[':email'] = htmlspecialchars($_GET['email'], ENT_QUOTES, 'UTF-8');
}

// Filtrado por rol (opcional)
if (isset($_GET['rol']) && !empty($_GET['rol'])) {
    $whereClauses[] = "rol = :rol";
    $params[':rol'] = htmlspecialchars($_GET['rol'], ENT_QUOTES, 'UTF-8');
}

// Filtrado por estado (opcional)
if (isset($_GET['estado']) && !empty($_GET['estado'])) {
    $estado = htmlspecialchars($_GET['estado'], ENT_QUOTES, 'UTF-8');
    // Asegurarse que el valor de estado es válido
    if (!in_array($estado, ['activo', 'inactivo'])) {
        echo json_encode(["error" => "Estado no válido"]);
        exit();
    }
    $whereClauses[] = "estado = :estado";
    $params[':estado'] = $estado;
}

$sql = "SELECT * FROM usuarios";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Verificar si hay resultados
    if (!empty($usuarios)) {
        echo json_encode($usuarios); // Devuelve los usuarios que cumplen con los filtros
    } else {
        // Si no hay usuarios, devolver mensaje claro
        echo json_encode(["mensaje" => "No se encontraron usuarios."]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
}

$conn = null;

?>
