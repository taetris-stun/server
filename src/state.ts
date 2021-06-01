import { Schema, type, MapSchema } from '@colyseus/schema'

export class PlayerState extends Schema {
    @type('string')
    name: string
}

export class GameRoomState extends Schema {
    @type({ map: PlayerState})
    players = new MapSchema<PlayerState>()
}