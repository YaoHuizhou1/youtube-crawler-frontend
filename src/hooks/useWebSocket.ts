import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store'

interface WebSocketMessage {
  type: string
  payload: unknown
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const { setWsConnected, addNotification, updateTask, updateVideo } = useAppStore()

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setWsConnected(true)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setWsConnected(false)

      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect()
      }, 5000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }, [setWsConnected])

  const handleMessage = (message: WebSocketMessage) => {
    const { type, payload } = message

    // Add notification
    addNotification({
      id: Date.now().toString(),
      type,
      message: getNotificationMessage(type, payload),
      timestamp: new Date(),
    })

    // Update state based on message type
    switch (type) {
      case 'task_created':
      case 'task_updated':
      case 'task_started':
      case 'task_paused':
      case 'task_stopped':
      case 'task_completed':
      case 'task_failed':
        updateTask(payload as never)
        break

      case 'video_analyzed':
      case 'video_reviewed':
      case 'video_tagged':
        updateVideo(payload as never)
        break
    }
  }

  const getNotificationMessage = (type: string, payload: unknown): string => {
    switch (type) {
      case 'task_created':
        return `Task "${(payload as { name?: string })?.name}" created`
      case 'task_started':
        return `Task "${(payload as { name?: string })?.name}" started`
      case 'task_completed':
        return `Task "${(payload as { name?: string })?.name}" completed`
      case 'task_failed':
        return `Task failed: ${(payload as { error?: string })?.error}`
      case 'video_analyzed':
        return `Video analyzed: ${(payload as { is_dialogue?: boolean })?.is_dialogue ? 'Dialogue detected' : 'Not dialogue'}`
      case 'discovery_complete':
        return `Discovery complete: ${(payload as { videos_found?: number })?.videos_found} videos found`
      default:
        return type.replace(/_/g, ' ')
    }
  }

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return { ws: wsRef.current }
}
