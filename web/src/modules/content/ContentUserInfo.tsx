import React from "react";

export default function ProfileUserInfo() {
  return (
    <>
      <p className="font-bold uppercase text-primary">User Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">User Picture</p>
          <div className="h-20 w-20 bg-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Full Name</p>
          <p>Jose Marie</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Email Address</p>
          <p>emailnijose@email.com</p>
        </div>
      </div>
    </>
  );
}
