<script setup></script>

<template>
	<div id="modal" class="hidden">
		<div id="modalBox">
			<b id="modalTitle">Add new contact</b>
			<input id="nameInput" type="text" placeholder="User name" />
			<textarea id="idInput" placeholder="User ID"></textarea>
			<div>
				<button id="saveBtn">Save</button>
				<button id="cancelBtn">Cancel</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#modal {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;

	&.hidden {
		display: none;
	}
	#modalBox {
		width: 300px;
		padding: 16px;
		background-color: #fff;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;

		textarea {
			height: 70px;
			resize: none;
		}
	}
}
</style>
