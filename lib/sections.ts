import fs from 'fs'
import path from 'path'
import { prisma } from './db'

export interface SectionTemplate {
  name: string
  tags: string[]
  content: string
}

// Load sections from /sections folder
export async function loadSectionsFromFolder(): Promise<SectionTemplate[]> {
  const sectionsPath = path.join(process.cwd(), 'sections')
  
  if (!fs.existsSync(sectionsPath)) {
    return []
  }

  const files = fs.readdirSync(sectionsPath)
  const sections: SectionTemplate[] = []

  for (const file of files) {
    if (file.endsWith('.json') || file.endsWith('.liquid')) {
      const filePath = path.join(sectionsPath, file)
      const content = fs.readFileSync(filePath, 'utf-8')

      if (file.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content)
          sections.push({
            name: parsed.name || file.replace('.json', ''),
            tags: parsed.tags || [],
            content: parsed.content || parsed.template || '',
          })
        } catch (e) {
          console.error(`Error parsing ${file}:`, e)
        }
      } else if (file.endsWith('.liquid')) {
        sections.push({
          name: file.replace('.liquid', ''),
          tags: [],
          content,
        })
      }
    }
  }

  return sections
}

// Search sections by keyword
export async function searchSections(keyword: string): Promise<SectionTemplate[]> {
  // First, try to find in database
  const dbSections = await prisma.section.findMany({
    where: {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { tags: { has: keyword.toLowerCase() } },
      ],
    },
  })

  if (dbSections.length > 0) {
    return dbSections.map(s => ({
      name: s.name,
      tags: s.tags,
      content: s.content,
    }))
  }

  // Fallback to file system
  const allSections = await loadSectionsFromFolder()
  const keywordLower = keyword.toLowerCase()

  return allSections.filter(section => 
    section.name.toLowerCase().includes(keywordLower) ||
    section.tags.some(tag => tag.toLowerCase().includes(keywordLower))
  )
}

// Get all sections
export async function getAllSections(): Promise<SectionTemplate[]> {
  const dbSections = await prisma.section.findMany({
    orderBy: { createdAt: 'desc' },
  })

  if (dbSections.length > 0) {
    return dbSections.map(s => ({
      name: s.name,
      tags: s.tags,
      content: s.content,
    }))
  }

  return loadSectionsFromFolder()
}

