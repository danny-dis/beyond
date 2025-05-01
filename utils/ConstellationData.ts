/**
 * Data structures and sample data for constellation visualization
 */

/**
 * Represents a line connecting two stars in a constellation
 */
export interface ConstellationLine {
  startStarId: string;
  endStarId: string;
}

/**
 * Represents a constellation with its lines and metadata
 */
export interface Constellation {
  id: string;
  name: string;
  lines: ConstellationLine[];
  description?: string;
}

/**
 * Sample constellation data
 * Star IDs correspond to the IDs in the SAMPLE_STARS array in StarRenderer.tsx
 */
export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'UMA',
    name: 'Ursa Major (Big Dipper)',
    description: 'Also known as the Big Dipper or the Plough, this is one of the most recognizable patterns in the northern sky.',
    lines: [
      // Using the actual star IDs from the SAMPLE_STARS array
      { startStarId: '4', endStarId: '15' },  // Arcturus to Spica
      { startStarId: '15', endStarId: '16' }, // Spica to Antares
      { startStarId: '16', endStarId: '12' }, // Antares to Altair
      { startStarId: '12', endStarId: '5' },  // Altair to Vega
      { startStarId: '5', endStarId: '19' },  // Vega to Deneb
    ]
  },
  {
    id: 'ORI',
    name: 'Orion',
    description: 'One of the most recognizable constellations, representing the Hunter from Greek mythology.',
    lines: [
      { startStarId: '7', endStarId: '10' },  // Rigel to Betelgeuse
      { startStarId: '10', endStarId: '14' }, // Betelgeuse to Aldebaran
      { startStarId: '14', endStarId: '6' },  // Aldebaran to Capella
      { startStarId: '6', endStarId: '17' },  // Capella to Pollux
      { startStarId: '17', endStarId: '8' },  // Pollux to Procyon
      { startStarId: '8', endStarId: '1' },   // Procyon to Sirius
      { startStarId: '1', endStarId: '7' },   // Sirius to Rigel
    ]
  },
  {
    id: 'CRU',
    name: 'Southern Cross',
    description: 'A small but distinctive constellation visible in the southern hemisphere.',
    lines: [
      { startStarId: '13', endStarId: '20' }, // Acrux to Mimosa
      { startStarId: '20', endStarId: '11' }, // Mimosa to Hadar
      { startStarId: '11', endStarId: '3' },  // Hadar to Rigil Kentaurus
      { startStarId: '3', endStarId: '9' },   // Rigil Kentaurus to Achernar
      { startStarId: '9', endStarId: '2' },   // Achernar to Canopus
    ]
  }
];
