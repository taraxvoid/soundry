const KEY_COLOR_CLASSES = ['key--white', 'key--black'] as const

export function keyColorClass(index: number): string {
    return KEY_COLOR_CLASSES[index % KEY_COLOR_CLASSES.length]
}
