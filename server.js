const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {

    // Get the JSON data from the body
    const { username, name, password } = req.body;
    

    //
    // D. Reading the users.json file
    //
    const jsonData = fs.readFileSync("data/users.json");
    const users = JSON.parse(jsonData);

    // E. Checking for the user data correctness
    //

    if (!username || !name || !password){
        res.json({ status: "error",
            error:"Username, name and password cannot be empty."});
        return;
    }

    if (!containWordCharsOnly(username)){
        res.json({ status: "error",
            error:"The username must contain only underscores, letters or numbers."});
        return;
    }

    if (username in users){
        res.json({ status: "error",
            error:"The username already exists."});
        return;
    }
    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = {name, password:hash };
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, " " ));
    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success" });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const jsonData = fs.readFileSync("data/users.json");
    const users = JSON.parse(jsonData);

    //
    // E. Checking for username/password
    //
    if (!(username in users)){
        res.json({ status: "error",
            error:"Invalid username."});
        return;
    }

    const user = users[username]
    const hashedPassword = user.password;
    if (!bcrypt.compareSync(password, hashedPassword)) {
        res.json({ status: "error",
            error:"Incorrect password."});
        return;
    };
    
    //
    // G. Sending a success response with the user account
    //
    req.session.user = {username, name:user.name};
    res.json({ status: "success", user: req.session.user});
 
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    // D. Sending a success response with the user account
    //
    if (!req.session.user) {
        res.json({ status: "error",
            error:"You have not signed in."});
        return;
    };
    res.json({ status: "success", user: req.session.user});

});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    if (req.session.user) {
        delete req.session.user;
    };
    //
    // Sending a success response
    res.json({ status: "success"});
});


//
//
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer( app );
const io = new Server(httpServer);

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

const onlineUsers = {};

//add new user
io.on("connection", (socket) => {
    if (socket.request.session.user){
        const {username, name} = socket.request.session.user;
        onlineUsers[username] = {name};
        console.log(onlineUsers);

        // //broadcast
        // const user = getUser(socket.id)
        // io.to(user.room).emit("add user", JSON.stringify(socket.request.session.user));
    }

    //added from uno
    socket.on('joinRoom', room => {
        let numberOfUsersInRoom = getUsersInRoom(room).length

        const { error, newUser} = addUser({
            id: socket.id,
            name: numberOfUsersInRoom===0 ? 'Player 1' : 'Player 2',
            room: room
        })

        if(error){
            socket.emit("room full");
            return;
        }
            

        socket.join(newUser.room);

        console.log(newUser.room);

        //broadcast
        const user = getUser(socket.id);

        if (numberOfUsersInRoom === 0) {
            socket.emit("first user")
        } else {
            io.to(user.room).emit("ready to start")
        }
        
        // io.to(user.room).emit("add user", JSON.stringify(socket.request.session.user));

        
        // const numClients = io.sockets.adapter.rooms.get(newUser.room).size

        // console.log(numClients);

        const usersdata = getUsersInRoom(room)

        console.log(usersdata);

        // const new_message = {
        //     user:     {system, avatar, name},
        //     datetime: new Date(),
        //     content:  "joined"
        // };

        // io.to(newUser.room).emit('roomData', {room: newUser.room, users: getUsersInRoom(newUser.room)})
        // socket.emit('currentUserData', {name: newUser.name})
        // io.to(newUser.room).emit("add message", JSON.stringify(new_message));

    })

    socket.on("disconnect", () => {
        // Remove the user from the online user list
        if (socket.request.session.user){
            const {username} = socket.request.session.user;
            if (onlineUsers[username]) delete onlineUsers[username];
            console.log(onlineUsers);
            // const user = getUser(socket.id)
            // io.to(user.room).emit("remove user", JSON.stringify(socket.request.session.user));
        }
    });
    
    socket.on("get users", () => {
        socket.emit("users", JSON.stringify(onlineUsers));
    });

    // initialize game state
    socket.on("initGameState", (gamestate) => {

        const user = getUser(socket.id);
        io.to(user.room).emit("initGameState", gamestate);
    });

    // update game state
    socket.on("updateGameState", (gamestate) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("updateGameState", gamestate);
    });



    // socket.on("get messages", () => {
    //     // Send the chatroom messages to the browser
    //     const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"));
    //     socket.emit("messages", JSON.stringify(chatroom));
    // });

    // socket.on("post message", (content) => {
    //     // Add the message to the chatroom
    //     if (socket.request.session.user){
    //         const {username, name} = socket.request.session.user;
    //         const new_message = {
    //             user:     {username, name},
    //             datetime: new Date(),
    //             content:  content
    //         };

    //         const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"));
    //         chatroom.push(new_message);
    //         fs.writeFileSync("data/chatroom.json", JSON.stringify(chatroom, null, " " ));
    //         const user = getUser(socket.id)
    //         io.to(user.room).emit("add message", JSON.stringify(new_message));

    //     }
    // });

    // socket.on("typing", () => {
    //     if (socket.request.session.user){
    //         const user = getUser(socket.id)
    //         io.to(user.room).emit("typing", JSON.stringify(socket.request.session.user));
    //     }
    // });



    // socket.on("joinRoom", (room) => {
    //     // const user = userJoin(socket.id, username, room);
    
    //     const {username, avatar, name} = socket.request.session.user;

    //     socket.join(room);
    //     let rooms = socket.rooms;
        
    //     console.log(rooms.keys);

    //     // let rooms = Object.keys(socket.rooms).filter(function(item) {
    //     //     return item !== socket.id;
    //     // });

    //     // console.log(rooms);

    //     if (io.sockets.adapter.rooms.has(room)){
    //         console.log("room exists");
    //     }

    //     // socket.broadcast.in(room).emit("hi");

    //     // alert(room);
        
    //     const numClients = io.sockets.adapter.rooms.get(room).size

    //     console.log(numClients);
        
        
    //     // // Welcome current user
    //     // socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
    
    //     // // Broadcast when a user connects
    //     // socket.broadcast
    //     //   .to(user.room)
    //     //   .emit(
    //     //     'message',
    //     //     formatMessage(botName, `${user.username} has joined the chat`)
    //     //   );
    
    //     // // Send users and room info
    //     // io.to(user.room).emit('roomUsers', {
    //     //   room: user.room,
    //     //   users: getRoomUsers(user.room)
    //     // });
    // });

});



// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});