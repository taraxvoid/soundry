// Netlify runs a function named `submission-created` after every verified
// Netlify Forms submission (no dashboard webhook needed). Email signups are
// forwarded to Buttondown; every other form is ignored here.
// Requires the BUTTONDOWN_API_KEY environment variable.

const SIGNUP_FORM = 'email-signup'
const BUTTONDOWN_URL = 'https://api.buttondown.com/v1/subscribers'

interface FunctionEvent {
    body: string | null
}

interface SubmissionPayload {
    payload?: {
        form_name?: string
        data?: Record<string, string | undefined>
    }
}

const respond = (statusCode: number, message: string) => ({
    statusCode,
    body: JSON.stringify({ message }),
})

export const handler = async (event: FunctionEvent) => {
    let submission: SubmissionPayload
    try {
        submission = JSON.parse(event.body ?? '')
    } catch {
        return respond(400, 'Invalid payload')
    }

    const { form_name: formName, data = {} } = submission.payload ?? {}
    if (formName !== SIGNUP_FORM) return respond(200, 'Ignored')

    // Bots fill the honeypot; pretend success so they do not retry.
    if (data['bot-field']) return respond(200, 'Ignored')

    const email = data.email?.trim()
    if (!email?.includes('@')) return respond(400, 'Invalid email address')

    const apiKey = process.env.BUTTONDOWN_API_KEY
    if (!apiKey) {
        console.error('Missing BUTTONDOWN_API_KEY environment variable')
        return respond(500, 'Configuration error')
    }

    try {
        const response = await fetch(BUTTONDOWN_URL, {
            method: 'POST',
            headers: {
                Authorization: `Token ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email_address: email,
                tags: ['website'],
                metadata: { source: 'soundryomaha.org' },
            }),
        })

        if (response.ok) return respond(200, 'Subscribed')

        const error = await response.json().catch(() => ({}))
        // Re-submitting an existing address is not a failure.
        if (error?.code === 'email_already_exists') {
            return respond(200, 'Already subscribed')
        }

        console.error('Buttondown API error:', response.status, error)
        return respond(response.status < 500 ? 400 : 502, 'Subscribe failed')
    } catch (error) {
        console.error('Subscription error:', error)
        return respond(502, 'Subscribe failed')
    }
}
