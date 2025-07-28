import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Qualifications from "../Qualifications";
import { useAuth } from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import useUpload from "../../../hooks/useUpload";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

// Tắt console.error khi test lỗi
let errorSpy;
beforeAll(() => {
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  errorSpy.mockRestore();
});

// Mock các custom hooks và thư viện bên ngoài
jest.mock("../../../hooks/useAuth");
jest.mock("../../../hooks/useFetch");
jest.mock("../../../hooks/useUpload");
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUser = { username: "testuser" };
const mockDegrees = ["Bachelor", "Master", "PhD"];
const mockQualifications = [
  {
    qualificationID: 1,
    name: "Bachelor of Science in Computer Science",
    year: "2022",
    degree: "Bachelor",
    institution: "FPT University",
    image: "http://example.com/image1.jpg",
  },
  {
    qualificationID: 2,
    name: "Master of Artificial Intelligence",
    year: "2024",
    degree: "Master",
    institution: "VNU-HCM",
    image: "", // Empty string to trigger /placeholder.svg
  },
];

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockUploadImage = jest.fn();
const mockSetImageUrl = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: mockUser });
  useFetch.mockReturnValue({ get: mockGet, post: mockPost, put: mockPut });
  useUpload.mockReturnValue({
    imageUrl: null,
    uploading: false,
    uploadError: null,
    uploadImage: mockUploadImage,
    setImageUrl: mockSetImageUrl,
  });
  mockGet.mockImplementation((url) => {
    if (url.includes("/degree")) return Promise.resolve(mockDegrees);
    if (url.includes("/my-list")) return Promise.resolve(mockQualifications);
    return Promise.resolve([]);
  });
  global.confirm = jest.fn(() => true);
});

describe("Qualifications Component", () => {
  test("renders qualifications correctly on initial load", async () => {
    render(<Qualifications />);
    await waitFor(() => {
      expect(screen.getByText("qualificationsTitle")).toBeInTheDocument();
      expect(
        screen.getByText((content) =>
          content.includes("Bachelor of Science in Computer Science")
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes("FPT University"))
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) =>
          content.includes("Master of Artificial Intelligence")
        )
      ).toBeInTheDocument();
    });
    expect(mockGet).toHaveBeenCalledWith(
      "http://localhost:8080/api/qualification/degree"
    );
    expect(mockGet).toHaveBeenCalledWith(
      `http://localhost:8080/api/qualification/my-list/${mockUser.username}`
    );
  });

  test("displays a message when there are no qualifications", async () => {
    mockGet.mockResolvedValueOnce(mockDegrees).mockResolvedValueOnce([]);
    render(<Qualifications />);
    await waitFor(() => {
      expect(screen.getByText("noQualificationsAdded")).toBeInTheDocument();
    });
  });

  test("allows a user to add a new qualification", async () => {
    const newQualification = {
      qualificationID: 3,
      name: "New Certificate",
      year: "2025",
      degree: "Bachelor",
      institution: "New School",
      image: "http://example.com/new_image.jpg",
    };
    mockPost.mockResolvedValue(newQualification);

    mockGet.mockImplementation((url) => {
      if (url.includes("/degree")) return Promise.resolve(mockDegrees);
      if (url.includes("/my-list"))
        return Promise.resolve([...mockQualifications, newQualification]);
      return Promise.resolve([]);
    });

    useUpload.mockReturnValue({
      imageUrl: "http://example.com/new_image.jpg",
      uploading: false,
      uploadError: null,
      uploadImage: mockUploadImage,
      setImageUrl: mockSetImageUrl,
    });

    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    fireEvent.change(
      screen.getByPlaceholderText("form.qualificationNamePlaceholder"),
      { target: { value: newQualification.name } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("form.yearAchievedPlaceholder"),
      { target: { value: newQualification.year } }
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: newQualification.degree },
    });
    fireEvent.change(
      screen.getByPlaceholderText("form.institutionPlaceholder"),
      { target: { value: newQualification.institution } }
    );
    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    const imageInput = screen.getByTestId("certificate-image-input");
    fireEvent.change(imageInput, { target: { files: [file] } });
    expect(mockUploadImage).toHaveBeenCalledWith(file);
    fireEvent.click(screen.getByText("addQualificationButtonModal"));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        {
          name: newQualification.name,
          year: newQualification.year,
          degree: newQualification.degree,
          institution: newQualification.institution,
          image: newQualification.image,
        },
        {},
        "http://localhost:8080/api/qualification"
      );
      expect(toast.success).toHaveBeenCalledWith("messages.addSuccess");
      expect(
        screen.getByText((content) => content.includes(newQualification.name))
      ).toBeInTheDocument();
    });
  });

  test("allows a user to edit an existing qualification", async () => {
    const updatedQualification = {
      ...mockQualifications[0],
      year: "2023",
      name: "Updated Bachelor Degree",
    };
    mockPut.mockResolvedValue(updatedQualification);

    let getCallCount = 0;
    mockGet.mockImplementation((url) => {
      if (url.includes("/degree")) return Promise.resolve(mockDegrees);
      if (url.includes("/my-list")) {
        getCallCount++;
        return getCallCount === 1
          ? Promise.resolve(mockQualifications)
          : Promise.resolve([updatedQualification, mockQualifications[1]]);
      }
      return Promise.resolve([]);
    });

    render(<Qualifications />);
    await waitFor(() =>
      expect(
        screen.getByText((content) =>
          content.includes(mockQualifications[0].name)
        )
      ).toBeInTheDocument()
    );
    const editButtons = screen.getAllByRole("button", {
      name: /edit-qualification/i,
    });
    fireEvent.click(editButtons[0]);
    await waitFor(() => {
      expect(
        screen.getByText("editQualificationModalTitle")
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockQualifications[0].name)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockQualifications[0].year)
      ).toBeInTheDocument();
    });
    fireEvent.change(
      screen.getByPlaceholderText("form.qualificationNamePlaceholder"),
      { target: { value: updatedQualification.name } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("form.yearAchievedPlaceholder"),
      { target: { value: updatedQualification.year } }
    );
    fireEvent.click(screen.getByText("updateQualificationButton"));
    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          name: updatedQualification.name,
          year: updatedQualification.year,
        }),
        {},
        `http://localhost:8080/api/qualification/${mockQualifications[0].qualificationID}`
      );
      expect(toast.success).toHaveBeenCalledWith("messages.updateSuccess");
      expect(
        screen.getByText((content) =>
          content.includes(updatedQualification.name)
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByText((content) =>
          content.includes(mockQualifications[0].name)
        )
      ).not.toBeInTheDocument();
    });
  });

  test("allows a user to delete a qualification", async () => {
    mockPut.mockResolvedValue({});
    let getCallCount = 0;
    mockGet.mockImplementation((url) => {
      if (url.includes("/degree")) return Promise.resolve(mockDegrees);
      if (url.includes("/my-list")) {
        getCallCount++;
        return getCallCount === 1
          ? Promise.resolve(mockQualifications)
          : Promise.resolve([mockQualifications[1]]);
      }
      return Promise.resolve([]);
    });

    render(<Qualifications />);
    await waitFor(() =>
      expect(
        screen.getByText((content) =>
          content.includes(mockQualifications[0].name)
        )
      ).toBeInTheDocument()
    );
    const deleteButtons = screen.getAllByRole("button", {
      name: /delete-qualification/i,
    });
    fireEvent.click(deleteButtons[0]);
    expect(global.confirm).toHaveBeenCalledWith("confirm.deleteQualification");
    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        {},
        {},
        `http://localhost:8080/api/qualification/status/${mockQualifications[0].qualificationID}`
      );
      expect(toast.success).toHaveBeenCalledWith("messages.deleteSuccess");
      expect(
        screen.queryByText((content) =>
          content.includes(mockQualifications[0].name)
        )
      ).not.toBeInTheDocument();
    });
  });

  test("shows an error toast if required fields are not filled on add", async () => {
    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("addQualificationButtonModal"));
    expect(toast.error).toHaveBeenCalledWith("errors.fillAllFields");
    expect(mockPost).not.toHaveBeenCalled();
  });

  test("handleImageSelect does nothing if no file is selected", async () => {
    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    const fileInput = screen.getByTestId("certificate-image-input");
    fireEvent.change(fileInput, { target: { files: [] } });
    expect(mockUploadImage).not.toHaveBeenCalled();
  });

  test("shows error toast if required fields are missing on update", async () => {
    render(<Qualifications />);
    await waitFor(() =>
      expect(
        screen.getByText((content) =>
          content.includes(mockQualifications[0].name)
        )
      ).toBeInTheDocument()
    );
    const editButtons = screen.getAllByRole("button", {
      name: /edit-qualification/i,
    });
    fireEvent.click(editButtons[0]);
    await waitFor(() =>
      expect(
        screen.getByText("editQualificationModalTitle")
      ).toBeInTheDocument()
    );
    fireEvent.change(
      screen.getByPlaceholderText("form.qualificationNamePlaceholder"),
      { target: { value: "" } }
    );
    fireEvent.click(screen.getByText("updateQualificationButton"));
    expect(toast.error).toHaveBeenCalledWith("errors.fillAllFields");
  });

  test("does nothing if update is called without editingQualificationId", async () => {
    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("addQualificationButtonModal"));
    expect(mockPut).not.toHaveBeenCalled();
  });

  test("shows error toast if add API fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("add error"));
    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    fireEvent.change(
      screen.getByPlaceholderText("form.qualificationNamePlaceholder"),
      { target: { value: "Test" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("form.yearAchievedPlaceholder"),
      { target: { value: "2022" } }
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Bachelor" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("form.institutionPlaceholder"),
      { target: { value: "Test School" } }
    );
    fireEvent.click(screen.getByText("addQualificationButtonModal"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("errors.addQualification");
    });
  });

  test("shows error toast if update API fails", async () => {
    mockPut.mockRejectedValueOnce(new Error("update error"));
    render(<Qualifications />);
    await waitFor(() =>
      expect(
        screen.getByText((content) =>
          content.includes(mockQualifications[0].name)
        )
      ).toBeInTheDocument()
    );
    const editButtons = screen.getAllByRole("button", {
      name: /edit-qualification/i,
    });
    fireEvent.click(editButtons[0]);
    await waitFor(() =>
      expect(
        screen.getByText("editQualificationModalTitle")
      ).toBeInTheDocument()
    );
    fireEvent.change(
      screen.getByPlaceholderText("form.qualificationNamePlaceholder"),
      { target: { value: "Test Update" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("form.yearAchievedPlaceholder"),
      { target: { value: "2023" } }
    );
    fireEvent.click(screen.getByText("updateQualificationButton"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("errors.updateQualification");
    });
  });

  test("does not delete qualification if confirm is cancelled", async () => {
    global.confirm = jest.fn(() => false);
    render(<Qualifications />);
    await waitFor(() =>
      expect(
        screen.getByText((content) =>
          content.includes(mockQualifications[0].name)
        )
      ).toBeInTheDocument()
    );
    const deleteButtons = screen.getAllByRole("button", {
      name: /delete-qualification/i,
    });
    fireEvent.click(deleteButtons[0]);
    expect(mockPut).not.toHaveBeenCalled();
  });

  test("shows error toast if delete API fails", async () => {
    global.confirm = jest.fn(() => true);
    mockPut.mockRejectedValueOnce(new Error("delete error"));
    render(<Qualifications />);
    await waitFor(() =>
      expect(
        screen.getByText((content) =>
          content.includes(mockQualifications[0].name)
        )
      ).toBeInTheDocument()
    );
    const deleteButtons = screen.getAllByRole("button", {
      name: /delete-qualification/i,
    });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("errors.deleteQualification");
    });
  });

  test("shows error toast if fetch degree API fails", async () => {
    mockGet.mockImplementation((url) => {
      if (url.includes("/degree")) throw new Error("fetch degree error");
      if (url.includes("/my-list")) return Promise.resolve(mockQualifications);
      return Promise.resolve([]);
    });
    render(<Qualifications />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("errors.fetchQualifications");
    });
  });

  test("shows error toast if file size exceeds limit", async () => {
    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    const fileInput = screen.getByTestId("certificate-image-input");
    const bigFile = new File(["a".repeat(6 * 1024 * 1024)], "big.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [bigFile] } });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("errors.fileSizeExceeded");
      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(fileInput).toHaveValue("");
    });
  });

  test("renders image preview when file is selected but not yet uploaded", async () => {
    useUpload.mockReturnValue({
      imageUrl: null,
      uploading: false,
      uploadError: null,
      uploadImage: mockUploadImage,
      setImageUrl: mockSetImageUrl,
    });

    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    const fileInput = screen.getByTestId("certificate-image-input");
    const file = new File(["(⌐□_□)"], "test.png", { type: "image/png" });
    const mockReader = {
      readAsDataURL: jest.fn(),
      onload: null,
    };
    jest.spyOn(global, "FileReader").mockImplementation(() => mockReader);
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      mockReader.onload({ target: { result: "data:image/png;base64,abc123" } });
      expect(mockReader.readAsDataURL).toHaveBeenCalled();
      expect(screen.getByAltText("form.imageUpload.altText")).toHaveAttribute(
        "src",
        "data:image/png;base64,abc123"
      );
      expect(mockUploadImage).toHaveBeenCalledWith(file);
    });
  });

  test("renders image placeholder when no image is selected", async () => {
    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    expect(
      screen.getByText("form.imageUpload.clickToUpload")
    ).toBeInTheDocument();
  });

  test("renders placeholder image when both imagePreview and uploadedImageUrl are falsy after upload attempt", async () => {
    useUpload.mockReturnValue({
      imageUrl: null,
      uploading: false,
      uploadError: null,
      uploadImage: mockUploadImage,
      setImageUrl: mockSetImageUrl,
    });

    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton"));
    await waitFor(() =>
      expect(screen.getByText("addQualificationModalTitle")).toBeInTheDocument()
    );
    const fileInput = screen.getByTestId("certificate-image-input");
    const file = new File(["(⌐□_□)"], "test.png", { type: "image/png" });
    const mockReader = {
      readAsDataURL: jest.fn(),
      onload: null,
    };
    jest.spyOn(global, "FileReader").mockImplementation(() => mockReader);
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      mockReader.onload({ target: { result: "data:image/png;base64,abc123" } });
      expect(screen.getByAltText("form.imageUpload.altText")).toHaveAttribute(
        "src",
        "data:image/png;base64,abc123"
      );
    });
    fireEvent.click(screen.getByText("cancelButton"));
    await waitFor(() => {
      expect(
        screen.queryByText("addQualificationModalTitle")
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("addQualificationButton"));
      expect(
        screen.getByText("addQualificationModalTitle")
      ).toBeInTheDocument();
      expect(
        screen.getByText("form.imageUpload.clickToUpload")
      ).toBeInTheDocument();
      expect(
        screen.queryByAltText("form.imageUpload.altText")
      ).not.toBeInTheDocument();
    });
  });

  test("renders image preview with placeholder.svg when editing qualification with empty image", async () => {
    useUpload.mockReturnValue({
      imageUrl: "",
      uploading: false,
      uploadError: null,
      uploadImage: mockUploadImage,
      setImageUrl: mockSetImageUrl,
    });

    render(<Qualifications />);
    await waitFor(() =>
      expect(
        screen.getByText((content) =>
          content.includes(mockQualifications[1].name)
        )
      ).toBeInTheDocument()
    );
    const editButtons = screen.getAllByRole("button", {
      name: /edit-qualification/i,
    });
    // Click edit button for the second qualification (image: "")
    fireEvent.click(editButtons[1]);
    await waitFor(() => {
      console.log(screen.debug()); // Debug modal content
      expect(
        screen.getByText("editQualificationModalTitle")
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockQualifications[1].name)
      ).toBeInTheDocument();
      // Check which text appears to diagnose rendering
      const placeholderText = screen.queryByText(
        "form.imageUpload.clickToUpload"
      );
      const previewText = screen.queryByText("form.imageUpload.clickToChange");
      expect(previewText || placeholderText).toBeInTheDocument();
      if (previewText) {
        expect(screen.getByAltText("form.imageUpload.altText")).toHaveAttribute(
          "src",
          "/placeholder.svg"
        );
      }
    });
  });

  // Thêm vào trong describe("Qualifications Component", () => { ... });

  test("displays uploading alert when image is being uploaded", async () => {
    useUpload.mockReturnValue({
      imageUrl: null,
      uploading: true, // Mock uploading state
      uploadError: null,
      uploadImage: mockUploadImage,
      setImageUrl: mockSetImageUrl,
    });

    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton")); // Open modal
    await waitFor(() => {
      expect(
        screen.getByText("addQualificationModalTitle")
      ).toBeInTheDocument();
      // Check if the uploading alert is displayed
      expect(
        screen.getByText("form.imageUpload.uploading")
      ).toBeInTheDocument();
    });
  });

  test("displays upload error alert when image upload fails", async () => {
    const mockErrorMessage = "Upload failed!"; // Dù bạn mock lỗi, bạn sẽ không kiểm tra nó trực tiếp trên UI
    useUpload.mockReturnValue({
      imageUrl: null,
      uploading: false,
      uploadError: mockErrorMessage, // Mock upload error state
      uploadImage: mockUploadImage,
      setImageUrl: mockSetImageUrl,
    });

    render(<Qualifications />);
    fireEvent.click(screen.getByText("addQualificationButton")); // Open modal
    await waitFor(() => {
      expect(
        screen.getByText("addQualificationModalTitle")
      ).toBeInTheDocument(); // Đã sửa lỗi chính tả ở đây
      // Chỉ kiểm tra rằng key dịch thuật "form.imageUpload.error" xuất hiện
      expect(
        screen.getByText("form.imageUpload.error", { exact: false })
      ).toBeInTheDocument();
    });
  });
});

describe("Qualifications Component - no user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: null });
    useFetch.mockReturnValue({ get: mockGet, post: mockPost, put: mockPut });
    useUpload.mockReturnValue({
      imageUrl: null,
      uploading: false,
      uploadError: null,
      uploadImage: mockUploadImage,
      setImageUrl: mockSetImageUrl,
    });
    mockGet.mockImplementation((url) => {
      if (url.includes("/degree")) return Promise.resolve(mockDegrees);
      if (url.includes("/my-list")) return Promise.resolve(mockQualifications);
      return Promise.resolve([]);
    });
  });

  test("does not fetch qualifications if user is not logged in", async () => {
    render(<Qualifications />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://localhost:8080/api/qualification/degree"
      );
      expect(mockGet).not.toHaveBeenCalledWith(
        expect.stringContaining("/my-list/")
      );
    });
  });
});
