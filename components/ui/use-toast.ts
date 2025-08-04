import React, { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

interface ToastState {
  toasts: Toast[]
}

const toastState: ToastState = {
  toasts: []
}

const listeners: Array<(state: ToastState) => void> = []

let toastCount = 0

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_VALUE
  return toastCount.toString()
}

const addToast = (toast: Omit<Toast, "id">) => {
  const id = genId()
  
  const newToast: Toast = {
    ...toast,
    id,
  }

  toastState.toasts = [newToast, ...toastState.toasts]
  listeners.forEach((listener) => listener(toastState))

  return {
    id,
    dismiss: () => removeToast(id),
    update: (toast: Partial<Toast>) => updateToast(id, toast),
  }
}

const updateToast = (id: string, toast: Partial<Toast>) => {
  toastState.toasts = toastState.toasts.map((t) =>
    t.id === id ? { ...t, ...toast } : t
  )
  listeners.forEach((listener) => listener(toastState))
}

const removeToast = (id: string) => {
  toastState.toasts = toastState.toasts.filter((t) => t.id !== id)
  listeners.forEach((listener) => listener(toastState))
}

export const toast = (props: Omit<Toast, "id">) => {
  return addToast(props)
}

export const useToast = () => {
  const [state, setState] = useState<ToastState>(toastState)

  const subscribe = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  React.useEffect(() => {
    return subscribe(setState)
  }, [subscribe])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        removeToast(toastId)
        return
      }

      toastState.toasts.forEach((toast) => {
        removeToast(toast.id)
      })
    },
  }
}
