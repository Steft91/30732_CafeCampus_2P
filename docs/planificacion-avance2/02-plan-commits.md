# Plan de commits — Avance 2

## Rama base

```bash
git checkout main
git pull
git checkout -b docs/avance2-plan
```

## Commits sugeridos

| Orden | Commit | Contenido |
|---:|---|---|
| 1 | `docs(avance2): planificar grpc rabbitmq y evidencias` | Documentos de planificación del Avance 2. |
| 2 | `chore(compose): agregar rabbitmq y variables grpc` | `docker-compose.yml`, `.env.example`. |
| 3 | `chore(grpc): agregar contrato productos proto` | `proto/productos.proto` o ruta compartida equivalente. |
| 4 | `feat(productos): exponer servicio grpc de productos` | Servidor gRPC en `ms-productos`. |
| 5 | `feat(pedidos): consultar productos por grpc al crear pedido` | Cliente gRPC y manejo de error en `ms-pedidos`. |
| 6 | `feat(rabbitmq): publicar evento de pedido creado` | Publisher RabbitMQ desde `ms-pedidos`. |
| 7 | `feat(inventario): consumir eventos de pedido desde rabbitmq` | Consumer RabbitMQ en `ms-inventario`. |
| 8 | `docs(avance2): documentar transportes errores y evidencias` | README, capturas, tabla comparativa y tag. |

## Reparto sugerido

| Integrante | Trabajo |
|---|---|
| Marcos | Compose, gateway si se requiere endpoint de prueba, integración general. |
| Mateo | gRPC en productos/pedidos y RabbitMQ consumer/publisher. |
| Stefany | Evidencias, README, tabla comparativa y validación de errores. |

## Cierre

```bash
git tag v2-avance2
git push origin v2-avance2
```
