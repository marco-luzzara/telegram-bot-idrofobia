
// TODO: see ConstructorParameters<Type>
export function createThrowingProxy<T>(): T {
    const handler = {
        get: function(target, prop, receiver) {
            throw new Error("cannot access this proxy")
        },
        set: function(obj, prop, value) {
            throw new Error("cannot access this proxy")
        }
    }
    return new Proxy({}, handler) as T
}