const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Game state
let gameState = {
  categories: [
    {
      name: '"SHIP" HAPPENS',
      questions: [
        { value: 200, question: 'This prophet was commanded to build a ship "not after the manner of men."', answer: 'Who is Nephi?', used: false },
        { value: 400, question: 'These tight, "dish-like" vessels carried the Jaredites across the ocean for 344 days.', answer: 'What are Barges?', used: false },
        { value: 600, question: 'While sailing to the promised land, this brother of Nephi caused trouble by dancing and singing "with much rudeness."', answer: 'Who is Laman (or Lemuel)?', used: false },
        { value: 800, question: 'This man built a ship and sailed into the West Sea, never to be heard from again.', answer: 'Who is Hagoth?', used: false },
        { value: 1000, question: 'The Jaredites used these 16 items, touched by the finger of the Lord, to provide light in their ships.', answer: 'What are Stones/Crystals?', used: false },
      ]
    },
    {
      name: 'DREAM A LITTLE DREAM',
      questions: [
        { value: 200, question: 'Lehi saw a vision of this specific object, whose fruit was "desirable to make one happy."', answer: 'What is the Tree of Life?', used: false },
        { value: 400, question: 'In Lehi\'s dream, this structure represented the "vain imaginations and the pride of the children of men."', answer: 'What is the Great and Spacious Building?', used: false },
        { value: 600, question: 'This king gathered his people at the temple to hear about a vision an angel gave him regarding the coming of Christ.', answer: 'Who is King Benjamin?', used: false },
        { value: 800, question: 'He was a lawyer who tried to bribe Amulek, but later had a vision-like conversion after being healed of a burning fever.', answer: 'Who is Zeezrom?', used: false },
        { value: 1000, question: 'This brother of Jared saw the Lord\'s finger and eventually His entire spirit body because of his "exceeding faith."', answer: 'Who is Mahonri Moriancumer?', used: false },
      ]
    },
    {
      name: 'WEAPONS OF WAR',
      questions: [
        { value: 200, question: 'The Anti-Nephi-Lehies buried these deep in the earth as a covenant of peace.', answer: 'What are Swords?', used: false },
        { value: 400, question: 'Captain Moroni used this personal garment to write the "Title of Liberty."', answer: 'What is his Coat?', used: false },
        { value: 600, question: 'This Lamanite king\'s guards had their arms chopped off by Ammon while defending the king\'s sheep.', answer: 'Who is King Lamoni?', used: false },
        { value: 800, question: 'This specific sword was passed down through generations, originally belonging to a ruler in Jerusalem.', answer: 'What is the Sword of Laban?', used: false },
        { value: 1000, question: 'This group of 2,000 young men chose "liberty" and "life" over their enemies, led by Helaman.', answer: 'Who are the Stripling Warriors?', used: false },
      ]
    },
    {
      name: 'NAME THAT "CITY"',
      questions: [
        { value: 200, question: 'This was the primary capital city of the Nephites for much of the book.', answer: 'What is Zarahemla?', used: false },
        { value: 400, question: 'Lehi and his family originally fled from this famous Judean city.', answer: 'What is Jerusalem?', used: false },
        { value: 600, question: 'This city "sunk into the depths of the sea" during the destructions at Christ\'s death.', answer: 'What is the City of Moroni?', used: false },
        { value: 800, question: 'This land was located "northward" and was where the Jaredites were destroyed.', answer: 'What is the Land of Desolation?', used: false },
        { value: 1000, question: 'Alma the Elder established a church in the "Place of Mormon" near these famous waters.', answer: 'What are the Waters of Mormon?', used: false },
      ]
    },
    {
      name: '"A" IS FOR ANCIENT',
      questions: [
        { value: 200, question: 'He was a wicked priest of King Noah who later repented.', answer: 'Who is Alma?', used: false },
        { value: 400, question: 'This was the mountain where the Gold Plates were buried for centuries.', answer: 'What is the Hill Cumorah?', used: false },
        { value: 600, question: 'He was the son of Mosiah who served a 14-year mission to the Lamanites.', answer: 'Who is Ammon?', used: false },
        { value: 800, question: 'This city was known for its "Rameumptom" or holy stand.', answer: 'What is Antionum?', used: false },
        { value: 1000, question: 'This prophet stood before King Noah and testified boldly, ultimately being put to death by fire.', answer: 'Who is Abinadi?', used: false },
      ]
    },
    {
      name: 'THE "SMALL" PLATES',
      questions: [
        { value: 200, question: 'This is the very first book in the Book of Mormon.', answer: 'What is 1 Nephi?', used: false },
        { value: 400, question: 'This prophet wrote the shortest book (only 27 verses) about the Nephite-Lamanite wars.', answer: 'Who is Enos?', used: false },
        { value: 600, question: 'This prophet was the last to write in the Book of Mormon.', answer: 'Who is Moroni?', used: false },
        { value: 800, question: 'These three men were the "Three Witnesses" who saw the plates and the Angel Moroni.', answer: 'Who are Oliver Cowdery, David Whitmer, and Martin Harris?', used: false },
        { value: 1000, question: 'This man was the "keeper of the records" who wrote the first part of the book of Omni.', answer: 'Who is Omni?', used: false },
      ]
    }
  ],
  players: {},
  buzzOrder: [],
  currentQuestion: null,
  questionRevealed: false,
  buzzersOpen: false,
  gamePhase: 'board' // board, question, buzzing, answering
};

// Admin socket tracking
let adminSocket = null;

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // Admin joins
  socket.on('admin:join', () => {
    adminSocket = socket;
    socket.emit('game:state', gameState);
    console.log('Admin connected');
  });

  // Player joins (or rejoins)
  socket.on('player:join', (name) => {
    const playerId = socket.id;
    // Check if this player was already in the game (reconnecting)
    const existing = Object.entries(gameState.players).find(([id, p]) => p.name === name);
    if (existing) {
      const [oldId, oldPlayer] = existing;
      // Transfer score to new socket id
      gameState.players[playerId] = { name, score: oldPlayer.score, id: playerId };
      if (oldId !== playerId) delete gameState.players[oldId];
      // Update any buzz order references
      gameState.buzzOrder.forEach(b => { if (b.id === oldId) b.id = playerId; });
    } else {
      gameState.players[playerId] = { name, score: 0, id: playerId };
    }
    io.emit('players:update', gameState.players);
    socket.emit('player:registered', { id: playerId, name });
    // Send current game state so reconnecting player is in sync
    if (gameState.currentQuestion) {
      socket.emit('question:reveal', gameState.currentQuestion);
      if (gameState.buzzersOpen) socket.emit('buzzers:open');
    }
    console.log(`Player joined: ${name}`);
  });

  // Admin selects a question
  socket.on('admin:selectQuestion', ({ catIndex, qIndex }) => {
    const cat = gameState.categories[catIndex];
    const q = cat.questions[qIndex];
    if (q.used) return;

    gameState.currentQuestion = { catIndex, qIndex, category: cat.name, ...q };
    gameState.questionRevealed = true;
    gameState.buzzersOpen = false;
    gameState.buzzOrder = [];
    gameState.gamePhase = 'question';

    io.emit('question:reveal', gameState.currentQuestion);
    if (adminSocket) adminSocket.emit('game:state', gameState);
  });

  // Admin opens buzzers
  socket.on('admin:openBuzzers', () => {
    gameState.buzzersOpen = true;
    gameState.buzzOrder = [];
    gameState.gamePhase = 'buzzing';
    io.emit('buzzers:open');
    if (adminSocket) adminSocket.emit('buzz:order', gameState.buzzOrder);
  });

  // Player buzzes in
  socket.on('player:buzz', () => {
    if (!gameState.buzzersOpen) return;
    const player = gameState.players[socket.id];
    if (!player) return;
    // Prevent double buzz
    if (gameState.buzzOrder.find(b => b.id === socket.id)) return;

    const buzzTime = Date.now();
    gameState.buzzOrder.push({ id: socket.id, name: player.name, time: buzzTime });
    
    // Notify the player they buzzed in
    const position = gameState.buzzOrder.length;
    socket.emit('buzz:confirmed', position);

    if (adminSocket) adminSocket.emit('buzz:order', gameState.buzzOrder);
  });

  // Admin awards points
  socket.on('admin:awardPoints', ({ playerId, correct }) => {
    if (!gameState.currentQuestion) return;
    const value = gameState.currentQuestion.value;
    if (correct && gameState.players[playerId]) {
      gameState.players[playerId].score += value;
    } else if (!correct && gameState.players[playerId]) {
      gameState.players[playerId].score -= value;
    }
    io.emit('players:update', gameState.players);
  });

  // Admin closes question / returns to board
  socket.on('admin:closeQuestion', () => {
    if (gameState.currentQuestion) {
      const { catIndex, qIndex } = gameState.currentQuestion;
      gameState.categories[catIndex].questions[qIndex].used = true;
    }
    gameState.currentQuestion = null;
    gameState.questionRevealed = false;
    gameState.buzzersOpen = false;
    gameState.buzzOrder = [];
    gameState.gamePhase = 'board';
    io.emit('question:close');
    if (adminSocket) adminSocket.emit('game:state', gameState);
  });

  // Admin updates categories/questions
  socket.on('admin:updateGame', (categories) => {
    gameState.categories = categories;
    io.emit('game:state', gameState);
  });

  // Admin resets game
  socket.on('admin:resetGame', () => {
    gameState.categories.forEach(cat => {
      cat.questions.forEach(q => { q.used = false; });
    });
    Object.keys(gameState.players).forEach(id => {
      gameState.players[id].score = 0;
    });
    gameState.currentQuestion = null;
    gameState.questionRevealed = false;
    gameState.buzzersOpen = false;
    gameState.buzzOrder = [];
    gameState.gamePhase = 'board';
    io.emit('game:state', gameState);
    io.emit('question:close');
    io.emit('players:update', gameState.players);
  });

  // Admin manually adjusts score
  socket.on('admin:adjustScore', ({ playerId, amount }) => {
    if (gameState.players[playerId]) {
      gameState.players[playerId].score += amount;
      io.emit('players:update', gameState.players);
    }
  });

  // Show answer to all
  socket.on('admin:showAnswer', () => {
    if (gameState.currentQuestion) {
      io.emit('answer:reveal', gameState.currentQuestion.answer);
    }
  });

  socket.on('disconnect', () => {
    // Don't delete players immediately - give them time to reconnect
    // Mark them as disconnected, clean up after 5 minutes
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].disconnectedAt = Date.now();
      // Clean up after 5 minutes if they haven't reconnected
      setTimeout(() => {
        if (gameState.players[socket.id] && gameState.players[socket.id].disconnectedAt) {
          delete gameState.players[socket.id];
          io.emit('players:update', gameState.players);
        }
      }, 5 * 60 * 1000);
    }
    if (adminSocket && adminSocket.id === socket.id) {
      adminSocket = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Jeopardy server running on port ${PORT}`);
});
