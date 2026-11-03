import fs from 'fs'
import path from 'path'

export interface SectionTemplate {
  name: string
  tags: string[]
  content: string
}

// Only load compact JSON templates for generation hints.
// The large .liquid library stays on disk for reference, but is excluded from Vercel functions.
export async function loadSectionsFromFolder(): Promise<SectionTemplate[]> {
  const sectionsPath = path.join(process.cwd(), 'sections')

  if (!fs.existsSync(sectionsPath)) {
    return []
  }

  const files = fs.readdirSync(sectionsPath)
  const sections: SectionTemplate[] = []

  for (const file of files) {
    if (!file.endsWith('.json')) continue

    const filePath = path.join(sectionsPath, file)
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      sections.push({
        name: parsed.name || file.replace('.json', ''),
        tags: parsed.tags || [],
        content: parsed.content || parsed.template || '',
      })
    } catch (e) {
      console.error(`Error parsing ${file}:`, e)
    }
  }

  return sections
}

async function withDatabase<T>(read: (prisma: import('@prisma/client').PrismaClient) => Promise<T>) {
  if (!process.env.DATABASE_URL) return null
  try {
    const { prisma } = await import('./db')
    return await read(prisma)
  } catch (error) {
    console.error('Database unavailable:', error)
    return null
  }
}

export async function searchSections(keyword: string): Promise<SectionTemplate[]> {
  const dbSections = await withDatabase((prisma) =>
    prisma.section.findMany({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { tags: { has: keyword.toLowerCase() } },
        ],
      },
    })
  )

  if (dbSections && dbSections.length > 0) {
    return dbSections.map(s => ({
      name: s.name,
      tags: s.tags,
      content: s.content,
    }))
  }

  const allSections = await loadSectionsFromFolder()
  const keywordLower = keyword.toLowerCase()

  return allSections.filter(section =>
    section.name.toLowerCase().includes(keywordLower) ||
    section.tags.some(tag => tag.toLowerCase().includes(keywordLower))
  )
}

export async function getAllSections(): Promise<SectionTemplate[]> {
  const dbSections = await withDatabase((prisma) =>
    prisma.section.findMany({
      orderBy: { createdAt: 'desc' },
    })
  )

  if (dbSections && dbSections.length > 0) {
    return dbSections.map(s => ({
      name: s.name,
      tags: s.tags,
      content: s.content,
    }))
  }

  return loadSectionsFromFolder()
}
