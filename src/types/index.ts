export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ---- GRADE CATEGORY (DepEd 3-component system) ----
export type GradeCategory = 'written_work' | 'performance_task' | 'quarterly_assessment';

export interface GradeWeights {
  written_work: number;       // e.g. 25 (percent)
  performance_task: number;   // e.g. 50
  quarterly_assessment: number; // e.g. 25
}

export const DEFAULT_GRADE_WEIGHTS: GradeWeights = {
  written_work: 30,
  performance_task: 50,
  quarterly_assessment: 20,
};

// DepEd preset defaults
export const DEPED_SHS_CORE_WEIGHTS: GradeWeights = { written_work: 25, performance_task: 50, quarterly_assessment: 25 };
export const DEPED_JHS_WEIGHTS: GradeWeights = { written_work: 30, performance_task: 50, quarterly_assessment: 20 };
export const DEPED_COLLEGE_WEIGHTS: GradeWeights = { written_work: 30, performance_task: 40, quarterly_assessment: 30 };

export const GRADE_CATEGORIES: { value: GradeCategory; label: string; icon: string; description: string }[] = [
  { value: 'written_work', label: 'Written Works', icon: '✍️', description: 'Quizzes, homework, long tests, seatwork' },
  { value: 'performance_task', label: 'Performance Tasks', icon: '🎯', description: 'Projects, lab work, presentations, outputs' },
  { value: 'quarterly_assessment', label: 'Quarterly Assessment', icon: '📋', description: 'Exams, unit tests, quarterly assessments' },
];

export interface Subject {
  subjectId: string;
  subjectName: string;
  color: string;
  icon: string;
  semester: string;
  teacherName: string;
  targetGrade: number;
  weight: number; // credit units / subject weight (default 3)
  gradeWeights: GradeWeights; // 3-component grade weights (must sum to 100)
  /** @deprecated use gradeWeights instead */
  typeWeights?: Partial<Record<AssignmentType, number>>;
  createdAt: number;
  userId: string;
}

export type AssignmentType = 'quiz' | 'homework' | 'project' | 'exam' | 'activity' | 'lab' | 'presentation';
export type AssignmentStatus = 'pending' | 'in-progress' | 'submitted' | 'graded' | 'overdue';
export type Priority = 'low' | 'medium' | 'high';

export interface Assignment {
  assignmentId: string;
  title: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  type: AssignmentType;
  gradeCategory: GradeCategory; // which of the 3 components this belongs to
  dueDate: string;
  dueTime: string;
  status: AssignmentStatus;
  scoreEarned?: number;
  totalScore?: number;
  notes: string;
  priority: Priority;
  estimatedTime: number;
  attachments: Attachment[];
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export interface Attachment {
  uploadId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  publicId: string;
  createdAt: number;
}

export interface Upload {
  uploadId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  publicId: string;
  assignmentId?: string;
  createdAt: number;
  userId: string;
}

export interface Reminder {
  reminderId: string;
  assignmentId: string;
  assignmentTitle: string;
  dueDate: string;
  reminderTime: number;
  sent: boolean;
  userId: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'pending' | 'failed';

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'subjects' | 'assignments' | 'uploads';
  data: any;
  timestamp: number;
}

export interface GradeStats {
  subjectId: string;
  subjectName: string;
  color: string;
  average: number;
  assignments: number;
  graded: number;
}

// ---- PRESETS ----
export interface SubjectPresetEntry {
  subjectName: string;
  icon: string;
  color: string;
  weight: number;
  targetGrade: number;
  gradeWeights?: GradeWeights;
}

export interface GradePreset {
  presetId: string;
  name: string;
  description: string;
  schoolType: string; // 'college' | 'shs' | 'jhs' | 'custom'
  subjects: SubjectPresetEntry[];
  createdAt: number;
  userId: string;
  shareCode: string; // base64 encoded for sharing
}

// ---- COMMUNITY HELP BOARD ----
export interface HelpPost {
  postId: string;
  title: string;
  body: string;
  schoolTag: string;
  subjectTag: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  replyCount: number;
  upvotes: number;
  upvotedBy: string[]; // array of userIds
}

export interface HelpReply {
  replyId: string;
  postId: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  upvotes: number;
  upvotedBy: string[];
  isResolved?: boolean;
}

// ---- USER PROFILE ----
export interface UserProfile {
  uid: string;
  displayName: string;
  bio: string;
  school: string;
  course: string;
  yearLevel: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bannerGradient: string;
  avatarBg: string;
  isPublic: boolean;
  shareId: string;
  createdAt: number;
  updatedAt: number;
}

// ---- CONSTANTS ----

export const SUBJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#14b8a6', '#f97316',
];

export const SUBJECT_ICONS = [
  '📚', '🔬', '🧮', '🌍', '🎨', '💻', '📝', '🔭', '🎭', '🏛️',
  '⚗️', '📐', '🎵', '💡', '🌱', '🏆', '📊', '🔐', '🧠', '✏️',
];

// Suggested grade category based on assignment type
export const TYPE_TO_GRADE_CATEGORY: Record<AssignmentType, GradeCategory> = {
  quiz: 'written_work',
  homework: 'written_work',
  activity: 'written_work',
  project: 'performance_task',
  lab: 'performance_task',
  presentation: 'performance_task',
  exam: 'quarterly_assessment',
};

export const ASSIGNMENT_TYPES: { value: AssignmentType; label: string; icon: string }[] = [
  { value: 'quiz', label: 'Quiz', icon: '❓' },
  { value: 'homework', label: 'Homework', icon: '📝' },
  { value: 'project', label: 'Project', icon: '🏗️' },
  { value: 'exam', label: 'Exam', icon: '📋' },
  { value: 'activity', label: 'Activity', icon: '✏️' },
  { value: 'lab', label: 'Lab', icon: '🔬' },
  { value: 'presentation', label: 'Presentation', icon: '🎤' },
];

export const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', dot: 'bg-green-500' },
};

export const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-white/10' },
  'in-progress': { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  submitted: { label: 'Submitted', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  graded: { label: 'Graded', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
  overdue: { label: 'Overdue', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
};

export const SCHOOL_TYPES = [
  { value: 'college', label: '🎓 College / University' },
  { value: 'shs', label: '📘 Senior High School (SHS)' },
  { value: 'jhs', label: '📗 Junior High School (JHS)' },
  { value: 'custom', label: '✏️ Custom' },
];

// Schools - manually curated list for PH
export const PHILIPPINE_SCHOOLS: string[] = [
  // ── NCR / Metro Manila ──────────────────────────────────────────────
  'University of the Philippines Diliman (UPD)',
  'University of the Philippines Manila (UPM)',
  'Ateneo de Manila University (ADMU)',
  'De La Salle University (DLSU)',
  'De La Salle - College of Saint Benilde',
  'University of Santo Tomas (UST)',
  'Far Eastern University (FEU)',
  'FEU Institute of Technology (FEU Tech)',
  'FEU - Diliman',
  'Polytechnic University of the Philippines (PUP)',
  'Mapua University',
  'Pamantasan ng Lungsod ng Maynila (PLM)',
  'University of the East - Manila (UE Manila)',
  'University of the East - Caloocan (UE Caloocan)',
  'National University - Manila (NU Manila)',
  'National University - Fairview (NU Fairview)',
  'San Beda University - Manila',
  'San Beda University - Alabang',
  'Miriam College',
  'Adamson University',
  'Lyceum of the Philippines University - Manila (LPU Manila)',
  'Philippine Normal University (PNU)',
  'Technological University of the Philippines - Manila (TUP Manila)',
  'Arellano University',
  'Centro Escolar University (CEU)',
  'EARIST (Eulogio Amang Rodriguez Institute)',
  'Jose Rizal University (JRU)',
  'Letran College Manila',
  'Manila Central University (MCU)',
  'Manuel L. Quezon University (MLQU)',
  'Our Lady of Fatima University - Valenzuela (OLFU)',
  'Our Lady of Fatima University - Antipolo',
  'Our Lady of Fatima University - Pampanga',
  'Philippine School of Business Administration (PSBA)',
  'Rizal Technological University (RTU)',
  'San Sebastian College - Recoletos Manila (SSC-R)',
  'St. Scholasticas College Manila',
  'The Philippine Womens University (PWU)',
  'Trinity University of Asia (TUA)',
  'University of Perpetual Help System DALTA - Las Pinas (UPHSD)',
  'University of Perpetual Help System DALTA - Molino',
  'Philippine College of Criminology (PCCr)',
  'Taguig City University (TCU)',
  'Quezon City University (QCU)',
  'University of Makati (UMak)',
  'Emilio Aguinaldo College (EAC)',
  'Southville International School and Colleges',
  'Philippine Christian University (PCU)',
  'Philippine Maritime Institute (PMI)',
  'Pamantasan ng Lungsod ng Pasig (PLP)',
  'Pamantasan ng Lungsod ng Marikina (PLMar)',
  'Pamantasan ng Lungsod ng Muntinlupa (PLMun)',
  'Asia Pacific College (APC)',
  'International School Manila (ISM)',

  // ── Region I - Ilocos Region ─────────────────────────────────────────
  'Mariano Marcos State University (MMSU)',
  'University of Northern Philippines (UNP)',
  'Ilocos Sur Polytechnic State College (ISPSC)',
  'Don Mariano Marcos Memorial State University (DMMMSU)',
  'Northwestern University - Laoag',
  'Saint Williams College - Laoag',
  'Pangasinan State University (PSU)',
  'University of Pangasinan (UPang)',
  'Virgen Milagrosa University Foundation (VMUF)',
  'University of Luzon (UL)',
  'Lyceum Northwestern University',
  'Saint Louis College - San Fernando La Union',
  'Ilocos Norte College of Arts and Trades (INCAT)',
  'Philippine Merchant Marine Academy (PMMA)',

  // ── CAR - Cordillera Administrative Region ───────────────────────────
  'University of the Philippines Baguio (UPB)',
  'Saint Louis University (SLU)',
  'University of Baguio (UB)',
  'Benguet State University (BSU)',
  'University of the Cordilleras (UC)',
  'Baguio Central University (BCU)',
  'Mountain Province State Polytechnic College (MPSPC)',
  'Apayao State College (ASC)',
  'Ifugao State University (IFSU)',
  'Kalinga State University (KSU)',
  'Abra State Institute of Sciences and Technology (ASIST)',

  // ── Region II - Cagayan Valley ───────────────────────────────────────
  'Cagayan State University (CSU)',
  'Isabela State University (ISU)',
  'Nueva Vizcaya State University (NVSU)',
  'Saint Paul University Philippines (SPUP)',
  'University of Saint Louis - Tuguegarao (USL)',
  'Quirino State University (QSU)',
  'Batanes State College (BSC)',
  'Cagayan Valley Computer and Information Technology College (CVICIT)',
  'Northeastern College - Santiago City',

  // ── Region III - Central Luzon ───────────────────────────────────────
  'Holy Angel University (HAU)',
  'Angeles University Foundation (AUF)',
  'Pampanga State Agricultural University (PSAU)',
  'Don Honorio Ventura State University (DHVSU)',
  'Bulacan State University (BulSU)',
  'Central Luzon State University (CLSU)',
  'Nueva Ecija University of Science and Technology (NEUST)',
  'Ramon Magsaysay Technological University (RMTU)',
  'Tarlac State University (TSU)',
  'Tarlac Agricultural University (TAU)',
  'Wesleyan University Philippines (WUP)',
  'Columban College - Olongapo',
  'Gordon College - Olongapo',
  'University of the Philippines - Clark',
  'Bataan Peninsula State University (BPSU)',
  'Bataan Heroes Memorial College (BHMC)',
  'La Consolacion College - Bacolor',
  'Guagua National Colleges',
  'Systems Plus College Foundation',
  'STI College - Pampanga',
  'AMA Computer University - Malolos',
  'San Fernando College',
  'Southwestern University - Olongapo',
  'Union Christian College - San Fernando',

  // ── Region IV-A - CALABARZON ─────────────────────────────────────────
  'University of the Philippines Los Banos (UPLB)',
  'De La Salle University - Dasmarinas (DLSU-D)',
  'De La Salle Lipa',
  'Batangas State University (BatStateU)',
  'University of Batangas (UB)',
  'Lyceum of the Philippines University - Batangas (LPU Batangas)',
  'Lyceum of the Philippines University - Cavite (LPU Cavite)',
  'Laguna State Polytechnic University (LSPU)',
  'Cavite State University (CvSU)',
  'University of Perpetual Help System GMA - Cavite',
  'University of Perpetual Help System Binan',
  'Southern Luzon State University (SLSU)',
  'Pamantasan ng Lungsod ng Lucena (PLL)',
  'Manuel S. Enverga University Foundation (MSEUF)',
  'University of Rizal System (URS)',
  'Colegio de San Juan de Letran - Calamba',
  'San Pablo Colleges',
  'Laguna College',
  'Holy Cross College - Pampanga',
  'AMA Education System - Cavite',
  'Asia Pacific College - Laguna',
  'STI College - Calamba',
  'STI College - Bacoor',
  'Saint Michaels College of Laguna (SMCL)',
  'Olivarez College',
  'Informatics College - Cavite',
  'Pamantasan ng Cabuyao',
  'Pamantasan ng Lungsod ng San Pablo',

  // ── Region IV-B - MIMAROPA ───────────────────────────────────────────
  'Occidental Mindoro State College (OMSC)',
  'Oriental Mindoro State College (OMSC-Oriental)',
  'Marinduque State University (MarSU)',
  'Romblon State University (RSU)',
  'Palawan State University (PSU)',
  'Western Philippines University (WPU)',
  'Southern Luzon State University - Quezon',

  // ── Region V - Bicol Region ──────────────────────────────────────────
  'Bicol University (BU)',
  'Ateneo de Naga University',
  'University of Nueva Caceres (UNC)',
  'Camarines Sur Polytechnic Colleges (CSPC)',
  'Partido State University (PSU-Bicol)',
  'Aquinas University of Legazpi',
  'Catanduanes State University (CatSU)',
  'Sorsogon State University (SorSU)',
  'University of Sorsogon City',
  'Bicol College',
  'St. Louise de Marillac College of Sorsogon',
  'Camarines Norte State College (CNSC)',
  'Masbate College',

  // ── Region VI - Western Visayas ──────────────────────────────────────
  'University of the Philippines Visayas (UPV)',
  'West Visayas State University (WVSU)',
  'Central Philippine University (CPU)',
  'Iloilo Science and Technology University (ISAT U)',
  'University of Iloilo - PHINMA',
  'Ateneo de Iloilo',
  'St. Paul University Iloilo (SPUI)',
  'John B. Lacson Foundation Maritime University',
  'University of St. La Salle (USLS) - Bacolod',
  'Carlos Hilado Memorial State University (CHMSU)',
  'Colegio de San Agustin - Bacolod',
  'University of Negros Occidental - Recoletos (UNO-R)',
  'Capiz State University (CapSU)',
  'Aklan State University (ASU)',
  'Western Visayas College of Science and Technology (WVCST)',
  'Guimaras State University (GSU)',
  'Northern Iloilo Polytechnic State College (NIPSC)',
  'STI College - Iloilo',

  // ── Region VII - Central Visayas ─────────────────────────────────────
  'University of San Carlos (USC)',
  'Cebu Normal University (CNU)',
  'Cebu Institute of Technology - University (CIT-U)',
  'University of San Jose-Recoletos (USJ-R)',
  'Southwestern University PHINMA (SWU)',
  'University of Cebu (UC)',
  'University of Cebu - Lapu-Lapu and Mandaue (UCLM)',
  'Cebu Technological University (CTU)',
  'University of the Visayas (UV)',
  'University of the Philippines Cebu',
  'Silliman University',
  'Foundation University - Dumaguete',
  'St. Paul University Dumaguete (SPUD)',
  'Negros Oriental State University (NORSU)',
  'Bohol Island State University (BISU)',
  'Holy Name University (HNU)',
  'University of Bohol',
  'AMA Education System - Cebu',

  // ── Region VIII - Eastern Visayas ────────────────────────────────────
  'University of the Philippines Visayas Tacloban College',
  'Leyte Normal University (LNU)',
  'Visayas State University (VSU)',
  'Eastern Samar State University (ESSU)',
  'Samar State University (SSU)',
  'Northwest Samar State University (NwSSU)',
  'University of Eastern Philippines (UEP)',
  'Naval State University (NSU)',
  'Eastern Visayas State University (EVSU)',
  'Holy Infant College - Tacloban',
  'St. Scholasticas College - Tacloban',

  // ── Region IX - Zamboanga Peninsula ─────────────────────────────────
  'Western Mindanao State University (WMSU)',
  'Zamboanga State College of Marine Sciences and Technology (ZSCMST)',
  'Jose Rizal Memorial State University (JRMSU)',
  'Ateneo de Zamboanga University (AdZU)',
  'Mindanao State University - Tawi-Tawi College of Technology and Oceanography',
  'Basilan State College (BStC)',

  // ── Region X - Northern Mindanao ────────────────────────────────────
  'Xavier University - Ateneo de Cagayan (XU)',
  'Liceo de Cagayan University',
  'Bukidnon State University (BukSU)',
  'Central Mindanao University (CMU)',
  'Mindanao State University - Iligan Institute of Technology (MSU-IIT)',
  'Capitol University (CU)',
  'Misamis University (MU)',
  'Misamis Oriental State University (MOSU)',
  'Camiguin Polytechnic State College (CPSC)',
  'Mindanao Polytechnic State College (MinPoly)',
  'Mindanao University of Science and Technology (MUST)',
  'Lourdes College - Cagayan de Oro',
  'Corpus Christi College - Cagayan de Oro',

  // ── Region XI - Davao Region ─────────────────────────────────────────
  'University of the Philippines Mindanao (UP Mindanao)',
  'Ateneo de Davao University (AdDU)',
  'University of Mindanao (UM)',
  'University of Southeastern Philippines (USeP)',
  'Davao Medical School Foundation (DMSF)',
  'San Pedro College (SPC) - Davao',
  'Holy Cross of Davao College (HCDC)',
  'Davao del Norte State College (DNSC)',
  'Davao Oriental State University (DOrSU)',
  'Southern Philippines Agri-Business and Marine Aquatic School of Technology (SPAMAST)',
  'Compostela Valley State College (CVSC)',
  'St. Marys College - Tagum',
  'Cor Jesu College (CJC)',

  // ── Region XII - SOCCSKSARGEN ─────────────────────────────────────────
  'University of Southern Mindanao (USM)',
  'Notre Dame University (NDU) - Cotabato City',
  'Notre Dame College of Marbel (NDCM)',
  'Notre Dame of Midsayap College (NDMC)',
  'Mindanao State University - General Santos (MSU-GSC)',
  'Mindanao State University - Maguindanao',
  'Cotabato City State Polytechnic College (CCSPC)',
  'Sultan Kudarat State University (SKSU)',
  'South Cotabato State College (SCSC)',

  // ── Region XIII - CARAGA ─────────────────────────────────────────────
  'Caraga State University (CSU)',
  'Surigao State College of Technology (SSCT)',
  'Agusan del Sur State College of Agriculture and Technology (ASSCAT)',
  'Surigao del Sur State University (SDSSU)',
  'Northeastern Mindanao State University (NEMSU)',
  'St. Joseph Institute of Technology - Butuan',
  'Father Saturnino Urios University (FSUU)',
  'Agusan del Norte Technical College',

  // ── BARMM - Bangsamoro ───────────────────────────────────────────────
  'Mindanao State University - Main Campus (MSU Marawi)',
  'Cotabato Foundation College of Science and Technology (CFCST)',
  'Kakar College of Jolo',

  'Other / Not Listed',
];
export const PRESET_TEMPLATES: Omit<GradePreset, 'presetId' | 'userId' | 'createdAt' | 'shareCode'>[] = [
  {
    name: 'BS Computer Science (Year 1)',
    description: 'Typical 1st year CS curriculum in PH universities',
    schoolType: 'college',
    subjects: [
      { subjectName: 'Programming 1', icon: '💻', color: '#6366f1', weight: 3, targetGrade: 85, gradeWeights: DEPED_COLLEGE_WEIGHTS },
      { subjectName: 'Discrete Mathematics', icon: '🧮', color: '#8b5cf6', weight: 3, targetGrade: 80, gradeWeights: DEPED_COLLEGE_WEIGHTS },
      { subjectName: 'Computer Organization', icon: '🔐', color: '#3b82f6', weight: 3, targetGrade: 80, gradeWeights: DEPED_COLLEGE_WEIGHTS },
      { subjectName: 'Komunikasyon sa Filipino', icon: '📝', color: '#10b981', weight: 3, targetGrade: 85, gradeWeights: DEPED_COLLEGE_WEIGHTS },
      { subjectName: 'Purposive Communication', icon: '🎭', color: '#f59e0b', weight: 3, targetGrade: 85, gradeWeights: DEPED_COLLEGE_WEIGHTS },
      { subjectName: 'NSTP', icon: '🏆', color: '#06b6d4', weight: 3, targetGrade: 90, gradeWeights: DEPED_COLLEGE_WEIGHTS },
    ],
  },
  {
    name: 'SHS - STEM (Grade 11)',
    description: 'Standard STEM strand subjects',
    schoolType: 'shs',
    subjects: [
      { subjectName: 'Pre-Calculus', icon: '🧮', color: '#6366f1', weight: 4, targetGrade: 85, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'Earth Science', icon: '🌍', color: '#10b981', weight: 4, targetGrade: 85, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'General Biology 1', icon: '🔬', color: '#ec4899', weight: 4, targetGrade: 85, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'General Physics 1', icon: '🔭', color: '#3b82f6', weight: 4, targetGrade: 80, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'General Chemistry 1', icon: '⚗️', color: '#f59e0b', weight: 4, targetGrade: 80, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'Oral Communication', icon: '🎤', color: '#8b5cf6', weight: 2, targetGrade: 90, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
    ],
  },
  {
    name: 'SHS - ABM (Grade 11)',
    description: 'Accountancy, Business & Management strand',
    schoolType: 'shs',
    subjects: [
      { subjectName: 'Business Math', icon: '🧮', color: '#6366f1', weight: 4, targetGrade: 85, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'Organization & Management', icon: '🏛️', color: '#8b5cf6', weight: 4, targetGrade: 85, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'Business Ethics', icon: '📚', color: '#10b981', weight: 4, targetGrade: 90, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'Fundamentals of ABM', icon: '📊', color: '#f59e0b', weight: 4, targetGrade: 85, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'Oral Communication', icon: '🎤', color: '#ec4899', weight: 2, targetGrade: 90, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
      { subjectName: 'Humanities & Social Sciences', icon: '🌍', color: '#06b6d4', weight: 4, targetGrade: 88, gradeWeights: DEPED_SHS_CORE_WEIGHTS },
    ],
  },
];