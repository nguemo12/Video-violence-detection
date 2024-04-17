// VideoClassifier.js

import React, { useState } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const VideoClassifier = () => {
  const [videoPath, setVideoPath] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVideoPathChange = (event) => {
    setVideoPath(event.target.value);
  };
  const [selectedFile, setSelectedFile] = useState(null);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const[thepath, setThepath]= useState("")
  const handleUpload = () => {
    if (!selectedFile) {
      console.error('No file selected.');
      return;
    }
  
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const uploadedPath = fileReader.result;
      console.log('Uploaded video path:', uploadedPath);
      setThepath(uploadedPath)
    };

    fileReader.readAsDataURL(selectedFile);
  };

  const classifyVideo = async () => {
    if (!selectedFile) {
      setError('Please enter the path to the video file.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', {
        "path": thepath.toString()
      });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred while processing the video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Video violence detection</h2>
      
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {thepath && (
        <div>
          <p>Preview:</p>
          <video width="320" height="240" controls>
            <source src={thepath} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <button onClick={classifyVideo} style={styles.button} disabled={loading}>
        {loading ? <FaSpinner className="spinner" /> : 'Classify Video'}
      </button>
      {error && <p style={styles.error}>{error}</p>}
      {prediction && <p style={styles.prediction}>Prediction: {prediction}</p>}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    margin: '50px auto',
    maxWidth: '400px',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    position: 'relative',
  },
  error: {
    color: 'red',
    marginTop: '20px',
  },
  prediction: {
    marginTop: '20px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default VideoClassifier;
