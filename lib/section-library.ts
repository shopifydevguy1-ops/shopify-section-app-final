import fs from "fs"
import path from "path"

export type LibraryImage = {
  id: string
  name: string
  label: string
  category: string
  desktopUrl: string
  mobileUrl: string | null
}

export const SECTION_CATEGORIES = [
  "Hero",
  "Testimonials",
  "FAQ",
  "Collections",
  "Product",
  "Gallery",
  "Newsletter",
  "Contact",
  "Video",
  "Countdown",
  "Announcement",
  "Trust",
  "Blog",
  "Other",
] as const

const ROOT = path.join(process.cwd(), "public", "section-library")

const CATEGORY_RULES: Array<{ category: string; patterns: RegExp[] }> = [
  { category: "Hero", patterns: [/hero/, /banner/, /slideshow/, /slider/, /split-screen/, /candy-banner/, /allbirds-banner/] },
  { category: "Testimonials", patterns: [/testimonial/, /review/, /social-proof/] },
  { category: "FAQ", patterns: [/faq/, /accordion/] },
  { category: "Collections", patterns: [/collection/, /category/] },
  { category: "Product", patterns: [/product/, /upsell/, /bundle/, /shop-the-look/, /atc/, /size-guide/] },
  { category: "Gallery", patterns: [/gallery/, /bento/, /before-after/, /lookbook/, /masonry/] },
  { category: "Newsletter", patterns: [/newsletter/, /email/, /subscribe/] },
  { category: "Contact", patterns: [/contact/, /form/] },
  { category: "Video", patterns: [/video/, /reel/, /shoppable-video/] },
  { category: "Countdown", patterns: [/countdown/, /timer/, /clock/] },
  { category: "Announcement", patterns: [/announcement/, /marquee/, /ticker/] },
  { category: "Trust", patterns: [/trust/, /badge/, /logo-cloud/, /payment/] },
  { category: "Blog", patterns: [/blog/, /article/, /rich-text/, /text-block/] },
]

function toLabel(filename: string) {
  return filename
    .replace(/\.png$/i, "")
    .replace(/^sg-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function detectCategory(id: string, label: string) {
  const hay = `${id} ${label}`.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(hay))) return rule.category
  }
  return "Other"
}

export function listLibraryImages(): LibraryImage[] {
  if (!fs.existsSync(ROOT)) return []

  const mobileDir = path.join(ROOT, "mobile")
  const desktopFiles = fs
    .readdirSync(ROOT)
    .filter((file) => file.toLowerCase().endsWith(".png") && fs.statSync(path.join(ROOT, file)).isFile())
    .sort((a, b) => a.localeCompare(b))

  return desktopFiles.map((file) => {
    const id = file.replace(/\.png$/i, "")
    const label = toLabel(file)
    const mobilePath = path.join(mobileDir, file)
    return {
      id,
      name: file,
      label,
      category: detectCategory(id, label),
      desktopUrl: `/section-library/${file}`,
      mobileUrl: fs.existsSync(mobilePath) ? `/section-library/mobile/${file}` : null,
    }
  })
}

export function groupLibraryByCategory(images: LibraryImage[] = listLibraryImages()) {
  const groups = SECTION_CATEGORIES.map((category) => ({
    category,
    items: images.filter((image) => image.category === category),
  })).filter((group) => group.items.length > 0)

  return groups
}

export function findLibraryMatches(keyword: string, limit = 12): LibraryImage[] {
  const needle = keyword.toLowerCase().trim()
  if (!needle) return listLibraryImages().slice(0, limit)

  const tokens = needle.split(/[^a-z0-9]+/).filter(Boolean)
  return listLibraryImages()
    .map((image) => {
      const hay = `${image.id} ${image.label} ${image.category}`.toLowerCase()
      const score =
        tokens.reduce((total, token) => total + (hay.includes(token) ? 2 : 0), 0) +
        (hay.includes(needle) ? 3 : 0)
      return { image, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.image.label.localeCompare(b.image.label))
    .slice(0, limit)
    .map((entry) => entry.image)
}
