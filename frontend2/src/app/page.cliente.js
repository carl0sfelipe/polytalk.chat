import io from 'socket.io-client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const socketInstance = io('http://localhost:3000');
    setSocket(socketInstance);

    socketInstance.on('receiveMessage', (data) => {
      setMessages(prevMessages => [...prevMessages, `${data.sender}: ${data.message}`]);
    });

    socketInstance.on('connect', () => {
      console.log('Conectado ao servidor');
    });

    socketInstance.on('pairFound', (data) => {
      console.log('Par encontrado:', data.partnerId);
      console.log('ID da sala:', data.roomId);
      setCurrentRoomId(data.roomId);
    });

    return () => socketInstance.disconnect();
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socket.emit('sendMessage', { message: inputMessage, roomId: currentRoomId });
      setInputMessage('');
    }
  };

  return (
    <div>
      <h1>PolyTalk.Chat</h1>
      <div id="chatBox">
        {messages.map((message, index) => <p key={index}>{message}</p>)}
      </div>
      <input 
        type="text" 
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type your message..." 
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
