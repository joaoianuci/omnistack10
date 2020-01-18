import socketio from 'socket.io-client';
import { API_BASEURL } from 'react-native-dotenv';

const socket = socketio(API_BASEURL, {
    autoConnect: false,
});

function subscribeToNewDevs(subscribeFunction){
    socket.on('new-dev', subscribeFunction);
}

function connect(latitude, longitude, techs){
    socket.io.opts.query = {
        latitude,
        longitude,
        techs,
    }

    socket.connect();
   
}

function disconnect(){
    if(socket.connected){
        socket.disconnect()
    }
}

export {
    connect,
    disconnect,
    subscribeToNewDevs,
};