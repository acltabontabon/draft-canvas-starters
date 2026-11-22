import { scheme, type Pack } from '../kit';

/**
 * Professional: Draft Canvas's own drawings, set for a document. Flat, quiet slate and navy, plain
 * connectors with a plain head. It has no drawings of its own: the built-in shapes are the look.
 */
export const professional: Pack = {
  id: 'professional',
  name: 'Professional',
  summary: 'Flat and quiet in slate and navy, for documents and slides',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 10,
  style: {
    hand: { base: 'clean' },
    general: { shadow: false },
    connectors: { head: 'triangle', colour: 'plain' },
    schemes: {
      light: scheme(
        { canvas: '#f7f8fa', grid: '#e3e6eb', text: '#16202e', textMuted: '#55606f', edge: '#6b7686', edgeText: '#55606f', edgeLabelBg: '#ffffff', codeBg: '#eef0f4', codeBorder: '#dde1e7' },
        {
          neutral: ['#ffffff', '#6b7686', '#16202e', '#4a5565'],
          teal: ['#eef6f5', '#3a7f78', '#184640', '#2f6f68'],
          blue: ['#edf3fa', '#3f6ea0', '#1b3a5e', '#2f5f92'],
          violet: ['#f1eff9', '#6659a0', '#33295f', '#574a90'],
          amber: ['#f9f4e8', '#96762f', '#55400f', '#846526'],
          rose: ['#f9eff0', '#a1626c', '#5e2a33', '#8c4f59'],
          green: ['#eff5ee', '#4f7f4a', '#254623', '#426f3d'],
        },
      ),
      dark: scheme(
        { canvas: '#12161d', grid: '#232a34', text: '#e6eaf0', textMuted: '#9aa5b4', edge: '#7d8898', edgeText: '#aab4c2', edgeLabelBg: '#1a2029', codeBg: '#171c24', codeBorder: '#2a323d' },
        {
          neutral: ['#1b212b', '#7d8898', '#e6eaf0', '#aab4c2'],
          teal: ['#16282a', '#4fa89f', '#cfeeea', '#6fc0b7'],
          blue: ['#17263a', '#5f93cc', '#d4e5f8', '#80ade0'],
          violet: ['#221f3a', '#8f82cf', '#e1dcf8', '#a99de0'],
          amber: ['#2c2616', '#c2a05a', '#f4e7c6', '#d6b877'],
          rose: ['#2f1c20', '#c98793', '#f6dade', '#dba2ac'],
          green: ['#1a2a1b', '#6faa68', '#d6efd3', '#8cc285'],
        },
      ),
    },
  },
};
