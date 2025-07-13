import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import useFetch from './useFetch';

const useUpload = () => {
    const [imageUrl, setImageUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const { post: postFile, loading: fetchLoading, error: fetchError } = useFetch();

    // Hàm tải ảnh lên server
    const uploadImage = useCallback(async (file) => {
        if (!file) {
            setUploadError("No file selected.");
            toast.error("Vui lòng chọn một tệp ảnh.");
            return null;
        }

        // Kiểm tra kích thước file
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setUploadError("Image size exceeds 5MB limit.");
            toast.error("Kích thước ảnh không được vượt quá 5MB!");
            return null;
        }

        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append("file", file); // "file" phải khớp với @RequestParam("file") bên Spring Boot

        try {
            const response = await postFile(
                formData, {}, "http://localhost:8080/api/image/upload"
            );
            
            setImageUrl(response); // response trực tiếp là URL của ảnh
            toast.success("Tải ảnh lên thành công!");
            return response; // Trả về URL của ảnh
        } catch (error) {
            console.error("Error uploading image:", error);
            setUploadError(error.response?.data?.message || "Lỗi khi tải ảnh lên.");
            toast.error(error.response?.data?.message || "Lỗi khi tải ảnh lên!");
            return null;
        } finally {
            setUploading(false);
        }
    }, [postFile]);

    return { imageUrl, uploading, uploadError, uploadImage, setImageUrl };
};

export default useUpload;