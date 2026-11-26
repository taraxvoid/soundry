/**
 * Progressive enhancement for a Netlify form: submit via fetch, report the
 * result in the form's `.signup-message`, and reset on success. Without JS
 * the form still posts to Netlify normally.
 */
export function bindNetlifyForm(
    form: HTMLFormElement,
    text: { pending: string; success: string },
) {
    const button = form.querySelector<HTMLButtonElement>(
        'button[type="submit"]',
    )
    const message = form.querySelector<HTMLElement>('.signup-message')
    if (!button || !message) return

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const idleText = button.textContent
        button.disabled = true
        button.textContent = text.pending
        message.className = 'signup-message'

        try {
            const fields = Array.from(new FormData(form), ([key, value]) => [
                key,
                String(value),
            ])
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(fields),
            })
            if (!response.ok) {
                throw new Error(`Form submission failed: ${response.status}`)
            }
            message.className = 'signup-message success'
            message.textContent = text.success
            form.reset()
        } catch {
            message.className = 'signup-message error'
            message.textContent = '✗ An error occurred. Please try again.'
        } finally {
            button.disabled = false
            button.textContent = idleText
        }
    })
}
