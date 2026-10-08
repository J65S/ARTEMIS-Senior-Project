const fs = require('fs');
const path = require('path');

const patientPath = path.join(__dirname, '../data/patient.json');
const patientData = JSON.parse(fs.readFileSync(patientPath, 'utf8'));

const threeDPayload = {
  patient_id: patientData.patient_id,
  patient_name: patientData.name,
  condition: patientData.condition.name,
  body_location: patientData.condition.body_location,
  status: patientData.condition.status,
};

console.log('Data being sent to 3D model:');
console.log(threeDPayload);

function sendTo3DModel(data) {
  console.log('Patient name:', data.patient_name);
  console.log('Condition:', data.condition);
  console.log('Body location:', data.body_location);
  console.log('Status:', data.status);
  console.log(`Highlighting ${data.body_location} on the 3D model...`);
}

sendTo3DModel(threeDPayload);
