import { createWorkout } from "@/app/workouts/new/actions";
import { createClient } from "@/utils/supabase/server";

jest.mock("@/utils/supabase/server");

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Builds a chainable Supabase query mock that resolves with the given value.
function makeQueryChain(resolvedValue: object) {
  const chain = {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    eq: jest.fn().mockReturnThis(),
  };
  return chain;
}

const VALID_INPUT = {
  title: "Push Day",
  notes: "",
  exercises: [],
};

describe("createWorkout", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns an error when the user is not authenticated", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as any);

    const result = await createWorkout(VALID_INPUT);
    expect(result).toEqual({ error: "Not authenticated." });
  });

  it("returns an error when the workout DB insert fails", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: jest
        .fn()
        .mockReturnValue(
          makeQueryChain({ data: null, error: { message: "DB error" } })
        ),
    } as any);

    const result = await createWorkout(VALID_INPUT);
    expect(result).toEqual({ error: "Failed to save workout." });
  });

  it("returns the new workout ID on success with no exercises", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: jest
        .fn()
        .mockReturnValue(
          makeQueryChain({ data: { id: "workout-abc" }, error: null })
        ),
    } as any);

    const result = await createWorkout(VALID_INPUT);
    expect(result).toEqual({ workoutId: "workout-abc" });
  });

  it("inserts the workout with the correct user_id and title", async () => {
    const mockInsert = jest.fn().mockReturnThis();
    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "workout-abc" }, error: null }),
    });

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: mockFrom,
    } as any);

    await createWorkout({ title: "Leg Day", notes: "Heavy", exercises: [] });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1", title: "Leg Day" })
    );
  });

  it("returns an error when an exercise DB insert fails", async () => {
    let callCount = 0;
    const mockFrom = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // workout insert succeeds
        return makeQueryChain({ data: { id: "workout-abc" }, error: null });
      }
      // exercise insert fails
      return makeQueryChain({ data: null, error: { message: "exercise error" } });
    });

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: mockFrom,
    } as any);

    const result = await createWorkout({
      title: "Test",
      notes: "",
      exercises: [
        {
          library_id: "lib-1",
          custom_name: null,
          order_index: 0,
          sets: [{ set_index: 0, reps: 10, weight_kg: 100 }],
        },
      ],
    });

    expect(result).toEqual({ error: "Failed to save exercise." });
  });
});
