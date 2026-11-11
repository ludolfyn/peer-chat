<script setup></script>

<template>
	<div id="chat">
		<div id="messages"></div>
		<div id="inputRow">
			<!-- <input id="input" type="text" placeholder="Type a message" disabled> -->
			<textarea id="input" placeholder="Type a message" rows="2"></textarea>
			<button id="sendBtn" disabled>Send</button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#chat {
	flex: 1;
	height: 100vh;
	// display: flex;
	// flex-direction: column;
	position: relative;
	overflow-y: auto;

	#chat-header {
		width: 100%;
		height: 50px;
		padding: 0 15px;
		background-color: #fff;
		border-bottom: 1px solid #ccc;
		box-shadow: 0 -6px 20px 10px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1;

		.contact-name {
			font-size: 16px;
			font-weight: bold;
			color: #000;
		}

		.contact-status {
			font-size: 12px;
			color: #a5a5a5;
		}
	}

	#messages {
		flex: 1;
		padding: 20px 40px 85px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: hidden;

		.msg {
			min-width: 30%;
			max-width: 85%;
			padding: 8px;
			margin-bottom: 4px;
			border-radius: 10px;
			color: #000;
			font-size: 14px;
			text-align: left;
			position: relative;

			strong {
				margin-bottom: 4px;
				display: block;
			}

			.timestamp {
				font-size: 10px;
				color: #bbb;
				position: absolute;
				bottom: 0;
				right: 4px;
			}

			&.me {
				margin-left: auto;
				background-color: #f3f3f3;

				&:not(:has(+ .me)) {
					margin-bottom: 20px;
				}

				.timestamp {
					left: -45px;
				}
			}

			&.contact {
				margin-right: auto;
				background-color: #eee;

				&:not(:has(+ .contact)) {
					margin-bottom: 20px;
				}

				.timestamp {
					right: -45px;
				}
			}

			&.system {
				max-width: 90%;
				margin: 0 0;
				color: #a5a5a5;
				text-align: center;
				font-style: italic;

				&:not(:has(+ .system)) {
					margin-bottom: 20px;
				}
			}
		}
	}

	#inputRow {
		width: calc(100% - 260px);
		height: 65px;
		margin: 0;
		background-color: #fff;
		border: 1px solid #ccc;
		border-radius: 10px;
		// display: flex;
		box-shadow: 0 20px 20px rgba(0, 0, 0, 0.2);
		position: fixed;
		bottom: 20px;
		left: 240px;
		overflow: hidden;

		&.hide {
			display: none;
		}

		#input {
			flex: 1;
			width: 100%;
			height: 100%;
			padding: 8px;
			border: none;
			outline: none;
			font-family: inherit;
			resize: vertical;
		}

		#sendBtn {
			position: absolute;
			top: 6px;
			right: 6px;
		}
	}
}
</style>
