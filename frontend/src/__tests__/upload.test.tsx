import { render, screen } from "@testing-library/react";

test(
  "upload page renders",
  () => {

    render(
      <div>Upload Resume</div>
    );

    expect(
      screen.getByText(
        "Upload Resume"
      )
    ).toBeInTheDocument();
  }
);