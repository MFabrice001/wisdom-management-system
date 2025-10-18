'use client';

import { useLanguage } from '@/context/LanguageContext';
import { BookOpen, Users, Target, Heart, Award, Globe } from 'lucide-react';
import styles from './page.module.css';

export default function AboutPage() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'About Umurage Wubwenge',
      subtitle: 'Preserving African Wisdom for Future Generations',
      mission: {
        badge: 'Our Mission',
        title: 'Bridging Generations Through Wisdom',
        description: 'Umurage Wubwenge is dedicated to preserving and sharing traditional African knowledge and wisdom. We connect elders with younger generations, ensuring that invaluable cultural heritage is not lost to time.'
      },
      vision: {
        badge: 'Our Vision',
        title: 'A World Connected by Cultural Heritage',
        description: 'We envision a future where traditional wisdom is accessible to everyone, where cultural knowledge flows freely across generations, and where communities remain connected to their roots while embracing the future.'
      },
      values: {
        badge: 'Our Values',
        title: 'What We Stand For',
        items: [
          {
            icon: Heart,
            title: 'Cultural Preservation',
            description: 'Protecting and honoring traditional knowledge for future generations'
          },
          {
            icon: Users,
            title: 'Community First',
            description: 'Building strong connections between elders and youth'
          },
          {
            icon: Globe,
            title: 'Accessibility',
            description: 'Making wisdom available to everyone, everywhere'
          },
          {
            icon: Award,
            title: 'Elder Recognition',
            description: 'Honoring and celebrating our knowledge keepers'
          }
        ]
      },
      story: {
        badge: 'Our Story',
        title: 'How It All Started',
        content: 'Umurage Wubwenge was born from a simple observation: traditional African wisdom was being lost as elders passed away without sharing their knowledge with younger generations. We created this platform to bridge that gap, providing a digital space where wisdom can be preserved, shared, and celebrated.'
      },
      impact: {
        badge: 'Our Impact',
        title: 'Making a Difference',
        stats: [
          { number: '1000+', label: 'Wisdom Entries Preserved' },
          { number: '500+', label: 'Active Community Members' },
          { number: '50+', label: 'Elder Contributors' },
          { number: '3', label: 'Languages Supported' }
        ]
      },
      team: {
        badge: 'Our Team',
        title: 'The People Behind the Platform',
        description: 'We are a diverse team of developers, cultural enthusiasts, and community organizers passionate about preserving African heritage.'
      }
    },
    rw: {
      title: 'Ibyerekeye Umurage Wubwenge',
      subtitle: 'Kubungabunga Ubwenge bw\'Afurika ku Bizazi Bizaza',
      mission: {
        badge: 'Intego Yacu',
        title: 'Guhuza Ibisekuru n\'Abana Binyuze mu Bwenge',
        description: 'Umurage Wubwenge witanze kubungabunga no gusangira ubumenyi n\'ubwenge bwa kera bw\'Afurika. Duhuza abasaza n\'urubyiruko, tureba ko umurage w\'umuco udashobora kubura.'
      },
      vision: {
        badge: 'Icyerekezo Cyacu',
        title: 'Isi Ihuriweho n\'Umurage w\'Umuco',
        description: 'Tureba ejo hazaza aho ubwenge bwa kera buzaboneka ku buri wese, aho ubumenyi bw\'umuco buzanyurwa neza mu bisekuru, kandi aho imitwaro izakomeza guhuza n\'imizi yayo mu gihe ikakira ejo hazaza.'
      },
      values: {
        badge: 'Indangagaciro Zacu',
        title: 'Ibyo Duhagararaho',
        items: [
          {
            icon: Heart,
            title: 'Kubungabunga Umuco',
            description: 'Kurinda no guha agaciro ubumenyi bwa kera ku bizazi bizaza'
          },
          {
            icon: Users,
            title: 'Umuryango Mbere',
            description: 'Kubaka isano ikomeye hagati y\'abasaza n\'urubyiruko'
          },
          {
            icon: Globe,
            title: 'Kuboneka',
            description: 'Gutuma ubwenge buboneka ku buri wese, ahantu hose'
          },
          {
            icon: Award,
            title: 'Gushimira Abasaza',
            description: 'Guha agaciro no gushimira abagizi b\'ubumenyi'
          }
        ]
      },
      story: {
        badge: 'Inkuru Yacu',
        title: 'Uko Byatangiye',
        content: 'Umurage Wubwenge wavutse ku kwitondera koroshye: ubwenge bw\'Afurika bwa kera bwariburwa kubera ko abasaza bapfaga batarashyikirije urubyiruko. Twakoreye urubuga rwo kubungabunga, gusangira no gushimira ubu bwenge.'
      },
      impact: {
        badge: 'Ingaruka Zacu',
        title: 'Guhindura Ibintu',
        stats: [
          { number: '1000+', label: 'Ubwenge Bwabitswe' },
          { number: '500+', label: 'Abanyamuryango Bakora' },
          { number: '50+', label: 'Abasaza Bafasha' },
          { number: '3', label: 'Indimi Zikoreshwa' }
        ]
      },
      team: {
        badge: 'Itsinda Ryacu',
        title: 'Abantu Bari Inyuma y\'Urubuga',
        description: 'Turi itsinda ritandukanye ry\'abatunganya, abakunda umuco, n\'abatunganya imitwaro bakunda kubungabunga umurage w\'Afurika.'
      }
    }
  };

  const t = translations[language];

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.badge}>{t.mission.badge}</div>
          <h2 className={styles.sectionTitle}>{t.mission.title}</h2>
          <p className={styles.sectionText}>{t.mission.description}</p>
        </div>
      </section>

      {/* Vision Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.badge}>{t.vision.badge}</div>
          <h2 className={styles.sectionTitle}>{t.vision.title}</h2>
          <p className={styles.sectionText}>{t.vision.description}</p>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.badge}>{t.values.badge}</div>
          <h2 className={styles.sectionTitle}>{t.values.title}</h2>
          
          <div className={styles.valuesGrid}>
            {t.values.items.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <Icon size={32} />
                  </div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueDescription}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.badge}>{t.story.badge}</div>
          <h2 className={styles.sectionTitle}>{t.story.title}</h2>
          <p className={styles.sectionText}>{t.story.content}</p>
        </div>
      </section>

      {/* Impact Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.badge}>{t.impact.badge}</div>
          <h2 className={styles.sectionTitle}>{t.impact.title}</h2>
          
          <div className={styles.statsGrid}>
            {t.impact.stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.badge}>{t.team.badge}</div>
          <h2 className={styles.sectionTitle}>{t.team.title}</h2>
          <p className={styles.sectionText}>{t.team.description}</p>
        </div>
      </section>
    </div>
  );
}