import state from './state.js'
import { $ } from './utils.js'
import { isOnline, deleteContact, saveContact } from './contacts.js'

// Rebuilds the contact list with names, online status, and rename/delete buttons for unknown contacts.
function renderContacts() {
	const list = $('#contacts')
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
	const boxWrap = $('#chat')
	const box = $('#messages', boxWrap)
	box.innerHTML = ''

	// Enable the input only when a contact is selected
	if (!state.selected) {
		box.textContent = 'Select a contact.'
		$('#inputRow').classList.add('hide')
		return
	}

	$('#input').disabled = $('#sendBtn').disabled = !state.selected
	$('#inputRow').classList.remove('hide')

	// Render each message
	const contactName = state.contacts[state.selected].name
	;(state.messages[state.selected] || []).forEach((message) => {
		const element = document.createElement('div')
		const addDashes = (str) => {
			const strLen = str.length
			const maxLen = 65
			const openSpace = Math.floor((maxLen - strLen) / 2)
			const dashes = Array(openSpace).fill('-').join('')
			return `${dashes} ${str} ${dashes}`
		}

		if (message.from === 'system') {
			// System notices are shown in italic (styled via the "system" class)
			element.className = 'msg system'
			const msg =
				message.text === 'online'
					? `${contactName} is online`
					: message.text === 'offline'
						? `${contactName} disconnected`
						: `Message not sent: ${contactName} is offline`
			element.textContent = addDashes(msg)
		} else {
			// Regular messages show the sender name followed by the text
			const senderName = message.from === 'me' ? 'Me' : contactName
			const senderClass = message.from === 'me' ? 'me' : 'contact'

			const messageReceivedTime = message.receivedDateTime ?? Temporal.Now.zonedDateTimeISO()
			const timeString = messageReceivedTime.toLocaleString('en-US', { timeStyle: 'short' })
			const timeElem = document.createElement('div')
			timeElem.textContent = `${timeString}`
			timeElem.classList.add('timestamp')

			element.classList.add('msg', senderClass)
			const msgText = document.createElement('span')
			msgText.textContent = message.text

			element.append(msgText, timeElem)
		}

		box.append(element)
	})

	// Scroll to the latest message
	// boxWrap.scrollTop = boxWrap.scrollHeight
	boxWrap.scrollTo({
		top: box.scrollHeight,
		behavior: 'smooth'
	})
}

// Selects a contact, shows their chat, and focuses the message input.
function selectContact(contactId) {
	state.selected = contactId
	renderContacts()
	renderChat()
	$('#input').focus()
}

// Opens the contact modal; with a contact ID it acts as a rename dialog with the ID locked.
function openModal(contactId) {
	state.editingId = contactId || null

	// Title depends on add or rename mode
	$('#modalTitle').textContent = contactId ? 'Rename contact' : 'Add new contact'

	// Prefill fields; unknown contacts start with an empty name
	$('#nameInput').value = contactId && !state.contacts[contactId].unknown ? state.contacts[contactId].name : ''
	$('#idInput').value = contactId || ''
	$('#idInput').readOnly = !!contactId

	// Show the modal
	$('#modal').classList.remove('hidden')
	$('#nameInput').focus()
}

// Hides the contact modal and resets the editing state.
function closeModal() {
	$('#modal').classList.add('hidden')
	state.editingId = null
}

export { renderContacts, renderChat, selectContact, openModal, closeModal }
