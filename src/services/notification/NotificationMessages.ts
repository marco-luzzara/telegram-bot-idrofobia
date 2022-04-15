const enum NotificationMessages {
    KillTargetSuccessful = 'KillTargetSuccessful',
    UserIsDead = 'UserIsDead',
    // errors
    GameNotStartedYet = 'GameNotStartedYet',
    UnregisteredUser = 'UnregisteredUser',
    WinnerCannotKill = 'WinnerCannotKill',
    DeadUserCannotKill = 'DeadUserCannotKill',
    WrongKillCode = 'WrongKillCode',
    UserStatusDead = 'UserStatusDead',
    UserStatusWinner = 'UserStatusWinner',
    UserStatusPlaying = 'UserStatusPlaying',
    UserStatusTargetInfo = 'UserStatusTargetInfo'
}

export default NotificationMessages