
import { useState } from "react"

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedText, setParsedText] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  async function uploadPDF(file: File): Promise<{ result?: string; error?: string }> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:4000/pdf-parser", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to parse PDF. Please try again.");
      }

      const data = await response.json();
      return { result: data.result }
    } catch (error: any) {
      console.error("PDF upload error:", error)
      return { error: error.message || "An unexpected error occurred while parsing the PDF." }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file before uploading.")
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size exceeds 10MB. Please upload a smaller PDF.")
      return;
    }

    setLoading(true)
    setError("")
    setParsedText("") // Clear previous results immediately on new upload

    const { result, error: uploadError } = await uploadPDF(file)

    if (uploadError) {
      setError(uploadError)
    } else if (result) {
      // Remove all asterisks from the parsed text
      setParsedText(result.replace(/\*/g, ''))
    } else {
      setError("No content received or unknown error occurred.")
    }

    setLoading(false)
  }

  const parseAndHighlightText = (text: string) => {
    return text.split('\n').map((line, index) => {
      const lowerLine = line.toLowerCase();
      // Highlight specific headings more prominently
      if (lowerLine.includes("interview questions")) {
        return (
          <h4 key={`heading-${index}`} className="fw-bold text-warning mt-4 mb-2 fs-5 animate__animated animate__fadeInDown animate__delay-1s">
            {line.trim()}
          </h4>
        );
      } else if (lowerLine.includes("skills") || lowerLine.includes("extracts")) {
        return (
          <h4 key={`heading-${index}`} className="fw-bold text-info mt-4 mb-2 fs-5 animate__animated animate__fadeInDown animate__delay-1s">
            {line.trim()}
          </h4>
        );
      } else if (lowerLine.includes("summary") || lowerLine.includes("feedback")) {
        return (
          <h4 key={`heading-${index}`} className="fw-bold text-success mt-4 mb-2 fs-5 animate__animated animate__fadeInDown animate__delay-1s">
            {line.trim()}
          </h4>
        );
      } else if (line.trim() === '') {
          return <br key={`break-${index}`} />;
      }
      return <p key={`line-${index}`} className="mb-1 small">{line.trim()}</p>;
    });
  };

  const showTwoColumns = !loading && parsedText; // Condition for showing both columns

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-100 bg-dark" // Added bg-dark class here
      style={{ color: "#e0e0e0" }} // Keep text color for consistency
    >
      <div className="container">
        <h1 className="text-center mb-5 fw-light text-secondary opacity-75">Resume PDF Analyzer</h1>

        {/* Row for content - dynamically adjusts columns based on state */}
        <div className={`row justify-content-center g-4 ${showTwoColumns ? '' : 'flex-grow-1 align-items-center'}`}>

          {/* Left panel - Upload Section */}
          <div className={`${showTwoColumns ? 'col-12 col-md-6 col-lg-5' : 'col-12 col-md-8 col-lg-6'}`}>
            <div
              className="card shadow-lg border border-dark rounded-4"
              style={{
                maxWidth: "500px",
                backgroundColor: "#222222",
                margin: "0 auto"
              }}
            >
              <div className="card-body p-4 p-md-5">
                <h2 className="card-title mb-3 fw-normal text-light fs-4">Upload Your Resume PDF</h2>
                <p className="card-text mb-4 small" style={{color:"#f8d047"}}>
                  Analyze your resume with AI for tailored insights and interview preparation.
                </p>

                {/* Error alert */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center fade show small" role="alert">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                {/* Dropzone */}
                <div
                  className={`border border-dashed rounded-3 p-4 d-flex flex-column align-items-center justify-content-center mb-4 text-center ${file ? 'border-primary bg-dark' : 'border-secondary'}`}
                  style={{
                    height: "160px",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    userSelect: "none",
                    backgroundColor: file ? '#2a2a2a' : '#333333'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#0d6efd';
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = file ? '#0d6efd' : '#6c757d';
                    e.currentTarget.style.backgroundColor = file ? '#2a2a2a' : '#333333';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = file ? '#0d6efd' : '#6c757d';
                    e.currentTarget.style.backgroundColor = file ? '#2a2a2a' : '#333333';

                    if (e.dataTransfer.files?.[0]) {
                      const uploadedFile = e.dataTransfer.files[0];
                      if (uploadedFile.type !== "application/pdf") {
                        setError("Only PDF files are allowed.");
                        setFile(null);
                        return;
                      }
                      if (uploadedFile.size > 10 * 1024 * 1024) {
                        setError("File size exceeds 10MB. Please upload a smaller PDF.");
                        setFile(null);
                        return;
                      }
                      setFile(uploadedFile);
                      setError("");
                    }
                  }}
                  onClick={() => {
                    const input = document.getElementById("pdf-upload");
                    if (input) input.click();
                  }}
                >
                  <i className="bi bi-file-earmark-arrow-up mb-2" style={{ fontSize: "2.5rem", color: "#adb5bd" }}></i>
                  <p className="mb-1 text-light small">
                    {file ? file.name : "Drag your PDF here or click to browse"}
                  </p>
                  <small className="text-muted text-nowrap">Max 10MB (PDF only)</small>

                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="d-none"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const selectedFile = e.target.files[0];
                         if (selectedFile.type !== "application/pdf") {
                            setError("Only PDF files are allowed.");
                            setFile(null);
                            return;
                          }
                          if (selectedFile.size > 10 * 1024 * 1024) {
                              setError("File size exceeds 10MB. Please upload a smaller PDF.");
                              setFile(null);
                              return;
                          }
                        setFile(selectedFile);
                        setError("");
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100 d-flex justify-content-center align-items-center rounded-pill"
                  onClick={handleUpload}
                  disabled={loading || !file}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-up-circle me-2"></i>
                      Upload & Analyze
                    </>
                  )}
                </button>

                {/* Loading indicator below button */}
                {loading && (
                  <p className="mt-3 text-center text-primary small animate__animated animate__pulse animate__infinite">
                    Analyzing your resume...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right panel - Output area (only rendered when results are ready) */}
          {showTwoColumns && (
            <div className="col-12 col-md-6 col-lg-7 animate__animated animate__fadeIn animate__delay-1s">
              <div
                className="card shadow-lg border border-dark rounded-4"
                style={{
                  backgroundColor: "#222222",
                  minHeight: "450px",
                  maxHeight: "700px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  color: "#e0e0e0",
                }}
                aria-live="polite"
              >
                <div className="card-body p-4 p-md-5">
                  <h3 className="card-title mb-3 fw-normal text-primary fs-4">AI Analysis Results</h3>
                  <div className="bg-dark p-3 rounded small border border-secondary">
                    {parseAndHighlightText(parsedText)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}