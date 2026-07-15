# Alcance y arquitectura — Avance 2

## Alcance

El Avance 2 agrega comunicación por contrato y un segundo transporte asíncrono:

- **gRPC:** `ms-pedidos` consulta a `ms-productos`.
- **RabbitMQ:** `ms-pedidos` publica un evento de pedido creado y `ms-inventario` lo consume.
- **Excepciones:** se controlan errores de gRPC y del transporte asíncrono con `try/catch`.

No se elimina el flujo existente:

- HTTP interno del gateway.
- TCP de benchmark del Avance 1.
- Redis Pub/Sub de benchmark del Avance 1.

## Flujo gRPC propuesto

```mermaid
sequenceDiagram
    participant Gateway
    participant Pedidos as MS Pedidos
    participant Productos as MS Productos gRPC

    Gateway->>Pedidos: POST /pedidos
    Pedidos->>Productos: gRPC ObtenerProducto(productoId)
    Productos-->>Pedidos: ProductoResponse(nombre, precio, disponible)
    Pedidos->>Pedidos: calcula snapshot y total
    Pedidos-->>Gateway: pedido creado
```

Uso esperado:

- El cliente ya no debe ser fuente confiable de `nombre` y `precio`.
- `ms-pedidos` debe obtener esos datos desde `ms-productos`.
- Si el producto no existe, el error se captura y se devuelve una respuesta controlada.

## Flujo RabbitMQ propuesto

```mermaid
sequenceDiagram
    participant Pedidos as MS Pedidos
    participant RabbitMQ
    participant Inventario as MS Inventario

    Pedidos->>RabbitMQ: publish pedido.creado.rabbitmq
    RabbitMQ-->>Inventario: consume evento
    Inventario->>Inventario: registra/loguea evento recibido
```

Este flujo no reemplaza todavía el descuento de stock. Se usa como flujo asíncrono de auditoría/evidencia para demostrar un transporte adicional.

## Puertos y variables esperadas

| Servicio | Variable | Valor local |
|---|---|---|
| `ms-productos` | `GRPC_PORT` | `50051` |
| `ms-pedidos` | `GRPC_PRODUCTOS_URL` | `localhost:50051` |
| `ms-pedidos` | `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` |
| `ms-inventario` | `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` |

En Docker Compose, los hosts cambian a nombres de servicio:

- `GRPC_PRODUCTOS_URL=ms-productos:50051`
- `RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672`
