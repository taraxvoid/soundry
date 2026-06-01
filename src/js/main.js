// Load and render events from the events.yml data file
// Handle email signup form submission
document.addEventListener("DOMContentLoaded", async function () {
  // Load events
  try {
    const response = await fetch("/events.json");
    const data = await response.json();
    const events = data.events || [];

    const eventsList = document.getElementById("events-list");
    if (eventsList && events.length > 0) {
      // Sort events by date
      events.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Render each event
      eventsList.innerHTML = events
        .map((event) => {
          const icsFilename =
            event.title.toLowerCase().replace(/\s+/g, "-") + ".ics";
          const icsPath = `/events/${icsFilename}`;

          return `
        <wa-card>
          <h3 slot="header">${escapeHtml(event.title)}</h3>
          <div class="event-date-badge">${formatDate(event.date)}</div>
          
          <div class="event-details">
            ${event.time ? `<div><strong>⏰ Time:</strong> ${escapeHtml(event.time)}</div>` : ""}
            ${event.location ? `<div><strong>📍 Location:</strong> ${escapeHtml(event.location)}</div>` : ""}
          </div>

          ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ""}

          <div slot="footer" class="event-links">
            <a href="${icsPath}" download>
              📅 Add to Calendar
            </a>
            ${
              event.rsvp_link
                ? `
              <a href="${escapeHtml(event.rsvp_link)}" target="_blank" rel="noopener noreferrer">
                Learn More / RSVP
              </a>
            `
                : ""
            }
          </div>
        </wa-card>
      `;
        })
        .join("");
    } else if (eventsList && events.length === 0) {
      eventsList.innerHTML =
        '<div class="loading-state">No upcoming events scheduled yet. Check back soon!</div>';
    }
  } catch (error) {
    console.warn("Could not load events:", error);
    const eventsList = document.getElementById("events-list");
    if (eventsList) {
      eventsList.innerHTML =
        '<div class="loading-state">Events loading...</div>';
    }
  }

  // Handle email signup form with Netlify Forms
  const signupForm = document.querySelector('form[name="email-signup"]');
  if (signupForm) {
    signupForm.addEventListener("submit", handleEmailSignup);
  }

  // Highlight current nav link
  const navBtns = document.querySelectorAll(".main-nav wa-button");
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  navBtns.forEach((btn) => {
    const href = (btn.getAttribute("href") || "").replace(/\/$/, "") || "/";
    if (href === currentPath || (currentPath === "/" && href === "#home")) {
      btn.classList.add("active");
      btn.setAttribute("aria-current", "page");
    }
  });

  // Back to top button
  const backToTopButton = document.getElementById("backToTop");
  const header = document.querySelector("header");

  window.addEventListener("scroll", function () {
    const headerBottom = header.offsetHeight;
    if (window.scrollY > headerBottom) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  });

  backToTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});

async function handleEmailSignup(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector("#signup-submit");
  const messageDiv = form.querySelector("#signup-message");
  const email = form.querySelector('[name="email"]').value.trim();
  const name = form.querySelector('[name="name"]').value.trim();

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Subscribing...";
  messageDiv.classList.add("hidden");

  try {
    // Submit to Netlify Forms
    const formData = new FormData(form);

    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData),
    });

    if (response.ok) {
      // Success - show message and reset form
      messageDiv.classList.remove("hidden");
      messageDiv.classList.add("bg-green-100", "text-green-800");
      messageDiv.textContent = "✓ Successfully subscribed to our mailing list!";
      form.reset();
    } else {
      throw new Error("Form submission failed");
    }
  } catch (error) {
    console.error("Subscription error:", error);
    messageDiv.classList.remove("hidden");
    messageDiv.classList.add("bg-red-100", "text-red-800");
    messageDiv.textContent = "✗ An error occurred. Please try again.";
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function formatDate(dateString) {
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  };
  return new Date(dateString + "T00:00:00").toLocaleDateString(
    "en-US",
    options,
  );
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
