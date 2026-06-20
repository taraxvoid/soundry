// Netlify Function: Handle email signup form submissions and add to Sendgrid
// Called by the email signup form in src/index.html
// Uses NETLIFY_EMAILS_PROVIDER_API_KEY environment variable (Sendgrid API key)

const handler = async (event) => {
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        }
    }

    try {
        // Parse form data
        const data = new URLSearchParams(event.body)
        const email = data.get('email')
        const name = data.get('name') || ''
        const honeypot = data.get('_website')

        // Validate email
        if (!email?.includes('@')) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email address' }),
            }
        }

        // Spam protection: honeypot field should be empty
        if (honeypot) {
            // Silently succeed to fool bots
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Successfully subscribed' }),
            }
        }

        // Get Sendgrid API key from environment
        const apiKey = process.env.NETLIFY_EMAILS_PROVIDER_API_KEY
        if (!apiKey) {
            console.error(
                'Missing NETLIFY_EMAILS_PROVIDER_API_KEY environment variable',
            )
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Configuration error' }),
            }
        }

        // Call Sendgrid API to add contact to marketing list
        // Using Sendgrid's Marketing Contacts API v3
        // Docs: https://docs.sendgrid.com/api-reference/contacts/add-or-update-a-contact
        const sendgridResponse = await fetch(
            'https://api.sendgrid.com/v3/marketing/contacts',
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contacts: [
                        {
                            email: email,
                            first_name: name.split(' ')[0] || '',
                            last_name: name.split(' ').slice(1).join(' ') || '',
                            custom_fields: {
                                // You can add custom fields here if needed
                                // e_1_T: 'true', // example: subscribed flag
                            },
                        },
                    ],
                }),
            },
        )

        // Check if request was successful
        if (!sendgridResponse.ok) {
            const errorData = await sendgridResponse.text()
            console.error(
                'Sendgrid API error:',
                sendgridResponse.status,
                errorData,
            )

            // For 4xx errors (client errors like invalid email), return 400
            if (
                sendgridResponse.status >= 400 &&
                sendgridResponse.status < 500
            ) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: 'Invalid subscription request',
                    }),
                }
            }

            // For other errors, return 500
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Failed to subscribe. Please try again.',
                }),
            }
        }

        // Success
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully subscribed to our mailing list!',
            }),
        }
    } catch (error) {
        console.error('Subscription error:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'An error occurred. Please try again.',
            }),
        }
    }
}

module.exports = { handler }
