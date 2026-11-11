chrome.action.onClicked.addListener(async () => {
	const { winId } = await chrome.storage.session.get('winId')
	if (winId) {
		try {
			await chrome.windows.update(winId, { focused: true })
			return
		} catch (e) {}
	}
	const win = await chrome.windows.create({
		url: 'window.html',
		type: 'popup',
		width: 760,
		height: 520
	})
	await chrome.storage.session.set({ winId: win.id })
})
