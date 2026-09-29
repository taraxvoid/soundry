import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handler } from '../netlify/functions/submission-created'

const submission = (formName: string, data: Record<string, string>) => ({
    body: JSON.stringify({ payload: { form_name: formName, data } }),
})

const jsonResponse = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status })

describe('submission-created', () => {
    const fetchMock = vi.fn()

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock)
        vi.stubEnv('BUTTONDOWN_API_KEY', 'test-key')
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        fetchMock.mockReset()
        vi.unstubAllGlobals()
        vi.unstubAllEnvs()
        vi.restoreAllMocks()
    })

    it('subscribes email-signup submissions to Buttondown', async () => {
        fetchMock.mockResolvedValue(jsonResponse(201, {}))

        const result = await handler(
            submission('email-signup', { email: ' a@example.com ' }),
        )

        expect(result.statusCode).toBe(200)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('https://api.buttondown.com/v1/subscribers')
        expect(init.headers.Authorization).toBe('Token test-key')
        expect(JSON.parse(init.body).email_address).toBe('a@example.com')
    })

    it('ignores other forms', async () => {
        const result = await handler(
            submission('impact-stories', { email: 'a@example.com' }),
        )

        expect(result.statusCode).toBe(200)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('drops honeypot submissions without calling Buttondown', async () => {
        const result = await handler(
            submission('email-signup', {
                email: 'bot@example.com',
                'bot-field': 'spam',
            }),
        )

        expect(result.statusCode).toBe(200)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('rejects invalid emails', async () => {
        const result = await handler(
            submission('email-signup', { email: 'nope' }),
        )

        expect(result.statusCode).toBe(400)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('treats an already-subscribed address as success', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(400, { code: 'email_already_exists' }),
        )

        const result = await handler(
            submission('email-signup', { email: 'a@example.com' }),
        )

        expect(result.statusCode).toBe(200)
    })

    it('reports Buttondown server errors as 502', async () => {
        fetchMock.mockResolvedValue(jsonResponse(500, {}))

        const result = await handler(
            submission('email-signup', { email: 'a@example.com' }),
        )

        expect(result.statusCode).toBe(502)
    })

    it('fails clearly when the API key is missing', async () => {
        vi.stubEnv('BUTTONDOWN_API_KEY', '')

        const result = await handler(
            submission('email-signup', { email: 'a@example.com' }),
        )

        expect(result.statusCode).toBe(500)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('rejects malformed payloads', async () => {
        const result = await handler({ body: 'not json' })

        expect(result.statusCode).toBe(400)
    })
})
