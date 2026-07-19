# Planificacion - Avance 3 Final

Documentacion de cierre para seguridad, observabilidad, integracion y defensa del sistema Cafe Campus.

## Objetivo

Cerrar el proyecto con evidencia de:

1. Autenticacion JWT desde el Gateway.
2. Autorizacion con Guards y roles.
3. Observabilidad con Sentry.
4. Flujo integrado entre microservicios y transportes.
5. README final, evidencias y tag `v3-final`.

## Alcance tecnico

| Requisito | Implementacion esperada |
|---|---|
| Login JWT | `POST /api/auth/login` valida usuario mock y emite token firmado. |
| 401 | Rutas protegidas sin token o con token invalido. |
| 403 | Token valido con rol insuficiente para la ruta. |
| Sentry | Captura de excepciones con contexto minimo de ruta, metodo y servicio. |
| Integracion final | Crear pedido desde Gateway: JWT -> Pedidos -> Productos gRPC -> RabbitMQ -> Inventario. |
| Compose final | `docker-compose.final.yml` con PostgreSQL, Redis, RabbitMQ, Gateway y microservicios. |

## Evidencias esperadas

Guardar en `docs/avance3-evidencias/`:

- `login-jwt.txt`
- `ruta-protegida-200.txt`
- `ruta-sin-token-401.txt`
- `ruta-rol-sin-permiso-403.txt`
- `flujo-integrado-final.txt`
- `sentry-error-capturado.png`
- capturas equivalentes en `.png` si se requiere evidencia visual.

## Commits sugeridos

```text
docs(avance3): planificar cierre final
chore(compose): agregar compose final con jwt y sentry
feat(auth): reforzar expiracion jwt configurable
feat(sentry): capturar excepciones en gateway
docs(avance3): agregar evidencias de seguridad observabilidad e integracion
docs(readme): consolidar entrega final y defensa
chore(release): crear tag v3-final
```
