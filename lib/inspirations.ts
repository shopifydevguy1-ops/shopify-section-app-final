import fs from "fs"
import path from "path"

export type InspirationKind = "section" | "page"

export type Inspiration = {
  id: string
  kind: InspirationKind
  title: string
  sectionType: string
  notes: string
  storeUrl: string
  imageDataUrl: string
  createdAt: string
  seed?: boolean
}

const DATA_PATH = path.join(process.cwd(), "data", "inspirations.json")
const MEMORY_KEY = "__sectiongen_inspirations__"

type GlobalStore = typeof globalThis & {
  [MEMORY_KEY]?: Inspiration[]
}

function seedInspirations(): Inspiration[] {
  try {
    if (!fs.existsSync(DATA_PATH)) return []
    const raw = fs.readFileSync(DATA_PATH, "utf8")
    const parsed = JSON.parse(raw) as Inspiration[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function memoryStore() {
  const globalStore = globalThis as GlobalStore
  if (!globalStore[MEMORY_KEY]) {
    globalStore[MEMORY_KEY] = seedInspirations()
  }
  return globalStore[MEMORY_KEY]!
}

async function withInspirationDb<T>(
  read: (model: {
    findMany: (args: any) => Promise<any[]>
    create: (args: any) => Promise<any>
  }) => Promise<T>
) {
  if (!process.env.DATABASE_URL) return null
  try {
    const { prisma } = await import("./db")
    const model = (prisma as any).inspiration
    if (!model) return null
    return await read(model)
  } catch (error) {
    console.error("Inspiration database unavailable:", error)
    return null
  }
}

function mapRow(row: any): Inspiration {
  return {
    id: row.id,
    kind: row.kind as InspirationKind,
    title: row.title,
    sectionType: row.sectionType,
    notes: row.notes,
    storeUrl: row.storeUrl || "",
    imageDataUrl: row.imageDataUrl || "",
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  }
}

export async function listInspirations(): Promise<Inspiration[]> {
  const fromDb = await withInspirationDb(async (model) => {
    const rows = await model.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
    })
    return rows.map(mapRow)
  })

  if (fromDb && fromDb.length > 0) return fromDb

  return [...memoryStore()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function createInspiration(input: {
  kind: InspirationKind
  title: string
  sectionType: string
  notes: string
  storeUrl: string
  imageDataUrl: string
}): Promise<Inspiration> {
  const item: Inspiration = {
    id: crypto.randomUUID(),
    kind: input.kind,
    title: input.title,
    sectionType: input.sectionType,
    notes: input.notes,
    storeUrl: input.storeUrl,
    imageDataUrl: input.imageDataUrl,
    createdAt: new Date().toISOString(),
  }

  const saved = await withInspirationDb(async (model) => {
    const row = await model.create({
      data: {
        kind: item.kind,
        title: item.title,
        sectionType: item.sectionType,
        notes: item.notes,
        storeUrl: item.storeUrl,
        imageDataUrl: item.imageDataUrl,
      },
    })
    return mapRow(row)
  })

  if (saved) return saved

  const store = memoryStore()
  store.unshift(item)
  if (store.length > 80) store.length = 80
  return item
}
