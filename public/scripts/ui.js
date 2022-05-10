const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#signin-overlay").hide();
        $("#gamePage").hide();

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

    let inRoom = "no response"

    const setInRoom = function(x){
        inRoom = x;
        console.log("setinroom"+inRoom)
    }

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
            

            $("#leave").on("click", function(){
                console.log("checking if in room")
                Socket.checkInRoom()
                console.log(inRoom)
                if (inRoom === "yes"){
                    console.log("leaving room")
                    Socket.leaveRoom();
                }
                if (inRoom === "no"){
                    console.log("leaving room fail")
                }
            });


            // socket = Socket.getSocket();
            // socket.emit('joinRoom', room );

			// Clear the message
            $("#room").val("");
        });
    };


    // // This function updates the online users panel
    // const update = function(onlineUsers) {
    //     const onlineUsersArea = $("#online-users-area");



    //     // Clear the online users area
    //     onlineUsersArea.empty();

	// 	// Get the current user
    //     const currentUser = Authentication.getUser();

    //     // Add the user one-by-one
    //     for (const username in onlineUsers) {
    //         if (username != currentUser.username) {
    //             onlineUsersArea.append(
    //                 $("<div id='username-" + username + "'></div>")
    //                     .append(UI.getUserDisplay(onlineUsers[username]))
    //             );
    //         }
    //     }
    // };


    return { initialize, setInRoom};

})();

const GamePanel = (function() {

    let player = ""

    // Need to Do : Music BGM play
    // let musicBGM = new Audio('../asssets/sound-effects/JayChou.mp3');

    const setPlayer = function(x){
        player = x;
    }

    const getPlayer = function(){return player;}

    const initialize = function() {

        $("#start-game").hide();
        $("#middleInfo").hide();

        // Need to Do : Music BGM play
        // $("music").on("click", function() {
        //     if($("#music").val() === "ON") {
        //         $("#music").attr('value', "OFF");
        //         console.log("Music OFF");
        //     }
        //     if($("#music").val() === "OFF") {
        //         $("#music").attr('value', "ON");
        //         console.log("Music ON");
        //     }
        // })

        $("#leave").on("click", function() {
            // Need Help : @Evan
            console.log("Leave Button onClick");    // <- Success 
            $("#home-container-overlay").show();    // 要把homepage show回來

        });

    }

    const FirstUser = function() {
        $("#topInfoText").text("Waiting other player...");
    }

    const startGame = function() {

        if (player === "player1") {
            $("#topInfoText").text("Please click the start button.");

            $("#start-game").show();

            $("#start-game").on("click", function(){
                game_logic.initGame();
                $("#start-game").hide();
            });
        }
        if (player === "player2") {
            $("#topInfoText").text("Wait for start the game.");

        }
    }

    return {initialize, startGame, FirstUser, setPlayer, getPlayer};
})();


const GameInit = (function() {

    const initialize = function(isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards) {

        $("#middleInfo").show();
        $("#topInfoText").text(whoseTurn + " Turn");
        $("#room-role").text("You are " + GamePanel.getPlayer());
        // $("#playerView img").style.width = "calc(780px /" +  + ")";

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

        // $("#playedPile").append($("<img src='./asssets/cards-front/" + playedPile[playedPile.length -1] + ".png'>"));
        $("#playedPile").attr('src', "./asssets/cards-front/" + playedPile[playedPile.length -1] + ".png");

        console.log({isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards});

        console.log(GamePanel.getPlayer())

        GameRunning.checkClick(isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards);
    }

    return { initialize };
})();

const GameRunning = (function() {

    const checkClick = function(isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards) {

        console.log("IT CLICKED.");
        
        $("#downerDeck img").on("click", function() {
            var src = $(this).attr("src");
            src = src.replace("./asssets/cards-front/", "");
            var cardPlayed = src.replace(".png", "");
            console.log(cardPlayed);

            if(whoseTurn === GamePanel.getPlayer()) {
                game_logic.onCardPlayed(cardPlayed);
            }

        });

        $(document).on("keydown", function(e) {
            if (e.keyCode == 32) {
                console.log("Cheat Mode On");
                game_logic.cheatFunction(GamePanel.getPlayer());
            }
        });

        $("#drawPile").on("click", function() {
            if(whoseTurn === GamePanel.getPlayer()) {
                console.log("drawPile clicked in ui.js");
                console.log("whoseTurn: " + whoseTurn + " | browser player: " + GamePanel.getPlayer());
                // Need Help: 可以成功socket emit和 socket on
                // 問題 1 ：不管是player 1還是player 2 click 了, 都是兩邊同時增加2張牌，上面那句console.log 的結果，感覺是whoseTurn沒有更新的問題
                // 問題 2 ：不管哪個player click，上半部分的卡牌都會增加特別多，增加數量沒有規定，暫時不知道是什麼問題。
                game_logic.onCardDrawn();
                console.log("drawPile clicked end in ui.js");
            }
            else{}
        });

        $("#unoButton").on("click", function() {
            // Need Help : 不知道要不要加其他要求
            if(whoseTurn === GamePanel.getPlayer()) {
                console.log("Uno Button onClick");
                game_logic.setUnoPressed(true);
            }
        });
    }

    const updateGame = function(isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards) {
        
        if (!isGameOver) {
            console.log("HI update Game now");
            console.log({isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards});

            $("#topInfoText").text(whoseTurn + " Turn");
            $("#room-role").text("You are " + GamePanel.getPlayer()+ currentNumber + currentColor);
    
            $("#upperDeck").empty();
            $("#downerDeck").empty();

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
    
            $("#playedPile").attr('src', "./asssets/cards-front/" + playedPile[playedPile.length -1] + ".png");
    
            GameRunning.checkClick(isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards);
        }
        else {
            GameEnd.GameEndWin(winner);
        }
    }

    return { checkClick, updateGame};

})();

const GameEnd = (function() {

    const GameEndWin = function(winner) {
        console.log("Game Over" + winner);
    }

    return { GameEndWin };

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
  

