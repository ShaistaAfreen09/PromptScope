import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ApiKeysPage } from "../../src/components/ApiKeysPage";

// Mock globally used fetch client
global.fetch = vi.fn();

describe("ApiKeysPage Integration Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders credential headers and registers loading states", async () => {
    // Mock the initial empty keys response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, keys: [] })
    });

    render(<ApiKeysPage />);

    expect(screen.getByText("API Keys & Credentials Vault")).toBeInTheDocument();
    expect(screen.getByText("Loading vault...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading vault...")).not.toBeInTheDocument();
    });
  });

  it("loads and displays registered api keys successfully from the database", async () => {
    const mockKeys = [
      {
        id: "key-123",
        provider: "Google Gemini",
        maskedKey: "gem-*******abc",
        isActive: true,
        lastValidatedAt: "2026-06-23T10:00:00.000Z",
        createdAt: "2026-06-23T08:00:00.000Z"
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, keys: mockKeys })
    });

    render(<ApiKeysPage />);

    await waitFor(() => {
      expect(screen.getByText("Google Gemini")).toBeInTheDocument();
      expect(screen.getByText("gem-*******abc")).toBeInTheDocument();
    });
  });

  it("submits and registers a new secure credential successfully", async () => {
    // Mock the list response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, keys: [] })
    });

    // Mock the post register response
    const newMockKey = {
      id: "key-999",
      provider: "OpenAI GPT-4",
      maskedKey: "sk-*******xyz",
      isActive: true,
      lastValidatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, key: newMockKey })
    });

    render(<ApiKeysPage />);

    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading vault...")).not.toBeInTheDocument();
    });

    // Locate form elements
    const select = screen.getByLabelText("AI Provider Platform");
    const input = screen.getByLabelText("Raw API Secret Key");
    const submitBtn = screen.getByRole("button", { name: "Encrypt & Vault Key" });

    // Fill form and submit
    fireEvent.change(select, { target: { value: "OpenAI GPT-4" } });
    fireEvent.change(input, { target: { value: "sk-mysecretkeygoeshere" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/keys", expect.any(Object));
      expect(screen.getByText(/Secure API Key for OpenAI GPT-4 registered with AES Base64 masking!/i)).toBeInTheDocument();
    });
  });
});
