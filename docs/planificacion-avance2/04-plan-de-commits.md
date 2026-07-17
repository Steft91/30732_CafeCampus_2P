# Plan de commits — Avance 2 (GitHub Flow, sobre el repositorio limpio)

> El código del Avance 2 ya existe en su estado final. Este plan **no edita código**: indica, en
> orden cronológico, qué archivos hace `git add` cada integrante y con qué mensaje semántico
> commitea, en qué rama, y en qué orden se fusiona a `main` **sin choques ni incoherencias**.
> Parte de un `main` que **ya contiene el Avance 1** (tag `v1-avance1`).
>
> ⚠️ Los commits los ejecuta **manualmente** cada integrante. Aquí no se automatiza nada.

## Regla de oro anti-conflictos

Un merge conflict ocurre solo cuando **dos ramas abiertas a la vez modifican el mismo archivo**.
Lo evitamos con **propiedad por directorio**: cada rama de Fase 1 vive en directorios disjuntos
(`ms-productos/`, `ms-pedidos/`, `ms-inventario/`). Los archivos compartidos —`docker-compose.yml`,
`proto/productos.proto` y `gateway/tsconfig.json`— los fija **completos** la Fase 0 (Marcos) y nadie
más los toca. `README.md` y `docs/` los toca solo Stefany en la Fase 2 (nunca en paralelo).

## Restricción de coherencia (por qué el bootstrap va al final de cada rama)

En este código, `main.ts` y `app.module.ts` **importan y activan** los transportes nuevos
(`connectMicroservice` gRPC/RMQ, `EventosModule`). Por eso, en cada rama, el commit que toca
`main.ts` / `app.module.ts` va **de último**, y el que agrega dependencias (`package.json`) va
**de primero**: así cada rama **compila** en su tip después de *cada* merge.

**Dependencia entre fases:** las ramas de Fase 1 referencian el contrato `proto/productos.proto`
(rutas relativas en `ms-productos/src/main.ts` y `ms-pedidos/.../pedidos.service.ts`). Por eso la
Fase 0 que crea el `.proto` es **bloqueante** y se fusiona **antes** que cualquier rama de servicio.

---

## Orden global de ejecución

```
FASE 0  · Marcos · chore/grpc-rabbitmq-infra ───────────► merge a main   (PRIMERO, bloqueante)
          (contrato .proto + RabbitMQ en compose + tsconfig)
                                                          │
        ┌─────────────────────────────────────────────── ▼ (todos parten de main actualizado)
FASE 1  · Stefany feat/grpc-productos          ──┐
(paralela · Mateo   feat/grpc-rabbitmq-pedidos ──┤ dirs disjuntos → 0 conflictos → cualquier orden de merge
 sin      · Mateo   feat/rabbitmq-inventario   ──┘ (Mateo hace pedidos e inventario; sin dependencia de compilación entre sí)
 choques)
        └─────────────────────────────────────────────── ► merge a main (los 3)
                                                          │
FASE 2  · Stefany · docs/avance2 ───────────────────────► merge a main  ► git tag v2-avance2  (ÚLTIMO)
```

**Quién primero:** Marcos (Fase 0) → los tres en paralelo (Fase 1) → Stefany (Fase 2).
La Fase 2 va al final porque las evidencias (llamada gRPC, evento RabbitMQ, error controlado)
necesitan **todo el stack corriendo** (`docker compose up -d` con RabbitMQ incluido).

---

## FASE 0 — Fundación del Avance 2 · Marcos · rama `chore/grpc-rabbitmq-infra`

```bash
git checkout main && git pull
git checkout -b chore/grpc-rabbitmq-infra
```

| # | `git add` | Commit |
|---|---|---|
| 1 | `proto/productos.proto` | `chore(grpc): agregar contrato productos proto` |
| 2 | `docker-compose.yml` | `chore(compose): agregar rabbitmq y variables grpc` |
| 3 | `docker-compose.yml` | `fix(compose): montar contratos proto en servicios grpc` |
| 4 | `gateway/tsconfig.json` | `fix(tsconfig): quitar moduleResolution deprecado` |

```bash
# PR: chore/grpc-rabbitmq-infra -> main   (revisa: Stefany o Mateo)   ← se fusiona ANTES que todo
```

> Los commits 2 y 3 tocan el mismo archivo pero en pasos lógicos distintos (primero el broker y las
> variables, luego el montaje `./proto:/proto:ro` de los servicios gRPC). Pueden unirse en uno solo
> si el equipo prefiere un historial más compacto. El `.proto` queda **congelado** aquí.

---

## FASE 1 — Servicios (paralela)

### `feat/grpc-productos` · Stefany  *(servidor gRPC)*

```bash
git checkout main && git pull
git checkout -b feat/grpc-productos
```

| # | `git add` | Commit |
|---|---|---|
| 1 | `ms-productos/package.json ms-productos/package-lock.json ms-productos/tsconfig.json ms-productos/.env.example` | `chore(productos): agregar dependencias grpc y variables` |
| 2 | `ms-productos/src/modules/productos/controllers/productos-grpc.controller.ts ms-productos/src/modules/productos/productos.module.ts` | `feat(productos): exponer consulta de producto por grpc` |
| 3 | `ms-productos/src/main.ts` | `feat(productos): habilitar microservicio grpc en el bootstrap` |

```bash
# PR: feat/grpc-productos -> main   (revisa: Mateo)
```

> El commit 2 incluye el `RpcException(NOT_FOUND)` del servidor (mitad servidor del error
> controlado). `main.ts` (bootstrap gRPC) va **último** para que la rama compile en cada punto.

### `feat/grpc-rabbitmq-pedidos` · Mateo  *(cliente gRPC + publisher RabbitMQ)*

```bash
git checkout main && git pull
git checkout -b feat/grpc-rabbitmq-pedidos
```

| # | `git add` | Commit |
|---|---|---|
| 1 | `ms-pedidos/package.json ms-pedidos/package-lock.json ms-pedidos/tsconfig.json ms-pedidos/.env.example` | `chore(pedidos): agregar dependencias grpc/rabbitmq y variables` |
| 2 | `ms-pedidos/src/modules/pedidos/dto/pedido.dto.ts` | `refactor(pedidos): hacer opcionales nombre y precio del item (snapshot por grpc)` |
| 3 | `ms-pedidos/src/modules/pedidos/services/pedidos.service.ts` | `feat(pedidos): consultar productos por grpc al crear pedido` |
| 4 | `ms-pedidos/src/modules/pedidos/services/pedidos.service.ts` | `feat(rabbitmq): publicar evento de pedido creado` |

```bash
# PR: feat/grpc-rabbitmq-pedidos -> main   (revisa: Stefany)
```

> Los commits 3 y 4 tocan el mismo `pedidos.service.ts` pero son pasos lógicos separables: primero
> el cliente gRPC + `try/catch` que traduce el error a HTTP `422` (mitad cliente del error
> controlado), luego el publisher RabbitMQ *best-effort*. Pueden unirse si se prefiere.

### `feat/rabbitmq-inventario` · Mateo  *(consumer RabbitMQ)*

```bash
git checkout main && git pull
git checkout -b feat/rabbitmq-inventario
```

| # | `git add` | Commit |
|---|---|---|
| 1 | `ms-inventario/package.json ms-inventario/package-lock.json ms-inventario/tsconfig.json ms-inventario/.env.example` | `chore(inventario): agregar dependencias rabbitmq y variables` |
| 2 | `ms-inventario/src/modules/eventos/eventos.module.ts ms-inventario/src/modules/eventos/pedidos-rabbitmq.controller.ts` | `feat(inventario): consumir eventos de pedido desde rabbitmq` |
| 3 | `ms-inventario/src/prisma/seed.ts` | `fix(seed): permitir inicializar inventario en compose` |
| 4 | `ms-inventario/src/app.module.ts ms-inventario/src/main.ts` | `feat(inventario): registrar modulo de eventos y habilitar transporte rabbitmq` |

```bash
# PR: feat/rabbitmq-inventario -> main   (revisa: Marcos)
```

> `app.module.ts` (registra `EventosModule`) + `main.ts` (activa `Transport.RMQ`) van en el
> **último** commit: así el tip de la rama compila con el consumer ya presente.

> **Por qué las 3 ramas de Fase 1 no chocan:** cada una vive 100% dentro de su propio directorio
> (`ms-productos/`, `ms-pedidos/`, `ms-inventario/`). Se pueden fusionar en **cualquier orden**.
> Las dependencias (Pedidos llama a Productos por gRPC; Pedidos publica e Inventario consume por
> RabbitMQ) son de *runtime*, no de compilación, así que no imponen orden de merge. Mateo hace dos
> ramas: recomendable abrir el PR de `feat/rabbitmq-inventario` **antes** de probar el flujo real,
> ya que el consumer debe existir para evidenciar el evento consumido.

---

## FASE 2 — Documentación y evidencia · Stefany · rama `docs/avance2`  *(ÚLTIMA)*

Requiere el stack completo levantado (`docker compose up -d`, con RabbitMQ) para generar evidencias:

```bash
# Llamada gRPC exitosa + evento RabbitMQ (flujo real POST /api/pedidos)
node -e '...' # o curl al gateway; guardar salida en docs/avance2-evidencias/
# Error controlado: pedir un productoId inexistente y capturar el HTTP 422
# Logs del consumer: docker compose logs ms-inventario  (evento pedido.creado.rabbitmq)
```

```bash
git checkout main && git pull
git checkout -b docs/avance2
```

| # | `git add` | Commit |
|---|---|---|
| 1 | `docs/planificacion-avance2/` (los 4 `.md` + `arquitectura-avance2.puml/.png/.svg`) | `docs(avance2): planificar grpc rabbitmq y evidencias` |
| 2 | `docs/avance2-evidencias/pedidos-grpc-rabbitmq.txt docs/avance2-evidencias/flujo-pedido-grpc-rabbitmq.txt docs/avance2-evidencias/rabbitmq-inventario.txt docs/avance2-evidencias/avance2-rabbitmq-inventario-log.png` | `docs(avance2): agregar evidencias de grpc y rabbitmq` |
| 3 | `docs/avance2-evidencias/error-producto-inexistente-grpc.txt docs/avance2-evidencias/avance2-error-producto-inexistente-grpc.png` | `docs(avance2): agregar evidencia de error controlado grpc` |
| 4 | `TABLERO_KANBAN.md` | `docs(kanban): actualizar tablero con tarjetas del avance 2` |
| 5 | `README.md docs/README.md` | `docs(readme): documentar avance 2 con diagrama, tabla comparativa y excepciones` |

```bash
# PR: docs/avance2 -> main   (revisa: Marcos)
```

### Cierre del avance (tag) — Marcos

```bash
git checkout main && git pull
git tag -a v2-avance2 -m "Avance 2: gRPC (contrato) + RabbitMQ (segundo transporte) + manejo de excepciones"
git push origin v2-avance2
```

---

## Cobertura de archivos (verificado contra `git diff v1-avance1..HEAD`)

Todos los archivos modificados/creados del Avance 2 quedan asignados sin solaparse:

| Grupo | Archivos | Rama |
|---|---|---|
| Contrato + infra | `proto/productos.proto`, `docker-compose.yml`, `gateway/tsconfig.json` | `chore/grpc-rabbitmq-infra` |
| MS Productos | `ms-productos/**` (config, `main.ts`, `productos.module.ts`, `productos-grpc.controller.ts`) | `feat/grpc-productos` |
| MS Pedidos | `ms-pedidos/**` (config, `pedido.dto.ts`, `pedidos.service.ts`) | `feat/grpc-rabbitmq-pedidos` |
| MS Inventario | `ms-inventario/**` (config, `main.ts`, `app.module.ts`, `eventos/*`, `seed.ts`) | `feat/rabbitmq-inventario` |
| Docs + evidencias | `docs/planificacion-avance2/**`, `docs/avance2-evidencias/**`, `docs/README.md`, `README.md`, `TABLERO_KANBAN.md` | `docs/avance2` |

> Nota: la **reorganización de evidencias del Avance 1** (mover `docs/*.png`/`.txt` a
> `docs/avance1-evidencias/`) es un ajuste histórico ajeno al Avance 2; si el repositorio limpio ya
> migró el Avance 1 con las evidencias en su carpeta dedicada, **no hace falta ningún commit extra**.

## Checklist de verificación de coherencia

- [ ] Fase 0 (`.proto` + compose) fusionada **antes** de crear ramas de Fase 1.
- [ ] Cada quien crea su rama desde `main` **actualizado** (`git pull` antes de `checkout -b`).
- [ ] En cada rama, `package.json` (deps) va en el **primer** commit y `main.ts`/`app.module.ts` en el **último**.
- [ ] Ningún PR de Fase 1 toca archivos fuera de su directorio de servicio.
- [ ] `docs/avance2` se crea **después** de fusionar las 3 ramas de servicio.
- [ ] Evidencias generadas con el stack completo (RabbitMQ incluido) corriendo.
- [ ] Tag `v2-avance2` solo después de fusionar `docs/avance2`.
