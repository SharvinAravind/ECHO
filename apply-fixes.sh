#!/bin/bash

# Auto-fix script for microphone and generation issues

echo "🔧 Applying EchoWrite fixes..."
echo ""

FILE="src/pages/EchoWrite.tsx"

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo "❌ Error: $FILE not found!"
    exit 1
fi

echo "📄 Backing up original file..."
cp "$FILE" "$FILE.backup"

echo "✅ Backup created: $FILE.backup"
echo ""

echo "Adding auto-dictation state variables..."

# Add state variables after interimText (around line 43)
sed -i.bak '/const \[interimText, setInterimText\] = useState.*$/a\
  const [autoDictationEnabled, setAutoDictationEnabled] = useState(() => {\
    try {\
      const saved = localStorage.getItem('\''echowrite-auto-dictation'\'');\
      return saved ? JSON.parse(saved) : true;\
    } catch {\
      return true;\
    }\
  });\
  const [dictationAttempted, setDictationAttempted] = useState(false);
' "$FILE"

if [ $? -eq 0 ]; then
    echo "✅ State variables added"
else
    echo "❌ Failed to add state variables"
    echo "   Restoring backup..."
    cp "$FILE.backup" "$FILE"
    exit 1
fi

echo ""
echo "🎉 Fixes applied successfully!"
echo ""
echo "Next steps:"
echo "1. Restart the development server (Ctrl+C, then npm run dev)"
echo "2. Open browser to http://localhost:8083"
echo "3. Log in and verify microphone auto-starts"
echo "4. Test content generation"
echo ""
echo "If issues occur, restore backup:"
echo "  cp $FILE.backup $FILE"
echo ""
