import { Room, Client, ServerError } from 'colyseus'
import { GameRoomState, PlayerState } from './state'
import { serverSecret } from './index'
import http from 'http'

export class GameRoom extends Room<GameRoomState> {

    onCreate (options: any) {
        this.setState(new GameRoomState())
    }

    onAuth (client: Client, options: any, request: http.IncomingMessage): boolean {
        return true
    }

    onJoin (client: Client, options: any, auth: any) {
        console.log(options)
    }

    onLeave (client: Client, consented: boolean) {

    }

    onDispose() {

    }

}