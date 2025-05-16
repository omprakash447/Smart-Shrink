import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiImage, FiLoader, FiUploadCloud } from "react-icons/fi";

export const Uploder = () => {
    const [upload, setUpload] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [imagefetch, setImagefetch] = useState<any[]>([]); // Adjust type based on actual data structure
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({
        text: "",
        type: null,
    });
    const [showModal, setShowModal] = useState(false); // State for modal visibility

    // Function to format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} bytes`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(2)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(2)} MB`;
    };

    // Fetch images
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch("http://localhost:4000/images-compress");
                const data = await response.json();
                console.log(data);
                setImagefetch(data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchImages();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!upload) {
            setMessage({ text: "Please select an image to upload.", type: "error" });
            return;
        }

        const fileData = new FormData();
        fileData.append("file", upload);

        try {
            setLoading(true);
            setMessage({ text: "", type: null });
            const res = await axios.post("http://localhost:4000/uploader", fileData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                },
                timeout: 10000,
            });
            setMessage({ text: "Image uploaded successfully!", type: "success" });
            console.log("Response:", res.data);
            setUpload(null);
            setProgress(0);
            // Refresh image list after upload
            const response = await fetch("http://localhost:4000/images-compress");
            const data = await response.json();
            setImagefetch(data);
        } catch (err: any) {
            const errorMessage =
                err.code === "ECONNABORTED" ? "Request timed out. Please try again." : err.message;
            setMessage({ text: `Upload failed: ${errorMessage}`, type: "error" });
            console.error("Upload error:", err);
        } finally {
            setLoading(false);
            console.log("Upload complete, loading set to false");
        }
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5 pt-5 position-relative"
            style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)" }}
        >
            {/* Floating Gallery Button */}
            <button
                className="btn position-fixed bottom-0 end-0 m-4 p-3 rounded-circle shadow"
                style={{
                    background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
                    color: "white",
                    zIndex: 1000,
                }}
                onClick={() => setShowModal(true)}
                title="View Compressed Images"
            >
                <FiImage size={24} />
            </button>

            {/* Main Card */}
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 w-100" style={{ maxWidth: "500px" }}>
                {/* Header */}
                <div className="text-center mb-4 mb-md-5">
                    <h1 className="h3 fw-bold text-dark mb-2">Upload Your Image</h1>
                    <p className="text-muted small">Drag and drop or browse to optimize</p>
                </div>

                {/* Message Feedback */}
                {message.text && (
                    <div
                        className={`d-flex align-items-center gap-2 p-3 mb-4 rounded-3 small ${message.type === "success" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                            }`}
                    >
                        {message.type === "success" ? <FiCheckCircle className="fs-5" /> : <FiAlertCircle className="fs-5" />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpload}>
                    {/* File Input */}
                    <div className="mb-4 mb-md-5">
                        <label
                            className="d-flex flex-column align-items-center justify-content-center mx-auto border-2 border-dashed rounded-circle cursor-pointer"
                            style={{
                                width: "120px",
                                height: "120px",
                                background: upload
                                    ? "linear-gradient(135deg, #ffb1b1 0%, #d8b4fe 100%)"
                                    : "linear-gradient(135deg, #fce7e7 0%, #ede9fe 100%)",
                                borderColor: upload ? "#f472b6" : "#d1d5db",
                                transition: "all 0.3s ease",
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) {
                                    setUpload(e.dataTransfer.files[0]);
                                    setMessage({ text: "", type: null });
                                }
                            }}
                            onMouseEnter={(e) => {
                                if (!upload) {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #ffb1b1 0%, #d8b4fe 100%)";
                                    e.currentTarget.style.borderColor = "#f472b6";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!upload) {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #fce7e7 0%, #ede9fe 100%)";
                                    e.currentTarget.style.borderColor = "#d1d5db";
                                }
                            }}
                        >
                            <FiUploadCloud className="text-secondary" style={{ fontSize: "2rem" }} />
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                className="d-none"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setUpload(e.target.files[0]);
                                        setMessage({ text: "", type: null });
                                    }
                                }}
                            />
                        </label>
                        <div className="text-center mt-3">
                            <span className="d-block text-dark small fw-medium">
                                {upload ? `${upload.name} (${formatFileSize(upload.size)})` : "Drop your image here or click to browse"}
                            </span>
                            <span className="d-block text-muted" style={{ fontSize: "0.75rem" }}>
                                Supports PNG, JPG, JPEG (Max 10MB)
                            </span>
                        </div>
                        {upload && (
                            <div className="mt-3 d-flex justify-content-center">
                                <img
                                    src={URL.createObjectURL(upload)}
                                    alt="Preview"
                                    className="rounded shadow-sm"
                                    style={{ maxWidth: "100%", height: "80px", objectFit: "contain" }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {loading && (
                        <div className="progress mb-4" style={{ height: "6px" }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                    width: `${progress}%`,
                                    background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
                                    transition: "width 0.3s ease",
                                }}
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            ></div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        type="submit"
                        className="btn w-100 text-white py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                        style={{
                            background: loading
                                ? "#d1d5db"
                                : "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
                            border: "none",
                            borderRadius: "0.75rem",
                            transition: "background 0.3s ease",
                        }}
                        disabled={loading}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)";
                            }
                        }}
                        onFocus={(e) => e.currentTarget.blur()}
                    >
                        {loading ? (
                            <>
                                <FiLoader className="fs-5 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <FiUploadCloud className="fs-5" />
                                Upload Now
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Bootstrap Modal */}
            <div
                className={`modal fade ${showModal ? "show" : ""}`}
                style={{ display: showModal ? "block" : "none" }}
                tabIndex={-1}
                aria-labelledby="imageGalleryModalLabel"
                aria-hidden={!showModal}
            >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content rounded-4 border-0 shadow-sm">
                        <div className="modal-header border-0">
                            <h5 className="modal-title fw-bold" id="imageGalleryModalLabel">
                                Compressed Images
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {imagefetch.length === 0 ? (
                                <p className="text-muted text-center">No images available.</p>
                            ) : (
                                <div className="row">
                                    {/* {imagefetch.map((image) => (
                                        <div key={image.id} className="col-md-6 mb-4">
                                            <div className="card border-0 shadow-sm h-100">
                                                <img
                                                    src={image.url} // Use Base64 URL directly
                                                    alt={image.filename}
                                                    className="card-img-top rounded-top"
                                                    style={{ height: "150px", objectFit: "cover" }}
                                                />
                                                <div className="card-body">
                                                    <h6 className="card-title text-truncate" title={image.filename}>
                                                        {image.filename}
                                                    </h6>
                                                    <p className="card-text small">
                                                        <strong>Original Size:</strong> {formatFileSize(image.originalSize)} <br />
                                                        <strong>Compressed Size:</strong> {formatFileSize(image.compressedSize)}
                                                    </p>
                                                    <a
                                                        href={image.url}
                                                        download={image.filename}
                                                        className="btn btn-sm text-white"
                                                        style={{
                                                            background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
                                                        }}
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))} */}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Backdrop */}
            {showModal && <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>}
        </div>
    );
}; 