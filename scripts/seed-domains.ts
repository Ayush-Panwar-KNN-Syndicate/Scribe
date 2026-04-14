import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function seedDomains() {
  try {
    console.log('🌱 Seeding domain configurations...')

    // Seed Top Research Topics domain
    const trt = await prisma.domain.upsert({
      where: { domain: 'topreserchtopics.com' },
      update: {},
      create: {
        id: 'trt-domain-001',
        domain: 'topreserchtopics.com',
        siteName: 'Top Research Topics',
        tagline: 'Explore In-Depth Research Topics',
        email: 'hello@topreserchtopics.com',
        r2Bucket: 'scribe-articles',
        r2PublicUrl: 'https://search.topreserchtopics.com',
        apiUrl: 'https://api.topreserchtopics.com',
        isActive: true,
      },
    })
    console.log('✅ Added Top Research Topics:', trt)

    // Seed The Fact Relay domain
    const tfr = await prisma.domain.upsert({
      where: { domain: 'thefactrelay.com' },
      update: {},
      create: {
        id: 'tfr-domain-002',
        domain: 'thefactrelay.com',
        siteName: 'The Fact Relay',
        tagline: 'Reliable Facts, Verified Information',
        email: 'hello@thefactrelay.com',
        r2Bucket: 'thefactrelay-static',
        r2PublicUrl: 'https://search.thefactrelay.com',
        apiUrl: 'https://api.thefactrelay.com',
        isActive: true,
      },
    })
    console.log('✅ Added The Fact Relay:', tfr)

    console.log('🎉 Domain seeding completed!')

  } catch (error) {
    console.error('❌ Domain seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedDomains()
