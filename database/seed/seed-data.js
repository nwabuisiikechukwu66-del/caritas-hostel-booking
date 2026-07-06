// All the "facts about the university" live here, separate from the script
// logic that inserts them. Change floor counts, add a department, or rename
// a hostel by editing this file only.

export const FACULTIES = {
  "Engineering": [
    ["Computer Engineering", "CPE"],
    ["Mechanical Engineering", "MEE"],
    ["Electrical/Electronic Engineering", "EEE"],
    ["Chemical Engineering", "CHE"],
  ],
  "Natural Sciences": [
    ["Computer Science", "CSC"],
    ["Microbiology", "MCB"],
    ["Biochemistry", "BCH"],
    ["Industrial Chemistry", "ICH"],
  ],
  "Management and Social Sciences": [
    ["Mass Communication", "MAC"],
    ["Sociology", "SOC"],
    ["Business Administration", "BAM"],
    ["Public Administration", "PAD"],
    ["Accounting", "ACC"],
    ["Economics", "ECO"],
    ["Banking and Finance", "BFN"],
    ["Marketing", "MKT"],
    ["Industrial Relations and Personnel Management", "IRM"],
    ["Psychology", "PSY"],
  ],
  "Environmental Sciences": [
    ["Architecture", "ARC"],
    ["Urban and Regional Planning", "URP"],
    ["Estate Management", "ESM"],
  ],
  "Health Sciences": [
    ["Nursing", "NSC"],
    ["Radiography", "RAD"],
    ["Medical Laboratory Science", "MLS"],
  ],
};

// roomsPerFloor rooms per floor, capacity 4 beds per room.
// facing alternates front/back by room_number parity (odd = front, even = back).
export const HOSTELS = [
  { name: "Saint Thomas Aquinas Hostel", shortCode: "AQ", gender: "male", floors: ["A", "B", "C", "D"], roomsPerFloor: 30 },
  { name: "Saint John Vianney Hostel", shortCode: "JV", gender: "male", floors: ["A", "B"], roomsPerFloor: 30 },
  { name: "New Hostel (Boys)", shortCode: "NHB", gender: "male", floors: ["A"], roomsPerFloor: 30 },
  { name: "Emmanuel Hostel", shortCode: "EMM", gender: "female", floors: ["A"], roomsPerFloor: 30 },
  { name: "London Hostel", shortCode: "LDN", gender: "female", floors: ["A"], roomsPerFloor: 30 },
  { name: "Saint Mary's Hostel", shortCode: "STM", gender: "female", floors: ["A"], roomsPerFloor: 30 },
  { name: "New Hostel (Girls)", shortCode: "NHG", gender: "female", floors: ["A"], roomsPerFloor: 30 },
];

export const SESSION = "2025/2026";

const MALE_FIRST = ["Chidi", "Emeka", "Tobenna", "Kelechi", "Ifeanyi", "Uche", "Chukwuemeka", "Obinna", "Chinedu", "Ikenna", "Somtochukwu", "Nnamdi", "Ekene", "Chibuike", "Arinze", "Chukwudi", "Kosisochukwu", "Chimezie", "Ugochukwu", "Obiora"];
const FEMALE_FIRST = ["Ngozi", "Chiamaka", "Adaeze", "Ifeoma", "Chinwe", "Amarachi", "Onyinye", "Nkechi", "Chidinma", "Ugonna", "Adaobi", "Chioma", "Ezinne", "Uzoamaka", "Chisom", "Nwakaego", "Kosisochi", "Ijeoma", "Ogechi", "Chinelo"];
const SURNAMES = ["Uzodinma", "Okafor", "Eze", "Nwachukwu", "Okonkwo", "Obi", "Nnadi", "Chukwu", "Anyanwu", "Ibe", "Okeke", "Anigbogu", "Ejiofor", "Nwosu", "Madu", "Onwuka", "Ozor", "Ikechukwu", "Agu", "Ude"];

export function randomName(gender) {
  const first = gender === "male"
    ? MALE_FIRST[Math.floor(Math.random() * MALE_FIRST.length)]
    : FEMALE_FIRST[Math.floor(Math.random() * FEMALE_FIRST.length)];
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  return `${surname} ${first}`;
}
