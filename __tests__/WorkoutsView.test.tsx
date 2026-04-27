import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkoutsView, WorkoutItem } from "@/app/workouts/WorkoutsView";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Pin the current date so calendar tests are deterministic.
const FIXED_DATE = new Date("2026-04-24T12:00:00");

const WORKOUTS: WorkoutItem[] = [
  {
    id: "w1",
    title: "Push Day",
    completed_at: "2026-04-20T10:00:00",
    exerciseCount: 5,
  },
  {
    id: "w2",
    title: "Pull Day",
    completed_at: "2026-04-22T10:00:00",
    exerciseCount: 4,
  },
];

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_DATE);
});

afterEach(() => {
  jest.useRealTimers();
});

// ── List view ──────────────────────────────────────────────────────────────

describe("WorkoutsView — list view", () => {
  it("renders workout titles in list mode by default", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    expect(screen.getByText("Push Day")).toBeInTheDocument();
    expect(screen.getByText("Pull Day")).toBeInTheDocument();
  });

  it("shows the empty state when there are no workouts", () => {
    render(<WorkoutsView workouts={[]} />);
    expect(screen.getByText("No workouts yet")).toBeInTheDocument();
  });

  it("shows exercise counts for each workout card", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    expect(screen.getByText("5 exercises")).toBeInTheDocument();
    expect(screen.getByText("4 exercises")).toBeInTheDocument();
  });

  it("renders workout cards as links to the detail page", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    const links = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href")?.startsWith("/workouts/w"));
    expect(links[0]).toHaveAttribute("href", "/workouts/w1");
    expect(links[1]).toHaveAttribute("href", "/workouts/w2");
  });
});

// ── Calendar view ─────────────────────────────────────────────────────────

describe("WorkoutsView — calendar view", () => {
  function switchToCalendar() {
    fireEvent.click(screen.getByLabelText("Calendar view"));
  }

  it("switches to calendar view and shows day-of-week headers", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    switchToCalendar();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
  });

  it("shows the current month and year in the header", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    switchToCalendar();
    // FIXED_DATE is April 2026
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "April 2026"
    );
  });

  it("navigates to the previous month on clicking the back arrow", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    switchToCalendar();
    fireEvent.click(screen.getByLabelText("Previous month"));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "March 2026"
    );
  });

  it("navigates to the next month on clicking the forward arrow", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    switchToCalendar();
    fireEvent.click(screen.getByLabelText("Next month"));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "May 2026"
    );
  });

  it("wraps from January to December when going back", () => {
    render(<WorkoutsView workouts={[]} />);
    switchToCalendar();
    // Navigate from April → January (3 times back)
    fireEvent.click(screen.getByLabelText("Previous month"));
    fireEvent.click(screen.getByLabelText("Previous month"));
    fireEvent.click(screen.getByLabelText("Previous month"));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "January 2026"
    );
    fireEvent.click(screen.getByLabelText("Previous month"));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "December 2025"
    );
  });

  it("shows the selected-day panel when a workout day is clicked", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    switchToCalendar();
    // April 20 has "Push Day" — find the enabled button with text "20"
    const day20 = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.trim() === "20" && !btn.disabled);
    expect(day20).toBeDefined();
    fireEvent.click(day20!);
    expect(screen.getByText("Push Day")).toBeInTheDocument();
  });

  it("hides the selected-day panel when the same day is clicked again", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    switchToCalendar();
    const day20 = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.trim() === "20" && !btn.disabled);
    fireEvent.click(day20!);
    // Panel visible
    expect(screen.getByText("Push Day")).toBeInTheDocument();
    fireEvent.click(day20!);
    // Panel gone — Push Day no longer in DOM
    expect(screen.queryByText("Push Day")).not.toBeInTheDocument();
  });

  it("clears the selection when navigating to another month", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    switchToCalendar();
    const day20 = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.trim() === "20" && !btn.disabled);
    fireEvent.click(day20!);
    expect(screen.getByText("Push Day")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next month"));
    expect(screen.queryByText("Push Day")).not.toBeInTheDocument();
  });

  it("switches back to list view and shows workout cards again", () => {
    render(<WorkoutsView workouts={WORKOUTS} />);
    switchToCalendar();
    fireEvent.click(screen.getByLabelText("List view"));
    expect(screen.getByText("Push Day")).toBeInTheDocument();
    expect(screen.getByText("Pull Day")).toBeInTheDocument();
  });
});
