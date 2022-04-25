import * as timespan from "timespan"
import ValidationError from '../../infrastructure/errors/ValidationError'

const timespanRegex = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/

export function getTimespan(timespanMessage: string): timespan.Timespan {
    const ts = timespanMessage.match(timespanRegex)

    if (ts === null)
        throw new ValidationError('wrongTimespanFormat')

    const [ , days, hours, minutes ] = ts

    return new timespan.TimeSpan(0, 0, minutes, hours, days)
}