import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !user.email) return null

    // Find or create author record in Prisma
    let author = await prisma.author.findUnique({
      where: { email: user.email }
    })

    if (!author) {
      // Create author record if it doesn't exist
      try {
        // For Google OAuth users, use the full_name from user_metadata
        // For email users, extract name from email
        const displayName = user.user_metadata?.full_name || 
                           user.user_metadata?.name || 
                           user.email.split('@')[0]

        author = await prisma.author.create({
          data: {
            email: user.email,
            name: displayName,
            avatar_url: user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture || 
                       null,
          }
        })
        console.log(`Created new author: ${author.email} (${author.name})`)
      } catch (createError) {
        console.error('Failed to create author:', createError)
        // If creation fails, try to find again (could be a race condition)
        author = await prisma.author.findUnique({
          where: { email: user.email }
        })
        if (!author) {
          throw new Error('Failed to create or find user author record')
        }
      }
    } else {
      // Update existing author with latest OAuth data if available
      try {
        const updatedData: any = {}
        
        if (user.user_metadata?.full_name && user.user_metadata.full_name !== author.name) {
          updatedData.name = user.user_metadata.full_name
        }
        
        if (user.user_metadata?.avatar_url && user.user_metadata.avatar_url !== author.avatar_url) {
          updatedData.avatar_url = user.user_metadata.avatar_url
        }
        
        if (user.user_metadata?.picture && user.user_metadata.picture !== author.avatar_url) {
          updatedData.avatar_url = user.user_metadata.picture
        }
        
        if (Object.keys(updatedData).length > 0) {
          author = await prisma.author.update({
            where: { email: user.email },
            data: updatedData
          })
          console.log(`Updated author profile: ${author.email}`)
        }
      } catch (updateError) {
        console.error('Failed to update author profile:', updateError)
        // Continue with existing author data
      }
    }

    return author
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

export async function requireAuth() {
  const author = await getCurrentUser()
  if (!author) {
    throw new Error('Authentication required')
  }
  return author
} 