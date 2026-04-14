#!/usr/bin/env node
// ═══════════════════════════════════════════════════════
// assemble_flow.js
// Assembliert alle einzelnen Node-Dateien zu einem
// vollstaendigen n8n Flow JSON.
//
// Ausfuehrung: node assemble_flow.js
// Ausgabe: assembled_flow.json
// ═══════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const NODES_DIR = path.join(__dirname, 'nodes');
const CONNECTIONS_FILE = path.join(__dirname, 'connections.json');
const METADATA_FILE = path.join(__dirname, 'flow_metadata.json');
const OUTPUT_FILE = path.join(__dirname, 'assembled_flow.json');

// Lade alle Node-Dateien in sortierter Reihenfolge
const nodeFiles = fs.readdirSync(NODES_DIR)
  .filter(f => f.endsWith('.json'))
  .sort();

console.log('Gefundene Node-Dateien:');
nodeFiles.forEach(f => console.log('  -', f));

const nodes = nodeFiles.map(f => {
  const filePath = path.join(NODES_DIR, f);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`  Geladen: ${f} -> "${content.name}"`);
  return content;
});

// Lade Connections
const connections = JSON.parse(fs.readFileSync(CONNECTIONS_FILE, 'utf-8'));
console.log('\nConnections geladen.');

// Lade Metadata
const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
console.log('Metadata geladen:', metadata.name);

// Assembliere den Flow
const flow = {
  name: metadata.name,
  nodes: nodes,
  pinData: {},
  connections: connections,
  active: metadata.active || false,
  settings: metadata.settings || {
    executionOrder: 'v1',
    binaryMode: 'separate'
  },
  tags: metadata.tags || []
};

// Schreibe den assemblierten Flow
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(flow, null, 2), 'utf-8');
console.log(`\nFlow assembliert und gespeichert: ${OUTPUT_FILE}`);
console.log(`  Nodes: ${nodes.length}`);
console.log(`  Connections: ${Object.keys(connections).length}`);
