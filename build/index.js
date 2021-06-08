"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridge = exports.serverSecret = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const colyseus_1 = require("colyseus");
const room_1 = require("./room");
const serverSecret = crypto_1.default.randomBytes(30).toString('hex');
exports.serverSecret = serverSecret;
const portColyseus = Number(process.env['TAE_PORT_COLY'] || 3000);
const portBridge = Number(process.env['TAE_PORT_BRIDGE'] || 3001);
const bridge = new ws_1.default.Server({ port: portBridge });
exports.bridge = bridge;
bridge.on('connection', (socket) => {
    console.log(`[taetris-stun] New shocker: ${socket.url}`);
});
console.log('[taetris-stun] Bridge on port ' + portBridge);
const app = express_1.default();
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use(express_1.default.json());
app.set('trust proxy', 1);
app.use(cors_1.default({
    origin: '*'
}));
const colyseus = new colyseus_1.Server({ server: http_1.default.createServer(app) });
colyseus.define('GameRoom', room_1.GameRoom).enableRealtimeListing();
colyseus.listen(portColyseus);
console.log('[taetris-stun] Listening on port ' + portColyseus);
colyseus_1.matchMaker.createRoom('GameRoom', { serverSecret }).then(() => {
    console.log('[taetris-stun] Created GameRoom');
});
