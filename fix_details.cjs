const fs = require('fs');
let content = fs.readFileSync('src/pages/PropertyDetails.jsx', 'utf8');

content = content.replace(
  "value: new Date(p.listed).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })",
  "value: p.listed ? new Date(p.listed).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'"
);

content = content.replace(
  "value: `${p.rating} / 5 (${p.reviews} reviews)`",
  "value: p.rating ? `${p.rating} / 5 (${p.reviews} reviews)` : 'No ratings yet'"
);

content = content.replace(
  "const specs    = buildSpecs(property)",
  "const specs    = buildSpecs({ ...property, listed, rating, reviews, type })"
);

content = content.replace(
  /\{status\}/g,
  '{displayStatus}'
);

fs.writeFileSync('src/pages/PropertyDetails.jsx', content);
console.log('PropertyDetails updated');
