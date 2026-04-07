import React, { useState, useEffect } from "react";

const states = [
  { code: "IN", name: "India" },
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JH", name: "Jharkhand" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "PY", name: "Puducherry" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" }
];

const StateSelector = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userStateKey = user ? `selectedState_${user.id}` : "selectedState";
  const storedState = localStorage.getItem(userStateKey);
  const [selectedState, setSelectedState] = useState(storedState || "India");

  useEffect(() => {
    localStorage.setItem(userStateKey, selectedState);
    console.log("Selected State:", selectedState);
  }, [selectedState, userStateKey]);

  return (
    <div className="relative flex items-center max-w-xs text-gray-500">
      <select
        className="text-sm outline-none rounded-xl  h-[43px] px-5 border border-gray-300 bg-white focus:border-gray-400 shadow-lg w-[120px] overflow-hidden text-ellipsis z-10"
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
      >
        {states.map((state) => (
          <option key={state.code} value={state.name} title={state.code}>
            {state.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StateSelector;