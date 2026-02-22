# Security Analysis - pix3lwiki

> Analisi eseguita il 2026-02-21. L'app può girare su Vercel o in un container Docker.
> Fix rapidi applicati il 2026-02-22 — tag rollback: `pre-security-fixes`

---

## CRITICO (da fixare subito)

### ✅ 1. Endpoint PUT mancante del controllo autore
**File:** `app/api/wiki/pages/[pageId]/route.ts`
**Fixato il 2026-02-22** — commit `213bc21`

Qualsiasi utente autenticato poteva modificare le pagine di chiunque altro. Il controllo `author_id !== auth.user.id` esisteva solo per DELETE, non per PUT.

**Fix applicato:**
```typescript
// Aggiunto nel handler PUT, prima di aggiornare:
if (existing.author_id !== auth.user.id && !auth.user.is_admin) {
  return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
}
```

---

### ✅ 2. Restore senza conferma
**File:** `app/api/admin/restore/route.ts`
**Fixato il 2026-02-22** — commit `189722b`

Un admin compromesso poteva cancellare tutto il database in un'unica chiamata API, senza nessuna conferma esplicita. L'operazione è irreversibile.

**Fix applicato:**
- Campo `confirm: "DELETE ALL DATA"` richiesto nel body (validato via `z.literal`)
- Audit logging server-side (chi, quando, esito)
- Dettagli errore interni rimossi dalla risposta al client

---

## ALTO

### 3. CSP troppo permissivo
**File:** `next.config.js` (righe 42-50)

`'unsafe-inline'` + `'unsafe-eval'` in `script-src` annullano la protezione XSS del CSP.

**Fix:** Rimuovere entrambe le direttive e usare nonce o `strict-dynamic` per gli script inline necessari.

---

### ✅ 4. Rate limiting fail-open
**File:** `lib/auth/rateLimit.ts`
**Fixato il 2026-02-22** — commit `889a929`

Durante downtime del DB, il brute force era possibile senza limitazioni.

**Fix applicato:** `return { allowed: true }` → `return { allowed: false, error: 'Service temporarily unavailable' }`.
> Nota: con DB irraggiungibile, il login è bloccato per tutti. Trade-off voluto: sicurezza > disponibilità.

---

### ⚠️ 5. Dipendenze vulnerabili
**File:** `package.json`
**Parzialmente mitigato il 2026-02-22** — commit `974d14f`

19 vulnerabilità HIGH in due catene distinte:

**A) Catena eslint → minimatch (solo dev, non impatta produzione)**
- CVE: ReDoS in `minimatch` + command injection in `glob`
- Fix richiede: `eslint` 8→10 (formato flat config, breaking) + `eslint-config-next` downgrade
- Impatto reale: zero su Vercel (non eseguito a runtime)
- ⏳ **Da fare**: branch dedicato `fix/security-eslint-upgrade` con test completi della build

**B) Next.js DoS**
- GHSA-9g9p-9gw9-jx7f: DoS via Image Optimizer remotePatterns — colpisce self-hosted (DigitalOcean), **non Vercel**
- GHSA-h25m-26qc-wcjf: HTTP request deserialization DoS con RSC insicuri

**Strategia consigliata:**

*Mitigazione immediata (basso rischio)* — rate limit Traefik su `/_next/image` in `pix3ltools-deploy`:
```yaml
- "traefik.http.middlewares.image-ratelimit.ratelimit.average=10"
- "traefik.http.middlewares.image-ratelimit.ratelimit.burst=30"
```
Limita l'abuso dell'Image Optimizer senza toccare il codice.

*Fix definitivo (Opzione A — upgrade 14→15)* — breaking change principale: `params` e `searchParams`
diventano Promise nei Server Components. Tutte le page che li usano vanno aggiornate con `await`.
- ⏳ **Da fare**: branch `fix/security-nextjs-15` — eseguire E2E completi prima del deploy su DO
- Versione target: `next@15.5.10` (prima versione fuori dalla finestra CVE)
- Riferimento: [Next.js 14→15 migration guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

---

## MEDIO

### 6. Cookie `secure` solo in production
**File:** `app/api/auth/login/route.ts` (riga 40)

```typescript
secure: process.env.NODE_ENV === 'production',
```

In ambienti development/staging il cookie viaggia in chiaro su HTTP.

**Fix:** `secure: true` sempre, oppure documentare esplicitamente che staging deve girare su HTTPS.

---

### 7. JWT scadenza 7 giorni
**File:** `lib/auth/auth.ts` (riga 38)

Token compromessi rimangono validi fino a 7 giorni. Non esiste meccanismo di revoca.

**Fix:** Ridurre a 1-2 ore + implementare refresh token con rotazione.

---

### 8. GET pages non filtra per status
**File:** `app/api/wiki/pages/route.ts` (righe 11-71)

Qualsiasi utente autenticato può enumerare tutte le pagine, incluse bozze e archiviate di altri autori.

**Fix:** Filtrare per status `published` per utenti normali; mostrare bozze solo all'autore o agli admin.

---

### 9. Export scarica tutto senza filtri
**File:** `app/api/admin/export/route.ts` (righe 5-29)

L'endpoint esporta tutto: bozze, versioni storiche, link cross-app. Solo il controllo admin lo protegge, ma non c'è granularità.

**Fix:** Documentare cosa viene esportato; valutare di escludere i dati più sensibili o aggiungere rate limiting sull'endpoint.

---

### ✅ 10. Campi `content` e `tags` senza maxLength nello schema Zod
**File:** `lib/validation/schemas.ts`
**Fixato il 2026-02-22** — commit `9582873`

Le costanti `MAX_CONTENT_LENGTH = 100000` e `MAX_TAG_LENGTH = 50` erano definite in `lib/constants.ts` ma non applicate nello schema di validazione.

**Fix applicato:**
```typescript
content: z.string().max(100000, 'Content too long'),
tags: z.array(z.string().max(50, 'Tag too long')).max(10, 'Too many tags'),
```

---

### ✅ 11. Docker: utente root + immagine base datata
**File:** `Dockerfile`
**Fixato il 2026-02-22** — commit `8e1fac2`

Il container girava come root e usava `node:18-alpine` (EOL).

**Fix applicato:** `node:20-alpine` in tutti gli stage, utente non-root `app` (uid 1000), `HEALTHCHECK` aggiunto.

---

## BASSO

### 12. dangerouslySetInnerHTML in layout
**File:** `app/layout.tsx` (righe 35-39)

Il pattern `window.__PIX3L_CONFIG__` usa `JSON.stringify` che protegge dai casi più comuni, ma le URL iniettate non vengono validate prima dell'iniezione.

**Fix:** Validare il formato URL prima di iniettarlo:
```typescript
const safeUrl = z.string().url().safeParse(process.env.PIX3LBOARD_URL || '');
const pix3lConfig = {
  pix3lboardUrl: safeUrl.success ? safeUrl.data : 'https://board.pix3ltools.com',
};
```

---

### 13. Errori non loggati server-side
**File:** Varie route API

```typescript
} catch {
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

Gli errori vengono ingoiati silenziosamente, rendendo difficile il debug e la risposta agli incidenti.

**Fix:** Aggiungere logging strutturato (es. `console.error`) con contesto (userId, operazione).

---

### 14. Dettagli errori esposti nel restore
**File:** `app/api/admin/restore/route.ts` (riga 133)

```typescript
{ error: 'Restore failed', details: err instanceof Error ? err.message : String(err) }
```

Espone messaggi di errore di sistema al client.

**Fix:** Loggare i dettagli solo server-side, restituire solo `{ error: 'Restore failed' }`.

---

## Rischi specifici del Dual Deployment (Vercel + Docker)

Questa sezione copre vulnerabilità che emergono dalla dualità della piattaforma o che si manifestano diversamente nei due ambienti.

---

### ⚠️ D1. Watchtower: auto-update senza approvazione
**Contesto:** Solo Docker
**Severità:** ALTO
**Nota:** configurazione VPS, non nel repo — da applicare manualmente sul server

Watchtower aggiorna i container ogni ora pullando automaticamente l'ultima immagine dal registry. Se l'account GitHub Actions o il registry venisse compromesso, un'immagine malevola verrebbe deployata automaticamente entro 60 minuti, senza nessuna approvazione umana.

**Fix da applicare sul VPS** (in `docker-compose.yml` o `docker-compose.override.yml`):
```yaml
watchtower:
  image: containrrr/watchtower
  environment:
    - WATCHTOWER_MONITOR_ONLY=true          # non aggiorna, solo notifica
    - WATCHTOWER_NOTIFICATION_EMAIL_TO=tua@email.com
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
```
Oppure, se vuoi aggiornamenti automatici ma sicuri, usa digest pinning nel compose:
```yaml
pix3lwiki:
  image: ghcr.io/pix3ltools/pix3lwiki@sha256:<digest>  # invece di :latest
```
Il digest si ricava dopo ogni build: `docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/pix3ltools/pix3lwiki:latest`

---

### D2. Gestione dei segreti asimmetrica tra le piattaforme
**Contesto:** Vercel vs Docker
**Severità:** MEDIO

Su **Vercel** i secret sono cifrati e gestiti dalla piattaforma, non accessibili al filesystem.
Su **Docker** i segreti vengono tipicamente passati via `.env` file o `docker-compose.override.yml`, entrambi in chiaro sul filesystem del server. Chiunque abbia accesso SSH al VPS può leggere `JWT_SECRET`, `TURSO_AUTH_TOKEN` e altri segreti con un semplice `cat`.

**Fix:**
- Su Docker, usare Docker Secrets (Swarm) o montare i segreti da un vault esterno (es. HashiCorp Vault, AWS Secrets Manager)
- Come misura minima, restringere i permessi del file: `chmod 600 .env docker-compose.override.yml`
- Aggiungere `.env` e `docker-compose.override.yml` nel monitoraggio di integrità del server (es. AIDE)

---

### D3. URL interne esposte nel client via `window.__PIX3L_CONFIG__`
**Contesto:** Principalmente Docker
**Severità:** MEDIO
**File:** `app/layout.tsx` (righe 28-39)

Su Vercel, `PIX3LBOARD_URL` è un URL pubblico (`https://board.pix3ltools.com`). Su Docker, potrebbe essere un indirizzo della rete interna (es. `http://pix3lboard:3000` o `http://192.168.1.x:3000`). Iniettare questi indirizzi in uno script pubblico client-side espone la topologia della rete privata a chiunque apra il sorgente della pagina.

**Fix:** Validare che l'URL iniettato sia sempre pubblico e HTTPS prima di esporlo:
```typescript
const rawUrl = process.env.PIX3LBOARD_URL || process.env.NEXT_PUBLIC_PIX3LBOARD_URL || 'https://board.pix3ltools.com';
const parsed = z.string().url().safeParse(rawUrl);
const pix3lboardUrl = (parsed.success && parsed.data.startsWith('https://'))
  ? parsed.data
  : 'https://board.pix3ltools.com';
```

---

### D4. `force-dynamic` assente o rimosso rompe il runtime config
**Contesto:** Entrambe le piattaforme
**Severità:** MEDIO
**File:** `app/layout.tsx`

Se `export const dynamic = 'force-dynamic'` venisse rimosso per errore, Next.js pre-renderebbe il layout staticamente al build time. Le URL iniettate in `window.__PIX3L_CONFIG__` verrebbero cristallizzate con i valori presenti al momento della build (spesso `localhost` o stringhe vuote), rendendo inutile l'intera meccanica di runtime config. Su Vercel questo causa link rotti; su Docker causa che tutti i client puntino a URL sbagliate.

Questo non è rilevabile facilmente in test, perché la pagina carica correttamente ma il cross-app linking è silenziosamente rotto.

**Fix:** Aggiungere un test di integrazione o uno smoke test post-deploy che verifichi che `window.__PIX3L_CONFIG__.pix3lboardUrl` non contenga `localhost`.

---

### D5. Rate limiting: comportamento diverso su Vercel serverless
**Contesto:** Vercel
**Severità:** BASSO (architettura già corretta, ma da documentare)

Su Vercel le API route girano come funzioni serverless stateless: ogni invocazione è un processo separato. Un rate limiting basato su memoria in-process non funzionerebbe perché ogni request potrebbe finire su una istanza diversa. Il rate limiting su DB (Turso) attualmente usato è la scelta corretta per questo motivo.

**Rischio:** Se in futuro qualcuno migrasse il rate limiting a una soluzione in-memory (es. `Map` locale) per semplicità, funzionerebbe in sviluppo e su Docker single-instance, ma sarebbe completamente bypassabile su Vercel.

**Fix:** Aggiungere un commento esplicito nel codice:
```typescript
// IMPORTANTE: il rate limiting deve essere persistito su DB (non in-memory)
// perché su Vercel ogni invocazione è stateless e non condivide memoria.
```

---

### D6. Protezione DDoS assente su Docker
**Contesto:** Solo Docker
**Severità:** BASSO

Su **Vercel** la protezione DDoS è integrata a livello di edge network. Su **Docker + Traefik**, il VPS è direttamente esposto: un attacco volumetrico o di tipo slowloris può saturare le risorse senza nessuna mitigazione automatica.

**Fix:**
- Configurare rate limiting a livello Traefik (middleware `rateLimit`)
- Usare fail2ban sul VPS per bloccare IP che generano troppi errori 4xx/5xx
- Valutare di mettere Cloudflare davanti all'IP del VPS (proxy mode)

---

### D7. HTTP → HTTPS redirect non garantito su Docker
**Contesto:** Solo Docker
**Severità:** MEDIO

Su Vercel il redirect HTTP→HTTPS è forzato dalla piattaforma. Su Docker dipende dalla configurazione Traefik generata da `setup-https.sh`. Se lo script non configura correttamente il redirect (o se Traefik viene aggiornato e la configurazione cambia), l'app potrebbe rispondere sia su HTTP che su HTTPS, esponendo cookie e JWT in chiaro.

**Fix:** Verificare che `docker-compose.override.yml` contenga il middleware di redirect:
```yaml
- "traefik.http.routers.pix3lwiki-http.middlewares=redirect-to-https"
- "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
- "traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true"
```
E aggiungere uno smoke test post-deploy: `curl -I http://<domain>` deve restituire `301` o `302`, non `200`.

---

### Riepilogo dual deployment

| Priorità | Problema | Piattaforma |
|---|---|---|
| 🟠 Alto | Watchtower auto-update senza approvazione | Docker |
| 🟡 Medio | Segreti in chiaro sul filesystem del VPS | Docker |
| 🟡 Medio | URL interne esposte in `window.__PIX3L_CONFIG__` | Docker |
| 🟡 Medio | `force-dynamic` critico e non testato | Entrambe |
| 🟡 Medio | HTTP→HTTPS redirect non garantito | Docker |
| 🟢 Basso | Rate limiting in-memory non funzionerebbe su Vercel | Vercel |
| 🟢 Basso | Nessuna protezione DDoS integrata | Docker |

---

## Riepilogo e priorità

| Priorità | Problema | File | Stato |
|---|---|---|---|
| 🔴 Critico | PUT senza controllo autore | `app/api/wiki/pages/[pageId]/route.ts` | ✅ fixato 2026-02-22 |
| 🔴 Critico | Restore senza conferma | `app/api/admin/restore/route.ts` | ✅ fixato 2026-02-22 |
| 🟠 Alto | CSP unsafe-inline + unsafe-eval | `next.config.js` | ⏳ da fare (rischioso, per ultimo) |
| 🟠 Alto | Rate limit fail-open | `lib/auth/rateLimit.ts` | ✅ fixato 2026-02-22 |
| 🟠 Alto | Dipendenze vulnerabili — eslint chain (dev only) | `package.json` | ⚠️ richiede eslint 8→10, branch dedicato |
| 🟠 Alto | Dipendenze vulnerabili — Next.js DoS CVE | `package.json` | ⚠️ richiede next 14→16, branch dedicato |
| 🟠 Alto | Watchtower auto-update (Docker VPS) | `docker-compose.yml` | ⚠️ configurazione manuale VPS |
| 🟡 Medio | Cookie secure solo in prod | `app/api/auth/login/route.ts` | ⏳ da fare |
| 🟡 Medio | JWT scadenza 7 giorni | `lib/auth/auth.ts` | ⏳ da fare |
| 🟡 Medio | GET pages senza filtro status | `app/api/wiki/pages/route.ts` | ⏳ da fare |
| 🟡 Medio | Export senza filtri | `app/api/admin/export/route.ts` | ⏳ da fare |
| 🟡 Medio | content/tags senza maxLength | `lib/validation/schemas.ts` | ✅ fixato 2026-02-22 |
| 🟡 Medio | Docker root + node:18 | `Dockerfile` | ✅ fixato 2026-02-22 |
| 🟢 Basso | dangerouslySetInnerHTML | `app/layout.tsx` | ⏳ da fare |
| 🟢 Basso | Errori non loggati | Varie route | ⏳ da fare |
| 🟢 Basso | Dettagli errori al client | `app/api/admin/restore/route.ts` | ✅ fixato 2026-02-22 |

---

## Fix rapidi ad alto impatto

✅ Tutti e 5 applicati il 2026-02-22 (tag rollback: `pre-security-fixes`)

1. ✅ **PUT wiki page** — controllo autore identico a DELETE
2. ✅ **Restore** — conferma esplicita `"DELETE ALL DATA"` + audit log
3. ✅ **Schemas.ts** — limiti applicati su content, tags, tag singolo
4. ✅ **Rate limit** — fail-closed su DB error
5. ✅ **Dockerfile** — `node:20-alpine` + utente non-root + HEALTHCHECK

---

## Strategia git per minimizzare le regressioni

> Nessun fix di sicurezza è privo di rischio. Questa sezione descrive come procedere in modo che ogni cambiamento sia reversibile in modo chirurgico.

### Regola base: un fix = un branch = un PR

Non raggruppare fix diversi nello stesso branch. Se qualcosa si rompe in produzione, il rollback deve essere isolato senza portarsi dietro altri cambiamenti.

### Prima di iniziare: tag dello stato attuale

```bash
git tag pre-security-fixes
git push origin pre-security-fixes
```

Questo permette di tornare allo stato esatto corrente in qualsiasi momento, anche dopo molti merge.

### Flusso per ogni fix

```bash
git checkout -b fix/security-<nome-fix>
# ... modifiche ...
git commit -m "fix(security): <descrizione>"
git push origin fix/security-<nome-fix>
# aprire PR, testare, mergare
```

### Rollback in caso di problemi in produzione

```bash
# Revert del commit specifico (preferibile: mantiene la storia)
git revert <commit-sha>

# Oppure, se il deploy è Docker, rollback immediato all'immagine precedente:
docker compose pull && docker compose up -d  # con il tag precedente
```

### Ordine consigliato (dal meno al più rischioso)

| Ordine | Fix | Rischio | Note |
|---|---|---|---|
| 1 | Controllo autore su PUT | Nessuno | Logica identica al DELETE già funzionante |
| 2 | Conferma su restore | Nessuno | Cambia solo il contratto dell'endpoint admin |
| 3 | `maxLength` su content/tags in schemas.ts | Nessuno | Aggiunge validazione, non rimuove funzionalità |
| 4 | Validazione URL in `window.__PIX3L_CONFIG__` | Basso | Ha fallback hardcoded sicuro |
| 5 | Rate limit fail-closed | Medio | Testare in staging: se il DB ha instabilità transitorie, gli utenti vengono bloccati |
| 6 | Docker: node:20-alpine + utente non-root | Medio | Testare su macchina di test: volumi con ownership root possono impedire la scrittura dei file |
| 7 | CSP: rimuovere `unsafe-inline` / `unsafe-eval` | Alto | Per ultimo, con ciclo di test dedicato. Può rompere hydration React, script inline, stili dinamici |

### Fix ad alto rischio: branch a vita lunga

Per il CSP hardening (punto 7), usare un branch dedicato con commit incrementali:

```bash
git checkout -b fix/security-csp-hardening
git commit -m "fix(csp): remove unsafe-eval from script-src"
git commit -m "fix(csp): add nonce support for inline scripts"
# testare ogni commit prima di procedere al successivo
```

### Cookie `secure: true` sempre

Questo fix rompe lo sviluppo locale su HTTP. Valutare se mantenerlo condizionale all'ambiente (`NODE_ENV`) oppure documentare che lo sviluppo locale richiede HTTPS (es. via `mkcert`).
