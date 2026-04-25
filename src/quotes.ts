// Closing quotes shown after the final exhale of each session.
// Curated to center Black women, women of color, Indigenous voices,
// men of color, and ancient/spiritual wisdom traditions — verified
// attributions where possible. (User-edited list, equity-skill vetted.)
export type Quote = {
  text: string;
  author: string;
};

export const QUOTES: Quote[] = [
  // Black women
  { text: 'Caring for myself is not self-indulgence, it is self-preservation.', author: 'Audre Lorde' },
  { text: 'If you surrendered to the air, you could ride it.', author: 'Toni Morrison' },
  { text: 'Each of us has that right, that possibility, to invent ourselves daily.', author: 'Maya Angelou' },
  { text: 'All that you touch you change. All that you change changes you.', author: 'Octavia E. Butler' },
  { text: 'Rarely, if ever, are any of us healed in isolation. Healing is an act of communion.', author: 'bell hooks' },
  { text: 'Rest is care. Rest is resistance. Rest is reparations.', author: 'Tricia Hersey' },
  { text: 'won’t you celebrate with me what I have shaped into a kind of life?', author: 'Lucille Clifton' },
  { text: 'Let me wear the day well so when it reaches you, you will enjoy it.', author: 'Sonia Sanchez' },
  { text: 'I am here to behold what is beautiful.', author: 'Cole Arthur Riley' },

  // Indigenous women & women of color
  { text: 'Remember the earth whose skin you are.', author: 'Joy Harjo' },
  { text: 'All flourishing is mutual.', author: 'Robin Wall Kimmerer' },
  { text: 'I change myself, I change the world.', author: 'Gloria Anzaldúa' },
  { text: 'Trust your body. It has not forgotten where it comes from.', author: 'Nayyirah Waheed' },

  // Men of color
  { text: 'The body is where we live. It is where we fear, hope, and react.', author: 'Resmaa Menakem' },
  { text: 'There is something in every one of you that waits and listens for the sound of the genuine in yourself.', author: 'Howard Thurman' },
  { text: 'Not everything that is faced can be changed, but nothing can be changed until it is faced.', author: 'James Baldwin' },
  { text: 'If there is no struggle, there is no progress.', author: 'Frederick Douglass' },
  { text: 'The times are urgent; let us slow down.', author: 'Bayo Akomolafe' },
  { text: 'When you heal yourself, you create an environment that allows others to heal themselves.', author: 'Yung Pueblo' },
  { text: 'Your daily life is your temple and your religion.', author: 'Khalil Gibran' },
  { text: 'The most authentic thing about us is our capacity to create, to overcome, to endure, to transform, to love.', author: 'Ben Okri' },

  // Ancient & spiritual wisdom
  { text: 'The Tao does nothing, yet leaves nothing undone.', author: 'Lao Tzu' },
  { text: 'Breathing in, I calm my body. Breathing out, I smile.', author: 'Thich Nhat Hanh' },
  { text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', author: 'Thich Nhat Hanh' },
  { text: 'Out beyond ideas of wrongdoing and rightdoing, there is a field. I will meet you there.', author: 'Rumi' },
  { text: 'When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.', author: 'Bhagavad Gita' },
  { text: 'Listen to the secret sound, the real sound, which is inside you.', author: 'Kabir' },
];

// Random pick at session start. Stateless — every session draws fresh from
// the full list. The list is short enough that occasional repeats are fine.
export function pickRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

// Replace the final space with a non-breaking space (U+00A0) so the last
// two words bind together. Combined with text-wrap: balance this prevents
// any single word from ending up orphaned on its own line.
const NBSP = String.fromCharCode(0x00a0);
export function preventWidow(text: string): string {
  const lastSpace = text.lastIndexOf(' ');
  if (lastSpace === -1) return text;
  return text.slice(0, lastSpace) + NBSP + text.slice(lastSpace + 1);
}
