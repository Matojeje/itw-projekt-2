// ITW projekt 2 - light/dark mode switcher
// Matouš Dřízhal xdrizh00
// Functionality loosely inspired by the @GoogleChromeLabs/dark-mode-toggle custom element

/** @type {"dark"|"light"?} */
let currentTheme = null;
let timesToggledTheme = -1

// Save all CSS stylesheet links with theme queries on page load

/** @type {Array<HTMLLinkElement>} */
const allCssLinks = Array.from(document.querySelectorAll(
  'link[rel="stylesheet"][media*="prefers-color-scheme"]'
))

const cssLinks = {
  dark:  allCssLinks.filter(l => l.media.includes("dark")),
  light: allCssLinks.filter(l => l.media.includes("light")),
}

// Detect the current system theme (This should only happen once)
if (currentTheme === null) {
  const isDark  = window.matchMedia("(prefers-color-scheme: dark)" ).matches
  const isLight = window.matchMedia("(prefers-color-scheme: light)").matches

  currentTheme = isDark ? "dark" : (isLight ? "light" : "light") // Default: light
  console.debug(`Detected system ${currentTheme} mode`)
  updateButtonIcon(oppositeTheme())
}


/** Call to toggle between dark and light mode */
function switchTheme() {
  updateButtonIcon()

  // Override media queries to simulate system theme change
  const nextTheme = oppositeTheme()

  cssLinks[currentTheme].forEach(l => { l.media = "not all"; l.disabled = true })
  cssLinks[nextTheme].forEach(l => { l.media = "all"; l.disabled = false })


  currentTheme = nextTheme
  timesToggledTheme++

  window.dispatchEvent(new CustomEvent("colorschemechange", {detail: currentTheme}))

  if (timesToggledTheme == 6) { console.info(
    "You're changing the color theme a lot, the console output will be truncated from now on."
  )}

  (timesToggledTheme < 6)
    ? console.debug(`Switched to ${currentTheme} mode`)
    : console.debug(`Switched color theme`)
}

function updateButtonIcon(newTheme=currentTheme) {
  document.querySelectorAll("[data-theme-icon]").forEach(buttonIcon =>
    buttonIcon.textContent = `${newTheme}_mode`
  )
}

function oppositeTheme(themeName=currentTheme) {
  switch (themeName) {
    case "dark": return "light";
    case "light": return "dark";
    default: return themeName;
  }
}
