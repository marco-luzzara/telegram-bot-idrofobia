import ValidationError from '../errors/ValidationError'

export default class RegexType {
    constructor(value: string, regex: RegExp) {
        if (!regex.test(value))
            throw new ValidationError('wrongKillCodeFormat')
    }
}