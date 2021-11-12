import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();
app.use(express.json());

app.use(express.static('public'));

app.listen(3000, () => {
  console.log('listening on 3000');
});

const server = http.createServer(app);

server.listen(3001, () => {
  console.log('ws listening on 3001');
});

interface WsPlus extends WebSocket {
  name ? : string | null;
  room ? : string | null;
};

interface Send {
  type: string;
  message: string;
}

interface TellRoom {
  room : string | undefined;
  type : string;
  payload : string;
};

interface TellUser {
  type: string;
  payload: string | string[] | null;
}

const wss = new WebSocket.Server({server});

wss.on('connection', async (ws : WsPlus) => {

  const tellUser = ({type, payload} : TellUser) => {
    ws.send(JSON.stringify({type, payload}));
  };

  const tellRoom = ({room, type, payload} : TellRoom) => {
    wss.clients.forEach((client : WsPlus) => {
      if (client.room === room && client !== ws) {
        client.send(JSON.stringify({
          type, payload
        }));
      };
    });
  };

  const getRoomUsers = (room : string) => {
    const users : string[] = [];
    wss.clients.forEach((client : WsPlus) => {
      if (client.room === room) {
        users.push(client.name as string);
      }
    });
    return users;
  };

  ws.on('message', (msg : Send) => {
    const message = JSON.parse(msg.toString());

    if (message.type === 'setName' && !ws.name) {
      ws.name = message.message;
      if (ws.room) {
        tellRoom({
          room: ws.room,
          type: 'newMember',
          payload: ws.name as string
        });
      } else {
        tellUser({
          type: 'setName',
          payload: `${ws.name}`
        });
      };
    };

    if (message.type === "joinRoom" && ws.name) {
      ws.room = message.message;
      tellRoom({
        room: ws.room as string,
        type: 'newMember',
        payload: ws.name as string
      });
      tellRoom({
        room: ws.room as string,
        type: 'newMessage',
        payload: `(${ws.name} has joined the room)`
      });
      tellUser({
        type: 'joinedRoom',
        payload: `${ws.room}`
      });
      tellUser({
        type: 'userList',
        payload: getRoomUsers(ws.room as string)
      });
      tellUser({
        type: 'newMessage',
        payload: `(You have joined room ${ws.room})`
      });
    };

    if (message.type === 'leaveRoom' && ws.name && ws.room) {
      tellRoom({
        room: ws.room,
        type: 'memberLeft',
        payload: ws.name as string
      });
      tellRoom({
        room: ws.room,
        type: 'newMessage',
        payload: `(${ws.name} left the room...)`
      })
      tellUser({type: 'leftRoom', payload: ws.room})
      ws.room = null;
    };

    if (message.type === 'roomMessage' && ws.name && ws.room) {
      tellRoom({
        room: ws.room,
        type: 'newMessage',
        payload: `${ws.name}: ${message.message}`
      });
      tellUser({
        type: 'newMessage',
        payload: `You: ${message.message}`
      });
    };
  });

  ws.on('close', () => {
    if (ws.room) {
      tellRoom({
        room: ws.room,
        type: 'memberLeft',
        payload: ws.name as string
      });
    };
    ws.name = null;
    ws.room = null;
  });
});