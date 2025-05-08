// ITW projekt 2 - mobile menu
// Matouš Dřízhal xdrizh00

let mobileNavOpenCount = 0

function mobileMenu(isOpen=true) {
  document.body.scrollLeft = 0

  const menuContainer = document.getElementById("mobile-nav")
  if (!menuContainer) return

  menuContainer.ariaExpanded = isOpen ? "true" : "false"
  document.body.classList.toggle("sidebar-opened", isOpen)

  const menuButton = document.getElementById("menu-button")
  if (!menuButton) return

  (isOpen)
  ? menuButton.removeAttribute("checked")
  : menuButton.setAttribute("checked", "")

  playSFX(isOpen ? "zoomin" : "zoomout")

  // Just in case the fallback icons persisted
  if (isOpen) mobileNavOpenCount++
  if (mobileNavOpenCount <= 1) removeFallbackIcons()
}
