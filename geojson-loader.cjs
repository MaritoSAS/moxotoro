/** Turbopack loader: treat GeoJSON files as ESM JSON modules. */
module.exports = function geojsonLoader(source) {
  return `const data = ${source};\nexport default data;\n`;
};
