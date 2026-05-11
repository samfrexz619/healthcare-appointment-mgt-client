import { expect, it, describe, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/lib/context/AppContext', () => ({
  useAppContext: vi.fn(),
}))

import { useAppContext } from '@/lib/context/AppContext'
import HeaderBox from './HeaderBox'

const useAppContextMock = vi.mocked(useAppContext)

const createContextValue = (overrides = {}) => ({
  user: {
    id: 'user-1',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    role: 'doctor',
    is_verified: true,
  },
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
  ...overrides,
})

describe('HeaderBox component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useAppContextMock.mockReturnValue(createContextValue())
  })

  it('renders the search input and user info from localStorage', () => {
    localStorage.setItem('user_first_name', 'Jane')
    localStorage.setItem('user_last_name', 'Doe')
    localStorage.setItem('user_role', 'nurse')

    useAppContextMock.mockReturnValue(
      createContextValue({ user: { ...createContextValue().user, role: 'nurse' } }),
    )

    render(<HeaderBox />)

    expect(
      screen.getByPlaceholderText(/Search doctor or specialist/i),
    ).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByText(/jane doe/i)).toBeInTheDocument()
    expect(screen.getByText(/nurse/i)).toBeInTheDocument()
  })

  it('shows an unread badge when unreadCount is greater than zero', () => {
    useAppContextMock.mockReturnValue(
      createContextValue({ unreadCount: 5 }),
    )

    render(<HeaderBox />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('opens the notification dropdown and shows empty state when there are no notifications', () => {
    const { container } = render(<HeaderBox />)
    const bellButton = container.querySelector('button') as HTMLButtonElement

    fireEvent.click(bellButton)

    expect(screen.getByText(/^Notifications$/i)).toBeInTheDocument()
    expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument()
  })

  it('calls markAllRead and clearNotifications when notification actions are clicked', () => {
    const markAllRead = vi.fn()
    const clearNotifications = vi.fn()

    useAppContextMock.mockReturnValue(
      createContextValue({
        unreadCount: 1,
        notifications: [
          {
            id: '1',
            message: 'Test notification',
            type: 'info',
            timestamp: new Date('2024-01-01T12:00:00Z'),
            isRead: false,
          },
        ],
        markAllRead,
        clearNotifications,
      }),
    )

    const { container } = render(<HeaderBox />)
    const bellButton = container.querySelector('button') as HTMLButtonElement
    fireEvent.click(bellButton)

    fireEvent.click(screen.getByText(/Mark all read/i))
    expect(markAllRead).toHaveBeenCalled()

    fireEvent.click(screen.getByText(/Clear all/i))
    expect(clearNotifications).toHaveBeenCalled()
  })

  it('calls markOneRead when a notification item is clicked', () => {
    const markOneRead = vi.fn()
    const notifications = [
      {
        id: 'notify-1',
        message: 'New appointment available',
        type: 'success',
        timestamp: new Date('2024-01-01T12:00:00Z'),
        isRead: false,
      },
    ]

    useAppContextMock.mockReturnValue(
      createContextValue({ unreadCount: 1, notifications, markOneRead }),
    )

    const { container } = render(<HeaderBox />)
    const bellButton = container.querySelector('button') as HTMLButtonElement
    fireEvent.click(bellButton)

    fireEvent.click(screen.getByText(/New appointment available/i))
    expect(markOneRead).toHaveBeenCalledWith('notify-1')
  })
})