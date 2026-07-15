# Checklist de evidencias — Avance 2

## gRPC

- [ ] Contrato `.proto` versionado.
- [ ] Captura/log de llamada gRPC exitosa.
- [ ] Captura/log de producto inexistente controlado.
- [ ] Explicación en README de qué servicio es cliente y cuál servidor.

## RabbitMQ

- [ ] RabbitMQ agregado a Docker Compose.
- [ ] Captura del panel RabbitMQ (`http://localhost:15672`) o logs del consumidor.
- [ ] Evidencia de evento publicado por `ms-pedidos`.
- [ ] Evidencia de evento consumido por `ms-inventario`.

## Manejo de excepciones

- [ ] Error gRPC controlado con `try/catch`.
- [ ] Error de transporte controlado sin caída del proceso.
- [ ] README explica qué errores se controlan y cómo.

## Comparación de transportes

| Transporte | Tipo | Patrón | Uso en Cafe Campus |
|---|---|---|---|
| TCP | Síncrono | Request/Response | Benchmark Gateway→Pedidos→Inventario. |
| Redis | Asíncrono | Pub/Sub | Evento de benchmark del Avance 1. |
| RabbitMQ | Asíncrono | Queue / Pub-Sub con cola | Evento `pedido.creado.rabbitmq`. |
| gRPC | Síncrono | RPC con contrato | Consulta de producto desde Pedidos hacia Productos. |

## Documentación

- [ ] Diagrama actualizado.
- [ ] README sección Avance 2 completa.
- [ ] Kanban actualizado.
- [ ] Tag `v2-avance2`.
