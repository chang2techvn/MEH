"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"

interface Position {
  x: number
  y: number
}

interface DragStart {
  x: number
  y: number
  elementX: number
  elementY: number
}

interface UseDraggableOptions {
  initialPosition?: Position
  bounds?: {
    left?: number
    top?: number
    right?: number
    bottom?: number
  }
  onDragEnd?: (position: Position) => void
  onDragStart?: () => void
  snapToEdge?: boolean
  zIndex?: number
  preventCollision?: boolean
}

export function useDraggable({
  initialPosition = { x: 0, y: 0 },
  bounds = {},
  onDragEnd,
  onDragStart,
  snapToEdge = true,
  zIndex = 40,
  preventCollision = true,
}: UseDraggableOptions = {}) {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [zIndexState, setZIndexState] = useState(zIndex)
  const elementRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef<Position>(initialPosition)
  const dragStartRef = useRef<{ x: number; y: number; elementX: number; elementY: number } | null>(null)

  // Update position ref when position state changes
  useEffect(() => {
    positionRef.current = position
  }, [position])

  // Update position if initialPosition changes
  useEffect(() => {
    if (initialPosition.x !== position.x || initialPosition.y !== position.y) {
      setPosition(initialPosition)
      positionRef.current = initialPosition
    }
  }, [initialPosition, position.x, position.y])

  // Calculate window bounds
  const calculateBounds = useCallback(() => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const element = elementRef.current

    if (!element) return bounds

    const elementWidth = element.offsetWidth
    const elementHeight = element.offsetHeight

    // Ensure at least 50px of the window is always visible
    const minVisiblePx = 50

    return {
      left: bounds.left !== undefined ? bounds.left : 0,
      top: bounds.top !== undefined ? bounds.top : 0,
      right: bounds.right !== undefined ? bounds.right : windowWidth - minVisiblePx,
      bottom: bounds.bottom !== undefined ? bounds.bottom : windowHeight - minVisiblePx,
    }
  }, [bounds])

  // Snap to edge if close enough
  const snapPositionToEdge = useCallback(
    (pos: Position) => {
      if (!snapToEdge) return pos

      const element = elementRef.current
      if (!element) return pos

      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const elementWidth = element.offsetWidth
      const elementHeight = element.offsetHeight
      const snapThreshold = 20 // pixels

      const newPos = { ...pos }

      // Snap to left edge
      if (pos.x < snapThreshold) {
        newPos.x = 0
      }

      // Snap to right edge
      if (windowWidth - (pos.x + elementWidth) < snapThreshold) {
        newPos.x = windowWidth - elementWidth
      }

      // Snap to top edge
      if (pos.y < snapThreshold) {
        newPos.y = 0
      }

      // Snap to bottom edge
      if (windowHeight - (pos.y + elementHeight) < snapThreshold) {
        newPos.y = windowHeight - elementHeight
      }

      return newPos
    },
    [snapToEdge],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      // Check if we're clicking on a button or input
      const target = e.target as HTMLElement
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea")
      ) {
        return
      }

      // If we're using the drag-handle class approach, check for it
      const isDragHandle = target.classList.contains("drag-handle") || !!target.closest(".drag-handle")
      if (!isDragHandle) return

      e.preventDefault()
      e.stopPropagation()

      setIsDragging(true)
      setZIndexState(100) // Bring to front when dragging

      if (onDragStart) {
        onDragStart()
      }

      const element = elementRef.current
      if (!element) return

      // Store the initial mouse position and element position
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        elementX: positionRef.current.x,
        elementY: positionRef.current.y,
      }
    },
    [onDragStart],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return

      // Calculate the distance moved
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y

      // Calculate new position
      let newX = dragStartRef.current.elementX + dx
      let newY = dragStartRef.current.elementY + dy

      // Apply calculated bounds
      const currentBounds = calculateBounds()
      const elementWidth = elementRef.current?.offsetWidth || 350
      const elementHeight = elementRef.current?.offsetHeight || 450

      // Constrain to viewport bounds - use nullish coalescing for safety
      const left = currentBounds.left ?? 0
      const right = currentBounds.right ?? window.innerWidth - 50
      const top = currentBounds.top ?? 0
      const bottom = currentBounds.bottom ?? window.innerHeight - 50
      
      newX = Math.max(left, Math.min(right - elementWidth, newX))
      newY = Math.max(top, Math.min(bottom - elementHeight, newY))

      // Update position directly in the DOM for smoother dragging
      if (elementRef.current) {
        elementRef.current.style.left = `${newX}px`
        elementRef.current.style.top = `${newY}px`
      }

      // Update the position ref (but not state during drag to avoid re-renders)
      positionRef.current = { x: newX, y: newY }
    },
    [isDragging, calculateBounds],
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)

      // Apply snap to edge when drag ends
      const snappedPosition = snapPositionToEdge(positionRef.current)

      // Update the state with the final position
      setPosition(snappedPosition)

      // Also update the ref
      positionRef.current = snappedPosition

      dragStartRef.current = null

      setTimeout(() => {
        setZIndexState(zIndex)
      }, 300)

      if (onDragEnd) {
        onDragEnd(snappedPosition)
      }
    }
  }, [isDragging, snapPositionToEdge, onDragEnd, zIndex])

  // Handle touch events for mobile
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea")
      ) {
        return
      }

      const isDragHandle = target.classList.contains("drag-handle") || !!target.closest(".drag-handle")
      if (!isDragHandle) return

      const touch = e.touches[0]
      if (!touch) return

      e.preventDefault()

      setIsDragging(true)
      setZIndexState(100)

      if (onDragStart) {
        onDragStart()
      }

      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        elementX: positionRef.current.x,
        elementY: positionRef.current.y,
      }
    },
    [onDragStart],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current) return

      const touch = e.touches[0]
      if (!touch) return

      e.preventDefault() // Prevent scrolling while dragging

      // Calculate the distance moved
      const dx = touch.clientX - dragStartRef.current.x
      const dy = touch.clientY - dragStartRef.current.y

      // Calculate new position
      let newX = dragStartRef.current.elementX + dx
      let newY = dragStartRef.current.elementY + dy

      // Apply calculated bounds
      const currentBounds = calculateBounds()
      const elementWidth = elementRef.current?.offsetWidth || 350
      const elementHeight = elementRef.current?.offsetHeight || 450

      // Constrain to viewport bounds - use safe type checking
      const left = typeof currentBounds.left === 'number' ? currentBounds.left : 0
      const right = typeof currentBounds.right === 'number' ? currentBounds.right : window.innerWidth - 50
      const top = typeof currentBounds.top === 'number' ? currentBounds.top : 0 
      const bottom = typeof currentBounds.bottom === 'number' ? currentBounds.bottom : window.innerHeight - 50
      
      newX = Math.max(left, Math.min(right - elementWidth, newX))
      newY = Math.max(top, Math.min(bottom - elementHeight, newY))

      // Update position directly in the DOM for smoother dragging
      if (elementRef.current) {
        elementRef.current.style.left = `${newX}px`
        elementRef.current.style.top = `${newY}px`
      }

      // Update the position ref (but not state during drag to avoid re-renders)
      positionRef.current = { x: newX, y: newY }
    },
    [isDragging, calculateBounds],
  )

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)

      // Apply snap to edge when drag ends
      const snappedPosition = snapPositionToEdge(positionRef.current)

      // Update the state with the final position
      setPosition(snappedPosition)

      // Also update the ref
      positionRef.current = snappedPosition

      dragStartRef.current = null

      setTimeout(() => {
        setZIndexState(zIndex)
      }, 300)

      if (onDragEnd) {
        onDragEnd(snappedPosition)
      }
    }
  }, [isDragging, snapPositionToEdge, onDragEnd, zIndex])

  // Handle window resize to keep windows in bounds
  const handleResize = useCallback(() => {
    if (!elementRef.current) return

    const currentBounds = calculateBounds()
    let newX = positionRef.current.x
    let newY = positionRef.current.y

    // Ensure the window stays within bounds after resize
    const elementWidth = elementRef.current.offsetWidth
    const elementHeight = elementRef.current.offsetHeight

    // Use safe type checking for bounds
    const left = typeof currentBounds.left === 'number' ? currentBounds.left : 0
    const right = typeof currentBounds.right === 'number' ? currentBounds.right : window.innerWidth - 50
    const top = typeof currentBounds.top === 'number' ? currentBounds.top : 0 
    const bottom = typeof currentBounds.bottom === 'number' ? currentBounds.bottom : window.innerHeight - 50

    newX = Math.max(left, Math.min(newX, right - elementWidth))
    newY = Math.max(top, Math.min(newY, bottom - elementHeight))

    if (newX !== positionRef.current.x || newY !== positionRef.current.y) {
      setPosition({ x: newX, y: newY })
      positionRef.current = { x: newX, y: newY }
    }
  }, [calculateBounds])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Add event listeners to the element for mouse events
    element.addEventListener("mousedown", handleMouseDown as any)

    // Add global event listeners for mouse move and up
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    // Add global event listeners for touch events
    element.addEventListener("touchstart", handleTouchStart as any, { passive: false })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)

    // Add window resize listener
    window.addEventListener("resize", handleResize)

    return () => {
      // Clean up all event listeners
      element.removeEventListener("mousedown", handleMouseDown as any)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      element.removeEventListener("touchstart", handleTouchStart as any)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("resize", handleResize)
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd, handleResize])

  return {
    position,
    isDragging,
    elementRef,
    setPosition,
    zIndex: zIndexState,
    handleMouseDown,
  }
}
