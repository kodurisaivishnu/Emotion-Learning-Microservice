import os
import logging
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io
from emotion_detector import EmotionDetector

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_dev")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Enable CORS for all routes and origins
CORS(app, origins="*")

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Initialize emotion detector
emotion_detector = EmotionDetector()

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file_data):
    """Validate that the uploaded file is a valid image."""
    try:
        image = Image.open(io.BytesIO(file_data))
        image.verify()  # Verify it's a valid image
        return True
    except Exception as e:
        logging.error(f"Image validation failed: {str(e)}")
        return False

@app.route('/')
def index():
    """API health check endpoint."""
    return jsonify({
        'status': 'running',
        'message': 'Emotion Detection API is running',
        'endpoints': {
            'emotion_detection': '/api/emotion-service',
            'method': 'POST',
            'content_type': 'multipart/form-data',
            'supported_formats': ['PNG', 'JPG', 'JPEG'],
            'max_file_size': '16MB'
        }
    })

@app.route('/api/emotion-service', methods=['POST'])
def emotion_service():
    """
    API endpoint for emotion detection in uploaded images.
    Accepts image files via form data and returns emotion classification results.
    """
    try:
        # Check if the post request has the file part
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided',
                'message': 'Please upload an image file'
            }), 400

        file = request.files['image']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'message': 'Please select an image file'
            }), 400

        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file format',
                'message': 'Only PNG, JPG, and JPEG files are supported'
            }), 400

        # Read file data
        file_data = file.read()
        
        # Validate image
        if not validate_image(file_data):
            return jsonify({
                'error': 'Invalid image file',
                'message': 'The uploaded file is not a valid image'
            }), 400

        # Convert to OpenCV format
        nparr = np.frombuffer(file_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({
                'error': 'Failed to process image',
                'message': 'Could not decode the image file'
            }), 400

        # Detect emotion
        result = emotion_detector.detect_emotion(image)
        
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error in emotion_service: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while processing the image'
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({
        'error': 'File too large',
        'message': 'Image file size must be less than 16MB'
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist'
    }), 404

@app.errorhandler(405)
def method_not_allowed(e):
    """Handle method not allowed errors."""
    return jsonify({
        'error': 'Method not allowed',
        'message': 'This endpoint only accepts POST requests'
    }), 405

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)