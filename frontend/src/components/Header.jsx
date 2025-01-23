import { useNavigate } from 'react-router-dom';

const Header = ({ isLoggedIn, username, access, logout }) => {
  const nav = useNavigate();

  return (
    <>
      <header className="bg-black shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1
            onClick={() => nav('/')}
            className="text-3xl font-starwars text-yellow-400 cursor-pointer"
          >
            Code Arena
          </h1>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => nav(`/profile/${username}`)}
                  className="text-white underline hover:text-gray-300"
                >
                  {username}
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => nav('/login')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Enter
                </button>
                <button
                  onClick={() => nav('/register')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="bg-[#1B1F23] shadow-sm">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8 py-3">
            <li>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  nav('/');
                }}
                className="text-white font-semibold hover:text-gray-300"
              >
                HOME
              </a>
            </li>
            <li>
              <a
                href="/problemset"
                onClick={(e) => {
                  e.preventDefault();
                  nav('/problemset');
                }}
                className="text-white font-semibold hover:text-gray-300"
              >
                PROBLEMSET
              </a>
            </li>
            <li>
              <a
                href="/ide"
                onClick={(e) => {
                  e.preventDefault();
                  nav('/ide');
                }}
                className="text-white font-semibold hover:text-gray-300"
              >
                IDE
              </a>
            </li>
            <li>
              <a
                href="/createblog"
                onClick={(e) => {
                  e.preventDefault();
                  nav('/createblog');
                }}
                className="text-white font-semibold hover:text-gray-300"
              >
                CREATE BLOG
              </a>
            </li>
            {access === 'admin' && (
              <li>
                <a
                  href="/createproblem"
                  onClick={(e) => {
                    e.preventDefault();
                    nav('/createproblem');
                  }}
                  className="text-white font-semibold hover:text-gray-300"
                >
                  SET PROBLEM
                </a>
              </li>
            )}
            <li>
              <a
                href="/submissions"
                onClick={(e) => {
                  e.preventDefault();
                  nav('/submissions');
                }}
                className="text-white font-semibold hover:text-gray-300"
              >
                SUBMISSIONS
              </a>
            </li>
            {isLoggedIn && (
              <>
                <li>
                  <a
                    href="/notes"
                    onClick={(e) => {
                      e.preventDefault();
                      nav('/notes');
                    }}
                    className="text-white font-semibold hover:text-gray-300"
                  >
                    NOTES
                  </a>
                </li>
                <li>
                  <a
                    href="/manageblogs"
                    onClick={(e) => {
                      e.preventDefault();
                      nav('/manageblogs');
                    }}
                    className="text-white font-semibold hover:text-gray-300"
                  >
                    MANAGE BLOGS
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;

