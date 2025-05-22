import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../controller/Authcontroller";

function PdfUploader() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  interface PdfUploaderFormElements extends HTMLFormControlsCollection {
    pdf: HTMLInputElement;
  }

  interface PdfUploaderForm extends HTMLFormElement {
    elements: PdfUploaderFormElements;
    pdf: HTMLInputElement;
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  async function handleUpload(e: React.FormEvent<PdfUploaderForm>) {
    e.preventDefault();
    setError(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressedUrl(null);

    const file = e.currentTarget.pdf.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    try {
      const res: Response = await fetch("http://localhost:4000/pdf-compress", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Upload failed");

      const blob: Blob = await res.blob();
      setCompressedSize(blob.size);
      const url: string = window.URL.createObjectURL(blob);
      setCompressedUrl(url);
    } catch (err) {
      setError("Failed to compress PDF. Please try again.");
    }
    setLoading(false);
  }

  function handleDownload() {
    if (compressedUrl) {
      const a: HTMLAnchorElement = document.createElement("a");
      a.href = compressedUrl;
      a.download = "compressed.pdf";
      a.click();
    }
  }

  function formatBytes(bytes: any) {
    if (bytes === null) return "-";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark">
      <div className="container-fluid flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="card border-0 shadow-lg rounded-4 w-100 fade show" style={{ maxWidth: "500px", backgroundColor: "#222222" }}>
          <div className="card-body p-4 p-md-5 text-light">
            <p className="text-center mb-4 fs-5 fw-medium">
              Shrink your PDFs with ease and style
            </p>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <input
                  type="file"
                  name="pdf"
                  id="pdf"
                  accept="application/pdf"
                  className="form-control d-none"
                  required
                />
                <label
                  htmlFor="pdf"
                  className="d-flex align-items-center justify-content-center bg-secondary rounded-pill py-3 px-4 border-2 border-dashed border-light-subtle"
                >
                  <svg
                    className="me-2"
                    width="24"
                    height="24"
                    fill="#b3b3b3"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                  </svg>
                  <span className="fw-medium text-light">Upload PDF</span>
                </label>
                <small className="form-text text-muted mt-2 d-block text-center">
                  Supports PDF files up to 50MB
                </small>
              </div>
              <button
                type="submit"
                className="btn btn-dark w-100 fw-bold py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Compressing...
                  </>
                ) : (
                  <>
                    <svg
                      className="me-2"
                      width="20"
                      height="20"
                      fill="#b3b3b3"
                      viewBox="0 0 16 16"
                    >
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                      <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                    </svg>
                    Shrink Now
                  </>
                )}
              </button>
            </form>

            {compressedUrl && !loading && (
              <button
                onClick={handleDownload}
                className="btn btn-dark w-100 fw-bold mt-3 py-2"
              >
                <svg
                  className="me-2"
                  width="20"
                  height="20"
                  fill="#b3b3b3"
                  viewBox="0 0 16 16"
                >
                  <path d="M.5 9.9a.5.5 0 0 0-.5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 0-1 0v2.5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2.5a.5.5 0 0 0-.5-.5z" />
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                </svg>
                Download Compressed PDF
              </button>
            )}

            {error && (
              <div className="alert alert-danger mt-4 fade show" role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}

            {(originalSize !== null || compressedSize !== null) && (
              <div className="mt-4 fade show">
                <div className="card border-0 shadow-sm" style={{ backgroundColor: "#2a2a2a" }}>
                  <div className="card-body p-4 text-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-semibold">Original Size</span>
                      <span className="badge bg-dark text-light fs-6 px-3 py-2">
                        {formatBytes(originalSize)}
                      </span>
                    </div>
                    <div className="progress mb-3" style={{ height: "10px", backgroundColor: "#333333" }}>
                      <div
                        className="progress-bar bg-secondary"
                        role="progressbar"
                        style={{ width: "100%" }}
                        aria-valuenow={100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">Compressed Size</span>
                      <span className="badge bg-dark text-light fs-6 px-3 py-2">
                        {compressedSize !== null ? formatBytes(compressedSize) : "-"}
                      </span>
                    </div>
                    {compressedSize !== null && originalSize !== null && (
                      <div className="progress" style={{ height: "10px", backgroundColor: "#333333" }}>
                        <div
                          className="progress-bar bg-secondary"
                          role="progressbar"
                          style={{
                            width: `${(compressedSize / originalSize) * 100}%`,
                          }}
                          aria-valuenow={(compressedSize / originalSize) * 100}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfUploader;