import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner Component", () => {
  //test case 1 : kiểm tra khi loading là true thì component sẽ hiển thị
  test("renders loading spinner when loading is true", () => {
    render(<LoadingSpinner loading={true} />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    const loadingTexts = screen.getAllByText("Loading...");
    expect(loadingTexts).toHaveLength(2); // Có đúng 2 elements
    expect(loadingTexts[0]).toBeInTheDocument(); // Element đầu tiên tồn tại
  });

  //test case 2 : kiểm tra khi loading là false thì component sẽ không hiển thị
  test("does not render when loading is false", () => {
    render(<LoadingSpinner loading={false} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  //test case 3 : kiểm tra custome message
  test("displays custom message", () => {
    render(<LoadingSpinner loading={true} message="Saving..." />);

    const savingTexts = screen.getAllByText("Saving...");
    expect(savingTexts).toHaveLength(2);
  });

  //test case 4 : kiểm tra return null khi loading là false
  test("returns null when loading is false", () => {
    const { container } = render(<LoadingSpinner loading={false} />);

    expect(container.firstChild).toBeNull();
  });
});
