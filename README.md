# CodeAI – AI-Powered Code Learning

[CodeAI](https://codeai-v1.netlify.app)   is a web platform with a Chrome extension that helps users understand, debug, and improve code using AI, track progress, and practice with challenges.

## 📽 Demo

[![Watch the demo](assets/demo-thumb.png)](https://youtu.be/QixyjqqHEhA)

## 🌟 Features

1. **Chrome Extension**  
   - Explain, fix errors, improve, and predict outputs directly from any webpage.  

2. **Website Dashboard** 
   - View your analysis, query history, courses progress, and challenges.  

3. **Courses & Challenges** 
   - Learn coding via interactive lessons and practice challenges.  
   - Currently supports **JavaScript** challenges.  

4. **Community & Stack (Coming Soon)**  
   - Plan to add social coding features and community leaderboards.  


## 🛠️ Tools Used

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)
![Chrome](https://img.shields.io/badge/Chrome%20API-4285F4?style=flat&logo=google-chrome&logoColor=white)


## 🧩 Getting Started

Follow these steps to install and run CodeAI locally.

### Prerequisites
- Google Chrome
- An **OpenAI API Key** ([Get your key here](https://platform.openai.com/api-keys))

### Installation

1. **Download & Extract**
   - Go to the [CodeAI website](https://codeai-v1.netlify.app)  
   - Download the **CodeAI extension ZIP**  
   - Extract the ZIP folder on your computer  

2. **Add Your API Key**
   - Open `background.js` inside the extracted folder  
   - Find the line:
     ```js
     const OPENAI_KEY = "YOUR_API_KEY_HERE";
     ```
   - Replace `"YOUR_API_KEY_HERE"` with your own OpenAI key  

3. **Load the Extension in Chrome**
   - Open Chrome and go to: `chrome://extensions/`  
   - Enable **Developer Mode** (top-right toggle)  
   - Click **Load unpacked**  
   - Select the extracted CodeAI folder  
   - The CodeAI icon should now appear in your Chrome toolbar  


## 💡 How to Use

### Using the Extension
1. Highlight any code or text on a webpage  
2. Right-click → choose the **CodeAI options**:  
   - **Explain**: Understand the code  
   - **Error**: Detect issues  
   - **Improve**: Optimize your code  
   - **Output**: Predict results  

### Using the Website
- Track your queries and course progress  
- Solve coding challenges (JS only for now)  
- Explore your **learning roadmap**  

### Settings
- Click the CodeAI icon in Chrome toolbar  
- Choose **Light/Dark theme**  
- Select **Response Detail Level** (Simple / Detailed)  
- Save your settings  


## 📜 License
This project is licensed under the MIT License - see the LICENSE.md file for details.




