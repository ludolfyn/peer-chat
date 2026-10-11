import state from './state.js'
import { $ } from './utils.js'
import { isOnline } from './contacts.js'

// Rebuilds the contact list with names, online status, and rename/delete buttons for unknown contacts.
function renderContacts() {
	const list = $('contacts')
	list.innerHTML = ''

	Object.entries(state.contacts).forEach(([contactId, contact]) => {
		// Contact container with unknown/selected styling
		const element = document.createElement('div')
		element.className =
			'contact' + (contact.unknown ? ' unknown' : '') + (contactId === state.selected ? ' selected' : '')

		// Name and online status
		const name = document.createElement('div')
		name.textContent = contact.name
		const status = document.createElement('div')
		status.className = 'status'
		status.textContent = isOnline(contactId) ? 'online' : 'offline'
		element.append(name, status)

		// Rename and delete buttons for unknown contacts only
		if (contact.unknown) {
			const renameButton = document.createElement('button')
			renameButton.textContent = 'Rename'
			renameButton.onclick = (event) => {
				event.stopPropagation()
				openModal(contactId)
			}

			const deleteButton = document.createElement('button')
			deleteButton.textContent = 'Delete'
			deleteButton.onclick = (event) => {
				event.stopPropagation()
				deleteContact(contactId)
			}

			element.append(renameButton, deleteButton)
		}

		// Clicking the contact opens its chat
		element.onclick = () => {
			selectContact(contactId)
		}
		list.append(element)
	})
}

// Rebuilds the chat panel with the selected contact's messages and system notices.
function renderChat() {
	const box = $('messages')
	box.innerHTML = ''

	// Enable the input only when a contact is selected
	$('input').disabled = $('sendBtn').disabled = !state.selected
	if (!state.selected) {
		box.textContent = 'Select a contact.'
		return
	}

	// Render each message
	const contactName = state.contacts[state.selected].name
	;(state.messages[state.selected] || []).forEach((message) => {
		const element = document.createElement('div')

		if (message.from === 'system') {
			// System notices are shown in italic (styled via the "system" class)
			element.className = 'system'
			element.textContent =
				message.text === 'online'
					? `${contactName} is online`
					: message.text === 'offline'
						? `${contactName} disconnected`
						: `Message not sent: ${contactName} is offline`
		} else {
			// Regular messages show the sender name followed by the text
			const sender = document.createElement('b')
			sender.textContent = (message.from === 'me' ? 'Me' : contactName) + ': '
			element.append(sender, document.createTextNode(message.text))
		}

		box.append(element)
	})

	// Scroll to the latest message
	box.scrollTop = box.scrollHeight
}

// Selects a contact, shows their chat, and focuses the message input.
function selectContact(contactId) {
	state.selected = contactId
	renderContacts()
	renderChat()
	$('input').focus()
}

// Opens the contact modal; with a contact ID it acts as a rename dialog with the ID locked.
function openModal(contactId) {
	state.editingId = contactId || null

	// Title depends on add or rename mode
	$('modalTitle').textContent = contactId ? 'Rename contact' : 'Add new contact'

	// Prefill fields; unknown contacts start with an empty name
	$('nameInput').value = contactId && !state.contacts[contactId].unknown ? state.contacts[contactId].name : ''
	$('idInput').value = contactId || ''
	$('idInput').readOnly = !!contactId

	// Show the modal
	$('modal').classList.remove('hidden')
	$('nameInput').focus()
}

// Hides the contact modal and resets the editing state.
function closeModal() {
	$('modal').classList.add('hidden')
	state.editingId = null
}

export { renderContacts, renderChat, selectContact, openModal, closeModal }
