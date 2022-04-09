export function toBeAfter(
    this: jest.MatcherContext,
    received: Date,
    expected: Date) 
{
    return {
        pass: received > expected,
        message: () =>
            `Received Date ${received.toUTCString()} does ${
                this.isNot ? "" : "not "
            }come after ${expected.toUTCString()}.`,
    };
}

interface CustomDateMatchers<R = unknown> {
    toBeAfter(expected: Date): R;
}

declare global {
    namespace jest {
        interface Expect extends CustomDateMatchers {}
        interface Matchers<R> extends CustomDateMatchers<R> {}
        interface InverseAsymmetricMatchers extends CustomDateMatchers {}
    }
}

expect.extend({ toBeAfter })