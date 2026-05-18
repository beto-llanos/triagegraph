# TriageGraph

> Le da a una enfermera en una clínica pública la misma capacidad de priorización que el jefe de urgencias de un hospital privado.

TriageGraph es un agente de triage para clínicas y centros de salud públicos en México. Una enfermera o paramédico describe a un paciente; Claude Sonnet 4.6 clasifica al paciente en uno de los 5 niveles del **Emergency Severity Index (ESI)** razonando paso a paso en vivo, y un grafo de prioridad propaga los tiempos de espera de todos los demás pacientes según los recursos que comparten (médico, ECG, TAC, rayos X, laboratorio, sala de trauma, etc.).

Construido en 4 días para [**AlgoFest Hackathon 2026**](https://algofest.devpost.com).
Tracks: **HealthTech**, **AI/ML**, **Open Innovation**.

---

## Por qué importa

En México más de 60 millones de personas dependen de clínicas públicas o centros de salud comunitarios. La mayoría no tiene un médico de urgencias con años de experiencia haciendo triage: el personal disponible es enfermería o paramedicina. Sin un protocolo de priorización claro, los tiempos de espera se asignan por orden de llegada, y los pacientes críticos esperan junto a las consultas administrativas.

ESI es el protocolo de triage más usado en urgencias en EE.UU. (Agency for Healthcare Research and Quality), pero requiere entrenamiento. TriageGraph hace ese conocimiento disponible para cualquier clínica con un navegador.

## Lo que hace

- **Clasifica pacientes en vivo (ESI 1-5)** usando Claude Sonnet 4.6 con razonamiento visible token por token.
- **Propaga tiempos de espera en tiempo real**: cuando entra un paciente ESI-1, los demás pacientes que comparten recursos (médico, sala de trauma, ECG) recalculan su tiempo de espera al instante.
- **Visualiza la cola como un grafo**, donde cada arista significa "compite por el mismo recurso".
- **4 escenarios demo de un click** (paro cardiaco, dolor torácico, quemadura pediátrica, receta) pensados para demos en vivo.
- **Fallback determinista** (reglas + signos vitales) si la API de Claude no está disponible.

## Cómo funciona el algoritmo

### Clasificación ESI

El modelo recibe la queja principal del paciente, edad y signos vitales (opcionales), y devuelve:

1. Razonamiento clínico (2-3 oraciones, en español, streamed token por token).
2. Nivel ESI (1 = inmediato, 5 = administrativo).
3. Lista de recursos que el paciente necesitará.

El system prompt está cacheado con `cache_control: ephemeral` para que cada clasificación posterior solo facture los tokens del paciente nuevo.

### Programador de prioridad

Para cada recurso (`doctor`, `trauma_bay`, `ecg`, `ct_scan`, `xray`, `lab`, `iv_bay`, `consult_room`) se mantiene una cola ordenada por:

1. **ESI ascendente** (críticos primero).
2. **Tiempo de llegada ascendente** (FIFO dentro del mismo nivel).

El tiempo de espera estimado de un paciente es el `max` sobre todos los recursos que necesita, tomando el costo de los pacientes adelante en la cola dividido por la capacidad paralela del recurso. Esto refleja que la atención real se bloquea por el recurso más saturado (el camino crítico), no por la suma de todas las esperas.

Algoritmo: `O(N · R + R · K log K)` donde N = pacientes en espera, R = recursos, K = pacientes por recurso.

### Grafo

Los nodos son pacientes. Hay una arista entre dos pacientes si necesitan al menos un recurso en común. El render usa `react-force-graph-2d` (Canvas + simulación de fuerzas D3) con color por nivel ESI y tamaño inverso al nivel.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** estricto
- **Tailwind CSS 4**
- **Claude Sonnet 4.6** vía `@anthropic-ai/sdk` con streaming SSE y prompt caching
- **react-force-graph-2d** para la visualización
- **framer-motion** para las animaciones de reorden
- **zod** para validación de input

## Estructura del proyecto

```text
app/
  api/triage/classify/route.ts   ← POST: SSE stream Sonnet 4.6
  components/                    ← componentes UI (todos client-side)
  layout.tsx
  page.tsx                       ← carga el seed inicial
lib/
  claude.ts                      ← cliente Anthropic + system prompt + caching
  triage/
    types.ts                     ← Patient, Resource, ESILevel
    esi.ts                       ← clasificador de reglas (fallback)
    scheduler.ts                 ← propagación de tiempos de espera
    parse.ts                     ← parser del output del LLM
    client.ts                    ← consumidor SSE
    mock.ts                      ← 10 pacientes seed
    scenarios.ts                 ← escenarios demo
    colors.ts                    ← paleta por nivel ESI
```

## Setup local

```bash
git clone https://github.com/beto-llanos/triagegraph
cd triagegraph
npm install
cp .env.example .env.local
# pega tu ANTHROPIC_API_KEY en .env.local
npm run dev
```

Abre <http://localhost:3000>. Sin la API key la app sigue funcionando con el clasificador de reglas como fallback.

## Deploy a Railway

```bash
railway link
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway up
```

`railway.json` ya está configurado con `npm ci && npm run build` y `npm start`. La aplicación corre en cualquier región de Railway.

## Variables de entorno

| Nombre              | Requerida | Descripción                                      |
| ------------------- | --------- | ------------------------------------------------ |
| `ANTHROPIC_API_KEY` | Sí (LLM)  | API key de Anthropic. Sin ella se usa fallback.  |

## Demo y video

Para grabar el video oficial usa los botones de escenarios en la barra superior. Cada uno está calibrado para producir una clasificación específica:

| Botón                    | ESI esperado | Qué demuestra                                  |
| ------------------------ | ------------ | ---------------------------------------------- |
| Paro cardiaco            | 1            | Reordena agresivamente todos los demás.        |
| Dolor torácico irradiado | 2            | Agrega arista con ECG y disputa la sala de IV. |
| Quemadura pediátrica     | 3            | Pediátrico + dolor severo = sube de nivel.     |
| Receta de hipertensión   | 5            | Cae al fondo de la cola sin recursos.          |

## Roadmap

- [ ] Entrada por voz (Web Speech API + ElevenLabs TTS).
- [ ] Persistencia en Postgres / Neon.
- [ ] Modo multi-clínica con auth.
- [ ] Métricas de tiempo puerta-a-doctor.
- [ ] Soporte de protocolos alternativos (CTAS, Manchester).

## Licencia

MIT. Para uso clínico real se requiere validación con el personal médico responsable; este es un MVP de hackathon.

## Autor

**Roberto Llanos** ([beto-llanos](https://github.com/beto-llanos)) — indie builder, AI agents.
Construido para AlgoFest Hackathon 2026.
