import React, { useEffect, useState } from 'react';
import { fetchSongs } from '../api/fetchSongs';

const SongList = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const getSongs = async () => {
      try {
        const data = await fetchSongs();
        setSongs(data);
      } catch (error) {
        console.error('Failed to fetch songs:', error);
      }
    };

    getSongs();
  }, []);

  return (
    <div>
      <h1>Song List</h1>
      <ul>
        {songs.map((song) => (
          <li key={song.id}>{song.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default SongList;