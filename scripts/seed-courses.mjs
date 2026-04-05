
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { courses } from '../src/db/schema.js';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const staticCourses = [
  { title: 'বেসিক রুকইয়াহ ফ্রি কোর্স', instructor: 'মাওলানা আব্দুল্লাহ', students: 156, classCount: '৬ টি ক্লাস', hours: '৮ সপ্তাহ', level: 'শুরুর স্তর', price: null, rating: 4.8, desc: 'সম্পূর্ণ রুকইয়াহ শেখার জন্য বিস্তারিত কোর্স', image: '/images/courses/course_ruqyah_practitioner.webp' },
  { title: 'হিজামা ফ্রি কোর্স', instructor: 'ডা. ফাতিমা রহমান', students: 203, classCount: '৩ টি ক্লাস', hours: '৬ সপ্তাহ', level: 'মধ্যম স্তর', price: null, rating: 4.9, desc: 'কুরআন এবং সুন্নাহ ভিত্তিক হিলিং পদ্ধতি', image: '/images/courses/course_islamic_healing.webp' },
  { title: 'আকুপাংচার ফ্রি কোর্স', instructor: 'শায়েখ মুহাম্মাদ', students: 89, classCount: '৪ টি ক্লাস', hours: '৮ সপ্তাহ', level: 'শুরুর স্তর', price: null, rating: 4.7, desc: 'সুরক্ষার পদ্ধতি এবং প্রতিরোধ ব্যবস্থা', image: '/images/courses/course_jinn_protection.webp' },
  { title: 'গ্লোবাল মাস্টার হিলার কোর্স', instructor: 'মাওলানা আব্দুল্লাহ', students: 312, classCount: '৮০ টি ক্লাস', hours: '১২ সপ্তাহ', level: 'উন্নত স্তর', price: 4500, rating: 5.0, desc: 'কুরআনের আয়াত দিয়ে সম্পূর্ণ চিকিৎসা পদ্ধতি', image: '/images/courses/course_quranic_masterclass.webp' },
  { title: 'হিজামা এডভান্স কোর্স', instructor: 'ডা. ফাতিমা রহমান', students: 178, classCount: '২৫ টি ক্লাস', hours: '৫ সপ্তাহ', level: 'শুরুর স্তর', price: 3000, rating: 4.6, desc: 'পরিবারের সুরক্ষার জন্য সম্পূর্ণ গাইড', image: '/images/courses/course_family_ruqyah.webp' },
  { title: 'আকুপাংচার এডভান্স কোর্স', instructor: 'শায়েখ মুহাম্মাদ', students: 245, classCount: '৪৫ টি ক্লাস', hours: '৭ সপ্তাহ', level: 'মধ্যম স্তর', price: 2500, rating: 4.8, desc: 'নিজেই রুকইয়াহ করার দক্ষতা অর্জন করুন', image: '/images/courses/course_self_ruqyah_certificate.webp' },
];

async function run() {
  console.log('Seeding courses...');
  const data = staticCourses.map(c => ({
    id: crypto.randomUUID(),
    title: c.title,
    instructor: c.instructor,
    students: c.students,
    classCount: c.classCount,
    hours: c.hours,
    level: c.level,
    price: c.price,
    rating: c.rating,
    desc: c.desc,
    image: c.image
  }));

  try {
    await db.insert(courses).values(data);
    console.log('Courses seeded successfully!');
  } catch(e) {
    console.error('Error seeding courses: ', e);
  }
}
run();
