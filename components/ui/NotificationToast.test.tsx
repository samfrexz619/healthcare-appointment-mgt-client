import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

vi.mock('@/lib/context/AppContext', () => ({
  useAppContext: vi.fn(),
}))

import { useAppContext } from '@/lib/context/AppContext'
import NotificationToast from './NotificationToast'

const useAppContextMock = vi.mocked(useAppContext)

const createNotification = (overrides = {}) => ({
  id: 'notif-1',
  message: 'Test notification',
  type: 'info' as const,
  timestamp: new Date(),
  isRead: false,
  ...overrides,
})

describe('NotificationToast component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    useAppContextMock.mockReturnValue({
      user: null,
      isLoadingUser: false,
      notifications: [],
      toasts: [],
      unreadCount: 0,
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAllRead: vi.fn(),
      markOneRead: vi.fn(),
      dismissToast: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<NotificationToast />)
    const toastMessages = container.querySelectorAll('p')
    expect(toastMessages.length).toBe(0)
  })

  it('renders a single toast with message and timestamp', () => {
    const dismissToast = vi.fn()
    useAppContextMock.mockReturnValue({
      user: null,
      isLoadingUser: false,
      notifications: [],
      toasts: [
        createNotification({
          id: 'toast-1',
          message: 'Appointment booked successfully',
          type: 'success',
          timestamp: new Date('2024-01-01T12:00:00Z'),
        }),
      ],
      unreadCount: 0,
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAllRead: vi.fn(),
      markOneRead: vi.fn(),
      dismissToast,
    })

    render(<NotificationToast />)

    expect(screen.getByText(/Appointment booked successfully/i)).toBeInTheDocument()
    expect(screen.getByText(/12:00/)).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    const dismissToast = vi.fn()
    useAppContextMock.mockReturnValue({
      user: null,
      isLoadingUser: false,
      notifications: [],
      toasts: [
        createNotification({
          id: 'toast-1',
          message: 'First notification',
          type: 'success',
        }),
        createNotification({
          id: 'toast-2',
          message: 'Second notification',
          type: 'error',
        }),
        createNotification({
          id: 'toast-3',
          message: 'Third notification',
          type: 'info',
        }),
      ],
      unreadCount: 0,
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAllRead: vi.fn(),
      markOneRead: vi.fn(),
      dismissToast,
    })

    render(<NotificationToast />)

    expect(screen.getByText(/First notification/i)).toBeInTheDocument()
    expect(screen.getByText(/Second notification/i)).toBeInTheDocument()
    expect(screen.getByText(/Third notification/i)).toBeInTheDocument()
  })

  it('calls dismissToast when close button is clicked', () => {
    const dismissToast = vi.fn()
    useAppContextMock.mockReturnValue({
      user: null,
      isLoadingUser: false,
      notifications: [],
      toasts: [
        createNotification({
          id: 'toast-1',
          message: 'Test message',
          type: 'info',
        }),
      ],
      unreadCount: 0,
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAllRead: vi.fn(),
      markOneRead: vi.fn(),
      dismissToast,
    })

    const { container } = render(<NotificationToast />)

    const closeButton = container.querySelector('button')
    expect(closeButton).toBeInTheDocument()

    fireEvent.click(closeButton!)

    expect(dismissToast).toHaveBeenCalledWith('toast-1')
  })

  it('auto-dismisses toast after 5 seconds', async () => {
    const dismissToast = vi.fn()
    useAppContextMock.mockReturnValue({
      user: null,
      isLoadingUser: false,
      notifications: [],
      toasts: [
        createNotification({
          id: 'toast-1',
          message: 'Auto dismiss test',
          type: 'info',
        }),
      ],
      unreadCount: 0,
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAllRead: vi.fn(),
      markOneRead: vi.fn(),
      dismissToast,
    })

    render(<NotificationToast />)

    expect(dismissToast).not.toHaveBeenCalled()

    vi.advanceTimersByTime(5000)

    expect(dismissToast).toHaveBeenCalledWith('toast-1')
  })

  it('applies correct styling based on notification type', () => {
    const dismissToast = vi.fn()

    useAppContextMock.mockReturnValue({
      user: null,
      isLoadingUser: false,
      notifications: [],
      toasts: [
        createNotification({
          id: 'toast-1',
          message: 'Success message',
          type: 'success',
        }),
      ],
      unreadCount: 0,
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAllRead: vi.fn(),
      markOneRead: vi.fn(),
      dismissToast,
    })

    const { container, rerender } = render(<NotificationToast />)

    let toast = container.querySelector('div[class*="border-l-4"]')
    expect(toast?.className).toContain('border-green-500')

    useAppContextMock.mockReturnValue({
      user: null,
      isLoadingUser: false,
      notifications: [],
      toasts: [
        createNotification({
          id: 'toast-2',
          message: 'Error message',
          type: 'error',
        }),
      ],
      unreadCount: 0,
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAllRead: vi.fn(),
      markOneRead: vi.fn(),
      dismissToast,
    })

    rerender(<NotificationToast />)

    toast = container.querySelector('div[class*="border-l-4"]')
    expect(toast?.className).toContain('border-red-500')
  })

  it('clears timeout when component unmounts', () => {
    const dismissToast = vi.fn()
    useAppContextMock.mockReturnValue({
      user: null,
      isLoadingUser: false,
      notifications: [],
      toasts: [
        createNotification({
          id: 'toast-1',
          message: 'Test message',
          type: 'info',
        }),
      ],
      unreadCount: 0,
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAllRead: vi.fn(),
      markOneRead: vi.fn(),
      dismissToast,
    })

    const { unmount } = render(<NotificationToast />)

    unmount()

    vi.advanceTimersByTime(5000)

    expect(dismissToast).not.toHaveBeenCalled()
  })

  it('displays correct color dot based on notification type', () => {
    const dismissToast = vi.fn()

    const testTypes: Array<'success' | 'error' | 'info'> = [
      'success',
      'error',
      'info',
    ]
    const expectedColors = ['bg-green-500', 'bg-red-500', 'bg-blue-500']

    testTypes.forEach((notifType, index) => {
      useAppContextMock.mockReturnValue({
        user: null,
        isLoadingUser: false,
        notifications: [],
        toasts: [
          createNotification({
            id: `toast-${index}`,
            message: `${notifType} message`,
            type: notifType,
          }),
        ],
        unreadCount: 0,
        addNotification: vi.fn(),
        removeNotification: vi.fn(),
        clearNotifications: vi.fn(),
        markAllRead: vi.fn(),
        markOneRead: vi.fn(),
        dismissToast,
      })

      const { container } = render(<NotificationToast />)
      const dot = container.querySelector('span[class*="rounded-full"]')
      expect(dot?.className).toContain(expectedColors[index])
    })
  })
})
