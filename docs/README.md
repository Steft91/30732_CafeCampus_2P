# Documentación y Evidencias

Esta carpeta reúne la planificación técnica y las evidencias generadas durante las pruebas de cada avance.

## Avance 1

- `avance1-evidencias/avance1-benchmark-sync.txt`: resultados del benchmark del camino síncrono mediante TCP.
- `avance1-evidencias/avance1-benchmark-async.txt`: resultados del benchmark del camino asíncrono mediante Redis.
- `avance1-evidencias/avance1-caida-servicio.txt`: evidencia de la prueba de acoplamiento temporal con MS Inventario detenido.
- `avance1-evidencias/sync.png`: captura de los resultados de latencia del camino síncrono.
- `avance1-evidencias/async.png`: captura de los resultados de latencia del camino asíncrono.
- `avance1-evidencias/avance1-kanban.png`: captura del tablero Kanban del Avance 1.
- `planificacion-avance1/`: documentación técnica y organizativa.

## Avance 2

- `avance2-evidencias/flujo-pedido-grpc-rabbitmq.txt`: respuesta del pedido creado usando gRPC para consultar productos.
- `avance2-evidencias/rabbitmq-inventario.txt`: logs del consumidor RabbitMQ en MS Inventario.
- `avance2-evidencias/avance2-rabbitmq-inventario-log.png`: captura del evento recibido por RabbitMQ.
- `avance2-evidencias/error-producto-inexistente-grpc.txt`: respuesta controlada ante producto inexistente por gRPC.
- `avance2-evidencias/avance2-error-producto-inexistente-grpc.png`: captura de la prueba de error controlado.
- `planificacion-avance2/`: alcance, plan de commits y checklist de evidencias.


## Avance 3

- `avance3-evidencias/servicios-finales-ps.txt`: estado de contenedores del stack final.
- `avance3-evidencias/servicios-finales.png`: captura del stack final levantado.
- `avance3-evidencias/login-jwt.txt`: login exitoso y emisión de JWT.
- `avance3-evidencias/login-jwt.png`: captura del login JWT.
- `avance3-evidencias/ruta-protegida-200.txt`: ruta protegida con token válido.
- `avance3-evidencias/ruta-con-token-valido-200.png`: captura de ruta autorizada.
- `avance3-evidencias/ruta-sin-token-401.txt`: ruta protegida sin token.
- `avance3-evidencias/ruta-sin-token-401.png`: captura del 401.
- `avance3-evidencias/ruta-rol-sin-permiso-403.txt`: rol autenticado sin permiso.
- `avance3-evidencias/rol-sin-permiso-403.png`: captura del 403.
- `avance3-evidencias/flujo-integrado-final.txt`: creación de pedido desde Gateway con JWT, gRPC y RabbitMQ.
- `avance3-evidencias/flujo-integrado-final.png`: captura del flujo integrado.
- `avance3-evidencias/flujo-integrado-rabbitmq-inventario.txt`: log del evento RabbitMQ consumido por Inventario.
- `avance3-evidencias/rabbitmq-recibido-inventario.png`: captura del evento RabbitMQ en logs.
- `avance3-evidencias/error-controlado-status.txt`: error controlado usado para observabilidad.
- `avance3-evidencias/avance3-sentry-error-capturado.png`: evento capturado en Sentry.
- `avance3-evidencias/avance3-sentry-tags-contexto.png`: tags y contexto del evento en Sentry.
- `avance3-evidencias/avance3-kanban.png`: captura del tablero Kanban actualizado para el cierre final.
- `planificacion-avance3/`: runbook de demo, guion de defensa y planificación final.
