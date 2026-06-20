import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { favicons } from 'favicons'

const source = readFileSync('./public/favicon.svg')
const dest = './public'

const response = await favicons(source, {
    path: '/',
    appName: 'Soundry',
    appDescription: "Soundry — Omaha's Experimental Music Education Workshops",
    background: '#f5f1eb',
    theme_color: '#8b2c2c',
    icons: {
        android: true,
        appleIcon: true,
        appleStartup: false,
        favicons: true,
        windows: false,
        yandex: false,
    },
})

for (const image of response.images) {
    writeFileSync(join(dest, image.name), image.contents)
    console.log('wrote', image.name)
}

for (const file of response.files) {
    writeFileSync(join(dest, file.name), file.contents)
    console.log('wrote', file.name)
}

console.log('\nAdd to <head>:')
for (const tag of response.html) {
    console.log(tag)
}
