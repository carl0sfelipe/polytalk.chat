const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const userRoutes = require('./routes/userRoutes');

const cors = require('cors');
const { addUserToQueue, findPairForUser } = require('./utils/userQueue');
let waitingUsers = [];

// Serve arquivos estáticos do diretório 'frontend'
app.use(express.static('../frontend'));

app.use('/api', userRoutes);


// Use o middleware CORS para permitir solicitações de diferentes origens
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../frontend/index.html');
});



io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);
 
    
    const pair = findPairForUser(socket.id);
  
    if (pair) {
        const roomId = `${socket.id}-${pair}`;
        socket.join(roomId);
        io.sockets.sockets.get(pair).join(roomId);
        
        // Comunique o roomId aos sockets
        socket.emit('pairFound', { partnerId: pair, roomId: roomId });
        io.sockets.sockets.get(pair).emit('pairFound', { partnerId: socket.id, roomId: roomId });
    }
    
    
    else {
        addUserToQueue(socket.id);
    }
    socket.on('sendMessage', (data) => {
        console.log(`Mensagem recebida do usuário ${socket.id}: ${data.message}`);
    
        // Emitir a mensagem para a sala correspondente
        io.to(data.roomId).emit('receiveMessage', { message: data.message, sender: socket.id });
    
        console.log(`Mensagem enviada para a sala ${data.roomId}`);
    });
    
    
    
    // Configuração básica do Socket.io
    socket.on('receiveMessage', (data) => {
        const chatBox = document.getElementById('chatBox');
        chatBox.innerHTML += `<p>${data.sender}: ${data.message}</p>`;
    });
    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        // Remova o usuário da fila se ele se desconectar antes de encontrar um par
        waitingUsers = waitingUsers.filter(u => u !== socket.id);
    });
});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
