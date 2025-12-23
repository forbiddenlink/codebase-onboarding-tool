import { RepositorySchema, AnalyzeRepositorySchema } from './schemas'

describe('Schemas', () => {
  describe('RepositorySchema', () => {
    it('should validate a valid repository object', () => {
      const validRepo = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'test-repo',
        path: '/path/to/repo',
        url: 'https://github.com/user/repo',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = RepositorySchema.safeParse(validRepo)
      expect(result.success).toBe(true)
    })

    it('should reject a repository without a name', () => {
      const invalidRepo = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        path: '/path/to/repo',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = RepositorySchema.safeParse(invalidRepo)
      expect(result.success).toBe(false)
    })
  })

  describe('AnalyzeRepositorySchema', () => {
    it('should validate a valid analyze request', () => {
      const validRequest = {
        path: '/path/to/repo',
        url: 'https://github.com/user/repo',
      }

      const result = AnalyzeRepositorySchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })
  })
})
