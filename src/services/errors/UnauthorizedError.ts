// const languageEnv = process.env.LANG
// const languageConfig = require(`./`)

export default class UnauthorizedError extends Error {
    constructor(userRepr: string, neededRole: string) {
        super(`${userRepr} cannot run the requested command. It should be ${neededRole}`)
    }
}