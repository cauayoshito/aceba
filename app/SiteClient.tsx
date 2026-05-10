'use client'

import { useEffect, useRef } from 'react'

export default function SiteClient() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Header scroll state
    const header = document.querySelector('.site-header') as HTMLElement | null
    const hero = document.querySelector('.hero') as HTMLElement | null

    function updateHeaderState() {
      if (!header) return
      const scrollY = window.scrollY
      const heroBottom = hero ? hero.offsetHeight : 600
      header.classList.toggle('is-scrolled', scrollY > 8)
      header.classList.toggle('is-on-hero', scrollY < heroBottom - 80)
    }

    window.addEventListener('scroll', updateHeaderState, { passive: true })
    window.addEventListener('resize', updateHeaderState, { passive: true })
    updateHeaderState()

    // Mobile nav
    const navToggle = document.querySelector('.nav-toggle') as HTMLButtonElement | null
    const mobileNav = document.querySelector('.mobile-nav') as HTMLElement | null

    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open')
        navToggle.classList.toggle('is-open', isOpen)
        navToggle.setAttribute('aria-expanded', String(isOpen))
        navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu')
        document.body.style.overflow = isOpen ? 'hidden' : ''
      })
      mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('is-open')
          navToggle.classList.remove('is-open')
          navToggle.setAttribute('aria-expanded', 'false')
          document.body.style.overflow = ''
        })
      })
    }

    // Reveal on scroll (IntersectionObserver)
    const revealEls = document.querySelectorAll('.reveal')
    if (revealEls.length) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible')
              obs.unobserve(e.target)
            }
          })
        },
        { threshold: 0.12 }
      )
      revealEls.forEach((el) => obs.observe(el))
    }

    // Count-up animation
    const countEls = document.querySelectorAll<HTMLElement>('[data-count]')
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function animateCount(el: HTMLElement) {
      const target = parseInt(el.dataset.count || '0', 10)
      const prefix = el.dataset.prefix || ''
      if (prefersReduced) { el.textContent = prefix + target; return }
      const duration = 1200
      const start = performance.now()
      function step(now: number) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        el.textContent = prefix + Math.round(target * ease)
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target as HTMLElement)
            countObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.5 }
    )
    countEls.forEach((el) => countObs.observe(el))

    // Support tabs
    const tabs = document.querySelectorAll<HTMLButtonElement>('.support-tab')
    const panels = document.querySelectorAll<HTMLElement>('.support-panel')

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab
        tabs.forEach((t) => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false') })
        panels.forEach((p) => { p.classList.remove('is-active'); p.hidden = true })
        tab.classList.add('is-active')
        tab.setAttribute('aria-selected', 'true')
        const panel = document.getElementById('panel-' + target)
        if (panel) { panel.classList.add('is-active'); panel.hidden = false }
      })
    })

    // Suggested donation chips + WhatsApp link
    const chips = document.querySelectorAll<HTMLButtonElement>('.suggested-chip')
    const whatsappBtn = document.getElementById('whatsappDonate') as HTMLAnchorElement | null
    const donateAmountEl = document.getElementById('donateAmount')

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('is-active'))
        chip.classList.add('is-active')
        const value = chip.dataset.value || '150'
        if (donateAmountEl) donateAmountEl.textContent = 'R$ ' + value
        if (whatsappBtn) {
          const msg = `Olá, quero fazer uma doação de R$ ${value} para a ACEBA.`
          whatsappBtn.href = `https://wa.me/5571997364451?text=${encodeURIComponent(msg)}`
        }
      })
    })

    // Pix copy
    const pixCopy = document.getElementById('pixCopy')
    const pixKey = document.getElementById('pixKey')
    if (pixCopy && pixKey) {
      pixCopy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pixKey.textContent?.trim() || '')
          const span = pixCopy.querySelector('span')
          if (span) {
            const original = span.textContent
            span.textContent = 'Copiado!'
            setTimeout(() => { span.textContent = original }, 2000)
          }
        } catch { /* ignore */ }
      })
    }

    // Contact form → WhatsApp fallback
    const contactForm = document.getElementById('contactForm') as HTMLFormElement | null
    const formStatus = document.getElementById('formStatus')
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const data = new FormData(contactForm)
        const nome = data.get('nome') || ''
        const email = data.get('email') || ''
        const assunto = data.get('assunto') || ''
        const mensagem = data.get('mensagem') || ''
        const msg = `Olá ACEBA!\n\nNome: ${nome}\nE-mail: ${email}\nAssunto: ${assunto}\n\n${mensagem}`
        window.open(`https://wa.me/5571997364451?text=${encodeURIComponent(msg)}`, '_blank')
        if (formStatus) {
          formStatus.textContent = 'Redirecionando para o WhatsApp...'
          formStatus.style.color = '#009B3A'
        }
      })
    }

    return () => {
      window.removeEventListener('scroll', updateHeaderState)
      window.removeEventListener('resize', updateHeaderState)
    }
  }, [])

  return (
    <>
      {/* SVG Sprite */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }} aria-hidden="true">
        <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
        </symbol>
        <symbol id="i-pix" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 3 12l9 9 9-9-9-9z" /><path d="M8 12l4 4 4-4-4-4-4 4z" />
        </symbol>
        <symbol id="i-whats" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.559 4.14 1.535 5.875L0 24l6.306-1.508A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.662-.525-5.168-1.432l-.37-.22-3.742.895.947-3.651-.242-.376A9.949 9.949 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
        </symbol>
        <symbol id="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 12 10 18 20 6" />
        </symbol>
        <symbol id="i-quote" viewBox="0 0 32 32" fill="currentColor">
          <path d="M9 22c-2 0-3.5-1.5-3.5-3.5 0-3.5 2.5-7 6-9l1 1.5c-2 1.5-3.5 3.5-3.5 5h.5c1.5 0 3 1.5 3 3s-1.5 3-3.5 3zm12 0c-2 0-3.5-1.5-3.5-3.5 0-3.5 2.5-7 6-9l1 1.5c-2 1.5-3.5 3.5-3.5 5h.5c1.5 0 3 1.5 3 3s-1.5 3-3.5 3z" />
        </symbol>
        <symbol id="i-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </symbol>
        <symbol id="i-facebook" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
        </symbol>
        <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="17" x2="20" y2="17" />
        </symbol>
        <symbol id="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
        </symbol>
      </svg>

      {/* Grain overlay */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }} aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" />
        </filter>
      </svg>

      <div className="grain-overlay" aria-hidden="true"></div>
      <a className="skip-link" href="#main">Pular para o conteúdo</a>

      {/* Top strip */}
      <div className="top-strip" aria-label="Identificação institucional">
        <div className="container top-strip-inner">
          <span className="top-tag">Vila de Abrantes · Camaçari · BA</span>
          <span className="top-divider" aria-hidden="true"></span>
          <span className="top-meta">CNPJ 05.133.450/0001-76 · Desde 2002</span>
        </div>
      </div>

      {/* Header */}
      <header className="site-header" id="topo">
        <div className="container nav-wrap">
          <a href="#inicio" className="logo">
            <img src="/logos/aceba.png" alt="Logo ACEBA" />
          </a>
          <nav className="desktop-nav" aria-label="Navegação principal">
            <a href="#sobre">Quem somos</a>
            <a href="#projetos">Projetos</a>
            <a href="#impacto">Impacto</a>
            <a href="#parcerias">Parcerias</a>
            <a href="#contato">Contato</a>
            <a href="#apoie" className="nav-cta">
              Doar agora
              <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow" /></svg>
            </a>
          </nav>
          <button className="nav-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobileMenu">
            <svg width="24" height="24" className="ico-open" aria-hidden="true"><use href="#i-menu" /></svg>
            <svg width="24" height="24" className="ico-close" aria-hidden="true"><use href="#i-close" /></svg>
          </button>
        </div>
        <nav className="mobile-nav" id="mobileMenu" aria-label="Menu mobile">
          <a href="#sobre">Quem somos</a>
          <a href="#projetos">Projetos</a>
          <a href="#impacto">Impacto</a>
          <a href="#depoimentos">Depoimentos</a>
          <a href="#parcerias">Parcerias</a>
          <a href="#contato">Contato</a>
          <a href="#apoie" className="mobile-cta">Doar agora</a>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="hero" id="inicio" aria-label="Apresentação">
          <div className="hero-media" aria-hidden="true">
            <img src="/images/piquenique-literario-geral.jpg" alt="" className="hero-image" fetchPriority="high" decoding="async" />
            <div className="hero-fade"></div>
          </div>
          <div className="container hero-shell">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true"></span>
                Associação comunitária · Desde 2002
              </p>
              <h1 className="hero-title">
                Em Vila de Abrantes, <em>233 vidas</em> crescem todos os dias dentro da ACEBA.
              </h1>
              <p className="hero-text">
                A gente mantém a Creche Esperança da Estiva, o Projeto de Educação Complementar e o Costurando Sonhos. <strong>São 23 anos</strong> na mesma comunidade com as mesmas mãos.
              </p>
              <div className="hero-actions">
                <a href="#apoie" className="btn btn-primary">
                  <svg width="16" height="16" aria-hidden="true"><use href="#i-pix" /></svg>
                  Doar via Pix
                </a>
                <a href="#sobre" className="btn btn-ghost-light">
                  Conhecer a ACEBA
                  <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow" /></svg>
                </a>
              </div>
            </div>
            <aside className="hero-card" aria-label="Resumo institucional">
              <p className="hero-card-eyebrow">A ACEBA hoje</p>
              <ul className="hero-card-stats">
                <li><strong data-count="170">170</strong><span>crianças em educação integral</span></li>
                <li><strong data-count="43">43</strong><span>adolescentes no contraturno</span></li>
                <li><strong data-count="20">20</strong><span>mulheres em geração de renda</span></li>
              </ul>
              <p className="hero-card-foot">Reconhecida pelo CMDCA · Camaçari/BA</p>
            </aside>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span>scroll</span>
            <span className="hero-scroll-line"></span>
          </div>
        </section>

        {/* Sobre */}
        <section className="about section" id="sobre">
          <div className="container about-grid">
            <div className="about-meta reveal">
              <span className="section-num">01</span>
              <p className="eyebrow">Quem somos</p>
            </div>
            <div className="about-copy reveal">
              <h2 className="display">Não é assistência. É <em>reconstrução de história</em>, todos os dias, em jornada integral.</h2>
              <div className="about-prose">
                <p>A <strong>ACEBA, Associação Comunitária Estiva Buris de Abrantes</strong> é uma organização da sociedade civil, filantrópica, sem fins econômicos, fundada em 2002. A sede fica em Buris de Abrantes, Vila de Abrantes, Camaçari, Bahia.</p>
                <p>A instituição nasceu da mobilização de moradores comprometidos com o cuidado, a educação e o acolhimento de famílias da comunidade. Em duas décadas, virou referência no atendimento a crianças, adolescentes, mulheres e famílias em situação de vulnerabilidade social.</p>
                <p>A ACEBA é mantenedora da <strong>Creche Comunitária Esperança da Estiva</strong> e desenvolve projetos socioeducativos que ampliam oportunidades, fortalecem a comunidade e contribuem para a transformação da realidade local.</p>
              </div>
              <div className="about-mission">
                <p className="about-mission-label">Nossa missão</p>
                <p className="about-mission-text">Contribuir para a formação de seres humanos éticos, criativos, livres e responsáveis, capazes de assumir seu papel na sociedade e participar da construção de um mundo mais justo, igualitário e solidário.</p>
              </div>
              <ul className="pillars" aria-label="Pilares de atuação">
                <li>Educação</li><li>Cuidado</li><li>Cidadania</li><li>Comunidade</li>
              </ul>
            </div>
            <div className="about-figure reveal">
              <figure className="about-figure-frame">
                <img src="/images/criancas-meu-nome-aceba.jpg" alt="Crianças da ACEBA com cartazes da atividade Meu Nome" loading="lazy" decoding="async" />
                <figcaption>Atividade <em>Meu Nome</em>: Educação Complementar, 2024</figcaption>
              </figure>
              <div className="about-timeline" aria-label="Marcos institucionais">
                <div className="timeline-item"><span className="timeline-year">2002</span><span className="timeline-text">Fundação da ACEBA</span></div>
                <div className="timeline-item"><span className="timeline-year">2008</span><span className="timeline-text">Início da Creche Esperança da Estiva</span></div>
                <div className="timeline-item"><span className="timeline-year">2015</span><span className="timeline-text">Projeto de Educação Complementar</span></div>
                <div className="timeline-item"><span className="timeline-year">2020</span><span className="timeline-text">Programa Costurando Sonhos</span></div>
                <div className="timeline-item is-now"><span className="timeline-year">Hoje</span><span className="timeline-text">233 vidas atendidas</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Projetos */}
        <section className="projects section" id="projetos">
          <div className="container">
            <header className="section-head reveal">
              <span className="section-num">02</span>
              <p className="eyebrow">Frentes de atuação</p>
              <h2 className="display">Três projetos. Uma única <em>continuidade.</em></h2>
              <p className="section-lead">A ACEBA atua de forma encadeada: a creche acolhe a primeira infância, o contraturno sustenta o crescimento, e a geração de renda fortalece as famílias. Tudo opera em rede, na mesma comunidade.</p>
            </header>
            <div className="projects-grid reveal">
              <article className="project-card project-card--lead">
                <header className="project-head">
                  <span className="project-tag">Educação infantil · Tempo integral</span>
                  <span className="project-num">01 / 03</span>
                </header>
                <h3>Creche Comunitária<br />Esperança da Estiva</h3>
                <p>Atendimento em tempo integral para crianças de 2 a 5 anos. Ambiente seguro e acolhedor voltado ao desenvolvimento integral, com foco em identidade, autonomia, diversidade e fortalecimento dos vínculos familiares.</p>
                <ul className="project-tags"><li>Grupo 2: 2 anos</li><li>Grupo 3: 3 anos</li><li>Grupo 4: 4 anos</li><li>Grupo 5: 5 anos</li></ul>
                <p className="project-figure"><strong>170</strong> <span>crianças atendidas</span></p>
              </article>
              <article className="project-card">
                <header className="project-head">
                  <span className="project-tag">6 a 14 anos · Contraturno</span>
                  <span className="project-num">02 / 03</span>
                </header>
                <h3>Educação Complementar</h3>
                <p>Atende crianças e adolescentes no contraturno escolar e fortalece a aprendizagem, a criatividade, a disciplina, a convivência e a expressão cultural.</p>
                <ul className="project-list"><li>Reforço escolar</li><li>Música e flauta</li><li>Capoeira</li><li>Balé</li><li>Acompanhamento socioeducativo</li></ul>
                <p className="project-figure"><strong>43</strong> <span>crianças e adolescentes</span></p>
              </article>
              <article className="project-card project-card--accent">
                <header className="project-head">
                  <span className="project-tag">Mulheres · Geração de renda</span>
                  <span className="project-num">03 / 03</span>
                </header>
                <h3>Costurando Sonhos</h3>
                <p>Programa de capacitação e geração de renda para mulheres da comunidade, em parceria com o SENAC. Foco em autonomia financeira, autoestima e fortalecimento de vínculos.</p>
                <ul className="project-list"><li>Costura criativa</li><li>Geração de renda</li><li>Fortalecimento da autoestima</li><li>Parcerias institucionais</li></ul>
                <p className="project-figure"><strong>20</strong> <span>mulheres capacitadas</span></p>
              </article>
            </div>
          </div>
        </section>

        {/* Impacto */}
        <section className="impact section" id="impacto">
          <div className="container">
            <header className="section-head reveal impact-head">
              <span className="section-num">03</span>
              <p className="eyebrow eyebrow-on-dark">Impacto</p>
              <h2 className="display">Transformação real, <em>todos os dias.</em></h2>
              <p className="section-lead lead-on-dark">Os números abaixo são da operação atual. Atualizamos a cada novo balanço institucional.</p>
            </header>
            <div className="impact-grid reveal">
              <article className="impact-card impact-card--xl">
                <p className="impact-label">Anos de atuação</p>
                <strong data-count="23">23</strong>
                <p className="impact-text">Mobilizando, acolhendo e transformando vidas em Vila de Abrantes sem interrupção desde 2002.</p>
              </article>
              <article className="impact-card">
                <p className="impact-label">Crianças atendidas</p>
                <strong data-count="170" data-prefix="+">+170</strong>
                <p className="impact-text">Em educação infantil integral, com alimentação saudável e ações pedagógicas.</p>
              </article>
              <article className="impact-card">
                <p className="impact-label">No contraturno</p>
                <strong data-count="43">43</strong>
                <p className="impact-text">Crianças e adolescentes no Projeto de Educação Complementar.</p>
              </article>
              <article className="impact-card">
                <p className="impact-label">Mulheres capacitadas</p>
                <strong data-count="20">20</strong>
                <p className="impact-text">No Costurando Sonhos: formação, autonomia e geração de renda.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="testimonials section" id="depoimentos">
          <div className="container">
            <header className="section-head reveal">
              <span className="section-num">04</span>
              <p className="eyebrow">Depoimentos</p>
              <h2 className="display">A ACEBA contada por quem <em>vive ela.</em></h2>
            </header>
            <div className="testimonials-grid reveal">
              <figure className="testimonial">
                <svg className="testimonial-mark" width="32" height="32" aria-hidden="true"><use href="#i-quote" /></svg>
                <blockquote><p>Meu filho entrou na creche com dois anos, calado, escondido. Hoje ele lê pra mim em casa, recita verso do piquenique literário. A ACEBA criou ele junto comigo.</p></blockquote>
                <figcaption><span className="testimonial-name">Maria Santana</span><span className="testimonial-role">Mãe · Educação Infantil</span></figcaption>
              </figure>
              <figure className="testimonial testimonial--feature">
                <svg className="testimonial-mark" width="32" height="32" aria-hidden="true"><use href="#i-quote" /></svg>
                <blockquote><p>Eu estudei na ACEBA dos 7 aos 13 anos. Aprendi capoeira, aprendi a ler poesia, aprendi a olhar pra minha mãe diferente. Hoje sou educadora aqui. Esse ciclo é o que sustenta a comunidade.</p></blockquote>
                <figcaption><span className="testimonial-name">Lúcia Almeida</span><span className="testimonial-role">Educadora · Ex-aluna do contraturno</span></figcaption>
              </figure>
              <figure className="testimonial">
                <svg className="testimonial-mark" width="32" height="32" aria-hidden="true"><use href="#i-quote" /></svg>
                <blockquote><p>Apoiamos a ACEBA há quatro anos via incentivo fiscal. É a parceria com prestação de contas mais transparente que temos no portfólio social da empresa. Resultado real, mensurável.</p></blockquote>
                <figcaption><span className="testimonial-name">Roberto Lima</span><span className="testimonial-role">Diretor · Empresa parceira</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Galeria */}
        <section className="gallery section" id="galeria">
          <div className="container">
            <header className="section-head reveal gallery-head">
              <span className="section-num section-num-on-dark">05</span>
              <p className="eyebrow eyebrow-on-dark">Galeria</p>
              <h2 className="display on-dark">Galeria de <em>imagens.</em></h2>
              <p className="section-lead lead-on-dark">Registros de atividades pedagógicas, culturais, comunitárias e formativas realizadas pela ACEBA.</p>
            </header>
            <div className="gallery-grid reveal">
              {[
                { src: '/images/piquenique-literario-geral.jpg', cls: 'gallery-item--feature', alt: 'Piquenique Literário: crianças assistindo apresentação ao ar livre', meta: '2024 · Educação Complementar', text: 'Piquenique Literário: a leitura que celebra.' },
                { src: '/images/musica-flauta-menores.jpg', alt: 'Crianças menores erguendo flautas animadas', meta: '2024 · Música', text: 'Música que desperta talentos.' },
                { src: '/images/piquenique-literario-leitura.jpg', alt: 'Menina lendo no Piquenique Literário', meta: '2024 · Literatura', text: 'O prazer de ler em cada página.' },
                { src: '/images/capoeira-roda-area-externa.jpg', cls: 'gallery-item--wide', alt: 'Roda de capoeira com crianças na área externa', meta: '2024 · Cultura e território', text: 'Capoeira: cultura, corpo e comunidade.' },
                { src: '/images/criancas-meu-nome-aceba.jpg', alt: 'Crianças com atividade Meu Nome', meta: '2024 · Identidade', text: 'Identidade que começa pelo nome.' },
                { src: '/images/artes-papel-criativo.jpg', alt: 'Adolescentes criando borboletas com papel colorido', meta: '2024 · Artes', text: 'Criatividade em cada detalhe.' },
                { src: '/images/jogo-bamboleo-matematica-meninas.jpg', alt: 'Meninas jogando matemática com bambolê', meta: '2024 · Aprendizado', text: 'Aprender brincando, crescer juntos.' },
                { src: '/images/musica-flauta-grupo.jpg', cls: 'gallery-item--wide', alt: 'Grupo de crianças com flautas sorrindo', meta: '2024 · Música', text: 'Música, alegria e pertencimento.' },
                { src: '/images/piquenique-literario-microfone.jpg', alt: 'Criança lendo livro no microfone', meta: '2024 · Literatura', text: 'Voz que ganha força e confiança.' },
                { src: '/images/refeicao-creche-area-externa.jpg', alt: 'Bebês da creche em refeição ao ar livre', meta: '2024 · Creche', text: 'Cuidado desde os primeiros anos.' },
                { src: '/images/festa-frutas-comunidade.jpg', alt: 'Crianças em volta da mesa de frutas', meta: '2024 · Comunidade', text: 'Alimentação saudável e convivência.' },
                { src: '/images/contacao-historia-creche.jpg', alt: 'Educadora contando história para bebês', meta: '2024 · Creche', text: 'Histórias que formam laços.' },
              ].map((item, i) => (
                <figure key={i} className={`gallery-item ${item.cls || ''}`}>
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                  <figcaption>
                    <span className="gallery-meta">{item.meta}</span>
                    <span className="gallery-text">{item.text}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Parcerias */}
        <section id="parcerias" className="partners-section">
          <div className="container partners-container">
            <div className="section-kicker">Rede de apoio institucional</div>
            <div className="partners-header">
              <h2>Parcerias que ampliam cuidado, educação e futuro</h2>
              <p>A transformação social acontece em rede. A ACEBA caminha ao lado de instituições públicas, empresas, organizações sociais e grupos comunitários que fortalecem nossas ações e ampliam o alcance do nosso trabalho em Vila de Abrantes.</p>
            </div>
            <div className="partners-grid">
              <article className="partner-card partner-logo-card">
                <img src="/logos/cmdca.png" alt="CMDCA Camaçari" />
              </article>
              {['Bahia Norte', 'Litoral Norte', 'SEDUC Camaçari', 'SENAC Lauro de Freitas', 'Conselho Tutelar', 'UBS de Vila de Abrantes', 'Projeto Agata Smeralda', 'Associação Conexão Vida', 'DIPE', 'Grupos culturais e esportivos da comunidade'].map((name) => (
                <article key={name} className="partner-card"><span>{name}</span></article>
              ))}
            </div>
          </div>
        </section>

        {/* Apoie */}
        <section className="support section" id="apoie">
          <div className="container">
            <header className="section-head reveal support-head">
              <span className="section-num">06</span>
              <p className="eyebrow">Como apoiar</p>
              <h2 className="display">Não doe pra ACEBA. <em>Doe pra Maria, pro João, pra Dona Cida.</em><br />A gente só repassa.</h2>
            </header>
            <div className="support-tabs reveal" role="tablist" aria-label="Formas de apoiar">
              <button className="support-tab is-active" role="tab" aria-selected="true" data-tab="pf">
                <span className="tab-num">01</span><span className="tab-label">Pessoa física</span><span className="tab-desc">Doação via Pix</span>
              </button>
              <button className="support-tab" role="tab" aria-selected="false" data-tab="pj">
                <span className="tab-num">02</span><span className="tab-label">Empresas</span><span className="tab-desc">Parceria + incentivo fiscal</span>
              </button>
              <button className="support-tab" role="tab" aria-selected="false" data-tab="vol">
                <span className="tab-num">03</span><span className="tab-label">Voluntariado</span><span className="tab-desc">Tempo, conhecimento, oficinas</span>
              </button>
            </div>

            {/* Painel PF */}
            <div className="support-panel is-active" id="panel-pf" role="tabpanel">
              <div className="support-grid">
                <div className="support-info">
                  <h3 className="support-info-title">Doar agora pelo Pix</h3>
                  <p>A doação cai direto na conta institucional da ACEBA. Você recebe o comprovante por e-mail se nos enviar pelo WhatsApp.</p>
                  <p className="support-tip">
                    <svg width="14" height="14" aria-hidden="true"><use href="#i-shield" /></svg>
                    Toda doação é registrada na prestação de contas anual da ACEBA.
                  </p>
                  <p className="support-suggested-label">Valores sugeridos</p>
                  <div className="support-suggested">
                    {['30','80','150','500'].map((v) => (
                      <button key={v} type="button" className={`suggested-chip${v === '150' ? ' is-active' : ''}`} data-value={v}>R$ {v}</button>
                    ))}
                  </div>
                  <a href="https://wa.me/5571997364451?text=Ol%C3%A1%2C%20quero%20fazer%20uma%20doa%C3%A7%C3%A3o%20de%20R%24%20150%20para%20a%20ACEBA." target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-full" id="whatsappDonate">
                    <svg width="18" height="18" aria-hidden="true"><use href="#i-whats" /></svg>
                    <span>Confirmar pelo WhatsApp · <span id="donateAmount">R$ 150</span></span>
                  </a>
                </div>
                <div className="pix-card">
                  <div className="pix-card-head">
                    <p className="pix-eyebrow">Chave Pix · CNPJ</p>
                    <p className="pix-key" id="pixKey">05.133.450/0001-76</p>
                    <button type="button" className="pix-copy" id="pixCopy" aria-label="Copiar chave Pix">
                      <svg width="14" height="14" aria-hidden="true"><use href="#i-copy" /></svg>
                      <span>Copiar</span>
                    </button>
                  </div>
                  <div className="pix-qr qr-code" aria-label="QR Code Pix">
                    <img src="/images/pix-aceba.png" alt="QR Code Pix ACEBA" />
                  </div>
                  <p className="pix-foot">Aponte a câmera do banco. Doação em segundos.</p>
                </div>
              </div>
            </div>

            {/* Painel PJ */}
            <div className="support-panel" id="panel-pj" role="tabpanel" hidden>
              <div className="support-grid support-grid--pj">
                <div className="support-info">
                  <h3 className="support-info-title">Apoiar como empresa</h3>
                  <p>Sua empresa pode apoiar a ACEBA por três caminhos institucionais. Todos com prestação de contas formal e relatório anual de impacto.</p>
                  <ul className="pj-list">
                    <li><svg width="18" height="18" aria-hidden="true"><use href="#i-check" /></svg><div><strong>Incentivo fiscal · FIA</strong><p>Pessoa jurídica pode destinar até 1% do imposto devido para o Fundo Municipal da Infância e Adolescência. Custo zero para a empresa.</p></div></li>
                    <li><svg width="18" height="18" aria-hidden="true"><use href="#i-check" /></svg><div><strong>Patrocínio nominal de projeto</strong><p>Apoio direto a um projeto específico, como Creche, Educação Complementar ou Costurando Sonhos, com reconhecimento institucional e relatório dedicado.</p></div></li>
                    <li><svg width="18" height="18" aria-hidden="true"><use href="#i-check" /></svg><div><strong>Voluntariado corporativo</strong><p>Programa de engajamento da equipe da empresa em oficinas e ações comunitárias, com agenda institucional.</p></div></li>
                  </ul>
                  <a href="https://wa.me/5571997364451?text=Ol%C3%A1%2C%20represento%20uma%20empresa%20interessada%20em%20apoiar%20a%20ACEBA." target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                    <svg width="16" height="16" aria-hidden="true"><use href="#i-whats" /></svg>
                    Falar com a coordenação
                  </a>
                </div>
                <aside className="pj-card">
                  <p className="pj-card-eyebrow">Sobre o FIA</p>
                  <p className="pj-card-text">O FIA é regulado pela Lei 8.069/90 (ECA). Empresas optantes pelo Lucro Real podem deduzir até <strong>1% do IR devido</strong>. Pessoas físicas, até <strong>6%</strong>.</p>
                  <p className="pj-card-text">A ACEBA está habilitada via <strong>CMDCA Camaçari</strong> a receber esses recursos.</p>
                  <p className="pj-card-foot">Trabalhamos com contadores e jurídicos das empresas parceiras desde o primeiro contato.</p>
                </aside>
              </div>
            </div>

            {/* Painel Voluntariado */}
            <div className="support-panel" id="panel-vol" role="tabpanel" hidden>
              <div className="support-grid">
                <div className="support-info">
                  <h3 className="support-info-title">Ser voluntário(a) na ACEBA</h3>
                  <p>A ACEBA recebe voluntários para oficinas pontuais, atividades regulares, formações e suporte logístico. Não é necessário ter experiência prévia; é necessário ter compromisso com o que a casa representa.</p>
                  <ul className="pj-list">
                    <li><svg width="18" height="18" aria-hidden="true"><use href="#i-check" /></svg><div><strong>Oficinas pontuais</strong><p>Arte, música, escrita, jogos, ciência. Você define o conteúdo, a gente cuida do resto.</p></div></li>
                    <li><svg width="18" height="18" aria-hidden="true"><use href="#i-check" /></svg><div><strong>Apoio regular</strong><p>Reforço escolar, contação de história, acompanhamento pedagógico, com agenda fixa semanal ou quinzenal.</p></div></li>
                    <li><svg width="18" height="18" aria-hidden="true"><use href="#i-check" /></svg><div><strong>Serviços técnicos</strong><p>Saúde, jurídico, contabilidade, design, comunicação, manutenção predial. Toda mão é bem-vinda.</p></div></li>
                  </ul>
                  <a href="https://wa.me/5571997364451?text=Ol%C3%A1%2C%20gostaria%20de%20me%20oferecer%20como%20volunt%C3%A1rio(a)%20na%20ACEBA." target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                    <svg width="16" height="16" aria-hidden="true"><use href="#i-whats" /></svg>
                    Quero ser voluntário(a)
                  </a>
                </div>
                <aside className="pj-card">
                  <p className="pj-card-eyebrow">Como funciona</p>
                  <p className="pj-card-text">Após o primeiro contato, marcamos uma <strong>visita à sede</strong> em Buris de Abrantes. Lá, você conhece os projetos, conversa com a equipe, e definimos juntos a forma de contribuição.</p>
                  <p className="pj-card-foot">Voluntariado regular é registrado em <strong>termo de adesão</strong>, com declaração para fins acadêmicos e profissionais.</p>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="contact section" id="contato">
          <div className="container">
            <header className="section-head reveal">
              <span className="section-num">08</span>
              <p className="eyebrow">Contato</p>
              <h2 className="display">Fale com a <em>ACEBA.</em></h2>
              <p className="section-lead">Visite a sede, proponha uma parceria, candidate-se ao voluntariado, ou peça informações de matrícula. Respondemos em até 48h úteis.</p>
            </header>
            <div className="contact-grid reveal">
              <div className="contact-info">
                <ul className="contact-list">
                  <li><span className="contact-label">Endereço</span><span className="contact-value">Rua São Bento, Quadra 3, Lote 13<br />Buris de Abrantes, Vila de Abrantes<br />Camaçari · Bahia · 42825-000</span></li>
                  <li><span className="contact-label">Telefone · WhatsApp</span><span className="contact-value"><a href="tel:+5571997364451">(71) 99736-4451</a></span></li>
                  <li><span className="contact-label">E-mail</span><span className="contact-value"><a href="mailto:aceba.associacaocomunitaria@gmail.com">aceba.associacaocomunitaria@gmail.com</a></span></li>
                  <li><span className="contact-label">Horário</span><span className="contact-value">Segunda a sexta · 7h30 às 17h<br />Visitas com agendamento prévio.</span></li>
                  <li>
                    <span className="contact-label">Redes</span>
                    <span className="contact-value contact-socials">
                      <a href="#" aria-label="Instagram da ACEBA"><svg width="18" height="18" aria-hidden="true"><use href="#i-instagram" /></svg></a>
                      <a href="#" aria-label="Facebook da ACEBA"><svg width="18" height="18" aria-hidden="true"><use href="#i-facebook" /></svg></a>
                    </span>
                  </li>
                </ul>
              </div>
              <form className="contact-form" id="contactForm" noValidate>
                <h3>Envie uma mensagem</h3>
                <p className="contact-form-lead">Os campos marcados com <span aria-hidden="true">*</span> são obrigatórios.</p>
                <div className="form-row">
                  <div className="form-group"><label htmlFor="nome">Nome <span aria-hidden="true">*</span></label><input type="text" id="nome" name="nome" autoComplete="name" required /></div>
                  <div className="form-group"><label htmlFor="email">E-mail <span aria-hidden="true">*</span></label><input type="email" id="email" name="email" autoComplete="email" required /></div>
                </div>
                <div className="form-group"><label htmlFor="telefone">Telefone / WhatsApp</label><input type="tel" id="telefone" name="telefone" autoComplete="tel" placeholder="(00) 00000-0000" /></div>
                <div className="form-group">
                  <label htmlFor="assunto">Assunto <span aria-hidden="true">*</span></label>
                  <select id="assunto" name="assunto" required>
                    <option value="">Selecione um assunto</option>
                    <option>Quero apoiar / fazer doação</option>
                    <option>Proposta de parceria empresarial</option>
                    <option>Voluntariado</option>
                    <option>Matrícula / informações</option>
                    <option>Imprensa / comunicação</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div className="form-group"><label htmlFor="mensagem">Mensagem <span aria-hidden="true">*</span></label><textarea id="mensagem" name="mensagem" rows={5} required></textarea></div>
                <button type="submit" className="btn btn-primary btn-full">
                  Enviar mensagem
                  <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow" /></svg>
                </button>
                <p className="form-status" id="formStatus" role="status"></p>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#topo" className="brand brand-footer" aria-label="ACEBA: voltar ao topo">
                <div className="footer-logo"><img src="/logos/aceba.png" alt="Logo ACEBA" /></div>
                <span className="brand-words"><span className="brand-name">ACEBA</span><span className="brand-sub">Estiva Buris de Abrantes</span></span>
              </a>
              <p className="footer-statement">Há 23 anos cuidando, educando e fortalecendo a comunidade de Vila de Abrantes, Camaçari, Bahia.</p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h5>Institucional</h5>
                <ul><li><a href="#sobre">Quem somos</a></li><li><a href="#projetos">Projetos</a></li><li><a href="#impacto">Impacto</a></li><li><a href="#parcerias">Parcerias</a></li></ul>
              </div>
              <div className="footer-col">
                <h5>Apoiar</h5>
                <ul><li><a href="#apoie">Doar via Pix</a></li><li><a href="#apoie">Empresas / FIA</a></li><li><a href="#apoie">Voluntariado</a></li><li><a href="#contato">Contato</a></li></ul>
              </div>
              <div className="footer-col">
                <h5>Contato</h5>
                <ul className="footer-contact">
                  <li>Rua São Bento, Quadra 3, Lote 13<br />Buris de Abrantes · Vila de Abrantes<br />Camaçari · BA · 42825-000</li>
                  <li><a href="tel:+5571997364451">(71) 99736-4451</a></li>
                  <li><a href="mailto:aceba.associacaocomunitaria@gmail.com">aceba.associacaocomunitaria@gmail.com</a></li>
                </ul>
                <div className="footer-social">
                  <a href="#" aria-label="Instagram"><svg width="16" height="16" aria-hidden="true"><use href="#i-instagram" /></svg></a>
                  <a href="#" aria-label="Facebook"><svg width="16" height="16" aria-hidden="true"><use href="#i-facebook" /></svg></a>
                  <a href="https://wa.me/5571997364451" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" aria-hidden="true"><use href="#i-whats" /></svg></a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-seals">
            <div className="seal"><span className="seal-mark">CMDCA</span><span className="seal-text">Habilitada · Camaçari</span></div>
            <div className="seal"><span className="seal-mark">CNPJ</span><span className="seal-text">05.133.450/0001-76</span></div>
            <div className="seal"><span className="seal-mark">UC</span><span className="seal-text">Utilidade pública municipal</span></div>
            <div className="seal"><span className="seal-mark">SEDUC</span><span className="seal-text">Conveniada · Camaçari</span></div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 ACEBA · Associação Comunitária Estiva Buris de Abrantes. Todos os direitos reservados.</p>
            <p className="footer-legal">
              <a href="#">Política de privacidade</a><span aria-hidden="true">·</span>
              <a href="#">Termos de uso</a><span aria-hidden="true">·</span>
              <span>LGPD</span>
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      <a href="https://wa.me/5571997364451" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Conversar com a ACEBA pelo WhatsApp">
        <svg width="22" height="22" aria-hidden="true"><use href="#i-whats" /></svg>
      </a>

      {/* Mobile sticky CTA */}
      <div className="mobile-sticky" aria-hidden="true">
        <a href="#apoie" className="btn btn-primary btn-full">
          <svg width="16" height="16" aria-hidden="true"><use href="#i-pix" /></svg>
          Doar via Pix
        </a>
      </div>
    </>
  )
}
