// ITW projekt 2 - mobile menu
// Matouš Dřízhal xdrizh00

function mobileMenu(isOpen=true) {
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
}
