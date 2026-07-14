# Análisis de latencia y acoplamiento temporal — Avance 1 (criterio C2)

## Tabla de latencias (200 peticiones, `benchmark.js`)

| Camino | Transporte | Promedio (ms) | p95 (ms) | Máx (ms) | Errores |
|---|---|---:|---:|---:|---:|
| Síncrono | TCP encadenado | **103.76** | 105.00 | 162.00 | 0 |
| Asíncrono | Redis pub/sub | **1.56** | 2.00 | 65.00 | 0 |

Fuente: `docs/avance1-benchmark-sync.txt`, `docs/avance1-benchmark-async.txt`.

## Por qué se ACUMULA la latencia en el camino síncrono

`GET /api/benchmark/sync` recorre **Gateway → (TCP) → MS Pedidos → (TCP) → MS Inventario**,
y cada salto **espera (`await`)** la respuesta del siguiente antes de continuar. El tiempo total
es la **suma** de los tramos, no el máximo:

```
delay Pedidos (BENCHMARK_PEDIDOS_DELAY_MS = 40)
+ delay Inventario (BENCHMARK_INVENTARIO_DELAY_MS = 60)
+ costo de dos saltos TCP inter-proceso
≈ 100 ms  →  medido: 103.76 ms de promedio
```

El promedio de **103.76 ms** coincide con la suma de los retardos artificiales (40 + 60) más el
sobrecosto de comunicación entre procesos. La conclusión empírica: **cada dependencia síncrona
adicional añade su latencia a la cadena**; con N saltos, los tiempos se acumulan linealmente.

## Por qué el camino asíncrono es ~66× más rápido en responder

`GET /api/benchmark/async` publica un evento en Redis (`emit('pedido.creado.async')`) y responde
**apenas el broker acepta el mensaje**, sin esperar a que MS Inventario lo procese. El consumidor
(`@EventPattern`) trabaja **después**, por su cuenta (con su propio `BENCHMARK_ASYNC_DELAY_MS = 120`,
que **no** cuenta para el tiempo de respuesta del emisor). Por eso el promedio cae a **1.56 ms**:
solo se mide el tiempo de publicar, no el de procesar.

## Qué es el ACOPLAMIENTO TEMPORAL (prueba de caída)

**Acoplamiento temporal** = todos los servicios de una cadena deben estar **vivos al mismo tiempo**
para que la operación tenga éxito. Se demostró apagando **MS Inventario** con el resto activo
(evidencia: `docs/avance1-caida-servicio.txt`):

- **Camino síncrono → FALLA.** `curl .../benchmark/sync` responde:
  ```json
  { "message": "Camino síncrono no disponible: MS Pedidos o MS Inventario no respondió",
    "error": "Service Unavailable", "statusCode": 503 }
  ```
  Falla porque Gateway, Pedidos e Inventario deben coexistir para completar la cadena.

- **Camino asíncrono → SE ACEPTA igual.** `curl .../benchmark/async` responde `"aceptado": true`
  con `duracionMs ≈ 1`, **aunque el consumidor esté caído**: el evento queda en el broker y se
  procesará cuando MS Inventario vuelva. El emisor **no** depende temporalmente del consumidor.

## Conclusión (para el README y la defensa)

El modelo **síncrono** ofrece respuesta inmediata y consistencia fuerte, pero **acumula latencia**
con cada salto y crea **acoplamiento temporal** (un servicio caído aguas abajo tumba toda la
petición → 503). El modelo **asíncrono por eventos** **desacopla en el tiempo** al emisor del
consumidor: responde en ~1.5 ms y **tolera la caída** del consumidor, a cambio de consistencia
eventual (el trabajo se completa después). No es que uno sea "mejor": resuelven necesidades
distintas, y el proyecto lo demuestra **con datos reales**, no con teoría.
