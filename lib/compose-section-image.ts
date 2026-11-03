export type ReferenceImage = {
  id: string
  name: string
  dataUrl: string
}

const ABSTRACT = [
  ["#f59e0b", "#fde68a"],
  ["#fb923c", "#facc15"],
  ["#eab308", "#fdba74"],
  ["#f97316", "#fef08a"],
]

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Could not read an image"))
    image.src = src
  })
}

export function compressImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read that file"))
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const maxEdge = 960
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext("2d")
        if (!context) {
          reject(new Error("Canvas is not available"))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.72))
      }
      image.onerror = () => reject(new Error("Use a JPG, PNG, or WebP image"))
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

function sampleColors(image: HTMLImageElement) {
  const canvas = document.createElement("canvas")
  canvas.width = 8
  canvas.height = 8
  const context = canvas.getContext("2d")
  if (!context) return ["#7c3aed", "#22d3ee"]
  context.drawImage(image, 0, 0, 8, 8)
  const { data } = context.getImageData(0, 0, 8, 8)
  const colors: string[] = []
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index]
    const green = data[index + 1]
    const blue = data[index + 2]
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    if (max - min < 18 || max < 28) continue
    colors.push(`rgb(${red}, ${green}, ${blue})`)
  }
  return colors.length > 0 ? colors : ["#f59e0b", "#fb923c", "#fde68a"]
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  focusY: number
) {
  const imageRatio = image.width / image.height
  const frameRatio = width / height
  let sourceX = 0
  let sourceY = 0
  let sourceWidth = image.width
  let sourceHeight = image.height

  if (imageRatio > frameRatio) {
    sourceWidth = image.height * frameRatio
    sourceX = (image.width - sourceWidth) / 2
  } else {
    sourceHeight = image.width / frameRatio
    sourceY = (image.height - sourceHeight) * focusY
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
}

function paintRoundedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  focusY: number
) {
  context.save()
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.clip()
  drawCover(context, image, x, y, width, height, focusY)
  context.restore()
}

function paintAbstract(context: CanvasRenderingContext2D, width: number, height: number, index: number) {
  context.fillStyle = "#07060d"
  context.fillRect(0, 0, width, height)
  const [first, second] = ABSTRACT[index % ABSTRACT.length]
  const orbs = [
    { color: first, x: width * (0.22 + (index % 3) * 0.12), y: height * 0.38, radius: width * 0.42 },
    { color: second, x: width * 0.74, y: height * (0.42 + (index % 2) * 0.16), radius: width * 0.36 },
  ]
  orbs.forEach((orb) => {
    const gradient = context.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
    gradient.addColorStop(0, orb.color)
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
  })
}

export async function composeSectionImage(sources: string[], index: number) {
  const width = 1280
  const height = 800
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas is not available")

  if (sources.length === 0) {
    paintAbstract(context, width, height, index)
    return canvas.toDataURL("image/jpeg", 0.86)
  }

  const images = await Promise.all(sources.map(loadImage))
  const palette = images.flatMap(sampleColors)
  const feature = images[index % images.length]
  const focusY = [0.15, 0.5, 0.85][index % 3]

  context.save()
  context.filter = "blur(34px) saturate(1.2)"
  const columns = Math.min(3, images.length)
  images.forEach((image, imageIndex) => {
    const column = imageIndex % columns
    const row = Math.floor(imageIndex / columns)
    const rows = Math.ceil(images.length / columns)
    drawCover(
      context,
      image,
      (column * width) / columns - 40,
      (row * height) / rows - 40,
      width / columns + 80,
      height / rows + 80,
      0.5
    )
  })
  context.restore()

  context.fillStyle = "rgba(7, 6, 13, 0.42)"
  context.fillRect(0, 0, width, height)

  const layout = index % 3
  if (layout === 0) {
    paintRoundedImage(context, feature, 64, 64, width * 0.68, height - 128, 36, focusY)
  } else if (layout === 1) {
    paintRoundedImage(context, feature, width * 0.3, 56, width * 0.64, height - 112, 36, focusY)
  } else {
    paintRoundedImage(context, feature, width * 0.16, 72, width * 0.68, height - 144, 40, focusY)
  }

  if (images.length > 1) {
    const other = images[(index + 1) % images.length]
    const thumbX = layout === 1 ? 56 : width - 280
    paintRoundedImage(context, other, thumbX, height - 210, 210, 140, 22, 0.5)
  }

  const wash = context.createLinearGradient(0, 0, width, height)
  wash.addColorStop(0, palette[index % palette.length] || "#f59e0b")
  wash.addColorStop(1, palette[(index + 3) % palette.length] || "#fde68a")
  context.save()
  context.globalCompositeOperation = "soft-light"
  context.globalAlpha = 0.55
  context.fillStyle = wash
  context.fillRect(0, 0, width, height)
  context.restore()

  const vignette = context.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.72)
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)")
  vignette.addColorStop(1, "rgba(7, 6, 13, 0.45)")
  context.fillStyle = vignette
  context.fillRect(0, 0, width, height)

  return canvas.toDataURL("image/jpeg", 0.86)
}
