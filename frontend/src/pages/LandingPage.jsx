import { useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const videoRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const logos = ['Vortex', 'Nimbus', 'Prysma', 'Cirrus', 'Kynder', 'Halcyn'];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrame;
    const fadeDuration = 0.5;

    const updateOpacity = () => {
      if (!video.duration) {
        animationFrame = requestAnimationFrame(updateOpacity);
        return;
      }
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      let opacity = 1;
      if (currentTime < fadeDuration) {
        opacity = currentTime / fadeDuration;
      } else if (duration - currentTime < fadeDuration) {
        opacity = Math.max(0, (duration - currentTime) / fadeDuration);
      }
      
      video.style.opacity = opacity.toString();
      animationFrame = requestAnimationFrame(updateOpacity);
    };

    const handlePlay = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateOpacity);
    };

    const handleEnded = () => {
      cancelAnimationFrame(animationFrame);
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(console.error);
      }, 100);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('ended', handleEnded);

    video.play().catch(console.error);

    return () => {
      cancelAnimationFrame(animationFrame);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleConsultClick = async () => {
    if (!user) {
      alert("Please login first using the Login button in the navbar.");
      return;
    }
    
    // Automatically redirect based on role instead of just alerting
    if (user.role === 'manager') navigate('/dashboard/manager');
    else if (user.role === 'data_entry') navigate('/dashboard/data-entry');
    else if (user.role === 'guest') navigate('/dashboard/guest');
  };

  return (
    <>
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0 }}
          muted
          playsInline
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1 overflow-visible">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] pointer-events-none -z-10 rounded-full" />

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative mt-20">
          <h1 
            className="text-[120px] md:text-[220px] font-normal leading-[1.02] tracking-[-0.024em] font-[family-name:var(--font-headline)]"
          >
            <span className="text-white">Resort </span>
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to left, #6366f1, #a855f7, #fcd34d)' }}
            >
              AI
            </span>
          </h1>
          <p className="text-[var(--hero-sub)] text-lg leading-8 max-w-md mt-[9px] opacity-80">
            The most powerful AI ever deployed<br />for resort and hotel management
          </p>
          <button 
            className="btn-heroSecondary rounded-full px-[29px] py-[24px] mt-[25px] text-lg font-medium cursor-pointer"
            onClick={handleConsultClick}
          >
            {user ? 'Go to Dashboard' : 'Login to Consult'}
          </button>
        </div>

        {/* Logo Marquee */}
        <div className="w-full pb-10 mt-auto pt-20">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-12 overflow-hidden px-8">
            <div className="shrink-0 text-white/50 text-sm leading-snug">
              Relied on by brands<br />across the globe
            </div>
            
            <div className="flex-1 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <div className="flex w-max animate-marquee">
                <div className="flex gap-16 pr-16 shrink-0">
                  {logos.map((logo, i) => (
                    <div key={`a-${i}`} className="flex items-center gap-3">
                      <div className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                        {logo.charAt(0)}
                      </div>
                      <span className="text-base font-semibold text-white">{logo}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-16 pr-16 shrink-0" aria-hidden="true">
                  {logos.map((logo, i) => (
                    <div key={`b-${i}`} className="flex items-center gap-3">
                      <div className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                        {logo.charAt(0)}
                      </div>
                      <span className="text-base font-semibold text-white">{logo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </>
  );
}
