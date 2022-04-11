export default class RegexType {
    constructor(value: string, regex: RegExp) {
        if (!regex.test(value))
            throw new Error(`${value} does not match against ${regex}`)
    }
}