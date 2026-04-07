// import React from 'react';
// import Likes from "../Buttons/LikeButton"

// const Card = () => {
//   return (
//     <div className="group relative w-96">
//       <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/10">
//         <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70" />
//         <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70" />
//         <div className="relative p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-sm transition-opacity duration-300 group-hover:opacity-40" />
//                 <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
//                   <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-white">System Update</h3>
//                 <p className="text-sm text-slate-400">Version 2.4.0 is now live</p>
//               </div>
//             </div>
//             <div className="flex flex-col items-end gap-1">
//               <span className="text-xs text-slate-400">2 min ago</span>
//               <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
//                 <span className="h-1 w-1 rounded-full bg-emerald-500" />
//                 New
//               </span>
//             </div>
//           </div>
//           <div className="mt-6 space-y-4">
//             <div className="rounded-xl bg-slate-900/50 p-4">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
//                   <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 </div>
//                 <p className="text-sm text-slate-400">
//                   Performance improvements and bug fixes
//                 </p>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-xs">
//                 <span className="font-medium text-white">Download Progress</span>
//                 <span className="text-slate-400">89%</span>
//               </div>
//               <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">
//                 <div className="h-full w-[89%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
//                   <div className="h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
//                 </div>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               <button className="group/btn relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px font-medium text-white shadow-[0_1000px_0_0_hsl(0_0%_100%_/_0%)_inset] transition-colors hover:shadow-[0_1000px_0_0_hsl(0_0%_100%_/_2%)_inset]">
//                 <div className="relative rounded-xl bg-slate-950/50 px-4 py-3 transition-colors group-hover/btn:bg-transparent">
//                   <span className="relative flex items-center justify-center gap-2">
//                     Update Now
//                     <svg className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                     </svg>
//                   </span>
//                 </div>
//               </button>
//               <button className="flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-800">
//                 Later
//               </button>
//             </div>
//           </div>
//           <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-900/50 p-4">
//             <div className="flex items-center gap-1">
//               <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <div>
//                 <p className="text-sm font-medium text-white">Auto-update is enabled</p>
//                 <p className="text-xs text-slate-400">
//                   Future updates will be installed automatically
//                 </p>
//               </div>
//               <label className="relative inline-flex items-center cursor-pointer" htmlFor="toggle">
//                 <input className="sr-only peer" id="toggle" type="checkbox" />
//                 <div className="w-11 h-6 bg-slate-800 rounded-full peer-checked:bg-emerald-500" />
//                 <div className="w-4 h-4 -ml-10 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5 peer-checked:left-1" />
//               </label>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Card;
