import Layout from '../components/Layout'
import Image from 'next/image'

const photos = [
  {
    src: '/images/graduation.jpg',
    alt: 'Graduation Ceremony',
    title: 'Red Diploma Graduation',
    story:
      'Graduated with a Red Diploma from Mari State Medical University, Yoshkar-Ola, symbolizing outstanding academic excellence and dedication to medicine.',
  },
  {
    src: '/images/teaching.jpg',
    alt: 'Teaching session',
    title: 'Teaching Research Methodology',
    story:
      'Sharing knowledge on research methodology, literature exploration, and clinical implementation has been a highlight of my medical journey.',
  },
  {
    src: '/images/research.jpg',
    alt: 'Research work',
    title: 'Ongoing Research',
    story:
      'Currently working on research projects focused on optimizing healthcare delivery in India and other resource-limited regions.',
  },
  {
    src: '/images/community.jpg',
    alt: 'Community healthcare',
    title: 'Community Healthcare',
    story:
      'Committed to bridging the gap between research and real-world practice, making quality care accessible to every community.',
  },
]

const timeline = [
  {
    year: '2025',
    title: 'Pioneering Healthcare Optimization',
    description:
      'Working on scalable research initiatives to improve clinical efficiency and patient outcomes in resource-constrained areas.',
  },
  {
    year: '2024',
    title: 'Graduated with Red Diploma',
    description:
      'Completed medical studies at Mari State Medical University with highest honors (equivalent to 100% marks).',
  },
  {
    year: '2023',
    title: 'Research Mentor',
    description:
      'Guided peers in applying research evidence to clinical practice, literature review, and study methodology.',
  },
]

export default function About() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
          <Image
            src="/images/profile.jpg"
            alt="Dr. Kumar Sumant"
            width={160}
            height={160}
            className="rounded-full mx-auto mb-6 border-4 border-white shadow-lg"
          />
          <h1 className="text-5xl font-bold mb-3">Dr. Kumar Sumant</h1>
          <p className="text-lg max-w-2xl mx-auto text-slate-200">
            Physician • Educator • Researcher  
            <br />
            Dedicated to evidence-based, equitable healthcare.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </section>

      {/* BIO */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-slate-700 dark:text-slate-300">
        <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
          <p>
            I earned my medical degree from{' '}
            <strong>Mari State Medical University, Yoshkar-Ola</strong>, graduating
            with a <em>Red Diploma</em> — an honor for exceptional academic
            achievement.
          </p>
          <p>
            My passion lies in guiding colleagues to bridge the gap between
            research and clinical care. I specialize in helping peers interpret
            literature, implement research findings, and enhance patient
            outcomes through evidence-based practices.
          </p>
          <p>
            Currently, I am working on research to{' '}
            <strong>optimize healthcare delivery</strong> in resource-limited
            countries like India, developing sustainable solutions for patients
            everywhere.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Milestones
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-slate-300 dark:bg-slate-700 rounded" />
            <ul className="space-y-12">
              {timeline.map((item, idx) => (
                <li
                  key={idx}
                  className={`relative w-full md:w-1/2 ${
                    idx % 2 === 0 ? 'md:pl-12 md:ml-auto' : 'md:pr-12'
                  }`}
                >
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                    <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.year}
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-1">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PHOTO GALLERY */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Journey in Pictures
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.src}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-slate-100 dark:bg-slate-800"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={700}
                height={450}
                className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="text-lg font-semibold">{photo.title}</h3>
                <p className="text-sm leading-snug mt-1">{photo.story}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}
