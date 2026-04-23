// Load and render events from the events.yml data file
// Handle email signup form submission
document.addEventListener('DOMContentLoaded', async function() {
  // Load events
  try {
    const response = await fetch('/events.json');
    const data = await response.json();
    const events = data.events || [];

    const eventsList = document.getElementById('events-list');
    if (eventsList && events.length > 0) {
      // Sort events by date
      events.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Render each event
      eventsList.innerHTML = events.map(event => {
        const icsFilename = event.title.toLowerCase().replace(/\s+/g, '-') + '.ics';
        const icsPath = `/events/${icsFilename}`;
        
        return `
        <div style="background: white; padding: 24px; border-radius: 8px; border-left: 4px solid #8B2C2C; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.3s; hover: {box-shadow: 0 4px 12px rgba(139,44,44,0.2)}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <h3 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0;">${escapeHtml(event.title)}</h3>
            <span style="font-size: 12px; background: #8B2C2C; color: white; padding: 4px 12px; border-radius: 4px; white-space: nowrap; margin-left: 8px;">
              ${formatDate(event.date)}
            </span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; color: #333;">
            ${event.time ? `<div><strong>⏰ Time:</strong> ${escapeHtml(event.time)}</div>` : ''}
            ${event.location ? `<div><strong>📍 Location:</strong> ${escapeHtml(event.location)}</div>` : ''}
          </div>

          ${event.description ? `<p style="color: #555; margin: 12px 0; line-height: 1.5;">${escapeHtml(event.description)}</p>` : ''}

          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px;">
            <a href="${icsPath}" download style="display: inline-block; color: #8B2C2C; font-weight: 600; text-decoration: underline; transition: all 0.3s; font-size: 14px;">
              📅 Add to Calendar
            </a>
            ${event.rsvp_link ? `
              <a href="${escapeHtml(event.rsvp_link)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; color: #8B2C2C; font-weight: 600; text-decoration: underline; transition: all 0.3s; font-size: 14px;">
                Learn More / RSVP →
              </a>
            ` : ''}
          </div>
        </div>
      `;
      }).join('');
    } else if (eventsList && events.length === 0) {
      eventsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; font-style: italic; padding: 32px 0;">No upcoming events scheduled yet. Check back soon!</div>';
    }
  } catch (error) {
    console.warn('Could not load events:', error);
    const eventsList = document.getElementById('events-list');
    if (eventsList) {
      eventsList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; font-style: italic; padding: 32px 0;">Events loading...</div>';
    }
  }

  // Handle email signup form
  const signupForm = document.getElementById('email-signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleEmailSignup);
  }
});

async function handleEmailSignup(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitBtn = form.querySelector('#signup-submit');
  const messageDiv = form.querySelector('#signup-message');
  const email = form.querySelector('[name="email"]').value.trim();
  const name = form.querySelector('[name="name"]').value.trim();

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Subscribing...';
  messageDiv.classList.add('hidden');

  try {
    // Call Netlify function
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('name', name);
    formData.append('_website', ''); // Honeypot

    const response = await fetch('/.netlify/functions/subscribe', {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = await response.json();

    if (response.ok) {
      // Success
      messageDiv.classList.remove('hidden');
      messageDiv.classList.add('bg-green-100', 'text-green-800');
      messageDiv.textContent = '✓ ' + result.message;
      form.reset();
    } else {
      // Error
      messageDiv.classList.remove('hidden');
      messageDiv.classList.add('bg-red-100', 'text-red-800');
      messageDiv.textContent = '✗ ' + (result.error || 'Failed to subscribe. Please try again.');
    }
  } catch (error) {
    console.error('Subscription error:', error);
    messageDiv.classList.remove('hidden');
    messageDiv.classList.add('bg-red-100', 'text-red-800');
    messageDiv.textContent = '✗ An error occurred. Please try again.';
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

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