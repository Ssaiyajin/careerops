import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CareerCoachWidget from "@/components/career/CareerCoachWidget";

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = fetchMock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("shows the floating coach to signed-in users and sends a chat request", async () => {
  fetchMock.mockImplementation(async (input) => {
    if (String(input).includes("/api/auth/session")) {
      return new Response(JSON.stringify({ authenticated: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ answer: "Let's map your next step." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  render(<CareerCoachWidget />);
  fireEvent.click(
    await screen.findByRole("button", {
      name: "Open Saiyan Foundation CareerOps coach",
    })
  );

  expect(
    screen.getByRole("dialog", {
      name: "Saiyan Foundation and CareerOps career coach",
    })
  ).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("Message the career coach"), {
    target: { value: "How do I move into platform engineering?" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));

  expect(await screen.findByText("Let's map your next step.")).toBeInTheDocument();
  const chatCall = fetchMock.mock.calls.find(([input]) =>
    String(input).includes("/api/career/chat")
  );
  expect(chatCall).toBeDefined();
  expect(JSON.parse(String(chatCall?.[1]?.body))).toMatchObject({
    message: "How do I move into platform engineering?",
    resume_text: "",
  });
});

test("does not render the coach for signed-out users", async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

  render(<CareerCoachWidget />);

  await waitFor(() => {
    expect(
      screen.queryByRole("button", {
        name: "Open Saiyan Foundation CareerOps coach",
      })
    ).not.toBeInTheDocument();
  });
});
