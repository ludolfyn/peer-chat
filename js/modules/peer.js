import state from './state.js'
import { $ } from './utils.js'
import { isOnline } from './contacts.js'
import { addMessage } from './messages.js'
import { renderContacts } from './rendering.js'

// Creates the PeerJS connection using the saved ID (or a new one) and registers its event handlers.
function startPeer() {
	// Reuse the saved ID if one exists, otherwise let PeerJS generate a new one
	const savedId = localStorage.getItem('peerId')
	state.peer = savedId ? new Peer(savedId) : new Peer()

	// Save and display the ID once connected to the peer network, then look for contacts
	state.peer.on('open', (peerId) => {
		localStorage.setItem('peerId', peerId)
		$('#myId').textContent = peerId
		connectAll()
	})

	// Handle incoming connections from other users
	state.peer.on('connection', (connection) => {
		setupConn(connection)
	})

	// Reconnect to the signaling server if the connection is lost
	state.peer.on('disconnected', () => {
		if (!state.peer.destroyed) {
			state.peer.reconnect()
		}
	})

	// Handle PeerJS errors
	state.peer.on('error', (error) => {
		if (error.type === 'peer-unavailable') {
			// The contact is offline: discard the failed connection attempt
			const match = error.message.match(/peer (\S+)/)
			if (match && state.pending[match[1]]) {
				state.pending[match[1]].close()
				delete state.pending[match[1]]
			}
		} else if (error.type === 'unavailable-id') {
			// The saved ID is still registered on the server: retry shortly
			$('#myId').textContent = 'ID in use, retrying...'
			state.peer.destroy()
			const timeout = setTimeout(() => {
				startPeer()
				clearTimeout(timeout)
			}, 3000)
		}
	})
}

// Registers handlers for a data connection (open, incoming data, close) and tracks its online status.
function setupConn(connection) {
	const contactId = connection.peer

	// Marks the contact as online once the connection is open.
	const onOpen = () => {
		const contactWasOfflineBeforeConnection = !isOnline(contactId)

		// Start the silence timer for this connection
		connection.lastSeen = Date.now()

		// Clear the pending attempt if this connection was one
		if (state.pending[contactId]) {
			delete state.pending[contactId]
		}

		// Clear existing/stale connection with peer if already exists
		if (state.connections[contactId]?.length) {
			state.connections[contactId].forEach((conn) => {
				conn.close()
			})
		}

		// Track the open connection
		state.connections[contactId] = []
		state.connections[contactId].push(connection)

		console.log('--- Opened a new connection with', state.contacts[contactId].name, state.connections[contactId])

		// Log an "online" notice only when the contact changes from offline to online
		if (contactWasOfflineBeforeConnection && state.contacts[contactId]) {
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
		// Any received data proves the connection is alive
		connection.lastSeen = Date.now()

		// Ignore malformed data
		if (!data || typeof data.text !== 'string') {
			return
		}

		data.receivedDateTime = Temporal.Now.zonedDateTimeISO()

		console.log('--- incoming msg:', data)

		// Ignore heartbeat pings
		if (data.type === 'ping') {
			return
		}

		// Create an untitled contact if the sender is unknown
		if (!state.contacts[contactId]) {
			state.contacts[contactId] = { name: 'Untitled', unknown: true }
			save('contacts', state.contacts)
		}

		addMessage(contactId, 'them', data.text)
		renderContacts()
	})

	// Handle the connection closing
	connection.on('close', () => {
		// Remove the connection from the open list
		const openConnections = state.connections[contactId] || []
		const index = openConnections.indexOf(connection)
		if (index < 0) {
			return
		}

		const closedConnection = openConnections.splice(index, 1)
		console.log('closing connection', closedConnection)

		// Log a "disconnected" notice once no connections remain
		if (!openConnections.length && state.contacts[contactId]) {
			addMessage(contactId, 'system', 'offline')
		}
		renderContacts()
	})
}

// Attempts to connect to every contact that is currently offline.
function connectAll(contactId = null) {
	// Do nothing if the peer is not ready
	if (!state.peer || state.peer.destroyed || state.peer.disconnected) {
		return
	}

	// If contactId is passed, connect only to that contact
	// otherwise connect to all contacts
	if (contactId) {
		if (state.pending[contactId] || state.connections[contactId]?.length) {
			return
		}

		// Start a new connection attempt
		const connection = state.peer.connect(contactId, { reliable: true })
		connection.startedAt = Date.now()
		state.pending[contactId] = connection
		setupConn(connection)

		return
	}

	// If not returned early, connect to all contacts
	Object.keys(state.contacts).forEach((contactId) => {
		if (state.pending[contactId] || state.connections[contactId]?.length) {
			return
		}

		// Start a new connection attempt
		const connection = state.peer.connect(contactId, { reliable: true })
		connection.startedAt = Date.now()
		state.pending[contactId] = connection
		setupConn(connection)
	})
}

// Pings every open connection and closes any that have been silent for over 9 seconds.
function heartbeat() {
	for (const contactId in state.connections) {
		const contactConnections = state.connections[contactId]
		const contactConnectionsCopy = [...contactConnections]
		contactConnectionsCopy.forEach((connection) => {
			// Close connections that stopped responding
			if (Date.now() - connection.lastSeen > 9000) {
				connection.close()
				return
			}

			// Ping so the other side knows this connection is alive
			const messageId = Date.now() + '-' + Math.random().toString(36).slice(2)
			connection.send({ id: messageId, type: 'ping', text: String(Date.now()) })
		})

		if (!contactConnections.length) {
			connectAll(contactId)
		}
	}

	Object.values(state.connections).forEach((peerConnections) => {
		// Iterate over a copy because closing a connection removes it from the list
		const peerConnectionsCopy = [...peerConnections]
		peerConnectionsCopy.forEach((connection) => {
			// Close connections that stopped responding
			if (Date.now() - connection.lastSeen > 9000) {
				connection.close()
				return
			}

			// Ping so the other side knows this connection is alive
			const messageId = Date.now() + '-' + Math.random().toString(36).slice(2)
			connection.send({ id: messageId, type: 'ping', text: String(Date.now()) })
		})

		if (!peerConnections.length) {
			connectAll()
		}
	})
}

export { startPeer, setupConn, connectAll, heartbeat }
