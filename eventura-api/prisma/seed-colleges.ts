import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const TOP_COLLEGES = [
  // ─── IITs ────────────────────────────────────────────────────────────────
  { name: 'IIT Bombay', domain: 'iitb.ac.in', city: 'Mumbai', state: 'Maharashtra', type: 'IIT', establishedYear: 1958, totalStudents: 10000 },
  { name: 'IIT Delhi', domain: 'iitd.ac.in', city: 'New Delhi', state: 'Delhi', type: 'IIT', establishedYear: 1961, totalStudents: 8500 },
  { name: 'IIT Madras', domain: 'iitm.ac.in', city: 'Chennai', state: 'Tamil Nadu', type: 'IIT', establishedYear: 1959, totalStudents: 9000 },
  { name: 'IIT Kanpur', domain: 'iitk.ac.in', city: 'Kanpur', state: 'Uttar Pradesh', type: 'IIT', establishedYear: 1959, totalStudents: 8000 },
  { name: 'IIT Kharagpur', domain: 'iitkgp.ac.in', city: 'Kharagpur', state: 'West Bengal', type: 'IIT', establishedYear: 1951, totalStudents: 12000 },
  { name: 'IIT Roorkee', domain: 'iitr.ac.in', city: 'Roorkee', state: 'Uttarakhand', type: 'IIT', establishedYear: 1847, totalStudents: 9500 },
  { name: 'IIT Guwahati', domain: 'iitg.ac.in', city: 'Guwahati', state: 'Assam', type: 'IIT', establishedYear: 1994, totalStudents: 5500 },
  { name: 'IIT Hyderabad', domain: 'iith.ac.in', city: 'Hyderabad', state: 'Telangana', type: 'IIT', establishedYear: 2008, totalStudents: 3500 },
  { name: 'IIT Bhubaneswar', domain: 'iitbbs.ac.in', city: 'Bhubaneswar', state: 'Odisha', type: 'IIT', establishedYear: 2008, totalStudents: 2500 },
  { name: 'IIT Gandhinagar', domain: 'iitgn.ac.in', city: 'Gandhinagar', state: 'Gujarat', type: 'IIT', establishedYear: 2008, totalStudents: 2000 },
  { name: 'IIT Jodhpur', domain: 'iitj.ac.in', city: 'Jodhpur', state: 'Rajasthan', type: 'IIT', establishedYear: 2008, totalStudents: 2000 },
  { name: 'IIT Mandi', domain: 'iitmandi.ac.in', city: 'Mandi', state: 'Himachal Pradesh', type: 'IIT', establishedYear: 2009, totalStudents: 1800 },
  { name: 'IIT Patna', domain: 'iitp.ac.in', city: 'Patna', state: 'Bihar', type: 'IIT', establishedYear: 2008, totalStudents: 2000 },
  { name: 'IIT Ropar', domain: 'iitrpr.ac.in', city: 'Rupnagar', state: 'Punjab', type: 'IIT', establishedYear: 2008, totalStudents: 1800 },
  { name: 'IIT Indore', domain: 'iiti.ac.in', city: 'Indore', state: 'Madhya Pradesh', type: 'IIT', establishedYear: 2009, totalStudents: 2200 },
  { name: 'IIT Varanasi (BHU)', domain: 'iitbhu.ac.in', city: 'Varanasi', state: 'Uttar Pradesh', type: 'IIT', establishedYear: 1919, totalStudents: 6000 },
  { name: 'IIT Tirupati', domain: 'iittp.ac.in', city: 'Tirupati', state: 'Andhra Pradesh', type: 'IIT', establishedYear: 2015, totalStudents: 1200 },
  { name: 'IIT Palakkad', domain: 'iitpkd.ac.in', city: 'Palakkad', state: 'Kerala', type: 'IIT', establishedYear: 2015, totalStudents: 1000 },
  { name: 'IIT Dharwad', domain: 'iitdh.ac.in', city: 'Dharwad', state: 'Karnataka', type: 'IIT', establishedYear: 2016, totalStudents: 900 },
  { name: 'IIT Bhilai', domain: 'iitbhilai.ac.in', city: 'Bhilai', state: 'Chhattisgarh', type: 'IIT', establishedYear: 2016, totalStudents: 900 },
  { name: 'IIT Jammu', domain: 'iitjammu.ac.in', city: 'Jammu', state: 'Jammu & Kashmir', type: 'IIT', establishedYear: 2016, totalStudents: 900 },
  { name: 'IIT Goa', domain: 'iitgoa.ac.in', city: 'Goa', state: 'Goa', type: 'IIT', establishedYear: 2016, totalStudents: 800 },
  { name: 'IIT Chhattisgarh', domain: 'iitnr.ac.in', city: 'Raipur', state: 'Chhattisgarh', type: 'IIT', establishedYear: 2019, totalStudents: 600 },

  // ─── NITs ────────────────────────────────────────────────────────────────
  { name: 'NIT Trichy', domain: 'nitt.edu', city: 'Tiruchirappalli', state: 'Tamil Nadu', type: 'NIT', establishedYear: 1964, totalStudents: 6000 },
  { name: 'NIT Warangal', domain: 'nitw.ac.in', city: 'Warangal', state: 'Telangana', type: 'NIT', establishedYear: 1959, totalStudents: 6500 },
  { name: 'NIT Surathkal', domain: 'nitk.ac.in', city: 'Surathkal', state: 'Karnataka', type: 'NIT', establishedYear: 1960, totalStudents: 5500 },
  { name: 'NIT Calicut', domain: 'nitc.ac.in', city: 'Kozhikode', state: 'Kerala', type: 'NIT', establishedYear: 1961, totalStudents: 5000 },
  { name: 'NIT Rourkela', domain: 'nitrkl.ac.in', city: 'Rourkela', state: 'Odisha', type: 'NIT', establishedYear: 1961, totalStudents: 5500 },
  { name: 'MNIT Jaipur', domain: 'mnit.ac.in', city: 'Jaipur', state: 'Rajasthan', type: 'NIT', establishedYear: 1963, totalStudents: 5000 },
  { name: 'NIT Allahabad', domain: 'mnnit.ac.in', city: 'Allahabad', state: 'Uttar Pradesh', type: 'NIT', establishedYear: 1961, totalStudents: 5000 },
  { name: 'VNIT Nagpur', domain: 'vnit.ac.in', city: 'Nagpur', state: 'Maharashtra', type: 'NIT', establishedYear: 1960, totalStudents: 5500 },
  { name: 'NIT Durgapur', domain: 'nitdgp.ac.in', city: 'Durgapur', state: 'West Bengal', type: 'NIT', establishedYear: 1960, totalStudents: 4500 },
  { name: 'NIT Kurukshetra', domain: 'nitkkr.ac.in', city: 'Kurukshetra', state: 'Haryana', type: 'NIT', establishedYear: 1963, totalStudents: 4500 },
  { name: 'NIT Patna', domain: 'nitp.ac.in', city: 'Patna', state: 'Bihar', type: 'NIT', establishedYear: 1886, totalStudents: 3500 },
  { name: 'NIT Bhopal', domain: 'manit.ac.in', city: 'Bhopal', state: 'Madhya Pradesh', type: 'NIT', establishedYear: 1960, totalStudents: 4000 },
  { name: 'NIT Surat', domain: 'svnit.ac.in', city: 'Surat', state: 'Gujarat', type: 'NIT', establishedYear: 1961, totalStudents: 4000 },
  { name: 'NIT Silchar', domain: 'nits.ac.in', city: 'Silchar', state: 'Assam', type: 'NIT', establishedYear: 1967, totalStudents: 3500 },
  { name: 'NIT Hamirpur', domain: 'nith.ac.in', city: 'Hamirpur', state: 'Himachal Pradesh', type: 'NIT', establishedYear: 1986, totalStudents: 3000 },
  { name: 'NIT Jalandhar', domain: 'nitj.ac.in', city: 'Jalandhar', state: 'Punjab', type: 'NIT', establishedYear: 1987, totalStudents: 3500 },
  { name: 'NIT Jamshedpur', domain: 'nitjsr.ac.in', city: 'Jamshedpur', state: 'Jharkhand', type: 'NIT', establishedYear: 1960, totalStudents: 4000 },
  { name: 'NIT Raipur', domain: 'nitrr.ac.in', city: 'Raipur', state: 'Chhattisgarh', type: 'NIT', establishedYear: 1956, totalStudents: 3500 },

  // ─── IIITs ───────────────────────────────────────────────────────────────
  { name: 'IIIT Hyderabad', domain: 'iiit.ac.in', city: 'Hyderabad', state: 'Telangana', type: 'IIIT', establishedYear: 1998, totalStudents: 3000 },
  { name: 'IIIT Allahabad', domain: 'iiita.ac.in', city: 'Allahabad', state: 'Uttar Pradesh', type: 'IIIT', establishedYear: 1999, totalStudents: 3500 },
  { name: 'IIIT Bangalore', domain: 'iiitb.ac.in', city: 'Bengaluru', state: 'Karnataka', type: 'IIIT', establishedYear: 1999, totalStudents: 1500 },
  { name: 'IIIT Delhi', domain: 'iiitd.ac.in', city: 'New Delhi', state: 'Delhi', type: 'IIIT', establishedYear: 2008, totalStudents: 1500 },
  { name: 'IIIT Pune', domain: 'iiitp.ac.in', city: 'Pune', state: 'Maharashtra', type: 'IIIT', establishedYear: 2016, totalStudents: 800 },
  { name: 'IIIT Sri City', domain: 'iiits.ac.in', city: 'Chittoor', state: 'Andhra Pradesh', type: 'IIIT', establishedYear: 2013, totalStudents: 1000 },
  { name: 'IIIT Kottayam', domain: 'iiitkottayam.ac.in', city: 'Kottayam', state: 'Kerala', type: 'IIIT', establishedYear: 2015, totalStudents: 700 },
  { name: 'IIIT Gwalior', domain: 'iiitm.ac.in', city: 'Gwalior', state: 'Madhya Pradesh', type: 'IIIT', establishedYear: 1997, totalStudents: 2000 },
  { name: 'IIIT Jabalpur', domain: 'iiitdmj.ac.in', city: 'Jabalpur', state: 'Madhya Pradesh', type: 'IIIT', establishedYear: 2005, totalStudents: 1200 },

  // ─── IIMs ────────────────────────────────────────────────────────────────
  { name: 'IIM Ahmedabad', domain: 'iima.ac.in', city: 'Ahmedabad', state: 'Gujarat', type: 'IIM', establishedYear: 1961, totalStudents: 1200 },
  { name: 'IIM Bangalore', domain: 'iimb.ac.in', city: 'Bengaluru', state: 'Karnataka', type: 'IIM', establishedYear: 1973, totalStudents: 1400 },
  { name: 'IIM Calcutta', domain: 'iimcal.ac.in', city: 'Kolkata', state: 'West Bengal', type: 'IIM', establishedYear: 1961, totalStudents: 1200 },
  { name: 'IIM Lucknow', domain: 'iiml.ac.in', city: 'Lucknow', state: 'Uttar Pradesh', type: 'IIM', establishedYear: 1984, totalStudents: 1100 },
  { name: 'IIM Kozhikode', domain: 'iimk.ac.in', city: 'Kozhikode', state: 'Kerala', type: 'IIM', establishedYear: 1996, totalStudents: 900 },
  { name: 'IIM Indore', domain: 'iimidr.ac.in', city: 'Indore', state: 'Madhya Pradesh', type: 'IIM', establishedYear: 1996, totalStudents: 900 },

  // ─── BITS ────────────────────────────────────────────────────────────────
  { name: 'BITS Pilani', domain: 'pilani.bits-pilani.ac.in', city: 'Pilani', state: 'Rajasthan', type: 'Deemed', establishedYear: 1964, totalStudents: 5000 },
  { name: 'BITS Pilani Goa Campus', domain: 'goa.bits-pilani.ac.in', city: 'Goa', state: 'Goa', type: 'Deemed', establishedYear: 2004, totalStudents: 3500 },
  { name: 'BITS Pilani Hyderabad Campus', domain: 'hyderabad.bits-pilani.ac.in', city: 'Hyderabad', state: 'Telangana', type: 'Deemed', establishedYear: 2008, totalStudents: 4000 },

  // ─── VIT ─────────────────────────────────────────────────────────────────
  { name: 'VIT Vellore', domain: 'vit.ac.in', city: 'Vellore', state: 'Tamil Nadu', type: 'Deemed', establishedYear: 1984, totalStudents: 20000 },
  { name: 'VIT Chennai', domain: 'chennai.vit.ac.in', city: 'Chennai', state: 'Tamil Nadu', type: 'Deemed', establishedYear: 2010, totalStudents: 8000 },
  { name: 'VIT Bhopal', domain: 'vitbhopal.ac.in', city: 'Bhopal', state: 'Madhya Pradesh', type: 'Deemed', establishedYear: 2017, totalStudents: 4000 },
  { name: 'VIT AP', domain: 'vitap.ac.in', city: 'Amaravati', state: 'Andhra Pradesh', type: 'Deemed', establishedYear: 2017, totalStudents: 5000 },

  // ─── SRM ─────────────────────────────────────────────────────────────────
  { name: 'SRM Institute of Science and Technology', domain: 'srmist.edu.in', city: 'Chennai', state: 'Tamil Nadu', type: 'Deemed', establishedYear: 1985, totalStudents: 20000 },
  { name: 'SRM University AP', domain: 'srmap.edu.in', city: 'Amaravati', state: 'Andhra Pradesh', type: 'Deemed', establishedYear: 2017, totalStudents: 5000 },

  // ─── Manipal ─────────────────────────────────────────────────────────────
  { name: 'Manipal Institute of Technology', domain: 'manipal.edu', city: 'Manipal', state: 'Karnataka', type: 'Deemed', establishedYear: 1957, totalStudents: 15000 },
  { name: 'Manipal University Jaipur', domain: 'jaipur.manipal.edu', city: 'Jaipur', state: 'Rajasthan', type: 'Deemed', establishedYear: 2011, totalStudents: 8000 },

  // ─── Top Private & Others ─────────────────────────────────────────────────
  { name: 'Amity University Noida', domain: 'amity.edu', city: 'Noida', state: 'Uttar Pradesh', type: 'Private', establishedYear: 2005, totalStudents: 25000 },
  { name: 'Thapar Institute of Engineering & Technology', domain: 'thapar.edu', city: 'Patiala', state: 'Punjab', type: 'Deemed', establishedYear: 1956, totalStudents: 12000 },
  { name: 'PSG College of Technology', domain: 'psgtech.edu', city: 'Coimbatore', state: 'Tamil Nadu', type: 'Private', establishedYear: 1951, totalStudents: 8000 },
  { name: 'SSN College of Engineering', domain: 'ssn.edu.in', city: 'Chennai', state: 'Tamil Nadu', type: 'Private', establishedYear: 1996, totalStudents: 5000 },
  { name: 'RV College of Engineering', domain: 'rvce.edu.in', city: 'Bengaluru', state: 'Karnataka', type: 'Private', establishedYear: 1963, totalStudents: 6000 },
  { name: 'PES University', domain: 'pes.edu', city: 'Bengaluru', state: 'Karnataka', type: 'Deemed', establishedYear: 2013, totalStudents: 10000 },
  { name: 'Christ University', domain: 'christuniversity.in', city: 'Bengaluru', state: 'Karnataka', type: 'Deemed', establishedYear: 1969, totalStudents: 25000 },
  { name: 'Symbiosis International University', domain: 'siu.edu.in', city: 'Pune', state: 'Maharashtra', type: 'Deemed', establishedYear: 2002, totalStudents: 30000 },
  { name: 'Lovely Professional University', domain: 'lpu.in', city: 'Phagwara', state: 'Punjab', type: 'Private', establishedYear: 2005, totalStudents: 40000 },
  { name: 'Shiv Nadar University', domain: 'snu.edu.in', city: 'Greater Noida', state: 'Uttar Pradesh', type: 'Deemed', establishedYear: 2011, totalStudents: 5000 },
  { name: 'Ashoka University', domain: 'ashoka.edu.in', city: 'Sonipat', state: 'Haryana', type: 'Private', establishedYear: 2014, totalStudents: 3000 },
  { name: 'OP Jindal Global University', domain: 'jgu.edu.in', city: 'Sonipat', state: 'Haryana', type: 'Private', establishedYear: 2009, totalStudents: 8000 },
  { name: 'Kalinga Institute of Industrial Technology', domain: 'kiit.ac.in', city: 'Bhubaneswar', state: 'Odisha', type: 'Deemed', establishedYear: 1992, totalStudents: 25000 },
  { name: 'Presidency University Bengaluru', domain: 'presidencyuniversity.in', city: 'Bengaluru', state: 'Karnataka', type: 'Private', establishedYear: 2013, totalStudents: 8000 },
  { name: 'Woxsen University', domain: 'woxsen.edu.in', city: 'Hyderabad', state: 'Telangana', type: 'Private', establishedYear: 2020, totalStudents: 3000 },
  { name: 'Krea University', domain: 'krea.edu.in', city: 'Sri City', state: 'Andhra Pradesh', type: 'Private', establishedYear: 2018, totalStudents: 1500 },
  { name: 'Plaksha University', domain: 'plaksha.edu.in', city: 'Mohali', state: 'Punjab', type: 'Private', establishedYear: 2021, totalStudents: 500 },
  { name: 'BML Munjal University', domain: 'bmu.edu.in', city: 'Gurgaon', state: 'Haryana', type: 'Private', establishedYear: 2014, totalStudents: 3000 },
  { name: 'Flame University', domain: 'flame.edu.in', city: 'Pune', state: 'Maharashtra', type: 'Private', establishedYear: 2015, totalStudents: 2000 },
  { name: 'Azim Premji University', domain: 'azimpremjiuniversity.edu.in', city: 'Bengaluru', state: 'Karnataka', type: 'Private', establishedYear: 2010, totalStudents: 1000 },
  { name: 'Indian School of Business', domain: 'isb.edu', city: 'Hyderabad', state: 'Telangana', type: 'Private', establishedYear: 2001, totalStudents: 900 },
  { name: 'SP Jain Institute of Management', domain: 'spjain.ac.in', city: 'Mumbai', state: 'Maharashtra', type: 'Private', establishedYear: 1981, totalStudents: 1500 },
  { name: 'XLRI Jamshedpur', domain: 'xlri.ac.in', city: 'Jamshedpur', state: 'Jharkhand', type: 'Private', establishedYear: 1949, totalStudents: 1200 },
  { name: 'FMS Delhi', domain: 'fms.edu', city: 'New Delhi', state: 'Delhi', type: 'Government', establishedYear: 1954, totalStudents: 500 },
  { name: 'TISS Mumbai', domain: 'tiss.edu', city: 'Mumbai', state: 'Maharashtra', type: 'Deemed', establishedYear: 1936, totalStudents: 3000 },
  { name: 'Delhi Technological University', domain: 'dtu.ac.in', city: 'New Delhi', state: 'Delhi', type: 'Government', establishedYear: 1941, totalStudents: 10000 },
  { name: 'Netaji Subhas University of Technology', domain: 'nsut.ac.in', city: 'New Delhi', state: 'Delhi', type: 'Government', establishedYear: 1983, totalStudents: 5000 },
  { name: 'Jadavpur University', domain: 'jadavpuruniversity.in', city: 'Kolkata', state: 'West Bengal', type: 'Government', establishedYear: 1955, totalStudents: 15000 },
  { name: 'Anna University', domain: 'annauniv.edu', city: 'Chennai', state: 'Tamil Nadu', type: 'Government', establishedYear: 1978, totalStudents: 50000 },
  { name: 'Osmania University', domain: 'osmania.ac.in', city: 'Hyderabad', state: 'Telangana', type: 'Government', establishedYear: 1918, totalStudents: 30000 },
  { name: 'Pune University (SPPU)', domain: 'unipune.ac.in', city: 'Pune', state: 'Maharashtra', type: 'Government', establishedYear: 1948, totalStudents: 700000 },
  { name: 'Mumbai University', domain: 'mu.ac.in', city: 'Mumbai', state: 'Maharashtra', type: 'Government', establishedYear: 1857, totalStudents: 800000 },
  { name: 'Delhi University', domain: 'du.ac.in', city: 'New Delhi', state: 'Delhi', type: 'Government', establishedYear: 1922, totalStudents: 400000 },
  { name: 'Bangalore University', domain: 'bangaloreuniversity.ac.in', city: 'Bengaluru', state: 'Karnataka', type: 'Government', establishedYear: 1964, totalStudents: 300000 },
  { name: 'Hyderabad University', domain: 'uohyd.ac.in', city: 'Hyderabad', state: 'Telangana', type: 'Government', establishedYear: 1974, totalStudents: 5000 },
];

async function seedColleges() {
  console.log(`\n🏫 Seeding ${TOP_COLLEGES.length} top Indian colleges...\n`);

  let created = 0;
  let skipped = 0;
  let updated = 0;

  for (const college of TOP_COLLEGES) {
    const slug = generateSlug(college.name);

    try {
      // Check if already exists by domain
      const existing = await prisma.college.findFirst({
        where: {
          OR: [
            { domain: college.domain },
            { slug },
          ]
        }
      });

      if (existing) {
        // Update with new fields
        await prisma.college.update({
          where: { id: existing.id },
          data: {
            city: college.city,
            state: college.state,
            type: college.type,
            slug: existing.slug || slug,
            establishedYear: college.establishedYear,
            totalStudents: college.totalStudents,
            isSeeded: true,
          }
        });
        updated++;
        console.log(`  🔄 Updated: ${college.name} (${college.type}, ${college.city})`);
      } else {
        // Create new seeded college — auto-approved
        await prisma.college.create({
          data: {
            name: college.name,
            domain: college.domain,
            city: college.city,
            state: college.state,
            type: college.type,
            slug,
            establishedYear: college.establishedYear,
            totalStudents: college.totalStudents,
            isSeeded: true,
            approvalStatus: 'APPROVED',
            approvedAt: new Date(),
          }
        });
        created++;
        console.log(`  ✅ Created: ${college.name} (${college.type}, ${college.city})`);
      }
    } catch (err: any) {
      console.error(`  ❌ Failed: ${college.name} — ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total:   ${TOP_COLLEGES.length}\n`);

  await prisma.$disconnect();
}

seedColleges().catch(console.error);
