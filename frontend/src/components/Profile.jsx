import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import HeatMap from './heatmap';
import defaultImage from '../assets/default.jpg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getCurrentStreak = (dates) => {
  if (!dates.length) return 0;
  
  const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(sortedDates[0]);
  currentDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    current.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak + 1;
};

const getLongestStreak = (dates) => {
  if (!dates.length) return 0;
  
  const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b));
  let currentStreak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const prev = new Date(sortedDates[i - 1]);
    current.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

const ProfilePage = () => {
 const { username } = useParams();
 const [profileData, setProfileData] = useState(null);
 const [imageUrl, setImageUrl] = useState(defaultImage);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [access, setAccess] = useState('');
 const [accuracy, setAccuracy] = useState('0%');
 const [totalSolved, setTotalSolved] = useState(0);
 const loggedInUsername = localStorage.getItem('username');
 const [submissionDates, setSubmissionDates] = useState([]);

 const logout = () => {
   const newLoginState = !isLoggedIn;
   localStorage.removeItem('username');
   localStorage.removeItem('token');
   setIsLoggedIn(false);
   setAccess("user");
   localStorage.setItem('isLoggedIn', newLoginState);
 };

 useEffect(() => {
   const fetchProfile = async () => {
     try {
       const response = await axios.get(`${API_BASE_URL}/getprofile/${username}`);
       setProfileData(response.data);
       setLoading(false);
     } catch (err) {
       setError('Failed to fetch profile data.');
       setLoading(false);
     }
   };

   const fetchImageUrl = async () => {
     try {
       const response = await axios.get(`${API_BASE_URL}/getimage/${username}`);
       if (response.data.imageUrl) {
         setImageUrl(response.data.imageUrl);
       }
     } catch (error) {
       console.error('Error fetching image URL:', error);
     }
   };

   const fetchSubmissions = async () => {
     try {
       const response = await axios.get(`${API_BASE_URL}/submissions`);
       const userSubmissions = response.data.filter(sub => sub.username === username);
       const acceptedSubmissions = userSubmissions.filter(sub => sub.status === 'ACCEPTED').length;
       const totalSubmissions = userSubmissions.length;
       const calculatedAccuracy = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : '0';
       setAccuracy(`${calculatedAccuracy}%`);
       setTotalSolved(acceptedSubmissions);
     } catch (error) {
       console.error('Error fetching submissions:', error);
     }

     const fetchSubmissionDates = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/getdates/${username}`);
        setSubmissionDates(response.data.submissionDates);
      } catch (error) {
        console.error('Error fetching submission dates:', error);
      }
    };
    await fetchSubmissionDates();
   };

   const loginState = localStorage.getItem('isLoggedIn') === 'true';
   const storedAccess = localStorage.getItem('access');
   setIsLoggedIn(loginState);
   setAccess(storedAccess || '');

   fetchProfile();
   fetchImageUrl();
   fetchSubmissions();
 }, [username]);

 if (loading) return <div>Loading...</div>;
 if (error) return <div>{error}</div>;

 const {
   _id = 'Unknown',
 } = profileData || {};

 const handleImageUpload = async (e) => {
   const file = e.target.files[0];
   if (!file) return;
   
   try {
      const token = localStorage.getItem('token');
      const fileName = `${Date.now()}_${file.name.split('.').slice(0, -1).join('.')}`;
      const fileType = file.type;

      const { data: uploadData } = await axios.post(`${API_BASE_URL}/uploadurl`, {
        fileName,
        fileType,
      });

      await axios.put(uploadData.uploadURL, file, {
        headers: {
          'Content-Type': fileType,
        },
      });

      await axios.post(`${API_BASE_URL}/saveimage`, {
        userId: _id,
        imageName: fileName,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Image uploaded successfully!');
      setImageUrl(fileName);
   } catch (error) {
     console.error('Error uploading image:', error);
     alert('Failed to upload image. Please try again.');
   }
 };

 const handleImageRemove = async () => {
   try {
     const token = localStorage.getItem('token');
     await axios.post(`${API_BASE_URL}/saveimage`, {
      userId: _id,
      imageName: "a",
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

     alert('Image removed successfully!');
     setImageUrl(defaultImage);
   } catch (error) {
     console.error('Error removing image:', error);
     alert('Failed to remove image. Please try again.');
   }
 };

 return (
   <div className="min-h-screen bg-gray-900 text-gray-200">
     <Header 
       isLoggedIn={isLoggedIn} 
       username={loggedInUsername} 
       logout={logout} 
       access={access} 
     />

     <main className="container mx-auto px-4 py-8">
       <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden p-6">
         <div className="flex flex-col md:flex-row items-center">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <img
                  src={imageUrl || defaultImage}
                  alt="Profile"
                  className="w-40 h-40 ml-7 rounded-full object-cover border-1 border-gray-300"
                />

                {loggedInUsername === username && (
                  <div className="mt-4 flex items-center space-x-4">
                    <label className="text-sm text-blue-600 hover:underline cursor-pointer">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <span className="text-gray-300">|</span>
                    <button
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                      onClick={handleImageRemove}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>


           <div className="flex-1">
             <h1 className="text-2xl font-bold text-white-800 mb-2">{username}</h1>

             <div className="bg-gray-700 shadow p-4 rounded-lg">
              <h2 className="text-xl font-bold font-starwars text-gray-300 mb-3">Stats</h2>
              <ul className="space-y-2">
                <li className="font-bold flex justify-between">
                  <span>Problems Solved:</span>
                  <span>{totalSolved}</span>
                </li>
                <li className="font-bold flex justify-between">
                  <span>Accuracy:</span>
                  <span>{accuracy}</span>
                </li>
                <li className="font-bold flex justify-between">
                  <span>Active Days:</span>
                  <span>{submissionDates.length}</span>
                </li>
                <li className="font-bold flex justify-between">
                  <span>Current Streak:</span>
                  <span>{getCurrentStreak(submissionDates)} days</span>
                </li>
                <li className="font-bold flex justify-between">
                  <span>Longest Streak:</span>
                  <span>{getLongestStreak(submissionDates)} days</span>
                </li>
              </ul>
            </div>
           </div>
         </div>
       </div>
       <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden p-6 mt-8 flex justify-center items-center">
        <div className="w-[1000 px]">
          <HeatMap submissionDates={submissionDates} />
        </div>
      </div>
     </main>
   </div>
 );
};

export default ProfilePage;