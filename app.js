'use strict';
// Authored, deterministic demonstration data. No model, analytics, or remote storage.
const layerDefinitions = [
  {key:'verbosity', name:'Verbosity', description:'Status updates and the agent’s running commentary.', options:['Off','Status','Concise','Detailed'], anchor:'verbosity'},
  {key:'thinking', name:'Thinking', description:'An authored reasoning note for each decision, separate from checks.', options:['Off','Show'], anchor:'thinking'},
  {key:'tools', name:'Summarized tool calls', description:'The action, the file, and a short account of the result.', options:['Off','Show'], anchor:'tools'},
  {key:'raw', name:'Full tool output', description:'Exact example commands and result text, opened on demand.', options:['Off','Show'], anchor:'full-output'},
  {key:'subagents', name:'Subagents', description:'Delegated tasks, with a summary or the full handoff record.', options:['Off','Summary','Full'], anchor:'subagents'},
  {key:'versions', name:'Artifact versions', description:'Historical previews. The final artifact stays available at every setting.', options:['Off','Latest','All'], anchor:'versions'}
];
const proposedView={verbosity:2,thinking:0,tools:1,raw:0,subagents:1,versions:2};
const presets={
  1:{verbosity:0,thinking:0,tools:0,raw:0,subagents:0,versions:0},
  2:{verbosity:1,thinking:0,tools:0,raw:0,subagents:0,versions:1},
  3:{verbosity:2,thinking:0,tools:0,raw:0,subagents:0,versions:1},
  4:{verbosity:2,thinking:0,tools:1,raw:1,subagents:0,versions:1},
  5:{verbosity:2,thinking:1,tools:0,raw:0,subagents:0,versions:1},
  6:{verbosity:3,thinking:1,tools:1,raw:1,subagents:2,versions:2}
};
const steps=[
 {title:'Read the brief',tag:'Plan',narration:'I’ll keep the booking rules separate from the page layout.',detail:'The page needs an eight-seat limit, a four-seat discount boundary, and a confirmation. The visual preview alone cannot verify these rules.',thinking:'Separating price calculation from layout will make the boundary cases easier to check. A successful booking is not enough to show that the discount threshold is correct.',tools:[['Read · brief.md','Four acceptance criteria extracted.']],raw:'$ read brief.md\n1 <= seats <= 8\nunit_price = 45 USD\ndiscount = 10% when seats >= 4\nconfirmation required; narrow screen and keyboard support',version:0},
 {title:'Build the first layout',tag:'v1',narration:'The workshop details and booking area are in place.',detail:'Version 1 is a layout draft. Its booking controls are intentionally inactive; the pricing behavior comes next.',thinking:'Keeping the price and the booking action together should make the result easier to inspect. This is a layout choice, not evidence that the pricing works.',tools:[['Write · booking.js','Added page structure and inactive booking controls.'],['Preview · desktop','Layout opens in the example preview.']],raw:'$ render workshop --version 1\nPage loaded: title, workshop details, seat selector\nBooking controls: disabled\nPricing logic: not implemented',version:1},
 {title:'Add booking behavior',tag:'v2',narration:'The seat selector, live total, and confirmation now work.',detail:'Version 2 adds behavior. At this point, the four-seat discount boundary has not been checked. A working button does not establish that every rule is correct.',thinking:'I’ll calculate the price whenever the seat count changes and reject counts outside the available capacity. The discount boundary needs a separate check.',tools:[['Edit · booking.js','Added validation, pricing, and local confirmation.'],['Preview · one seat','One seat shows $45 and a confirmation.']],raw:'$ preview booking --version 2 --seats 1\nTotal: $45.00\nConfirmation: shown\n$ inspect pricing\nconst rate = seats > 4 ? 0.9 : 1;\nFour-seat boundary: not checked yet',version:2},
 {title:'Check the booking rules',tag:'Issue found',narration:'The four-seat price is $180. It should be $162.',detail:'The check at exactly four seats fails. Tests at one and eight seats pass. The narrow layout was checked, but keyboard use was not checked in this example record.',thinking:'Checking exactly at the discount threshold catches a case that a single successful booking misses. Passing one example is not the same as meeting the whole brief.',tools:[['Test · booking.test.js','1 and 8 seats pass; 4 seats fails.'],['Check · narrow layout','375 px layout checked in the example record.'],['Keyboard review','Not run in this example record.']],raw:'$ test booking.test.js --version 2\nPASS 1 seat: $45.00\nFAIL 4 seats: expected $162.00, received $180.00\nPASS 8 seats: $324.00\nPASS reject 0 seats\nPASS reject 9 seats\n$ check layout --width 375\nPASS no horizontal overflow\nKeyboard review: NOT RUN',version:2,agent:{name:'Review agent',initial:'R',task:'Check the booking rules against brief.md.',summary:'Found a discount boundary error. Keyboard review remains unperformed.',record:'Input: brief.md + version 2\nChecked: 0, 1, 4, 8, 9 seats; narrow layout\nReturned: “Use >= 4; keyboard review still needed.”\nHandoff: main agent receives the finding.'}},
 {title:'Fix the discount boundary',tag:'v3',narration:'Changed “more than four” to “four or more” and repeated the pricing checks.',detail:'Version 3 now gives the discount at exactly four seats. The recorded pricing and capacity checks pass. The earlier keyboard-review gap is still open.',thinking:'The brief says “4 or more”, so the comparison must include 4. A targeted change avoids altering unrelated behavior. I still should not claim that keyboard use was verified.',tools:[['Edit · booking.js','Changed seats > 4 to seats >= 4.'],['Test · booking.test.js','Five pricing and capacity cases pass.']],raw:'--- version 2\n- const rate = seats > 4 ? 0.9 : 1;\n+++ version 3\n+ const rate = seats >= 4 ? 0.9 : 1;\n\n$ test booking.test.js --version 3\nPASS 1 seat: $45.00\nPASS 4 seats: $162.00\nPASS 8 seats: $324.00\nPASS reject 0 seats\nPASS reject 9 seats\n5 passed\nKeyboard review: NOT RUN',version:3},
 {title:'Hand back the result',tag:'Ready to review',narration:'The booking page is ready for your review. Keyboard use still needs a check.',detail:'The final version includes the pricing correction and confirmation. This handoff reports the limits of the example checks rather than treating a completed run as a guarantee.',thinking:'The user needs the finished artifact and a clear account of what remains unchecked. More commentary would not close the keyboard-review gap.',tools:[['Deliver · version 3','Latest artifact returned.'],['Outstanding check','Keyboard review is not in this run.']],raw:'$ handoff\nArtifact: version 3\nPricing / capacity checks: 5 passed\nNarrow layout: checked in example record\nKeyboard review: NOT RUN\nNo real reservations or participant data collected.',version:3}
];
const state={layers:{...proposedView},preset:'custom',index:5,version:3,seats:1,mobile:false,playing:false,compare:false,open:new Set([3]),reviews:{}};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let timer=null,toastTimer=null;
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3300)}
function availableVersion(){return steps[state.index].version}
function priceFor(seats,version){return seats*45*((version===2?seats>4:seats>=4)?0.9:1)}
function money(n){return n.toLocaleString('en-US',{style:'currency',currency:'USD'})}
function visibleSteps(){return steps.slice(0,state.index+1).map((step,index)=>({step,index})).filter(({step})=>!step.agent||state.layers.subagents>0||state.layers.verbosity>0||state.layers.tools>0||state.layers.raw>0||state.layers.thinking>0)}
function renderSettings(){
 $('#layer-settings').innerHTML=layerDefinitions.map(d=>`<div class="layer-setting"><div><strong>${d.name}</strong><p>${d.description}</p><a href="research.html#${d.anchor}" target="_blank" rel="noopener">Design basis ↗</a></div><div class="segmented" role="group" aria-label="${d.name}">${d.options.map((o,i)=>`<button data-layer="${d.key}" data-value="${i}" aria-label="${d.name}: ${o}" aria-pressed="${state.layers[d.key]===i}">${o}</button>`).join('')}</div></div>`).join('');
 $('#preset').value=state.preset;
}
function renderProcess(){
 const l=state.layers;
 $('#layer-count').textContent=`${Object.values(l).filter(v=>v>0).length}/6`;
 $('#view-label').textContent=state.preset==='custom'?'Custom view':$('#preset option[value="'+state.preset+'"]').textContent.split(' — ')[0];
 $('#run-state').textContent=state.playing?'Replaying':state.index===5?'Run complete':'Replay paused';
 $('#process-summary').textContent=l.verbosity>=2?(state.index===5?'Built the page, checked the pricing, and fixed a boundary error.':steps[state.index].narration):l.verbosity===1?(state.index===5?'Run complete.':steps[state.index].title):'Choose which parts of this example run are visible.';
 $('#replay-button').innerHTML=state.playing?'Ⅱ &nbsp; Pause':state.index<5?'▷ &nbsp; Continue':'▷ &nbsp; Replay run';
 $('#end-button').hidden=state.index===5;
 $('#replay-count').textContent=`${state.index+1} / 6 steps`;
 $('#progress-fill').style.width=((state.index+1)/6*100)+'%';
 const hasProcess=l.verbosity||l.thinking||l.tools||l.raw||l.subagents;
 $('#process-empty').hidden=!!hasProcess;
 const filtered=hasProcess?visibleSteps().filter(({step})=>l.verbosity||l.thinking||l.tools||l.raw||(l.subagents&&step.agent)):[];
 $('#steps').innerHTML=filtered.map(({step:s,index:i})=>`<details class="step" data-step="${i}" ${state.open.has(i)?'open':''}><summary><span class="step-index">${i+1}</span><span>${l.verbosity?s.title:'Step '+(i+1)}</span>${l.verbosity?`<span class="step-tag ${i===3?'warn':''}">${s.tag}</span>`:''}</summary><div class="step-content">
 ${l.verbosity>=2?`<p class="narration">${esc(s.narration)}${l.verbosity===3?' '+esc(s.detail):''}</p>`:''}
 ${l.thinking?`<div class="info-block"><div class="info-heading">Thinking <a href="research.html#thinking" target="_blank" rel="noopener">Why this view ↗</a></div><div class="reasoning-note">${esc(s.thinking)}<small>Authored reasoning note · not access to hidden model cognition</small></div></div>`:''}
 ${l.tools?`<div class="info-block"><div class="info-heading">Recorded actions</div>${s.tools.map(([a,b])=>`<div class="tool-row"><span class="tool-symbol">↳</span><div>${esc(a)}<span class="tool-result">${esc(b)}</span></div></div>`).join('')}</div>`:''}
 ${l.raw?`<details class="raw-details"><summary>Full tool output · step ${i+1}</summary><pre>${esc(s.raw)}</pre></details>`:''}
 ${l.subagents&&s.agent?`<div class="agent-card"><div class="agent-title"><span class="agent-avatar">${s.agent.initial}</span><strong>${s.agent.name}</strong><span class="muted">· delegated task</span></div><p>${s.agent.summary}</p>${l.subagents===2?`<div class="agent-record"><strong>Task:</strong> ${s.agent.task}<p>${esc(s.agent.record).replace(/\n/g,'<br>')}</p></div>`:''}</div>`:''}
 ${!l.thinking&&!l.tools&&!l.raw&&!(l.subagents&&s.agent)&&l.verbosity<2?'<p class="narration">Status only. Open Visibility for more detail.</p>':''}
 </div></details>`).join('');
 document.querySelectorAll('.step').forEach(el=>el.addEventListener('toggle',()=>{if(!el.isConnected)return;el.open?state.open.add(Number(el.dataset.step)):state.open.delete(Number(el.dataset.step))}));
}
const art=`<svg class="product-art" viewBox="0 0 200 190" role="img" aria-label="A wooden desk lamp and a small plant"><rect x="10" y="8" width="180" height="175" rx="90" fill="#f2f0e5"/><path d="M22 151h155" stroke="#d8d8c7"/><ellipse cx="91" cy="151" rx="35" ry="5" fill="#d0d3bd"/><path d="M91 144V98l39-34" fill="none" stroke="#8d9d73" stroke-width="8" stroke-linecap="round"/><circle cx="91" cy="99" r="7" fill="#667b4d"/><path d="M118 52l31 23-23 20-29-20z" fill="#bcc59c"/><path d="M99 76l28 20" stroke="#8d9c70" stroke-width="3"/><path d="M81 144h23l6 8H74z" fill="#88996e"/><path d="M151 124h22l-4 27h-15z" fill="#cbba95"/><path d="M161 125c-19-8-18-23-13-24 10 0 14 11 13 24M162 123c15-2 20-17 15-20-8-2-15 10-15 20" fill="#8da17a"/><circle cx="59" cy="49" r="3" fill="#d0c9ae"/><path d="M43 98h12M49 92v12" stroke="#c7c6af"/></svg>`;
function renderProduct(){
 const v=state.version,max=availableVersion();
 $('#artifact-badge').hidden=state.layers.versions===0;
 $('#artifact-badge').textContent=v?`v${v} · ${v===max?'Latest available':'Earlier version'}`:'Not built yet';
 $('#version-controls').innerHTML=state.layers.versions===2?Array.from({length:max},(_,i)=>`<button data-version="${i+1}" class="${v===i+1?'selected':''}" aria-label="View version ${i+1}" aria-pressed="${v===i+1}">v${i+1}${i+1===max?' · Latest':''}</button>`).join(''):state.layers.versions===1?`<span class="muted" style="font-size:10px">Latest available version</span>`:'<span class="muted" style="font-size:10px">Artifact preview</span>';
 $('#compare-button').hidden=state.layers.versions!==2||max<2;
 $('#compare-button').textContent=state.compare?'Close comparison ×':'Compare versions ↗';
 $('#comparison').hidden=!state.compare||state.layers.versions!==2||max<2;
 const before=max===3?2:1,after=max;
 $('#comparison').innerHTML=`<div class="comparison-box"><h3>What changed? · ${before===2?'4 seats at $45 each':'From layout to behavior'}</h3><div class="comparison-grid"><div>v${before} · ${before===2?'Before the fix':'Layout draft'}<strong>${before===2?'$180.00':'Not functional'}</strong>${before===2?'<code>seats &gt; 4</code>':'Booking is disabled.'}</div><div>v${after} · ${after===3?'After the fix':'Interactive draft'}<strong>${after===3?'$162.00':'Booking enabled'}</strong>${after===3?'<code>seats &gt;= 4</code>':'Pricing boundary not checked yet.'}</div></div><p>${after===3?'Version history shows a change; it does not prove the whole page is correct.':'Try four seats and compare the result with the brief.'}</p></div>`;
 $('#version-caption').textContent=state.layers.versions===0?'Latest available artifact':['No artifact yet','v1 · Layout draft','v2 · Interactive draft','v3 · Pricing boundary fixed'][v];
 $('#preview-stage').classList.toggle('mobile',state.mobile);
 $('#product').classList.toggle('compact',state.mobile);
 if(!v){$('#product').innerHTML='<div class="empty-state"><span>◌</span><strong>The agent is reading the brief.</strong><p>The first version will appear as the replay continues.</p></div>';renderReview();return}
 $('#product').innerHTML=`<div class="product-top"><strong>FORM STUDIO</strong><span>LEARN BY MAKING</span></div><div class="product-hero"><div><span class="product-tag">A HANDS-ON AFTERNOON</span><h2>Design<br>Workshop.</h2><p class="product-desc">Build a small desk lamp. Explore form, materials, and a little creative problem-solving.</p></div>${art}</div><div class="event-meta"><span>Saturday · 2–5 pm</span><span>Studio 04</span><span>All materials included</span></div><div class="booking-form">${v===1?'<div class="draft-note">Layout draft · booking behavior has not been added yet.</div>':''}<div class="booking-title">Save your place <span class="availability">8 seats available</span></div><div class="seat-row"><label for="seats">Number of seats<small>$45 per person · 10% off for 4+</small></label><div class="stepper"><button id="minus-seat" aria-label="Remove a seat" ${v===1?'disabled':''}>−</button><input id="seats" aria-label="Number of seats" type="number" inputmode="numeric" min="1" max="8" step="1" value="${state.seats}" ${v===1?'disabled':''}><button id="plus-seat" aria-label="Add a seat" ${v===1?'disabled':''}>+</button></div></div><div class="price-lines"><div><span id="subtotal-label"></span><span id="subtotal"></span></div><div class="discount"><span>Group discount</span><span id="discount"></span></div><div class="total"><span>Total</span><span id="total"></span></div></div><button class="reserve" id="reserve" ${v===1?'disabled':''}>Reserve seats <span aria-hidden="true">↗</span></button><p class="disclaimer">Interactive demo only. No payment or booking is sent.</p><div id="booking-message" class="booking-message" role="status" hidden></div></div>`;
 $('#seats').addEventListener('input',()=>{state.seats=Number($('#seats').value);updatePrice();$('#booking-message').hidden=true});
 $('#minus-seat').addEventListener('click',()=>{setSeats(Math.max(1,(Number.isFinite(state.seats)?state.seats:1)-1))});
 $('#plus-seat').addEventListener('click',()=>{setSeats(Math.min(8,(Number.isFinite(state.seats)?state.seats:0)+1))});
 $('#reserve').addEventListener('click',()=>{
  const m=$('#booking-message');const valid=Number.isInteger(state.seats)&&state.seats>=1&&state.seats<=8;m.hidden=false;m.classList.toggle('error',!valid);
  m.textContent=valid?`Demo reservation: ${state.seats} ${state.seats===1?'seat':'seats'} · ${money(priceFor(state.seats,v))}. Nothing was sent.`:'Choose a whole number from 1 to 8. No booking was made.';
 });
 updatePrice();renderReview();
}
function setSeats(n){state.seats=n;$('#seats').value=n;updatePrice();$('#booking-message').hidden=true}
function updatePrice(){const n=state.seats,valid=Number.isInteger(n)&&n>=1&&n<=8;$('#subtotal-label').textContent=valid?`${n} ${n===1?'seat':'seats'} × $45.00`:'Choose 1–8 seats';$('#subtotal').textContent=valid?money(n*45):'—';$('#discount').textContent=valid?((n*45-priceFor(n,state.version))>0?'−'+money(n*45-priceFor(n,state.version)):'—'):'—';$('#total').textContent=valid?(state.version===1?'—':money(priceFor(n,state.version))):'—'}
function renderReview(){const key=state.version,r=state.reviews[key];$('#review-copy').textContent=r==='approve'?`Your v${key} judgment: looks ready. Not saved or submitted.`:r==='inspect'?`Your v${key} judgment: needs a closer look. Not saved or submitted.`:'Does this version meet the brief?';document.querySelectorAll('[data-review]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.review===r);b.disabled=!state.version})}
function render(){renderSettings();renderProcess();renderProduct()}
function settingsChanged(){if(state.layers.versions<2){state.version=availableVersion();state.compare=false}renderProcess();renderProduct();$('#preset').value=state.preset}
$('#layer-settings').addEventListener('click',e=>{const b=e.target.closest('[data-layer]');if(!b)return;state.layers[b.dataset.layer]=Number(b.dataset.value);state.preset='custom';b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));settingsChanged()});
$('#preset').addEventListener('change',e=>{if(e.target.value==='custom')return;state.preset=e.target.value;state.layers={...presets[state.preset]};renderSettings();settingsChanged()});
$('#reset-layers').addEventListener('click',()=>{state.layers={...proposedView};state.preset='custom';renderSettings();settingsChanged();notify('Proposed view restored.')});
function openDialog(id){$(id).showModal()}
$('#visibility-button').onclick=()=>openDialog('#visibility-dialog');$('#empty-settings').onclick=()=>openDialog('#visibility-dialog');$('#help-button').onclick=()=>openDialog('#help-dialog');$('#why-button').onclick=()=>{window.location.href='research.html'};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}));
$('#version-controls').addEventListener('click',e=>{const b=e.target.closest('[data-version]');if(!b)return;state.version=Number(b.dataset.version);renderProduct()});
$('#compare-button').onclick=()=>{state.compare=!state.compare;renderProduct()};
$('#desktop-button').onclick=()=>setMobile(false);$('#mobile-button').onclick=()=>setMobile(true);
function setMobile(value){state.mobile=value;$('#desktop-button').classList.toggle('selected',!value);$('#mobile-button').classList.toggle('selected',value);$('#desktop-button').setAttribute('aria-pressed',!value);$('#mobile-button').setAttribute('aria-pressed',value);renderProduct()}
document.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>{state.reviews[state.version]=b.dataset.review;renderReview()});
function stopReplay(){clearInterval(timer);timer=null;state.playing=false}
function advance(){if(state.index>=5){stopReplay();renderProcess();return}state.index++;state.version=availableVersion();state.open=new Set([state.index]);if(state.index===5)stopReplay();renderProcess();renderProduct()}
$('#replay-button').onclick=()=>{if(state.playing){stopReplay();renderProcess();return}if(state.index===5){state.index=0;state.version=0;state.open=new Set([0]);state.compare=false;state.reviews={}}state.playing=true;renderProcess();renderProduct();timer=setInterval(advance,2600)};
$('#end-button').onclick=()=>{stopReplay();state.index=5;state.version=3;state.open=new Set([3]);renderProcess();renderProduct()};
render();
