import io from 'socket.io-client';
import sendMessage from './page.client';


export default function Home() {
  const socket = io('http://localhost:3000');
  let currentRoomId = null;


socket.on('receiveMessage', (data) => {
const chatBox = document.getElementById('chatBox');
chatBox.innerHTML += `<p>${data.sender}: ${data.message}</p>`;
});

  socket.on('connect', () => {
      console.log('Conectado ao servidor');
  });

  socket.on('pairFound', (data) => {
console.log('Par encontrado:', data.partnerId);
console.log('ID da sala:', data.roomId);
currentRoomId = data.roomId; // Atualize a variável currentRoomId
});

  return (
    <div>
      <h1>PolyTalk.Chat</h1>
      <div id="chatBox"></div>
      <input type="text" id="messageInput" placeholder="Type your message..." />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

