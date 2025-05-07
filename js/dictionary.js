// ITW projekt 2 - dictionary term lookup
// Matouš Dřízhal xdrizh00

const int = (numericString="") => parseInt(numericString || "")

/**
 * @typedef {{
 *   index: number,
 *   name: string | Map<string, string>,
 *   dd?: Map<string, HTMLElement>,
 *   definition?: Map<string, string>,
 * }} entry
 * @type {entry[]}
 */

// Build dictionary object on page load
const dictionary = buildDictionary()

// Hide the dictionary section, we're done with it
document.querySelector("section#dictionary")?.setAttribute("hidden", "")

// ---------------------------------------------------------------------

function buildDictionary() {
  /** @type {entry[]} */
  let entries = []

  const dict = document.querySelector("#dictionary dl")
  if (!dict) throw new Error("Couldn't find the dictionary on the page.")

  // Load terms
  const dts = Array.from(dict.getElementsByTagName("dt"))
  console.debug("Found", dts.length, "dictionary terms")

  entries = dts.map(dt => ({
    index: int(dt.dataset.term),
    name: ("en" in dt.dataset)
      ? new Map(Object.entries(dt.dataset)
          .filter( ([key]) => key !== "term" )
          .map( ([key, value]) => [key, value ?? ""] )
        )
      : dt.innerText
  }))

  // Load definitions
  const dds = Array.from(dict.getElementsByTagName("dd"))
  console.debug("Found", dds.length, "dictionary definitions across all languages")

  /** @type {Object<string, HTMLElement[]>} */
  let ddsForIndex = {}

  dds.forEach(dd => {
    const index = int(dd.dataset.term)
    if (!ddsForIndex[index]) ddsForIndex[index] = []
    ddsForIndex[index].push(dd)
  })

  // Assign multiple definitions to one term
  Object.keys(ddsForIndex).forEach(key => {
    const index = int(key)
    const definitions = ddsForIndex[key]
    const entry = entries.find(en => en.index == index)
    if (!entry) throw new Error("Couldn't find dictionary entry #" + index)

    // Why I'm using innerText: https://stackoverflow.com/a/50406907/11933690
    entry.definition = new Map(definitions.map(dd => [dd.lang, dd.innerText || ""]))
    entry.dd = new Map(definitions.map(dd => [dd.lang, dd]))
  })

  console.debug("Built dictionary:", entries)
  return entries
}

// ---------------------------------------------------------------------

/** @param {String|Number} termIndex */
function getExplanation(termIndex, lang=getCurrentLang()) {
  const index = (typeof termIndex == "string") ? int(termIndex) : termIndex
  const entry = dictionary.find(e => e.index == index)
  if (!entry) return

  return {
    name: (typeof entry.name == "string") ? entry.name : entry.name.get(lang),
    definition: entry.definition?.get(lang),
    dd: entry.dd?.get(lang)
  }
}
