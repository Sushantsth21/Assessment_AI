# Medical Treatment Planner

## Project Overview

The Medical Treatment Planner is a full-stack application that:

1. Takes patient symptoms, physical condition (age, mobility issues, allergies), and geographic location as inputs
2. Retrieves relevant medical information from a vector database
3. Uses a large language model to generate a personalized treatment plan
4. Presents recommendations with justifications through a user-friendly interface
5. Includes evaluation mechanisms to ensure plan quality and safety


### Components:

- **Frontend**: React application with a user-friendly form interface
- **Backend API**: FastAPI server processing treatment plan requests
- **Vector Database**: Pinecone for storing and retrieving medical information embeddings
- **LLM Integration**: OpenAI's GPT-4o for generating treatment plans
- **External Services**: Google Maps API for location-based healthcare facility recommendations
- **Evaluation Framework**: Customized metrics for assessing treatment plan quality

## Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Python, FastAPI
- **Vector Database**: Pinecone
- **LLM**: OpenAI GPT-4o
- **Embeddings**: OpenAI text-embedding-3-small
- **Evaluation**: NLTK for BLEU scoring, custom evaluation metrics
- **APIs**: Google Maps API for location services

## Prerequisites

- Python 3.9+
- Node.js 16+
- OpenAI API key
- Pinecone API key
- Google Maps API key

## Installation and Setup

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medical-treatment-planner.git
   cd medical-treatment-planner/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

5. Upload medical data to Pinecone (if it's your first time):
   ```bash
   python upload.py
   ```

6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173`

## How It Works

1. **Data Collection**: The frontend form collects patient symptoms, physical condition details, and location.
2. **Information Retrieval**: The system uses embeddings to find relevant medical information in the Pinecone database.
3. **Location Processing**: The Google Maps API identifies nearby healthcare facilities.
4. **Plan Generation**: All information is sent to GPT-4o, which generates a structured treatment plan.
5. **Presentation**: The treatment plan is displayed to the user with medical actions, location considerations, and justifications.

##  Evaluation Framework

The system includes a comprehensive evaluation framework to measure treatment plan quality:

### Quantitative Metrics:
- **Section Completeness**: Ensures all required plan components are present
- **Location Validation**: Checks that location recommendations match patient needs
- **Medical Safety**: Verifies plans avoid recommending contraindicated treatments
- **BLEU Score**: Compares generated plans against reference standards

### Qualitative Assessment:
- Missing components identification
- Allergy consideration verification
- Safety issue detection

### Test Cases:
1. **Urban Adult - Standard Case**: Tests basic functionality for routine symptoms
2. **Rural Allergic Patient - Edge Case**: Tests telehealth recommendations and allergy awareness
3. **Dangerous Allergy Combo - Failure Case**: Tests ability to avoid contraindicated treatments

## Running Evaluations

```bash
python evaluation.py
```

This will run the evaluation framework against predefined test cases and output performance metrics.


```

## Limitations and Ethical Considerations

- This system is designed for **informational purposes only** and does not replace professional medical advice.
- The treatment plans should be reviewed by healthcare professionals before implementation.
- The system has limited medical knowledge and may not cover all conditions or treatments.
- Geographic recommendations depend on Google Maps data accuracy.
- Always consult with qualified healthcare providers for medical decisions.

