import io from 'socket.io-client';

const ENDPOINT = '/';
const socket = io(ENDPOINT);

export default socket;