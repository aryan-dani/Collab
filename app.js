const { jsPDF } = window.jspdf; // Import jsPDF from the global scope

document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("medication-upload");
  const imagePreview = document.getElementById("image-preview");
  const infoSection = document.getElementById("info-section");
  const medicationDetailsList = document.getElementById("medication-details");
  const ttsButton = document.getElementById("tts-button");
  const downloadPdfButton = document.getElementById("download-pdf-button"); // Get Download button
  const loadingIndicator = document.getElementById("loading-indicator"); // Get loading indicator
  const pdfMessage = document.getElementById("pdf-message"); // Get PDF message element

  // TTS state variables
  let isSpeaking = false;
  let isPaused = false;
  let currentUtterance = null;

  uploadInput.addEventListener("change", handleImageUpload);
  ttsButton.addEventListener("click", handleTTSButtonClick);
  downloadPdfButton.addEventListener("click", generateAndDownloadPDF); // Add listener for download

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
      resetApp();
      return;
    }

    // Check if file type is accepted (image or PDF)
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      resetApp(); // Clear previous state before processing new file
      loadingIndicator.style.display = "block"; // Show loading indicator
      imagePreview.style.display = "none"; // Hide preview initially
      pdfMessage.style.display = "none"; // Hide PDF message initially

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
          // Simulate AI processing delay
          simulateProcessing(file.name, false);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        pdfMessage.style.display = "block"; // Show PDF message
        // Simulate AI processing delay for PDF
        simulateProcessing(file.name, true);
      }
    } else {
      resetApp();
      alert("Please upload a valid image or PDF file.");
    }
  }

  // Simulate processing delay
  function simulateProcessing(fileName, isPdf) {
    console.log(`Simulating extraction for: ${fileName}`);
    // Simulate network/processing time (e.g., 1.5 seconds)
    setTimeout(() => {
      loadingIndicator.style.display = "none"; // Hide loading indicator
      displayMedicationInfo(fileName, isPdf);
    }, 1500);
  }

  function displayMedicationInfo(imageName, isPdf) {
    // Added isPdf parameter
    // --- SIMULATION ---
    // In a real app, this function would call an AI/OCR service
    // with the image data (e.target.result or the file object)
    // and parse the response.
    // For now, we'll use placeholder data based on a mock scenario.

    console.log(`Displaying info for: ${imageName}${isPdf ? " (PDF)" : ""}`);

    // Placeholder data - replace with actual extracted data
    const extractedData = {
      drugNameBrand: "ExampleMed",
      drugNameGeneric: "Exampicillin",
      dosage: "500mg",
      frequency: "Take one tablet twice daily",
      instructions:
        "Take with a full glass of water. Can be taken with or without food.",
      warnings:
        "May cause dizziness. Do not operate heavy machinery until you know how this affects you. Avoid alcohol.",
    };

    // --- Simplification ---
    // Translate jargon (simple examples)
    const simplifiedData = {
      "Drug Name": `${extractedData.drugNameBrand} (${extractedData.drugNameGeneric})`,
      Strength: extractedData.dosage,
      "How Often": simplifyFrequency(extractedData.frequency), // Example simplification
      "How to Take": extractedData.instructions,
      "Important Warnings": extractedData.warnings,
    };

    // Clear previous details
    medicationDetailsList.innerHTML = "";

    // Populate the list
    for (const [key, value] of Object.entries(simplifiedData)) {
      const listItem = document.createElement("li");
      // Store key and value separately for easier PDF generation
      listItem.dataset.key = key;
      listItem.dataset.value = value;
      listItem.innerHTML = `<strong>${key}:</strong> ${value}`;
      medicationDetailsList.appendChild(listItem);
    }

    // Show the info section
    infoSection.style.display = "block";
    // Ensure TTS button is in initial state
    resetTTSState();
  }

  function simplifyFrequency(freqText) {
    // Basic simplification example
    if (freqText.toLowerCase().includes("twice daily")) {
      return "Take 2 times a day.";
    }
    if (freqText.toLowerCase().includes("once daily")) {
      return "Take 1 time a day.";
    }
    // Add more rules as needed
    return freqText; // Return original if no rule matches
  }

  function handleTTSButtonClick() {
    if (!("speechSynthesis" in window)) {
      alert("Sorry, your browser does not support Text-to-Speech.");
      return;
    }

    if (!isSpeaking) {
      // Start speaking
      startSpeaking();
    } else {
      if (isPaused) {
        // Resume speaking
        resumeSpeaking();
      } else {
        // Pause speaking
        pauseSpeaking();
      }
    }
  }

  function startSpeaking() {
    const detailsToSpeak = [];
    medicationDetailsList.querySelectorAll("li").forEach((item) => {
      // Use dataset if available, otherwise parse text
      const key =
        item.dataset.key ||
        item.querySelector("strong").textContent.replace(":", "");
      const value =
        item.dataset.value ||
        item.textContent
          .replace(item.querySelector("strong").textContent, "")
          .trim();
      detailsToSpeak.push(`${key}. ${value}.`);
    });

    if (detailsToSpeak.length === 0) return; // Nothing to speak

    const fullText = detailsToSpeak.join(" ");
    currentUtterance = new SpeechSynthesisUtterance(fullText);

    currentUtterance.onstart = () => {
      console.log("Speech started");
      isSpeaking = true;
      isPaused = false;
      ttsButton.textContent = "Pause";
    };

    currentUtterance.onpause = () => {
      console.log("Speech paused");
      isPaused = true;
      ttsButton.textContent = "Resume";
    };

    currentUtterance.onresume = () => {
      console.log("Speech resumed");
      isPaused = false;
      ttsButton.textContent = "Pause";
    };

    currentUtterance.onend = () => {
      console.log("Speech finished");
      resetTTSState();
    };

    currentUtterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      alert(`An error occurred during speech synthesis: ${event.error}`);
      resetTTSState();
    };

    window.speechSynthesis.cancel(); // Cancel any previous speech just in case
    window.speechSynthesis.speak(currentUtterance);
  }

  function pauseSpeaking() {
    if (window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  }

  function resumeSpeaking() {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  function resetTTSState() {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    isPaused = false;
    currentUtterance = null;
    ttsButton.textContent = "Read Aloud";
  }

  // --- PDF Generation ---
  function generateAndDownloadPDF() {
    if (!medicationDetailsList.hasChildNodes()) {
      alert("No medication information available to download.");
      return;
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = margin; // Start position for text

    // Add Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Simplified Medication Guide", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    // Add Medication Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    medicationDetailsList.querySelectorAll("li").forEach((item, index) => {
      const key = item.dataset.key || "Detail"; // Fallback key
      const value =
        item.dataset.value ||
        item.textContent
          .replace(item.querySelector("strong")?.textContent || "", "")
          .trim(); // Fallback value extraction

      // Set key style (bold)
      doc.setFont("helvetica", "bold");
      let keyText = `${key}:`;
      let keyWidth = doc.getTextWidth(keyText) + 2; // Width of the key + space

      // Check if content fits on the current line/page
      if (yPos + 6 > pageHeight - margin) {
        // Estimate line height + check page boundary
        doc.addPage();
        yPos = margin;
      }
      doc.text(keyText, margin, yPos);

      // Set value style (normal)
      doc.setFont("helvetica", "normal");
      // Calculate available width for the value
      let valueMaxWidth = pageWidth - margin - margin - keyWidth;
      // Split value text if it's too long
      let valueLines = doc.splitTextToSize(value, valueMaxWidth);

      // Print value lines
      doc.text(valueLines, margin + keyWidth, yPos);

      // Update yPos based on the number of lines the value took
      yPos += valueLines.length * 6; // Adjust line height as needed (approx 6 units per line)
      yPos += 4; // Add extra space between list items
    });

    // Add Footer
    const footerText = `Generated by DoseFlow on ${new Date().toLocaleDateString()}`;
    doc.setFontSize(10);
    doc.setTextColor(150); // Grey color
    doc.text(footerText, margin, pageHeight - 10);

    // Trigger Download
    doc.save("DoseFlow_Medication_Guide.pdf");
  }

  function resetApp() {
    loadingIndicator.style.display = "none"; // Hide loading indicator
    pdfMessage.style.display = "none"; // Hide PDF message
    imagePreview.src = "#";
    imagePreview.style.display = "none";
    infoSection.style.display = "none";
    medicationDetailsList.innerHTML = "";
    uploadInput.value = ""; // Clear the file input
    resetTTSState(); // Reset TTS as well
  }

  // Initial state
  resetApp();
});
