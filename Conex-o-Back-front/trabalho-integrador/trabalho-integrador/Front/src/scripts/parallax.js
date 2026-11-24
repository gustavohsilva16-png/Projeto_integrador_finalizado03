document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('inicio');
  const parallaxBg = document.getElementById('hero-parallax-bg');

  if (!heroSection || !parallaxBg) return;

  // Respeita a preferência do sistema por redução de movimento
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const velocidade = 0.30;
  const margemSeguranca = 0.35; // Corresponde ao top: -35% do CSS
  let ticking = false;

  function atualizarParallax() {
    const rect = heroSection.getBoundingClientRect();

    if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
      const scrollY = window.scrollY || window.pageYOffset;
      const limiteMaximo = heroSection.offsetHeight * margemSeguranca;
      const deslocamentoBruto = (scrollY - heroSection.offsetTop) * velocidade;

      // Limita o deslocamento para a imagem nunca revelar bordas vazias
      const deslocamento = Math.max(-limiteMaximo, Math.min(limiteMaximo, deslocamentoBruto));
      parallaxBg.style.transform = `translate3d(0, ${deslocamento.toFixed(2)}px, 0)`;
    }

    ticking = false;
  }

  function aoRolar() {
    if (!ticking) {
      window.requestAnimationFrame(atualizarParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar, { passive: true });

  atualizarParallax();
});