<script setup>
import sidebar from './Sidebar.vue'
import chat from './Chat.vue'
</script>

<template>
	<sidebar></sidebar>
	<chat></chat>
</template>

<style lang="scss">
* {
	box-sizing: border-box;
}

body {
	padding: 0;
	margin: 0;

	#app {
		margin: 0;
		height: 100vh;
		display: flex;
		font-family: Arial, sans-serif;
		font-size: 14px;
	}
}

.hide {
	display: none;
}

textarea {
	font-family: inherit;
}

.app-inner {
}
</style>
