export async function GET() {
    const body = `# Soundry

> Omaha's experimental music education workshops — pioneering workshops throughout the Midwest emphasizing playing, listening, creating, and collaborative work.

## Pages

- [Soundry](https://soundryomaha.org/): Events calendar, email signup, donation, and booking information for Soundry's experimental music workshops in Omaha.
- [For Funders](https://soundryomaha.org/grants): Program overview and leadership for grant reviewers and prospective partners.

This file is advertised via an HTTP \`Link: </llms.txt>; rel="service-doc"\` response header.
`
    return new Response(body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
}
