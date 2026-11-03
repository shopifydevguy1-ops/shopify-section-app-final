function toTitle(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ")
  if (!cleaned) return "Section"
  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function buildFallbackSection(keyword: string, customizations?: string) {
  const name = toTitle(keyword).slice(0, 25)
  const heading = toTitle(keyword).slice(0, 80)
  const text = (
    customizations?.trim() ||
    `Edit this ${keyword.trim() || "section"} in the theme editor.`
  ).slice(0, 300)
  const isHero = /hero|banner|slideshow/i.test(keyword)

  const imageTag = isHero
    ? `{{ section.settings.image | image_url: width: 2000 | image_tag: widths: '600, 900, 1200, 1600, 2000', sizes: '100vw', alt: section.settings.heading, class: 'sg-block__image', loading: 'eager', fetchpriority: 'high' }}`
    : `{{ section.settings.image | image_url: width: 1600 | image_tag: widths: '400, 800, 1200, 1600', sizes: '(min-width: 990px) 50vw, 100vw', alt: section.settings.heading, class: 'sg-block__image', loading: 'lazy' }}`

  const schema = {
    name,
    tag: "section",
    class: "sg-block-wrap",
    settings: [
      { type: "image_picker", id: "image", label: "Image" },
      { type: "text", id: "heading", label: "Heading", default: heading },
      { type: "textarea", id: "text", label: "Text", default: text },
      { type: "text", id: "button_label", label: "Button label", default: "Shop now" },
      { type: "url", id: "button_link", label: "Button link" },
      { type: "color", id: "background", label: "Background", default: "#0c0a12" },
      { type: "color", id: "text_color", label: "Text", default: "#f6f3ff" },
      {
        type: "range",
        id: "padding",
        label: "Padding",
        min: 24,
        max: 120,
        step: 4,
        unit: "px",
        default: 64,
      },
    ],
    presets: [{ name }],
  }

  return `<section class="sg-block" style="--sg-bg: {{ section.settings.background }}; --sg-text: {{ section.settings.text_color }}; --sg-pad: {{ section.settings.padding }}px;">
  <div class="sg-block__media">
    {%- if section.settings.image != blank -%}
      ${imageTag}
    {%- else -%}
      {{ 'lifestyle-1' | placeholder_svg_tag: 'sg-block__image sg-block__placeholder' }}
    {%- endif -%}
  </div>
  <div class="sg-block__content">
    {%- if section.settings.heading != blank -%}
      <h2 class="sg-block__heading">{{ section.settings.heading }}</h2>
    {%- endif -%}
    {%- if section.settings.text != blank -%}
      <p class="sg-block__text">{{ section.settings.text }}</p>
    {%- endif -%}
    {%- if section.settings.button_label != blank and section.settings.button_link != blank -%}
      <a class="sg-block__button" href="{{ section.settings.button_link }}">{{ section.settings.button_label }}</a>
    {%- endif -%}
  </div>
</section>

{% stylesheet %}
.sg-block {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 2rem;
  align-items: center;
  background: var(--sg-bg);
  color: var(--sg-text);
  padding: var(--sg-pad);
}
.sg-block__image {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 1.25rem;
  display: block;
}
.sg-block__heading {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}
.sg-block__text {
  margin: 0 0 1.25rem;
  max-width: 38rem;
  line-height: 1.6;
}
.sg-block__button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 1.15rem;
  border-radius: 999px;
  background: var(--sg-text);
  color: var(--sg-bg);
  text-decoration: none;
  font-weight: 600;
}
@media (max-width: 749px) {
  .sg-block {
    grid-template-columns: 1fr;
  }
}
{% endstylesheet %}

{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`
}
