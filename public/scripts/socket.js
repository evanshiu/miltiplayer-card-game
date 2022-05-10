const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };


    // This function connects the server and initializes the socket
    const connect = function() {

        socket = io();
        // console.log(socket.id);

        // Join chatroom we are already in room link
        // socket.emit('joinRoom', { room });

        // socket.emit('join', {room: room}, (error) => {
        //     if(error)
        //         setRoomFull(true)
        // })


        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // // Get the chatroom messages
            // socket.emit("get messages");
        });


        socket.on("first user", () => {
            GamePanel.FirstUser();
            GamePanel.setPlayer("player1");
            alert("You are player 1, waiting for player 2")
        });

        socket.on("second user", () => {
            GamePanel.setPlayer("player2");
        });

        socket.on("ready to start", () => {
            GamePanel.startGame();
            alert("ready to start");
        });

        socket.on("room full", () => {
            alert("room full")
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);

            // // Show the online users
            // OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // // Add the online user
            // OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // // Remove the online user
            // OnlineUsersPanel.removeUser(user);
        });

        // the other user has left room
        socket.on("user left room", () => {
            alert("Other user has disconnected, game over.");
            
            Socket.disconnect();
            SignInForm.show();

        });

        socket.on("checkInRoom", (response) => {
            console.log("response" + response);
            OnlineUsersPanel.setInRoom(response);
        });

    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    const joinRoom = function(room){
        socket.emit('joinRoom', room );
    }

    const leaveRoom = function(){
        socket.emit('leaveRoom');
    }

    const checkInRoom = function(){
        socket.emit('checkInRoom');
    }

    return { getSocket, connect, disconnect, joinRoom, leaveRoom, checkInRoom};
})();
