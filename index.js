const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router')
const cors = require('cors')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./Users/Users')

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server,{
    cors: {
        origin: ["http://localhost:3000","https://nf-simple-chat-app.netlify.app/"],
       
      }
});

app.use(cors());
app.use(router);

io.sockets.on('connection',(socket)=>{
   
    socket.on('join',({name,room},callback) =>{
        const {error,user} = addUser({id:socket.id,name,room});
        console.log('New user with id :',socket.id,' name: ', name)
        if(error){
            return callback(error);
        }

        //welocme message to new user
        socket.emit('message',{user:'admin', text:`Hello ${user.name}, Welcome to ${room}`});

        //Broadcasting to users in the room new user has joined
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined`})
        socket.join(user.room);
        if(user){
            io.to(user.room).emit('roomData',{room:user.room, users:getUsersInRoom(user.room)})
        }
        

        callback();
        
    });
   

   
    socket.on('sendMessage', (message,callback) =>{
        try {
        const user = getUser(socket.id);
        // console.log('sendMessage from server: ',user,socket.id)
        io.to(user.room).emit('message',{user:user.name, text:message});

        io.to(user.room).emit('roomData',{room:user.room, users:getUsersInRoom(user.room)})
        callback();
        } catch (error) {
            console.log(error)
        }
        
    })

    socket.on('disconnect',() =>{
        
        const user = removeUser(socket.id);
        if(user){
          
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
        
    })
    
    
})

server.listen(PORT,console.log(`Server running on posrt ${PORT}`))