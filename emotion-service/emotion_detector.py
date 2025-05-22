import cv2
import numpy as np
import logging
import random

class EmotionDetector:
    """
    Emotion detection class that uses OpenCV for face detection
    and a simple rule-based emotion classifier.
    """
    
    def __init__(self):
        """Initialize the emotion detector with face cascade and emotion model."""
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        
        # Load face cascade classifier
        import os
        cascade_filename = 'haarcascade_frontalface_default.xml'
        
        # Try different possible locations for the cascade file
        possible_paths = [
            '/usr/share/opencv4/haarcascades/' + cascade_filename,
            '/usr/local/share/opencv4/haarcascades/' + cascade_filename,
            '/opt/opencv/data/haarcascades/' + cascade_filename
        ]
        
        self.face_cascade = None
        for path in possible_paths:
            if os.path.exists(path):
                self.face_cascade = cv2.CascadeClassifier(path)
                break
        
        # If none found, try the cv2.data approach
        if self.face_cascade is None or self.face_cascade.empty():
            try:
                self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + cascade_filename)
            except:
                logging.warning("Could not load face cascade classifier")
        
        # Initialize random seed for consistent demo results
        random.seed(42)
    
    def detect_faces(self, image):
        """
        Detect faces in the given image using OpenCV.
        
        Args:
            image: OpenCV image (BGR format)
            
        Returns:
            List of face rectangles (x, y, w, h)
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        return faces
    
    def preprocess_face(self, face_image):
        """
        Preprocess face image for emotion detection.
        
        Args:
            face_image: Cropped face image
            
        Returns:
            Preprocessed image features
        """
        # Convert to grayscale
        if len(face_image.shape) == 3:
            gray_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        else:
            gray_face = face_image
            
        # Resize to standard size for analysis
        resized_face = cv2.resize(gray_face, (48, 48))
        
        # Calculate basic image statistics for emotion inference
        mean_intensity = np.mean(resized_face)
        std_intensity = np.std(resized_face)
        
        return {
            'face': resized_face,
            'mean_intensity': mean_intensity,
            'std_intensity': std_intensity
        }
    
    def predict_emotion(self, processed_face):
        """
        Predict emotion from a face image using image analysis.
        
        Args:
            processed_face: Preprocessed face data
            
        Returns:
            Dictionary with emotion prediction and confidence
        """
        try:
            face_data = processed_face['face']
            mean_intensity = processed_face['mean_intensity']
            std_intensity = processed_face['std_intensity']
            
            # Simple emotion detection based on facial features analysis
            # This is a demonstration - in production, you'd use a trained model from Kaggle dataset
            
            # Analyze face brightness and contrast patterns
            upper_half = face_data[:24, :]  # Upper half (eyes/forehead)
            lower_half = face_data[24:, :]  # Lower half (mouth/chin)
            
            upper_mean = np.mean(upper_half)
            lower_mean = np.mean(lower_half)
            
            # Calculate edge density for expression analysis
            edges = cv2.Canny(face_data, 50, 150)
            edge_density = np.sum(edges > 0) / (48 * 48)
            
            # Create emotion probabilities based on facial analysis
            emotion_scores = {}
            
            # Happy: typically brighter lower face (smile), moderate edge density
            emotion_scores['happy'] = max(0.1, min(0.9, (lower_mean - upper_mean + 50) / 100))
            
            # Sad: typically darker overall, less edge activity
            emotion_scores['sad'] = max(0.1, min(0.9, (200 - mean_intensity) / 200))
            
            # Angry: high contrast, many edges
            emotion_scores['angry'] = max(0.1, min(0.9, edge_density * 2))
            
            # Surprise: high upper face activity, high contrast
            emotion_scores['surprise'] = max(0.1, min(0.9, (upper_mean / 255) * (std_intensity / 50)))
            
            # Fear: similar to surprise but less intense
            emotion_scores['fear'] = emotion_scores['surprise'] * 0.7
            
            # Disgust: moderate activity, specific pattern
            emotion_scores['disgust'] = max(0.1, min(0.6, abs(upper_mean - lower_mean) / 100))
            
            # Neutral: balanced features
            emotion_scores['neutral'] = max(0.2, 1.0 - max(emotion_scores.values()))
            
            # Normalize probabilities
            total_score = sum(emotion_scores.values())
            emotion_probabilities = {k: v/total_score for k, v in emotion_scores.items()}
            
            # Get primary emotion
            primary_emotion = max(emotion_probabilities.keys(), key=lambda k: emotion_probabilities[k])
            confidence = emotion_probabilities[primary_emotion]
            
            return {
                'emotion': primary_emotion,
                'confidence': confidence,
                'all_emotions': emotion_probabilities
            }
            
        except Exception as e:
            logging.error(f"Error predicting emotion: {e}")
            return {
                'emotion': 'neutral',
                'confidence': 0.5,
                'all_emotions': {label: 1.0/7 for label in self.emotion_labels}
            }
    
    def detect_emotion(self, image):
        """
        Main method to detect emotions in an image.
        
        Args:
            image: OpenCV image (BGR format)
            
        Returns:
            Dictionary with emotion detection results
        """
        try:
            # Detect faces in the image
            faces = self.detect_faces(image)
            
            if len(faces) == 0:
                return {
                    'status': 'no_face',
                    'message': 'No face detected in the image',
                    'faces_detected': 0
                }
            
            # Process each detected face
            results = []
            for i, (x, y, w, h) in enumerate(faces):
                # Extract face region
                face_roi = image[y:y+h, x:x+w]
                
                # Preprocess face
                processed_face = self.preprocess_face(face_roi)
                
                # Predict emotion
                emotion_result = self.predict_emotion(processed_face)
                
                # Add face coordinates
                emotion_result.update({
                    'face_id': i + 1,
                    'face_coordinates': {
                        'x': int(x),
                        'y': int(y),
                        'width': int(w),
                        'height': int(h)
                    }
                })
                
                results.append(emotion_result)
            
            # Return results for all faces
            return {
                'status': 'success',
                'faces_detected': len(faces),
                'results': results,
                'primary_emotion': results[0]['emotion'] if results else 'neutral',
                'primary_confidence': results[0]['confidence'] if results else 0.0
            }
            
        except Exception as e:
            logging.error(f"Error in emotion detection: {e}")
            return {
                'status': 'error',
                'message': f'Error processing image: {str(e)}',
                'faces_detected': 0
            }