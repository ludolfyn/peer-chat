// Returns the DOM element with the given ID.
const $ = (elementId) => document.getElementById(elementId)

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

let contacts = load('contacts', {}) // contactId -> { name, unknown? }
let messages = load('messages', {}) // contactId -> [{ from, text }]
let selected = null
let editingId = null
let peer = null
const conns = {} // contactId -> open connections
const pending = {} // contactId -> outgoing connection attempt

// Returns true if at least one open connection exists for the contact.
const isOnline = (contactId) => (conns[contactId] || []).length > 0

// ---------- Peer ----------

// Creates the PeerJS connection using the saved ID (or a new one) and registers its event handlers.
function startPeer() {
	// Reuse the saved ID if one exists, otherwise let PeerJS generate a new one
	const savedId = localStorage.getItem('peerId')
	peer = savedId ? new Peer(savedId) : new Peer()

	// Save and display the ID once connected to the peer network, then look for contacts
	peer.on('open', (peerId) => {
		localStorage.setItem('peerId', peerId)
		$('myId').textContent = peerId
		connectAll()
	})

	// Handle incoming connections from other users
	peer.on('connection', (connection) => {
		setupConn(connection)
	})

	// Reconnect to the signaling server if the connection is lost
	peer.on('disconnected', () => {
		if (!peer.destroyed) {
			peer.reconnect()
		}
	})

	// Handle PeerJS errors
	peer.on('error', (error) => {
		if (error.type === 'peer-unavailable') {
			// The contact is offline: discard the failed connection attempt
			const match = error.message.match(/peer (\S+)/)
			if (match && pending[match[1]]) {
				pending[match[1]].close()
				delete pending[match[1]]
			}
		} else if (error.type === 'unavailable-id') {
			// The saved ID is still registered on the server: retry shortly
			$('myId').textContent = 'ID in use, retrying...'
			peer.destroy()
			setTimeout(startPeer, 3000)
		}
	})
}

// Registers handlers for a data connection (open, incoming data, close) and tracks its online status.
function setupConn(connection) {
	const contactId = connection.peer

	// Marks the contact as online once the connection is open.
	const onOpen = () => {
		// Track the open connection
		const wasOnline = isOnline(contactId)
		conns[contactId] = conns[contactId] || []
		conns[contactId].push(connection)

		// Clear the pending attempt if this connection was one
		if (pending[contactId] === connection) {
			delete pending[contactId]
		}

		// Log an "online" notice only when the contact changes from offline to online
		if (!wasOnline && contacts[contactId]) {
			addMessage(contactId, 'system', 'online')
		}
		renderContacts()
	}

	// Run immediately if already open, otherwise wait for the open event
	if (connection.open) {
		onOpen()
	} else {
		connection.on('open', onOpen)
	}

	// Handle incoming messages
	connection.on('data', (data) => {
		// Ignore malformed data
		if (!data || typeof data.text !== 'string') {
			return
		}

		// Ignore messages already received over another connection
		if (data.id) {
			if (seenMessageIds.has(data.id)) {
				return
			}
			seenMessageIds.add(data.id)
		}

		// Create an untitled contact if the sender is unknown
		if (!contacts[contactId]) {
			contacts[contactId] = { name: 'Untitled', unknown: true }
			save('contacts', contacts)
		}

		addMessage(contactId, 'them', data.text)
		renderContacts()
	})

	// Handle the connection closing
	connection.on('close', () => {
		// Remove the connection from the open list
		const openConnections = conns[contactId] || []
		const index = openConnections.indexOf(connection)
		if (index < 0) {
			return
		}
		openConnections.splice(index, 1)

		// Log a "disconnected" notice once no connections remain
		if (openConnections.length === 0 && contacts[contactId]) {
			addMessage(contactId, 'system', 'offline')
		}
		renderContacts()
	})
}

// Attempts to connect to every contact that is currently offline.
function connectAll() {
	// Do nothing if the peer is not ready
	if (!peer || peer.destroyed || peer.disconnected) {
		return
	}

	Object.keys(contacts).forEach((contactId) => {
		// Skip contacts that are already connected
		if (isOnline(contactId)) {
			return
		}

		// Skip contacts with an attempt that started less than 20 seconds ago
		if (pending[contactId]) {
			if (Date.now() - pending[contactId].startedAt < 20000) {
				return
			}
			pending[contactId].close()
		}

		// Start a new connection attempt
		const connection = peer.connect(contactId, { reliable: true })
		connection.startedAt = Date.now()
		pending[contactId] = connection
		setupConn(connection)
	})
}

// Retry offline contacts every 10 seconds
setInterval(connectAll, 10000)

// Destroy the peer connection when the window closes
window.addEventListener('beforeunload', () => {
	if (peer) {
		peer.destroy()
	}
})

// ---------- Messages ----------

// Appends a message or system event to a contact's history, saves it, and refreshes the chat if it is open.
function addMessage(contactId, sender, text) {
	// Add to the contact's history and persist it
	messages[contactId] = messages[contactId] || []
	messages[contactId].push({ from: sender, text: text })
	save('messages', messages)

	// Refresh the chat panel if this contact's chat is open
	if (contactId === selected) {
		renderChat()
	}
}

// Sends the typed message over every open connection to the selected contact, or logs a "not sent" notice if they are offline.
function send() {
	// Ignore empty messages or no selected contact
	const text = $('input').value.trim()
	if (!text || !selected) {
		return
	}

	// Log a notice if there is no open connection
	const openConnections = conns[selected] || []
	if (openConnections.length === 0) {
		addMessage(selected, 'system', 'unsent')
		return
	}

	// Send over all open connections with a unique ID; the receiver ignores duplicates
	const messageId = Date.now() + '-' + Math.random().toString(36).slice(2)
	openConnections.forEach((connection) => {
		connection.send({ id: messageId, text: text })
	})

	// Store and clear the input
	addMessage(selected, 'me', text)
	$('input').value = ''
}

// ---------- Rendering ----------

// Rebuilds the contact list with names, online status, and rename/delete buttons for unknown contacts.
function renderContacts() {
	const list = $('contacts')
	list.innerHTML = ''

	Object.entries(contacts).forEach(([contactId, contact]) => {
		// Contact container with unknown/selected styling
		const element = document.createElement('div')
		element.className =
			'contact' + (contact.unknown ? ' unknown' : '') + (contactId === selected ? ' selected' : '')

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
	$('input').disabled = $('sendBtn').disabled = !selected
	if (!selected) {
		box.textContent = 'Select a contact.'
		return
	}

	// Render each message
	const contactName = contacts[selected].name
	;(messages[selected] || []).forEach((message) => {
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
	selected = contactId
	renderContacts()
	renderChat()
	$('input').focus()
}

// ---------- Contacts ----------

// Opens the contact modal; with a contact ID it acts as a rename dialog with the ID locked.
function openModal(contactId) {
	editingId = contactId || null

	// Title depends on add or rename mode
	$('modalTitle').textContent = contactId ? 'Rename contact' : 'Add new contact'

	// Prefill fields; unknown contacts start with an empty name
	$('nameInput').value = contactId && !contacts[contactId].unknown ? contacts[contactId].name : ''
	$('idInput').value = contactId || ''
	$('idInput').readOnly = !!contactId

	// Show the modal
	$('modal').classList.remove('hidden')
	$('nameInput').focus()
}

// Hides the contact modal and resets the editing state.
function closeModal() {
	$('modal').classList.add('hidden')
	editingId = null
}

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
	contacts[contactId] = { name: name }
	save('contacts', contacts)

	// Refresh the UI
	closeModal()
	renderContacts()
	if (contactId === selected) {
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
	const openConnections = conns[contactId] || []
	delete conns[contactId]
	openConnections.forEach((connection) => {
		connection.close()
	})

	// Close any pending connection attempt
	if (pending[contactId]) {
		pending[contactId].close()
		delete pending[contactId]
	}

	// Remove the contact and its messages from storage
	delete contacts[contactId]
	delete messages[contactId]
	save('contacts', contacts)
	save('messages', messages)

	// Clear the selection if this contact was open
	if (selected === contactId) {
		selected = null
	}

	// Refresh the UI
	renderContacts()
	renderChat()
}

// ---------- Events ----------
$('addBtn').onclick = () => {
	openModal()
}
$('saveBtn').onclick = saveContact
$('cancelBtn').onclick = closeModal
$('sendBtn').onclick = send

// Send the message when Enter is pressed in the input
$('input').addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		send()
	}
})

// ---------- Startup ----------
renderContacts()
renderChat()
startPeer()
