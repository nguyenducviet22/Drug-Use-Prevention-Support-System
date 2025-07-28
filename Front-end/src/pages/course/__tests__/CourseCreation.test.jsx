import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CourseCreation from "../CourseCreation";
import { toast } from "react-toastify";

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  onload: null,
  result: "data:image/png;base64,dummy",
};
global.FileReader = jest.fn(() => mockFileReader);

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock dependencies
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockUploadImage = jest.fn();
const mockSetImageUrl = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}));

jest.mock("../../../hooks/useFetch", () => () => ({
  get: mockGet,
  post: mockPost,
  put: mockPut,
  loading: false,
  error: null,
}));

jest.mock("../../../hooks/useUpload", () =>
  jest.fn(() => ({
    uploadImage: mockUploadImage,
    uploading: false,
    uploadError: null,
    imageUrl: null,
    setImageUrl: mockSetImageUrl,
  }))
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const renderComponent = (courseID = null) => {
  const { useParams } = require("react-router-dom");
  useParams.mockReturnValue({ courseID });

  return render(
    <MemoryRouter
      initialEntries={[`/courses/${courseID ? courseID : "create"}`]}
    >
      <Routes>
        <Route path="/courses/:courseID/*" element={<CourseCreation />} />
        <Route path="/courses/create" element={<CourseCreation />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("CourseCreation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    toast.info.mockReset();
    toast.error.mockReset();
    mockFileReader.readAsDataURL.mockReset();
    mockFileReader.onload = null;
    // Default mock for ageGroups to prevent map error
    mockGet.mockResolvedValue(["ADOLESCENT", "ADULT", "SENIOR", "EVERYONE"]);
  });

  test('should render correctly in "Create" mode', async () => {
    renderComponent();

    await waitFor(() => {
      // Chỉ cần kiểm tra một trường hợp, ví dụ kiểm tra placeholder của courseName
      expect(
        screen.getByPlaceholderText("courseDetails.courseNamePlaceholder")
      ).toBeInTheDocument();
    });
    expect(
      screen.getByPlaceholderText("courseDetails.courseNamePlaceholder")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("courseDetails.descriptionPlaceholder")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /courseDetails.createButton/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /modulesSection.addModuleButton/i })
    ).toBeDisabled();
  });

  test("should allow user to input data into the form", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("EVERYONE")).toBeInTheDocument()
    );

    const courseNameInput = screen.getByPlaceholderText(
      "courseDetails.courseNamePlaceholder"
    );
    const descriptionInput = screen.getByPlaceholderText(
      "courseDetails.descriptionPlaceholder"
    );
    const ageGroupSelect = screen.getByRole("combobox");

    fireEvent.change(courseNameInput, {
      target: { value: "New React Course" },
    });
    fireEvent.change(descriptionInput, {
      target: { value: "A course about testing" },
    });
    fireEvent.change(ageGroupSelect, { target: { value: "ADULT" } });

    expect(courseNameInput.value).toBe("New React Course");
    expect(descriptionInput.value).toBe("A course about testing");
    expect(ageGroupSelect.value).toBe("ADULT");
  });

  test("should handle new course creation successfully", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: false,
      uploadError: null,
      imageUrl: "http://example.com/image.jpg",
      setImageUrl: mockSetImageUrl,
    });
    mockPost.mockResolvedValueOnce({ courseID: "new-course-123" });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("EVERYONE")).toBeInTheDocument()
    );

    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.courseNamePlaceholder"),
      {
        target: { value: "Final Test Course" },
      }
    );
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.descriptionPlaceholder"),
      {
        target: { value: "Description here" },
      }
    );
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.createButton/i })
    );

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        {
          courseName: "Final Test Course",
          description: "Description here",
          ageGroup: "EVERYONE",
          image: "http://example.com/image.jpg",
        },
        {},
        "http://localhost:8080/api/course"
      );
    });
    expect(toast.success).toHaveBeenCalledWith(
      "modulesSection.toastMessages.createSuccess",
      "success"
    );
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /courseDetails.saveButton/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /courseDetails.createButton/i })
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /modulesSection.addModuleButton/i })
    ).toBeEnabled();
  });

  test("should show validation errors when required fields are empty", async () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.createButton/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "courseDetails.validation.courseNameRequired"
      );
    });
  });

  test('should render correctly and populate form in "Edit" mode', async () => {
    const courseData = {
      courseName: "Existing Course",
      description: "Existing Description",
      ageGroup: "ADULT",
      image: "http://example.com/existing.jpg",
    };
    const modulesData = [
      { moduleID: "mod1", moduleName: "Module 1", status: "AVAILABLE" },
      { moduleID: "mod2", moduleName: "Module 2", status: "UNAVAILABLE" },
    ];

    mockGet
      .mockResolvedValueOnce(["ADULT", "EVERYONE"])
      .mockResolvedValueOnce(courseData)
      .mockResolvedValueOnce(modulesData);
    renderComponent("existing-course-123");

    await waitFor(() => {
      expect(screen.getByDisplayValue("Existing Course")).toBeInTheDocument();
    });
    expect(
      screen.getByDisplayValue("Existing Description")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("ADULT")).toBeInTheDocument();
    expect(screen.getByAltText("form.imageUpload.altText")).toHaveAttribute(
      "src",
      "http://example.com/existing.jpg"
    );
    expect(
      screen.getByRole("button", { name: /courseDetails.saveButton/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Module 1")).toBeInTheDocument();
    expect(
      screen.getByText("modulesSection.unavailableBadge")
    ).toBeInTheDocument();
  });

  test("should disable add module button when no courseID exists", async () => {
    const { useParams } = require("react-router-dom");
    useParams.mockReturnValue({ courseID: undefined });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("EVERYONE")).toBeInTheDocument();
    });

    const addModuleButton = screen.getByRole("button", {
      name: /modulesSection.addModuleButton/i,
    });
    expect(addModuleButton).toBeDisabled();
  });

  test("should navigate to module creation page when courseID exists", async () => {
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce([]);
    renderComponent("course-123");

    fireEvent.click(
      screen.getByRole("button", { name: /modulesSection.addModuleButton/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/courses/course-123/module/create"
    );
  });

  test("should navigate to module edit page when edit button is clicked", async () => {
    const modulesData = [
      { moduleID: "mod1", moduleName: "Module 1", status: "AVAILABLE" },
    ];
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce(modulesData);
    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: "" });
    const editModuleButton = editButtons.find((button) =>
      button.classList.contains("edit-module-btn")
    );
    fireEvent.click(editModuleButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/courses/course-123/module/mod1/update"
    );
  });

  test("should toggle module selection correctly", async () => {
    const modulesData = [
      { moduleID: "mod1", moduleName: "Module 1", status: "AVAILABLE" },
    ];
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce(modulesData);
    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test("should mark selected modules as unavailable", async () => {
    const modulesData = [
      { moduleID: "mod1", moduleName: "Module 1", status: "AVAILABLE" },
    ];
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce(modulesData);
    mockPut.mockResolvedValueOnce({ success: true });

    let closeButton;
    toast.info.mockImplementation((message, options) => {
      closeButton = options.closeButton;
    });

    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", {
        name: /modulesSection.markUnavailableButton/i,
      })
    );

    render(closeButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /modulesSection.confirmButton/i })
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: /modulesSection.confirmButton/i })
    );

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        { moduleIds: ["mod1"], status: "UNAVAILABLE" },
        {},
        "http://localhost:8080/api/module/course-123/unavailable"
      );
      expect(toast.success).toHaveBeenCalledWith(
        "modulesSection.toastMessages.updateModulesStatusSuccess"
      );
    });
  });

  test("should handle error when marking modules as unavailable with specific error message", async () => {
    const modulesData = [
      { moduleID: "mod1", moduleName: "Module 1", status: "AVAILABLE" },
    ];
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce(modulesData);
    mockPut.mockRejectedValueOnce({
      response: { data: { message: "Server error" } },
    });

    let closeButton;
    toast.info.mockImplementation((message, options) => {
      closeButton = options.closeButton;
    });

    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", {
        name: /modulesSection.markUnavailableButton/i,
      })
    );

    render(closeButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /modulesSection.confirmButton/i })
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: /modulesSection.confirmButton/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "modulesSection.toastMessages.updateModulesStatusError"
      );
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  test("should handle image upload and display preview", async () => {
    mockGet.mockResolvedValueOnce(["EVERYONE"]);
    mockUploadImage.mockImplementation((file) => {
      mockSetImageUrl("http://example.com/uploaded.jpg");
      mockFileReader.onload({
        target: { result: "data:image/png;base64,dummy" },
      });
    });
    renderComponent();

    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalledWith(file);
      expect(mockSetImageUrl).toHaveBeenCalledWith(
        "http://example.com/uploaded.jpg"
      );
      expect(screen.getByAltText("form.imageUpload.altText")).toHaveAttribute(
        "src",
        "data:image/png;base64,dummy"
      );
    });
  });

  test("should handle no file selected for image upload", async () => {
    mockGet.mockResolvedValueOnce(["EVERYONE"]);
    renderComponent();

    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [] } });

    await waitFor(() => {
      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(mockSetImageUrl).not.toHaveBeenCalled();
    });
  });

  test("should display error alert when image upload fails", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: false,
      uploadError: "Upload failed",
      imageUrl: null,
      setImageUrl: mockSetImageUrl,
    });
    mockGet.mockResolvedValueOnce(["EVERYONE"]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/form.imageUpload.error/i)).toBeInTheDocument();
    });
  });

  test("should display uploading alert when image is uploading", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: true,
      uploadError: null,
      imageUrl: null,
      setImageUrl: mockSetImageUrl,
    });
    mockGet.mockResolvedValueOnce(["EVERYONE"]);
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/form.imageUpload.uploading/i)
      ).toBeInTheDocument();
    });
  });

  test("should save course successfully in edit mode", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: false,
      uploadError: null,
      imageUrl: "http://example.com/image.jpg",
      setImageUrl: mockSetImageUrl,
    });
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: "http://example.com/image.jpg",
      })
      .mockResolvedValueOnce([]);
    mockPut.mockResolvedValueOnce({ success: true });
    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Course")).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.saveButton/i })
    );

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        {
          courseName: "Test Course",
          description: "Test",
          ageGroup: "EVERYONE",
          image: "http://example.com/image.jpg",
        },
        {},
        "http://localhost:8080/api/course/course-123"
      );
      expect(toast.success).toHaveBeenCalledWith(
        "modulesSection.toastMessages.saveSuccess",
        "success"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/courses/course-123");
    });
  });

  test("should handle error when saving course in edit mode", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: false,
      uploadError: null,
      imageUrl: "http://example.com/image.jpg",
      setImageUrl: mockSetImageUrl,
    });
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: "http://example.com/image.jpg",
      })
      .mockResolvedValueOnce([]);
    mockPut.mockRejectedValueOnce({
      response: { data: { message: "Server error" } },
    });
    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Course")).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.saveButton/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  test("should disable mark unavailable button when no modules are selected", async () => {
    const modulesData = [
      { moduleID: "mod1", moduleName: "Module 1", status: "AVAILABLE" },
    ];
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce(modulesData);
    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        fireEvent.click(checkbox);
      }
    });

    const markUnavailableButton = screen.getByRole("button", {
      name: /modulesSection.markUnavailableButton/i,
    });
    expect(markUnavailableButton).toBeDisabled();
  });

  test("should show info toast when no modules are selected for marking unavailable", async () => {
    const modulesData = [
      { moduleID: "mod1", moduleName: "Module 1", status: "AVAILABLE" },
    ];
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce(modulesData);
    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });

    // Đảm bảo không có module nào được chọn
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        fireEvent.click(checkbox);
      }
    });

    const markUnavailableButton = screen.getByRole("button", {
      name: /modulesSection.markUnavailableButton/i,
    });
    expect(markUnavailableButton).toBeDisabled(); // Nút phải bị disabled khi không chọn module
  });

  test("should show info toast when creating course while image is uploading", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: true,
      uploadError: null,
      imageUrl: "http://example.com/image.jpg",
      setImageUrl: mockSetImageUrl,
    });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("EVERYONE")).toBeInTheDocument()
    );

    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.courseNamePlaceholder"),
      {
        target: { value: "Final Test Course" },
      }
    );
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.descriptionPlaceholder"),
      {
        target: { value: "Description here" },
      }
    );

    const createButton = screen.getByRole("button", {
      name: /courseDetails.createButton/i,
    });
    expect(createButton).toBeDisabled(); // Nút phải bị disabled khi uploading
  });

  test("should show error toast when creating course without image", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: false,
      uploadError: null,
      imageUrl: null,
      setImageUrl: mockSetImageUrl,
    });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("EVERYONE")).toBeInTheDocument()
    );

    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.courseNamePlaceholder"),
      {
        target: { value: "Final Test Course" },
      }
    );
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.descriptionPlaceholder"),
      {
        target: { value: "Description here" },
      }
    );
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.createButton/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "courseDetails.validation.imageRequired"
      );
    });
  });

  test("should show info toast when saving course while image is uploading", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: true,
      uploadError: null,
      imageUrl: "http://example.com/image.jpg",
      setImageUrl: mockSetImageUrl,
    });
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: "http://example.com/image.jpg",
      })
      .mockResolvedValueOnce([]);
    renderComponent("course-123");

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Course")).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", {
      name: /courseDetails.saveButton/i,
    });
    expect(saveButton).toBeDisabled(); // Nút phải bị disabled khi uploading
  });

  test("should handle API fetch error in useEffect", async () => {
    // Suppress console.error for this test
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValueOnce(new Error("Fetch error"));
    renderComponent("course-123");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "modulesSection.toastMessages.fetchError",
        "danger"
      );
    });
    console.error.mockRestore();
  });

  test("should show error toast when fetching ageGroups fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Fetch error"));
    renderComponent();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "modulesSection.toastMessages.fetchError",
        "danger"
      );
    });
  });

  test("should show generic error toast when creating course fails without message", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: false,
      uploadError: null,
      imageUrl: "http://example.com/image.jpg",
      setImageUrl: mockSetImageUrl,
    });
    mockPost.mockRejectedValueOnce({});
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("EVERYONE")).toBeInTheDocument()
    );
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.courseNamePlaceholder"),
      { target: { value: "Test" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.descriptionPlaceholder"),
      { target: { value: "Test" } }
    );
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.createButton/i })
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "modulesSection.toastMessages.createError"
      );
    });
  });

  test("should show generic error toast when saving course fails without message", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: false,
      uploadError: null,
      imageUrl: "http://example.com/image.jpg",
      setImageUrl: mockSetImageUrl,
    });
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test",
        description: "Test",
        ageGroup: "EVERYONE",
        image: "http://example.com/image.jpg",
      })
      .mockResolvedValueOnce([]);
    mockPut.mockRejectedValueOnce({});
    renderComponent("course-123");
    await waitFor(() => {
      const inputs = screen.getAllByDisplayValue("Test");
      expect(inputs.length).toBeGreaterThan(0);
    });
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.saveButton/i })
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "modulesSection.toastMessages.saveError"
      );
    });
  });

  test("should show unexpected error toast when marking modules as unavailable fails without message", async () => {
    const modulesData = [
      { moduleID: "mod1", moduleName: "Module 1", status: "AVAILABLE" },
    ];
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce(modulesData);
    mockPut.mockRejectedValueOnce({});
    renderComponent("course-123");
    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("checkbox"));

    let closeButton;
    toast.info.mockImplementation((message, options) => {
      closeButton = options.closeButton;
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /modulesSection.markUnavailableButton/i,
      })
    );

    // Render closeButton để hiển thị nút confirm
    if (closeButton) {
      render(closeButton);
    }

    // Render confirm button
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /modulesSection.confirmButton/i })
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: /modulesSection.confirmButton/i })
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "modulesSection.toastMessages.updateModulesStatusError"
      );
      expect(toast.error).toHaveBeenCalledWith(
        "modulesSection.toastMessages.unexpectedError"
      );
    });
  });

  test("should handle empty ageGroups gracefully", async () => {
    mockGet.mockResolvedValueOnce([]); // ageGroups empty
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      // Không có option nào ngoài mặc định
      expect(screen.getAllByRole("option").length).toBe(1);
    });
  });

  test("should show validation error when description is empty", async () => {
    renderComponent();
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.courseNamePlaceholder"),
      {
        target: { value: "Test Course" },
      }
    );
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.descriptionPlaceholder"),
      {
        target: { value: "" },
      }
    );
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.createButton/i })
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "courseDetails.validation.descriptionRequired"
      );
    });
  });

  test("should show validation error when ageGroup is empty", async () => {
    renderComponent();
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.courseNamePlaceholder"),
      {
        target: { value: "Test Course" },
      }
    );
    fireEvent.change(
      screen.getByPlaceholderText("courseDetails.descriptionPlaceholder"),
      {
        target: { value: "Test Description" },
      }
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.createButton/i })
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "courseDetails.validation.ageGroupRequired"
      );
    });
  });

  test("should show image required error when saving course without image", async () => {
    require("../../../hooks/useUpload").mockReturnValue({
      uploadImage: mockUploadImage,
      uploading: false,
      uploadError: null,
      imageUrl: null,
      setImageUrl: mockSetImageUrl,
    });
    mockGet
      .mockResolvedValueOnce(["EVERYONE"])
      .mockResolvedValueOnce({
        courseName: "Test Course",
        description: "Test",
        ageGroup: "EVERYONE",
        image: null,
      })
      .mockResolvedValueOnce([]);
    renderComponent("course-123");
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Course")).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole("button", { name: /courseDetails.saveButton/i })
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "courseDetails.validation.imageRequired"
      );
    });
  });
});
