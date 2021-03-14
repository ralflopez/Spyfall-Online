import io from 'socket.io-client';

const ENDPOINT = 'https://play-spyfall-online.herokuapp.com/';
const socket = io(ENDPOINT);

export default socket;