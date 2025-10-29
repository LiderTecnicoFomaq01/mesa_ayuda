-- 1) Asegurar que el event scheduler esté activo
SET GLOBAL event_scheduler = ON;

-- 2) Función: calcular horas hábiles entre dos DATETIME
DELIMITER $$
CREATE FUNCTION calcular_horas_habiles(
  fecha_inicio DATETIME,
  fecha_fin    DATETIME
) RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE horas INT DEFAULT 0;
  DECLARE cursor_time DATETIME;
  SET cursor_time = fecha_inicio;

  WHILE cursor_time < fecha_fin DO
    -- Día de semana: Lunes=2 … Viernes=6
    IF DAYOFWEEK(cursor_time) BETWEEN 2 AND 6 THEN
      -- Bloque matutino 08:00–12:00
      IF HOUR(cursor_time) BETWEEN 8 AND 11 THEN
        SET horas = horas + 1;
      -- Bloque vespertino 13:00–17:00
      ELSEIF HOUR(cursor_time) BETWEEN 13 AND 16 THEN
        SET horas = horas + 1;
      END IF;
    END IF;
    SET cursor_time = DATE_ADD(cursor_time, INTERVAL 1 HOUR);
  END WHILE;

  RETURN horas;
END$$
DELIMITER ;


-- 3) Procedimiento: cerrar y acumular horas en tickets estado=3 con ≥5 días desde hora_solucion
DELIMITER $$
CREATE PROCEDURE sp_cerrar_tickets_estado3()
BEGIN
  DECLARE done       INT     DEFAULT FALSE;
  DECLARE v_id       INT;
  DECLARE v_inicio   DATETIME;
  DECLARE v_cont     INT;

  -- Cursor sobre tickets que llevan ≥5 días calendario en estado 3
  DECLARE cur CURSOR FOR
    SELECT
      id,
      hora_solucion,
      contador_horas
    FROM tickets
    WHERE id_estado = 3
      AND hora_solucion IS NOT NULL
      AND TIMESTAMPDIFF(DAY, hora_solucion, NOW()) >= 5;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_id, v_inicio, v_cont;
    IF done THEN
      LEAVE read_loop;
    END IF;

    -- Calcular horas hábiles desde v_inicio hasta ahora
    SET @horas_nuevas = calcular_horas_habiles(v_inicio, NOW());
    SET @total_horas = v_cont + @horas_nuevas;

    -- Actualizar el ticket
    UPDATE tickets
    SET
      id_estado           = 4,
      contador_horas      = @total_horas,
      fecha_actualizacion = NOW(),
      fecha_inicio_en_curso = NULL
    WHERE id = v_id;
  END LOOP;
  CLOSE cur;
END$$
DELIMITER ;


-- 4) Evento: ejecutar el procedimiento todos los días a las 18:00
DELIMITER $$
CREATE EVENT IF NOT EXISTS evento_actualizar_estado_tickets
ON SCHEDULE
  EVERY 1 DAY
  STARTS TIMESTAMP(CURDATE(), '18:00:00')
DO
BEGIN
  CALL sp_cerrar_tickets_estado3();
END$$
DELIMITER ;


-- 5) (Opcional) Trigger para fijar hora_solucion al entrar a estado 3
--    Asume que cambias al estado 3 vía UPDATE; este trigger fija hora_solucion si no existe.
DELIMITER $$
CREATE TRIGGER trg_before_update_estado3
BEFORE UPDATE ON tickets
FOR EACH ROW
BEGIN
  IF NEW.id_estado = 3 AND OLD.id_estado <> 3 THEN
    SET NEW.hora_solucion = NOW();
    SET NEW.fecha_actualizacion = NOW();
    SET NEW.fecha_inicio_en_curso = NULL;
  END IF;
END$$
DELIMITER ;
