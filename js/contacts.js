import state from './state.js'

// Returns true if at least one open connection exists for the contact.
const isOnline = (contactId) => (state.connections[contactId] || []).length > 0

// Validates and saves the contact from the modal, then refreshes the UI and attempts to connect.
function saveContact() {
	const name = $('nameInput').value.trim()
	const contactId = $('idInput').value.trim()

	// Validate input
	if (!name || !contactId) {
		alert('Name and ID are required.')
		return
	}
	if (contactId === localStorage.getItem('peerId')) {
		alert('You cannot add your own ID.')
		return
	}

	// Save the contact (this also clears the "unknown" flag when renaming)
	state.contacts[contactId] = { name: name }
	save('contacts', state.contacts)

	// Refresh the UI
	closeModal()
	renderContacts()
	if (contactId === state.selected) {
		renderChat()
	}

	// Attempt to connect to the new contact
	connectAll()
}

// Deletes a contact and its messages after confirmation, and closes any connections to it.
function deleteContact(contactId) {
	// Ask for confirmation
	if (!confirm('Delete this contact and its messages?')) {
		return
	}

	// Close open connections
	const openConnections = state.connections[contactId] || []
	delete state.connections[contactId]
	openConnections.forEach((connection) => {
		connection.close()
	})

	// Close any pending connection attempt
	if (state.pending[contactId]) {
		state.pending[contactId].close()
		delete state.pending[contactId]
	}

	// Remove the contact and its messages from storage
	delete state.contacts[contactId]
	delete state.messages[contactId]
	save('contacts', state.contacts)
	save('messages', state.messages)

	// Clear the selection if this contact was open
	if (state.selected === contactId) {
		state.selected = null
	}

	// Refresh the UI
	renderContacts()
	renderChat()
}

export { isOnline, saveContact, deleteContact }
