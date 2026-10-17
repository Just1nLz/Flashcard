export function parseCards(text) {
  if (!text.trim()) throw new Error('Paste or select some cards first.');
  let cards;
  if (/^[\[{]/.test(text.trim())) {
    const data = JSON.parse(text);
    cards = Array.isArray(data) ? data : data.cards;
    if (!Array.isArray(cards)) throw new Error('JSON must contain a cards array.');
  } else {
    cards = text.split(/\r?\n/).filter(line => line.trim()).map((line, index) => {
      const separator = line.includes('\t') ? '\t' : '::';
      const split = line.indexOf(separator);
      if (split < 0) throw new Error(`Line ${index + 1} needs a tab or :: between term and definition.`);
      return {term: line.slice(0, split), definition: line.slice(split + separator.length)};
    });
  }
  if (!cards.length) throw new Error('The collection has no cards.');
  return cards.map((card, index) => {
    if (typeof card.term !== 'string' || typeof card.definition !== 'string' || !card.term.trim() || !card.definition.trim()) throw new Error(`Card ${index + 1} needs both a term and a definition.`);
    return {term:card.term.trim(),definition:card.definition.trim()};
  });
}
