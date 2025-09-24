# 🤖 Ollama Setup Guide for Real AI Chat

## **What is Ollama?**

Ollama is a free, open-source tool that lets you run large language models (LLMs) locally on your computer. This means:
- **No API costs** - completely free
- **Privacy** - all data stays on your machine
- **Offline capability** - works without internet
- **Multiple models** - choose from various AI models

## **🚀 Quick Installation**

### **Option 1: Automatic Installation (Recommended)**

1. **Open Terminal** and navigate to your project:
   ```bash
   cd DollersElectro/backend/scripts
   ```

2. **Run the installation script**:
   ```bash
   chmod +x installOllama.sh
   ./installOllama.sh
   ```

3. **Start Ollama service**:
   ```bash
   ollama serve
   ```

### **Option 2: Manual Installation**

#### **macOS:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### **Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### **Windows (WSL):**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## **📚 Download AI Models**

After installation, download models for electrical expertise:

```bash
# Download Mistral (recommended for general use)
ollama pull mistral

# Download Llama 3 (more powerful, larger)
ollama pull llama3

# Download CodeLlama (good for technical advice)
ollama pull codellama
```

## **🔧 Start Ollama Service**

1. **Start the service** (keep this running):
   ```bash
   ollama serve
   ```

2. **Test with a simple chat**:
   ```bash
   ollama run mistral
   ```

3. **Type your message and press Enter**

## **🎯 Available AI Models**

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **Mistral** | 7B | Fast | Good | General electrical advice |
| **Llama 3** | 8B | Medium | Excellent | Detailed technical guidance |
| **CodeLlama** | 7B | Fast | Good | Technical specifications |
| **Phi-3** | 3.8B | Very Fast | Good | Quick responses |

## **⚡ Performance Tips**

### **For Better Performance:**
- **Use SSD storage** for faster model loading
- **Close other applications** to free up RAM
- **Start with smaller models** (7B parameters)
- **Use GPU acceleration** if available

### **Memory Requirements:**
- **Mistral 7B**: ~4GB RAM
- **Llama 3 8B**: ~5GB RAM
- **CodeLlama 7B**: ~4GB RAM

## **🔍 Testing Your Setup**

1. **Check if Ollama is running**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Test the AI chatbox**:
   - Open your website: `http://localhost:3000`
   - Click the AI chat button
   - Ask: "I'm building a house, what electrical system do I need?"

3. **Check backend logs** for Ollama status

## **🔄 Switching Models**

You can switch AI models through the API:

```bash
# Switch to Llama 3
curl -X POST http://localhost:5001/api/ai-chat/switch-model \
  -H "Content-Type: application/json" \
  -d '{"modelName": "llama3"}'

# Check current model
curl http://localhost:5001/api/ai-chat/ollama-status
```

## **🚨 Troubleshooting**

### **Common Issues:**

1. **"Ollama service is not available"**
   - Make sure `ollama serve` is running
   - Check if port 11434 is free
   - Restart Ollama service

2. **"Model not found"**
   - Download the model: `ollama pull modelname`
   - Check available models: `ollama list`

3. **Slow responses**
   - Use smaller models (7B instead of 13B)
   - Close other applications
   - Check available RAM

4. **Port conflicts**
   - Kill existing processes: `lsof -ti:11434 | xargs kill -9`
   - Restart Ollama: `ollama serve`

### **Performance Monitoring:**

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Monitor system resources
htop  # or top on macOS
```

## **🎉 What You Get**

With Ollama integration, your AI chatbox now:

✅ **Real AI Intelligence** - Not just rule-based responses  
✅ **Context Understanding** - Remembers conversation history  
✅ **Professional Advice** - Expert electrical knowledge  
✅ **Product Recommendations** - Smart suggestions based on needs  
✅ **Safety Focus** - Always prioritizes electrical safety  
✅ **Cost Estimates** - Provides budget guidance  
✅ **Code Compliance** - Follows electrical regulations  

## **🔮 Advanced Features**

### **Custom Prompts:**
You can customize the AI's expertise by editing the prompt in `ollamaService.js`

### **Model Switching:**
Users can switch between different AI models for different needs

### **Offline Mode:**
Works completely offline once models are downloaded

### **Multi-language Support:**
Many models support multiple languages

## **📞 Support**

If you encounter issues:

1. **Check Ollama logs**: `ollama serve` terminal output
2. **Verify installation**: `ollama --version`
3. **Test basic functionality**: `ollama run mistral`
4. **Check system resources**: RAM and storage space

## **🎯 Next Steps**

1. **Install Ollama** using the script above
2. **Start the service**: `ollama serve`
3. **Test the chatbox** on your website
4. **Enjoy real AI conversations!**

Your electrical customers will now get professional, intelligent advice from a real AI expert! 🚀





