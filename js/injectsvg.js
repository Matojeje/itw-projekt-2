// ITW projekt 2 - inline SVG injector
// Matouš Dřízhal xdrizh00
// Functionality loosely inspired by the @iconfu/svg-inject library

document.querySelectorAll("img").forEach(img => {
  if ("inject" in img.dataset) injectSVG(img)
  if (img.id == "title-svg") replaceTitle()
})

/**
 * @param {HTMLImageElement} img
 */
function injectSVG(img) {
  console.debug("Injecting SVG from", img)
  const src = img.src;

  // Load the SVG data
  fetch(src).then(response => {
    if (!response.ok) throw new Error("Failed to fetch SVG: " + response.status)
    return response.text()
  })
  // Prepare a new element
  .then(svgText => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, "image/svg+xml")
    const svg = doc.documentElement

    // Preserve some handy attributes
    if (img.id) svg.id = img.id
    if (img.lang) svg.setAttribute("lang", img.lang)
    if (img.alt) svg.setAttribute("aria-label", img.alt)
    if (img.className) svg.classList.add(...img.classList)
    if (img.dataset) Object.entries(img.dataset).forEach(([key, value]) => {
      if (key !== "inject") svg.dataset[key] = value
    })

    svg.setAttribute("role", "img")

    // And swap it out!
    img.replaceWith(svg)
    console.debug("SVG injected, new element:", svg)
  })
  .catch(err => console.error("SVG injection failed:", err))
}
