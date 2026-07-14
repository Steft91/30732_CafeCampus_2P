# Plan de commits — Avance 1 (GitHub Flow, repositorio nuevo)

> El código ya existe en su estado final. Este plan **no edita código**: solo indica, en
> orden cronológico, qué archivos hace `git add` cada integrante y con qué mensaje semántico
> commitea, en qué rama, y en qué orden se fusiona a `main` **sin choques ni incoherencias**.
>
> ⚠️ Los commits los ejecuta **manualmente** cada integrante. Aquí no se automatiza nada.

## Dos únicas escrituras directas a `main`

`main` se escribe directamente **solo dos veces**, al principio y al final; todo lo demás entra por PR:

1. **Commit inicial** (Fase -1): único commit directo; crea la rama `main`. Sin un primer commit,
   `main` no existe y `git checkout -b …` no tiene de dónde ramificar. Se hace **antes** de proteger la rama.
2. **Tag `v1-avance1`** (cierre): no es un commit, es una etiqueta sobre `main` ya con todo fusionado.

## Regla de oro anti-conflictos

Un merge conflict ocurre solo cuando **dos ramas abiertas a la vez modifican el mismo archivo**.
Lo evitamos con **propiedad por directorio**: cada rama de Fase 1 vive en directorios disjuntos.
El único archivo compartido (`docker-compose.yml`) lo fija **completo** la Fase 0 y nadie más lo toca.
`README.md` nace como stub en el commit inicial de `main` y lo completa Stefany al final, pero
**nunca en paralelo**. `.gitignore` va en el commit inicial (antes que cualquier `git add` de código,
para no colar `node_modules/` ni `dist/`).

## Restricción de coherencia (por qué el bootstrap va al final de cada rama)

En este código, `main.ts` y `app.module.ts` **importan** los módulos de benchmark. Por eso, en
cada rama, el commit que agrega `main.ts` + `app.module.ts` va **de último**: así `main` compila
después de _cada_ merge (el tip de cada rama queda consistente).

---

## Orden global de ejecución

```
FASE -1 ─ Marcos ─ commit inicial DIRECTO a main ─────► crea main + protege la rama (ANTES de todo)
                                                          │
FASE 0  ─ Marcos ─ chore/setup-monorepo ──────────────► merge a main   (PRIMER PR, bloqueante)
                                                          │
        ┌─────────────────────────────────────────────── ┼ (todos parten de main actualizado)
FASE 1  │ Marcos   feat/gateway          ─┐
(paralela, │ Mateo    feat/ms-inventario ─┤ dirs disjuntos → 0 conflictos → cualquier orden de merge
 sin      │ Mateo    feat/ms-pedidos     ─┤ (Mateo: inventario ANTES que pedidos)
 choques) │ Stefany  feat/ms-productos   ─┘
        └─────────────────────────────────────────────── ► merge a main (los 4)
                                                          │
FASE 2  ─ Stefany ─ docs/avance1 ─────────────────────► merge a main  → git tag v1-avance1  (ÚLTIMO)
```

**Quién primero:** Marcos (commit inicial → Fase 0) → los tres en paralelo (Fase 1) → Stefany (Fase 2).
La Fase 2 va al final porque el benchmark y la prueba de caída necesitan **todo el stack corriendo**.

---

## FASE -1 — Commit inicial · Marcos · directo a `main`

Un repositorio recién creado **no tiene rama `main` hasta el primer commit**. Este paso la crea,
deja `.gitignore` activo desde el inicio y publica el README stub; recién **después** se activa la
protección de rama y todos pueden ramificar.

```bash
git init
git branch -M main
```

| #   | `git add`                | Commit                                                        |
| --- | ------------------------ | ------------------------------------------------------------ |
| 1   | `.gitignore README.md`   | `chore(repo): inicializar repositorio con gitignore y readme` |

```bash
git remote add origin git@github.com:<org>/cafe-campus.git
git push -u origin main
# En GitHub: Settings → Branches → proteger `main` (requerir PR + 1 review)  ← recién ahora
```

> `README.md` aquí es el **stub** (título + equipo + puertos). Stefany lo completa en la Fase 2.
> `.gitignore` va primero a propósito: evita que un `git add gateway/` posterior arrastre
> `node_modules/` o `dist/`. Opcional: incluir `CLAUDE.md` en el `.gitignore`.

---

## FASE 0 — Fundación · Marcos · rama `chore/setup-monorepo`

```bash
git checkout main && git pull
git checkout -b chore/setup-monorepo
```

| #   | `git add`            | Commit                                                           |
| --- | -------------------- | ---------------------------------------------------------------- |
| 1   | `docker-compose.yml` | `chore(compose): definir postgres, redis y los cuatro servicios` |
| 2   | `benchmark.js`       | `chore(benchmark): agregar script de medicion de latencia`       |
| 3   | `TABLERO_KANBAN.md`  | `docs(kanban): agregar tablero inicial del proyecto`             |

```bash
# PR: chore/setup-monorepo -> main   (revisa: Stefany o Mateo)   ← se fusiona ANTES que todo
```

> Nota: `docker-compose.yml` referencia servicios cuyo código aún no existe: es normal, es
> configuración declarativa (el "contrato" de infraestructura). Queda **congelado** aquí.

---

## FASE 1 — Servicios (paralela)

### `feat/gateway` · Marcos

```bash
git checkout main && git pull
git checkout -b feat/gateway
```

| #   | `git add`                                                                                                         | Commit                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `gateway/package.json gateway/package-lock.json gateway/tsconfig.json gateway/nest-cli.json gateway/.env.example` | `chore(gateway): inicializar configuracion del proyecto nestjs`               |
| 2   | `gateway/src/auth/ gateway/src/common/`                                                                           | `feat(gateway): agregar autenticacion jwt y guards por rol`                   |
| 3   | `gateway/src/modules/productos/`                                                                                  | `feat(gateway): agregar proxy http hacia ms-productos`                        |
| 4   | `gateway/src/modules/pedidos/`                                                                                    | `feat(gateway): agregar proxy http hacia ms-pedidos`                          |
| 5   | `gateway/src/modules/inventario/`                                                                                 | `feat(gateway): agregar proxy http hacia ms-inventario`                       |
| 6   | `gateway/src/modules/benchmark/`                                                                                  | `feat(benchmark): exponer endpoints sync (tcp) y async (redis) en el gateway` |
| 7   | `gateway/src/app.module.ts gateway/src/main.ts`                                                                   | `feat(gateway): registrar modulos y bootstrap http`                           |

```bash
# PR: feat/gateway -> main   (revisa: Stefany)
```

### `feat/ms-inventario` · Mateo _(hacer ANTES que pedidos)_

```bash
git checkout main && git pull
git checkout -b feat/ms-inventario
```

| #   | `git add`                                                                                                                                       | Commit                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `ms-inventario/package.json ms-inventario/package-lock.json ms-inventario/tsconfig.json ms-inventario/nest-cli.json ms-inventario/.env.example` | `chore(ms-inventario): inicializar configuracion del proyecto nestjs`           |
| 2   | `ms-inventario/src/prisma/`                                                                                                                     | `feat(ms-inventario): configurar prisma y esquema de stock`                     |
| 3   | `ms-inventario/src/modules/inventario/`                                                                                                         | `feat(ms-inventario): implementar crud de inventario con manejo de excepciones` |
| 4   | `ms-inventario/src/modules/benchmark/benchmark.tcp.controller.ts`                                                                               | `feat(tcp): agregar handler tcp de verificacion de stock`                       |
| 5   | `ms-inventario/src/modules/benchmark/benchmark.events.controller.ts ms-inventario/src/modules/benchmark/benchmark.module.ts`                    | `feat(redis): agregar consumidor asincrono de eventos de pedido`                |
| 6   | `ms-inventario/src/app.module.ts ms-inventario/src/main.ts`                                                                                     | `feat(ms-inventario): habilitar transportes tcp/redis y bootstrap`              |

```bash
# PR: feat/ms-inventario -> main   (revisa: Marcos)
```

### `feat/ms-pedidos` · Mateo _(después de inventario)_

```bash
git checkout main && git pull
git checkout -b feat/ms-pedidos
```

| #   | `git add`                                                                                                                        | Commit                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | `ms-pedidos/package.json ms-pedidos/package-lock.json ms-pedidos/tsconfig.json ms-pedidos/nest-cli.json ms-pedidos/.env.example` | `chore(ms-pedidos): inicializar configuracion del proyecto nestjs`             |
| 2   | `ms-pedidos/src/prisma/`                                                                                                         | `feat(ms-pedidos): configurar prisma y esquema de pedidos`                     |
| 3   | `ms-pedidos/src/modules/pedidos/`                                                                                                | `feat(ms-pedidos): implementar crud de pedidos y validacion de stock por http` |
| 4   | `ms-pedidos/src/modules/benchmark/`                                                                                              | `feat(tcp): agregar handler tcp encadenado hacia ms-inventario`                |
| 5   | `ms-pedidos/src/app.module.ts ms-pedidos/src/main.ts`                                                                            | `feat(ms-pedidos): habilitar transporte tcp y bootstrap`                       |

```bash
# PR: feat/ms-pedidos -> main   (revisa: Stefany)
```

### `feat/ms-productos` · Stefany

```bash
git checkout main && git pull
git checkout -b feat/ms-productos
```

| #   | `git add`                                                                                                                                  | Commit                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 1   | `ms-productos/package.json ms-productos/package-lock.json ms-productos/tsconfig.json ms-productos/nest-cli.json ms-productos/.env.example` | `chore(ms-productos): inicializar configuracion del proyecto nestjs`       |
| 2   | `ms-productos/src/prisma/`                                                                                                                 | `feat(ms-productos): configurar prisma, esquema de catalogo y seed`        |
| 3   | `ms-productos/src/modules/productos/`                                                                                                      | `feat(ms-productos): implementar crud de productos con validacion por dto` |
| 4   | `ms-productos/src/app.module.ts ms-productos/src/main.ts`                                                                                  | `feat(ms-productos): registrar modulos y bootstrap http`                   |

```bash
# PR: feat/ms-productos -> main   (revisa: Mateo)
```

> **Por qué las 4 ramas de Fase 1 no chocan:** cada una vive 100% dentro de su propio
> directorio (`gateway/`, `ms-inventario/`, `ms-pedidos/`, `ms-productos/`). Se pueden
> fusionar en **cualquier orden**. La única dependencia (Pedidos llama a Inventario) es de
> _runtime_, no de compilación, así que no impone orden de merge.

---

## FASE 2 — Documentación y evidencia · Stefany · rama `docs/avance1` _(ÚLTIMA)_

Requiere el stack completo levantado (`docker compose up -d`) para generar las mediciones:

```bash
node benchmark.js http://localhost:3000/api/benchmark/sync 200 > docs/avance1-benchmark-sync.txt
node benchmark.js http://localhost:3000/api/benchmark/async 200 > docs/avance1-benchmark-async.txt
```

```bash
git checkout main && git pull
git checkout -b docs/avance1
```

| #   | `git add`                                                          | Commit                                                              |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1   | `docs/avance1-benchmark-sync.txt docs/avance1-benchmark-async.txt` | `docs(avance1): documentar resultados de latencia sync/async`       |
| 2   | `docs/avance1-caida-servicio.txt`                                  | `docs(avance1): documentar prueba de acoplamiento temporal`         |
| 3   | `docs/sync.png docs/async.png docs/avance1-kanban.png`             | `docs(avance1): agregar capturas de evidencia`                      |
| 4   | `docs/planificacion-avance1/`                                      | `docs(avance1): agregar diagrama de arquitectura y planificacion`   |
| 5   | `README.md docs/README.md`                                         | `docs(readme): completar seccion avance 1 con analisis y evidencia` |

```bash
# PR: docs/avance1 -> main   (revisa: Marcos)
```

### Cierre del avance (tag) — Marcos

```bash
git checkout main && git pull
git tag -a v1-avance1 -m "Avance 1: acoplamiento temporal y latencia (sync vs async)"
git push origin v1-avance1
```

---

## Cobertura de archivos (verificado)

Todos los archivos rastreados del proyecto quedan asignados: `.gitignore` + `README.md` stub
(commit inicial en `main`), `docker-compose.yml` + `benchmark.js` + `TABLERO_KANBAN.md` (Fase 0),
`gateway/**` (rama gateway), `ms-inventario/**`, `ms-pedidos/**`, `ms-productos/**` (sus ramas),
`docs/**` + `README.md` final (`docs/avance1`). Ningún archivo del código queda fuera.

**Excepción intencional — `CLAUDE.md`:** es un archivo meta de instrucciones de la herramienta
Claude Code, **no** parte del entregable académico. **No se commitea** al repositorio nuevo
(opcionalmente, añadir `CLAUDE.md` a `.gitignore` en el commit inicial).

## Checklist de verificación de coherencia

- [ ] Commit inicial en `main` hecho **antes** de proteger la rama y de crear cualquier otra rama.
- [ ] Fase 0 fusionada **antes** de que nadie cree ramas de Fase 1.
- [ ] Cada quien crea su rama desde `main` **actualizado** (`git pull` antes de `checkout -b`).
- [ ] En cada rama, `app.module.ts` + `main.ts` van en el **último** commit.
- [ ] Ningún PR de Fase 1 toca archivos fuera de su directorio.
- [ ] `docs/avance1` se crea **después** de fusionar las 4 ramas de servicios.
- [ ] Tag `v1-avance1` solo después de fusionar `docs/avance1`.
