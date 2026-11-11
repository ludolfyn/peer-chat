<script setup></script>

<template>
	<div id="sidebar">
		<div id="myId">Connecting...</div>
		<button id="addBtn">Add new contact</button>
		<div id="contacts"></div>
	</div>
</template>

<style lang="scss" scoped>
#sidebar {
	width: 220px;
	height: 100%;
	border-right: 1px solid #ccc;
	display: flex;
	flex-direction: column;

	#myId {
		padding: 8px;
		background: #f0f0f0;
		word-break: break-all;
		user-select: all;
		font-size: 12px;
	}

	#addBtn {
		margin: 8px;
	}

	#contacts {
		flex: 1;
		overflow-y: auto;

		.contact {
			padding: 8px;
			border-bottom: 1px solid #eee;
			cursor: pointer;

			&:hover {
				background: #f7f7f7;
			}
			&.selected {
				background: #dce9ff;
			}
			&.unknown {
				background: #fff6d6;
				border-left: 4px solid #e0a800;
			}
			&.unknown.selected {
				background: #ffe9a0;
			}

			.status {
				font-size: 11px;
				color: #777;
			}

			button {
				font-size: 11px;
				margin-top: 4px;
			}
		}
	}
}
</style>
