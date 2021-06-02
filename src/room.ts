import { Room, Client, ServerError } from 'colyseus'
import { GameRoomState, PlayerState } from './state'
import http from 'http'

export class GameRoom extends Room<GameRoomState> {

    onCreate (options: any) {
        this.setState(new GameRoomState())
    }

    onAuth (client: Client, options: any, request: http.IncomingMessage): boolean {
        if ( // Only accept connections with required option data
            options 
            && typeof(options.username) === 'string' 
            && typeof(options.shocker) === 'string'
        ) { return true } 
        else { throw new ServerError(400, 'Missing options') }
    }

    onJoin (client: Client, options: any, auth: any) {
        this.state.players.set(client.sessionId, new PlayerState())
        this.state.players.get(client.sessionId).username = options.username
        this.state.players.get(client.sessionId).shocker = options.shocker
    }

    onLeave (client: Client, consented: boolean) {
        this.state.players.delete(client.sessionId)
    }

    onDispose() {

    }

}