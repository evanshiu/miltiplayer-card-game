const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    HomePanel.update(Authentication.getUser());
                    HomePanel.show();
                    Socket.connect();
                    $('<script src="scripts/game.js"></script>').appendTo(document.body)
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();


const HomePanel = (function() {

    const initialize = function() {
        // Hide it
        $("#home-container-overlay").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#home-container-overlay").show();
    };

    // This function hides the form
    const hide = function() {
        $("#home-container-overlay").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#home-container-overlay .user-name").text(user.name);
        }
        else {
            $("#home-container-overlay .user-name").text("");
        }
    };

    return { initialize, show, hide, update };

})();

const OnlineUsersPanel = (function() {

    const initialize = function() {
        // Submit event for the input form
        $("#join-input-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the message content
            const content = $("#room").val().trim();

            // window.location.href = "/chat.html?room=" + content;

            // alert(content);

            Socket.joinRoom(content);


            // socket = Socket.getSocket();
            // socket.emit('joinRoom', room );

			// Clear the message
            $("#room").val("");
        });
    };

    // This function updates the online users panel
    const update = function(onlineUsers) {
        const onlineUsersArea = $("#online-users-area");


        // Clear the online users area
        onlineUsersArea.empty();

		// Get the current user
        const currentUser = Authentication.getUser();

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                onlineUsersArea.append(
                    $("<div id='username-" + username + "'></div>")
                        .append(UI.getUserDisplay(onlineUsers[username]))
                );
            }
        }
    };


    return { initialize, update};

})();

const GamePanel = (function() {

    let player = ""

    const setPlayer = function(x){
        player = x;
    }

    const getPlayer = function(){return player;}

    const initialize = function() {
        $("#start-game").hide();
    }

    const FirstUser = function() {
        $("#topInfoText").text("Waiting for other player to join the game.");
    }

    const startGame = function() {

        if (player == "player1") {
            $("#topInfoText").text("Player 1 please click start to start the game");

            $("#start-game").show();

            $("#start-game").on("click", function(){
                game_logic.initGame();
                $("#start-game").hide();
                console.log(player)
            });
        }
        if (player == "player2") {
            $("#topInfoText").text("Wait player 1 to start the game");

        }
    }

    return {initialize, startGame, FirstUser, setPlayer, getPlayer};
})();


const GameInit = (function() {

    const initialize = function(isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards) {

        if(GamePanel.getPlayer() == "player1"){            
            for( var i = 0; i < player2Deck.length; i++){
                $("#upperDeck").append($("<img src='./asssets/card-back.png'>"));
            }

            for( var i = 0; i < player1Deck.length; i++){
                $("#downerDeck").append($("<img src='./asssets/cards-front/" + player1Deck[i] + ".png'>"));
            }
        }
        if(GamePanel.getPlayer() == "player2"){
            for( var i = 0; i < player1Deck.length; i++){
                $("#upperDeck").append($("<img src='./asssets/card-back.png'>"));
            }
            
            for( var i = 0; i < player2Deck.length; i++){
                $("#downerDeck").append($("<img src='./asssets/cards-front/" + player2Deck[i] + ".png'>"));
            }
        }


    }

    return { initialize };
})();


const GameRunning = (function(){

    const updateGame = function(){
        //change data


        // check winning condition 
        // if (getWinner != ""){
            //break; 
            //GameEnd
        //}
    }


    return {updateGame};

})();



const UI = (function() {

    const components = [SignInForm, HomePanel, OnlineUsersPanel, GamePanel];

    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { initialize };

})();
  
//  //  TODO: Call game.js
