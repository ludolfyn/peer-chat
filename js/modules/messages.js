import state from './state.js'
import { $ } from './utils.js'
import { load, save } from './storage.js'
import { renderChat } from './rendering.js'

// Appends a message or system event to a contact's history, saves it, and refreshes the chat if it is open.
function addMessage(contactId, sender, text) {
	// Add to the contact's history and persist it
	const msgesLength = state.messages[contactId] ? state.messages[contactId].length : 0 // for slicing last 100
	state.messages[contactId] = state.messages[contactId].slice(msgesLength - 99, msgesLength) || []
	state.messages[contactId].push({ from: sender, text: text })
	save('messages', state.messages)

	// Refresh the chat panel if this contact's chat is open
	if (contactId === state.selected) {
		renderChat()
	}
}

// Sends the typed message over every open connection to the selected contact, or logs a "not sent" notice if they are offline.
function send() {
	// Ignore empty messages or no selected contact
	const text = $('#input').value.trim()
	if (!text || !state.selected) {
		return
	}

	// Log a notice if there is no open connection
	const openConnections = state.connections[state.selected]
	if (!openConnections?.length) {
		addMessage(state.selected, 'system', 'unsent')
		return
	}

	// Send over all open connections with a unique ID; the receiver ignores duplicates
	const messageId = Date.now() + '-' + Math.random().toString(36).slice(2)
	const sentDateTime = Temporal.Now.zonedDateTimeISO()
	openConnections.forEach((connection) => {
		connection.send({ id: messageId, text: text, type: 'msg', sentDateTime: sentDateTime, receivedDateTime: null })
		console.log('--- message sent: ', { id: messageId, text: text, type: 'msg' })
	})

	// Store and clear the input
	addMessage(state.selected, 'me', text)
	$('#input').value = ''
}

export { addMessage, send }
