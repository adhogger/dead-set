// Cloudflare Worker + Durable Object version of the relay. Same protocol as
// relay.js, tested there; this file is the deploy target (wrangler deploy).
// One Durable Object per room code; WebSocket hibernation keeps idle rooms free.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code4 = () => Array.from({ length: 4 },
  () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/lb') {                 // global daily leaderboard
      if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
      const seed = (url.searchParams.get('seed') || '').slice(0, 32);
      if (!/^[A-Za-z0-9_-]{1,32}$/.test(seed)) {
        return new Response('bad seed', { status: 400, headers: CORS });
      }
      const board = env.LEADERBOARD.get(env.LEADERBOARD.idFromName('lb:' + seed));
      return board.fetch(req);
    }
    if (req.headers.get('Upgrade') !== 'websocket') {
      return new Response('SLASH TV relay (Durable Objects)', { status: 200 });
    }
    let code = url.searchParams.get('join');
    const hosting = url.searchParams.get('host');
    if (hosting) code = code4();
    if (!code) return new Response('host=1 or join=CODE required', { status: 400 });
    code = code.toUpperCase();
    const room = env.RELAY_ROOM.get(env.RELAY_ROOM.idFromName(code));
    url.searchParams.set('code', code);
    return room.fetch(new Request(url, req));
  }
};

export class RelayRoom {
  constructor(state) { this.state = state; }
  async fetch(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const role = url.searchParams.get('host') ? 'host' : 'guest';
    const sockets = this.state.getWebSockets();
    const hasHost = sockets.some(s => s.deserializeAttachment()?.role === 'host');
    if (role === 'host' && hasHost) return new Response('room taken', { status: 409 });
    if (role === 'guest' && (!hasHost || sockets.length >= 2)) {
      return new Response('no such room', { status: 404 });
    }
    const pair = new WebSocketPair();
    this.state.acceptWebSocket(pair[1]);
    pair[1].serializeAttachment({ role, code });
    if (role === 'host') pair[1].send(JSON.stringify({ t: 'room', code }));
    else {
      for (const s of this.state.getWebSockets()) s.send(JSON.stringify({ t: 'joined' }));
    }
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  webSocketMessage(ws, msg) {
    const me = ws.deserializeAttachment()?.role;
    for (const s of this.state.getWebSockets()) {
      if (s !== ws && s.deserializeAttachment()?.role !== me) s.send(msg);
    }
  }
  webSocketClose(ws) {
    const me = ws.deserializeAttachment()?.role;
    for (const s of this.state.getWebSockets()) {
      if (s !== ws) s.send(JSON.stringify({ t: 'peer_left' }));
    }
    if (me === 'host') for (const s of this.state.getWebSockets()) s.close();
  }
}

// One board per seed — daily seeds make a worldwide daily competition.
// Client scores are self-reported: this is a game-show scoreboard, not a bank.
export class Leaderboard {
  constructor(state) { this.state = state; }
  async fetch(req) {
    const scores = (await this.state.storage.get('scores')) || [];
    if (req.method === 'GET') {
      return Response.json({ top: scores.slice(0, 20) }, { headers: CORS });
    }
    if (req.method !== 'POST') return new Response('nope', { status: 405, headers: CORS });
    let body;
    try { body = await req.json(); } catch (e) {
      return new Response('bad json', { status: 400, headers: CORS });
    }
    const name = String(body.name || 'ANON').toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '').slice(0, 8).trim() || 'ANON';
    const score = Math.max(0, Math.min(99999999, Math.floor(+body.score || 0)));
    const won = body.won ? 1 : 0;
    const rooms = Math.max(0, Math.min(99, Math.floor(+body.rooms || 0)));
    const prior = scores.findIndex(s => s.name === name);
    if (prior >= 0) {
      if (scores[prior].score >= score) {          // each name keeps its best
        return Response.json({ rank: prior + 1, top: scores.slice(0, 20), kept: true },
                             { headers: CORS });
      }
      scores.splice(prior, 1);
    }
    scores.push({ name, score, won, rooms, at: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 100) scores.length = 100;
    await this.state.storage.put('scores', scores);
    const rank = scores.findIndex(s => s.name === name && s.score === score) + 1;
    return Response.json({ rank, top: scores.slice(0, 20) }, { headers: CORS });
  }
}
