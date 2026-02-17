/**
 * Medical Services Available in Hospitals
 * Categorized from basic care to critical emergency services
 */

export const MEDICAL_SERVICES = [
  // Basic Care & Common Conditions
  {
    category: "Basic Care & Common Conditions",
    icon: "🩺",
    services: [
      { id: "general_consultation", name: "General Consultation", severity: "basic" },
      { id: "fever_treatment", name: "Fever & Flu Treatment", severity: "basic" },
      { id: "cold_cough", name: "Cold & Cough", severity: "basic" },
      { id: "viral_infections", name: "Viral Infections", severity: "basic" },
      { id: "headache_migraine", name: "Headache & Migraine", severity: "basic" },
      { id: "stomach_issues", name: "Stomach Issues (Gastritis, Acidity)", severity: "basic" },
      { id: "allergies", name: "Allergies & Skin Rashes", severity: "basic" },
      { id: "minor_injuries", name: "Minor Injuries & Wounds", severity: "basic" },
    ]
  },

  // Respiratory Care
  {
    category: "Respiratory Care",
    icon: "🫁",
    services: [
      { id: "asthma_treatment", name: "Asthma Treatment", severity: "moderate" },
      { id: "bronchitis", name: "Bronchitis", severity: "moderate" },
      { id: "pneumonia", name: "Pneumonia Treatment", severity: "moderate" },
      { id: "copd", name: "COPD (Chronic Obstructive Pulmonary Disease)", severity: "moderate" },
      { id: "tuberculosis", name: "Tuberculosis (TB) Care", severity: "moderate" },
      { id: "respiratory_distress", name: "Acute Respiratory Distress", severity: "critical" },
    ]
  },

  // Cardiovascular Care
  {
    category: "Cardiovascular Care",
    icon: "❤️",
    services: [
      { id: "hypertension", name: "Hypertension (High Blood Pressure)", severity: "moderate" },
      { id: "heart_disease", name: "Heart Disease Management", severity: "serious" },
      { id: "heart_attack", name: "Heart Attack (Myocardial Infarction)", severity: "critical" },
      { id: "stroke", name: "Stroke Treatment", severity: "critical" },
      { id: "cardiac_surgery", name: "Cardiac Surgery", severity: "critical" },
      { id: "angioplasty", name: "Angioplasty & Stenting", severity: "critical" },
      { id: "pacemaker", name: "Pacemaker Installation", severity: "serious" },
      { id: "ecg_monitoring", name: "ECG & Heart Monitoring", severity: "moderate" },
    ]
  },

  // Cancer & Oncology
  {
    category: "Cancer & Oncology",
    icon: "🎗️",
    services: [
      { id: "cancer_screening", name: "Cancer Screening & Detection", severity: "moderate" },
      { id: "chemotherapy", name: "Chemotherapy", severity: "serious" },
      { id: "radiation_therapy", name: "Radiation Therapy", severity: "serious" },
      { id: "breast_cancer", name: "Breast Cancer Treatment", severity: "serious" },
      { id: "lung_cancer", name: "Lung Cancer Treatment", severity: "serious" },
      { id: "blood_cancer", name: "Blood Cancer (Leukemia) Treatment", severity: "serious" },
      { id: "tumor_surgery", name: "Tumor Removal Surgery", severity: "serious" },
      { id: "palliative_care", name: "Palliative & Hospice Care", severity: "serious" },
    ]
  },

  // Diabetes & Endocrine
  {
    category: "Diabetes & Endocrine",
    icon: "💉",
    services: [
      { id: "diabetes_management", name: "Diabetes Management", severity: "moderate" },
      { id: "thyroid_treatment", name: "Thyroid Disorders", severity: "moderate" },
      { id: "diabetic_emergency", name: "Diabetic Emergency (Ketoacidosis)", severity: "critical" },
      { id: "insulin_therapy", name: "Insulin Therapy", severity: "moderate" },
      { id: "endocrine_disorders", name: "Endocrine Disorders", severity: "moderate" },
    ]
  },

  // Neurological Care
  {
    category: "Neurological Care",
    icon: "🧠",
    services: [
      { id: "neurology_consult", name: "Neurological Consultation", severity: "moderate" },
      { id: "epilepsy", name: "Epilepsy & Seizure Management", severity: "serious" },
      { id: "parkinsons", name: "Parkinson's Disease", severity: "serious" },
      { id: "brain_surgery", name: "Brain Surgery (Neurosurgery)", severity: "critical" },
      { id: "spinal_surgery", name: "Spinal Surgery", severity: "critical" },
      { id: "head_trauma", name: "Head Trauma & Injury", severity: "critical" },
    ]
  },

  // Emergency & Trauma Care
  {
    category: "Emergency & Trauma Care",
    icon: "🚨",
    services: [
      { id: "emergency_24x7", name: "24/7 Emergency Services", severity: "critical" },
      { id: "trauma_care", name: "Trauma & Accident Care", severity: "critical" },
      { id: "burn_treatment", name: "Burn Treatment", severity: "critical" },
      { id: "poisoning", name: "Poisoning & Overdose", severity: "critical" },
      { id: "icu_critical_care", name: "ICU & Critical Care", severity: "critical" },
      { id: "ventilator_support", name: "Ventilator Support", severity: "critical" },
      { id: "emergency_surgery", name: "Emergency Surgery", severity: "critical" },
    ]
  },

  // Surgical Services
  {
    category: "Surgical Services",
    icon: "⚕️",
    services: [
      { id: "general_surgery", name: "General Surgery", severity: "serious" },
      { id: "laparoscopic", name: "Laparoscopic Surgery", severity: "serious" },
      { id: "orthopedic_surgery", name: "Orthopedic Surgery (Bone & Joints)", severity: "serious" },
      { id: "appendectomy", name: "Appendectomy", severity: "serious" },
      { id: "gallbladder_removal", name: "Gallbladder Removal", severity: "serious" },
      { id: "hernia_repair", name: "Hernia Repair", severity: "moderate" },
    ]
  },

  // Women's Health & Maternity
  {
    category: "Women's Health & Maternity",
    icon: "🤰",
    services: [
      { id: "gynecology", name: "Gynecology Services", severity: "moderate" },
      { id: "obstetrics", name: "Obstetrics & Maternity Care", severity: "moderate" },
      { id: "normal_delivery", name: "Normal Delivery", severity: "moderate" },
      { id: "cesarean_section", name: "C-Section (Cesarean)", severity: "serious" },
      { id: "pregnancy_emergency", name: "Pregnancy Emergency Care", severity: "critical" },
      { id: "nicu", name: "NICU (Neonatal Intensive Care)", severity: "critical" },
      { id: "fertility_treatment", name: "Fertility Treatment", severity: "moderate" },
    ]
  },

  // Pediatric Care
  {
    category: "Pediatric Care",
    icon: "👶",
    services: [
      { id: "pediatrics", name: "Pediatric Consultation", severity: "basic" },
      { id: "child_vaccination", name: "Child Vaccination", severity: "basic" },
      { id: "newborn_care", name: "Newborn Care", severity: "moderate" },
      { id: "child_nutrition", name: "Child Nutrition & Growth", severity: "basic" },
      { id: "pediatric_emergency", name: "Pediatric Emergency", severity: "critical" },
    ]
  },

  // Kidney & Urology
  {
    category: "Kidney & Urology",
    icon: "🫘",
    services: [
      { id: "kidney_disease", name: "Kidney Disease Management", severity: "serious" },
      { id: "dialysis", name: "Dialysis (Hemodialysis)", severity: "serious" },
      { id: "kidney_transplant", name: "Kidney Transplant", severity: "critical" },
      { id: "kidney_stones", name: "Kidney Stone Treatment", severity: "moderate" },
      { id: "urology", name: "Urology Services", severity: "moderate" },
      { id: "uti_treatment", name: "Urinary Tract Infections", severity: "basic" },
    ]
  },

  // Liver & Gastroenterology
  {
    category: "Liver & Gastroenterology",
    icon: "🫀",
    services: [
      { id: "liver_disease", name: "Liver Disease Treatment", severity: "serious" },
      { id: "hepatitis", name: "Hepatitis Treatment", severity: "serious" },
      { id: "liver_transplant", name: "Liver Transplant", severity: "critical" },
      { id: "gastroenterology", name: "Gastroenterology Services", severity: "moderate" },
      { id: "endoscopy", name: "Endoscopy & Colonoscopy", severity: "moderate" },
      { id: "ibd", name: "IBD (Inflammatory Bowel Disease)", severity: "moderate" },
    ]
  },

  // Infectious Diseases
  {
    category: "Infectious Diseases",
    icon: "🦠",
    services: [
      { id: "covid_treatment", name: "COVID-19 Treatment", severity: "serious" },
      { id: "dengue", name: "Dengue Fever Treatment", severity: "serious" },
      { id: "malaria", name: "Malaria Treatment", severity: "moderate" },
      { id: "hiv_aids", name: "HIV/AIDS Care", severity: "serious" },
      { id: "sepsis", name: "Sepsis & Severe Infections", severity: "critical" },
    ]
  },

  // Mental Health
  {
    category: "Mental Health",
    icon: "🧘",
    services: [
      { id: "psychiatry", name: "Psychiatry Services", severity: "moderate" },
      { id: "psychology", name: "Psychology & Counseling", severity: "basic" },
      { id: "depression_anxiety", name: "Depression & Anxiety Treatment", severity: "moderate" },
      { id: "addiction", name: "Addiction & De-addiction", severity: "moderate" },
      { id: "suicide_prevention", name: "Suicide Prevention & Crisis", severity: "critical" },
    ]
  },

  // Diagnostic Services
  {
    category: "Diagnostic Services",
    icon: "🔬",
    services: [
      { id: "pathology", name: "Pathology & Lab Tests", severity: "basic" },
      { id: "radiology", name: "Radiology (X-Ray)", severity: "basic" },
      { id: "mri_ct_scan", name: "MRI & CT Scan", severity: "moderate" },
      { id: "ultrasound", name: "Ultrasound", severity: "basic" },
      { id: "blood_bank", name: "Blood Bank & Transfusion", severity: "serious" },
      { id: "biopsy", name: "Biopsy Services", severity: "moderate" },
    ]
  }
];

// Flatten all services for easy access
export const ALL_SERVICES = MEDICAL_SERVICES.flatMap(category => category.services);

// Get service by ID
export const getServiceById = (id) => {
  return ALL_SERVICES.find(service => service.id === id);
};

// Get services by severity
export const getServicesBySeverity = (severity) => {
  return ALL_SERVICES.filter(service => service.severity === severity);
};

export default MEDICAL_SERVICES;
