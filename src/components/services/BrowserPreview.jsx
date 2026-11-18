"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import webTargets from './web-preview-targets.json';
import s from './styles';

function Chart({ bars = false }) {
  return bars ? <div className={s.bars}>{[28,42,35,56,45,67,58,79,70,86,78,96].map((height,i)=><i key={i} style={{height:`${height}%`}} />)}</div> : <svg className={s.chart} viewBox="0 0 480 130" fill="none"><path d="M0 25H480M0 65H480M0 105H480" stroke="#dce7ef12" /><path d="M0 118L40 107L80 110L120 84L160 90L200 66L240 72L280 43L320 49L360 28L400 34L440 12L480 7V130H0Z" fill="#16d9e80c" /><path className={s.chartLine} d="M0 118L40 107L80 110L120 84L160 90L200 66L240 72L280 43L320 49L360 28L400 34L440 12L480 7" stroke="#67c6d2" strokeWidth="2.5" pathLength="1" /></svg>;
}
function Product({ variant = 0 }) { return <div className={`${s.productArt} ${s[`product${variant}`]}`}><div className={s.lamp}><i /><b /><span /></div></div>; }
function WebPreview() {
 return <div className="dm-service-siteCapture">
   {['hero', 'expertise', 'project'].map((screen, index) => <div key={screen} className="dm-service-captureFrame" data-capture={index}>
     <Image src={`/previews/dragon-${screen}.jpg`} alt="" fill sizes="(max-width: 999px) 90vw, 55vw" loading="eager" />
   </div>)}
   <span className="dm-service-captureTarget" data-target="first" style={webTargets.first} />
   <span className="dm-service-captureTarget" data-target="second" style={webTargets.second} />
 </div>;
}
function CommercePreview() {
 return <div className={s.commerce}><div className={s.mockNav}><b>Dragon</b><span>All lights　 Desk lamps　 Pendants</span><span>Bag <b className={s.cartCount}>1</b></span></div><div className={s.shopHeading}><small>HOME / LIGHTING</small><h4>Find your everyday light.</h4><span>Table lamps, pendants and desk lights.</span></div><div className="dm-service-shopFilters"><span>All lighting <b>3</b></span><span>In stock　✓</span><span>Sort: Featured　⌄</span></div><div className={s.productGrid}>{['Arc table light','Pebble pendant','Linea desk light'].map((name,i)=><div key={name}><Product variant={i} /><div className={s.productInfo}><b>{name}</b><span>${[129,89,149][i]}</span></div><small>★ 4.8 · In stock</small><span className={s.shopAdd} data-target={i===0?'first':undefined}>View product ↗</span></div>)}</div><div className={s.cartDrawer} data-reveal="first"><small>PRODUCT DETAILS</small><h4>The Arc table light</h4><Product /><div className={s.productInfo}><span>Warm white / brushed silver</span><b>$129</b></div><p>Dimmable LED · 2-year warranty · Ships in 2 days</p><span className={s.mockButton} data-target="second">Add to bag & checkout →</span></div><div className={s.checkout} data-reveal="second"><span className={s.checkIcon}>✓</span><small>ORDER SUMMARY</small><h4>Your cart is<br />ready to go.</h4><div><span>Arc table light × 1</span><b>$129.00</b></div><div><span>Delivery</span><b>Complimentary</b></div><span className={s.mockButton}>Secure checkout　↗</span><small>Concept checkout · No payment collected</small></div></div>;
}
function MobilePreview() {
 return <div className={s.mobileWorkspace}><div className={s.workspaceTitle}><b>Dragon<span> / planner</span></b><span>●　Live preview</span></div><div className={s.deviceNotes}><small>YOUR DAILY WORKSPACE</small><h4>Plan your day.<br /><em>Stay on track.</em></h4><p>Tasks, reminders and focus time.<br />Everything in one place.</p><span>iOS & Android ↗</span></div><div className={s.phone}><div className={s.phoneStatus}>9:41 <i /> ▰</div><div className={s.phoneContent}><small>MONDAY, JUNE 16</small><h4>Good morning,<br />Alex.</h4><div className={s.activityRing}><span>3/4<small>TASKS COMPLETED</small></span></div><div className={s.phoneStats}><span><b>10:30</b>Team meeting</span><span><b>14:00</b>Design review</span></div><div className={s.phoneAction} data-target="first">Start next task <span>↗</span></div><div className={s.phoneTabs}>Today　 Tasks　 Calendar</div></div><div className={s.phoneDetail} data-reveal="first"><small>UP NEXT · 25 MINUTES</small><div className={s.breathOrb} /><h4>Review the<br />homepage.</h4><p>Check mobile layouts.<br />Share feedback with the team.</p><span className={s.mockButton} data-target="second">Start focus timer　▷</span><span className={s.sessionState} data-reveal="second">Timer running · Notifications paused</span></div></div><span className={s.deviceBadge}>↗　Tasks synced · Just now</span></div>;
}
function Dashboard({ seo = false }) {
 return <div className={s.dashboard}><aside><b>Dragon</b><span className={s.sideActive}>◈　Overview</span><span>▥　{seo?'Keywords':'Campaigns'}</span><span>◎　{seo?'Site audit':'Audiences'}</span><span>↗　Reports</span><small>WORKSPACE<br />Dragon　⌄</small></aside><div className={s.dashMain}><div className={s.dashHeader}><span>{seo?'Search overview':'Campaign overview'}</span><span>Last 30 days　⌄</span></div><div className={s.dashWelcome}><h4>{seo?'Search traffic & rankings':'Campaigns at a glance'}</h4><small>{seo?'Track visits, keyword positions and site health.':'Monitor spend, leads and active campaigns.'}</small></div><div className={s.metrics}>{(seo?[['Organic visits','24,892','↑ 28.6%'],['Keywords in top 10','148','↑ 32'],['Site health','96 / 100','↑ 8 points']]:[['Impressions','128.4k','↑ 24.8%'],['Conversions','1,284','↑ 18.2%'],['Return on spend','4.8×','↑ 1.2×']]).map(([label,value,delta])=><div key={label}><small>{label}</small><b>{value}</b><span>{delta}</span></div>)}</div><div className={s.chartPanel}><div><b>{seo?'Organic search performance':'Campaign performance'}</b><span>● {seo?'Organic traffic':'Conversions'}</span></div><Chart bars={!seo} /><div className={s.chartDates}><span>JUN 01</span><span>JUN 10</span><span>JUN 20</span><span>JUN 30</span></div></div><div className={s.reportTable}><div><b>{seo?'Keyword opportunities':'Active campaigns'}</b><span data-target="first">{seo?'Run site audit':'Audience settings'} ↗</span></div>{(seo?['website development services','custom web development','ecommerce solutions']:['Lighting · Search ads','New customers · Meta','Cart reminders · Meta']).map((label,i)=><div key={label}><span><i />{label}</span><span>{seo?['#3　↑ 4','#5　↑ 8','#8　↑ 12'][i]:['Active　 $240','Active　 $180','Active　 $120'][i]}</span></div>)}</div></div><div className={s.dashOverlay} data-reveal="first"><small>{seo?'TECHNICAL HEALTH':'CAMPAIGN SETTINGS'}</small><h4>{seo?'Website audit results':'Edit campaign audience'}</h4>{seo?<><div className={s.auditScore}>96<span>/ 100</span></div><p>✓　Core Web Vitals passed<br />✓　Sitemap indexed<br />✓　Mobile experience optimized</p></>:<><p>Audience interests</p><div className={s.tags}><span>Design</span><span>Architecture</span><span>Home & living</span></div><p>Daily budget <b>$240</b></p><div className={s.slider}><i /></div><small>Estimated reach: 12,400 – 18,600</small></>}<span className={s.mockButton} data-target="second">{seo?'Generate report':'Apply audience'} ↗</span></div><div className={s.toast} data-reveal="second">✓　{seo?'Your performance report is ready':'Audience updated · Campaign optimized'}</div></div>;
}
function CreativePreview() {
 return <div className={s.creative}><div className={s.workspaceTitle}><b>Dragon<span> / creative workspace</span></b><span>All changes saved　●</span></div><div className={s.workflowHeader}><small>AUTOMATION / CUSTOMER ENQUIRIES</small><h4>Follow up with every enquiry.</h4><span className={s.mockButton} data-target="first">Run workflow　▷</span></div><div className={s.workflow}><svg viewBox="0 0 600 200" preserveAspectRatio="none"><path d="M100 100H280V40H490M280 100V160H490" /><path className={s.flowLine} d="M100 100H280V40H490M280 100V160H490" /></svg><div className={`${s.node} ${s.nodeStart}`}><i>◇</i><b>New enquiry</b><small>Website form received</small><span>TRIGGER</span></div><div className={`${s.node} ${s.nodeTop}`}><i>↗</i><b>Welcome email</b><small>Send a reply to the customer</small><span>CONNECTED</span></div><div className={`${s.node} ${s.nodeBottom}`}><i>▦</i><b>Update workspace</b><small>Create a contact in your CRM</small><span>CONNECTED</span></div></div><div className={s.brandKit}><div className={s.brandMark}>D<span>↗</span></div><div><small>BRAND SYSTEM / DRAGON</small><b>Logo, colours & website assets</b></div><div className={s.swatches}><i /><i /><i /><i /></div><span data-target="second">Publish ↗</span></div><div className={s.toast} data-reveal="first">✓　Enquiry received → Email sent → Contact saved</div><div className={s.publishBadge} data-reveal="second">✓　Brand assets synced to your workspace</div></div>;
}
const previews = { web: WebPreview, commerce: CommercePreview, mobile: MobilePreview, marketing: Dashboard, seo: () => <Dashboard seo />, creative: CreativePreview };
export default function BrowserPreview({ service, enabled }) {
 const root = useRef(null);
 useEffect(() => {
  const element = root.current;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timeline;
  let inView = false;
  function sync() {
   if (enabled && inView && !document.hidden && !motion.matches) timeline?.play(); else timeline?.pause();
  }
  const context = gsap.context(() => {
   const pointer = element.querySelector('[data-cursor]');
   const pulse = element.querySelector('[data-click]');
   const target = (name, axis) => () => {
    const box = element.querySelector(`[data-target="${name}"]`).getBoundingClientRect();
    const area = element.querySelector('[data-screen]').getBoundingClientRect();
    return axis === 'x' ? box.left - area.left + box.width * .65 : box.top - area.top + box.height * .6;
   };
   timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true, onRepeat: () => { timeline.invalidate(); } });
   timeline.set(element, {attr:{'data-phase':'0'}})
    .set(pointer,{x:25,y:35,opacity:1})
    .to(pointer,{x:target('first','x'),y:target('first','y'),duration:1.5,ease:'power2.inOut'},.6)
    .fromTo(pulse,{scale:.2,opacity:.8},{scale:2,opacity:0,duration:.5},2.15)
    .set(element,{attr:{'data-phase':'1'}},2.25)
    .to(pointer,{x:target('second','x'),y:target('second','y'),duration:1.4,ease:'power2.inOut'},3.5)
    .fromTo(pulse,{scale:.2,opacity:.8},{scale:2,opacity:0,duration:.5},5)
    .set(element,{attr:{'data-phase':'2'}},5.1)
    .to(pointer,{opacity:0,duration:.4},7.3)
    .set(element,{attr:{'data-phase':'0'}},8.3);
  },element);
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; element.dataset.visible = String(inView); sync(); },{threshold:.12});
  observer.observe(element);
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync);
  return () => { observer.disconnect(); document.removeEventListener('visibilitychange',sync); motion.removeEventListener('change',sync); context.revert(); };
 },[enabled,service.slug]);
 const Preview = previews[service.slug];
 return <div ref={root} className={s.browser} data-kind={service.slug} data-playing={enabled} role="img" aria-label={service.slug === 'web' ? 'Dragon Media website screenshots: animated cursor explores services and opens the project form' : `Animated ${service.title} interface concept with browser controls and address bar`}>
   <div className={s.browserChrome}><div className={s.windowDots}><i /><i /><i /></div><span className={s.browserArrows}>‹　›</span><div className={s.address}><span>♧</span>{service.address}<span>↻</span></div><span className={s.browserTools}>⊞　＋</span></div>
   <div className={s.browserScreen} data-screen aria-hidden="true"><Preview /><div className={s.simCursor} data-cursor><svg viewBox="0 0 24 28"><path d="M3 2L4 23L10 17L15 26L19 24L14 15L22 14Z" fill="#fff" stroke="#17232d" strokeWidth="1.5" /></svg><i data-click /></div></div>
   <div className={s.browserFoot}><span>DRAGON</span><span>DESIGN × TECHNOLOGY</span><i /></div>
 </div>;
}
