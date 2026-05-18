# Hand-off checklist — Roberto

Hoy es **18 de mayo 2026**. La submission cierra el **22 de mayo 3 pm CST** = 4 días. Esta lista es todo lo que falta para meter TriageGraph en Devpost. La he ordenado de más urgente / con mayor lead time a menos.

## 1. Anthropic API key (5 min) — bloqueante para todo lo demás

1. https://console.anthropic.com → Settings → API Keys → Create.
2. Guarda la key en gestor de contraseñas.
3. Crea `.env.local` en la raíz del repo:

   ```bash
   cp .env.example .env.local
   # edita .env.local y pega tu key real
   ```

4. Reinicia `npm run dev` (mata el server actual y vuelve a arrancarlo).
5. Prueba un escenario demo (botón "Dolor torácico irradiado"). Debes ver el razonamiento aparecer token por token. Si ves "Fallback (rule-based, LLM no disponible)" en el reasoning del paciente, la key no está configurada.

## 2. GitHub repo (10 min)

```bash
gh repo create beto-llanos/triagegraph --public --source=. --remote=origin --push
```

O manualmente:

1. https://github.com/new → nombre `triagegraph`, público, sin README (ya existe).
2. ```bash
   git remote add origin git@github.com:beto-llanos/triagegraph.git
   git push -u origin master
   ```

## 3. Deploy a Railway (15 min)

Tu cuenta de Railway ya tiene flow para deploys desde Git (lo usaste para personal-site y blueprint).

```bash
railway login
railway init                       # selecciona "Empty project"
railway up                         # primer deploy
railway variables --set ANTHROPIC_API_KEY=sk-ant-...
railway domain                     # asigna un dominio público
```

Anota el dominio público (algo como `triagegraph-production.up.railway.app`). Lo necesitas para el video y para el Devpost form.

**Test post-deploy:**

```bash
curl -s https://TU-DOMINIO/api/triage/classify -X POST \
  -H "Content-Type: application/json" \
  -d '{"chiefComplaint":"dolor torácico irradiado, 30 min","age":58}'
```

Debes ver eventos SSE con texto en español.

## 4. Video demo 2-5 min (30-45 min)

Stack que ya conoces: Loom, OBS, o Screen Studio.

**Storyboard sugerido (3 min):**

| Tiempo | Qué pasa                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------- |
| 0:00   | Logo / título. "Le da a una enfermera lo mismo que un jefe de urgencias."                     |
| 0:10   | El problema (slide 2 del deck). 20 seg.                                                       |
| 0:30   | Abre la URL deployada. Pausa para mostrar los 10 pacientes seed.                              |
| 0:45   | Hover sobre la cola para mostrar que el grafo se sincroniza con los nodos.                    |
| 1:00   | Click "Dolor torácico irradiado". Pausa mientras el razonamiento de Sonnet 4.6 aparece live.  |
| 1:30   | El paciente entra al grafo como ESI 2. Los wait times de los demás recalculan (zoom in).      |
| 1:55   | Click "Paro cardiaco". Más dramático: todo se reordena.                                       |
| 2:20   | Click "Receta de hipertensión". Cae al fondo. Punto: "el modelo entiende que esto no es urgente." |
| 2:35   | Cierre: slide 7 del deck (por qué AlgoFest) + URL.                                            |
| 2:55   | "Gracias."                                                                                    |

**Tips críticos** (de tu memory `feedback-hackathon-demo-latency`):
- Usa Sonnet 4.6 (ya está). NO cambies a Opus.
- Si la red está lenta, graba en el primer intento exitoso y no rehagas. Edita los re-shoots, no la latencia.
- Si la red falla por completo, el fallback rule-based hace el job — pero pierdes el "wow del razonamiento". Graba con buena red.

## 5. Devpost submission (15 min)

URL: https://algofest.devpost.com/

Form fields y qué pegar:

| Campo | Qué poner |
| ----- | --------- |
| Project Title | `TriageGraph — voice-ready ESI triage agent for public clinics` (sin la palabra "voice" si no acabas de meter la voz; pon "AI" en su lugar) |
| Description | Copia el primer párrafo del README. |
| Demo Video | URL de YouTube/Loom. Sube primero. |
| Presentation Deck | Convierte `DECK.md` a PDF (Marp, Pandoc, o copy-paste a Slides). |
| Source Code | `https://github.com/beto-llanos/triagegraph` |
| Live Demo Link | URL de Railway. |
| Technologies Used | `Next.js 16, TypeScript, Tailwind CSS 4, Claude Sonnet 4.6, Anthropic SDK, react-force-graph-2d, framer-motion, zod, Railway` |
| Tracks | **HealthTech** (primary), **AI/ML**, **Open Innovation** — sí, marca los 3 si Devpost lo permite. |
| Team | Solo: Roberto Llanos. |

## 6. Submit antes de la 1 pm CST del 22 mayo

Margen de 2 horas para problemas técnicos del form de Devpost. **No esperes a las 2:50 pm.**

---

## Decisiones que tomé por ti

- **Sin voz.** Web Speech API es flaky en demos en vivo y para hackathon ROI es bajo. El "wow" lo reemplacé con el razonamiento de Sonnet 4.6 streamed en pantalla. Si ganas y quieres la voz para producción, está en el roadmap del README.
- **Sin DB.** El estado vive en cliente. Para esta demo y este timeline no hay razón de meter Postgres. El roadmap lo menciona.
- **Sin auth.** Misma razón. Una clínica real lo necesita, pero un hackathon no.
- **Fallback rule-based.** Si Anthropic se cae o la key no está, el clasificador de reglas en `lib/triage/esi.ts` toma el control. Garantiza que el demo nunca se congela.
- **Tracks múltiples.** HealthTech como primario porque es donde está el premio temático más fácil de ganar, pero marca AI/ML y Open Innovation también. Multi-track gana grand prizes.

## Si algo se rompe

- **Página 500 en Railway:** `railway logs --service triagegraph`. Casi siempre es la API key mal pegada.
- **El razonamiento no aparece:** el fetch al endpoint `/api/triage/classify` está fallando. Inspector → Network → busca el evento SSE.
- **Tipos rotos después de cambiar algo:** `npm run build` o `npx tsc --noEmit` para ver el error real (el dev server de Next 16 a veces los oculta).

— Hecho. Mucho éxito, Beto.
