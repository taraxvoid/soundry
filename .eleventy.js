const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Function to generate iCalendar format
  const generateICS = (events) => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Soundry//Omaha Experimental Education//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Soundry Events',
      'X-WR-TIMEZONE:America/Chicago',
      'X-WR-CALDESC:Upcoming events from Soundry - Omaha Experimental Education'
    ];

    if (events && Array.isArray(events)) {
      events.forEach(event => {
        const uid = event.title.toLowerCase().replace(/\s+/g, '-') + '@soundry.local';
        const date = event.date.replace(/-/g, '');
        const description = event.time && event.location 
          ? event.time + ' at ' + event.location
          : event.description || '';

        lines.push(
          'BEGIN:VEVENT',
          'UID:' + uid,
          'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
          'DTSTART:' + date + 'T000000Z',
          'SUMMARY:' + event.title,
          'DESCRIPTION:' + description,
          ...(event.location ? ['LOCATION:' + event.location] : []),
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'END:VEVENT'
        );
      });
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  // Hook to generate the ICS file after build
  eleventyConfig.on('eleventy.after', async ({ dir, results }) => {
    try {
      const eventsPath = path.join(dir.input, '_data', 'events.yml');
      const fileContents = fs.readFileSync(eventsPath, 'utf8');
      const data = YAML.load(fileContents);
      const events = data.events || [];

      const icsContent = generateICS(events);
      const outputPath = path.join(dir.output, 'calendar.ics');
      
      fs.writeFileSync(outputPath, icsContent);
      console.log('[11ty] Generated calendar.ics');
    } catch (error) {
      console.error('[11ty] Error generating calendar.ics:', error);
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
