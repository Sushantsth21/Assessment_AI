import { useState } from 'react';
import axios from 'axios';

// Configure axios base URL
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export default function TreatmentPlanner() {
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState({
    age: '',
    mobilityIssues: '',
    allergies: []
  });
  const [currentAllergy, setCurrentAllergy] = useState('');
  const [location, setLocation] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addSymptom = () => {
    if (currentSymptom.trim()) {
      setSymptoms([...symptoms, { id: Date.now(), text: currentSymptom }]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (id) => {
    setSymptoms(symptoms.filter(symptom => symptom.id !== id));
  };

  const addAllergy = () => {
    if (currentAllergy.trim()) {
      setPhysicalCondition({
        ...physicalCondition,
        allergies: [...physicalCondition.allergies, { id: Date.now(), text: currentAllergy }]
      });
      setCurrentAllergy('');
    }
  };

  const removeAllergy = (id) => {
    setPhysicalCondition({
      ...physicalCondition,
      allergies: physicalCondition.allergies.filter(allergy => allergy.id !== id)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the request payload
      const requestData = {
        symptoms,
        physicalCondition,
        location
      };
      
      // Call the backend API
      const response = await api.post('/treatment-plan', requestData);
      setTreatmentPlan(response.data);
    } catch (err) {
      console.error('Error generating treatment plan:', err);
      setError(
        err.response?.data?.detail || 
        'Failed to generate treatment plan. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Medical Treatment Planner</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Enter your symptoms and medical information to generate a personalized treatment plan.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 mb-12 border border-indigo-100">
          <div className="mb-8">
            <label className="block text-indigo-800 font-semibold mb-3 text-lg">Symptoms</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                className="flex-1 p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
                placeholder="Add symptom..."
              />
              <button
                type="button"
                onClick={addSymptom}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.map(symptom => (
                <div key={symptom.id} className="bg-indigo-50 px-4 py-2 rounded-full flex items-center border border-indigo-100">
                  <span className="text-indigo-800">{symptom.text}</span>
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom.id)}
                    className="ml-2 text-indigo-400 hover:text-indigo-700 transition duration-200 text-lg font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
              {symptoms.length === 0 && (
                <p className="text-gray-400 italic">No symptoms added yet</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-indigo-800 font-semibold mb-3 text-lg">Physical Condition</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-600 mb-1 text-sm">Age</label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={physicalCondition.age}
                  onChange={(e) => setPhysicalCondition({...physicalCondition, age: e.target.value})}
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1 text-sm">Mobility Issues</label>
                <input
                  type="text"
                  placeholder="Describe any mobility issues"
                  value={physicalCondition.mobilityIssues}
                  onChange={(e) => setPhysicalCondition({...physicalCondition, mobilityIssues: e.target.value})}
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-1 text-sm">Allergies</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentAllergy}
                  onChange={(e) => setCurrentAllergy(e.target.value)}
                  className="flex-1 p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
                  placeholder="Add allergy..."
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {physicalCondition.allergies.map(allergy => (
                  <div key={allergy.id} className="bg-pink-50 px-4 py-2 rounded-full flex items-center border border-pink-100">
                    <span className="text-pink-800">{allergy.text}</span>
                    <button
                      type="button"
                      onClick={() => removeAllergy(allergy.id)}
                      className="ml-2 text-pink-400 hover:text-pink-700 transition duration-200 text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {physicalCondition.allergies.length === 0 && (
                  <p className="text-gray-400 italic">No allergies added yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-indigo-800 font-semibold mb-3 text-lg">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
              className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg text-lg font-medium transition duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-md hover:shadow-lg'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </div>
            ) : 'Generate Treatment Plan'}
          </button>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <div>
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </form>

        {treatmentPlan && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-indigo-800">Your Treatment Plan</h2>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">Generated</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <h3 className="font-semibold text-blue-800 text-lg">Medical Actions</h3>
                </div>
                <ul className="space-y-2">
                  {treatmentPlan.medicalActions.map((action, index) => (
                    <li key={index} className="text-blue-700 flex items-start">
                      <span className="inline-block w-5 h-5 bg-blue-200 rounded-full text-blue-800 text-xs flex items-center justify-center mr-2 mt-0.5">{index + 1}</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <h3 className="font-semibold text-green-800 text-lg">Location Considerations</h3>
                </div>
                <ul className="space-y-2">
                  {treatmentPlan.locationConsiderations.map((consideration, index) => (
                    <li key={index} className="text-green-700 flex items-start">
                      <span className="inline-block w-5 h-5 bg-green-200 rounded-full text-green-800 text-xs flex items-center justify-center mr-2 mt-0.5">{index + 1}</span>
                      {consideration}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <h3 className="font-semibold text-purple-800 text-lg">Justifications</h3>
                </div>
                <ul className="space-y-2">
                  {treatmentPlan.justifications.map((justification, index) => (
                    <li key={index} className="text-purple-700 flex items-start">
                      <span className="inline-block w-5 h-5 bg-purple-200 rounded-full text-purple-800 text-xs flex items-center justify-center mr-2 mt-0.5">{index + 1}</span>
                      {justification}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                type="button"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 inline-flex items-center"
                onClick={() => setTreatmentPlan(null)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Create New Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}