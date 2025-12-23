import { RepositoryAnalyzer } from './analyzer'

describe('RepositoryAnalyzer', () => {
  describe('constructor', () => {
    it('should create an instance with a valid repository path', () => {
      const analyzer = new RepositoryAnalyzer('/path/to/repo')
      expect(analyzer).toBeInstanceOf(RepositoryAnalyzer)
    })
  })

  describe('analyze', () => {
    it('should analyze a repository without throwing errors', async () => {
      const analyzer = new RepositoryAnalyzer('/path/to/repo')
      await expect(analyzer.analyze()).resolves.not.toThrow()
    })
  })
})
