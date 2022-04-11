import KillCode from '../../../src/model/custom_types/KillCode'

export function generateKillCodeFromSeed(seed: any): KillCode {
    return new KillCode(
        seed.toString().toUpperCase().repeat(10).substring(0, 10))
}