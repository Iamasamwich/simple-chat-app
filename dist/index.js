"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var ws_1 = __importDefault(require("ws"));
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
app.listen(3000, function () {
    console.log('listening on 3000');
});
var server = http_1.default.createServer(app);
server.listen(3001, function () {
    console.log('ws listening on 3001');
});
;
;
var wss = new ws_1.default.Server({ server: server });
wss.on('connection', function (ws) { return __awaiter(void 0, void 0, void 0, function () {
    var tellUser, tellRoom, getRoomUsers;
    return __generator(this, function (_a) {
        tellUser = function (_a) {
            var type = _a.type, payload = _a.payload;
            ws.send(JSON.stringify({ type: type, payload: payload }));
        };
        tellRoom = function (_a) {
            var room = _a.room, type = _a.type, payload = _a.payload;
            wss.clients.forEach(function (client) {
                if (client.room === room && client !== ws) {
                    client.send(JSON.stringify({
                        type: type,
                        payload: payload
                    }));
                }
                ;
            });
        };
        getRoomUsers = function (room) {
            var users = [];
            wss.clients.forEach(function (client) {
                if (client.room === room) {
                    users.push(client.name);
                }
            });
            return users;
        };
        ws.on('message', function (msg) {
            var message = JSON.parse(msg.toString());
            if (message.type === 'setName' && !ws.name) {
                ws.name = message.message;
                if (ws.room) {
                    tellRoom({
                        room: ws.room,
                        type: 'newMember',
                        payload: ws.name
                    });
                }
                else {
                    tellUser({
                        type: 'setName',
                        payload: "" + ws.name
                    });
                }
                ;
            }
            ;
            if (message.type === "joinRoom" && ws.name) {
                ws.room = message.message;
                tellRoom({
                    room: ws.room,
                    type: 'newMember',
                    payload: ws.name
                });
                tellRoom({
                    room: ws.room,
                    type: 'newMessage',
                    payload: "(" + ws.name + " has joined the room)"
                });
                tellUser({
                    type: 'joinedRoom',
                    payload: "" + ws.room
                });
                tellUser({
                    type: 'userList',
                    payload: getRoomUsers(ws.room)
                });
                tellUser({
                    type: 'newMessage',
                    payload: "(You have joined room " + ws.room + ")"
                });
            }
            ;
            if (message.type === 'leaveRoom' && ws.name && ws.room) {
                tellRoom({
                    room: ws.room,
                    type: 'memberLeft',
                    payload: ws.name
                });
                tellRoom({
                    room: ws.room,
                    type: 'newMessage',
                    payload: "(" + ws.name + " left the room...)"
                });
                tellUser({ type: 'leftRoom', payload: ws.room });
                ws.room = null;
            }
            ;
            if (message.type === 'roomMessage' && ws.name && ws.room) {
                tellRoom({
                    room: ws.room,
                    type: 'newMessage',
                    payload: ws.name + ": " + message.message
                });
                tellUser({
                    type: 'newMessage',
                    payload: "You: " + message.message
                });
            }
            ;
        });
        ws.on('close', function () {
            if (ws.room) {
                tellRoom({
                    room: ws.room,
                    type: 'memberLeft',
                    payload: ws.name
                });
            }
            ;
            ws.name = null;
            ws.room = null;
        });
        return [2 /*return*/];
    });
}); });
