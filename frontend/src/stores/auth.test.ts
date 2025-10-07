import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./auth";
import { authService } from "@/services/auth";

vi.mock("@/services/auth", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    setToken: vi.fn(),
    setUser: vi.fn(),
    getUser: vi.fn(),
  },
}));

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should initialize with no user", () => {
    vi.mocked(authService.getUser).mockReturnValue(null);
    const store = useAuthStore();

    expect(store.user).toBeNull();
  });

  it("should login successfully", async () => {
    const mockResponse = {
      access_token: "test-token",
      user: {
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        companyName: "Test Company",
      },
    };

    vi.mocked(authService.login).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    await store.login("test@example.com", "password123");

    expect(authService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );
    expect(authService.setToken).toHaveBeenCalledWith("test-token");
    expect(authService.setUser).toHaveBeenCalledWith(mockResponse.user);
    expect(store.user).toEqual(mockResponse.user);
    expect(store.isAuthenticated).toBe(true);
  });

  it("should register successfully", async () => {
    const mockData = {
      email: "test@example.com",
      password: "password123",
      accountType: "individual" as const,
      firstName: "John",
      lastName: "Doe",
      companyName: "Test Company",
    };

    const mockResponse = {
      access_token: "test-token",
      user: {
        id: "1",
        email: mockData.email,
        firstName: mockData.firstName,
        lastName: mockData.lastName,
        companyName: mockData.companyName,
      },
    };

    vi.mocked(authService.register).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    await store.register(mockData);

    expect(authService.register).toHaveBeenCalledWith(mockData);
    expect(authService.setToken).toHaveBeenCalledWith("test-token");
    expect(authService.setUser).toHaveBeenCalledWith(mockResponse.user);
    expect(store.user).toEqual(mockResponse.user);
    expect(store.isAuthenticated).toBe(true);
  });

  it("should logout successfully", () => {
    const store = useAuthStore();
    store.user = {
      id: "1",
      email: "test@example.com",
      accountType: "individual",
      firstName: "John",
      lastName: "Doe",
    };
    store.isAuthenticated = true;

    store.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it("should update profile successfully", async () => {
    const mockUpdateData = {
      firstName: "Jane",
      lastName: "Smith",
      phone: "+1234567890",
    };

    const mockUpdatedUser = {
      id: "1",
      email: "test@example.com",
      accountType: "individual",
      firstName: "Jane",
      lastName: "Smith",
      phone: "+1234567890",
    };

    vi.mocked(authService.updateProfile).mockResolvedValue(mockUpdatedUser);

    const store = useAuthStore();
    store.user = {
      id: "1",
      email: "test@example.com",
      accountType: "individual",
      firstName: "John",
      lastName: "Doe",
    };

    const result = await store.updateProfile(mockUpdateData);

    expect(authService.updateProfile).toHaveBeenCalledWith(mockUpdateData);
    expect(authService.setUser).toHaveBeenCalledWith(mockUpdatedUser);
    expect(store.user).toEqual(mockUpdatedUser);
    expect(result).toEqual(mockUpdatedUser);
  });
});
