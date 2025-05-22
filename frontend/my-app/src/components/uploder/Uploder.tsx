import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiImage, FiLoader, FiUploadCloud } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../controller/Authcontroller";

interface Image {
  id: number;
  filename: string;
  url: string;
  originalSize: number;
  compressedSize: number;
}

export const Uploder = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [upload, setUpload] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagefetch, setImagefetch] = useState<Image[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({
    text: "",
    type: null,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

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
        const response = await fetch("http://localhost:4000/images-compress", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched images:", data);
        setImagefetch(data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setMessage({ text: `Failed to fetch images: ${err.message}`, type: "error" });
      }
    };
    fetchImages();
  }, []);

  // Download image
  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await fetch(`http://localhost:4000/download/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setMessage({ text: `Downloaded ${filename}`, type: "success" });
    } catch (err: any) {
      console.error("Download error:", err);
      setMessage({ text: `Failed to download ${filename}: ${err.message}`, type: "error" });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!upload) {
      setMessage({ text: "Please select an image to upload.", type: "error" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(upload.type)) {
      setMessage({ text: "Only JPEG and PNG images are allowed.", type: "error" });
      return;
    }
    if (upload.size > 10 * 1024 * 1024) {
      setMessage({ text: "File size exceeds 10MB limit.", type: "error" });
      return;
    }

    console.log("Uploading file:", upload.name, upload.size, upload.type);

    const fileData = new FormData();
    fileData.append("file", upload);

    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      setMessage({ text: "", type: null });
      const res = await axios.post("http://localhost:4000/uploader", fileData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
        timeout: 60000,
      });
      setMessage({ text: "Image uploaded successfully!", type: "success" });
      console.log("Upload response:", res.data);
      setUpload(null);
      setProgress(0);

      const response = await fetch("http://localhost:4000/images-compress", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch images: HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log("Refreshed images:", data);
      setImagefetch(data);
    } catch (err: any) {
      console.error("Upload error:", err.response?.data || err.message);
      const errorMessage =
        err.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : err.response?.data?.error || `Upload failed: ${err.message}`;
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
      console.log("Upload complete, loading set to false");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5 pt-5 position-relative bg-dark">
      <button
        className="btn btn-dark position-fixed bottom-0 end-0 m-4 p-3 rounded-circle shadow-lg"
        onClick={() => setShowModal(true)}
        title="View Compressed Images"
      >
        <FiImage size={24} className="text-light" />
      </button>

      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 w-100 fade show" style={{ maxWidth: "500px", backgroundColor: "#222222" }}>
        <div className="text-center mb-4 mb-md-5">
          <h1 className="h3 fw-bold text-light mb-2" style={{ fontSize: "1.75rem" }}>
            Upload Your Image
          </h1>
          <p className="small text-white" style={{ fontSize: "0.9rem" }}>
            Drag and drop or browse to optimize
          </p>
        </div>

        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-dark" : "alert-danger"} d-flex align-items-center gap-2 p-3 mb-4 rounded-3 small fade show`}>
            {message.type === "success" ? <FiCheckCircle className="fs-5" /> : <FiAlertCircle className="fs-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="mb-4 mb-md-5">
            <label
              className="d-flex flex-column align-items-center justify-content-center mx-auto border-2 border-dashed rounded-circle bg-secondary cursor-pointer"
              style={{ width: "120px", height: "120px", borderColor: upload ? "#b3b3b3" : "#666666" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  const file = e.dataTransfer.files[0];
                  console.log("Dropped file:", file.name, file.size, file.type);
                  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
                  if (!allowedTypes.includes(file.type)) {
                    setMessage({ text: "Only JPEG and PNG images are allowed.", type: "error" });
                    return;
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    setMessage({ text: "File size exceeds 10MB limit.", type: "error" });
                    return;
                  }
                  setUpload(file);
                  setMessage({ text: "", type: null });
                }
              }}
            >
              <FiUploadCloud className="fs-2 text-light" />
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="d-none"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0];
                    console.log("Selected file:", file.name, file.size, file.type);
                    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
                    if (!allowedTypes.includes(file.type)) {
                      setMessage({ text: "Only JPEG and PNG images are allowed.", type: "error" });
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      setMessage({ text: "File size exceeds 10MB limit.", type: "error" });
                      return;
                    }
                    setUpload(file);
                    setMessage({ text: "", type: null });
                  }
                }}
              />
            </label>
            <div className="text-center mt-3">
              <span className="d-block small fw-medium text-light" style={{ fontSize: "0.95rem" }}>
                {upload ? `${upload.name} (${formatFileSize(upload.size)})` : "Drop your image here or click to browse"}
              </span>
              <span className="d-block small text-muted" style={{ fontSize: "0.75rem" }}>
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

          {loading && (
            <div className="progress mb-4" style={{ height: "6px", backgroundColor: "#333333" }}>
              <div
                className="progress-bar bg-secondary"
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-dark w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className="fs-5 animate-spin text-light" />
                Uploading...
              </>
            ) : (
              <>
                <FiUploadCloud className="fs-5 text-light" />
                Upload Now
              </>
            )}
          </button>
        </form>
      </div>

      <div className={`modal fade ${showModal ? "show" : ""}`} style={{ display: showModal ? "block" : "none" }} tabIndex={-1} aria-labelledby="imageGalleryModalLabel" aria-hidden={!showModal}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content rounded-4 border-0 shadow-lg" style={{ backgroundColor: "#222222" }}>
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold text-light" id="imageGalleryModalLabel" style={{ fontSize: "1.5rem" }}>
                Compressed Images
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {imagefetch.length === 0 ? (
                <p className="text-center text-muted" style={{ fontSize: "1rem" }}>
                  No images available.
                </p>
              ) : (
                <div className="row">
                  {imagefetch.map((image) => (
                    <div key={image.id} className="col-md-6 mb-4">
                      <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: "#2a2a2a" }}>
                        <img
                          src={image.url}
                          alt={image.filename}
                          className="card-img-top rounded-top"
                          style={{ height: "150px", objectFit: "cover" }}
                        />
                        <div className="card-body">
                          <h6 className="card-title text-truncate text-light" title={image.filename} style={{ fontSize: "1rem" }}>
                            {image.filename}
                          </h6>
                          <p className="card-text small" style={{ fontSize: "0.85rem" }}>
                            <strong style={{ color: "whitesmoke" }}>Original Size:</strong>{" "}
                            <span style={{ color: "red" }}>{formatFileSize(image.originalSize)}</span>
                            <br />
                            <strong style={{ color: "whitesmoke" }}>Compressed Size:</strong>{" "}
                            <span style={{ color: "green" }}>{formatFileSize(image.compressedSize)}</span>
                          </p>

                          <button
                            className="btn btn-dark btn-sm text-light"
                            onClick={() => handleDownload(image.id, image.filename)}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-dark btn-sm text-light"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>}

      {/* Inline CSS for placeholder and hover effects */}
      <style>{`
        .form-control::placeholder {
          color: #999999 !important;
          opacity: 1 !important;
        }
        .form-control::-webkit-input-placeholder {
          color: #999999 !important;
          opacity: 1 !important;
        }
        .form-control::-moz-placeholder {
          color: #999999 !important;
          opacity: 1 !important;
        }
        .form-control:-ms-input-placeholder {
          color: #999999 !important;
          opacity: 1 !important;
        }
        .btn-dark:hover {
          background-color: #4d4d4d !important;
          transform: scale(1.05);
        }
        .card:hover {
          transform: scale(1.02);
        }
        .cursor-pointer:hover {
          background-color: #4d4d4d !important;
          border-color: #cccccc !important;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};