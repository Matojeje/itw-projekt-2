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

/** Piano keys that are currently not playing @type {Set<Number>} */
const availableKeys = new Set()
const noteNames = "F♯3,G♯3,A♯3,C♯4,D♯4,F♯4,G♯4,A♯4,C♯5,D♯5,F♯5".split(",")

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

  // Also add piano notes

  const pianoVolume = 0.3
  /** @type {NodeListOf<HTMLAudioElement>} */
  const notes = document.querySelectorAll("audio[data-piano]")
  notes.forEach(note => {
    // Type cast to get rid of `undefined` ensured by the selector above
    const key = /** @type {string} */ (note.dataset.piano)
    availableSounds.set("piano-" + key, note)
    note.volume = 0
    note.addEventListener("ended", releaseNote)
  })

  console.debug(`Loaded ${availableSounds.size} sounds:`, availableSounds)

  // Add sounds to links

  $all(":is(main, footer) :is(a, :link)").forEach(el => registerSounds(el, {
    pointerenter: "hover",
    focusin: "hover"
  }))

  // Add sounds to header buttons

  $all("header .buttons > *, #mobile-nav li.setting")
  .forEach(el => registerSounds(el, {
    pointerenter: "hover",
    focusin: "hover",
    pointerdown: "press",
    pointerup: "unpress",
  }))

  // Add sounds to nav links

  $all("header nav li a, #mobile-nav nav li:has(.icon):not(.setting)")
  .forEach(el => registerSounds(el, {
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

  // Piano easter egg

  notes.forEach(note => availableKeys.add(parseInt(note.dataset.piano || "")))

  $(".tracks")?.addEventListener("pointerdown", e => {

    // Restrict this to desktop
    const isMobile = window.matchMedia("(max-width: 768px)").matches
    if (isMobile) return

    // Ten fingers
    if (availableKeys.size == 0) return console.error("I ran out of notes to play!")

    // Get a random note
    const newIndex = Math.floor(Math.random() * availableKeys.size)
    const newKey = Array.from(availableKeys)[newIndex]
    availableKeys.delete(newKey)

    /** @type {HTMLAudioElement|undefined} */
    const note = availableSounds.get("piano-" + newKey)
    if (!note) return

    // Play it
    note.volume = pianoVolume
    note.currentTime = 0
    note.play()

    // Animate Riolu
    $(".tracks li.media")?.animate([
      {translate: "0 0"},
      {translate: "0 -1.3%"},
      {translate: "0 -2.0%"},
      {translate: "0 -1.3%"},
      {translate: "0 0"}
    ], {
      duration: 300,
      easing: "ease-in-out"
    })

    console.debug("Playing note", newKey, `(${noteNames[newKey-1]})`)
  })

  $(".tracks")?.addEventListener("pointerup", releaseNote)
  // $(".tracks")?.addEventListener("pointerleave", releaseNote)

  function releaseNote() {
    const currentNotes = Array.from(notes)
    .filter(note => note.volume == pianoVolume && !note.paused)

    const releaseTime = 210
    const steps = 10
    const volumeStep = pianoVolume / steps
    const timeStep = releaseTime / steps

    // Gradual release phase
    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        currentNotes.forEach(note => {
          // Decresase volume by a bit
          note.volume = Math.max(0, note.volume - volumeStep)

          // Finish playing
          if (note.volume <= volumeStep) setTimeout(() => {
            note.pause()
            note.currentTime = note.duration
            availableKeys.add(parseInt(note.dataset.piano || ""))
          }, timeStep)
        })
      }, i * timeStep)
    }
  }
})

// Add sounds to tooltips

document.addEventListener("tooltipsAdded", e => {
  /** @type {HTMLElement[]} */
  const tooltipped = /** @type {CustomEvent} */ (e).detail
  tooltipped.forEach(el => registerSounds(el, {
    mouseenter: "tooltip", // Mouse only
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
