// ITW projekt 2 - tooltips
// Matouš Dřízhal xdrizh00

document.addEventListener("DOMContentLoaded", () => {

  /** @type {NodeListOf<HTMLElement>} */
  const abbreviations = document.querySelectorAll("abbr")

  /** @type {NodeListOf<HTMLElement>} */
  const terms = document.querySelectorAll("[data-term]")

  // Set up tooltip data attributes on page load

  abbreviations.forEach(abbr => {
    abbr.dataset.tooltip = abbr.title
    // Remove title to prevent the native tooltip
    abbr.removeAttribute("title")
  })

  terms.forEach(term => {
    term.addEventListener("mouseover", () => updateTermTooltip(term))
    // Also pre-fill the tooltip so the first time hover looks correct
    updateTermTooltip(term)
  })

  // Same but for translatable tooltips

  /** @type {NodeListOf<HTMLElement>} */
  const translatable = document.querySelectorAll(`[data-translated-tooltip]`)

  translatable.forEach(el => {
    el.addEventListener("pointerover", () => updateTranslatedTooltip(el))
    window.addEventListener("languageSwitched", () => updateTranslatedTooltip(el))
  })

  // Handle cases where the tooltip flows outside the viewport

  const allTooltippedElements = [...terms, ...abbreviations, ...translatable]

  allTooltippedElements.forEach(el => {
    el.addEventListener("pointerover", () => fitTooltipToViewport(el))
    // Also pre-calculate the tooltip to prevent overflow
    fitTooltipToViewport(el)
  })

  // That's pretty much it, the rest is done with CSS

  document.dispatchEvent(new CustomEvent("tooltipsAdded", {
    detail: allTooltippedElements
  }))

})

// ------------------------------------------------------------------------

/** @param {HTMLElement} term  */
function updateTermTooltip(term) {
  const index = term.dataset.term
  if (!index || isNaN(parseInt(index)))
    throw new Error(`Bad index "${index}" for term tooltip`)

  const explanation = getExplanation(index, getLangOf(term))
  if (!explanation?.definition)
    throw new Error("Bad definition for term tooltip")

  term.dataset.tooltip = `${capitalize(explanation.name)} = ${explanation.definition}`
}

/** @param {HTMLElement} el  */
function updateTranslatedTooltip(el) {
  const lang = getCurrentLang()
  const translationKey = "tooltip" + capitalize(lang)
  if (!(translationKey in el.dataset))
    throw new Error(`Couldn't find ${translationKey} in ${el}`)
  el.dataset.tooltip = el.dataset[translationKey]
  return true
}

/** @param {HTMLElement} el */
function fitTooltipToViewport(el, margin=16) {
  const tooltipWidth = estimateTooltip(el).width
  const viewportWidth = window.innerWidth
  const r = el.getBoundingClientRect()

  const center = r.left + r.width / 2
  const tooltipLeft = center - tooltipWidth / 2
  const tooltipRight = center + tooltipWidth / 2

  const leaksLeft = tooltipLeft < margin
  const leaksRight = tooltipRight > viewportWidth - margin

  el.classList.toggle("tooltip-snap-right", leaksRight)
  el.classList.toggle("tooltip-snap-left", leaksLeft)

  if (!leaksLeft && !leaksRight) return setNudge()

  setNudge(leaksLeft ? margin - r.left : viewportWidth - r.right - 2*margin)

  function setNudge(amount=0) {
    el.style.setProperty("--tooltip-nudge", `${Math.round(amount)}px`)
  }
}

/** @param {HTMLElement} el  */
function estimateTooltip(el) {
  const measuring = document.createElement("div")
  measuring.textContent = el.dataset.tooltip || ""
  measuring.style.cssText = `
    position: absolute;
    visibility: hidden;
    max-width: min(55ch, 90vw);
    width: max-content;
    padding: 0.5rem 1rem;
    font: inherit;
    white-space: pre-wrap;
  `;
  document.body.appendChild(measuring)
  const result = structuredClone(measuring.getBoundingClientRect())
  document.body.removeChild(measuring)
  return result
}
