const nameField = document.querySelector('#name');
const roomList = document.querySelector('#roomList');

const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('ws connected!');
};

ws.onmessage = ({data}) => {
  const message = JSON.parse(data);
  console.log(message);
  if (message.type === 'setName') {
    userName = message.payload;
    renderName();
  };

  if (message.type === 'joinedRoom') {
    selectedRoom = message.payload;
  };
};

let userName = null;
let selectedRoom = null;

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

    button.addEventListener('click', () => {
      if (!input.value) {
        return;
      };
      console.log('registering ' + input.value);
      ws.send(JSON.stringify({type: "setName", message: input.value}));
    })

    nameField.appendChild(button);
  } else {
    const h3 = document.createElement('h3');
    h3.appendChild(document.createTextNode(`Your name: ${userName}`));

    nameField.appendChild(h3);
    renderRooms();
  };
};

const renderRooms = () => {

  const rooms = ['Home', 'Chat', 'Trees'];

  rooms.forEach(room => {
    const li = document.createElement('li');
    li.classList.add('collection-item', 'room', 'grey');
    li.appendChild(document.createTextNode(room));
    li.setAttribute('id', room);
    roomList.appendChild(li);

    li.addEventListener('click', () => {
      if (li.id === selectedRoom) {
        console.log('same room, returning');
        return;
      };
      if (selectedRoom) {
        ws.send(JSON.stringify({type: 'leaveRoom'}));
      };
      selectRoom(room);
      ws.send(JSON.stringify({type: 'joinRoom', message: room}));
    });
  });
};

const selectRoom = (room) => {
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



renderName();
