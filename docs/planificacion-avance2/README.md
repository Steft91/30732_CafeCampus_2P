# Planificación — Avance 2 (Cafe Campus)

Documentación técnica y organizativa para implementar **gRPC + segundo transporte + manejo de excepciones** sin romper lo entregado en Avance 1.

## Objetivo

Agregar dos formas nuevas de comunicación entre microservicios:

1. **gRPC** entre `ms-pedidos` y `ms-productos`, usando un contrato `.proto`.
2. **RabbitMQ** como segundo transporte asíncrono, distinto a Redis Pub/Sub.

El camino TCP y Redis del Avance 1 se conservan como evidencia previa.

## Decisión técnica

| Requisito | Implementación propuesta | Motivo |
|---|---|---|
| gRPC | `ms-pedidos -> ms-productos` | Pedidos necesita consultar datos reales del producto antes de crear un pedido. |
| Segundo transporte | RabbitMQ | Aporta cola y entrega más robusta que Redis Pub/Sub para eventos asíncronos. |
| Error controlado | Producto inexistente por gRPC | Permite demostrar `try/catch` sin tumbar el servicio. |
| Evidencia | `curl`, logs, capturas y README | La rúbrica exige pruebas visibles en el repositorio. |

## Documentos

| Documento | Contenido |
|---|---|
| [`01-alcance-arquitectura.md`](01-alcance-arquitectura.md) | Alcance técnico, flujos gRPC/RabbitMQ y diagrama Mermaid. |
| [`02-plan-commits.md`](02-plan-commits.md) | Ramas y commits semánticos sugeridos para el equipo. |
| [`03-evidencias-checklist.md`](03-evidencias-checklist.md) | Evidencias obligatorias para cerrar `v2-avance2`. |

## Resultado esperado

- Contrato `productos.proto` versionado en el monorepo.
- `ms-productos` expone un servidor gRPC.
- `ms-pedidos` consume gRPC para consultar productos.
- `ms-pedidos` publica evento en RabbitMQ.
- `ms-inventario` consume evento desde RabbitMQ.
- README actualizado con diagrama, comparación de transportes y manejo de excepciones.
- Tag `v2-avance2`.
