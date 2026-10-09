export interface PicklistOption {
  value: string;
  label: string;
}

export const DIAGNOSES: PicklistOption[] = [
  { value: 'pediatric feeding disorder', label: 'Pediatric Feeding Disorder' },
  { value: 'food selectivity', label: 'Food Selectivity' },
  { value: 'food refusal', label: 'Food Refusal' },
  { value: 'oral motor dysfunction', label: 'Oral Motor Dysfunction' },
  { value: 'dysphagia', label: 'Dysphagia' },
  { value: 'failure to thrive', label: 'Failure to Thrive' },
  { value: 'anxiety-related feeding avoidance', label: 'Anxiety-Related Feeding Avoidance' },
  { value: 'sensory processing disorder', label: 'Sensory Processing Disorder' },
  { value: 'autism spectrum disorder', label: 'Autism Spectrum Disorder' },
  { value: 'gastroesophageal reflux', label: 'Gastroesophageal Reflux (GERD)' },
  { value: 'cleft palate', label: 'Cleft Palate' },
  { value: 'down syndrome', label: 'Down Syndrome' },
  { value: 'cerebral palsy', label: 'Cerebral Palsy' },
  { value: 'tongue tie (ankyloglossia)', label: 'Tongue Tie (Ankyloglossia)' },
  { value: 'laryngomalacia', label: 'Laryngomalacia' },
  { value: 'eosinophilic esophagitis', label: 'Eosinophilic Esophagitis' },
  { value: 'prematurity-related feeding issues', label: 'Prematurity-Related Feeding Issues' },
  { value: 'pica', label: 'PICA' },
  { value: 'avoidant/restrictive food intake disorder', label: 'ARFID' },
  { value: 'expressive language disorder', label: 'Expressive Language Disorder' },
  { value: 'receptive language disorder', label: 'Receptive Language Disorder' },
  { value: 'apraxia of speech', label: 'Apraxia of Speech' },
  { value: 'phonological disorder', label: 'Phonological Disorder' },
  { value: 'articulation disorder', label: 'Articulation Disorder' },
  { value: 'stuttering/fluency disorder', label: 'Stuttering / Fluency Disorder' },
];

export const SETTINGS: PicklistOption[] = [
  { value: 'outpatient_clinic', label: 'Outpatient Clinic' },
  { value: 'home_health', label: 'Home Health' },
  { value: 'school', label: 'School' },
  { value: 'aba_center', label: 'ABA Center' },
  { value: 'nursing_home', label: 'Nursing Home' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'teletherapy', label: 'Teletherapy' },
  { value: 'early_intervention', label: 'Early Intervention (Home-Based)' },
  { value: 'private_practice', label: 'Private Practice' },
];

export const AGE_BANDS: PicklistOption[] = [
  { value: '0-1', label: '0–1 (Infant)' },
  { value: '1-2', label: '1–2 (Toddler)' },
  { value: '2-3', label: '2–3 (Toddler)' },
  { value: '3-4', label: '3–4 (Preschool)' },
  { value: '4-5', label: '4–5 (Preschool)' },
  { value: '5-7', label: '5–7 (Early School Age)' },
  { value: '7-12', label: '7–12 (School Age)' },
  { value: '12-18', label: '12–18 (Adolescent)' },
  { value: '18+', label: '18+ (Adult)' },
];

export const GOAL_DOMAINS: PicklistOption[] = [
  { value: 'feeding', label: 'Feeding' },
  { value: 'swallowing', label: 'Swallowing' },
  { value: 'oral motor', label: 'Oral Motor' },
  { value: 'sensory', label: 'Sensory' },
  { value: 'communication', label: 'Communication' },
  { value: 'articulation', label: 'Articulation' },
  { value: 'language', label: 'Language' },
  { value: 'fluency', label: 'Fluency' },
  { value: 'voice', label: 'Voice' },
  { value: 'social communication', label: 'Social Communication' },
  { value: 'cognitive-communication', label: 'Cognitive-Communication' },
  { value: 'mealtime behavior', label: 'Mealtime Behavior' },
  { value: 'self-feeding', label: 'Self-Feeding' },
];

export const BARRIER_CATEGORIES: PicklistOption[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'systemic', label: 'Systemic' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'medical', label: 'Medical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'sensory', label: 'Sensory' },
];

export const PRECAUTIONS: PicklistOption[] = [
  { value: 'aspiration risk', label: 'Aspiration Risk' },
  { value: 'choking risk', label: 'Choking Risk' },
  { value: 'food allergies', label: 'Food Allergies' },
  { value: 'texture restrictions', label: 'Texture Restrictions (Medical)' },
  { value: 'thickened liquids required', label: 'Thickened Liquids Required' },
  { value: 'npo status', label: 'NPO Status' },
  { value: 'positioning requirements', label: 'Positioning Requirements' },
  { value: 'seizure precautions', label: 'Seizure Precautions' },
  { value: 'behavioral crisis protocol', label: 'Behavioral Crisis Protocol' },
  { value: 'gastrostomy tube dependent', label: 'G-Tube Dependent' },
  { value: 'reflux precautions', label: 'Reflux Precautions' },
  { value: 'no known precautions', label: 'No Known Precautions' },
];

export const EQUIPMENT: PicklistOption[] = [
  { value: 'textured spoons', label: 'Textured Spoons' },
  { value: 'chewy tubes', label: 'Chewy Tubes' },
  { value: 'food play kit', label: 'Food Play Kit' },
  { value: 'visual schedule cards', label: 'Visual Schedule Cards' },
  { value: 'weighted lap pad', label: 'Weighted Lap Pad' },
  { value: 'mirror', label: 'Mirror (Table-top)' },
  { value: 'adaptive utensils', label: 'Adaptive Utensils' },
  { value: 'oral vibration tool', label: 'Oral Vibration Tool (Z-Vibe)' },
  { value: 'bite blocks', label: 'Bite Blocks' },
  { value: 'non-slip mat', label: 'Non-Slip Mat / Dycem' },
  { value: 'timer/visual timer', label: 'Timer / Visual Timer' },
  { value: 'reward board', label: 'Reward / Token Board' },
  { value: 'social stories', label: 'Social Stories' },
  { value: 'communication board', label: 'Communication Board / AAC' },
];

export const DEVELOPMENTAL_LEVELS: PicklistOption[] = [
  { value: 'infant', label: 'Infant' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'early childhood', label: 'Early Childhood' },
  { value: 'school age', label: 'School Age' },
  { value: 'adolescent', label: 'Adolescent' },
  { value: 'adult', label: 'Adult' },
];

export const CONTACT_ROLES: PicklistOption[] = [
  { value: 'pediatrician', label: 'Pediatrician' },
  { value: 'ot', label: 'Occupational Therapist (OT)' },
  { value: 'pt', label: 'Physical Therapist (PT)' },
  { value: 'psychologist', label: 'Psychologist' },
  { value: 'bcba', label: 'BCBA / Behavior Analyst' },
  { value: 'dietitian', label: 'Dietitian / Nutritionist' },
  { value: 'classroom teacher', label: 'Classroom Teacher' },
  { value: 'special education teacher', label: 'Special Education Teacher' },
  { value: 'school nurse', label: 'School Nurse' },
  { value: 'gi specialist', label: 'GI Specialist' },
  { value: 'ent', label: 'ENT / Otolaryngologist' },
  { value: 'neurologist', label: 'Neurologist' },
  { value: 'social worker', label: 'Social Worker' },
  { value: 'case manager', label: 'Case Manager' },
];

export const SESSION_LENGTHS: PicklistOption[] = [
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
  { value: '90', label: '90 min' },
];

export function getLabel(options: PicklistOption[], value: string): string {
  return options.find(o => o.value === value)?.label || value;
}
