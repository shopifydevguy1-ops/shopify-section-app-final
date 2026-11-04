import fs from "fs"
import path from "path"

export type LibraryImage = {
  id: string
  name: string
  label: string
  desktopUrl: string
  mobileUrl: string | null
}

const ROOT = path.join(process.cwd(), "public", "section-library")

function toLabel(filename: string) {
  return filename
    .replace(/\.png$/i, "")
    .replace(/^sg-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function listLibraryImages(): LibraryImage[] {
  if (!fs.existsSync(ROOT)) return []

  const mobileDir = path.join(ROOT, "mobile")
  const desktopFiles = fs
    .readdirSync(ROOT)
    .filter((file) => file.toLowerCase().endsWith(".png") && fs.statSync(path.join(ROOT, file)).isFile())
    .sort((a, b) => a.localeCompare(b))

  return desktopFiles.map((file) => {
    const mobilePath = path.join(mobileDir, file)
    return {
      id: file.replace(/\.png$/i, ""),
      name: file,
      label: toLabel(file),
      desktopUrl: `/section-library/${file}`,
      mobileUrl: fs.existsSync(mobilePath) ? `/section-library/mobile/${file}` : null,
    }
  })
}

export function findLibraryMatches(keyword: string, limit = 12): LibraryImage[] {
  const needle = keyword.toLowerCase().trim()
  if (!needle) return listLibraryImages().slice(0, limit)

  const tokens = needle.split(/[^a-z0-9]+/).filter(Boolean)
  return listLibraryImages()
    .map((image) => {
      const hay = `${image.id} ${image.label}`.toLowerCase()
      const score = tokens.reduce((total, token) => total + (hay.includes(token) ? 2 : 0), 0) + (hay.includes(needle) ? 3 : 0)
      return { image, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.image.label.localeCompare(b.image.label))
    .slice(0, limit)
    .map((entry) => entry.image)
}
