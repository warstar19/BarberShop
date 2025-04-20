<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

// Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"));

try {
    // Verificar que el ID de la cita y el nuevo estado hayan sido enviados
    if (isset($data->id) && isset($data->estado)) {

        // Asegurarnos que el estado es uno de los permitidos
        if ($data->estado !== 'confirmada' && $data->estado !== 'rechazada' && $data->estado !== 'completada' && $data->estado !== 'cancelada') {
            echo json_encode(["error" => "El estado no es válido"]);
            exit;
        }

        // Consultar el estado actual de la cita
        $sql = "SELECT estado FROM citas WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $data->id);
        $stmt->execute();

        // Obtener el estado de la cita
        $cita = $stmt->fetch();

        if ($cita) {
            // Verificar que el estado actual sea 'pendiente' si es necesario para actualizar
            if ($cita['estado'] === 'pendiente') {
                // Actualizar el estado de la cita
                $sql = "UPDATE citas SET estado = :estado WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':id', $data->id);
                $stmt->bindParam(':estado', $data->estado);

                // Ejecutamos la consulta
                if ($stmt->execute()) {
                    echo json_encode(["mensaje" => "Estado de la cita actualizado a '{$data->estado}' con éxito"]);
                } else {
                    echo json_encode(["error" => "Error al actualizar el estado de la cita"]);
                }
            } else {
                echo json_encode(["error" => "La cita no se puede actualizar porque su estado no es 'pendiente'"]);
            }
        } else {
            echo json_encode(["error" => "Cita no encontrada"]);
        }
    } else {
        echo json_encode(["error" => "Faltan datos de la cita o el estado"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
}

// Cerramos la conexión a la base de datos
$conn = null;
?>
