# TriageGraph — Deck (AlgoFest 2026)

> 8 slides. Pensado para 3 minutos. Las notas debajo de cada slide son lo que dirías en voz alta.

---

## Slide 1 — Title

**TriageGraph**
Un agente de triage que le da a una enfermera en una clínica pública la misma capacidad de priorización que el jefe de urgencias del Hospital ABC.

Roberto Llanos · AlgoFest 2026 · HealthTech + AI/ML + Open

> *Notas:* "Hola, soy Roberto. TriageGraph es un agente que decide a quién atender primero en una sala de urgencias, y lo hace razonando en vivo."

---

## Slide 2 — El problema

- **60 millones de mexicanos** dependen de clínicas públicas sin médico de urgencias.
- Sin protocolo de triage → atención por **orden de llegada**.
- Resultado: pacientes críticos esperan junto a recetas administrativas.
- ESI (Emergency Severity Index) resuelve esto en EE.UU., pero **requiere entrenamiento clínico**.

> *Notas:* "El triage es la decisión más importante de un servicio de urgencias y es justo la que se hace sin sistema. ESI existe pero requiere meses de capacitación."

---

## Slide 3 — La solución en una frase

> Una enfermera describe al paciente. Claude Sonnet 4.6 lo clasifica ESI 1-5 razonando paso a paso. Un grafo de prioridad recalcula los tiempos de espera de todos los demás pacientes al instante.

> *Notas:* "Lo único que la enfermera hace es describir al paciente. El modelo razona y el grafo se reorganiza."

---

## Slide 4 — Demo (el wow moment)

**Lo que vas a ver en el video:**

1. Sala con 10 pacientes en espera.
2. Llega Sr. Hernández, dolor torácico irradiado.
3. Sonnet 4.6 razona en pantalla, token por token.
4. Sr. Hernández aparece en el grafo como **ESI 2 (urgente)**.
5. Los pacientes que comparten médico/ECG/sala de IV con él recalculan su espera: **+12 min**.
6. La cola se reordena en vivo.

> *Notas:* "Esto es lo que importa: la decisión se ve, se justifica, y los efectos son inmediatos."

---

## Slide 5 — Algoritmo

**Clasificación**
Claude Sonnet 4.6 con system prompt cacheado (prompt caching de Anthropic — cada paciente nuevo solo paga sus tokens de input).

**Programador de prioridad**
Por cada recurso (médico, ECG, TAC, rayos X, laboratorio, sala de trauma, sala IV, consultorio) hay una cola ordenada por **(ESI asc, llegada asc)**.

El tiempo de espera de un paciente es el `max` sobre los recursos que necesita — el **camino crítico**, no la suma.

`O(N · R + R · K log K)` donde N = pacientes, R = recursos.

**Grafo**
Arista entre dos pacientes si comparten al menos un recurso.

> *Notas:* "El algoritmo es un graph scheduler real, no un wrapper de GPT. Cada componente es testeable y determinista; el modelo solo hace la parte ambigua: traducir lenguaje natural a una etiqueta clínica."

---

## Slide 6 — Arquitectura

```
┌─────────────────────────────────────────────────┐
│ Browser (Next.js 16 / Turbopack)                │
│                                                 │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ TriageGraph  │  │ PriorityQueue            │ │
│  │ (canvas D3)  │  │ (framer-motion reorder)  │ │
│  └──────┬───────┘  └──────────────┬───────────┘ │
│         └──── Stage state (React)─┘             │
│                       │                         │
│                  SSE  ▼                         │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│ POST /api/triage/classify                       │
│  ├─ zod validation                              │
│  ├─ Anthropic SDK (Sonnet 4.6 stream)           │
│  └─ system prompt with cache_control            │
└─────────────────────────────────────────────────┘
```

> *Notas:* "Edge-deployable. Sin DB. El estado vive en el cliente para que el demo no tenga latencia de red para nada que no sea el LLM."

---

## Slide 7 — Por qué AlgoFest

- ✅ **Algoritmo de optimización real** (scheduler de recursos, no un wrapper).
- ✅ **HealthTech con impacto medible** (puerta-a-doctor en clínicas públicas).
- ✅ **Demo visual** (el grafo cambia frente al juez).
- ✅ **Open source + deployable en Railway** (`railway up` y corre).
- ✅ **Fallback determinista** — la app no se cae si Anthropic se cae.

> *Notas:* "Marca todas las cajas del brief de AlgoFest: lógica computacional, optimización, escalabilidad, eficiencia, y un caso de uso real."

---

## Slide 8 — Próximos pasos

- Entrada por voz (Web Speech API + ElevenLabs TTS).
- Persistencia + métricas reales (tiempo puerta-a-doctor).
- Multi-clínica con auth.
- Validación con personal del IMSS o Salud CDMX.

**Demo live:** `https://triagegraph.up.railway.app`
**Código:** `github.com/beto-llanos/triagegraph`
**Autor:** Roberto Llanos · [@beto-llanos](https://github.com/beto-llanos)

> *Notas:* "Gracias. Pueden abrir la URL ahora mismo y agregar un paciente."
