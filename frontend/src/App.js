import React, { useEffect, useState } from 'react';
import './App.css';
import io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [roomId, setRoomId] = useState(null);

//   useEffect(() => {
//     const newSocket = io('http://localhost:3000');
//     setSocket(newSocket);

//     newSocket.on('connect', () => {
//         console.log('Conectado ao servidor!');
//     });

//     newSocket.on('connect_error', (error) => {
//         console.error('Erro de conexão:', error);
//     });

//     newSocket.on('receiveMessage', (data) => {
//         setChat(prevChat => [...prevChat, `${data.sender}: ${data.message}`]);
//     });
//     newSocket.on('forceDisconnect', () => {
//       if (socket) {
//           socket.disconnect();
//           setSocket(null);
//           setChat([]);
//           setRoomId(null);
//       }
//   });

//     newSocket.on('pairFound', (data) => {
//         setRoomId(data.roomId);
//     });

//     return () => newSocket.close();
// }, [setSocket]);


//   const sendMessage = () => {
//     if (socket && roomId) {
//       socket.emit('sendMessage', { message: message, roomId: roomId });
//       setMessage('');
//     }
//   };

//   const handleDisconnect = () => {
//     if (socket && roomId) {
//       socket.emit('userDisconnected', { roomId: roomId });
//       socket.disconnect();
//       setSocket(null);
//       setChat([]);
//       setRoomId(null);
//     }
// };
useEffect(() => {
  const newSocket = io('http://localhost:3000');
  setSocket(newSocket);

  newSocket.on('connect', () => {
      console.log('Conectado ao servidor!');
  });

  newSocket.on('connect_error', (error) => {
      console.error('Erro de conexão:', error);
  });

  newSocket.on('receiveMessage', (data) => {
      console.log('Mensagem recebida:', data);
      setChat(prevChat => [...prevChat, `${data.sender}: ${data.message}`]);
  });

  newSocket.on('forceDisconnect', () => {
      console.log('Forçado a desconectar pelo servidor.');
      newSocket.disconnect();
      console.log('Desconectado com sucesso.');
      setSocket(null);
      setChat([]);
      setRoomId(null);
  });

  newSocket.on('pairFound', (data) => {
      console.log('Par encontrado:', data);
      setRoomId(data.roomId);
  });

  return () => {
      console.log('Socket fechado.');
      newSocket.close();
  };
}, [setSocket]);

const sendMessage = () => {
  if (socket && roomId) {
      console.log('Enviando mensagem:', message);
      socket.emit('sendMessage', { message: message, roomId: roomId });
      setMessage('');
  } else {
      console.warn('Socket ou roomId não disponível. Mensagem não enviada.');
  }
};

const handleDisconnect = () => {
  if (socket && roomId) {
      console.log('Emitindo desconexão para o servidor.');
      socket.emit('userDisconnected', { roomId: roomId });
      socket.disconnect();
      console.log('Desconectado manualmente.');
      setSocket(null);
      setChat([]);
      setRoomId(null);
  } else {
      console.warn('Socket ou roomId não disponível. Não foi possível desconectar.');
  }
};

// ... restante do código ...


  return (
    <div className="App">
      <h1>PolyTalk.Chat</h1>
      <div>
        {chat.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input 
        type="text" 
        value={message} 
        onChange={e => setMessage(e.target.value)} 
        placeholder="Type your message..." 
      />
      <button onClick={sendMessage}>Send</button>
      <button onClick={handleDisconnect}>Disconnect</button>
    </div>
  );
}

export default App;
