const socketio = require('socket.io');
const GameMethod = require('./gameLogic');

// const corsOrigin = {
//     cors: {
//         origin: process.env.NODE_ENV === 'production' ? 'https://play-spyfall-online.herokuapp.com' : 'http://localhost:3000'
//     }
// }

module.exports.addSocket = function (server) {
    const io = socketio(server);

    //client connected
    io.on('connection', socket => {
        let user;

        socket.on('set_username', async (username) => {
            const isExist = await GameMethod.doesUserExist(username);
            io.to(socket.id).emit('set_username', isExist);
        });

        socket.on('create_room', async () => {
            const code = await GameMethod.createRoom();
            io.to(socket.id).emit('room_created', code);
        });

        //client has joined a room
        socket.on('join_room', async ({ username, room, isAdmin }) => {
            
            //check existence
            const isExist = await GameMethod.doesRoomExist(room);

            if(!isAdmin && !isExist)
                return io.to(socket.id).emit('is_room', false);
            io.to(socket.id).emit('is_room', true);

            //generate user info
            user = await GameMethod.joinRoom(socket.id, username, room, isAdmin);
            await socket.join(user.room);
            
            const players = await GameMethod.getPlayers(user.room);

            //load existing players

            io.to(user.room).emit('player_update', players);

            //kick players
            socket.on('kick_player', async id => {
                io.to(id).emit('kicked');
            });
            
            //admin started the game
            socket.on('start', async ({category, time, spyCount}) => {
                //choose game location and assign roles
                const gameInfo = await GameMethod.assignRoles(user.room, category, spyCount);

                //check if role assignment is successful
                if(!gameInfo) return console.log('unable to assign roles')

                //initalize timer
                let timer = time;

                //send all players info
                io.to(user.room).emit('game_started', gameInfo);

                //game started
                // io.to(user.room).emit('game_started', GameMethod.getLocList(category));

                //start timer
                socket.on('start_timer', () => {
                    if(!isAdmin) return;
                    let timerUpdate = setInterval(() => {
                        let initsec = timer / 1000;
                        let min = parseInt(initsec / 60);
                        let sec = parseInt(initsec % 60)
    
                        io.to(user.room).emit('timer_update', { min, sec });
                        console.log(min + ' : ' + sec);
    
                        //auto update timer
                        if(timer < 1) {
                            clearInterval(timerUpdate);
                            io.to(user.room).emit('game_ended');
                        }
                        timer -= 1000;
                    }, 1000);
                });
            });

        });

        //client has left the room
        socket.on('exit_room', async () => {
            await GameMethod.exitRoom(socket.id);

            const players = await GameMethod.getPlayers(user.room);
            if(players.length > 0)
                io.to(user.room).emit('player_update', players);
        });

        //client has disconnected
        socket.on('disconnect', async () => { 
            if(!user)
                return 
            if(user.isAdmin) 
                await GameMethod.changeAdmin(user.room);
            await GameMethod.exitRoom(socket.id);
            const players = await GameMethod.getPlayers(user.room);
            if(players)
                io.to(user.room).emit('player_update', players);
        });
    })
}