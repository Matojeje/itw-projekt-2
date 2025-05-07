// ITW projekt 2 - language switcher
// Matouš Dřízhal xdrizh00
// Note: Originally created for the ITU project, later used in the IIS project

// 2025 update:
// - added extra logic for `lang` attributes
// - added getter functions

/**
 * @module language
 * 
 * * Basic usage
 * 
 * Add `data-xx="..."` attributes to any HTML element to provide translation
 * data for it, where `xx` is an **ISO 639-1 code** of the language.
 * 
 * For example: `<span data-cs="Ahoj" data-en="Hi" data-se="Hej"></span>`.
 * Also add your intended language codes to the `siteLanguages` array.
 * 
 * Then use `switchLanguage(xx)` to swap out all translatable elements'
 * innerHTMLs to whatever is in the `data-xx` attribute. If no language is
 * provided (`switchLanguage()`) and there are only two `siteLanguages`,
 * it switches to the other language.
 * 
 * If `enableSaving` is `true`, calling this function will also save the
 * newly selected language to `localStorage`.
 * 
 * * Events
 * 
 * Switching the language (including language detection at the start)
 * triggers a `languageSwitched` event, along with the new language code
 * saved under the `detail` key of the event. You can access it like so:
 * `window.addEventListener("languageSwitched", e => console.log(e.detail) )`
 * 
 * * Noun number counts
 * 
 * You can also set `data-numvalue` to a number string, and then optionally
 * provide declensions in `data-xx` separated by `;` (configurable in the
 * variable `pluralizeSep`) in the following order: `singular;dual;plural`.
 * 
 * For example: `<span data-numvalue="5" data-cs="dům;domy;domů"></span>`
 * 
 * You can specify 1 - 3 declensions, the unspecified ones will be generated
 * like so: `dual=singular+"s"`, `plural=dual`. This is meant to make English
 * nouns straightforward to define, only having to provide `singular`.
 * 
 * This isn't dynamic - changing `data-numvalue` won't automatically replace
 * the text inside the element accordingly, but it gets updated every time you
 * switch the language. You can also use `switchLanguage(currentLang, true)`
 * to only prompt a number noun update. The function's second parameter (called 
 * `numberUpdateOnly`) is set to `false` by default (if unspecified), and
 * `currentLang` is a variable that this script exposes globally, containing
 * the latest used language code.
 * 
 * * Language detection and language aliases
 * 
 * If a saved language isn't foung in `localStorage`, then upon loading the
 * page, the script will look at the info provided by the browser to determine
 * if the user's language preferences (`userLangs`) align with the website's
 * supported languages (`siteLanguages`), and if it does, it switches to that
 * language automatically.
 * 
 * In supported browsers, `userLangs` can have multiple values ordered by
 * preference (highest first), so if `userLangs` and `siteLanguages` intersect
 * in multiple languages, the earliest language in `userLangs` is used.
 * 
 * This check also supports language aliases, for the cases where there are two
 * similar sounding languages (like `cs` and `sk`), and supporting just one of
 * of the similar languages (`cs`) is preferable to `sk` seeing `en` content.
 * For this example, `cs` would have the alias `["sk"]` in `languageAliases`.
 * 
 * * Supporting other language codes and locales
 * 
 * If your `siteLanguages` don't directly translate to ISO 639-1 codes,
 * for example when you want to implement both American and British English,
 * or just want to use your own language codes for other reasons, then the
 * translation functionality itself should work just fine, but you might have
 * to edit the language detection source code if still you want to support it.
 * A good place to start with the changes would be `lang.includes(code))`.
 */


// Config

/** @typedef {string} supportedLang */
/** @enum {supportedLang} */
const siteLanguages = ["en", "cs"]
const languageAliases = {"cs": ["cz", "sk", "hsb", "dsb", "szl"]}
let enableSaving = true
let pluralizeSep = ";"

// Utility one-liners

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

// Var setup

let currentLang = ""
let preventSaving = true
let timesChangedLanguage = -1

// On load function
window.addEventListener("load", () => {

  // Load previously saved language
  const savedLang = localStorage.getItem("languagePreference")
  if (!!savedLang && siteLanguages.includes(savedLang))
  currentLang = savedLang

  // Detect preferred language
  else currentLang = detectLanguage()[0][0].toString()

  // Set up localization (l10n)
  switchLanguage(currentLang, false, false)
  if (enableSaving) preventSaving = false
})

function detectLanguage() {
  const numToInfinity = (/** @type {number} */ number, /** @type {number} */ test) => number == test ? Infinity : number
  const userLangs = navigator.languages ?? [navigator.language ?? navigator.userLanguage ?? ""]
  const userLangPreference = siteLanguages
    .map(code => [code, (
      (userLangs.findIndex(lang => lang.includes(code)) + 1) || (
        code in languageAliases
          ? Math.min(...languageAliases[code]?.map( (/** @type {string} */ alt) =>
            1 + numToInfinity(userLangs.findIndex(lang => lang.includes(alt)), -1) ))
          : 0
      )) - 1
    ]
    ).sort((a, b) => numToInfinity(a[1], -1) - numToInfinity(b[1], -1))
  /* const userLangPreference = userLangs.filter(lang => siteLanguages.some(slang => lang.includes(slang))) */
  console.group("Language detection")
  console.debug("Site supported", siteLanguages, languageAliases)
  console.debug("User preferred", userLangs)
  console.debug("Matched compromise", userLangPreference.flat(), userLangPreference[0][0])
  console.groupEnd()
  return userLangPreference
}

/** @param {supportedLang} [toLang] */
function switchLanguage(toLang, numberUpdateOnly=false, verbose=true) {
  const toggleMessageLimit = 6

  /** @type {supportedLang|string} */
  const lang = (toLang) ?? (currentLang == "en" ? "cs" : "en")

  if (!siteLanguages.includes(lang)) {
      console.error(`Unknown language ${lang}, try:`, siteLanguages)
      return -1
  }

  let count = 0
  let success = []
  let errors = []

  if (!numberUpdateOnly && verbose) {
      if (timesChangedLanguage >= toggleMessageLimit) 
          console.debug("Translate: Switching languages")
      else
          console.debug("Translate: Switching to", lang)
  }

  const query = siteLanguages.map(lang => `[data-${lang}]`).join(",")
  const translatable = $all(query)

  translatable.forEach(el => {
      try {
          if (!el.dataset[lang])
              throw new ReferenceError(`Missing translation string for language ${lang} on ${el}`)
          if (el.dataset.numvalue) {
              const number = Number(el.dataset.numvalue)
              if (isNaN(number)) throw new TypeError(`Non-numerical value attribute in ${el}`)
              el.innerHTML = pluralize(el.dataset.numvalue, ...(el.dataset[lang].split(";")))
          } else if (!numberUpdateOnly) {
              el.innerHTML = el.dataset[lang] || ""
          }
          el.setAttribute("lang", lang)
          count++
          success.push(el)
      } catch (error) {
          console.error(error)
          errors.push(el)
      }
  })

  $("html")?.setAttribute("lang", lang)

  currentLang = lang
  if (!numberUpdateOnly) {
      timesChangedLanguage++
      if (verbose && timesChangedLanguage <= toggleMessageLimit || errors.length != 0)
      console.debug("Translated", count, "/", translatable.length, "elements")

      if (verbose && timesChangedLanguage == toggleMessageLimit)
      console.info("You're changing the language a lot, the console output will be truncated from now on.")
  }

  if (preventSaving == false) {
    localStorage.setItem("languagePreference", currentLang)
  }

  window.dispatchEvent(new CustomEvent("languageSwitched", { detail: lang }))

  return { success, errors, count, expected: translatable.length }
}

function getCurrentLang() { return currentLang }

function getSiteLangs() { return siteLanguages }

/** @param {string} singular @param {string} number */
function pluralize(number, singular, dual=singular+"s", plural=dual, includeNumber=true) {
function _(string) { return includeNumber ? `${number} ${string}` : string }
function a(number) { return Math.abs(number) }
return a(number) == 1
    ? _(singular)
    : 2 <= a(number) && a(number) <= 4 ? _(dual) : _(plural)
}

/** @param {HTMLElement} el */
function getLangOf(el) {
  /** @type {HTMLElement|null} */
  const hasLang = el.closest("[lang]");
  const lang = hasLang?.lang;
  return lang ?? getCurrentLang()
}
