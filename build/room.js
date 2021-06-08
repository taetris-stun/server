"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const colyseus_1 = require("colyseus");
const state_1 = require("./state");
const index_1 = require("./index");
class GameRoom extends colyseus_1.Room {
    onCreate(options) {
        if (options.serverSecret !== index_1.serverSecret) {
            this.disconnect();
            return;
        }
        this.setState(new state_1.GameRoomState());
        this.autoDispose = false;
        this.onMessage('ready', (client, message) => {
            this.state.players.get(client.id).ready = true;
            let allReady = true;
            this.state.players.forEach((player) => {
                if (player.ready === false) {
                    allReady = false;
                }
            });
            if (allReady) {
                this.broadcast('start');
            }
        });
    }
    onAuth(client, options, request) {
        if (options &&
            options.username &&
            options.shocker &&
            typeof (options.username) === 'string' &&
            typeof (options.shocker) === 'string') {
            return true;
        }
        else {
            throw new colyseus_1.ServerError(400, 'Missing options');
        }
    }
    onJoin(client, options, auth) {
        console.log(`[taetris-stun] New client: ${JSON.stringify(options)}`);
        this.state.players.set(client.sessionId, new state_1.PlayerState());
        this.state.players.get(client.sessionId).username = options.username;
        this.state.players.get(client.sessionId).shocker = options.shocker;
        this.state.players.get(client.sessionId).ready = false;
    }
    onLeave(client, consented) {
        this.state.players.delete(client.sessionId);
    }
    onDispose() {
    }
}
exports.GameRoom = GameRoom;
