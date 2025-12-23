import { repositorySchema, analysisResultSchema } from './schemas'

describe('Schemas', () => {
  describe('repositorySchema', () => {
    it('should validate a valid repository object', () => {
      const validRepo = {
        name: 'test-repo',
        path: '/path/to/repo',
        url: 'https://github.com/user/repo',
      }

      const result = repositorySchema.safeParse(validRepo)
      expect(result.success).toBe(true)
    })

    it('should reject a repository without a name', () => {
      const invalidRepo = {
        path: '/path/to/repo',
      }

      const result = repositorySchema.safeParse(invalidRepo)
      expect(result.success).toBe(false)
    })
  })

  describe('analysisResultSchema', () => {
    it('should validate a valid analysis result', () => {
      const validResult = {
        fileCount: 42,
        totalLines: 1000,
        languageDistribution: { typescript: 60, javascript: 40 },
      }

      const result = analysisResultSchema.safeParse(validResult)
      expect(result.success).toBe(true)
    })
  })
})
