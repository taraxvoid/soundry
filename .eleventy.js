const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Function to generate iCalendar format for a single event
  const generateSingleEventICS = (event) => {
    const uid = event.title.toLowerCase().replace(/\s+/g, '-') + '@soundry.local';
    const date = event.date.replace(/-/g, '');
    const description = event.time && event.location 
      ? event.time + ' at ' + event.location
      : (event.description || '');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Soundry//Omaha Experimental Education//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:' + event.title,
      'X-WR-TIMEZONE:America/Chicago',
      'X-WR-CALDESC:' + event.title + ' - Soundry',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:' + date + 'T000000Z',
      'SUMMARY:' + event.title,
      'DESCRIPTION:' + description,
      ...(event.location ? ['LOCATION:' + event.location] : []),
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    return lines.join('\r\n');
  };

  // Hook to generate individual ICS files and events.json after build
  eleventyConfig.on('eleventy.after', async ({ dir, results }) => {
    try {
      const eventsPath = path.join(dir.input, '_data', 'events.yml');
      const fileContents = fs.readFileSync(eventsPath, 'utf8');
      const data = YAML.load(fileContents);
      const events = data.events || [];

      // Generate individual ICS files for each event
      events.forEach((event, index) => {
        const icsContent = generateSingleEventICS(event);
        const filename = event.title.toLowerCase().replace(/\s+/g, '-') + '.ics';
        const icsOutputPath = path.join(dir.output, 'events', filename);
        
        // Create events directory if it doesn't exist
        const eventsDir = path.join(dir.output, 'events');
        if (!fs.existsSync(eventsDir)) {
          fs.mkdirSync(eventsDir, { recursive: true });
        }
        
        fs.writeFileSync(icsOutputPath, icsContent);
        console.log(`[11ty] Generated events/${filename}`);
      });

      // Generate JSON file
      const jsonContent = JSON.stringify({ events }, null, 2);
      const jsonOutputPath = path.join(dir.output, 'events.json');
      fs.writeFileSync(jsonOutputPath, jsonContent);
      console.log('[11ty] Generated events.json');
    } catch (error) {
      console.error('[11ty] Error generating files:', error);
    }
  });

  // Pass through files
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/_data");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  // Watch for CSS changes
  eleventyConfig.setWatchThrottleWaitTime(100);

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    templateFormats: ["html", "md", "yml"],
  };
};
