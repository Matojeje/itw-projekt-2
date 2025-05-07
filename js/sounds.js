// ITW projekt 2 - sound effects
// Matouš Dřízhal xdrizh00

/** @param {String} query @returns {NodeListOf<HTMLElement>} */
function $all(query) { return document.querySelectorAll(query) }

/** List of loaded sound keys and their associated `<audio>` elements
 * @type {Map<string, HTMLAudioElement>} */
const availableSounds = new Map()

/** A space in the DOM to put dynamically made `<audio>` elements */
const extraSlot = /** @type {HTMLDivElement} */
  (document.getElementById("extra-audio"))

// First, find all sounds on the page

document.addEventListener("DOMContentLoaded", () => {
  /** @type {NodeListOf<HTMLAudioElement>} */
  const audios = document.querySelectorAll("audio[data-sound]")
  audios.forEach(audio => {
    // Type cast to get rid of `undefined` ensured by the selector above
    const soundName = /** @type {string} */ (audio.dataset.sound)
    if (audio.dataset.volume) audio.volume = parseFloat(audio.dataset.volume)
    availableSounds.set(soundName, audio)
  })
  console.debug(`Loaded ${availableSounds.size} sounds:`, availableSounds)

  // Add sounds to links

  $all(":is(main, footer) :is(a, :link)").forEach(el => registerSounds(el, {
    pointerenter: "hover",
    focusin: "hover"
  }))

  // Add sounds to header buttons

  $all("header .buttons > *").forEach(el => registerSounds(el, {
    pointerenter: "hover",
    focusin: "hover",
    pointerdown: "press",
    pointerup: "unpress",
  }))

  // Add sounds to nav links

  $all("header nav li a, #mobile-nav nav li:has(.icon)").forEach(el => registerSounds(el, {
    pointerenter: "hover",
    focusin: "hover",
    pointerdown: "tap",
    pointerup: "nav",
  }))

  // Add sounds to implementation notes

  $all(".implementation-note:not(.no-riolu)").forEach(el =>
   registerSounds(el, {
    pointerdown: "squish1",
    pointerup: "squish2",
   }, true, true)
  )

  // Add sounds to hobbies

  $all(".hobby").forEach(el => registerSounds(el, {
    pointerenter: "hover",
    focusin: "hover",
    pointerdown: "zoomin",
    pointerup: "zoomout"
  }))

  // Add sounds to drawings

  $all(".drawings li").forEach(el => registerSounds(el, {
    pointerenter: "hover",
    focusin: "hover"
  }))

  // Add sounds to avatars

  $all(".avatar").forEach(el => registerSounds(el, {
    pointerenter: "bounce",
    focusin: "bounce"
  }))
})

// Add sounds to tooltips

document.addEventListener("tooltipsAdded", e => {
  /** @type {HTMLElement[]} */
  const tooltipped = /** @type {CustomEvent} */ (e).detail
  tooltipped.forEach(el => registerSounds(el, {
    pointerenter: "tooltip",
    focusin: "tooltip"
  }))
})

// Helper functions

function getSounds() { return availableSounds }

/**
 * Play a sound of a specific key
 * @var {string} sound Name of the sound to play
 */
function playSFX(sound) {
  const snd = availableSounds.get(sound)
  if (!snd) throw new Error(`Can't play unknown sound ${sound}`)

  if (snd.paused) {
    snd.currentTime = 0
    snd.play() // Can throw an error if user hasn't clicked on the page yet
  } else {
    // This sound is already playing, let's use a new temporary audio player
    const audio = document.createElement("audio")
    audio.src = snd.src
    audio.volume = snd.volume
    audio.currentTime = 0
    audio.addEventListener("ended", () => audio.remove())
    extraSlot.appendChild(audio)
    audio.play()
    console.debug("Currently playing",
      extraSlot.children.length + 1, sound, "sounds at once")
  }
}

/**
 * Bind sound effects to DOM events for a given element!
 * @param {HTMLElement} el
 * @param {Partial<Record<keyof HTMLElementEventMap, string>>} settings
 * @param {boolean} [onlyTarget=false] Ignore elements whose target isn't `el`
 * @param {boolean} [preventDefault=false] Whether to fire `event.preventDefault()`
 */
function registerSounds(el, settings, onlyTarget=false, preventDefault=false) {
  for (const event in settings) {
    if (settings.hasOwnProperty(event)) {

      const sound = settings[event]

      if (!availableSounds.has(sound))
        throw new Error(`Sound ${sound} doesn't exist, can't bind to ${event}`)

      el.addEventListener(event, e => {
        if (onlyTarget && e.target != el) return
        playSFX(sound)
        if (preventDefault) e.preventDefault()
      })

    }
  }
}
