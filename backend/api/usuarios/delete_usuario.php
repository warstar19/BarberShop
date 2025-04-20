<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

try {
    if ($id <= 0) {
        throw new Exception("ID de usuario inválido");
    }

    $stmt = $conn->prepare("SELECT estado FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        throw new Exception("Usuario no encontrado");
    }

    $nuevoEstado = ($usuario['estado'] === 'activo') ? 'inactivo' : 'activo';

    $update = $conn->prepare("UPDATE usuarios SET estado = :estado WHERE id = :id");
    $update->bindParam(':estado', $nuevoEstado);
    $update->bindParam(':id', $id);
    $update->execute();

    echo json_encode(["mensaje" => "Usuario actualizado a estado '$nuevoEstado' con éxito"]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
