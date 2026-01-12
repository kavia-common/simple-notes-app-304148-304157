import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app navbar", () => {
  render(<App />);
  expect(screen.getByText(/simple notes/i)).toBeInTheDocument();
});
