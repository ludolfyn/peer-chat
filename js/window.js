import state from './modules/state.js'
import { $ } from './modules/utils.js'
import { startPeer, setupConn, connectAll, heartbeat } from './modules/peer.js'
import { load, save } from './modules/storage.js'
import { isOnline, saveContact, deleteContact } from './modules/contacts.js'
import { addMessage, send } from './modules/messages.js'
import { renderContacts, renderChat, selectContact, openModal, closeModal } from './modules/rendering.js'

// --- Connection ---
// Run the heartbeat on every contact every 3 seconds
setInterval(heartbeat, 3000)

// Destroy the peer connection when the window closes
window.addEventListener('beforeunload', () => {
	peer?.destroy()
})

// --- UI ---
$('#addBtn').onclick = () => {
	openModal()
}
$('#saveBtn').onclick = saveContact
$('#cancelBtn').onclick = closeModal
$('#sendBtn').onclick = send

// Send the message when Enter is pressed in the input
$('#input').addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		if (event.shiftKey) {
			// 1. Shift + Enter is pressed
			// The browser automatically inserts a line break here by default.
		} else {
			event.preventDefault()
			send()
		}
	}
})

// --- Startup ---
renderContacts()
renderChat()
startPeer()
