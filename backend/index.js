const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const userRoutes = require('./routes/userRoutes');

const cors = require('cors');
const { addUserToQueue, findPairForUser } = require('./utils/userQueue');
let waitingUsers = [];

// Serve arquivos estáticos do diretório 'frontend'
app.use(express.static('../frontend3/build'));

app.use('/api', userRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend3', 'build', 'index.html'));
});

// Use o middleware CORS para permitir solicitações de diferentes origens
app.use(cors());

io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);
    
    const pair = findPairForUser(socket.id);
  
    if (pair) {
        const roomId = `${socket.id}-${pair}`;
        socket.join(roomId);
    
        const pairSocket = io.sockets.sockets.get(pair);
        if (pairSocket) {
            pairSocket.join(roomId);
            
            // Comunique o roomId aos sockets
            socket.emit('pairFound', { partnerId: pair, roomId: roomId });
            pairSocket.emit('pairFound', { partnerId: socket.id, roomId: roomId });
        } else {
            // Se o par não estiver mais conectado, adicione o usuário atual de volta à fila
            addUserToQueue(socket.id);
        }
    } else {
        addUserToQueue(socket.id);
    }
    

    socket.on('sendMessage', (data) => {
        console.log(`Mensagem recebida do usuário ${socket.id}: ${data.message}`);
    
        // Emitir a mensagem para a sala correspondente
        io.to(data.roomId).emit('receiveMessage', { message: data.message, sender: socket.id });
    
        console.log(`Mensagem enviada para a sala ${data.roomId}`);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        // Remova o usuário da fila se ele se desconectar antes de encontrar um par
        waitingUsers = waitingUsers.filter(u => u !== socket.id);
    });

   
    // Listener para desconexão do usuário
socket.on('userDisconnected', (data) => {
    // Notificar o parceiro de que o usuário se desconectou
    const partnerSocketId = data.roomId.replace(socket.id, '').replace('-', '');
    const partnerSocket = io.sockets.sockets.get(partnerSocketId);
    if (partnerSocket) {
        partnerSocket.emit('forceDisconnect');
        partnerSocket.disconnect();
    }
});


});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
