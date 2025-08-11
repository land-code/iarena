import { PrismaClient } from '@/generated/prisma'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin, captcha } from 'better-auth/plugins'

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: {
    enabled: true,

    async sendResetPassword() {
      // Send an email to the user with a link to reset their password
    }
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    },

    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,

      clientSecret: process.env.DISCORD_CLIENT_SECRET!
    }
  },
  plugins: [
    nextCookies(),
    admin(),
    captcha({
      provider: 'hcaptcha',
      siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!,
      secretKey: process.env.HCAPTCHA_SECRET_KEY!
    })
  ]
})
