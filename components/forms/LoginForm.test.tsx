import React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AxiosError } from "axios"

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => React.createElement("img", props),
}))

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    React.createElement("a", { href, ...props }, children)
  ),
}))

vi.mock("@/lib/services/authService", () => ({
  authService: {
    login: vi.fn(),
  },
}))

import LoginForm from "./LoginForm"
import { authService } from "@/lib/services/authService"

describe("LoginForm", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("renders the email and password inputs and sign in button", () => {
    const { container } = render(<LoginForm />)

    const emailInput = container.querySelector("input#email")
    const passwordInput = container.querySelector("input#password")

    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("shows validation error when the email is invalid", async () => {
    const loginMock = vi.mocked(authService.login)
    const { container } = render(<LoginForm />)

    const emailInput = container.querySelector("input#email") as HTMLInputElement
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "invalid-email" } })
    fireEvent.click(submitButton)

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it("shows validation error when the password is too short", async () => {
    const loginMock = vi.mocked(authService.login)
    const { container } = render(<LoginForm />)

    const emailInput = container.querySelector("input#email") as HTMLInputElement
    const passwordInput = container.querySelector("input#password") as HTMLInputElement
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "123" } })
    fireEvent.click(submitButton)

    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it("submits valid credentials and navigates to dashboard", async () => {
    const loginMock = vi.mocked(authService.login)
    loginMock.mockResolvedValueOnce({})

    const { container } = render(<LoginForm />)
    const emailInput = container.querySelector("input#email") as HTMLInputElement
    const passwordInput = container.querySelector("input#password") as HTMLInputElement
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("user@example.com", "password123")
      expect(mockPush).toHaveBeenCalledWith("/dashboard/home")
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("displays a server error when login fails", async () => {
    const loginMock = vi.mocked(authService.login)
    const axiosError = new AxiosError(
      "Request failed",
      undefined,
      undefined,
      undefined,
      {
        data: { message: "Invalid credentials." },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {},
      } as any,
    )
    loginMock.mockRejectedValueOnce(axiosError)

    const { container } = render(<LoginForm />)
    const emailInput = container.querySelector("input#email") as HTMLInputElement
    const passwordInput = container.querySelector("input#password") as HTMLInputElement
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    expect(await screen.findByText(/invalid credentials\./i)).toBeInTheDocument()
    await waitFor(() => expect(submitButton).toBeEnabled())
  })

  it("redirects to google auth when clicking the Google sign in area", () => {
    const originalApiUrl = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = "http://localhost"

    const originalLocation = window.location
    delete (window as any).location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    })

    render(<LoginForm />)
    fireEvent.click(screen.getByText(/sign in with google/i))

    expect(window.location.href).toBe("http://localhost/auth/google")

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl
  })
})
