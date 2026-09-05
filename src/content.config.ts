import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { TIME_ERROR, TIME_RE } from './utils/times'

const events = defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/events' }),
    schema: z.object({
        title: z
            .string()
            .transform((v) => v.trim())
            .refine((v) => v.length > 0, 'Title is required'),
        date: z.union([
            z.string(),
            z.date().transform((d) => d.toISOString().slice(0, 10)),
        ]),
        time: z
            .string()
            .transform((v) => v.trim())
            .refine((v) => TIME_RE.test(v), TIME_ERROR),
        endTime: z
            .string()
            .optional()
            .transform((v) => {
                if (v === undefined || v === '') return undefined
                return v.trim()
            })
            .refine((v) => v === undefined || TIME_RE.test(v), TIME_ERROR),
        location: z
            .string()
            .transform((v) => v.trim())
            .refine((v) => v.length > 0, 'Location is required'),
        description: z
            .string()
            .transform((v) => v.trim())
            .refine((v) => v.length > 0, 'Description is required'),
        price: z.string().optional().default('0'),
        image: z.string().optional(),
        rsvpLink: z.string().optional(),
        revision: z.number().optional().default(0),
    }),
})

export const collections = { events }
