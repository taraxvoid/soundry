const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Parse time string like "6:00 PM - 7:30 PM" to extract start and end times
  const parseEventTime = (timeStr) => {
    if (!timeStr) return { startTime: '180000', endTime: '190000' }; // Default 6-7 PM
    
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return { startTime: '180000', endTime: '190000' };
    
    const convertTo24Hr = (hour, minute, period) => {
      let h = parseInt(hour);
      if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
      if (period.toUpperCase() === 'AM' && h === 12) h = 0;
      return String(h).padStart(2, '0') + String(minute).padStart(2, '0') + '00';
    };
    
    return {
      startTime: convertTo24Hr(match[1], match[2], match[3]),
      endTime: convertTo24Hr(match[4], match[5], match[6])
    };
  };

  // Function to generate iCalendar format for a single event
  const generateSingleEventICS = (event) => {
    const uid = event.title.toLowerCase().replace(/\s+/g, '-') + '@soundry.local';
    const date = event.date.replace(/-/g, '');
    const { startTime, endTime } = parseEventTime(event.time);
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
      'DTSTART;TZID=America/Chicago:' + date + 'T' + startTime,
      'DTEND;TZID=America/Chicago:' + date + 'T' + endTime,
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
