const API_URL = 'https://your-api-endpoint.com/songs';

export const fetchSongs = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    throw error;
  }
};