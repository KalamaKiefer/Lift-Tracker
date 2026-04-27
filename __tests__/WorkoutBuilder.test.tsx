import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkoutBuilder } from "@/app/workouts/new/WorkoutBuilder";
import { createWorkout } from "@/app/workouts/new/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

jest.mock("@/app/workouts/new/actions", () => ({
  createWorkout: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

const mockCreateWorkout = createWorkout as jest.MockedFunction<
  typeof createWorkout
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

const LIBRARY = [
  {
    id: "lib-bench",
    name: "Bench Press",
    muscle_groups: ["chest"],
    equipment: "barbell",
  },
  {
    id: "lib-squat",
    name: "Squat",
    muscle_groups: ["quads"],
    equipment: "barbell",
  },
  {
    id: "lib-pullup",
    name: "Pull-Up",
    muscle_groups: ["lats"],
    equipment: "bodyweight",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRouter.mockReturnValue({ push: mockPush } as ReturnType<
    typeof useRouter
  >);
});

// ── Initial render ─────────────────────────────────────────────────────────

describe("WorkoutBuilder — initial state", () => {
  it("renders the title input", () => {
    render(<WorkoutBuilder exercises={LIBRARY} />);
    expect(screen.getByPlaceholderText("Workout Title")).toBeInTheDocument();
  });

  it("shows the empty-state prompt before any exercise is added", () => {
    render(<WorkoutBuilder exercises={LIBRARY} />);
    expect(
      screen.getByText(/Add your first exercise below/i)
    ).toBeInTheDocument();
  });

  it("shows the Finish button", () => {
    render(<WorkoutBuilder exercises={LIBRARY} />);
    expect(screen.getByRole("button", { name: /finish/i })).toBeInTheDocument();
  });
});

// ── Exercise search ────────────────────────────────────────────────────────

describe("WorkoutBuilder — exercise search", () => {
  it("opens the search panel when Add Exercise is clicked", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByText("Add Exercise"));
    expect(
      screen.getByPlaceholderText("Search exercises…")
    ).toBeInTheDocument();
  });

  it("shows all library exercises when search is open with no query", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByText("Add Exercise"));
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Squat")).toBeInTheDocument();
    expect(screen.getByText("Pull-Up")).toBeInTheDocument();
  });

  it("filters exercises by the typed query", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByText("Add Exercise"));
    await user.type(screen.getByPlaceholderText("Search exercises…"), "bench");
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.queryByText("Squat")).not.toBeInTheDocument();
  });

  it("closes the search panel when X is clicked", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByText("Add Exercise"));
    await user.click(screen.getByLabelText("Close search"));
    expect(
      screen.queryByPlaceholderText("Search exercises…")
    ).not.toBeInTheDocument();
  });
});

// ── Adding exercises ───────────────────────────────────────────────────────

describe("WorkoutBuilder — adding exercises", () => {
  it("adds a library exercise card when clicked", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByText("Add Exercise"));
    await user.click(screen.getByText("Bench Press"));
    // The exercise card heading should appear
    expect(
      screen.getByRole("heading", { name: "Bench Press" })
    ).toBeInTheDocument();
  });

  it("shows set column headers after adding an exercise", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByText("Add Exercise"));
    await user.click(screen.getByText("Squat"));
    expect(screen.getByText("Reps")).toBeInTheDocument();
    expect(screen.getByText("kg")).toBeInTheDocument();
  });

  it("adds a custom exercise from the search query", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByText("Add Exercise"));
    await user.type(
      screen.getByPlaceholderText("Search exercises…"),
      "Dragon Flag"
    );
    // Text is split across React nodes, so match by element text content
    await user.click(
      screen.getByRole("button", {
        name: (_, el) =>
          (el.textContent ?? "").includes("Dragon Flag") &&
          (el.textContent ?? "").includes("custom exercise"),
      })
    );
    expect(screen.getByRole("heading", { name: "Dragon Flag" })).toBeInTheDocument();
    expect(screen.getByText("· custom")).toBeInTheDocument();
  });

  it("closes the search panel after adding an exercise", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByText("Add Exercise"));
    await user.click(screen.getByText("Pull-Up"));
    expect(
      screen.queryByPlaceholderText("Search exercises…")
    ).not.toBeInTheDocument();
  });
});

// ── Set management ─────────────────────────────────────────────────────────

describe("WorkoutBuilder — set management", () => {
  async function addExercise(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByText("Add Exercise"));
    await user.click(screen.getByText("Bench Press"));
  }

  it("starts with one set row after adding an exercise", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await addExercise(user);
    // Set number "1" in the set label column
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("adds a second set row when Add Set is clicked", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await addExercise(user);
    await user.click(screen.getByText("Add Set"));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("removes an exercise when the trash button is clicked", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await addExercise(user);
    expect(screen.getByRole("heading", { name: "Bench Press" })).toBeInTheDocument();
    await user.click(screen.getByLabelText("Remove exercise"));
    expect(
      screen.queryByRole("heading", { name: "Bench Press" })
    ).not.toBeInTheDocument();
  });
});

// ── Submitting ─────────────────────────────────────────────────────────────

describe("WorkoutBuilder — submission", () => {
  it("shows a toast error and does not call createWorkout with no exercises", async () => {
    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);
    await user.click(screen.getByRole("button", { name: /finish/i }));
    expect(toast.error).toHaveBeenCalledWith(
      "Add at least one exercise before finishing."
    );
    expect(mockCreateWorkout).not.toHaveBeenCalled();
  });

  it("calls createWorkout with the correct payload and redirects on success", async () => {
    mockCreateWorkout.mockResolvedValue({ workoutId: "new-id" });

    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);

    // Add Bench Press
    await user.click(screen.getByText("Add Exercise"));
    await user.click(screen.getByText("Bench Press"));

    // Fill in reps and weight
    const inputs = screen.getAllByPlaceholderText("—");
    await user.clear(inputs[0]);
    await user.type(inputs[0], "10"); // reps
    await user.clear(inputs[1]);
    await user.type(inputs[1], "80"); // weight

    await user.click(screen.getByRole("button", { name: /finish/i }));

    await waitFor(() =>
      expect(mockCreateWorkout).toHaveBeenCalledWith(
        expect.objectContaining({
          exercises: expect.arrayContaining([
            expect.objectContaining({
              library_id: "lib-bench",
              sets: expect.arrayContaining([
                expect.objectContaining({ reps: 10, weight_kg: 80 }),
              ]),
            }),
          ]),
        })
      )
    );

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/workouts/new-id")
    );
  });

  it("shows a toast error when createWorkout returns an error", async () => {
    mockCreateWorkout.mockResolvedValue({ error: "Failed to save workout." });

    const user = userEvent.setup();
    render(<WorkoutBuilder exercises={LIBRARY} />);

    await user.click(screen.getByText("Add Exercise"));
    await user.click(screen.getByText("Bench Press"));
    await user.click(screen.getByRole("button", { name: /finish/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to save workout.")
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
