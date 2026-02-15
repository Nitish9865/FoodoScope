import { motion } from 'framer-motion';

export default function Preloader({ message = '' }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--cream)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
      }}
    >
      {/* Animated plate SVG */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{ width: 56, height: 56 }}
      >
        <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="26" stroke="var(--cream-dark)" strokeWidth="3"/>
          <path d="M28 8 A20 20 0 0 1 48 28" stroke="var(--terra)" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="28" cy="28" r="8" fill="var(--saffron)" opacity="0.4"/>
          {/* Fork */}
          <line x1="20" y1="18" x2="20" y2="38" stroke="var(--forest-mid)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17" y1="18" x2="17" y2="24" stroke="var(--forest-mid)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="18" x2="20" y2="24" stroke="var(--forest-mid)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="23" y1="18" x2="23" y2="24" stroke="var(--forest-mid)" strokeWidth="2" strokeLinecap="round"/>
          {/* Knife */}
          <line x1="36" y1="18" x2="36" y2="38" stroke="var(--forest-mid)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M36 18 Q40 22 36 26" stroke="var(--forest-mid)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <motion.p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            color: 'var(--forest)',
            fontStyle: 'italic',
            marginBottom: '0.5rem',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message || 'Preparing something delicious…'}
        </motion.p>
      </div>

      {/* Progress bar */}
      <div style={{ width: 140, height: 3, background: 'var(--cream-dark)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            height: '100%',
            width: '50%',
            background: 'linear-gradient(90deg, var(--terra), var(--saffron))',
            borderRadius: 2,
          }}
        />
      </div>
    </motion.div>
  );
}
