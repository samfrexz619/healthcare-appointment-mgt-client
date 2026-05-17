import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AxiosError } from "axios"

vi.mock("../../lib/axios", () => ({
  default: {
    post: vi.fn(),
  },
}))

import ForgotPasswordForm from "./ForgotPasswordForm"
import api from "../../lib/axios"

describe("ForgotPasswordForm", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("renders the email input and submit button", () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByRole("textbox")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument()
  })

  it("shows validation error when email is invalid", async () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByRole("textbox")
    const submitButton = screen.getByRole("button", { name: /submit/i })

    fireEvent.change(emailInput, { target: { value: "invalid-email" } })
    fireEvent.click(submitButton)

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it("submits valid email and displays success message", async () => {
    const successResponse = { data: { message: "Password reset link sent." } }
    const mockedPost = vi.mocked(api.post)
    mockedPost.mockResolvedValueOnce(successResponse)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByRole("textbox")
    const submitButton = screen.getByRole("button", { name: /submit/i })

    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "user@example.com",
      })
    })

    expect(await screen.findByText(/password reset link sent\./i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled()
  })

  it("displays server error when request fails", async () => {
    const axiosError = new AxiosError(
      "Request failed",
      undefined,
      undefined,
      undefined,
      {
        data: { message: "Email not found." },
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {},
      } as any,
    )
    const mockedPost = vi.mocked(api.post)
    mockedPost.mockRejectedValueOnce(axiosError)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByRole("textbox")
    const submitButton = screen.getByRole("button", { name: /submit/i })

    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.click(submitButton)

    expect(await screen.findByText(/email not found\./i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled()
  })
})
