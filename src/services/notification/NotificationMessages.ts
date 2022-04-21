const enum NotificationMessages {
    KillTargetSuccessful = 'KillTargetSuccessful',
    GameStarted = 'GameStarted',
    UserIsDead = 'UserIsDead',
    UserIsDeadBecauseOfIdleness = 'UserIsDeadBecauseOfIdleness',
    // errors
    GameNotStartedYet = 'GameNotStartedYet',
    UnregisteredUser = 'UnregisteredUser',
    WinnerCannotKill = 'WinnerCannotKill',
    DeadUserCannotKill = 'DeadUserCannotKill',
    WrongKillCode = 'WrongKillCode',
    UserStatusDead = 'UserStatusDead',
    UserStatusWinner = 'UserStatusWinner',
    UserStatusPlaying = 'UserStatusPlaying',
    UserStatusTargetInfo = 'UserStatusTargetInfo',

    // admin
    AskToUserForKillResult = 'AskToUserForKillResult',
    GameStartedSuccessfully = 'GameStartedSuccessfully',
    IdleUsersKilledSuccessfully = 'IdleUsersKilledSuccessfully'
}

export default NotificationMessages