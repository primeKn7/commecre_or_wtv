import { onMounted, onUnmounted } from 'vue'
import { supabase } from '@/services/supabaseClient'

export function useRealtime(table, callback, { event = '*', schema = 'public', filter } = {}) {
  let channel = null

  function subscribe() {
    const channelName = `realtime_${table}_${Date.now()}`
    const opts = { event, schema, table }
    if (filter) opts.filter = filter

    channel = supabase
      .channel(channelName)
      .on('postgres_changes', opts, (payload) => {
        callback(payload)
      })
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  onMounted(subscribe)
  onUnmounted(unsubscribe)

  return { subscribe, unsubscribe }
}
