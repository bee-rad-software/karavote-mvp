'use client';

import { useEffect, useState } from 'react';
import { supabase, EventRow, PerformanceRow } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Image from 'next/image';

function getDeviceId() {
  if (typeof window === 'undefined') return '';

  let id = window.localStorage.getItem('karavote_device_id');

  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem('karavote_device_id', id);
  }

  return id;
}

export default function PeoplesChoicePage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [performers, setPerformers] = useState<string[]>([]);
  const [selectedSinger, setSelectedSinger] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, [eventId]);

  async function load() {
    const { data: ev } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    setEvent(ev);

    const { data: performances } = await supabase
      .from('performances')
      .select('*')
      .eq('event_id', eventId);

    const uniqueSingers = Array.from(
      new Set(
        (performances || [])
          .map((p: PerformanceRow) => p.singer_name?.trim())
          .filter(Boolean)
      )
    ).sort();

    setPerformers(uniqueSingers);
  }

  async function submitVote() {
    setMessage('');

    if (!selectedSinger) {
      setMessage('Please choose a singer.');
      return;
    }

    const deviceId = getDeviceId();
    const { data: checkin } = await supabase
  .from('event_checkins')
  .select('id')
  .eq('event_id', eventId)
  .eq('device_id', deviceId)
  .maybeSingle();

if (!checkin) {
  setMessage('Please check in at the event before voting.');
  return;
}

    const { data: existingVote } = await supabase
      .from('peoples_choice_votes')
      .select('id')
      .eq('event_id', eventId)
      .eq('device_id', deviceId)
      .maybeSingle();

    if (existingVote) {
      setMessage('You already voted for People’s Choice.');
      return;
    }

    const { error } = await supabase
      .from('peoples_choice_votes')
      .insert({
        event_id: eventId,
        singer_name: selectedSinger,
        device_id: deviceId
      });

    if (error) {
      if (error.message.includes('duplicate')) {
        setMessage('You already voted for People’s Choice.');
      } else {
        setMessage(error.message);
      }
      return;
    }

    setMessage(`Thanks! Your People’s Choice vote for ${selectedSinger} was counted.`);
  }

  return (
    <main className="container">
     <div style={{ textAlign: 'center', marginBottom: 20 }}>
  <Image
    src="/stagevotes-logo.png"
    alt="StageVotes"
    width={250}
    height={125}
  />
  <h1>StageVotes</h1>
</div>
      <p className="small">{event?.name}</p>

      <div className="card">
        <h2>Vote for your favorite performer</h2>

        {performers.length === 0 ? (
          <p>No performers are available yet.</p>
        ) : (
          <>
            {performers.map((singer) => (
              <button
                key={singer}
                className={selectedSinger === singer ? 'vote-button' : 'secondary'}
                onClick={() => setSelectedSinger(singer)}
                style={{ margin: 6 }}
              >
                {singer}
              </button>
            ))}

            <div style={{ marginTop: 20 }}>
              <button onClick={submitVote}>Submit People’s Choice Vote</button>
            </div>
          </>
        )}

        {message && <p>{message}</p>}
      </div>
    </main>
  );
}
