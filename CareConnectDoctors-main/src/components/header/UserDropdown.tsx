import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, useNavigate } from "react-router";
import { API_BASE } from "../../constants/api";
import { resolveMediaUrl, doctorAvatarUrl } from "../../utils/mediaUrl";

export default function UserDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{
    fullname: string;
    email: string;
    profileImage?: string;
  }>({
    fullname: "",
    email: "",
    profileImage: "",
  });

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = () => {
    // Clear all auth data from localStorage and sessionStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorId");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("doctorToken");

    closeDropdown();
    navigate("/");
  };

  const loadFromStorage = () => {
    const rawUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setUser((prev) => ({
          ...prev,
          fullname: parsed.fullname || parsed.name || prev.fullname || "Doctor",
          email: parsed.email || prev.email || "",
          profileImage:
            parsed.profileImage !== undefined
              ? parsed.profileImage
              : prev.profileImage,
        }));
      } catch (e) {
        console.error("Failed to parse user storage in UserDropdown", e);
      }
    }
  };

  useEffect(() => {
    loadFromStorage();

    const handleProfileUpdated = (event?: any) => {
      loadFromStorage();
      if (event?.detail?.profileImage) {
        setUser((prev) => ({ ...prev, profileImage: event.detail.profileImage }));
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdated);
    window.addEventListener("storage", handleProfileUpdated);

    // Fetch latest profile from backend to ensure we have the uploaded image
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("doctorToken") ||
      sessionStorage.getItem("token");

    if (token) {
      fetch(`${API_BASE}/doctors/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) {
            const doc = json.data;
            setUser({
              fullname: doc.fullname || doc.name || "Doctor",
              email: doc.email || "",
              profileImage: doc.profileImage || "",
            });

            // Keep localStorage updated
            const rawUser = localStorage.getItem("user");
            const existing = rawUser ? JSON.parse(rawUser) : {};
            localStorage.setItem(
              "user",
              JSON.stringify({ ...existing, ...doc }),
            );
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdated);
      window.removeEventListener("storage", handleProfileUpdated);
    };
  }, []);

  const avatarSrc = user.profileImage
    ? resolveMediaUrl(user.profileImage)
    : doctorAvatarUrl({ fullname: user.fullname });

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400 group"
        aria-label="User menu"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 border-2 border-teal-500/30 bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
          <img
            className="w-full h-full object-cover"
            src={avatarSrc}
            alt={user.fullname || "Doctor Avatar"}
            onError={(e) => {
              (e.target as HTMLImageElement).src = doctorAvatarUrl({
                fullname: user.fullname,
              });
            }}
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm text-gray-800 dark:text-white max-w-[140px] truncate">
          {user.fullname || "Doctor"}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark z-50"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <span className="overflow-hidden rounded-full h-12 w-12 border-2 border-teal-500/30 bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center shrink-0">
            <img
              className="w-full h-full object-cover"
              src={avatarSrc}
              alt={user.fullname || "Doctor Avatar"}
              onError={(e) => {
                (e.target as HTMLImageElement).src = doctorAvatarUrl({
                  fullname: user.fullname,
                });
              }}
            />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white truncate">
              {user.fullname || "Doctor"}
            </span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email || "doctor@careconnect.com"}
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-1 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
                />
              </svg>
              My Profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.4858 3.5L13.5182 3.5C13.9233 3.5 14.2518 3.82851 14.2518 4.23377C14.2518 5.9529 16.1129 7.02795 17.602 6.1682C17.9528 5.96567 18.4014 6.08586 18.6039 6.43667L20.1203 9.0631C20.3229 9.41407 20.2027 9.86286 19.8517 10.0655C18.3625 10.9253 18.3625 13.0747 19.8517 13.9345C20.2026 14.1372 20.3229 14.5859 20.1203 14.9369L18.6039 17.5634C18.4013 17.9142 17.9528 18.0344 17.602 17.8318C16.1129 16.9721 14.2518 18.0471 14.2518 19.7663C14.2518 20.1715 13.9233 20.5 13.5182 20.5H10.4858C10.0804 20.5 9.75182 20.1714 9.75182 19.766C9.75182 18.0461 7.88983 16.9717 6.40067 17.8314C6.04945 18.0342 5.60037 17.9139 5.39767 17.5628L3.88167 14.937C3.67903 14.586 3.79928 14.1372 4.15026 13.9346C5.63949 13.0748 5.63946 10.9253 4.15025 10.0655C3.79926 9.86282 3.67901 9.41401 3.88165 9.06303L5.39764 6.43725C5.60034 6.08617 6.04943 5.96581 6.40065 6.16858C7.88982 7.02836 9.75182 5.9539 9.75182 4.23399C9.75182 3.82862 10.0804 3.5 10.4858 3.5Z"
                />
              </svg>
              Account Settings
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-2 font-medium text-red-600 rounded-lg group w-full text-theme-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors"
        >
          <svg
            className="fill-red-500 group-hover:fill-red-600"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007Z"
            />
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
