// ITW projekt 2 - Main page script
// Matouš Dřízhal xdrizh00

// Utility/helper functions

/** @returns {number} */
function now() { return new Date().getTime() }

/** @param {String} query @returns {HTMLElement?} */
function $(query) { return document.querySelector(query) }

/** @param {String} query @returns {NodeListOf<HTMLElement>} */
function $all(query) { return document.querySelectorAll(query) }

/** @param {String} id @returns {HTMLElement?} */
function id(id) { return document.getElementById(id) }

/** @param {object} obj @returns {object} */
function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)) }

function capitalize(text="", locale=navigator.language) {
  const [first, ...rest] = text
  return first.toLocaleUpperCase(locale) + rest.join("")
}


// On load function
console.group("Initial page setup")

// Remove fallback icons after Material Symbols load
const iconFont = id("iconFont")
if (iconFont?.dataset.loaded == "true") removeFallbackIcons()
else iconFont?.addEventListener("load", () => removeFallbackIcons())

document.addEventListener("DOMContentLoaded", () => {

  // Page scroll checking
  document.body.addEventListener("scroll", checkScrollTop)
  checkScrollTop(undefined, document.body)

  // Write current year where needed
  $all(".year").forEach(el => el.textContent = String(new Date().getFullYear()))

  // Add .has-icon class to .icon parents
  $all(".icon").forEach(icon => icon.parentElement?.classList.add("has-icon"))

  /* Language hijinks:
   * The document is Czech by default and gets translated using JavaScript.
   * As a fallback, all non-Czech content is hidden using a HTML attribute.
   * If we got this far, we can assume that the language switching script
   * works correctly, so let's safely remove that fallback attribute. */

  const langHidden = Array.from($all("[hidden]"))
  langHidden
  .filter(el => el.lang && el.lang != "cs")
  .forEach(el => el.removeAttribute("hidden"))

  console.debug("Removed hidden attribute from", langHidden.length, "translated elements")

  // Social link hover taglines

  const taglineEl = $(".social-tagline")

  $all(".social-links li").forEach(link => {
    if (!taglineEl) return
    // The language script hasn't been loaded at this point,
    // but hopefully it'll already be loaded when these events happen
    link.addEventListener("pointerenter", () => {
      const lang = getCurrentLang()
      const tagline = link.dataset["tagline" + capitalize(lang)] || link.closest("span")?.innerText
      // Why I'm using textContent: https://stackoverflow.com/a/50406907/11933690
      taglineEl.textContent = tagline || "???"
      taglineEl.classList.add("active")
    })
    link.addEventListener("pointerleave", () => {
      // Don't remove the text yet, for better debugging and animations
      taglineEl.classList.remove("active")
    })
  })

  // Firefox fallback for implementation note squish
  // On Webkit, this works without helper classes

  $all(".implementation-note:not(.no-riolu)").forEach(el => {
    el.addEventListener("pointerdown", e => {if (e.target == el) el.classList.add("squish")})
    el.addEventListener("pointerup", e => {if (e.target == el) el.classList.remove("squish")})
  })

  // Patch: in case the viewport scrolls to the side when clicking anchors

  $all("nav a").forEach(a => a.addEventListener("click", () => document.body.scrollLeft = 0))

  console.groupEnd()
})

document.addEventListener("languageSwitched", () =>
  id("translate")?.classList.toggle("toggled")
)

/** Call this function after injecting the H1 svg */
function replaceTitle() {
  $("h1 span")?.setAttribute("hidden", "")
  setTimeout(() => {
    const newTitle = $("h1 svg")
    if (newTitle) newTitle.tabIndex = 0
  }, 2000)
}

/** Call this function after the Material icon font finshed loading */
function removeFallbackIcons(polling=0, filter=document) {

  /** @type {NodeListOf<HTMLElement>} */
  const icons = filter.querySelectorAll("i.icon")
  if (icons.length == 0) {
    setTimeout(() => removeFallbackIcons(polling+1), 20)
    return
  }

  console.debug(`Removing fallback icons after ${polling} poll(s)`, icons)
  icons.forEach(i => {
    if (i.parentElement?.id != "theme")
    { i.textContent = i.dataset.icon || "" }
    i.classList.add("material-symbols-outlined")
  })
}

function checkScrollTop(e, el) {
  const scroll = e?.target?.scrollTop ?? el?.scrollTop ?? window.scrollY
  const isAtTop = scroll < 36
  $("header")?.classList.toggle("top", isAtTop)
  return isAtTop
}
