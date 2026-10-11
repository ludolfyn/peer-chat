// Reads and parses a JSON value from localStorage, returning the fallback if missing or invalid.
const load = (key, fallback) => {
	try {
		return JSON.parse(localStorage.getItem(key)) || fallback
	} catch (error) {
		return fallback
	}
}

// Serializes a value to JSON and stores it in localStorage.
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))

export { load, save }
