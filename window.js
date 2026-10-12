import state from './js/state.js'
import { $ } from './js/utils.js'
import { startPeer, setupConn, connectAll } from './js/peer.js'
import { load, save } from './js/storage.js'
import { isOnline, saveContact, deleteContact } from './js/contacts.js'
import { addMessage, send } from './js/messages.js'
import { renderContacts, renderChat, selectContact, openModal, closeModal } from './js/rendering.js'

// --- Connection ---
// Retry offline contacts every 10 seconds
setInterval(connectAll, 10000)

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
		send()
	}
})

// --- Startup ---
renderContacts()
renderChat()
startPeer()
