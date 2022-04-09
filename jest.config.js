// import type {Config} from '@jest/types';

// Sync object
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ["tests/"],
	transform: {"\\.ts$": ['ts-jest']},
	transformIgnorePatterns: ['<rootDir>/node_modules/']
};

//export default config;