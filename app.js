const KEY='janis_wedding_guests_v1';
let guests=JSON.parse(localStorage.getItem(KEY)||'[]');
let currentId=null;

const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem(KEY,JSON.stringify(guests)); render();}

function initials(n){return n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function go(page){
  $$('.page').forEach(p=>p.classList.toggle('active',p.id===page));
  $$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  const titles={dashboard:'Tableau de bord',guests:'Invités',add:'Ajouter un invité',scanner:'Scanner QR'};
  $('#pageTitle').textContent=titles[page]||'Janis Wedding';
  $('.sidebar').classList.remove('open');
}
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
$$('.nav').forEach(b=>b.onclick=()=>go(b.dataset.page));
$('#quickAdd').onclick=()=>go('add');
$('#menuBtn').onclick=()=>$('.sidebar').classList.toggle('open');

function render(){
  $('#statTotal').textContent=guests.length;
  $('#statGenerated').textContent=guests.filter(g=>g.generated).length;
  $('#statConfirmed').textContent=guests.filter(g=>g.status==='confirmed').length;
  $('#statPresent').textContent=guests.filter(g=>g.present).length;
  const q=($('#search')?.value||'').toLowerCase();
  const filtered=guests.filter(g=>(g.name+' '+g.phone).toLowerCase().includes(q));
  $('#guestList').innerHTML=filtered.length?filtered.map(card).join(''):'<div class="guest"><div class="guest-info"><b>Aucun invité</b><small>Ajoutez votre premier invité.</small></div></div>';
  $('#recentGuests').innerHTML=guests.slice(-5).reverse().map(card).join('')||'<div class="guest"><div class="guest-info"><b>Bienvenue 👋</b><small>Commencez par ajouter un invité.</small></div></div>';
  $$('.viewGuest').forEach(b=>b.onclick=()=>showInvitation(b.dataset.id));
  $$('.deleteGuest').forEach(b=>b.onclick=()=>{if(confirm('Supprimer cet invité ?')){guests=guests.filter(g=>g.id!==b.dataset.id);save()}});
}
function card(g){
 return `<div class="guest"><div class="avatar">${initials(g.name)}</div><div class="guest-info"><b>${esc(g.name)}</b><small>${esc(g.phone||'Sans téléphone')} · ${g.people} pers. · ${esc(g.category)}</small></div><span class="badge ${g.status==='confirmed'?'ok':''}">${g.present?'Présent':g.status==='confirmed'?'Confirmé':'En attente'}</span><div class="guest-actions"><button class="mini viewGuest" data-id="${g.id}">💌</button><button class="mini deleteGuest" data-id="${g.id}">🗑</button></div></div>`
}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

$('#search').oninput=render;
$('#guestForm').onsubmit=e=>{
 e.preventDefault();
 const g={id:'JANIS-'+Date.now().toString(36).toUpperCase(),name:$('#name').value.trim(),phone:$('#phone').value.trim(),people:+$('#people').value,category:$('#category').value,table:$('#table').value.trim(),status:$('#status').value,note:$('#note').value.trim(),generated:true,present:false,createdAt:new Date().toISOString()};
 guests.push(g); save(); e.target.reset(); $('#people').value=1; showInvitation(g.id);
};

function showInvitation(id){
 currentId=id; const g=guests.find(x=>x.id===id); if(!g)return;
 $('#invitationPreview').innerHTML=`<div class="invitation" id="capture">
  <div><div class="rings">💍</div><div class="eyebrow">JANIS WEDDING</div><h2>Invitation</h2><div class="line"></div>
  <div class="guest-name">${esc(g.name)}</div><p>Vous êtes chaleureusement invité(e)<br>à célébrer ce moment précieux avec nous.</p>
  <p><b>Nombre de personnes :</b> ${g.people}<br><b>${esc(g.table||'')}</b></p></div>
  <div><div id="qrcode" class="qr"></div><div class="code">${g.id}</div><div class="share-note">Présentez ce QR code à l'entrée</div></div>
 </div>`;
 new QRCode($('#qrcode'),{text:location.origin+location.pathname+'?invite='+encodeURIComponent(g.id),width:120,height:120,colorDark:'#351521',colorLight:'#ffffff'});
 $('#modal').classList.remove('hidden');
}
$('#closeModal').onclick=()=>$('#modal').classList.add('hidden');
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};

$('#downloadBtn').onclick=async()=>{
 const node=$('#capture'); const canvas=await html2canvas(node,{scale:2,backgroundColor:'#fffdf9'});
 const a=document.createElement('a'); a.download='Invitation-'+currentId+'.png'; a.href=canvas.toDataURL('image/png'); a.click();
};
$('#shareBtn').onclick=async()=>{
 const node=$('#capture'); const canvas=await html2canvas(node,{scale:2,backgroundColor:'#fffdf9'});
 canvas.toBlob(async blob=>{
   const file=new File([blob],'Invitation-'+currentId+'.png',{type:'image/png'});
   if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))) await navigator.share({title:'Invitation Janis Wedding',files:[file]});
   else alert('Le partage direct n’est pas disponible ici. Téléchargez l’image puis envoyez-la sur WhatsApp.');
 });
};

$('#startScan').onclick=async()=>{
 const result=$('#scanResult');
 if(!window.Html5Qrcode){result.innerHTML='<div class="danger">Le scanner n’est pas encore chargé. Vérifiez votre connexion puis réessayez.</div>';return}
 const scanner=new Html5Qrcode("reader");
 try{
   await scanner.start({facingMode:"environment"},{fps:10,qrbox:220},async text=>{
     await scanner.stop();
     const id=text.split('invite=').pop();
     const decoded=decodeURIComponent(id);
     const g=guests.find(x=>x.id===decoded||text.includes(x.id));
     if(g){g.present=true;save();result.innerHTML=`<div class="result"><b>Invitation valide ✅</b><br>${esc(g.name)} — ${g.people} personne(s)<br>${esc(g.table||'Table non définie')}<br><button class="primary" onclick="showInvitation('${g.id}')">Voir l'invitation</button></div>`}
     else result.innerHTML=`<div class="danger">QR reconnu, mais cet invité n'existe pas dans cette base.</div>`;
   },()=>{});
 }catch(err){result.innerHTML='<div class="danger">Impossible d’ouvrir la caméra. Autorisez l’accès à la caméra dans votre navigateur.</div>'}
};

function handleUrlInvite(){
 const id=new URLSearchParams(location.search).get('invite');
 if(!id)return;
 const g=guests.find(x=>x.id===id);
 if(g){showInvitation(g.id)}
}
render(); handleUrlInvite();
