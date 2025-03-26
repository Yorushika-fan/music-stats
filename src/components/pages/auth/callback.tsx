import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyService } from '../../../api';

function Callback() {
  const navigate = useNavigate();
  console.log("callback")

  useEffect(() => {
    const handleCallback = async () => {
      const result = await spotifyService.handleCallback();
      if (result.success) {
        navigate('/stats');
      } else {
        navigate('/auth/login');
      }
    };
    handleCallback();
  }, [navigate]);

  return <div>Loading...</div>;
}

export default Callback; 