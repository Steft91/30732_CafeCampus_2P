# Roles, actividades y Kanban — Avance 2

Equipo de **3 integrantes**. Se mantiene la **propiedad por directorio** del Avance 1: cada integrante
trabaja principalmente sobre directorios disjuntos, reduciendo la probabilidad de conflictos durante
la integración de las ramas. El único archivo compartido (`docker-compose.yml`) y el **contrato
`.proto`** los fija Marcos en la fase de fundación del avance, y nadie más los toca en paralelo.

## Integrantes y responsabilidades

| Integrante | Rol | Directorios/archivos propios | Ramas |
|---|---|---|---|
| **Marcos Escobar** | Arquitectura · Contrato gRPC · Infraestructura · Integración | `proto/productos.proto` · `docker-compose.yml` · `gateway/` · fixes de `tsconfig` | `chore/grpc-rabbitmq-infra` |
| **Mateo Sosa** | Backend · Cliente gRPC · Transporte RabbitMQ | `ms-pedidos/` (cliente gRPC + publisher RMQ), `ms-inventario/` (consumer RMQ) | `feat/grpc-rabbitmq-pedidos`, `feat/rabbitmq-inventario` |
| **Stefany Díaz** | Servidor gRPC · Documentación · QA · Evidencias | `ms-productos/` (servidor gRPC), `docs/`, `README.md` | `feat/grpc-productos`, `docs/avance2` |

> **Por qué este reparto no choca:** el servidor gRPC vive en `ms-productos/` (Stefany) y el cliente
> gRPC vive en `ms-pedidos/` (Mateo); el publisher RabbitMQ vive en `ms-pedidos/` (Mateo) y el consumer
> en `ms-inventario/` (Mateo). Las dependencias entre ellos son de **runtime**, no de compilación, y el
> **contrato `.proto`** —única pieza que ambos lados comparten— lo congela Marcos antes de que arranquen
> las ramas de servicio.

## Reparto de tarjetas del `TABLERO_KANBAN.md` (etiqueta `avance-2`)

| Tarjeta Kanban (Avance 2) | Responsable | Rama donde se resuelve |
|---|---|---|
| Definir contrato `productos.proto` (mensajes + servicio) | Marcos | `chore/grpc-rabbitmq-infra` |
| Agregar RabbitMQ y variables gRPC/RMQ a Docker Compose | Marcos | `chore/grpc-rabbitmq-infra` |
| Montar `/proto` (read-only) en los servicios gRPC | Marcos | `chore/grpc-rabbitmq-infra` |
| MS Productos — exponer servidor gRPC `ObtenerProducto` | Stefany | `feat/grpc-productos` |
| MS Pedidos — cliente gRPC para tomar `nombre`/`precio` reales | Mateo | `feat/grpc-rabbitmq-pedidos` |
| MS Pedidos — publisher RabbitMQ `pedido.creado.rabbitmq` | Mateo | `feat/grpc-rabbitmq-pedidos` |
| MS Inventario — consumer RabbitMQ (`@EventPattern`) | Mateo | `feat/rabbitmq-inventario` |
| Manejo de excepciones: error gRPC controlado (producto inexistente → 422) | Mateo (cliente) + Stefany (servidor `RpcException`) | `feat/grpc-rabbitmq-pedidos`, `feat/grpc-productos` |
| Evidencias: llamada gRPC exitosa, error controlado, evento RabbitMQ consumido | Stefany | `docs/avance2` |
| Tabla comparativa de transportes + diagrama v2 | Stefany | `docs/avance2` |
| README sección Avance 2 (contrato, flujos, excepciones) | Stefany | `docs/avance2` |
| Tag `v2-avance2` | Marcos (release) | sobre `main` |

## Tablero Markdown sugerido al cierre del Avance 2

| Backlog | Por hacer | En progreso | En revisión | Hecho |
|---|---|---|---|---|
| (Avance 3: JWT+Guard real) | — | — | — | Contrato `productos.proto` |
| (Avance 3: Sentry) | — | — | — | RabbitMQ en Compose + variables |
| (Avance 3: integración total) | — | — | — | Servidor gRPC (MS Productos) |
| — | — | — | — | Cliente gRPC (MS Pedidos) |
| — | — | — | — | Publisher RabbitMQ (MS Pedidos) |
| — | — | — | — | Consumer RabbitMQ (MS Inventario) |
| — | — | — | — | Error gRPC controlado (422) |
| — | — | — | — | Evidencias + README v2 + tag |

> Al cerrar el corte se sube una captura del tablero a `docs/avance2-evidencias/` y se enlaza en el
> README (lo hace Stefany en `docs/avance2`).

## Cómo se conecta con GitHub Flow

- `main` protegida; cada tarjeta se trabaja en su rama `feat/…`, `chore/…`, `docs/…`.
- Cada rama se integra a `main` mediante **Pull Request** revisado por otro integrante.
- Un **tag por avance**: `v2-avance2` tras fusionar todo (detalle en [`04-plan-de-commits.md`](04-plan-de-commits.md)).
