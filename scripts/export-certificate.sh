#!/bin/bash
# Export Apple Developer Certificate for GitHub Actions
# This script helps you export your certificate to Base64 format

set -e

echo "🔐 Apple Developer Certificate Export Tool"
echo "==========================================="
echo ""

# Find Developer ID Application certificate
echo "📋 Looking for Developer ID Application certificates..."
echo ""
security find-identity -v -p codesigning | grep "Developer ID Application" || {
    echo "❌ No Developer ID Application certificate found!"
    echo "   Please install your certificate first."
    exit 1
}

echo ""
echo "🔑 Enter your certificate details:"
echo ""

# Get certificate common name
read -p "Enter the full certificate name (e.g., Developer ID Application: zanwei guo (Z9VQ8GY7PB)): " CERT_NAME

if [ -z "$CERT_NAME" ]; then
    echo "❌ Certificate name cannot be empty!"
    exit 1
fi

# Output file
OUTPUT_FILE="certificate.p12"
read -p "Enter output filename [$OUTPUT_FILE]: " INPUT_FILE
if [ -n "$INPUT_FILE" ]; then
    OUTPUT_FILE="$INPUT_FILE"
fi

# Get password for p12
echo ""
echo "⚠️  You need to set a password to protect the .p12 file."
echo "   This password will be used as APPLE_CERTIFICATE_PASSWORD in GitHub Secrets."
read -s -p "Enter password for the .p12 file: " P12_PASSWORD
echo ""
read -s -p "Confirm password: " P12_PASSWORD_CONFIRM
echo ""

if [ "$P12_PASSWORD" != "$P12_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords do not match!"
    exit 1
fi

# Export certificate
echo ""
echo "📤 Exporting certificate..."
security export -k login.keychain-db -t identities -f pkcs12 -P "$P12_PASSWORD" -o "$OUTPUT_FILE" 2>/dev/null || {
    # Try without specifying keychain
    security find-certificate -c "$CERT_NAME" -p > /tmp/cert.pem 2>/dev/null
    security find-key -c "$CERT_NAME" -p > /tmp/key.pem 2>/dev/null
    openssl pkcs12 -export -out "$OUTPUT_FILE" -inkey /tmp/key.pem -in /tmp/cert.pem -password "pass:$P12_PASSWORD"
    rm -f /tmp/cert.pem /tmp/key.pem
}

if [ ! -f "$OUTPUT_FILE" ]; then
    echo "❌ Failed to export certificate!"
    echo ""
    echo "Alternative method - Export manually from Keychain Access:"
    echo "1. Open Keychain Access"
    echo "2. Find your certificate: $CERT_NAME"
    echo "3. Right-click → Export"
    echo "4. Save as .p12 format"
    echo "5. Then run: base64 -i your-certificate.p12 | pbcopy"
    exit 1
fi

echo "✅ Certificate exported to: $OUTPUT_FILE"
echo ""

# Convert to Base64
echo "🔄 Converting to Base64..."
BASE64_OUTPUT="${OUTPUT_FILE}.base64"
base64 -i "$OUTPUT_FILE" -o "$BASE64_OUTPUT"

echo "✅ Base64 output saved to: $BASE64_OUTPUT"
echo ""

# Copy to clipboard
if command -v pbcopy &> /dev/null; then
    base64 -i "$OUTPUT_FILE" | pbcopy
    echo "📋 Base64 content copied to clipboard!"
    echo ""
fi

echo "==========================================="
echo "📝 Next Steps:"
echo "==========================================="
echo ""
echo "1. Go to GitHub repository Settings → Secrets and variables → Actions"
echo ""
echo "2. Add the following secrets:"
echo ""
echo "   APPLE_CERTIFICATE = (paste from clipboard or content of $BASE64_OUTPUT)"
echo "   APPLE_CERTIFICATE_PASSWORD = $P12_PASSWORD"
echo "   APPLE_SIGNING_IDENTITY = $CERT_NAME"
echo ""
echo "3. For notarization, also add:"
echo "   APPLE_API_ISSUER = (from App Store Connect)"
echo "   APPLE_API_KEY = (from App Store Connect)"
echo "   APPLE_API_KEY_PATH = (base64 of .p8 file)"
echo ""
echo "⚠️  Security reminder: Delete $OUTPUT_FILE and $BASE64_OUTPUT after configuring secrets!"
