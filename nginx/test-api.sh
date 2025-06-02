#!/bin/bash

# Comprehensive API Testing Script for Microservices Gateway
# Usage: ./test-api.sh [base_url]
# Example: ./test-api.sh http://localhost:5000

set -e

# Configuration
BASE_URL=${1:-"http://localhost:5000"}
echo "🚀 Testing API Gateway at: $BASE_URL"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
    esac
}

# Helper function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local content_type=${5:-"application/json"}
    
    echo ""
    print_status "INFO" "Testing: $method $endpoint - $description"
    
    if [ -n "$data" ]; then
        if [ "$content_type" = "multipart/form-data" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method \
                -H "Content-Type: $content_type" \
                $data \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method \
                -H "Content-Type: $content_type" \
                -d "$data" \
                "$BASE_URL$endpoint")
        fi
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method \
            "$BASE_URL$endpoint")
    fi
    
    # Extract the body and status
    body=$(echo $response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    status=$(echo $response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    echo "Status: $status"
    echo "Response: $body" | head -c 200
    if [ ${#body} -gt 200 ]; then echo "..."; fi
    
    # Check if status is successful (2xx or 3xx)
    if [[ $status =~ ^[23][0-9][0-9]$ ]]; then
        print_status "SUCCESS" "$method $endpoint"
    else
        print_status "ERROR" "$method $endpoint (Status: $status)"
    fi
}

# 1. System Health Checks
echo ""
echo "🏥 SYSTEM HEALTH CHECKS"
echo "========================"

test_endpoint "GET" "/health" "Gateway health check"
test_endpoint "GET" "/" "Main page"

# 2. Authentication Service Tests
echo ""
echo "🔐 AUTHENTICATION SERVICE TESTS"
echo "================================="

# Register new user
register_data='{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "student"
}'
test_endpoint "POST" "/api/auth/register" "Register new user" "$register_data"

# Login user
login_data='{
    "email": "test@example.com",
    "password": "TestPassword123!"
}'
test_endpoint "POST" "/api/auth/login" "Login user" "$login_data"

# Check authentication status
test_endpoint "GET" "/api/auth/check" "Check auth status"

# Update user info
update_data='{
    "email": "updated@example.com"
}'
test_endpoint "PUT" "/api/auth/update" "Update user info" "$update_data"

# Logout user
test_endpoint "POST" "/api/auth/logout" "Logout user"

# 3. Analytics Service Tests
echo ""
echo "📊 ANALYTICS SERVICE TESTS"
echo "============================"

# Log emotion data
emotion_data='{
    "studentId": "stu123",
    "emotion": "happy",
    "attention": 85,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'
test_endpoint "POST" "/api/logs/emotion" "Log emotion data" "$emotion_data"

# 4. Notification Service Tests
echo ""
echo "📧 NOTIFICATION SERVICE TESTS"
echo "=============================="

# Send email notification
email_data='{
    "to": "recipient@example.com",
    "subject": "Test Email from API Gateway",
    "message": "This is a test email sent through the Nginx proxy gateway."
}'
test_endpoint "POST" "/api/send-email" "Send email notification" "$email_data"

# 5. Video Service Tests
echo ""
echo "🎥 VIDEO SERVICE TESTS"
echo "======================="

# List all videos
test_endpoint "GET" "/api/videos" "List all videos"

# Upload video (simulated with text file)
echo "Creating test file for upload..."
echo "This is a test video file content" > /tmp/test_video.txt

upload_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -F "video=@/tmp/test_video.txt" \
    -F "title=Test Video" \
    -F "description=Test video uploaded via API gateway" \
    "$BASE_URL/api/upload")

upload_body=$(echo $upload_response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
upload_status=$(echo $upload_response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

echo ""
print_status "INFO" "Testing: POST /api/upload - Upload video file"
echo "Status: $upload_status"
echo "Response: $upload_body" | head -c 200

if [[ $upload_status =~ ^[23][0-9][0-9]$ ]]; then
    print_status "SUCCESS" "POST /api/upload"
    
    # Try to extract video ID for further testing
    video_id=$(echo $upload_body | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
    if [ -n "$video_id" ]; then
        print_status "INFO" "Extracted video ID: $video_id"
        
        # Like the video
        test_endpoint "PATCH" "/api/videos/$video_id/like" "Like video"
        
        # Add view to the video
        test_endpoint "PATCH" "/api/videos/$video_id/view" "Add video view"
    else
        print_status "WARNING" "Could not extract video ID from response"
        # Test with dummy ID
        test_endpoint "PATCH" "/api/videos/dummy123/like" "Like video (dummy ID)"
        test_endpoint "PATCH" "/api/videos/dummy123/view" "Add video view (dummy ID)"
    fi
else
    print_status "ERROR" "POST /api/upload (Status: $upload_status)"
fi

# Clean up test file
rm -f /tmp/test_video.txt

# 6. Emotion Detection Service Tests
echo ""
echo "😊 EMOTION DETECTION SERVICE TESTS"
echo "==================================="

# Create a simple test image (1x1 pixel PNG in base64)
echo "Creating test image for emotion detection..."
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAWA0evQAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_image.png

emotion_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -F "image=@/tmp/test_image.png" \
    "$BASE_URL/api/emotion-service")

emotion_body=$(echo $emotion_response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
emotion_status=$(echo $emotion_response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

echo ""
print_status "INFO" "Testing: POST /api/emotion-service - Detect emotion from image"
echo "Status: $emotion_status"
echo "Response: $emotion_body" | head -c 200

if [[ $emotion_status =~ ^[23][0-9][0-9]$ ]]; then
    print_status "SUCCESS" "POST /api/emotion-service"
else
    print_status "ERROR" "POST /api/emotion-service (Status: $emotion_status)"
fi

# Clean up test image
rm -f /tmp/test_image.png

# 7. CORS and Options Tests
echo ""
echo "🌐 CORS AND OPTIONS TESTS"
echo "=========================="

# Test CORS preflight for auth endpoint
cors_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X OPTIONS \
    -H "Origin: http://example.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "$BASE_URL/api/auth/login")

cors_status=$(echo $cors_response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

print_status "INFO" "Testing: OPTIONS /api/auth/login - CORS preflight"
echo "Status: $cors_status"

if [[ $cors_status == "204" ]]; then
    print_status "SUCCESS" "CORS preflight request"
else
    print_status "ERROR" "CORS preflight request (Status: $cors_status)"
fi

# Summary
echo ""
echo "🎯 TEST SUMMARY"
echo "==============="
print_status "INFO" "All API tests completed!"
print_status "INFO" "Gateway URL: $BASE_URL"
print_status "INFO" "Check the responses above for any errors"
print_status "INFO" "Services tested: Auth, Analytics, Notification, Video, Emotion Detection"

echo ""
echo "📚 QUICK REFERENCE COMMANDS:"
echo "=============================="
echo "Health Check:"
echo "  curl $BASE_URL/health"
echo ""
echo "Register User:"
echo "  curl -X POST $BASE_URL/api/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"user@example.com\",\"password\":\"Pass123!\",\"role\":\"student\"}'"
echo ""
echo "Login:"
echo "  curl -X POST $BASE_URL/api/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"user@example.com\",\"password\":\"Pass123!\"}'"
echo ""
echo "Log Emotion:"
echo "  curl -X POST $BASE_URL/api/logs/emotion \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"studentId\":\"stu123\",\"emotion\":\"happy\",\"attention\":85}'"
echo ""
echo "Send Email:"
echo "  curl -X POST $BASE_URL/api/send-email \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"to\":\"test@example.com\",\"subject\":\"Hello\",\"message\":\"Test message\"}'"
echo ""
echo "Upload Video:"
echo "  curl -X POST $BASE_URL/api/upload \\"
echo "    -F 'video=@video.mp4' \\"
echo "    -F 'title=My Video' \\"
echo "    -F 'description=Video description'"
echo ""
echo "Detect Emotion:"
echo "  curl -X POST $BASE_URL/api/emotion-service \\"
echo "    -F 'image=@photo.jpg'"
