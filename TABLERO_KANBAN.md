# Tablero Kanban - Cafe Campus

Columnas recomendadas en GitHub Projects:

`Backlog` -> `Por hacer` -> `En progreso` -> `En revision` -> `Hecho`

## Avance 1

- [x] Definir dominio del MVP: cafeteria universitaria.
- [x] Mantener 3 microservicios + Gateway.
- [x] Persistencia PostgreSQL con schemas separados.
- [x] Agregar camino sincrono TCP para benchmark.
- [x] Agregar camino asincrono Redis para benchmark.
- [x] Agregar script `benchmark.js`.
- [x] Ejecutar benchmark y guardar evidencia en `/docs`.
- [x] Probar caida de microservicio downstream y guardar evidencia.
- [ ] Crear tag `v1-avance1`.

## Avance 2

- [ ] Definir contrato gRPC entre dos microservicios.
- [ ] Agregar segundo transporte asincrono.
- [ ] Documentar comparacion de transportes.
- [ ] Crear tag `v2-avance2`.

## Avance 3

- [x] Login JWT base en Gateway.
- [x] Guards por rol en Gateway.
- [ ] Integrar Sentry.
- [ ] Documentar demo final.
- [ ] Crear tag `v3-final`.
