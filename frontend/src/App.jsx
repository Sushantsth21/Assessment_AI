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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Medical Treatment Planner</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Symptoms</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
                placeholder="Add symptom..."
              />
              <button
                type="button"
                onClick={addSymptom}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.map(symptom => (
                <div key={symptom.id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                  <span>{symptom.text}</span>
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Physical Condition</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Age"
                value={physicalCondition.age}
                onChange={(e) => setPhysicalCondition({...physicalCondition, age: e.target.value})}
                className="p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Mobility Issues"
                value={physicalCondition.mobilityIssues}
                onChange={(e) => setPhysicalCondition({...physicalCondition, mobilityIssues: e.target.value})}
                className="p-2 border rounded-lg"
              />
              <div className="col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Allergies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentAllergy}
                    onChange={(e) => setCurrentAllergy(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Add allergy..."
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {physicalCondition.allergies.map(allergy => (
                    <div key={allergy.id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                      <span>{allergy.text}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(allergy.id)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {loading ? 'Generating...' : 'Generate Treatment Plan'}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </form>

        {treatmentPlan && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Treatment Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Medical Actions</h3>
                <ul className="list-disc pl-4">
                  {treatmentPlan.medicalActions.map((action, index) => (
                    <li key={index} className="text-blue-700 mb-2">{action}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Location Considerations</h3>
                <ul className="list-disc pl-4">
                  {treatmentPlan.locationConsiderations.map((location, index) => (
                    <li key={index} className="text-green-700 mb-2">{location}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Justifications</h3>
                <ul className="list-disc pl-4">
                  {treatmentPlan.justifications.map((justification, index) => (
                    <li key={index} className="text-purple-700 mb-2">{justification}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}