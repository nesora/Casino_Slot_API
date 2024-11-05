module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
  moduleNameMapper: {
    '^@application/(.*)$': '<rootDir>/app/application/$1',
    '^@domain/(.*)$': '<rootDir>/app/domain/$1',
    '^@infrastructure/(.*)$': '<rootDir>/app/infrastructure/$1',
    '^@interface/(.*)$': '<rootDir>/app/interface/$1',
    '^@Utils/(.*)$': '<rootDir>/app/Utils/$1',
    '^@config$': '<rootDir>/config',
    '^@routes/(.*)$': '<rootDir>/app/routes/$1'
  }
};