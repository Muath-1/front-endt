import { useState, useRef, useEffect, useCallback } from 'react';

const MimeType = 'video/webm;codecs=vp9,opus';

export default function ScreenRecorder({ userId, meetingId, onUploadComplete }) {
  // Refs for media objects
  const mediaStreamRef = useRef(null);
  const displayStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const completeBlobRef = useRef(null);
  const videoPreviewRef = useRef(null);

  // State for UI
  const [status, setStatus] = useState('Idle');
  const [isSelectingEnabled, setIsSelectingEnabled] = useState(true);
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(false);
  const [isStoppingEnabled, setIsStoppingEnabled] = useState(false);
  const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);

  // Cleanup function
  const resetState = useCallback(() => {
    console.log("Resetting state...");
    
    // Stop recorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log("Stopping active media recorder during reset.");
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    [mediaStreamRef, displayStreamRef, micStreamRef].forEach(streamRef => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    });

    // Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      console.log("Closing AudioContext.");
      audioContextRef.current.close();
    }

    // Clear preview
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }

    // Reset refs
    mediaStreamRef.current = null;
    displayStreamRef.current = null;
    micStreamRef.current = null;
    audioContextRef.current = null;
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    completeBlobRef.current = null;

    // Reset UI state
    setIsSelectingEnabled(true);
    setIsRecordingEnabled(false);
    setIsStoppingEnabled(false);
    setIsDownloadEnabled(false);
    setStatus('Idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return resetState;
  }, [resetState]);

  const handleStreamEnd = useCallback(() => {
    console.log('A stream track ended.');
    setStatus('Sharing stopped or stream ended.');
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('Stopping recorder due to stream ending.');
      mediaRecorderRef.current.stop();
    } else {
      resetState();
    }
  }, [resetState]);

  const selectScreenAndMic = async () => {
    setStatus('Requesting screen and microphone access...');
    setIsSelectingEnabled(false);
    setIsRecordingEnabled(false);

    try {
      // Get Display Media
      displayStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true
      });

      // Get Microphone
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        },
        video: false
      });

      // Mix Audio Streams
      audioContextRef.current = new AudioContext();
      const destination = audioContextRef.current.createMediaStreamDestination();
      let sourcesConnected = 0;

      // Connect Mic
      if (micStreamRef.current.getAudioTracks().length > 0) {
        const micSource = audioContextRef.current.createMediaStreamSource(micStreamRef.current);
        micSource.connect(destination);
        sourcesConnected++;
      }

      // Connect System Audio
      if (displayStreamRef.current.getAudioTracks().length > 0) {
        const displayAudioSource = audioContextRef.current.createMediaStreamSource(displayStreamRef.current);
        displayAudioSource.connect(destination);
        sourcesConnected++;
      }

      // Create Final Stream
      const mixedAudioTracks = destination.stream.getAudioTracks();
      const videoTracks = displayStreamRef.current.getVideoTracks();
      mediaStreamRef.current = new MediaStream([...videoTracks, ...mixedAudioTracks]);

      // Setup Preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = displayStreamRef.current;
        await videoPreviewRef.current.play();
      }

      // Handle track ending
      displayStreamRef.current.getVideoTracks()[0].onended = handleStreamEnd;

      setStatus('Screen and Mic ready. Ready to record.');
      setIsRecordingEnabled(true);
      setIsStoppingEnabled(false);

    } catch (err) {
      console.error("Error requesting streams:", err);
      setStatus(`Error: ${err.message}`);
      resetState();
    }
  };

  const startRecording = () => {
    if (!mediaStreamRef.current?.getTracks().length) {
      setStatus('Error: No stream available.');
      return;
    }

    recordedChunksRef.current = [];
    setIsRecordingEnabled(false);
    setIsStoppingEnabled(true);
    setIsSelectingEnabled(false);
    setStatus('Recording...');

    try {
      const options = MediaRecorder.isTypeSupported(MimeType) ? { mimeType: MimeType } : undefined;
      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setStatus('Recording stopped. Processing...');
        
        const blob = new Blob(recordedChunksRef.current, { type: mediaRecorderRef.current.mimeType });
        
        if (blob.size === 0) {
          setStatus("Error: Recording resulted in empty file.");
          resetState();
          return;
        }

        completeBlobRef.current = blob;
        await uploadRecording(blob);
        setIsDownloadEnabled(true);
        setStatus('Processing complete. Ready for download.');
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setStatus(`Error during recording: ${event.error.name || 'Unknown error'}`);
        resetState();
      };

      mediaRecorderRef.current.start(1000);

    } catch (err) {
      console.error("Error starting recorder:", err);
      setStatus(`Error: ${err.message}`);
      resetState();
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current?.state === 'recording') return;
    
    setStatus('Stopping recording...');
    setIsStoppingEnabled(false);
    mediaRecorderRef.current.stop();
  };

  const downloadRecording = () => {
    if (!completeBlobRef.current) {
      setStatus("Error: No recording available.");
      return;
    }

    const filename = `recording-${meetingId}-${userId}-${Date.now()}.webm`;
    const url = URL.createObjectURL(completeBlobRef.current);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      setStatus('Download initiated.');
      setIsDownloadEnabled(false);
    }, 100);
  };

  const uploadRecording = async (blob) => {
    if (!userId || !meetingId || !blob) {
      setStatus("Error: Missing required information for upload.");
      resetState();
      return;
    }

    setStatus('Uploading recording...');
    setIsDownloadEnabled(false);

    const formData = new FormData();
    formData.append('recording', blob, `recording-${meetingId}-${userId}.webm`);
    formData.append('userId', userId);
    formData.append('meetingId', meetingId);

    try {
      const response = await fetch('/recordings/save', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || response.statusText);
      }

      setStatus('Upload complete!');
      onUploadComplete?.(result);

    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Upload failed: ${error.message}`);
    } finally {
      completeBlobRef.current = null;
      resetState();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-900">Screen Recording</h2>
          <span className="text-sm text-blue-700">{status}</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={selectScreenAndMic}
            disabled={!isSelectingEnabled}
            className={`px-4 py-2 rounded-lg font-medium ${
              isSelectingEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            1. Select Screen/Window
          </button>

          <button
            onClick={startRecording}
            disabled={!isRecordingEnabled}
            className={`px-4 py-2 rounded-lg font-medium ${
              isRecordingEnabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            2. Start Recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!isStoppingEnabled}
            className={`px-4 py-2 rounded-lg font-medium ${
              isStoppingEnabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            3. Stop Recording
          </button>

          <button
            onClick={downloadRecording}
            disabled={!isDownloadEnabled}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDownloadEnabled
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Download
          </button>
        </div>

        {/* Preview */}
        <div className="mt-4">
          <video
            ref={videoPreviewRef}
            className="w-full max-w-2xl border border-gray-200 rounded-lg shadow-sm"
            autoPlay
            muted
            playsInline
          />
        </div>
      </div>
    </div>
  );
}
