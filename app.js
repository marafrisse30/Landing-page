// Future integration: point this to a server endpoint; keep Bitrix credentials server-side.
const LEAD_ENDPOINT = null;
document.querySelectorAll('.lead-form').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    if (!LEAD_ENDPOINT) {
      status.textContent = 'We’re unable to send your enquiry right now. Please try again later. Your details have not been sent.';
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = 'Sending your enquiry…';
    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      if (!response.ok) throw new Error('Submission failed');
      status.textContent = 'Thank you. Our team will contact you with more details.';
      form.reset();
    } catch {
      status.textContent = 'Your enquiry could not be sent. Please try again.';
    } finally { button.disabled = false; }
  });
});
const gallery = document.querySelector('#amenity-gallery');
const slides = [...gallery.querySelectorAll('.gallery-pair')];
const previous = document.querySelector('#gallery-prev');
const next = document.querySelector('#gallery-next');
const positions = () => slides.map(slide => slide.getBoundingClientRect().left - gallery.getBoundingClientRect().left + gallery.scrollLeft);
const current = () => {
  const p = positions();
  return p.reduce((best, value, i) => Math.abs(value-gallery.scrollLeft) < Math.abs(p[best]-gallery.scrollLeft) ? i : best, 0);
};
function updateGallery() {
  const max = gallery.scrollWidth-gallery.clientWidth;
  const end = gallery.scrollLeft >= max-3;
  previous.disabled = gallery.scrollLeft < 3;
  next.disabled = end;
  document.querySelector('#gallery-count').textContent = `${String(current()*2+1).padStart(2,'0')}–${String(current()*2+2).padStart(2,'0')} / ${slides.length*2}`;
  document.querySelector('#gallery-progress').style.width = `${max > 0 ? 20+80*gallery.scrollLeft/max : 100}%`;
}
function moveGallery(direction) {
  const target = Math.max(0,Math.min(slides.length-1,current()+direction));
  gallery.scrollTo({left:positions()[target],behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
previous.addEventListener('click',()=>moveGallery(-1));
next.addEventListener('click',()=>moveGallery(1));
gallery.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveGallery(event.key==='ArrowRight'?1:-1);}});
gallery.addEventListener('scroll',updateGallery,{passive:true});
window.addEventListener('resize',updateGallery);
updateGallery();

// Keep the same amenity items while regrouping by viewport.
const amenityItems = [...document.querySelectorAll('.amenity-page > li')];
function arrangeAmenities() {
  const count = window.innerWidth > 700 && window.innerWidth <= 1100 ? 6 : 4;
  const track = document.querySelector('.amenity-list');
  if (track.dataset.pageSize === String(count)) return;
  track.dataset.pageSize = String(count);
  track.replaceChildren();
  for (let i=0;i<amenityItems.length;i+=count) {
    const page=document.createElement('ul');page.className='amenity-page';
    amenityItems.slice(i,i+count).forEach(item=>page.append(item));track.append(page);
  }
  track.scrollLeft=0;
  document.querySelectorAll('.amenity-pagination button').forEach((dot,i)=>{
    dot.hidden=i>=Math.ceil(amenityItems.length/count);
    dot.setAttribute('aria-pressed',String(i===0));
  });
}
arrangeAmenities();
window.addEventListener('resize',arrangeAmenities);

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const reveals = document.querySelectorAll('.connected-intro > p, .connected-map, .section h2, .intro > p, .tower, .film-frame, .location-copy > div, .location-map, .destinations > div, .gallery-controls, #amenity-gallery, .amenities > div, .invitation-copy > p, .date, .lead-form, .amenity-page > li');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), {threshold:0,rootMargin:'0px 0px -28px 0px'});
  reveals.forEach(el => {
    if(el.matches('.destinations > div, .amenities > div, .amenity-page > li')) {
      const index=[...el.parentElement.children].indexOf(el);
      el.style.setProperty('--reveal-delay',`${(index%3)*90}ms`);
    } else if(el.matches('.intro > p, .location-map')) el.style.setProperty('--reveal-delay','110ms');
    el.classList.add('reveal'); observer.observe(el);
  });
  reducedMotion.addEventListener('change',()=>reveals.forEach(el=>el.classList.add('is-visible')));
}

const brandIntro = document.querySelector('.brand-intro');
const brandLogo = document.querySelector('.brand-intro-logo');
const introScroll = document.querySelector('.intro-scroll');
let introFrame = 0;
let shownProgress = 0;
function introTarget() {
  return Math.max(0,Math.min(1,-brandIntro.getBoundingClientRect().top/Math.max(1,brandIntro.offsetHeight-window.innerHeight)));
}
function animateIntro() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = introTarget();
  shownProgress = reduced ? target : shownProgress+(target-shownProgress)*.12;
  if(Math.abs(target-shownProgress)<.001) shownProgress=target;
  const eased = shownProgress*shownProgress*(3-2*shownProgress);
  brandLogo.style.transform = reduced ? '' : `translate3d(0,${-eased*19}vh,0) scale(${1-eased*.52})`;
  brandLogo.style.opacity = reduced ? '1' : String(1-Math.max(0,(shownProgress-.72)/.28)*.85);
  introScroll.style.opacity = String(Math.max(0,1-shownProgress*5));
  introFrame = !reduced && Math.abs(target-shownProgress)>.001 ? requestAnimationFrame(animateIntro) : 0;
}
function requestIntroFrame(){if(!introFrame)introFrame=requestAnimationFrame(animateIntro);}
window.addEventListener('scroll',requestIntroFrame,{passive:true});
window.addEventListener('resize',requestIntroFrame);
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',requestIntroFrame);
shownProgress=introTarget();requestIntroFrame();

const amenitySlider = document.querySelector('.amenity-list');
const amenityPages = () => [...amenitySlider.querySelectorAll('.amenity-page')];
const amenityDots = [...document.querySelectorAll('.amenity-pagination button')];
amenityDots.forEach((dot, index) => dot.addEventListener('click', () => {
  amenitySlider.scrollTo({left: amenityPages()[index].offsetLeft-amenityPages()[0].offsetLeft, behavior: reducedMotion.matches?'instant':'smooth'});
}));
function updateAmenityDots() {
  const index = Math.round(amenitySlider.scrollLeft/(amenitySlider.clientWidth+20));
  amenityDots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
}
amenitySlider.addEventListener('scroll',updateAmenityDots,{passive:true});
window.addEventListener('resize',updateAmenityDots);
