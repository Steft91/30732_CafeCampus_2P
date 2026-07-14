# Cafe Campus

> MVP de arquitectura de microservicios para una cafeteria universitaria.

## Equipo

| Integrante | Rol | GitHub |
|---|---|---|
| Stefy | Backend / Arquitectura | @Steft91 |
| Por definir | Transportes / gRPC | - |
| Por definir | Seguridad / Observabilidad | - |
| Por definir | Documentacion / QA | - |

## Descripcion del MVP

Cafe Campus permite administrar el catalogo de productos, registrar pedidos de estudiantes y controlar el inventario de la cafeteria. El dominio se mantiene sencillo para centrar la entrega en comunicacion entre microservicios, evidencia de latencia, acoplamiento temporal y documentacion del proceso.

- **MS Productos:** administra catalogo, categorias, precios y disponibilidad.
- **MS Pedidos:** registra pedidos, calcula totales y coordina validacion/descuento de stock.
- **MS Inventario:** controla existencias, movimientos de entrada/salida y alertas de bajo stock.
- **API Gateway:** punto unico de entrada HTTP, autenticacion JWT y proxy hacia servicios internos.

## Stack

- **Framework:** NestJS + TypeScript.
- **Persistencia:** PostgreSQL con schemas separados.
- **ORM:** Prisma.
- **Sincorno Avance 1:** TCP con `@nestjs/microservices`.
- **Asincrono Avance 1:** Redis PUB/SUB con `@nestjs/microservices`.
- **Seguridad base:** JWT + Guards por rol en Gateway.
- **Contenedores:** Docker Compose.

> Nota: la guia menciona TypeORM como referencia de clase. Este proyecto conserva Prisma porque ya estaba integrado y cumple el rol de ORM para PostgreSQL.

## Como ejecutar

### Opcion A: Docker Compose

```bash
docker compose up -d
docker compose ps
```

Endpoints principales:

```bash
curl http://localhost:3000/api/benchmark/sync
curl http://localhost:3000/api/benchmark/async
```

### Opcion B: Local

Levantar PostgreSQL y Redis:

```bash
docker start postgres-dev
docker run -d --name cafe-campus-redis -p 6379:6379 redis:7-alpine
```

Luego levantar los servicios en terminales separadas:

```bash
cd ms-productos && npm run start:dev
cd ms-inventario && npm run start:dev
cd ms-pedidos && npm run start:dev
cd gateway && npm run start:dev
```

Orden recomendado:

1. `ms-productos`
2. `ms-inventario`
3. `ms-pedidos`
4. `gateway`

## Base de datos

Cada microservicio usa su propio schema dentro de PostgreSQL:

- `productos_schema`
- `pedidos_schema`
- `inventario_schema`

Ejemplo local usado durante desarrollo:

```env
DATABASE_URL="postgresql://stefy:1234@localhost:5432/coffee?schema=productos_schema"
```

Ejecutar migraciones:

```bash
cd ms-productos
npx prisma migrate dev --schema src/prisma/schema.prisma
npm run seed

cd ../ms-pedidos
npx prisma migrate dev --schema src/prisma/schema.prisma

cd ../ms-inventario
npx prisma migrate dev --schema src/prisma/schema.prisma
npm run seed
```

## Arquitectura Avance 1

### Camino sincrono TCP

```mermaid
sequenceDiagram
    participant Cliente
    participant Gateway
    participant Pedidos as MS Pedidos
    participant Inventario as MS Inventario

    Cliente->>Gateway: GET /api/benchmark/sync
    Gateway->>Pedidos: TCP benchmark.sync
    Pedidos->>Inventario: TCP benchmark.stock-check
    Inventario-->>Pedidos: stock validado
    Pedidos-->>Gateway: respuesta encadenada
    Gateway-->>Cliente: resultado
```

Este camino evidencia acumulacion de latencia porque el Gateway espera a Pedidos, y Pedidos espera a Inventario.

### Camino asincrono Redis

```mermaid
sequenceDiagram
    participant Cliente
    participant Gateway
    participant Redis
    participant Inventario as MS Inventario

    Cliente->>Gateway: GET /api/benchmark/async
    Gateway->>Redis: publish pedido.creado.async
    Gateway-->>Cliente: aceptado
    Redis-->>Inventario: evento
    Inventario->>Inventario: procesa sin bloquear al Gateway
```

Este camino evidencia desacoplamiento temporal: el Gateway no espera el procesamiento del consumidor.

## Patrones y principios aplicados

- **API Gateway:** centraliza entrada HTTP, seguridad y ruteo.
- **Proxy:** el Gateway reenvia peticiones hacia microservicios internos.
- **Publisher/Subscriber:** Redis permite publicar eventos sin esperar al consumidor.
- **DTO + ValidationPipe:** separa validacion de entrada de la logica de negocio.
- **DIP / Inyeccion de dependencias:** servicios Nest reciben dependencias por constructor.
- **SRP:** cada microservicio tiene una responsabilidad principal.
- **Manejo de excepciones:** servicios controlan errores y devuelven respuestas HTTP consistentes.

## Avance 1 - Acoplamiento temporal y latencia

### Endpoints de evidencia

| Camino | Endpoint | Transporte |
|---|---|---|
| Sincrono | `GET /api/benchmark/sync` | TCP |
| Asincrono | `GET /api/benchmark/async` | Redis |

### Benchmark

```bash
node benchmark.js http://localhost:3000/api/benchmark/sync 200 > docs/avance1-benchmark-sync.txt
node benchmark.js http://localhost:3000/api/benchmark/async 200 > docs/avance1-benchmark-async.txt
```

| Camino | Promedio (ms) | p95 (ms) | Max (ms) |
|---|---:|---:|---:|
| Sincrono TCP | 103.76 | 105.00 | 162.00 |
| Asincrono Redis | 1.56 | 2.00 | 65.00 |

### Prueba de acoplamiento temporal

1. Levantar todos los servicios.
2. Ejecutar:

```bash
curl http://localhost:3000/api/benchmark/sync
```

3. Apagar `ms-inventario`.
4. Repetir el `curl`: el camino sincrono debe fallar porque Pedidos depende temporalmente de Inventario.
5. Con Redis activo, ejecutar:

```bash
curl http://localhost:3000/api/benchmark/async
```

El flujo asincrono debe aceptar la peticion aunque el consumidor no este procesando en ese momento.

Evidencia guardada en archivos de texto:

- `docs/avance1-benchmark-sync.txt`
- `docs/avance1-benchmark-async.txt`
- `docs/avance1-caida-servicio.txt`

Evidencia visual:

**Falla del camino sincrono al apagar MS Inventario**

![Falla del camino sincrono](docs/sync.png)

**Aceptacion del camino asincrono con Redis**

![Aceptacion del camino asincrono](docs/async.png)

### Analisis

En el camino sincrono las latencias se acumulan porque cada salto bloquea al anterior hasta recibir respuesta. En la medicion realizada, el endpoint TCP obtuvo un promedio de **103.76 ms**, coherente con la suma de los tiempos artificiales configurados en Pedidos e Inventario mas el costo de comunicacion entre procesos. Este modelo tambien produce acoplamiento temporal: al apagar MS Inventario, la peticion sincrona fallo con **503 Service Unavailable** porque Gateway, Pedidos e Inventario deben estar vivos al mismo tiempo para completar la operacion.

En el camino asincrono, el Gateway publica un evento en Redis y responde cuando el broker acepta el mensaje. El consumidor puede procesarlo despues, por eso el emisor no queda bloqueado por el tiempo de trabajo del consumidor. La medicion reflejo un promedio de **1.56 ms** y, al apagar MS Inventario, el endpoint asincrono siguio aceptando la peticion porque el Gateway no espera al consumidor.

## Metodologia

- **Kanban:** ver `TABLERO_KANBAN.md`.
- **Ramificacion:** GitHub Flow con `main`, ramas `feat/...`, `fix/...`, `docs/...`, `refactor/...`.
- **Commits semanticos:** Conventional Commits.

Captura del tablero del Avance 1:

![Tablero Kanban Avance 1](docs/avance1-kanban.png)

Ejemplos:

```bash
feat(tcp): agregar camino sincrono para benchmark
feat(redis): publicar evento asincrono de pedido
docs(readme): documentar avance 1
chore(compose): agregar redis al entorno de desarrollo
```

## Tags de entrega

- `v1-avance1` - pendiente
- `v2-avance2` - pendiente
- `v3-final` - pendiente
