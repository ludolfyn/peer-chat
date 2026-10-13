import { load } from './storage.js'

const state = {
	// contacts: load('contacts', {}), // contactId -> { name, unknown? }
	contacts: {
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'luasdasd' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lsdfu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lsdcs ds u' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'l sd u' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lsd sd u' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lsddu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu sdsfd' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lufff' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu s' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu' },
		'1b263f73-3b03-47ec-a098-ecbaf892d1ba': { name: 'lu' }
	},
	messages: load('messages', {}), // contactId -> [{ from, text }]
	selected: null,
	editingId: null,
	peer: null,
	connections: {}, // contactId -> open connections
	pending: {} // contactId -> outgoing connection attempt
}

export default state
