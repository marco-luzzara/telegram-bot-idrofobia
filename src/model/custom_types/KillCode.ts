import RegexType from "../../infrastructure/types/RegexType"

export default class KillCode extends RegexType {
    private readonly killCode: string
    constructor(killCode: string) {
        super(killCode, /^[A-Z0-9]{10}$/)
        this.killCode = killCode
    }

    toString() {
        return this.killCode
    }
}