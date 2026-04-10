// Load and render events from the events.yml data file
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Fetch the events data
    const response = await fetch('/events.json');
    const data = await response.json();
    const events = data.events || [];

    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;

    if (events.length === 0) {
      eventsList.innerHTML = '<div class="col-span-2 text-center text-gray-500 italic py-8">No upcoming events scheduled yet. Check back soon!</div>';
      return;
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Render each event
    eventsList.innerHTML = events.map(event => `
      <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-xl font-bold text-gray-900">${escapeHtml(event.title)}</h3>
          <span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">
            ${formatDate(event.date)}
          </span>
        </div>
        
        <div class="space-y-2 text-gray-700 mb-4">
          ${event.time ? `<div><strong>⏰ Time:</strong> ${escapeHtml(event.time)}</div>` : ''}
          ${event.location ? `<div><strong>📍 Location:</strong> ${escapeHtml(event.location)}</div>` : ''}
        </div>

        ${event.description ? `<p class="text-gray-600 mb-4">${escapeHtml(event.description)}</p>` : ''}

        ${event.rsvp_link ? `
          <a href="${escapeHtml(event.rsvp_link)}" target="_blank" rel="noopener noreferrer" class="inline-block text-blue-600 hover:text-blue-700 font-semibold">
            Learn More / RSVP →
          </a>
        ` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.warn('Could not load events:', error);
    const eventsList = document.getElementById('events-list');
    if (eventsList) {
      eventsList.innerHTML = '<div class="col-span-2 text-center text-gray-500 italic py-8">Events loading...</div>';
    }
  }
});

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}