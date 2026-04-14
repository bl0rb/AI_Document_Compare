# AI_Document_Compare

Generischer n8n-Flow zum Vergleich von Versicherungsbedingungen (AVB) gegen Mitbewerber-Dokumente via RAG (Retrieval Augmented Generation).

## Überblick

Dieses Repository enthält einen n8n-Workflow, der **Hard Facts** aus eigenen Versicherungsprodukten systematisch gegen Mitbewerber-Dokumente prüft. Der Prozess ist **generisch** aufgebaut und kann auf verschiedene Mitbewerber-Dokumente angewendet werden.

### Ergebnis

Am Ende des Flows wird eine **Report-Tabelle** mit folgenden Spalten erzeugt:

| Nr | Kategorie | Aspekt | Eigenes Unternehmen | Mitbewerber (RAG) | Mitbewerber (Benchmark) | Bewertung |
|----|-----------|--------|--------------------|--------------------|------------------------|-----------|

Zusätzlich wird eine **Executive Summary** mit Gesamtbewertung, Vor-/Nachteilen und Handlungsempfehlungen generiert.

## Projektstruktur

```
├── n8n_Flow.json                          # Originaler spezifischer Flow (HMR vs ERV)
├── comparison_flow/
│   ├── nodes/                             # Einzelne Node-Dateien
│   │   ├── 00_manual_trigger.json         # Manueller Start-Trigger
│   │   ├── 01_config_parameters.json      # Konfiguration (Firma, Mitbewerber, API)
│   │   ├── 02_own_facts_and_queries.json  # Eigene Hard Facts + RAG-Queries
│   │   ├── 03_loop_over_items.json        # Schleife über alle Fakten
│   │   ├── 04_build_rag_request.json      # RAG-Request aufbauen
│   │   ├── 05_rag_retrieve.json           # RAG-Abfrage an Mitbewerber-Collection
│   │   ├── 06_parse_rag_build_llm_request.json  # RAG parsen + LLM-Vergleich bauen
│   │   ├── 07_llm_fact_comparison.json    # LLM-Vergleich pro Fakt
│   │   ├── 08_parse_comparison_result.json # Vergleichsergebnis parsen
│   │   ├── 09_build_synthesis_request.json # Gesamtvergleich-Request bauen
│   │   ├── 10_llm_overall_comparison.json  # LLM-Gesamtvergleich
│   │   ├── 11_parse_overall_comparison.json # Gesamtvergleich parsen
│   │   ├── 12_build_report_table.json     # Report-Tabelle erstellen
│   │   └── 13_final_report_output.json    # Finaler Report-Output
│   ├── connections.json                   # Node-Verbindungen
│   ├── flow_metadata.json                 # Flow-Metadaten (Name, Tags, Settings)
│   ├── assemble_flow.js                   # Script zum Assemblieren des Flows
│   └── assembled_flow.json               # Assemblierter, importierbarer Flow
```

## Anpassung für einen neuen Mitbewerber

### Schritt 1: Konfiguration anpassen

In `comparison_flow/nodes/01_config_parameters.json` die Parameter anpassen:

```javascript
// --- Eigene Firma ---
const OWN_COMPANY_NAME = 'HanseMerkur';
const OWN_COMPANY_SHORT = 'HMR';
const OWN_PRODUCT_NAME = 'Seminar-Ruecktrittsversicherung';

// --- Mitbewerber ---
const COMPETITOR_NAME = 'ERGO Reiseversicherung';   // <-- ANPASSEN
const COMPETITOR_SHORT = 'ERV';                       // <-- ANPASSEN
const COMPETITOR_PRODUCT_NAME = 'Seminar-Versicherung'; // <-- ANPASSEN

// --- RAG Collection ID des Mitbewerbers ---
const COMPETITOR_RAG_COLLECTION = '32c26a09-...';     // <-- ANPASSEN

// --- API / LLM Einstellungen ---
const API_BASE_URL = 'https://aihubtest.hanse-merkur.de';
const LLM_MODEL = 'qwen3:30b-a3b-instruct-2507-q8_0';
```

### Schritt 2: Hard Facts anpassen (optional)

In `comparison_flow/nodes/02_own_facts_and_queries.json` können die zu vergleichenden Fakten angepasst werden. Jeder Fakt hat folgende Struktur:

```javascript
{
  id: 1,
  kategorie: 'Produktuebersicht',
  aspekt: 'Produktname und Versicherungssparten',
  own_data: 'Eigene Regelung hier...',
  rag_query: 'Frage an die Mitbewerber-AVB...',
  benchmark_competitor: 'Optionaler Referenzwert zum Abgleich'
}
```

### Schritt 3: Flow assemblieren

```bash
cd comparison_flow
node assemble_flow.js
```

### Schritt 4: In n8n importieren

Die Datei `comparison_flow/assembled_flow.json` in n8n importieren.

**Wichtig:** Die HTTP-Request-Nodes (05, 07, 10) verwenden n8n Credentials (`httpHeaderAuth`). Nach dem Import müssen die Credentials in n8n konfiguriert werden.

## Flow-Ablauf

```
Manual Trigger
  → 01 Config Parameters (Generische Einstellungen)
  → 02 Eigene Fakten + RAG Queries (Hard Facts definieren)
  → 03 Loop Over Items
    ┌─→ 04 Build RAG Request
    │   → 05 RAG Retrieve Mitbewerber AVB
    │   → 06 Parse RAG + Build LLM Request
    │   → 07 LLM Fakt-Vergleich
    │   → 08 Parse Vergleichsergebnis
    └─← (zurück zur Schleife)
  → 09 Build Synthese-Request (alle Ergebnisse sammeln)
  → 10 LLM Gesamtvergleich
  → 11 Parse Gesamtvergleich
  → 12 Build Report Table (strukturierte Tabelle)
  → 13 Final Report Output (Markdown-Report + Tabelle)
```

## Originaler Flow

Die Datei `n8n_Flow.json` enthält den ursprünglichen, spezifischen Flow für den Vergleich HanseMerkur vs. ERGO Seminarversicherung. Dieser dient als Referenz.