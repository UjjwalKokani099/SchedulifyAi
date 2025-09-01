import React, { useState } from 'react';

// In a real application, this data would likely come from a database or a more extensive config file.
const syllabusData: { [key: string]: { [subject: string]: string[] } } = {
  'Class 10 (Boards)': {
    'Maths': ['Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Introduction to Trigonometry', 'Some Applications of Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    'Science': ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and its Compounds', 'Periodic Classification of Elements', 'Life Processes', 'Control and Coordination', 'How do Organisms Reproduce?', 'Heredity and Evolution', 'Light – Reflection and Refraction', 'The Human Eye and the Colourful World', 'Electricity', 'Magnetic Effects of Electric Current', 'Sources of Energy', 'Our Environment'],
    'Social Science': ['The Rise of Nationalism in Europe', 'Nationalism in India', 'Resources and Development', 'Agriculture', 'Minerals and Energy Resources', 'Manufacturing Industries', 'Lifelines of National Economy', 'Power-sharing', 'Federalism', 'Political Parties', 'Outcomes of Democracy', 'Development', 'Sectors of the Indian Economy', 'Money and Credit', 'Globalisation and the Indian Economy'],
  },
  'Class 12 - Engineering (JEE)': {
    'Physics': ['Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Rotational Motion', 'Gravitation', 'Thermodynamics', 'Optics', 'Electrostatics', 'Current Electricity', 'Magnetic Effects of Current', 'Electromagnetic Induction and AC', 'Modern Physics'],
    'Chemistry': ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 's-Block & p-Block Elements', 'Organic Chemistry - Basic Principles', 'Hydrocarbons', 'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Coordination Compounds', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids', 'Amines'],
    'Maths': ['Sets, Relations and Functions', 'Complex Numbers and Quadratic Equations', 'Matrices and Determinants', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series', 'Limits, Continuity and Differentiability', 'Integral Calculus', 'Differential Equations', 'Coordinate Geometry', 'Three Dimensional Geometry', 'Vector Algebra', 'Statistics and Probability', 'Trigonometry'],
  },
  'Class 12 - Medical (NEET)': {
    'Physics': ['Physical world and measurement', 'Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Motion of System of Particles', 'Gravitation', 'Properties of Bulk Matter', 'Thermodynamics', 'Behaviour of Perfect Gas and Kinetic Theory', 'Oscillations and Waves', 'Electrostatics', 'Current Electricity', 'Magnetic Effects of Current & Magnetism', 'Electromagnetic Induction & AC', 'Optics', 'Dual Nature of Matter and Radiation', 'Atoms and Nuclei'],
    'Biology': ['Diversity in Living World', 'Structural Organisation in Animals and Plants', 'Cell Structure and Function', 'Plant Physiology', 'Human Physiology', 'Reproduction', 'Genetics and Evolution', 'Biology and Human Welfare', 'Biotechnology and Its Applications', 'Ecology and Environment'],
    'Chemistry': ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity in Properties', 'Chemical Bonding and Molecular Structure', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Hydrogen', 's-Block Element (Alkali and Alkaline earth metals)', 'Some p-Block Elements', 'Organic Chemistry- Some Basic Principles and Techniques', 'Hydrocarbons', 'Environmental Chemistry', 'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'General Principles and Processes of Isolation of Elements', 'p-Block Elements', 'd and f Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids', 'Organic Compounds Containing Nitrogen', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'],
  },
};

interface SyllabusSelectorProps {
  className: string;
  onClose: () => void;
  onSave: (selectedTopics: string[]) => void;
}

export const SyllabusSelector: React.FC<SyllabusSelectorProps> = ({ className, onClose, onSave }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const currentSyllabus = syllabusData[className] || {};

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };
  
  const handleSave = () => {
    onSave(selectedTopics);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Select Syllabus Topics</h2>
          <p className="text-gray-600">Choose the topics you want to focus on for {className}.</p>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {Object.keys(currentSyllabus).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(currentSyllabus).map(([subject, topics]) => (
                <div key={subject}>
                  <h3 className="text-lg font-semibold text-indigo-700 mb-3">{subject}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {topics.map(topic => (
                      <label key={topic} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic)}
                          onChange={() => handleToggleTopic(topic)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No specific syllabus found for the selected class. You can manually enter topics in the previous screen.</p>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end items-center gap-4">
            <span className="text-sm text-gray-600">{selectedTopics.length} topics selected</span>
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700"
            >
                Save Syllabus
            </button>
        </div>
      </div>
    </div>
  );
};