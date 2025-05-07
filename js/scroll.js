// ITW projekt 2 - scroll follower
// Matouš Dřízhal xdrizh00

/** @type {Map<Element, IntersectionObserverEntry>} */
let observedEntries = new Map()
const className = "viewed"

// Set up an Intersetion Observer
const observer = new IntersectionObserver(entries => {

  entries.forEach(entry => {
    entry.isIntersecting
    ? entry.target.classList.add(className)
    : entry.target.classList.remove(className)

    observedEntries.set(entry.target, entry)
  })


  const activeEntries = Array.from(observedEntries)
  .filter( ([_, en]) => en.isIntersecting)
  // .sort( (a, b) => a[1].intersectionRect.top - b[1].intersectionRect.top )

  // console.debug(activeEntries.map(x => `${x[0].id}\t${x[1].intersectionRatio}`).join("\n"))

  const currentSection = activeEntries[0][1].target.id
  document.querySelectorAll(`nav li`).forEach(e => e.classList.remove("active"))
  document.querySelector(`nav li[for="${currentSection}"]`)?.classList.add("active")
})

// Observe elements
const observed = document.querySelectorAll("section")

observed.forEach(el => {
  observer.observe(el)
})

console.debug(`Observing intersections for ${observed.length} elements`)
