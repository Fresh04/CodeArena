import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProfilePage = () => {
 const { username } = useParams();
 const [profileData, setProfileData] = useState(null);
 const [imageUrl, setImageUrl] = useState('/default-profile.png');
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [access, setAccess] = useState('');
 const [accuracy, setAccuracy] = useState('0%');
 const [totalSolved, setTotalSolved] = useState(0);
 const loggedInUsername = localStorage.getItem('username');

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
     setImageUrl('/default-profile.png');
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
               src={imageUrl}
               alt="Profile"
               className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
             />
             {loggedInUsername === username && (
               <div className="mt-4 flex space-x-2">
                 <label className="text-blue-400 hover:underline cursor-pointer">
                   Upload Image
                   <input
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={handleImageUpload}
                   />
                 </label>
                 <button
                   className="text-red-400 hover:underline"
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
               </ul>
             </div>
           </div>
         </div>
       </div>
     </main>
   </div>
 );
};

export default ProfilePage;