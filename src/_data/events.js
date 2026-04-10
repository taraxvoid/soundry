const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');

module.exports = function() {
  try {
    const filePath = path.join(__dirname, 'events.yml');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = YAML.load(fileContents);
    return data || { events: [] };
  } catch (error) {
    console.error('Error loading events.yml:', error);
    return { events: [] };
  }
};
