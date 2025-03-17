import {z} from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GITHUB_AUTH_TOKEN: z.string().optional(),
  REPOSITORY_OWNER: z.string().default('WingRiders'),
  REPOSITORY_NAME: z.string().default('cardano-datum-registry'),
  REPOSITORY_BRANCH: z.string().default('main'),
  REPOSITORY_PROJECTS_DIR: z.string().default('projects'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Environment variables validation failed', parsedEnv.error.format())
  process.exit(1)
}

export const config = parsedEnv.data
