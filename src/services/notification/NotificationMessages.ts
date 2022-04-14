const enum NotificationMessages {
    KillTargetSuccessful = 'KillTargetSuccessful',
    UserIsDead = 'UserIsDead',
    // errors
    GameNotStartedYet = 'GameNotStartedYet',
    UnregisteredUser = 'UnregisteredUser',
    WinnerCannotKill = 'WinnerCannotKill',
    DeadUserCannotKill = 'DeadUserCannotKill',
    WrongKillCode = 'WrongKillCode'
}

export default NotificationMessages