const { Server } = require('socket.io')
const io = new Server(8900 , {
    cors:{
        origin:"http://localhost:3000"
    }
})

let onlineUsers = []

const addUser = (userId, socketId) => {
    !onlineUsers.some(user => user.userId === userId) && 
     onlineUsers.push({userId, socketId})
}

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
}

const findUser = (userId) => {
    let user = onlineUsers.find(user => user.userId === userId)
    return user.socketId
}

io.on("connection", socket => {
    console.log('User connected...')
    socket.on("addUser", userId => {
        addUser(userId, socket.id)
        io.emit("getUsers", onlineUsers)
    })

    socket.on("send", message => {
        let {senderId, messageText, conversationId} = message
        socket.to(findUser(message.receiverUserId)).emit("receive", {senderId, messageText, conversationId})
    })

    socket.on("disconnect", () => {
        console.log("a user disconnected!")
        removeUser(socket.id)
        io.emit("getUsers", onlineUsers)
    })
})
