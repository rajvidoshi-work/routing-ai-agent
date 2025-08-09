# Google AI Studio Setup Guide

## 🚀 How to Get Your Google AI Studio API Key

The Routing AI Agent now supports **Google AI Studio (Gemini API)** as the primary AI provider, with OpenAI as a fallback option.

### Step 1: Access Google AI Studio

1. Go to **[Google AI Studio](https://aistudio.google.com/)**
2. Sign in with your Google account
3. Accept the terms of service if prompted

### Step 2: Create an API Key

1. Click on **"Get API key"** in the left sidebar
2. Click **"Create API key"**
3. Choose **"Create API key in new project"** (recommended) or select an existing project
4. Copy the generated API key (starts with `AIza...`)

### Step 3: Configure the Application

1. **Edit your `.env` file:**
   ```bash
   # AI API Configuration (Choose one)
   # Option 1: Google AI Studio (Gemini) - Recommended
   GOOGLE_AI_API_KEY=AIzaSyC-your-actual-api-key-here
   
   # Option 2: OpenAI (Alternative)
   # OPENAI_API_KEY=your-openai-api-key-here
   ```

2. **Save the file** and restart the application

### Step 4: Verify Setup

Run the application and you should see:
```
✅ Using Google AI Studio (Gemini) for AI features
```

## 🆚 Google AI Studio vs OpenAI

### Google AI Studio (Gemini) - **Recommended**
- ✅ **Free tier available** with generous limits
- ✅ **Fast response times**
- ✅ **Good healthcare knowledge**
- ✅ **Easy to get started**
- ✅ **No credit card required** for basic usage

### OpenAI (Alternative)
- ⚠️ **Requires payment** after free trial
- ✅ **Excellent performance**
- ✅ **Well-documented**
- ⚠️ **Credit card required**

## 🔧 Usage Limits

### Google AI Studio Free Tier
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is more than sufficient for testing and small-scale usage of the Routing AI Agent.

## 🛠️ Troubleshooting

### Common Issues

1. **"API key not configured" error**
   - Make sure your API key is correctly set in the `.env` file
   - Ensure there are no extra spaces or quotes around the key
   - Restart the application after making changes

2. **"Invalid API key" error**
   - Verify the API key is copied correctly from Google AI Studio
   - Make sure the API key hasn't expired
   - Check that the Google AI Studio service is enabled

3. **Rate limit errors**
   - You're hitting the free tier limits
   - Wait a few minutes and try again
   - Consider upgrading to a paid plan if needed

### Testing Your Setup

1. **Start the application:**
   ```bash
   ./start.sh
   ```

2. **Look for this message:**
   ```
   ✅ Using Google AI Studio (Gemini) for AI features
   ```

3. **Test with a patient case:**
   - Go to http://localhost:8000
   - Upload the sample patient data
   - Process a case and verify you get detailed AI responses

## 🔄 Fallback Behavior

The application is designed with intelligent fallback:

1. **First choice**: Google AI Studio (if `GOOGLE_AI_API_KEY` is set)
2. **Second choice**: OpenAI (if `OPENAI_API_KEY` is set)
3. **Fallback**: Rule-based logic (if no API keys are configured)

This ensures the application always works, even without AI API access.

## 💡 Pro Tips

1. **Keep your API key secure** - Never commit it to version control
2. **Monitor your usage** in the Google AI Studio console
3. **Set up billing alerts** if you upgrade to a paid plan
4. **Use environment variables** for different environments (dev/staging/prod)

## 🚀 Ready to Use!

Once you have your Google AI Studio API key configured, the Routing AI Agent will provide:

- **Intelligent patient routing** based on diagnosis and symptoms
- **Detailed agent responses** for Nursing, DME, and Pharmacy
- **Structured data** and **editable forms** for external partners
- **Priority scoring** and **timeline estimates**

The AI will analyze patient data and caregiver input to make smart routing decisions and generate comprehensive care coordination responses!
