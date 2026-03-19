export const registerVideoSocket = (io, socket) => {
	socket.on("video_subscribe", ({ videoId }) => {
		if (!videoId) {
			return;
		}
		socket.join(`video:${videoId}`);
	});

	socket.on("video_unsubscribe", ({ videoId }) => {
		if (!videoId) {
			return;
		}
		socket.leave(`video:${videoId}`);
	});

	socket.on("video_liked", ({ videoId, likes }) => {
		if (!videoId) {
			return;
		}
		io.to(`video:${videoId}`).emit("video_like_updated", { videoId, likes });
	});

	socket.on("video_played", ({ videoId, views }) => {
		if (!videoId) {
			return;
		}
		io.to(`video:${videoId}`).emit("video_views_updated", { videoId, views });
	});
};
