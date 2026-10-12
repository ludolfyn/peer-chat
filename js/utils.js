// Returns the DOM element with the given ID.
const $ = (selector, ancestor = document) => ancestor.querySelector(selector)
const $all = (selector, ancestor = document) => ancestor.querySelectorAll(selector)

export { $, $all }
