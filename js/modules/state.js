import { load } from './storage.js'

const state = {
	// contacts: load('contacts', {}), // contactId -> { name, unknown? }
	contacts: {
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b1': { name: 'luasdasd' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b2': { name: 'lsdfu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b3': { name: 'lsdcs ds u' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b4': { name: 'l sd u' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b5': { name: 'lsd sd u' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b6': { name: 'lsddu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b7': { name: 'lu sdsfd' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b8': { name: 'lufff' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b9': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1b0': { name: 'lu s' },
		'1b263f73-3b03-47ec-a098-ecbaf892d111': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d122': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d133': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d144': { name: 'lu' }
	},
	messages: load('messages', {}), // contactId -> [{ from, text }]
	selected: null,
	editingId: null,
	peer: null,
	connections: {}, // contactId -> open connections
	pending: {} // contactId -> outgoing connection attempt
}

export default state
