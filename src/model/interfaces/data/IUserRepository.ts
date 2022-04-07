import { PlayingUser } from '../../domain/User'

export default interface IUserRepository {
    /**
     * Find the unique player that has `target` as his target
     * @param target the target of the player to find
     */
    findPlayerThatHasTarget<TId>(targetId: TId): Promise<PlayingUser>
    getById<TId>(playerId: TId): Promise<PlayingUser>
    update(...playingUser: PlayingUser[]): Promise<void>
}