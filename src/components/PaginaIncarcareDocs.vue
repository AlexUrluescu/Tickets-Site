<template>
  <div class="uploader-container">
    <div class="card">
      <h2>📄 Upload Knowledge</h2>
      <p class="subtitle">
        Upload a .docx file to process and generate embeddings
      </p>

      <div
        class="drop-zone"
        :class="{ 'is-dragging': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <div v-if="!selectedFile">
          <p>Drag & drop your file here</p>
          <p class="small-text">
            or <span class="highlight">click to browse</span>
          </p>
        </div>

        <div v-else class="file-info">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ selectedFile.name }}</span>
          <button
            @click.stop="clearFile"
            class="remove-btn"
            title="Remove file"
          >
            ✕
          </button>
        </div>

        <input
          type="file"
          ref="fileInput"
          accept=".docx"
          class="hidden-input"
          @change="handleFileChange"
        />
      </div>

      <button
        class="upload-btn"
        @click="uploadFile"
        :disabled="!selectedFile || isUploading"
      >
        <span v-if="isUploading" class="loader"></span>
        <span v-else>Upload & Embed</span>
      </button>

      <div v-if="status.message" :class="['status-msg', status.type]">
        {{ status.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

// State
const fileInput = ref(null);
const selectedFile = ref(null);
const isDragging = ref(false);
const isUploading = ref(false);
const status = reactive({ message: "", type: "" });


const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  validateAndSetFile(file);
};


const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  validateAndSetFile(file);
};


const validateAndSetFile = (file) => {
  status.message = ""; 
  if (!file) return;


  if (
    !file.name.endsWith(".docx") &&
    file.type !==
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    status.message = "Error: Only .docx files are allowed.";
    status.type = "error";
    return;
  }

  selectedFile.value = file;
};

const clearFile = () => {
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = ""; 
  status.message = "";
};


const uploadFile = async () => {
  if (!selectedFile.value) return;

  isUploading.value = true;
  status.message = "Uploading and processing...";
  status.type = "info";

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
   
    const response = await fetch("http://localhost:3000/upload-doc", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    status.message = `Success! Document processed into ${data.chunks} embedding chunks.`;
    status.type = "success";


  } catch (error) {
    console.error(error);
    status.message = error.message || "Server error occurred.";
    status.type = "error";
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>

.uploader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-family: "Segoe UI", sans-serif;
  background-color: #f4f6f8;
}


.card {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  background: white;
  text-align: center;
}

h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}
.subtitle {
  color: #7f8c8d;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}


.drop-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 40px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
  color: #555;
  margin-bottom: 24px;
  position: relative;
}

.drop-zone:hover,
.drop-zone.is-dragging {
  border-color: #42b983;
  background: #f0fdf4;
}

.highlight {
  color: #42b983;
  font-weight: 600;
  text-decoration: underline;
}
.small-text {
  font-size: 0.85rem;
  color: #888;
  margin-top: 5px;
}
.hidden-input {
  display: none;
}


.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.file-name {
  font-weight: 500;
  color: #333;
}
.remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 5px;
}


.upload-btn {
  width: 100%;
  padding: 14px;
  background-color: #34495e; 
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.upload-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.upload-btn:not(:disabled):hover {
  background-color: #42b983;
  transform: translateY(-1px);
}

/* Status Messages */
.status-msg {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: left;
}

.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
.info {
  background-color: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

/* Spinner Animation */
.loader {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
