import * as timespan from "timespan"

import PlayingUser from './PlayingUser'

export default class AdminUser {
    /**
     * Start (or restart) the game by assigning targets until they form a ring.
     * lastKill fields are assigned as the current timestamp
     * @param players 
     */
    startGame(players: Iterable<PlayingUser>): void {
        this.createRing(players, true)
    }

    /**
     * kill the player that is the target of `player`
     * @param player the player whose target must be killed
     */
    killPlayerTarget(player: PlayingUser): void {
        player.killTarget(player.target.userInfo.killCode)
    }

    /**
     * kill those players that have not killed their target within the `idleTimeSpan` time.
     * these players are called idle players.
     * @param players the list of possible players to kill
     * @param idleTimeSpan the maximum amount of time a player can play without killing anyone
     */
    killIdlePlayers(players: Iterable<PlayingUser>, idleTimeSpan: timespan.TimeSpan): void {
        // cannot do assert because the generator would be visited
        // assert(players.every(p => p.isPlaying() && !p.isDead()), 'only playing users can be killed for being idle')
        let firstNotIdle = undefined
        let previousNotIdle = undefined
        const idleCheckTime = new Date()

        for (let player of players) {
            if (player.isIdle(idleCheckTime, idleTimeSpan)) {
                player.target = null
                continue
            }

            if (firstNotIdle === undefined) {
                firstNotIdle = previousNotIdle = player
                continue
            }

            previousNotIdle.target = player
            previousNotIdle = player
        }

        previousNotIdle.target = firstNotIdle
    }

    private createRing(players: Iterable<PlayingUser>, initializeLastKill: boolean): void {
        let firstPlayer = undefined
        let previousPlayer = undefined
        const startingGameDate = new Date()
        let initLastKillIfNecessary = (player: PlayingUser) => {
            if (initializeLastKill)
                player.lastKill = startingGameDate
        }

        for (let player of players) {
            if (previousPlayer === undefined) {
                firstPlayer = player
                initLastKillIfNecessary(player)
            }
            else {
                previousPlayer.target = player
                initLastKillIfNecessary(player)
            }
            previousPlayer = player
        }

        previousPlayer.target = firstPlayer
    }
}
