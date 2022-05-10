// main game 
var game_logic = (function() {

    //init card settings
    const NUM_FOR_SKIP_CARD = 100;    
    const NUM_FOR_D2_CARD = 200;    
    const NUM_FOR_WILDCARD = 300;
    const NUM_FOR_D4_CARD = 400;

    //init objects in socket 
    let isGameOver = true;
    let winner = '';
    let whoseTurn = '';
    let player1Deck = [];
    let player2Deck = [];
    let drawPile = [];
    let playedPile = [];
    let currentNumber = '';
    let currentColor = '';
    let player1MaxNumCards = player1Deck.length;
    let player2MaxNumCards = player2Deck.length;


    /*
    let player1TimeSpent = 0;
    let player1RoundsPlayed = 0;
    let player2TimeSpent =0;
    let player2RoundsPlayed = 0;
    */
    
    //init other objects
    let unoPressed = false; 
    let ALL_CARDS = helperFunction.getAllCards();
    let isMuted = false;

    //Get Functions 
    const getIsGameOver = () => {return isGameOver}
    const getWinner = () => {return winner}
    const getWhoseturn = () => {return whogeturn}
    const getPlayer1Deck = () => {return player1Deck}
    const getPlayer2Deck = () => {return player2Deck}
    const getDrawPile = () => {return drawPile}
    const getPlayedPile = () => {return playedPile}
    const getCurrentNumber = () => {return currentNumber}
    const getCurrentColor = () => {return currentColor}
    const getPlayer1MaxNumCards = () => {return player1MaxNumCards}
    const getPlayer2MaxNumCards = () => {return player2MaxNumCards}
    const getIsMuted = () => {return isMuted;}
   

    //setters
    const setIsGameOver = (x) => {isGameOver = x;}
    const setWinner = (x) => {winner = x;}
    const setWhoseTurn = (x) => {whoseTurn = x;}
    const setPlayer1Deck = (x) => {player1Deck = x;}
    const setPlayer2Deck = (x) => {player2Deck = x;}
    const setDrawPile = (x) => {drawPile = x;}
    const setPlayedPile = (x) => {playedPile = x;}
    const setCurrentNumber = (x) => {currentNumber = x;}
    const setCurrentColor = (x) => {currentColor = x;}
    const setPlayer1MaxNumCards = (x) => {player1MaxNumCards = x;}
    const setPlayer2MaxNumCards = (x) => {player2MaxNumCards = x;}
    const setIsMuted = (x) => {isMuted = x;}

    /*
    const setPlayer1TimeSpent = (x) => {player1TimeSpent = x;}
    const setPlayer1RoundsPlayed = (x) => {player1RoundsPlayed = x;}
    const setPlayer2TimeSpent = (x) => {player2TimeSpent = x;}
    const setPlayer2RoundsPlayed = (x) => {player2RoundsPlayed = x;}
    */

    //ui.js will call this
    const setUnoPressed = (x) => {unoPressed = x;}

    // Sound Handler
    const playShuffleSound = () =>{
        var shuffleSound = document.getElementById('soundEffect')
        console.log("button is now: "+ !isMuted + "play some sound")
        shuffleSound.play()
    }

    // Other helper functions
    const checkGameOver = (playerDeck) =>{
        if(playerDeck.length === 0) return true;
        else return false;
    }

    const checkWinner = (playerDeck, player) =>{
        if(playerDeck.length === 0) return player;
        else return '';
    }

    let socket = Socket.getSocket();

     //  Socket on functions 
     socket.on("initGameState",({isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards}) =>{
        setIsGameOver(isGameOver);
        setWinner(winner);
        setWhoseTurn(whoseTurn);
        setPlayer1Deck(player1Deck);
        setPlayer2Deck(player2Deck);
        setDrawPile(drawPile);
        setPlayedPile(playedPile);
        setCurrentNumber(currentNumber);
        setCurrentColor(currentColor);
        setPlayer1MaxNumCards(player1MaxNumCards);
        setPlayer2MaxNumCards(player2MaxNumCards);

        // Reset Uno button
        setUnoPressed(false);

        GameInit.initialize(isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards);

    });

    socket.on("updateGameState",({isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards}) =>{
        setIsGameOver(isGameOver);
        setWinner(winner);
        setWhoseTurn(whoseTurn);
        setPlayer1Deck(player1Deck);
        setPlayer2Deck(player2Deck);
        setDrawPile(drawPile);
        setPlayedPile(playedPile);
        setCurrentNumber(currentNumber);
        setCurrentColor(currentColor);
        setPlayer1MaxNumCards(player1MaxNumCards);
        setPlayer2MaxNumCards(player2MaxNumCards);

        // Reset Uno button
        setUnoPressed(false);

        GameRunning.updateGame(isGameOver,winner,whoseTurn,player1Deck,player2Deck,drawPile,playedPile,currentNumber,currentColor,player1MaxNumCards,player2MaxNumCards);

        
    });



    // Run 1 time on game start
    const initGame = function() {

        // shuffle the all cards pile
        const shuffledCards = helperFunction.shuffleCards(ALL_CARDS);
        
        // assign to players
        setPlayer1Deck(shuffledCards.splice(0,7));
        setPlayer2Deck(shuffledCards.splice(0,7));

        // find the fist card to deal (only be number cards)
        let startingIndex = 0;
        while(true){
            if(shuffledCards[startingIndex]==='skipR' || shuffledCards[startingIndex]==='_R' || shuffledCards[startingIndex]==='D2R' ||
            shuffledCards[startingIndex]==='skipG' || shuffledCards[startingIndex]==='_G' || shuffledCards[startingIndex]==='D2G' ||
            shuffledCards[startingIndex]==='skipB' || shuffledCards[startingIndex]==='_B' || shuffledCards[startingIndex]==='D2B' ||
            shuffledCards[startingIndex]==='skipY' || shuffledCards[startingIndex]==='_Y' || shuffledCards[startingIndex]==='D2Y' ||
            shuffledCards[startingIndex]==='W' || shuffledCards[startingIndex]==='D4W'){
                startingIndex = startingIndex + 1;
                continue;
            } 
            else break;
        }

        // deal the first card 
        setPlayedPile(shuffledCards.splice(startingIndex,1));
        
        // set the number & color of the card dealt
        setCurrentNumber(playedPile[0].charAt(0));
        setCurrentColor(playedPile[0].charAt(playedPile[0].length-1));

        // set draw pile
        setDrawPile(shuffledCards);

        // set maxNumCards
        if (player1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(player1Deck.length)
        if (player2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(player2Deck.length)

        // here everything is set up, use socket to transmit info
        socket.emit("initGameState",{
            isGameOver: false,
            winner: '',
            whoseTurn: 'player1',
            player1Deck: [...player1Deck],
            player2Deck: [...player2Deck],
            drawPile: [...drawPile],
            playedPile: [...playedPile],
            currentNumber: currentNumber,
            currentColor: currentColor,
            player1MaxNumCards: player1MaxNumCards,
            player2MaxNumCards: player2MaxNumCards
        });
    }

    const onCardPlayed = (playedCard) =>{
        console.log("1")
        switch(playedCard){
            // case where it's number card or reverse card
            case '0R': case '1R': case '2R': case '3R': case '4R': case '5R': case '6R': case '7R': case '8R': case '9R': case '_R': case '0G': case '1G': case '2G': case '3G': case '4G': case '5G': case '6G': case '7G': case '8G': case '9G': case '_G': case '0B': case '1B': case '2B': case '3B': case '4B': case '5B': case '6B': case '7B': case '8B': case '9B': case '_B': case '0Y': case '1Y': case '2Y': case '3Y': case '4Y': case '5Y': case '6Y': case '7Y': case '8Y': case '9Y': case '_Y': {
                // Save the number & color of the card played
                const playedCardNumber = playedCard.charAt(0);
                const playedCardColor = playedCard.charAt(1);

                console.log("1a")

                if(currentColor === playedCardColor || currentNumber === playedCardNumber){
                    if(whoseTurn === 'player1'){
                        // Save the index on player's deck for the playedCard 
                        const deckIndex = player1Deck.indexOf(playedCard);

                        console.log("2")
                        // didn't press uno
                        if(player1Deck.length === 2 && !unoPressed){
                            alert('Did not press Uno.');
                            const copyOfDrawPile = [...drawPile];
                            // pop 2 cards to add to player1Deck
                            const drawCard1 = copyOfDrawPile.pop();
                            const drawCard2 = copyOfDrawPile.pop();

                            // update deck
                            const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1),drawCard1,drawCard2];
                            const updatedPlayer2Deck = [...player2Deck];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer1Deck),
                                winner: checkWinner(updatedPlayer1Deck, 'player1'),
                                whoseTurn: 'player2',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards: player2MaxNumCards
                            });
                        }
                        else{   
                            const copyOfDrawPile = [...drawPile];
                            console.log("3")
                            // update deck
                            const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1)];
                            const updatedPlayer2Deck = [...player2Deck];
                            console.log("4")

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);
                            console.log({updatedPlayer1Deck,updatedPlayer2Deck,drawPile,copyOfDrawPile,playedPile})
                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer1Deck),
                                winner: checkWinner(updatedPlayer1Deck, 'player1'),
                                whoseTurn: 'player2',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards: player2MaxNumCards
                            });
                        }
                    }
                    else{
                        // Save the index on player's deck for the playedCard 
                        const deckIndex = player2Deck.indexOf(playedCard);
                        // didn't press uno
                        if(player2Deck.length === 2 && !unoPressed){
                            alert('Did not press Uno.');
                            const copyOfDrawPile = [...drawPile];
                            // pop 2 cards to add to player2Deck
                            const drawCard1 = copyOfDrawPile.pop();
                            const drawCard2 = copyOfDrawPile.pop();

                            // update deck
                            const updatedPlayer1Deck = [...player1Deck];
                            const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1),drawCard1,drawCard2];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer2Deck),
                                winner: checkWinner(updatedPlayer2Deck, 'player2'),
                                whoseTurn: 'player1',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards, player2MaxNumCards
                            });
                        }
                        else{
                            
                            const copyOfDrawPile = [...drawPile];
                            // update deck
                            const updatedPlayer1Deck = [...player1Deck];
                            const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1)];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer2Deck),
                                winner: checkWinner(updatedPlayer2Deck, 'player2'),
                                whoseTurn: 'player1',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards: player2MaxNumCards
                            });
                        }
                    }
                }
                else{
                    alert("Invalid Move! Play another card.");
                }
                break;
            }

            case 'skipR': case 'skipG': case 'skipB': case 'skipY':{
                // Save the number & color of the card played
                const playedCardNumber = NUM_FOR_SKIP_CARD;
                const playedCardColor = playedCard.charAt(playedCard.length-1);

                if(currentColor === playedCardColor || currentNumber === playedCardNumber){
                    if(whoseTurn === 'player1'){
                        // Save the index on player's deck for the playedCard 
                        const deckIndex = player1Deck.indexOf(playedCard);
                        // didn't press uno
                        if(player1Deck.length === 2 && !unoPressed){
                            alert('Did not press Uno.');
                            const copyOfDrawPile = [...drawPile];
                            // pop 2 cards to add to player1Deck
                            const drawCard1 = copyOfDrawPile.pop();
                            const drawCard2 = copyOfDrawPile.pop();

                            // update deck
                            const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1),drawCard1,drawCard2];
                            const updatedPlayer2Deck = [...player2Deck];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer1Deck),
                                winner: checkWinner(updatedPlayer1Deck, 'player1'),
                                whoseTurn: 'player1',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards: player2MaxNumCards
                            });
                        }
                        else{ 
                            const copyOfDrawPile = [...drawPile];

                            // update deck
                            const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1)];
                            const updatedPlayer2Deck = [...player2Deck];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer1Deck),
                                winner: checkWinner(updatedPlayer1Deck, 'player1'),
                                whoseTurn: 'player1',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards: player2MaxNumCards
                            });
                        }
                    }
                    else{
                        // Save the index on player's deck for the playedCard 
                        const deckIndex = player2Deck.indexOf(playedCard);
                        // didn't press uno
                        if(player2Deck.length === 2 && !unoPressed){
                            alert('Did not press Uno.');
                            const copyOfDrawPile = [...drawPile];
                            // pop 2 cards to add to player2Deck
                            const drawCard1 = copyOfDrawPile.pop();
                            const drawCard2 = copyOfDrawPile.pop();

                            // update deck
                            const updatedPlayer1Deck = [...player1Deck];
                            const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1),drawCard1,drawCard2];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer2Deck),
                                winner: checkWinner(updatedPlayer2Deck, 'player2'),
                                whoseTurn: 'player2',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards, player2MaxNumCards
                            });
                        }
                        else{   
                            const copyOfDrawPile = [...drawPile];
                            // update deck
                            const updatedPlayer1Deck = [...player1Deck];
                            const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1)];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer2Deck),
                                winner: checkWinner(updatedPlayer2Deck, 'player2'),
                                whoseTurn: 'player2',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards, player2MaxNumCards
                            });
                        }
                    }
                }
                else{
                    alert("Invalid Move! Play another card.");
                }
                break;
            }
            
            case 'D2R': case 'D2G': case 'D2B': case 'D2Y':{ 
                // Save the number & color of the card played
                const playedCardNumber = NUM_FOR_D2_CARD;
                const playedCardColor = playedCard.charAt(playedCard.length-1);

                if(currentColor === playedCardColor || currentNumber === playedCardNumber){
                    if(whoseTurn === 'player1'){
                        // Save the index on player's deck for the playedCard 
                        const deckIndex = player1Deck.indexOf(playedCard);
                        const copyOfDrawPile = [...drawPile];
                        // For +2
                        const drawCard1forD2 = copyOfDrawPile.pop();
                        const drawCard2forD2 = copyOfDrawPile.pop();

                        // didn't press uno
                        if(player1Deck.length === 2 && !unoPressed){
                            alert('Did not press Uno.');
                            
                            // pop 2 cards to add to player1Deck
                            const drawCard1 = copyOfDrawPile.pop();
                            const drawCard2 = copyOfDrawPile.pop();

                            // update deck
                            const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1),drawCard1,drawCard2];
                            const updatedPlayer2Deck = [...player2Deck,drawCard1forD2,drawCard2forD2];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();

                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer1Deck),
                                winner: checkWinner(updatedPlayer1Deck, 'player1'),
                                whoseTurn: 'player1',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards, player2MaxNumCards
                            });
                        }
                        else{   
                            const copyOfDrawPile = [...drawPile];
                            // update deck
                            const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1)];
                            const updatedPlayer2Deck = [...player2Deck,drawCard1forD2,drawCard2forD2];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer1Deck),
                                winner: checkWinner(updatedPlayer1Deck, 'player1'),
                                whoseTurn: 'player1',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards, player2MaxNumCards
                            });
                        }
                    }
                    else{
                        // Save the index on player's deck for the playedCard 
                        const deckIndex = player2Deck.indexOf(playedCard);
                        const copyOfDrawPile = [...drawPile];
                        // For +2
                        const drawCard1forD2 = copyOfDrawPile.pop();
                        const drawCard2forD2 = copyOfDrawPile.pop();
                        // didn't press uno
                        if(player2Deck.length === 2 && !unoPressed){
                            alert('Did not press Uno.');
                            // pop 2 cards to add to player2Deck
                            const drawCard1 = copyOfDrawPile.pop();
                            const drawCard2 = copyOfDrawPile.pop();

                            // update deck
                            const updatedPlayer1Deck = [...player1Deck,drawCard1forD2,drawCard2forD2];
                            const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1),drawCard1,drawCard2];

                            // update maxNumCards
                            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer2Deck),
                                winner: checkWinner(updatedPlayer2Deck, 'player2'),
                                whoseTurn: 'player2',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards, player2MaxNumCards
                            });
                        }
                        else{   
                            const copyOfDrawPile = [...drawPile];
                             // update deck
                             const updatedPlayer1Deck = [...player1Deck,drawCard1forD2,drawCard2forD2];
                             const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1)];
 
                             // update maxNumCards
                             if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                             if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                            // play sound
                            if (isMuted == false) playShuffleSound();
                            //send socket
                            socket.emit("updateGameState",{
                                isGameOver: checkGameOver(updatedPlayer2Deck),
                                winner: checkWinner(updatedPlayer2Deck, 'player2'),
                                whoseTurn: 'player2',
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...updatedPlayer2Deck],
                                drawPile: [...copyOfDrawPile],
                                playedPile: [...playedPile,playedCard],
                                currentNumber: playedCardNumber,
                                currentColor: playedCardColor,
                                player1MaxNumCards: player1MaxNumCards,
                                player2MaxNumCards: player2MaxNumCards
                            });
                        }
                    }
                }
                else{
                    alert("Invalid Move! Play another card.");
                }
                break;
            }

            case 'W':{

                if(whoseTurn === 'player1'){

                    const playedCardNumber = NUM_FOR_WILDCARD;
                    // Let player choose color
                    const playedCardColor = prompt('Choose a new color (R/G/B/Y)').toUpperCase()
                    
                    // Save the index on player's deck for the playedCard 
                    const deckIndex = player1Deck.indexOf(playedCard);
                    // didn't press uno
                    if(player1Deck.length === 2 && !unoPressed){
                        alert('Did not press Uno.');
                        const copyOfDrawPile = [...drawPile];
                        // pop 2 cards to add to player1Deck
                        const drawCard1 = copyOfDrawPile.pop();
                        const drawCard2 = copyOfDrawPile.pop();

                        // update deck
                        const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1),drawCard1,drawCard2];
                        const updatedPlayer2Deck = [...player2Deck];
 
                        // update maxNumCards
                        if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                        if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                        // play sound
                        if (isMuted == false) playShuffleSound();
                        //send socket
                        socket.emit("updateGameState",{
                            isGameOver: checkGameOver(updatedPlayer1Deck),
                            winner: checkWinner(updatedPlayer1Deck, 'player1'),
                            whoseTurn: 'player2',
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...updatedPlayer2Deck],
                            drawPile: [...copyOfDrawPile],
                            playedPile: [...playedPile,playedCard],
                            currentNumber: playedCardNumber,
                            currentColor: playedCardColor,
                            player1MaxNumCards: player1MaxNumCards,
                            player2MaxNumCards, player2MaxNumCards
                        });
                    }
                    else{   
                        const copyOfDrawPile = [...drawPile];
                        // update deck
                        const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1)];
                        const updatedPlayer2Deck = [...player2Deck];
 
                        // update maxNumCards
                        if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                        if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                        // play sound
                        if (isMuted == false) playShuffleSound();
                        //send socket
                        socket.emit("updateGameState",{
                            isGameOver: checkGameOver(updatedPlayer1Deck),
                            winner: checkWinner(updatedPlayer1Deck, 'player1'),
                            whoseTurn: 'player2',
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...updatedPlayer2Deck],
                            drawPile: [...copyOfDrawPile],
                            playedPile: [...playedPile,playedCard],
                            currentNumber: playedCardNumber,
                            currentColor: playedCardColor,
                            player1MaxNumCards: player1MaxNumCards,
                            player2MaxNumCards: player2MaxNumCards
                        });
                    }
                }
                else{
                    const playedCardNumber = NUM_FOR_WILDCARD;
                    // Let player choose color
                    const playedCardColor = prompt('Choose a new color (R/G/B/Y)').toUpperCase()

                    // Save the index on player's deck for the playedCard 
                    const deckIndex = player2Deck.indexOf(playedCard);
                    // didn't press uno
                    if(player2Deck.length === 2 && !unoPressed){
                        alert('Did not press Uno.');
                        const copyOfDrawPile = [...drawPile];
                        // pop 2 cards to add to player2Deck
                        const drawCard1 = copyOfDrawPile.pop();
                        const drawCard2 = copyOfDrawPile.pop();
                        
                        // update deck
                        const updatedPlayer1Deck = [...player1Deck];
                        const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1),drawCard1,drawCard2];
 
                        // update maxNumCards
                        if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                        if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length);

                        // play sound
                        if (isMuted == false) playShuffleSound();
                        //send socket
                        socket.emit("updateGameState",{
                            isGameOver: checkGameOver(updatedPlayer2Deck),
                            winner: checkWinner(updatedPlayer2Deck, 'player2'),
                            whoseTurn: 'player1',
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...updatedPlayer2Deck],
                            drawPile: [...copyOfDrawPile],
                            playedPile: [...playedPile,playedCard],
                            currentNumber: playedCardNumber,
                            currentColor: playedCardColor,
                            player1MaxNumCards: player1MaxNumCards,
                            player2MaxNumCards: player2MaxNumCards
                        });
                    }
                    else{   
                        const copyOfDrawPile = [...drawPile];
                         // update deck
                         const updatedPlayer1Deck = [...player1Deck];
                         const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1)];
  
                         // update maxNumCards
                         if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                         if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 
                         
                        // play sound
                        if (isMuted == false) playShuffleSound();

                        //send socket
                        socket.emit("updateGameState",{
                            isGameOver: checkGameOver(updatedPlayer2Deck),
                            winner: checkWinner(updatedPlayer2Deck, 'player2'),
                            whoseTurn: 'player1',
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...updatedPlayer2Deck],
                            drawPile: [...copyOfDrawPile],
                            playedPile: [...playedPile,playedCard],
                            currentNumber: playedCardNumber,
                            currentColor: playedCardColor,
                            player1MaxNumCards: player1MaxNumCards,
                            player2MaxNumCards: player2MaxNumCards
                        });
                    }
                }
                break;
            }

            case 'D4W':{
                if(whoseTurn === 'player1'){

                    const playedCardNumber = NUM_FOR_D4_CARD;
                    // Let player choose color
                    const playedCardColor = prompt('Choose a new color (R/G/B/Y)').toUpperCase()

                    // Save the index on player's deck for the playedCard 
                    const deckIndex = player1Deck.indexOf(playedCard);
                    const copyOfDrawPile = [...drawPile];
                    // For +4
                    const drawCard1forD4 = copyOfDrawPile.pop();
                    const drawCard2forD4 = copyOfDrawPile.pop();
                    const drawCard3forD4 = copyOfDrawPile.pop();
                    const drawCard4forD4 = copyOfDrawPile.pop();

                    // didn't press uno
                    if(player1Deck.length === 2 && !unoPressed){
                        alert('Did not press Uno.');
                        
                        // pop 2 cards to add to player1Deck
                        const drawCard1 = copyOfDrawPile.pop();
                        const drawCard2 = copyOfDrawPile.pop();

                        // update deck
                        const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1),drawCard1,drawCard2];
                        const updatedPlayer2Deck = [...player2Deck,drawCard1forD4,drawCard2forD4,drawCard3forD4,drawCard4forD4];

                        // update maxNumCards
                        if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                        if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                        // play sound
                        if (isMuted == false) playShuffleSound();
                        //send socket
                        socket.emit("updateGameState",{
                            isGameOver: checkGameOver(updatedPlayer1Deck),
                            winner: checkWinner(updatedPlayer1Deck, 'player1'),
                            whoseTurn: 'player1',
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...updatedPlayer2Deck],
                            drawPile: [...copyOfDrawPile],
                            playedPile: [...playedPile,playedCard],
                            currentNumber: playedCardNumber,
                            currentColor: playedCardColor,
                            player1MaxNumCards: player1MaxNumCards,
                            player2MaxNumCards: player2MaxNumCards
                        });
                    }
                    else{
                        // update deck
                        const updatedPlayer1Deck = [...player1Deck.slice(0,deckIndex),...player1Deck.slice(deckIndex+1)];
                        const updatedPlayer2Deck = [...player2Deck,drawCard1forD4,drawCard2forD4,drawCard3forD4,drawCard4forD4];

                        // update maxNumCards
                        if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                        if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                        // play sound
                        if (isMuted == false) playShuffleSound();
                        //send socket
                        socket.emit("updateGameState",{
                            isGameOver: checkGameOver(updatedPlayer1Deck),
                            winner: checkWinner(updatedPlayer1Deck, 'player1'),
                            whoseTurn: 'player1',
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...updatedPlayer2Deck],
                            drawPile: [...copyOfDrawPile],
                            playedPile: [...playedPile,playedCard],
                            currentNumber: playedCardNumber,
                            currentColor: playedCardColor,
                            player1MaxNumCards: player1MaxNumCards,
                            player2MaxNumCards: player2MaxNumCards
                        });
                    }
                }
                else{

                    const playedCardNumber = NUM_FOR_D4_CARD;
                    // Let player choose color
                    const playedCardColor = prompt('Choose a new color (R/G/B/Y)').toUpperCase()
                    // Save the index on player's deck for the playedCard 
                    const deckIndex = player2Deck.indexOf(playedCard);
                    const copyOfDrawPile = [...drawPile];
                    // For +2
                    const drawCard1forD4 = copyOfDrawPile.pop();
                    const drawCard2forD4 = copyOfDrawPile.pop();
                    const drawCard3forD4 = copyOfDrawPile.pop();
                    const drawCard4forD4 = copyOfDrawPile.pop();

                    // didn't press uno
                    if(player2Deck.length === 2 && !unoPressed){
                        alert('Did not press Uno.');
                        // pop 2 cards to add to player2Deck
                        const drawCard1 = copyOfDrawPile.pop();
                        const drawCard2 = copyOfDrawPile.pop();

                        // update deck
                        const updatedPlayer1Deck = [...player1Deck,drawCard1forD4,drawCard2forD4,drawCard3forD4,drawCard4forD4];
                        const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1),drawCard1,drawCard2];

                        // update maxNumCards
                        if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                        if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                        // play sound
                        if (isMuted == false) playShuffleSound();
                        //send socket
                        socket.emit("updateGameState",{
                            isGameOver: checkGameOver(updatedPlayer2Deck),
                            winner: checkWinner(updatedPlayer2Deck, 'player2'),
                            whoseTurn: 'player2',
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...updatedPlayer2Deck],
                            drawPile: [...copyOfDrawPile],
                            playedPile: [...playedPile,playedCard],
                            currentNumber: playedCardNumber,
                            currentColor: playedCardColor,
                            player1MaxNumCards: player1MaxNumCards,
                            player2MaxNumCards: player2MaxNumCards
                        });
                    }
                    else{   
                        // update deck
                        const updatedPlayer1Deck = [...player1Deck,drawCard1forD4,drawCard2forD4,drawCard3forD4,drawCard4forD4];
                        const updatedPlayer2Deck = [...player2Deck.slice(0,deckIndex),...player2Deck.slice(deckIndex+1)];

                        // update maxNumCards
                        if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                        if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                        // play sound
                        if (isMuted == false) playShuffleSound();
                        //send socket
                        socket.emit("updateGameState",{
                            isGameOver: checkGameOver(updatedPlayer2Deck),
                            winner: checkWinner(updatedPlayer2Deck, 'player2'),
                            whoseTurn: 'player2',
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...updatedPlayer2Deck],
                            drawPile: [...copyOfDrawPile],
                            playedPile: [...playedPile,playedCard],
                            currentNumber: playedCardNumber,
                            currentColor: playedCardColor,
                            player1MaxNumCards: player1MaxNumCards,
                            player2MaxNumCards: player2MaxNumCards
                        });
                    }
                }
                break;
            }
        }
    }

    // On Card Drawn
    const onCardDrawn = ()=>{

        console.log("onCardDrawn in game.js");

        if(whoseTurn === 'player1' && whoseTurn === GamePanel.getPlayer()){
            //copy drawPile
            const copyOfDrawPile = [...drawPile];
            // pop one for the card drawn
            const drawnCard = copyOfDrawPile.pop();
            // extract information for drawn card
            const drawnCardNumber = drawnCard.charAt(0);
            const drawnCardColor = drawnCard.charAt(drawnCard.length-1);

            if(drawnCardColor === currentColor && (drawnCard === 'skipR'||drawnCard === 'skipG'||drawnCard === 'skipB'||drawnCard === 'skipY')){
                alert('You drew a Skip card with color ' + drawnCardColor + '. The card you drew is played for you.');

                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();
                console.log("on card drawn game.js socket emit.")
                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer1Deck),
                    winner: checkWinner(updatedPlayer1Deck, 'player1'),
                    whoseTurn: 'player1',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: NUM_FOR_SKIP_CARD,
                    currentColor: drawnCardColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }
            else if(drawnCardColor === currentColor && (drawnCard === 'D2R'||drawnCard === 'D2G'||drawnCard === 'D2B'||drawnCard === 'D2Y')){
                // pop 2 for D2
                const drawCard1forD2 = copyOfDrawPile.pop();
                const drawCard2forD2 = copyOfDrawPile.pop();

                alert('You drew a Draw 2 card with color ' + drawnCardColor + '. The card you drew is played for you.');

                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck,drawCard1forD2,drawCard2forD2];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();
                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer1Deck),
                    winner: checkWinner(updatedPlayer1Deck, 'player1'),
                    whoseTurn: 'player1',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: NUM_FOR_D2_CARD,
                    currentColor: drawnCardColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }
            else if(drawnCard === 'W'){
                alert('You drew a Wildcard. The card you drew is played for you.');

                const newColor = prompt('Choose a new color (R/G/B/Y)').toUpperCase()

                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();
                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer1Deck),
                    winner: checkWinner(updatedPlayer1Deck, 'player1'),
                    whoseTurn: 'player2',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: NUM_FOR_WILDCARD,
                    currentColor: newColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }
            else if(drawnCard === 'D4W'){
                alert('You drew a Draw 4 Wildcard. The card you drew is played for you.');

                const newColor = prompt('Choose a new color (R/G/B/Y)').toUpperCase()

                const drawCard1forD4 = copyOfDrawPile.pop();
                const drawCard2forD4 = copyOfDrawPile.pop();
                const drawCard3forD4 = copyOfDrawPile.pop();
                const drawCard4forD4 = copyOfDrawPile.pop();

                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck,drawCard1forD4,drawCard2forD4,drawCard3forD4,drawCard4forD4];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();

                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer1Deck),
                    winner: checkWinner(updatedPlayer1Deck, 'player1'),
                    whoseTurn: 'player1',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: NUM_FOR_D4_CARD,
                    currentColor: newColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });

            }   
            else if((drawnCardColor === currentColor) && (drawnCardNumber === currentNumber)){
                alert('You drew ' + drawnCard + '. The card you drew is played for you.');

                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();

                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer1Deck),
                    winner: checkWinner(updatedPlayer1Deck, 'player1'),
                    whoseTurn: 'player2',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: drawnCardNumber,
                    currentColor: drawnCardColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }         
            else{
                // update deck
                const updatedPlayer1Deck = [...player1Deck,drawnCard];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();

                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer1Deck),
                    winner: checkWinner(updatedPlayer1Deck, 'player1'),
                    whoseTurn: 'player2',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile],
                    currentNumber: currentNumber,
                    currentColor: currentColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }

        }
        else if (whoseTurn === 'player2' && whoseTurn === GamePanel.getPlayer()){ //drawn by player2
            //copy drawPile
            const copyOfDrawPile = [...drawPile];
            // pop one for the card drawn
            const drawnCard = copyOfDrawPile.pop();
            // extract information for drawn card
            const drawnCardNumber = drawnCard.charAt(0);
            const drawnCardColor = drawnCard.charAt(drawnCard.length-1);

            if(drawnCardColor === currentColor && (drawnCard === 'skipR'||drawnCard === 'skipG'||drawnCard === 'skipB'||drawnCard === 'skipY')){
                alert('You drew a Skip card with color ' + drawnCardColor+ '. The card you drew is played for you.');

                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();

                console.log("on card drawn game.js socket emit.")
                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer2Deck),
                    winner: checkWinner(updatedPlayer2Deck, 'player2'),
                    whoseTurn: 'player2',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: NUM_FOR_SKIP_CARD,
                    currentColor: drawnCardColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }
            else if(drawnCardColor === currentColor && (drawnCard === 'D2R'||drawnCard === 'D2G'||drawnCard === 'D2B'||drawnCard === 'D2Y')){
                // pop 2 for D2
                const drawCard1forD2 = copyOfDrawPile.pop();
                const drawCard2forD2 = copyOfDrawPile.pop();

                alert('You drew a Draw 2 card with color ' + drawnCardColor + '. The card you drew is played for you.');

                // update deck
                const updatedPlayer1Deck = [...player1Deck,drawCard1forD2,drawCard2forD2];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();
                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer2Deck),
                    winner: checkWinner(updatedPlayer2Deck, 'player2'),
                    whoseTurn: 'player2',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: NUM_FOR_D2_CARD,
                    currentColor: drawnCardColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }
            else if(drawnCard === 'W'){
                alert('You drew a Wildcard. The card you drew is played for you.');

                const newColor = prompt('Choose a new color (R/G/B/Y)').toUpperCase()

                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();

                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer2Deck),
                    winner: checkWinner(updatedPlayer2Deck, 'player2'),
                    whoseTurn: 'player1',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: NUM_FOR_WILDCARD,
                    currentColor: newColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }
            else if(drawnCard === 'D4W'){
                alert('You drew a Draw 4 Wildcard. The card you drew is played for you.');

                const newColor = prompt('Choose a new color (R/G/B/Y)').toUpperCase()

                const drawCard1forD4 = copyOfDrawPile.pop();
                const drawCard2forD4 = copyOfDrawPile.pop();
                const drawCard3forD4 = copyOfDrawPile.pop();
                const drawCard4forD4 = copyOfDrawPile.pop();

                // update deck
                const updatedPlayer1Deck = [...player1Deck,drawCard1forD4,drawCard2forD4,drawCard3forD4,drawCard4forD4];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();

                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer2Deck),
                    winner: checkWinner(updatedPlayer2Deck, 'player2'),
                    whoseTurn: 'player2',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: NUM_FOR_D4_CARD,
                    currentColor: newColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });

            }   
            else if((drawnCardColor === currentColor) || (drawnCardNumber === currentNumber)){
                alert('You drew ' + drawnCard + '. The card you drew is played for you.');

                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();

                console.log("on card drawn game.js socket emit.")

                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer2Deck),
                    winner: checkWinner(updatedPlayer2Deck, 'player2'),
                    whoseTurn: 'player1',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile,drawnCard],
                    currentNumber: drawnCardNumber,
                    currentColor: drawnCardColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }         
            else{
                // update deck
                const updatedPlayer1Deck = [...player1Deck];
                const updatedPlayer2Deck = [...player2Deck,drawnCard];

                // update maxNumCards
                if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
                if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

                if (isMuted == false) playShuffleSound();

                console.log("on card drawn game.js socket emit.")
                
                socket.emit("updateGameState",{
                    isGameOver: checkGameOver(updatedPlayer2Deck),
                    winner: checkWinner(updatedPlayer2Deck, 'player2'),
                    whoseTurn: 'player1',
                    player1Deck: [...updatedPlayer1Deck],
                    player2Deck: [...updatedPlayer2Deck],
                    drawPile: [...copyOfDrawPile],
                    playedPile: [...playedPile],
                    currentNumber: currentNumber,
                    currentColor: currentColor,
                    player1MaxNumCards: player1MaxNumCards,
                    player2MaxNumCards: player2MaxNumCards
                });
            }
        }
        else {}
        
    }

    const cheatFunction = (user) =>{

        if(user === 'player1' && whoseTurn === 'player1'){

            const copyOfDrawPile = [...drawPile];

            const copyOfPlayer1Deck = [...player1Deck];

            const discardCard1 = copyOfPlayer1Deck.pop();
            const discardCard2 = copyOfPlayer1Deck.pop();

            const updatedPlayer1Deck = [...player1Deck.filter((index)=>(index!=discardCard1&&index!=discardCard2))];
            const updatedPlayer2Deck = [...player2Deck];

            // update maxNumCards
            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

            if (isMuted == false) playShuffleSound();
            
            socket.emit("updateGameState",{
                isGameOver: checkGameOver(updatedPlayer1Deck),
                winner: checkWinner(updatedPlayer1Deck, 'player1'),
                whoseTurn: 'player1',
                player1Deck: [...updatedPlayer1Deck],
                player2Deck: [...updatedPlayer2Deck],
                drawPile: [...copyOfDrawPile],
                playedPile: [...playedPile],
                currentNumber: currentNumber,
                currentColor: currentColor,
                player1MaxNumCards: player1MaxNumCards,
                player2MaxNumCards: player2MaxNumCards
            });

        }
        else if(user === 'player2' && whoseTurn === 'player2'){
            const copyOfDrawPile = [...drawPile];

            const copyOfPlayer2Deck = [...player2Deck];

            const discardCard1 = copyOfPlayer2Deck.pop();
            const discardCard2 = copyOfPlayer2Deck.pop();

            const updatedPlayer1Deck = [...player1Deck];
            const updatedPlayer2Deck = [...player2Deck.filter((index)=>(index!=discardCard1&&index!=discardCard2))];

            // update maxNumCards
            if (updatedPlayer1Deck.length > player1MaxNumCards) setPlayer1MaxNumCards(updatedPlayer1Deck.length);
            if (updatedPlayer2Deck.length > player2MaxNumCards) setPlayer2MaxNumCards(updatedPlayer2Deck.length); 

            if (isMuted == false) playShuffleSound();
            
            socket.emit("updateGameState",{
                isGameOver: checkGameOver(updatedPlayer2Deck),
                winner: checkWinner(updatedPlayer2Deck, 'player2'),
                whoseTurn: 'player2',
                player1Deck: [...updatedPlayer1Deck],
                player2Deck: [...updatedPlayer2Deck],
                drawPile: [...copyOfDrawPile],
                playedPile: [...playedPile],
                currentNumber: currentNumber,
                currentColor: currentColor,
                player1MaxNumCards: player1MaxNumCards,
                player2MaxNumCards: player2MaxNumCards
            });

        }
        else{}        
        
    }

    return{ getIsGameOver, 
            getWinner, 
            getWhoseturn, 
            getPlayer1Deck, 
            getPlayer2Deck, 
            getDrawPile, 
            getPlayedPile, 
            getCurrentNumber, 
            getCurrentColor, 
            getPlayer1MaxNumCards, 
            getPlayer2MaxNumCards, 
            initGame, 
            onCardPlayed, 
            onCardDrawn, 
            playShuffleSound, 
            setUnoPressed, 
            cheatFunction,
            getIsMuted,
            setIsMuted }
})();
