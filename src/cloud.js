import{SUPABASE_URL, SUPABASE_KEY}from'./config.js';
const authKey='riftbound_session';
export class Cloud{
 constructor(){this.session=JSON.parse(localStorage.getItem(authKey)||'null')}
 headers(auth=true){const h={'apikey':SUPABASE_KEY,'Content-Type':'application/json'};if(auth&&this.session?.access_token)h.Authorization=`Bearer ${this.session.access_token}`;return h}
 async request(path,{method='GET',body,auth=true,headers={}}={}){const r=await fetch(SUPABASE_URL+path,{method,headers:{...this.headers(auth),...headers},body:body?JSON.stringify(body):undefined});if(!r.ok){let e;try{e=await r.json()}catch{e={message:r.statusText}}throw Error(e.msg||e.message||e.error_description||'فشل الاتصال')}const text=await r.text();return text?JSON.parse(text):null}
 async signUp(email,password,name){return this.request('/auth/v1/signup',{method:'POST',auth:false,body:{email,password,data:{display_name:name}}})}
 async signIn(email,password){const data=await this.request('/auth/v1/token?grant_type=password',{method:'POST',auth:false,body:{email,password}});this.setSession(data);return data}
 async reset(email){return this.request('/auth/v1/recover',{method:'POST',auth:false,body:{email}})}
 setSession(s){this.session=s;localStorage.setItem(authKey,JSON.stringify(s))}
 signOut(){this.session=null;localStorage.removeItem(authKey)}
 async profile(){const id=this.session.user.id;const [p,g]=await Promise.all([this.request(`/rest/v1/profiles?id=eq.${id}&select=*`),this.request(`/rest/v1/player_progress?user_id=eq.${id}&select=*`)]);return{profile:p[0],progress:g[0]}}
 async saveProfile(data){const id=this.session.user.id;return this.request(`/rest/v1/profiles?id=eq.${id}`,{method:'PATCH',body:{...data,updated_at:new Date().toISOString()},headers:{Prefer:'return=minimal'}})}
 async saveProgress(data){const id=this.session.user.id;return this.request(`/rest/v1/player_progress?user_id=eq.${id}`,{method:'PATCH',body:{...data,updated_at:new Date().toISOString()},headers:{Prefer:'return=minimal'}})}
 async submitRun(run){return this.request('/rest/v1/runs',{method:'POST',body:{...run,user_id:this.session.user.id},headers:{Prefer:'return=minimal'}})}
 async leaderboard(field='wave'){return this.request(`/rest/v1/runs?select=wave,seconds,kills,level,total_damage,character_id,profiles(display_name)&order=${field}.desc&limit=50`)}
}
