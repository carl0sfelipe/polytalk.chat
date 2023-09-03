export default function sendMessage() {
    const message = document.getElementById('messageInput').value;
    if (message.trim() !== "") {
      socket.emit('sendMessage', { message: message, roomId: currentRoomId });
      document.getElementById('messageInput').value = "";
    }
    }