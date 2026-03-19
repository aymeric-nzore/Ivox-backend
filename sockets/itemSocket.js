export const registerItemSocket = (io, socket) => {
	socket.on("item_subscribe", ({ itemType }) => {
		if (!itemType) {
			return;
		}
		socket.join(`items:${itemType}`);
	});

	socket.on("item_unsubscribe", ({ itemType }) => {
		if (!itemType) {
			return;
		}
		socket.leave(`items:${itemType}`);
	});

	socket.on("item_created", (payload) => {
		const { itemType } = payload || {};
		io.emit("new_item", payload);
		if (itemType) {
			io.to(`items:${itemType}`).emit("item_created", payload);
		}
	});

	socket.on("item_deleted", (payload) => {
		const { itemType } = payload || {};
		io.emit("delete_item", payload);
		if (itemType) {
			io.to(`items:${itemType}`).emit("item_deleted", payload);
		}
	});
};
