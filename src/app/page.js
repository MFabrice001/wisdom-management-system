import Link from 'next/link';
import { BookOpen, Users, Globe, Heart, TrendingUp, Award, Sparkles, ArrowRight } from 'lucide-react';
import PollWidget from '@/components/PollWidget';
import styles from './page.module.css';

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Digital Wisdom Library',
      description: 'Access thousands of traditional stories, proverbs, and advice from community elders',
      color: 'linear-gradient(135deg, #22c55e, #16a34a)'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect generations through shared cultural knowledge and experiences',
      color: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Content available in Kinyarwanda, English, and French',
      color: 'linear-gradient(135deg, #a855f7, #9333ea)'
    },
    {
      icon: Heart,
      title: 'Preserve Culture',
      description: 'Help preserve African traditional knowledge for future generations',
      color: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    {
      icon: TrendingUp,
      title: 'Interactive Learning',
      description: 'Engage with content through comments, likes, and bookmarks',
      color: 'linear-gradient(135deg, #eab308, #ca8a04)'
    },
    {
      icon: Award,
      title: 'Elder Recognition',
      description: 'Honor and celebrate knowledge keepers in our communities',
      color: 'linear-gradient(135deg, #6366f1, #4f46e5)'
    }
  ];

  const categories = [
    { name: 'Marriage Guidance', icon: '💑' },
    { name: 'Agriculture', icon: '🌾' },
    { name: 'Conflict Resolution', icon: '🤝' },
    { name: 'Health & Wellness', icon: '🏥' },
    { name: 'Moral Conduct', icon: '⚖️' },
    { name: 'Traditional Ceremonies', icon: '🎭' },
    { name: 'Proverbs', icon: '💭' },
    { name: 'Stories', icon: '📖' }
  ];

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroGrid}>
            {/* Left Content */}
            <div className={styles.heroContent}>
              <div className={styles.badge}>
                <Sparkles size={16} />
                Preserving Our Heritage
              </div>
              <h1 className={styles.heroTitle}>
                Umurage
                <span className={styles.heroTitleGreen}>Wubwenge</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Community Wisdom Management System
              </p>
              <p className={styles.heroDescription}>
                Preserving traditional African knowledge and wisdom for future generations. 
                Connect with elders, share stories, and keep our cultural heritage alive.
              </p>
              <div className={styles.buttonGroup}>
                <Link href="/wisdom" className={styles.buttonPrimary}>
                  Explore Wisdom
                  <ArrowRight size={20} />
                </Link>
                <Link href="/register" className={styles.buttonSecondary}>
                  Join Community
                </Link>
              </div>

              {/* Quick Stats */}
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <p className={styles.statNumber}>1000+</p>
                  <p className={styles.statLabel}>Wisdom Entries</p>
                </div>
                <div className={styles.statItem}>
                  <p className={styles.statNumber} style={{color: '#3b82f6'}}>500+</p>
                  <p className={styles.statLabel}>Members</p>
                </div>
                <div className={styles.statItem}>
                  <p className={styles.statNumber} style={{color: '#a855f7'}}>50+</p>
                  <p className={styles.statLabel}>Elders</p>
                </div>
              </div>
            </div>

            {/* Right Content - Poll Widget */}
            <div className={styles.pollWidget}>
              <div className={styles.pollHeader}>
                <div className={styles.pollIcon}>
                  <Award size={24} />
                </div>
                <div>
                  <h3 className={styles.pollTitle}>Community Poll</h3>
                  <p className={styles.pollSubtitle}>Share your voice</p>
                </div>
              </div>
              <PollWidget />
            </div>
          </div>
        </div>

        {/* Animated Background */}
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.heroContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <Sparkles size={16} />
              Platform Features
            </div>
            <h2 className={styles.sectionTitle}>
              Why Umurage Wubwenge?
            </h2>
            <p className={styles.sectionDescription}>
              A digital platform bridging generations and preserving cultural wisdom
            </p>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon} style={{background: feature.color}}>
                    <Icon size={28} color="white" />
                  </div>
                  <h3 className={styles.featureTitle}>
                    {feature.title}
                  </h3>
                  <p className={styles.featureDescription}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categoriesSection}>
        <div className={styles.heroContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge} style={{background: '#e9d5ff', color: '#6b21a8'}}>
              <BookOpen size={16} />
              Knowledge Categories
            </div>
            <h2 className={styles.sectionTitle}>
              Explore by Category
            </h2>
            <p className={styles.sectionDescription}>
              Discover wisdom across different aspects of traditional life
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/wisdom?category=${category.name.toLowerCase().replace(/ /g, '-')}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryIcon}>
                  {category.icon}
                </div>
                <p className={styles.categoryName}>{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <div className={styles.badge} style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}>
            <Users size={16} />
            Join the Movement
          </div>
          <h2 className={styles.ctaTitle}>
            Join Our Community Today
          </h2>
          <p className={styles.ctaDescription}>
            Be part of preserving and sharing traditional wisdom. 
            Start exploring, contributing, and connecting with your cultural heritage.
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/register" className={`${styles.buttonPrimary} ${styles.buttonWhite}`}>
              Create Account
              <ArrowRight size={20} />
            </Link>
            <Link href="/login" className={`${styles.buttonPrimary} ${styles.buttonGreen}`}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className={styles.communitySection}>
        <div className={styles.heroContainer}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge} style={{background: '#e0e7ff', color: '#3730a3'}}>
              <Heart size={16} />
              Community Impact
            </div>
            <h2 className={styles.sectionTitle}>
              Trusted by Communities
            </h2>
          </div>

          <div className={styles.communityGrid}>
            <div className={styles.communityCard}>
              <div className={styles.communityNumber}>1000+</div>
              <p className={styles.communityTitle}>Wisdom Entries</p>
              <p className={styles.communityDescription}>
                Stories, proverbs, and advice preserved for generations
              </p>
            </div>
            <div className={styles.communityCard} style={{background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', borderColor: '#93c5fd'}}>
              <div className={styles.communityNumber} style={{color: '#2563eb'}}>500+</div>
              <p className={styles.communityTitle}>Community Members</p>
              <p className={styles.communityDescription}>
                Active users sharing and learning together
              </p>
            </div>
            <div className={styles.communityCard} style={{background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', borderColor: '#d8b4fe'}}>
              <div className={styles.communityNumber} style={{color: '#9333ea'}}>50+</div>
              <p className={styles.communityTitle}>Elder Contributors</p>
              <p className={styles.communityDescription}>
                Knowledge keepers honored and recognized
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}