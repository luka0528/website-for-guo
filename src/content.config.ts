import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    lang: z.enum(['zh', 'en']),
    key: z.string(),
    name: z.string(),
    role: z.string().optional(),
    title: z.string().optional(),
    email: z.string().email().optional(),
    interests: z.array(z.string()).default([]),
    avatar: z.string().optional(),
    order: z.number().int().default(999),
    status: z.enum(['current', 'alumni']).default('current')
  })
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    lang: z.enum(['zh', 'en']),
    key: z.string(),
    title: z.string(),
    date: z.date(),
    summary: z.string().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([])
  })
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    lang: z.enum(['zh', 'en']),
    key: z.string(),
    title: z.string(),
    year: z.number().int(),
    type: z.enum(['journal', 'conference', 'preprint', 'workshop', 'thesis', 'other']).default('other'),
    authors: z.array(z.string()).min(1),
    venue: z.string().optional(),
    doi: z.string().optional(),
    url: z.string().url().optional(),
    pdf: z.string().optional(),
    bibtex: z.string().optional(),
    citation: z.string().optional(),
    files: z
      .array(
        z.object({
          key: z.string(),
          label: z.string().optional(),
          visibility: z.enum(['public', 'auth']).default('auth')
        })
      )
      .default([]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false)
  })
});

export const collections = { people, news, publications };

