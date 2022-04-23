import { getFormattedMessage } from '../utilities/GlobalizationUtil'

export default class ValidationError extends Error {
    constructor(messageId: string) {
        super(getFormattedMessage('errors', messageId))
    
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError)
        }
    
        this.name = 'ValidationError'
    }
}