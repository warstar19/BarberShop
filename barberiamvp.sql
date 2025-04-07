-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-04-2025 a las 01:41:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `barberiamvp`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `barbero_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `sucursal_id` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada','completada') DEFAULT 'pendiente',
  `notas` text DEFAULT NULL,
  `color_primario` varchar(7) DEFAULT NULL,
  `color_secundario` varchar(7) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `cliente_id`, `barbero_id`, `servicio_id`, `sucursal_id`, `fecha_inicio`, `fecha_fin`, `estado`, `notas`, `color_primario`, `color_secundario`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 4, 2, 1, 1, '2025-04-10 10:00:00', '2025-04-10 10:45:00', 'confirmada', 'Cliente frecuente, corte usual.', '#3498DB', '#FFFFFF', '2025-04-05 18:28:27', '2025-04-05 18:28:27'),
(2, 5, 3, 3, 1, '2025-04-01 14:00:00', '2025-04-01 15:15:00', 'completada', 'Primera visita.', NULL, NULL, '2025-04-05 18:28:27', '2025-04-05 18:28:27'),
(3, 4, 2, 1, 2, '2025-04-15 16:00:00', '2025-04-15 16:45:00', 'pendiente', NULL, NULL, NULL, '2025-04-05 18:28:27', '2025-04-05 18:28:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_financiero`
--

CREATE TABLE `historial_financiero` (
  `id` int(11) NOT NULL,
  `cita_id` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') NOT NULL,
  `estado_pago` enum('pendiente','completado','reembolsado') DEFAULT 'pendiente',
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `historial_financiero`
--

INSERT INTO `historial_financiero` (`id`, `cita_id`, `monto`, `metodo_pago`, `estado_pago`, `notas`, `fecha_creacion`) VALUES
(1, 2, 15000.00, 'tarjeta', 'completado', 'Pago con tarjeta Visa **** 1234', '2025-04-05 18:28:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('cita','sistema','promocion') NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_lectura` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `usuario_id`, `titulo`, `mensaje`, `tipo`, `leida`, `fecha_envio`, `fecha_lectura`) VALUES
(1, 4, 'Confirmación de Cita', 'Tu cita para Corte Clásico el 10 de Abril a las 10:00 AM con Juan Perez ha sido confirmada.', 'cita', 0, '2025-04-05 18:28:27', NULL),
(2, 1, 'Actualización de Sistema', 'El mantenimiento programado se completó exitosamente.', 'sistema', 1, '2025-04-05 18:28:27', NULL),
(3, 5, '¡Promoción Especial!', 'Obtén un 15% de descuento en tu próximo afeitado de barba. ¡Agenda ya!', 'promocion', 0, '2025-04-05 18:28:27', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_cambios`
--

CREATE TABLE `registros_cambios` (
  `id` int(11) NOT NULL,
  `tabla_afectada` varchar(50) NOT NULL,
  `registro_id` int(11) NOT NULL,
  `tipo_cambio` enum('creacion','actualizacion','eliminacion') NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `registros_cambios`
--

INSERT INTO `registros_cambios` (`id`, `tabla_afectada`, `registro_id`, `tipo_cambio`, `usuario_id`, `datos_anteriores`, `datos_nuevos`, `fecha_cambio`) VALUES
(1, 'usuarios', 4, 'creacion', 1, '{}', '{\"username\": \"cliente_carlos\", \"email\": \"carlos.m@email.com\", \"rol\": \"cliente\"}', '2025-04-05 18:28:27'),
(2, 'citas', 2, 'actualizacion', 3, '{\"estado\": \"confirmada\"}', '{\"estado\": \"completada\"}', '2025-04-05 18:28:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `duracion_minutos` int(11) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `descripcion`, `precio`, `duracion_minutos`, `imagen_url`, `activo`, `fecha_creacion`) VALUES
(1, 'Corte de Cabello Clásico', 'Corte tradicional para caballero, incluye lavado y peinado básico.', 10000.00, 45, 'url/imagen/corte_clasico.jpg', 1, '2025-04-05 18:28:27'),
(2, 'Afeitado de Barba Completo', 'Afeitado con navaja, toallas calientes y masaje facial.', 8000.00, 30, 'url/imagen/afeitado.jpg', 1, '2025-04-05 18:28:27'),
(3, 'Corte y Barba Premium', 'Servicio combinado de corte de cabello y arreglo/afeitado de barba.', 15000.00, 75, 'url/imagen/corte_barba.jpg', 1, '2025-04-05 18:28:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios_sucursal`
--

CREATE TABLE `servicios_sucursal` (
  `id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `sucursal_id` int(11) NOT NULL,
  `disponible` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `servicios_sucursal`
--

INSERT INTO `servicios_sucursal` (`id`, `servicio_id`, `sucursal_id`, `disponible`) VALUES
(1, 1, 1, 1),
(2, 2, 1, 1),
(3, 3, 1, 1),
(4, 1, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursales`
--

CREATE TABLE `sucursales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(50) DEFAULT NULL,
  `direccion` text NOT NULL,
  `horario` text NOT NULL,
  `activa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sucursales`
--

INSERT INTO `sucursales` (`id`, `nombre`, `latitud`, `longitud`, `telefono`, `correo`, `imagen_url`, `whatsapp`, `direccion`, `horario`, `activa`) VALUES
(1, 'Sucursal San José Centro', 9.93330000, -84.08330000, '+506 22220001', 'sanjose@barberia.com', 'url/imagen/suc_sanjose.jpg', '+506 61110001', 'Avenida Central, Calle 5, San José', 'Lunes a Sábado: 9am - 7pm', 1),
(2, 'Sucursal Heredia', 9.99800000, -84.11770000, '+506 22220002', 'heredia@barberia.com', 'url/imagen/suc_heredia.jpg', '+506 61110002', 'Frente al Parque Central, Heredia', 'Lunes a Viernes: 10am - 8pm, Sábado: 9am - 5pm', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','barbero','cliente') NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `token` varchar(255) DEFAULT NULL,
  `barberold` varchar(50) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `email`, `telefono`, `direccion`, `fecha_nacimiento`, `genero`, `password_hash`, `rol`, `estado`, `token`, `barberold`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Barberia_admin', 'admin@barberia.com', '+506 888800022', 'Oficina Central', '1985-01-16', 'Masculino', '$2y$10$TsGhF0vE5IKDl/7fvdXayucMV.5BaaW1.yvX9JH8POIn2Hn2v0V1.', 'admin', 'activo', NULL, NULL, '2025-04-05 18:28:27', '2025-04-05 23:31:15'),
(2, 'barbero_juan', 'juan.perez@barberia.com', '+506 88880002', 'Heredia Centro', '1990-05-20', 'Masculino', '$2y$10$Ix707qwTPOXA4RaRGE49suSH19hved4IO6kIfp5xaOpIQ3zFfHxRG', 'barbero', 'activo', NULL, NULL, '2025-04-05 18:28:27', '2025-04-05 23:12:27'),
(3, 'barbero_ana', 'ana.gomez@barberia.com', '+506 88880003', 'San José, Sabana', '1995-08-10', 'Femenino', '$2y$10$.HZaPPiHeVRyMKpmIN3wxulsXPlDmXvlLFhgVZNCgMUVaGRsKMLGm', 'barbero', 'activo', NULL, NULL, '2025-04-05 18:28:27', '2025-04-05 23:13:10'),
(4, 'cliente_carlos', 'carlos.m@email.com', '+506 87770001', 'Cartago, Paraíso', '1988-11-01', 'Masculino', '$2y$10$QNS2VwJAK9S.vfk0.NsZQ.wjvFX0rHE/zZ/lwYaN5k8FfxWpTZhLC', 'cliente', 'activo', NULL, NULL, '2025-04-05 18:28:27', '2025-04-05 23:13:52'),
(5, 'cliente_sofia', 'sofia.r@email.com', '+506 86660001', 'Alajuela, Grecia', '2000-03-25', 'Femenino', '$2y$10$qDI9HwqQt7ghQ073Fc6VNeveJwkUDuF7W3Qk4/a4bzPHD1WaHLhK6', 'cliente', 'activo', NULL, NULL, '2025-04-05 18:28:27', '2025-04-05 23:14:29');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `servicio_id` (`servicio_id`),
  ADD KEY `sucursal_id` (`sucursal_id`),
  ADD KEY `idx_citas_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_citas_estado` (`estado`),
  ADD KEY `idx_citas_cliente` (`cliente_id`),
  ADD KEY `idx_citas_barbero` (`barbero_id`);

--
-- Indices de la tabla `historial_financiero`
--
ALTER TABLE `historial_financiero`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_historial_cita` (`cita_id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notificaciones_usuario_leida` (`usuario_id`,`leida`);

--
-- Indices de la tabla `registros_cambios`
--
ALTER TABLE `registros_cambios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_registros_tabla_registro` (`tabla_afectada`,`registro_id`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `servicios_sucursal`
--
ALTER TABLE `servicios_sucursal`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_servicio_sucursal` (`servicio_id`,`sucursal_id`),
  ADD KEY `sucursal_id` (`sucursal_id`);

--
-- Indices de la tabla `sucursales`
--
ALTER TABLE `sucursales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `historial_financiero`
--
ALTER TABLE `historial_financiero`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `registros_cambios`
--
ALTER TABLE `registros_cambios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `servicios_sucursal`
--
ALTER TABLE `servicios_sucursal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sucursales`
--
ALTER TABLE `sucursales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`barbero_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `citas_ibfk_4` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_financiero`
--
ALTER TABLE `historial_financiero`
  ADD CONSTRAINT `historial_financiero_ibfk_1` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `servicios_sucursal`
--
ALTER TABLE `servicios_sucursal`
  ADD CONSTRAINT `servicios_sucursal_ibfk_1` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `servicios_sucursal_ibfk_2` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
