import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders brand name WristFit", () => {
  render(<App />);
  const brand = screen.getAllByText(/WristFit/i)[0];
  expect(brand).toBeInTheDocument();
});
