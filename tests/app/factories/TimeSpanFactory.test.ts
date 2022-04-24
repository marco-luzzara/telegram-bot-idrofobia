import * as timespan from "timespan"

import { getTimespan } from '../../../src/app/factories/TimeSpanFactory'
import ValidationError from "../../../src/infrastructure/errors/ValidationError";

describe('timespan factory', () => {
    test(`given a user input for timespan, the timespan is correct, 
        an instance of Timespan is created`, () => 
    {
        const userTs = '12:23:04'    
        
        const ts = getTimespan(userTs)

        expect(ts).toBeInstanceOf(timespan.TimeSpan)
        expect(ts.days).toBe(12)
        expect(ts.hours).toBe(23)
        expect(ts.minutes).toBe(4)
    });

    test(`given a user input for timespan, the timespan is correct with single digits too, 
        an instance of Timespan is created`, () => 
    {
        const userTs = '1:9:04'    
        
        const ts = getTimespan(userTs)

        expect(ts).toBeInstanceOf(timespan.TimeSpan)
        expect(ts.days).toBe(1)
        expect(ts.hours).toBe(9)
        expect(ts.minutes).toBe(4)
    });

    test(`given a user input for timespan, the timespan is missing a part, 
        a validation error is returned`, () => 
    {
        const userTs = '12:23'   
        
        expect(() => getTimespan(userTs)).toThrowError(ValidationError)
    });

    test(`given a user input for timespan, the timespan has additional digits, 
        a validation error is returned`, () => 
    {
        const userTs = '12:23:561'   
        
        expect(() => getTimespan(userTs)).toThrowError(ValidationError)
    });
});