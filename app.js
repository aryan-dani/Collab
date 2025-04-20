document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("medication-upload");
  const imagePreview = document.getElementById("image-preview");
  const infoSection = document.getElementById("info-section");
  const medicationDetailsList = document.getElementById("medication-details");
  const ttsButton = document.getElementById("tts-button");
  const loadingIndicator = document.getElementById("loading-indicator"); // Get loading indicator
  const pdfMessage = document.getElementById("pdf-message"); // Get PDF message element

  // TTS state variables
  let isSpeaking = false;
  let isPaused = false;
  let currentUtterance = null;

  uploadInput.addEventListener("change", handleImageUpload);
  ttsButton.addEventListener("click", handleTTSButtonClick);

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
      const key = item.querySelector("strong").textContent.replace(":", "");
      const value = item.textContent
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
