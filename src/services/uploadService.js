import { supabase } from './supabaseClient'

export const uploadService = {
  async uploadImage(file, bucket = 'parking-images', folder = '') {
    const ext = file.name.split('.').pop()
    const path = `${folder ? folder + '/' : ''}${Date.now()}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
    if (error) throw error

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  async uploadAvatar(userId, file) {
    return this.uploadImage(file, 'avatars', userId)
  },

  async deleteImage(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw error
  }
}
