const refs = [
  {pct:30, hb:4.7, rgb:[184,95,74], label:"Actual anemia"},
  {pct:40, hb:6.3, rgb:[181,98,80], label:"Actual anemia"},
  {pct:50, hb:7.8, rgb:[165,66,56], label:"Actual anemia"},
  {pct:60, hb:9.4, rgb:[157,55,48], label:"Actual anemia"},
  {pct:70, hb:10.9, rgb:[122,28,21], label:"Suggestive anemia"},
  {pct:80, hb:12.5, rgb:[115,24,23], label:"Suggestive / threshold"},
  {pct:90, hb:14.1, rgb:[116,31,28], label:"Normal"},
  {pct:100, hb:15.6, rgb:[107,32,19], label:"Normal"}
];

const imageInput = document.getElementById("imageInput");
const canvas = document.getElementById("sampleCanvas");
const ctx = canvas.getContext("2d", {willReadFrequently:true});
const placeholder = document.getElementById("canvasPlaceholder");
const radiusInput = document.getElementById("radius");
const radiusValue = document.getElementById("radiusValue");
const resetBtn = document.getElementById("resetSample");
const sexSelect = document.getElementById("sex");
const reportDate = document.getElementById("reportDate");

let loadedImage = null;
let scale = 1;
let lastResult = null;

document.getElementById("reportDate").value = new Date().toISOString().slice(0,10);

function renderReferences(){
  document.getElementById("referenceGrid").innerHTML = refs.map(r => `
    <div class="ref">
      <div class="swatch" style="background:rgb(${r.rgb.join(",")})"></div>
      <div class="ref-body"><strong>${r.pct}%</strong><br>≈ ${r.hb} g/dL<br>${r.label}</div>
    </div>`).join("");
}
renderReferences();

radiusInput.addEventListener("input",()=>radiusValue.textContent = radiusInput.value + " px");

imageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      const maxW = Math.min(950, window.innerWidth - 80);
      scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      canvas.style.display = "block";
      placeholder.style.display = "none";
      resetBtn.disabled = false;
      document.getElementById("sampleInstruction").textContent =
        "Tap/click the centre of the blood colour. Avoid white paper, shadows and glare.";
      clearResult();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

canvas.addEventListener("pointerdown", e => {
  if(!loadedImage) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) * canvas.width / rect.width);
  const y = Math.round((e.clientY - rect.top) * canvas.height / rect.height);
  const r = Number(radiusInput.value);
  const data = ctx.getImageData(Math.max(0,x-r),Math.max(0,y-r),Math.min(canvas.width,x+r+1)-Math.max(0,x-r),Math.min(canvas.height,y+r+1)-Math.max(0,y-r)).data;
  const rgb = averageColor(data);
  drawMarker(x,y,r);
  calculate(rgb);
});

function averageColor(data){
  let rr=0,gg=0,bb=0,n=0;
  for(let i=0;i<data.length;i+=4){
    const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
    if(a<200) continue;
    // Ignore near-white paper and very dark pixels.
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    if(max>242 && min>220) continue;
    if(max<25) continue;
    rr+=r;gg+=g;bb+=b;n++;
  }
  return n ? [Math.round(rr/n),Math.round(gg/n),Math.round(bb/n)] : [128,50,40];
}

function drawMarker(x,y,r){
  if(!loadedImage) return;
  ctx.drawImage(loadedImage,0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
  ctx.strokeStyle="white"; ctx.lineWidth=3; ctx.stroke();
  ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
  ctx.fillStyle="white"; ctx.fill();
  ctx.restore();
}

function dist(a,b){
  return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);
}

function interpolate(a,b,t){ return a+(b-a)*t; }

function calculate(rgb){
  let nearest=refs[0], best=Infinity;
  refs.forEach(r=>{
    const d=dist(rgb,r.rgb);
    if(d<best){best=d;nearest=r;}
  });

  // Linear interpolation between the two nearest reference levels gives
  // a smoother educational estimate while still anchoring to the comparator.
  const ordered=[...refs].sort((a,b)=>a.pct-b.pct);
  let lower=ordered[0], upper=ordered[ordered.length-1];
  for(let i=0;i<ordered.length-1;i++){
    const d1=dist(rgb,ordered[i].rgb), d2=dist(rgb,ordered[i+1].rgb);
    if(d1<=best || d2<=best){
      lower=ordered[i]; upper=ordered[i+1];
    }
  }
  // Keep the displayed estimate anchored to the nearest comparator band.
  const hb=nearest.hb, pct=nearest.pct;
  const interpretation = getInterpretation(pct, sexSelect.value);

  document.getElementById("resultEmpty").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("hbValue").textContent = hb.toFixed(1) + " g/dL";
  document.getElementById("percentValue").textContent = pct + "% colour scale";
  document.getElementById("rgbValue").textContent = `(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  document.getElementById("nearestValue").textContent = `${nearest.pct}% ≈ ${nearest.hb} g/dL`;
  document.getElementById("distanceValue").textContent = best.toFixed(1) + " RGB units";
  document.getElementById("sexInterpretation").textContent = interpretation.text;
  document.getElementById("classification").textContent = interpretation.classification;

  lastResult={rgb,nearest,best,interpretation};
  updateReport();
}

function getInterpretation(pct,sex){
  if(pct<70) return {classification:"Actual anemia range", text:"Below 70% on this comparator."};
  if(sex==="male"){
    if(pct<=85) return {classification:"Suggestive anemia range", text:"70–85%: suggestive range for men on this chart."};
    return {classification:"Normal range", text:"Above 85%: normal range for men on this chart."};
  }
  if(sex==="female"){
    if(pct<=80) return {classification:"Suggestive anemia range", text:"70–80%: suggestive range for women on this chart."};
    return {classification:"Normal range", text:"Above 80%: normal range for women on this chart."};
  }
  if(pct<=80) return {classification:"Suggestive / borderline range", text:"Sex not selected; interpretation should use the laboratory's validated reference."};
  return {classification:"Comparator normal range", text:"Sex not selected; this is a colour-comparator category only."};
}

function updateReport(){
  if(!lastResult) return;
  const id=document.getElementById("sampleId").value.trim() || "Not provided";
  const sex=sexSelect.options[sexSelect.selectedIndex].text;
  const date=reportDate.value || new Date().toISOString().slice(0,10);
  const r=lastResult;
  document.getElementById("reportContent").innerHTML=`
    <div class="report-box">
      <h3>Hemoglobin Colour Comparator Report</h3>
      <table class="report-table">
        <tr><td>Sample / Patient ID</td><td>${escapeHtml(id)}</td></tr>
        <tr><td>Date</td><td>${escapeHtml(date)}</td></tr>
        <tr><td>Sex</td><td>${escapeHtml(sex)}</td></tr>
        <tr><td>Comparator-equivalent Hb</td><td><strong>${r.nearest.hb.toFixed(1)} g/dL</strong></td></tr>
        <tr><td>Colour scale</td><td>${r.nearest.pct}%</td></tr>
        <tr><td>Classification</td><td>${r.interpretation.classification}</td></tr>
        <tr><td>Measured sample RGB</td><td>(${r.rgb.join(", ")})</td></tr>
        <tr><td>Colour distance</td><td>${r.best.toFixed(1)} RGB units</td></tr>
      </table>
      <p><strong>Comment:</strong> ${r.interpretation.text}</p>
      <p class="hint"><strong>Laboratory note:</strong> This is an educational colour-comparator estimate from a photograph. Confirm hemoglobin with a validated laboratory method before clinical interpretation or treatment decisions.</p>
      <p class="hint">Reference values used: 30%=4.7, 40%=6.3, 50%=7.8, 60%=9.4, 70%=10.9, 80%=12.5, 90%=14.1, 100%=15.6 g/dL.</p>
    </div>`;
}

["sampleId","sex","reportDate"].forEach(id=>{
  document.getElementById(id).addEventListener("input",updateReport);
  document.getElementById(id).addEventListener("change",updateReport);
});

resetBtn.addEventListener("click",()=>{
  if(!loadedImage) return;
  ctx.drawImage(loadedImage,0,0,canvas.width,canvas.height);
  clearResult();
});

function clearResult(){
  lastResult=null;
  document.getElementById("resultEmpty").classList.remove("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("reportContent").innerHTML='<p class="hint">A report will appear after a colour is measured.</p>';
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

document.getElementById("printBtn").addEventListener("click",()=>window.print());

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
