import { readFileSync, writeFileSync } from 'fs';

// Create a minimal 48x48 PNG favicon from the logo colors (cyan/indigo "CV" mark)
// This is a valid 48x48 PNG with the CineVerse brand colors
import { createCanvas } from 'canvas';

// Fallback: generate a simple branded favicon as a base64 PNG
// We'll use a node script approach instead

const svg = readFileSync('public/favicon.svg', 'utf-8');

// Write an HTML file that will render the SVG to canvas and output PNG
const html = `<!DOCTYPE html><html><body><canvas id="c" width="48" height="48"></canvas></body></html>`;

console.log('Use sharp instead');
