import { signIn, signUp } from "@/app/login/actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

jest.mock("@/utils/supabase/server");
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("next/headers", () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue("http://localhost:3000"),
  }),
}));

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

function mockSupabase(
  authOverrides: Record<string, jest.Mock> = {},
): ReturnType<typeof jest.fn> {
  return {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({ error: null }),
      ...authOverrides,
    },
  } as unknown as ReturnType<typeof jest.fn>;
}

describe("signIn", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns an error for an invalid email format", async () => {
    const result = await signIn(
      null,
      formData({ email: "not-an-email", password: "password123" }),
    );

    expect(result).toEqual({ error: "Please enter a valid email address." });
  });

  it("returns an error when the password is shorter than 8 characters", async () => {
    const result = await signIn(
      null,
      formData({ email: "user@example.com", password: "short" }),
    );

    expect(result).toEqual({
      error: "Password must be at least 8 characters.",
    });
  });

  it("returns an error when Supabase auth fails", async () => {
    mockCreateClient.mockResolvedValue(
      mockSupabase({
        signInWithPassword: jest.fn().mockResolvedValue({
          error: { message: "Invalid login credentials" },
        }),
      }) as any,
    );

    const result = await signIn(
      null,
      formData({ email: "user@example.com", password: "password123" }),
    );

    expect(result).toEqual({ error: "Invalid email or password." });
  });

  it("redirects to /home on successful sign-in", async () => {
    mockCreateClient.mockResolvedValue(mockSupabase() as any);

    await signIn(
      null,
      formData({ email: "user@example.com", password: "password123" }),
    );

    expect(mockRedirect).toHaveBeenCalledWith("/home");
  });

  it("calls Supabase with the provided credentials", async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: null });

    mockCreateClient.mockResolvedValue(
      mockSupabase({ signInWithPassword: mockSignIn }) as any,
    );

    await signIn(
      null,
      formData({ email: "user@example.com", password: "password123" }),
    );

    expect(mockSignIn).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });
});

describe("signUp", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns an error when username is shorter than 2 characters", async () => {
    const result = await signUp(
      null,
      formData({
        username: "a",
        email: "user@example.com",
        password: "password123",
      }),
    );

    expect(result).toEqual({
      error: "Username must be between 2 and 30 characters.",
    });
  });

  it("returns an error when username is longer than 30 characters", async () => {
    const result = await signUp(
      null,
      formData({
        username: "a".repeat(31),
        email: "user@example.com",
        password: "password123",
      }),
    );

    expect(result).toEqual({
      error: "Username must be between 2 and 30 characters.",
    });
  });

  it("returns an error for an invalid email format", async () => {
    const result = await signUp(
      null,
      formData({
        username: "johndoe",
        email: "bad-email",
        password: "password123",
      }),
    );

    expect(result).toEqual({ error: "Please enter a valid email address." });
  });

  it("returns an error when the password is shorter than 8 characters", async () => {
    const result = await signUp(
      null,
      formData({
        username: "johndoe",
        email: "user@example.com",
        password: "short",
      }),
    );

    expect(result).toEqual({
      error: "Password must be at least 8 characters.",
    });
  });

  it("returns a generic error when Supabase returns an unknown error", async () => {
    mockCreateClient.mockResolvedValue(
      mockSupabase({
        signUp: jest
          .fn()
          .mockResolvedValue({ error: { message: "Something went wrong" } }),
      }) as any,
    );

    const result = await signUp(
      null,
      formData({
        username: "johndoe",
        email: "user@example.com",
        password: "password123",
      }),
    );

    expect(result).toEqual({
      error: "Could not create account. Please try again.",
    });
  });

  it("returns an 'already registered' error when email is taken", async () => {
    mockCreateClient.mockResolvedValue(
      mockSupabase({
        signUp: jest.fn().mockResolvedValue({
          error: { message: "User already registered" },
        }),
      }) as any,
    );

    const result = await signUp(
      null,
      formData({
        username: "johndoe",
        email: "taken@example.com",
        password: "password123",
      }),
    );

    expect(result).toEqual({
      error: "An account with this email already exists.",
    });
  });

  it("redirects to /home on successful sign-up", async () => {
    mockCreateClient.mockResolvedValue(mockSupabase() as any);

    await signUp(
      null,
      formData({
        username: "johndoe",
        email: "new@example.com",
        password: "password123",
      }),
    );

    expect(mockRedirect).toHaveBeenCalledWith("/home");
  });
});
