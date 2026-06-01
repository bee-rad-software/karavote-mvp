'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase, PerformanceRow, VoteRow } from '@/lib/supabase';

export default function LeaderboardPage({ params }: { params: { eventId: string } }) {
  const eventId = params.eventId;
  const [performances, setPerformances] = useState<PerformanceRow[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);

  useEffect(() => {
    load();

    const channel = supabase.channel(`leaderboard-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `event_id=eq.${eventId}` }, loadVotes)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'performances', filter: `event_id=eq.${eventId}` }, loadPerformances)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  async function load() {
    await Promise.all([loadPerformances(), loadVotes()]);
  }

  async function loadPerformances() {
    const { data } = await supabase.from('performances').select('*').eq('event_id', eventId);
    setPerformances(data || []);
  }

  async function loadVotes() {
    const { data } = await supabase.from('votes').select('*').eq('event_id', eventId);
    setVotes(data || []);
  }

  const leaderboard = useMemo(() => {
    return performances.map(p => {
      const pv = votes.filter(v => v.performance_id === p.id);
      const avg = pv.length ? pv.reduce((sum, v) => sum + v.score, 0) / pv.length : 0;
      return { ...p, avg, voteCount: pv.length };
    }).sort((a, b) => b.avg - a.avg || b.voteCount - a.voteCount);
  }, [performances, votes]);

  return (
    <main className="container">
      <h1>Leaderboard</h1>
      <div className="card">
        {leaderboard.map((p, index) => (
          <div className="leaderboard-row" key={p.id}>
            <div>
              <strong>#{index + 1} {p.singer_name}</strong>
              <div className="small">{p.song_title}{p.artist ? ` by ${p.artist}` : ''}</div>
            </div>
            <div>{p.avg.toFixed(2)} / 5 · {p.voteCount} votes</div>
          </div>
        ))}
      </div>
    </main>
  );
}
