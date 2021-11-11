const nameField = document.querySelector('#name');
const roomList = document.querySelector('#roomList');
const roomUserContainer = document.querySelector('#roomUsers');
const roomUserList = document.querySelector('#roomUserList');
const messages = document.querySelector('#messages');
const roomName = document.querySelector('#roomName');

const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('ws connected!');
};

ws.onmessage = ({data}) => {
  const message = JSON.parse(data);
  console.log(message);

  switch (message.type) {
    case "setName":
      userName = message.payload;
      renderName();
      break;
    case "joinedRoom":
      selectedRoom = message.payload;
      // renderRoom();
      break;
    case "userList":
      roomUsers = message.payload;
      renderUsers();
      break;
    case "newMember":
      roomUsers.push(message.payload);
      renderUsers();
      break;
    case "memberLeft":
      roomUsers = roomUsers.filter(user => {
        return user !== message.payload;
      });
      renderUsers();
      break;
    case "leftRoom":
      roomUsers = [];
      selectedRoom = null;
      renderUsers();
    default:
      return;    
  };
};

let userName = null;
let selectedRoom = null;
let roomUsers = [];

const renderName = () => {
  nameField.innerHTML = '';

  if (!userName) {
    const inputField = document.createElement('div');
    inputField.classList.add('input-field', 'col', 's8');

    const input = document.createElement('input');
    input.classList.add('validate');
    input.setAttribute('id', 'nameSelect');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'name');
    inputField.appendChild(input);

    const label = document.createElement('label');
    label.classList.add('black-text');
    label.setAttribute('for', 'nameSelect');
    label.appendChild(document.createTextNode('Name'));
    inputField.appendChild(label);

    nameField.appendChild(inputField);

    const button = document.createElement('div');
    button.classList.add('btn', 'green', 'col', 's4');
    button.appendChild(document.createTextNode('Register'));
    
    nameField.appendChild(button);

    input.focus();

    button.addEventListener('click', () => {
      registerName(input.value);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        registerName(input.value);
      };
    });
    
    const registerName = (message) => {
      if (!message) {
        return;
      };
      ws.send(JSON.stringify({type: "setName", message}));
    };

  } else {
    const h3 = document.createElement('h3');
    h3.appendChild(document.createTextNode(`Your name: ${userName}`));
    nameField.appendChild(h3);
    renderRooms();
  };
};

const renderRooms = () => {
  const rooms = ['Home', 'Chat', 'Trees', 'Bushwalks'];
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.classList.add('collection-item', 'room', 'grey');
    li.appendChild(document.createTextNode(room));
    li.setAttribute('id', room);
    roomList.appendChild(li);

    li.addEventListener('click', () => {

      if (selectedRoom) {
        ws.send(JSON.stringify({type: 'leaveRoom'}));
      };

      if (li.id === selectedRoom) {
        selectedRoom = null;
      } else {
        selectedRoom = li.id;
        ws.send(JSON.stringify({type: 'joinRoom', message: room}));
      };

      updateRoomClasses(selectedRoom);
    });

    const updateRoomClasses = (room) => {
      const rooms = document.querySelectorAll('.room');
      for (const li of rooms) {
        if (li.id === room) {
          li.classList.remove('grey');
          li.classList.add('green');
        } else {
          li.classList.add('grey');
          li.classList.remove('green');
        };
      };
    };
  });
};

const renderUsers = () => {
  if (selectedRoom) {
    roomUserContainer.removeAttribute('hidden');
  } else {
    roomUserContainer.setAttribute('hidden', 'hidden');
  };
  roomUserList.innerHTML = '';
  roomUsers.forEach(user => {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(user));
    li.classList.add('collection-item');
    roomUserList.appendChild(li);
  });
};

renderName();
