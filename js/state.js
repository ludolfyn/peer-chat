import { load } from './storage.js'

const state = {
	contacts: load('contacts', {}), // contactId -> { name, unknown? }
	messages: load('messages', {}), // contactId -> [{ from, text }]
	selected: null,
	editingId: null,
	peer: null,
	connections: {}, // contactId -> open connections
	pending: {} // contactId -> outgoing connection attempt
}

export default state
