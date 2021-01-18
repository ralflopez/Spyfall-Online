const connectDb = require('./mongodb-config');
const randomstring = require('randomstring').generate;

class GameLogic {

    doesUserExist = async (username) => {
        const db = await connectDb();
        const rooms = db.collection('rooms');
        const response = rooms.find({ username });
        const data = await response.count();

        return data > 0 ? true : false;
    }

    //check if room exist
    doesRoomExist = async (room) => {
        const db = await connectDb();
        const rooms = db.collection('rooms');
        const response = rooms.find({ room });
        const data = await response.count();
 
        return data > 0 ? true : false;
    }

    //creat a new room
    createRoom = async () => {
        console.log('FROM LOGIC CREATE')
        const code = randomstring({ 
            length: 6, 
            charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        });
        
        const exist = await this.doesRoomExist(code);

        return !exist ? code : this.createRoom();
    }
    
    //add players to [rooms]
    joinRoom = async (id, username, room, isAdmin = false) => {
        const user = { id, username, room, isAdmin };

        const db = await connectDb();
        const rooms = db.collection('rooms');
        await rooms.insertOne(user);
        console.log(user + ' added successfully')
        return user;
    }

    //remove players in the room
    resetRoom = (room) => {
        connectDb().then(db => {
            db.collection('rooms').deleteMany({ room });
        })
    }

    //remove player from [rooms]
    exitRoom = async (id) => {
        console.log(id)
        const db = await connectDb();
        const rooms = db.collection('rooms');
        await rooms.deleteOne({ id: id });
        console.log('done na unta')
    }

    //get players in the same room
    getPlayers = async (room) => {
        const db = await connectDb();
        const players = db.collection('rooms');
        const response = players.find({ room });
        const data = await response.toArray();

        return data;
    }

    //change admin
    changeAdmin = async (room) => {
        console.log(1);
        const db = await connectDb();
        const players = await this.getPlayers(room);
        let newAdmin = players[1];
        if(newAdmin) {
            newAdmin.isAdmin = true;
            await db.collection('rooms').updateOne({_id: newAdmin._id}, {$set: newAdmin});
        }
        console.log('new admin changed');
        console.log(newAdmin);
        return newAdmin ? newAdmin.id : null;
    }

    //get locations list for everyone
    getLocList = async (category) => {
        const db = await connectDb();
        const locations = db.collection('locations')
        const response = locations.find({ version: category }, { projection: {name: 1, _id: 0} });
        const data = await response.toArray();

        return data;
    }

    //randomly choose location
    chooseLocation = async (category) => {
        //random a data from mongodb
        const db = await connectDb();
        const locations = db.collection('locations');
        const response = locations.aggregate([
            { $match: { version: category } },
            { $sample: { size: 1 } }
        ]);
        const data = await response.toArray();

        return data[0];
    }

    //assign roles to every player
    assignRoles = async (room, category, spyCount) => {
        try {
            const location = await this.chooseLocation(category);
            const players = await this.getPlayers(room);
            const list = await this.getLocList(category);

            //build array of roles
            let roles = [];

            //assign spy
            let spyindex = [];
            for(let i = 0; i < spyCount; i++) {
                let ran = Math.floor(Math.random() * players.length);
                if(spyindex.indexOf(ran) !== -1)
                    spyCount++;
                else
                    roles[ran] = 'Spy';
            }

            //add other roles
            players.forEach(player => {
                roles.push(location.roles[Math.floor(Math.random() * location.roles.length)])
            });

            //assign players role
            let len = players.length;
            for(let i = 0; i < len; i++)
                players[i].role = roles[i];

            return { players, location: location.name, list: list };
        } catch (er) {
            return null;
        }
    }
}

module.exports = new GameLogic();