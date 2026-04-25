/* BBbandits.nl – shared data layer (localStorage) */
const BBData = (() => {
  const K = { V: 'bbb_videos', T: 'bbb_team', S: 'bbb_settings' };

  const DV = [
    { id:'v1', title:'Seizoen 2024 – Best Moments', desc:'De beste kills, flanks en teamwork uit seizoen 2024.', category:'highlight', youtube:'', duration:'12:34', year:'2024' },
    { id:'v2', title:'CQB Battle – Warehouse', desc:'Intense close-quarters gevechten in een industrieel pand.', category:'game', youtube:'', duration:'45:10', year:'2024' },
    { id:'v3', title:'Loadout & Gear Review 2024', desc:'Een kijkje in onze gear en hoe we ons voorbereiden.', category:'bts', youtube:'', duration:'08:22', year:'2024' },
    { id:'v4', title:'Epic Flank – Forest Op', desc:'Een perfecte flank manoeuvre diep in het bos.', category:'highlight', youtube:'', duration:'04:58', year:'2023' },
    { id:'v5', title:'Milsim Weekend – D-Day Scenario', desc:'Twee dagen hardcore milsim met meer dan 200 deelnemers.', category:'game', youtube:'', duration:'1:12:40', year:'2023' },
    { id:'v6', title:'Teambuilding & Training', desc:'Hoe wij als team trainen en communicatie verbeteren.', category:'bts', youtube:'', duration:'15:05', year:'2023' },
  ];

  const DT = [
    { id:'t1', name:'Ghost', role:'Team Captain · Sniper', bio:'Stille doder op lange afstand. Coördineert het team met ijzeren discipline.', avatar:'' },
    { id:'t2', name:'Bandit', role:'Co-Captain · CQB Specialist', bio:'Eerste door de deur. Niets is te close-quarters voor deze enfant terrible.', avatar:'' },
    { id:'t3', name:'Reaper', role:'Support · HMG', bio:'Legt vijandige linies neer met onderdrukkingsvuur zodat het team kan bewegen.', avatar:'' },
    { id:'t4', name:'Viper', role:'Scout · Flanker', bio:'Snelste speler van het team. Vindt altijd de zwakke plek in de vijandelijke verdediging.', avatar:'' },
  ];

  const DS = {
    youtube:'https://www.youtube.com/@BBbandits',
    instagram:'https://www.instagram.com/bbbandits',
    email:'Informatie@bbbandits.nl',
    password:'bbbandits',
    estYear:'2019',
    tagline:'Tactical. United. Undefeated.'
  };

  const rd = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  return {
    getVideos()        { return rd(K.V, DV); },
    saveVideos(v)      { wr(K.V, v); },
    addVideo(v)        { const a = this.getVideos(); v.id = uid(); a.unshift(v); this.saveVideos(a); return v; },
    updateVideo(id, d) { this.saveVideos(this.getVideos().map(v => v.id === id ? { ...v, ...d } : v)); },
    deleteVideo(id)    { this.saveVideos(this.getVideos().filter(v => v.id !== id)); },

    getTeam()          { return rd(K.T, DT); },
    saveTeam(t)        { wr(K.T, t); },
    addMember(m)       { const a = this.getTeam(); m.id = uid(); a.push(m); this.saveTeam(a); return m; },
    updateMember(id,d) { this.saveTeam(this.getTeam().map(m => m.id === id ? { ...m, ...d } : m)); },
    deleteMember(id)   { this.saveTeam(this.getTeam().filter(m => m.id !== id)); },

    getSettings()      { return rd(K.S, DS); },
    saveSettings(s)    { wr(K.S, { ...this.getSettings(), ...s }); },
    checkPassword(p)   { return p === this.getSettings().password; },

    parseYTId(url) {
      if (!url) return '';
      const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
      return m ? m[1] : url.replace(/\s/g, '').slice(0, 11);
    }
  };
})();
